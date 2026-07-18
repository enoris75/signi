import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// The e2e suite points this at a throwaway copy so its saves don't land in the dev database.
const DB_PATH =
  process.env['SIGNI_DB_PATH'] ?? path.join(__dirname, '..', 'signi.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    -- ── Interlingual pivot ─────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS semantic_concepts (
      id           TEXT PRIMARY KEY,
      role         TEXT NOT NULL CHECK (role IN ('pronoun','noun','verb','adjective','adverb')),
      description  TEXT NOT NULL,
      emoji        TEXT,
      transitivity TEXT CHECK (transitivity IN ('intransitive','transitive','ditransitive') OR transitivity IS NULL),
      complements  TEXT,  -- comma-separated ComplementType list (e.g. 'locative,direction'), NULL if none
      animate      INTEGER NOT NULL DEFAULT 0 CHECK (animate IN (0,1)), -- 1 if the referent is animate
      human        INTEGER NOT NULL DEFAULT 0 CHECK (human IN (0,1)), -- 1 if the referent is a person (English relativises "who" on this, not animacy)
      synonym      TEXT,   -- short disambiguating gloss shown in parentheses in the picker, NULL if none
      countable    INTEGER NOT NULL DEFAULT 1 CHECK (countable IN (0,1)), -- 0 for mass/uncountable nouns (water, food)
      -- 1 for a modal verb (must/can/will): a verb that governs another verb's infinitive
      -- rather than heading a clause. Modals conjugate like any verb, so they reuse the
      -- verb lexeme/form tables; this flag is what keeps them out of the main-verb picker.
      modal        INTEGER NOT NULL DEFAULT 0 CHECK (modal IN (0,1)),
      -- 1 for a proper noun (Africa): its article is fixed by the language, not chosen —
      -- en/de/es/ja take none, it/fr/pt take the definite one — so the determiner the user
      -- picks is ignored for this head.
      proper       INTEGER NOT NULL DEFAULT 0 CHECK (proper IN (0,1)),
      -- how a noun enters a manner adverbial (complemento di modo): 'similative' (like the wind),
      -- 'measure' (at the speed), 'means' (with care), 'mode' (in a … way). The engine maps it to
      -- the adposition; a noun that declares none is treated as 'similative'. NULL for non-manner nouns.
      manner_relation TEXT CHECK (manner_relation IN ('similative','measure','means','mode') OR manner_relation IS NULL)
    );

    -- ── Per-language concept definitions ──────────────────────────────
    -- The dictionary gloss a picker shows on hover, one row per language. Kept out of
    -- semantic_concepts (which holds one English description column) so a concept can carry a
    -- definition in every language it's translated into. Only English is seeded for now
    -- (from that description); a language with no row here falls back to English at read time.
    CREATE TABLE IF NOT EXISTS concept_definitions (
      concept_id TEXT NOT NULL REFERENCES semantic_concepts(id) ON DELETE CASCADE,
      language   TEXT NOT NULL CHECK (language IN ('en','it','fr','de','es','ja','pt')),
      definition TEXT NOT NULL,
      PRIMARY KEY (concept_id, language)
    );

    -- ── Per-type lexeme tables ─────────────────────────────────────────
    -- Each table carries only the attributes that are meaningful for that
    -- grammatical category. Structured fields (gender, person, number) are
    -- typed columns, not key-value rows.

    CREATE TABLE IF NOT EXISTS verb_lexemes (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      language TEXT NOT NULL CHECK (language IN ('en','it','fr','de','es','ja','pt')),
      lemma    TEXT NOT NULL,   -- infinitive / dictionary form
      notes    TEXT
    );

    CREATE TABLE IF NOT EXISTS noun_lexemes (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      language TEXT NOT NULL CHECK (language IN ('en','it','fr','de','es','ja','pt')),
      singular TEXT NOT NULL,   -- citation / nominative singular form
      plural   TEXT,            -- NULL for uncountable or defective nouns
      gender   TEXT CHECK (gender IN ('masc','fem','neut') OR gender IS NULL),
      notes    TEXT
    );

    CREATE TABLE IF NOT EXISTS pronoun_lexemes (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      language TEXT NOT NULL CHECK (language IN ('en','it','fr','de','es','ja','pt')),
      lemma    TEXT NOT NULL,
      person   TEXT NOT NULL CHECK (person IN ('1','2','3')),
      number   TEXT NOT NULL CHECK (number IN ('singular','plural')),
      gender   TEXT CHECK (gender IN ('masc','fem','neut') OR gender IS NULL),
      notes    TEXT
    );

    CREATE TABLE IF NOT EXISTS adjective_lexemes (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      language TEXT NOT NULL CHECK (language IN ('en','it','fr','de','es','ja','pt')),
      lemma    TEXT NOT NULL,
      notes    TEXT
    );

    CREATE TABLE IF NOT EXISTS adverb_lexemes (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      language TEXT NOT NULL CHECK (language IN ('en','it','fr','de','es','ja','pt')),
      lemma    TEXT NOT NULL,
      notes    TEXT
    );

    -- ── Per-type inflected-form tables ────────────────────────────────
    -- Only surface forms live here. Structured metadata (gender, person,
    -- number) is on the lexeme table, not in these rows.

    CREATE TABLE IF NOT EXISTS verb_forms (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      lexeme_id  INTEGER NOT NULL REFERENCES verb_lexemes(id) ON DELETE CASCADE,
      form_key   TEXT NOT NULL,   -- '1sg_present' … '3pl_present', 'masu_present'
      form_value TEXT NOT NULL,
      UNIQUE (lexeme_id, form_key)
    );

    CREATE TABLE IF NOT EXISTS noun_forms (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      lexeme_id  INTEGER NOT NULL REFERENCES noun_lexemes(id) ON DELETE CASCADE,
      form_key   TEXT NOT NULL,   -- future case forms (gen, dat…); singular/plural are columns
      form_value TEXT NOT NULL,
      UNIQUE (lexeme_id, form_key)
    );

    CREATE TABLE IF NOT EXISTS pronoun_forms (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      lexeme_id  INTEGER NOT NULL REFERENCES pronoun_lexemes(id) ON DELETE CASCADE,
      form_key   TEXT NOT NULL,   -- 'base', and optionally case forms
      form_value TEXT NOT NULL,
      UNIQUE (lexeme_id, form_key)
    );

    CREATE TABLE IF NOT EXISTS adjective_forms (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      lexeme_id  INTEGER NOT NULL REFERENCES adjective_lexemes(id) ON DELETE CASCADE,
      form_key   TEXT NOT NULL,   -- 'base', 'masc_sg', 'fem_sg', 'masc_pl', 'fem_pl'
      form_value TEXT NOT NULL,
      UNIQUE (lexeme_id, form_key)
    );

    CREATE TABLE IF NOT EXISTS adverb_forms (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      lexeme_id  INTEGER NOT NULL REFERENCES adverb_lexemes(id) ON DELETE CASCADE,
      form_key   TEXT NOT NULL,   -- 'base'
      form_value TEXT NOT NULL,
      UNIQUE (lexeme_id, form_key)
    );

    -- ── Per-type concept → lexeme links ──────────────────────────────
    -- Typed FKs ensure a noun concept can only link to noun lexemes, etc.
    -- is_primary = 0 marks synonym lexemes for the same concept.

    CREATE TABLE IF NOT EXISTS concept_verb_links (
      concept_id TEXT    NOT NULL REFERENCES semantic_concepts(id) ON DELETE CASCADE,
      lexeme_id  INTEGER NOT NULL REFERENCES verb_lexemes(id)      ON DELETE CASCADE,
      is_primary INTEGER NOT NULL DEFAULT 1 CHECK (is_primary IN (0,1)),
      PRIMARY KEY (concept_id, lexeme_id)
    );

    CREATE TABLE IF NOT EXISTS concept_noun_links (
      concept_id TEXT    NOT NULL REFERENCES semantic_concepts(id) ON DELETE CASCADE,
      lexeme_id  INTEGER NOT NULL REFERENCES noun_lexemes(id)      ON DELETE CASCADE,
      is_primary INTEGER NOT NULL DEFAULT 1 CHECK (is_primary IN (0,1)),
      PRIMARY KEY (concept_id, lexeme_id)
    );

    CREATE TABLE IF NOT EXISTS concept_pronoun_links (
      concept_id TEXT    NOT NULL REFERENCES semantic_concepts(id) ON DELETE CASCADE,
      lexeme_id  INTEGER NOT NULL REFERENCES pronoun_lexemes(id)   ON DELETE CASCADE,
      is_primary INTEGER NOT NULL DEFAULT 1 CHECK (is_primary IN (0,1)),
      PRIMARY KEY (concept_id, lexeme_id)
    );

    CREATE TABLE IF NOT EXISTS concept_adjective_links (
      concept_id TEXT    NOT NULL REFERENCES semantic_concepts(id) ON DELETE CASCADE,
      lexeme_id  INTEGER NOT NULL REFERENCES adjective_lexemes(id) ON DELETE CASCADE,
      is_primary INTEGER NOT NULL DEFAULT 1 CHECK (is_primary IN (0,1)),
      PRIMARY KEY (concept_id, lexeme_id)
    );

    CREATE TABLE IF NOT EXISTS concept_adverb_links (
      concept_id TEXT    NOT NULL REFERENCES semantic_concepts(id) ON DELETE CASCADE,
      lexeme_id  INTEGER NOT NULL REFERENCES adverb_lexemes(id)    ON DELETE CASCADE,
      is_primary INTEGER NOT NULL DEFAULT 1 CHECK (is_primary IN (0,1)),
      PRIMARY KEY (concept_id, lexeme_id)
    );

    -- ── Cross-language relations between concepts ─────────────────────
    -- These hold between *meanings*, not words: a caravel is a ship in every language, so
    -- the edge is stored once against the concept rather than once per lexeme. Contrast the
    -- *_relations tables below, which relate two words *inside one language* (English "bank"
    -- the riverbank vs "bank" the institution is a fact about English, not about a meaning).
    --
    -- The hypernym relation reads a is_a b — CARAVEL is_a SAILING_SHIP is_a SHIP. UNIQUE caps
    -- a concept at one parent per relation, which keeps the hierarchy a tree rather than a
    -- DAG: rules attach to a node and fire for everything beneath it, resolving by walking up
    -- and taking the first (most specific) match, and that only has a well-defined answer if a
    -- concept's ancestors are totally ordered. A second parent would make two rules at the
    -- same depth incomparable, and the engine would have no principled way to choose.
    --
    -- Cycles satisfy both foreign keys and every constraint here, so they are rejected in the
    -- seed instead (see concepts/hierarchy.ts) — an undetected one would hang the ancestor
    -- walk at request time.
    --
    -- Widening the relation set later (meronymy: WHEEL part_of CAR) means editing the CHECK,
    -- which in SQLite is a table rebuild — cheap, since "npm run seed" regenerates this table
    -- wholesale and it holds no user data.
    CREATE TABLE IF NOT EXISTS concept_relations (
      concept_a_id TEXT NOT NULL REFERENCES semantic_concepts(id) ON DELETE CASCADE,
      concept_b_id TEXT NOT NULL REFERENCES semantic_concepts(id) ON DELETE CASCADE,
      relation     TEXT NOT NULL CHECK (relation IN ('hypernym')),
      PRIMARY KEY (concept_a_id, concept_b_id, relation),
      UNIQUE (concept_a_id, relation),
      CHECK (concept_a_id <> concept_b_id)
    );

    -- ── Per-type within-language lexical relations ────────────────────
    -- Relations are always between words of the same grammatical category
    -- (a verb synonym is a verb, a noun homonym is a noun, etc.).

    CREATE TABLE IF NOT EXISTS verb_relations (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      lexeme_a_id INTEGER NOT NULL REFERENCES verb_lexemes(id) ON DELETE CASCADE,
      lexeme_b_id INTEGER NOT NULL REFERENCES verb_lexemes(id) ON DELETE CASCADE,
      relation    TEXT NOT NULL CHECK (relation IN ('synonym','homonym','antonym','related')),
      CHECK (lexeme_a_id <> lexeme_b_id)
    );

    CREATE TABLE IF NOT EXISTS noun_relations (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      lexeme_a_id INTEGER NOT NULL REFERENCES noun_lexemes(id) ON DELETE CASCADE,
      lexeme_b_id INTEGER NOT NULL REFERENCES noun_lexemes(id) ON DELETE CASCADE,
      relation    TEXT NOT NULL CHECK (relation IN ('synonym','homonym','antonym','related')),
      CHECK (lexeme_a_id <> lexeme_b_id)
    );

    CREATE TABLE IF NOT EXISTS pronoun_relations (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      lexeme_a_id INTEGER NOT NULL REFERENCES pronoun_lexemes(id) ON DELETE CASCADE,
      lexeme_b_id INTEGER NOT NULL REFERENCES pronoun_lexemes(id) ON DELETE CASCADE,
      relation    TEXT NOT NULL CHECK (relation IN ('synonym','homonym','antonym','related')),
      CHECK (lexeme_a_id <> lexeme_b_id)
    );

    CREATE TABLE IF NOT EXISTS adjective_relations (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      lexeme_a_id INTEGER NOT NULL REFERENCES adjective_lexemes(id) ON DELETE CASCADE,
      lexeme_b_id INTEGER NOT NULL REFERENCES adjective_lexemes(id) ON DELETE CASCADE,
      relation    TEXT NOT NULL CHECK (relation IN ('synonym','homonym','antonym','related')),
      CHECK (lexeme_a_id <> lexeme_b_id)
    );

    CREATE TABLE IF NOT EXISTS adverb_relations (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      lexeme_a_id INTEGER NOT NULL REFERENCES adverb_lexemes(id) ON DELETE CASCADE,
      lexeme_b_id INTEGER NOT NULL REFERENCES adverb_lexemes(id) ON DELETE CASCADE,
      relation    TEXT NOT NULL CHECK (relation IN ('synonym','homonym','antonym','related')),
      CHECK (lexeme_a_id <> lexeme_b_id)
    );

    -- ── Saved phrases ─────────────────────────────────────────────────
    -- A user-saved builder workspace, stored as the versioned SavedPhrase JSON
    -- document (see @signi/shared). The author column records who saved it; there is no
    -- auth yet, so it is always 'system' for now — the column exists so real
    -- owners can be attached later without a migration.
    CREATE TABLE IF NOT EXISTS saved_phrases (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      kind       TEXT NOT NULL DEFAULT 'phrase' CHECK (kind IN ('period','phrase')), -- one clause vs a whole workspace
      author     TEXT NOT NULL DEFAULT 'system',
      version    INTEGER NOT NULL,
      payload    TEXT NOT NULL,   -- the full SavedPhrase JSON document
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- ── Indexes ───────────────────────────────────────────────────────
    CREATE INDEX IF NOT EXISTS idx_saved_phrases_author  ON saved_phrases     (author);
    CREATE INDEX IF NOT EXISTS idx_verb_lexemes_lang     ON verb_lexemes      (language);
    CREATE INDEX IF NOT EXISTS idx_noun_lexemes_lang     ON noun_lexemes      (language);
    CREATE INDEX IF NOT EXISTS idx_pronoun_lexemes_lang  ON pronoun_lexemes   (language);
    CREATE INDEX IF NOT EXISTS idx_adjective_lexemes_lang ON adjective_lexemes (language);
    CREATE INDEX IF NOT EXISTS idx_adverb_lexemes_lang   ON adverb_lexemes    (language);

    CREATE INDEX IF NOT EXISTS idx_verb_forms_lexeme      ON verb_forms      (lexeme_id);
    CREATE INDEX IF NOT EXISTS idx_noun_forms_lexeme      ON noun_forms      (lexeme_id);
    CREATE INDEX IF NOT EXISTS idx_pronoun_forms_lexeme   ON pronoun_forms   (lexeme_id);
    CREATE INDEX IF NOT EXISTS idx_adjective_forms_lexeme ON adjective_forms (lexeme_id);
    CREATE INDEX IF NOT EXISTS idx_adverb_forms_lexeme    ON adverb_forms    (lexeme_id);
  `);

  // ── Migrations for databases created before a column existed ──────────
  const conceptCols = db
    .prepare<[], { name: string }>("PRAGMA table_info(semantic_concepts)")
    .all()
    .map((c) => c.name);
  if (!conceptCols.includes('complements')) {
    db.exec('ALTER TABLE semantic_concepts ADD COLUMN complements TEXT');
  }
  if (!conceptCols.includes('animate')) {
    db.exec('ALTER TABLE semantic_concepts ADD COLUMN animate INTEGER NOT NULL DEFAULT 0 CHECK (animate IN (0,1))');
  }
  if (!conceptCols.includes('human')) {
    db.exec('ALTER TABLE semantic_concepts ADD COLUMN human INTEGER NOT NULL DEFAULT 0 CHECK (human IN (0,1))');
  }
  if (!conceptCols.includes('synonym')) {
    db.exec('ALTER TABLE semantic_concepts ADD COLUMN synonym TEXT');
  }
  if (!conceptCols.includes('countable')) {
    db.exec('ALTER TABLE semantic_concepts ADD COLUMN countable INTEGER NOT NULL DEFAULT 1 CHECK (countable IN (0,1))');
  }
  if (!conceptCols.includes('modal')) {
    db.exec('ALTER TABLE semantic_concepts ADD COLUMN modal INTEGER NOT NULL DEFAULT 0 CHECK (modal IN (0,1))');
  }
  if (!conceptCols.includes('proper')) {
    db.exec('ALTER TABLE semantic_concepts ADD COLUMN proper INTEGER NOT NULL DEFAULT 0 CHECK (proper IN (0,1))');
  }
  if (!conceptCols.includes('manner_relation')) {
    db.exec("ALTER TABLE semantic_concepts ADD COLUMN manner_relation TEXT CHECK (manner_relation IN ('similative','measure','means','mode') OR manner_relation IS NULL)");
  }

  // saved_phrases gained a `kind` column after the table first shipped; backfill it.
  const savedPhraseCols = db
    .prepare<[], { name: string }>("PRAGMA table_info(saved_phrases)")
    .all()
    .map((c) => c.name);
  if (savedPhraseCols.length > 0 && !savedPhraseCols.includes('kind')) {
    db.exec("ALTER TABLE saved_phrases ADD COLUMN kind TEXT NOT NULL DEFAULT 'phrase'");
  }
}
