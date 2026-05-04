/**
 * Runtime logic tests — covers requiresApproval, requestApproval,
 * writeAudit, and simulateWorkflowRun (mirrors lib/runtime.ts logic).
 * Uses the sqlite3 CLI directly; no TypeScript compilation required.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

const dbPath = path.join(process.cwd(), 'data', 'mission-control-runtime-test.db');
mkdirSync(path.dirname(dbPath), { recursive: true });

function exec(sql) {
  return execFileSync('sqlite3', [dbPath, sql], { encoding: 'utf8' });
}

function query(sql) {
  return JSON.parse(
    execFileSync('sqlite3', ['-json', dbPath, sql], { encoding: 'utf8' }) || '[]'
  );
}

// Bootstrap tables needed by runtime functions
exec(`
CREATE TABLE IF NOT EXISTS workflows (id TEXT PRIMARY KEY,name TEXT,trigger_type TEXT,assigned_agent TEXT,status TEXT,approval_required INTEGER,retry_count INTEGER,max_retries INTEGER,last_run TEXT,log_output TEXT,failure_explanation TEXT);
CREATE TABLE IF NOT EXISTS approvals (id TEXT PRIMARY KEY,entity_type TEXT,entity_id TEXT,action TEXT,status TEXT,requested_at TEXT,resolved_at TEXT,reason TEXT);
CREATE TABLE IF NOT EXISTS audit_logs (id TEXT PRIMARY KEY,action TEXT,entity_type TEXT,entity_id TEXT,actor TEXT,approved INTEGER,result TEXT,message TEXT,created_at TEXT);
`);

// ── helpers that mirror lib/runtime.ts ──────────────────────────────────────

function esc(v) { return String(v).replaceAll("'", "''"); }

function requiresApproval(action) {
  return ['delete', 'shell', 'external-message', 'api-connect', 'export-private', 'modify-memory', 'overwrite-file'].includes(action);
}

function requestApproval(entityType, entityId, action, reason) {
  const id = randomUUID();
  exec(`INSERT INTO approvals VALUES ('${esc(id)}','${esc(entityType)}','${esc(entityId)}','${esc(action)}','pending',datetime('now'),NULL,'${esc(reason)}');`);
  return id;
}

function writeAudit(action, entityType, entityId, approved, result, message, actor = 'system') {
  const id = randomUUID();
  exec(`INSERT INTO audit_logs VALUES ('${esc(id)}','${esc(action)}','${esc(entityType)}','${esc(entityId)}','${esc(actor)}',${approved ? 1 : 0},'${esc(result)}','${esc(message)}',datetime('now'));`);
  return id;
}

function simulateWorkflowRun(id) {
  const w = query(`SELECT * FROM workflows WHERE id='${esc(id)}' LIMIT 1;`);
  if (!w.length) return { ok: false, error: 'not found' };
  const wf = w[0];
  if (wf.retry_count >= 3 || wf.retry_count >= wf.max_retries) {
    exec(`UPDATE workflows SET status='blocked', failure_explanation='Blocked by anti-hang guard', log_output='Attempts exceeded safe retry limit (3).' WHERE id='${esc(id)}';`);
    writeAudit('simulate-run', 'workflow', id, false, 'blocked', 'anti-hang blocked');
    return { ok: false, blocked: true };
  }
  exec(`UPDATE workflows SET status='running' WHERE id='${esc(id)}';`);
  const nextRetry = Number(wf.retry_count) + 1;
  const success = nextRetry % 2 === 1;
  exec(`UPDATE workflows SET retry_count=${nextRetry}, status='${success ? 'success' : 'failed'}', last_run=datetime('now'), log_output='Simulated run ${success ? 'completed' : 'failed'} on attempt ${nextRetry}.', failure_explanation='${success ? 'N/A' : 'Transient failure; retry with approval if needed.'}' WHERE id='${esc(id)}';`);
  writeAudit('simulate-run', 'workflow', id, true, success ? 'success' : 'failed', 'simulated run');
  return { ok: true, success };
}

// ── requiresApproval ─────────────────────────────────────────────────────────

test('requiresApproval: delete is risky', () => {
  assert.equal(requiresApproval('delete'), true);
});

test('requiresApproval: shell is risky', () => {
  assert.equal(requiresApproval('shell'), true);
});

test('requiresApproval: external-message is risky', () => {
  assert.equal(requiresApproval('external-message'), true);
});

test('requiresApproval: api-connect is risky', () => {
  assert.equal(requiresApproval('api-connect'), true);
});

test('requiresApproval: export-private is risky', () => {
  assert.equal(requiresApproval('export-private'), true);
});

test('requiresApproval: modify-memory is risky', () => {
  assert.equal(requiresApproval('modify-memory'), true);
});

test('requiresApproval: overwrite-file is risky', () => {
  assert.equal(requiresApproval('overwrite-file'), true);
});

test('requiresApproval: read is not risky', () => {
  assert.equal(requiresApproval('read'), false);
});

test('requiresApproval: list is not risky', () => {
  assert.equal(requiresApproval('list'), false);
});

test('requiresApproval: update is not risky', () => {
  assert.equal(requiresApproval('update'), false);
});

test('requiresApproval: empty string is not risky', () => {
  assert.equal(requiresApproval(''), false);
});

// ── requestApproval ──────────────────────────────────────────────────────────

test('requestApproval: inserts a pending record with correct fields', () => {
  const id = requestApproval('project', 'p1', 'delete', 'test deletion');
  const rows = query(`SELECT * FROM approvals WHERE id='${id}';`);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].entity_type, 'project');
  assert.equal(rows[0].entity_id, 'p1');
  assert.equal(rows[0].action, 'delete');
  assert.equal(rows[0].status, 'pending');
  assert.equal(rows[0].reason, 'test deletion');
  assert.ok(rows[0].requested_at, 'requested_at should be set');
  assert.ok(rows[0].resolved_at == null || rows[0].resolved_at === '', 'resolved_at should be null/empty for new records');
});

test('requestApproval: returns a valid UUID', () => {
  const id = requestApproval('agent', 'a1', 'shell', 'test shell');
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
});

test('requestApproval: handles apostrophes in reason without SQL error', () => {
  const id = requestApproval('project', 'p2', 'delete', "it's a test reason");
  const rows = query(`SELECT * FROM approvals WHERE id='${id}';`);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].reason, "it's a test reason");
});

test('requestApproval: multiple requests create independent records', () => {
  const id1 = requestApproval('project', 'pA', 'delete', 'r1');
  const id2 = requestApproval('project', 'pB', 'delete', 'r2');
  assert.notEqual(id1, id2);
  const row1 = query(`SELECT entity_id FROM approvals WHERE id='${id1}';`)[0];
  const row2 = query(`SELECT entity_id FROM approvals WHERE id='${id2}';`)[0];
  assert.equal(row1.entity_id, 'pA');
  assert.equal(row2.entity_id, 'pB');
});

// ── writeAudit ───────────────────────────────────────────────────────────────

test('writeAudit: inserts an approved audit entry', () => {
  const id = writeAudit('delete', 'project', 'p1', true, 'success', 'test audit');
  const rows = query(`SELECT * FROM audit_logs WHERE id='${id}';`);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].action, 'delete');
  assert.equal(rows[0].entity_type, 'project');
  assert.equal(rows[0].entity_id, 'p1');
  assert.equal(rows[0].approved, 1);
  assert.equal(rows[0].result, 'success');
  assert.equal(rows[0].message, 'test audit');
  assert.equal(rows[0].actor, 'system');
});

test('writeAudit: inserts an unapproved entry correctly', () => {
  const id = writeAudit('simulate-run', 'workflow', 'w1', false, 'blocked', 'anti-hang', 'agent');
  const rows = query(`SELECT * FROM audit_logs WHERE id='${id}';`);
  assert.equal(rows[0].approved, 0);
  assert.equal(rows[0].result, 'blocked');
  assert.equal(rows[0].actor, 'agent');
});

test('writeAudit: handles apostrophes in message without SQL error', () => {
  const id = writeAudit('delete', 'project', 'p3', true, 'success', "user's data removed");
  const rows = query(`SELECT message FROM audit_logs WHERE id='${id}';`);
  assert.equal(rows[0].message, "user's data removed");
});

test('writeAudit: returns a valid UUID', () => {
  const id = writeAudit('list', 'project', 'p1', true, 'success', 'ok');
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
});

// ── simulateWorkflowRun ──────────────────────────────────────────────────────

test('simulateWorkflowRun: returns error for missing workflow', () => {
  const res = simulateWorkflowRun('does-not-exist');
  assert.equal(res.ok, false);
  assert.equal(res.error, 'not found');
});

test('simulateWorkflowRun: blocks when retry_count equals max_retries', () => {
  exec("DELETE FROM workflows WHERE id='sr-eq';");
  exec("INSERT INTO workflows VALUES ('sr-eq','EQ Block','manual','Agent','idle',0,3,3,'2026-01-01','','');");
  const res = simulateWorkflowRun('sr-eq');
  assert.equal(res.ok, false);
  assert.equal(res.blocked, true);
  const row = query("SELECT status, failure_explanation FROM workflows WHERE id='sr-eq';")[0];
  assert.equal(row.status, 'blocked');
  assert.ok(row.failure_explanation.toLowerCase().includes('anti-hang'));
});

test('simulateWorkflowRun: blocks when retry_count exceeds max_retries', () => {
  exec("DELETE FROM workflows WHERE id='sr-gt';");
  exec("INSERT INTO workflows VALUES ('sr-gt','GT Block','manual','Agent','idle',0,5,3,'2026-01-01','','');");
  const res = simulateWorkflowRun('sr-gt');
  assert.equal(res.ok, false);
  assert.equal(res.blocked, true);
});

test('simulateWorkflowRun: blocks when retry_count >= 3 (hard cap)', () => {
  exec("DELETE FROM workflows WHERE id='sr-hard';");
  exec("INSERT INTO workflows VALUES ('sr-hard','Hard Cap','manual','Agent','idle',0,3,99,'2026-01-01','','');");
  const res = simulateWorkflowRun('sr-hard');
  assert.equal(res.ok, false);
  assert.equal(res.blocked, true);
});

test('simulateWorkflowRun: first run (retry 0 → 1) succeeds', () => {
  exec("DELETE FROM workflows WHERE id='sr-r0';");
  exec("INSERT INTO workflows VALUES ('sr-r0','Run0','manual','Agent','idle',0,0,3,'2026-01-01','','');");
  const res = simulateWorkflowRun('sr-r0');
  assert.equal(res.ok, true);
  assert.equal(res.success, true);
  const row = query("SELECT status, retry_count, log_output FROM workflows WHERE id='sr-r0';")[0];
  assert.equal(row.status, 'success');
  assert.equal(row.retry_count, 1);
  assert.ok(row.log_output.includes('completed'));
});

test('simulateWorkflowRun: second run (retry 1 → 2) fails', () => {
  exec("DELETE FROM workflows WHERE id='sr-r1';");
  exec("INSERT INTO workflows VALUES ('sr-r1','Run1','manual','Agent','idle',0,1,3,'2026-01-01','','');");
  const res = simulateWorkflowRun('sr-r1');
  assert.equal(res.ok, true);
  assert.equal(res.success, false);
  const row = query("SELECT status, retry_count, failure_explanation FROM workflows WHERE id='sr-r1';")[0];
  assert.equal(row.status, 'failed');
  assert.equal(row.retry_count, 2);
  assert.ok(row.failure_explanation.toLowerCase().includes('transient'));
});

test('simulateWorkflowRun: third run (retry 2 → 3) succeeds', () => {
  exec("DELETE FROM workflows WHERE id='sr-r2';");
  exec("INSERT INTO workflows VALUES ('sr-r2','Run2','manual','Agent','idle',0,2,5,'2026-01-01','','');");
  const res = simulateWorkflowRun('sr-r2');
  assert.equal(res.ok, true);
  assert.equal(res.success, true);
  const row = query("SELECT status, retry_count FROM workflows WHERE id='sr-r2';")[0];
  assert.equal(row.status, 'success');
  assert.equal(row.retry_count, 3);
});

test('simulateWorkflowRun: writes audit log on block', () => {
  exec("DELETE FROM workflows WHERE id='sr-ab';");
  exec("INSERT INTO workflows VALUES ('sr-ab','Audit Block','manual','Agent','idle',0,3,3,'2026-01-01','','');");
  simulateWorkflowRun('sr-ab');
  const logs = query("SELECT * FROM audit_logs WHERE entity_id='sr-ab' AND result='blocked' ORDER BY created_at DESC LIMIT 1;");
  assert.equal(logs.length, 1);
  assert.equal(logs[0].approved, 0);
  assert.equal(logs[0].action, 'simulate-run');
});

test('simulateWorkflowRun: writes audit log on successful run', () => {
  exec("DELETE FROM workflows WHERE id='sr-aok';");
  exec("INSERT INTO workflows VALUES ('sr-aok','Audit OK','manual','Agent','idle',0,0,3,'2026-01-01','','');");
  simulateWorkflowRun('sr-aok');
  const logs = query("SELECT * FROM audit_logs WHERE entity_id='sr-aok' ORDER BY created_at DESC LIMIT 1;");
  assert.equal(logs.length, 1);
  assert.equal(logs[0].approved, 1);
  assert.equal(logs[0].result, 'success');
});

test('simulateWorkflowRun: writes audit log on failed run', () => {
  exec("DELETE FROM workflows WHERE id='sr-afail';");
  exec("INSERT INTO workflows VALUES ('sr-afail','Audit Fail','manual','Agent','idle',0,1,3,'2026-01-01','','');");
  simulateWorkflowRun('sr-afail');
  const logs = query("SELECT * FROM audit_logs WHERE entity_id='sr-afail' ORDER BY created_at DESC LIMIT 1;");
  assert.equal(logs.length, 1);
  assert.equal(logs[0].approved, 1);
  assert.equal(logs[0].result, 'failed');
});

test('simulateWorkflowRun: log_output includes attempt number on success', () => {
  exec("DELETE FROM workflows WHERE id='sr-log';");
  exec("INSERT INTO workflows VALUES ('sr-log','Log Test','manual','Agent','idle',0,0,3,'2026-01-01','','');");
  simulateWorkflowRun('sr-log');
  const row = query("SELECT log_output FROM workflows WHERE id='sr-log';")[0];
  assert.ok(row.log_output.includes('1'), 'log_output should reference attempt number');
});

test('simulateWorkflowRun: blocked log_output mentions retry limit', () => {
  exec("DELETE FROM workflows WHERE id='sr-blog';");
  exec("INSERT INTO workflows VALUES ('sr-blog','Block Log','manual','Agent','idle',0,3,3,'2026-01-01','','');");
  simulateWorkflowRun('sr-blog');
  const row = query("SELECT log_output FROM workflows WHERE id='sr-blog';")[0];
  assert.ok(row.log_output.toLowerCase().includes('limit') || row.log_output.toLowerCase().includes('exceeded'));
});
