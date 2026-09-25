import type {
  AbstractionLevel,
  CoordConjunction,
  Definiteness,
  Degree,
  LanguageCode,
  NounElement,
  NounPhrase,
  PhrasePlan,
  PronominalPossessor,
  Specifier,
  Subordinator,
} from './index.js';

/**
 * Post-processing applied to an engine-rendered UI string, once, for every language.
 * The engine renders nouns lower-case outside English and ends a period with a full stop;
 * neither suits a heading or a label, so entries opt out declaratively instead of each
 * call site re-implementing the trim.
 */
export interface UiStringFormat {
  /**
   * Uppercase the first letter only, past any mark that opens the string (Spanish "¿" before a
   * question: "¿El servidor…"). A no-op for non-cased scripts (e.g. 日本語).
   */
  capitalize?: boolean;
  /**
   * Drop a trailing full stop — ASCII "." or Japanese "。". A question ends on its question mark
   * instead ("?", fr " ?", ja "？"), which this leaves in place, so a question needs no format of its own.
   */
  stripPeriod?: boolean;
}

interface UiStringCommon {
  format?: UiStringFormat;
  /** Shown while the bundle is in flight or the backend is unreachable, so nothing renders blank. */
  fallback: string;
}

/** A string the engine renders from a period. This is the usual entry. */
export interface UiStringPlanDef extends UiStringCommon {
  /** The period the engine renders into every language. This is the string's definition. */
  plan: PhrasePlan;
  word?: never;
  determiner?: never;
  possessive?: never;
  conjunction?: never;
  subordinator?: never;
  specifier?: never;
  degree?: never;
}

/**
 * A string that is one word, taken straight from the lexicon. For the labels a period cannot
 * express — a bare adjective ("singular", "male"), which a sentence only ever shows attached
 * to a noun it agrees with.
 */
export interface UiStringWordDef extends UiStringCommon {
  /**
   * The concept the string names — or the few concepts that name it together, when one word will
   * not do it ("second singular", the person of a command). The engine joins them the way its
   * language joins words.
   */
  word: string | string[];
  /**
   * The noun the word describes, when the word is an adjective. An adjective has no settled
   * form until something fixes its gender and number, and the label for a value of a row is
   * describing that row's noun even though the noun itself is only in the caption beside it:
   * the ordinals of the person row agree with "person" (it "la **prima** persona", feminine),
   * the values of the gender row with "gender" (it "il genere **neutro**", masculine). Which
   * gender that noun has is a fact about each language's own lexicon, so it is resolved per
   * language rather than stated here.
   */
  agreesWith?: string;
  plan?: never;
  determiner?: never;
  possessive?: never;
  conjunction?: never;
  subordinator?: never;
  specifier?: never;
  degree?: never;
}

/**
 * One determiner value, named by the word that realizes it — the entries of the determiner menu.
 * Neither a period nor a lexicon word: a determiner is a function word each engine *builds* from
 * the noun it determines (gender, number, and the sound it starts with), so it is rendered by
 * citing it with a noun rather than by looking it up.
 */
export interface UiStringDeterminerDef extends UiStringCommon {
  /** The determiner value this string names ("definite" → the / il / der / この…). */
  determiner: Definiteness;
  /**
   * The noun the determiner is cited with. Its gender and initial sound settle the form the
   * label shows (it "il nome" → "il"; a feminine noun would give "la"), exactly as `agreesWith`
   * settles an adjective label's. Defaults to the grammar noun NOUN — a determiner determines a
   * noun, so the menu names it as it would appear on the word "noun" itself.
   */
  agreesWith?: string;
  plan?: never;
  word?: never;
  possessive?: never;
  conjunction?: never;
  subordinator?: never;
  specifier?: never;
  degree?: never;
}

/**
 * One possessive pronoun, named by the word it spells — the label on a coreference link. Like a
 * determiner it is a function word with no citation form of its own: English, German and Japanese
 * spell it from the antecedent's features alone (his/her/its, sein/ihr, 彼の), while the Romance
 * languages *also* agree it with the noun possessed ("il **suo** cane", "la **sua** casa"). So it
 * too is rendered by citing it with a noun rather than by looking it up.
 */
export interface UiStringPossessiveDef extends UiStringCommon {
  /** The antecedent's features — person, number and (where it splits the word) natural gender. */
  possessive: PronominalPossessor;
  /**
   * The noun the possessive is cited with. Its gender and initial sound settle the form the label
   * shows (it "nome" is masculine → "suo"; a feminine noun would give "sua"), exactly as it settles
   * a determiner label's. Defaults to the grammar noun NOUN — the label names the possessive a noun
   * would take, since which noun the link actually possesses is a different word in each language.
   */
  agreesWith?: string;
  plan?: never;
  word?: never;
  determiner?: never;
  conjunction?: never;
  subordinator?: never;
  specifier?: never;
  degree?: never;
}

/**
 * One coordinating conjunction, named by the word it spells — the entries of the conjunction menu.
 * The one function word that agrees with nothing, so unlike a determiner it takes no `agreesWith`;
 * what it still needs is an engine, because no lexicon holds it and what counts as *one word* is a
 * fact about the language — `then` is a connective adverb in all seven and comes back with the
 * coordinator it leans on ("e poi", "und dann", それから). It is cited between two clauses, which is
 * where the menu puts it: the same word may join two nouns differently (ja 〜と, not そして).
 */
export interface UiStringConjunctionDef extends UiStringCommon {
  /** The conjunction this string names ("but" → ma / mais / aber / しかし). */
  conjunction: CoordConjunction;
  plan?: never;
  word?: never;
  determiner?: never;
  possessive?: never;
  subordinator?: never;
  specifier?: never;
  degree?: never;
}

/**
 * One subordinating word, named by the word it spells — the entries of the subordinate-clause menu
 * (P09-E12 D9): the conjunction an adverbial clause opens on ("when" / quando / wenn / 〜時に) or
 * `that`, the complementizer of an object clause (che / que / dass / 〜と). The sibling of the
 * coordinating conjunction's entry, and cited for the same reason: no lexicon holds it and what
 * counts as one word is the language's own ("dopo che", "parce que"). Japanese postposes it to its
 * clause, so it is written with the 〜 that stands for the clause, as a dictionary writes a bound form.
 */
export interface UiStringSubordinatorDef extends UiStringCommon {
  /** The word this string names ("because" → perché / parce que / weil / 〜ので). */
  subordinator: Subordinator;
  plan?: never;
  word?: never;
  determiner?: never;
  possessive?: never;
  conjunction?: never;
  specifier?: never;
  degree?: never;
}

/**
 * One complement specifier, named by the adposition it spells — the tooltips of the spatial-relation
 * and cause-sentiment toolbars. A specifier is not a word the plan carries but a choice the engines
 * *realise*, and the adposition realising it has no citation form: the Romance prepositions fuse
 * with the article ("nella casa"), German marks the relation on the article's case, and Japanese
 * wraps its noun in a circumposition. So it is cited with a noun, held bare so that no article
 * comes along, exactly as a determiner is cited on one.
 */
export interface UiStringSpecifierDef extends UiStringCommon {
  /** The specifier this string names — a `path` relation or a cause `sentiment`. */
  specifier: Specifier;
  /**
   * The noun the adposition is cited with. Defaults to the grammar noun NOUN, as a determiner's
   * does. It is held bare whatever it is, so only a language whose adposition *changes* with the
   * noun would have reason to name another; none of the seven does today.
   */
  agreesWith?: string;
  plan?: never;
  word?: never;
  determiner?: never;
  possessive?: never;
  conjunction?: never;
  subordinator?: never;
  degree?: never;
}

/**
 * One comparative degree, named by what it adds to an adjective — the label on the degree chip.
 * Three of the seven languages spell a degree as a word of its own ("più", "más", もっと), German
 * remakes the adjective instead ("größer", "am größten"), and English does either depending on the
 * adjective ("bigger", but "more beautiful"). That last is why it is cited rather than looked up,
 * and why what it is cited *on* is an adjective rather than a noun.
 */
export interface UiStringDegreeDef extends UiStringCommon {
  /** The degree this string names ("more" → più / plus / größer / もっと). */
  degree: Degree;
  /**
   * The adjective the degree is cited on. Defaults to BIG — short, regular and compared
   * synthetically wherever a language has the choice, so the label shows each language's ordinary
   * comparison rather than the periphrasis a long adjective would force on English and German.
   */
  agreesWith?: string;
  plan?: never;
  word?: never;
  determiner?: never;
  possessive?: never;
  conjunction?: never;
  subordinator?: never;
  specifier?: never;
}

export type UiStringDef =
  | UiStringPlanDef
  | UiStringWordDef
  | UiStringDeterminerDef
  | UiStringPossessiveDef
  | UiStringConjunctionDef
  | UiStringSubordinatorDef
  | UiStringSpecifierDef
  | UiStringDegreeDef;

// Preserves the literal keys (a plain `Record<string, UiStringDef>` annotation would widen
// them to `string` and lose the typo-checking on `t('…')`).
const defineUiStrings = <T extends Record<string, UiStringDef>>(defs: T): T => defs;

// A name is the bare noun: the label of a grammar category, a slot or a mode.
const nameOf = (concept: string): PhrasePlan =>
  ({ subject: { concept, definiteness: 'bare' } }) as PhrasePlan;

const NAME_FORMAT: UiStringFormat = { capitalize: true, stripPeriod: true };

// A control's label is a command, but one addressed to nobody: the `instruction` register of the
// imperative, which each engine renders in the form its language puts on a button — en "Save",
// it "Salva", fr "Enregistrer", de "Speichern", ja "保存" (see PhrasePlan.imperativeRegister).
// The engines drop the subject from the surface; it is carried only to fix the person.
const commandOf = (concept: string): PhrasePlan =>
  ({
    subject: { concept: 'SECOND_PERSON', definiteness: 'bare' },
    verbPhrase: { verb: concept },
    imperative: true,
    imperativeRegister: 'instruction',
  }) as PhrasePlan;

// The named parts of the canvas a control can act on, each with the grammar noun its box is titled
// by (`slot.*`, `category.adjective`, `satellite.determiner`) and that noun's English for the fallback.
// The agent is the subject's box and ring in a passive, titled `slot.agent` for the role they play
// there (de "das Agens löschen", ja 動作主を消去); the voice is the satellite that puts the clause in
// the passive, whose box is shown and hidden like the tense's (it "nascondi la diatesi", ja 態を隠し).
const CANVAS_PARTS = {
  subject: { concept: 'SUBJECT_GRAMMAR', en: 'subject' },
  agent: { concept: 'AGENT_GRAMMAR', en: 'agent' },
  verb: { concept: 'VERB', en: 'verb' },
  object: { concept: 'OBJECT_GRAMMAR', en: 'object' },
  adverb: { concept: 'ADVERB', en: 'adverb' },
  adjective: { concept: 'ADJECTIVE', en: 'adjective' },
  instrumental: { concept: 'INSTRUMENTAL', en: 'instrumental' },
  predicative: { concept: 'SUBJECT_COMPLEMENT', en: 'subject complement' },
  manner: { concept: 'ADVERBIAL_OF_MANNER', en: 'adverbial of manner' },
  determiner: { concept: 'DETERMINER', en: 'determiner' },
  possessor: { concept: 'POSSESSOR', en: 'possessor' },
  modal: { concept: 'MODAL', en: 'modal' },
  tense: { concept: 'TENSE', en: 'tense' },
  aspect: { concept: 'ASPECT', en: 'aspect' },
  voice: { concept: 'VOICE', en: 'voice' },
  verbPhrase: { concept: 'VERB_PHRASE', en: 'verb phrase' },
  terminus: { concept: 'TERMINUS', en: 'terminus' },
  locative: { concept: 'LOCATIVE', en: 'locative' },
  direction: { concept: 'DIRECTION', en: 'direction' },
  source: { concept: 'SOURCE', en: 'source' },
  route: { concept: 'ROUTE', en: 'route' },
  // P09-E12b's three boxes, named by the grammar nouns that title them (`slot.temporal` and siblings).
  temporal: { concept: 'TEMPORAL_COMPLEMENT', en: 'temporal' },
  purpose: { concept: 'PURPOSE_COMPLEMENT', en: 'purpose' },
  topic: { concept: 'TOPIC_COMPLEMENT', en: 'topic' },
  cause: { concept: 'CAUSE_COMPLEMENT', en: 'cause' },
  // P13's two boxes: what the object is taken as or turned into, and the companion.
  objectPredicative: { concept: 'OBJECT_COMPLEMENT', en: 'object complement' },
  comitative: { concept: 'COMITATIVE', en: 'comitative' },
} as const;

/** A named part of the canvas — see CANVAS_PARTS and the `action.<verb>.<part>` families. */
export type CanvasPart = keyof typeof CANVAS_PARTS;

// The complements the canvas draws as a boxed ring of their own: every one but the instrumental, which
// lives in a period container of its own and is linked to (the canvas's BOX_COMPLEMENT_TYPES).
const BOXED_COMPLEMENT_PARTS = [
  'objectPredicative', 'predicative', 'terminus', 'comitative', 'manner', 'locative', 'direction', 'source',
  'route', 'temporal', 'purpose', 'topic', 'cause',
] as const satisfies readonly CanvasPart[];

// Which parts each of those controls can act on — the members of each family below, exported so
// the canvas asks the catalog rather than keeping its own copy. Every part whose word sits in a box
// has a clear button; the parts behind a reveal control can be shown and hidden; the constituents
// drawn as a ring of their own can be expanded and compacted.
export const CLEARABLE_PARTS = [
  'subject', 'agent', 'verb', 'object', 'adverb', 'adjective', 'modal', 'instrumental',
  ...BOXED_COMPLEMENT_PARTS, 'possessor',
] as const satisfies readonly CanvasPart[];
export const REVEALABLE_PARTS = [
  'adjective', 'adverb', 'object', 'modal', 'tense', 'aspect', 'voice', 'instrumental',
  ...BOXED_COMPLEMENT_PARTS, 'determiner', 'possessor',
] as const satisfies readonly CanvasPart[];
export const COLLAPSIBLE_PARTS = [
  'subject', 'agent', 'verbPhrase', 'object', 'instrumental', ...BOXED_COMPLEMENT_PARTS,
] as const satisfies readonly CanvasPart[];
// The rings a remove control drops from the clause: the boxed complements. The subject and the object
// stay (clearing their word empties them), and the instrumental has no ring of its own to remove.
export const REMOVABLE_PARTS = BOXED_COMPLEMENT_PARTS;

// One command, one entry per part it can act on: `commandOf(verb)` on the part's grammar noun,
// definite, keyed `<key>.<part>`. The mapped return type keeps every key literal, so `t('…')` still
// typo-checks the family's members.
const commandOnEach = <const K extends string, const P extends CanvasPart>(
  key: K,
  verb: string,
  fallbackVerb: string,
  parts: readonly P[],
): Record<`${K}.${P}`, UiStringPlanDef> =>
  Object.fromEntries(
    parts.map((part) => [
      `${key}.${part}`,
      {
        plan: {
          ...commandOf(verb),
          directObject: { concept: CANVAS_PARTS[part].concept, definiteness: 'definite' },
        } as PhrasePlan,
        format: NAME_FORMAT,
        fallback: `${fallbackVerb} the ${CANVAS_PARTS[part].en}`,
      },
    ]),
  ) as Record<`${K}.${P}`, UiStringPlanDef>;

// One instrument, said three ways: the START command taking "choosing a word" as its instrumental,
// at whichever abstraction level is asked for. At `object` the action drops away and the noun
// phrase *is* the instrument (see AbstractionLevel), which is what makes the three read as one
// gradient rather than three unrelated sentences. The action levels are spelled out rather than
// asked of `isActionLevel`: index.ts re-exports this module, so importing a *value* back from it
// would close a runtime cycle and leave the export undefined at load.
const exampleAt = (level: AbstractionLevel): PhrasePlan =>
  ({
    ...commandOf('START'),
    complements: {
      instrumental: {
        phrase: { concept: 'WORD', definiteness: 'indefinite' },
        ...(level === 'object' ? {} : { action: { verb: 'CHOOSE' } }),
        specifiers: [{ kind: 'abstraction', value: level }],
      },
    },
  }) as PhrasePlan;

// The shape every "Could not …" failure message takes: the thing that the act failed on, promoted
// to subject of an agentless passive under a negated past ability — "the phrase could not be saved",
// de "die Phrase konnte nicht gespeichert werden", ja 「フレーズは保存することができませんでした」.
//
// Agentlessness is a subject choice, not a value of `voice` (see Voice): the agent named here is
// GENERIC_PERSON, and no language speaks a generic agent as a by-phrase, so the translator drops it
// and the plain agentless passive is what is left. The active with that same subject reads well in
// it/fr/de ("non si è potuto…", "man konnte…") but not in English ("one could not save the phrase"),
// which is why these waited for the voice rather than taking it.
//
// The modal is CAN throughout, past and negative — the negation is the modal's own, since it is the
// ability that failed, not the saving that was not done (A03 made that difference sayable). It also keeps the
// Romance past in its imperfect ("non poteva", "ne pouvait pas"), where a bare past would reach for
// the literary perfective ("non fu salvata") that no error message should be written in.
const couldNotBe = (verb: string, patient: NounPhrase): PhrasePlan =>
  ({
    subject: { concept: 'GENERIC_PERSON' },
    verbPhrase: { verb, voice: 'passive', modals: [{ verb: 'CAN', negative: true }], tense: 'past' },
    directObject: patient,
  }) as PhrasePlan;

// What a console command is for, said as a dictionary says what a verb means: the infinitive
// citation (PhrasePlan.infinitive), its GENERIC_PERSON subject a throwaway every engine drops —
// "to set a noun's number", de "den Numerus eines Substantivs festlegen", ja 名詞の数を設定する. The
// verb definitions are built the same way by the backend's `infinitiveGloss`, which the catalog
// cannot import. `goal` is what the object is added or linked to, the verb's `terminus` ("to add a
// possessor **to a noun**", de "zu einem Substantiv", ja 名詞に).
const purposeOf = (verb: string, object: NounElement, goal?: NounPhrase): PhrasePlan =>
  ({
    subject: { concept: 'GENERIC_PERSON' },
    verbPhrase: { verb },
    directObject: object,
    ...(goal ? { complements: { terminus: { phrase: goal } } } : {}),
    infinitive: true,
  }) as PhrasePlan;

// The purposes of the setting commands: SET on the setting, definite, with the word it belongs to as
// its possessor, indefinite — "to set a verb's tense", it "impostare il tempo di un verbo", de "das
// Tempus eines Verbs festlegen".
const setterOf = (setting: string, owner: string, adjectives?: string[]): PhrasePlan =>
  purposeOf('SET', {
    concept: setting,
    definiteness: 'definite',
    ...(adjectives ? { adjectives } : {}),
    possessor: { concept: owner, definiteness: 'indefinite' },
  });

// The four ways an arrow key goes, each named by the direction adverb it puts on a verb as the verb's
// modifier, as `action.movePeriodUp` does (localization B44). Keyed `<key>.<left|up|right|down>`, the
// keymap's own direction names, so a command built per direction can write t(`action.go.${dir}`).
const ARROW_DIRECTIONS = { left: 'LEFT', up: 'UP', right: 'RIGHT', down: 'DOWN' } as const;
type ArrowDirection = keyof typeof ARROW_DIRECTIONS;
const inEachDirection = <const K extends string>(
  key: K,
  plan: (adverb: string) => PhrasePlan,
  fallback: (dir: ArrowDirection) => string,
): Record<`${K}.${ArrowDirection}`, UiStringPlanDef> =>
  Object.fromEntries(
    (Object.keys(ARROW_DIRECTIONS) as ArrowDirection[]).map((dir) => [
      `${key}.${dir}`,
      { plan: plan(ARROW_DIRECTIONS[dir]), format: NAME_FORMAT, fallback: fallback(dir) },
    ]),
  ) as Record<`${K}.${ArrowDirection}`, UiStringPlanDef>;

/**
 * Every engine-rendered string the UI shows, keyed. Adding one means adding one entry here:
 * the backend renders the whole catalog at startup and serves it from GET /api/ui-strings,
 * and the frontend reads it with `useUiString()` — no new route, fetcher, or hook.
 *
 * The plans are the single source of truth for the strings: edit a plan and it changes in
 * all seven languages at once.
 */
export const UI_STRINGS = defineUiStrings({
  // The app's payoff/tagline. Sourced from the "semantic phrase creator" selection: subject
  // CREATOR (masc, bare) + an attributive noun-modifier PHRASE (material relation, plural)
  // carrying its own adjective SEMANTIC. Renders e.g. en "semantic phrase creator",
  // it "creatore di frasi semantiche", ja "意味的なフレーズの創造者". The CSS uppercases it.
  'app.payoff': {
    plan: {
      subject: {
        concept: 'CREATOR',
        gender: 'masc',
        definiteness: 'bare',
        adjectives: [],
        nounModifiers: [
          { concept: 'PHRASE', relation: 'material', number: 'plural', adjectives: ['SEMANTIC'] },
        ],
      },
    } as PhrasePlan,
    format: { stripPeriod: true },
    // What the engine renders in English, so the header and the tab title read the same before the
    // bundle lands as after (index.html carries it too, capitalized, until the app boots).
    fallback: 'semantic phrase creator',
  },
  // The header's row of controls, as its aria-label: the bare TOOLBAR (it "Barra degli strumenti",
  // de "Symbolleiste", ja ツールバー). It went unnamed until the catalogue had the word.
  'app.toolbar': { plan: nameOf('TOOLBAR'), format: NAME_FORMAT, fallback: 'Toolbar' },

  // The heading of the translations area: the TRANSLATION noun in the plural, bare — the
  // panel lists many translations.
  'translations.heading': {
    plan: { subject: { concept: 'TRANSLATION', number: 'plural', definiteness: 'bare' } } as PhrasePlan,
    format: { capitalize: true, stripPeriod: true },
    fallback: 'Translations',
  },

  // The copy control on each row of the translations panel. It copies that row's translation, so it
  // says so: COPY on the definite TRANSLATION ("copia la traduzione", ja 翻訳をコピー). Not "copy to the
  // clipboard": the destination is a direction complement, which Italian, German and Portuguese render
  // as a goal one goes towards ("zur Zwischenablage"), not a store one puts things into ("in die").
  // The aria-label adds the row's language after it, at the call site.
  'action.copyTranslation': {
    plan: {
      ...commandOf('COPY'),
      directObject: { concept: 'TRANSLATION', definiteness: 'definite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Copy the translation',
  },
  // The same act as the help sheet names the key for it, which works on whichever row of the panel the
  // cursor is on: COPY on an indefinite LANGUAGE, one of the seven the user has yet to choose ("copia
  // una lingua", es "copiar un idioma", ja 言語をコピー).
  'action.copyLanguage': {
    plan: {
      ...commandOf('COPY'),
      directObject: { concept: 'LANGUAGE', definiteness: 'indefinite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Copy a language',
  },
  // What the same control says once it has copied: the COPIED participle, agreeing with the TRANSLATION
  // it copied (it "copiata", fr "copiée"). Japanese strips the attributive の (コピー済み).
  'status.copied': {
    word: 'COPIED',
    agreesWith: 'TRANSLATION',
    format: { capitalize: true },
    fallback: 'Copied',
  },

  // The tag on a translation, and the caption on a period, while they show a console line not yet
  // applied: the bare PREVIEW (it "Anteprima", fr "Aperçu", es "Vista previa", ja プレビュー). The CSS
  // uppercases it.
  'status.preview': { plan: nameOf('PREVIEW'), format: NAME_FORMAT, fallback: 'Preview' },

  // What a link satellite says once its noun holds a link. Like COPIED it is a participle agreeing
  // with what it describes — the noun the satellite rides, so it cites itself on NOUN (it
  // "collegato", fr "lié", de "verknüpft"). Japanese strips the attributive の (リンク済み). The
  // control's own "click to remove" is `hint.clickToRemove`, joined after a dash at the call site.
  'status.linked': {
    word: 'LINKED',
    agreesWith: 'NOUN',
    format: { capitalize: true },
    fallback: 'Linked',
  },

  // The header control that opens the word palette: the WORD noun in the plural, bare.
  'words.heading': {
    plan: { subject: { concept: 'WORD', number: 'plural', definiteness: 'bare' } } as PhrasePlan,
    format: { capitalize: true, stripPeriod: true },
    fallback: 'Words',
  },

  // The title of the corpus map dialog: the MAP noun, bare, carrying an attributive WORD
  // (material relation, plural — it maps the words, all of them). The same shape as `app.payoff`:
  // English and German compound it ("word map", "Wörterkarte"), the Romance ones link it with
  // di/de ("mappa di parole", "carte de mots"), Japanese with の (「単語の地図」).
  'wordMap.heading': {
    plan: {
      subject: {
        concept: 'MAP',
        definiteness: 'bare',
        nounModifiers: [{ concept: 'WORD', relation: 'material', number: 'plural' }],
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Word Map',
  },

  // The map's caption — what it is showing, as three counted facts ("185 nodes · 420
  // relationships · 3 unconnected words hidden"). The *number* stays in the component: it is
  // digits, which every language writes the same way, and a plan is rendered once at boot and so
  // cannot inflect to a count known only at render time. What the catalog supplies is the noun the
  // number counts — which is why each comes in both numbers, keyed `<key>.<singular|plural>` so the
  // caption can write t(`wordMap.nodes.${n === 1 ? 'singular' : 'plural'}`). The singular is not
  // hypothetical: filtering the map down to one relation kind can leave a single edge, and a corpus
  // routinely has exactly one unconnected word.
  //
  // Lower-case: they trail a numeral inside a caption, not a heading. (German capitalizes its
  // nouns regardless — "Knoten" — which is the engine's business, not this file's.)
  'wordMap.nodes.singular': {
    plan: nameOf('NODE'),
    format: { stripPeriod: true },
    fallback: 'node',
  },
  'wordMap.nodes.plural': {
    plan: { subject: { concept: 'NODE', number: 'plural', definiteness: 'bare' } } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'nodes',
  },
  'wordMap.relationships.singular': {
    plan: nameOf('RELATIONSHIP'),
    format: { stripPeriod: true },
    fallback: 'relationship',
  },
  'wordMap.relationships.plural': {
    plan: {
      subject: { concept: 'RELATIONSHIP', number: 'plural', definiteness: 'bare' },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'relationships',
  },

  // The map's relation filter: one chip per kind of edge, named by what the edge points at, in the
  // plural. An "is a" edge points at a word's HYPERNYM (it "iperonimi", ja 上位語); a "complements"
  // edge at a verb's complements (COMPLEMENT_GRAMMAR, de "Ergänzungen"). Keyed by RelationKind.
  'wordMap.relation.isA': {
    plan: { subject: { concept: 'HYPERNYM', number: 'plural', definiteness: 'bare' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Hypernyms',
  },
  'wordMap.relation.complements': {
    plan: {
      subject: { concept: 'COMPLEMENT_GRAMMAR', number: 'plural', definiteness: 'bare' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Complements',
  },

  // The third fact says the map is *not* showing something: the words no relation reaches are left
  // out of the drawing. Two adjectives on one noun — words that are unconnected, and that are
  // hidden — because the engine has no passive voice to say "…are hidden" with, and a participle
  // is what every one of these languages reaches for anyway (it "parole non collegate nascoste").
  // English therefore reads "unconnected hidden words" rather than the elliptical "unconnected
  // words hidden" it replaces: same fact, said as a phrase English will actually own.
  'wordMap.hidden.singular': {
    plan: {
      subject: { concept: 'WORD', definiteness: 'bare', adjectives: ['UNCONNECTED', 'HIDDEN'] },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'unconnected hidden word',
  },
  'wordMap.hidden.plural': {
    plan: {
      subject: {
        concept: 'WORD',
        number: 'plural',
        definiteness: 'bare',
        adjectives: ['UNCONNECTED', 'HIDDEN'],
      },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'unconnected hidden words',
  },

  // The map with every relation filter switched off. The English literal was two elliptical
  // fragments — "No relationships to show. Switch one back on above." — and neither is a period:
  // the first hangs a purpose clause off a noun, which only a predicate can carry, and the second
  // is a particle verb pointing at a place on the screen. Said as two clauses instead: what the
  // map is doing (SHOW with a `no` object, which every language weaves into the verb's own
  // negation — it "la mappa non mostra nessuna relazione"), and the command that undoes it. The
  // "above" is gone with the fragment: it is an adverb of place on the screen, and the chips it
  // points at are the only ones there.
  'wordMap.noRelationships': {
    plan: {
      subject: { concept: 'MAP', definiteness: 'definite' },
      verbPhrase: { verb: 'SHOW' },
      directObject: { concept: 'RELATIONSHIP', number: 'plural', definiteness: 'no' },
    } as PhrasePlan,
    format: { capitalize: true },
    fallback: 'The map shows no relationships.',
  },
  // Singular, as the literal's "switch one back on" was: one chip brings one kind of relation
  // back. The plural would make Spanish and Portuguese say "unas relaciones" / "umas relações",
  // which is the indefinite plural article those two spell where English and Italian spell none.
  'wordMap.showRelationships': {
    plan: {
      ...commandOf('SHOW'),
      directObject: { concept: 'RELATIONSHIP', definiteness: 'indefinite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Show a relationship',
  },

  // The subject box's own title: the grammatical SUBJECT noun, bare. The CSS uppercases it.
  'slot.subject': {
    plan: { subject: { concept: 'SUBJECT_GRAMMAR', definiteness: 'bare' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Subject',
  },

  // What the subject box is called once the period is passive: the patient has taken the subject's
  // place, and the box that still holds the agent is captioned for the role it now plays — the one
  // each language's by-phrase names (see `ResolvedPhrase.agent`).
  'slot.agent': {
    plan: { subject: { concept: 'AGENT_GRAMMAR', definiteness: 'bare' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Agent',
  },

  // The subject box's placeholder, as a command to the user: "type a subject" — the TYPE
  // imperative taking an indefinite SUBJECT as its direct object. Lower-case (a placeholder,
  // not a label), and the call site adds the trailing ellipsis.
  'slot.subject.placeholder': {
    plan: {
      ...commandOf('TYPE'),
      directObject: { concept: 'SUBJECT_GRAMMAR', definiteness: 'indefinite' },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'type a subject',
  },

  // The verb box's title, and the sidebar's heading while the verb slot is the one being filled:
  // the bare grammar noun. The same word as `palette.verb` in the singular — a box holds one verb,
  // a palette section lists many.
  'slot.verb': {
    plan: nameOf('VERB'),
    format: NAME_FORMAT,
    fallback: 'Verb',
  },

  // The direct object's box title and sidebar heading. OBJECT_GRAMMAR, not the OBJECT_THING you can
  // hold: the traditions that distinguish them do so in the word itself (ja 目的語, it "complemento
  // oggetto"), which is why this is the grammar noun and reads "Object" in English rather than the
  // "Direct Object" it replaces — the slot is the only object slot there is.
  'slot.directObject': {
    plan: nameOf('OBJECT_GRAMMAR'),
    format: NAME_FORMAT,
    fallback: 'Object',
  },

  // An owner's ring title ("the cat's book" — the cat's ring): the POSSESSOR noun, one who owns.
  'slot.possessor': {
    plan: nameOf('POSSESSOR'),
    format: NAME_FORMAT,
    fallback: 'Possessor',
  },

  // What a genitive possessor is to its noun (P13, `/whole`, `/parts`): the WHOLE the noun is a part of
  // (it "Intero", de "Ganz"), or its PARTs (it "Parti", de "Teile"). The owner is `slot.possessor`.
  'possessorRole.value.whole': { plan: { subject: { concept: 'WHOLE', definiteness: 'bare' } } as PhrasePlan, format: NAME_FORMAT, fallback: 'Whole' },
  'possessorRole.value.parts': {
    plan: { subject: { concept: 'PART', definiteness: 'bare', number: 'plural' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Parts',
  },
  // What the object complement says of the object (P13, `/as`, `/into`), on its toolbar: taken as it —
  // the essive, its USAGE ("uses the period as a condition") — or turned into it, the factitive, its
  // RESULT ("transforms it into a command"). Nouns rather than the words, since the factitive's word is
  // the verb's own (en into, it in, de zu …).
  'predication.value.essive': { plan: nameOf('USAGE'), format: NAME_FORMAT, fallback: 'Usage' },
  'predication.value.factitive': { plan: nameOf('RESULT'), format: NAME_FORMAT, fallback: 'Result' },

  // The standard of comparison's ring title ("bigger than **the dog**" — the dog's ring, P09-E12 D5):
  // the grammar noun STANDARD_OF_COMPARISON, bare like the possessor's. It hangs off a predicate
  // adjective in the comparative or the equative, and is what `/than` fills in the console.
  'slot.standard': {
    plan: nameOf('STANDARD_OF_COMPARISON'),
    format: NAME_FORMAT,
    fallback: 'Standard of comparison',
  },

  // The other side of a coordination: one of the phrases it joins, which `/del and` removes. The
  // bare grammar noun, like the satellite names beside it — es and pt have no word of the linguists'
  // and say "the coordinated member" ("Miembro coordinado", ja 等位項).
  'slot.conjunct': {
    plan: nameOf('CONJUNCT'),
    format: NAME_FORMAT,
    fallback: 'Conjunct',
  },

  // The adverb (modifier) box's title and sidebar heading — the bare grammar noun, like `slot.verb`.
  'slot.adverb': {
    plan: nameOf('ADVERB'),
    format: NAME_FORMAT,
    fallback: 'Adverb',
  },

  // The instrumental complement's box title and satellite label. Each language names the
  // relation as its own grammar tradition does — a one-word name in en/de ("instrumental"), a
  // whole phrase in the Romance ones ("complemento di mezzo", "complément de moyen") — so it is
  // seeded as a single noun concept per language rather than composed from parts.
  'slot.instrumental': {
    plan: nameOf('INSTRUMENTAL'),
    format: NAME_FORMAT,
    fallback: 'Instrumental',
  },

  // The manner adverbial's box title and satellite label — the "complemento di modo". Like the
  // instrumental and subject-complement labels, each language names the relation with a phrase its
  // own grammar tradition uses ("complemento di modo", "complément circonstanciel de manière"), so
  // it is seeded as one noun concept per language rather than composed from parts.
  'slot.manner': {
    plan: nameOf('ADVERBIAL_OF_MANNER'),
    format: NAME_FORMAT,
    fallback: 'Adverbial of manner',
  },

  // The subject complement's box title and satellite label — a bare name-noun like the
  // instrumental, for the same reason: the grammar traditions name the relation in words that do
  // not decompose ("attribut du sujet", "complemento predicativo del soggetto", es just
  // "atributo"), so the concept carries the whole term.
  'slot.predicative': {
    plan: nameOf('SUBJECT_COMPLEMENT'),
    format: NAME_FORMAT,
    fallback: 'Subject Complement',
  },

  // The object complement's name — the subject complement's counterpart on the direct object, named
  // the same way, by the phrase each tradition uses for it ("complemento predicativo dell'oggetto",
  // "attribut du complément d'objet", de the compound Objektsprädikativ). Neither this nor the
  // comitative below titles a box yet: the two are plan-only complements (see COMPLEMENT_TYPES),
  // and what shows them is the word map, which names every complement a verb licenses.
  'slot.objectPredicative': {
    plan: nameOf('OBJECT_COMPLEMENT'),
    format: NAME_FORMAT,
    fallback: 'Object Complement',
  },

  // The comitative's — the companion an act is carried out with. English and German take the case
  // name, as they do for the instrumental; the Romance traditions name the circumstance.
  'slot.comitative': {
    plan: nameOf('COMITATIVE'),
    format: NAME_FORMAT,
    fallback: 'Comitative',
  },

  // The other six complements' box titles and satellite labels, seeded the same way: one noun per
  // language carrying the whole tradition name. Italian splits the place four ways ("complemento di
  // stato in luogo", "di moto a luogo", "di moto da luogo", "di moto per luogo"), where French names
  // the circumstance ("complément circonstanciel de lieu") and German the adverbial ("adverbiale
  // Bestimmung des Ortes"). The recipient is an object in most traditions: fr "complément d'objet
  // second", es "complemento indirecto", de "Dativobjekt", ja 間接目的語. English keeps the names the
  // builder has always shown.
  'slot.terminus': {
    plan: nameOf('TERMINUS'),
    format: NAME_FORMAT,
    fallback: 'Terminus',
  },
  'slot.locative': {
    plan: nameOf('LOCATIVE'),
    format: NAME_FORMAT,
    fallback: 'Locative',
  },
  'slot.direction': {
    plan: nameOf('DIRECTION'),
    format: NAME_FORMAT,
    fallback: 'Direction',
  },
  'slot.source': {
    plan: nameOf('SOURCE'),
    format: NAME_FORMAT,
    fallback: 'Source',
  },
  'slot.route': {
    plan: nameOf('ROUTE'),
    format: NAME_FORMAT,
    fallback: 'Route',
  },
  // CAUSE_COMPLEMENT, the grammar term, not the CAUSE that makes something happen.
  'slot.cause': {
    plan: nameOf('CAUSE_COMPLEMENT'),
    format: NAME_FORMAT,
    fallback: 'Cause',
  },
  // The *when* of a clause (C29). Named with the same tradition words as its siblings — it
  // "complemento di tempo", de "adverbiale Bestimmung der Zeit", pt "adjunto adverbial de tempo".
  // It titles the temporal box (P09-E12b), which every verb offers.
  'slot.temporal': {
    plan: nameOf('TEMPORAL_COMPLEMENT'),
    format: NAME_FORMAT,
    fallback: 'Temporal',
  },
  // The *for* and the *about* (P09-E2), named like their siblings (it "complemento di fine", "di
  // argomento"; pt "adjunto adverbial de finalidade", "de assunto"). Each titles its box (P09-E12b).
  'slot.purpose': {
    plan: nameOf('PURPOSE_COMPLEMENT'),
    format: NAME_FORMAT,
    fallback: 'Purpose',
  },
  'slot.topic': {
    plan: nameOf('TOPIC_COMPLEMENT'),
    format: NAME_FORMAT,
    fallback: 'Topic',
  },
  // The *as* of a role said of the subject (P09-E13), "acts as a friend". Plan-only, like the object
  // complement: no box shows it yet, and the word map names it on the verbs that license it (ACT).
  'slot.role': {
    plan: nameOf('ROLE_COMPLEMENT'),
    format: NAME_FORMAT,
    fallback: 'Role',
  },
  // The party an act is directed *against* (P09-E22), "plays against the dog". Plan-only, like the
  // role: no box shows it yet, and the word map names it on the verbs that license it (PLAY_GAME).
  'slot.opponent': {
    plan: nameOf('OPPONENT_COMPLEMENT'),
    format: NAME_FORMAT,
    fallback: 'Opponent',
  },

  // The verb's ring on the canvas: the verb with its modals, tense, aspect and adverb. The Romance
  // traditions call a phrase in this sense a "sintagma" / "syntagme" (it "sintagma verbale"), and
  // German and Japanese compound it on the verb (de "Verbalphrase", ja 動詞句).
  'slot.verbPhrase': {
    plan: nameOf('VERB_PHRASE'),
    format: NAME_FORMAT,
    fallback: 'Verb Phrase',
  },

  // The modal verb's box title and satellite label, for both modals in the chain: the numeral of
  // "Modal 2" only told two identical English labels apart, as with the adjectives. Every language
  // names these by mood (it "verbo modale", de "Modalverb", ja 法助動詞).
  'slot.modal': {
    plan: nameOf('MODAL'),
    format: NAME_FORMAT,
    fallback: 'Modal',
  },

  // The verb box's placeholder, the same command shape as the subject's: "type a verb" — the
  // TYPE imperative taking an indefinite VERB (the grammar noun) as its direct object.
  'slot.verb.placeholder': {
    plan: {
      ...commandOf('TYPE'),
      directObject: { concept: 'VERB', definiteness: 'indefinite' },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'type a verb',
  },

  // The other word pickers' placeholders, the same command on the grammar noun each one offers:
  // "type an adjective", "type an adverb", "type a noun" (the object's and the plain complements'
  // picker). Indefinite, like the subject's and the verb's — the user has yet to pick one.
  'slot.adjective.placeholder': {
    plan: {
      ...commandOf('TYPE'),
      directObject: { concept: 'ADJECTIVE', definiteness: 'indefinite' },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'type an adjective',
  },
  'slot.adverb.placeholder': {
    plan: {
      ...commandOf('TYPE'),
      directObject: { concept: 'ADVERB', definiteness: 'indefinite' },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'type an adverb',
  },
  'slot.modal.placeholder': {
    plan: {
      ...commandOf('TYPE'),
      directObject: { concept: 'MODAL', definiteness: 'indefinite' },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'type a modal',
  },
  'slot.noun.placeholder': {
    plan: {
      ...commandOf('TYPE'),
      directObject: { concept: 'NOUN', definiteness: 'indefinite' },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'type a noun',
  },
  // The direct object's and the cause complement's pickers take a pronoun as well ("I see you",
  // "because of him"), so this prompt's object is the two grammar nouns coordinated by `or`. Each
  // conjunct keeps its own determiner, which is why English reads "a noun or a pronoun"
  // (it "un sostantivo o un pronome", ja 「名詞か代名詞を入力」).
  'slot.nounOrPronoun.placeholder': {
    plan: {
      ...commandOf('TYPE'),
      directObject: {
        conjunction: 'or',
        conjuncts: [
          { concept: 'NOUN', definiteness: 'indefinite' },
          { concept: 'PRONOUN', definiteness: 'indefinite' },
        ],
      },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'type a noun or a pronoun',
  },

  // What an active, still-empty box without a picker says: the bare CHOOSE command, lower-case like
  // the placeholders, and the call site adds the ellipsis ("choose…", it "scegli…", de "wählen…").
  'slot.choose': {
    plan: commandOf('CHOOSE'),
    format: { stripPeriod: true },
    fallback: 'choose',
  },
  // The period by its name, for a heading or a label: the help sheet's section, and the console's
  // header, which keeps the number outside the phrase (C14). PERIOD_SENTENCE bare, de "Satzgefüge", ja 文.
  'period.name': {
    plan: nameOf('PERIOD_SENTENCE'),
    format: NAME_FORMAT,
    fallback: 'Period',
  },
  // The bare MOVE command, lower-case like `slot.choose`: a key hint says what the arrows do ("move",
  // it "sposta", ja 移動), and the help sheet capitalizes it with CSS (the A12 precedent).
  'action.move': {
    plan: commandOf('MOVE'),
    format: { stripPeriod: true },
    fallback: 'move',
  },
  // ⇥ in a picker takes the word and goes on to the next box: CHOOSE, then GO to the next slot, the two
  // acts in sequence as `hint.chooseWord` joins them (en "choose, and then go to the next slot", it
  // "scegli, e poi va' allo slot successivo", de "wählen, und dann zum nächsten Slot gehen", ja
  // 選び、それから次のスロットへ移動). Lower-case like `slot.choose` beside it in the picker's key strip;
  // the help sheet raises its first letter with CSS.
  'hint.chooseAndNext': {
    plan: {
      ...commandOf('CHOOSE'),
      coordination: {
        conjunction: 'then',
        clause: {
          ...commandOf('GO'),
          complements: {
            direction: {
              phrase: { concept: 'SLOT_COMPUTING', definiteness: 'definite', adjectives: ['NEXT'] },
            },
          },
        },
      },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'choose, and then go to the next slot',
  },
  // The pronoun chooser is a grid, and its key strip names what ↑ ↓ and ← → walk: the ROW (a person)
  // and the VALUE in it (a number, a gender). Bare and lower-case, as the strip reads (it "riga",
  // "valore", de "Zeile", "Wert", ja 行, 値).
  'grid.row': { plan: nameOf('ROW'), format: { stripPeriod: true }, fallback: 'row' },
  'grid.value': { plan: nameOf('VALUE'), format: { stripPeriod: true }, fallback: 'value' },
  // ⇥ in the console's prompt goes to the next word of the line: WORD bare with NEXT, lower-case among
  // the prompt's key hints (it "parola successiva", de "nächstes Wort", ja 次の単語).
  'console.nextWord': {
    plan: { subject: { concept: 'WORD', definiteness: 'bare', adjectives: ['NEXT'] } } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'next word',
  },
  // The same box while it is not the active one: the EMPTY adjective, agreeing with the slot it describes
  // (SLOT_COMPUTING, the box's own noun). Lower-case, like `slot.choose`.
  'slot.empty': { word: 'EMPTY', agreesWith: 'SLOT_COMPUTING', fallback: 'empty' },

  // What a picker's list says when nothing matches what was typed: RESULT under the `no` quantifier. In
  // the plural, as English and German say it ("no results", "keine Ergebnisse"); the Romance languages
  // put the noun back in the singular after their quantifier ("nessun risultato"), and Japanese closes
  // the circumfix on ない (どの結果もない). Lower-case: it sits in the list where the words would.
  'typeahead.noResults': {
    plan: { subject: { concept: 'RESULT', number: 'plural', definiteness: 'no' } } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'no results',
  },

  // The word-category switch on a switchable box (subject/object/cause = noun | pronoun;
  // predicative + adjectives = noun | adjective) and the matching selector inside the open
  // picker. Each is the bare grammar noun; the toggle's CSS uppercases it.
  'category.noun': {
    plan: { subject: { concept: 'NOUN', definiteness: 'bare' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Noun',
  },
  'category.pronoun': {
    plan: { subject: { concept: 'PRONOUN', definiteness: 'bare' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Pronoun',
  },
  'category.adjective': {
    plan: { subject: { concept: 'ADJECTIVE', definiteness: 'bare' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Adjective',
  },

  // The determiner control — the icon satellite on a noun box and the toggle box it reveals.
  // The bare grammar noun, like `category.*`: it names the feature the control sets, not one of
  // its values (the values are the surface words "the" / "a" / "—", which the box shows).
  'satellite.determiner': {
    plan: { subject: { concept: 'DETERMINER', definiteness: 'bare' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Determiner',
  },

  // The number control on a noun box — the icon satellite and the toggle it reveals. The bare
  // grammar noun, like `satellite.determiner`: it names the feature, not either of its values.
  // NUMBER_GRAMMAR, not the NUMBER you count with: German keeps them apart (a noun is in the
  // Numerus singular, never in the Zahl singular) and Japanese reads the same 数 differently.
  'satellite.number': {
    plan: nameOf('NUMBER_GRAMMAR'),
    format: NAME_FORMAT,
    fallback: 'Number',
  },

  // The gender control on a noun or pronoun box — the ring icon that cycles the value in place. The
  // bare grammar noun, like `satellite.number`; `pronoun.gender` is the same noun lower-case, as the
  // pronoun chooser's row caption.
  'satellite.gender': {
    plan: nameOf('GENDER'),
    format: NAME_FORMAT,
    fallback: 'Gender',
  },

  // The verb's feature controls, each named by the bare grammar noun, like `satellite.number`: the
  // polarity toggle, and the tense and aspect satellites with the value boxes they reveal. TENSE is
  // grammatical time, not the TIME a clock tells, though Italian, Spanish and Portuguese use one word
  // for both ("tempo"); German says "Tempus", Japanese 時制. Japanese borrows アスペクト for the aspect.
  'satellite.polarity': {
    plan: nameOf('POLARITY'),
    format: NAME_FORMAT,
    fallback: 'Polarity',
  },
  'satellite.tense': {
    plan: nameOf('TENSE'),
    format: NAME_FORMAT,
    fallback: 'Tense',
  },
  'satellite.aspect': {
    plan: nameOf('ASPECT'),
    format: NAME_FORMAT,
    fallback: 'Aspect',
  },
  'satellite.voice': {
    plan: nameOf('VOICE'),
    format: NAME_FORMAT,
    fallback: 'Voice',
  },

  // The link control on a noun that makes a period in another container its relative clause. One
  // noun per tradition, like the complement names: German and Japanese compound it (Relativsatz,
  // 関係節), which CLAUSE and an adjective would not give.
  'satellite.relative': {
    plan: nameOf('RELATIVE_CLAUSE'),
    format: NAME_FORMAT,
    fallback: 'Relative clause',
  },
  // The chip beside it that says the clause alone, its head unspoken (P13): an adjective's definition
  // is its relative clause alone, OKAY "that has no problems". "Only the relative clause", it "Solo la
  // proposizione relativa", de "Nur der Relativsatz".
  'relative.headless': {
    plan: { subject: { concept: 'RELATIVE_CLAUSE', definiteness: 'definite', focus: 'only' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Only the relative clause',
  },
  // The determiner menu's field for a cardinal numeral (P13): the NUMBER counting the noun, de "Zahl",
  // not its grammatical number (satellite.number, NUMBER_GRAMMAR).
  'determiner.numeral': { plan: nameOf('NUMBER'), format: NAME_FORMAT, fallback: 'Number' },
  // The chip on a verbless period's subject that says how it reads when it defines an adjective or an
  // adverb (P13, `/gloss`): its MEANING, it "Significato", de "Bedeutung", ja 意味. Each reading is named
  // by what the phrase reads as, with the catalogue's own names (category.*, slot.*).
  'gloss.name': { plan: nameOf('MEANING'), format: NAME_FORMAT, fallback: 'Meaning' },

  // The control on a noun that coordinates another phrase with it ("the cat and the dog").
  'satellite.coordination': {
    plan: nameOf('COORDINATION'),
    format: NAME_FORMAT,
    fallback: 'Coordination',
  },
  // What ⇧C cycles once a noun has a conjunct: the conjunction joining the two, by the bare grammar noun
  // like the satellite beside it ("congiunzione", de "Konjunktion", ja 接続詞).
  'satellite.conjunction': {
    plan: nameOf('CONJUNCTION'),
    format: NAME_FORMAT,
    fallback: 'Conjunction',
  },

  // The values of the tense satellite, keyed `tense.value.<Tense>` so a call site can write
  // t(`tense.value.${tense}`). Nouns, like `number.value.*`: the value box shows one standing alone,
  // and German names the tenses with nouns no adjective gives (Präsens, Präteritum, Futur). The past
  // is the Präteritum because that is the past the engine renders ("der Kater aß").
  'tense.value.present': {
    plan: nameOf('PRESENT_TENSE'),
    format: NAME_FORMAT,
    fallback: 'Present',
  },
  'tense.value.past': {
    plan: nameOf('PAST_TENSE'),
    format: NAME_FORMAT,
    fallback: 'Past',
  },
  'tense.value.future': {
    plan: nameOf('FUTURE_TENSE'),
    format: NAME_FORMAT,
    fallback: 'Future',
  },

  // The values of the aspect satellite, keyed `aspect.value.<Aspect>`. Adjectives agreeing with
  // ASPECT, like `gender.value.*` with GENDER: every language has one, and names the aspect with it
  // ("aspetto progressivo", "progressiver Aspekt"). Japanese strips the attributive の (進行).
  'aspect.value.neutral': {
    word: 'NEUTRAL',
    agreesWith: 'ASPECT',
    format: { capitalize: true },
    fallback: 'Neutral',
  },
  'aspect.value.progressive': {
    word: 'PROGRESSIVE',
    agreesWith: 'ASPECT',
    format: { capitalize: true },
    fallback: 'Progressive',
  },
  'aspect.value.prospective': {
    word: 'PROSPECTIVE',
    agreesWith: 'ASPECT',
    format: { capitalize: true },
    fallback: 'Prospective',
  },
  'aspect.value.resultative': {
    word: 'RESULTATIVE',
    agreesWith: 'ASPECT',
    format: { capitalize: true },
    fallback: 'Resultative',
  },

  // The two values of the voice satellite, keyed `voice.value.<Voice>`. Adjectives agreeing with
  // VOICE, as the aspect's values agree with ASPECT — and VOICE is feminine wherever it has a
  // gender, so they read "attiva / passiva", "active / passive", "activa / pasiva". German and
  // Japanese show what their own grammars call the two (Aktiv / Passiv, 能動 / 受動), the second
  // because Japanese strips the attributive の.
  'voice.value.active': {
    word: 'ACTIVE_VOICE',
    agreesWith: 'VOICE',
    format: { capitalize: true },
    fallback: 'Active',
  },
  'voice.value.passive': {
    word: 'PASSIVE',
    agreesWith: 'VOICE',
    format: { capitalize: true },
    fallback: 'Passive',
  },

  // The two values of the polarity toggle, agreeing with POLARITY, which is feminine in the Romance
  // languages: it "positiva / negativa", fr "positive / négative". Keyed `polarity.value.<value>`.
  'polarity.value.positive': {
    word: 'POSITIVE',
    agreesWith: 'POLARITY',
    format: { capitalize: true },
    fallback: 'Positive',
  },
  'polarity.value.negative': {
    word: 'NEGATIVE',
    agreesWith: 'POLARITY',
    format: { capitalize: true },
    fallback: 'Negative',
  },

  // The controls under an attributive noun ("*sail* boat"). The relation chip's caption is the
  // RELATIONSHIP noun, the word the map's edges already use (it "relazione", de "Beziehung"). The chip
  // itself shows the relation by its first noun, lower-case because its CSS uppercases it; keyed
  // `modifier.relation.<ModifierRelation>`.
  'modifier.relation': {
    plan: nameOf('RELATIONSHIP'),
    format: NAME_FORMAT,
    fallback: 'Relationship',
  },
  'modifier.relation.feature': {
    plan: nameOf('FEATURE'),
    format: { stripPeriod: true },
    fallback: 'feature',
  },
  'modifier.relation.purpose': {
    plan: nameOf('PURPOSE'),
    format: { stripPeriod: true },
    fallback: 'purpose',
  },
  'modifier.relation.material': {
    plan: nameOf('MATERIAL'),
    format: { stripPeriod: true },
    fallback: 'material',
  },
  'modifier.relation.domain': {
    plan: nameOf('DOMAIN'),
    format: { stripPeriod: true },
    fallback: 'domain',
  },
  // The chip's tooltip spells the relation out with the two nouns that say what the modifier is to its
  // head, coordinated by `or`: a sail is the boat's feature or means, the sun the glasses' purpose or
  // use, gold the ring's material or content, the fruit the fly's domain or place. Keyed `modifier.relation.<ModifierRelation>.gloss`.
  'modifier.relation.feature.gloss': {
    plan: {
      subject: {
        conjunction: 'or',
        conjuncts: [
          { concept: 'FEATURE', definiteness: 'bare' },
          { concept: 'MEANS', definiteness: 'bare' },
        ],
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Feature or means',
  },
  'modifier.relation.purpose.gloss': {
    plan: {
      subject: {
        conjunction: 'or',
        conjuncts: [
          { concept: 'PURPOSE', definiteness: 'bare' },
          { concept: 'USE_NOUN', definiteness: 'bare' },
        ],
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Purpose or use',
  },
  'modifier.relation.material.gloss': {
    plan: {
      subject: {
        conjunction: 'or',
        conjuncts: [
          { concept: 'MATERIAL', definiteness: 'bare' },
          { concept: 'CONTENT', definiteness: 'bare' },
        ],
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Material or content',
  },
  'modifier.relation.domain.gloss': {
    plan: {
      subject: {
        conjunction: 'or',
        conjuncts: [
          { concept: 'DOMAIN', definiteness: 'bare' },
          { concept: 'PLACE', definiteness: 'bare' },
        ],
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Domain or place',
  },

  // The degree chip's caption on an adjective. DEGREE_GRAMMAR, the degree of comparison, not a unit
  // of heat: German names it by the step of the comparison ("Steigerungsstufe"). The values it shows
  // (More / Most / …) are function words, which the catalog has no entry kind for yet.
  'modifier.degree': {
    plan: nameOf('DEGREE_GRAMMAR'),
    format: NAME_FORMAT,
    fallback: 'Degree',
  },

  // The caption of the chip holding a modifier's own adjective ("*semantic* phrase creator"): the
  // ADJECTIVE owned by the modifier, bare like the other captions (en "the modifier's adjective",
  // it "aggettivo del modificatore", ja 修飾語の形容詞). The call site adds the adjective after it.
  'modifier.adjective': {
    plan: {
      subject: {
        concept: 'ADJECTIVE',
        definiteness: 'bare',
        possessor: { concept: 'MODIFIER', definiteness: 'definite' },
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: "The modifier's adjective",
  },

  // The same chip while it is empty: ADD an adjective, restricted by the relative clause saying what it
  // is for — one that DESCRIBES this modifier, the one under the cursor.
  'modifier.addAdjective': {
    plan: {
      ...commandOf('ADD'),
      directObject: {
        concept: 'ADJECTIVE',
        definiteness: 'indefinite',
        relative: {
          verbPhrase: { verb: 'DESCRIBE' },
          directObject: { concept: 'MODIFIER', definiteness: 'this' },
        },
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Add an adjective that describes this modifier',
  },

  // The two values that control shows, keyed `number.value.<Number>` so a call site can write
  // t(`number.value.${value}`) for either. Nouns, where the pronoun chooser's `pronoun.singular`
  // is an adjective: there the value sits in a row captioned by the noun it agrees with, here the
  // toggle shows it standing alone, and a language that has a word for the singular *as a thing*
  // (de "der Singular", ja 単数) uses that word rather than the adjective it would attach to a noun.
  'number.value.singular': {
    plan: nameOf('SINGULAR_GRAMMAR'),
    format: NAME_FORMAT,
    fallback: 'Singular',
  },
  'number.value.plural': {
    plan: nameOf('PLURAL_GRAMMAR'),
    format: NAME_FORMAT,
    fallback: 'Plural',
  },

  // The three values the gender control cycles through, shown after its name in the tooltip
  // ("Gender: Female"). Keyed `gender.value.<Gender>` so a call site can write
  // t(`gender.value.${value}`). The same words the pronoun chooser's `pronoun.male` / `.female` /
  // `.neuter` offer for the same values — an adjective agreeing with GENDER (it "maschile",
  // de "männlich") — capitalized, because here the value stands at the head of its half of the label.
  'gender.value.masc': {
    word: 'MALE',
    agreesWith: 'GENDER',
    format: { capitalize: true },
    fallback: 'Male',
  },
  'gender.value.fem': {
    word: 'FEMALE',
    agreesWith: 'GENDER',
    format: { capitalize: true },
    fallback: 'Female',
  },
  'gender.value.neut': {
    word: 'NEUTER',
    agreesWith: 'GENDER',
    format: { capitalize: true },
    fallback: 'Neuter',
  },

  // The sections of the determiner menu, keyed `determiner.category.<DeterminerCategory>` so the
  // menu can write t(`determiner.category.${category}`) for any of the three. Each is the bare
  // grammar noun for the *realization* the user knows — article / demonstrative / quantifier —
  // where the model's key names the meaning realized (identifiability / deixis / quantity):
  // an article is how English and the Romance languages happen to spell identifiability, and
  // Japanese, which spells it not at all, still renders 冠詞 as the name of the section.
  'determiner.category.identifiability': {
    plan: nameOf('ARTICLE'),
    format: NAME_FORMAT,
    fallback: 'Article',
  },
  'determiner.category.deixis': {
    plan: nameOf('DEMONSTRATIVE'),
    format: NAME_FORMAT,
    fallback: 'Demonstrative',
  },
  'determiner.category.quantity': {
    plan: nameOf('QUANTIFIER'),
    format: NAME_FORMAT,
    fallback: 'Quantifier',
  },

  // What the seventeen values *mean*, as each grammar tradition names them — the determiner menu's
  // labels. A bare adjective, like the `pronoun.*` values: an article that is definite, a
  // demonstrative that is proximal, a quantifier that is universal. `agreesWith` names the noun
  // of the section the value sits under, which is what makes the Italian read "determinativo"
  // under the articles and "universale" under the quantifiers (both masculine, but the
  // agreement is a fact about each language's lexicon, not about this file).
  //
  // These say what the slot does; `determiner.value.*` below says what it spells. The menu
  // shows both, because a user who has not met "paucal" learns it from the "few" beside it.
  // Keyed `determiner.name.<Definiteness>`, parallel to the values, so the menu can write
  // t(`determiner.name.${value}`) for any of the seventeen.
  'determiner.name.definite': {
    word: 'DEFINITE',
    agreesWith: 'ARTICLE',
    format: { capitalize: true },
    fallback: 'Definite',
  },
  'determiner.name.indefinite': {
    word: 'INDEFINITE',
    agreesWith: 'ARTICLE',
    format: { capitalize: true },
    fallback: 'Indefinite',
  },
  'determiner.name.bare': {
    word: 'ZERO',
    agreesWith: 'ARTICLE',
    format: { capitalize: true },
    fallback: 'Zero',
  },
  'determiner.name.this': {
    word: 'PROXIMAL',
    agreesWith: 'DEMONSTRATIVE',
    format: { capitalize: true },
    fallback: 'Proximal',
  },
  'determiner.name.that': {
    word: 'DISTAL',
    agreesWith: 'DEMONSTRATIVE',
    format: { capitalize: true },
    fallback: 'Distal',
  },
  'determiner.name.some': {
    word: 'PARTITIVE',
    agreesWith: 'QUANTIFIER',
    format: { capitalize: true },
    fallback: 'Partitive',
  },
  'determiner.name.no': {
    word: 'NEGATIVE',
    agreesWith: 'QUANTIFIER',
    format: { capitalize: true },
    fallback: 'Negative',
  },
  'determiner.name.many': {
    word: 'MULTAL',
    agreesWith: 'QUANTIFIER',
    format: { capitalize: true },
    fallback: 'Multal',
  },
  'determiner.name.few': {
    word: 'PAUCAL',
    agreesWith: 'QUANTIFIER',
    format: { capitalize: true },
    fallback: 'Paucal',
  },
  'determiner.name.all': {
    word: 'UNIVERSAL',
    agreesWith: 'QUANTIFIER',
    format: { capitalize: true },
    fallback: 'Universal',
  },
  // P09-E25's seven, under the quantifiers.
  'determiner.name.each': {
    word: 'DISTRIBUTIVE',
    agreesWith: 'QUANTIFIER',
    format: { capitalize: true },
    fallback: 'Distributive',
  },
  'determiner.name.every': {
    word: 'EXHAUSTIVE',
    agreesWith: 'QUANTIFIER',
    format: { capitalize: true },
    fallback: 'Exhaustive',
  },
  'determiner.name.both': {
    word: 'DUAL',
    agreesWith: 'QUANTIFIER',
    format: { capitalize: true },
    fallback: 'Dual',
  },
  'determiner.name.most': {
    word: 'PROPORTIONAL',
    agreesWith: 'QUANTIFIER',
    format: { capitalize: true },
    fallback: 'Proportional',
  },
  'determiner.name.several': {
    word: 'MULTIPLE',
    agreesWith: 'QUANTIFIER',
    format: { capitalize: true },
    fallback: 'Multiple',
  },
  'determiner.name.enough': {
    word: 'SUFFICIENT',
    agreesWith: 'QUANTIFIER',
    format: { capitalize: true },
    fallback: 'Sufficient',
  },
  'determiner.name.such': {
    word: 'SIMILATIVE',
    agreesWith: 'QUANTIFIER',
    format: { capitalize: true },
    fallback: 'Similative',
  },

  // The words those values spell — the hint beside each menu label, and the word the determiner
  // box on the canvas shows. Each names itself with the word that realizes it in the language
  // ("the" / "il" / "der" / "この"), cited on the grammar noun NOUN, whose gender and initial
  // sound settle the form (see UiStringDeterminerDef). Keyed `determiner.value.<Definiteness>`
  // so a call site can write t(`determiner.value.${value}`) for any of the seventeen.
  //
  // Lower-case and unformatted: these are words shown as words, not headings — the same choice
  // the `pronoun.*` value labels make. `bare` is the determiner that is *no word at all*, so
  // every language renders it as the em-dash the engines return nothing for; Japanese, which
  // spells no article either, shows the em-dash for the two articles as well.
  'determiner.value.definite': { determiner: 'definite', fallback: 'the' },
  'determiner.value.indefinite': { determiner: 'indefinite', fallback: 'a / an' },
  'determiner.value.bare': { determiner: 'bare', fallback: '—' },
  'determiner.value.this': { determiner: 'this', fallback: 'this' },
  'determiner.value.that': { determiner: 'that', fallback: 'that' },
  'determiner.value.some': { determiner: 'some', fallback: 'some' },
  'determiner.value.no': { determiner: 'no', fallback: 'no' },
  'determiner.value.many': { determiner: 'many', fallback: 'many' },
  'determiner.value.few': { determiner: 'few', fallback: 'few' },
  'determiner.value.all': { determiner: 'all', fallback: 'all' },
  'determiner.value.each': { determiner: 'each', fallback: 'each' },
  'determiner.value.every': { determiner: 'every', fallback: 'every' },
  'determiner.value.both': { determiner: 'both', fallback: 'both' },
  'determiner.value.most': { determiner: 'most', fallback: 'most' },
  'determiner.value.several': { determiner: 'several', fallback: 'several' },
  'determiner.value.enough': { determiner: 'enough', fallback: 'enough' },
  'determiner.value.such': { determiner: 'such', fallback: 'such a' },

  // The headings of the word palette's sections, one per grammatical role — the same grammar
  // nouns as `category.*` but in the plural, because a section lists many words. Keyed
  // `palette.<role>` so ConceptPalette can write t(`palette.${role}`) for any GrammaticalRole.
  // The CSS uppercases them.
  'palette.pronoun': {
    plan: { subject: { concept: 'PRONOUN', number: 'plural', definiteness: 'bare' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Pronouns',
  },
  'palette.noun': {
    plan: { subject: { concept: 'NOUN', number: 'plural', definiteness: 'bare' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Nouns',
  },
  'palette.verb': {
    plan: { subject: { concept: 'VERB', number: 'plural', definiteness: 'bare' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Verbs',
  },
  'palette.adjective': {
    plan: { subject: { concept: 'ADJECTIVE', number: 'plural', definiteness: 'bare' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Adjectives',
  },
  'palette.adverb': {
    plan: { subject: { concept: 'ADVERB', number: 'plural', definiteness: 'bare' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Adverbs',
  },

  // The pronoun chooser's three rows — the grammatical features a pronoun is picked by, each
  // the bare grammar noun ("person", "number", "gender"). Lower-case: they caption a row, and
  // outside English the engine renders a noun lower-case anyway.
  'pronoun.person': {
    plan: nameOf('PERSON_GRAMMAR'),
    format: { stripPeriod: true },
    fallback: 'person',
  },
  'pronoun.number': {
    plan: nameOf('NUMBER_GRAMMAR'),
    format: { stripPeriod: true },
    fallback: 'number',
  },
  'pronoun.gender': {
    plan: nameOf('GENDER'),
    format: { stripPeriod: true },
    fallback: 'gender',
  },

  // The three pronoun concepts as the pickers name them. A pronoun is the only concept whose
  // list entry is not a word: its surface form is settled only once number and gender are
  // fixed, so it shows the person it stands for instead — the bare PERSON_GRAMMAR noun carrying
  // the ordinal adjective ("first person", "prima persona", 一人称). Keyed by concept id, so
  // conceptWord() can write t(`pronoun.person.${concept.person}`) for any of the three.
  'pronoun.person.1': {
    plan: {
      subject: { concept: 'PERSON_GRAMMAR', definiteness: 'bare', adjectives: ['FIRST'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'First person',
  },
  'pronoun.person.2': {
    plan: {
      subject: { concept: 'PERSON_GRAMMAR', definiteness: 'bare', adjectives: ['SECOND'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Second person',
  },
  'pronoun.person.3': {
    plan: {
      subject: { concept: 'PERSON_GRAMMAR', definiteness: 'bare', adjectives: ['THIRD'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Third person',
  },
  // The generic subject (GENERIC_PERSON) as the chip/picker names it. It stands for no ordinal
  // person, so it is named by the IMPERSONAL adjective on its own — not "third person", which is
  // the deictic he/she/it — capitalized like the others (it "Impersonale", ja 非人称の).
  'pronoun.person.impersonal': {
    word: 'IMPERSONAL',
    agreesWith: 'PERSON_GRAMMAR',
    format: { capitalize: true },
    fallback: 'Impersonal',
  },

  // The values those rows offer. Each is a bare adjective — a word, not a period: a sentence
  // shows an adjective only in agreement with a noun, and here the noun is not in the label but
  // in the caption of the row the value belongs to. `agreesWith` names it, which is what makes
  // the Italian person row read "prima / seconda / terza" (persona is feminine) while the
  // gender row reads "maschile / femminile / neutro" (genere is masculine).
  'pronoun.first': { word: 'FIRST', agreesWith: 'PERSON_GRAMMAR', fallback: 'first' },
  'pronoun.second': { word: 'SECOND', agreesWith: 'PERSON_GRAMMAR', fallback: 'second' },
  'pronoun.third': { word: 'THIRD', agreesWith: 'PERSON_GRAMMAR', fallback: 'third' },
  // The generic / impersonal subject, offered in the person row alongside the three persons. It
  // is not an ordinal category but a category of its own, so the row value describes it rather
  // than showing its surface word ("one"/"si"): the IMPERSONAL adjective agreeing with "person",
  // like the ordinals beside it (it "impersonale", de "unpersönliche", ja 非人称の).
  'pronoun.generic': { word: 'IMPERSONAL', agreesWith: 'PERSON_GRAMMAR', fallback: 'impersonal' },
  'pronoun.singular': { word: 'SINGULAR', agreesWith: 'NUMBER_GRAMMAR', fallback: 'singular' },
  'pronoun.plural': { word: 'PLURAL', agreesWith: 'NUMBER_GRAMMAR', fallback: 'plural' },
  'pronoun.male': { word: 'MALE', agreesWith: 'GENDER', fallback: 'male' },
  'pronoun.female': { word: 'FEMALE', agreesWith: 'GENDER', fallback: 'female' },
  'pronoun.neuter': { word: 'NEUTER', agreesWith: 'GENDER', fallback: 'neuter' },

  // The chip on a coreference link, naming the possessive pronoun that link will spell — what the
  // user sees on the dashed line from a noun to the noun that owns it ("his dog", "il suo cane").
  // Not a word of the lexicon and not a period: a possessive is a function word each engine
  // *builds*, so it is cited on the grammar noun NOUN the way the determiner values are (see
  // UiStringPossessiveDef). Keyed `pronoun.possessive.<person><number>`, with the third singular
  // split by the antecedent's natural gender — the only cell any of the seven spells differently
  // for it (en his/her/its, de sein/ihr, ja 彼の/彼女の/その — the last suppletive, A201) — so a call site can write
  // t(`pronoun.possessive.${key}`) for the features it resolved.
  //
  // Lower-case and unformatted: a word shown as a word, like the `determiner.value.*` hints. The
  // Romance forms agree with the cited noun rather than with the noun actually possessed, which is
  // a different word in each language: the chip names the possessive, it does not preview the
  // phrase (it "suo", where "la sua casa" would read "sua").
  'pronoun.possessive.1sg': {
    possessive: { kind: 'pronominal', person: '1', number: 'singular' },
    fallback: 'my',
  },
  'pronoun.possessive.2sg': {
    possessive: { kind: 'pronominal', person: '2', number: 'singular' },
    fallback: 'your',
  },
  'pronoun.possessive.3sg.masc': {
    possessive: { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' },
    fallback: 'his',
  },
  'pronoun.possessive.3sg.fem': {
    possessive: { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' },
    fallback: 'her',
  },
  'pronoun.possessive.3sg.neut': {
    possessive: { kind: 'pronominal', person: '3', number: 'singular', gender: 'neut' },
    fallback: 'its',
  },
  'pronoun.possessive.1pl': {
    possessive: { kind: 'pronominal', person: '1', number: 'plural' },
    fallback: 'our',
  },
  'pronoun.possessive.2pl': {
    possessive: { kind: 'pronominal', person: '2', number: 'plural' },
    fallback: 'your',
  },
  'pronoun.possessive.3pl': {
    possessive: { kind: 'pronominal', person: '3', number: 'plural' },
    fallback: 'their',
  },

  // The chooser's commit button: "select (it)".
  'action.select': { plan: commandOf('SELECT'), format: NAME_FORMAT, fallback: 'Select' },

  // The chip under a noun modifier's own adjective that removes it: the bare CLEAR command,
  // lower-case like the chips beside it ("clear", it "cancella", de "löschen").
  'action.clear': { plan: commandOf('CLEAR'), format: { stripPeriod: true }, fallback: 'clear' },

  // The two keys on a box's word, as the hint line and the help sheet name them: each a command on the
  // definite WORD, the one already in the box. ↵ puts another word in its place, so REPLACE ("sostituisci
  // la parola", de "das Wort ersetzen"), not CHANGE, whose German *ändern* alters the word itself. ⌫ is
  // CLEAR, naming what it clears where the bare `action.clear` would read oddly among named parts
  // ("cancella la parola", ja 単語を消去).
  'action.replaceWord': {
    plan: {
      ...commandOf('REPLACE'),
      directObject: { concept: 'WORD', definiteness: 'definite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Replace the word',
  },
  'action.clearWord': {
    plan: {
      ...commandOf('CLEAR'),
      directObject: { concept: 'WORD', definiteness: 'definite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Clear the word',
  },

  // The two saved-phrase buttons, as commands: "save (it)" / "load (it)".
  'action.save': { plan: commandOf('SAVE'), format: NAME_FORMAT, fallback: 'Save' },
  'action.load': { plan: commandOf('LOAD'), format: NAME_FORMAT, fallback: 'Load' },

  // The header Save button's tooltip, spelling out what its bare "Save" label acts on — the
  // whole phrase, as against the per-container `action.savePeriod`. The WHOLE adjective (not
  // an "all the periods" quantifier) carries that contrast, because Japanese renders no
  // determiner at all and would drop an `all` on the floor.
  'action.save.tooltip': {
    plan: {
      ...commandOf('SAVE'),
      directObject: { concept: 'PHRASE', definiteness: 'definite', adjectives: ['WHOLE'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Save the whole phrase',
  },

  // The header Load button's tooltip: the LOAD imperative on an indefinite PHRASE carrying the
  // SAVED adjective — "load a saved phrase", one of the many already stored. Indefinite where
  // `action.save.tooltip` is definite: that one acts on the phrase in the workspace, this one
  // brings in a phrase the user has yet to pick.
  'action.load.tooltip': {
    plan: {
      ...commandOf('LOAD'),
      directObject: { concept: 'PHRASE', definiteness: 'indefinite', adjectives: ['SAVED'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Load a saved phrase',
  },

  // The delete button on each row of the load dialogs: DELETE, not REMOVE, because it erases the stored
  // phrase or period for good and the languages have a verb of their own for that (it "elimina", de
  // "löschen", fr "supprimer"). `this` plus SAVED, like `action.load.tooltip`: the one on this row.
  // The label can't carry the row's name, because a plan takes no arguments. The button points
  // `aria-describedby` at the name instead, so a screen reader still says which row it deletes.
  'action.deleteSavedPhrase': {
    plan: {
      ...commandOf('DELETE'),
      directObject: { concept: 'PHRASE', definiteness: 'this', adjectives: ['SAVED'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Delete this saved phrase',
  },
  'action.deleteSavedPeriod': {
    plan: {
      ...commandOf('DELETE'),
      directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'this', adjectives: ['SAVED'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Delete this saved period',
  },

  // The two file-transfer icon buttons, which have no label of their own — the tooltip is the
  // whole affordance. Export is definite (it acts on the phrase already in the workspace, like
  // `action.save.tooltip`); import is indefinite (it brings in a phrase from a file the user
  // has yet to pick, like `action.load.tooltip`). Neither names the JSON file: the format is an
  // implementation detail the lexicon has no concept for, and the icons already say "to disk".
  'action.export.tooltip': {
    plan: {
      ...commandOf('EXPORT'),
      directObject: { concept: 'PHRASE', definiteness: 'definite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Export phrase',
  },
  'action.import.tooltip': {
    plan: {
      ...commandOf('IMPORT'),
      directObject: { concept: 'PHRASE', definiteness: 'indefinite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Import phrase',
  },

  // The workspace's two period-level buttons, as commands. "Add a period container" is the
  // ADD imperative on an indefinite CONTAINER carrying an attributive PERIOD_SENTENCE
  // (material relation, so Romance links it with di/de: "un contenitore di periodo").
  'action.addPeriodContainer': {
    plan: {
      ...commandOf('ADD'),
      directObject: {
        concept: 'CONTAINER',
        definiteness: 'indefinite',
        nounModifiers: [{ concept: 'PERIOD_SENTENCE', relation: 'material' }],
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Add period container',
  },
  'action.loadPeriod': {
    plan: {
      ...commandOf('LOAD'),
      directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'indefinite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Load period',
  },

  // The title of the dialog that button opens, which lists the stored periods: "add a saved period".
  // ADD, not LOAD — the chosen period joins the workspace as a new container beside the others — on
  // an indefinite PERIOD_SENTENCE carrying SAVED, the same shape as `action.load.tooltip`.
  'action.addSavedPeriod': {
    plan: {
      ...commandOf('ADD'),
      directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'indefinite', adjectives: ['SAVED'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Add a saved period',
  },

  // The success toasts of saving and loading. The engine has no passive voice to say "the phrase was
  // saved" with, so each is said the way a status line says it anyway: the noun under its participle
  // adjective — en "Saved phrase", it "Frase salvata", de "Gespeicherte Phrase", ja 「保存済みのフレーズ」.
  // Bare: the toast names what happened to the phrase just acted on, not one of several.
  // (`wordMap.hidden.*` takes the same way round the missing passive.)
  'toast.phraseSaved': {
    plan: { subject: { concept: 'PHRASE', definiteness: 'bare', adjectives: ['SAVED'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Saved phrase',
  },
  'toast.phraseLoaded': {
    plan: { subject: { concept: 'PHRASE', definiteness: 'bare', adjectives: ['LOADED'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Loaded phrase',
  },
  'toast.periodSaved': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', definiteness: 'bare', adjectives: ['SAVED'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Saved period',
  },
  // Adding a saved period to the workspace, said the same way: "Added period", it "Periodo aggiunto",
  // de "Hinzugefügtes Satzgefüge".
  'toast.periodAdded': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', definiteness: 'bare', adjectives: ['ADDED'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Added period',
  },
  // And taking one off the canvas, the toast that offers it back: "Removed period", it "Periodo rimosso",
  // de "Entferntes Satzgefüge", ja 「削除済みの文」 (REMOVED's Japanese is what a UI writes, see its seed).
  'toast.periodRemoved': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', definiteness: 'bare', adjectives: ['REMOVED'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Removed period',
  },
  // The way back, on the toasts, the keys and the console: the bare UNDO and REDO commands, the Edit
  // menu's own pair — it "Annulla" / "Ripeti", de "Rückgängig machen" / "Wiederholen", es "Deshacer" /
  // "Rehacer", ja 「元に戻す」 / 「やり直し」. Italian and French Undo is their Cancel too ("Annulla",
  // "Annuler"), and German Redo their Retry ("Wiederholen"), as their software writes them.
  'action.undo': { plan: commandOf('UNDO'), format: NAME_FORMAT, fallback: 'Undo' },
  'action.redo': { plan: commandOf('REDO'), format: NAME_FORMAT, fallback: 'Redo' },

  // The import toast when the file could not be read. The import is the act, IMPORT_NOUN under FAILED:
  // "Failed import", it "Importazione fallita", ja 「失敗した取り込み」. What was wrong with the file is a
  // statement of its own, BE negated on the VALID predicate adjective ("this file is not valid", de
  // "diese Datei ist nicht gültig"), joined after it with a dash at the call site, so lower-case. One
  // statement stands for every reason a file is refused (not JSON, not a Signi file, no version, no
  // workspace): those stay on the thrown Error, for the console and the tests.
  'toast.importFailed': {
    plan: {
      subject: { concept: 'IMPORT_NOUN', definiteness: 'bare', adjectives: ['FAILED'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Failed import',
  },
  'toast.invalidFile': {
    plan: {
      subject: { concept: 'FILE', definiteness: 'this' },
      verbPhrase: { verb: 'BE', negative: true },
      complements: { predicative: { phrase: { concept: 'VALID' } } },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'this file is not valid',
  },

  // A load that went through but dropped words the catalog no longer has. The toast says what was
  // loaded (`toast.phraseLoaded`, `toast.periodAdded`), then, after a dash, these words and the list of
  // their ids: "Loaded phrase — missing words: UNICORN, GRIFFIN", it "parole mancanti", de "fehlende
  // Wörter", ja 「見つからない単語」. The list is known only at load time and a plan renders once, at
  // boot, so the list stays in the component and the catalog names what it lists (as with
  // `wordMap.nodes.*`). The list's length is the count, so the number is not written again. One key
  // per number, because the noun and its adjective agree with it: "parola mancante" is one word.
  // Lower-case, as they follow the dash.
  'toast.missingWords.singular': {
    plan: { subject: { concept: 'WORD', definiteness: 'bare', adjectives: ['MISSING'] } } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'missing word',
  },
  'toast.missingWords.plural': {
    plan: {
      subject: { concept: 'WORD', number: 'plural', definiteness: 'bare', adjectives: ['MISSING'] },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'missing words',
  },

  // ── "Could not …": the failure messages ─────────────────────────────────────
  // All eight are `couldNotBe` (see above) over the thing the act failed on. They are whole
  // sentences with their full stop kept: each stands alone in a toast or an alert.

  // Saving and loading a whole phrase. The loaded one is `that` — the user picked it out of a list,
  // and it is not the one in the workspace: en "that phrase", it "quella frase", de "jene Phrase".
  'failure.phraseNotSaved': {
    plan: couldNotBe('SAVE', { concept: 'PHRASE', definiteness: 'definite' }),
    format: { capitalize: true },
    fallback: 'The phrase could not be saved.',
  },
  'failure.phraseNotLoaded': {
    plan: couldNotBe('LOAD', { concept: 'PHRASE', definiteness: 'that' }),
    format: { capitalize: true },
    fallback: 'That phrase could not be loaded.',
  },
  // The list the dialog failed to fetch — definite, because it is *the* stored ones, all of them.
  // Bare would be ungrammatical where it matters: French spells no zero-article plural subject
  // (*"phrases enregistrées ne pouvaient pas…").
  'failure.savedPhrasesNotLoaded': {
    plan: couldNotBe('LOAD', {
      concept: 'PHRASE', number: 'plural', definiteness: 'definite', adjectives: ['SAVED'],
    }),
    format: { capitalize: true },
    fallback: 'The saved phrases could not be loaded.',
  },

  // The same three for a single period (PERIOD_SENTENCE, de "Satzgefüge", ja 文).
  'failure.periodNotSaved': {
    plan: couldNotBe('SAVE', { concept: 'PERIOD_SENTENCE', definiteness: 'definite' }),
    format: { capitalize: true },
    fallback: 'The period could not be saved.',
  },
  'failure.periodNotLoaded': {
    plan: couldNotBe('LOAD', { concept: 'PERIOD_SENTENCE', definiteness: 'that' }),
    format: { capitalize: true },
    fallback: 'That period could not be loaded.',
  },
  'failure.savedPeriodsNotLoaded': {
    plan: couldNotBe('LOAD', {
      concept: 'PERIOD_SENTENCE', number: 'plural', definiteness: 'definite', adjectives: ['SAVED'],
    }),
    format: { capitalize: true },
    fallback: 'The saved periods could not be loaded.',
  },

  // The two failures that mean the backend is unreachable. Neither names the server: what the user
  // is told is what did not happen — the phrase was not translated, the words were not loaded — and
  // the call sites follow it with `status.isServerActive`, which is the question about the server
  // and already says it without the compound German cannot form ("translation server", bug B10).
  // That also spares the corpus a REACH whose Japanese (到達する) takes に and could not carry a
  // direct object at all; TRANSLATE is transitive in all seven.
  'failure.phraseNotTranslated': {
    plan: couldNotBe('TRANSLATE', { concept: 'PHRASE', definiteness: 'definite' }),
    format: { capitalize: true },
    fallback: 'The phrase could not be translated.',
  },
  'failure.wordsNotLoaded': {
    plan: couldNotBe('LOAD', { concept: 'WORD', number: 'plural', definiteness: 'definite' }),
    format: { capitalize: true },
    fallback: 'The words could not be loaded.',
  },
  // The phrase console's own failure: a line its language threw on, which the prompt reports rather
  // than let the page, and the phrase on it, go down with it. The line is `this`, the one in the
  // prompt: "This line could not be read.", de "Diese Zeile konnte nicht gelesen werden.", ja
  // 「この行は読むことができませんでした。」.
  'failure.lineNotRead': {
    plan: couldNotBe('READ', { concept: 'LINE', definiteness: 'this' }),
    format: { capitalize: true },
    fallback: 'This line could not be read.',
  },

  // The name a phrase is exported under when the user gave it none: PHRASE with UNTITLED, "Untitled
  // phrase", it "Frase senza titolo", de "Unbenannte Phrase". It is written into the file, so it keeps
  // the language that was active when the phrase was exported.
  'phrase.untitled': {
    plan: { subject: { concept: 'PHRASE', definiteness: 'bare', adjectives: ['UNTITLED'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Untitled phrase',
  },

  // The save and load dialogs' own chrome. The dialog's dismiss button is the CANCEL command ("Annulla",
  // "Annuler", ja キャンセル); the text field is labelled by the NAME_NOUN it takes (NAME is the verb); and
  // the list says LOADING, the process noun, while it waits (it "Caricamento", de "Laden"), with the
  // call site adding the ellipsis.
  'action.cancel': { plan: commandOf('CANCEL'), format: NAME_FORMAT, fallback: 'Cancel' },
  'field.name': { plan: nameOf('NAME_NOUN'), format: NAME_FORMAT, fallback: 'Name' },
  'status.loading': { plan: nameOf('LOADING'), format: NAME_FORMAT, fallback: 'Loading' },

  // What a failed request asks the user to check: whether the server is up. A yes/no question
  // (`interrogative`) on BE and ACTIVE, the server in operation, which each language asks its own way:
  // en inverts ("Is the server active?"), de puts the verb first ("Ist der Server aktiv?"), fr asks
  // with "est-ce que" ("Est-ce que le serveur est actif ?"), es opens on "¿" and says a state with
  // estar ("¿El servidor está activo?"), ja closes on か (サーバーは稼働中ですか？). The engine writes the
  // question mark, so the format only capitalizes. Not "the translation server": German compounds it
  // without the linking -s- (*Übersetzungserver, bug B10).
  'status.isServerActive': {
    plan: {
      subject: { concept: 'SERVER' },
      verbPhrase: { verb: 'BE' },
      complements: { predicative: { phrase: { concept: 'ACTIVE' } } },
      interrogative: true,
    } as PhrasePlan,
    format: { capitalize: true },
    fallback: 'Is the server active?',
  },

  // An empty load dialog: the stored phrases or periods under the `no` quantifier, in the plural English
  // and German use ("No saved phrases", "Keine gespeicherten Phrasen"; it "Nessuna frase salvata"). The
  // "yet" of the English it replaces is an adverb, and a verbless period has no verb for one to modify.
  'saved.noPhrases': {
    plan: {
      subject: { concept: 'PHRASE', number: 'plural', definiteness: 'no', adjectives: ['SAVED'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'No saved phrases',
  },
  'saved.noPeriods': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', number: 'plural', definiteness: 'no', adjectives: ['SAVED'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'No saved periods',
  },
  // How to get one there, joined after `saved.noPeriods` with a dash: USE the icon, restricted by what it
  // does — the one that SAVEs a period — in a period container (`action.addPeriodContainer`'s noun
  // phrase). Lower-case, as it reads after the dash.
  'saved.useSaveIcon': {
    plan: {
      ...commandOf('USE'),
      directObject: {
        concept: 'ICON',
        definiteness: 'definite',
        relative: {
          verbPhrase: { verb: 'SAVE' },
          directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'indefinite' },
        },
      },
      complements: {
        locative: {
          phrase: {
            concept: 'CONTAINER',
            definiteness: 'indefinite',
            nounModifiers: [{ concept: 'PERIOD_SENTENCE', relation: 'material' }],
          },
        },
      },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'use the icon that saves a period in a period container',
  },

  // The save control on a period container's header. Definite, not indefinite: the command
  // acts on the period the button sits in — "save the period" ("salva il periodo"). The
  // engine has no demonstrative determiner, so `definite` is as close as it renders to "this".
  'action.savePeriod': {
    plan: {
      ...commandOf('SAVE'),
      directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'definite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Save period',
  },

  // The three view controls on a period container's header, which have no label of their own —
  // the tooltip is the whole affordance. Each is a command on the period the button sits in, and
  // that period is the one right there under the cursor, so the object takes the `this`
  // demonstrative rather than the definite article: en "compact this period", it "compatta questo
  // periodo", de "verdichte diese Periode", ja 「この期間を圧縮」. The compact/expand pair is one
  // button in two states, so it is two entries, each naming what pressing it will do.
  'action.compactPeriod': {
    plan: {
      ...commandOf('COMPACT'),
      directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Compact this period',
  },
  'action.expandPeriod': {
    plan: {
      ...commandOf('EXPAND'),
      directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Expand this period',
  },

  // The two reorder controls beside them: MOVE with the UP or DOWN adverb, on the same "this period"
  // object the others take ("Sposta questo periodo su", "Dieses Satzgefüge nach oben verschieben",
  // ja 「この文を上に移動」). The adverb of direction follows the object in every language since A142.
  'action.movePeriodUp': {
    plan: {
      ...commandOf('MOVE'),
      verbPhrase: { verb: 'MOVE', modifier: 'UP' },
      directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Move this period up',
  },
  'action.movePeriodDown': {
    plan: {
      ...commandOf('MOVE'),
      verbPhrase: { verb: 'MOVE', modifier: 'DOWN' },
      directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Move this period down',
  },

  // The arrow keys on a box, which take the cursor to the nearest box that way: GO with the direction
  // (it "Va' a sinistra", de "Nach links gehen", ja 左に移動 — GO's instruction label, since 行く has no
  // verbal noun of its own). GO, not MOVE_ONESELF: it "muoviti su" is "hurry up". With ⇧ the same keys
  // shift the box itself on the canvas: MOVE on the slot, the reorder buttons' shape ("Sposta lo slot a
  // sinistra", de "Den Slot nach links verschieben", ja スロットを左に移動).
  ...inEachDirection(
    'action.go',
    (adverb) => ({ ...commandOf('GO'), verbPhrase: { verb: 'GO', modifier: adverb } }) as PhrasePlan,
    (dir) => `Go ${dir}`,
  ),
  ...inEachDirection(
    'action.moveSlot',
    (adverb) =>
      ({
        ...commandOf('MOVE'),
        verbPhrase: { verb: 'MOVE', modifier: adverb },
        directObject: { concept: 'SLOT_COMPUTING', definiteness: 'definite' },
      }) as PhrasePlan,
    (dir) => `Move the slot ${dir}`,
  ),
  // ⇥ and ⇧⇥ walk the boxes in reading order; ↑ and ↓ on a period walk the periods; F6 walks the page's
  // regions. Each key is named by where it goes: the noun bare, as a label has it, with NEXT or
  // PREVIOUS, which follow it in the Romance languages ("Slot successivo", "Période précédente") and
  // decline in German ("Nächster Slot", "Vorheriges Satzgefüge"). REGION is the UI's word for a part
  // of the page: it "Area successiva", fr "Zone suivante", de "Nächster Bereich", ja 次の領域.
  'slot.next': {
    plan: { subject: { concept: 'SLOT_COMPUTING', definiteness: 'bare', adjectives: ['NEXT'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Next slot',
  },
  'slot.previous': {
    plan: { subject: { concept: 'SLOT_COMPUTING', definiteness: 'bare', adjectives: ['PREVIOUS'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Previous slot',
  },
  'period.next': {
    plan: { subject: { concept: 'PERIOD_SENTENCE', definiteness: 'bare', adjectives: ['NEXT'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Next period',
  },
  'period.previous': {
    plan: { subject: { concept: 'PERIOD_SENTENCE', definiteness: 'bare', adjectives: ['PREVIOUS'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Previous period',
  },
  'region.next': {
    plan: { subject: { concept: 'REGION', definiteness: 'bare', adjectives: ['NEXT'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Next region',
  },
  'region.previous': {
    plan: { subject: { concept: 'REGION', definiteness: 'bare', adjectives: ['PREVIOUS'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Previous region',
  },
  // esc steps out one level: from a box onto its period, and from a period off the canvas. LEAVE on the
  // definite slot or period, the one the cursor is in: it "Esci dallo slot", fr "Quitter le slot",
  // de "Den Slot verlassen", es "Salir del slot", ja スロットを退出 (the label a "leave" button takes).
  'action.leaveSlot': {
    plan: {
      ...commandOf('LEAVE'),
      directObject: { concept: 'SLOT_COMPUTING', definiteness: 'definite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Leave the slot',
  },
  'action.leavePeriod': {
    plan: {
      ...commandOf('LEAVE'),
      directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'definite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Leave the period',
  },
  // Z on a box folds the dotted ring it sits in: COMPACT on the GROUP, the verb the ring's own toggle
  // says it with (`action.compact.*`): it "Compatta il gruppo", de "Die Gruppe verdichten", ja グループを圧縮.
  'action.compactGroup': {
    plan: {
      ...commandOf('COMPACT'),
      directObject: { concept: 'GROUP', definiteness: 'definite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Compact the group',
  },
  // A key that cycles a value runs it backwards with ⇧, and the help sheet names that key after the
  // forward one: its name, a comma, and this adverb ("Tense, backwards", it "Tempo, all'indietro",
  // de "Tempus, rückwärts"), joined where it is shown. An adverb has no noun to ride in a verbless
  // label, so the value stays outside the phrase (the C14 rule). Lower-case: it follows the comma.
  'hint.backwards': { word: 'BACKWARDS', fallback: 'backwards' },

  // The grab bar under a period container, named for what dragging it does: RESIZE on this container,
  // the noun phrase of `action.addPeriodContainer` ("ridimensiona questo contenitore di periodo").
  'action.resizeContainer': {
    plan: {
      ...commandOf('RESIZE'),
      directObject: {
        concept: 'CONTAINER',
        definiteness: 'this',
        nounModifiers: [{ concept: 'PERIOD_SENTENCE', relation: 'material' }],
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Resize this period container',
  },
  // The keys + and − on a period, which do what that grip does a step at a time: EXPAND and SHRINK on
  // the canvas the period is drawn on, definite ("Espandi la tela" / "Rimpicciolisci la tela", de "Die
  // Arbeitsfläche erweitern" / "verkleinern", ja 「キャンバスを展開」 / 「キャンバスを縮小」). SHRINK, not
  // COMPACT: COMPACT is what Z does to the period, packing its rings in ("verdichten", 圧縮), where − only
  // makes the surface shorter.
  'action.expandCanvas': {
    plan: { ...commandOf('EXPAND'), directObject: { concept: 'CANVAS', definiteness: 'definite' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Expand the canvas',
  },
  'action.shrinkCanvas': {
    plan: { ...commandOf('SHRINK'), directObject: { concept: 'CANVAS', definiteness: 'definite' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Shrink the canvas',
  },
  // TIDY_UP, not a bare ORDER/ARRANGE: the button does not sort the period, it puts back in order
  // what dragging left in a mess — which is the verb every one of these languages already has for
  // a room ("tidy up", "riordina", "aufräumen").
  'action.tidyPeriod': {
    plan: {
      ...commandOf('TIDY_UP'),
      directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Tidy up this period',
  },

  // The sole period's clear control — its tooltip, and the aria-label it doubles as. The sole period
  // cannot be removed (the workspace always keeps one), so the control empties it in place: CLEAR on
  // the period under the cursor, `this` like the view controls beside it ("clear this period").
  'action.clearPeriod': {
    plan: {
      ...commandOf('CLEAR'),
      directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Clear this period',
  },

  // The same control on a period that is not the only one: it takes the period out of the workspace.
  // REMOVE, not DELETE: the period goes from the canvas and undo brings it back, and the languages keep
  // that verb apart from the one for erasing a stored record (it "rimuovi" vs "elimina", de "entfernen"
  // vs "löschen"). `this`, like the view controls beside it. It is the tooltip and the aria-label both.
  'action.removePeriod': {
    plan: {
      ...commandOf('REMOVE'),
      directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Remove this period',
  },

  // The coordination control on a period's border, before any coordination exists: COORDINATE on
  // this period. It stops there, where the English it replaces went on "…with another": a comitative
  // "with" is not a complement the engine has, and the steps the button opens — the conjunction menu,
  // then the pick — already show the other half.
  'action.coordinatePeriod': {
    plan: {
      ...commandOf('COORDINATE'),
      directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Coordinate this period',
  },

  // The subordinate-clause control on a period's border (P09-E12 D9), before any subordinate clause
  // exists: ADD a subordinate clause, indefinite, as the conditional's control adds a condition. The
  // menu it opens says which kind — *that*, *to*, or a conjunction — and the pick says which period.
  'action.addSubordinate': {
    plan: {
      ...commandOf('ADD'),
      directObject: { concept: 'CLAUSE', definiteness: 'indefinite', adjectives: ['SUBORDINATE'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Add a subordinate clause',
  },

  // The badge in a period's caption naming the part the period plays in a link: CLAUSE with the
  // adjective for that part. The Romance traditions name clauses exactly so ("proposizione principale",
  // "proposition conditionnelle", "oración coordinada"); German says "übergeordneter Satz" for the
  // main one, and Japanese compounds each term on 節 (主節, 条件節, 等位節). A coordinated clause's
  // conjunction ("and", "but") is a function word the catalog has no entry kind for yet, so the call
  // site adds it in English.
  'clause.main': {
    plan: { subject: { concept: 'CLAUSE', definiteness: 'bare', adjectives: ['MAIN'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Main clause',
  },
  'clause.conditional': {
    plan: { subject: { concept: 'CLAUSE', definiteness: 'bare', adjectives: ['CONDITIONAL'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Conditional clause',
  },
  'clause.first': {
    plan: { subject: { concept: 'CLAUSE', definiteness: 'bare', adjectives: ['FIRST'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'First clause',
  },
  'clause.coordinated': {
    plan: { subject: { concept: 'CLAUSE', definiteness: 'bare', adjectives: ['COORDINATED'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Coordinated clause',
  },
  // A period that is another's subordinate clause — its object clause, its adverbial clause or its
  // infinitive complement (P09-E12 D9): it "proposizione subordinata", de "untergeordneter Satz", ja 従属節.
  // A period that is another's clause of purpose (P13): named by its PURPOSE alone (it "Scopo", de
  // "Zweck", ja 目的), which the menu row and the connector read beside *that* and *to*.
  'clause.purpose': { plan: nameOf('PURPOSE'), format: NAME_FORMAT, fallback: 'Purpose' },
  'clause.subordinate': {
    plan: { subject: { concept: 'CLAUSE', definiteness: 'bare', adjectives: ['SUBORDINATE'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Subordinate clause',
  },

  // What the conditional and coordination controls say of the period they sit on once it is the second
  // half of a link: a statement, BE with the clause as its subject complement ("this period is a
  // conditional clause", ja 「この文は条件節です」). Indefinite: one of the clauses the link is made of.
  'period.isConditional': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
      verbPhrase: { verb: 'BE' },
      complements: {
        predicative: { phrase: { concept: 'CLAUSE', definiteness: 'indefinite', adjectives: ['CONDITIONAL'] } },
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'This period is a conditional clause',
  },
  'period.isCoordinated': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
      verbPhrase: { verb: 'BE' },
      complements: {
        predicative: { phrase: { concept: 'CLAUSE', definiteness: 'indefinite', adjectives: ['COORDINATED'] } },
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'This period is a coordinated clause',
  },
  'period.isSubordinate': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
      verbPhrase: { verb: 'BE' },
      complements: {
        predicative: { phrase: { concept: 'CLAUSE', definiteness: 'indefinite', adjectives: ['SUBORDINATE'] } },
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'This period is a subordinate clause',
  },

  // The conditional control before any condition exists: ADD a condition, indefinite, since the user
  // has yet to pick the period that sets it. What pressing it does to *this* period is a statement,
  // BECOME the main clause, kept as an entry of its own and joined in brackets at the call site: one
  // plan cannot say both, because a clause coordinated with a command inherits its imperative mood.
  // Lower-case, as it reads inside the brackets (the engine leaves a sentence's first word as it is).
  'action.addCondition': {
    plan: {
      ...commandOf('ADD'),
      directObject: { concept: 'CONDITION', definiteness: 'indefinite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Add a condition',
  },
  'period.becomesMain': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
      verbPhrase: { verb: 'BECOME' },
      complements: {
        predicative: { phrase: { concept: 'CLAUSE', definiteness: 'definite', adjectives: ['MAIN'] } },
      },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'this period becomes the main clause',
  },

  // The same two controls on the first half of a link, which drop the link: REMOVE, the canvas verb
  // undo reverses, on the condition or the coordination already there, so definite.
  'action.removeCondition': {
    plan: {
      ...commandOf('REMOVE'),
      directObject: { concept: 'CONDITION', definiteness: 'definite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Remove the condition',
  },
  'action.removeCoordination': {
    plan: {
      ...commandOf('REMOVE'),
      directObject: { concept: 'COORDINATION', definiteness: 'definite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Remove the coordination',
  },
  'action.removeSubordinate': {
    plan: {
      ...commandOf('REMOVE'),
      directObject: { concept: 'CLAUSE', definiteness: 'definite', adjectives: ['SUBORDINATE'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Remove the subordinate clause',
  },

  // The remove control on a hosted ring, which drops that phrase from the noun it hangs off: one of a
  // coordinated noun's conjuncts ("Peter" of "Peter and Paul"), or a noun's owner. `this`, the ring
  // under the cursor. Spanish and Portuguese have no word for a conjunct and say "the coordinated
  // member" (es "quitar este miembro coordinado").
  'action.removeConjunct': {
    plan: {
      ...commandOf('REMOVE'),
      directObject: { concept: 'CONJUNCT', definiteness: 'this' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Remove this conjunct',
  },
  'action.removePossessor': {
    plan: {
      ...commandOf('REMOVE'),
      directObject: { concept: 'POSSESSOR', definiteness: 'this' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Remove this possessor',
  },
  'action.removeStandard': {
    plan: {
      ...commandOf('REMOVE'),
      directObject: { concept: 'STANDARD_OF_COMPARISON', definiteness: 'this' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Remove this standard of comparison',
  },

  // What a possessor control that points at another noun shows in place of the owner's word, when
  // that antecedent no longer resolves (it was cleared, or its period went): some noun, unnamed.
  // The control is already titled "Possessor" and the value follows it after a colon, so this is
  // the bare indefinite noun and not the sentence it would take to say "the possessor points at a
  // noun" — which the label would then say twice.
  'hint.aNoun': {
    plan: { subject: { concept: 'NOUN', definiteness: 'indefinite' } } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'a noun',
  },

  // The coordination control's value: ADD a conjunct, and once there is one, another. OTHER takes the
  // indefinite article's place in Spanish and Portuguese ("añadir otro miembro coordinado") and fuses
  // with it in English ("another"); in Italian and French it precedes the noun ("un altro congiunto").
  'action.addConjunct': {
    plan: {
      ...commandOf('ADD'),
      directObject: { concept: 'CONJUNCT', definiteness: 'indefinite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Add a conjunct',
  },
  'action.addAnotherConjunct': {
    plan: {
      ...commandOf('ADD'),
      directObject: { concept: 'CONJUNCT', definiteness: 'indefinite', adjectives: ['OTHER'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Add another conjunct',
  },

  // The hint banner while a link waits for its second period: CLICK the period, restricted by what it
  // is to be, in the container it has to be found in. The container is `action.addPeriodContainer`'s,
  // with OTHER: the pick cannot land in the container it started from. The relative clause names the
  // role: the period that BE the condition (a subject gap), or the noun this clause DESCRIBES (an
  // object gap, whose subject is the clause being linked).
  'pick.condition': {
    plan: {
      ...commandOf('CLICK'),
      directObject: {
        concept: 'PERIOD_SENTENCE',
        definiteness: 'definite',
        relative: {
          verbPhrase: { verb: 'BE' },
          complements: { predicative: { phrase: { concept: 'CONDITION', definiteness: 'definite' } } },
        },
      },
      complements: {
        locative: {
          phrase: {
            concept: 'CONTAINER',
            definiteness: 'indefinite',
            adjectives: ['OTHER'],
            nounModifiers: [{ concept: 'PERIOD_SENTENCE', relation: 'material' }],
          },
        },
      },
    } as PhrasePlan,
    // The banner is a sentence, so it keeps the full stop its language ends one with ("。" in ja).
    format: { capitalize: true },
    fallback: 'Click the period that is the condition in another period container.',
  },
  'pick.relativeHead': {
    plan: {
      ...commandOf('CLICK'),
      directObject: {
        concept: 'NOUN',
        definiteness: 'definite',
        relative: {
          headRole: 'directObject',
          subject: { concept: 'CLAUSE', definiteness: 'this' },
          verbPhrase: { verb: 'DESCRIBE' },
        },
      },
      complements: {
        locative: {
          phrase: {
            concept: 'CONTAINER',
            definiteness: 'indefinite',
            adjectives: ['OTHER'],
            nounModifiers: [{ concept: 'PERIOD_SENTENCE', relation: 'material' }],
          },
        },
      },
    } as PhrasePlan,
    format: { capitalize: true },
    fallback: 'Click the noun that this clause describes in another period container.',
  },
  // The coordination pick says what the click is *for* rather than what the period must be: a
  // purpose clause (localization C12) whose COORDINATE takes the clause already in hand as its
  // `comitative` — the companion of the act, not its means, which is the one complement English
  // spells "with" twice over and no other language does (con / avec / mit / と). The conjunction
  // the user chose is a function word the catalog cannot cite yet (C13); the banner writes it
  // after this sentence, in brackets.
  'pick.coordinated': {
    plan: {
      ...commandOf('CLICK'),
      directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'definite' },
      complements: {
        locative: {
          phrase: {
            concept: 'CONTAINER',
            definiteness: 'indefinite',
            adjectives: ['OTHER'],
            nounModifiers: [{ concept: 'PERIOD_SENTENCE', relation: 'material' }],
          },
        },
      },
      purpose: {
        verbPhrase: { verb: 'COORDINATE' },
        complements: { comitative: { phrase: { concept: 'CLAUSE', definiteness: 'this' } } },
      },
    } as PhrasePlan,
    format: { capitalize: true },
    fallback: 'Click the period in another period container to coordinate with this clause.',
  },
  // The subordinate-clause pick names the period by the part it will play, as the condition's does.
  'pick.subordinate': {
    plan: {
      ...commandOf('CLICK'),
      directObject: {
        concept: 'PERIOD_SENTENCE',
        definiteness: 'definite',
        relative: {
          verbPhrase: { verb: 'BE' },
          complements: { predicative: { phrase: { concept: 'CLAUSE', definiteness: 'definite', adjectives: ['SUBORDINATE'] } } },
        },
      },
      complements: {
        locative: {
          phrase: {
            concept: 'CONTAINER',
            definiteness: 'indefinite',
            adjectives: ['OTHER'],
            nounModifiers: [{ concept: 'PERIOD_SENTENCE', relation: 'material' }],
          },
        },
      },
    } as PhrasePlan,
    format: { capitalize: true },
    fallback: 'Click the period that is the subordinate clause in another period container.',
  },
  // The instrument pick names the period by what it *owns*: the genitive relative (C12), the one
  // relative that gaps no slot — the head is the possessor of the clause's subject. en "whose
  // noun", it "il cui sostantivo", fr "dont le nom", de "dessen Substantiv", es/pt "cuyo/cujo".
  // It replaces a sentence that needed a passive to say the same thing ("whose noun is what the
  // action is done with", C11): naming the complement the noun fills says it in the active.
  'pick.instrumental': {
    plan: {
      ...commandOf('CLICK'),
      directObject: {
        concept: 'PERIOD_SENTENCE',
        definiteness: 'definite',
        relative: {
          headRole: 'possessor',
          subject: { concept: 'NOUN', definiteness: 'definite' },
          verbPhrase: { verb: 'BE' },
          complements: { predicative: { phrase: { concept: 'INSTRUMENTAL', definiteness: 'definite' } } },
        },
      },
      complements: {
        locative: {
          phrase: {
            concept: 'CONTAINER',
            definiteness: 'indefinite',
            adjectives: ['OTHER'],
            nounModifiers: [{ concept: 'PERIOD_SENTENCE', relation: 'material' }],
          },
        },
      },
    } as PhrasePlan,
    format: { capitalize: true },
    fallback: 'Click the period whose noun is the instrumental in another period container.',
  },

  // The two link controls while the period is an eligible target: what picking it would make the
  // period *count as*. That is the essive reading of the object complement (C12) — the period is
  // not turned into a condition, it is used as one — which every language marks with one word of
  // its own (as / come / comme / como / als / として) and, outside English, with no article at
  // all: it names a role, not a referent ("come condizione", "als Bedingung").
  'action.useAsCondition': {
    plan: {
      ...commandOf('USE'),
      directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
      complements: {
        objectPredicative: {
          phrase: { concept: 'CONDITION', definiteness: 'definite' },
          specifiers: [{ kind: 'predication', value: 'essive' }],
        },
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Use this period as the condition',
  },
  'action.useAsCoordinated': {
    plan: {
      ...commandOf('USE'),
      directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
      complements: {
        objectPredicative: {
          phrase: { concept: 'CLAUSE', definiteness: 'definite', adjectives: ['COORDINATED'] },
          specifiers: [{ kind: 'predication', value: 'essive' }],
        },
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Use this period as the coordinated clause',
  },
  'action.useAsSubordinate': {
    plan: {
      ...commandOf('USE'),
      directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
      complements: {
        objectPredicative: {
          phrase: { concept: 'CLAUSE', definiteness: 'definite', adjectives: ['SUBORDINATE'] },
          specifiers: [{ kind: 'predication', value: 'essive' }],
        },
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Use this period as the subordinate clause',
  },

  // The conjunction menu's hints: the kind of relation each conjunction sets up, as the grammar
  // traditions name it. An adjective agreeing with CONJUNCTION, feminine in the Romance languages
  // (it "avversativa", fr "temporelle"). Japanese names the kinds with nouns (累加, 逆接). Keyed by
  // CoordConjunction so the menu can write t(`conjunction.kind.${value}`).
  'conjunction.kind.and': { word: 'COPULATIVE', agreesWith: 'CONJUNCTION', fallback: 'copulative' },
  'conjunction.kind.or': { word: 'DISJUNCTIVE', agreesWith: 'CONJUNCTION', fallback: 'disjunctive' },
  'conjunction.kind.but': { word: 'ADVERSATIVE', agreesWith: 'CONJUNCTION', fallback: 'adversative' },
  'conjunction.kind.that_is': { word: 'EXPLICATIVE', agreesWith: 'CONJUNCTION', fallback: 'explicative' },
  'conjunction.kind.therefore': { word: 'CONCLUSIVE', agreesWith: 'CONJUNCTION', fallback: 'conclusive' },
  'conjunction.kind.then': { word: 'TEMPORAL', agreesWith: 'CONJUNCTION', fallback: 'temporal' },
  // "however" contrasts as "but" does (P09-E29): the same kind, told apart by its word.
  'conjunction.kind.however': { word: 'ADVERSATIVE', agreesWith: 'CONJUNCTION', fallback: 'adversative' },

  // The conjunction menu's own entries: the word each conjunction *is*, which until now the menu
  // wrote in English beside its localized hint. A conjunction is a function word no lexicon holds —
  // each engine spells its own set — and what counts as one word is a fact about the language:
  // `then` is a connective adverb in all seven and comes with the coordinator it leans on ("e poi",
  // "und dann", それから). It is cited between two clauses, where the menu puts it; the three that
  // can also join two nouns are written differently there (ja 〜と, not そして). Keyed by
  // CoordConjunction beside the hints, so the menu writes t(`conjunction.value.${value}`).
  'conjunction.value.and': { conjunction: 'and', format: { capitalize: true }, fallback: 'And' },
  'conjunction.value.or': { conjunction: 'or', format: { capitalize: true }, fallback: 'Or' },
  'conjunction.value.but': { conjunction: 'but', format: { capitalize: true }, fallback: 'But' },
  'conjunction.value.that_is': { conjunction: 'that_is', format: { capitalize: true }, fallback: 'That is' },
  // en "so", not "therefore": the conclusive coordinator English actually writes between two
  // clauses. "Therefore" is the adverb, and the menu is offering a join.
  'conjunction.value.therefore': { conjunction: 'therefore', format: { capitalize: true }, fallback: 'So' },
  'conjunction.value.then': { conjunction: 'then', format: { capitalize: true }, fallback: 'And then' },
  'conjunction.value.however': { conjunction: 'however', format: { capitalize: true }, fallback: 'However' },

  // The subordinate-clause menu's entries (P09-E12 D9): `that`, the object clause's complementizer,
  // and the five subordinating conjunctions, each the word the engine writes before (or, in
  // Japanese, after) the clause — it "dopo che", fr "parce que", de "nachdem", ja 〜ので. Keyed by
  // Subordinator, so the menu writes t(`subordinator.value.${value}`).
  'subordinator.value.that': { subordinator: 'that', format: { capitalize: true }, fallback: 'That' },
  'subordinator.value.when': { subordinator: 'when', format: { capitalize: true }, fallback: 'When' },
  'subordinator.value.while': { subordinator: 'while', format: { capitalize: true }, fallback: 'While' },
  'subordinator.value.because': { subordinator: 'because', format: { capitalize: true }, fallback: 'Because' },
  'subordinator.value.after': { subordinator: 'after', format: { capitalize: true }, fallback: 'After' },
  'subordinator.value.before': { subordinator: 'before', format: { capitalize: true }, fallback: 'Before' },
  // P09-E27: each cited as its clause opens on it — "finché", "jusqu'à ce que", 〜まで; "da quando",
  // 〜てから; "sebbene", "obwohl", 〜のに.
  'subordinator.value.until': { subordinator: 'until', format: { capitalize: true }, fallback: 'Until' },
  'subordinator.value.since': { subordinator: 'since', format: { capitalize: true }, fallback: 'Since' },
  'subordinator.value.though': { subordinator: 'though', format: { capitalize: true }, fallback: 'Though' },
  // Localization C41: the similative — "come", "comme", "wie", 〜ように.
  'subordinator.value.as': { subordinator: 'as', format: { capitalize: true }, fallback: 'As' },

  // The spatial-relation toolbar on a route or a locative: one icon per relation, its tooltip the
  // adposition that relation is spoken with. Not a word of the lexicon — the Romance prepositions
  // fuse with the article ("nella casa"), German marks the relation on the article's case, and
  // Japanese wraps its noun in a circumposition — so each is cited on a bare noun and comes back as
  // the adposition alone: it "sotto", "intorno a"; de "unter", "um"; ja 〜の下で, 〜を通って, which is
  // how a dictionary writes a form that cannot stand without its noun. Keyed by PathSpecifier, so
  // the toolbar writes t(`specifier.value.${value}`).
  //
  // Lower-case: they are words in running grammar, not names of things (the toolbar capitalizes
  // nothing else either), and an adposition is not capitalized in any of the seven.
  'specifier.value.in': { specifier: { kind: 'path', value: 'in' }, fallback: 'in' },
  'specifier.value.through': { specifier: { kind: 'path', value: 'through' }, fallback: 'through' },
  'specifier.value.under': { specifier: { kind: 'path', value: 'under' }, fallback: 'under' },
  'specifier.value.over': { specifier: { kind: 'path', value: 'over' }, fallback: 'over' },
  'specifier.value.around': { specifier: { kind: 'path', value: 'around' }, fallback: 'around' },
  'specifier.value.behind': { specifier: { kind: 'path', value: 'behind' }, fallback: 'behind' },
  'specifier.value.in_front_of': { specifier: { kind: 'path', value: 'in_front_of' }, fallback: 'in front of' },
  // P09-E1: it "su", de "auf", ja 〜の上で (the same as `over` — Japanese does not tell the two
  // apart); "tra" / "zwischen" / 〜の間で; "contro" / "an", and ja 〜に, a relation Japanese keeps in
  // the verb rather than an adposition.
  'specifier.value.on': { specifier: { kind: 'path', value: 'on' }, fallback: 'on' },
  'specifier.value.between': { specifier: { kind: 'path', value: 'between' }, fallback: 'between' },
  'specifier.value.against': { specifier: { kind: 'path', value: 'against' }, fallback: 'against' },
  // P09-E32: fr "parmi"; the other five merge it with `between` — "tra", "zwischen", "entre", 〜の間で.
  'specifier.value.among': { specifier: { kind: 'path', value: 'among' }, fallback: 'among' },

  // The temporal complement's toolbar (P09-E12b), cited on a bare noun as the spatial relations are,
  // so each comes back as the word its language says the relation with: en "ago", it "fa", fr "il y
  // a", es "hace", pt "há", de "vor", ja 〜前に. German says `ago` and `before` alike ("vor"), as it
  // does in the sentence. Keyed by TemporalRelation, so the toolbar writes t(`temporal.value.${v}`).
  'temporal.value.at': { specifier: { kind: 'temporal', value: 'at' }, fallback: 'at' },
  'temporal.value.ago': { specifier: { kind: 'temporal', value: 'ago' }, fallback: 'ago' },
  'temporal.value.until': { specifier: { kind: 'temporal', value: 'until' }, fallback: 'until' },
  'temporal.value.after': { specifier: { kind: 'temporal', value: 'after' }, fallback: 'after' },
  'temporal.value.before': { specifier: { kind: 'temporal', value: 'before' }, fallback: 'before' },
  'temporal.value.during': { specifier: { kind: 'temporal', value: 'during' }, fallback: 'during' },
  // P09-E20: the spatial `between` word, and ja 〜の間に, the same citation as `during`'s (D3).
  'temporal.value.between': { specifier: { kind: 'temporal', value: 'between' }, fallback: 'between' },
  // P09-E27: da / depuis / seit / desde / desde / 〜から.
  'temporal.value.since': { specifier: { kind: 'temporal', value: 'since' }, fallback: 'since' },
  // P09-E34: entro / d'ici / innerhalb / dentro de / dentro de / 〜以内に.
  'temporal.value.within': { specifier: { kind: 'temporal', value: 'within' }, fallback: 'within' },
  // P09-E35: per / pendant / durante / por, and the two with no adposition cited by their duration
  // word — de "lang" ("eine Stunde lang"), ja 〜間.
  'temporal.value.for': { specifier: { kind: 'temporal', value: 'for' }, fallback: 'for' },

  // The cause complement's sentiment toolbar, whose tooltip names the stance and then shows the
  // connector it picks — "Neutral — because of", it "Neutrale — a causa di", de "Neutral — wegen".
  // Two entries per stance, joined with a dash at the call site, because they are two different
  // kinds of string: the stance is an ordinary adjective agreeing with the CAUSE_COMPLEMENT it
  // describes, and the connector is a specifier, cited like the spatial relations above. German
  // blames with a fixed phrase rather than a preposition ("durch die Schuld"), and Japanese marks
  // all three after the noun (〜のために / 〜のせいで / 〜のおかげで).
  'sentiment.value.neutral': {
    word: 'NEUTRAL',
    agreesWith: 'CAUSE_COMPLEMENT',
    format: { capitalize: true },
    fallback: 'Neutral',
  },
  'sentiment.value.negative': {
    word: 'NEGATIVE',
    agreesWith: 'CAUSE_COMPLEMENT',
    format: { capitalize: true },
    fallback: 'Negative',
  },
  'sentiment.value.positive': {
    word: 'POSITIVE',
    agreesWith: 'CAUSE_COMPLEMENT',
    format: { capitalize: true },
    fallback: 'Positive',
  },
  'sentiment.connector.neutral': { specifier: { kind: 'sentiment', value: 'neutral' }, fallback: 'because of' },
  'sentiment.connector.negative': { specifier: { kind: 'sentiment', value: 'negative' }, fallback: 'through the fault of' },
  'sentiment.connector.positive': { specifier: { kind: 'sentiment', value: 'positive' }, fallback: 'thanks to' },

  // The degree chip's tooltip: what the chosen degree adds to the adjective it rides. The seventh
  // function-word kind, and the one that is least often a word at all — Italian, French, Spanish,
  // Portuguese and Japanese put an adverb in front ("più", もっと), German remakes the adjective
  // ("größer", "am größten"), and English does either depending on the adjective. So it is cited on
  // one, BIG, which every language compares in its ordinary way: en "bigger", not the "more" a long
  // adjective would force. The Romance superlatives keep the definite article the phrase gives them
  // ("il più"), or "more" and "most" would be one word.
  //
  // `positive` adds nothing in any of the seven; it renders the em-dash the chip already showed for
  // it. Keyed by Degree, so the chip writes t(`degree.value.${value}`).
  'degree.value.positive': { degree: 'positive', fallback: '—' },
  'degree.value.more': { degree: 'more', fallback: 'more' },
  'degree.value.most': { degree: 'most', fallback: 'most' },
  'degree.value.less': { degree: 'less', fallback: 'less' },
  'degree.value.least': { degree: 'least', fallback: 'least' },
  'degree.value.equally': { degree: 'equally', fallback: 'equally' },

  // ── The phrase console ──────────────────────────────────────────────────────
  // The console's frame, its key hints, its list titles and its help pages, where their words are
  // seeded. Command names, values and the syntax stay English in every language (P02's decision 3).
  // Lower-case unless noted: they are hints and captions, and the list's titles and topics are
  // uppercased by the CSS.

  // What the key beside the console's title does: the bare HIDE command, lower-case like `slot.choose`
  // beside its keycap ("hide", it "nascondi", ja 隠し).
  'action.hide': {
    plan: commandOf('HIDE'),
    format: { stripPeriod: true },
    fallback: 'hide',
  },
  // The console's name, the bare CONSOLE: the header button that shows it, its own title, its prompt's
  // accessible name, the key that toggles it and its part of the help (it "Console", es "Consola",
  // de "Konsole", ja コンソール). The part sits under the overlay's help, so the name alone says it.
  'console.name': { plan: nameOf('CONSOLE'), format: NAME_FORMAT, fallback: 'Console' },
  // The icon button beside the title and the grip above it, each named by what it does to the console,
  // definite — the one open at the foot of the page: HIDE ("Nascondi la console", ja コンソールを隠し,
  // the shipped 隠し of `action.hide.*`) and RESIZE, the `action.resizeContainer` verb ("Die Konsole
  // skalieren", ja コンソールをサイズ変更).
  'action.hideConsole': {
    plan: { ...commandOf('HIDE'), directObject: { concept: 'CONSOLE', definiteness: 'definite' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Hide the console',
  },
  'action.resizeConsole': {
    plan: { ...commandOf('RESIZE'), directObject: { concept: 'CONSOLE', definiteness: 'definite' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Resize the console',
  },
  // What the / key begins: TYPE on an indefinite COMMAND, the one the user has yet to write, with the
  // console as its `locative` — "Type a command in the console", it "Digita un comando nella console",
  // ja 「コンソールで命令を入力」. TYPE rather than START: typing is what the key begins.
  'action.typeCommand': {
    plan: {
      ...commandOf('TYPE'),
      directObject: { concept: 'COMMAND', definiteness: 'indefinite' },
      complements: { locative: { phrase: { concept: 'CONSOLE', definiteness: 'definite' } } },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Type a command in the console',
  },
  // A command's row in the help overlay, which opens its page in the console: SHOW with the console as
  // its `locative` and no object ("Mostra nella console", de "In der Konsole zeigen", ja コンソールで見せ).
  // The command's name follows after a colon, outside the phrase (the C14 rule): "Show in the console: /rel".
  'action.showInConsole': {
    plan: {
      ...commandOf('SHOW'),
      complements: { locative: { phrase: { concept: 'CONSOLE', definiteness: 'definite' } } },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Show in the console',
  },
  // What esc does from the console's prompt (and from the words panel): RETURN, with the canvas as its
  // `direction`, the place gone back to — "return to the canvas", it "torna alla tela", de "zur
  // Arbeitsfläche zurückkehren", ja 「キャンバスへ戻る」. Lower-case: it sits beside its keycap.
  'action.returnToCanvas': {
    plan: {
      ...commandOf('RETURN'),
      complements: { direction: { phrase: { concept: 'CANVAS', definiteness: 'definite' } } },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'return to the canvas',
  },
  // The icon on a transcript line the canvas wrote, as its title. No entry kind holds a bare "from the
  // canvas" (C13's specifier kind cites the adposition alone), so the icon names its source: CANVAS
  // (it "Tela", de "Arbeitsfläche", ja キャンバス).
  'console.fromCanvas': { plan: nameOf('CANVAS'), format: NAME_FORMAT, fallback: 'Canvas' },
  // Editing a period in the prompt. The bare EDIT command names ↵ on a period ("Modifica", de
  // "Bearbeiten", ja 編集), and heads the prompt's chip while a period is loaded into it, before the
  // period's name and number: EDIT · PERIOD 2. A mode label reads as the command's noun in every
  // language (it "Modifica", de "Bearbeiten", ja 編集), so no participle phrase is needed. `/edit`, which
  // loads the period the cursor is on, names it with `this`: "Edit this period", it "Modifica questo
  // periodo", ja 「この文を編集」. Italian and French share MODIFY's verb, as their software does.
  'action.edit': { plan: commandOf('EDIT'), format: NAME_FORMAT, fallback: 'Edit' },
  'action.editPeriod': {
    plan: { ...commandOf('EDIT'), directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Edit this period',
  },
  // A period with no words yet, as the source strip writes its line: PERIOD_SENTENCE under EMPTY,
  // "empty period", it "periodo vuoto", de "leeres Satzgefüge", ja 空の文.
  'period.empty': {
    plan: { subject: { concept: 'PERIOD_SENTENCE', definiteness: 'bare', adjectives: ['EMPTY'] } } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'empty period',
  },
  // The prompt's placeholder: TYPE on a word or a command, the `slot.nounOrPronoun.placeholder` shape
  // ("type a word or a command", it "digita una parola o un comando", ja 単語か命令を入力). The key that
  // starts a command is a value, not a word, so the call site writes it after the phrase: "(/)".
  'console.placeholder': {
    plan: {
      ...commandOf('TYPE'),
      directObject: {
        conjunction: 'or',
        conjuncts: [
          { concept: 'WORD', definiteness: 'indefinite' },
          { concept: 'COMMAND', definiteness: 'indefinite' },
        ],
      },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'type a word or a command',
  },
  // What ↵ does while a period is being edited: REPLACE on the period, definite because it is the one
  // loaded into the prompt ("replace the period", de "das Satzgefüge ersetzen", ja 文を置き換え).
  'action.replacePeriod': {
    plan: {
      ...commandOf('REPLACE'),
      directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'definite' },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'replace the period',
  },
  // What `/del` does, in the list and on its help page: the bare REMOVE command. What it removes is
  // the help page's usage line, which spells its arguments out (it "Rimuovi", de "Entfernen").
  'action.remove': { plan: commandOf('REMOVE'), format: NAME_FORMAT, fallback: 'Remove' },

  // The completion list's titles: what the list holds, a plural bare noun, like the words panel's
  // headings (`palette.*`). The word a list is about, where there is one, follows the title outside
  // the phrase (the C14 rule): "commands · cat".
  'console.list.commands': {
    plan: { subject: { concept: 'COMMAND', number: 'plural', definiteness: 'bare' } } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'commands',
  },
  // `/load`'s names: the stored phrases, PHRASE under SAVED, as the load dialog calls them.
  'console.list.savedPhrases': {
    plan: {
      subject: { concept: 'PHRASE', number: 'plural', definiteness: 'bare', adjectives: ['SAVED'] },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'saved phrases',
  },
  'console.list.conjunctions': {
    plan: { subject: { concept: 'CONJUNCTION', number: 'plural', definiteness: 'bare' } } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'conjunctions',
  },
  // A reference's periods (de "Satzgefüge", the plural is the singular; ja 文).
  'console.list.periods': {
    plan: { subject: { concept: 'PERIOD_SENTENCE', number: 'plural', definiteness: 'bare' } } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'periods',
  },
  // `/modal`'s words: MODAL, which the traditions name by mood (it "verbi modali", de "Modalverben").
  'console.list.modals': {
    plan: { subject: { concept: 'MODAL', number: 'plural', definiteness: 'bare' } } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'modals',
  },
  // An empty prompt's list: the lines pinned, then the ones run recently. LINE plural under PINNED and
  // under RECENT — "pinned lines", "recent lines"; it "righe fissate", "righe recenti"; de "angeheftete
  // Zeilen", "zuletzt verwendete Zeilen"; ja ピン留め済みの行, 最近使用された行. A list holding both kinds is
  // headed by both titles, "pinned lines · recent lines", rather than by one noun under two adjectives.
  'console.list.pinned': {
    plan: {
      subject: { concept: 'LINE', number: 'plural', definiteness: 'bare', adjectives: ['PINNED'] },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'pinned lines',
  },
  'console.list.recent': {
    plan: {
      subject: { concept: 'LINE', number: 'plural', definiteness: 'bare', adjectives: ['RECENT'] },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'recent lines',
  },
  // A command's values: VALUE plural, with the command they are values of after it, outside the phrase
  // as a list's word always is — "values · /tense", it "valori · /tense", de "Werte · /tense", ja 値.
  'console.list.values': {
    plan: { subject: { concept: 'VALUE', number: 'plural', definiteness: 'bare' } } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'values',
  },

  // The first rows a link command offers make a phrase rather than point at one, and each is named
  // by what the bracket would open: a NEW period, phrase or clause, bare and lower-case as the list's
  // own titles are. The help sheet's legend names the period's bracket the same way
  // (`help.console.newPeriod`), capitalized. It "nuovo periodo", "nuova frase", "nuova proposizione";
  // de "neues Satzgefüge", "neue Phrase", "neuer Satz"; ja 新しい文, 新しいフレーズ, 新しい節. A relative
  // clause's two rows say which role the noun takes in it, the role's name after this one and the word
  // outside the phrase (the C14 rule): "new clause · Subject: cat".
  'console.new.period': {
    plan: { subject: { concept: 'PERIOD_SENTENCE', definiteness: 'bare', adjectives: ['NEW'] } } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'new period',
  },
  'console.new.phrase': {
    plan: { subject: { concept: 'PHRASE', definiteness: 'bare', adjectives: ['NEW'] } } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'new phrase',
  },
  'console.new.clause': {
    plan: { subject: { concept: 'CLAUSE', definiteness: 'bare', adjectives: ['NEW'] } } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'new clause',
  },

  // The topics the commands are listed under, where no control's name already says it. The role
  // commands fill the period's own words, WORD plural with the period as its possessor ("the period's
  // words", it "le parole del periodo", de "die Wörter des Satzgefüges", ja 文の単語); it is also the
  // help page's part for them. The links between periods are the linked periods themselves, PERIOD
  // under LINKED ("linked periods", ja リンク済みの文); and `/new`, `/del` and `/edit` act on the period.
  'console.topic.words': {
    plan: {
      subject: {
        concept: 'WORD',
        number: 'plural',
        definiteness: 'definite',
        possessor: { concept: 'PERIOD_SENTENCE', definiteness: 'definite' },
      },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: "the period's words",
  },
  'console.topic.links': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', number: 'plural', definiteness: 'bare', adjectives: ['LINKED'] },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'linked periods',
  },
  'console.topic.period': {
    plan: { subject: { concept: 'PERIOD_SENTENCE', definiteness: 'definite' } } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'the period',
  },
  // `/in … /front` set how a place or a route stands to its noun: RELATIONSHIP under SPATIAL, "spatial
  // relationship" (it "relazione spaziale", de "räumliche Beziehung", ja 空間的な関係). Naming the two
  // complements instead would be "complemento di stato in luogo o complemento di moto per luogo".
  'console.topic.place': {
    plan: { subject: { concept: 'RELATIONSHIP', definiteness: 'bare', adjectives: ['SPATIAL'] } } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'spatial relationship',
  },
  // `/statement`, `/command` and `/inf` set the period's MOOD (it "modo", de "Modus", ja 叙法).
  'console.topic.mood': {
    plan: { subject: { concept: 'MOOD', definiteness: 'bare' } } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'mood',
  },
  // What `/save`, `/load`, `/export` … act on: the WORKSPACE, every period at once (it "area di lavoro",
  // fr "espace de travail", de "Arbeitsbereich", ja ワークスペース). Also the help overlay's part for them.
  'console.topic.workspace': {
    plan: { subject: { concept: 'WORKSPACE', definiteness: 'bare' } } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'workspace',
  },

  // The placeholders of a help page's usage line, where a command's argument goes: `/subj ( word … )`,
  // `/save name`, `/help [command]`. Bare nouns (it "parola", "nome", "comando"; de "Wort", "Name",
  // "Befehl"); the brackets, `#n.noun` and the value lists around them stay as written.
  'console.usage.word': { plan: nameOf('WORD'), format: { stripPeriod: true }, fallback: 'word' },
  'console.usage.name': { plan: nameOf('NAME_NOUN'), format: { stripPeriod: true }, fallback: 'name' },
  'console.usage.command': { plan: nameOf('COMMAND'), format: { stripPeriod: true }, fallback: 'command' },

  // What each command that acts on a word is for, after its description on its help page: "/pl · plural
  // — to set a noun's number" (B47). One key per distinct purpose, which the command names as its
  // `purposeKey`; commands that do the same thing share one (`/sg` and `/pl`, the seventeen determiners).
  // Each is the infinitive citation of `purposeOf`, lower-case and without its full stop, as a gloss
  // is. The console's misuse diagnostic still says the purpose in English ("/more sets an adjective’s
  // degree, and cat is a noun"): a sentence about the user's word is C21's.
  //
  // The five that add or link something put it on a goal, the verb's `terminus`: ADD's is "zu" +
  // dative in German, LINK's "mit" (de "eine andere Phrase mit einem Substantiv verbinden"), and
  // Japanese marks it に (名詞に所有者を加える). The instrument goes on *the* verb, the one a period has.
  'purpose.instrument': {
    plan: purposeOf(
      'ADD',
      { concept: 'INSTRUMENTAL', definiteness: 'indefinite' },
      { concept: 'VERB', definiteness: 'definite' },
    ),
    format: { stripPeriod: true },
    fallback: 'to add an instrumental to the verb',
  },
  'purpose.possessor': {
    plan: purposeOf(
      'ADD',
      { concept: 'POSSESSOR', definiteness: 'indefinite' },
      { concept: 'NOUN', definiteness: 'indefinite' },
    ),
    format: { stripPeriod: true },
    fallback: 'to add a possessor to a noun',
  },
  // `/than`'s: what the adjective is compared to, added to the adjective it hangs off (P09-E12 D5).
  'purpose.standard': {
    plan: purposeOf(
      'ADD',
      { concept: 'STANDARD_OF_COMPARISON', definiteness: 'indefinite' },
      { concept: 'ADJECTIVE', definiteness: 'indefinite' },
    ),
    format: { stripPeriod: true },
    fallback: 'to add a standard of comparison to an adjective',
  },
  'purpose.relative': {
    plan: purposeOf(
      'ADD',
      { concept: 'RELATIVE_CLAUSE', definiteness: 'indefinite' },
      { concept: 'NOUN', definiteness: 'indefinite' },
    ),
    format: { stripPeriod: true },
    fallback: 'to add a relative clause to a noun',
  },
  // `/headless` (P13): "to say only the relative clause", it "dire solo la proposizione relativa", ja
  // 関係節だけ言う.
  'purpose.headless': {
    plan: purposeOf('SAY', { concept: 'RELATIVE_CLAUSE', definiteness: 'definite', focus: 'only' }),
    format: { stripPeriod: true },
    fallback: 'to say only the relative clause',
  },
  // `/gloss` (P13), as the settings say theirs: "to set a noun's meaning", it "impostare il significato
  // di un sostantivo".
  'purpose.gloss': {
    plan: setterOf('MEANING', 'NOUN'),
    format: { stripPeriod: true },
    fallback: "to set a noun's meaning",
  },
  // `/owner`, `/whole`, `/parts` (P13): "to set a possessor's relationship", it "impostare la relazione di
  // un possessore".
  'purpose.possessorRole': {
    plan: setterOf('RELATIONSHIP', 'POSSESSOR'),
    format: { stripPeriod: true },
    fallback: "to set a possessor's relationship",
  },
  // `/objctl`, `/subjctl` (P13): whose the infinitive is — "to set an infinitive phrase's agent", it
  // "impostare l'agente di una frase infinitiva".
  'purpose.objectControl': {
    plan: setterOf('AGENT_GRAMMAR', 'INFINITIVE_PHRASE'),
    format: { stripPeriod: true },
    fallback: "to set an infinitive phrase's agent",
  },
  // `/as`, `/into` (P13): "to set an object complement's relationship", it "impostare la relazione di un
  // complemento predicativo dell'oggetto".
  'purpose.predication': {
    plan: setterOf('RELATIONSHIP', 'OBJECT_COMPLEMENT'),
    format: { stripPeriod: true },
    fallback: "to set an object complement's relationship",
  },
  // `/num` (P13): "to set a noun's quantity", it "impostare la quantità di un sostantivo" — not its
  // grammatical number, which `purpose.number` sets.
  'purpose.numeral': {
    plan: setterOf('QUANTITY', 'NOUN'),
    format: { stripPeriod: true },
    fallback: "to set a noun's quantity",
  },
  // `/if`: CONDITION, not the "conditional clause" its description names — de would read "einen
  // konditionalen Satz" for what its grammars call a Konditionalsatz (it "aggiungere una condizione a un
  // periodo", ja 文に条件を加える).
  'purpose.condition': {
    plan: purposeOf(
      'ADD',
      { concept: 'CONDITION', definiteness: 'indefinite' },
      { concept: 'PERIOD_SENTENCE', definiteness: 'indefinite' },
    ),
    format: { stripPeriod: true },
    fallback: 'to add a condition to a period',
  },
  // `/and` and `/or` join a phrase to a noun: LINK, not COORDINATE, whose Japanese 調整する is to adjust.
  'purpose.conjunct': {
    plan: purposeOf(
      'LINK',
      { concept: 'PHRASE', definiteness: 'indefinite', adjectives: ['OTHER'] },
      { concept: 'NOUN', definiteness: 'indefinite' },
    ),
    format: { stripPeriod: true },
    fallback: 'to link another phrase to a noun',
  },
  // `/join` links two periods, bare plural (it "collegare periodi", de "Satzgefüge verbinden", ja 文をつなぐ;
  // fr "relier des périodes", which spells no zero article).
  'purpose.join': {
    plan: purposeOf('LINK', { concept: 'PERIOD_SENTENCE', number: 'plural', definiteness: 'bare' }),
    format: { stripPeriod: true },
    fallback: 'to link periods',
  },
  // The word commands say what the word does, with the verb a grammar uses for it: an adjective
  // DESCRIBEs a noun, an adverb MODIFYs a verb or a modal (it "modificare un verbo o un verbo modale", ja
  // 動詞か法助動詞を修飾する), a modal GOVERNs a verb (it "reggere", de "regieren", ja 支配する).
  'purpose.adjective': {
    plan: purposeOf('DESCRIBE', { concept: 'NOUN', definiteness: 'indefinite' }),
    format: { stripPeriod: true },
    fallback: 'to describe a noun',
  },
  'purpose.adverb': {
    plan: purposeOf('MODIFY', {
      conjunction: 'or',
      conjuncts: [
        { concept: 'VERB', definiteness: 'indefinite' },
        { concept: 'MODAL', definiteness: 'indefinite' },
      ],
    }),
    format: { stripPeriod: true },
    fallback: 'to modify a verb or a modal',
  },
  'purpose.modal': {
    plan: purposeOf('GOVERN', { concept: 'VERB', definiteness: 'indefinite' }),
    format: { stripPeriod: true },
    fallback: 'to govern a verb',
  },
  // The setting commands (`setterOf`): SET — it "impostare", fr "définir", de "festlegen", ja 設定する —
  // on the setting of a word. Keyed by the console's Setting id, so a setting command finds its own.
  'purpose.number': {
    plan: setterOf('NUMBER_GRAMMAR', 'NOUN'),
    format: { stripPeriod: true },
    fallback: "to set a noun's number",
  },
  'purpose.gender': {
    plan: setterOf('GENDER', 'NOUN'),
    format: { stripPeriod: true },
    fallback: "to set a noun's gender",
  },
  // `/neut` is a pronoun's alone: a noun's gender control offers masculine and feminine only.
  'purpose.pronounGender': {
    plan: setterOf('GENDER', 'PRONOUN'),
    format: { stripPeriod: true },
    fallback: "to set a pronoun's gender",
  },
  'purpose.determiner': {
    plan: setterOf('DETERMINER', 'NOUN'),
    format: { stripPeriod: true },
    fallback: "to set a noun's determiner",
  },
  // `/in … /front` set the relation of a place or a route: RELATIONSHIP under SPATIAL, of a COMPLEMENT
  // (it "impostare la relazione spaziale di un complemento", de "die räumliche Beziehung einer Ergänzung
  // festlegen").
  'purpose.specifier': {
    plan: setterOf('RELATIONSHIP', 'COMPLEMENT_GRAMMAR', ['SPATIAL']),
    format: { stripPeriod: true },
    fallback: "to set a complement's spatial relationship",
  },
  // `/at /ago /until /after /before /during /span /since /within /lasting` set the temporal's relation (P09-E12b, E20, E27, E34, E35),
  // named the way the spatial one is, under TEMPORAL: "to set a complement's temporal relationship".
  'purpose.temporal': {
    plan: setterOf('RELATIONSHIP', 'COMPLEMENT_GRAMMAR', ['TEMPORAL']),
    format: { stripPeriod: true },
    fallback: "to set a complement's temporal relationship",
  },
  // `/because /fault /thanks` set the stance a cause is stated with, SENTIMENT (it "valutazione", de
  // "Bewertung", ja 評価). "How a cause is felt", the English it replaces, is an embedded question no plan
  // holds.
  'purpose.sentiment': {
    plan: setterOf('SENTIMENT', 'CAUSE_COMPLEMENT'),
    format: { stripPeriod: true },
    fallback: "to set a cause's sentiment",
  },
  'purpose.tense': {
    plan: setterOf('TENSE', 'VERB'),
    format: { stripPeriod: true },
    fallback: "to set a verb's tense",
  },
  'purpose.aspect': {
    plan: setterOf('ASPECT', 'VERB'),
    format: { stripPeriod: true },
    fallback: "to set a verb's aspect",
  },
  'purpose.voice': {
    plan: setterOf('VOICE', 'VERB'),
    format: { stripPeriod: true },
    fallback: "to set a verb's voice",
  },
  'purpose.polarity': {
    plan: setterOf('POLARITY', 'VERB'),
    format: { stripPeriod: true },
    fallback: "to set a verb's polarity",
  },
  // `/not` does more than set a value: it NEGATEs the verb (it "negare un verbo", de "ein Verb verneinen",
  // ja 動詞を否定する). French says it with the grammarians' nier, "nier un verbe" (see NEGATE).
  'purpose.negate': {
    plan: purposeOf('NEGATE', { concept: 'VERB', definiteness: 'indefinite' }),
    format: { stripPeriod: true },
    fallback: 'to negate a verb',
  },
  'purpose.degree': {
    plan: setterOf('DEGREE_GRAMMAR', 'ADJECTIVE'),
    format: { stripPeriod: true },
    fallback: "to set an adjective's degree",
  },
  // `/feature /purpose /material` set how a noun modifier relates to its noun, its RELATIONSHIP.
  // "How it relates" is the embedded question again.
  'purpose.relation': {
    plan: setterOf('RELATIONSHIP', 'MODIFIER'),
    format: { stripPeriod: true },
    fallback: "to set a modifier's relationship",
  },

  // ── The console's lines, history and pins (B45) ──
  // The pin a typed line wears in the transcript, and `/pin` / `/unpin` in the list and on their help
  // pages: PIN and UNPIN on the line, `this` because it is the one the pin sits on — "Pin this line",
  // it "Fissa questa riga", de "Diese Zeile anheften", ja この行をピン留め; "Unpin this line", it
  // "Sblocca questa riga", de "Diese Zeile lösen", ja この行をピン留め解除. That `/pin` alone pins the
  // line run before it is what its help page's example shows.
  'action.pinLine': {
    plan: { ...commandOf('PIN'), directObject: { concept: 'LINE', definiteness: 'this' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Pin this line',
  },
  'action.unpinLine': {
    plan: { ...commandOf('UNPIN'), directObject: { concept: 'LINE', definiteness: 'this' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Unpin this line',
  },
  // What pinning and unpinning leave in the transcript, said as `toast.phraseSaved` says a save: LINE
  // under PINNED or UNPINNED, "Pinned line", it "Riga fissata", de "Angeheftete Zeile", ja
  // ピン留め済みの行. UNPINNED is "no longer pinned" where UNPIN's participle would misread: it "Riga non
  // più fissata" (not "sbloccata", unlocked), de "Nicht mehr angeheftete Zeile" (not "gelöste", solved).
  'toast.linePinned': {
    plan: { subject: { concept: 'LINE', definiteness: 'bare', adjectives: ['PINNED'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Pinned line',
  },
  'toast.lineUnpinned': {
    plan: { subject: { concept: 'LINE', definiteness: 'bare', adjectives: ['UNPINNED'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Unpinned line',
  },
  // The tag the prompt wears while ↑ walks back through the lines run: HISTORY (it "cronologia", fr
  // "historique", de "Verlauf", ja 履歴). Where in it the walk is, is a value: the tag writes it after the
  // word in figures, "history · 3/7" (the C14 rule), which also spares every language the English "of".
  'console.history': { plan: nameOf('HISTORY'), format: { stripPeriod: true }, fallback: 'history' },
  // What an empty prompt's list says beside each line: PINNED or RECENT, agreeing with LINE — it
  // "fissata" / "recente", fr "épinglée" / "récente", de "angeheftet" / "zuletzt verwendet", ja
  // ピン留め済み / 最近使用された.
  'console.line.pinned': { word: 'PINNED', agreesWith: 'LINE', format: { stripPeriod: true }, fallback: 'pinned' },
  'console.line.recent': { word: 'RECENT', agreesWith: 'LINE', format: { stripPeriod: true }, fallback: 'recent' },
  // The prompt's key hints: ⇥ completes the word begun, ↵ applies the line, esc closes the list. Bare
  // commands, lower-case like `slot.choose` beside its keycap — it "completa", "applica", "chiudi
  // l'elenco"; de "vervollständigen", "anwenden", "die Liste schließen"; ja 補完, 適用, 一覧を閉じる. The
  // list is definite: it is the one open above the prompt.
  'action.complete': { plan: commandOf('COMPLETE'), format: { stripPeriod: true }, fallback: 'complete' },
  'action.apply': { plan: commandOf('APPLY'), format: { stripPeriod: true }, fallback: 'apply' },
  'action.closeList': {
    plan: { ...commandOf('CLOSE'), directObject: { concept: 'LIST', definiteness: 'definite' } } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'close the list',
  },

  // ── The console's reference: its moods, degrees and labels (B46) ──
  // What `/statement` sets, named as `/command` and `/inf` name theirs (`imperative.command`,
  // `infinitive.phrase`): the STATEMENT, the clause that asserts, as each school grammar names it
  // beside the question and the command — it "Proposizione enunciativa", fr "Phrase déclarative", de
  // "Aussagesatz", es "Oración enunciativa", ja 平叙文.
  'mood.statement': { plan: nameOf('STATEMENT'), format: NAME_FORMAT, fallback: 'Statement' },
  // What `/ask` sets and the border's third mood toggle is named by (P09-E12 M5): the QUESTION, beside
  // the statement and the command — it "Domanda", fr "Question", de "Frage", ja 質問.
  'mood.question': { plan: nameOf('QUESTION'), format: NAME_FORMAT, fallback: 'Question' },
  // The who / what chip on a marked subject or object ring (P09-E12 M6): the question itself, asked of
  // a subject gap on ACT, the most general act — "Who acts?" / "What acts?", it "Chi agisce?" / "Che
  // cosa agisce?", fr "Qui agit ?" / "Qu'est-ce qui agit ?", ja 「誰が行動しますか？」. The engine's own
  // wh-question, so each language says its own question word the way it asks with it.
  'question.who': {
    plan: {
      subject: { concept: 'GENERIC_PERSON' },
      verbPhrase: { verb: 'ACT' },
      questionRole: 'subject',
      questionAnimate: true,
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Who acts?',
  },
  'question.what': {
    plan: { subject: { concept: 'GENERIC_PERSON' }, verbPhrase: { verb: 'ACT' }, questionRole: 'subject' } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'What acts?',
  },
  // The existential toggle on the subject's ring (P09-E12 M7): the engine's own existential of
  // SOMETHING — "There is something", it "C'è qualcosa", fr "Il y a quelque chose", de "Es gibt
  // etwas", es "Hay algo", pt "Há algo", ja 「何かがあります」.
  'existential.toggle': {
    plan: { subject: { concept: 'SOMETHING' }, verbPhrase: { verb: 'BE' }, existential: true } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'There is something',
  },
  // What `/plain` sets: the POSITIVE_DEGREE, an adjective compared with nothing (it "Grado positivo", de
  // "Positiv", pt "Grau normal", ja 原級). A noun of its own: `degree.value.positive` cites the degree on
  // an adjective, where the positive adds nothing ("—"), and POSITIVE is the polarity (ja 肯定).
  'degree.name.positive': { plan: nameOf('POSITIVE_DEGREE'), format: NAME_FORMAT, fallback: 'Positive degree' },
  // A completion row's note of what a setting holds now: NOW, the value after it, already in the
  // interface language ("now singular", it "ora", de "jetzt"). Japanese 今, since 現在 is the present
  // tense's own name.
  'console.now': { word: 'NOW', format: { stripPeriod: true }, fallback: 'now' },
  // The other names a command answers to, on its row ("alias /plural") and on its help page: ALIAS, then
  // the names. A noun, not the adverb "also", which Japanese has no word for standing alone (も is a
  // particle, また is "again"); ja 別名, "another name". One key per number, as a page lists every alias —
  // "aliases /positive /affirmative", de "Aliasse"; the Romance "alias" is invariable.
  'console.alias.singular': { plan: nameOf('ALIAS'), format: { stripPeriod: true }, fallback: 'alias' },
  'console.alias.plural': {
    plan: { subject: { concept: 'ALIAS', number: 'plural', definiteness: 'bare' } } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'aliases',
  },
  // A help page's two labels, each before a colon: how the command is written, USAGE (it "Uso", fr
  // "Utilisation", de "Verwendung", ja 使用法), and its EXAMPLE (it "Esempio", de "Beispiel", ja 例).
  'console.help.usage': { plan: nameOf('USAGE'), format: NAME_FORMAT, fallback: 'Usage' },
  'console.help.example': { plan: nameOf('EXAMPLE'), format: NAME_FORMAT, fallback: 'Example' },

  // ── What the console says is wrong with a line (localization C21) ──
  // A diagnostic is a code and the values it names (packages/frontend/src/console/language/diagnostics.ts),
  // said as one or two of these, each followed by its value after a colon, outside the phrase (the C14
  // rule): a command name, a period number, a reference, the user's word as the pickers show it, or a
  // line of the console's syntax. "Unknown command: /frob", it "Comando sconosciuto: /frob", de
  // "Unbekannter Befehl: /frob", ja 「不明な命令: /frob」. Several are joined by the interface language's
  // full stop. So each entry is a name or a sentence without its own full stop, capitalized.
  //
  // No sentence here is about the user's word *as its subject*: the word follows the colon instead
  // ("This word is a noun: cat", it "Questa parola è un sostantivo: gatto"), so no sentence has to agree
  // with it and none is rendered on request (the translate route C16 uses). Syntax, command names and
  // references stay as the console writes them in every language (P02's decision 3).

  // What is not there, said as a noun phrase: what is missing or unknown, with its name after it. The
  // existential "there is no …" is a clause no plan holds (c'è, il y a, es gibt + accusative, hay, há,
  // ja ある / いる by animacy), so none is built: MISSING (C14) and UNKNOWN say the same thing of the
  // noun. Japanese reads 見つからない ("cannot be found") and 不明な, what its software writes.
  'diagnostic.unknownCommand': {
    plan: { subject: { concept: 'COMMAND', definiteness: 'bare', adjectives: ['UNKNOWN'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Unknown command',
  },
  'diagnostic.unknownWord': {
    plan: { subject: { concept: 'WORD', definiteness: 'bare', adjectives: ['UNKNOWN'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Unknown word',
  },
  'diagnostic.unknownValue': {
    plan: { subject: { concept: 'VALUE', definiteness: 'bare', adjectives: ['UNKNOWN'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Unknown value',
  },
  // A reference's step that names no noun: `#2.foo`, `#2.subj.foo` (it "Sostantivo sconosciuto", ja 不明な名詞).
  'diagnostic.unknownNoun': {
    plan: { subject: { concept: 'NOUN', definiteness: 'bare', adjectives: ['UNKNOWN'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Unknown noun',
  },
  // `/load` with a name no saved phrase has. Not "unknown saved phrase": two adjectives on one noun
  // coordinate in five languages (it "frase sconosciuta e salvata"), and `/load` lists saved ones anyway.
  'diagnostic.unknownPhrase': {
    plan: { subject: { concept: 'PHRASE', definiteness: 'bare', adjectives: ['UNKNOWN'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Unknown phrase',
  },
  'diagnostic.missingPeriod': {
    plan: { subject: { concept: 'PERIOD_SENTENCE', definiteness: 'bare', adjectives: ['MISSING'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Missing period',
  },
  'diagnostic.missingNoun': {
    plan: { subject: { concept: 'NOUN', definiteness: 'bare', adjectives: ['MISSING'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Missing noun',
  },
  // A box with no word in it (`#2.subj` as a relative clause's gap), or no word before a command that
  // describes one. The noun and adjective of `toast.missingWords.singular`, capitalized.
  'diagnostic.missingWord': {
    plan: { subject: { concept: 'WORD', definiteness: 'bare', adjectives: ['MISSING'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Missing word',
  },
  // `/del adj 2`, `/del modal 2`, `/del and 3`, past the last one there is. CONJUNCT, the grammar's name
  // for one noun of a coordinated group (it "Congiunto mancante", es "Miembro coordinado faltante").
  'diagnostic.missingAdjective': {
    plan: { subject: { concept: 'ADJECTIVE', definiteness: 'bare', adjectives: ['MISSING'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Missing adjective',
  },
  'diagnostic.missingModal': {
    plan: { subject: { concept: 'MODAL', definiteness: 'bare', adjectives: ['MISSING'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Missing modal',
  },
  'diagnostic.missingConjunct': {
    plan: { subject: { concept: 'CONJUNCT', definiteness: 'bare', adjectives: ['MISSING'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Missing conjunct',
  },
  // A token the parser meets where nothing of its kind can stand: UNEXPECTED on what it is (it "Parentesi
  // inattesa", de "Unerwartete Klammer", ja 予期しない括弧). The token is marked in the line, so no value
  // follows.
  'diagnostic.unexpectedText': {
    plan: { subject: { concept: 'TEXT', definiteness: 'bare', adjectives: ['UNEXPECTED'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Unexpected text',
  },
  'diagnostic.unexpectedBracket': {
    plan: { subject: { concept: 'BRACKET', definiteness: 'bare', adjectives: ['UNEXPECTED'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Unexpected bracket',
  },
  'diagnostic.unexpectedReference': {
    plan: { subject: { concept: 'REFERENCE', definiteness: 'bare', adjectives: ['UNEXPECTED'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Unexpected reference',
  },
  'diagnostic.unexpectedWord': {
    plan: { subject: { concept: 'WORD', definiteness: 'bare', adjectives: ['UNEXPECTED'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Unexpected word',
  },

  // What a command or a verb takes: ACCEPT, the licensing sense (it "accettare", de "akzeptieren", ja
  // 受け付ける), under the `no` determiner — "This command accepts no word: /pl", it "Questo comando non
  // accetta nessuna parola", fr "Cette commande n'accepte aucun mot", ja この命令はどの単語も受け付けません.
  // The command or the verb cannot be the subject (a command name is a token, not a concept), so the
  // subject is `this` command, this verb, and the name follows the colon. Not the negated verb with an
  // indefinite object: German says "akzeptiert ein Wort nicht" where it means "kein Wort".
  'diagnostic.commandAcceptsNoWord': {
    plan: {
      subject: { concept: 'COMMAND', definiteness: 'this' },
      verbPhrase: { verb: 'ACCEPT' },
      directObject: { concept: 'WORD', definiteness: 'no' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'This command accepts no word',
  },
  // A command that takes one value, given a second: HAVE with ALREADY, whose `frequency` subtype puts it
  // before the verb in English — "This command already has a value: process", it "Questo comando ha già
  // un valore", de "Dieser Befehl hat schon einen Wert", ja この命令は値がもうあります.
  'diagnostic.commandHasValue': {
    plan: {
      subject: { concept: 'COMMAND', definiteness: 'this' },
      verbPhrase: { verb: 'HAVE', modifier: 'ALREADY' },
      directObject: { concept: 'VALUE', definiteness: 'indefinite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'This command already has a value',
  },
  // A verb that does not license the box a role command names, one entry per box, keyed by the slot so
  // the console can write t(`diagnostic.verbAcceptsNo.${slot}`); the verb follows the colon in the
  // interface language ("This verb accepts no object: run", it "Questo verbo non accetta nessun
  // complemento oggetto: correre"). Each box by the grammar noun its canvas box is titled with.
  ...Object.fromEntries(
    (
      [
        ['directObject', 'OBJECT_GRAMMAR', 'object'],
        ['predicative', 'SUBJECT_COMPLEMENT', 'subject complement'],
        ['terminus', 'TERMINUS', 'terminus'],
        ['manner', 'ADVERBIAL_OF_MANNER', 'adverbial of manner'],
        ['locative', 'LOCATIVE', 'locative'],
        ['direction', 'DIRECTION', 'direction'],
        ['source', 'SOURCE', 'source'],
        ['route', 'ROUTE', 'route'],
        // The one licensed box of P09-E12b's three: the temporal and the purpose go with any verb.
        ['topic', 'TOPIC_COMPLEMENT', 'topic'],
        ['cause', 'CAUSE_COMPLEMENT', 'cause'],
        ['instrumental', 'INSTRUMENTAL', 'instrumental'],
        // P13: a verb with no object has nothing to take as something (the comitative goes with any).
        ['objectPredicative', 'OBJECT_COMPLEMENT', 'object complement'],
      ] as const
    ).map(([slot, concept, en]) => [
      `diagnostic.verbAcceptsNo.${slot}`,
      {
        plan: {
          subject: { concept: 'VERB', definiteness: 'this' },
          verbPhrase: { verb: 'ACCEPT' },
          directObject: { concept, definiteness: 'no' },
        } as PhrasePlan,
        format: NAME_FORMAT,
        fallback: `This verb accepts no ${en}`,
      },
    ]),
  ) as Record<
    `diagnostic.verbAcceptsNo.${'directObject' | 'predicative' | 'terminus' | 'manner' | 'locative' | 'direction' | 'source' | 'route' | 'topic' | 'cause' | 'instrumental' | 'objectPredicative'}`,
    UiStringPlanDef
  >,
  // A verb that takes no clause as its object (P09-E12 D9): `/clause` on one whose `clauseObject` is
  // not `content`, `/to` on one whose is not `infinitive` — the subordinate clause and the infinitive
  // phrase by the grammar nouns the canvas names them with.
  'diagnostic.verbAcceptsNo.contentClause': {
    plan: {
      subject: { concept: 'VERB', definiteness: 'this' },
      verbPhrase: { verb: 'ACCEPT' },
      directObject: { concept: 'CLAUSE', definiteness: 'no', adjectives: ['SUBORDINATE'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'This verb accepts no subordinate clause',
  },
  'diagnostic.verbAcceptsNo.infinitive': {
    plan: {
      subject: { concept: 'VERB', definiteness: 'this' },
      verbPhrase: { verb: 'ACCEPT' },
      directObject: { concept: 'INFINITIVE_PHRASE', definiteness: 'no' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'This verb accepts no infinitive phrase',
  },
  // A period that cannot be linked so: a command, an infinitive, an if-clause or a coordinated period
  // takes no condition (it "Questo periodo non accetta nessuna condizione", ja この文はどの条件も受け付けません).
  'diagnostic.periodAcceptsNoCondition': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
      verbPhrase: { verb: 'ACCEPT' },
      directObject: { concept: 'CONDITION', definiteness: 'no' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'This period accepts no condition',
  },
  'diagnostic.periodAcceptsNoCoordination': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
      verbPhrase: { verb: 'ACCEPT' },
      directObject: { concept: 'COORDINATION', definiteness: 'no' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'This period accepts no coordination',
  },
  'diagnostic.periodAcceptsNoSubordinate': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
      verbPhrase: { verb: 'ACCEPT' },
      directObject: { concept: 'CLAUSE', definiteness: 'no', adjectives: ['SUBORDINATE'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'This period accepts no subordinate clause',
  },

  // `/del` with nothing of its kind in reach: HAVE with a `no` subject — "No noun has an adjective", it
  // "Nessun sostantivo ha un aggettivo", fr "Aucun nom n'a d'adjectif", ja どの名詞も形容詞がありません —
  // or, for what a period or its verb has, a `no` object ("This period has no condition", de "Dieses
  // Satzgefüge hat keine Bedingung"). The English "here" and "to remove" are gone: an adverb of place has
  // no Japanese that stands before a verb unmarked (ここ needs で), and "an adjective to remove" is an
  // infinitival relative, which PhrasePlan.purpose would say as an aim (it "per rimuovere", not "da").
  'diagnostic.noNounHasAdjective': {
    plan: {
      subject: { concept: 'NOUN', definiteness: 'no' },
      verbPhrase: { verb: 'HAVE' },
      directObject: { concept: 'ADJECTIVE', definiteness: 'indefinite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'No noun has an adjective',
  },
  'diagnostic.noVerbHasAdverb': {
    plan: {
      subject: { concept: 'VERB', definiteness: 'no' },
      verbPhrase: { verb: 'HAVE' },
      directObject: { concept: 'ADVERB', definiteness: 'indefinite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'No verb has an adverb',
  },
  'diagnostic.noNounHasPossessor': {
    plan: {
      subject: { concept: 'NOUN', definiteness: 'no' },
      verbPhrase: { verb: 'HAVE' },
      directObject: { concept: 'POSSESSOR', definiteness: 'indefinite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'No noun has a possessor',
  },
  // `/del than` with no standard of comparison to take off (P09-E12 D5): only an adjective has one.
  'diagnostic.noAdjectiveHasStandard': {
    plan: {
      subject: { concept: 'ADJECTIVE', definiteness: 'no' },
      verbPhrase: { verb: 'HAVE' },
      directObject: { concept: 'STANDARD_OF_COMPARISON', definiteness: 'indefinite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'No adjective has a standard of comparison',
  },
  'diagnostic.noNounHasRelative': {
    plan: {
      subject: { concept: 'NOUN', definiteness: 'no' },
      verbPhrase: { verb: 'HAVE' },
      directObject: { concept: 'RELATIVE_CLAUSE', definiteness: 'indefinite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'No noun has a relative clause',
  },
  // `/del and` with no coordinated noun: BE on COORDINATED, the canvas's adjective for it (it "Nessun
  // sostantivo è coordinato", de "Kein Substantiv ist beigeordnet").
  'diagnostic.noNounIsCoordinated': {
    plan: {
      subject: { concept: 'NOUN', definiteness: 'no' },
      verbPhrase: { verb: 'BE' },
      complements: { predicative: { phrase: { concept: 'COORDINATED' } } },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'No noun is coordinated',
  },
  // `/del modal` on a verb with none: the period has one verb, so it is definite ("Il verbo non ha nessun
  // verbo modale", ja 動詞はどの法助動詞もありません).
  'diagnostic.verbHasNoModal': {
    plan: {
      subject: { concept: 'VERB', definiteness: 'definite' },
      verbPhrase: { verb: 'HAVE' },
      directObject: { concept: 'MODAL', definiteness: 'no' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'The verb has no modal',
  },
  // `/del if`, `/del join`, `/del inst` and `/level` on a period without the link, keyed by the link's
  // name in the console (condition, join, instrument): "This period has no condition", it "Questo periodo
  // non ha nessuna condizione", ja この文はどの条件もありません.
  'diagnostic.periodHasNo.condition': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
      verbPhrase: { verb: 'HAVE' },
      directObject: { concept: 'CONDITION', definiteness: 'no' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'This period has no condition',
  },
  'diagnostic.periodHasNo.join': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
      verbPhrase: { verb: 'HAVE' },
      directObject: { concept: 'COORDINATION', definiteness: 'no' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'This period has no coordination',
  },
  // `/del clause`, `/del sub` and `/del to` on a period without the subordinate clause (P09-E12 D9).
  'diagnostic.periodHasNo.subordinate': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
      verbPhrase: { verb: 'HAVE' },
      directObject: { concept: 'CLAUSE', definiteness: 'no', adjectives: ['SUBORDINATE'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'This period has no subordinate clause',
  },
  // `/clause` on a period whose verb already has its object: the content clause *is* the object, so
  // the two exclude each other (P09-E12 D9) — "This period has an object", ja この文は目的語があります.
  'diagnostic.periodHasObject': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
      verbPhrase: { verb: 'HAVE' },
      directObject: { concept: 'OBJECT_GRAMMAR', definiteness: 'indefinite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'This period has an object',
  },
  'diagnostic.periodHasNo.instrument': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
      verbPhrase: { verb: 'HAVE' },
      directObject: { concept: 'INSTRUMENTAL', definiteness: 'no' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'This period has no instrumental',
  },
  // `/headless` or `/del headless` on a noun that heads no relative clause (P13): "This noun has no
  // relative clause", it "Questo sostantivo non ha nessuna proposizione relativa".
  'diagnostic.nounHasNo.relative': {
    plan: {
      subject: { concept: 'NOUN', definiteness: 'this' },
      verbPhrase: { verb: 'HAVE' },
      directObject: { concept: 'RELATIVE_CLAUSE', definiteness: 'no' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'This noun has no relative clause',
  },
  // An instrument held as a thing is a noun phrase, and the period linked as one has a verb: `that`
  // period, the other end of the link (it "Quel periodo ha un verbo", de "Jenes Satzgefüge hat ein Verb").
  'diagnostic.thatPeriodHasVerb': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', definiteness: 'that' },
      verbPhrase: { verb: 'HAVE' },
      directObject: { concept: 'VERB', definiteness: 'indefinite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'That period has a verb',
  },

  // What a period is, where its mood refuses a link: "This period is a command", it "Questo periodo è un
  // comando", de "Dieses Satzgefüge ist ein Befehl", ja この文は命令です; the statement is `mood.statement`'s
  // STATEMENT (de "ein Aussagesatz", ja 平叙文).
  'diagnostic.periodIsCommand': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
      verbPhrase: { verb: 'BE' },
      complements: { predicative: { phrase: { concept: 'COMMAND', definiteness: 'indefinite' } } },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'This period is a command',
  },
  'diagnostic.periodIsStatement': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
      verbPhrase: { verb: 'BE' },
      complements: { predicative: { phrase: { concept: 'STATEMENT', definiteness: 'indefinite' } } },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'This period is a statement',
  },
  // The third mood, where a link cannot take a question — an if-clause or a subordinate clause asks
  // nothing (A268): `mood.question`'s QUESTION ("This period is a question", it "Questo periodo è una
  // domanda").
  'diagnostic.periodIsQuestion': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
      verbPhrase: { verb: 'BE' },
      complements: { predicative: { phrase: { concept: 'QUESTION', definiteness: 'indefinite' } } },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'This period is a question',
  },
  // A period already in another link between periods: LINKED, the topic's adjective, with ALREADY (it
  // "Quel periodo è già collegato", fr "Cette période est déjà liée", ja その文はもうリンク済みです).
  'diagnostic.periodAlreadyLinked': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', definiteness: 'that' },
      verbPhrase: { verb: 'BE', modifier: 'ALREADY' },
      complements: { predicative: { phrase: { concept: 'LINKED' } } },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'That period is already linked',
  },
  // A noun already the gap of another relative clause, said from the clause's side, since "gap" is no
  // word the corpus has: "Another relative clause already has this noun: #2.subj", it "Un'altra
  // proposizione relativa ha già questo sostantivo", de "Ein anderer Relativsatz hat schon dieses Substantiv".
  'diagnostic.nounAlreadyTaken': {
    plan: {
      subject: { concept: 'RELATIVE_CLAUSE', definiteness: 'indefinite', adjectives: ['OTHER'] },
      verbPhrase: { verb: 'HAVE', modifier: 'ALREADY' },
      directObject: { concept: 'NOUN', definiteness: 'this' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Another relative clause already has this noun',
  },

  // What kind of word the closest one is, where a command cannot take it: the word follows the colon,
  // in the interface language, so nothing agrees with it — "This word is a noun: cat", it "Questa parola
  // è un sostantivo: gatto", fr "Ce mot est un nom : chat", ja この単語は名詞です: 猫. Keyed by the kind
  // the console names (`WordKindName`); a noun used as a modifier is MODIFIER ("a modifier").
  ...Object.fromEntries(
    (
      [
        ['noun', 'NOUN', 'a noun'],
        ['pronoun', 'PRONOUN', 'a pronoun'],
        ['adjective', 'ADJECTIVE', 'an adjective'],
        ['nounModifier', 'MODIFIER', 'a modifier'],
        ['verb', 'VERB', 'a verb'],
        ['modal', 'MODAL', 'a modal'],
        ['adverb', 'ADVERB', 'an adverb'],
      ] as const
    ).map(([kind, concept, en]) => [
      `diagnostic.wordIs.${kind}`,
      {
        plan: {
          subject: { concept: 'WORD', definiteness: 'this' },
          verbPhrase: { verb: 'BE' },
          complements: { predicative: { phrase: { concept, definiteness: 'indefinite' } } },
        } as PhrasePlan,
        format: NAME_FORMAT,
        fallback: `This word is ${en}`,
      },
    ]),
  ) as Record<
    `diagnostic.wordIs.${'noun' | 'pronoun' | 'adjective' | 'nounModifier' | 'verb' | 'modal' | 'adverb'}`,
    UiStringPlanDef
  >,
  // A command's help page, from a cursor on no word: BE with the CURSOR as a `locative` under the `under`
  // specifier — "No word is under the cursor", it "Nessuna parola è sotto il cursore", de "Kein Wort ist
  // unter dem Cursor", ja どの単語もカーソルの下にありません.
  'diagnostic.noWordUnderCursor': {
    plan: {
      subject: { concept: 'WORD', definiteness: 'no' },
      verbPhrase: { verb: 'BE' },
      complements: {
        locative: { phrase: { concept: 'CURSOR', definiteness: 'definite' }, specifiers: [{ kind: 'path', value: 'under' }] },
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'No word is under the cursor',
  },
  // …and on a word the command cannot act on, which follows the colon: "This word does not accept the
  // command: cat", it "Questa parola non accetta il comando", ja この単語は命令を受け付けません. The
  // command is definite, the one the page is about.
  'diagnostic.wordRefusesCommand': {
    plan: {
      subject: { concept: 'WORD', definiteness: 'this' },
      verbPhrase: { verb: 'ACCEPT', negative: true },
      directObject: { concept: 'COMMAND', definiteness: 'definite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'This word does not accept the command',
  },

  // What to do, where the console knows: an instruction (`commandOf`, the register the app's hints are
  // in — it "Chiudi la parentesi", fr "Fermer la parenthèse", de "Die Klammer schließen", ja 括弧を閉じる),
  // with the line to write after the colon: "Close the bracket: /subj ( … )".
  'diagnostic.closeBracket': {
    plan: { ...commandOf('CLOSE'), directObject: { concept: 'BRACKET', definiteness: 'definite' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Close the bracket',
  },
  // A word before its own bracket, a command past a closed one: MOVE it, where the line after the colon
  // shows (it "Sposta la parola: /subj ( gatto … )", de "Den Befehl verschieben", ja 命令を移動).
  'diagnostic.moveWord': {
    plan: { ...commandOf('MOVE'), directObject: { concept: 'WORD', definiteness: 'definite' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Move the word',
  },
  'diagnostic.moveCommand': {
    plan: { ...commandOf('MOVE'), directObject: { concept: 'COMMAND', definiteness: 'definite' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Move the command',
  },
  // `/rel subj` with no braces: OPEN a new CLAUSE (it "Apri una nuova proposizione", de "Einen neuen Satz
  // öffnen", ja 新しい節を開く).
  'diagnostic.openClause': {
    plan: {
      ...commandOf('OPEN'),
      directObject: { concept: 'CLAUSE', definiteness: 'indefinite', adjectives: ['NEW'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Open a new clause',
  },
  // A bracket with no command before it: a command opens a bracket, its object-level instrumental (it
  // "Apri una parentesi con un comando", de "Eine Klammer mit einem Befehl öffnen", ja 命令で括弧を開く).
  'diagnostic.openBracketWithCommand': {
    plan: {
      ...commandOf('OPEN'),
      directObject: { concept: 'BRACKET', definiteness: 'indefinite' },
      complements: {
        instrumental: {
          phrase: { concept: 'COMMAND', definiteness: 'indefinite' },
          specifiers: [{ kind: 'abstraction', value: 'object' }],
        },
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Open a bracket with a command',
  },
  // A line that begins with a word: TYPE a command (the `console.placeholder` verb; it "Digita un
  // comando", ja 命令を入力). Not "start the line with a command": fr "commencer … avec" wants "par".
  'diagnostic.typeCommand': {
    plan: { ...commandOf('TYPE'), directObject: { concept: 'COMMAND', definiteness: 'indefinite' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Type a command',
  },
  // A slash with no name: CHOOSE one in the LIST the slash opened, its `locative` (it "Scegli un comando
  // nell'elenco", de "Einen Befehl in der Liste wählen", ja 一覧で命令を選び).
  'diagnostic.chooseCommand': {
    plan: {
      ...commandOf('CHOOSE'),
      directObject: { concept: 'COMMAND', definiteness: 'indefinite' },
      complements: { locative: { phrase: { concept: 'LIST', definiteness: 'definite' } } },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Choose a command in the list',
  },
  // A command waiting for what it names, or given the wrong one: CHOOSE it, with what it can be after
  // the colon — "Choose a period: #2, #2.obj", "Choose a value: past, present, future", it "Scegli un
  // valore", de "Einen Wert wählen", ja 値を選び. CHOOSE, not NAME, whose seeded sense is to give a name to.
  'diagnostic.choosePeriod': {
    plan: { ...commandOf('CHOOSE'), directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'indefinite' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Choose a period',
  },
  // A link that cannot go where it was pointed: the period itself, one that leads back to this one (the
  // link would go round in a circle), one in another link. OTHER, as `purpose.conjunct` has it (it
  // "Scegli un altro periodo", de "Ein anderes Satzgefüge wählen", ja 別の文を選び).
  'diagnostic.chooseOtherPeriod': {
    plan: {
      ...commandOf('CHOOSE'),
      directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'indefinite', adjectives: ['OTHER'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Choose another period',
  },
  'diagnostic.chooseNoun': {
    plan: { ...commandOf('CHOOSE'), directObject: { concept: 'NOUN', definiteness: 'indefinite' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Choose a noun',
  },
  // A possessor that points at a noun: of its own period, the `locative` `this` (it "Scegli un sostantivo
  // in questo periodo", ja この文で名詞を選び). Not the period as the noun's possessor: English turns an
  // indefinite head with a genitive into "this period's noun", which says there is only one.
  'diagnostic.chooseNounInPeriod': {
    plan: {
      ...commandOf('CHOOSE'),
      directObject: { concept: 'NOUN', definiteness: 'indefinite' },
      complements: { locative: { phrase: { concept: 'PERIOD_SENTENCE', definiteness: 'this' } } },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Choose a noun in this period',
  },
  // A possessor pointing at its own noun, or a part of it.
  'diagnostic.chooseOtherNoun': {
    plan: {
      ...commandOf('CHOOSE'),
      directObject: { concept: 'NOUN', definiteness: 'indefinite', adjectives: ['OTHER'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Choose another noun',
  },
  'diagnostic.chooseRelativeClause': {
    plan: { ...commandOf('CHOOSE'), directObject: { concept: 'RELATIVE_CLAUSE', definiteness: 'indefinite' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Choose a relative clause',
  },
  'diagnostic.chooseValue': {
    plan: { ...commandOf('CHOOSE'), directObject: { concept: 'VALUE', definiteness: 'indefinite' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Choose a value',
  },
  'diagnostic.chooseConjunction': {
    plan: { ...commandOf('CHOOSE'), directObject: { concept: 'CONJUNCTION', definiteness: 'indefinite' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Choose a conjunction',
  },
  // A label two words share: the ids tell them apart, after the colon ("Choose a word: CRY, CRY_OUT").
  'diagnostic.chooseWord': {
    plan: { ...commandOf('CHOOSE'), directObject: { concept: 'WORD', definiteness: 'indefinite' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Choose a word',
  },
  // An object, a complement or an instrument hangs off the verb: a period without one needs it first.
  'diagnostic.chooseVerb': {
    plan: { ...commandOf('CHOOSE'), directObject: { concept: 'VERB', definiteness: 'indefinite' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Choose a verb',
  },
  // An instrument held as a thing: the other `/level`s make it an act (it "Scegli un livello", ja
  // 段階を選び), and a verb in a period held so needs its LEVEL changed (it "Cambia il livello", de "Die
  // Ebene ändern").
  'diagnostic.chooseLevel': {
    plan: { ...commandOf('CHOOSE'), directObject: { concept: 'LEVEL', definiteness: 'indefinite' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Choose a level',
  },
  'diagnostic.changeLevel': {
    plan: { ...commandOf('CHANGE'), directObject: { concept: 'LEVEL', definiteness: 'definite' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Change the level',
  },
  // `/del` with nothing in hand: what it can remove, a word or the period, `/del`'s own REMOVE (it
  // "Rimuovi una parola o il periodo", de "Ein Wort oder das Satzgefüge entfernen", ja 単語か文を取り除き).
  'diagnostic.removeWordOrPeriod': {
    plan: {
      ...commandOf('REMOVE'),
      directObject: {
        conjunction: 'or',
        conjuncts: [
          { concept: 'WORD', definiteness: 'indefinite' },
          { concept: 'PERIOD_SENTENCE', definiteness: 'definite' },
        ],
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Remove a word or the period',
  },
  // A mood the period's links fix: they go first (it "Rimuovi la condizione o la coordinazione", ja
  // 条件か等位接続を取り除き). The explanation — "which fixes its mood" — is a non-restrictive relative no
  // plan holds, and the instruction says what it would have led to.
  'diagnostic.removeConditionOrCoordination': {
    plan: {
      ...commandOf('REMOVE'),
      directObject: {
        conjunction: 'or',
        conjuncts: [
          { concept: 'CONDITION', definiteness: 'definite' },
          { concept: 'COORDINATION', definiteness: 'definite' },
        ],
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Remove the condition or the coordination',
  },
  // A command's help page says what the command would act on at the cursor: the word under it, after
  // the CURSOR's name, and the value it holds now — "Cursor: cat · now singular", it "Cursore: gatto ·
  // ora singolare", ja 「カーソル: 猫 · 今 単数」. Not "Here": HERE has no Japanese that stands before a
  // verb unmarked (ここ needs で), so it is not seeded for a label alone.
  'console.help.cursor': { plan: nameOf('CURSOR'), format: NAME_FORMAT, fallback: 'Cursor' },

  // The controls that act on one named part of the canvas — a word's clear button, a satellite's
  // show / hide control, a ring's expand / compact toggle. Each is a command whose object is the
  // part's own grammar noun, the one its box is titled with. That noun has to sit *inside* the plan,
  // not be glued on after it, to take the article and case its language gives it (de "**den**
  // Instrumental löschen", it "cancella **l'**aggettivo"); and a plan takes no arguments. So each
  // control is a family of keys, one per part, keyed `<action>.<part>` so a call site can write
  // t(`action.clear.${part}`). Definite: the part is the one right there on the canvas.
  //
  // "Collapse" is COMPACT, as the period header already pairs it with EXPAND: the seeded COLLAPSE is
  // the intransitive "fall down".
  ...commandOnEach('action.clear', 'CLEAR', 'Clear', CLEARABLE_PARTS),
  ...commandOnEach('action.show', 'SHOW', 'Show', REVEALABLE_PARTS),
  ...commandOnEach('action.hide', 'HIDE', 'Hide', REVEALABLE_PARTS),
  ...commandOnEach('action.expand', 'EXPAND', 'Expand', COLLAPSIBLE_PARTS),
  ...commandOnEach('action.compact', 'COMPACT', 'Compact', COLLAPSIBLE_PARTS),
  // A complement ring's remove button, which drops the complement from the clause.
  ...commandOnEach('action.remove', 'REMOVE', 'Remove', REMOVABLE_PARTS),
  // The same remove on whichever complement the cursor is in (⇧⌫), and the verb's + menu that adds one,
  // named by the grammar noun rather than by one complement: the key works on all of them. Definite for
  // the complement already there ("rimuovi il complemento", de "die Ergänzung entfernen"), indefinite
  // for the one the menu has yet to pick ("aggiungi un complemento", ja 補語を追加).
  'action.removeComplement': {
    plan: {
      ...commandOf('REMOVE'),
      directObject: { concept: 'COMPLEMENT_GRAMMAR', definiteness: 'definite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Remove the complement',
  },
  'action.addComplement': {
    plan: {
      ...commandOf('ADD'),
      directObject: { concept: 'COMPLEMENT_GRAMMAR', definiteness: 'indefinite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Add a complement',
  },

  // The two icon controls in the words sidebar's header, which have no label of their own — the
  // tooltip (and the aria-label it doubles as) is the whole affordance. Both are commands.
  //
  // "Show the word map" reuses the noun phrase of `wordMap.heading` — MAP carrying an attributive
  // plural WORD — as the object of the SHOW imperative, so the button and the dialog it opens name
  // the same thing in the same words. Definite: there is one corpus and one map of it, and the
  // button opens *that* one ("mostra la mappa di parole", "zeige die Wörterkarte").
  'action.showWordMap': {
    plan: {
      ...commandOf('SHOW'),
      directObject: {
        concept: 'MAP',
        definiteness: 'definite',
        nounModifiers: [{ concept: 'WORD', relation: 'material', number: 'plural' }],
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Show the word map',
  },
  // The map dialog's close button, on the same noun phrase ("chiudi la mappa di parole", ja 単語の地図を閉じる).
  'action.closeWordMap': {
    plan: {
      ...commandOf('CLOSE'),
      directObject: {
        concept: 'MAP',
        definiteness: 'definite',
        nounModifiers: [{ concept: 'WORD', relation: 'material', number: 'plural' }],
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Close the word map',
  },
  // The bare CLOSE command, lower-case like `action.move`: what esc does to an open picker or menu, in
  // the picker's key strip ("chiudi", fr "fermer", ja 閉じる). The help sheet capitalizes it with CSS.
  'action.close': { plan: commandOf('CLOSE'), format: { stripPeriod: true }, fallback: 'close' },
  // The button that fetches the words again after the map failed to load them: the bare RETRY command
  // ("Riprova", "Réessayer", ja 再試行).
  'action.retry': { plan: commandOf('RETRY'), format: NAME_FORMAT, fallback: 'Retry' },

  // "Hide the words" — the HIDE imperative on the same plural WORD that `words.heading` titles the
  // panel with, so the control says it is putting away the thing named above it. Definite, not the
  // heading's bare: the command acts on the words already on screen, and the Romance languages want
  // the article to say so ("nascondi le parole", "esconde las palabras").
  'action.hideWords': {
    plan: {
      ...commandOf('HIDE'),
      directObject: { concept: 'WORD', number: 'plural', definiteness: 'definite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Hide the words',
  },

  // The hint in the caption of a period container that has nothing in it yet. A command, and one
  // that says its *method*: the START imperative with a `process`-level instrumental — the
  // instrument is not a thing but an act in flow, rendered non-finitely by each language's own
  // means (en "start by choosing a subject", it "inizia scegliendo un soggetto", fr "commence en
  // choisissant un sujet", de "beginne, indem du ein Subjekt wählst", ja "主語を選んで始め").
  // The subject is indefinite: the user has yet to pick one — that is the whole point of the hint.
  'hint.chooseSubject': {
    plan: {
      ...commandOf('START'),
      complements: {
        instrumental: {
          phrase: { concept: 'SUBJECT_GRAMMAR', definiteness: 'indefinite' },
          action: { verb: 'CHOOSE' },
          specifiers: [{ kind: 'abstraction', value: 'process' }],
        },
      },
    } as PhrasePlan,
    // Lower-case like the placeholders: it trails a "·" inside a caption the CSS uppercases.
    format: { stripPeriod: true },
    fallback: 'start by choosing a subject',
  },

  // The same caption once the period has a subject and the canvas is up: what to do with it. Two
  // commands in *sequence*, which is what the `then` conjunction is for — the join of the steps of
  // a recipe or a wizard (see IMPERATIVE_COORD_CONJUNCTIONS): click a slot, and only then choose a
  // word for it. Not one command with two objects: the second act waits on the first. Both objects
  // are indefinite — any slot, any word. The coordinated clause inherits the mood, the register and
  // the addressee from this one, so it is built with the same `commandOf` shorthand.
  // en "click a slot, and then choose a word", it "clicca su uno slot, e poi scegli una parola",
  // de "auf einen Slot klicken, und dann ein Wort wählen", ja "スロットをクリック、それから単語を選び".
  'hint.chooseWord': {
    plan: {
      ...commandOf('CLICK'),
      // SLOT_COMPUTING, not SLOT: the plain noun is the narrow opening you post a coin through
      // ("fessura", "Schlitz"). A role box on the canvas is a slot in the computing sense — a
      // reserved position waiting to be filled — which every language borrows as "slot".
      directObject: { concept: 'SLOT_COMPUTING', definiteness: 'indefinite' },
      coordination: {
        conjunction: 'then',
        clause: {
          ...commandOf('CHOOSE'),
          directObject: { concept: 'WORD', definiteness: 'indefinite' },
        },
      },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'click a slot and then choose a word',
  },
  // The same caption to a keyboard user, who reaches a slot with the arrows and fills it by typing,
  // the caption P01 designed: USE on the ARROW keys, then TYPE an indefinite WORD, the same two steps
  // in sequence (en "use the arrow keys, and then type a word", it "usa le frecce, e poi digita una
  // parola", de "die Pfeiltasten verwenden, und dann ein Wort tippen", ja 矢印キーを使用、それから単語を入力).
  'hint.chooseWordKeyboard': {
    plan: {
      ...commandOf('USE'),
      directObject: { concept: 'ARROW', number: 'plural', definiteness: 'definite' },
      coordination: {
        conjunction: 'then',
        clause: {
          ...commandOf('TYPE'),
          directObject: { concept: 'WORD', definiteness: 'indefinite' },
        },
      },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'use the arrow keys, and then type a word',
  },

  // The tail every chip tooltip ends with, and the one every link control ends with: what the
  // click will do, said as the *purpose* of the click (PhrasePlan.purpose — localization C12).
  // Each language marks a final clause its own way and the catalog says none of it: en the bare
  // infinitive, it/fr/es/pt per / pour / para + infinitive, de the um … zu frame, ja 〜ために ahead
  // of the verb — "click to change", "clicca per cambiare", "klicken, um zu ändern",
  // 「変えるためにクリック」. Lower-case: both trail an em-dash inside a longer tooltip.
  'hint.clickToChange': {
    plan: { ...commandOf('CLICK'), purpose: { verbPhrase: { verb: 'CHANGE' } } } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'click to change',
  },
  'hint.clickToRemove': {
    plan: { ...commandOf('CLICK'), purpose: { verbPhrase: { verb: 'REMOVE' } } } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'click to remove',
  },
  // The console's source strip, after the `/edit` that does the same: "click to edit", it "clicca per
  // modificare", de "klicken, um zu bearbeiten", ja 「編集するためにクリック」.
  'hint.clickToEdit': {
    plan: { ...commandOf('CLICK'), purpose: { verbPhrase: { verb: 'EDIT' } } } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'click to edit',
  },

  // The resize handle's tooltip: the same purpose clause on the gesture that drives it. French
  // says "faire glisser" in full but labels the gesture with the bare "glisser", which is what
  // DRAG is seeded as — "glisser pour redimensionner", de "ziehen, um zu skalieren".
  'hint.dragToResize': {
    plan: { ...commandOf('DRAG'), purpose: { verbPhrase: { verb: 'RESIZE' } } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Drag to resize',
  },

  // The word palette's hint above the slot filters: what clicking one of them is *for*. The object
  // of the click is a slot; what the click is for has none — one filters the list that is already
  // there, and naming it ("filter the words") would say less than the sentence it sits above.
  'hint.clickSlotToFilter': {
    plan: {
      ...commandOf('CLICK'),
      directObject: { concept: 'SLOT_COMPUTING', definiteness: 'indefinite' },
      purpose: { verbPhrase: { verb: 'FILTER' } },
    } as PhrasePlan,
    // A sentence in the sidebar, so it keeps the full stop its language ends one with.
    format: { capitalize: true },
    fallback: 'Click a slot to filter.',
  },

  // The translations panel before there is anything to translate: what to select, and what for.
  // The two things needed are one coordinated object ("a subject and a verb"), and the purpose
  // clause carries the rest. The English literal's "at least" is gone: it is a quantifying
  // adverbial on the object, which nothing in the model expresses, and the sentence says the same
  // thing without it — these are what a translation needs, not a ceiling on what may be picked.
  'hint.selectToTranslate': {
    plan: {
      ...commandOf('SELECT'),
      directObject: {
        conjuncts: [
          { concept: 'SUBJECT_GRAMMAR', definiteness: 'indefinite' },
          { concept: 'VERB', definiteness: 'indefinite' },
        ],
        conjunction: 'and',
      },
      purpose: {
        verbPhrase: { verb: 'SEE' },
        directObject: { concept: 'TRANSLATION', number: 'plural', definiteness: 'definite' },
      },
    } as PhrasePlan,
    format: { capitalize: true },
    fallback: 'Select a subject and a verb to see the translations.',
  },

  // The reification switch on an instrument period — the three degrees an instrument can be
  // presented at (see AbstractionLevel), keyed by level so the selector can write
  // t(`instrumental.level.${level}`). Each is the bare noun the level is named after: the act in
  // flow (process), the act named (concept), the thing it leaves behind (object — OBJECT_THING,
  // the thing one holds, not the grammatical OBJECT_GRAMMAR the English word also means).
  // The buttons' CSS uppercases them.
  'instrumental.level.process': {
    plan: nameOf('PROCESS'),
    format: NAME_FORMAT,
    fallback: 'Process',
  },
  'instrumental.level.concept': {
    plan: nameOf('CONCEPT'),
    format: NAME_FORMAT,
    fallback: 'Concept',
  },
  'instrumental.level.object': {
    plan: nameOf('OBJECT_THING'),
    format: NAME_FORMAT,
    fallback: 'Object',
  },
  // What those three are levels of, for the key that cycles them (R on an instrument period) and the
  // console's /level: LEVEL bare, owned by the definite INSTRUMENTAL, the `help.commandSubject` shape
  // (en "The instrumental's level", it "Livello del complemento di mezzo", de "Ebene des Instrumentals",
  // ja 手段語の段階).
  'instrumental.level': {
    plan: {
      subject: {
        concept: 'LEVEL',
        definiteness: 'bare',
        possessor: { concept: 'INSTRUMENTAL', definiteness: 'definite' },
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: "The instrumental's level",
  },

  // The tooltip on each of those buttons. A level is a *construction*, and no gloss of one
  // survives translation ("by doing it" is English grammar talking about itself), so each tooltip
  // is the construction itself: one and the same period — "start … a word", the CHOOSE act on an
  // indefinite WORD — rendered at the level the button sets, in the current UI language. Pressing
  // the button does to the workspace exactly what the tooltip shows.
  //   process → en "start by choosing a word", de "beginne, indem du ein Wort wählst", ja 「単語を選んで始め」
  //   concept → it "inizia con lo scegliere una parola", de "mit dem Wählen eines Wortes beginnen"
  //   object  → fr "commence avec un mot" — the act is gone, only the thing is left.
  'instrumental.level.process.example': {
    plan: exampleAt('process'),
    format: { capitalize: true, stripPeriod: true },
    fallback: 'Start by choosing a word',
  },
  'instrumental.level.concept.example': {
    plan: exampleAt('concept'),
    format: { capitalize: true, stripPeriod: true },
    fallback: 'Start with the choosing of a word',
  },
  'instrumental.level.object.example': {
    plan: exampleAt('object'),
    format: { capitalize: true, stripPeriod: true },
    fallback: 'Start with a word',
  },

  // The command box, which replaces the subject box under an imperative (the subject is dropped
  // from every surface, so there is no noun to pick there). Its caption is the bare COMMAND noun.
  'imperative.command': {
    plan: nameOf('COMMAND'),
    format: NAME_FORMAT,
    fallback: 'Command',
  },

  // The infinitive-phrase box, which replaces the subject box under the infinitive render mode (the
  // subject is dropped from every surface — a citation addresses nobody). Its caption is the bare
  // INFINITIVE_PHRASE grammar noun, the same concept the mode is named by.
  'infinitive.phrase': {
    plan: nameOf('INFINITIVE_PHRASE'),
    format: NAME_FORMAT,
    fallback: 'Infinitive phrase',
  },

  // What the command and infinitive toggles say while on: a statement, BE with the mode as its subject
  // complement ("this period is a command", ja 「この文は命令です」), the shape `period.isConditional` has.
  // Then how to undo it, joined after a dash at the call site: TURN_OFF on a neuter pronoun for the mode,
  // which each language attaches its own way — en "turn it off", it "disattivalo", fr "le désactiver",
  // es "desactivarlo", de "es deaktivieren". Two entries, because a statement and a command are two moods.
  'period.isCommand': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
      verbPhrase: { verb: 'BE' },
      complements: { predicative: { phrase: { concept: 'COMMAND', definiteness: 'indefinite' } } },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'This period is a command',
  },
  'period.isInfinitive': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
      verbPhrase: { verb: 'BE' },
      complements: { predicative: { phrase: { concept: 'INFINITIVE_PHRASE', definiteness: 'indefinite' } } },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'This period is an infinitive phrase',
  },
  'period.isQuestion': {
    plan: {
      subject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
      verbPhrase: { verb: 'BE' },
      complements: { predicative: { phrase: { concept: 'QUESTION', definiteness: 'indefinite' } } },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'This period is a question',
  },
  'action.turnOff': {
    plan: {
      ...commandOf('TURN_OFF'),
      directObject: { concept: 'THIRD_PERSON', definiteness: 'bare', gender: 'neut' },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'turn it off',
  },

  // What the same two toggles say while *off*: the command they carry out, which is a factitive —
  // the period is not acted on, it is turned into something else. That is an `objectPredicative`
  // (localization C12), and the word linking it belongs to the verb: TRANSFORM says "into" / in /
  // en / em, and German "in" + the accusative. en "Transform this period into a command", it
  // "trasforma questo periodo in un comando", de "dieses Satzgefüge in einen Befehl verwandeln",
  // ja 「この文を命令に変え」. "Make" was the English literal these replace; TRANSFORM is what the
  // other six languages needed, and it says the same thing — MAKE's lexemes are the plain verbs of
  // creation (fare / hacer / 作る), which take no object complement in any of them.
  'action.makeCommand': {
    plan: {
      ...commandOf('TRANSFORM'),
      directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
      complements: { objectPredicative: { phrase: { concept: 'COMMAND', definiteness: 'indefinite' } } },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Transform this period into a command',
  },
  'action.makeInfinitive': {
    plan: {
      ...commandOf('TRANSFORM'),
      directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
      complements: {
        objectPredicative: { phrase: { concept: 'INFINITIVE_PHRASE', definiteness: 'indefinite' } },
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Transform this period into an infinitive phrase',
  },
  'action.makeQuestion': {
    plan: {
      ...commandOf('TRANSFORM'),
      directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
      complements: { objectPredicative: { phrase: { concept: 'QUESTION', definiteness: 'indefinite' } } },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Transform this period into a question',
  },

  // What they say while *locked* — the period is in a conditional or a coordination, and a mood
  // belongs to a clause standing on its own. So: remove whichever link holds it, and the purpose
  // clause says what that is for. The object is the two links coordinated with "or", since the
  // control cannot know which one is there; "link" itself is not seeded, and naming the two
  // relations is more use than naming the mechanism.
  'action.unlinkForCommand': {
    plan: {
      ...commandOf('REMOVE'),
      directObject: {
        conjuncts: [
          { concept: 'CONDITION', definiteness: 'definite' },
          { concept: 'COORDINATION', definiteness: 'definite' },
        ],
        conjunction: 'or',
      },
      purpose: {
        verbPhrase: { verb: 'TRANSFORM' },
        directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
        complements: { objectPredicative: { phrase: { concept: 'COMMAND', definiteness: 'indefinite' } } },
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Remove the condition or the coordination to transform this period into a command',
  },
  'action.unlinkForInfinitive': {
    plan: {
      ...commandOf('REMOVE'),
      directObject: {
        conjuncts: [
          { concept: 'CONDITION', definiteness: 'definite' },
          { concept: 'COORDINATION', definiteness: 'definite' },
        ],
        conjunction: 'or',
      },
      purpose: {
        verbPhrase: { verb: 'TRANSFORM' },
        directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
        complements: {
          objectPredicative: { phrase: { concept: 'INFINITIVE_PHRASE', definiteness: 'indefinite' } },
        },
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Remove the condition or the coordination to transform this period into an infinitive phrase',
  },
  'action.unlinkForQuestion': {
    plan: {
      ...commandOf('REMOVE'),
      directObject: {
        conjuncts: [
          { concept: 'CONDITION', definiteness: 'definite' },
          { concept: 'COORDINATION', definiteness: 'definite' },
        ],
        conjunction: 'or',
      },
      purpose: {
        verbPhrase: { verb: 'TRANSFORM' },
        directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'this' },
        complements: { objectPredicative: { phrase: { concept: 'QUESTION', definiteness: 'indefinite' } } },
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Remove the condition or the coordination to transform this period into a question',
  },

  // Where the second command of a coordination gets its (locked) choices from — the tooltip on
  // the link icon in its box. The pair is one speech act, so the first clause makes them.
  'imperative.firstCommand': {
    plan: {
      subject: { concept: 'COMMAND', definiteness: 'definite', adjectives: ['FIRST'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'The first command',
  },

  // The two registers a command is spoken in — the box's first row. They are two speech acts,
  // not two persons: an ORDER is addressed to somebody, an INSTRUCTION to nobody (a button, a
  // recipe step), which is why the person row below goes moot under it. Named by the bare nouns,
  // keyed by register value so the selector can write t(`imperative.register.${value}`).
  'imperative.register.request': {
    plan: nameOf('ORDER'),
    format: NAME_FORMAT,
    fallback: 'Order',
  },
  'imperative.register.instruction': {
    plan: nameOf('INSTRUCTION'),
    format: NAME_FORMAT,
    fallback: 'Instruction',
  },
  // What the two are two of, for the key that switches between them (R on the command box): the bare
  // REGISTER (it "Registro", de "Register", ja 言語使用域).
  'imperative.register': {
    plan: nameOf('REGISTER'),
    format: NAME_FORMAT,
    fallback: 'Register',
  },

  // The three persons an order can be spoken to — the box's second row, keyed by person so the
  // selector can write t(`imperative.person.${value}`). The buttons themselves carry the compact
  // grammatical codes (2sg / 1pl / 2pl, the same notation the engines use and language-neutral);
  // these name them in full for the tooltip — PERSON_GRAMMAR under its ordinal and number
  // adjectives, which agree with it per language (it "seconda persona singolare").
  'imperative.person.2sg': {
    plan: {
      subject: {
        concept: 'PERSON_GRAMMAR',
        definiteness: 'bare',
        adjectives: ['SECOND', 'SINGULAR'],
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Second person singular',
  },
  'imperative.person.1pl': {
    plan: {
      subject: {
        concept: 'PERSON_GRAMMAR',
        definiteness: 'bare',
        adjectives: ['FIRST', 'PLURAL'],
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'First person plural',
  },
  'imperative.person.2pl': {
    plan: {
      subject: {
        concept: 'PERSON_GRAMMAR',
        definiteness: 'bare',
        adjectives: ['SECOND', 'PLURAL'],
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Second person plural',
  },

  // What the person *buttons* read: the same three persons, said without the noun that would not
  // fit on a button — the ordinal and the number alone, as they agree with the PERSON_GRAMMAR the
  // tooltip above spells out (it "seconda singolare", the feminine of "persona"). Two words, not
  // one: a person is an ordinal *and* a number, and neither names it by itself.
  'imperative.personShort.2sg': {
    word: ['SECOND', 'SINGULAR'],
    agreesWith: 'PERSON_GRAMMAR',
    fallback: 'second singular',
  },
  'imperative.personShort.1pl': {
    word: ['FIRST', 'PLURAL'],
    agreesWith: 'PERSON_GRAMMAR',
    fallback: 'first plural',
  },
  'imperative.personShort.2pl': {
    word: ['SECOND', 'PLURAL'],
    agreesWith: 'PERSON_GRAMMAR',
    fallback: 'second plural',
  },

  // The help sheet's own headings and rows, where no control already names the thing. Each names a
  // part of the canvas by what it belongs to, the `modifier.adjective` shape: the head bare, as a
  // heading drops its article (it "Soggetto del comando", de "Subjekt des Befehls"), and the owner
  // definite, the one there is (en "The command's subject", ja 命令の主語). The command's subject is the
  // box a command puts in place of the subject; the pronoun's person is what the chooser's 1–4 pick.
  'help.commandSubject': {
    plan: {
      subject: {
        concept: 'SUBJECT_GRAMMAR',
        definiteness: 'bare',
        possessor: { concept: 'COMMAND', definiteness: 'definite' },
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: "The command's subject",
  },
  'help.pronounPerson': {
    plan: {
      subject: {
        concept: 'PERSON_GRAMMAR',
        definiteness: 'bare',
        possessor: { concept: 'PRONOUN', definiteness: 'definite' },
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: "The pronoun's person",
  },
  // The section for the two panels beside the canvas: their headings' nouns, TRANSLATION and WORD, both
  // plural and bare as the headings have them, coordinated by `and` ("Traduzioni e parole", de
  // "Übersetzungen und Wörter", ja 翻訳と単語).
  'help.translationsAndWords': {
    plan: {
      subject: {
        conjunction: 'and',
        conjuncts: [
          { concept: 'TRANSLATION', number: 'plural', definiteness: 'bare' },
          { concept: 'WORD', number: 'plural', definiteness: 'bare' },
        ],
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Translations and words',
  },

  // The help itself: the corner button's name and tooltip, the overlay's title, the ? key and the
  // console's /help. The mass noun HELP, bare (it "Aiuto", fr "Aide", de "Hilfe", ja ヘルプ).
  'help.heading': { plan: nameOf('HELP'), format: NAME_FORMAT, fallback: 'Help' },
  // The overlay's keyboard section: NAVIGATION with KEYBOARD as an attributive noun, the
  // `wordMap.heading` shape. The purpose relation, which gives Italian its "da" ("Navigazione da
  // tastiera", as occhiali da sole); German compounds it ("Tastaturnavigation"). French, Spanish and
  // Portuguese read "de clavier / de teclado", where their UIs more often say "au clavier / por
  // teclado", a means no noun modifier has.
  'help.keyboard': {
    plan: {
      subject: {
        concept: 'NAVIGATION',
        definiteness: 'bare',
        nounModifiers: [{ concept: 'KEYBOARD', relation: 'purpose' }],
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Keyboard navigation',
  },
  // The keyboard section's own headings, where no control already names the level. The keys that
  // work wherever the cursor is are EVERYWHERE's (a word: an adverb heads no period — it "Ovunque",
  // de "Überall", ja どこでも); the keys that move about a period are its NAVIGATION; the picker is a
  // LIST of words (`wordMap.heading`'s shape: it "Elenco di parole", de "Wortliste", ja 単語の一覧);
  // the menus are MENU plural; and a pick is the choice of a link's TARGET, plural (it "Destinazioni",
  // fr "Cibles", de "Ziele", ja 対象).
  'help.section.app': { word: 'EVERYWHERE', format: { capitalize: true }, fallback: 'Everywhere' },
  'help.section.box': { plan: nameOf('NAVIGATION'), format: NAME_FORMAT, fallback: 'Navigation' },
  'help.section.picker': {
    plan: {
      subject: {
        concept: 'LIST',
        definiteness: 'bare',
        nounModifiers: [{ concept: 'WORD', relation: 'material', number: 'plural' }],
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Word list',
  },
  'help.section.menu': {
    plan: { subject: { concept: 'MENU', number: 'plural', definiteness: 'bare' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Menus',
  },
  'help.section.pick': {
    plan: { subject: { concept: 'TARGET', number: 'plural', definiteness: 'bare' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Targets',
  },
  // The digits that pick: a menu's row by its number, a pick's target by the number it wears. CHOOSE,
  // as the picker's ↵ is called, on an indefinite NUMBERED row or target, the one the digit names
  // (it "Scegli una riga numerata", de "Ein nummeriertes Ziel wählen", ja 番号付きの対象を選び). The
  // keycaps beside them say which digits. ⇥ in a pick goes to the NEXT target (de "Nächstes Ziel").
  'help.pickNumberedRow': {
    plan: {
      ...commandOf('CHOOSE'),
      directObject: { concept: 'ROW', definiteness: 'indefinite', adjectives: ['NUMBERED'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Choose a numbered row',
  },
  'help.pickNumbered': {
    plan: {
      ...commandOf('CHOOSE'),
      directObject: { concept: 'TARGET', definiteness: 'indefinite', adjectives: ['NUMBERED'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Choose a numbered target',
  },
  'help.nextTarget': {
    plan: { subject: { concept: 'TARGET', definiteness: 'bare', adjectives: ['NEXT'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Next target',
  },

  // ── The help's prose (localization C22) ──
  // The overlay's paragraphs and notes, rewritten as short statements in the shapes the engines have:
  // one period each, a relative clause where the prose had a free one, and the key or the console
  // syntax after a colon, outside the phrase (the C14 rule), which the call site writes. A statement
  // that stands alone keeps its full stop (`hint.clickSlotToFilter`); one a key follows drops it.
  //
  // The keyboard section's paragraph. A bare key works in the box the cursor is on: WORK, the verb of a
  // key or a machine (ACT is a person's, de "handeln"), with the box as its `locative` and the cursor
  // in a relative clause on HAVE — it "Un tasto funziona nello slot che ha il cursore", de "Eine Taste
  // funktioniert im Slot, der den Cursor hat", ja キーはカーソルがあるスロットで動作します. HAVE, not BE
  // in a place relative ("the slot where the cursor is"): Spanish and Portuguese rendered that one
  // with ser, "donde el cursor es". That was A199, fixed on 2026-09-21 — the engine now says "donde
  // el cursor está", so BE is open again if this string is ever reconsidered. Then what esc does from a box, RETURN to the period (it "Torna al
  // periodo", ja 文へ戻る), the keys that work EVERYWHERE, as the section they head is called (it "Tasti
  // che funzionano ovunque", ja どこでも動作するキー), and what ⇧ does to a key that cycles a value
  // ("Choose the previous value", de "Den vorherigen Wert wählen", ja 前の値を選び).
  'help.keyWorks': {
    plan: {
      subject: { concept: 'KEY', definiteness: 'indefinite' },
      verbPhrase: { verb: 'WORK' },
      complements: {
        locative: {
          phrase: {
            concept: 'SLOT_COMPUTING',
            definiteness: 'definite',
            relative: { verbPhrase: { verb: 'HAVE' }, directObject: { concept: 'CURSOR', definiteness: 'definite' } },
          },
        },
      },
    } as PhrasePlan,
    format: { capitalize: true },
    fallback: 'A key works in the slot that has the cursor.',
  },
  'help.returnToPeriod': {
    plan: {
      ...commandOf('RETURN'),
      complements: { direction: { phrase: { concept: 'PERIOD_SENTENCE', definiteness: 'definite' } } },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Return to the period',
  },
  'help.keysEverywhere': {
    plan: {
      subject: {
        concept: 'KEY',
        number: 'plural',
        definiteness: 'bare',
        relative: { verbPhrase: { verb: 'WORK', modifier: 'EVERYWHERE' } },
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Keys that work everywhere',
  },
  'help.previousValue': {
    plan: {
      ...commandOf('CHOOSE'),
      directObject: { concept: 'VALUE', definiteness: 'definite', adjectives: ['PREVIOUS'] },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Choose the previous value',
  },
  // The notes under the sheet's levels: where the cursor is for the period's keys and for a box's,
  // said with BE and a `locative`, which Spanish and Portuguese say with estar in a main clause (it "Il
  // cursore è nel periodo", es "El cursor está en un slot", ja カーソルは文にあります). The period is
  // the one there is; a box, any of them.
  'help.cursorInPeriod': {
    plan: {
      subject: { concept: 'CURSOR', definiteness: 'definite' },
      verbPhrase: { verb: 'BE' },
      complements: { locative: { phrase: { concept: 'PERIOD_SENTENCE', definiteness: 'definite' } } },
    } as PhrasePlan,
    format: { capitalize: true },
    fallback: 'The cursor is in the period.',
  },
  'help.cursorInSlot': {
    plan: {
      subject: { concept: 'CURSOR', definiteness: 'definite' },
      verbPhrase: { verb: 'BE' },
      complements: { locative: { phrase: { concept: 'SLOT_COMPUTING', definiteness: 'indefinite' } } },
    } as PhrasePlan,
    format: { capitalize: true },
    fallback: 'The cursor is in a slot.',
  },
  // The noun keys' note: the five boxes a noun can stand in, by name, joined with commas at the call
  // site as the Targets note is. The subject and the possessor are the boxes' own titles (`slot.*`).
  // The object is named DIRECT here, because Spanish OBJECT_GRAMMAR is "complemento" like
  // COMPLEMENT_GRAMMAR, and `slot.directObject` made the list read "complemento, complemento": es
  // "Complemento directo", fr "Complément d'objet direct", pt "Objeto direto", ja 直接の目的語.
  'help.directObject': {
    plan: { subject: { concept: 'OBJECT_GRAMMAR', definiteness: 'bare', adjectives: ['DIRECT'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Direct object',
  },
  'help.complement': { plan: nameOf('COMPLEMENT_GRAMMAR'), format: NAME_FORMAT, fallback: 'Complement' },
  'help.conjunct': { plan: nameOf('CONJUNCT'), format: NAME_FORMAT, fallback: 'Conjunct' },
  // The note under "The command's subject": what that box is, REPLACE with the subject as its object
  // and the command as the place it happens — the prose's "in place of", which no complement says,
  // turned into the verb that means it (it "Questo slot sostituisce il soggetto in un comando", de
  // "Dieser Slot ersetzt das Subjekt in einem Befehl", ja このスロットは命令で主語を置き換えます).
  'help.replacesSubject': {
    plan: {
      subject: { concept: 'SLOT_COMPUTING', definiteness: 'this' },
      verbPhrase: { verb: 'REPLACE' },
      directObject: { concept: 'SUBJECT_GRAMMAR', definiteness: 'definite' },
      complements: { locative: { phrase: { concept: 'COMMAND', definiteness: 'indefinite' } } },
    } as PhrasePlan,
    format: { capitalize: true },
    fallback: 'This slot replaces the subject in a command.',
  },
  // The word list's rows for the tabs above it and for esc. ↑ from the first row goes up to the tabs:
  // GO with the row as its `source` and the tabs as its `direction` (it "Va' dalla prima riga alle
  // schede", pt "Ir da primeira linha às abas", ja 第一の行からタブへ移動); ← → there choose a TAB, the
  // vocabulary each one shows (fr "Choisir un onglet", ja タブを選び). A second esc gives the box back
  // the word it was replacing: RESTORE, the row the sheet draws with two esc caps (de "Das Wort
  // zurückholen", ja 単語を復元).
  'help.goToTabs': {
    plan: {
      ...commandOf('GO'),
      complements: {
        source: { phrase: { concept: 'ROW', definiteness: 'definite', adjectives: ['FIRST'] } },
        direction: { phrase: { concept: 'TAB', number: 'plural', definiteness: 'definite' } },
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Go from the first row to the tabs',
  },
  'help.chooseTab': {
    plan: { ...commandOf('CHOOSE'), directObject: { concept: 'TAB', definiteness: 'indefinite' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Choose a tab',
  },
  'help.restoreWord': {
    plan: { ...commandOf('RESTORE'), directObject: { concept: 'WORD', definiteness: 'definite' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Restore the word',
  },
  // The console's part of the overlay. Under "The period's words", what a role command does with a
  // word and without one: TYPE a word, as the prompt's placeholder says it (`console.placeholder`), and
  // MOVE the cursor, which is the console's context (it "Digita una parola: /subj ( … )", "Sposta il
  // cursore: /subj", ja 単語を入力 / カーソルを移動).
  'help.console.typeWord': {
    plan: { ...commandOf('TYPE'), directObject: { concept: 'WORD', definiteness: 'indefinite' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Type a word',
  },
  'help.console.moveCursor': {
    plan: { ...commandOf('MOVE'), directObject: { concept: 'CURSOR', definiteness: 'definite' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Move the cursor',
  },
  // The console's paragraph, one statement to a line, each example after a colon. What a bracket
  // holds: HOLD on a word and bare plural commands (it "Una parentesi contiene una parola e comandi", fr
  // "…un mot et des commandes", ja 括弧は単語と命令を保持しています). Not "its commands", which was written
  // around because Japanese spelled that possessive それの where it says その (A201, fixed on
  // 2026-09-21) and because a pronoun's gender would have to follow WORD's in each language. The
  // second reason stands on its own, so the string is unchanged. That the console writes the brackets (WRITE, it "La console scrive le
  // parentesi"), and that the list inside one shows the word's commands (SHOW, whose Japanese says it
  // with 見せる as the word map's sentence does).
  'help.console.bracket': {
    plan: {
      subject: { concept: 'BRACKET', definiteness: 'indefinite' },
      verbPhrase: { verb: 'HOLD' },
      directObject: {
        conjunction: 'and',
        conjuncts: [
          { concept: 'WORD', definiteness: 'indefinite' },
          { concept: 'COMMAND', number: 'plural', definiteness: 'bare' },
        ],
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'A bracket holds a word and commands',
  },
  'help.console.writesBrackets': {
    plan: {
      subject: { concept: 'CONSOLE', definiteness: 'definite' },
      verbPhrase: { verb: 'WRITE' },
      directObject: { concept: 'BRACKET', number: 'plural', definiteness: 'definite' },
    } as PhrasePlan,
    format: { capitalize: true },
    fallback: 'The console writes the brackets.',
  },
  'help.console.listShows': {
    plan: {
      subject: { concept: 'LIST', definiteness: 'definite' },
      verbPhrase: { verb: 'SHOW' },
      directObject: {
        concept: 'COMMAND',
        number: 'plural',
        definiteness: 'definite',
        possessor: { concept: 'WORD', definiteness: 'definite' },
      },
    } as PhrasePlan,
    format: { capitalize: true },
    fallback: "The list shows the word's commands.",
  },
  // The other two brackets, each named by what it holds, head bare as a legend's is, the example after
  // the colon: a noun's NOUN_PHRASE (it "Sintagma nominale di un sostantivo", de "Nominalphrase eines
  // Substantivs", ja 名詞の名詞句) and a NEW period (it "Nuovo periodo", es "Nuevo período", ja 新しい文).
  // A reference to a noun elsewhere is another period's noun (OTHER: it "Sostantivo di un altro
  // periodo", ja 別の文の名詞).
  'help.console.nounPhrase': {
    plan: {
      subject: { concept: 'NOUN_PHRASE', definiteness: 'bare', possessor: { concept: 'NOUN', definiteness: 'indefinite' } },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: "A noun's noun phrase",
  },
  'help.console.newPeriod': {
    plan: { subject: { concept: 'PERIOD_SENTENCE', definiteness: 'bare', adjectives: ['NEW'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'New period',
  },
  'help.console.otherNoun': {
    plan: {
      subject: {
        concept: 'NOUN',
        definiteness: 'bare',
        possessor: { concept: 'PERIOD_SENTENCE', definiteness: 'indefinite', adjectives: ['OTHER'] },
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: "Another period's noun",
  },
  // A command outside every bracket acts on the box the cursor is on: EDIT, with the relative clause
  // `help.keyWorks` takes (it "Un comando modifica lo slot che ha il cursore", ja
  // 命令はカーソルがあるスロットを編集します). A setting SETs a value rather than toggling one (de "Ein
  // Befehl legt einen Wert fest"), which is why a line applied AGAIN leaves the period as it is: an
  // agentless passive in an object relative (it "Una riga che è applicata di nuovo non cambia il
  // periodo", de "Eine Zeile, die erneut angewandt wird, ändert das Satzgefüge nicht", ja
  // もう一度適用される行は文を変えません).
  'help.console.commandEdits': {
    plan: {
      subject: { concept: 'COMMAND', definiteness: 'indefinite' },
      verbPhrase: { verb: 'EDIT' },
      directObject: {
        concept: 'SLOT_COMPUTING',
        definiteness: 'definite',
        relative: { verbPhrase: { verb: 'HAVE' }, directObject: { concept: 'CURSOR', definiteness: 'definite' } },
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'A command edits the slot that has the cursor',
  },
  'help.console.setsValue': {
    plan: {
      subject: { concept: 'COMMAND', definiteness: 'indefinite' },
      verbPhrase: { verb: 'SET' },
      directObject: { concept: 'VALUE', definiteness: 'indefinite' },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'A command sets a value',
  },
  'help.console.lineAgain': {
    plan: {
      subject: {
        concept: 'LINE',
        definiteness: 'indefinite',
        relative: {
          headRole: 'directObject',
          subject: { concept: 'GENERIC_PERSON' },
          verbPhrase: { verb: 'APPLY', voice: 'passive', modifier: 'AGAIN' },
        },
      },
      verbPhrase: { verb: 'CHANGE', negative: true },
      directObject: { concept: 'PERIOD_SENTENCE', definiteness: 'definite' },
    } as PhrasePlan,
    format: { capitalize: true },
    fallback: 'A line that is applied again does not change the period.',
  },
  // The prompt's keys, as rows beside their caps, the sheet's way. ⇥ completes the word begun or goes
  // on to the next one, two commands offered as a choice (`or`: it "Completa, o va' alla parola
  // successiva", ja 補完、または次の単語へ移動); ⇧↵ adds a LINE (de "Eine Zeile hinzufügen"); ↑ is the
  // previous line (ja 前の行); and ⇥ on an empty line shows the pinned ones, the row naming where
  // before a colon as the words panel's rows do ("Empty line: show the pinned lines", it "Riga vuota:
  // mostra le righe fissate", ja 空の行: ピン留め済みの行を見せ).
  'help.console.tab': {
    plan: {
      ...commandOf('COMPLETE'),
      coordination: {
        conjunction: 'or',
        clause: {
          ...commandOf('GO'),
          complements: { direction: { phrase: { concept: 'WORD', definiteness: 'definite', adjectives: ['NEXT'] } } },
        },
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Complete, or go to the next word',
  },
  'help.console.addLine': {
    plan: { ...commandOf('ADD'), directObject: { concept: 'LINE', definiteness: 'indefinite' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Add a line',
  },
  'help.console.previousLine': {
    plan: { subject: { concept: 'LINE', definiteness: 'bare', adjectives: ['PREVIOUS'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Previous line',
  },
  'help.console.emptyLine': {
    plan: { subject: { concept: 'LINE', definiteness: 'bare', adjectives: ['EMPTY'] } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Empty line',
  },
  'help.console.showPinned': {
    plan: {
      ...commandOf('SHOW'),
      directObject: { concept: 'LINE', number: 'plural', definiteness: 'definite', adjectives: ['PINNED'] },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'show the pinned lines',
  },
  // The last line: what choosing a command's row does. CHOOSE with the purpose of seeing an EXAMPLE
  // (it "Scegli un comando per vedere un esempio.", de "Einen Befehl wählen, um ein Beispiel zu sehen.",
  // ja 例を見るために命令を選び。). "Its page" would need the possessive `help.console.bracket` avoids.
  'help.console.chooseCommand': {
    plan: {
      ...commandOf('CHOOSE'),
      directObject: { concept: 'COMMAND', definiteness: 'indefinite' },
      purpose: { verbPhrase: { verb: 'SEE' }, directObject: { concept: 'EXAMPLE', definiteness: 'indefinite' } },
    } as PhrasePlan,
    format: { capitalize: true },
    fallback: 'Choose a command to see an example.',
  },

  // Each selectable UI language's name, so the header selector and the translations panel
  // label their rows in the current UI language. Keyed `language.<code>` so a call site can
  // write t(`language.${code}`) for any LanguageCode. The word, not a period: a language name is
  // a proper noun, and the Romance languages article it in a sentence ("l'italiano è una
  // lingua"), which a label does not want.
  'language.en': { word: 'ENGLISH', format: { capitalize: true }, fallback: 'English' },
  'language.it': { word: 'ITALIAN', format: { capitalize: true }, fallback: 'Italian' },
  'language.fr': { word: 'FRENCH', format: { capitalize: true }, fallback: 'French' },
  'language.de': { word: 'GERMAN', format: { capitalize: true }, fallback: 'German' },
  'language.es': { word: 'SPANISH', format: { capitalize: true }, fallback: 'Spanish' },
  'language.ja': { word: 'JAPANESE', format: { capitalize: true }, fallback: 'Japanese' },
  'language.pt': { word: 'PORTUGUESE', format: { capitalize: true }, fallback: 'Portuguese' },

  // The selector itself, as its aria-label: the language of the interface, LANGUAGE with INTERFACE as an
  // attributive noun (en "interface language", fr "langue d'interface", ja インターフェースの言語). Named
  // for what it sets, not "language" alone: the translations panel lists every language as well.
  'language.selector': {
    plan: {
      subject: {
        concept: 'LANGUAGE',
        definiteness: 'bare',
        nounModifiers: [{ concept: 'INTERFACE', relation: 'material' }],
      },
    } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Interface language',
  },
});

export type UiStringKey = keyof typeof UI_STRINGS;

/** The rendered catalog: every key, in every language. Served by GET /api/ui-strings. */
export type UiStrings = Record<UiStringKey, Record<LanguageCode, string>>;

export interface UiStringsResponse {
  strings: UiStrings;
}
