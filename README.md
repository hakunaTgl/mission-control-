# Sovereign Mission Control

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-Local%20DB-003B57?logo=sqlite)](https://www.sqlite.org/)
[![Local-First](https://img.shields.io/badge/Local--First-Privacy%20Default-brightgreen)](#)

> **Sovereign Mission Control** is a local-first AI startup command center. Built with Next.js, TypeScript, Tailwind, Prisma, and SQLite - it gives you full operational control over your AI agents, projects, workflows, and memory vault without any cloud dependencies.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Local-First Design](#local-first-design)
- [Roadmap](#roadmap)
- [License](#license)

---

## Features

### Dashboard & Monitoring
- **KPI Dashboard**: Real-time metrics for projects, agents, workflows, approvals, and system health
- **Diagnostics Console**: Database health monitoring and failure tracking
- **Activity Logs**: Approval queue and audit logs for all risky actions

### Agent Management
- **Agent Control**: Create and manage mission agents with seeded defaults
- **Anti-Hang Guard**: Workflow execution protected by max-3-attempt safeguard
- **Approval Gates**: Mandatory approval for sensitive workflow actions

### Project & Data
- **Project Inventory**: Full local CRUD for project management
- **Memory Vault**: Persistent local memory store with CRUD operations
- **Workflow Automations**: Simulated and labeled automation runs

### Settings & Security
- **Settings/Safety Module**: Security and configuration management
- **Local-First by Default**: All data stays on-device; external integrations disabled unless explicitly enabled
- **No Committed Secrets**: Environment-based config, never committed credentials

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 14** | Full-stack React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Prisma ORM** | Type-safe database access |
| **SQLite** | Local-first embedded database |
| **Zod** | Runtime type validation |

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/hakunaTgl/mission-control-.git
cd mission-control-

# 2. Copy and configure environment
cp .env.example .env
# Edit .env as needed

# 3. Install dependencies
npm install

# 4. Set up the database
npx prisma migrate dev --name init
npm run prisma:seed

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
mission-control-/
|-- app/                # Next.js App Router pages & API routes
|-- components/         # Reusable React components
|-- data/               # SQLite database file (local)
|-- lib/                # Utilities, Prisma client, helpers
|-- prisma/             # Prisma schema & migrations
|-- public/             # Static assets
|-- src/                # Core business logic
|-- tests/              # Test suite
|-- .env.example        # Environment variable template
|-- AGENTS.md           # Agent definitions and roles
|-- PLANS.md            # Project plans and roadmap notes
`-- README.md
```

---

## Local-First Design

Sovereign Mission Control is designed to run entirely on your local machine:

- **SQLite database** stored at `data/mission-control.db` — no cloud database required
- **External integrations disabled** by default — opt-in only
- **Approval gates** required for all workflow state changes
- **No telemetry** — zero data leaves your machine
- **Air-gap capable** — works without any internet connection after setup

---

## Roadmap

- [x] Dashboard KPIs and health monitoring
- [x] Agent control with seeded mission agents
- [x] Project inventory and Memory Vault (CRUD)
- [x] Workflow automations with anti-hang guard
- [x] Diagnostics console
- [x] Approval queue and audit logs
- [ ] Real AI agent execution (OpenAI/local LLM)
- [ ] Multi-user support with role-based access
- [ ] Export/import data bundles
- [ ] Optional cloud sync (opt-in)
- [ ] Mobile-responsive UI improvements

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<p align="center">Built with passion by <a href="https://github.com/hakunaTgl">hakunaTgl (Tylor Fenwick)</a> - <a href="https://hakunatgl.github.io">Portfolio</a></p>
