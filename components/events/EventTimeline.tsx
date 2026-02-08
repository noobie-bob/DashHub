"use client";

import { ArrowDownLeft, ArrowUpRight, Clock, MessageSquare, Box } from "lucide-react";
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
  return typeof value === "object" && value !== null;
}

function safePreviewStringify(value: unknown, maxLength = 200): string {
  try {
    const serialized = JSON.stringify(value);
    if (!serialized) return "";

    if (serialized.length > maxLength) {
      return `${serialized.slice(0, maxLength)}…`;
    }

    return serialized;
  } catch {
    return "[unserializable]";
  }
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
  if (isRecord(event.inputs)) return safePreviewStringify(event.inputs);
  if (isRecord(event.outputs)) return safePreviewStringify(event.outputs);

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
      onClick={onClick}
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
    </button>
  );
}

function EventDetails({ event }: { event: EventRecord }) {
  return (
    <div className="border-t border-border bg-muted/30 p-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
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
            {typeof event.inputs === "string" ? event.inputs : JSON.stringify(event.inputs, null, 2)}
          </pre>
        </div>
      )}
      {event.outputs !== undefined && event.outputs !== null && (
        <div>
           <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Outputs</p>
          <pre className="text-xs font-mono text-foreground bg-background p-2 rounded border border-border overflow-auto max-h-40 whitespace-pre-wrap break-all">
            {typeof event.outputs === "string" ? event.outputs : JSON.stringify(event.outputs, null, 2)}
          </pre>
        </div>
      )}
      {event.refs && Object.keys(event.refs).length > 0 && (
        <div>
           <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">References</p>
          <pre className="text-xs font-mono text-foreground bg-background p-2 rounded border border-border overflow-auto max-h-20">
            {JSON.stringify(event.refs, null, 2)}
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
