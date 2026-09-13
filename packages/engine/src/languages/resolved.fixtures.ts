import type { ComplementType, CoordConjunction, ModifierRelation, Specifier } from '@signi/shared';
import type { ConceptForms, ResolvedComplement, ResolvedModal, ResolvedNounElement, ResolvedNounModifier, ResolvedNounPhrase, ResolvedPhrase, ResolvedVerbPhrase } from '../types.js';

// Language-neutral builders for the function-level unit tests of every language engine. They
// build the *resolved* shapes the engines receive (what the translator hands them), so a test
// states exactly the forms that drive its output. Each language's `<lang>.fixtures.ts` re-exports
// these alongside its own lexicon entries.

export type Forms = Record<string, string>;

// ── Builders ────────────────────────────────────────────────────────────────

/** A resolved concept: a copy of `forms` (so a test can't leak edits into the shared entries). */
export function concept(forms: Forms, conceptId = 'TEST'): ConceptForms {
  return { conceptId, forms: { ...forms } };
}

/** A resolved noun phrase headed by `forms`, with `extra` forms merged onto the head. */
export function np(forms: Forms, extra: Forms = {}, rest: Partial<Omit<ResolvedNounPhrase, 'head'>> = {}): ResolvedNounPhrase {
  return { head: concept({ ...forms, ...extra }), adjectives: [], nounModifiers: [], ...rest };
}

/** A resolved attributive noun ("Segel" in "Segelboot"), optionally carrying its own adjectives. */
export function nounModifier(forms: Forms, adjectives: ConceptForms[] = [], relation: ModifierRelation = 'feature'): ResolvedNounModifier {
  return { concept: concept(forms), relation, adjectives };
}

/** A resolved adjective concept, with `extra` forms (e.g. `{ degree: 'more' }`). */
export function adj(forms: Forms, extra: Forms = {}): ConceptForms {
  return concept({ ...forms, ...extra });
}

/**
 * A noun slot joined by "and": one conjunct agrees as itself; several agree as a group, the way the
 * translator resolves it — plural, the lowest person among them, feminine only if every conjunct is.
 */
export function el(first: ResolvedNounPhrase, ...others: ResolvedNounPhrase[]): ResolvedNounElement {
  return others.length === 0 ? { conjuncts: [first], agreement: first.head.forms } : group('and', first, ...others);
}

/**
 * A coordinated noun slot with an explicit conjunction. "and" resolves group agreement (see `el`);
 * any other conjunction agrees with the last conjunct, the one nearest the verb. A `no`-determined
 * conjunct marks the whole group negative, as the translator does.
 */
export function group(conjunction: CoordConjunction, ...conjuncts: ResolvedNounPhrase[]): ResolvedNounElement {
  const forms = conjuncts.map((c) => c.head.forms);
  const last = forms[forms.length - 1];
  const agreement: Forms = conjunction === 'and'
    ? {
        person: ['1', '2', '3'].find((p) => forms.some((f) => (f['person'] ?? '3') === p)) ?? '3',
        number: 'plural',
        gender: forms.every((f) => f['gender'] === 'fem') ? 'fem' : 'masc',
      }
    : Object.fromEntries((['person', 'number', 'gender'] as const).filter((k) => last[k] !== undefined).map((k) => [k, last[k]]));
  if (forms.some((f) => f['definiteness'] === 'no')) agreement['definiteness'] = 'no';
  return { conjuncts, conjunction, agreement };
}

/** A resolved verb phrase (no modals unless given). */
export function vp(forms: Forms, extra: Partial<Omit<ResolvedVerbPhrase, 'verb'>> = {}, conceptId = 'TEST'): ResolvedVerbPhrase {
  return { verb: concept(forms, conceptId), modals: [], ...extra };
}

/** A resolved modal link, optionally with its own adverb. */
export function modal(forms: Forms, modifier?: Forms): ResolvedModal {
  return { verb: concept(forms), ...(modifier ? { modifier: concept(modifier) } : {}) };
}

/** A resolved complement over a noun slot, with optional specifiers and action. */
export function complement(
  phrase: ResolvedNounPhrase | ResolvedNounElement,
  specifiers: Specifier[] = [],
  action?: ResolvedVerbPhrase,
): ResolvedComplement {
  const element = 'conjuncts' in phrase ? phrase : el(phrase);
  return { phrase: element, ...(specifiers.length ? { specifiers } : {}), ...(action ? { action } : {}) };
}

/** A complements map. */
export function complements(
  map: Partial<Record<ComplementType, ResolvedComplement>>,
): Partial<Record<ComplementType, ResolvedComplement>> {
  return map;
}

/** A resolved clause: `subject` (a phrase or a slot), an optional verb phrase, and anything else. */
export function clause(
  subject: ResolvedNounPhrase | ResolvedNounElement,
  verbPhrase?: ResolvedVerbPhrase,
  rest: Partial<Omit<ResolvedPhrase, 'subject' | 'verbPhrase'>> = {},
): ResolvedPhrase {
  return { subject: 'conjuncts' in subject ? subject : el(subject), ...(verbPhrase ? { verbPhrase } : {}), ...rest };
}
