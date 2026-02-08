# Decision log

This file records durable decisions that affect multiple phases. When a decision changes, add a new entry and mark the old one as superseded.

## DEC-0001 — Single-user prototype

- **Status:** Accepted
- **Decision:** The initial product is single-user only (no auth, no multi-tenant).
- **Consequences:** UI and data model can assume a single local session; defer permissions and team features to a future rewrite.
- **Related phases:** Phase 0+ (applies to all phases)

## DEC-0002 — Session-only, in-memory SQLite upload

- **Status:** Accepted
- **Decision:** Uploaded SQLite databases are loaded into memory for the current session only (no persistence).
- **Consequences:** No server-side database storage requirements; persistence, caching, and large-file performance considerations are deferred.
- **Related phases:** Phase 24+ (planned)

## DEC-0003 — Client-side MCP connections

- **Status:** Accepted
- **Decision:** The browser connects directly to MCP servers (client-side integration).
- **Consequences:** MCP servers must be reachable from the client network and may require CORS handling for cross-origin access.
- **Related phases:** Phase 21+ (planned)
