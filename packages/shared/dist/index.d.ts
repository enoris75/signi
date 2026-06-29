export type GrammaticalRole = 'pronoun' | 'noun' | 'verb' | 'adjective' | 'adverb';
export type LanguageCode = 'en' | 'it' | 'fr' | 'de' | 'es' | 'ja' | 'pt';
export type Transitivity = 'intransitive' | 'transitive' | 'ditransitive';
export declare const LANGUAGES: Record<LanguageCode, string>;
export interface Concept {
    id: string;
    role: GrammaticalRole;
    description: string;
    label?: string;
    emoji?: string;
    transitivity?: Transitivity;
    person?: '1' | '2' | '3';
    number?: 'singular' | 'plural';
    gendered?: boolean;
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
//# sourceMappingURL=index.d.ts.map