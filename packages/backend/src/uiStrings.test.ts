import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  translate,
  translateConjunction,
  translateDegree,
  translateDeterminer,
  translatePossessive,
  translateSpecifier,
  translateWord,
} from '@signi/engine';
import { LANGUAGES, UI_STRINGS } from '@signi/shared';
import type {
  LanguageCode,
  Translation,
  UiStringConjunctionDef,
  UiStringDef,
  UiStringDegreeDef,
  UiStringDeterminerDef,
  UiStringPlanDef,
  UiStringPossessiveDef,
  UiStringSpecifierDef,
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
    translateDegree: vi.fn(engine.translateDegree),
    translateDeterminer: vi.fn(engine.translateDeterminer),
    translatePossessive: vi.fn(engine.translatePossessive),
    translateSpecifier: vi.fn(engine.translateSpecifier),
  };
});

const LANGUAGE_CODES = Object.keys(LANGUAGES) as LanguageCode[];
const CATALOG = Object.entries(UI_STRINGS as Record<string, UiStringDef>);
// The seven kinds, split the way `renderEntry` dispatches them: whichever of the six marker
// properties an entry carries names its kind, and an entry carrying none is a plan.
const kindOf = (d: UiStringDef): string =>
  d.determiner !== undefined ? 'determiner'
  : d.possessive !== undefined ? 'possessive'
  : d.conjunction !== undefined ? 'conjunction'
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
  specifier: of<UiStringSpecifierDef>('specifier'),
  degree: of<UiStringDegreeDef>('degree'),
  word: of<UiStringWordDef>('word'),
  plan: of<UiStringPlanDef>('plan'),
};

const rendering = (text: (language: LanguageCode) => string): Translation[] =>
  LANGUAGE_CODES.map((language) => ({ language, text: text(language) }) as Translation);

afterEach(() => {
  const fns = [translate, translateWord, translateConjunction, translateDegree,
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
      expect(translateDeterminer).toHaveBeenCalledWith(d.determiner, lookupLexicalEntry, d.agreesWith);
    }
    expect(translatePossessive).toHaveBeenCalledTimes(byKind.possessive.length);
    for (const [, d] of byKind.possessive) {
      expect(translatePossessive).toHaveBeenCalledWith(d.possessive, lookupLexicalEntry, d.agreesWith);
    }
    expect(translateConjunction).toHaveBeenCalledTimes(byKind.conjunction.length);
    for (const [, d] of byKind.conjunction) {
      // The one function word cited on nothing: a conjunction agrees with neither side.
      expect(translateConjunction).toHaveBeenCalledWith(d.conjunction);
    }
    expect(translateSpecifier).toHaveBeenCalledTimes(byKind.specifier.length);
    for (const [, d] of byKind.specifier) {
      expect(translateSpecifier).toHaveBeenCalledWith(d.specifier, lookupLexicalEntry, d.agreesWith);
    }
    expect(translateDegree).toHaveBeenCalledTimes(byKind.degree.length);
    for (const [, d] of byKind.degree) {
      expect(translateDegree).toHaveBeenCalledWith(d.degree, lookupLexicalEntry, d.agreesWith);
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
    const fns = [translate, translateWord, translateConjunction, translateDegree,
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
});
