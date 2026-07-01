import type { ComplementType, LanguageCode, PathSpecifier, PhrasePlan } from '@signi/shared';

export interface ConceptForms {
  conceptId: string;
  forms: Record<string, string>;
}

export interface ResolvedPhrase {
  subject: ConceptForms;
  subjectAdjective?: ConceptForms;
  subjectAdjective2?: ConceptForms;
  verb: ConceptForms;
  verbNegative?: boolean;
  directObject?: ConceptForms;
  directObjectAdjective?: ConceptForms;
  directObjectAdjective2?: ConceptForms;
  indirectObject?: ConceptForms;
  indirectObjectAdjective?: ConceptForms;
  indirectObjectAdjective2?: ConceptForms;
  complements?: Partial<Record<ComplementType, ConceptForms>>;
  modifier?: ConceptForms;
}

/** The path relation chosen for a `route` complement; defaults to `through`. */
export function pathSpecifier(c: ConceptForms): PathSpecifier {
  return (c.forms['specifier'] as PathSpecifier) ?? 'through';
}

/** Join the base forms of up to two adjectives into one string ("big red"). */
export function adjString(...adjs: Array<ConceptForms | undefined>): string {
  return adjs
    .map((a) => a?.forms['base'])
    .filter((s): s is string => Boolean(s))
    .join(' ');
}

export interface LanguageEngine {
  language: LanguageCode;
  render(phrase: ResolvedPhrase): string;
}
