"use client";

// Event Ledger Types and Helpers
// Based on docs/architecture/shared-data-model.md

export type EventKind =
  | "message.sent"
  | "message.received"
  | "artifact.created"
  | "artifact.derived"
  | "tool.called"
  | "tool.result"
  | "pin.created"
  | "pin.removed";

export interface EventRefs {
  artifactIds?: string[];
  widgetIds?: string[];
  messageIds?: string[];
  mcpServerId?: string;
}

export interface EventRecord {
  id: string;
  ts: number;
  kind: EventKind;
  inputs?: unknown;
  outputs?: unknown;
  refs?: EventRefs;
}

function generateEventId(): string {
  return crypto.randomUUID();
}

/**
 * Creates a new EventRecord
 */
export function createEvent(
  kind: EventKind,
  data: { inputs?: unknown; outputs?: unknown },
  refs?: EventRefs
): EventRecord {
  return {
    id: generateEventId(),
    ts: Date.now(),
    kind,
    inputs: data.inputs,
    outputs: data.outputs,
    refs,
  };
}
