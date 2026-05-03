import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const dbPath = path.join(process.cwd(), 'data', 'mission-control-test.db');
mkdirSync(path.dirname(dbPath), { recursive: true });

function exec(sql){ return execFileSync('sqlite3',[dbPath,sql],{encoding:'utf8'}); }
function query(sql){ return JSON.parse(execFileSync('sqlite3',['-json',dbPath,sql],{encoding:'utf8'}) || '[]'); }

function simulateWorkflowRun(id){
  const rows = query(`SELECT * FROM workflows WHERE id='${id}' LIMIT 1;`);
  if(!rows.length) return {ok:false,error:'not found'};
  const wf = rows[0];
  if (wf.retry_count >= 3 || wf.retry_count >= wf.max_retries) {
    exec(`UPDATE workflows SET status='blocked', failure_explanation='Blocked by anti-hang guard' WHERE id='${id}';`);
    return {ok:false,blocked:true};
  }
  return {ok:true};
}

exec(`CREATE TABLE IF NOT EXISTS workflows (id TEXT PRIMARY KEY,name TEXT,trigger_type TEXT,assigned_agent TEXT,status TEXT,approval_required INTEGER,retry_count INTEGER,max_retries INTEGER,last_run TEXT,log_output TEXT,failure_explanation TEXT);`);
exec("DELETE FROM workflows WHERE id='wt';");
exec("INSERT INTO workflows VALUES ('wt','t','manual','Diagnostics Agent','idle',0,3,3,datetime('now'),'','');");

test('anti-hang blocks when retries exceeded', () => {
  const res = simulateWorkflowRun('wt');
  assert.equal(res.ok, false);
  const row = query("SELECT status FROM workflows WHERE id='wt';")[0];
  assert.equal(row.status, 'blocked');
});
