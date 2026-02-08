# Phase 8 - Pin-to-Dashboard Everywhere (Canvas becomes "real")

**Goal:** Turn "Pin" into a first-class product mechanic so that any useful output can become a **persistent Canvas widget**. After this phase, the left panel (Canvas) is no longer just placeholders - it becomes the user's working dashboard.

> Phase 8 makes the Canvas the primary destination for durable information. Chat remains the control plane.

---

## 8.1 Outcomes (what "done" means)

By the end of Phase 8 you will have:

- A functioning **Canvas** that renders **sections + widgets** from state (not placeholders).
- "Pin" actions available **directly in chat** to pin:
  - Assistant text responses -> pinned text widget
  - Assistant rendered components (from Phase 4) -> pinned component widget
  - Existing persistent widgets (TaskBoard from Phase 5) -> pinned reference (optional, minimal)
- A basic **section picker** during pinning (default section if none).
- Event logging for:
  - `pin.created`
  - `pin.removed` (optional)
- Pinned widgets **persist across refresh** (via Phase 7 persistence).

---

## 8.2 Architecture (1–2 lines)

- **Canvas is state-driven:** Canvas renders `sections[]` and `widgets[]` as the canonical dashboard view.
- **Pin creates WidgetInstances:** Pin action converts ephemeral chat outputs into persistent `WidgetInstance` records with stable IDs and optional section assignment.

---

## 8.3 Additions (UI / Tools / Components)

### A) Canvas UI becomes real

**CanvasPanel must render:**
- Sections (vertical stack)
- Within each section:
  - widgets list/grid (start simple: stacked cards)

**Empty state rules:**
- If no sections exist: show CTA "Create section" + default section option.
- If section exists but has no widgets: show "No pinned widgets yet".

---

### B) Widget Renderer (Canvas-level)

Add a `CanvasWidgetRenderer` that maps `widget.kind` to a UI:

Minimum widget kinds for Phase 8:

1) `pinnedText`
- Renders a card:
  - title
  - pinned text content (clamped preview)
  - meta: pinned from messageId (optional)

2) `pinnedComponent`
- Renders the **same component UI** that was rendered in chat
- Store enough info in widget state to re-render the component reliably:
  - componentName
  - props snapshot

> For v1, snapshot props at pin time. Do not attempt live updates yet.

3) `taskBoard` (optional)
- If you already render TaskBoard in Canvas, treat it as a widget kind.
- Otherwise keep TaskBoard rendering inside Dock/Chat until later.

---

### C) "Pin" in Chat (Message actions)

Add a "Pin" action button on assistant messages:

Pin logic priority:
1) If message contains a rendered component -> pin `pinnedComponent` widget using componentName + props snapshot.
2) Else pin `pinnedText` widget using assistant text content.

Optional (nice-to-have):
- Prompt user for section selection via a small dialog (Radix/shadcn Dialog).
- If user does nothing: pin into "General" section (auto-created).

---

## 8.4 Tools to Add (Agent-exposed vs internal)

You can keep these as **internal functions** for now (agent tools can remain Phase 6 style). Phase 8 is about UX + correct persistence.

### Required internal actions

- `pinFromMessage(messageId, options?)`
  - `options?: { title?: string; sectionId?: string }`
  - returns `{ widgetId }`

- `unpinWidget(widgetId)`
  - returns `{ widgetId }`

- `ensureDefaultSection()`
  - returns `{ sectionId }`

> If you already created `pinFromMessage` in Phase 6, Phase 8 upgrades it from "placeholder widget record" to "renderable Canvas widget".

---

## 8.5 State Model Changes (TypeScript-first)

### A) CanvasSection (confirm structure)
- `sectionId: string`
- `title: string`
- `description?: string`
- `createdAt: number`

### B) WidgetInstance (expand slightly)

Minimum recommended shape now:

- `widgetId: string`
- `title: string`
- `kind: 'pinnedText' | 'pinnedComponent' | 'taskBoard' | string`
- `sectionId: string`
- `createdAt: number`

For pinned text:
- `data: { text: string; sourceMessageId?: string }`

For pinned component:
- `data: { componentName: string; props: unknown; sourceMessageId?: string }`

> Keep `data` typed via a discriminated union keyed on `kind`.

---

## 8.6 Event Timeline Additions

Add these event kinds (at minimum):

- `pin.created`
  - `data: { widgetId, kind, sectionId, sourceMessageId? }`

Optional:
- `pin.removed`
  - `data: { widgetId }`

**Rule:** Pin/unpin must always emit events.  
This is essential for later "Explain this dashboard".

---

## 8.7 Key Implementation Details

### A) Deterministic rendering
- Canvas rendering must be fully derived from `sections[]` + `widgets[]`.
- Avoid reading from the chat thread to render pinned content (pinned content should be snapshotted into the widget).

### B) Stable defaults
- If no section exists at pin time:
  - auto-create a `General` section
  - pin into it
- If widget title not provided:
  - generate a sensible title:
    - For `pinnedText`: "Pinned Note"
    - For `pinnedComponent`: use component title prop if present, else "Pinned Widget"

### C) Safety clamps
- Clamp pinned text preview to avoid huge UI:
  - store full text but show truncated UI
  - or store truncated text for now and improve later

---

## 8.8 Pseudocode (only for critical logic)

```pseudo
function pinFromMessage(message):
  sectionId = ensureDefaultSection()

  if message.renderedComponent exists:
    widget = {
      widgetId: newId(),
      kind: 'pinnedComponent',
      title: deriveTitleFromComponent(message),
      sectionId,
      data: { componentName, propsSnapshot, sourceMessageId: message.id },
      createdAt: now()
    }
  else:
    widget = {
      widgetId: newId(),
      kind: 'pinnedText',
      title: 'Pinned Note',
      sectionId,
      data: { text: message.text, sourceMessageId: message.id },
      createdAt: now()
    }

  widgets.push(widget)
  recordEvent('pin.created', { widgetId: widget.widgetId, kind: widget.kind, sectionId, sourceMessageId: message.id })
  persistSession()
  return widget.widgetId
```

### 8.9 Acceptance Checklist (Demo)

 Canvas renders sections and widgets from state (not placeholders).
 Assistant response containing SummaryCard can be pinned -> appears on Canvas.
 Assistant plain-text response can be pinned -> appears as pinned text widget.
 Pinning into a section works (default "General" created if needed).
 Refresh browser -> pinned widgets + sections restore (Phase 7 persistence).
 Event timeline shows pin.created with widgetId/sectionId.


### 8.10 Test Prompts (for validation)

"Summarize this project idea in 3 bullets."
Pin the summary widget to Canvas.

"Make a small table of 3 features and their descriptions."
Pin the DataTable widget.

"Write a short note about what we built so far."
Pin the text note.

Refresh the page.
Confirm Canvas still has pinned widgets.

### 8.11 Handoff to Phase 9
Phase 9 introduces Templates:

Save current Canvas state (sections + widgets + layout metadata) under a name.
Load templates to restore a dashboard layout quickly.
