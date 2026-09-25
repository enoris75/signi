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
  TranslateResponse,
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

  // P09-E30: the interjection is a role like the others to the API — no picker asks for it yet.
  test('lists an interjection under its own role, with its labels', async () => {
    const [hey] = await list('?role=interjection');
    expect(hey).toMatchObject({
      id: 'HEY', role: 'interjection', emoji: '👋',
      labels: { en: 'hey', it: 'ehi', fr: 'hé', de: 'hey', es: 'oye', ja: 'ねえ', pt: 'ei' },
      // Localization A34: composed like any other role's, ready for the day a picker lists it.
      definitions: {
        en: 'a word with which one calls a person',
        it: 'una parola con la quale si chiama una persona',
        fr: 'un mot avec lequel on appelle une personne',
        de: 'ein Wort, mit dem man eine Person ruft',
        es: 'una palabra con la que se llama a una persona',
        ja: '人を呼ぶ単語',
        pt: 'uma palavra com a qual se chama uma pessoa',
      },
    });
    expect(hey!.readings).toBeUndefined();
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
        gsw: 'es chliines Süügetier',
      },
      // The line it is written in (P13), which the console's /define opens.
      definitionText: '/subj ( MAMMAL /adj SMALL /a )',
      label: 'cat',
      labels: { en: 'cat', it: 'gatto', fr: 'chat', de: 'Kater', es: 'gato', ja: '猫', pt: 'gato', gsw: 'Chater' },
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
    // The clause a verb takes as its object (P09-E12 D9), carried as `modal` is.
    expect(await find('SAY')).toMatchObject({ clauseObject: 'content' });
    expect(await find('NEED')).toMatchObject({ clauseObject: 'infinitive' });
    expect((await find('EAT')).clauseObject).toBeUndefined();
    expect(await find('SPEED')).toMatchObject({ mannerRelation: 'measure' });
    expect(await find('SIZE')).toMatchObject({ dimensionRelation: 'extent' });
    // A164: the canvas withdraws the determiner of the alarm a cry raises, and it reads both words.
    expect(await find('WOLF')).toMatchObject({ alarm: true });
    expect(await find('CRY_OUT')).toMatchObject({ alarmCry: true });

    const divide = await find('DIVIDE');
    for (const key of ['countable', 'modal', 'synonym', 'mannerRelation', 'dimensionRelation', 'alarm', 'alarmCry', 'person', 'number', 'gendered', 'isA', 'aliases', 'glosses']) {
      expect(divide).not.toHaveProperty(key);
    }
  });

  // P09-E23: the other words that find a concept, search-only — `labels` stays the primary lemma.
  test('carries a concept\'s aliases in every language, and labels it by its primary still', async () => {
    const begin = await find('BEGIN');
    expect(begin.aliases).toEqual({ it: ['cominciare'], de: ['anfangen'], es: ['comenzar'] });
    expect(begin.labels).toEqual({ en: 'begin', it: 'iniziare', fr: 'commencer', de: 'beginnen', es: 'empezar', pt: 'começar', ja: '始まる', gsw: 'aafange' });
    expect(begin.label).toBe('begin');
    expect(await find('SPEAK')).toMatchObject({ label: 'speak', labels: { en: 'speak' }, aliases: { en: ['talk'] } });
    expect(await find('RETURN')).toMatchObject({ label: 'return', aliases: { en: ['come back'] } });
    // The alias reaches the role-narrowed list too.
    expect((await list('?role=verb')).find((c) => c.id === 'SPEAK')?.aliases).toEqual({ en: ['talk'] });
  });

  // BEGIN is START's word in five languages, so the picker glosses it there as English does.
  test('carries a concept\'s glosses in the languages other than English', async () => {
    const begin = await find('BEGIN');
    expect(begin.synonym).toBe('get under way');
    expect(begin.glosses).toEqual({ it: 'avere inizio', fr: 'débuter', de: 'seinen Anfang nehmen', es: 'iniciarse', pt: 'ter início' });
    expect(begin.definitions?.it).toBe('avere un inizio');
    expect((await list('?role=verb')).find((c) => c.id === 'BEGIN')?.glosses?.it).toBe('avere inizio');
    expect(await find('START')).not.toHaveProperty('glosses');
  });

  test('lists every seeded alias, and only those', async () => {
    const served = Object.fromEntries((await list()).filter((c) => c.aliases).map((c) => [c.id, c.aliases]));
    const seeded = Object.fromEntries(offered.filter((c) => c.aliases).map((c) => [c.id, c.aliases]));
    expect(served).toEqual(seeded);
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

  // BE has no genus to be glossed against, so it stays on its English literal by design (localization C08).
  test('falls back to the stored literal for a concept without a definition plan', async () => {
    expect((await find('BE')).definitions).toEqual({ en: 'to have a quality or state; the copula' });
  });

  test('omits definitions for a concept with neither a plan nor a stored literal', async () => {
    const [row] = db
      .prepare<[], { definition: string }>("SELECT definition FROM concept_definitions WHERE concept_id = 'BE'")
      .all();
    db.prepare("DELETE FROM concept_definitions WHERE concept_id = 'BE'").run();
    try {
      expect(await find('BE')).not.toHaveProperty('definitions');
    } finally {
      db.prepare("INSERT INTO concept_definitions (concept_id, language, definition) VALUES ('BE', 'en', ?)").run(row!.definition);
    }
  });

  // The modals are defined by the infinitive they govern (localization C09).
  test('composes the modal definitions from an infinitive complement', async () => {
    expect((await find('CAN')).definitions).toMatchObject({ en: 'to be able to act', it: 'essere capace di agire' });
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

  // P11-E7 D5: the object alone, bound in its clause — the link chip's text.
  test('renders the direct object alone, its link bound to the subject, when asked', async () => {
    const plan: PhrasePlan = {
      subject: { concept: 'WOMAN' },
      verbPhrase: { verb: 'SEE' },
      directObject: { concept: 'BOOK', possessor: { kind: 'coreferent', slot: 'subject' } },
    };
    const res = await post('/api/translate', { plan, phrase: 'directObject' });
    expect(res.status).toBe(200);
    const { translations } = (await res.json()) as { translations: { language: string; text: string }[] };
    expect(translations).toEqual(translate(plan, lookupLexicalEntry, { phrase: 'directObject' }));
    expect(translations.find((t) => t.language === 'de')?.text).toBe('ihr Buch');
    expect(translations.find((t) => t.language === 'ja')?.text).toBe('自分の本');
  });

  test('rejects a phrase it does not render', async () => {
    const res = await post('/api/translate', { plan: PLAN, phrase: 'subject' });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Unknown phrase: subject' });
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
// Each block was a catalogued defect (docs/bugs/), pinned by a `test.fails` asserting the correct
// behaviour. All of these are fixed now, so the assertions stand as ordinary tests; a new one starts
// its life as a `test.fails` that Vitest reports "expected to fail but passed" once the fix lands.

// A144. A German noun can carry an inherent adjective that the engine declines (YOUNG_WOMAN is "Frau"
// with `adjective: 'jung'`: "die junge Frau", "den jungen Frauen"). The picker's label was the lexeme's
// singular alone, so it showed "Frau", which is WOMAN's word, not YOUNG_WOMAN's; it reads a `citation`
// now.
describe('known bugs: the German label of a noun with an inherent adjective', () => {
  const concept = async (id: string): Promise<Concept> =>
    ((await (await get('/api/concepts?role=noun')).json()) as ConceptsResponse).concepts.find((c) => c.id === id)!;

  test('labels YOUNG_WOMAN with its adjective', async () => {
    expect((await concept('YOUNG_WOMAN')).labels?.de).toBe('junge Frau');
  });

  // The label is the only place the citation is read: the declining engine still builds the form
  // the case and determiner call for, so the sentences are unchanged.
  test('the citation does not reach the rendered sentences', async () => {
    const translate = async (plan: unknown) =>
      ((await (await post('/api/translate', { plan })).json()) as TranslateResponse)
        .translations.find((t) => t.language === 'de')!.text;
    expect(await translate({ subject: { concept: 'YOUNG_WOMAN' }, verbPhrase: { verb: 'RUN' } }))
      .toBe('die junge Frau läuft.');
    expect(await translate({ subject: { concept: 'YOUNG_WOMAN', number: 'plural', definiteness: 'indefinite' }, verbPhrase: { verb: 'RUN' } }))
      .toBe('junge Frauen laufen.');
  });

  // Regression guard: the other languages seed the whole name, and so do A140's complement names.
  test('regression: the other languages and the complement names already read right', async () => {
    expect((await concept('YOUNG_WOMAN')).labels).toMatchObject({ en: 'young woman', fr: 'jeune femme', it: 'giovane', ja: '若い女性' });
    expect((await concept('LOCATIVE')).labels?.de).toBe('adverbiale Bestimmung des Ortes');
  });

  // The head noun's own label is untouched — the two concepts are told apart in the picker now.
  test('regression: WOMAN keeps the bare head as its label', async () => {
    expect((await concept('WOMAN')).labels?.de).toBe('Frau');
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

  // P09-E30: the interjection is read through the same noting lookup as every other slot.
  test('translates a seeded interjection, and rejects an unseeded one', async () => {
    const res = await post('/api/translate', { plan: { subject: { concept: 'CAT' }, verbPhrase: { verb: 'RUN' }, interjection: 'HEY' } });
    expect(res.status).toBe(200);
    const { translations } = (await res.json()) as { translations: { language: string; text: string }[] };
    expect(translations.find((t) => t.language === 'es')?.text).toBe('Oye, el gato corre.');
    await expectRejected({ subject: { concept: 'CAT' }, verbPhrase: { verb: 'RUN' }, interjection: 'UNICORN' }, 'UNICORN');
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

// A267. `/api/translate` checks the top clause's subject and nothing below it, so a plan whose
// coordinate, if-clause, object clause or adverbial clause has none reaches the engine, which dies on
// a TypeError, and the client gets a 500. It is the same malformed request as a subjectless top
// clause and wants the same answer: a 400 naming the field. The engine's side is pinned in
// packages/engine/test/clause.test.ts.
describe('known bugs: a linked clause with no subject answers 500 (A267)', () => {
  const cry = { verbPhrase: { verb: 'CRY' } };
  const main = { subject: { concept: 'MAN' }, verbPhrase: { verb: 'RUN' } };
  test.each([
    ['plan.coordination.clause', { ...main, coordination: { conjunction: 'and', clause: cry } }],
    ['plan.condition', { ...main, condition: cry }],
    ['plan.contentObject', { subject: { concept: 'MAN' }, verbPhrase: { verb: 'SAY' }, contentObject: cry }],
    ['plan.adverbialClause.clause', { ...main, adverbialClause: { conjunction: 'when', clause: cry } }],
  ])('rejects a plan whose %s has no subject', async (path, plan) => {
    const res = await post('/api/translate', { plan });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: `${path}.subject.concept is required` });
  });

  test('translates a command whose coordinate has no subject of its own: it takes the addressee', async () => {
    const plan = { subject: { concept: 'SECOND_PERSON' }, verbPhrase: { verb: 'EAT' }, imperative: true, coordination: { conjunction: 'and', clause: cry } };
    const res = await post('/api/translate', { plan });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ translations: translate(plan as unknown as PhrasePlan, lookupLexicalEntry) });
  });
});

// A273. A relative clause with no verb phrase gets past `/api/translate`'s checks and dies in the
// engine on a TypeError, so the client gets a 500. Like A267's subjectless clause, it is a malformed
// request and wants a 400 naming what is missing. The engine's side is pinned in
// packages/engine/test/relative.test.ts.
describe('known bugs: a relative clause with no verb phrase answers 500 (A273)', () => {
  test.each([
    ['on the subject', { subject: { concept: 'CAT', relative: {} }, verbPhrase: { verb: 'RUN' } }],
    ['on the object', { subject: { concept: 'MAN' }, verbPhrase: { verb: 'SEE' }, directObject: { concept: 'CAT', relative: {} } }],
  ])('rejects a plan with a verbless relative clause %s', async (_, plan) => {
    const res = await post('/api/translate', { plan });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toMatch(/relative\.verbPhrase.* is required/);
  });
});

// A275. A relative clause whose gap is not its subject, carrying no subject of its own, is rendered as
// a subject relative with its meaning flipped ("the cat that eats" for *the cat that someone eats*)
// and served as a 200. Like A267 and A273 it is a malformed plan, and wants a 400 naming what is
// missing. The engine's side is pinned in packages/engine/test/relative.test.ts.
describe('known bugs: an object relative with no subject is served (A275)', () => {
  test.each([
    ['an object gap', { subject: { concept: 'CAT', relative: { headRole: 'directObject', verbPhrase: { verb: 'EAT' } } }, verbPhrase: { verb: 'RUN' } }],
    ['a place gap', { subject: { concept: 'HOUSE', relative: { headRole: 'locative', verbPhrase: { verb: 'EAT' } } }, verbPhrase: { verb: 'BURN' } }],
  ])('rejects a relative clause with %s and no subject', async (_, plan) => {
    const res = await post('/api/translate', { plan });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toMatch(/relative\.subject.* is required/);
  });
});

// A338. An address on an instruction, or a 1st- or 3rd-person pronoun address, contradicts what an
// address is. The engine refuses both by name; `/api/translate` answers them with a 400 rather than
// the 500 of an engine throw. The engine's side is pinned in packages/engine/test/address.test.ts.
describe('the address on /api/translate (A338)', () => {
  test.each([
    ['an address on an instruction', { subject: { concept: 'SECOND_PERSON' }, verbPhrase: { verb: 'RUN' }, imperative: true, imperativeRegister: 'instruction', address: { concept: 'MOM' } }, /instruction addresses nobody/],
    ['a 1st-person pronoun address', { subject: { concept: 'CAT' }, verbPhrase: { verb: 'RUN' }, address: { concept: 'FIRST_PERSON' } }, /1st-person pronoun/],
    ['a 3rd-person pronoun address', { subject: { concept: 'CAT' }, verbPhrase: { verb: 'RUN' }, address: { concept: 'THIRD_PERSON' } }, /3rd-person pronoun/],
  ])('rejects %s', async (_, plan, error) => {
    const res = await post('/api/translate', { plan });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toMatch(error);
  });

  test('translates a 2nd-person pronoun address', async () => {
    const plan = { subject: { concept: 'SECOND_PERSON' }, verbPhrase: { verb: 'RUN' }, imperative: true, address: { concept: 'SECOND_PERSON' } };
    const res = await post('/api/translate', { plan });
    expect(res.status).toBe(200);
  });
});

// A288. A relative clause whose head is its role ("the friend the man acts as") has no relative in
// Romance or German, and the engine refuses it by name. `/api/translate` answers it with a 400 naming
// the field, as it does A273's and A275's. The engine's side is pinned in
// packages/engine/test/complements/role.test.ts.
describe('A288: a relative clause over a role gap answers 400', () => {
  const actsAs = { headRole: 'role', subject: { concept: 'MAN' }, verbPhrase: { verb: 'ACT' } };
  test.each([
    ['on the subject', { subject: { concept: 'FRIEND', relative: actsAs }, verbPhrase: { verb: 'RUN' } }, 'plan.subject'],
    ['on the object', { subject: { concept: 'WOMAN' }, verbPhrase: { verb: 'SEE' }, directObject: { concept: 'FRIEND', relative: actsAs } }, 'plan.directObject'],
  ])('rejects a role-gap relative clause %s', async (_, plan, path) => {
    const res = await post('/api/translate', { plan });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: `${path}.relative.headRole: a relative clause cannot gap a role` });
  });
});

// A354. The generic person (one, si, on, man) has no object form, and the engine refuses it as a
// direct object by name; `/api/translate` answers a 400 naming the field. An addressee beside a
// content clause, which the verb sends to the dative, still translates. The engine's side is pinned
// in packages/engine/test/clause.test.ts.
describe('A354: the generic person as a direct object answers 400', () => {
  const G = { concept: 'GENERIC_PERSON' };
  test.each([
    ['the object', { subject: { concept: 'CAT' }, verbPhrase: { verb: 'SEE' }, directObject: G }, 'plan'],
    ['a relative\'s object', { subject: { concept: 'DOG', relative: { verbPhrase: { verb: 'SEE' }, directObject: G } }, verbPhrase: { verb: 'RUN' } }, 'plan.subject.relative'],
  ])('rejects the generic person as %s', async (_, plan, path) => {
    const res = await post('/api/translate', { plan });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: `${path}.directObject: the generic person (GENERIC_PERSON) cannot be a direct object` });
  });

  test('translates the generic patient of a passive, its subject', async () => {
    const plan = { subject: { concept: 'CAT' }, verbPhrase: { verb: 'SEE', voice: 'passive' }, directObject: G };
    const res = await post('/api/translate', { plan });
    expect(res.status).toBe(200);
  });

  test('translates the generic addressee of a content clause', async () => {
    const plan = {
      subject: { concept: 'CAT' }, verbPhrase: { verb: 'TELL' }, directObject: G,
      contentObject: { subject: { concept: 'DOG' }, verbPhrase: { verb: 'RUN' } },
    };
    const res = await post('/api/translate', { plan });
    expect(res.status).toBe(200);
  });
});
