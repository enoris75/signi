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

  // A period's part in a link is a clause, named as each tradition names it (B21). Japanese compounds
  // the name on 節, and OTHER takes the indefinite article's place in Spanish and Portuguese.
  test('names the clauses, conditions and conjuncts of linked periods', () => {
    const strings = buildUiStrings();
    expect(strings['clause.main']).toEqual({
      en: 'Main clause',
      it: 'Proposizione principale',
      fr: 'Proposition principale',
      de: 'Übergeordneter Satz',
      es: 'Oración principal',
      ja: '主節',
      pt: 'Oração principal',
    });
    expect(strings['period.isConditional']).toEqual({
      en: 'This period is a conditional clause',
      it: 'Questo periodo è una proposizione condizionale',
      fr: 'Cette période est une proposition conditionnelle',
      de: 'Dieses Satzgefüge ist ein konditionaler Satz',
      es: 'Este período es una oración condicional',
      ja: 'この文は条件節です',
      pt: 'Este período é uma oração condicional',
    });
    // Lower-case and unformatted: it is read inside the brackets after `action.addCondition`.
    expect(strings['period.becomesMain']).toMatchObject({
      en: 'this period becomes the main clause',
      it: 'questo periodo diventa la proposizione principale',
      ja: 'この文は主節になります',
    });
    expect(strings['action.addAnotherConjunct']).toEqual({
      en: 'Add another conjunct',
      it: 'Aggiungi un altro congiunto',
      fr: 'Ajouter un autre conjoint',
      de: 'Ein anderes Konjunkt addieren',
      es: 'Añadir otro miembro coordinado',
      ja: '別の等位項を追加',
      pt: 'Adicionar outro membro coordenado',
    });
    // A sentence in a banner: it keeps its full stop.
    expect(strings['pick.condition']).toMatchObject({
      en: 'Click the period that is the condition in another period container.',
      it: 'Clicca il periodo che è la condizione in un altro contenitore di periodo.',
      ja: '文の別の容器で条件である文をクリック。',
    });
    expect(strings['conjunction.kind.then']).toEqual({
      en: 'temporal',
      it: 'temporale',
      fr: 'temporelle',
      de: 'temporal',
      es: 'temporal',
      ja: '時間的',
      pt: 'temporal',
    });
  });

  // The verb's feature controls (B22): a tense is a noun standing alone, as German names it, and an
  // aspect or a polarity an adjective agreeing with its row's noun.
  test('names the tense, aspect, polarity and modal controls', () => {
    const strings = buildUiStrings();
    expect(strings['tense.value.past']).toEqual({
      en: 'Past',
      it: 'Passato',
      fr: 'Passé',
      de: 'Präteritum',
      es: 'Pasado',
      ja: '過去',
      pt: 'Passado',
    });
    expect(strings['aspect.value.progressive']).toMatchObject({ it: 'Progressivo', de: 'Progressiv', ja: '進行' });
    expect(strings['polarity.value.negative']).toMatchObject({ it: 'Negativa', fr: 'Négative', es: 'Negativa' });
    expect(strings['slot.modal.placeholder']).toEqual({
      en: 'type a modal',
      it: 'digita un verbo servile',
      fr: 'taper un verbe modal',
      de: 'ein Modalverb tippen',
      es: 'teclear un verbo modal',
      ja: '法助動詞を入力',
      pt: 'digitar um verbo modal',
    });
    expect(strings['action.hide.tense']).toMatchObject({ en: 'Hide the tense', de: 'Das Tempus verstecken' });
  });

  // Every complement is named now, each by its tradition's term (B23), so every ring control is too.
  test('names every complement and the verb phrase, and the controls that act on them', () => {
    const strings = buildUiStrings();
    expect(strings['slot.terminus']).toEqual({
      en: 'Terminus',
      it: 'Complemento di termine',
      fr: "Complément d'objet second",
      de: 'Dativobjekt',
      es: 'Complemento indirecto',
      ja: '間接目的語',
      pt: 'Objeto indireto',
    });
    expect(strings['action.remove.source']).toEqual({
      en: 'Remove the source',
      it: 'Rimuovi il complemento di moto da luogo',
      fr: 'Retirer le complément circonstanciel de provenance',
      de: 'Die adverbiale Bestimmung der Herkunft entfernen',
      es: 'Quitar el complemento circunstancial de procedencia',
      ja: '起点の副詞語句を取り除き',
      pt: 'Remover o adjunto adverbial de origem',
    });
    expect(strings['action.compact.verbPhrase']).toMatchObject({
      it: 'Compatta il sintagma verbale',
      de: 'Die Verbalphrase verdichten',
      ja: '動詞句を圧縮',
    });
    expect(strings['wordMap.relation.isA']).toMatchObject({ en: 'Hypernyms', it: 'Iperonimi', ja: '上位語' });
  });

  // The chips under an attributive noun (B24): the relation is spelled out by two nouns joined by "or".
  test('names the chips of a noun used as a modifier', () => {
    const strings = buildUiStrings();
    expect(strings['modifier.relation.purpose.gloss']).toEqual({
      en: 'Purpose or use',
      it: 'Scopo o uso',
      fr: 'But ou usage',
      de: 'Zweck oder Verwendung',
      es: 'Finalidad o uso',
      ja: '目的か用途',
      pt: 'Finalidade ou uso',
    });
    expect(strings['modifier.relation.purpose']).toMatchObject({ en: 'purpose', fr: 'but', ja: '目的' });
    expect(strings['modifier.addAdjective']).toEqual({
      en: 'Add an adjective that describes this modifier',
      it: 'Aggiungi un aggettivo che descrive questo modificatore',
      fr: 'Ajouter un adjectif qui décrit ce modificateur',
      de: 'Ein Adjektiv, das diesen Modifikator beschreibt, addieren',
      es: 'Añadir un adjetivo que describe este modificador',
      ja: 'この修飾語を描写する形容詞を追加',
      pt: 'Adicionar um adjetivo que descreve este modificador',
    });
  });
});
