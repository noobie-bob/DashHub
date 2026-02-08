# Phase 1 — Workbench UI + Minimal Tambo Thread (Single User)

## Objective

Deliver the first “real” product shape: a split workbench with a Left Canvas (generated/pinned UI) and a Right Dock (chat + controls), plus the initial Event Ledger skeleton.

## Architecture (1–2 lines)

- **Workbench Shell:** UI = Canvas (left) + Dock (right). The Dock hosts the thread/input; the Canvas will later host pinned widgets and interactables.
- **Event Ledger:** append-only session events drive observability and later “Explain this dashboard”.

## Additions (UI / Tools / Components)

### UI (Tailwind + shadcn/ui + Radix)

- Resizable split layout: Canvas (left) + Dock (right)
- Dock tab shell (even if only the Chat tab is active)

### Tambo integration

- Minimal thread view in the Dock
- Minimal composer/input in the Dock

### Event Ledger (internal only)

- `recordEvent(kind, data, refs?)` helper
- `EventTimeline` UI that can list events and show a selected event’s details

## State & data changes

Use the canonical model shapes in `docs/architecture/shared-data-model.md`.

Minimum in-memory session state:

- `events: EventRecord[]`
- `ui: { dockWidth: number; activeDockTab: 'chat' | 'artifacts' | 'mcp' | 'db' }`

Minimum `EventRecord` kinds to support this phase:

- `message.sent`
- `message.received`

## Acceptance / Demo checklist

- Workbench renders with left and right panels; resizing works.
- User can type a prompt and submit.
- Event Ledger records `message.sent` for the prompt.
- Assistant response appears; Event Ledger records `message.received`.
- No persistence required yet (Phase 7), but state stays stable within the session.

## Test prompts

- `"Hello!"` (expect: response; 2 events)
- `"Summarize what this app can do."` (expect: response; 2 events)

## Notes for `llm.txt` / `*.skills`

- No agent-exposed tools yet (those start Phase 6). Phase 1 introduces internal helpers only.
- Keep the Canvas independent from the chat thread rendering; the Canvas will be driven by `WidgetInstance[]` later.

## Handoff to Phase 2

Phase 2 strengthens the Dock into a real “control center”:

- Add an Artifacts panel placeholder
- Add a pinned-widgets placeholder area on the Canvas
