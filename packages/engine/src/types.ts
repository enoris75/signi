import type { CauseSentiment, ComplementType, Degree, LanguageCode, ModifierRelation, PathSpecifier, RubySegment, Specifier, Tense } from '@signi/shared';

export type { RubySegment };

export interface ConceptForms {
  conceptId: string;
  forms: Record<string, string>;
}

/** A resolved noun-modifier: the attributive noun's forms plus its semantic relation. */
export interface ResolvedNounModifier {
  concept: ConceptForms;
  relation: ModifierRelation;
}

/** A resolved noun phrase: its head noun/pronoun plus its resolved adjectives. */
export interface ResolvedNounPhrase {
  head: ConceptForms;
  adjectives: ConceptForms[];
  /** Resolved attributive nouns ("sail boat"); relation drives the Romance preposition. */
  nounModifiers: ResolvedNounModifier[];
  /** A resolved relative clause; the head above is implicitly its subject. */
  relative?: ResolvedRelativeClause;
  /** A resolved possessing noun phrase (Saxon genitive): "the cat's book" → "the cat". */
  possessor?: ResolvedNounPhrase;
}

/** A resolved verb phrase: the verb, negation flag, tense, and resolved adverb. */
export interface ResolvedVerbPhrase {
  verb: ConceptForms;
  negative?: boolean;
  tense?: Tense;
  modifier?: ConceptForms;
}

/**
 * A resolved relative clause: a full predicate (verb + objects + complements) in
 * which the head noun phrase fills the slot named by `headRole` (the "gap"). For a
 * subject-relative (`headRole === 'subject'`) the head drives verb agreement and
 * `subject` is undefined; otherwise the clause carries its own resolved `subject`
 * (which drives agreement) and the `headRole` slot is left undefined.
 */
export interface ResolvedRelativeClause {
  headRole: 'subject' | 'directObject' | 'indirectObject' | ComplementType;
  subject?: ResolvedNounPhrase;
  verbPhrase: ResolvedVerbPhrase;
  directObject?: ResolvedNounPhrase;
  indirectObject?: ResolvedNounPhrase;
  complements?: Partial<Record<ComplementType, ResolvedComplement>>;
}

/** A resolved complement: its noun phrase plus any specifiers (plain data). */
export interface ResolvedComplement {
  phrase: ResolvedNounPhrase;
  specifiers?: Specifier[];
}

export interface ResolvedPhrase {
  subject: ResolvedNounPhrase;
  // Absent for a verbless period (a bare noun phrase — see PhrasePlan.verbPhrase).
  verbPhrase?: ResolvedVerbPhrase;
  directObject?: ResolvedNounPhrase;
  indirectObject?: ResolvedNounPhrase;
  complements?: Partial<Record<ComplementType, ResolvedComplement>>;
}

/** The path relation chosen for a `route` complement; defaults to `through`. */
export function pathSpecifier(c: ResolvedComplement): PathSpecifier {
  return c.specifiers?.find((s) => s.kind === 'path')?.value ?? 'through';
}

/** The affective stance chosen for a `cause` complement; defaults to `neutral`. */
export function causeSentiment(c: ResolvedComplement): CauseSentiment {
  return c.specifiers?.find((s) => s.kind === 'sentiment')?.value ?? 'neutral';
}

/**
 * The comparative degree threaded onto a resolved adjective's forms (see the translator).
 * Absent ⇒ the plain, unmarked `positive` form. Each engine maps this to its own degree
 * words / morphology.
 */
export function adjDegree(a: ConceptForms): Degree {
  return (a.forms['degree'] as Degree | undefined) ?? 'positive';
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
