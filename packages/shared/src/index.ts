export type GrammaticalRole = 'pronoun' | 'noun' | 'verb' | 'adjective' | 'adverb';

export type LanguageCode = 'en' | 'it' | 'fr' | 'de' | 'es' | 'ja' | 'pt';

export type Transitivity = 'intransitive' | 'transitive' | 'ditransitive';

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
  verb: string;
  verbNegative?: boolean;
  directObject?: string;
  directObjectNumber?: 'singular' | 'plural';
  directObjectGender?: 'masc' | 'fem';
  indirectObject?: string;
  indirectObjectNumber?: 'singular' | 'plural';
  indirectObjectGender?: 'masc' | 'fem';
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
