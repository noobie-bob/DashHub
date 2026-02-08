# Shared Data Model (minimal, phase-expandable)

You do NOT need to implement all fields in Phase 1. This describes the **target shape** the codebase should converge on.

---

## Artifacts (session memory)

### Base fields
- `artifactId: string`
- `type: ArtifactType`
- `title: string`
- `createdAt: number`
- `source: 'userUpload' | 'toolOutput' | 'mcpResult'`
- `payload`: type-specific (keep large data in memory)
- `derivedFrom?: string[]` (artifactIds)
- `relationships?: Record<string, string[]>`

### Artifact types introduced gradually
- `TextArtifact`
- `ImageArtifact`
- `PdfArtifact`
- `DatasetArtifact`
- `DbArtifact`
- `SchemaArtifact`
- `QueryResultArtifact`

---

## Events (Provenance Ledger)

### Base fields
- `eventId: string`
- `timestamp: number`
- `kind: EventKind`
- `inputs?: unknown`
- `outputs?: unknown`
- `refs?: { artifactIds?: string[]; widgetIds?: string[]; messageIds?: string[]; mcpServerId?: string }`

### Typical kinds (expand over time)
- `message.sent`, `message.received`
- `artifact.created`, `artifact.derived`
- `tool.called`, `tool.result`
- `pin.created`, `pin.removed`
- `template.saved`, `template.loaded`
- `remix.requested`, `remix.applied`
- `mcp.tool.requested`, `mcp.tool.approved`, `mcp.tool.executed`

---

## Canvas Widgets

### WidgetInstance
- `widgetId: string`
- `componentName: string`
- `mode: 'generative' | 'interactable'`
- `props: unknown` (validated if Tambo component)
- `boundArtifacts?: string[]`
- `layoutMeta?: { x?: number; y?: number; w?: number; h?: number; sectionId?: string }`

---

## Why this model fits Tambo
Tambo’s model is built around schema-defined components/tools. You register the UI components with Zod schemas and Tambo renders/streams validated props. [3](https://www.npmjs.com/package/@tambo-ai/react)[4](https://modelcontextprotocol.io/specification/2025-06-18/client/sampling)
