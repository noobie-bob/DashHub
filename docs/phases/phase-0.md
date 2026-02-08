# Phase 0 — Project Bootstrap (Repo already created + cloned)

**Goal:** Establish a clean, reproducible foundation for a Bun-powered Next.js + TypeScript + Tailwind + shadcn/ui + Radix + Tambo project, with developer ergonomics and guardrails suitable for rapid, phase-by-phase generation.

> You said the Git repo is already created and cloned—Phase 0 assumes you are at the repo root.

---

## 0.1 Outcomes (what “done” means)

By the end of Phase 0 you will have:

- A **Next.js + TypeScript** app running under **Bun runtime** in dev mode (not Node). (Bun Next.js guide: https://bun.sh/docs/guides/ecosystem/nextjs)
- **Tambo** installed and wired at least at the Provider level (even if the UI is minimal). (Package: https://www.npmjs.com/package/@tambo-ai/react)
- **Tailwind CSS** configured and a minimal design system baseline with **shadcn/ui + Radix UI**.
- A consistent set of **engineering conventions**: linting/formatting, typed env loading, and a “phase-ready” docs workflow.

---

## 0.2 Architecture (1–2 lines)
- **Runtime:** Bun executes Next.js (`bun --bun`) for development and scripts.
- **Generative UI:** Tambo runs the agent loop; you register UI components and tools with schemas and Tambo renders the results.

---

## 0.3 Key Decisions (record these now)
These decisions are tracked in `docs/architecture/decisions.md`:

1. [DEC-0001 — Single-user prototype](../architecture/decisions.md#dec-0001--single-user-prototype)
2. [DEC-0002 — Session-only, in-memory SQLite upload](../architecture/decisions.md#dec-0002--session-only-in-memory-sqlite-upload)
3. [DEC-0003 — Client-side MCP connections](../architecture/decisions.md#dec-0003--client-side-mcp-connections)

---

## 0.4 Setup Tasks (reproducible)

### Prerequisites

- Bun installed and available on PATH (`bun --version`).
- You are at the repo root.

### A) Ensure Bun runtime is used for Next.js

Bun’s Next.js guide recommends running Next using Bun’s runtime by prefixing scripts with `bun --bun`.

**Tasks:**
- Initialize Next.js if not already present.
- Set package scripts to run Next via Bun runtime.

**Commands (choose one path):**

1) If the repo is empty (no Next app yet):
```bash
bun create next-app@latest .
```

Recommended options:
- TypeScript: yes
- ESLint: yes
- Tailwind: yes

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

**Verify:**
```bash
bun --version
bun install
bun dev
```

---

### B) Install and Baseline Tailwind CSS

If you used `bun create next-app@latest .` and selected Tailwind, Tailwind should already be configured.

If you need to add Tailwind to an existing Next.js app:

```bash
bun add -d tailwindcss postcss autoprefixer
bunx tailwindcss init -p
```

Ensure your global CSS includes the Tailwind directives (typically in `app/globals.css` or `src/app/globals.css`):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Outcome:** Tailwind styles apply correctly in development.

If you didn’t enable Tailwind during `bun create next-app`, follow the official Next.js Tailwind guide: [tailwindcss.com/docs/guides/nextjs](https://tailwindcss.com/docs/guides/nextjs)

Minimal command path (if you want it inline):

```bash
bun add -d tailwindcss postcss autoprefixer
bunx tailwindcss init -p
```

---

### C) Add shadcn/ui + Radix UI Baseline

Initialize shadcn/ui:

```bash
bunx shadcn@latest init
```

Then add a couple of components to prove the baseline works:

```bash
bunx shadcn@latest add button input dialog tabs toast
```

**Deliverable**

A minimal Design System Baseline Page demonstrating 3–5 primitives, such as:

- Button
- Input
- Dialog
- Tabs
- Toast

Initialize shadcn/ui using its docs: [ui.shadcn.com/docs/installation/next](https://ui.shadcn.com/docs/installation/next)

Minimal command path (if you want it inline):

```bash
bunx shadcn@latest init
```

---

### D) Add Tambo and Verify Provider Wiring
Tambo is a generative UI toolkit for React that manages agent state, streaming, and MCP interactions.

**Tasks**

- Install `@tambo-ai/react`:

  ```bash
  bun add @tambo-ai/react zod
  ```

- Mount `TamboProvider` at the application root
- Render a minimal thread UI using Tambo hooks (thread + input)

**Commands:**

```bash
bun add @tambo-ai/react zod
```

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

### F) Create/update the decision log

**Tasks**

- Ensure `docs/architecture/decisions.md` exists.
- Record Phase 0’s cross-phase commitments as decision entries (DEC-0001..DEC-0003).
- When a future phase introduces a new cross-phase constraint, add a new decision entry and link to it from the relevant phase doc.

---

## 0.5 Required Deliverables

Create the following files and directories to enable deterministic generation in later phases:

```
docs/
├─ architecture/
│  └─ decisions.md
├─ llm/
│  ├─ README.md
│  ├─ llm.txt
│  ├─ claude.skills
│  ├─ agent.skills
│  └─ templates/
│     └─ planning-spec.md
└─ phases/
   ├─ phase-0.md   (this document)
   └─ phase-1.md
```

---

## 0.6 Acceptance Checklist

Phase 0 is complete when all of the following are true:

- `bun --bun next dev` runs successfully and serves the app
- Tailwind styles apply and hot-reload correctly
- At least one shadcn/Radix component renders (e.g., Dialog or Tabs)
- `TamboProvider` is mounted and a basic thread UI renders messages
- `docs/architecture/decisions.md` exists and Phase 0 links to it
- `docs/phases/phase-0.md` and `docs/phases/phase-1.md` exist in the repo

---

## 0.7 Handoff to Phase 1

Phase 1 will:

- Convert the UI into a Workbench split layout:
  - Left: Canvas
  - Right: Dock
- Add the event timeline skeleton
