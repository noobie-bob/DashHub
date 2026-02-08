---

## ✅ `docs/phases/phase-1.md`

# Phase 1 — Workbench UI + Minimal Tambo Thread (Single User)

**Goal:** Deliver the first “real” product shape: a split workbench with **Left Canvas (generated/pinned UI)** and **Right Dock (chat + controls)**, plus the initial **event timeline** skeleton.

---

## 1.1 Outcomes (what “done” means)

By end of Phase 1 you will have:

- A stable **split layout** (Left Canvas / Right Dock) with resize support.
- A minimal **Tambo chat thread** running in the Dock.
- An **event ledger** that records at least: `message.sent`, `message.received`.

---

## 1.2 Architecture (1–2 lines)

- **Workbench Shell:** UI = `Canvas` (left) + `Dock` (right). The Dock hosts Tambo’s thread/input; the Canvas will later host pinned widgets and interactables.
- **Event Ledger:** append-only session events drive observability and later “Explain this dashboard”. Events are derived from user actions and tool/component outputs.

---

## 1.3 Components/Modules to Add

### UI (shadcn/radix + Tailwind)
- `SplitPane` (or resizable layout component)
- `CanvasPanel` (left)
- `DockPanel` (right)
- `DockTabs` (optional): Chat / Artifacts / MCP / DB

### Tambo Integration
Tambo provides a Provider + hooks to manage thread state and streaming; messages can include rendered components and text. [3](https://www.npmjs.com/package/@tambo-ai/react)[4](https://modelcontextprotocol.io/specification/2025-06-18/client/sampling)

- `TamboProvider` at app root (already in Phase 0)
- `ThreadView` using `useTamboThread()`
- `Composer` using `useTamboThreadInput()`

### Event Ledger
- `recordEvent(kind, payload)` helper
- `EventTimeline` component (list + details panel)

---

## 1.4 Tools to Add (Agent-exposed vs internal)

**No agent tools yet** (those start Phase 6). Phase 1 introduces **internal helpers** only:

- `recordEvent(kind, payload)` — internal utility to append to `events[]`
- `serializeEvent(event)` — internal, used later for persistence

---

## 1.5 State Model Introduced (TypeScript-first)

### Session State (in memory)
- `events: EventRecord[]`
- `ui: { dockWidth: number; activeDockTab: 'chat'|'artifacts'|'mcp'|'db'; }`

### EventRecord (minimum viable)
- `id: string`
- `ts: number`
- `kind: 'message.sent' | 'message.received'`
- `data: { text?: string; messageId?: string; }`

> Keep it minimal; later phases expand kinds to include artifacts/tools/MCP/provenance.

---

## 1.6 Implementation Notes (senior-engineer guidance)

1. **Decouple Canvas and Chat:**
   - Canvas should not depend on Tambo thread rendering; it will be driven by `widgets[]` later.

2. **Keep Dock “agent-first”:**
   - Dock is where the agent lives: thread, input, suggestions, and later MCP approvals.

3. **Event capture is mandatory:**
   - Any user message submit must create `message.sent`.
   - Any assistant response must create `message.received`.

4. **Streaming UX:**
   - Tambo supports streaming; optionally show a subtle “streaming” indicator in the Dock based on thread/stream status. [3](https://www.npmjs.com/package/@tambo-ai/react)

---

## 1.7 Acceptance Checklist (Demo)

- [ ] Workbench renders with left and right panels; resizing works.
- [ ] User can type a prompt and submit.
- [ ] Timeline logs `message.sent` with the prompt text.
- [ ] Assistant response appears; timeline logs `message.received`.
- [ ] No persistence required yet (Phase 7), but state stays stable within session.

---

## 1.8 Test Prompts (for validation)

Use these to validate behavior:

1) "Hello!" (expect: response; 2 events)
2) "Summarize what this app can do." (expect: response; 2 events)

---

## 1.9 Handoff to Phase 2

Phase 2 will strengthen the Dock into a real “control center”:
- Add a basic **Artifacts panel** placeholder
- Add “Pinned Widgets” placeholder area on Canvas
- Introduce the **first Tambo-registered generative components** (SummaryCard/Table/Graph) in Phase 4.
