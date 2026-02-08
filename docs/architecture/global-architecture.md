---

# ✅ `docs/architecture/global-architecture.md`


# Global Architecture (applies to every phase)

This document describes the **stable backbone** of the system. All phases must preserve these concepts.

---

## Core Systems (stable from Phase 1 onward)

### 1) Workbench UI
- **Left: Canvas** — the persistent workspace that shows pinned widgets and persistent interactable components.
- **Right: Control Dock** — the control center: chat, uploads, database tools, MCP config, approvals.

**Intent:** Keep Canvas independent from the chat thread so dashboards can persist even when the chat scrolls away.

---

### 2) Tambo Agent Runtime
- `TamboProvider` is mounted at the app root.
- You register **components** (with Zod props schemas) and **tools** (schema-defined functions).
- The agent selects a component or tool based on the user request; **Tambo streams props and renders the result**. [3](https://www.npmjs.com/package/@tambo-ai/react)[4](https://modelcontextprotocol.io/specification/2025-06-18/client/sampling)

**Intent:** The agent should never render arbitrary UI; it must only use your registered components/tools.

---

### 3) Artifact Store (session-scoped)
Everything becomes an **Artifact**:
- Uploaded files (PDF, image, xlsx, docx, sqlite)
- Derived text (PDF extraction, OCR)
- Datasets (parsed spreadsheets)
- Database objects (schema, query results)

**Intent:** Artifacts are the shared currency across chat, tools, widgets, and provenance.

---

### 4) Event / Provenance Ledger
Every meaningful action becomes an **event record**:
- user messages, assistant responses
- tool calls (local and MCP)
- artifact creation / derivation
- pin actions, template saves, remix actions

**Intent:** This enables debugging and the final “Explain this dashboard” feature.

---

### 5) MCP Manager (client-side)
- The browser connects directly to MCP servers (client-side integration).
- This implies MCP servers must be reachable and often require CORS when cross-origin. [5](https://modelcontextprotocol.info/docs/)[6](https://github.com/modelcontextprotocol/modelcontextprotocol)

**Intent:** MCP adds external capabilities (tools/resources/prompts), but must remain user-controlled and observable.

---

### 6) Template + Pin System
- **Pin** converts ephemeral outputs (chat-rendered components, artifacts) into persistent **WidgetInstances** on the Canvas.
- **Templates** serialize Canvas state into reusable dashboards.

**Intent:** Make dashboard creation feel effortless and reusable.
