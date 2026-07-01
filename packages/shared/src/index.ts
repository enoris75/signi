export type GrammaticalRole = 'pronoun' | 'noun' | 'verb' | 'adjective' | 'adverb';

export type LanguageCode = 'en' | 'it' | 'fr' | 'de' | 'es' | 'ja' | 'pt';

export type Transitivity = 'intransitive' | 'transitive' | 'ditransitive';

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

/** A single complement noun phrase (e.g. the "the park" in "through the park"). */
export interface ComplementValue {
  concept: string;
  number?: 'singular' | 'plural';
  gender?: 'masc' | 'fem';
  /** Only meaningful for the `route` (path) complement; defaults to `through`. */
  specifier?: PathSpecifier;
}

export interface LexicalEntry {
  conceptId: string;
  language: LanguageCode;
  forms: Record<string, string>;
}

export interface PhrasePlan {
  subject: string;
  subjectNumber?: 'singular' | 'plural';
  subjectGender?: 'masc' | 'fem';
  subjectAdjective?: string;
  subjectAdjective2?: string;
  verb: string;
  verbNegative?: boolean;
  directObject?: string;
  directObjectNumber?: 'singular' | 'plural';
  directObjectGender?: 'masc' | 'fem';
  directObjectAdjective?: string;
  directObjectAdjective2?: string;
  indirectObject?: string;
  indirectObjectNumber?: 'singular' | 'plural';
  indirectObjectGender?: 'masc' | 'fem';
  indirectObjectAdjective?: string;
  indirectObjectAdjective2?: string;
  complements?: Partial<Record<ComplementType, ComplementValue>>;
  modifier?: string;
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
