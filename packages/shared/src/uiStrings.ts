import type { AbstractionLevel, Definiteness, LanguageCode, PhrasePlan } from './index.js';

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
}

export type UiStringDef = UiStringPlanDef | UiStringWordDef | UiStringDeterminerDef;

// Preserves the literal keys (a plain `Record<string, UiStringDef>` annotation would widen
// them to `string` and lose the typo-checking on `t('…')`).
const defineUiStrings = <T extends Record<string, UiStringDef>>(defs: T): T => defs;

// A language name is the bare name-noun (the concepts are seeded in concepts/nouns.ts).
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

  // The word-category switch on a switchable box (subject/cause = noun | pronoun;
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

  // The chooser's commit button: "select (it)".
  'action.select': { plan: commandOf('SELECT'), format: NAME_FORMAT, fallback: 'Select' },

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
  // en "click a slot, and then choose a word", it "clicca uno slot, e poi scegli una parola",
  // de "einen Slot klicken, und dann ein Wort wählen", ja "スロットをクリック、それから単語を選び".
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
  // write t(`language.${code}`) for any LanguageCode.
  'language.en': { plan: nameOf('ENGLISH'), format: NAME_FORMAT, fallback: 'English' },
  'language.it': { plan: nameOf('ITALIAN'), format: NAME_FORMAT, fallback: 'Italian' },
  'language.fr': { plan: nameOf('FRENCH'), format: NAME_FORMAT, fallback: 'French' },
  'language.de': { plan: nameOf('GERMAN'), format: NAME_FORMAT, fallback: 'German' },
  'language.es': { plan: nameOf('SPANISH'), format: NAME_FORMAT, fallback: 'Spanish' },
  'language.ja': { plan: nameOf('JAPANESE'), format: NAME_FORMAT, fallback: 'Japanese' },
  'language.pt': { plan: nameOf('PORTUGUESE'), format: NAME_FORMAT, fallback: 'Portuguese' },
});

export type UiStringKey = keyof typeof UI_STRINGS;

/** The rendered catalog: every key, in every language. Served by GET /api/ui-strings. */
export type UiStrings = Record<UiStringKey, Record<LanguageCode, string>>;

export interface UiStringsResponse {
  strings: UiStrings;
}
