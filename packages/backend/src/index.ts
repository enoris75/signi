import express from 'express';
import cors from 'cors';
import { getDb } from './db.js';
import { lookupLexicalEntry } from './lexicon.js';
import { translate } from '@signi/engine';
import { buildUiStrings } from './uiStrings.js';
import { buildConceptDefinitions } from './definitions.js';
import { randomUUID } from 'crypto';
import type {
  ConceptsResponse,
  UiStringsResponse,
  TranslateRequest,
  TranslateResponse,
  GrammaticalRole,
  LanguageCode,
  SavePhraseRequest,
  SavedPhrase,
  SavedPhraseKind,
  SavedPhraseRecord,
  SavedPhraseSummary,
  SavedPhrasesResponse,
} from '@signi/shared';
import { nounConjuncts, SAVED_PHRASE_FORMAT, SAVED_PHRASE_VERSION } from '@signi/shared';

const app = express();
app.use(cors());
app.use(express.json());

// Ensure DB is initialized on startup
getDb();

// Engine-composed concept definitions, rendered once from the seed's `definition` plans into
// every language (like the UI-string bundle). A plan that fails to render in some language throws
// here, on boot, rather than serving a broken tooltip. Merged over the stored literals per request.
const CONCEPT_DEFINITIONS = buildConceptDefinitions();

interface ConceptRow {
  id: string;
  role: GrammaticalRole;
  description: string;
  emoji: string | null;
  transitivity: string | null;
  complements: string | null;
  synonym: string | null;
  countable: number;
  modal: number;
}

const CONCEPT_COLS =
  'id, role, description, emoji, transitivity, complements, synonym, countable, modal';

const PRONOUN_META_SQL = `
  SELECT cpl.concept_id, pl.person, pl.number
  FROM pronoun_lexemes pl
  JOIN concept_pronoun_links cpl ON cpl.lexeme_id = pl.id AND cpl.is_primary = 1
  WHERE pl.language = 'en'
`;

const GENDERED_NOUNS_SQL = `
  SELECT DISTINCT cnl.concept_id
  FROM noun_forms nf
  JOIN concept_noun_links cnl ON cnl.lexeme_id = nf.lexeme_id AND cnl.is_primary = 1
  WHERE nf.form_key = 'fem'
`;

// Every concept's per-language definitions — the tooltip gloss a picker shows on hover.
// Only English is seeded so far; the map ships with the concept list (like labels) so the
// picker can read the definition in whatever language it's already showing, falling back to
// English client-side when the chosen language has no row.
const DEFINITION_SQL = `
  SELECT concept_id, language, definition FROM concept_definitions
`;

// Every is_a edge, read as "a is_a b". A concept has at most one (the table's UNIQUE says so),
// so this maps cleanly onto Concept.isA. Fetched unfiltered even when the request narrows to one
// role: hypernyms relate concepts of the same role, so the parent is in the response either way.
const HYPERNYM_SQL = `
  SELECT concept_a_id, concept_b_id FROM concept_relations WHERE relation = 'hypernym'
`;

// The citation form of every concept in every seeded language — the primary lexeme's lemma
// (a noun's singular), with the kana reading of that lemma where the lexeme carries one (ja),
// so the pickers can put furigana over the word they show. The pickers show the word in the
// chosen language, so the whole catalog rides along with the concept list rather than being
// re-fetched per language.
const LABEL_SQL = `
  SELECT concept_id, language, word, reading FROM (
    SELECT cpl.concept_id, pl.language, pl.lemma AS word,
           (SELECT form_value FROM pronoun_forms f
            WHERE f.lexeme_id = pl.id AND f.form_key = 'reading') AS reading
    FROM pronoun_lexemes pl
    JOIN concept_pronoun_links cpl ON cpl.lexeme_id = pl.id AND cpl.is_primary = 1
    UNION ALL
    SELECT cvl.concept_id, vl.language, vl.lemma AS word,
           (SELECT form_value FROM verb_forms f
            WHERE f.lexeme_id = vl.id AND f.form_key = 'reading') AS reading
    FROM verb_lexemes vl
    JOIN concept_verb_links cvl ON cvl.lexeme_id = vl.id AND cvl.is_primary = 1
    UNION ALL
    SELECT cnl.concept_id, nl.language, nl.singular AS word,
           (SELECT form_value FROM noun_forms f
            WHERE f.lexeme_id = nl.id AND f.form_key = 'reading') AS reading
    FROM noun_lexemes nl
    JOIN concept_noun_links cnl ON cnl.lexeme_id = nl.id AND cnl.is_primary = 1
    UNION ALL
    SELECT cal.concept_id, al.language, al.lemma AS word,
           (SELECT form_value FROM adjective_forms f
            WHERE f.lexeme_id = al.id AND f.form_key = 'reading') AS reading
    FROM adjective_lexemes al
    JOIN concept_adjective_links cal ON cal.lexeme_id = al.id AND cal.is_primary = 1
    UNION ALL
    SELECT cal.concept_id, al.language, al.lemma AS word,
           (SELECT form_value FROM adverb_forms f
            WHERE f.lexeme_id = al.id AND f.form_key = 'reading') AS reading
    FROM adverb_lexemes al
    JOIN concept_adverb_links cal ON cal.lexeme_id = al.id AND cal.is_primary = 1
  )
`;

app.get('/api/concepts', (req, res) => {
  const db = getDb();
  const role = req.query['role'] as string | undefined;

  let rows: ConceptRow[];
  if (role) {
    rows = db
      .prepare<[string], ConceptRow>(`SELECT ${CONCEPT_COLS} FROM semantic_concepts WHERE role = ? ORDER BY id`)
      .all(role);
  } else {
    rows = db
      .prepare<[], ConceptRow>(`SELECT ${CONCEPT_COLS} FROM semantic_concepts ORDER BY role, id`)
      .all();
  }

  const labelRows = db
    .prepare<[], { concept_id: string; language: LanguageCode; word: string; reading: string | null }>(
      LABEL_SQL,
    )
    .all();
  const labels = new Map<string, Partial<Record<LanguageCode, string>>>();
  const readings = new Map<string, Partial<Record<LanguageCode, string>>>();
  for (const r of labelRows) {
    const byLanguage = labels.get(r.concept_id) ?? {};
    byLanguage[r.language] = r.word;
    labels.set(r.concept_id, byLanguage);
    // A word already written in kana reads as itself (ねこ), so it gets no furigana — same
    // rule the engine applies when it builds ruby segments for a translation.
    if (r.reading && r.reading !== r.word) {
      const readingByLanguage = readings.get(r.concept_id) ?? {};
      readingByLanguage[r.language] = r.reading;
      readings.set(r.concept_id, readingByLanguage);
    }
  }

  const definitionRows = db
    .prepare<[], { concept_id: string; language: LanguageCode; definition: string }>(
      DEFINITION_SQL,
    )
    .all();
  const definitions = new Map<string, Partial<Record<LanguageCode, string>>>();
  for (const r of definitionRows) {
    const byLanguage = definitions.get(r.concept_id) ?? {};
    byLanguage[r.language] = r.definition;
    definitions.set(r.concept_id, byLanguage);
  }
  // An engine-composed definition (rendered from the concept's `definition` plan) supersedes the
  // stored literal, in every language it renders — so a planned concept reads consistently across
  // languages rather than mixing an English literal with translated fragments.
  const definitionFor = (id: string): Partial<Record<LanguageCode, string>> | undefined => {
    const literal = definitions.get(id);
    const composed = CONCEPT_DEFINITIONS.get(id);
    if (!literal && !composed) return undefined;
    return { ...literal, ...composed };
  };

  const genderedNounRows = db.prepare<[], { concept_id: string }>(GENDERED_NOUNS_SQL).all();
  const genderedNouns = new Set(genderedNounRows.map((r) => r.concept_id));

  const hypernymRows = db
    .prepare<[], { concept_a_id: string; concept_b_id: string }>(HYPERNYM_SQL)
    .all();
  const hypernyms = new Map(hypernymRows.map((r) => [r.concept_a_id, r.concept_b_id]));

  const pronounMeta = db
    .prepare<[], { concept_id: string; person: string; number: string }>(PRONOUN_META_SQL)
    .all();
  const pronounPersons = new Map(pronounMeta.map((r) => [r.concept_id, r.person as '1' | '2' | '3']));
  const pronounNumbers = new Map(pronounMeta.map((r) => [r.concept_id, r.number as 'singular' | 'plural']));

  const response: ConceptsResponse = {
    concepts: rows.map((r) => ({
      id: r.id,
      role: r.role,
      description: r.description,
      definitions: definitionFor(r.id),
      label: labels.get(r.id)?.en,
      labels: labels.get(r.id),
      readings: readings.get(r.id),
      synonym: r.synonym ?? undefined,
      countable: r.countable === 0 ? false : undefined,
      emoji: r.emoji ?? undefined,
      modal: r.modal === 1 || undefined,
      transitivity: (r.transitivity as import('@signi/shared').Transitivity) ?? undefined,
      complements: r.complements
        ? (r.complements.split(',') as import('@signi/shared').ComplementType[])
        : undefined,
      person: pronounPersons.get(r.id),
      number: pronounNumbers.get(r.id),
      gendered: genderedNouns.has(r.id) || undefined,
      isA: hypernyms.get(r.id),
    })),
  };
  res.json(response);
});

app.post('/api/translate', (req, res) => {
  const body = req.body as TranslateRequest;
  // A subject is always required; the verb phrase is optional (a verbless period is a
  // bare noun phrase, e.g. a newspaper title like "breaking news"). A coordinated subject
  // ("the cat and the dog") is a group of phrases rather than one, so the head to check for
  // is its first conjunct.
  const subject = body?.plan?.subject;
  if (!subject || !nounConjuncts(subject)[0]?.concept) {
    res.status(400).json({ error: 'plan.subject.concept is required' });
    return;
  }

  const translations = translate(body.plan, lookupLexicalEntry);
  const response: TranslateResponse = { translations };
  res.json(response);
});

// Every engine-rendered UI string (tagline, headings, language names…) in all seven
// languages, keyed — the frontend picks the key and the current UI language. The catalog of
// plans lives in @signi/shared (uiStrings.ts); adding a string means adding an entry there,
// not a route here. The bundle depends only on the lexicon, so it's rendered once at startup
// and served from memory; express's ETag turns repeat fetches into 304s.
const UI_STRINGS_BUNDLE: UiStringsResponse = { strings: buildUiStrings() };

app.get('/api/ui-strings', (_req, res) => {
  res.json(UI_STRINGS_BUNDLE);
});

// ── Saved phrases ────────────────────────────────────────────────────────────
// No auth yet, so every save is stamped with this author. When real users arrive
// this becomes the authenticated identity and the rest of the code is unchanged.
const DEFAULT_AUTHOR = 'system';

interface SavedPhraseRow {
  id: string;
  name: string;
  kind: SavedPhraseKind;
  author: string;
  version: number;
  payload: string;
  created_at: string;
  updated_at: string;
}

const SAVED_PHRASE_COLS =
  'id, name, kind, author, version, payload, created_at, updated_at';

const toSummary = (r: SavedPhraseRow): SavedPhraseSummary => ({
  id: r.id,
  name: r.name,
  kind: r.kind,
  author: r.author,
  version: r.version,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const toRecord = (r: SavedPhraseRow): SavedPhraseRecord => ({
  ...toSummary(r),
  workspace: (JSON.parse(r.payload) as SavedPhrase).workspace,
});

app.get('/api/phrases', (req, res) => {
  const db = getDb();
  // Optional ?kind=period|phrase filter, so the period picker and the phrase picker
  // each list only their own grain.
  const kind = req.query['kind'] as string | undefined;
  const rows =
    kind === 'period' || kind === 'phrase'
      ? db
          .prepare<[string], SavedPhraseRow>(
            `SELECT ${SAVED_PHRASE_COLS} FROM saved_phrases WHERE kind = ? ORDER BY updated_at DESC`,
          )
          .all(kind)
      : db
          .prepare<[], SavedPhraseRow>(
            `SELECT ${SAVED_PHRASE_COLS} FROM saved_phrases ORDER BY updated_at DESC`,
          )
          .all();
  const response: SavedPhrasesResponse = { phrases: rows.map(toSummary) };
  res.json(response);
});

app.get('/api/phrases/:id', (req, res) => {
  const db = getDb();
  const row = db
    .prepare<[string], SavedPhraseRow>(
      `SELECT ${SAVED_PHRASE_COLS} FROM saved_phrases WHERE id = ?`,
    )
    .get(req.params.id);
  if (!row) {
    res.status(404).json({ error: 'Phrase not found' });
    return;
  }
  res.json(toRecord(row));
});

app.post('/api/phrases', (req, res) => {
  const body = req.body as SavePhraseRequest;
  const name = body?.name?.trim();
  const kind: SavedPhraseKind = body?.kind === 'period' ? 'period' : 'phrase';
  if (!name || !body?.workspace || !Array.isArray(body.workspace.containers)) {
    res.status(400).json({ error: 'name and workspace.containers are required' });
    return;
  }

  const now = new Date().toISOString();
  const id = randomUUID();
  // Persist the full versioned document so an exported file and a DB row are identical.
  const doc: SavedPhrase = {
    format: SAVED_PHRASE_FORMAT,
    version: SAVED_PHRASE_VERSION,
    kind,
    savedAt: now,
    name,
    workspace: body.workspace,
  };

  const db = getDb();
  db.prepare(
    `INSERT INTO saved_phrases (id, name, kind, author, version, payload, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(id, name, kind, DEFAULT_AUTHOR, SAVED_PHRASE_VERSION, JSON.stringify(doc), now, now);

  const record: SavedPhraseRecord = {
    id,
    name,
    kind,
    author: DEFAULT_AUTHOR,
    version: SAVED_PHRASE_VERSION,
    createdAt: now,
    updatedAt: now,
    workspace: body.workspace,
  };
  res.status(201).json(record);
});

app.delete('/api/phrases/:id', (req, res) => {
  const db = getDb();
  const info = db.prepare('DELETE FROM saved_phrases WHERE id = ?').run(req.params.id);
  if (info.changes === 0) {
    res.status(404).json({ error: 'Phrase not found' });
    return;
  }
  res.status(204).end();
});

const PORT = process.env['PORT'] ?? 3001;
app.listen(PORT, () => {
  console.log(`Signi backend listening on http://localhost:${PORT}`);
});
