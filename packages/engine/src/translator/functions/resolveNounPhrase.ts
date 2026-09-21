import type { NounPhrase } from '@signi/shared';
import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { NO_TAKES_SINGULAR, OTHER_REPLACES_INDEFINITE, PLURAL_DETERMINERS, SUPERLATIVE_DEGREES, SUPERLATIVE_MAKES_DEFINITE } from '../translator.consts.js';
import type { LexiconLookup } from '../translator.types.js';
import { antecedentAgreement } from './antecedentAgreement.js';
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
    // A 3rd-person pronoun that names the noun it stands for takes its gender from that noun, the
    // way this language reads it (C20): de *Inhalt* → "ihn", but en "it". Settled here, before the
    // surface is picked, so every slot a pronoun can fill agrees alike. Where the language could
    // only guess (a person of unstated sex in en/ja), the pronoun gives way to a noun phrase.
    const agreed = np.antecedent && head.forms['person'] === '3' && !head.forms['generic']
      ? antecedentAgreement(np, np.antecedent, language, lookup)
      : undefined;
    if (agreed && 'anaphor' in agreed) return resolveNounPhrase(agreed.anaphor, language, lookup);
    // Pronoun: synthesise the correct surface form as 'base' so all engines can use
    // their existing `forms['base']` / `forms['plural']` logic unchanged.
    const number = np.number ?? 'singular';
    const gender = agreed?.gender ?? np.gender ?? 'masc';
    head.forms['number'] = number;
    // Expose the referent's gender for every person: the 1st/2nd-person surface is
    // gender-invariant ("io", "tu"), but Romance participle/adjective agreement still
    // depends on it ("tu sei stato/stata"), so downstream engines need to read it.
    head.forms['gender'] = gender;
    // Keep the furigana reading (if any) in step with whichever surface we select.
    if (number === 'plural') {
      // A language may have a distinct plural pronoun for a gender: the feminine elles / ellas / elas
      // / 彼女ら (and Spanish nosotras / vosotras), and the Japanese neuter それら, which is a group of
      // THINGS where 彼ら is a group of people (A200). Read off the gender in hand, exactly as the
      // singular is a few lines below; a language with no gendered plural carries only `plural`.
      const genderedPlural = head.forms[`plural_${gender}`];
      const pluralSurface = genderedPlural || head.forms['plural'];
      if (pluralSurface) { head.forms['base'] = pluralSurface; head.forms['plural'] = pluralSurface; }
      // The furigana reading follows whichever surface was selected, so a feminine plural reads
      // かのじょら and not the masculine かれら (A161) — as the singular already does below.
      const pluralReading = (genderedPlural && head.forms[`plural_${gender}_reading`]) || head.forms['plural_reading'];
      if (pluralReading) head.forms['reading'] = pluralReading;
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
    // A relative superlative ("most", "least") picks one member out of a set, so the phrase is
    // definite whatever indefinite or bare determiner was picked: "the biggest dog", "il cane più
    // grande", "der größte Hund". Resolved here, once for every language (A175): Italian, Spanish and
    // Portuguese tell the superlative from the comparative by that article alone ("un cane più
    // grande" is "a bigger dog"), and German and French would decline or article it wrong.
    // A proper name ("Europe", "Asia") takes the article its own language fixes, not the one the plan
    // picked: every article builder already ignores `definiteness` for a `proper` head. Resolve that
    // here too, once for every language (A180), so the other readers of `definiteness` agree with the
    // article that is actually rendered — German's adjective declension ("das große Asien", not "das
    // großes Asien"), Spanish's a/de + el contraction ("al Asia grande"), Japanese's quantifier (no
    // "多くのヨーロッパ", and no この/その either, as the other six languages already drop "this"), and the
    // negative concord a `no` would otherwise trigger with no negator to license it ("l'Asie ne brûle.").
    const superlative = (np.adjectives ?? []).some((_, i) => SUPERLATIVE_DEGREES.has(np.adjectiveDegrees?.[i] ?? 'positive'));
    const picked = head.forms['proper'] === '1'
      ? 'definite'
      : superlative && SUPERLATIVE_MAKES_DEFINITE.has(np.definiteness ?? 'definite')
        ? 'definite'
        : np.definiteness ?? 'definite';
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
