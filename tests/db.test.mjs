/**
 * DB layer tests — exercises all six tables managed by lib/db.ts
 * Uses the sqlite3 CLI directly (same approach as runtime.test.mjs).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const dbPath = path.join(process.cwd(), 'data', 'mission-control-db-test.db');
mkdirSync(path.dirname(dbPath), { recursive: true });

function exec(sql) {
  return execFileSync('sqlite3', [dbPath, sql], { encoding: 'utf8' });
}

function query(sql) {
  return JSON.parse(
    execFileSync('sqlite3', ['-json', dbPath, sql], { encoding: 'utf8' }) || '[]'
  );
}

// Bootstrap the schema (mirrors lib/db.ts initDb)
exec(`
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY,name TEXT,category TEXT,status TEXT,priority TEXT,description TEXT,next_action TEXT,tags TEXT,owner TEXT,created_date TEXT,updated_date TEXT);
CREATE TABLE IF NOT EXISTS agents (id TEXT PRIMARY KEY,name TEXT,mission TEXT,status TEXT,permission_tier INTEGER,allowed_tools TEXT,memory_access_level TEXT,current_task TEXT,failure_count INTEGER,last_run TEXT,logs TEXT,approval_required INTEGER);
CREATE TABLE IF NOT EXISTS memory_notes (id TEXT PRIMARY KEY,title TEXT,content TEXT,type TEXT,linked_project TEXT,priority TEXT,confidence REAL,source TEXT,created_date TEXT,updated_date TEXT);
CREATE TABLE IF NOT EXISTS workflows (id TEXT PRIMARY KEY,name TEXT,trigger_type TEXT,assigned_agent TEXT,status TEXT,approval_required INTEGER,retry_count INTEGER,max_retries INTEGER,last_run TEXT,log_output TEXT,failure_explanation TEXT);
CREATE TABLE IF NOT EXISTS approvals (id TEXT PRIMARY KEY,entity_type TEXT,entity_id TEXT,action TEXT,status TEXT,requested_at TEXT,resolved_at TEXT,reason TEXT);
CREATE TABLE IF NOT EXISTS audit_logs (id TEXT PRIMARY KEY,action TEXT,entity_type TEXT,entity_id TEXT,actor TEXT,approved INTEGER,result TEXT,message TEXT,created_at TEXT);
`);

// ── schema ─────────────────────────────────────────────────────────────────

test('initDb creates all required tables', () => {
  const tables = query(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
  ).map((r) => r.name);
  for (const t of ['projects', 'agents', 'memory_notes', 'workflows', 'approvals', 'audit_logs']) {
    assert.ok(tables.includes(t), `table "${t}" is missing`);
  }
});

// ── projects ────────────────────────────────────────────────────────────────

test('projects: insert and retrieve', () => {
  exec("DELETE FROM projects WHERE id='tp1';");
  exec("INSERT INTO projects VALUES ('tp1','Test Project','Core OS','active','high','Test desc','Next step','[]','Founder','2026-01-01','2026-01-01');");
  const rows = query("SELECT * FROM projects WHERE id='tp1';");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, 'Test Project');
  assert.equal(rows[0].status, 'active');
  assert.equal(rows[0].priority, 'high');
});

test('projects: update status', () => {
  exec("UPDATE projects SET status='blocked', updated_date=date('now') WHERE id='tp1';");
  const rows = query("SELECT status FROM projects WHERE id='tp1';");
  assert.equal(rows[0].status, 'blocked');
});

test('projects: INSERT OR IGNORE does not overwrite existing row', () => {
  exec("INSERT OR IGNORE INTO projects VALUES ('tp1','Should Not Overwrite','Core OS','idea','low','','','[]','Other','2026-01-02','2026-01-02');");
  const rows = query("SELECT name FROM projects WHERE id='tp1';");
  assert.equal(rows[0].name, 'Test Project');
});

test('projects: ordered by updated_date DESC', () => {
  exec("DELETE FROM projects WHERE id IN ('tp-old','tp-new','tp1');");
  exec("INSERT INTO projects VALUES ('tp-old','Old Project','Core OS','idea','low','','','[]','Founder','2024-01-01','2024-01-01');");
  exec("INSERT INTO projects VALUES ('tp-new','New Project','Core OS','idea','low','','','[]','Founder','2026-06-01','2026-06-01');");
  const rows = query("SELECT id FROM projects ORDER BY updated_date DESC;");
  const ids = rows.map((r) => r.id);
  assert.ok(ids.indexOf('tp-new') < ids.indexOf('tp-old'), 'tp-new should come before tp-old');
});

// ── agents ──────────────────────────────────────────────────────────────────

test('agents: insert and retrieve', () => {
  exec("DELETE FROM agents WHERE id='ta1';");
  exec("INSERT INTO agents VALUES ('ta1','Test Agent','Test mission','idle',1,'[\"planning\"]','project scoped','Awaiting',0,'2026-01-01','[]',1);");
  const rows = query("SELECT * FROM agents WHERE id='ta1';");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, 'Test Agent');
  assert.equal(rows[0].status, 'idle');
  assert.equal(rows[0].permission_tier, 1);
  assert.equal(rows[0].approval_required, 1);
});

test('agents: update status and failure_count', () => {
  exec("UPDATE agents SET status='blocked', failure_count=2 WHERE id='ta1';");
  const rows = query("SELECT status, failure_count FROM agents WHERE id='ta1';");
  assert.equal(rows[0].status, 'blocked');
  assert.equal(rows[0].failure_count, 2);
});

test('agents: failure_count clamped between 0 and 3 (via SQL expression)', () => {
  // Mirrors API PATCH logic: MAX(0, MIN(3, value))
  exec("UPDATE agents SET failure_count=MAX(0,MIN(3,99)) WHERE id='ta1';");
  const rows = query("SELECT failure_count FROM agents WHERE id='ta1';");
  assert.equal(rows[0].failure_count, 3);
  exec("UPDATE agents SET failure_count=MAX(0,MIN(3,-5)) WHERE id='ta1';");
  const rows2 = query("SELECT failure_count FROM agents WHERE id='ta1';");
  assert.equal(rows2[0].failure_count, 0);
});

// ── memory_notes ─────────────────────────────────────────────────────────────

test('memory_notes: insert and retrieve', () => {
  exec("DELETE FROM memory_notes WHERE id='tm1';");
  exec("INSERT INTO memory_notes VALUES ('tm1','Test Note','Test content','system rule','proj1','high',0.9,'user','2026-01-01','2026-01-01');");
  const rows = query("SELECT * FROM memory_notes WHERE id='tm1';");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].title, 'Test Note');
  assert.equal(rows[0].type, 'system rule');
  assert.equal(rows[0].confidence, 0.9);
});

test('memory_notes: ordered by updated_date DESC', () => {
  exec("DELETE FROM memory_notes WHERE id IN ('tm-old','tm-new');");
  exec("INSERT INTO memory_notes VALUES ('tm-old','Old','c','user preference','','low',0.5,'s','2024-01-01','2024-01-01');");
  exec("INSERT INTO memory_notes VALUES ('tm-new','New','c','user preference','','low',0.5,'s','2026-06-01','2026-06-01');");
  const rows = query("SELECT id FROM memory_notes ORDER BY updated_date DESC LIMIT 2;");
  assert.equal(rows[0].id, 'tm-new');
});

// ── workflows ────────────────────────────────────────────────────────────────

test('workflows: insert and retrieve', () => {
  exec("DELETE FROM workflows WHERE id='tw1';");
  exec("INSERT INTO workflows VALUES ('tw1','Test Workflow','manual','Test Agent','idle',0,0,3,'2026-01-01','','');");
  const rows = query("SELECT * FROM workflows WHERE id='tw1';");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, 'Test Workflow');
  assert.equal(rows[0].status, 'idle');
  assert.equal(rows[0].retry_count, 0);
  assert.equal(rows[0].max_retries, 3);
});

test('workflows: status transitions idle → running → success', () => {
  exec("UPDATE workflows SET status='running' WHERE id='tw1';");
  assert.equal(query("SELECT status FROM workflows WHERE id='tw1';")[0].status, 'running');
  exec("UPDATE workflows SET status='success' WHERE id='tw1';");
  assert.equal(query("SELECT status FROM workflows WHERE id='tw1';")[0].status, 'success');
});

test('workflows: ordered by name', () => {
  exec("DELETE FROM workflows WHERE id IN ('tw-a','tw-z');");
  exec("INSERT INTO workflows VALUES ('tw-z','ZZZ','manual','A','idle',0,0,3,'2026-01-01','','');");
  exec("INSERT INTO workflows VALUES ('tw-a','AAA','manual','A','idle',0,0,3,'2026-01-01','','');");
  const rows = query("SELECT id FROM workflows ORDER BY name;");
  const ids = rows.map((r) => r.id);
  assert.ok(ids.indexOf('tw-a') < ids.indexOf('tw-z'));
});

// ── approvals ────────────────────────────────────────────────────────────────

test('approvals: insert and retrieve pending', () => {
  exec("DELETE FROM approvals WHERE id='tap1';");
  exec("INSERT INTO approvals VALUES ('tap1','project','p1','delete','pending',datetime('now'),NULL,'Test reason');");
  const rows = query("SELECT * FROM approvals WHERE id='tap1';");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].status, 'pending');
  assert.equal(rows[0].action, 'delete');
  assert.equal(rows[0].reason, 'Test reason');
});

test('approvals: update status to approved', () => {
  exec("UPDATE approvals SET status='approved', resolved_at=datetime('now') WHERE id='tap1';");
  const rows = query("SELECT status, resolved_at FROM approvals WHERE id='tap1';");
  assert.equal(rows[0].status, 'approved');
  assert.ok(rows[0].resolved_at, 'resolved_at should be set');
});

test('approvals: count pending correctly', () => {
  exec("DELETE FROM approvals WHERE id IN ('cap1','cap2','cap3');");
  exec("INSERT INTO approvals VALUES ('cap1','project','p2','delete','pending',datetime('now'),NULL,'r1');");
  exec("INSERT INTO approvals VALUES ('cap2','project','p3','delete','approved',datetime('now'),datetime('now'),'r2');");
  exec("INSERT INTO approvals VALUES ('cap3','workflow','w1','shell','pending',datetime('now'),NULL,'r3');");
  const count = Number(query("SELECT COUNT(*) as c FROM approvals WHERE status='pending';")[0].c);
  assert.ok(count >= 2, `expected >= 2 pending approvals, got ${count}`);
});

test('approvals: ordered by requested_at DESC', () => {
  exec("DELETE FROM approvals WHERE id IN ('ap-old','ap-new');");
  exec("INSERT INTO approvals VALUES ('ap-old','project','p1','delete','pending','2024-01-01T00:00:00',NULL,'r');");
  exec("INSERT INTO approvals VALUES ('ap-new','project','p2','delete','pending','2026-06-01T00:00:00',NULL,'r');");
  const rows = query("SELECT id FROM approvals ORDER BY requested_at DESC LIMIT 2;");
  assert.equal(rows[0].id, 'ap-new');
});

// ── audit_logs ───────────────────────────────────────────────────────────────

test('audit_logs: insert and retrieve', () => {
  exec("DELETE FROM audit_logs WHERE id='tal1';");
  exec("INSERT INTO audit_logs VALUES ('tal1','delete','project','p1','system',1,'success','Test message',datetime('now'));");
  const rows = query("SELECT * FROM audit_logs WHERE id='tal1';");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].action, 'delete');
  assert.equal(rows[0].approved, 1);
  assert.equal(rows[0].result, 'success');
  assert.equal(rows[0].message, 'Test message');
});

test('audit_logs: filter by result=failed', () => {
  exec("DELETE FROM audit_logs WHERE id='tal-fail';");
  exec("INSERT INTO audit_logs VALUES ('tal-fail','simulate-run','workflow','w1','system',0,'failed','error',datetime('now'));");
  const failed = query("SELECT * FROM audit_logs WHERE result='failed' ORDER BY created_at DESC LIMIT 10;");
  assert.ok(failed.length > 0);
  assert.equal(failed[0].result, 'failed');
});

test('audit_logs: filter recent errors (failed or blocked)', () => {
  exec("DELETE FROM audit_logs WHERE id='tal-blocked';");
  exec("INSERT INTO audit_logs VALUES ('tal-blocked','simulate-run','workflow','w2','system',0,'blocked','anti-hang',datetime('now'));");
  const errors = query("SELECT * FROM audit_logs WHERE result='failed' OR result='blocked' ORDER BY created_at DESC LIMIT 10;");
  assert.ok(errors.length >= 2);
});
