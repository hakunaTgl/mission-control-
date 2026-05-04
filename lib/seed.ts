import { readState } from "./state";
import { execSql, initDb } from "./db";

function esc(v: string) { return v.replaceAll("'", "''"); }

export async function seedFromJsonIfEmpty() {
  initDb();
  const existing = execSql as unknown;
  const s = await readState();
  execSql("BEGIN;");
  for (const p of s.projects) {
    execSql(`INSERT OR IGNORE INTO projects VALUES ('${esc(p.id)}','${esc(p.name)}','${esc(p.category)}','${esc(p.status)}','${esc(p.priority)}','${esc(p.description)}','${esc(p.nextAction)}','${esc(JSON.stringify(p.tags))}','${esc(p.owner)}','${esc(p.createdDate)}','${esc(p.updatedDate)}');`);
  }
  for (const a of s.agents) {
    execSql(`INSERT OR IGNORE INTO agents VALUES ('${esc(a.id)}','${esc(a.name)}','${esc(a.mission)}','${esc(a.status)}',${a.permissionTier},'${esc(JSON.stringify(a.allowedTools))}','${esc(a.memoryAccessLevel)}','${esc(a.currentTask)}',${a.failureCount},'${esc(a.lastRun)}','${esc(JSON.stringify(a.logs))}',${a.approvalRequired?1:0});`);
  }
  for (const m of s.memory) {
    execSql(`INSERT OR IGNORE INTO memory_notes VALUES ('${esc(m.id)}','${esc(m.title)}','${esc(m.content)}','${esc(m.type)}','${esc(m.linkedProject)}','${esc(m.priority)}',${m.confidence},'${esc(m.source)}','${esc(m.createdDate)}','${esc(m.updatedDate)}');`);
  }
  for (const w of s.workflows) {
    execSql(`INSERT OR IGNORE INTO workflows VALUES ('${esc(w.id)}','${esc(w.name)}','${esc(w.triggerType)}','${esc(w.assignedAgent)}','${esc(w.status)}',${w.approvalRequired?1:0},${w.retryCount},${w.maxRetries},'${esc(w.lastRun)}','${esc(w.logOutput)}','${esc(w.failureExplanation)}');`);
  }
  execSql("COMMIT;");
}
