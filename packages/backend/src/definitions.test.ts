import { afterEach, describe, expect, test, vi } from 'vitest';
import { translate } from '@signi/engine';
import { LANGUAGES } from '@signi/shared';
import type { LanguageCode, Translation } from '@signi/shared';
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
    for (const c of planned) expect(translate).toHaveBeenCalledWith(c.definition, lookupLexicalEntry);
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
