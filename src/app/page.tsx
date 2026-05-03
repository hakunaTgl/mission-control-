import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function createProject(formData: FormData) {"use server";
  await prisma.project.create({ data: { name: String(formData.get("name")), category: String(formData.get("category")), status: "ACTIVE", priority: "MEDIUM", description: String(formData.get("description")), nextAction: String(formData.get("nextAction")), tags: String(formData.get("tags")), owner: String(formData.get("owner")) }});
  revalidatePath("/");
}

async function createMemory(formData: FormData) {"use server";
  await prisma.memoryEntry.create({ data: { title: String(formData.get("title")), content: String(formData.get("content")), type: String(formData.get("type")), priority: "MEDIUM", confidence: Number(formData.get("confidence") ?? 80), source: String(formData.get("source")) }});
  revalidatePath("/");
}

export default async function Home() {
  const [projects, agents, workflows, memories] = await Promise.all([prisma.project.findMany({ orderBy: { updatedAt: "desc" } }), prisma.agent.findMany(), prisma.workflow.findMany({ orderBy: { lastRun: "desc" } }), prisma.memoryEntry.findMany({ orderBy: { updatedAt: "desc" }, take: 5 })]);
  const stats = { total: projects.length, active: projects.filter(p=>p.status==="ACTIVE").length, blocked: projects.filter(p=>p.status==="BLOCKED").length, launch: projects.filter(p=>p.status==="LAUNCH_READY").length, regAgents: agents.length, activeAgents: agents.filter(a=>a.status==="ACTIVE").length, approvals: workflows.filter(w=>w.approvalRequired).length };
  return <main className="space-y-4">
    <h1 className="text-3xl font-bold text-neon">Sovereign Mission Control</h1>
    <section className="grid md:grid-cols-4 gap-3">{Object.entries(stats).map(([k,v])=><div key={k} className="card"><p className="text-xs uppercase text-gray-400">{k}</p><p className="text-2xl font-bold">{v}</p></div>)}</section>
    <section className="grid lg:grid-cols-2 gap-4">
      <div className="card"><h2 className="font-semibold mb-2">Project Inventory</h2><form action={createProject} className="space-y-2 mb-3"><input className="input" name="name" placeholder="Project name" required/><input className="input" name="category" placeholder="Category" required/><input className="input" name="description" placeholder="Description" required/><input className="input" name="nextAction" placeholder="Next action" required/><input className="input" name="tags" placeholder="Tags" required/><input className="input" name="owner" placeholder="Owner" required/><button className="btn">Add Project</button></form><div className="space-y-2 max-h-64 overflow-auto">{projects.map(p=><div key={p.id} className="border border-gray-800 rounded p-2"><p>{p.name}</p><p className="text-xs text-gray-400">{p.status} • {p.priority} • {p.nextAction}</p></div>)}</div></div>
      <div className="card"><h2 className="font-semibold mb-2">Memory Vault</h2><form action={createMemory} className="space-y-2 mb-3"><input className="input" name="title" placeholder="Title" required/><input className="input" name="type" placeholder="Type" required/><textarea className="input" name="content" placeholder="Content" required/><input className="input" name="confidence" type="number" min={0} max={100} placeholder="Confidence"/><input className="input" name="source" placeholder="Source" required/><button className="btn">Add Memory</button></form><div className="space-y-2 max-h-64 overflow-auto">{memories.map(m=><div key={m.id} className="border border-gray-800 rounded p-2"><p>{m.title}</p><p className="text-xs text-gray-400">{m.type} • {m.confidence}% • {m.source}</p></div>)}</div></div>
    </section>
    <section className="grid lg:grid-cols-3 gap-4">
      <div className="card"><h3 className="font-semibold">Agent Control</h3>{agents.map(a=><p key={a.id} className="text-sm border-b border-gray-800 py-1">{a.name} — {a.status} — {a.currentTask ?? "Idle"}</p>)}</div>
      <div className="card"><h3 className="font-semibold">Workflow Automations (Simulated)</h3>{workflows.map(w=><p key={w.id} className="text-sm border-b border-gray-800 py-1">{w.name} ({w.triggerType}) - {w.logOutput}</p>)}</div>
      <div className="card"><h3 className="font-semibold">Diagnostics Console</h3><ul className="text-sm space-y-1"><li>Database: Connected (Prisma/SQLite)</li><li>App version: 0.1.0</li><li>Local mode: Enabled</li><li>Env status: DATABASE_URL required</li><li>Storage path: prisma/dev.db</li><li>Blocked agents: {agents.filter(a=>a.status==="BLOCKED").length}</li><li>Workflow failures: {workflows.filter(w=>w.status==="FAILED").length}</li></ul></div>
    </section>
    <section className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">{["Builder Lab","War Room","Creative Lab","Settings / Safety","Launch Planning"].map(s=><div key={s} className="card"><h4 className="font-semibold">{s}</h4><p className="text-xs text-gray-400">Operational module ready for next iteration.</p></div>)}</section>
  </main>;
}
