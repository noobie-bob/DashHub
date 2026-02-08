# Shared Data Model (minimal, phase-expandable)

You do NOT need to implement all fields in Phase 1. This describes the **target shape** the codebase should converge on.

Treat the field names in this document as canonical. Other docs should reference this file rather than redefining model shapes.

---

## Artifacts (session memory)

### Base fields
- `id: string`
- `type: ArtifactType`
- `title: string`
- `createdAt: number`
- `source: 'userUpload' | 'toolOutput' | 'mcpResult'`
- `payload`: type-specific (keep large data in memory)
- `derivedFrom?: string[]` (artifact IDs)
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
- `id: string`
- `ts: number`
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
- `id: string`
- `componentName: string`
- `mode: 'generative' | 'interactable'`
- `props: unknown` (validated if Tambo component)
- `boundArtifacts?: string[]`
- `layout?: { x?: number; y?: number; w?: number; h?: number; sectionId?: string }`

---

## Why this model fits Tambo
Tambo’s model is built around schema-defined components/tools. You register the UI components with schemas and Tambo renders validated props.
