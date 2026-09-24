import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from './db.js';
import { isSeededConcept, lookupLexicalEntry, notingLookup } from './lexicon.js';
import { planError } from './planError.js';
import { translate } from '@signi/engine';
import { buildUiStrings } from './uiStrings.js';
import { buildConceptDefinitions } from './definitions.js';
import { listConcepts } from './conceptList.js';
import { randomUUID } from 'crypto';
import type {
  ConceptsResponse,
  UiStringsResponse,
  TranslateRequest,
  TranslateResponse,
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

// Engine-composed concept definitions, rendered once from the seed's `definition` plans into
// every language (like the UI-string bundle). A plan that fails to render in some language throws
// here, on boot, rather than serving a broken tooltip. Merged over the stored literals per request.
const CONCEPT_DEFINITIONS = buildConceptDefinitions();

app.get('/api/concepts', (req, res) => {
  const role = req.query['role'] as string | undefined;
  const response: ConceptsResponse = { concepts: listConcepts({ role, composedDefinitions: CONCEPT_DEFINITIONS }) };
  res.json(response);
});

app.post('/api/translate', (req, res) => {
  const body = req.body as TranslateRequest;
  // A subject is always required, on the top clause and on every clause it links (see
  // `planError`); the verb phrase is optional (a verbless period is a bare noun phrase, e.g. a
  // newspaper title like "breaking news").
  const malformed = planError(body?.plan, (id) => (isSeededConcept(id) ? lookupLexicalEntry(id, 'en')?.forms : undefined));
  if (malformed) {
    res.status(400).json({ error: malformed });
    return;
  }

  // The engine renders a concept the lexicon cannot find as an empty word, so a plan naming one
  // would come back as a 200 with a hole in it; the noting lookup collects every id it asked for
  // that has no concept row.
  const { lookup, unknown } = notingLookup();
  const translations = translate(body.plan, lookup);
  if (unknown.size > 0) {
    const ids = [...unknown];
    res.status(400).json({ error: `Unknown concept${ids.length > 1 ? 's' : ''}: ${ids.join(', ')}` });
    return;
  }
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
  const name = typeof body?.name === 'string' ? body.name.trim() : undefined;
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

// Unknown API paths are a 404, not the SPA shell — returning HTML for a missing endpoint
// would mask bugs and confuse fetch callers expecting JSON. Every method, not just GET: a
// PUT or POST to an unrouted path would otherwise reach Express's HTML "Cannot PUT" page.
app.all('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Static frontend ──────────────────────────────────────────────────────────
// In production the built SPA is served from this same origin, so the deploy needs to
// expose only one port. The frontend calls the API at the relative /api path, which the
// routes above already answer; every other GET falls through to index.html so client-side
// routing survives a hard refresh. In dev this directory doesn't exist and Vite serves the
// frontend itself — express.static just 404s, and the catch-all below is never reached
// because dev requests go to Vite's port, not here.
const frontendDist = path.join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// ── Errors ───────────────────────────────────────────────────────────────────
// Without this, Express answers a thrown error (or body-parser's 400 for malformed JSON) with
// its HTML page, stack trace included unless NODE_ENV is production. Answer JSON instead, and
// never the stack: only a message http-errors marks safe to expose (a client error's) goes out.
app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  const { status, statusCode, expose, message } = (err ?? {}) as {
    status?: unknown;
    statusCode?: unknown;
    expose?: unknown;
    message?: unknown;
  };
  const code = typeof status === 'number' ? status : typeof statusCode === 'number' ? statusCode : 500;
  const httpStatus = code >= 400 && code < 600 ? code : 500;
  if (httpStatus >= 500) console.error(err);
  const error =
    expose === true && typeof message === 'string'
      ? message
      : httpStatus >= 500
        ? 'Internal server error'
        : 'Bad request';
  res.status(httpStatus).json({ error });
});

const PORT = process.env['PORT'] ?? 3001;
app.listen(PORT, () => {
  console.log(`Signi backend listening on http://localhost:${PORT}`);
});
