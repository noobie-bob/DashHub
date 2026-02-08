# Phase 2 — Dock as Control Center + Canvas Placeholders

**Goal:** Turn the right panel into a real “Control Dock” (with tabs and placeholders for future systems) while keeping the left panel as a Canvas placeholder that will later host pinned widgets and interactables.

> Phase 2 focuses on UX structure and navigation, not new AI capability.

---

## 2.1 Outcomes (what “done” means)

By the end of Phase 2 you will have:

- A Dock with **tabs**: `Chat`, `Artifacts`, `MCP`, `DB` (placeholders are fine).
- A Canvas with clear **empty states** and reserved zones:
  - “Pinned Widgets” (coming in Phase 8)
  - “Interactables” (starts Phase 5)
- A consistent **shell layout** that won’t need rewrites when new subsystems arrive.

---

## 2.2 Architecture (1–2 lines)

- **Workbench Shell:** `CanvasPanel` renders from Canvas state (placeholder now), `DockPanel` is the control plane with multiple tabs.
- **Decoupling Rule:** Canvas should not depend on the chat thread; Dock hosts the agent conversation.

---

## 2.3 Additions (UI / Modules)

### UI: Dock Tabs (Control Dock)
Add a tabbed interface in the Dock with:

- **Chat**: existing Tambo thread + composer (from Phase 1)
- **Artifacts**: placeholder list + empty state (“No artifacts yet”)
- **MCP**: placeholder config CTA (“Connect MCP server”)
- **DB**: placeholder CTA (“Upload SQLite / Connect DB”)

**Notes:**
- These tabs are not functional systems yet — they are scaffolding for later phases.

### UI: Canvas Placeholder Zones
On the Canvas:

- Section header: “Canvas”
- Placeholder cards:
  - “Pinned Widgets will appear here”
  - “Interactable Widgets will appear here”
- Optional: a “Quick actions” bar (disabled buttons for now):
  - Pin (disabled)
  - Save Template (disabled)
  - Remix (disabled)

---

## 2.4 Tools to Add (Agent-exposed vs internal)

No agent tools yet.

**Internal only:**
- `setActiveDockTab(tab)` — internal UI state
- `setDockWidth(width)` — internal UI state (if resizable)

---

## 2.5 State Model Changes (TypeScript-first)

Introduce/expand a simple UI state model:

- `ui: {`
  - `dockWidth: number`
  - `activeDockTab: 'chat' | 'artifacts' | 'mcp' | 'db'`
  - `}`

No persistence required in this phase.

---

## 2.6 Implementation Notes (senior-engineer guidance)

1. **Keep future systems shallow:**
   - Artifacts/MCP/DB tabs should only show placeholders and minimal layout components.
2. **Avoid coupling to data models early:**
   - Do not introduce artifacts store, MCP config storage, or DB logic yet.
3. **Make empty states “real”:**
   - Design placeholders so future lists can drop in without layout changes.
4. **Event logging:**
   - Only log `ui.tab.changed` if you want observability early (optional).
   - Do not over-instrument yet.

---

## 2.7 Acceptance Checklist (Demo)

- [ ] Dock tabs exist and switch correctly.
- [ ] Chat tab still works (send prompt → response).
- [ ] Artifacts/MCP/DB tabs show clear placeholder UI.
- [ ] Canvas shows placeholder zones for pinned/interactable widgets.
- [ ] No new backend required; no new tools required.

---

## 2.8 Test Prompts (for validation)

1) "Hello" (ensure chat still works)
2) Switch tabs rapidly (ensure no crashes / layout break)

---

## 2.9 Handoff to Phase 3

Phase 3 will implement the **Event Timeline UI** in a meaningful way:
- event list
- event inspector panel
- filtering/search
- ensures messages emit events reliably
