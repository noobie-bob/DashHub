# Phase-by-Phase Plan (30 phases)

Each phase adds **one major capability** and must be demoable.

## Standard phase template
Every phase doc (`docs/phases/phase-N.md`) should include:

- Objective
- Architecture (1–2 lines)
- Additions (UI / Tools / Components)
- State & data changes
- Acceptance / Demo checklist
- Notes for `llm.txt` / `*.skills`

---

## Overview (high level)

See **References (primary docs)** and **Phase → references map** at the bottom for the underlying tool/library docs.

### Phase 0 — Project bootstrap
- Bun + Next scripts, Tailwind + shadcn/radix baseline, Tambo provider wiring.

### Phase 1 — Workbench + minimal Tambo thread
- Split layout, thread UI in Dock, event ledger begins.

### Phase 2 — Dock becomes “Control Center”
- Dock tabs (Chat/Artifacts/MCP/DB placeholders), Canvas placeholder zones.

### Phase 3 — Event timeline UI
- Inspectable events, filters, details panel.

### Phase 4 — Register first Tambo generative widgets
- SummaryCard, DataTable, Graph with Zod schemas.

### Phase 5 — Interactable TaskBoard
- Persistent task widget updated by ID.

### Phase 6 — Local tools v0
- createSection, pinWidget, renameWidget (agent-callable later).

### Phase 7 — Local session persistence
- Serialize minimal session state (events, widgets, templates).

### Phase 8 — Pin-to-dashboard everywhere
- Convert message components/artifacts into persistent widgets.

### Phase 9 — Templates
- Save/load dashboards.

### Phase 10 — Remix
- Compact/Visual/Exec summary recomposition.

### Phase 11 — Voice input
- Voice-to-text in Dock.

### Phase 12 — Artifacts v1
- Uploads become artifacts; derivation links begin.

### Phase 13 — PDF ingestion
- PDF.js extraction → TextArtifact.

### Phase 14 — Image OCR
- Tesseract.js OCR → TextArtifact.

### Phase 15 — Excel ingestion
- SheetJS xlsx → DatasetArtifact.

### Phase 16 — docx ingestion
- Mammoth → Text/HTML artifact.

### Phase 17 — Artifact-scoped Q&A
- Ask about a selected artifact.

### Phase 18 — Auto insights
- Suggested insight widgets post-ingestion.

### Phase 19 — Actions extractor
- Extract tasks from docs → TaskBoard.

### Phase 20 — Story mode
- Narrative widget from artifacts/insights.

### Phase 21 — MCP config UI
- Client-side server config stored in localStorage.

### Phase 22 — MCP wiring into TamboProvider
- Browser connects to MCP servers; Tambo sees tools/resources.

### Phase 23 — MCP approvals + provenance
- Explicit approval UI; log lineage.

### Phase 24 — SQLite upload (session-only)
- sql.js loads uploaded sqlite file into memory.

### Phase 25 — Schema reader
- SchemaArtifact from SQLite.

### Phase 26 — Schema explorer
- Search + pin schema cards.

### Phase 27 — SQL runner
- QueryResultArtifact.

### Phase 28 — Auto viz
- Suggest charts from query results.

### Phase 29 — ERD / DB design tool
- React Flow ERD from schema.

### Phase 30 — Explain this dashboard
- Provenance overlay from event ledger and artifact links.

---

## Notes
- SQLite main-thread vs worker is deferred until after Phase 24, as requested.

## References (primary docs)
- Bun + Next.js: https://bun.com/docs/guides/ecosystem/nextjs
- Next.js: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com/docs
- Radix UI: https://www.radix-ui.com/primitives/docs/overview/introduction
- Tambo React package: https://www.npmjs.com/package/@tambo-ai/react
- Model Context Protocol spec: https://modelcontextprotocol.io/specification
- MCP reference implementation: https://github.com/modelcontextprotocol/modelcontextprotocol
- PDF.js: https://github.com/mozilla/pdf.js
- Tesseract.js: https://github.com/naptha/tesseract.js
- SheetJS (xlsx): https://docs.sheetjs.com/
- Mammoth (docx): https://github.com/mwilliamson/mammoth.js
- sql.js: https://sql.js.org/
- SQLite WASM docs: https://sqlite.org/wasm
- React Flow: https://reactflow.dev/

### Phase → references map (quick lookup)
Phases can span multiple tool areas; use this as a starting point and cross-reference as needed.
- Phase 0: Bun + Next.js, Next.js, Tailwind CSS, shadcn/ui, Radix UI, Tambo React package
- Phases 4–6 (Tambo widgets + local tools): Tambo React package
- Phases 13–16 (ingestion tooling): PDF.js, Tesseract.js, SheetJS (xlsx), Mammoth (docx)
- Phases 21, 23 (MCP config + approvals): Model Context Protocol spec, MCP reference implementation
- Phase 22 (MCP wiring): Tambo React package, Model Context Protocol spec, MCP reference implementation
- Phases 24–29 (SQLite + ERD tooling): sql.js, SQLite WASM docs, React Flow
