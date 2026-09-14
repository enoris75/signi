import { afterEach, describe, expect, test, vi } from 'vitest';
import { translate, translateDeterminer, translateWord } from '@signi/engine';
import { LANGUAGES, UI_STRINGS } from '@signi/shared';
import type {
  LanguageCode,
  Translation,
  UiStringDef,
  UiStringDeterminerDef,
  UiStringPlanDef,
  UiStringWordDef,
} from '@signi/shared';
import { lookupLexicalEntry } from './lexicon.js';
import { buildUiStrings } from './uiStrings.js';
// Seeds the real corpus into this file's in-memory database (SIGNI_DB_PATH, see vitest.config.ts).
import './seed.js';

// The real engine renders by default; a test that needs a rendering the corpus can't produce
// swaps in its own for the calls it cares about.
vi.mock('@signi/engine', async (importOriginal) => {
  const engine = await importOriginal<typeof import('@signi/engine')>();
  return {
    ...engine,
    translate: vi.fn(engine.translate),
    translateWord: vi.fn(engine.translateWord),
    translateDeterminer: vi.fn(engine.translateDeterminer),
  };
});

const LANGUAGE_CODES = Object.keys(LANGUAGES) as LanguageCode[];
const CATALOG = Object.entries(UI_STRINGS as Record<string, UiStringDef>);
const byKind = {
  determiner: CATALOG.filter((e): e is [string, UiStringDeterminerDef] => e[1].determiner !== undefined),
  word: CATALOG.filter((e): e is [string, UiStringWordDef] => e[1].determiner === undefined && e[1].word !== undefined),
  plan: CATALOG.filter((e): e is [string, UiStringPlanDef] => e[1].determiner === undefined && e[1].word === undefined),
};

const rendering = (text: (language: LanguageCode) => string): Translation[] =>
  LANGUAGE_CODES.map((language) => ({ language, text: text(language) }) as Translation);

afterEach(() => {
  for (const fn of [translate, translateWord, translateDeterminer]) vi.mocked(fn).mockReset();
});

describe('buildUiStrings', () => {
  test('renders every catalog entry into every language', () => {
    const strings = buildUiStrings();
    expect(Object.keys(strings)).toEqual(CATALOG.map(([key]) => key));
    const blank = Object.entries(strings).flatMap(([key, byLanguage]) =>
      LANGUAGE_CODES.filter((l) => !(byLanguage as Record<string, string>)[l]).map((l) => `${key}:${l}`),
    );
    expect(blank).toEqual([]);
  });

  test('renders each entry through the engine function for its kind', () => {
    // The catalog has entries of every kind; this spec is only meaningful while it does.
    expect(byKind.determiner.length && byKind.word.length && byKind.plan.length).toBeTruthy();

    buildUiStrings();

    expect(translateDeterminer).toHaveBeenCalledTimes(byKind.determiner.length);
    for (const [, d] of byKind.determiner) {
      expect(translateDeterminer).toHaveBeenCalledWith(d.determiner, lookupLexicalEntry, d.agreesWith);
    }
    expect(translateWord).toHaveBeenCalledTimes(byKind.word.length);
    for (const [, d] of byKind.word) {
      expect(translateWord).toHaveBeenCalledWith(d.word, lookupLexicalEntry, d.agreesWith);
    }
    expect(translate).toHaveBeenCalledTimes(byKind.plan.length);
    for (const [, d] of byKind.plan) expect(translate).toHaveBeenCalledWith(d.plan, lookupLexicalEntry);
  });

  test('renders a word label capitalized when its format asks', () => {
    expect(buildUiStrings()['gender.value.masc']).toEqual({
      en: 'Male',
      it: 'Maschile',
      fr: 'Masculin',
      de: 'Männlich',
      es: 'Masculino',
      ja: '男性',
      pt: 'Masculino',
    });
  });

  // A language name is a proper noun, which the Romance languages article in a sentence
  // ("l'italiano è una lingua", A133). The selector's label is the word alone.
  test('names a language without the article a sentence would give it', () => {
    const strings = buildUiStrings();
    expect(strings['language.it']).toEqual({
      en: 'Italian',
      it: 'Italiano',
      fr: 'Italien',
      de: 'Italienisch',
      es: 'Italiano',
      ja: 'イタリア語',
      pt: 'Italiano',
    });
    expect(strings['language.en']).toMatchObject({ it: 'Inglese', fr: 'Anglais', es: 'Inglés', pt: 'Inglês' });
  });

  test('applies each entry\'s format to what the engine rendered', () => {
    const rendered = rendering((language) => (language === 'ja' ? 'ねこ。 ' : 'é un gatto. '));
    for (const fn of [translate, translateWord, translateDeterminer]) vi.mocked(fn).mockReturnValue(rendered);

    const strings = buildUiStrings();

    for (const [key, d] of CATALOG) {
      const byLanguage = strings[key as keyof typeof strings];
      const strip = d.format?.stripPeriod;
      const expected = `${d.format?.capitalize ? 'É' : 'é'} un gatto${strip ? '' : '. '}`;
      expect({ key, en: byLanguage.en, ja: byLanguage.ja }).toEqual({
        key,
        en: expected,
        // Capitalizing is a no-op for a script without case.
        ja: strip ? 'ねこ' : 'ねこ。 ',
      });
    }
  });

  test('fails naming the entry and the languages it did not render in', () => {
    const [firstKey] = CATALOG[0]!;
    const fn = byKind.determiner[0]?.[0] === firstKey ? translateDeterminer
      : byKind.word[0]?.[0] === firstKey ? translateWord
      : translate;
    vi.mocked(fn).mockReturnValueOnce(
      rendering((language) => (language === 'fr' ? '' : 'label')).filter((t) => t.language !== 'es'),
    );
    expect(() => buildUiStrings()).toThrow(
      `UI string "${firstKey}" did not render in: fr, es. ` +
        'Check the concepts it references are seeded in every language.',
    );
  });

  // REMOVE takes a thing off the canvas, where undo brings it back. DELETE erases a stored record.
  // The languages keep these apart, and CLEAR, which empties a thing in place, is a third verb (B20).
  test('names the remove and delete controls with verbs of their own', () => {
    const strings = buildUiStrings();
    expect(strings['action.removePeriod']).toEqual({
      en: 'Remove this period',
      it: 'Rimuovi questo periodo',
      fr: 'Retirer cette période',
      de: 'Dieses Satzgefüge entfernen',
      es: 'Quitar este período',
      ja: 'この文を取り除き',
      pt: 'Remover este período',
    });
    expect(strings['action.remove.manner']).toEqual({
      en: 'Remove the adverbial of manner',
      it: 'Rimuovi il complemento di modo',
      fr: 'Retirer le complément circonstanciel de manière',
      de: 'Die adverbiale Bestimmung der Art und Weise entfernen',
      es: 'Quitar el complemento circunstancial de modo',
      ja: '状態の副詞語句を取り除き',
      pt: 'Remover o adjunto adverbial de modo',
    });
    expect(strings['action.deleteSavedPhrase']).toEqual({
      en: 'Delete this saved phrase',
      it: 'Elimina questa frase salvata',
      fr: 'Supprimer cette phrase enregistrée',
      de: 'Diese gespeicherte Phrase löschen',
      es: 'Eliminar esta frase guardada',
      ja: 'この保存済みのフレーズを削除',
      pt: 'Excluir esta frase salva',
    });
    expect(strings['action.deleteSavedPeriod']).toMatchObject({
      en: 'Delete this saved period',
      it: 'Elimina questo periodo salvato',
      de: 'Dieses gespeicherte Satzgefüge löschen',
    });
  });
});
