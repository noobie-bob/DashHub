# Phase 6 — Local Tools v0 (Agent Actions)

**Goal:** Introduce the first set of **local tools** (agent-callable operations) that modify the workspace in structured, observable ways. This is the beginning of separating:
- **Conversation** (chat messages)
from
- **Workspace operations** (pin, rename, create sections)

> Phase 6 focuses on tools that operate on the Canvas/Workspace state. No MCP yet, no DB yet.

---

## 6.1 Outcomes (what “done” means)

By the end of Phase 6 you will have:

- A **Local Tools** registry (schema-defined functions) available to the agent.
- At least 3 tools implemented and usable:
  - `createCanvasSection`
  - `renameWidget`
  - `pinFromMessage` (or `pinArtifact` placeholder if you prefer)
- All tool calls are recorded in the **Event Timeline** with inputs/outputs.
- The agent can use tools in response to prompts such as:
  - “Create a section called ‘Planning’”
  - “Rename the widget to ‘Weekly Tasks’”
  - “Pin this summary to the dashboard”

---

## 6.2 Architecture (1–2 lines)

- **Tools as Structured Actions:** Tools are schema-defined operations that produce deterministic workspace changes and return structured results.
- **Observability:** Every tool call emits events (`tool.called`, `tool.succeeded`/`tool.failed`) and references affected widget/section IDs.

---

## 6.3 Additions (Tools / UI / State)

### A) Tools to Add (Local Tools v0)

#### 1) `createCanvasSection`
**Purpose:** Creates a named container/section on the Canvas to hold pinned widgets.

**Input**
- `title: string`
- optional `description?: string`

**Output**
- `sectionId: string`
- `title: string`

#### 2) `renameWidget`
**Purpose:** Renames an existing widget on the Canvas.

**Input**
- `widgetId: string`
- `newTitle: string`

**Output**
- `widgetId: string`
- `newTitle: string`

#### 3) `pinFromMessage` (v0)
**Purpose:** Creates a widget instance from the latest assistant message output.
- If your message contains both text + a rendered component, pin the component snapshot (preferred).
- If no component exists, pin a `TextNote` widget (simple card).

**Input**
- `messageId: string`
- optional `title?: string`
- optional `sectionId?: string`

**Output**
- `widgetId: string`
- `pinnedType: 'component' | 'text'`

> If pinning is not fully implemented yet, it is acceptable for Phase 6 to create a placeholder WidgetInstance that renders a “Pinned item (v0)” card.

---

### B) UI updates

- Add a small “Workspace” debug area (can live in Canvas placeholder area) to show:
  - list of sections
  - list of widgets
- Add “Tool Activity” visibility:
  - timeline entries for tool calls
  - inspector shows tool inputs/outputs

---

## 6.4 State Model Changes (TypeScript-first)

Introduce new workspace state structures:

### A) Canvas Sections
- `sections: CanvasSection[]`

`CanvasSection` minimal shape:
- `sectionId: string`
- `title: string`
- `description?: string`
- `createdAt: number`

### B) Widget Instances (Canvas-level)
Even if your Canvas still shows placeholders, start introducing the canonical model:

- `widgets: WidgetInstance[]`

`WidgetInstance` minimal shape:
- `widgetId: string`
- `title: string`
- `kind: 'pinnedText' | 'pinnedComponent' | 'taskBoard' | string`
- `sectionId?: string`
- `source?: { messageId?: string; artifactId?: string }`
- `createdAt: number`

---

## 6.5 Event Timeline Additions

Add these event kinds:

- `tool.called`
- `tool.succeeded`
- `tool.failed`

Recommended event payload shape:

- `kind: 'tool.called'`
  - `data: { toolName, inputs }`
  - `refs: { widgetIds?, sectionIds?, messageIds? }`

- `kind: 'tool.succeeded'`
  - `data: { toolName, outputs }`
  - `refs: { widgetIds?, sectionIds?, messageIds? }`

- `kind: 'tool.failed'`
  - `data: { toolName, error }`
  - `refs: { ... }`

---

## 6.6 Key Implementation Details

### A) Tool execution wrapper
Create a wrapper that:
1) records `tool.called`
2) runs the tool function
3) records `tool.succeeded` or `tool.failed`
4) returns the result

This wrapper should be used by **all local tools** to enforce observability.

### B) Determinism
Tools should:
- return structured output
- avoid reading implicit global state
- never silently mutate without emitting an event

---

## 6.7 Pseudocode (critical logic)

```pseudo
function runTool(toolName, inputs):
  recordEvent('tool.called', { toolName, inputs })

  try:
    outputs = tools[toolName](inputs)
    recordEvent('tool.succeeded', { toolName, outputs })
    return outputs
  catch err:
    recordEvent('tool.failed', { toolName, error: err.message })
    throw err
