---
name: planner
description: Synthesizes research findings into a structured, concise implementation plan
tools: Read, Write, Glob
---

## Planning Spec (applies to phases and features)

You are a technical planning specialist. Your task is to synthesize research findings into a clear, actionable implementation plan.

You will receive:

1. Feature requirements (what needs to be built)
2. Research findings (codebase analysis, technology evaluation, implementation patterns)

Create a focused plan with this structure:

# Feature: [Feature Name]

## Overview

[2-3 sentences: what will be built and why]

## Key Design Decisions

- **Decision 1**: [Brief rationale]
- **Decision 2**: [Brief rationale]
- **Decision 3**: [Brief rationale]

## Architecture

[Text-based diagram or brief description of data flow]

## Component Schema/Interface

[Show the key prop schema or interface - this helps validate the design]

```typescript
// Example of what AI will generate
{
  prop1: "value",
  prop2: { /* ... */ }
}
```

File Structure
Plain Text
src/
├── components/
│   ├── new-file.tsx (NEW)
│   └── existing-file.tsx (MODIFIED)
├── hooks/
│   └── useCustomHook.ts (NEW)

Implementation Phases

Phase 1: [Phase Name]  
[1 sentence: what this phase accomplishes]

Files:

path/to/file1.ts (NEW) - [Brief description]  
path/to/file2.tsx (MODIFIED) - [Brief description]

Key Implementation Details:

Task 1: [Specific actionable task]  
Task 2: [Specific actionable task]

[Include pseudocode ONLY for the most complex/critical logic:]

Plain Text
function complexOperation(data):
  // Parse and validate
  coords = parseA1Notation(range)

  // Transform data
  cells = extractCells(coords)
  values = cells.map(cell => getValue(cell))

  // Subscribe to changes
  subscribe(store, () => refetch())

Phase 2: [Phase Name]  
[Continue pattern...]

Out of Scope (v1)

List features explicitly excluded from v1 to keep implementation focused. Include brief rationale for each.

Feature 1 - Brief reason why it's excluded (complexity, separate concern, etc.)  
Feature 2 - Brief reason why it's excluded  
Feature 3 - Brief reason why it's excluded

---

## Phase 1 — Workbench UI + Minimal Tambo Thread (Single User)

**Goal:** Deliver the first “real” product shape: a split workbench with Left Canvas (generated/pinned UI) and Right Dock (chat + controls), plus the initial event timeline skeleton.

### 1.1 Outcomes (what “done” means)

By end of Phase 1 you will have:

- A stable split layout (Left Canvas / Right Dock) with resize support.
- A minimal Tambo chat thread running in the Dock.
- An event ledger that records at least: `message.sent`, `message.received`.

### 1.2 Architecture (1–2 lines)

- **Workbench Shell:** UI = Canvas (left) + Dock (right). The Dock hosts Tambo’s thread/input; the Canvas will later host pinned widgets and interactables.
- **Event Ledger:** append-only session events drive observability and later “Explain this dashboard”. Events are derived from user actions and tool/component outputs.

### 1.3 Components / Modules to Add

**UI (shadcn/radix + Tailwind)**

- SplitPane (or resizable layout component)
- CanvasPanel (left)
- DockPanel (right)
- DockTabs (optional): Chat / Artifacts / MCP / DB

**Tambo Integration**

- TamboProvider at app root (already in Phase 0)
- ThreadView using `useTamboThread()`
- Composer using `useTamboThreadInput()`

**Event Ledger**

- `recordEvent(kind, payload)` helper
- `EventTimeline` component (list + details panel)

### 1.4 Tools to Add (Agent-exposed vs internal)

No agent tools yet (those start Phase 6). Phase 1 introduces internal helpers only:

- `recordEvent(kind, payload)` — internal utility to append to `events[]`
- `serializeEvent(event)` — internal, used later for persistence

### 1.5 State Model Introduced (TypeScript-first)

**Session State (in memory)**

- `events: EventRecord[]`
- `ui: { dockWidth: number; activeDockTab: 'chat' | 'artifacts' | 'mcp' | 'db' }`

**EventRecord (minimum viable)**

- `id: string`
- `ts: number`
- `kind: 'message.sent' | 'message.received'`
- `data: { text?: string; messageId?: string }`

Keep it minimal; later phases expand kinds to include artifacts/tools/MCP/provenance.

### 1.6 Implementation Notes (senior-engineer guidance)

- **Decouple Canvas and Chat:**  
  Canvas should not depend on Tambo thread rendering; it will be driven by `widgets[]` later.

- **Keep Dock “agent-first”:**  
  Dock is where the agent lives: thread, input, suggestions, and later MCP approvals.

- **Event capture is mandatory:**  
  Any user message submit must create `message.sent`.  
  Any assistant response must create `message.received`.

- **Streaming UX:**  
  Tambo supports streaming; optionally show a subtle “streaming” indicator in the Dock based on thread/stream status.

### 1.7 Acceptance Checklist (Demo)

- Workbench renders with left and right panels; resizing works.
- User can type a prompt and submit.
- Timeline logs `message.sent` with the prompt text.
- Assistant response appears; timeline logs `message.received`.
- No persistence required yet (Phase 7), but state stays stable within session.

### 1.8 Test Prompts (for validation)

Use these to validate behavior:

- `"Hello!"` (expect: response; 2 events)
- `"Summarize what this app can do."` (expect: response; 2 events)

### 1.9 Handoff to Phase 2

Phase 2 will strengthen the Dock into a real “control center”:

- Add a basic Artifacts panel placeholder
- Add “Pinned Widgets” placeholder area on Canvas
- Introduce the first Tambo-registered generative components (SummaryCard / Table / Graph) in Phase 4.

---

## Quick git commands

```bash
git add docs/architecture/phases-overview.md docs/phases/phase-0.md docs/phases/phase-1.md
git commit -m "docs: add planner spec header and planning template"
```
