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
];

export const PRONOUNS = [
  c('FIRST_PERSON', 'pronoun', 'I', 'io', { person: '1', description: '1st Person' }),
  c('SECOND_PERSON', 'pronoun', 'you', 'tu', { person: '2', description: '2nd Person' }),
  c('THIRD_PERSON', 'pronoun', 'he', 'lui', { person: '3', description: '3rd Person' }),
  c('GENERIC_PERSON', 'pronoun', 'one', 'si', { person: '3', synonym: 'one', description: 'one (generic person)' }),
];

export const VERBS = [
  verb('EAT', 'eat', 'mangiare', complements('instrumental', 'locative', 'cause')),
  verb('SEE', 'see', 'vedere'),
  verb('LOVE', 'love', 'amare'),
  verb('READ', 'read', 'leggere', complements('terminus')),
  verb('CHOOSE', 'choose', 'scegliere'),
  verb('START', 'start', 'iniziare', complements('instrumental')),
  verb('RUN', 'run', 'correre', {
    transitivity: 'intransitive',
    ...complements('direction', 'source', 'route', 'locative', 'manner', 'cause'),
  }),
  verb('SEEM', 'seem', 'sembrare', { transitivity: 'intransitive', ...complements('predicative') }),
  // Two verbs that read "cry" in English: only the id tells them apart.
  verb('CRY', 'cry', 'piangere', { transitivity: 'intransitive', synonym: 'weep' }),
  verb('CRY_OUT', 'cry', 'gridare', { synonym: 'shout' }),
  verb('CAN', 'can', 'potere', { modal: true }),
  verb('MUST', 'must', 'dovere', { modal: true }),
  verb('WILL', 'want', 'volere', { modal: true }),
];

export const ADJECTIVES = [
  c('BROWN', 'adjective', 'brown', 'marrone'),
  c('OLD', 'adjective', 'old', 'vecchio'),
  c('BIG', 'adjective', 'big', 'grande'),
  c('SEMANTIC', 'adjective', 'semantic', 'semantico'),
  c('HAPPY', 'adjective', 'happy', 'felice'),
  c('LIGHT_WEIGHT', 'adjective', 'light', 'leggero'),
];

export const ADVERBS = [
  c('FAST', 'adverb', 'fast', 'velocemente'),
  c('NEVER', 'adverb', 'never', 'mai'),
  c('ALWAYS', 'adverb', 'always', 'sempre'),
];

export const ALL = [...NOUNS, ...PRONOUNS, ...VERBS, ...ADJECTIVES, ...ADVERBS];

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
    concepts: { noun: NOUNS, pronoun: PRONOUNS, verb: VERBS, adjective: ADJECTIVES, adverb: ADVERBS },
    language,
    label: (concept) =>
      concept.role === 'pronoun'
        ? PERSON_NAMES[language]![concept.id === 'GENERIC_PERSON' ? 'generic' : concept.person!]!
        : concept.labels?.[language] ?? concept.label ?? concept.description,
    gloss: (concept) => (language === 'en' ? concept.synonym : undefined),
  };
}

export const EN = vocabFor('en');
export const IT = vocabFor('it');
