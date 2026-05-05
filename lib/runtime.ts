import { randomUUID } from "crypto";
import { execSql, queryJson, esc } from "./db";

export function requiresApproval(action: string) {
  return ["delete","shell","external-message","api-connect","export-private","modify-memory","overwrite-file"].includes(action);
}

export function requestApproval(entityType:string, entityId:string, action:string, reason:string) {
  const id = randomUUID();
  execSql(`INSERT INTO approvals VALUES ('${esc(id)}','${esc(entityType)}','${esc(entityId)}','${esc(action)}','pending',datetime('now'),NULL,'${esc(reason)}');`);
  return id;
}

export function writeAudit(action:string, entityType:string, entityId:string, approved:boolean, result:string, message:string, actor='system') {
  const id = randomUUID();
  execSql(`INSERT INTO audit_logs VALUES ('${esc(id)}','${esc(action)}','${esc(entityType)}','${esc(entityId)}','${esc(actor)}',${approved?1:0},'${esc(result)}','${esc(message)}',datetime('now'));`);
}

export function simulateWorkflowRun(id:string) {
  const w = queryJson(`SELECT * FROM workflows WHERE id='${esc(id)}' LIMIT 1;`) as any[];
  if (!w.length) return { ok:false, error:'not found' };
  const wf = w[0];
  if (wf.retry_count >= 3 || wf.retry_count >= wf.max_retries) {
    execSql(`UPDATE workflows SET status='blocked', failure_explanation='Blocked by anti-hang guard', log_output='Attempts exceeded safe retry limit (3).' WHERE id='${esc(id)}';`);
    writeAudit('simulate-run','workflow',id,false,'blocked','anti-hang blocked');
    return { ok:false, blocked:true };
  }
  execSql(`UPDATE workflows SET status='running' WHERE id='${esc(id)}';`);
  const nextRetry = Number(wf.retry_count)+1;
  const success = nextRetry % 2 === 1;
  execSql(`UPDATE workflows SET retry_count=${nextRetry}, status='${success?'success':'failed'}', last_run=datetime('now'), log_output='Simulated run ${success?'completed':'failed'} on attempt ${nextRetry}.', failure_explanation='${success?'N/A':'Transient failure; retry with approval if needed.'}' WHERE id='${esc(id)}';`);
  writeAudit('simulate-run','workflow',id,true,success?'success':'failed','simulated run');
  return { ok:true, success };
}
