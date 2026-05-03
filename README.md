# Sovereign Mission Control

Local-first startup operating system built with Next.js + TypeScript.

## What is included
- Dashboard with core operating metrics
- Agent Control registry with 10 seeded agents and action surface
- Project Inventory with 10 seeded projects
- Builder Lab, War Room, Creative Lab, Memory Vault, Workflow Automations
- Diagnostics Console with local mode and seed checks
- Settings/Safety with risky-action approval policy
- Local persistence via `data/state.json`

## Run locally
1. `cp .env.example .env`
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:3000`

## Notes
- Current storage is JSON local persistence and clearly labeled simulated areas.
- `/logs` and `/data` are local-first paths.
