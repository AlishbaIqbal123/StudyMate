import { DatabaseSync } from 'node:sqlite';
import * as path from 'node:path';
import * as fs from 'node:fs';

let dbInstance: DatabaseSync | null = null;

export function getDatabasePath(): string {
  // If set in environment, use that
  if (process.env.DATABASE_PATH) {
    return path.resolve(process.cwd(), process.env.DATABASE_PATH);
  }

  // In Vercel serverless environment, the only writable location is /tmp
  if (process.env.VERCEL) {
    return '/tmp/studymate.db';
  }

  // Look for studymate.db in workspace root or current directory
  const rootCandidate = path.resolve(__dirname, '../../../studymate.db');
  return rootCandidate;
}

export function getDb(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = getDatabasePath();
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const isNew = !fs.existsSync(dbPath);
  dbInstance = new DatabaseSync(dbPath);
  // Enable foreign keys and write-ahead logging
  dbInstance.exec('PRAGMA foreign_keys = ON;');
  dbInstance.exec('PRAGMA journal_mode = WAL;');

  // If newly created on Vercel or local, auto-bootstrap schema
  if (isNew) {
    try {
      import('./init.js').then((m) => {
        m.initializeDatabase();
        import('./seed.js').then((s) => s.seedDatabase()).catch(() => {});
      }).catch(() => {});
    } catch {
      // ignore
    }
  }

  return dbInstance;
}

export function closeDb(): void {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {
      // ignore
    }
    dbInstance = null;
  }
}
