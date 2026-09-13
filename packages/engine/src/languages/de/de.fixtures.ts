import type { ComplementType, CoordConjunction, ModifierRelation, Specifier } from '@signi/shared';
import type { ConceptForms, ResolvedComplement, ResolvedModal, ResolvedNounElement, ResolvedNounModifier, ResolvedNounPhrase, ResolvedPhrase, ResolvedVerbPhrase } from '../../types.js';

// Hand-built resolved inputs for the German function-level unit tests. The forms mirror the seeded
// German lexicon (packages/backend/src/concepts) plus the keys the lexicon and translator thread
// onto them (animate, uncountable, proper, role, definiteness, number, degree…), trimmed to what the
// functions read — so each test shows exactly which forms drive its output. Rendering through the
// real lexicon is covered by the sentence-level suite in packages/engine/test.

export type Forms = Record<string, string>;

// ── Lexicon ─────────────────────────────────────────────────────────────────

export const KATER: Forms = { base: 'Kater', plural: 'Kater', gender: 'masc', count: 'singular', animate: '1' };
export const KATZE: Forms = { base: 'Katze', plural: 'Katzen', gender: 'fem', count: 'singular', animate: '1' };
export const MAUS: Forms = { base: 'Maus', plural: 'Mäuse', gender: 'fem', count: 'singular', animate: '1' };
export const MANN: Forms = { base: 'Mann', plural: 'Männer', gender: 'masc', count: 'singular', animate: '1' };
/** A weak masculine (n-declension) noun. */
export const JUNGE: Forms = { base: 'Junge', plural: 'Jungen', gender: 'masc', count: 'singular', weak: '1', animate: '1' };
export const BUCH: Forms = { base: 'Buch', plural: 'Bücher', gender: 'neut', count: 'singular' };
export const HAUS: Forms = { base: 'Haus', plural: 'Häuser', gender: 'neut', count: 'singular' };
export const WORT: Forms = { base: 'Wort', plural: 'Wörter', gender: 'neut', count: 'singular' };
export const BEHAELTER: Forms = { base: 'Behälter', plural: 'Behälter', gender: 'masc', count: 'singular' };
export const MESSER: Forms = { base: 'Messer', plural: 'Messer', gender: 'neut', count: 'singular' };
export const BOOT: Forms = { base: 'Boot', plural: 'Boote', gender: 'neut', count: 'singular' };
export const SEGEL: Forms = { base: 'Segel', plural: 'Segel', gender: 'neut', count: 'singular' };
/** A mass noun. */
export const WASSER: Forms = { base: 'Wasser', gender: 'neut', count: 'singular', uncountable: '1' };
/** A proper name that goes bare. */
export const EUROPA: Forms = { base: 'Europa', gender: 'neut', count: 'singular', proper: '1' };
/** A proper name that is inherently articled. */
export const SCHWEIZ: Forms = { base: 'Schweiz', gender: 'fem', count: 'singular', proper: '1', takes_article: '1' };
export const GESCHWINDIGKEIT: Forms = { base: 'Geschwindigkeit', plural: 'Geschwindigkeiten', gender: 'fem', count: 'singular', mannerRelation: 'measure' };
/** An uncountable means noun ("mit Sorgfalt"). */
export const SORGFALT: Forms = { base: 'Sorgfalt', gender: 'fem', count: 'singular', uncountable: '1', mannerRelation: 'means' };
export const WEISE: Forms = { base: 'Weise', plural: 'Weisen', gender: 'fem', count: 'singular', mannerRelation: 'mode' };
export const WIND: Forms = { base: 'Wind', plural: 'Winde', gender: 'masc', count: 'singular' };
export const GROESSE: Forms = { base: 'Größe', plural: 'Größen', gender: 'fem', count: 'singular', dimensionRelation: 'extent' };
export const QUALITAET: Forms = { base: 'Qualität', plural: 'Qualitäten', gender: 'fem', count: 'singular', dimensionRelation: 'quality' };

export const ICH: Forms = { base: 'ich', person: '1', number: 'singular', plural: 'wir', disjunctive: 'mir', object: 'mich', object_plural: 'uns' };
export const DU: Forms = { base: 'du', person: '2', number: 'singular', plural: 'ihr', disjunctive: 'dir', object: 'dich', object_plural: 'euch' };
export const ER: Forms = { base: 'er', person: '3', number: 'singular', gender: 'masc', plural: 'sie', disjunctive: 'ihm', object: 'ihn', object_fem: 'sie', object_neut: 'es', object_plural: 'sie' };
export const MAN: Forms = { base: 'man', person: '3', number: 'singular', generic: '1' };

export const GROSS: Forms = { role: 'adjective', base: 'groß', umlaut: 'true', superlative: 'größt' };
export const KLEIN: Forms = { role: 'adjective', base: 'klein' };
export const GUT: Forms = { role: 'adjective', base: 'gut', comparative: 'besser', superlative: 'best' };
export const HOCH: Forms = { role: 'adjective', base: 'hoch', attributive: 'hoh' };
export const MUEDE: Forms = { role: 'adjective', base: 'müde' };
export const ALT: Forms = { role: 'adjective', base: 'alt', umlaut: 'true' };

export const SCHNELL: Forms = { base: 'schnell' };
export const IMMER: Forms = { base: 'immer', subtype: 'frequency' };
export const NIE: Forms = { base: 'nie', subtype: 'frequency', polarity: 'negative' };

export const ESSEN: Forms = {
  base: 'essen', participle: 'gegessen',
  '1sg_present': 'esse', '2sg_present': 'isst', '3sg_present': 'isst',
  '1pl_present': 'essen', '2pl_present': 'esst', '3pl_present': 'essen',
  '1sg_past': 'aß', '2sg_past': 'aßest', '3sg_past': 'aß',
  '1pl_past': 'aßen', '2pl_past': 'aßt', '3pl_past': 'aßen',
};
/** A sein-selecting verb ("ist gegangen"). */
export const GEHEN: Forms = {
  base: 'gehen', participle: 'gegangen', aux: 'be',
  '1sg_present': 'gehe', '2sg_present': 'gehst', '3sg_present': 'geht',
  '1pl_present': 'gehen', '2pl_present': 'geht', '3pl_present': 'gehen',
  '3sg_past': 'ging', '3pl_past': 'gingen',
};
export const GEBEN: Forms = {
  base: 'geben', participle: 'gegeben',
  '1sg_present': 'gebe', '2sg_present': 'gibst', '3sg_present': 'gibt',
  '1pl_present': 'geben', '2pl_present': 'gebt', '3pl_present': 'geben',
};
export const SCHNEIDEN: Forms = { base: 'schneiden', participle: 'geschnitten', '3sg_present': 'schneidet' };
export const WAEHLEN: Forms = { base: 'wählen', participle: 'gewählt', '3sg_present': 'wählt' };
export const WERDEN_VERB: Forms = { base: 'werden', participle: 'geworden', aux: 'be', '3sg_present': 'wird' };
export const MUESSEN: Forms = { base: 'müssen', '1sg_present': 'muss', '3sg_present': 'muss', '3pl_present': 'müssen', '3sg_past': 'musste' };
export const KOENNEN: Forms = { base: 'können', '3sg_present': 'kann' };
export const WOLLEN: Forms = { base: 'wollen', '3sg_present': 'will' };

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
 * A noun slot: one conjunct agrees as itself; several agree as a group (3rd plural, masculine unless
 * every conjunct is feminine), joined by `conjunction` (default 'and').
 */
export function el(first: ResolvedNounPhrase, ...others: ResolvedNounPhrase[]): ResolvedNounElement {
  if (others.length === 0) return { conjuncts: [first], agreement: first.head.forms };
  return { conjuncts: [first, ...others], conjunction: 'and', agreement: { person: '3', number: 'plural' } };
}

/** A coordinated noun slot with an explicit conjunction. */
export function group(conjunction: CoordConjunction, ...conjuncts: ResolvedNounPhrase[]): ResolvedNounElement {
  return { ...el(conjuncts[0], ...conjuncts.slice(1)), conjunction };
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
