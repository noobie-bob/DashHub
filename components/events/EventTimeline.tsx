"use client";

import { ArrowDownLeft, ArrowUpRight, Box, ChevronRight, Clock, MessageSquare } from "lucide-react";
import { useMemo, useState } from "react";
import type { EventRecord } from "../../lib/events";
import { useStore } from "../../lib/store";

function EventIcon({ kind }: { kind: EventRecord["kind"] }) {
  switch (kind) {
    case "message.sent":
      return <ArrowUpRight className="h-3.5 w-3.5 text-blue-500" />;
    case "message.received":
      return <ArrowDownLeft className="h-3.5 w-3.5 text-green-500" />;
    case "artifact.created":
      return <Box className="h-3.5 w-3.5 text-orange-500" />;
    default:
      return <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function formatTime(ts: number): string {
  return timeFormatter.format(new Date(ts));
}

const fullDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  fractionalSecondDigits: 3,
});

function formatFullDate(ts: number): string {
  return fullDateFormatter.format(new Date(ts));
}

const DOM_ID_HASH_LENGTH = 12;

// Lightweight, non-cryptographic hash used only for DOM IDs.
function hashStringForDomId(value: string): string {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    // hash * 33 ^ char
    hash = ((hash << 5) + hash) ^ value.charCodeAt(i);
  }

  return (hash >>> 0).toString(36).slice(0, DOM_ID_HASH_LENGTH);
}

// Internal DOM id helper for `aria-controls` / details panel wiring.
// Format: `event-details-<normalized-slug>-<hash-of-original-id>`.
// Not intended as a stable external contract; do not persist or deep-link.
function getEventDetailsId(eventId: string): string {
  const normalized = eventId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const safe = normalized.length <= 64 ? normalized : normalized.slice(-64);

  return `event-details-${safe || "unknown"}-${hashStringForDomId(eventId)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

const DETAILS_COLLECTION_LIMIT = 200;

function safeStringify(value: unknown, { indent = 0 }: { indent?: number } = {}): string {
  if (value === undefined) return "undefined";
  if (typeof value === "bigint") return `${value.toString()}n`;
  if (typeof value === "symbol") return value.toString();
  if (typeof value === "function") return value.name ? `[Function: ${value.name}]` : "[Function]";

  if (value instanceof Date) return value.toISOString();
  if (value instanceof RegExp) return value.toString();

  if (typeof value !== "object" || value === null) return String(value);

  try {
    const seen = new WeakSet<object>();

    // Note: we treat any repeated reference as "[Circular]". This includes both real
    // cycles and shared references elsewhere in the graph.
    const serialized = JSON.stringify(
      value,
      (_key, v) => {
        if (typeof v === "bigint") return `${v.toString()}n`;
        if (v instanceof Error) return { name: v.name, message: v.message };
        if (v instanceof Map) {
          if (seen.has(v)) return "[Circular]";
          seen.add(v);

          const entries: [unknown, unknown][] = [];
          let truncated = false;
          let index = 0;

          for (const entry of v.entries()) {
            if (index >= DETAILS_COLLECTION_LIMIT) {
              truncated = true;
              break;
            }
            entries.push(entry);
            index += 1;
          }

          return {
            "[Map]": entries,
            "[Map.size]": v.size,
            ...(truncated ? { "[Map.truncated]": true } : {}),
          };
        }
        if (v instanceof Set) {
          if (seen.has(v)) return "[Circular]";
          seen.add(v);

          const values: unknown[] = [];
          let truncated = false;
          let index = 0;

          for (const item of v.values()) {
            if (index >= DETAILS_COLLECTION_LIMIT) {
              truncated = true;
              break;
            }
            values.push(item);
            index += 1;
          }

          return {
            "[Set]": values,
            "[Set.size]": v.size,
            ...(truncated ? { "[Set.truncated]": true } : {}),
          };
        }
        if (v instanceof Date) return v.toISOString();

        if (typeof v === "object" && v !== null) {
          if (seen.has(v)) return "[Circular]";
          seen.add(v);
        }

        return v;
      },
      indent
    );

    return serialized ?? "[unserializable]";
  } catch {
    return "[unserializable]";
  }
}

type SafePreviewOptions = {
  maxLength?: number;
  maxDepth?: number;
  maxKeys?: number;
  maxArrayLength?: number;
};

/**
* Safe preview formatter for user-facing timeline rows.
*
* `maxLength` is treated as a hard output budget for the whole preview string,
* so nested values will be summarized aggressively when the remaining budget is low.
*/
function safePreviewStringify(
  value: unknown,
  maxLengthOrOptions: number | SafePreviewOptions = 200,
): string {
  const options =
    typeof maxLengthOrOptions === "number" ? { maxLength: maxLengthOrOptions } : maxLengthOrOptions;

  const { maxLength = 200, maxDepth = 2, maxKeys = 12, maxArrayLength = 12 } = options;
  const seen = new WeakSet<object>();

  const formatKey = (key: string) => {
    if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) return key;
    return JSON.stringify(key);
  };

  const SEP = ", ";
  const MORE = ", …";
  const MAP_ARROW = " => ";
  const CLOSE_BRACE = " }";
  const CLOSE_BRACKET = "]";
  const KEY_VALUE_SEP = ": ";

  type PreviewResult = { text: string; hitBudget: boolean };

  const fit = (text: string, budget: number): PreviewResult => {
    if (budget <= 0) return { text: "", hitBudget: true };
    if (text.length <= budget) return { text, hitBudget: false };
    return { text: text.slice(0, budget), hitBudget: true };
  };

  const preview = (next: unknown, depth: number, budget: number): PreviewResult => {
    if (budget <= 0) return { text: "", hitBudget: true };
    if (next === null) return fit("null", budget);

    switch (typeof next) {
      case "string": {
        const truncated = next.length > maxLength ? `${next.slice(0, maxLength)}…` : next;
        const text = depth === 0 ? truncated : JSON.stringify(truncated);
        return fit(text, budget);
      }
      case "number":
      case "boolean":
      case "undefined":
        return fit(String(next), budget);
      case "bigint":
        return fit(`${next.toString()}n`, budget);
      case "symbol":
      case "function":
        return fit(String(next), budget);
      case "object": {
        if (next instanceof Error) {
          const text = next.message ? `${next.name}: ${next.message}` : next.name;
          return fit(text, budget);
        }

        if (next instanceof Date) {
          try {
            return fit(next.toISOString(), budget);
          } catch {
            return fit(`Date(${String(next)})`, budget);
          }
        }

        if (next instanceof Map) {
          if (seen.has(next)) return fit("[Circular]", budget);
          if (depth >= maxDepth) return fit(`Map(${next.size})`, budget);
          seen.add(next);
          try {
            let out = `Map(${next.size}) { `;
            let hitBudget = false;
            let count = 0;
            let hasMore = false;
            for (const [k, v] of next) {
              if (count >= maxKeys) {
                hasMore = true;
                break;
              }

              if (out.length >= budget) {
                hitBudget = true;
                break;
              }

              if (count > 0) {
                if (SEP.length > budget - out.length) {
                  hitBudget = true;
                  break;
                }
                out += SEP;
              }

              const keyPreview = preview(k, depth + 1, budget - out.length);
              out += keyPreview.text;
              if (keyPreview.hitBudget) {
                hitBudget = true;
                break;
              }

              if (MAP_ARROW.length > budget - out.length) {
                hitBudget = true;
                break;
              }
              out += MAP_ARROW;

              const valuePreview = preview(v, depth + 1, budget - out.length);
              out += valuePreview.text;
              if (valuePreview.hitBudget) {
                hitBudget = true;
                break;
              }

              count += 1;
            }

            if (hasMore) {
              if (MORE.length > budget - out.length) hitBudget = true;
              else out += MORE;
            }

            if (CLOSE_BRACE.length > budget - out.length) hitBudget = true;
            else out += CLOSE_BRACE;

            return { text: out, hitBudget };
          } finally {
            seen.delete(next);
          }
        }

        if (next instanceof Set) {
          if (seen.has(next)) return fit("[Circular]", budget);
          if (depth >= maxDepth) return fit(`Set(${next.size})`, budget);
          seen.add(next);
          try {
            let out = `Set(${next.size}) { `;
            let hitBudget = false;
            let count = 0;
            let hasMore = false;
            for (const v of next) {
              if (count >= maxArrayLength) {
                hasMore = true;
                break;
              }

              if (out.length >= budget) {
                hitBudget = true;
                break;
              }

              if (count > 0) {
                if (SEP.length > budget - out.length) {
                  hitBudget = true;
                  break;
                }
                out += SEP;
              }

              const valuePreview = preview(v, depth + 1, budget - out.length);
              out += valuePreview.text;
              if (valuePreview.hitBudget) {
                hitBudget = true;
                break;
              }

              count += 1;
            }

            if (hasMore) {
              if (MORE.length > budget - out.length) hitBudget = true;
              else out += MORE;
            }

            if (CLOSE_BRACE.length > budget - out.length) hitBudget = true;
            else out += CLOSE_BRACE;

            return { text: out, hitBudget };
          } finally {
            seen.delete(next);
          }
        }

        if (Array.isArray(next)) {
          if (seen.has(next)) return fit("[Circular]", budget);
          if (depth >= maxDepth) return fit(`Array(${next.length})`, budget);
          seen.add(next);
          try {
            let out = "[";
            let hitBudget = false;
            const limit = Math.min(next.length, maxArrayLength);
            for (let i = 0; i < limit; i += 1) {
              if (out.length >= budget) {
                hitBudget = true;
                break;
              }

              if (i > 0) {
                if (SEP.length > budget - out.length) {
                  hitBudget = true;
                  break;
                }
                out += SEP;
              }

              const itemPreview = preview(next[i], depth + 1, budget - out.length);
              out += itemPreview.text;
              if (itemPreview.hitBudget) {
                hitBudget = true;
                break;
              }
            }

            if (next.length > maxArrayLength) {
              if (MORE.length > budget - out.length) hitBudget = true;
              else out += MORE;
            }

            if (CLOSE_BRACKET.length > budget - out.length) hitBudget = true;
            else out += CLOSE_BRACKET;

            return { text: out, hitBudget };
          } finally {
            seen.delete(next);
          }
        }

        if (typeof next === "object" && next !== null) {
          if (seen.has(next)) return fit("[Circular]", budget);
          if (depth >= maxDepth) return fit("{…}", budget);
          seen.add(next);
          try {
            if (!isRecord(next)) {
              try {
                const asText = String(next);
                if (asText !== "[object Object]") return fit(asText, budget);
              } catch {
                // fall through
              }

              const name = next.constructor?.name;
              return fit(name ? `[${name}]` : "[Object]", budget);
            }

            let out = "{ ";
            let hitBudget = false;
            let count = 0;
            let hasMore = false;
            for (const key in next) {
              if (!Object.prototype.hasOwnProperty.call(next, key)) continue;
              if (count >= maxKeys) {
                hasMore = true;
                break;
              }

              if (out.length >= budget) {
                hitBudget = true;
                break;
              }

              if (count > 0) {
                if (SEP.length > budget - out.length) {
                  hitBudget = true;
                  break;
                }
                out += SEP;
              }

              const keyText = formatKey(key);
              if (keyText.length + KEY_VALUE_SEP.length > budget - out.length) {
                hitBudget = true;
                break;
              }

              out += `${keyText}${KEY_VALUE_SEP}`;

              let valueText = "[unavailable]";
              let valueHitBudget = false;
              try {
                const valuePreview = preview(next[key], depth + 1, budget - out.length);
                valueText = valuePreview.text;
                valueHitBudget = valuePreview.hitBudget;
              } catch {
                // keep default
              }

              out += valueText;
              if (valueHitBudget) {
                hitBudget = true;
                break;
              }

              count += 1;
            }

            if (hasMore) {
              if (MORE.length > budget - out.length) hitBudget = true;
              else out += MORE;
            }

            if (CLOSE_BRACE.length > budget - out.length) hitBudget = true;
            else out += CLOSE_BRACE;

            return { text: out, hitBudget };
          } finally {
            seen.delete(next);
          }
        }

        return fit("[unserializable]", budget);
      }
      default:
        return fit("[unserializable]", budget);
    }
  };

  const result = preview(value, 0, maxLength);
  if (!result.hitBudget) return result.text;
  if (result.text.endsWith("…")) return result.text;
  return `${result.text}…`;
}

function safePreview(value: unknown, options?: number | SafePreviewOptions): string {
  return safePreviewStringify(value, options ?? 200);
}

function getEventPreview(event: EventRecord): string {
  if (event.kind === "artifact.created" && isRecord(event.outputs)) {
    const title = event.outputs["title"];
    if (typeof title === "string" && title.trim()) return title;
    return "Artifact Created";
  }

  if (event.kind === "message.sent" && typeof event.inputs === "string") {
    return event.inputs;
  }
  if (event.kind === "message.sent" && event.inputs !== undefined && event.inputs !== null) {
    return safePreview(event.inputs);
  }
  if (event.kind === "message.received" && typeof event.outputs === "string") {
    return event.outputs;
  }
  if (event.kind === "message.received" && event.outputs !== undefined && event.outputs !== null) {
    return safePreview(event.outputs);
  }

  if (typeof event.inputs === "string") return event.inputs;
  if (typeof event.outputs === "string") return event.outputs;

  if (event.inputs !== undefined && event.inputs !== null) return safePreview(event.inputs);
  if (event.outputs !== undefined && event.outputs !== null) return safePreview(event.outputs);

  return "";
}

function EventItem({
  event,
  isSelected,
  onClick,
}: {
  event: EventRecord;
  isSelected: boolean;
  onClick: () => void;
}) {
  const preview = getEventPreview(event);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isSelected}
      aria-controls={getEventDetailsId(event.id)}
      className={`w-full flex items-start gap-3 px-3 py-2 text-left transition-colors hover:bg-muted/50 ${
        isSelected ? "bg-muted" : ""
      }`}
    >
      <div className="mt-0.5 shrink-0">
        <EventIcon kind={event.kind} />
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
           <p className="text-sm font-medium truncate">{event.kind}</p>
           <span className="text-[10px] text-muted-foreground shrink-0">{formatTime(event.ts)}</span>
        </div>
        {preview && (
          <p className="text-xs text-muted-foreground truncate mt-0.5 opacity-90">
            {preview}
          </p>
        )}
      </div>
      <div className="mt-0.5 shrink-0 text-muted-foreground">
        <ChevronRight
          className={`h-4 w-4 transition-transform ${isSelected ? "rotate-90" : ""}`}
          aria-hidden="true"
        />
      </div>
    </button>
  );
}

function EventDetails({ event }: { event: EventRecord }) {
  const detailsId = getEventDetailsId(event.id);

  return (
    <div
      id={detailsId}
      className="border-t border-border bg-muted/30 p-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200"
    >
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Event ID</p>
          <p className="text-xs font-mono text-foreground break-all">{event.id}</p>
        </div>
         <div>
          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Timestamp</p>
          <p className="text-xs font-mono text-foreground">{formatFullDate(event.ts)}</p>
        </div>
      </div>

      {event.inputs !== undefined && event.inputs !== null && (
        <div>
           <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Inputs</p>
          <pre className="text-xs font-mono text-foreground bg-background p-2 rounded border border-border overflow-auto max-h-40 whitespace-pre-wrap break-all">
            {typeof event.inputs === "string" ? event.inputs : safeStringify(event.inputs, { indent: 2 })}
          </pre>
        </div>
      )}
      {event.outputs !== undefined && event.outputs !== null && (
        <div>
           <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Outputs</p>
          <pre className="text-xs font-mono text-foreground bg-background p-2 rounded border border-border overflow-auto max-h-40 whitespace-pre-wrap break-all">
            {typeof event.outputs === "string" ? event.outputs : safeStringify(event.outputs, { indent: 2 })}
          </pre>
        </div>
      )}
      {event.refs && Object.keys(event.refs).length > 0 && (
        <div>
           <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">References</p>
          <pre className="text-xs font-mono text-foreground bg-background p-2 rounded border border-border overflow-auto max-h-20">
            {safeStringify(event.refs, { indent: 2 })}
          </pre>
        </div>
      )}
    </div>
  );
}

export function EventTimeline() {
  const { state } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const events = state.events;
  const reversedEvents = useMemo(() => [...events].reverse(), [events]); // Show newest first

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-10">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Event Ledger</span>
        <span className="ml-auto text-xs text-muted-foreground font-mono">{events.length}</span>
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-auto">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No events recorded yet. Send a message to start.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {reversedEvents.map((event) => (
              <div key={event.id} className="flex flex-col">
                <EventItem
                  event={event}
                  isSelected={selectedId === event.id}
                  onClick={() => setSelectedId(selectedId === event.id ? null : event.id)}
                />
                {selectedId === event.id && <EventDetails event={event} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
