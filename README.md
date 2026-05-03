# Sovereign Mission Control

Next.js + TypeScript local-first operating system with SQLite-backed persistence.

## Setup
1. `cp .env.example .env`
2. `npm install`
3. `npm run dev`

## Commands
- `npm run build`
- `npm run lint`
- `node --test tests/runtime.test.mjs`

## Capabilities
- CRUD APIs and UX for Projects, Agents, Memory, Workflows
- SQLite durability under `data/mission-control.db`
- Approval queue + audit logs for risky actions
- Anti-hang workflow run guard (`max 3 attempts`)
- Diagnostics API for DB health and recent failures
