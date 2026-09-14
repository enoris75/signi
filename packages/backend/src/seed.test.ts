import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type Database from 'better-sqlite3';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { LANGUAGES } from '@signi/shared';
import { concepts, NONFINITE } from './concepts/index.js';
import type { ConceptSeed } from './concepts/types.js';
import { getDb } from './db.js';
// The seed does its work on import, into this file's in-memory database (see vitest.config.ts).
import './seed.js';

const LANGUAGE_COUNT = Object.keys(LANGUAGES).length;
const ROLES = ['pronoun', 'noun', 'verb', 'adjective', 'adverb'] as const;

const count = (db: Database.Database, sql: string, ...params: unknown[]): number =>
  (db.prepare(sql).get(...params) as { n: number }).n;

/** Every form row of a concept's primary lexeme in one language, as a map. */
function storedForms(db: Database.Database, role: string, conceptId: string, language: string): Record<string, string> {
  const rows = db
    .prepare<[string, string], { form_key: string; form_value: string }>(`
      SELECT f.form_key, f.form_value FROM ${role}_forms f
      JOIN ${role}_lexemes l ON l.id = f.lexeme_id
      JOIN concept_${role}_links k ON k.lexeme_id = l.id
      WHERE k.concept_id = ? AND l.language = ?`)
    .all(conceptId, language);
  return Object.fromEntries(rows.map((r) => [r.form_key, r.form_value]));
}

describe('seeding the corpus', () => {
  const db = getDb();

  test('stores one concept row per seed', () => {
    expect(count(db, 'SELECT COUNT(*) AS n FROM semantic_concepts')).toBe(concepts.length);
  });

  test('maps a seed\'s optional fields and flags onto concept columns', () => {
    const row = (id: string) => db.prepare('SELECT * FROM semantic_concepts WHERE id = ?').get(id);

    expect(row('CUT')).toMatchObject({
      role: 'verb',
      transitivity: 'transitive',
      complements: 'manner,instrumental,terminus,cause,locative',
      emoji: '✂️',
      modal: 0,
    });
    expect(row('MUST')).toMatchObject({ transitivity: null, complements: null, modal: 1 });
    expect(row('WATER')).toMatchObject({ countable: 0 });
    expect(row('CAT')).toMatchObject({ countable: 1, animate: 1, human: 0, synonym: null });
    expect(row('PERSON')).toMatchObject({ animate: 1, human: 1 });
    expect(row('AFRICA')).toMatchObject({ proper: 1 });
    expect(row('SPEED')).toMatchObject({ manner_relation: 'measure', dimension_relation: null });
    expect(row('SIZE')).toMatchObject({ manner_relation: null, dimension_relation: 'extent' });
    expect(row('TIRED')).toMatchObject({ transient: 1 });
    expect(row('WOLF')).toMatchObject({ alarm: 1 });
    expect(row('HAVE')).toMatchObject({ stative: 1, sense_of: null });
    expect(row('EAT')).toMatchObject({ stative: 0, sense_of: null });
    expect(row('KNOW_ACQUAINTED')).toMatchObject({ stative: 1, sense_of: 'KNOW' });
    expect(row('GENERIC_PERSON')).toMatchObject({ synonym: 'one' });
  });

  test('stores each description as the concept\'s English definition, and no other language', () => {
    const rows = db
      .prepare<[], { concept_id: string; language: string; definition: string }>('SELECT * FROM concept_definitions')
      .all();
    expect(rows).toHaveLength(concepts.length);
    expect(rows.filter((r) => r.language !== 'en')).toEqual([]);
    const byId = new Map(rows.map((r) => [r.concept_id, r.definition]));
    expect(concepts.filter((c) => byId.get(c.id) !== c.description).map((c) => c.id)).toEqual([]);
  });

  test.each(ROLES)('links every %s to one primary lexeme per language', (role) => {
    const seeds = concepts.filter((c) => c.role === role);
    expect(count(db, `SELECT COUNT(*) AS n FROM ${role}_lexemes`)).toBe(seeds.length * LANGUAGE_COUNT);
    expect(count(db, `SELECT COUNT(*) AS n FROM concept_${role}_links WHERE is_primary = 1`)).toBe(
      seeds.length * LANGUAGE_COUNT,
    );
  });

  test('keeps a noun\'s singular, plural and gender in columns, not as form rows', () => {
    expect(
      db
        .prepare(`
          SELECT nl.singular, nl.plural, nl.gender FROM noun_lexemes nl
          JOIN concept_noun_links cnl ON cnl.lexeme_id = nl.id
          WHERE cnl.concept_id = 'CAT' AND nl.language = 'it'`)
        .get(),
    ).toEqual({ singular: 'gatto', plural: 'gatti', gender: 'masc' });
    expect(storedForms(db, 'noun', 'CAT', 'it')).toEqual({ count: 'singular', fem: 'gatta', fem_plural: 'gatte' });
    expect(count(db, "SELECT COUNT(*) AS n FROM noun_forms WHERE form_key IN ('base', 'plural', 'gender')")).toBe(0);
  });

  test('keeps a pronoun\'s person, number and gender in columns, and its base as a form row', () => {
    expect(
      db
        .prepare(`
          SELECT pl.lemma, pl.person, pl.number, pl.gender FROM pronoun_lexemes pl
          JOIN concept_pronoun_links cpl ON cpl.lexeme_id = pl.id
          WHERE cpl.concept_id = 'THIRD_PERSON' AND pl.language = 'en'`)
        .get(),
    ).toEqual({ lemma: 'he', person: '3', number: 'singular', gender: 'masc' });
    expect(storedForms(db, 'pronoun', 'THIRD_PERSON', 'en')).toMatchObject({ base: 'he', singular_fem: 'she' });
    expect(count(db, "SELECT COUNT(*) AS n FROM pronoun_forms WHERE form_key IN ('person', 'number', 'gender')")).toBe(0);
  });

  test.each(['verb', 'adjective', 'adverb'])('stores a %s\'s lemma as its base form row too', (role) => {
    const mismatched = count(
      db,
      `SELECT COUNT(*) AS n FROM ${role}_lexemes l
       LEFT JOIN ${role}_forms f ON f.lexeme_id = l.id AND f.form_key = 'base'
       WHERE f.form_value IS NOT l.lemma`,
    );
    expect(mismatched).toBe(0);
  });

  test('folds every non-finite form into its verb\'s forms', () => {
    const missing = Object.entries(NONFINITE).flatMap(([id, byLanguage]) =>
      Object.entries(byLanguage).flatMap(([language, forms]) => {
        const stored = storedForms(db, 'verb', id, language);
        return Object.entries(forms)
          .filter(([key, value]) => stored[key] !== value)
          .map(([key]) => `${id}:${language}:${key}`);
      }),
    );
    expect(missing).toEqual([]);
  });

  test('stores every isA as a hypernym relation', () => {
    const rows = db
      .prepare<[], { concept_a_id: string; concept_b_id: string }>(
        "SELECT concept_a_id, concept_b_id FROM concept_relations WHERE relation = 'hypernym' ORDER BY concept_a_id",
      )
      .all();
    const expected = concepts
      .filter((c) => c.isA)
      .map((c) => ({ concept_a_id: c.id, concept_b_id: c.isA }))
      .sort((a, b) => a.concept_a_id.localeCompare(b.concept_a_id));
    expect(rows).toEqual(expected);
  });
});

describe('seeding a database again', () => {
  let tmp: string;
  let file: string;
  const opened: Database.Database[] = [];

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'signi-seed-test-'));
    file = path.join(tmp, 'signi.db');
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    for (const db of opened.splice(0)) if (db.open) db.close();
    vi.doUnmock('./concepts/index.js');
    vi.doUnmock('./lexicon.js');
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  /** Run the seed module afresh against the file database, returning its connection. */
  async function seedFile(): Promise<Database.Database> {
    vi.stubEnv('SIGNI_DB_PATH', file);
    vi.resetModules();
    try {
      await import('./seed.js');
    } finally {
      const db = (await import('./db.js')).getDb();
      opened.push(db);
    }
    return opened[opened.length - 1]!;
  }

  function withCorpus(seeds: ConceptSeed[], nonfinite: typeof NONFINITE = {}): void {
    vi.doMock('./concepts/index.js', () => ({ concepts: seeds, NONFINITE: nonfinite }));
  }

  const snapshot = (db: Database.Database) => ({
    concepts: count(db, 'SELECT COUNT(*) AS n FROM semantic_concepts'),
    nouns: count(db, 'SELECT COUNT(*) AS n FROM noun_lexemes'),
    verbForms: count(db, 'SELECT COUNT(*) AS n FROM verb_forms'),
    relations: count(db, 'SELECT COUNT(*) AS n FROM concept_relations'),
  });

  test('replaces the corpus rather than adding to it', async () => {
    const first = snapshot(await seedFile());
    opened.pop()!.close();

    expect(snapshot(await seedFile())).toEqual(first);
  });

  test('leaves saved phrases alone', async () => {
    const db = await seedFile();
    db.prepare(
      "INSERT INTO saved_phrases (id, name, kind, version, payload, created_at, updated_at) VALUES ('keep', 'mine', 'period', 6, '{}', 't', 't')",
    ).run();
    opened.pop()!.close();

    const reseeded = await seedFile();
    expect(reseeded.prepare('SELECT id, name FROM saved_phrases').all()).toEqual([{ id: 'keep', name: 'mine' }]);
  });

  test('clears the lexicon cache once it has written', async () => {
    const clearLexiconCache = vi.fn();
    vi.doMock('./lexicon.js', () => ({ clearLexiconCache }));
    await seedFile();
    expect(clearLexiconCache).toHaveBeenCalledOnce();
  });

  test('fills the lexeme columns a seed leaves out with their defaults', async () => {
    withCorpus([
      { id: 'THEY', role: 'pronoun', description: 'someone', forms: { en: { base: 'they' } } },
      { id: 'SHEEP', role: 'noun', description: 'a sheep', forms: { en: { base: 'sheep' } } },
      { id: 'WAIT', role: 'verb', description: 'to wait', complements: [], forms: { en: { base: 'wait' } } },
    ]);
    const db = await seedFile();

    expect(db.prepare('SELECT lemma, person, number, gender FROM pronoun_lexemes').get()).toEqual({
      lemma: 'they', person: '3', number: 'singular', gender: null,
    });
    expect(db.prepare('SELECT singular, plural, gender FROM noun_lexemes').get()).toEqual({
      singular: 'sheep', plural: null, gender: null,
    });
    expect(db.prepare("SELECT complements FROM semantic_concepts WHERE id = 'WAIT'").get()).toEqual({ complements: null });
  });

  test('folds a verb\'s non-finite forms in over its own', async () => {
    withCorpus(
      [{
        id: 'WAIT',
        role: 'verb',
        description: 'to wait',
        forms: { en: { base: 'wait', gerund: 'waitin' }, it: { base: 'aspettare' } },
      }],
      { WAIT: { en: { gerund: 'waiting', participle: 'waited' } } },
    );
    const db = await seedFile();
    expect(storedForms(db, 'verb', 'WAIT', 'en')).toEqual({ base: 'wait', gerund: 'waiting', participle: 'waited' });
    expect(storedForms(db, 'verb', 'WAIT', 'it')).toEqual({ base: 'aspettare' });
  });

  test('empties the corpus tables for an empty corpus, and says so', async () => {
    await seedFile();
    opened.pop()!.close();

    withCorpus([]);
    const db = await seedFile();
    expect(snapshot(db)).toEqual({ concepts: 0, nouns: 0, verbForms: 0, relations: 0 });
    expect(console.log).toHaveBeenLastCalledWith('Seeded 0 concepts across 0 languages.');
  });

  test('reports how many concepts it seeded, in how many languages', async () => {
    await seedFile();
    expect(console.log).toHaveBeenLastCalledWith(`Seeded ${concepts.length} concepts across ${LANGUAGE_COUNT} languages.`);
  });

  test('reads non-finite forms for verbs only', async () => {
    withCorpus(
      [{ id: 'QUICK', role: 'adjective', description: 'fast', forms: { en: { base: 'quick' } } }],
      { QUICK: { en: { gerund: 'quicking' } } },
    );
    const db = await seedFile();
    expect(storedForms(db, 'adjective', 'QUICK', 'en')).toEqual({ base: 'quick' });
  });

  test('refuses an invalid hierarchy before touching the database', async () => {
    const before = snapshot(await seedFile());
    opened.pop()!.close();

    withCorpus([
      { id: 'A', role: 'noun', description: 'a', isA: 'B', forms: { en: { base: 'a' } } },
      { id: 'B', role: 'noun', description: 'b', isA: 'A', forms: { en: { base: 'b' } } },
    ]);
    await expect(seedFile()).rejects.toThrow('Cyclic isA hierarchy: A → B → A');
    expect(snapshot(opened[opened.length - 1]!)).toEqual(before);
  });

  test('rolls the whole seed back when a row is rejected', async () => {
    const before = snapshot(await seedFile());
    opened.pop()!.close();

    withCorpus([
      { id: 'CAT', role: 'noun', description: 'a cat', forms: { en: { base: 'cat' } } },
      { id: 'THE', role: 'article', description: 'the', forms: { en: { base: 'the' } } },
    ]);
    await expect(seedFile()).rejects.toThrow(/CHECK constraint failed/);
    expect(snapshot(opened[opened.length - 1]!)).toEqual(before);
  });
});
