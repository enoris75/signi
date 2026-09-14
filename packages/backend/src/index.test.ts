import { afterAll, afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import http from 'node:http';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { translate } from '@signi/engine';
import { SAVED_PHRASE_FORMAT, SAVED_PHRASE_VERSION, UI_STRINGS } from '@signi/shared';
import type {
  Concept,
  ConceptsResponse,
  PhrasePlan,
  SavedPhraseRecord,
  SavedPhrasesResponse,
  SerializedWorkspace,
  UiStringDef,
} from '@signi/shared';
import { concepts } from './concepts/index.js';
import { getDb } from './db.js';
import { lookupLexicalEntry } from './lexicon.js';
import { buildUiStrings } from './uiStrings.js';

// index.ts builds the app, renders its boot-time bundles and starts listening all on import, and
// exports nothing. So these specs drive it as a client would: over HTTP, against a server on a free
// port (PORT=0), found by catching the server express creates when it calls `app.listen`. The
// database is this file's in-memory one, seeded first — the boot renders need the corpus.
//
// The engine renders for real; the spy lets a spec make it throw, as an unexpected error would.
vi.mock('@signi/engine', async (importOriginal) => {
  const engine = await importOriginal<typeof import('@signi/engine')>();
  return { ...engine, translate: vi.fn(engine.translate) };
});
vi.stubEnv('PORT', '0');
const createServer = vi.spyOn(http, 'createServer');
vi.spyOn(console, 'log').mockImplementation(() => {});
// The error middleware logs a server error; keep that out of the test output.
const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
await import('./seed.js');
await import('./index.js');

const server = createServer.mock.results[0]!.value as http.Server;
if (!server.listening) await once(server, 'listening');
const BASE = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

afterAll(() => {
  server.close();
});

const db = getDb();

const get = (path: string, init?: RequestInit) => fetch(`${BASE}${path}`, init);
const post = (path: string, body: unknown) =>
  fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
const del = (path: string) => fetch(`${BASE}${path}`, { method: 'DELETE' });

describe('GET /api/concepts', () => {
  const list = async (query = ''): Promise<Concept[]> => {
    const res = await get(`/api/concepts${query}`);
    expect(res.status).toBe(200);
    return ((await res.json()) as ConceptsResponse).concepts;
  };
  const find = async (id: string): Promise<Concept> => (await list()).find((c) => c.id === id)!;

  // A lexical sense is the engine's to select (KNOW_ACQUAINTED for KNOW with an object, A131), so no
  // picker offers it.
  const offered = concepts.filter((c) => !c.senseOf);

  test('lists every concept but the lexical senses, ordered by role and then id', async () => {
    const ids = (await list()).map((c) => `${c.role}:${c.id}`);
    expect(offered.length).toBeLessThan(concepts.length);
    expect(ids).toHaveLength(offered.length);
    expect(ids).toEqual(offered.map((c) => `${c.role}:${c.id}`).sort());
  });

  test('leaves a lexical sense out, whatever the role asked for', async () => {
    expect((await list()).map((c) => c.id)).not.toContain('KNOW_ACQUAINTED');
    expect((await list('?role=verb')).map((c) => c.id)).not.toContain('KNOW_ACQUAINTED');
    expect((await list('?role=verb')).map((c) => c.id)).toContain('KNOW');
  });

  test('narrows to one role, ordered by id', async () => {
    const nouns = await list('?role=noun');
    expect(nouns.map((c) => c.id)).toEqual(
      offered.filter((c) => c.role === 'noun').map((c) => c.id).sort(),
    );
  });

  test('lists nothing for a role that does not exist', async () => {
    expect(await list('?role=article')).toEqual([]);
  });

  test('describes a noun with its labels, readings, engine-composed definitions and hypernym', async () => {
    expect(await find('CAT')).toEqual({
      id: 'CAT',
      role: 'noun',
      description: 'domestic feline animal',
      definitions: {
        en: 'a small mammal',
        it: 'un piccolo mammifero',
        fr: 'un petit mammifère',
        de: 'ein kleines Säugetier',
        es: 'un mamífero pequeño',
        ja: '小さい哺乳類',
        pt: 'um mamífero pequeno',
      },
      label: 'cat',
      labels: { en: 'cat', it: 'gatto', fr: 'chat', de: 'Kater', es: 'gato', ja: '猫', pt: 'gato' },
      readings: { ja: 'ねこ' },
      emoji: '🐱',
      gendered: true,
      isA: 'MAMMAL',
    });
  });

  test('describes a verb with its transitivity and complements', async () => {
    expect(await find('CUT')).toMatchObject({
      role: 'verb',
      transitivity: 'transitive',
      complements: ['manner', 'instrumental', 'terminus', 'cause', 'locative'],
    });
  });

  test('describes a pronoun with its person and number', async () => {
    expect(await find('THIRD_PERSON')).toMatchObject({ label: 'he', person: '3', number: 'singular' });
  });

  test('carries a concept\'s flags and relations only when set', async () => {
    expect(await find('WATER')).toMatchObject({ countable: false });
    expect(await find('MUST')).toMatchObject({ modal: true, synonym: 'have to' });
    expect(await find('SPEED')).toMatchObject({ mannerRelation: 'measure' });
    expect(await find('SIZE')).toMatchObject({ dimensionRelation: 'extent' });

    const divide = await find('DIVIDE');
    for (const key of ['countable', 'modal', 'synonym', 'mannerRelation', 'dimensionRelation', 'person', 'number', 'gendered', 'isA']) {
      expect(divide).not.toHaveProperty(key);
    }
  });

  test('describes a concept with no words yet by its row alone', async () => {
    db.prepare("INSERT INTO semantic_concepts (id, role, description) VALUES ('ZEBRA', 'noun', 'a striped horse')").run();
    try {
      expect(await find('ZEBRA')).toEqual({ id: 'ZEBRA', role: 'noun', description: 'a striped horse' });
    } finally {
      db.prepare("DELETE FROM semantic_concepts WHERE id = 'ZEBRA'").run();
    }
  });

  // A140: a German complement name is stored as its head noun, with a declining adjective and a fixed
  // genitive around it. The picker still shows the whole name.
  test('labels a noun by its citation where one is seeded', async () => {
    const locative = await find('LOCATIVE');
    expect(locative.labels?.de).toBe('adverbiale Bestimmung des Ortes');
    expect(locative.labels?.it).toBe('complemento di stato in luogo');
    expect((await find('ADVERBIAL_OF_MANNER')).labels?.de).toBe('adverbiale Bestimmung der Art und Weise');
  });

  test('gives no reading for a word already written in kana', async () => {
    const become = await find('BECOME');
    expect(become.labels?.ja).toBe('なる');
    expect(become).not.toHaveProperty('readings');
  });

  test('falls back to the stored literal for a concept without a definition plan', async () => {
    expect((await find('MUST')).definitions).toEqual({ en: 'to be obliged to; necessity' });
  });

  test('omits definitions for a concept with neither a plan nor a stored literal', async () => {
    const [row] = db
      .prepare<[], { definition: string }>("SELECT definition FROM concept_definitions WHERE concept_id = 'MUST'")
      .all();
    db.prepare("DELETE FROM concept_definitions WHERE concept_id = 'MUST'").run();
    try {
      expect(await find('MUST')).not.toHaveProperty('definitions');
    } finally {
      db.prepare("INSERT INTO concept_definitions (concept_id, language, definition) VALUES ('MUST', 'en', ?)").run(row!.definition);
    }
  });

  test('allows any origin', async () => {
    expect((await get('/api/concepts?role=adverb')).headers.get('access-control-allow-origin')).toBe('*');
  });
});

describe('POST /api/translate', () => {
  const PLAN: PhrasePlan = { subject: { concept: 'CAT' }, verbPhrase: { verb: 'EAT' } };

  test('translates a plan into every language, as the engine renders it', async () => {
    const res = await post('/api/translate', { plan: PLAN });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ translations: translate(PLAN, lookupLexicalEntry) });
  });

  test('translates a verbless plan, a bare noun phrase', async () => {
    const plan: PhrasePlan = { subject: { concept: 'CAT' } };
    const res = await post('/api/translate', { plan });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ translations: translate(plan, lookupLexicalEntry) });
  });

  test('translates a coordinated subject', async () => {
    const plan: PhrasePlan = {
      subject: { conjuncts: [{ concept: 'CAT' }, { concept: 'DOG' }], conjunction: 'and' },
      verbPhrase: { verb: 'EAT' },
    };
    const res = await post('/api/translate', { plan });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ translations: translate(plan, lookupLexicalEntry) });
  });

  test.each([
    ['no body', undefined],
    ['no plan', {}],
    ['no subject', { plan: { verbPhrase: { verb: 'EAT' } } }],
    ['a subject without a concept', { plan: { subject: {} } }],
    ['a coordinated subject whose first conjunct has no concept', { plan: { subject: { conjuncts: [{}, { concept: 'DOG' }], conjunction: 'and' } } }],
    ['a coordinated subject with no conjuncts', { plan: { subject: { conjuncts: [], conjunction: 'and' } } }],
  ])('rejects a request with %s', async (_, body) => {
    const res = await post('/api/translate', body);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'plan.subject.concept is required' });
  });
});

describe('GET /api/ui-strings', () => {
  test('serves the UI-string bundle rendered at boot', async () => {
    const res = await get('/api/ui-strings');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ strings: buildUiStrings() });
  });

  test('answers a repeat fetch with 304 Not Modified', async () => {
    const etag = (await get('/api/ui-strings')).headers.get('etag');
    expect(etag).toBeTruthy();
    // Not fetch(): per the Fetch spec it adds `Cache-Control: no-cache` to any request carrying
    // If-None-Match, which rightly makes express skip the freshness check.
    const status = await new Promise<number | undefined>((resolve, reject) => {
      http
        .get(`${BASE}/api/ui-strings`, { headers: { 'if-none-match': etag! } }, (res) => {
          res.resume();
          resolve(res.statusCode);
        })
        .on('error', reject);
    });
    expect(status).toBe(304);
  });
});

describe('saved phrases', () => {
  const WORKSPACE: SerializedWorkspace = {
    containers: [{ id: 'c1', selection: { subject: 'CAT', verb: 'EAT' } }],
    links: [],
  };
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

  const save = async (body: unknown): Promise<SavedPhraseRecord> => {
    const res = await post('/api/phrases', body);
    expect(res.status).toBe(201);
    return (await res.json()) as SavedPhraseRecord;
  };

  beforeEach(() => {
    db.prepare('DELETE FROM saved_phrases').run();
  });

  describe('POST /api/phrases', () => {
    test('saves a phrase and returns its record', async () => {
      const before = Date.now();
      const record = await save({ name: 'cat eats', kind: 'phrase', workspace: WORKSPACE });

      expect(record).toEqual({
        id: expect.stringMatching(UUID),
        name: 'cat eats',
        kind: 'phrase',
        author: 'system',
        version: SAVED_PHRASE_VERSION,
        createdAt: record.createdAt,
        updatedAt: record.createdAt,
        workspace: WORKSPACE,
      });
      expect(Date.parse(record.createdAt)).toBeGreaterThanOrEqual(before);
      expect(new Date(record.createdAt).toISOString()).toBe(record.createdAt);
    });

    test('stores the full versioned document as the payload', async () => {
      const record = await save({ name: 'cat eats', kind: 'period', workspace: WORKSPACE });
      const row = db
        .prepare<[string], { payload: string }>('SELECT payload FROM saved_phrases WHERE id = ?')
        .get(record.id)!;
      expect(JSON.parse(row.payload)).toEqual({
        format: SAVED_PHRASE_FORMAT,
        version: SAVED_PHRASE_VERSION,
        kind: 'period',
        savedAt: record.createdAt,
        name: 'cat eats',
        workspace: WORKSPACE,
      });
    });

    test('trims the name', async () => {
      expect((await save({ name: '  cat eats \n', kind: 'phrase', workspace: WORKSPACE })).name).toBe('cat eats');
    });

    test.each([
      ['period', 'period'],
      ['phrase', 'phrase'],
      [undefined, 'phrase'],
      ['sentence', 'phrase'],
    ])('saves kind %s as a %s', async (kind, expected) => {
      expect((await save({ name: 'n', kind, workspace: WORKSPACE })).kind).toBe(expected);
    });

    test('gives every save its own id', async () => {
      const a = await save({ name: 'n', kind: 'phrase', workspace: WORKSPACE });
      const b = await save({ name: 'n', kind: 'phrase', workspace: WORKSPACE });
      expect(a.id).not.toBe(b.id);
    });

    test.each([
      ['no body', undefined],
      ['no name', { workspace: WORKSPACE }],
      ['a blank name', { name: '   ', workspace: WORKSPACE }],
      ['no workspace', { name: 'n' }],
      ['a workspace without containers', { name: 'n', workspace: { links: [] } }],
      ['containers that are not a list', { name: 'n', workspace: { containers: {}, links: [] } }],
    ])('rejects a save with %s', async (_, body) => {
      const res = await post('/api/phrases', body);
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: 'name and workspace.containers are required' });
      expect(db.prepare('SELECT COUNT(*) AS n FROM saved_phrases').get()).toEqual({ n: 0 });
    });
  });

  describe('GET /api/phrases', () => {
    const insert = (id: string, kind: string, updatedAt: string) =>
      db
        .prepare(
          `INSERT INTO saved_phrases (id, name, kind, author, version, payload, created_at, updated_at)
           VALUES (?, ?, ?, 'system', 6, ?, '2026-01-01T00:00:00.000Z', ?)`,
        )
        .run(id, `name ${id}`, kind, JSON.stringify({ workspace: WORKSPACE }), updatedAt);

    const ids = async (query = '') => {
      const res = await get(`/api/phrases${query}`);
      expect(res.status).toBe(200);
      return ((await res.json()) as SavedPhrasesResponse).phrases.map((p) => p.id);
    };

    beforeEach(() => {
      insert('old-period', 'period', '2026-01-01T00:00:00.000Z');
      insert('new-phrase', 'phrase', '2026-03-01T00:00:00.000Z');
      insert('mid-period', 'period', '2026-02-01T00:00:00.000Z');
    });

    test('lists every save, most recently updated first', async () => {
      expect(await ids()).toEqual(['new-phrase', 'mid-period', 'old-period']);
    });

    test('lists summaries, without the workspace', async () => {
      const { phrases } = (await (await get('/api/phrases')).json()) as SavedPhrasesResponse;
      expect(phrases[0]).toEqual({
        id: 'new-phrase',
        name: 'name new-phrase',
        kind: 'phrase',
        author: 'system',
        version: 6,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-03-01T00:00:00.000Z',
      });
    });

    test.each([
      ['period', ['mid-period', 'old-period']],
      ['phrase', ['new-phrase']],
    ])('narrows to kind %s', async (kind, expected) => {
      expect(await ids(`?kind=${kind}`)).toEqual(expected);
    });

    test('ignores an unknown kind', async () => {
      expect(await ids('?kind=sentence')).toEqual(['new-phrase', 'mid-period', 'old-period']);
    });

    test('lists nothing when nothing is saved', async () => {
      db.prepare('DELETE FROM saved_phrases').run();
      expect(await ids()).toEqual([]);
    });
  });

  describe('GET /api/phrases/:id', () => {
    test('returns the saved record with its workspace', async () => {
      const saved = await save({ name: 'cat eats', kind: 'period', workspace: WORKSPACE });
      const res = await get(`/api/phrases/${saved.id}`);
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(saved);
    });

    test('is 404 for an unknown id', async () => {
      const res = await get('/api/phrases/nope');
      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'Phrase not found' });
    });
  });

  describe('DELETE /api/phrases/:id', () => {
    test('deletes a save', async () => {
      const saved = await save({ name: 'cat eats', kind: 'phrase', workspace: WORKSPACE });
      const res = await del(`/api/phrases/${saved.id}`);
      expect(res.status).toBe(204);
      expect(await res.text()).toBe('');
      expect((await get(`/api/phrases/${saved.id}`)).status).toBe(404);
    });

    test('deletes only the save it names', async () => {
      const keep = await save({ name: 'keep', kind: 'phrase', workspace: WORKSPACE });
      const drop = await save({ name: 'drop', kind: 'phrase', workspace: WORKSPACE });
      await del(`/api/phrases/${drop.id}`);
      expect((await get(`/api/phrases/${keep.id}`)).status).toBe(200);
    });

    test('is 404 for an unknown id', async () => {
      const res = await del('/api/phrases/nope');
      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'Phrase not found' });
    });
  });
});

describe('unknown API paths', () => {
  test('are a JSON 404, not the app shell', async () => {
    const res = await get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toMatch(/^application\/json/);
    expect(await res.json()).toEqual({ error: 'Not found' });
  });
});

// ── Known bugs ───────────────────────────────────────────────────────────────
// Each `test.fails` asserts the correct behaviour and is catalogued in docs/bugs/A-must-fix/. When a
// fix makes one pass, Vitest reports "expected to fail but passed": delete the `.fails` marker.

// A144. A German noun can carry an inherent adjective that the engine declines (YOUNG_WOMAN is "Frau"
// with `adjective: 'jung'`: "die junge Frau", "den jungen Frauen"). The picker's label is the lexeme's
// singular alone, so it shows "Frau", which is WOMAN's word, not YOUNG_WOMAN's.
describe('known bugs: the German label of a noun with an inherent adjective', () => {
  const concept = async (id: string): Promise<Concept> =>
    ((await (await get('/api/concepts?role=noun')).json()) as ConceptsResponse).concepts.find((c) => c.id === id)!;

  test.fails('labels YOUNG_WOMAN with its adjective', async () => {
    expect((await concept('YOUNG_WOMAN')).labels?.de).toBe('junge Frau');
  });

  // Regression guard: the other languages seed the whole name, and so do A140's complement names.
  test('regression: the other languages and the complement names already read right', async () => {
    expect((await concept('YOUNG_WOMAN')).labels).toMatchObject({ en: 'young woman', fr: 'jeune femme', it: 'giovane', ja: '若い女性' });
    expect((await concept('LOCATIVE')).labels?.de).toBe('adverbiale Bestimmung des Ortes');
  });
});

describe('known bugs: translating a plan that names an unseeded concept', () => {
  const expectRejected = async (plan: unknown, naming?: string) => {
    const res = await post('/api/translate', { plan });
    expect(res.status).toBe(400);
    const { error } = (await res.json()) as { error: string };
    if (naming) expect(error).toContain(naming);
  };

  test('rejects the plan, naming the concept, wherever the concept stands', async () => {
    await expectRejected({ subject: { concept: 'UNICORN' }, verbPhrase: { verb: 'EAT' } }, 'UNICORN');
    await expectRejected({ subject: { concept: 'CAT' }, verbPhrase: { verb: 'UNICORN' } }, 'UNICORN');
    await expectRejected(
      { subject: { concept: 'CAT' }, verbPhrase: { verb: 'EAT' }, directObject: { concept: 'UNICORN' } },
      'UNICORN',
    );
    await expectRejected({ subject: { concept: 'CAT', adjectives: ['UNICORN'] }, verbPhrase: { verb: 'EAT' } }, 'UNICORN');
    await expectRejected(
      { subject: { conjuncts: [{ concept: 'CAT' }, { concept: 'UNICORN' }], conjunction: 'and' }, verbPhrase: { verb: 'EAT' } },
      'UNICORN',
    );
    await expectRejected({ subject: { concept: 42 } });
  });

  test('rejects an unseeded adverb or complement too, naming every unknown concept once', async () => {
    await expectRejected({ subject: { concept: 'CAT' }, verbPhrase: { verb: 'EAT', modifier: 'UNICORN' } }, 'UNICORN');
    await expectRejected(
      { subject: { concept: 'CAT' }, verbPhrase: { verb: 'EAT' }, complements: { locative: { phrase: { concept: 'UNICORN' } } } },
      'UNICORN',
    );

    const res = await post('/api/translate', {
      plan: { subject: { concept: 'UNICORN' }, verbPhrase: { verb: 'GRIFFIN' }, directObject: { concept: 'UNICORN' } },
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Unknown concepts: UNICORN, GRIFFIN' });
  });

  test('accepts a seeded concept that has no word in some language', async () => {
    db.prepare("INSERT INTO semantic_concepts (id, role, description) VALUES ('ZEBRA', 'noun', 'a striped horse')").run();
    try {
      const plan: PhrasePlan = { subject: { concept: 'ZEBRA' }, verbPhrase: { verb: 'EAT' } };
      const res = await post('/api/translate', { plan });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ translations: translate(plan, lookupLexicalEntry) });
    } finally {
      db.prepare("DELETE FROM semantic_concepts WHERE id = 'ZEBRA'").run();
    }
  });

  test('regression: every plan the app renders itself is accepted', async () => {
    const plans = [
      ...concepts.flatMap((c) => (c.definition ? [c.definition] : [])),
      ...Object.values(UI_STRINGS as Record<string, UiStringDef>).flatMap((d) => (d.plan ? [d.plan] : [])),
    ];
    const rejected: string[] = [];
    for (const plan of plans) {
      const res = await post('/api/translate', { plan });
      if (res.status !== 200) rejected.push(`${res.status} ${JSON.stringify(plan)}`);
    }
    expect(rejected).toEqual([]);
  });
});

describe('known bugs: a request field of the wrong JSON type', () => {
  const WORKSPACE: SerializedWorkspace = { containers: [], links: [] };

  const expectRejected = async (path: string, body: unknown) => {
    const res = await post(path, body);
    expect(res.status).toBe(400);
    expect(typeof ((await res.json()) as { error?: unknown }).error).toBe('string');
  };

  test('is a 400 with the route\'s JSON error, not a crash', async () => {
    for (const name of [42, true, {}, ['cat eats']]) {
      await expectRejected('/api/phrases', { name, kind: 'phrase', workspace: WORKSPACE });
    }
    for (const subject of ['CAT', 5]) {
      await expectRejected('/api/translate', { plan: { subject } });
    }
    expect(db.prepare('SELECT COUNT(*) AS n FROM saved_phrases').get()).toEqual({ n: 0 });
  });

  test('answers with the same error a missing field gets', async () => {
    const phrases = await post('/api/phrases', { name: 42, kind: 'phrase', workspace: WORKSPACE });
    expect(await phrases.json()).toEqual({ error: 'name and workspace.containers are required' });
    for (const subject of [true, []]) {
      const res = await post('/api/translate', { plan: { subject } });
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: 'plan.subject.concept is required' });
    }
  });
});

describe('known bugs: API errors sent as an HTML page', () => {
  afterEach(() => {
    vi.mocked(translate).mockReset();
  });

  const expectJsonError = async (res: Response, statuses: number[]) => {
    expect(statuses).toContain(res.status);
    expect(res.headers.get('content-type')).toMatch(/^application\/json/);
    const text = await res.text();
    expect(typeof (JSON.parse(text) as { error?: unknown }).error).toBe('string');
    // No stack frame ("at handler (/path/index.ts:321:28)") reaches the client.
    expect(text).not.toMatch(/:\d+:\d+\)/);
  };

  test('answers an unexpected error, malformed JSON and an unrouted method with a JSON error', async () => {
    vi.mocked(translate).mockImplementationOnce(() => {
      throw new Error('boom');
    });
    await expectJsonError(await post('/api/translate', { plan: { subject: { concept: 'CAT' } } }), [500]);

    for (const path of ['/api/translate', '/api/phrases']) {
      const res = await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{"name": ',
      });
      await expectJsonError(res, [400]);
    }

    await expectJsonError(await fetch(`${BASE}/api/phrases/some-id`, { method: 'PUT' }), [404, 405]);
    await expectJsonError(await fetch(`${BASE}/api/concepts`, { method: 'POST' }), [404, 405]);
  });

  test('keeps an unexpected error\'s message on the server, and a client error\'s in the response', async () => {
    consoleError.mockClear();
    vi.mocked(translate).mockImplementationOnce(() => {
      throw new Error('secret detail');
    });
    const failed = await post('/api/translate', { plan: { subject: { concept: 'CAT' } } });
    expect(failed.status).toBe(500);
    expect(await failed.json()).toEqual({ error: 'Internal server error' });
    expect(consoleError).toHaveBeenCalledWith(expect.objectContaining({ message: 'secret detail' }));

    consoleError.mockClear();
    const malformed = await fetch(`${BASE}/api/translate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"name": ',
    });
    expect(malformed.status).toBe(400);
    expect(((await malformed.json()) as { error: string }).error).toMatch(/JSON/);
    expect(consoleError).not.toHaveBeenCalled();
  });

  test.each(['PUT', 'POST', 'PATCH', 'DELETE'])('answers %s on an unknown API path like a GET', async (method) => {
    const res = await fetch(`${BASE}/api/nope`, { method });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not found' });
  });
});
