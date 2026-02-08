# Phase 7 — Session Persistence (Minimal localStorage)

**Goal:** Persist the prototype workspace so refreshing the browser restores the current session state. Keep it minimal and safe: persist only what you need to make the demo stable.

> Phase 7 does NOT attempt multi-user sessions, auth, cloud sync, or database persistence.

---

## 7.1 Outcomes (what “done” means)

By the end of Phase 7 you will have:

- Local persistence using `localStorage` for:
  - `events`
  - `ui` (dock tab + sizing)
  - `sections`
  - `widgets`
- A versioned storage format:
  - `schemaVersion: number`
- App boot logic:
  - loads session state on startup
  - falls back to defaults if storage is missing or incompatible
- A simple “Reset Session” action for debugging.

---

## 7.2 Architecture (1–2 lines)

- **Persistence Layer:** Serialize a minimal `SessionSnapshot` to localStorage with a `schemaVersion`.
- **Hydration:** On app start, attempt to load snapshot → validate → hydrate state → continue.

---

## 7.3 Additions (Modules / UI / State)

### A) Persistence Module

Create a dedicated persistence layer with:

- `saveSession(snapshot)`
- `loadSession(): snapshot | null`
- `clearSession()`

Use a single storage key, e.g.:

- `localStorageKey = "genui.session.v1"`

---

### B) Session Snapshot Shape

Define a minimal snapshot:

- `schemaVersion: number`
- `savedAt: number`
- `ui: ...`
- `events: ...`
- `sections: ...`
- `widgets: ...`

**Do NOT store:**

- Large payloads (files, extracted text, etc.) — those begin later with the artifacts system.
- Any DB handles (e.g., `sql.js` DBs should never go into `localStorage`).

---

### C) Reset Session Button

Add a reset button in Dock (Settings/Debug area is fine):

- Clears `localStorage` snapshot
- Resets in-memory state
- Logs an event `session.reset` (optional)

---

## 7.4 Validation & Safety

### A) Schema versioning

- If `schemaVersion` mismatches:
  - Ignore stored state
  - Start a fresh session
  - Optionally log a warning event

### B) Minimal validation

At minimum, validate that:

- `schemaVersion` is a number
- `events` is an array
- `ui` has expected keys

> Full Zod validation is optional at this stage but recommended if quick.

---

## 7.5 Event Timeline Additions (optional)

Recommended events:

- `session.loaded`
- `session.saved`
- `session.reset`
- `session.load_failed` (if parsing fails)

These events are optional; do not overcomplicate.

---

## 7.6 Key Implementation Details

### A) When to save

Use **one** of these approaches:

**1) Save on change (simple):**
- On any state change to `events/ui/sections/widgets`, debounce and persist.

**2) Save on critical actions (minimal):**
- Save after tool success
- Save after message received

Either is acceptable for a prototype.

---

### B) Avoid writing too frequently

- Use a debounce (e.g., **300–800ms**) to avoid thrashing `localStorage`.

---

## 7.7 Pseudocode (critical logic)

```pseudo
function loadSession():
  raw = localStorage.getItem(KEY)
  if raw is null: return null

  try:
    data = JSON.parse(raw)
    if data.schemaVersion != CURRENT_VERSION: return null
    return data
  catch:
    return null

function saveSession(snapshot):
  localStorage.setItem(KEY, JSON.stringify(snapshot))
```

---

## 7.8 Acceptance Checklist (Demo)

- Create sections/widgets/events during a session
- Refresh the browser
- Sections/widgets/events are restored
- Switching tabs is restored (optional but preferred)
- Reset Session clears local state and storage and restarts fresh

---

## 7.9 Test Prompts (for validation)

- “Create a section called Planning.”
- “Pin the last response.”
- Refresh browser → verify state exists
- Click Reset Session → verify state cleared

---

## 7.10 Handoff to Phase 8

Phase 8 expands **Pin** into a true product mechanic:

- Pin from artifacts
- Pin from query results later
- Pinned widgets become the primary Canvas content
