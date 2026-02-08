# Phase 4 — Register First Tambo Components (Generative Widgets)

**Goal:** Give the AI a small, safe “component toolbox” by registering the first set of **Tambo generative UI components** with **Zod prop schemas**. The assistant should now be able to render real UI widgets (not just text) in response to prompts.

> Phase 4 is the true beginning of “Generative UI”: we teach the model what UI it is allowed to render.

---

## 4.1 Outcomes (what “done” means)

By the end of Phase 4 you will have:

- A **Component Catalog** of at least 3 registered Tambo components:
  - `SummaryCard`
  - `DataTable`
  - `Graph` (can be a stub chart initially)
- Each component has a **Zod props schema** with strong descriptions (LLM-friendly).
- A prompt like “show a summary and a table” results in **rendered components**, not only plain text.
- Event timeline continues to work (at minimum, message events). Optional: log `component.rendered`.

---

## 4.2 Architecture (1–2 lines)

- **Generative Components:** The assistant can only render UI by selecting from registered components; each component’s props are validated against its Zod schema.
- **Thread → Rendered UI:** The Dock’s thread renders assistant messages + any `renderedComponent` output; Canvas remains separate (pinning comes later).

---

## 4.3 Additions (UI / Components / Schemas)

### A) Tambo Components to Add

1) **SummaryCard**
- Use for: short summaries, highlights, key takeaways, status.
- Visual: card with title + bullet list + optional “confidence/notes”.

2) **DataTable**
- Use for: structured rows/columns, previews, results.
- Visual: table with column headers and rows (limit rows for now).

3) **Graph** (v0 stub is acceptable)
- Use for: bar/line/pie charts based on simple series.
- Visual: can start as “chart placeholder” rendering type + data summary; later can integrate a chart lib.

### B) Zod Prop Schemas (LLM-Friendly)

Keep schemas strict and descriptive. Example fields (you can adjust):

**SummaryCardProps**
- `title: string`
- `summary: string`
- `bullets?: string[]`
- `tone?: 'neutral' | 'executive' | 'technical'`

**DataTableProps**
- `title: string`
- `columns: { key: string; label: string }[]`
- `rows: Record<string, string | number | boolean | null>[]`
- `maxRows?: number`

**GraphProps**
- `title: string`
- `type: 'bar' | 'line' | 'pie'`
- `data: { name: string; value: number }[]`
- `xLabel?: string`
- `yLabel?: string`

> The assistant learns when to use each component from: component name, description, and schema `.describe()` metadata.

---

## 4.4 Tools to Add (Agent-exposed vs internal)

No agent tools required yet.

**Internal-only additions:**
- `componentsCatalog.ts` (or equivalent) exporting the Tambo components array.
- Optional helper: `safePreviewRows(rows, maxRows)` to avoid huge renders.

---

## 4.5 State Model Changes (TypeScript-first)

No new global state is required in Phase 4 (beyond what Phase 3 already created).

Optional enhancements:
- Add event kinds if you want:
  - `component.rendered` with refs to messageId/componentName
This is optional. Keep it minimal.

---

## 4.6 Implementation Notes (senior-engineer guidance)

1. **Keep components deterministic and “pure”:**
   - Components should render based only on props; no fetching, no hidden side effects.

2. **Be strict about schemas:**
   - Use Zod to reject malformed props and prevent UI breakage.

3. **Limit payload sizes:**
   - Tables should not render thousands of rows. Clamp `maxRows`.

4. **Prefer minimal chart implementation:**
   - A stub Graph is fine. The key is the registration + selection + render loop.

5. **Continue Phase discipline:**
   - Do not add pinning, templates, or artifacts here.

---

## 4.7 Acceptance Checklist (Demo)

- [ ] Assistant can render **SummaryCard** when asked for a summary.
- [ ] Assistant can render **DataTable** when asked for a table.
- [ ] Assistant can render **Graph** (even if stub) when asked for a chart.
- [ ] Normal text responses still appear in messages.
- [ ] Event timeline still logs `message.sent` and `message.received`.

---

## 4.8 Test Prompts (for validation)

1) **SummaryCard**
- "Summarize the idea of this app in 4 bullets."

2) **DataTable**
- "Make a small table of 3 features and their descriptions."

3) **Graph**
- "Show a bar chart of: A=10, B=25, C=15."

---

## 4.9 Handoff to Phase 5

Phase 5 introduces the first **Interactable** (persistent) component:

- `TaskBoard` that persists by ID and can be updated by conversation.
- This enables “living widgets” (not just one-off rendered UI).
