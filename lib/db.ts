import { execFileSync } from "child_process";
import { mkdirSync, existsSync } from "fs";
import path from "path";

const dbDir = path.join(process.cwd(), "data");
const dbPath = path.join(dbDir, "mission-control.db");

function runSql(sql: string): string {
  mkdirSync(dbDir, { recursive: true });
  return execFileSync("sqlite3", [dbPath, sql], { encoding: "utf8" });
}

export function initDb() {
  runSql(`
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY,name TEXT,category TEXT,status TEXT,priority TEXT,description TEXT,next_action TEXT,tags TEXT,owner TEXT,created_date TEXT,updated_date TEXT);
CREATE TABLE IF NOT EXISTS agents (id TEXT PRIMARY KEY,name TEXT,mission TEXT,status TEXT,permission_tier INTEGER,allowed_tools TEXT,memory_access_level TEXT,current_task TEXT,failure_count INTEGER,last_run TEXT,logs TEXT,approval_required INTEGER);
CREATE TABLE IF NOT EXISTS memory_notes (id TEXT PRIMARY KEY,title TEXT,content TEXT,type TEXT,linked_project TEXT,priority TEXT,confidence REAL,source TEXT,created_date TEXT,updated_date TEXT);
CREATE TABLE IF NOT EXISTS workflows (id TEXT PRIMARY KEY,name TEXT,trigger_type TEXT,assigned_agent TEXT,status TEXT,approval_required INTEGER,retry_count INTEGER,max_retries INTEGER,last_run TEXT,log_output TEXT,failure_explanation TEXT);
CREATE TABLE IF NOT EXISTS approvals (id TEXT PRIMARY KEY,entity_type TEXT,entity_id TEXT,action TEXT,status TEXT,requested_at TEXT,resolved_at TEXT,reason TEXT);
CREATE TABLE IF NOT EXISTS audit_logs (id TEXT PRIMARY KEY,action TEXT,entity_type TEXT,entity_id TEXT,actor TEXT,approved INTEGER,result TEXT,message TEXT,created_at TEXT);
`);
}

export function queryJson(sql: string): unknown[] {
  const out = runSql(`.mode json\n${sql}`);
  try { return JSON.parse(out || "[]"); } catch { return []; }
}

export function execSql(sql: string) { runSql(sql); }
export function getDbPath() { return dbPath; }
export function dbExists() { return existsSync(dbPath); }
