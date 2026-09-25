// A small vocabulary shaped like the corpus the console reads: every role, labels in two interface
// languages, a verb for each complement, modal verbs, the four pronouns, and two labels that name
// two words each (the console must fall back to the id for those).
import type { ComplementType, Concept, GrammaticalRole, LanguageCode } from '@signi/shared';
import type { Vocabulary } from '../../src/console/language/types.ts';

const c = (
  id: string,
  role: GrammaticalRole,
  en: string,
  it: string,
  extra: Partial<Concept> = {},
): Concept => ({ id, role, description: en, label: en, labels: { en, it }, ...extra });

const verb = (id: string, en: string, it: string, extra: Partial<Concept> = {}) =>
  c(id, 'verb', en, it, { transitivity: 'transitive', ...extra });

const complements = (...types: ComplementType[]) => ({ complements: types });

export const NOUNS = [
  c('CAT', 'noun', 'cat', 'gatto', { gendered: true, animate: true }),
  c('DOG', 'noun', 'dog', 'cane', { animate: true }),
  c('CHILD', 'noun', 'child', 'bambino', { gendered: true, animate: true, human: true }),
  c('MAN', 'noun', 'man', 'uomo', { animate: true, human: true }),
  c('FOOD', 'noun', 'food', 'cibo', { countable: false }),
  c('BOOK', 'noun', 'book', 'libro'),
  c('HOUSE', 'noun', 'house', 'casa'),
  // Times for the temporal box, and a second human for the purpose's beneficiary (P09-E12b).
  c('DAY', 'noun', 'day', 'giorno'),
  c('MOMENT', 'noun', 'moment', 'momento'),
  c('NIGHT', 'noun', 'night', 'notte', { gendered: true }),
  c('WOMAN', 'noun', 'woman', 'donna', { animate: true, human: true }),
  // A capacity one acts in, for the role box (P09-E44): "acts as a friend".
  c('FRIEND', 'noun', 'friend', 'amico', { gendered: true, animate: true, human: true }),
  c('STICK', 'noun', 'stick', 'bastone'),
  c('WORD', 'noun', 'word', 'parola'),
  c('PHRASE', 'noun', 'phrase', 'frase'),
  c('CREATOR', 'noun', 'creator', 'creatore', { gendered: true }),
  c('SAIL', 'noun', 'sail', 'vela'),
  c('SPEED', 'noun', 'speed', 'velocità', { mannerRelation: 'measure' }),
  c('CARE', 'noun', 'care', 'cura', { mannerRelation: 'means' }),
  c('LEGEND', 'noun', 'legend', 'leggenda'),
  c('ICE_CREAM', 'noun', 'ice cream', 'gelato'),
  // "light" is a noun and an adjective both.
  c('LIGHT', 'noun', 'light', 'luce'),
  // A set the examples name members of (P09-E48): "animals such as the cat".
  c('ANIMAL', 'noun', 'animal', 'animale', { animate: true }),
  // A relative, whose own the speaker may be (P11-E6): "I and my father eat", humbly.
  c('FATHER', 'noun', 'father', 'padre', { animate: true, human: true, relative: true }),
];

// Kin, for an owner that is a pronoun (P11-E9): "my mother runs", "my son marries your daughter". Kept
// out of NOUNS and VERBS, which the round trip's random walk draws from, so the walk reaches what it did.
export const KIN = [
  c('MOTHER', 'noun', 'mother', 'madre', { animate: true, human: true }),
  c('SON', 'noun', 'son', 'figlio', { animate: true, human: true }),
  c('DAUGHTER', 'noun', 'daughter', 'figlia', { animate: true, human: true }),
];

export const PRONOUNS = [
  c('FIRST_PERSON', 'pronoun', 'I', 'io', { person: '1', description: '1st Person' }),
  c('SECOND_PERSON', 'pronoun', 'you', 'tu', { person: '2', description: '2nd Person' }),
  c('THIRD_PERSON', 'pronoun', 'he', 'lui', { person: '3', description: '3rd Person' }),
  c('GENERIC_PERSON', 'pronoun', 'one', 'si', { person: '3', synonym: 'one', description: 'one (generic person)' }),
];

// An indefinite (C32): a pronoun whose slot is not a person's, which no owner is (P11-E9) and no chooser
// row picks — kept out of PRONOUNS, which the walk draws from, for that reason.
export const INDEFINITES = [
  c('SOMEONE', 'pronoun', 'someone', 'qualcuno', { person: '3', slot: 'indefinite', description: 'someone' }),
];

export const VERBS = [
  // It has a humble word (いただく), as the API serves it (P11-E6).
  verb('EAT', 'eat', 'mangiare', { ...complements('instrumental', 'locative', 'cause'), humble: true }),
  verb('SEE', 'see', 'vedere'),
  verb('LOVE', 'love', 'amare'),
  verb('READ', 'read', 'leggere', complements('terminus')),
  // A verb found by a second word too (P09-E23): *pick* and *selezionare* find it; *choose* is what prints.
  verb('CHOOSE', 'choose', 'scegliere', { aliases: { en: ['pick'], it: ['selezionare'] } }),
  verb('START', 'start', 'iniziare', complements('instrumental')),
  verb('RUN', 'run', 'correre', {
    transitivity: 'intransitive',
    ...complements('direction', 'source', 'route', 'locative', 'manner', 'cause'),
  }),
  verb('SEEM', 'seem', 'sembrare', { transitivity: 'intransitive', ...complements('predicative') }),
  // One of the two seeded verbs that license the topic ("thinks about the cat").
  verb('THINK', 'think', 'pensare', { transitivity: 'intransitive', ...complements('topic') }),
  // The verb that licenses the role (P09-E13, P09-E44): "acts as a friend".
  verb('ACT', 'act', 'agire', { transitivity: 'intransitive', ...complements('manner', 'role', 'locative', 'cause', 'instrumental') }),
  // Two of the verbs that license the opponent (P09-E22, P09-E45): "plays against the dog", and a
  // transitive one, "wins the game against the dog".
  verb('PLAY_GAME', 'play', 'giocare', { transitivity: 'intransitive', ...complements('opponent', 'locative') }),
  verb('WIN', 'win', 'vincere', complements('opponent')),
  // The verbs that take a clause as their object (P09-E12 D9): a that-clause, an infinitive.
  verb('SAY', 'say', 'dire', { clauseObject: 'content', clauseForce: 'either' }),
  // Its that-clause is a question, never a statement (P09-E55), as the API serves it.
  verb('ASK', 'ask', 'chiedere', { transitivity: 'ditransitive', clauseObject: 'content', clauseForce: 'interrogative', prepositionalObject: true }),
  // Its that-clause is a statement only (P09-E55): no clauseForce. Its object takes a preposition in
  // some language (it "crede al cane", P09-E54), as the API serves it: no passive wh-question over it.
  verb('BELIEVE', 'believe', 'credere', { clauseObject: 'content', prepositionalObject: true }),
  // Its object takes a preposition in it, fr and pt ("ha bisogno del cane"), as the API serves (P09-E54).
  verb('NEED', 'need', 'avere bisogno', { clauseObject: 'infinitive', prepositionalObject: true }),
  // The copula, the existential's verb (P09-E12 M7): "there is a cat in the house".
  verb('BE', 'be', 'essere', { transitivity: 'intransitive', ...complements('predicative', 'locative', 'cause') }),
  // Two verbs that read "cry" in English: only the id tells them apart.
  verb('CRY', 'cry', 'piangere', { transitivity: 'intransitive', synonym: 'weep' }),
  verb('CRY_OUT', 'cry', 'gridare', { synonym: 'shout' }),
  verb('CAN', 'can', 'potere', { modal: true }),
  verb('MUST', 'must', 'dovere', { modal: true }),
  verb('WILL', 'want', 'volere', { modal: true }),
];

// The kin's verb (P11-E9), out of VERBS as KIN is out of NOUNS.
export const KIN_VERBS = [verb('MARRY', 'marry', 'sposare')];

export const ADJECTIVES = [
  c('BROWN', 'adjective', 'brown', 'marrone'),
  c('OLD', 'adjective', 'old', 'vecchio'),
  c('BIG', 'adjective', 'big', 'grande'),
  c('SEMANTIC', 'adjective', 'semantic', 'semantico'),
  // It governs an infinitive as a predicate, "is happy to run" (P13).
  c('HAPPY', 'adjective', 'happy', 'felice', { clauseObject: 'infinitive' }),
  c('LIGHT_WEIGHT', 'adjective', 'light', 'leggero'),
];

export const ADVERBS = [
  c('FAST', 'adverb', 'fast', 'velocemente'),
  c('NEVER', 'adverb', 'never', 'mai'),
  c('ALWAYS', 'adverb', 'always', 'sempre'),
];

// The period's interjection (P09-E47): HEY, the corpus's one.
export const INTERJECTIONS = [c('HEY', 'interjection', 'hey', 'ehi')];

export const ALL = [...NOUNS, ...KIN, ...PRONOUNS, ...INDEFINITES, ...VERBS, ...KIN_VERBS, ...ADJECTIVES, ...ADVERBS, ...INTERJECTIONS];

export const byId = (id: string): Concept => {
  const hit = ALL.find((x) => x.id === id);
  if (!hit) throw new Error(`no concept ${id}`);
  return hit;
};

const PERSON_NAMES: Record<string, Record<string, string>> = {
  en: { '1': 'first person', '2': 'second person', '3': 'third person', generic: 'impersonal' },
  it: { '1': 'prima persona', '2': 'seconda persona', '3': 'terza persona', generic: 'impersonale' },
};

export function vocabFor(language: LanguageCode = 'en'): Vocabulary {
  return {
    concepts: { noun: [...NOUNS, ...KIN], pronoun: [...PRONOUNS, ...INDEFINITES], verb: [...VERBS, ...KIN_VERBS], adjective: ADJECTIVES, adverb: ADVERBS, interjection: INTERJECTIONS },
    language,
    label: (concept) =>
      concept.role === 'pronoun' && !concept.slot
        ? PERSON_NAMES[language]![concept.id === 'GENERIC_PERSON' ? 'generic' : concept.person!]!
        : concept.labels?.[language] ?? concept.label ?? concept.description,
    gloss: (concept) => (language === 'en' ? concept.synonym : undefined),
  };
}

export const EN = vocabFor('en');
export const IT = vocabFor('it');
