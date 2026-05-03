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
