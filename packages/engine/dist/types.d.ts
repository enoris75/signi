import type { LanguageCode } from '@signi/shared';
export interface ConceptForms {
    conceptId: string;
    forms: Record<string, string>;
}
export interface ResolvedPhrase {
    subject: ConceptForms;
    subjectAdjective?: ConceptForms;
    verb: ConceptForms;
    directObject?: ConceptForms;
    indirectObject?: ConceptForms;
    modifier?: ConceptForms;
}
export interface LanguageEngine {
    language: LanguageCode;
    render(phrase: ResolvedPhrase): string;
}
//# sourceMappingURL=types.d.ts.map