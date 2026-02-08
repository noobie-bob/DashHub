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

### Phase 0 — Project bootstrap
- Bun + Next scripts, Tailwind + shadcn/radix baseline, Tambo provider wiring. [1](https://reactflow.dev/)[2](https://deepwiki.com/Skyvern-AI/skyvern/7.1-workflow-editor-architecture)[3](https://www.npmjs.com/package/@tambo-ai/react)[4](https://modelcontextprotocol.io/specification/2025-06-18/client/sampling)

### Phase 1 — Workbench + minimal Tambo thread
- Split layout, thread UI in Dock, event ledger begins.

### Phase 2 — Dock becomes “Control Center”
- Dock tabs (Chat/Artifacts/MCP/DB placeholders), Canvas placeholder zones.

### Phase 3 — Event timeline UI
- Inspectable events, filters, details panel.

### Phase 4 — Register first Tambo generative widgets
- SummaryCard, DataTable, Graph with Zod schemas. [3](https://www.npmjs.com/package/@tambo-ai/react)[4](https://modelcontextprotocol.io/specification/2025-06-18/client/sampling)

### Phase 5 — Interactable TaskBoard
- Persistent task widget updated by ID. [3](https://www.npmjs.com/package/@tambo-ai/react)[4](https://modelcontextprotocol.io/specification/2025-06-18/client/sampling)

### Phase 6 — Local tools v0
- createSection, pinWidget, renameWidget (agent-callable later). [3](https://www.npmjs.com/package/@tambo-ai/react)[4](https://modelcontextprotocol.io/specification/2025-06-18/client/sampling)

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
- PDF.js extraction → TextArtifact. [9](https://www.w3resource.com/sqlite/snippets/sqlite-bun.php)[10](https://blog.openreplay.com/quick-guide-bun-sqlite-setup/)

### Phase 14 — Image OCR
- Tesseract.js OCR → TextArtifact. [11](https://nextjs.org/conf/session/nextjs-bun)[12](https://bun.com/docs/guides/ecosystem/nextjs)

### Phase 15 — Excel ingestion
- SheetJS xlsx → DatasetArtifact. [13](https://www.timsanteford.com/posts/how-to-ocr-with-tesseract-js-to-unlock-text-from-images/)[14](https://www.xjavascript.com/blog/how-to-extract-text-from-a-pdf-in-javascript/)

### Phase 16 — docx ingestion
- Mammoth → Text/HTML artifact. [15](https://tesseract.projectnaptha.com/)[16](https://blog.rasc.ch/2019/07/ocr-with-tesseractjs.html)

### Phase 17 — Artifact-scoped Q&A
- Ask about a selected artifact.

### Phase 18 — Auto insights
- Suggested insight widgets post-ingestion.

### Phase 19 — Actions extractor
- Extract tasks from docs → TaskBoard.

### Phase 20 — Story mode
- Narrative widget from artifacts/insights.

### Phase 21 — MCP config UI
- Client-side server config stored in localStorage. [5](https://modelcontextprotocol.info/docs/)

### Phase 22 — MCP wiring into TamboProvider
- Browser connects to MCP servers; Tambo sees tools/resources. [5](https://modelcontextprotocol.info/docs/)[6](https://github.com/modelcontextprotocol/modelcontextprotocol)[3](https://www.npmjs.com/package/@tambo-ai/react)

### Phase 23 — MCP approvals + provenance
- Explicit approval UI; log lineage. [17](https://blog.logrocket.com/getting-started-bun-react/)[18](https://liambx.com/glossary/react-flow)

### Phase 24 — SQLite upload (session-only)
- sql.js loads uploaded sqlite file into memory. [7](https://github.com/sqlitebrowser/sqlitebrowser)[8](https://turso.tech/blog/5-best-free-sqlite-gui)

### Phase 25 — Schema reader
- SchemaArtifact from SQLite.

### Phase 26 — Schema explorer
- Search + pin schema cards.

### Phase 27 — SQL runner
- QueryResultArtifact.

### Phase 28 — Auto viz
- Suggest charts from query results.

### Phase 29 — ERD / DB design tool
- React Flow ERD from schema. [19](https://sql.js.org/)[20](https://sqlite.org/wasm/doc/trunk/demo-123.md)

### Phase 30 — Explain this dashboard
- Provenance overlay from event ledger and artifact links.

---

## Notes
- SQLite main-thread vs worker is deferred until after Phase 24, as requested.
