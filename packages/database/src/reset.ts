import * as fs from 'node:fs';
import { getDatabasePath, closeDb } from './db.js';
import { seedDatabase } from './seed.js';

export function resetDatabase(): void {
  closeDb();
  const dbPath = getDatabasePath();

  if (fs.existsSync(dbPath)) {
    try {
      fs.unlinkSync(dbPath);
      console.log(`🗑️ Removed existing database file: ${dbPath}`);
    } catch {
      // ignore
    }
  }

  // Also remove WAL / SHM files if any
  if (fs.existsSync(`${dbPath}-wal`)) fs.unlinkSync(`${dbPath}-wal`);
  if (fs.existsSync(`${dbPath}-shm`)) fs.unlinkSync(`${dbPath}-shm`);

  seedDatabase();
  console.log('🔄 Database reset and reseeded fresh.');
}

if (process.argv[1]?.endsWith('reset.ts') || process.argv[1]?.endsWith('reset.js')) {
  resetDatabase();
}
