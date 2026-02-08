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

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatFullDate(ts: number): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function toBoundedJsonValue(
  value: unknown,
  {
    maxDepth,
    maxKeys,
    maxArrayLength,
    maxNodes,
    maxStringLength,
  }: {
    maxDepth: number;
    maxKeys: number;
    maxArrayLength: number;
    maxNodes: number;
    maxStringLength: number;
  },
): unknown {
  const seen = new WeakSet<object>();
  let nodes = 0;

  const ELLIPSIS = "...";
  const TRUNCATED_MARKER = "[dashhub:truncated]";
  const UNSERIALIZABLE_MARKER = "[dashhub:unserializable]";
  const CIRCULAR_MARKER = "[dashhub:circular]";

  function consumeNodeBudget(): boolean {
    if (nodes >= maxNodes) return false;
    nodes += 1;
    return true;
  }

  function visit(v: unknown, depth: number): unknown {
    if (depth > maxDepth) return TRUNCATED_MARKER;

    if (v === null) return null;

    if (typeof v === "string") {
      return v.length > maxStringLength ? `${v.slice(0, maxStringLength)}${ELLIPSIS}` : v;
    }
    if (typeof v === "number" || typeof v === "boolean") return v;
    if (typeof v === "bigint") return v.toString();
    if (typeof v === "undefined" || typeof v === "function" || typeof v === "symbol") {
      return UNSERIALIZABLE_MARKER;
    }
    if (typeof v !== "object") return UNSERIALIZABLE_MARKER;

    if (v instanceof Date) {
      if (!consumeNodeBudget()) return TRUNCATED_MARKER;
      return v.toISOString();
    }
    if (v instanceof Error) {
      if (!consumeNodeBudget()) return TRUNCATED_MARKER;
      return {
        __type: "Error",
        name: v.name,
        message: v.message,
        stack: typeof v.stack === "string" ? visit(v.stack, depth + 1) : undefined,
      };
    }

    if (seen.has(v)) return CIRCULAR_MARKER;
    if (!consumeNodeBudget()) return TRUNCATED_MARKER;
    seen.add(v);

    if (Array.isArray(v)) {
      const out: unknown[] = [];
      const limit = Math.min(v.length, maxArrayLength);
      for (let i = 0; i < limit; i += 1) {
        out.push(visit(v[i], depth + 1));
      }

      if (v.length > maxArrayLength) {
        out.push(`[+${v.length - maxArrayLength} more]`);
      }

      return out;
    }

    if (v instanceof Map) {
      const entries: Array<[unknown, unknown]> = [];
      let i = 0;
      for (const [k, val] of v.entries()) {
        if (i >= maxArrayLength) break;
        entries.push([visit(k, depth + 1), visit(val, depth + 1)]);
        i += 1;
      }
      return {
        __type: "Map",
        entries,
        __truncated__: v.size > maxArrayLength ? TRUNCATED_MARKER : undefined,
      };
    }

    if (v instanceof Set) {
      const values: unknown[] = [];
      let i = 0;
      for (const val of v.values()) {
        if (i >= maxArrayLength) break;
        values.push(visit(val, depth + 1));
        i += 1;
      }
      return {
        __type: "Set",
        values,
        __truncated__: v.size > maxArrayLength ? TRUNCATED_MARKER : undefined,
      };
    }

    const obj = v as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    let count = 0;
    let hasMore = false;
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      if (count >= maxKeys) {
        hasMore = true;
        break;
      }
      out[key] = visit(obj[key], depth + 1);
      count += 1;
    }

    if (hasMore) out["__truncated__"] = TRUNCATED_MARKER;
    return out;
  }

  return visit(value, 0);
}

function safeBoundedStringify(
  value: unknown,
  {
    maxChars,
    indent,
    maxDepth,
    maxKeys,
    maxArrayLength,
    maxNodes,
    maxStringLength,
  }: {
    maxChars: number;
    indent: number;
    maxDepth: number;
    maxKeys: number;
    maxArrayLength: number;
    maxNodes: number;
    maxStringLength: number;
  },
): string {
  try {
    const bounded = toBoundedJsonValue(value, {
      maxDepth,
      maxKeys,
      maxArrayLength,
      maxNodes,
      maxStringLength,
    });

    const serialized = JSON.stringify(bounded, null, indent);
    if (serialized === undefined) return "[dashhub:unserializable]";
    if (serialized.length > maxChars) return `${serialized.slice(0, maxChars)}...`;
    return serialized;
  } catch {
    return "[dashhub:unserializable]";
  }
}

const EVENT_STRINGIFY_LIMITS = {
  preview: {
    maxChars: 200,
    indent: 0,
    maxDepth: 3,
    maxKeys: 30,
    maxArrayLength: 30,
    maxNodes: 300,
    maxStringLength: 200,
  },
  details: {
    maxChars: 10_000,
    indent: 2,
    maxDepth: 6,
    maxKeys: 100,
    maxArrayLength: 100,
    maxNodes: 1_500,
    maxStringLength: 1_000,
  },
} as const;

function stringifyEventPreview(value: unknown): string {
  return safeBoundedStringify(value, EVENT_STRINGIFY_LIMITS.preview);
}

function stringifyEventDetails(value: unknown): string {
  return safeBoundedStringify(value, EVENT_STRINGIFY_LIMITS.details);
}

function getEventPreview(event: EventRecord): string {
  if (event.kind === "message.sent" && typeof event.inputs === "string") {
    return event.inputs;
  }
  if (event.kind === "message.received" && typeof event.outputs === "string") {
    return event.outputs;
  }

  if (event.kind === "artifact.created" && isRecord(event.outputs)) {
    const title = event.outputs["title"];
    if (typeof title === "string" && title.trim()) return title;
    return "Artifact Created";
  }

  if (typeof event.inputs === "string") return event.inputs;
  if (typeof event.outputs === "string") return event.outputs;

  // Fallback for objects
  if (isRecord(event.inputs) || Array.isArray(event.inputs)) return stringifyEventPreview(event.inputs);
  if (isRecord(event.outputs) || Array.isArray(event.outputs)) return stringifyEventPreview(event.outputs);

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
      aria-controls={`event-details-${event.id}`}
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
  const detailsId = `event-details-${event.id}`;

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
            {typeof event.inputs === "string" ? event.inputs : stringifyEventDetails(event.inputs)}
          </pre>
        </div>
      )}
      {event.outputs !== undefined && event.outputs !== null && (
        <div>
           <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Outputs</p>
          <pre className="text-xs font-mono text-foreground bg-background p-2 rounded border border-border overflow-auto max-h-40 whitespace-pre-wrap break-all">
            {typeof event.outputs === "string" ? event.outputs : stringifyEventDetails(event.outputs)}
          </pre>
        </div>
      )}
      {event.refs && Object.keys(event.refs).length > 0 && (
        <div>
           <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">References</p>
          <pre className="text-xs font-mono text-foreground bg-background p-2 rounded border border-border overflow-auto max-h-20">
            {stringifyEventDetails(event.refs)}
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
