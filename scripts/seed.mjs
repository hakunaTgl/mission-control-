import { mkdirSync, writeFileSync } from 'node:fs';
mkdirSync('data', { recursive: true });
writeFileSync('data/seed-status.json', JSON.stringify({ seededAt: new Date().toISOString() }, null, 2));
console.log('Seed complete');
