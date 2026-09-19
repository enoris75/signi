import type { AbstractionLevel, Definiteness, LanguageCode, PhrasePlan, PronominalPossessor } from './index.js';

/**
 * Post-processing applied to an engine-rendered UI string, once, for every language.
 * The engine renders nouns lower-case outside English and ends a period with a full stop;
 * neither suits a heading or a label, so entries opt out declaratively instead of each
 * call site re-implementing the trim.
 */
export interface UiStringFormat {
  /** Uppercase the first character only. A no-op for non-cased scripts (e.g. 日本語). */
  capitalize?: boolean;
  /** Drop a trailing full stop — ASCII "." or Japanese "。". */
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
}

export type UiStringDef =
  | UiStringPlanDef
  | UiStringWordDef
  | UiStringDeterminerDef
  | UiStringPossessiveDef;

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
const CANVAS_PARTS = {
  subject: { concept: 'SUBJECT_GRAMMAR', en: 'subject' },
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
  verbPhrase: { concept: 'VERB_PHRASE', en: 'verb phrase' },
  terminus: { concept: 'TERMINUS', en: 'terminus' },
  locative: { concept: 'LOCATIVE', en: 'locative' },
  direction: { concept: 'DIRECTION', en: 'direction' },
  source: { concept: 'SOURCE', en: 'source' },
  route: { concept: 'ROUTE', en: 'route' },
  cause: { concept: 'CAUSE_COMPLEMENT', en: 'cause' },
} as const;

/** A named part of the canvas — see CANVAS_PARTS and the `action.<verb>.<part>` families. */
export type CanvasPart = keyof typeof CANVAS_PARTS;

// The complements the canvas draws as a boxed ring of their own: every one but the instrumental, which
// lives in a period container of its own and is linked to (the canvas's BOX_COMPLEMENT_TYPES).
const BOXED_COMPLEMENT_PARTS = [
  'predicative', 'terminus', 'manner', 'locative', 'direction', 'source', 'route', 'cause',
] as const satisfies readonly CanvasPart[];

// Which parts each of those controls can act on — the members of each family below, exported so
// the canvas asks the catalog rather than keeping its own copy. Every part whose word sits in a box
// has a clear button; the parts behind a reveal control can be shown and hidden; the constituents
// drawn as a ring of their own can be expanded and compacted.
export const CLEARABLE_PARTS = [
  'subject', 'verb', 'object', 'adverb', 'adjective', 'modal', 'instrumental',
  ...BOXED_COMPLEMENT_PARTS, 'possessor',
] as const satisfies readonly CanvasPart[];
export const REVEALABLE_PARTS = [
  'adjective', 'adverb', 'object', 'modal', 'tense', 'aspect', 'instrumental',
  ...BOXED_COMPLEMENT_PARTS, 'determiner', 'possessor',
] as const satisfies readonly CanvasPart[];
export const COLLAPSIBLE_PARTS = [
  'subject', 'verbPhrase', 'object', 'instrumental', ...BOXED_COMPLEMENT_PARTS,
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
    fallback: 'Semantic phrase builder',
  },

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
  // What the same control says once it has copied: the COPIED participle, agreeing with the TRANSLATION
  // it copied (it "copiata", fr "copiée"). Japanese strips the attributive の (コピー済み).
  'status.copied': {
    word: 'COPIED',
    agreesWith: 'TRANSLATION',
    format: { capitalize: true },
    fallback: 'Copied',
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

  // The subject box's own title: the grammatical SUBJECT noun, bare. The CSS uppercases it.
  'slot.subject': {
    plan: { subject: { concept: 'SUBJECT_GRAMMAR', definiteness: 'bare' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Subject',
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

  // The link control on a noun that makes a period in another container its relative clause. One
  // noun per tradition, like the complement names: German and Japanese compound it (Relativsatz,
  // 関係節), which CLAUSE and an adjective would not give.
  'satellite.relative': {
    plan: nameOf('RELATIVE_CLAUSE'),
    format: NAME_FORMAT,
    fallback: 'Relative clause',
  },

  // The control on a noun that coordinates another phrase with it ("the cat and the dog").
  'satellite.coordination': {
    plan: nameOf('COORDINATION'),
    format: NAME_FORMAT,
    fallback: 'Coordination',
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
  // The chip's tooltip spells the relation out with the two nouns that say what the modifier is to its
  // head, coordinated by `or`: a sail is the boat's feature or means, the sun the glasses' purpose or
  // use, gold the ring's material or content. Keyed `modifier.relation.<ModifierRelation>.gloss`.
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

  // What the ten values *mean*, as each grammar tradition names them — the determiner menu's
  // labels. A bare adjective, like the `pronoun.*` values: an article that is definite, a
  // demonstrative that is proximal, a quantifier that is universal. `agreesWith` names the noun
  // of the section the value sits under, which is what makes the Italian read "determinativo"
  // under the articles and "universale" under the quantifiers (both masculine, but the
  // agreement is a fact about each language's lexicon, not about this file).
  //
  // These say what the slot does; `determiner.value.*` below says what it spells. The menu
  // shows both, because a user who has not met "paucal" learns it from the "few" beside it.
  // Keyed `determiner.name.<Definiteness>`, parallel to the values, so the menu can write
  // t(`determiner.name.${value}`) for any of the ten.
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

  // The words those values spell — the hint beside each menu label, and the word the determiner
  // box on the canvas shows. Each names itself with the word that realizes it in the language
  // ("the" / "il" / "der" / "この"), cited on the grammar noun NOUN, whose gender and initial
  // sound settle the form (see UiStringDeterminerDef). Keyed `determiner.value.<Definiteness>`
  // so a call site can write t(`determiner.value.${value}`) for any of the ten.
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
  // for it (en his/her/its, de sein/ihr, ja 彼の/彼女の/それの) — so a call site can write
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

  // The two reorder controls beside them: MOVE with the UP or DOWN adverb ("Sposta su", "Nach oben
  // verschieben", ja 「上に移動」). They leave out the "this period" the others say, because the engines
  // put an adverb of direction before a noun object in five languages ("*déplacer vers le haut cette
  // période", A142); without an object each language says it the way its buttons do.
  'action.movePeriodUp': {
    plan: { ...commandOf('MOVE'), verbPhrase: { verb: 'MOVE', modifier: 'UP' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Move up',
  },
  'action.movePeriodDown': {
    plan: { ...commandOf('MOVE'), verbPhrase: { verb: 'MOVE', modifier: 'DOWN' } } as PhrasePlan,
    format: NAME_FORMAT,
    fallback: 'Move down',
  },

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
  'action.turnOff': {
    plan: {
      ...commandOf('TURN_OFF'),
      directObject: { concept: 'THIRD_PERSON', definiteness: 'bare', gender: 'neut' },
    } as PhrasePlan,
    format: { stripPeriod: true },
    fallback: 'turn it off',
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
