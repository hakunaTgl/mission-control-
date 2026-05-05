# Sovereign Mission Control

Local-first AI startup command center built with Next.js, TypeScript, Tailwind, Prisma, and SQLite.

## Features
- Dashboard KPIs for projects, agents, workflows, approvals, health
- Agent Control with seeded mission agents
- Project Inventory with local CRUD
- Memory Vault with local CRUD
- Workflow Automations (simulated runs, clearly labeled)
- Diagnostics Console
- Settings/Safety and additional module placeholders

## Setup
1. Copy env file: `cp .env.example .env`
2. Install deps: `npm install`
3. Create DB and Prisma client:
   - `npx prisma migrate dev --name init`
   - `npm run prisma:seed`
4. Run app: `npm run dev`

## Scripts
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm run prisma:migrate`
- `npm run prisma:seed`

## Local-first defaults
- SQLite file database
- external integrations disabled by default
- approval gates required for workflow actions
- no secrets committed
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
