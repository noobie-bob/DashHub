"use client";

import { ArrowDownLeft, ArrowUpRight, ChevronRight, Clock, MessageSquare } from "lucide-react";
import { useState } from "react";
import type { EventRecord } from "../../lib/events";
import { useStore } from "../../lib/store";

function EventIcon({ kind }: { kind: EventRecord["kind"] }) {
  switch (kind) {
    case "message.sent":
      return <ArrowUpRight className="h-3.5 w-3.5 text-blue-500" />;
    case "message.received":
      return <ArrowDownLeft className="h-3.5 w-3.5 text-green-500" />;
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

function EventItem({
  event,
  isSelected,
  onClick,
}: {
  event: EventRecord;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted/50 ${
        isSelected ? "bg-muted" : ""
      }`}
    >
      <EventIcon kind={event.kind} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{event.kind}</p>
        <p className="text-xs text-muted-foreground">{formatTime(event.ts)}</p>
      </div>
      <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isSelected ? "rotate-90" : ""}`} />
    </button>
  );
}

function EventDetails({ event }: { event: EventRecord }) {
  return (
    <div className="border-t border-border bg-muted/30 p-3 space-y-3">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Event ID</p>
        <p className="text-xs font-mono text-foreground">{event.id}</p>
      </div>
      {event.inputs !== undefined && event.inputs !== null && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Inputs</p>
          <pre className="text-xs font-mono text-foreground bg-background p-2 rounded overflow-auto max-h-32">
            {typeof event.inputs === "string" ? event.inputs : JSON.stringify(event.inputs, null, 2)}
          </pre>
        </div>
      )}
      {event.outputs !== undefined && event.outputs !== null && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Outputs</p>
          <pre className="text-xs font-mono text-foreground bg-background p-2 rounded overflow-auto max-h-32">
            {typeof event.outputs === "string" ? event.outputs : JSON.stringify(event.outputs, null, 2)}
          </pre>
        </div>
      )}
      {event.refs && Object.keys(event.refs).length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">References</p>
          <pre className="text-xs font-mono text-foreground bg-background p-2 rounded overflow-auto max-h-20">
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
  const reversedEvents = [...events].reverse(); // Show newest first

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Event Ledger</span>
        <span className="ml-auto text-xs text-muted-foreground">{events.length} events</span>
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
              <div key={event.id}>
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
