# Conventions (for consistent LLM-generated code)

These conventions exist so automated code generation stays coherent and low-risk.

---

## TypeScript-first
Everything is typed:
- `Artifact`
- `EventRecord`
- `WidgetInstance`
- `ToolResult`
- `McpServerConfig`

**Rule:** Prefer explicit types for public module APIs.

---

## No hidden side effects
- Tools return structured outputs.
- State transitions are explicit and recorded as Events.
- UI renders from state; it does not “do work” implicitly.

---

## Agent-exposed actions are Tools
- All agent-exposed actions must be schema-defined tools (Zod input/output).
- Tools are compatible with Tambo’s model of schema-defined actions. [3](https://github.com/tambo-ai/tambo)[4](https://www.npmjs.com/package/@tambo-ai/react)

---

## UI widgets are Tambo Components
- Generative widgets render once in response to a message.
- Interactable widgets persist and update by ID.

Tambo supports both patterns for generative UI. [3](https://github.com/tambo-ai/tambo)[4](https://www.npmjs.com/package/@tambo-ai/react)

---

## Phase discipline
- Implement only one phase at a time.
- The phase acceptance checklist is the contract.
- Each phase adds one major capability.

---

## Bun runtime discipline
- Run Next via Bun runtime scripts using `bun --bun next ...`. [1](https://bun.sh/docs/guides/ecosystem/nextjs)

---

## MCP discipline (client-side)
- Store MCP server configs in browser localStorage (prototype).
- Require explicit approvals for MCP tool calls and record provenance.
- Be mindful of Streamable HTTP transport considerations. [5](https://modelcontextprotocol.io/docs/)[6](https://github.com/modelcontextprotocol/modelcontextprotocol)
