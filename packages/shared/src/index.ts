export type GrammaticalRole = 'pronoun' | 'noun' | 'verb' | 'adjective' | 'adverb';

export type LanguageCode = 'en' | 'it' | 'fr' | 'de' | 'es' | 'ja' | 'pt';

export type Transitivity = 'intransitive' | 'transitive' | 'ditransitive';

/**
 * Verb tense the phrase is rendered in. Only the simple tenses today; the
 * imperfect/continuous aspect is reserved for a later split of `past`.
 */
export type Tense = 'present' | 'past' | 'future';

export const TENSES: Tense[] = ['present', 'past', 'future'];

export const TENSE_LABELS: Record<Tense, string> = {
  present: 'Present',
  past: 'Past',
  future: 'Future',
};

/**
 * Semantic complement types — the "varieties" of indirect object a verb can
 * license. English collapses these into a single category, but each takes a
 * distinct adposition (and case, in German) across languages. Verbs declare
 * which they support via `Concept.complements`.
 */
export type ComplementType = 'locative' | 'direction' | 'source' | 'route';

/** Canonical UI order (matches how complements are presented to the user). */
export const COMPLEMENT_TYPES: ComplementType[] = ['locative', 'direction', 'source', 'route'];

/**
 * Order in which active complements are rendered within a sentence. Follows the
 * natural path reading "from X to Y through Z", with the static locative last.
 */
export const COMPLEMENT_RENDER_ORDER: ComplementType[] = ['source', 'direction', 'route', 'locative'];

export const COMPLEMENT_LABELS: Record<ComplementType, string> = {
  locative: 'Locative',
  direction: 'Direction',
  source: 'Source',
  route: 'Route',
};

/**
 * Spatial relations a `route` (path) complement can express. English needs a
 * distinct preposition for each ("through" vs "over" vs "around"); every
 * language maps these to its own adposition (and case, in German). Only the
 * `route` complement carries a specifier; it defaults to `through`.
 */
export type PathSpecifier = 'through' | 'under' | 'over' | 'around' | 'behind' | 'in_front_of';

export const PATH_SPECIFIERS: PathSpecifier[] = ['through', 'under', 'over', 'around', 'behind', 'in_front_of'];

export const PATH_SPECIFIER_LABELS: Record<PathSpecifier, string> = {
  through: 'through',
  under: 'under',
  over: 'over',
  around: 'around',
  behind: 'behind',
  in_front_of: 'in front of',
};

export const LANGUAGES: Record<LanguageCode, string> = {
  en: 'English',
  it: 'Italian',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
  ja: 'Japanese',
  pt: 'Portuguese',
};

export interface Concept {
  id: string;
  role: GrammaticalRole;
  description: string;
  label?: string;              // English base form, e.g. "cat", "eat", "I"
  emoji?: string;
  transitivity?: Transitivity; // only set for verbs
  person?: '1' | '2' | '3';   // only set for pronouns
  number?: 'singular' | 'plural'; // inherent grammatical number, only set for pronouns
  gendered?: boolean;           // noun has distinct masc/fem surface forms
  complements?: ComplementType[]; // motion/locative complements a verb licenses
}

/**
 * A noun phrase: a core noun or pronoun, optionally modified by adjectives, and
 * carrying its own number/gender. Subjects and objects are all noun phrases.
 */
export interface NounPhrase {
  concept: string;                 // core noun or pronoun id
  number?: 'singular' | 'plural';
  gender?: 'masc' | 'fem';
  /** Adjective ids, in order. The UI supplies up to two today; the model is uncapped. */
  adjectives?: string[];
}

/** The predicate head: a core verb, optional negation, and an optional adverb. */
export interface VerbPhrase {
  verb: string;                    // core verb id
  negative?: boolean;
  modifier?: string;               // adverb id
  tense?: Tense;                   // defaults to 'present'
}

/**
 * A specifier attached to a complement. Discriminated by `kind`; today the only
 * kind is `path` (the route complement's spatial relation), but new specifier
 * families can be added as further members of the union.
 */
export type Specifier = { kind: 'path'; value: PathSpecifier };

/**
 * A complement: a noun phrase plus zero or more specifiers. Not every complement
 * takes a specifier, and not every specifier is a `PathSpecifier`.
 */
export interface Complement {
  phrase: NounPhrase;
  specifiers?: Specifier[];
}

export interface LexicalEntry {
  conceptId: string;
  language: LanguageCode;
  forms: Record<string, string>;
}

export interface PhrasePlan {
  subject: NounPhrase;
  verbPhrase: VerbPhrase;
  directObject?: NounPhrase;
  indirectObject?: NounPhrase;
  complements?: Partial<Record<ComplementType, Complement>>;
}

export interface Translation {
  language: LanguageCode;
  text: string;
}

export interface TranslateRequest {
  plan: PhrasePlan;
}

export interface TranslateResponse {
  translations: Translation[];
}

export interface ConceptsResponse {
  concepts: Concept[];
}
