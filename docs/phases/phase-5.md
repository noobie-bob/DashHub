# Phase 5 — Interactable TaskBoard (Persistent Widget)

**Goal:** Add the first **interactable (persistent) component**: a TaskBoard that remains stable by ID and updates through conversation. This establishes the pattern for all future persistent widgets (planner, note, schema explorer states, etc.).

> Phase 5 upgrades the system from “render once” to “keep state and evolve UI”.

---

## 5.1 Outcomes (what “done” means)

By the end of Phase 5 you will have:

- A registered interactable component: **TaskBoard**
- The assistant can:
  - add tasks
  - update task status
  - edit task text
- The TaskBoard persists by a stable ID (e.g., `taskboard-1`)
- Chat messages update the same TaskBoard rather than creating new ones

---

## 5.2 Architecture (1–2 lines)

- **Interactable Widgets:** A persistent component is mounted with a stable ID; the assistant updates its props/state instead of generating a new component each time.
- **Workbench Split:** TaskBoard can render either inside the chat thread or (preferred) as a persistent element anchored in the Canvas area (even if the Canvas is still mostly placeholder).

---

## 5.3 Additions (UI / Component / Schema)

### A) Task Model

Define a minimal task object shape:

- `id: string`
- `title: string`
- `status: 'todo' | 'in_progress' | 'done'`
- Optional:
  - `dueDate?: string`
  - `repeat?: 'daily' | 'weekly' | 'none'`

Keep it small for v1.

### B) TaskBoard Component

**What it renders**
- Header: board title
- 3 columns: Todo / In Progress / Done
- Each task appears as a card
- Controls (minimal):
  - toggle status
  - edit title (inline or dialog)

### C) Props Schema (Zod)

Example fields:

- `boardTitle: string`
- `tasks: Task[]`

> The assistant should be able to update `tasks` based on user intent.

### D) Interactable Registration

- Wrap TaskBoard as interactable with a stable ID usage pattern (e.g., `id="taskboard-1"`).
- Ensure it can be referenced/updated by subsequent messages.

---

## 5.4 Tools to Add (Agent-exposed vs internal)

No explicit tools required yet.

However, you may add **internal utilities** to keep state updates clean:

- `createTask(title): Task`
- `updateTask(tasks, taskId, patch): Task[]`
- `moveTaskStatus(tasks, taskId, newStatus): Task[]`

These should be pure functions and easy to test.

---

## 5.5 State Model Changes (TypeScript-first)

You’ll now have an early “persistent widget” concept even if Canvas is not fully implemented.

Minimum state additions:
- A stable ID for the TaskBoard instance:
  - `const TASKBOARD_ID = 'taskboard-1'`

Optional:
- Record TaskBoard updates as events:
  - `taskboard.updated` with task count/status counts

---

## 5.6 Key Implementation Details

### A) Update Behavior Rules

The assistant must prefer updating existing TaskBoard rather than creating multiple boards.

Examples:
- “Add task X” → add new task with status `todo`
- “Mark task X done” → set status `done`
- “Rename task X to Y” → update title

### B) Handling ambiguity

If the user says “mark it done” and multiple tasks exist:
- The assistant should ask which task (minimal clarification).

---

## 5.7 Pseudocode (only for the critical logic)

```pseudo
function applyTaskIntent(tasks, intent):
  if intent.type == "add":
    return tasks + [newTask(intent.title)]
  if intent.type == "setStatus":
    return tasks.map(t => t.id == intent.id ? { ...t, status: intent.status } : t)
  if intent.type == "rename":
    return tasks.map(t => t.id == intent.id ? { ...t, title: intent.title } : t)
  return tasks
