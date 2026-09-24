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
      -- 'interjection' (P09-E30): a word outside the clause that opens it (hey) — see ROLE_CHECK below.
      role         TEXT NOT NULL CHECK (role IN ('pronoun','noun','verb','adjective','adverb','interjection')),
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
      -- The clause a verb takes as its object (P09-E12 D9): 'content' for a finite that-clause
      -- (SAY, THINK, KNOW …), 'infinitive' for an infinitive complement (NEED, TRY, DESIRE). It
      -- offers the builder's subordinate-clause menu its entries. NULL for every other concept.
      clause_object TEXT CHECK (clause_object IN ('content','infinitive') OR clause_object IS NULL),
      -- The slot a concept fills where that is not the one its role implies: very and too are
      -- adverbs that modify an adjective, Mr a noun that stands with a name, own an adjective bound
      -- to a possessor, something a pronoun that is not a person. Each reuses its role's lexeme and
      -- form tables, and this is what keeps it out of that role's picker — the same split the modal
      -- flag makes among the verbs. NULL for every ordinary concept (see ConceptSlot).
      slot         TEXT CHECK (slot IN ('intensifier','title','possessorOwn','indefinite') OR slot IS NULL),
      -- 1 for a proper noun (Africa): its article is fixed by the language, not chosen —
      -- en/de/es/ja take none, it/fr/pt take the definite one — so the determiner the user
      -- picks is ignored for this head.
      proper       INTEGER NOT NULL DEFAULT 0 CHECK (proper IN (0,1)),
      -- how a noun enters a manner adverbial (complemento di modo): 'similative' (like the wind),
      -- 'measure' (at the speed), 'means' (with care), 'mode' (in a … way). The engine maps it to
      -- the adposition; a noun that declares none is treated as 'similative'. NULL for non-manner nouns.
      manner_relation TEXT CHECK (manner_relation IN ('similative','measure','means','mode') OR manner_relation IS NULL),
      -- how a dimension noun enters an adjective-definition gloss: 'extent' (of great size),
      -- 'quality' (of high quality), 'measure' (at a high temperature). The engine maps it to the
      -- adposition; a noun that declares none is treated as 'extent'. NULL for non-dimension nouns.
      dimension_relation TEXT CHECK (dimension_relation IN ('extent','quality','measure') OR dimension_relation IS NULL),
      -- 1 for a noun naming a point in time, an occasion (TIME), not a rate (SPEED). Under an
      -- adjective a measure manner adverbial names a generic rate and goes bare ("at high speed"),
      -- but an occasion keeps its article ("at the other time", A235); German says one with "zu" +
      -- dative ("zu allen Zeiten", A60). Default 0. Ignored for non-nouns.
      temporal     INTEGER NOT NULL DEFAULT 0 CHECK (temporal IN (0,1)),
      -- 1 for an adjective that ascribes a TRANSIENT state (tired, hungry, saved) rather than an
      -- inherent property (big, canine). Spanish/Portuguese predicate a transient adjective with
      -- estar, an inherent one with ser (A47); default 0 (inherent). Ignored for non-adjectives.
      transient    INTEGER NOT NULL DEFAULT 0 CHECK (transient IN (0,1)),
      -- 1 for a noun naming a danger one cries out a warning of (wolf, fire). Italian and French
      -- shout such a cry with a / à and the article ("gridare al lupo", "crier au feu"), where any
      -- other cry is a plain object (A124); default 0. Ignored for non-nouns.
      alarm        INTEGER NOT NULL DEFAULT 0 CHECK (alarm IN (0,1)),
      -- 1 for a verb that cries an alarm (cry out): its object, when an alarm noun, is the shout
      -- itself, "Wolf!", with no determiner of its own — English "cried wolf", Italian and French a / à
      -- and the article, "gridò al lupo", "cria au loup" (A124, A163); default 0. Ignored for non-verbs.
      alarm_cry    INTEGER NOT NULL DEFAULT 0 CHECK (alarm_cry IN (0,1)),
      -- 1 for a verb naming a state that holds (want, can, be, have, own, love, seem, hold, know)
      -- rather than an event. The Romance past of a state is the imperfect ("voleva", not the
      -- perfective "volle", A130), and Japanese says it holds with 〜ている ("持っています", A132);
      -- default 0 (an event). Ignored for non-verbs.
      stative      INTEGER NOT NULL DEFAULT 0 CHECK (stative IN (0,1)),
      -- For a lexical sense the engine selects in place of another concept, that concept's id
      -- (KNOW_ACQUAINTED, the "know a person / thing" verb, is a sense of KNOW, A131). The user
      -- picks the concept itself, so /api/concepts leaves a sense out; NULL for any other concept.
      sense_of     TEXT
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

    -- An interjection is one fixed word per language (hey / ehi / ねえ, P09-E30): a lemma and its
    -- base form row, like an adverb.
    CREATE TABLE IF NOT EXISTS interjection_lexemes (
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

    CREATE TABLE IF NOT EXISTS interjection_forms (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      lexeme_id  INTEGER NOT NULL REFERENCES interjection_lexemes(id) ON DELETE CASCADE,
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

    CREATE TABLE IF NOT EXISTS concept_interjection_links (
      concept_id TEXT    NOT NULL REFERENCES semantic_concepts(id)   ON DELETE CASCADE,
      lexeme_id  INTEGER NOT NULL REFERENCES interjection_lexemes(id) ON DELETE CASCADE,
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
    CREATE INDEX IF NOT EXISTS idx_interjection_lexemes_lang ON interjection_lexemes (language);

    CREATE INDEX IF NOT EXISTS idx_verb_forms_lexeme      ON verb_forms      (lexeme_id);
    CREATE INDEX IF NOT EXISTS idx_noun_forms_lexeme      ON noun_forms      (lexeme_id);
    CREATE INDEX IF NOT EXISTS idx_pronoun_forms_lexeme   ON pronoun_forms   (lexeme_id);
    CREATE INDEX IF NOT EXISTS idx_adjective_forms_lexeme ON adjective_forms (lexeme_id);
    CREATE INDEX IF NOT EXISTS idx_adverb_forms_lexeme    ON adverb_forms    (lexeme_id);
    CREATE INDEX IF NOT EXISTS idx_interjection_forms_lexeme ON interjection_forms (lexeme_id);
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
  if (!conceptCols.includes('clause_object')) {
    db.exec("ALTER TABLE semantic_concepts ADD COLUMN clause_object TEXT CHECK (clause_object IN ('content','infinitive') OR clause_object IS NULL)");
  }
  if (!conceptCols.includes('slot')) {
    db.exec("ALTER TABLE semantic_concepts ADD COLUMN slot TEXT CHECK (slot IN ('intensifier','title','possessorOwn','indefinite') OR slot IS NULL)");
  }
  if (!conceptCols.includes('proper')) {
    db.exec('ALTER TABLE semantic_concepts ADD COLUMN proper INTEGER NOT NULL DEFAULT 0 CHECK (proper IN (0,1))');
  }
  if (!conceptCols.includes('manner_relation')) {
    db.exec("ALTER TABLE semantic_concepts ADD COLUMN manner_relation TEXT CHECK (manner_relation IN ('similative','measure','means','mode') OR manner_relation IS NULL)");
  }
  if (!conceptCols.includes('dimension_relation')) {
    db.exec("ALTER TABLE semantic_concepts ADD COLUMN dimension_relation TEXT CHECK (dimension_relation IN ('extent','quality','measure') OR dimension_relation IS NULL)");
  }
  if (!conceptCols.includes('temporal')) {
    db.exec('ALTER TABLE semantic_concepts ADD COLUMN temporal INTEGER NOT NULL DEFAULT 0 CHECK (temporal IN (0,1))');
  }
  if (!conceptCols.includes('transient')) {
    db.exec('ALTER TABLE semantic_concepts ADD COLUMN transient INTEGER NOT NULL DEFAULT 0 CHECK (transient IN (0,1))');
  }
  if (!conceptCols.includes('alarm')) {
    db.exec('ALTER TABLE semantic_concepts ADD COLUMN alarm INTEGER NOT NULL DEFAULT 0 CHECK (alarm IN (0,1))');
  }
  if (!conceptCols.includes('alarm_cry')) {
    db.exec('ALTER TABLE semantic_concepts ADD COLUMN alarm_cry INTEGER NOT NULL DEFAULT 0 CHECK (alarm_cry IN (0,1))');
  }
  if (!conceptCols.includes('stative')) {
    db.exec('ALTER TABLE semantic_concepts ADD COLUMN stative INTEGER NOT NULL DEFAULT 0 CHECK (stative IN (0,1))');
  }
  if (!conceptCols.includes('sense_of')) {
    db.exec('ALTER TABLE semantic_concepts ADD COLUMN sense_of TEXT');
  }
  widenRoleCheck(db);

  // saved_phrases gained a `kind` column after the table first shipped; backfill it.
  const savedPhraseCols = db
    .prepare<[], { name: string }>("PRAGMA table_info(saved_phrases)")
    .all()
    .map((c) => c.name);
  if (savedPhraseCols.length > 0 && !savedPhraseCols.includes('kind')) {
    db.exec("ALTER TABLE saved_phrases ADD COLUMN kind TEXT NOT NULL DEFAULT 'phrase'");
  }
}

const LEGACY_ROLE_CHECK = "role IN ('pronoun','noun','verb','adjective','adverb')";
const ROLE_CHECK = "role IN ('pronoun','noun','verb','adjective','adverb','interjection')";

/**
 * A database created before the `interjection` role (P09-E30) has the old role CHECK on
 * `semantic_concepts`, which SQLite cannot ALTER: the reseed would fail on HEY. Rebuild the table
 * with the widened CHECK and every row it holds — the documented SQLite procedure (new table, copy,
 * drop, rename), with foreign keys off so dropping the old table cascades nothing into the link,
 * definition and relation tables that point at it. The new table is the old one's own CREATE with
 * the CHECK swapped, so its columns (and their order, which ALTER-added columns may have changed)
 * are exactly the old ones'.
 */
function widenRoleCheck(db: Database.Database): void {
  const row = db
    .prepare<[], { sql: string }>("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'semantic_concepts'")
    .get();
  if (!row || !row.sql.includes(LEGACY_ROLE_CHECK)) return;
  const create = row.sql
    .replace(LEGACY_ROLE_CHECK, ROLE_CHECK)
    .replace(/^CREATE TABLE\s+("?)semantic_concepts\1/, 'CREATE TABLE semantic_concepts_widened');
  db.pragma('foreign_keys = OFF');
  try {
    db.transaction(() => {
      db.exec(create);
      db.exec('INSERT INTO semantic_concepts_widened SELECT * FROM semantic_concepts');
      db.exec('DROP TABLE semantic_concepts');
      db.exec('ALTER TABLE semantic_concepts_widened RENAME TO semantic_concepts');
    })();
  } finally {
    db.pragma('foreign_keys = ON');
  }
}
