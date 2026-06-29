export type GrammaticalRole = 'pronoun' | 'noun' | 'verb' | 'adjective' | 'adverb';
export type LanguageCode = 'en' | 'it' | 'fr' | 'de' | 'es' | 'ja' | 'pt';
export declare const LANGUAGES: Record<LanguageCode, string>;
export interface Concept {
    id: string;
    role: GrammaticalRole;
    description: string;
    emoji?: string;
}
/** All surface forms for a concept in one language */
export interface LexicalEntry {
    conceptId: string;
    language: LanguageCode;
    forms: Record<string, string>;
}
/**
 * A semantic phrase plan: the meaning the user has composed.
 * All fields reference concept IDs.
 */
export interface PhrasePlan {
    subject: string;
    verb: string;
    object?: string;
    modifier?: string;
}
/** One language rendering */
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
//# sourceMappingURL=index.d.ts.map