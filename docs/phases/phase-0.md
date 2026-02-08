# Phase 0 — Project Bootstrap (Repo already created + cloned)

**Goal:** Establish a clean, reproducible foundation for a Bun-powered Next.js + TypeScript + Tailwind + shadcn/ui + Radix + Tambo project, with developer ergonomics and guardrails suitable for rapid, phase-by-phase generation.

> You said the Git repo is already created and cloned—Phase 0 assumes you are at the repo root.

---

## 0.1 Outcomes (what “done” means)

By the end of Phase 0 you will have:

- A **Next.js + TypeScript** app running under **Bun runtime** in dev mode (not Node). [1](https://reactflow.dev/)[2](https://deepwiki.com/Skyvern-AI/skyvern/7.1-workflow-editor-architecture)
- **Tambo** installed and wired at least at the Provider level (even if the UI is minimal). [3](https://www.npmjs.com/package/@tambo-ai/react)[4](https://modelcontextprotocol.io/specification/2025-06-18/client/sampling)
- **Tailwind CSS** configured and a minimal design system baseline with **shadcn/ui + Radix UI**.
- A consistent set of **engineering conventions**: linting/formatting, typed env loading, and a “phase-ready” docs workflow.

---

## 0.2 Architecture (1–2 lines)

- **Runtime:** Bun executes Next.js (`bun --bun`) for development and scripts, providing a fast TS/JS toolchain. [1](https://reactflow.dev/)[2](https://deepwiki.com/Skyvern-AI/skyvern/7.1-workflow-editor-architecture)
- **Generative UI:** Tambo runs the agent loop; you register UI components with Zod schemas and Tambo renders the resulting UI/tool calls. [3](https://www.npmjs.com/package/@tambo-ai/react)[4](https://modelcontextprotocol.io/specification/2025-06-18/client/sampling)

---

## 0.3 Key Decisions (record these now)

1. **Single-user prototype**: no auth, no multi-tenant.
2. **SQLite upload is session-only and in-memory** (no persistence); implementation begins in Phase 24.
3. **MCP connections are client-side** (browser → MCP server). This implies CORS and network accessibility are needed for MCP servers. [5](https://modelcontextprotocol.info/docs/)[6](https://github.com/modelcontextprotocol/modelcontextprotocol)

---

## 0.4 Setup Tasks (step-by-step)

### A) Ensure Bun runtime is used for Next.js

Bun’s Next.js guide recommends running Next using Bun’s runtime by prefixing scripts with `bun --bun`. [1](https://reactflow.dev/)[2](https://deepwiki.com/Skyvern-AI/skyvern/7.1-workflow-editor-architecture)

**Tasks:**
- Initialize Next.js if not already present.
- Set package scripts to run Next via Bun runtime.

**Commands (choose one path):**

1) If the repo is empty (no Next app yet):
```bash
bun create next-app@latest .
```

2) If a Next.js app already exists:
```bash
bun install
```

Update `package.json` scripts:

```json
{
  "scripts": {
    "dev": "bun --bun next dev",
    "build": "bun --bun next build",
    "start": "bun --bun next start",
    "lint": "next lint"
  }
}
```

This guarantees Bun executes the Next.js CLI.

---

### B) Install and Baseline Tailwind CSS

**Tasks**

- Install Tailwind CSS, PostCSS, and Autoprefixer
- Initialize Tailwind configuration
- Add base Tailwind directives to the global CSS file

**Outcome:** Tailwind styles apply correctly in development.

---

### C) Add shadcn/ui + Radix UI Baseline

**Tasks**

- Set up shadcn/ui
- Ensure Radix UI primitives are available
- Define:
  - Global typography
  - Theme tokens (light and dark)
  - Base layout spacing rules

**Deliverable**

A minimal Design System Baseline Page demonstrating 3–5 primitives, such as:

- Button
- Input
- Dialog
- Tabs
- Toast

---

### D) Add Tambo and Verify Provider Wiring

Tambo is a generative UI toolkit for React that manages agent state, streaming, and MCP interactions. [3](https://www.npmjs.com/package/@tambo-ai/react)

**Tasks**

- Install `@tambo-ai/react`
- Mount `TamboProvider` at the application root
- Render a minimal thread UI using Tambo hooks (thread + input)

**Outcome:** Messages render and flow through Tambo, even without custom component registration.

Keep the Tambo thread and input running inside the Dock.

---

### E) Baseline Repository Hygiene

**Tasks**

- Add `.editorconfig`
- Configure Prettier (format-on-save)
- Enable ESLint (Next.js default)
- Optional: Conventional commits
- Create a structured documentation layout under `/docs`

---

## 0.5 Required Deliverables

Create the following files and directories to enable deterministic generation in later phases:

```
docs/
├─ phases/
│  ├─ phase-0.md   (this document)
│  └─ phase-1.md
└─ llm/
   ├─ llm.txt          (stub placeholder)
   ├─ claude.skills    (stub placeholder)
   └─ agent.skills     (stub placeholder)
```

---

## 0.6 Acceptance Checklist

Phase 0 is complete when all of the following are true:

- `bun --bun next dev` runs successfully and serves the app
- Tailwind styles apply and hot-reload correctly
- At least one shadcn/Radix component renders (e.g., Dialog or Tabs)
- `TamboProvider` is mounted and a basic thread UI renders messages
- `docs/phases/phase-0.md` and `docs/phases/phase-1.md` exist in the repo

---

## 0.7 Handoff to Phase 1

Phase 1 will:

- Convert the UI into a Workbench split layout:
  - Left: Canvas
  - Right: Dock
- Add the event timeline skeleton
