# Phase 3 — Event Timeline (Observable System)

**Goal:** Build the Event Ledger UI so every meaningful action is visible and inspectable. This is the foundation for debugging and the future “Explain this dashboard” feature.

> Phase 3 turns logging into a first-class product feature (not just console logs).

---

## 3.1 Outcomes (what “done” means)

By the end of Phase 3 you will have:

- A visible **Event Timeline** panel that lists session events in chronological order.
- An **Event Inspector** that shows structured details (kind, timestamps, payload).
- At minimum, events for:
  - `message.sent`
  - `message.received`

---

## 3.2 Architecture (1–2 lines)

- **Event Ledger:** An append-only list of `EventRecord` objects stored in session state.
- **Event UI:** Timeline is a pure view over `events[]`; Inspector renders selected event.

---

## 3.3 Additions (UI / Helpers)

### UI: Event Timeline
Add a timeline view (can live in Dock or as a split within Dock):

- List items show:
  - event kind
  - timestamp (relative is fine)
  - short preview (e.g., message text)
- Clicking an event opens details in Inspector.

### UI: Event Inspector
Details panel shows:

- `eventId`
- `timestamp`
- `kind`
- `refs` (optional now)
- `inputs` (if present)
- `outputs` (if present)
- pretty-printed JSON view (use a simple code block style)

### Internal Helper: `recordEvent`
Centralize event creation into a helper:

- creates `eventId`
- stamps timestamp
- normalizes shape
- appends to `events[]`

---

## 3.4 Tools to Add (Agent-exposed vs internal)

No agent tools yet.

**Internal only:**
- `recordEvent(kind, data?, refs?)`
- `selectEvent(eventId)`
- Optional: `clearEvents()` (debug only, not required)

---

## 3.5 State Model Changes (TypeScript-first)

Introduce an `EventRecord` model:

- `events: EventRecord[]`
- `selectedEventId?: string`

**EventRecord (minimum viable):**
- `eventId: string`
- `timestamp: number`
- `kind: 'message.sent' | 'message.received' | string`
- `data?: unknown`
- `refs?: { messageId?: string; artifactIds?: string[]; widgetIds?: string[]; mcpServerId?: string }`

---

## 3.6 Key Implementation Details

### Ensure messages generate events
- When the user submits text:
  - record `message.sent` with `{ text, messageId? }`
- When the assistant responds:
  - record `message.received` with `{ text?, messageId? }`

If the assistant response is streamed:
- record the event once you have a final response (or record both start/end if you want, optional).

---

## 3.7 Pseudocode (only for the critical logic)

```pseudo
function recordEvent(kind, data = null, refs = null):
  event = {
    eventId: newId(),
    timestamp: now(),
    kind: kind,
    data: data,
    refs: refs
  }
  events.append(event)
  return event.eventId
