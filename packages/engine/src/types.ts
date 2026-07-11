import type { Aspect, CauseSentiment, ComplementType, CoordConjunction, Degree, LanguageCode, ModifierRelation, PathSpecifier, RubySegment, Specifier, Tense } from '@signi/shared';

export type { RubySegment };

export interface ConceptForms {
  conceptId: string;
  forms: Record<string, string>;
}

/** A resolved noun-modifier: the attributive noun's forms plus its semantic relation. */
export interface ResolvedNounModifier {
  concept: ConceptForms;
  relation: ModifierRelation;
  /**
   * Adjectives modifying the attributive noun itself. Resolved for the modifier's own
   * gender/number (which the translator sets on `concept.forms`) so each engine agrees
   * them against the modifier, not the head ("creatore di frasi **semantiche**").
   */
  adjectives: ConceptForms[];
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

/**
 * Verb mood, set by the translator. For a hypothetical conditional the main clause's verb is
 * `'conditional'` ("would run") and the "if" clause's verb is `'subjunctive'` (past /
 * imperfect-subjunctive, "if the cat ate"). For a command the verb is `'imperative'` ("eat!",
 * "don't run!"), the subject is dropped from the surface, and the subject's person/number
 * selects the imperative form (2sg default, 1pl "let's…", 2pl). Absent ⇒ plain `'indicative'`.
 * Each engine maps this onto its own conditional / subjunctive / imperative forms.
 */
export type Mood = 'indicative' | 'conditional' | 'subjunctive' | 'imperative';

/** A resolved verb phrase: the verb, negation flag, tense, aspect, mood, and resolved adverb. */
export interface ResolvedVerbPhrase {
  verb: ConceptForms;
  negative?: boolean;
  tense?: Tense;
  aspect?: Aspect;
  mood?: Mood;
  modifier?: ConceptForms;
  /** Resolved modal verbs governing the predicate, outermost first (see VerbPhrase.modals). */
  modals: ConceptForms[];
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
  /**
   * A resolved hypothetical condition (the "if" clause). When present this phrase is the
   * main clause of a conditional (its verb resolved in the `'conditional'` mood) and
   * `condition` is the protasis (its verb resolved in the `'subjunctive'` mood). Engines
   * render it as "<if-word> <condition>, <main>".
   */
  condition?: ResolvedPhrase;
  /**
   * A resolved coordinated second clause plus the conjunction linking it to this one. When
   * present the engines render "<this clause> <conjunction-word> <coordination.clause>". Both
   * clauses are plain indicative; the coordinated clause is not itself coordinated.
   */
  coordination?: { conjunction: CoordConjunction; clause: ResolvedPhrase };
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

/**
 * The words of a modal chain, outermost first, up to (but not including) the verb group it
 * governs: the outermost modal in the finite form `finite` builds (it alone carries tense,
 * agreement, and negation), then each inner modal's `nonfinite` form. Every modal is followed
 * by its `link` particle when it has one — English "want **to** go"; the Romance and German
 * modals govern a bare infinitive and set none. Shared by the five engines whose modals are
 * ordinary pre-infinitival verbs (en/it/fr/es/pt); German stacks its infinitives clause-finally
 * and Japanese suffixes them, so both build their own chain.
 */
export function modalChain(
  modals: ConceptForms[],
  finite: (m: ConceptForms) => string,
): string[] {
  const words: string[] = [];
  modals.forEach((m, i) => {
    words.push(i === 0 ? finite(m) : (m.forms['nonfinite'] ?? m.forms['base'] ?? ''));
    if (m.forms['link']) words.push(m.forms['link']);
  });
  return words.filter(Boolean);
}

export interface LanguageEngine {
  language: LanguageCode;
  render(phrase: ResolvedPhrase): string;
  /**
   * Optional ruby (furigana) rendering: the same surface as `render`, split into
   * segments carrying kana readings. Implemented only by languages with furigana (ja).
   */
  renderRuby?(phrase: ResolvedPhrase): RubySegment[];
  /** The full stop closing a rendered sentence. Defaults to '.'; ja overrides it with '。'. */
  terminator?: string;
}
