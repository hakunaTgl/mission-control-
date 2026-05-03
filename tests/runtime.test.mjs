import test from 'node:test';
import assert from 'node:assert/strict';
import { initDb, execSql, queryJson } from '../lib/db.ts';
import { simulateWorkflowRun } from '../lib/runtime.ts';

initDb();
execSql("DELETE FROM workflows WHERE id='wt';");
execSql("INSERT INTO workflows VALUES ('wt','t','manual','Diagnostics Agent','idle',0,3,3,datetime('now'),'','');");

test('anti-hang blocks when retries exceeded', () => {
  const res = simulateWorkflowRun('wt');
  assert.equal(res.ok, false);
  const row = queryJson("SELECT status FROM workflows WHERE id='wt';")[0];
  assert.equal(row.status, 'blocked');
});
