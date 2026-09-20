import type { NounPhrase } from '@signi/shared';
import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { NO_TAKES_SINGULAR, OTHER_REPLACES_INDEFINITE, PLURAL_DETERMINERS } from '../translator.consts.js';
import type { LexiconLookup } from '../translator.types.js';
import { applyNounGender } from './applyNounGender.js';
import { resolve } from './resolve.js';
import { resolveRelativeClause } from './resolveRelativeClause.js';

/**
 * Resolve a noun phrase for one language: resolve the head noun/pronoun and apply
 * number/gender (synthesising the pronoun surface form, or applying noun gender),
 * then resolve each adjective. This folds together what used to be four duplicated
 * subject/object/complement blocks.
 */
export function resolveNounPhrase(np: NounPhrase, language: string, lookup: LexiconLookup): ResolvedNounPhrase {
  const head = resolve(np.concept, language, lookup);
  if (head.forms['person']) {
    // Pronoun: synthesise the correct surface form as 'base' so all engines can use
    // their existing `forms['base']` / `forms['plural']` logic unchanged.
    const number = np.number ?? 'singular';
    const gender = np.gender ?? 'masc';
    head.forms['number'] = number;
    // Expose the referent's gender for every person: the 1st/2nd-person surface is
    // gender-invariant ("io", "tu"), but Romance participle/adjective agreement still
    // depends on it ("tu sei stato/stata"), so downstream engines need to read it.
    head.forms['gender'] = gender;
    // Keep the furigana reading (if any) in step with whichever surface we select.
    if (number === 'plural') {
      // French/Spanish/Portuguese have a distinct feminine-plural pronoun (elles / ellas / elas, and
      // Spanish nosotras / vosotras); select it for a feminine referent, else the plain plural.
      // Italian/German/English/Japanese have no gendered plural and carry only `plural`.
      const pluralSurface = (gender === 'fem' && head.forms['plural_fem']) || head.forms['plural'];
      if (pluralSurface) { head.forms['base'] = pluralSurface; head.forms['plural'] = pluralSurface; }
      if (head.forms['plural_reading']) head.forms['reading'] = head.forms['plural_reading'];
    } else if (head.forms['person'] === '3') {
      const gf = head.forms[`singular_${gender}`];
      if (gf) head.forms['base'] = gf;
      const gr = head.forms[`singular_${gender}_reading`];
      if (gr) head.forms['reading'] = gr;
    }
    // 1st / 2nd person singular: base is already the correct form
    // Disjunctive (tonic/oblique) surface for prepositional use ("because of me/her/them"),
    // synthesised for the same number/gender as `base`. Engines that place a pronoun after
    // a preposition read forms['disjunctive'] (falling back to base when absent, e.g. ja).
    const disj =
      number === 'plural'
        ? head.forms['disjunctive_plural'] ?? head.forms['disjunctive']
        : head.forms['person'] === '3'
          ? head.forms[`disjunctive_${gender}`] ?? head.forms['disjunctive']
          : head.forms['disjunctive'];
    if (disj) head.forms['disjunctive'] = disj;
  } else {
    // Noun: apply number then gender. Determiner choice is threaded like number/gender
    // so each engine reads it off forms. Some quantifiers are inherently plural ("many
    // boys", "all boys"), so they force the plural surface — but only when the noun has
    // one (mass nouns like "water" stay singular: "some water").
    const picked = np.definiteness ?? 'definite';
    const definiteness =
      picked === 'indefinite' && OTHER_REPLACES_INDEFINITE.has(language) && np.adjectives?.includes('OTHER')
        ? 'bare'
        : picked;
    // Mass nouns ("water") never pluralise, so quantifiers keep them singular ("much water").
    const forcesPlural = PLURAL_DETERMINERS.has(definiteness) && head.forms['uncountable'] !== '1';
    const forcesSingular = definiteness === 'no' && NO_TAKES_SINGULAR.has(language);
    const num = forcesPlural ? 'plural' : forcesSingular ? 'singular' : (np.number ?? 'singular');
    head.forms['number'] = (num === 'plural' && !head.forms['plural']) ? 'singular' : num;
    applyNounGender(head.forms, np.gender);
    head.forms['definiteness'] = definiteness;
  }
  // An adjective head is the predicate adjective of a subject complement ("seems happy") —
  // the one head that carries a comparative degree of its own. Thread it onto the head's
  // forms exactly as an attributive adjective's is below, so `adjDegree` reads either.
  if (head.forms['role'] === 'adjective' && np.headDegree && np.headDegree !== 'positive') {
    head.forms['degree'] = np.headDegree;
  }
  return {
    head,
    adjectives: (np.adjectives ?? []).map((id, i) => {
      const cf = resolve(id, language, lookup);
      // Thread the per-adjective comparative degree onto its forms (like number/gender/
      // definiteness) so each engine reads it off `forms['degree']`. Omit the plain form.
      const deg = np.adjectiveDegrees?.[i];
      if (deg && deg !== 'positive') cf.forms['degree'] = deg;
      return cf;
    }),
    // Attributive nouns ("sail boat"). Carry the relation through so each engine can
    // pick its linking preposition (Romance) or ignore it (en/de/ja neutralise). Apply
    // the modifier's own number (so Romance engines can select its plural surface and
    // agree its adjectives) and resolve those adjectives against that gender/number.
    nounModifiers: (np.nounModifiers ?? []).map((m) => {
      const concept = resolve(m.concept, language, lookup);
      const number = m.number ?? 'singular';
      // Fall back to singular when the lexicon has no plural surface (so isPlural/surface
      // don't select a missing form) — same guard the head noun uses above.
      concept.forms['number'] = (number === 'plural' && !concept.forms['plural']) ? 'singular' : number;
      return {
        concept,
        relation: m.relation,
        adjectives: (m.adjectives ?? []).map((id) => resolve(id, language, lookup)),
      };
    }),
    // A relative clause is the predicate half of a phrase whose subject is this
    // head. Recursing through resolveNounPhrase (its objects/complements are noun
    // phrases that may themselves carry `relative`) handles arbitrary nesting.
    // The head's own forms reach the clause: they fill its subject slot where the gap is the
    // subject, which a `subject_sense` reads (A157).
    relative: np.relative ? resolveRelativeClause(np.relative, language, lookup, head.forms) : undefined,
    // A possessor is one of two shapes. A pronominal possessor ("his") is pure grammatical
    // features — it needs no lexicon lookup, so it passes straight through for the engine to
    // spell as a possessive pronoun. A genitive possessor is itself a noun phrase; recursing
    // handles its own adjectives, number/gender, and any nested possessor ("the cat's owner's book").
    possessor: np.possessor
      ? (isPronominalPossessor(np.possessor)
          ? np.possessor
          : resolveNounPhrase(np.possessor, language, lookup))
      : undefined,
    // An adjective-definition gloss ("of great size"): a bare dimension-noun + degree-adjective
    // phrase the engines wrap in the preposition its head noun's `dimensionRelation` selects. The
    // flag rides through; the head noun and its adjective resolve on the ordinary path above.
    dimensionGloss: np.dimensionGloss,
    // A manner-definition gloss ("at high speed", "in a good way"): a manner-noun phrase the engines
    // wrap in the adposition its head noun's `mannerRelation` selects, keeping its own determiner.
    // The flag rides through; the head noun and its adjective resolve on the ordinary path above.
    mannerGloss: np.mannerGloss,
  };
}
