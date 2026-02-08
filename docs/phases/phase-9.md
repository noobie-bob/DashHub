# Phase 9 - Templates (Save/Load Dashboards)

**Goal:** Add **dashboard templates** so a user can save the current Canvas (sections + widgets + minimal layout metadata) under a name and later reload it to instantly restore a dashboard. This makes the prototype "sticky" and enables reusable modules like "DB Design Tool", "Study Planner", etc.

> Phase 9 focuses on: **serialize -> store -> restore**. No sharing URLs, no multi-user, no cloud sync (yet).

---

## 9.1 Outcomes (what "done" means)

By the end of Phase 9 you will have:

- A **Save Template** flow that stores a template snapshot in localStorage.
- A **Load Template** flow that replaces the current Canvas with the saved snapshot.
- A simple **Template Library UI** (list + actions) inside the Dock (recommended tab: `Templates` under Canvas/Artifacts, or reuse `Artifacts` tab for now).
- Event logging for:
  - `template.saved`
  - `template.loaded`
  - `template.deleted` (optional)
- Templates persist across refresh (using the same persistence mechanism from Phase 7).

---

## 9.2 Architecture (1-2 lines)

- **Template = Snapshot:** A template is a **versioned snapshot** of Canvas state (`sections[]`, `widgets[]`, and minimal `layoutMeta`) stored in localStorage.
- **Load = Replace:** Loading a template replaces the active Canvas state (optionally with confirmation).

---

## 9.3 Additions (UI / Tools / Data)

### A) Template Data Model (v0)

Define a `Template` object:

- `templateId: string`
- `name: string`
- `description?: string`
- `createdAt: number`
- `updatedAt: number`
- `schemaVersion: number`
- `snapshot: TemplateSnapshot`

`TemplateSnapshot` (v0) includes:
- `sections: CanvasSection[]`
- `widgets: WidgetInstance[]`
- `uiHints?: { preferredLayout?: 'stack' | 'grid'; }` (optional)

> Keep `schemaVersion` separate from the session schema version if you want. If not, reuse the same version constant.

---

### B) UI: Template Library Panel

Add a UI panel (Dock tab or subpanel) that shows:

- List of templates (name + updatedAt)
- Actions per template:
  - **Load**
  - **Rename**
  - **Delete**
- Primary CTA:
  - **Save Current as Template**

Optional quality-of-life:
- Search box to filter templates by name.

---

### C) Save Template Flow

User clicks "Save Current as Template":
- Prompt for:
  - template name
  - optional description
- Snapshot current Canvas:
  - `sections[]`
  - `widgets[]`
- Store it under `templates[]` in localStorage (and in session state if you track it there)
- Emit `template.saved`

---

### D) Load Template Flow

User clicks "Load":
- (Recommended) Show confirm dialog:
  - "This will replace your current dashboard. Continue?"
- Replace Canvas state:
  - set `sections[]` and `widgets[]` from template snapshot
- Emit `template.loaded`

> Loading should not merge in Phase 9. Keep it simple: **replace**.

---

## 9.4 Tools to Add (Agent-exposed vs internal)

No agent tools required yet (can be internal UI actions). If you want to make these agent-callable later, define them cleanly now.

### Required internal actions

- `saveTemplate(name, description?) -> { templateId }`
- `loadTemplate(templateId) -> { templateId }`
- `deleteTemplate(templateId) -> { templateId }`
- `renameTemplate(templateId, newName) -> { templateId, newName }`

---

## 9.5 State Model Changes (TypeScript-first)

Add template state:

- `templates: Template[]`
- `ui.selectedTemplateId?: string` (optional, for inspector)

Persist templates using Phase 7 persistence layer.

**Storage key options:**
- Option A (recommended): store templates inside the same session snapshot.
- Option B: store templates under a separate key:
  - `genui.templates.v1`

Either is fine; Option A is simpler for a prototype.

---

## 9.6 Event Timeline Additions

Add these event kinds:

- `template.saved`
  - `data: { templateId, name, widgetCount, sectionCount }`

- `template.loaded`
  - `data: { templateId, name }`

Optional:
- `template.deleted`
  - `data: { templateId, name }`

- `template.renamed`
  - `data: { templateId, oldName, newName }`

**Rule:** Template actions should always be visible in the Event Timeline.

---

## 9.7 Key Implementation Details

### A) Stable IDs and collisions

When loading:
- Use exactly the IDs stored in the template snapshot (simplest).
- Or rehydrate with new IDs (more complex).
For Phase 9, prefer:
- **use stored IDs** to keep behavior deterministic.

### B) Keep templates small and safe

Do NOT store:
- file payloads
- artifacts payloads
- sql.js DB handles
- anything huge

Templates store only:
- Canvas structure + widget props snapshots

### C) Confirmation UX

Use a dialog for load/replace:
- Prevent accidental overwrites.

---

## 9.8 Pseudocode (critical logic)

```pseudo
function saveTemplate(name, description):
  snapshot = {
    sections: clone(sections),
    widgets: clone(widgets)
  }

  template = {
    templateId: newId(),
    name,
    description,
    createdAt: now(),
    updatedAt: now(),
    schemaVersion: CURRENT_VERSION,
    snapshot
  }

  templates.push(template)
  recordEvent('template.saved', { templateId: template.templateId, name, widgetCount: widgets.length, sectionCount: sections.length })
  persistSession()
  return template.templateId


function loadTemplate(templateId):
  template = templates.find(t => t.templateId == templateId)
  if not template: throw Error('Template not found')

  // Confirm replace in UI first
  sections = clone(template.snapshot.sections)
  widgets = clone(template.snapshot.widgets)

  recordEvent('template.loaded', { templateId, name: template.name })
  persistSession()
```
---
## 9.9 Acceptance Checklist (Demo)

 Create a section and pin at least 2 widgets (Phase 8 behavior).
 Save current dashboard as a template named "My Dashboard".
 Clear current canvas (either manually or via Reset Session).
 Load "My Dashboard" template -> sections/widgets restored.
 Refresh browser -> template still exists.
 Event timeline shows template.saved and template.loaded.

---
## 9.10 Test Prompts (for validation)
"Summarize this project in 3 bullets." -> Pin summary
"Make a small table of 3 features." -> Pin table
Save template: "Prototype Dashboard"
Reset session (or clear canvas)
Load "Prototype Dashboard" -> verify everything returns


---
## 9.11 Handoff to Phase 10
Phase 10 introduces Remix:

One-click "Compact / Visual / Executive Summary"
Remix generates a new dashboard variant from the same context and can optionally create a new template version.
