import * as fs from 'node:fs';
import * as path from 'node:path';
import { getDb } from './db.js';

export function initializeDatabase(): void {
  const db = getDb();
  const schemaPath = path.resolve(__dirname, '../schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

  db.exec(schemaSql);
  console.log('✅ StudyMate SQLite database initialized successfully.');
}

if (process.argv[1]?.endsWith('init.ts') || process.argv[1]?.endsWith('init.js')) {
  initializeDatabase();
}
