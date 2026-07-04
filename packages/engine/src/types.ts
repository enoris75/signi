import type { ComplementType, LanguageCode, PathSpecifier, RubySegment, Specifier, Tense } from '@signi/shared';

export type { RubySegment };

export interface ConceptForms {
  conceptId: string;
  forms: Record<string, string>;
}

/** A resolved noun phrase: its head noun/pronoun plus its resolved adjectives. */
export interface ResolvedNounPhrase {
  head: ConceptForms;
  adjectives: ConceptForms[];
}

/** A resolved verb phrase: the verb, negation flag, tense, and resolved adverb. */
export interface ResolvedVerbPhrase {
  verb: ConceptForms;
  negative?: boolean;
  tense?: Tense;
  modifier?: ConceptForms;
}

/** A resolved complement: its noun phrase plus any specifiers (plain data). */
export interface ResolvedComplement {
  phrase: ResolvedNounPhrase;
  specifiers?: Specifier[];
}

export interface ResolvedPhrase {
  subject: ResolvedNounPhrase;
  verbPhrase: ResolvedVerbPhrase;
  directObject?: ResolvedNounPhrase;
  indirectObject?: ResolvedNounPhrase;
  complements?: Partial<Record<ComplementType, ResolvedComplement>>;
}

/** The path relation chosen for a `route` complement; defaults to `through`. */
export function pathSpecifier(c: ResolvedComplement): PathSpecifier {
  return c.specifiers?.find((s) => s.kind === 'path')?.value ?? 'through';
}

/** Join the base forms of any number of adjectives into one string ("big red"). */
export function adjString(...adjs: Array<ConceptForms | undefined>): string {
  return adjs
    .map((a) => a?.forms['base'])
    .filter((s): s is string => Boolean(s))
    .join(' ');
}

/** Join a resolved noun phrase's adjectives into one string ("big red"). */
export function npAdj(np: ResolvedNounPhrase): string {
  return adjString(...np.adjectives);
}

export interface LanguageEngine {
  language: LanguageCode;
  render(phrase: ResolvedPhrase): string;
  /**
   * Optional ruby (furigana) rendering: the same surface as `render`, split into
   * segments carrying kana readings. Implemented only by languages with furigana (ja).
   */
  renderRuby?(phrase: ResolvedPhrase): RubySegment[];
}
