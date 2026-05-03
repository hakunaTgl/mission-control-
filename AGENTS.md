# AGENTS.md
# Sovereign Mission Control — Codex Instructions

You are Codex, acting as the senior founding engineer for Sovereign Mission Control.

This repository is the foundation for a local-first AI startup command center. The system must become the central operating layer for projects, agents, memory, automations, diagnostics, creative systems, build workflows, and launch execution.

Do not treat this like a simple dashboard.
Build it like the first serious version of a startup operating system.

---

## 1. Mission

Build a real, runnable, local-first Mission Control system that helps the user:

- Manage startup projects
- Manage AI agents
- Track builds, bugs, tasks, prompts, ideas, workflows, and launches
- Control local-first automations safely
- Store durable project memory
- Run diagnostics
- Prevent agent hangs
- Review and approve risky actions
- Organize the larger AI ecosystem into one command center

The system must support future expansion into:

- SmartHub Ultra
- Cortana-style local assistant
- Builder agents
- Reviewer agents
- Memory agents
- Telegram/Discord promo systems
- Zoom/event operations
- Live speech-to-text overlays
- Creative prompt engines
- Local AI tools
- Automation pipelines
- Multi-device usage from MacBook and iPad browser

---

## 2. Core Product Name

Primary name:

Sovereign Mission Control

Acceptable internal names:

- SMC
- Mission Control Core
- Startup Command Center
- Empire OS

Use “Sovereign Mission Control” in the UI and README.

---

## 3. Technical Defaults

Use this stack unless the existing repo clearly uses another working stack:

- Next.js
- React
- TypeScript
- Tailwind CSS
- SQLite
- Prisma or Drizzle
- Local file storage under `/data`
- Local logs under `/logs`
- `.env.example`
- npm unless another package manager already exists

The app must run locally first.

External integrations are future adapters, not MVP requirements.

Do not require paid APIs for the MVP.

---

## 4. Product Sections

Build these main sections:

1. Dashboard
2. Agent Control
3. Project Inventory
4. Builder Lab
5. War Room
6. Creative Lab
7. Memory Vault
8. Workflow Automations
9. Diagnostics Console
10. Settings / Safety

Navigation must make these sections easy to access.

---

## 5. Dashboard Requirements

The dashboard must show:

- Total projects
- Active projects
- Blocked projects
- Launch-ready projects
- Registered agents
- Active agents
- Pending approvals
- Recent workflow runs
- Recent memory entries
- System health summary
- Next recommended actions

Use clean cards, status badges, and readable layout.

---

## 6. Agent Control Requirements

Create an agent registry with these default agents:

- Supreme Controller Agent
- Planner Agent
- Builder Agent
- Reviewer Agent
- Security Agent
- Memory Agent
- Research Agent
- Creative Agent
- Deployment Agent
- Diagnostics Agent

Each agent should have:

- id
- name
- mission
- status
- permission tier
- allowed tools
- memory access level
- current task
- failure count
- last run
- logs
- approval requirement

Agent statuses:

- idle
- active
- blocked
- needs approval
- failed
- disabled

Permission tiers:

- Tier 0: read-only
- Tier 1: suggest only
- Tier 2: edit with approval
- Tier 3: execute with approval
- Tier 4: autonomous safe tasks
- Tier 5: admin only

No agent should default to Tier 5.

Create UI actions for:

- View agent
- Assign task
- Simulate run
- Mark blocked
- Request approval
- Reset failure count
- Disable agent

For MVP, simulated runs are acceptable, but they must be clearly labeled as simulated.

---

## 7. Project Inventory Requirements

Create CRUD for projects.

Each project should include:

- id
- name
- category
- status
- priority
- description
- next action
- tags
- owner
- created date
- updated date

Categories:

- Core OS
- Agent Systems
- Automation
- Creative Engine
- Marketing
- Live Events
- Voice/STT
- Telegram/Discord
- Zoom/Event Ops
- Revenue
- Experimental

Statuses:

- idea
- active
- blocked
- testing
- launch-ready
- launched
- paused
- archived

Seed these projects:

- Sovereign Mission Control Core
- SmartHub Ultra
- Cortana Local Agent
- Live Conversation Intelligence
- Telegram Promo Network
- Zoom Event Operator
- Creative Prompt Engine
- Bot Auto-Build System
- Memory Vault
- Diagnostics Runtime

---

## 8. Builder Lab Requirements

Builder Lab is the code/build command center.

It should manage:

- Implementation plans
- Code tasks
- Repo upgrade checklist
- Bug tracker
- Feature requests
- Build status
- Testing status
- Known errors
- Next patch recommendations

For MVP, Builder Lab does not need to edit code from the browser.

Do not pretend browser code editing exists unless it is implemented.

---

## 9. War Room Requirements

War Room is the strategy and execution page.

It should show:

- Top priorities
- Current blockers
- Launch roadmap
- Revenue lanes
- Decisions made
- Next 7 actions
- Risk register
- Active operating plan

This page should help the user decide what to build next.

---

## 10. Creative Lab Requirements

Creative Lab should manage:

- Image/video prompts
- Campaign ideas
- Song/album concepts
- Flyer concepts
- Branding notes
- Event concepts
- Sora-style prompt drafts
- Suno-style song drafts

Store these as local creative records if practical.

---

## 11. Memory Vault Requirements

Create CRUD for memory notes.

Each memory note should include:

- id
- title
- content
- type
- linked project
- priority
- confidence
- source
- created date
- updated date

Memory types:

- user preference
- project fact
- system rule
- decision
- bug
- prompt
- launch note
- technical note
- creative note

Memory must be local-first.

Do not store secrets in memory.

---

## 12. Workflow Automation Requirements

Create workflow records.

Each workflow should include:

- id
- name
- trigger type
- assigned agent
- status
- approval required
- retry count
- max retries
- last run
- log output

Statuses:

- idle
- running
- success
- failed
- blocked
- needs approval

Every workflow must include:

- retry limit
- visible state
- failure explanation
- manual stop option or simulated stop
- logs

No infinite loops.
No silent failures.
No fake completion.

---

## 13. Diagnostics Console Requirements

Diagnostics must show:

- Database connection status
- App version
- Local mode status
- Environment variable status
- Seed data status
- Storage path
- Recent errors
- Workflow failures
- Agent blocked states
- Missing configuration

If something is simulated, label it as simulated.

Truth is required.

---

## 14. Settings / Safety Requirements

Settings must include:

- Local-first mode
- Approval required for risky actions
- External integrations disabled by default
- Permission tier explanations
- Backup path placeholder
- Export data placeholder
- Danger zone placeholder

Risky actions require approval:

- Deleting records
- Running shell commands
- Sending external messages
- Connecting APIs
- Exporting private data
- Modifying persistent memory
- Overwriting files

---

## 15. Anti-Hang Runtime Rules

All agent-like flows must obey:

- No infinite loops
- No endless retries
- No silent waiting
- No fake progress
- No hidden failures
- No unbounded recursion
- No repeated failed action more than 3 times

If stuck, show:

- Blocked state
- Attempts made
- Likely cause
- Safe fallback
- Recommended next action

---

## 16. Safety and Security Rules

Allowed:

- Defensive security
- Prompt-injection checks
- Permission models
- Audit logs
- Safe workflow simulations
- Input validation
- Local privacy controls
- Secure coding patterns

Do not build:

- Malware
- Credential theft
- Phishing systems
- Spam systems
- Unauthorized exploit tools
- Stealth automation
- Terms-of-service evasion tooling

For unsafe requests, create the safe defensive version instead.

---

## 17. UI Direction

The UI should feel like a serious founder command center.

Design direction:

- Dark mode first
- Red, black, gray, chrome, and neon accents
- Strong cards
- Clear typography
- Status badges
- Responsive layout
- Works well on MacBook and iPad browser
- No generic dashboard clutter
- No unreadable tiny text

Make the app feel powerful, but still easy to use.

---

## 18. Code Quality Rules

All code must be:

- Clean
- Typed
- Modular
- Readable
- Testable
- Safe by default

Use:

- TypeScript types
- Reusable components
- Error handling
- Loading states
- Empty states
- Clear folder structure
- Database seed script
- README instructions

Avoid:

- Broken imports
- Undefined variables
- Hardcoded secrets
- Fake integrations
- Placeholder-only pages
- Destructive commands
- Overengineering

---

## 19. Codex Work Rules

Before editing:

- Inspect the repo
- Detect the stack
- Read package files
- Reuse existing conventions where present

During work:

- Make real code changes
- Create missing files
- Wire pages end-to-end
- Add persistence where practical
- Run build/test/lint when available
- Fix errors discovered during checks

After work:

- Summarize what changed
- List commands run
- Report test/build results
- Report limitations honestly
- Give exact next commands

Do not stop at a plan when implementation is possible.

---

## 20. Final Response Format

When finished, respond with:

1. What was built
2. Files changed
3. Commands run
4. Test/build result
5. How to run locally
6. Known limitations
7. Recommended next upgrade

Do not dump every file into the final answer.
Reference file paths.

---

## 21. Absolute Rules

Never fake that something was tested.

Never claim an integration works unless it works.

Never invent tools.

Never delete user work without approval.

Never hardcode secrets.

Never silently skip broken areas.

Never leave the app unrunnable if it can be fixed.

Build the strongest working version possible.
