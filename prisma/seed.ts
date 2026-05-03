import { PrismaClient, AgentStatus, Priority, ProjectStatus, WorkflowStatus } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const agents = ["Supreme Controller Agent","Planner Agent","Builder Agent","Reviewer Agent","Security Agent","Memory Agent","Research Agent","Creative Agent","Deployment Agent","Diagnostics Agent"];
  for (const name of agents) {
    await prisma.agent.upsert({ where: { name }, update: {}, create: { name, mission: `${name} mission oversight`, status: AgentStatus.ACTIVE, permissionTier: "Tier-2", allowedTools: "local-db,planner,diagnostics", memoryAccess: true, currentTask: "System bootstrap", failureCount: 0, lastRun: new Date(), logs: "Initialized", approvalRequirement: name.includes("Security") }});
  }
  const projects = ["Sovereign Mission Control Core","SmartHub Ultra","Cortana Local Agent","Live Conversation Intelligence","Telegram Promo Network","Zoom Event Operator","Creative Prompt Engine","Bot Auto-Build System","Memory Vault","Diagnostics Runtime"];
  for (const name of projects) {
    await prisma.project.upsert({ where: { name }, update: {}, create: { name, category: "AI Ops", status: ProjectStatus.ACTIVE, priority: Priority.HIGH, description: `${name} implementation track`, nextAction: "Review execution queue", tags: "mission-control,local-first", owner: "Founder" }});
  }
  const core = await prisma.project.findFirst({ where: { name: "Sovereign Mission Control Core" } });
  await prisma.memoryEntry.create({ data: { title: "Boot memory", content: "Mission Control initialized with seeded agents/projects.", type: "system", priority: Priority.HIGH, confidence: 95, source: "seed", projectId: core?.id }});
  await prisma.workflow.create({ data: { name: "Daily Agent Sync", triggerType: "schedule", assignedAgent: "Planner Agent", status: WorkflowStatus.ACTIVE, approvalRequired: true, retryCount: 0, maxRetries: 3, lastRun: new Date(), logOutput: "SIMULATED RUN: all agents synchronized.", simulated: true }});
}
main().finally(() => prisma.$disconnect());
