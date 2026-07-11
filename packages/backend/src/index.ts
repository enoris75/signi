import express from 'express';
import cors from 'cors';
import { getDb } from './db.js';
import { lookupLexicalEntry } from './lexicon.js';
import { translate } from '@signi/engine';
import { PAYOFF_PLAN } from './payoff.js';
import { LANGUAGE_NAME_CONCEPTS } from './languages.js';
import { randomUUID } from 'crypto';
import type {
  ConceptsResponse,
  LanguageCode,
  TranslateRequest,
  TranslateResponse,
  GrammaticalRole,
  SavePhraseRequest,
  SavedPhrase,
  SavedPhraseKind,
  SavedPhraseRecord,
  SavedPhraseSummary,
  SavedPhrasesResponse,
} from '@signi/shared';
import { SAVED_PHRASE_FORMAT, SAVED_PHRASE_VERSION } from '@signi/shared';

const app = express();
app.use(cors());
app.use(express.json());

// Ensure DB is initialized on startup
getDb();

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

const EN_LABEL_SQL = `
  SELECT concept_id, en_word FROM (
    SELECT cpl.concept_id, pl.lemma AS en_word
    FROM pronoun_lexemes pl
    JOIN concept_pronoun_links cpl ON cpl.lexeme_id = pl.id AND cpl.is_primary = 1
    WHERE pl.language = 'en'
    UNION ALL
    SELECT cvl.concept_id, vl.lemma AS en_word
    FROM verb_lexemes vl
    JOIN concept_verb_links cvl ON cvl.lexeme_id = vl.id AND cvl.is_primary = 1
    WHERE vl.language = 'en'
    UNION ALL
    SELECT cnl.concept_id, nl.singular AS en_word
    FROM noun_lexemes nl
    JOIN concept_noun_links cnl ON cnl.lexeme_id = nl.id AND cnl.is_primary = 1
    WHERE nl.language = 'en'
    UNION ALL
    SELECT cal.concept_id, al.lemma AS en_word
    FROM adjective_lexemes al
    JOIN concept_adjective_links cal ON cal.lexeme_id = al.id AND cal.is_primary = 1
    WHERE al.language = 'en'
    UNION ALL
    SELECT cal.concept_id, al.lemma AS en_word
    FROM adverb_lexemes al
    JOIN concept_adverb_links cal ON cal.lexeme_id = al.id AND cal.is_primary = 1
    WHERE al.language = 'en'
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

  const labelRows = db.prepare<[], { concept_id: string; en_word: string }>(EN_LABEL_SQL).all();
  const labels = new Map(labelRows.map((r) => [r.concept_id, r.en_word]));

  const genderedNounRows = db.prepare<[], { concept_id: string }>(GENDERED_NOUNS_SQL).all();
  const genderedNouns = new Set(genderedNounRows.map((r) => r.concept_id));

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
      label: labels.get(r.id),
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
    })),
  };
  res.json(response);
});

app.post('/api/translate', (req, res) => {
  const body = req.body as TranslateRequest;
  // A subject is always required; the verb phrase is optional (a verbless period is a
  // bare noun phrase, e.g. a newspaper title like "breaking news").
  if (!body?.plan?.subject?.concept) {
    res.status(400).json({ error: 'plan.subject.concept is required' });
    return;
  }

  const translations = translate(body.plan, lookupLexicalEntry);
  const response: TranslateResponse = { translations };
  res.json(response);
});

// The engine-rendered payoff/tagline in all seven languages (see payoff.ts for the period
// that defines it). Lets the header show the tagline in the chosen UI language without the
// frontend hardcoding either the strings or the plan.
app.get('/api/payoff', (_req, res) => {
  const translations = translate(PAYOFF_PLAN, lookupLexicalEntry);
  const response: TranslateResponse = { translations };
  res.json(response);
});

// Each UI language's name rendered by the engine in every language, so the header selector
// can label the options in the current UI language (see languages.ts). Returns, per
// selectable language code, that language's name-noun translated into all seven.
app.get('/api/languages', (_req, res) => {
  const languages = (Object.keys(LANGUAGE_NAME_CONCEPTS) as LanguageCode[]).map((code) => ({
    code,
    translations: translate(
      { subject: { concept: LANGUAGE_NAME_CONCEPTS[code], definiteness: 'bare' } },
      lookupLexicalEntry,
    ),
  }));
  res.json({ languages });
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
