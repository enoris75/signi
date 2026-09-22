import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import Database from 'better-sqlite3';
import fs from 'fs';
import os from 'os';
import path from 'path';

// db.ts reads SIGNI_DB_PATH and holds its connection when first imported, so each test takes a
// fresh copy of the module after pointing the variable where it wants.
async function openDb(dbPath: string): Promise<Database.Database> {
  vi.stubEnv('SIGNI_DB_PATH', dbPath);
  vi.resetModules();
  const { getDb } = await import('./db.js');
  return getDb();
}

const tables = (db: Database.Database): string[] =>
  db
    .prepare<[], { name: string }>("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all()
    .map((r) => r.name);

const columns = (db: Database.Database, table: string): string[] =>
  db.prepare<[], { name: string }>(`PRAGMA table_info(${table})`).all().map((c) => c.name);

let tmp: string;
const opened: Database.Database[] = [];

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'signi-db-test-'));
});

afterEach(() => {
  for (const db of opened.splice(0)) if (db.open) db.close();
  vi.unstubAllEnvs();
  fs.rmSync(tmp, { recursive: true, force: true });
});

async function track(dbPath: string): Promise<Database.Database> {
  const db = await openDb(dbPath);
  opened.push(db);
  return db;
}

describe('getDb', () => {
  test('returns one shared connection', async () => {
    vi.resetModules();
    const { getDb } = await import('./db.js');
    const db = getDb();
    opened.push(db);
    expect(getDb()).toBe(db);
  });

  test('opens the database at SIGNI_DB_PATH', async () => {
    const file = path.join(tmp, 'signi.db');
    const db = await track(file);
    expect(db.name).toBe(file);
    expect(fs.existsSync(file)).toBe(true);
  });

  test('writes ahead and enforces foreign keys', async () => {
    const db = await track(path.join(tmp, 'signi.db'));
    expect(db.pragma('journal_mode', { simple: true })).toBe('wal');
    expect(db.pragma('foreign_keys', { simple: true })).toBe(1);
  });

  test('creates the whole schema on an empty database', async () => {
    const db = await track(':memory:');
    const roles = ['verb', 'noun', 'pronoun', 'adjective', 'adverb'];
    expect(tables(db)).toEqual(
      [
        'semantic_concepts',
        'concept_definitions',
        'concept_relations',
        'saved_phrases',
        ...roles.flatMap((r) => [`${r}_lexemes`, `${r}_forms`, `concept_${r}_links`, `${r}_relations`]),
      ].sort(),
    );
  });

  test('opens an existing database without rebuilding it', async () => {
    const file = path.join(tmp, 'signi.db');
    const first = await track(file);
    first
      .prepare("INSERT INTO semantic_concepts (id, role, description) VALUES ('CAT', 'noun', 'a cat')")
      .run();
    first.close();

    const second = await track(file);
    expect(second.prepare('SELECT id FROM semantic_concepts').all()).toEqual([{ id: 'CAT' }]);
  });
});

describe('schema', () => {
  let db: Database.Database;

  beforeEach(async () => {
    db = await track(':memory:');
  });

  const insertConcept = (id: string, role = 'noun') =>
    db.prepare('INSERT INTO semantic_concepts (id, role, description) VALUES (?, ?, ?)').run(id, role, id);

  test('defaults a concept to countable and to every other flag off', () => {
    insertConcept('CAT');
    expect(
      db.prepare('SELECT animate, human, countable, modal, proper, temporal, transient, alarm, alarm_cry FROM semantic_concepts').get(),
    ).toEqual({ animate: 0, human: 0, countable: 1, modal: 0, proper: 0, temporal: 0, transient: 0, alarm: 0, alarm_cry: 0 });
  });

  test('rejects a role outside the five grammatical roles', () => {
    expect(() => insertConcept('THE', 'article')).toThrow(/CHECK constraint failed/);
  });

  test('rejects a language outside the seven supported', () => {
    expect(() =>
      db.prepare("INSERT INTO verb_lexemes (language, lemma) VALUES ('nl', 'eten')").run(),
    ).toThrow(/CHECK constraint failed/);
  });

  test('allows a concept one hypernym only', () => {
    for (const id of ['CARAVEL', 'SHIP', 'VEHICLE']) insertConcept(id);
    const addHypernym = db.prepare(
      "INSERT INTO concept_relations (concept_a_id, concept_b_id, relation) VALUES (?, ?, 'hypernym')",
    );
    addHypernym.run('CARAVEL', 'SHIP');
    expect(() => addHypernym.run('CARAVEL', 'VEHICLE')).toThrow(/UNIQUE constraint failed/);
  });

  test('rejects a concept as its own hypernym', () => {
    insertConcept('SHIP');
    expect(() =>
      db
        .prepare("INSERT INTO concept_relations (concept_a_id, concept_b_id, relation) VALUES ('SHIP', 'SHIP', 'hypernym')")
        .run(),
    ).toThrow(/CHECK constraint failed/);
  });

  test('rejects a hypernym naming an unknown concept', () => {
    insertConcept('CARAVEL');
    expect(() =>
      db
        .prepare("INSERT INTO concept_relations (concept_a_id, concept_b_id, relation) VALUES ('CARAVEL', 'SHIP', 'hypernym')")
        .run(),
    ).toThrow(/FOREIGN KEY constraint failed/);
  });

  test('deleting a concept cascades to its links, definitions and relations', () => {
    insertConcept('CAT');
    insertConcept('ANIMAL');
    const lexemeId = db
      .prepare("INSERT INTO noun_lexemes (language, singular) VALUES ('en', 'cat')")
      .run().lastInsertRowid;
    db.prepare('INSERT INTO concept_noun_links (concept_id, lexeme_id) VALUES (?, ?)').run('CAT', lexemeId);
    db.prepare("INSERT INTO concept_definitions (concept_id, language, definition) VALUES ('CAT', 'en', 'a cat')").run();
    db.prepare("INSERT INTO concept_relations (concept_a_id, concept_b_id, relation) VALUES ('CAT', 'ANIMAL', 'hypernym')").run();

    db.prepare("DELETE FROM semantic_concepts WHERE id = 'CAT'").run();

    expect(db.prepare('SELECT COUNT(*) AS n FROM concept_noun_links').get()).toEqual({ n: 0 });
    expect(db.prepare('SELECT COUNT(*) AS n FROM concept_definitions').get()).toEqual({ n: 0 });
    expect(db.prepare('SELECT COUNT(*) AS n FROM concept_relations').get()).toEqual({ n: 0 });
    // The lexeme is not owned by the concept; only its link goes.
    expect(db.prepare('SELECT COUNT(*) AS n FROM noun_lexemes').get()).toEqual({ n: 1 });
  });

  test('deleting a lexeme cascades to its forms', () => {
    const lexemeId = db.prepare("INSERT INTO verb_lexemes (language, lemma) VALUES ('en', 'eat')").run().lastInsertRowid;
    db.prepare("INSERT INTO verb_forms (lexeme_id, form_key, form_value) VALUES (?, 'past', 'ate')").run(lexemeId);
    db.prepare('DELETE FROM verb_lexemes').run();
    expect(db.prepare('SELECT COUNT(*) AS n FROM verb_forms').get()).toEqual({ n: 0 });
  });

  test('stores one value per form key of a lexeme', () => {
    const lexemeId = db.prepare("INSERT INTO verb_lexemes (language, lemma) VALUES ('en', 'eat')").run().lastInsertRowid;
    const addForm = db.prepare("INSERT INTO verb_forms (lexeme_id, form_key, form_value) VALUES (?, 'past', ?)");
    addForm.run(lexemeId, 'ate');
    expect(() => addForm.run(lexemeId, 'eated')).toThrow(/UNIQUE constraint failed/);
  });

  test('defaults a saved phrase to a whole-workspace phrase by the system author', () => {
    db.prepare(
      "INSERT INTO saved_phrases (id, name, version, payload, created_at, updated_at) VALUES ('p1', 'n', 6, '{}', 't', 't')",
    ).run();
    expect(db.prepare('SELECT kind, author FROM saved_phrases').get()).toEqual({ kind: 'phrase', author: 'system' });
  });
});

describe('migrations', () => {
  // The shape of a database created before the concept flags and the saved-phrase kind existed.
  function legacyDatabase(file: string): void {
    const legacy = new Database(file);
    legacy.exec(`
      CREATE TABLE semantic_concepts (
        id           TEXT PRIMARY KEY,
        role         TEXT NOT NULL,
        description  TEXT NOT NULL,
        emoji        TEXT,
        transitivity TEXT
      );
      INSERT INTO semantic_concepts (id, role, description) VALUES ('WATER', 'noun', 'a clear liquid');
      CREATE TABLE saved_phrases (
        id         TEXT PRIMARY KEY,
        name       TEXT NOT NULL,
        author     TEXT NOT NULL DEFAULT 'system',
        version    INTEGER NOT NULL,
        payload    TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      INSERT INTO saved_phrases (id, name, version, payload, created_at, updated_at)
        VALUES ('old', 'an old save', 1, '{}', '2024-01-01', '2024-01-01');
    `);
    legacy.close();
  }

  test('adds the concept columns a database predates, defaulting existing rows', async () => {
    const file = path.join(tmp, 'legacy.db');
    legacyDatabase(file);

    const db = await track(file);

    expect(columns(db, 'semantic_concepts')).toEqual([
      'id', 'role', 'description', 'emoji', 'transitivity',
      'complements', 'animate', 'human', 'synonym', 'countable', 'modal', 'slot', 'proper',
      'manner_relation', 'dimension_relation', 'temporal', 'transient', 'alarm', 'alarm_cry', 'stative', 'sense_of',
    ]);
    expect(db.prepare("SELECT * FROM semantic_concepts WHERE id = 'WATER'").get()).toEqual({
      id: 'WATER', role: 'noun', description: 'a clear liquid', emoji: null, transitivity: null,
      complements: null, animate: 0, human: 0, synonym: null, countable: 1, modal: 0, slot: null, proper: 0,
      manner_relation: null, dimension_relation: null, temporal: 0, transient: 0, alarm: 0, alarm_cry: 0, stative: 0, sense_of: null,
    });
  });

  test('keeps the checks on the columns it adds', async () => {
    const file = path.join(tmp, 'legacy.db');
    legacyDatabase(file);
    const db = await track(file);
    expect(() => db.prepare("UPDATE semantic_concepts SET manner_relation = 'speed'").run()).toThrow(
      /CHECK constraint failed/,
    );
    expect(() => db.prepare('UPDATE semantic_concepts SET temporal = 2').run()).toThrow(/CHECK constraint failed/);
  });

  test('backfills an existing saved phrase as a whole-workspace phrase', async () => {
    const file = path.join(tmp, 'legacy.db');
    legacyDatabase(file);

    const db = await track(file);

    expect(columns(db, 'saved_phrases')).toContain('kind');
    expect(db.prepare("SELECT kind FROM saved_phrases WHERE id = 'old'").get()).toEqual({ kind: 'phrase' });
  });

  test('migrates once: reopening a migrated database changes nothing', async () => {
    const file = path.join(tmp, 'legacy.db');
    legacyDatabase(file);
    const first = await track(file);
    const before = columns(first, 'semantic_concepts');
    first.close();

    const second = await track(file);
    expect(columns(second, 'semantic_concepts')).toEqual(before);
  });
});
