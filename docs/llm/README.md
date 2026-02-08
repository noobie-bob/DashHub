# docs/llm/README.md

This folder contains **LLM control files** that you can feed into Claude/agent runners to generate the codebase **phase-by-phase**.

Canonical path/casing: `docs/llm/README.md`.

The goal is to keep generation deterministic and architecture-consistent while building a **single-user** prototype of a **Generative UI Dashboard** using:

- **Next.js + TypeScript**
- **Bun** runtime (`bun run dev/build/start`) (Bun Next.js guide: https://bun.sh/docs/guides/ecosystem/nextjs)
- **Tailwind + shadcn/ui + Radix UI** (app chrome)
- **Tambo** for generative UI (package: https://www.npmjs.com/package/@tambo-ai/react)
- **MCP** (Model Context Protocol) integrations **client-side** (browser → MCP server) (spec: https://modelcontextprotocol.io/specification/2025-06-18, repo: https://github.com/modelcontextprotocol/modelcontextprotocol)

---

## What’s in this folder

### 1) `llm.txt`

Project-wide, always-on instructions:

- Phase discipline (implement only one phase at a time)
- Core architecture invariants (Workbench, Artifacts, Event Ledger, Widgets, Tools)
- Library choices (OSS-first)
- MCP and SQLite rules

### 2) `claude.skills`

Claude-specific “how to behave” instructions:

- Senior engineer standards
- Prefer tools/components over long text
- Keep diffs minimal and reversible

### 3) `agent.skills`

Agent-runner operational instructions:

- Read phase doc → implement → verify acceptance checklist
- Never break invariants
- Ensure event logging for meaningful state transitions

### 4) `templates/`

Reusable prompt templates:

- `templates/planning-spec.md`

---

## How to use these files (recommended workflow)

### Step 0 — Keep the contract stable

1. Do not rename core primitives lightly:
   - **Artifacts**, **Events**, **Widgets**, **Tools**, **Workbench panels**.
2. Always implement the smallest set of changes that satisfies the phase acceptance checklist.

### Step 1 — Choose a phase

Phase specs live in `docs/phases/phase-N.md`.

Start with:

- `docs/phases/phase-0.md`
- `docs/phases/phase-1.md`

### Step 2 — Run your agent with these inputs

Supply the agent runner with:

- `docs/llm/llm.txt`
- `docs/llm/claude.skills`
- `docs/llm/agent.skills`
- the target `docs/phases/phase-N.md`

### Step 3 — Use a deterministic prompt template

Use the same prompt structure each time:

```text
You are implementing Phase N.
Read: docs/llm/llm.txt, docs/llm/claude.skills, docs/llm/agent.skills, docs/phases/phase-N.md.

Output:
1) Plan (bulleted)
2) Files to add/update
3) Implementation
4) How to run (bun)
5) How to test (acceptance checklist + prompts)

Rules:
- Implement ONLY the current phase.
- Preserve architecture invariants.
- Emit Event Ledger entries for new actions.
```

If you want a more structured output, use the planning template at `docs/llm/templates/planning-spec.md`.
