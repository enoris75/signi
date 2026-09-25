import { afterEach, describe, expect, test, vi } from 'vitest';
import { translate } from '@signi/engine';
import { LANGUAGES } from '@signi/shared';
import type { LanguageCode, PhrasePlan, Translation } from '@signi/shared';
import { concepts } from './concepts/index.js';
import { buildConceptDefinitions } from './definitions.js';
import { lookupLexicalEntry } from './lexicon.js';
// Seeds the real corpus into this file's in-memory database (SIGNI_DB_PATH, see vitest.config.ts).
import './seed.js';

// The real engine renders by default; a test that needs a rendering the corpus can't produce
// swaps in its own for the calls it cares about.
vi.mock('@signi/engine', async (importOriginal) => {
  const engine = await importOriginal<typeof import('@signi/engine')>();
  return { ...engine, translate: vi.fn(engine.translate) };
});

// What a boot render hands the engine: not the plain lexicon but the noting lookup (A253), which
// answers a seeded concept exactly as the lexicon does. An asymmetric matcher, so the call
// assertions below still pin the lookup argument rather than accepting any function.
const theLexicon = {
  asymmetricMatch: (lookup: unknown) =>
    typeof lookup === 'function' && lookup !== lookupLexicalEntry
    && (lookup as typeof lookupLexicalEntry)('CAT', 'en') === lookupLexicalEntry('CAT', 'en'),
  toString: () => 'theLexicon',
};

// The unseeded UNICORN in each slot the engine renders a blank for (A253): subject, object and
// complement. GRIFFIN, also unseeded, shows the error naming every unknown id at once.
const HOLES: [string, PhrasePlan][] = [
  ['subject', { subject: { concept: 'UNICORN' }, verbPhrase: { verb: 'SPEAK' } }],
  ['object', { subject: { concept: 'WOMAN' }, verbPhrase: { verb: 'EAT' }, directObject: { concept: 'UNICORN' } }],
  ['complement', { subject: { concept: 'WOMAN' }, verbPhrase: { verb: 'SPEAK' }, complements: { manner: { phrase: { concept: 'UNICORN' } } } }],
];
const TWO_HOLES: PhrasePlan = {
  subject: { concept: 'GRIFFIN' }, verbPhrase: { verb: 'EAT' }, directObject: { concept: 'UNICORN' },
};

const LANGUAGE_CODES = Object.keys(LANGUAGES) as LanguageCode[];
const planned = concepts.filter((c) => c.definition);

const rendering = (text: (language: LanguageCode) => string): Translation[] =>
  LANGUAGE_CODES.map((language) => ({ language, text: text(language) }) as Translation);

afterEach(() => {
  vi.mocked(translate).mockReset();
});

describe('buildConceptDefinitions', () => {
  test('renders every concept that has a definition plan, and only those', () => {
    const definitions = buildConceptDefinitions();
    expect([...definitions.keys()].sort()).toEqual(planned.map((c) => c.id).sort());
  });

  test('renders each plan through the engine with the lexicon', () => {
    buildConceptDefinitions();
    expect(translate).toHaveBeenCalledTimes(planned.length);
    for (const c of planned) expect(translate).toHaveBeenCalledWith(c.definition, theLexicon);
  });

  test('renders a definition into every language, without the period\'s full stop', () => {
    expect(buildConceptDefinitions().get('CAT')).toEqual({
      en: 'a small mammal',
      it: 'un piccolo mammifero',
      fr: 'un petit mammifère',
      de: 'ein kleines Säugetier',
      es: 'un mamífero pequeño',
      ja: '小さい哺乳類',
      pt: 'um mamífero pequeno',
      // P10: Swiss German renders too, as a preview row (verify at P10-E14).
      gsw: 'es chliines Süügetier',
    });
  });

  test('gives no definition a trailing full stop', () => {
    const stopped = [...buildConceptDefinitions()].flatMap(([id, byLanguage]) =>
      Object.entries(byLanguage)
        .filter(([, text]) => /[.。]\s*$/.test(text))
        .map(([language]) => `${id}:${language}`),
    );
    expect(stopped).toEqual([]);
  });

  test('strips one trailing ASCII or Japanese full stop and the space after it', () => {
    vi.mocked(translate).mockImplementation(() =>
      rendering((language) => (language === 'ja' ? '小さい哺乳類。 ' : 'e.g. a small mammal. ')),
    );
    const definition = buildConceptDefinitions().get(planned[0]!.id)!;
    expect(definition.en).toBe('e.g. a small mammal');
    expect(definition.ja).toBe('小さい哺乳類');
  });

  test('fails naming the concept and the languages a plan did not render in', () => {
    vi.mocked(translate).mockImplementationOnce(() =>
      rendering((language) => (language === 'de' || language === 'ja' ? '' : 'a thing')).filter(
        (t) => t.language !== 'pt',
      ),
    );
    expect(() => buildConceptDefinitions()).toThrow(
      `Definition for "${planned[0]!.id}" did not render in: de, ja, pt. ` +
        'Check the concepts its plan references are seeded in every language.',
    );
  });
});

// A253. The boot render refuses a definition only when a whole language comes back empty, but the
// engine renders an unseeded concept as an empty *word* (the contract /api/translate turns into a
// 400, "Unknown concept: UNICORN"), so a plan whose unseeded concept is one word among others boots
// and serves the hole: "speaks like the", 〜のように with nothing before it. The boot check is the one
// the error names ("Check the concepts its plan references are seeded"); it should fail the same way
// /api/translate does, naming the concept.
describe('known bugs: a boot render serves the hole an unseeded concept leaves (A253)', () => {
  test('a definition naming an unseeded complement fails the boot, naming the concept', async () => {
    const engine = await vi.importActual<typeof import('@signi/engine')>('@signi/engine');
    vi.mocked(translate).mockImplementationOnce((_plan, lookup) => engine.translate({
      subject: { concept: 'WOMAN' }, verbPhrase: { verb: 'SPEAK' },
      complements: { manner: { phrase: { concept: 'UNICORN' } } },
    }, lookup));
    expect(() => buildConceptDefinitions()).toThrow(/UNICORN/);
  });

  test.each(HOLES)('a definition naming an unseeded %s fails the boot, naming the concept', async (_slot, plan) => {
    const engine = await vi.importActual<typeof import('@signi/engine')>('@signi/engine');
    vi.mocked(translate).mockImplementationOnce((_plan, lookup) => engine.translate(plan, lookup));
    expect(() => buildConceptDefinitions()).toThrow(
      `Definition for "${planned[0]!.id}" names unknown concept: UNICORN. Seed them, or change the plan.`,
    );
  });

  test('a definition naming several unseeded concepts names them all', async () => {
    const engine = await vi.importActual<typeof import('@signi/engine')>('@signi/engine');
    vi.mocked(translate).mockImplementationOnce((_plan, lookup) => engine.translate(TWO_HOLES, lookup));
    expect(() => buildConceptDefinitions()).toThrow(
      `Definition for "${planned[0]!.id}" names unknown concepts: GRIFFIN, UNICORN. Seed them, or change the plan.`,
    );
  });

  test('regression: every shipped definition still boots against the seeded corpus', () => {
    expect(() => buildConceptDefinitions()).not.toThrow();
  });

  test('regression: the hole is there to be caught, and a wholly blank language already is', async () => {
    const engine = await vi.importActual<typeof import('@signi/engine')>('@signi/engine');
    const rendered = engine.translate({
      subject: { concept: 'WOMAN' }, verbPhrase: { verb: 'SPEAK' },
      complements: { manner: { phrase: { concept: 'UNICORN' } } },
    }, lookupLexicalEntry);
    expect(rendered.find((t) => t.language === 'en')?.text).toBe('the woman speaks like the.');
    expect(rendered.every((t) => t.text !== '')).toBe(true);
  });
});
