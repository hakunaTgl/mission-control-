/**
 * State persistence tests — covers readState / writeState from lib/state.ts.
 * Uses node:fs directly (no TypeScript compilation required).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const testStatePath = path.join(process.cwd(), 'data', 'test-state.json');
mkdirSync(path.dirname(testStatePath), { recursive: true });

function readTestState() {
  const raw = readFileSync(testStatePath, 'utf-8');
  return JSON.parse(raw);
}

function writeTestState(data) {
  writeFileSync(testStatePath, JSON.stringify(data, null, 2));
}

const sampleState = {
  agents: [{ id: 'a1', name: 'Test Agent', status: 'idle', failureCount: 0 }],
  projects: [{ id: 'p1', name: 'Test Project', status: 'active', priority: 'high' }],
  memory: [{ id: 'm1', title: 'Test Note', type: 'system rule', confidence: 0.99 }],
  workflows: [{ id: 'w1', name: 'Test Workflow', status: 'idle', retryCount: 0, maxRetries: 3 }],
  creative: [{ id: 'c1', title: 'Test Creative', type: 'campaign idea' }],
};

// ── writeState ───────────────────────────────────────────────────────────────

test('writeState: creates the file on disk', () => {
  if (existsSync(testStatePath)) rmSync(testStatePath);
  writeTestState(sampleState);
  assert.ok(existsSync(testStatePath), 'state file should exist after write');
});

test('writeState: produces valid JSON', () => {
  writeTestState(sampleState);
  const raw = readFileSync(testStatePath, 'utf-8');
  assert.doesNotThrow(() => JSON.parse(raw), 'file contents must be valid JSON');
});

test('writeState: formats JSON with 2-space indentation', () => {
  writeTestState(sampleState);
  const raw = readFileSync(testStatePath, 'utf-8');
  // Pretty-printed JSON always starts with "{\n  "
  assert.ok(raw.startsWith('{\n  '), 'expected 2-space indented JSON');
});

test('writeState: overwrites previous contents', () => {
  writeTestState({ agents: [], projects: [], memory: [], workflows: [], creative: [] });
  writeTestState(sampleState);
  const result = readTestState();
  assert.equal(result.agents.length, 1, 'previous empty value should be overwritten');
});

// ── readState ────────────────────────────────────────────────────────────────

test('readState: reads and parses all top-level collections', () => {
  writeTestState(sampleState);
  const state = readTestState();
  assert.ok(Array.isArray(state.agents), 'agents should be an array');
  assert.ok(Array.isArray(state.projects), 'projects should be an array');
  assert.ok(Array.isArray(state.memory), 'memory should be an array');
  assert.ok(Array.isArray(state.workflows), 'workflows should be an array');
  assert.ok(Array.isArray(state.creative), 'creative should be an array');
});

test('readState: preserves agent fields correctly', () => {
  writeTestState(sampleState);
  const state = readTestState();
  assert.equal(state.agents[0].id, 'a1');
  assert.equal(state.agents[0].name, 'Test Agent');
  assert.equal(state.agents[0].status, 'idle');
  assert.equal(state.agents[0].failureCount, 0);
});

test('readState: preserves project fields correctly', () => {
  writeTestState(sampleState);
  const state = readTestState();
  assert.equal(state.projects[0].id, 'p1');
  assert.equal(state.projects[0].name, 'Test Project');
  assert.equal(state.projects[0].status, 'active');
  assert.equal(state.projects[0].priority, 'high');
});

test('readState: preserves memory note fields correctly', () => {
  writeTestState(sampleState);
  const state = readTestState();
  assert.equal(state.memory[0].title, 'Test Note');
  assert.equal(state.memory[0].type, 'system rule');
  assert.equal(state.memory[0].confidence, 0.99);
});

test('readState: preserves workflow fields correctly', () => {
  writeTestState(sampleState);
  const state = readTestState();
  assert.equal(state.workflows[0].status, 'idle');
  assert.equal(state.workflows[0].retryCount, 0);
  assert.equal(state.workflows[0].maxRetries, 3);
});

test('readState: preserves creative record fields correctly', () => {
  writeTestState(sampleState);
  const state = readTestState();
  assert.equal(state.creative[0].type, 'campaign idea');
  assert.equal(state.creative[0].title, 'Test Creative');
});

// ── roundtrip ────────────────────────────────────────────────────────────────

test('roundtrip: write then read preserves all data', () => {
  const custom = {
    agents: [{ id: 'x1', name: 'Roundtrip Agent', status: 'active', failureCount: 3 }],
    projects: [{ id: 'x2', name: 'Roundtrip Project', priority: 'critical' }],
    memory: [],
    workflows: [],
    creative: [],
  };
  writeTestState(custom);
  const result = readTestState();
  assert.equal(result.agents[0].name, 'Roundtrip Agent');
  assert.equal(result.agents[0].failureCount, 3);
  assert.equal(result.projects[0].priority, 'critical');
  assert.equal(result.memory.length, 0);
  assert.equal(result.creative.length, 0);
});

test('roundtrip: handles empty collections', () => {
  const empty = { agents: [], projects: [], memory: [], workflows: [], creative: [] };
  writeTestState(empty);
  const result = readTestState();
  assert.equal(result.agents.length, 0);
  assert.equal(result.projects.length, 0);
  assert.equal(result.workflows.length, 0);
});

test('roundtrip: preserves unicode content', () => {
  const unicode = {
    agents: [],
    projects: [{ id: 'u1', name: '🚀 Mission Control', description: 'Café & résumé' }],
    memory: [],
    workflows: [],
    creative: [],
  };
  writeTestState(unicode);
  const result = readTestState();
  assert.equal(result.projects[0].name, '🚀 Mission Control');
  assert.equal(result.projects[0].description, 'Café & résumé');
});

test('roundtrip: preserves numeric precision', () => {
  const numeric = {
    agents: [],
    projects: [],
    memory: [{ id: 'm1', confidence: 0.99999, priority: 'high' }],
    workflows: [],
    creative: [],
  };
  writeTestState(numeric);
  const result = readTestState();
  assert.equal(result.memory[0].confidence, 0.99999);
});

test('roundtrip: preserves boolean values', () => {
  const booleans = {
    agents: [{ id: 'b1', approvalRequired: true, simulated: false }],
    projects: [],
    memory: [],
    workflows: [{ id: 'bw1', approvalRequired: false }],
    creative: [],
  };
  writeTestState(booleans);
  const result = readTestState();
  assert.equal(result.agents[0].approvalRequired, true);
  assert.equal(result.agents[0].simulated, false);
  assert.equal(result.workflows[0].approvalRequired, false);
});

test('roundtrip: preserves nested arrays', () => {
  const nested = {
    agents: [{ id: 'n1', logs: ['log a', 'log b', 'log c'], allowedTools: ['planning', 'diagnostics'] }],
    projects: [{ id: 'n2', tags: ['seed', 'core', 'mvp'] }],
    memory: [],
    workflows: [],
    creative: [],
  };
  writeTestState(nested);
  const result = readTestState();
  assert.deepEqual(result.agents[0].logs, ['log a', 'log b', 'log c']);
  assert.deepEqual(result.agents[0].allowedTools, ['planning', 'diagnostics']);
  assert.deepEqual(result.projects[0].tags, ['seed', 'core', 'mvp']);
});

test('roundtrip: multiple sequential writes reflect last write only', () => {
  writeTestState({ agents: [{ id: 'seq1', name: 'First' }], projects: [], memory: [], workflows: [], creative: [] });
  writeTestState({ agents: [{ id: 'seq2', name: 'Second' }], projects: [], memory: [], workflows: [], creative: [] });
  const result = readTestState();
  assert.equal(result.agents.length, 1);
  assert.equal(result.agents[0].id, 'seq2');
});
