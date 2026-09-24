import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  translate,
  translateConjunction,
  translateDegree,
  translateDeterminer,
  translatePossessive,
  translateSpecifier,
  translateSubordinator,
  translateWord,
} from '@signi/engine';
import { LANGUAGES, UI_STRINGS } from '@signi/shared';
import type {
  LanguageCode,
  PhrasePlan,
  Translation,
  UiStringConjunctionDef,
  UiStringDef,
  UiStringDegreeDef,
  UiStringDeterminerDef,
  UiStringPlanDef,
  UiStringPossessiveDef,
  UiStringSpecifierDef,
  UiStringSubordinatorDef,
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
    translateConjunction: vi.fn(engine.translateConjunction),
    translateSubordinator: vi.fn(engine.translateSubordinator),
    translateDegree: vi.fn(engine.translateDegree),
    translateDeterminer: vi.fn(engine.translateDeterminer),
    translatePossessive: vi.fn(engine.translatePossessive),
    translateSpecifier: vi.fn(engine.translateSpecifier),
  };
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
const CATALOG = Object.entries(UI_STRINGS as Record<string, UiStringDef>);
// The seven kinds, split the way `renderEntry` dispatches them: whichever of the six marker
// properties an entry carries names its kind, and an entry carrying none is a plan.
const kindOf = (d: UiStringDef): string =>
  d.determiner !== undefined ? 'determiner'
  : d.possessive !== undefined ? 'possessive'
  : d.conjunction !== undefined ? 'conjunction'
  : d.subordinator !== undefined ? 'subordinator'
  : d.specifier !== undefined ? 'specifier'
  : d.degree !== undefined ? 'degree'
  : d.word !== undefined ? 'word'
  : 'plan';
const of = <T extends UiStringDef>(kind: string) =>
  CATALOG.filter((e): e is [string, T] => kindOf(e[1]) === kind);
const byKind = {
  determiner: of<UiStringDeterminerDef>('determiner'),
  possessive: of<UiStringPossessiveDef>('possessive'),
  conjunction: of<UiStringConjunctionDef>('conjunction'),
  subordinator: of<UiStringSubordinatorDef>('subordinator'),
  specifier: of<UiStringSpecifierDef>('specifier'),
  degree: of<UiStringDegreeDef>('degree'),
  word: of<UiStringWordDef>('word'),
  plan: of<UiStringPlanDef>('plan'),
};

const rendering = (text: (language: LanguageCode) => string): Translation[] =>
  LANGUAGE_CODES.map((language) => ({ language, text: text(language) }) as Translation);

afterEach(() => {
  const fns = [translate, translateWord, translateConjunction, translateSubordinator, translateDegree,
    translateDeterminer, translatePossessive, translateSpecifier];
  for (const fn of fns) vi.mocked(fn).mockReset();
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
    expect(Object.values(byKind).every((entries) => entries.length > 0)).toBe(true);

    buildUiStrings();

    expect(translateDeterminer).toHaveBeenCalledTimes(byKind.determiner.length);
    for (const [, d] of byKind.determiner) {
      expect(translateDeterminer).toHaveBeenCalledWith(d.determiner, theLexicon, d.agreesWith);
    }
    expect(translatePossessive).toHaveBeenCalledTimes(byKind.possessive.length);
    for (const [, d] of byKind.possessive) {
      expect(translatePossessive).toHaveBeenCalledWith(d.possessive, theLexicon, d.agreesWith);
    }
    expect(translateConjunction).toHaveBeenCalledTimes(byKind.conjunction.length);
    for (const [, d] of byKind.conjunction) {
      // The one function word cited on nothing: a conjunction agrees with neither side.
      expect(translateConjunction).toHaveBeenCalledWith(d.conjunction);
    }
    expect(translateSubordinator).toHaveBeenCalledTimes(byKind.subordinator.length);
    for (const [, d] of byKind.subordinator) {
      // Its sibling (P09-E12 D9), cited on nothing either.
      expect(translateSubordinator).toHaveBeenCalledWith(d.subordinator);
    }
    expect(translateSpecifier).toHaveBeenCalledTimes(byKind.specifier.length);
    for (const [, d] of byKind.specifier) {
      expect(translateSpecifier).toHaveBeenCalledWith(d.specifier, theLexicon, d.agreesWith);
    }
    expect(translateDegree).toHaveBeenCalledTimes(byKind.degree.length);
    for (const [, d] of byKind.degree) {
      expect(translateDegree).toHaveBeenCalledWith(d.degree, theLexicon, d.agreesWith);
    }
    expect(translateWord).toHaveBeenCalledTimes(byKind.word.length);
    for (const [, d] of byKind.word) {
      expect(translateWord).toHaveBeenCalledWith(d.word, theLexicon, d.agreesWith);
    }
    expect(translate).toHaveBeenCalledTimes(byKind.plan.length);
    for (const [, d] of byKind.plan) expect(translate).toHaveBeenCalledWith(d.plan, theLexicon);
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

  // The chip on a coreference link. The Romance possessive agrees with the noun it is cited on
  // (NOUN: it "nome", masc) rather than with the antecedent, which is why "his" and "her" come out
  // as one word there; en/de/ja read the antecedent's own gender and keep them apart.
  test('names the possessive pronoun a coreference link spells', () => {
    const strings = buildUiStrings();
    expect(strings['pronoun.possessive.3sg.masc']).toEqual({
      en: 'his', it: 'suo', fr: 'son', de: 'sein', es: 'su', ja: '彼の', pt: 'seu',
    });
    expect(strings['pronoun.possessive.3sg.fem']).toEqual({
      en: 'her', it: 'suo', fr: 'son', de: 'ihr', es: 'su', ja: '彼女の', pt: 'seu',
    });
    expect(strings['pronoun.possessive.1pl']).toEqual({
      en: 'our', it: 'nostro', fr: 'notre', de: 'unser', es: 'nuestro', ja: '私たちの', pt: 'nosso',
    });
    expect(strings['pronoun.possessive.3pl']).toMatchObject({ en: 'their', it: 'loro', de: 'ihr' });
  });

  // The "Could not …" messages: an agentless passive under a negated past ability (C11). The agent
  // is GENERIC_PERSON, which no language speaks as a by-phrase, so nothing says who tried; the
  // Romance past is CAN's imperfect, and Japanese says the whole thing as the potential on the
  // active verb, which is what the language uses in place of a passive under 〜ことができる.
  test('reports a failure as an agentless passive, naming no one who tried', () => {
    const strings = buildUiStrings();
    expect(strings['failure.phraseNotSaved']).toEqual({
      en: 'The phrase could not be saved.',
      it: 'La frase non poteva essere salvata.',
      fr: 'La phrase ne pouvait pas être enregistrée.',
      de: 'Die Phrase konnte nicht gespeichert werden.',
      es: 'La frase no podía ser guardada.',
      ja: 'フレーズは保存することができませんでした。',
      // The short participle of an abundant pair: "foi salva", never "foi salvada".
      pt: 'A frase não podia ser salva.',
    });
    expect(strings['failure.phraseNotTranslated']).toMatchObject({
      en: 'The phrase could not be translated.',
      de: 'Die Phrase konnte nicht übersetzt werden.',
      ja: 'フレーズは翻訳することができませんでした。',
    });
    // A plural patient agrees the participle and the modal with itself, and takes the definite
    // article French cannot do without on a plural subject.
    expect(strings['failure.savedPeriodsNotLoaded']).toMatchObject({
      en: 'The saved periods could not be loaded.',
      it: 'I periodi salvati non potevano essere caricati.',
      fr: 'Les périodes enregistrées ne pouvaient pas être chargées.',
      es: 'Los períodos guardados no podían ser cargados.',
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
    const fns = [translate, translateWord, translateConjunction, translateSubordinator, translateDegree,
      translateDeterminer, translatePossessive, translateSpecifier];
    for (const fn of fns) vi.mocked(fn).mockReturnValue(rendered);

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

  // A Spanish question opens on "¿", which has no case, so the letter after it is the one capitalized.
  test('capitalizes the first letter, past a mark that opens the string', () => {
    vi.mocked(translate).mockReturnValue(rendering(() => '¿el gato come?'));
    expect(buildUiStrings()['status.isServerActive']).toMatchObject({ es: '¿El gato come?' });
  });

  // The engine closes a question on each language's question mark, which the format keeps (C10).
  test('asks whether the server is active, each language in its own way', () => {
    expect(buildUiStrings()['status.isServerActive']).toEqual({
      en: 'Is the server active?',
      it: 'Il server è attivo?',
      fr: 'Est-ce que le serveur est actif ?',
      de: 'Ist der Server aktiv?',
      es: '¿El servidor está activo?',
      ja: 'サーバーは稼働中ですか？',
      pt: 'O servidor está ativo?',
    });
  });

  test('fails naming the entry and the languages it did not render in', () => {
    const [firstKey] = CATALOG[0]!;
    const fn = byKind.determiner[0]?.[0] === firstKey ? translateDeterminer
      : byKind.possessive[0]?.[0] === firstKey ? translatePossessive
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
      de: 'Ein anderes Konjunkt hinzufügen',
      es: 'Añadir otro miembro coordinado',
      ja: '別の等位項を追加',
      pt: 'Adicionar outro membro coordenado',
    });
    // A sentence in a banner: it keeps its full stop.
    expect(strings['pick.condition']).toMatchObject({
      en: 'Click the period that is the condition in another period container.',
      it: 'Clicca sul periodo che è la condizione in un altro contenitore di periodo.',
      ja: '文の別の容器で条件である文をクリック。',
    });
    // P09-E12 D9: the subordinate-clause menu's words, as each engine cites them.
    expect(strings['subordinator.value.after']).toEqual({
      en: 'After', it: 'Dopo che', fr: 'Après que', de: 'Nachdem', es: 'Después de que', pt: 'Depois que', ja: '〜た後で',
    });
    expect(strings['subordinator.value.that']).toEqual({
      en: 'That', it: 'Che', fr: 'Que', de: 'Dass', es: 'Que', pt: 'Que', ja: '〜と',
    });
    expect(strings['clause.subordinate']).toEqual({
      en: 'Subordinate clause', it: 'Proposizione subordinata', fr: 'Proposition subordonnée', de: 'Untergeordneter Satz',
      es: 'Oración subordinada', pt: 'Oração subordinada', ja: '従属節',
    });
    expect(strings['action.addSubordinate']).toMatchObject({ en: 'Add a subordinate clause', ja: '従属節を追加' });
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
      it: 'digita un verbo modale',
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
    // The two complements the builder has no box for, which the word map still names (C12).
    expect(strings['slot.objectPredicative']).toMatchObject({
      en: 'Object complement',
      it: "Complemento predicativo dell'oggetto",
      de: 'Objektsprädikativ',
      ja: '目的語補語',
    });
    expect(strings['slot.comitative']).toMatchObject({
      en: 'Comitative', fr: "Complément d'accompagnement", de: 'Komitativ', ja: '共同格',
    });
  });

  // A19 — the passive's agent box and ring, and the voice satellite's box, which A01 added outside
  // the families. AGENT_GRAMMAR is neuter in German (das Agens); VOICE is feminine in the Romance
  // languages and German, and Japanese takes the shipped 見せ / 隠し stems (A126).
  test('names the passive’s agent and the voice box in the controls that act on them', () => {
    const strings = buildUiStrings();
    expect(strings['action.clear.agent']).toEqual({
      en: 'Clear the agent',
      it: "Cancella l'agente",
      fr: "Effacer l'agent",
      de: 'Das Agens löschen',
      es: 'Borrar el agente',
      ja: '動作主を消去',
      pt: 'Limpar o agente',
    });
    expect(strings['action.compact.agent']).toMatchObject({ it: "Compatta l'agente", de: 'Das Agens verdichten' });
    expect(strings['action.expand.agent']).toMatchObject({ fr: "Étendre l'agent", ja: '動作主を展開' });
    expect(strings['action.hide.voice']).toEqual({
      en: 'Hide the voice',
      it: 'Nascondi la diatesi',
      fr: 'Cacher la voix',
      de: 'Die Diathese verstecken',
      es: 'Esconder la voz',
      ja: '態を隠し',
      pt: 'Esconder a voz',
    });
    expect(strings['action.show.voice']).toMatchObject({ it: 'Mostra la diatesi', ja: '態を見せ' });
  });

  // C12 — the four constructs the catalog gained: a clause of purpose, the two readings of the
  // object complement, the comitative, and the genitive relative.
  test('says what a click is for, in the final clause each language writes', () => {
    const strings = buildUiStrings();
    expect(strings['hint.clickToChange']).toEqual({
      en: 'click to change',
      it: 'clicca per cambiare',
      fr: 'cliquer pour changer',
      // German extraposes the purpose behind the clause, inside "um … zu".
      de: 'klicken, um zu ändern',
      es: 'clicar para cambiar',
      // Japanese puts it first, closed by ために.
      ja: '変えるためにクリック',
      pt: 'clicar para mudar',
    });
    expect(strings['hint.dragToResize']).toEqual({
      en: 'Drag to resize',
      it: 'Trascina per ridimensionare',
      fr: 'Glisser pour redimensionner',
      de: 'Ziehen, um zu skalieren',
      es: 'Arrastrar para redimensionar',
      ja: 'サイズ変更するためにドラッグ',
      pt: 'Arrastar para redimensionar',
    });
    expect(strings['hint.selectToTranslate']).toMatchObject({
      en: 'Select a subject and a verb to see the translations.',
      it: 'Seleziona un soggetto e un verbo per vedere le traduzioni.',
      de: 'Ein Subjekt und ein Verb selektieren, um die Übersetzungen zu sehen.',
      ja: '翻訳を見るために主語と動詞を選択。',
    });
  });

  test('turns a period into a command, or takes it as a condition', () => {
    const strings = buildUiStrings();
    // The factitive: the link is the verb's own word, and it fuses with the article.
    expect(strings['action.makeCommand']).toEqual({
      en: 'Transform this period into a command',
      it: 'Trasforma questo periodo in un comando',
      fr: 'Transformer cette période en une commande',
      de: 'Dieses Satzgefüge in einen Befehl verwandeln',
      es: 'Transformar este período en un comando',
      ja: 'この文を命令に変え',
      pt: 'Transformar este período em um comando',
    });
    // The essive: one word per language, and no article outside English.
    expect(strings['action.useAsCondition']).toEqual({
      en: 'Use this period as the condition',
      it: 'Usa questo periodo come condizione',
      fr: 'Utiliser cette période comme condition',
      de: 'Dieses Satzgefüge als Bedingung verwenden',
      es: 'Usar este período como condición',
      ja: 'この文を条件として使用',
      pt: 'Usar este período como condição',
    });
    expect(strings['action.useAsCoordinated']).toMatchObject({
      en: 'Use this period as the coordinated clause',
      it: 'Usa questo periodo come proposizione coordinata',
      de: 'Dieses Satzgefüge als beigeordneten Satz verwenden',
    });
    // Both at once: remove the link, in order to transform the period.
    expect(strings['action.unlinkForCommand']).toMatchObject({
      en: 'Remove the condition or the coordination to transform this period into a command',
      de: 'Die Bedingung oder die Koordination entfernen, um dieses Satzgefüge in einen Befehl zu verwandeln',
    });
  });

  test('names the period to pick, by the clause it joins or the noun it owns', () => {
    const strings = buildUiStrings();
    // The comitative companion of the act, under a purpose clause.
    expect(strings['pick.coordinated']).toMatchObject({
      en: 'Click the period in another period container to coordinate with this clause.',
      de: 'Auf das Satzgefüge in einem anderen Satzgefügebehälter klicken, um mit diesem Satz zu koordinieren.',
      ja: 'この節と調整するために文の別の容器で文をクリック。',
    });
    // The genitive relative — no passive needed to say what the period's noun is for.
    expect(strings['pick.instrumental']).toEqual({
      en: 'Click the period whose noun is the instrumental in another period container.',
      it: 'Clicca sul periodo il cui sostantivo è il complemento di mezzo in un altro contenitore di periodo.',
      fr: 'Cliquer sur la période dont le nom est le complément de moyen dans un autre récipient de période.',
      de: 'Auf das Satzgefüge, dessen Substantiv der Instrumental ist, in einem anderen Satzgefügebehälter klicken.',
      es: 'Clicar en el período cuyo sustantivo es el complemento circunstancial de instrumento en otro recipiente de período.',
      ja: '文の別の容器で名詞が手段語である文をクリック。',
      pt: 'Clicar no período cujo substantivo é o adjunto adverbial de instrumento em outro recipiente de período.',
    });
  });

  test('says the map is drawing nothing, and how to make it draw', () => {
    const strings = buildUiStrings();
    expect(strings['wordMap.noRelationships']).toEqual({
      en: 'The map shows no relationships.',
      it: 'La mappa non mostra nessuna relazione.',
      fr: 'La carte ne montre aucune relation.',
      de: 'Die Karte zeigt keine Beziehungen.',
      es: 'El mapa no muestra ninguna relación.',
      ja: '地図はどの関係も見せません。',
      pt: 'O mapa não mostra nenhuma relação.',
    });
    expect(strings['wordMap.showRelationships']).toMatchObject({
      en: 'Show a relationship', it: 'Mostra una relazione', de: 'Eine Beziehung zeigen',
    });
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
      de: 'Ein Adjektiv, das diesen Modifikator beschreibt, hinzufügen',
      es: 'Añadir un adjetivo que describe este modificador',
      ja: 'この修飾語を描写する形容詞を追加',
      pt: 'Adicionar um adjetivo que descreve este modificador',
    });
  });

  // The dialogs' own chrome and the saved-item feedback (B25, B26). An empty list says `no` in the
  // plural English and German use, the Romance singular, and Japanese どの…もない.
  test('names the dialog controls and says what happened to a saved item', () => {
    const strings = buildUiStrings();
    expect(strings['action.cancel']).toEqual({
      en: 'Cancel', it: 'Annulla', fr: 'Annuler', de: 'Annullieren', es: 'Cancelar', ja: 'キャンセル', pt: 'Cancelar',
    });
    expect(strings['field.name']).toMatchObject({ it: 'Nome', de: 'Name', ja: '名前' });
    expect(strings['status.loading']).toMatchObject({ it: 'Caricamento', fr: 'Chargement', ja: '読み込み' });
    expect(strings['saved.noPhrases']).toEqual({
      en: 'No saved phrases',
      it: 'Nessuna frase salvata',
      fr: 'Aucune phrase enregistrée',
      de: 'Keine gespeicherten Phrasen',
      es: 'Ninguna frase guardada',
      ja: 'どの保存済みのフレーズもない',
      pt: 'Nenhuma frase salva',
    });
    expect(strings['typeahead.noResults']).toMatchObject({ en: 'no results', fr: 'aucun résultat', ja: 'どの結果もない' });
    expect(strings['saved.useSaveIcon']).toMatchObject({
      en: 'use the icon that saves a period in a period container',
      it: "usa l'icona che salva un periodo in un contenitore di periodo",
    });
    expect(strings['toast.periodAdded']).toMatchObject({ en: 'Added period', it: 'Periodo aggiunto', de: 'Hinzugefügtes Satzgefüge' });
    expect(strings['toast.importFailed']).toMatchObject({ en: 'Failed import', es: 'Importación fallida' });
    expect(strings['toast.invalidFile']).toEqual({
      en: 'this file is not valid',
      it: 'questo file non è valido',
      fr: "ce fichier n'est pas valide",
      de: 'diese Datei ist nicht gültig',
      es: 'este archivo no es válido',
      ja: 'このファイルは有効ではありません',
      pt: 'este arquivo não é válido',
    });
    // The noun and its adjective agree with the number of ids the toast lists after them.
    expect(strings['toast.missingWords.singular']).toEqual({
      en: 'missing word',
      it: 'parola mancante',
      fr: 'mot manquant',
      de: 'fehlendes Wort',
      es: 'palabra faltante',
      ja: '見つからない単語',
      pt: 'palavra faltante',
    });
    expect(strings['toast.missingWords.plural']).toEqual({
      en: 'missing words',
      it: 'parole mancanti',
      fr: 'mots manquants',
      de: 'fehlende Wörter',
      es: 'palabras faltantes',
      ja: '見つからない単語',
      pt: 'palavras faltantes',
    });
    // "senza titolo" does not agree with the feminine "frase".
    expect(strings['phrase.untitled']).toMatchObject({ it: 'Frase senza titolo', es: 'Frase sin título', de: 'Unbenannte Phrase' });
    expect(strings['slot.empty']).toMatchObject({ it: 'vuoto', fr: 'vide', ja: '空' });
    expect(strings['language.selector']).toMatchObject({ en: 'Interface language', fr: "Langue d'interface" });
  });

  // The phrase console's own strings whose words are seeded (A21).
  test('names the console’s frame, its lists, its topics and its usage words', () => {
    const strings = buildUiStrings();
    // The header keeps the number outside the phrase; German capitalizes the noun, so no CSS lowers it.
    expect(strings['period.name']).toEqual({
      en: 'Period', it: 'Periodo', fr: 'Période', de: 'Satzgefüge', es: 'Período', ja: '文', pt: 'Período',
    });
    expect(strings['period.empty']).toEqual({
      en: 'empty period', it: 'periodo vuoto', fr: 'période vide', de: 'leeres Satzgefüge', es: 'período vacío', ja: '空の文', pt: 'período vazio',
    });
    // Each conjunct keeps its own article, as the pickers' placeholder does.
    expect(strings['console.placeholder']).toEqual({
      en: 'type a word or a command',
      it: 'digita una parola o un comando',
      fr: 'taper un mot ou une commande',
      de: 'ein Wort oder einen Befehl tippen',
      es: 'teclear una palabra o un comando',
      ja: '単語か命令を入力',
      pt: 'digitar uma palavra ou um comando',
    });
    expect(strings['action.hide']).toMatchObject({ en: 'hide', it: 'nascondi', ja: '隠し' });
    expect(strings['action.move']).toMatchObject({ en: 'move', it: 'sposta', de: 'verschieben', ja: '移動' });
    expect(strings['action.replacePeriod']).toMatchObject({ en: 'replace the period', de: 'das Satzgefüge ersetzen', ja: '文を置き換え' });
    expect(strings['action.remove']).toMatchObject({ en: 'Remove', it: 'Rimuovi', fr: 'Retirer', ja: '取り除き' });
    expect(strings['console.list.commands']).toMatchObject({ en: 'commands', de: 'Befehle', ja: '命令' });
    expect(strings['console.list.savedPhrases']).toMatchObject({ en: 'saved phrases', it: 'frasi salvate', ja: '保存済みのフレーズ' });
    expect(strings['console.list.conjunctions']).toMatchObject({ en: 'conjunctions', fr: 'conjonctions' });
    // German's plural of Satzgefüge is the singular.
    expect(strings['console.list.periods']).toMatchObject({ en: 'periods', it: 'periodi', de: 'Satzgefüge' });
    expect(strings['console.list.modals']).toMatchObject({ en: 'modals', it: 'verbi modali', de: 'Modalverben' });
    // The period as the words' possessor: the genitive each language writes.
    expect(strings['console.topic.words']).toEqual({
      en: "the period's words",
      it: 'le parole del periodo',
      fr: 'les mots de la période',
      de: 'die Wörter des Satzgefüges',
      es: 'las palabras del período',
      ja: '文の単語',
      pt: 'as palavras do período',
    });
    expect(strings['console.topic.links']).toMatchObject({ en: 'linked periods', fr: 'périodes liées', de: 'verknüpfte Satzgefüge' });
    expect(strings['console.topic.period']).toMatchObject({ en: 'the period', it: 'il periodo', ja: '文' });
    expect(strings['console.usage.word']).toMatchObject({ en: 'word', de: 'Wort', ja: '単語' });
    expect(strings['console.usage.name']).toMatchObject({ en: 'name', es: 'nombre', ja: '名前' });
    expect(strings['console.usage.command']).toMatchObject({ en: 'command', fr: 'commande', ja: '命令' });
  });

  // What each console command is for, on its help page (B47): an infinitive citation, lower-case and
  // without its full stop, as a gloss is.
  test('says what each console command is for, as a verb is glossed', () => {
    const strings = buildUiStrings();
    const purposes = Object.entries(strings).filter(([key]) => key.startsWith('purpose.'));
    expect(purposes).toHaveLength(28);
    const stopped = purposes.flatMap(([key, byLanguage]) =>
      Object.entries(byLanguage as Record<string, string>).filter(([, text]) => /[.。]$/.test(text)).map(([l]) => `${key}:${l}`),
    );
    expect(stopped).toEqual([]);
    expect(purposes.filter(([, byLanguage]) => !(byLanguage as Record<string, string>)['en']!.startsWith('to ')).map(([key]) => key)).toEqual([]);
    // SET on a setting, the word it belongs to as its possessor; German festlegen keeps its particle
    // on the infinitive.
    expect(strings['purpose.number']).toEqual({
      en: "to set a noun's number",
      it: 'impostare il numero di un sostantivo',
      fr: "définir le nombre d'un nom",
      de: 'den Numerus eines Substantivs festlegen',
      es: 'establecer el número de un sustantivo',
      ja: '名詞の数を設定する',
      pt: 'definir o número de um substantivo',
    });
    // LINK's goal takes "mit" in German, ADD's "zu"; Japanese marks both に.
    expect(strings['purpose.conjunct']).toMatchObject({
      de: 'eine andere Phrase mit einem Substantiv verbinden', ja: '名詞に別のフレーズをつなぐ',
    });
    expect(strings['purpose.possessor']).toMatchObject({ de: 'einen Besitzer zu einem Substantiv hinzufügen', ja: '名詞に所有者を加える' });
    // The standard of comparison's ring, its remove control and `/than`'s purpose (P09-E12 D5), all
    // from the one grammar noun STANDARD_OF_COMPARISON.
    expect(strings['slot.standard']).toEqual({
      en: 'Standard of comparison', it: 'Termine di paragone', fr: 'Terme de comparaison', de: 'Vergleichsgröße',
      es: 'Término de comparación', ja: '比較の基準', pt: 'Termo de comparação',
    });
    expect(strings['action.removeStandard']).toEqual({
      en: 'Remove this standard of comparison', it: 'Rimuovi questo termine di paragone', fr: 'Retirer ce terme de comparaison',
      de: 'Diese Vergleichsgröße entfernen', es: 'Quitar este término de comparación', ja: 'この比較の基準を取り除き',
      pt: 'Remover este termo de comparação',
    });
    expect(strings['purpose.standard']).toMatchObject({ de: 'eine Vergleichsgröße zu einem Adjektiv hinzufügen', ja: '形容詞に比較の基準を加える' });
    expect(strings['diagnostic.noAdjectiveHasStandard']).toMatchObject({
      en: 'No adjective has a standard of comparison', fr: "Aucun adjectif n'a de terme de comparaison", ja: 'どの形容詞も比較の基準がありません',
    });
    expect(strings['purpose.modal']).toMatchObject({ en: 'to govern a verb', it: 'reggere un verbo', de: 'ein Verb regieren', ja: '動詞を支配する' });
    expect(strings['purpose.negate']).toMatchObject({ en: 'to negate a verb', fr: 'nier un verbe', de: 'ein Verb verneinen', ja: '動詞を否定する' });
    expect(strings['purpose.sentiment']).toMatchObject({ it: 'impostare la valutazione di un complemento di causa', ja: '原因の副詞語句の評価を設定する' });
  });

  // The console's lines, history and pins (B45).
  test('names the console’s pins, its history, its lines and its keys', () => {
    const strings = buildUiStrings();
    // `this` line, the one the pin sits on. Japanese labels with the verbal noun.
    expect(strings['action.pinLine']).toEqual({
      en: 'Pin this line', it: 'Fissa questa riga', fr: 'Épingler cette ligne', de: 'Diese Zeile anheften',
      es: 'Fijar esta línea', ja: 'この行をピン留め', pt: 'Fixar esta linha',
    });
    expect(strings['action.unpinLine']).toEqual({
      en: 'Unpin this line', it: 'Sblocca questa riga', fr: 'Désépingler cette ligne', de: 'Diese Zeile lösen',
      es: 'Desfijar esta línea', ja: 'この行をピン留め解除', pt: 'Desafixar esta linha',
    });
    // The toast.phraseSaved shape. Unpinned is "no longer pinned" in Italian and German.
    expect(strings['toast.linePinned']).toEqual({
      en: 'Pinned line', it: 'Riga fissata', fr: 'Ligne épinglée', de: 'Angeheftete Zeile', es: 'Línea fijada', ja: 'ピン留め済みの行', pt: 'Linha fixada',
    });
    expect(strings['toast.lineUnpinned']).toEqual({
      en: 'Unpinned line', it: 'Riga non più fissata', fr: 'Ligne désépinglée', de: 'Nicht mehr angeheftete Zeile',
      es: 'Línea desfijada', ja: 'ピン留め解除済みの行', pt: 'Linha desafixada',
    });
    expect(strings['console.history']).toEqual({
      en: 'history', it: 'cronologia', fr: 'historique', de: 'Verlauf', es: 'historial', ja: '履歴', pt: 'histórico',
    });
    expect(strings['console.list.pinned']).toEqual({
      en: 'pinned lines', it: 'righe fissate', fr: 'lignes épinglées', de: 'angeheftete Zeilen', es: 'líneas fijadas', ja: 'ピン留め済みの行', pt: 'linhas fixadas',
    });
    expect(strings['console.list.recent']).toEqual({
      en: 'recent lines', it: 'righe recenti', fr: 'lignes récentes', de: 'zuletzt verwendete Zeilen', es: 'líneas recientes', ja: '最近使用された行', pt: 'linhas recentes',
    });
    // A row's note agrees with LINE, feminine in the Romance languages.
    expect(strings['console.line.pinned']).toMatchObject({ it: 'fissata', fr: 'épinglée', es: 'fijada', ja: 'ピン留め済み' });
    expect(strings['console.line.recent']).toMatchObject({ fr: 'récente', de: 'zuletzt verwendet', ja: '最近使用された' });
    expect(strings['action.complete']).toEqual({
      en: 'complete', it: 'completa', fr: 'compléter', de: 'vervollständigen', es: 'completar', ja: '補完', pt: 'completar',
    });
    expect(strings['action.apply']).toEqual({
      en: 'apply', it: 'applica', fr: 'appliquer', de: 'anwenden', es: 'aplicar', ja: '適用', pt: 'aplicar',
    });
    expect(strings['action.closeList']).toEqual({
      en: 'close the list', it: "chiudi l'elenco", fr: 'fermer la liste', de: 'die Liste schließen', es: 'cerrar la lista', ja: '一覧を閉じる', pt: 'fechar a lista',
    });
    // C11's agentless passive.
    expect(strings['failure.lineNotRead']).toEqual({
      en: 'This line could not be read.',
      it: 'Questa riga non poteva essere letta.',
      fr: 'Cette ligne ne pouvait pas être lue.',
      de: 'Diese Zeile konnte nicht gelesen werden.',
      es: 'Esta línea no podía ser leída.',
      ja: 'この行は読むことができませんでした。',
      pt: 'Esta linha não podia ser lida.',
    });
  });

  // The console's topics, its moods and degrees, and its list and help page's labels (B46).
  test('names the console’s remaining topics, /statement, /plain and the list and help page’s labels', () => {
    const strings = buildUiStrings();
    expect(strings['console.topic.place']).toEqual({
      en: 'spatial relationship', it: 'relazione spaziale', fr: 'relation spatiale', de: 'räumliche Beziehung',
      es: 'relación espacial', ja: '空間的な関係', pt: 'relação espacial',
    });
    expect(strings['console.topic.mood']).toEqual({ en: 'mood', it: 'modo', fr: 'mode', de: 'Modus', es: 'modo', ja: '叙法', pt: 'modo' });
    expect(strings['console.topic.workspace']).toEqual({
      en: 'workspace', it: 'area di lavoro', fr: 'espace de travail', de: 'Arbeitsbereich', es: 'espacio de trabajo', ja: 'ワークスペース', pt: 'espaço de trabalho',
    });
    // Each school grammar's name for the sentence that asserts.
    expect(strings['mood.statement']).toEqual({
      en: 'Statement', it: 'Proposizione enunciativa', fr: 'Phrase déclarative', de: 'Aussagesatz',
      es: 'Oración enunciativa', ja: '平叙文', pt: 'Frase declarativa',
    });
    // Its own noun: not POSITIVE's polarity (ja 肯定).
    expect(strings['degree.name.positive']).toEqual({
      en: 'Positive degree', it: 'Grado positivo', fr: 'Degré positif', de: 'Positiv', es: 'Grado positivo', ja: '原級', pt: 'Grau normal',
    });
    expect(strings['console.list.values']).toEqual({ en: 'values', it: 'valori', fr: 'valeurs', de: 'Werte', es: 'valores', ja: '値', pt: 'valores' });
    // 今, not 現在, which names the present tense a verb's row so often holds.
    expect(strings['console.now']).toEqual({ en: 'now', it: 'ora', fr: 'maintenant', de: 'jetzt', es: 'ahora', ja: '今', pt: 'agora' });
    expect(strings['console.alias.singular']).toEqual({ en: 'alias', it: 'alias', fr: 'alias', de: 'Alias', es: 'alias', ja: '別名', pt: 'alias' });
    expect(strings['console.alias.plural']).toEqual({ en: 'aliases', it: 'alias', fr: 'alias', de: 'Aliasse', es: 'alias', ja: '別名', pt: 'aliases' });
    expect(strings['console.help.usage']).toEqual({ en: 'Usage', it: 'Uso', fr: 'Utilisation', de: 'Verwendung', es: 'Uso', ja: '使用法', pt: 'Uso' });
    expect(strings['console.help.example']).toEqual({ en: 'Example', it: 'Esempio', fr: 'Exemple', de: 'Beispiel', es: 'Ejemplo', ja: '例', pt: 'Exemplo' });
  });

  // The copy, reorder, resize and mood controls (B27, B28).
  test('names the copy, reorder, resize and mood controls', () => {
    const strings = buildUiStrings();
    expect(strings['action.copyTranslation']).toMatchObject({ en: 'Copy the translation', ja: '翻訳をコピー' });
    expect(strings['status.copied']).toMatchObject({ it: 'Copiata', fr: 'Copiée', ja: 'コピー済み' });
    // LINKED agrees with the noun the satellite rides, as COPIED does with the translation.
    expect(strings['status.linked']).toMatchObject({ en: 'Linked', it: 'Collegato', ja: 'リンク済み' });
    // The adverb of direction follows the object in every language (A142), so the two reorder
    // controls name what they move, as the controls beside them do.
    expect(strings['action.movePeriodUp']).toEqual({
      en: 'Move this period up', it: 'Sposta questo periodo su', fr: 'Déplacer cette période vers le haut',
      de: 'Dieses Satzgefüge nach oben verschieben', es: 'Mover este período arriba', ja: 'この文を上に移動',
      pt: 'Mover este período para cima',
    });
    expect(strings['action.movePeriodDown']).toEqual({
      en: 'Move this period down', it: 'Sposta questo periodo giù', fr: 'Déplacer cette période vers le bas',
      de: 'Dieses Satzgefüge nach unten verschieben', es: 'Mover este período abajo', ja: 'この文を下に移動',
      pt: 'Mover este período para baixo',
    });
    expect(strings['action.resizeContainer']).toMatchObject({
      en: 'Resize this period container',
      it: 'Ridimensiona questo contenitore di periodo',
      ja: 'この文の容器をサイズ変更',
    });
    expect(strings['action.closeWordMap']).toMatchObject({ en: 'Close the word map', ja: '単語の地図を閉じる' });
    expect(strings['action.retry']).toMatchObject({ it: 'Riprova', de: 'Wiederholen', ja: '再試行' });
    expect(strings['period.isCommand']).toMatchObject({ en: 'This period is a command', ja: 'この文は命令です' });
    // The pronoun object attaches the way each language attaches it.
    expect(strings['action.turnOff']).toEqual({
      en: 'turn it off', it: 'disattivalo', fr: 'le désactiver', de: 'es deaktivieren', es: 'desactivarlo', ja: 'それをオフに', pt: 'desativá-lo',
    });
  });

  // The keymap's commands and the help sheet's headings and rows (A20). A key on a box names what it
  // acts on; the picker's bare commands are lower-case, as its key strip reads them.
  test('names the keys, and the help sheet that lists them', () => {
    const strings = buildUiStrings();
    // REPLACE, not CHANGE: German "ändern" would alter the word rather than put another in its place.
    expect(strings['action.replaceWord']).toEqual({
      en: 'Replace the word', it: 'Sostituisci la parola', fr: 'Remplacer le mot', de: 'Das Wort ersetzen',
      es: 'Reemplazar la palabra', ja: '単語を置き換え', pt: 'Substituir a palavra',
    });
    expect(strings['action.clearWord']).toMatchObject({ en: 'Clear the word', it: 'Cancella la parola', ja: '単語を消去' });
    // Definite for the complement the cursor is in, indefinite for the one the menu has yet to add.
    expect(strings['action.removeComplement']).toMatchObject({
      en: 'Remove the complement', de: 'Die Ergänzung entfernen', ja: '補語を取り除き',
    });
    expect(strings['action.addComplement']).toEqual({
      en: 'Add a complement', it: 'Aggiungi un complemento', fr: 'Ajouter un complément', de: 'Eine Ergänzung hinzufügen',
      es: 'Añadir un complemento', ja: '補語を追加', pt: 'Adicionar um complemento',
    });
    expect(strings['satellite.conjunction']).toMatchObject({ en: 'Conjunction', de: 'Konjunktion', ja: '接続詞' });
    expect(strings['period.name']).toEqual({
      en: 'Period', it: 'Periodo', fr: 'Période', de: 'Satzgefüge', es: 'Período', ja: '文', pt: 'Período',
    });
    // A heading drops the article the head would take in a sentence; the owner keeps its own.
    expect(strings['help.commandSubject']).toEqual({
      en: "The command's subject", it: 'Soggetto del comando', fr: 'Sujet de la commande', de: 'Subjekt des Befehls',
      es: 'Sujeto del comando', ja: '命令の主語', pt: 'Sujeito do comando',
    });
    expect(strings['help.pronounPerson']).toMatchObject({
      en: "The pronoun's person", it: 'Persona del pronome', de: 'Person des Pronomens', ja: '代名詞の人称',
    });
    expect(strings['help.translationsAndWords']).toMatchObject({
      en: 'Translations and words', it: 'Traduzioni e parole', de: 'Übersetzungen und Wörter', ja: '翻訳と単語',
    });
    expect(strings['action.move']).toEqual({
      en: 'move', it: 'sposta', fr: 'déplacer', de: 'verschieben', es: 'mover', ja: '移動', pt: 'mover',
    });
    expect(strings['action.close']).toEqual({
      en: 'close', it: 'chiudi', fr: 'fermer', de: 'schließen', es: 'cerrar', ja: '閉じる', pt: 'fechar',
    });
    expect(strings['action.copyLanguage']).toMatchObject({
      en: 'Copy a language', it: 'Copia una lingua', es: 'Copiar un idioma', ja: '言語をコピー',
    });
  });

  // The keys that move about the page, leave a level, fold a group and cycle a value backwards (B44).
  test('names the keys that move the cursor, and the ways it moves', () => {
    const strings = buildUiStrings();
    // GO takes the cursor somewhere; Japanese labels it 移動, GO's instruction label.
    expect(strings['action.go.left']).toEqual({
      en: 'Go left', it: "Va' a sinistra", fr: 'Aller à gauche', de: 'Nach links gehen',
      es: 'Ir a la izquierda', ja: '左に移動', pt: 'Ir para a esquerda',
    });
    expect(strings['action.go.up']).toMatchObject({ it: "Va' su", de: 'Nach oben gehen', ja: '上に移動' });
    expect(strings['action.go.right']).toMatchObject({ fr: 'Aller à droite', es: 'Ir a la derecha', ja: '右に移動' });
    expect(strings['action.go.down']).toMatchObject({ it: "Va' giù", pt: 'Ir para baixo', ja: '下に移動' });
    // MOVE on the slot, the adverb after the object as the period's reorder buttons have it.
    expect(strings['action.moveSlot.left']).toEqual({
      en: 'Move the slot left', it: 'Sposta lo slot a sinistra', fr: 'Déplacer le slot à gauche',
      de: 'Den Slot nach links verschieben', es: 'Mover el slot a la izquierda', ja: 'スロットを左に移動',
      pt: 'Mover o slot para a esquerda',
    });
    expect(strings['action.moveSlot.up']).toMatchObject({ en: 'Move the slot up', de: 'Den Slot nach oben verschieben' });
    expect(strings['action.moveSlot.right']).toMatchObject({ it: 'Sposta lo slot a destra', ja: 'スロットを右に移動' });
    expect(strings['action.moveSlot.down']).toMatchObject({ fr: 'Déplacer le slot vers le bas', es: 'Mover el slot abajo' });
    // NEXT and PREVIOUS follow the noun in the Romance languages and decline in German.
    expect(strings['slot.next']).toEqual({
      en: 'Next slot', it: 'Slot successivo', fr: 'Slot suivant', de: 'Nächster Slot', es: 'Slot siguiente', ja: '次のスロット', pt: 'Slot seguinte',
    });
    expect(strings['slot.previous']).toMatchObject({ it: 'Slot precedente', de: 'Vorheriger Slot', ja: '前のスロット' });
    expect(strings['period.previous']).toEqual({
      en: 'Previous period', it: 'Periodo precedente', fr: 'Période précédente', de: 'Vorheriges Satzgefüge',
      es: 'Período anterior', ja: '前の文', pt: 'Período anterior',
    });
    expect(strings['period.next']).toMatchObject({ fr: 'Période suivante', de: 'Nächstes Satzgefüge', ja: '次の文' });
    expect(strings['region.next']).toEqual({
      en: 'Next region', it: 'Area successiva', fr: 'Zone suivante', de: 'Nächster Bereich', es: 'Zona siguiente', ja: '次の領域', pt: 'Área seguinte',
    });
    expect(strings['region.previous']).toMatchObject({ it: 'Area precedente', de: 'Vorheriger Bereich', ja: '前の領域' });
    // LEAVE: out of the slot in Italian, Spanish and Portuguese, the slot as the object elsewhere.
    expect(strings['action.leaveSlot']).toEqual({
      en: 'Leave the slot', it: 'Esci dallo slot', fr: 'Quitter le slot', de: 'Den Slot verlassen',
      es: 'Salir del slot', ja: 'スロットを退出', pt: 'Sair do slot',
    });
    expect(strings['action.leavePeriod']).toEqual({
      en: 'Leave the period', it: 'Esci dal periodo', fr: 'Quitter la période', de: 'Das Satzgefüge verlassen',
      es: 'Salir del período', ja: '文を退出', pt: 'Sair do período',
    });
    expect(strings['action.compactGroup']).toEqual({
      en: 'Compact the group', it: 'Compatta il gruppo', fr: 'Compacter le groupe', de: 'Die Gruppe verdichten',
      es: 'Compactar el grupo', ja: 'グループを圧縮', pt: 'Compactar o grupo',
    });
    // The word a ⇧ twin's name ends on, after the forward key's and a comma.
    expect(strings['hint.backwards']).toEqual({
      en: 'backwards', it: "all'indietro", fr: 'en arrière', de: 'rückwärts', es: 'hacia atrás', ja: '逆方向に', pt: 'para trás',
    });
    expect(strings['imperative.register']).toEqual({
      en: 'Register', it: 'Registro', fr: 'Registre', de: 'Register', es: 'Registro', ja: '言語使用域', pt: 'Registro',
    });
    expect(strings['instrumental.level']).toEqual({
      en: "The instrumental's level", it: 'Livello del complemento di mezzo', fr: 'Niveau du complément de moyen',
      de: 'Ebene des Instrumentals', es: 'Nivel del complemento circunstancial de instrumento', ja: '手段語の段階',
      pt: 'Nível do adjunto adverbial de instrumento',
    });
  });

  // The picker's and the console's key strips, and the caption a keyboard user reads (B44).
  test('says what ⇥ does in a picker and a prompt, and how a keyboard user fills a slot', () => {
    const strings = buildUiStrings();
    expect(strings['hint.chooseAndNext']).toEqual({
      en: 'choose, and then go to the next slot', it: "scegli, e poi va' allo slot successivo",
      fr: 'choisir, et puis aller au slot suivant', de: 'wählen, und dann zum nächsten Slot gehen',
      es: 'elegir, y luego ir al slot siguiente', ja: '選び、それから次のスロットへ移動', pt: 'escolher, e depois ir ao slot seguinte',
    });
    expect(strings['grid.row']).toEqual({ en: 'row', it: 'riga', fr: 'ligne', de: 'Zeile', es: 'fila', ja: '行', pt: 'linha' });
    expect(strings['grid.value']).toEqual({ en: 'value', it: 'valore', fr: 'valeur', de: 'Wert', es: 'valor', ja: '値', pt: 'valor' });
    expect(strings['console.nextWord']).toEqual({
      en: 'next word', it: 'parola successiva', fr: 'mot suivant', de: 'nächstes Wort', es: 'palabra siguiente', ja: '次の単語', pt: 'palavra seguinte',
    });
    expect(strings['hint.chooseWordKeyboard']).toEqual({
      en: 'use the arrow keys, and then type a word', it: 'usa le frecce, e poi digita una parola',
      fr: 'utiliser les flèches, et puis taper un mot', de: 'die Pfeiltasten verwenden, und dann ein Wort tippen',
      es: 'usar las flechas, y luego teclear una palabra', ja: '矢印キーを使用、それから単語を入力', pt: 'usar as setas, e depois digitar uma palavra',
    });
  });

  // The help overlay's name, its keyboard section and that section's headings and rows (B41).
  test('names the help, and the parts of its keyboard section', () => {
    const strings = buildUiStrings();
    expect(strings['help.heading']).toEqual({
      en: 'Help', it: 'Aiuto', fr: 'Aide', de: 'Hilfe', es: 'Ayuda', ja: 'ヘルプ', pt: 'Ajuda',
    });
    // The purpose relation: Italian "da tastiera", German compounds.
    expect(strings['help.keyboard']).toEqual({
      en: 'Keyboard navigation', it: 'Navigazione da tastiera', fr: 'Navigation de clavier', de: 'Tastaturnavigation',
      es: 'Navegación de teclado', ja: 'キーボードのナビゲーション', pt: 'Navegação de teclado',
    });
    expect(strings['help.section.app']).toEqual({
      en: 'Everywhere', it: 'Ovunque', fr: 'Partout', de: 'Überall', es: 'En todas partes', ja: 'どこでも', pt: 'Em toda parte',
    });
    expect(strings['help.section.box']).toMatchObject({ en: 'Navigation', it: 'Navigazione', es: 'Navegación', ja: 'ナビゲーション' });
    expect(strings['help.section.picker']).toEqual({
      en: 'Word list', it: 'Elenco di parole', fr: 'Liste de mots', de: 'Wortliste', es: 'Lista de palabras', ja: '単語の一覧', pt: 'Lista de palavras',
    });
    expect(strings['help.section.menu']).toEqual({
      en: 'Menus', it: 'Menu', fr: 'Menus', de: 'Menüs', es: 'Menús', ja: 'メニュー', pt: 'Menus',
    });
    expect(strings['help.section.pick']).toEqual({
      en: 'Targets', it: 'Destinazioni', fr: 'Cibles', de: 'Ziele', es: 'Destinos', ja: '対象', pt: 'Alvos',
    });
    expect(strings['help.pickNumberedRow']).toEqual({
      en: 'Choose a numbered row', it: 'Scegli una riga numerata', fr: 'Choisir une ligne numérotée',
      de: 'Eine nummerierte Zeile wählen', es: 'Elegir una fila numerada', ja: '番号付きの行を選び', pt: 'Escolher uma linha numerada',
    });
    expect(strings['help.pickNumbered']).toEqual({
      en: 'Choose a numbered target', it: 'Scegli una destinazione numerata', fr: 'Choisir une cible numérotée',
      de: 'Ein nummeriertes Ziel wählen', es: 'Elegir un destino numerado', ja: '番号付きの対象を選び', pt: 'Escolher um alvo numerado',
    });
    expect(strings['help.nextTarget']).toEqual({
      en: 'Next target', it: 'Destinazione successiva', fr: 'Cible suivante', de: 'Nächstes Ziel',
      es: 'Destino siguiente', ja: '次の対象', pt: 'Alvo seguinte',
    });
  });

  // The keyboard section's paragraph and its levels' notes, and the word list's rows for the tabs and
  // esc (C22). A statement a key follows drops its full stop; one that stands alone keeps it.
  test('says where the keys work, and what the sheet’s notes and the word list’s rows are', () => {
    const strings = buildUiStrings();
    expect(strings['help.keyWorks']).toEqual({
      en: 'A key works in the slot that has the cursor.', it: 'Un tasto funziona nello slot che ha il cursore.',
      fr: 'Une touche fonctionne dans le slot qui a le curseur.',
      de: 'Eine Taste funktioniert im Slot, der den Cursor hat.',
      es: 'Una tecla funciona en el slot que tiene el cursor.', ja: 'キーはカーソルがあるスロットで動作します。',
      pt: 'Uma tecla funciona no slot que tem o cursor.',
    });
    expect(strings['help.returnToPeriod']).toEqual({
      en: 'Return to the period', it: 'Torna al periodo', fr: 'Revenir à la période',
      de: 'Zum Satzgefüge zurückkehren', es: 'Volver al período', ja: '文へ戻る', pt: 'Voltar ao período',
    });
    expect(strings['help.keysEverywhere']).toEqual({
      en: 'Keys that work everywhere', it: 'Tasti che funzionano ovunque', fr: 'Touches qui fonctionnent partout',
      de: 'Tasten, die überall funktionieren', es: 'Teclas que funcionan en todas partes', ja: 'どこでも動作するキー',
      pt: 'Teclas que funcionam em toda parte',
    });
    expect(strings['help.previousValue']).toEqual({
      en: 'Choose the previous value', it: 'Scegli il valore precedente', fr: 'Choisir la valeur précédente',
      de: 'Den vorherigen Wert wählen', es: 'Elegir el valor anterior', ja: '前の値を選び', pt: 'Escolher o valor anterior',
    });
    // BE with a place: estar in Spanish and Portuguese, ある in Japanese.
    expect(strings['help.cursorInPeriod']).toEqual({
      en: 'The cursor is in the period.', it: 'Il cursore è nel periodo.', fr: 'Le curseur est dans la période.',
      de: 'Der Cursor ist im Satzgefüge.', es: 'El cursor está en el período.', ja: 'カーソルは文にあります。',
      pt: 'O cursor está no período.',
    });
    expect(strings['help.cursorInSlot']).toEqual({
      en: 'The cursor is in a slot.', it: 'Il cursore è in uno slot.', fr: 'Le curseur est dans un slot.',
      de: 'Der Cursor ist in einem Slot.', es: 'El cursor está en un slot.', ja: 'カーソルはスロットにあります。',
      pt: 'O cursor está em um slot.',
    });
    // The noun note's five names are five words in Spanish too, where `slot.directObject` repeated
    // "complemento".
    expect(strings['help.directObject']).toEqual({
      en: 'Direct object', it: 'Complemento oggetto diretto', fr: "Complément d'objet direct", de: 'Direktes Objekt',
      es: 'Complemento directo', ja: '直接の目的語', pt: 'Objeto direto',
    });
    const nounNote = (['slot.subject', 'help.directObject', 'help.complement', 'slot.possessor', 'help.conjunct'] as const)
      .map((key) => strings[key].es);
    expect(nounNote).toEqual(['Sujeto', 'Complemento directo', 'Complemento', 'Poseedor', 'Miembro coordinado']);
    expect(strings['help.complement']).toEqual({
      en: 'Complement', it: 'Complemento', fr: 'Complément', de: 'Ergänzung', es: 'Complemento', ja: '補語',
      pt: 'Complemento',
    });
    expect(strings['help.conjunct']).toEqual({
      en: 'Conjunct', it: 'Congiunto', fr: 'Conjoint', de: 'Konjunkt', es: 'Miembro coordinado', ja: '等位項',
      pt: 'Membro coordenado',
    });
    expect(strings['help.replacesSubject']).toEqual({
      en: 'This slot replaces the subject in a command.', it: 'Questo slot sostituisce il soggetto in un comando.',
      fr: 'Ce slot remplace le sujet dans une commande.', de: 'Dieser Slot ersetzt das Subjekt in einem Befehl.',
      es: 'Este slot reemplaza el sujeto en un comando.', ja: 'このスロットは命令で主語を置き換えます。',
      pt: 'Este slot substitui o sujeito em um comando.',
    });
    // A source and a direction on one GO: Portuguese contracts "a as" to "às".
    expect(strings['help.goToTabs']).toEqual({
      en: 'Go from the first row to the tabs', it: "Va' dalla prima riga alle schede",
      fr: 'Aller de la première ligne aux onglets', de: 'Aus der ersten Zeile zu den Tabs gehen',
      es: 'Ir de la primera fila a las pestañas', ja: '第一の行からタブへ移動', pt: 'Ir da primeira linha às abas',
    });
    expect(strings['help.chooseTab']).toEqual({
      en: 'Choose a tab', it: 'Scegli una scheda', fr: 'Choisir un onglet', de: 'Einen Tab wählen',
      es: 'Elegir una pestaña', ja: 'タブを選び', pt: 'Escolher uma aba',
    });
    expect(strings['help.restoreWord']).toEqual({
      en: 'Restore the word', it: 'Ripristina la parola', fr: 'Restaurer le mot', de: 'Das Wort zurückholen',
      es: 'Restaurar la palabra', ja: '単語を復元', pt: 'Restaurar a palavra',
    });
  });

  // The console's part of the overlay: its paragraph, the role commands' note, the prompt's keys and the
  // last line (C22). The syntax after each colon is the call site's.
  test('says how the console’s language is written, and what its prompt’s keys do', () => {
    const strings = buildUiStrings();
    expect(strings['help.console.typeWord']).toEqual({
      en: 'Type a word', it: 'Digita una parola', fr: 'Taper un mot', de: 'Ein Wort tippen',
      es: 'Teclear una palabra', ja: '単語を入力', pt: 'Digitar uma palavra',
    });
    expect(strings['help.console.moveCursor']).toEqual({
      en: 'Move the cursor', it: 'Sposta il cursore', fr: 'Déplacer le curseur', de: 'Den Cursor verschieben',
      es: 'Mover el cursor', ja: 'カーソルを移動', pt: 'Mover o cursor',
    });
    expect(strings['help.console.bracket']).toEqual({
      en: 'A bracket holds a word and commands', it: 'Una parentesi contiene una parola e comandi',
      fr: 'Une parenthèse contient un mot et des commandes', de: 'Eine Klammer enthält ein Wort und Befehle',
      es: 'Un paréntesis contiene una palabra y comandos', ja: '括弧は単語と命令を保持しています',
      pt: 'Um parêntese contém uma palavra e comandos',
    });
    expect(strings['help.console.writesBrackets']).toEqual({
      en: 'The console writes the brackets.', it: 'La console scrive le parentesi.',
      fr: 'La console écrit les parenthèses.', de: 'Die Konsole schreibt die Klammern.',
      es: 'La consola escribe los paréntesis.', ja: 'コンソールは括弧を書きます。', pt: 'O console escreve os parênteses.',
    });
    expect(strings['help.console.listShows']).toEqual({
      en: "The list shows the word's commands.", it: "L'elenco mostra i comandi della parola.",
      fr: 'La liste montre les commandes du mot.', de: 'Die Liste zeigt die Befehle des Wortes.',
      es: 'La lista muestra los comandos de la palabra.', ja: '一覧は単語の命令を見せます。',
      pt: 'A lista mostra os comandos da palavra.',
    });
    expect(strings['help.console.nounPhrase']).toEqual({
      en: "A noun's noun phrase", it: 'Sintagma nominale di un sostantivo', fr: "Syntagme nominal d'un nom",
      de: 'Nominalphrase eines Substantivs', es: 'Sintagma nominal de un sustantivo', ja: '名詞の名詞句',
      pt: 'Sintagma nominal de um substantivo',
    });
    // NEW leads its noun in Italian and French, follows it in Spanish and Portuguese.
    expect(strings['help.console.newPeriod']).toEqual({
      en: 'New period', it: 'Nuovo periodo', fr: 'Nouvelle période', de: 'Neues Satzgefüge', es: 'Nuevo período',
      ja: '新しい文', pt: 'Novo período',
    });
    expect(strings['help.console.otherNoun']).toEqual({
      en: "Another period's noun", it: 'Sostantivo di un altro periodo', fr: "Nom d'une autre période",
      de: 'Substantiv eines anderen Satzgefüges', es: 'Sustantivo de otro período', ja: '別の文の名詞',
      pt: 'Substantivo de outro período',
    });
    expect(strings['help.console.commandEdits']).toEqual({
      en: 'A command edits the slot that has the cursor', it: 'Un comando modifica lo slot che ha il cursore',
      fr: 'Une commande modifie le slot qui a le curseur', de: 'Ein Befehl bearbeitet den Slot, der den Cursor hat',
      es: 'Un comando edita el slot que tiene el cursor', ja: '命令はカーソルがあるスロットを編集します',
      pt: 'Um comando edita o slot que tem o cursor',
    });
    expect(strings['help.console.setsValue']).toEqual({
      en: 'A command sets a value', it: 'Un comando imposta un valore', fr: 'Une commande définit une valeur',
      de: 'Ein Befehl legt einen Wert fest', es: 'Un comando establece un valor', ja: '命令は値を設定します',
      pt: 'Um comando define um valor',
    });
    expect(strings['help.console.lineAgain']).toEqual({
      en: 'A line that is applied again does not change the period.',
      it: 'Una riga che è applicata di nuovo non cambia il periodo.',
      fr: 'Une ligne qui est appliquée de nouveau ne change pas la période.',
      de: 'Eine Zeile, die erneut angewandt wird, ändert das Satzgefüge nicht.',
      es: 'Una línea que es aplicada de nuevo no cambia el período.', ja: 'もう一度適用される行は文を変えません。',
      pt: 'Uma linha que é aplicada de novo não muda o período.',
    });
    // Two commands offered as a choice, the second going to the next word.
    expect(strings['help.console.tab']).toEqual({
      en: 'Complete, or go to the next word', it: "Completa, o va' alla parola successiva",
      fr: 'Compléter, ou aller au mot suivant', de: 'Vervollständigen, oder zum nächsten Wort gehen',
      es: 'Completar, o ir a la palabra siguiente', ja: '補完、または次の単語へ移動', pt: 'Completar, ou ir à palavra seguinte',
    });
    expect(strings['help.console.addLine']).toEqual({
      en: 'Add a line', it: 'Aggiungi una riga', fr: 'Ajouter une ligne', de: 'Eine Zeile hinzufügen',
      es: 'Añadir una línea', ja: '行を追加', pt: 'Adicionar uma linha',
    });
    expect(strings['help.console.previousLine']).toEqual({
      en: 'Previous line', it: 'Riga precedente', fr: 'Ligne précédente', de: 'Vorherige Zeile', es: 'Línea anterior',
      ja: '前の行', pt: 'Linha anterior',
    });
    expect(strings['help.console.emptyLine']).toEqual({
      en: 'Empty line', it: 'Riga vuota', fr: 'Ligne vide', de: 'Leere Zeile', es: 'Línea vacía', ja: '空の行',
      pt: 'Linha vazia',
    });
    expect(strings['help.console.showPinned']).toEqual({
      en: 'show the pinned lines', it: 'mostra le righe fissate', fr: 'montrer les lignes épinglées',
      de: 'die angehefteten Zeilen zeigen', es: 'mostrar las líneas fijadas', ja: 'ピン留め済みの行を見せ',
      pt: 'mostrar as linhas fixadas',
    });
    expect(strings['help.console.chooseCommand']).toEqual({
      en: 'Choose a command to see an example.', it: 'Scegli un comando per vedere un esempio.',
      fr: 'Choisir une commande pour voir un exemple.', de: 'Einen Befehl wählen, um ein Beispiel zu sehen.',
      es: 'Elegir un comando para ver un ejemplo.', ja: '例を見るために命令を選び。',
      pt: 'Escolher um comando para ver um exemplo.',
    });
  });

  // The way back (B40): the Edit menu's pair, in the words each language's editors use, and the toast
  // that offers it, shaped like `toast.periodAdded`.
  test('names undo and redo, and the period a removal took away', () => {
    const strings = buildUiStrings();
    // Italian and French Undo is their Cancel; German keeps "rückgängig" apart from its verb.
    expect(strings['action.undo']).toEqual({
      en: 'Undo', it: 'Annulla', fr: 'Annuler', de: 'Rückgängig machen', es: 'Deshacer', ja: '元に戻す', pt: 'Desfazer',
    });
    // German Redo is its Retry; Japanese says the stem やり直し.
    expect(strings['action.redo']).toEqual({
      en: 'Redo', it: 'Ripeti', fr: 'Rétablir', de: 'Wiederholen', es: 'Rehacer', ja: 'やり直し', pt: 'Refazer',
    });
    expect(strings['toast.periodRemoved']).toEqual({
      en: 'Removed period', it: 'Periodo rimosso', fr: 'Période retirée', de: 'Entferntes Satzgefüge',
      es: 'Período quitado', ja: '削除済みの文', pt: 'Período removido',
    });
  });

  // The console's name, and what its controls do to it (B42).
  test('names the console, and what its controls and keys do to it', () => {
    const strings = buildUiStrings();
    expect(strings['console.name']).toEqual({
      en: 'Console', it: 'Console', fr: 'Console', de: 'Konsole', es: 'Consola', ja: 'コンソール', pt: 'Console',
    });
    expect(strings['action.hideConsole']).toEqual({
      en: 'Hide the console', it: 'Nascondi la console', fr: 'Cacher la console', de: 'Die Konsole verstecken',
      es: 'Esconder la consola', ja: 'コンソールを隠し', pt: 'Esconder o console',
    });
    expect(strings['action.resizeConsole']).toMatchObject({
      en: 'Resize the console', it: 'Ridimensiona la console', de: 'Die Konsole skalieren', ja: 'コンソールをサイズ変更',
    });
    // The console is where the command is typed: a locative, which each language marks its own way.
    expect(strings['action.typeCommand']).toEqual({
      en: 'Type a command in the console', it: 'Digita un comando nella console', fr: 'Taper une commande dans la console',
      de: 'Einen Befehl in der Konsole tippen', es: 'Teclear un comando en la consola', ja: 'コンソールで命令を入力',
      pt: 'Digitar um comando no console',
    });
    expect(strings['action.showInConsole']).toEqual({
      en: 'Show in the console', it: 'Mostra nella console', fr: 'Montrer dans la console', de: 'In der Konsole zeigen',
      es: 'Mostrar en la consola', ja: 'コンソールで見せ', pt: 'Mostrar no console',
    });
  });

  // The canvas, a preview, editing and the toolbar (B43).
  test('names the canvas and what the keys do to it, the preview, editing and the toolbar', () => {
    const strings = buildUiStrings();
    expect(strings['status.preview']).toEqual({
      en: 'Preview', it: 'Anteprima', fr: 'Aperçu', de: 'Vorschau', es: 'Vista previa', ja: 'プレビュー', pt: 'Pré-visualização',
    });
    // The canvas as the goal of going back: German contracts "zu der" and puts the particle last.
    expect(strings['action.returnToCanvas']).toEqual({
      en: 'return to the canvas', it: 'torna alla tela', fr: 'revenir au canevas', de: 'zur Arbeitsfläche zurückkehren',
      es: 'volver al lienzo', ja: 'キャンバスへ戻る', pt: 'voltar à tela',
    });
    expect(strings['console.fromCanvas']).toEqual({
      en: 'Canvas', it: 'Tela', fr: 'Canevas', de: 'Arbeitsfläche', es: 'Lienzo', ja: 'キャンバス', pt: 'Tela',
    });
    expect(strings['action.expandCanvas']).toEqual({
      en: 'Expand the canvas', it: 'Espandi la tela', fr: 'Étendre le canevas', de: 'Die Arbeitsfläche erweitern',
      es: 'Expandir el lienzo', ja: 'キャンバスを展開', pt: 'Expandir a tela',
    });
    // SHRINK, not COMPACT: the surface gets smaller, nothing is packed ("verkleinern", 縮小, not "verdichten", 圧縮).
    expect(strings['action.shrinkCanvas']).toEqual({
      en: 'Shrink the canvas', it: 'Rimpicciolisci la tela', fr: 'Réduire le canevas', de: 'Die Arbeitsfläche verkleinern',
      es: 'Reducir el lienzo', ja: 'キャンバスを縮小', pt: 'Reduzir a tela',
    });
    expect(strings['action.edit']).toEqual({
      en: 'Edit', it: 'Modifica', fr: 'Modifier', de: 'Bearbeiten', es: 'Editar', ja: '編集', pt: 'Editar',
    });
    expect(strings['action.editPeriod']).toMatchObject({
      en: 'Edit this period', it: 'Modifica questo periodo', de: 'Dieses Satzgefüge bearbeiten', ja: 'この文を編集',
    });
    expect(strings['hint.clickToEdit']).toEqual({
      en: 'click to edit', it: 'clicca per modificare', fr: 'cliquer pour modifier', de: 'klicken, um zu bearbeiten',
      es: 'clicar para editar', ja: '編集するためにクリック', pt: 'clicar para editar',
    });
    expect(strings['app.toolbar']).toEqual({
      en: 'Toolbar', it: 'Barra degli strumenti', fr: "Barre d'outils", de: 'Symbolleiste', es: 'Barra de herramientas',
      ja: 'ツールバー', pt: 'Barra de ferramentas',
    });
  });
});

// A253. As for a definition (definitions.test.ts): the boot render refuses a UI string only when a
// whole language comes back empty, so a plan whose unseeded concept is one word among others boots
// and serves the hole ("the woman speaks like the."). It should fail naming the concept.
describe('known bugs: a boot render serves the hole an unseeded concept leaves (A253)', () => {
  test('a UI string naming an unseeded complement fails the boot, naming the concept', async () => {
    const engine = await vi.importActual<typeof import('@signi/engine')>('@signi/engine');
    const [firstPlanKey] = byKind.plan[0]!;
    // Every non-plan entry renders for real; the first plan entry names the unseeded concept.
    vi.mocked(translate).mockImplementation((plan, lookup) => engine.translate(
      plan === (UI_STRINGS as Record<string, UiStringDef>)[firstPlanKey]!.plan
        ? { subject: { concept: 'WOMAN' }, verbPhrase: { verb: 'SPEAK' }, complements: { manner: { phrase: { concept: 'UNICORN' } } } }
        : plan,
      lookup,
    ));
    expect(() => buildUiStrings()).toThrow(/UNICORN/);
  });

  // Swaps the first plan entry's plan for `hole`; every other entry renders for real.
  const withFirstPlan = async (hole: PhrasePlan) => {
    const engine = await vi.importActual<typeof import('@signi/engine')>('@signi/engine');
    const [firstPlanKey, firstPlan] = byKind.plan[0]!;
    vi.mocked(translate).mockImplementation((plan, lookup) =>
      engine.translate(plan === firstPlan.plan ? hole : plan, lookup));
    return firstPlanKey;
  };

  test.each(HOLES)('a UI string naming an unseeded %s fails the boot, naming the concept', async (_slot, plan) => {
    const key = await withFirstPlan(plan);
    expect(() => buildUiStrings()).toThrow(
      `UI string "${key}" names unknown concept: UNICORN. Seed them, or change its entry.`,
    );
  });

  test('a UI string naming several unseeded concepts names them all', async () => {
    const key = await withFirstPlan(TWO_HOLES);
    expect(() => buildUiStrings()).toThrow(
      `UI string "${key}" names unknown concepts: GRIFFIN, UNICORN. Seed them, or change its entry.`,
    );
  });

  test('a word entry naming an unseeded concept fails the boot the same way', async () => {
    const engine = await vi.importActual<typeof import('@signi/engine')>('@signi/engine');
    const [wordKey, wordDef] = byKind.word[0]!;
    vi.mocked(translateWord).mockImplementation((word, lookup, agreesWith) =>
      engine.translateWord(word === wordDef.word ? 'UNICORN' : word, lookup, agreesWith));
    expect(() => buildUiStrings()).toThrow(
      `UI string "${wordKey}" names unknown concept: UNICORN. Seed them, or change its entry.`,
    );
  });

  test('regression: every shipped entry still boots against the seeded corpus', () => {
    expect(() => buildUiStrings()).not.toThrow();
  });
});
