import fs from 'fs';
import path from 'path';

// The e2e backend, started by playwright.config's webServer. It builds its database from
// scratch on every run — drop last run's file, seed the corpus from source — and only then
// boots the server. Seeding rather than copying packages/backend/signi.db keeps the words
// the specs assert on reproducible, and leaves saved_phrases empty so the save/load spec
// starts from a known-empty list.
//
// This is a command rather than a Playwright globalSetup because webServer starts *before*
// globalSetup runs, so the database has to exist by the time this process opens it.
async function main(): Promise<void> {
  const dbPath = process.env['SIGNI_DB_PATH'];
  if (!dbPath) throw new Error('SIGNI_DB_PATH is required — refusing to touch the dev database');

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  for (const suffix of ['', '-wal', '-shm']) {
    fs.rmSync(`${dbPath}${suffix}`, { force: true });
  }

  // Both modules do their work on import: seed populates the (freshly created) database,
  // then index opens the same singleton connection and listens.
  await import('../packages/backend/src/seed.ts');
  await import('../packages/backend/src/index.ts');
}

void main();
