import { indefiniteArticle } from './indefiniteArticle.js';
import { withApproximator } from '../../functions/withApproximator.js';

/**
 * The determiner for a noun phrase, from its `definiteness` (default 'definite'):
 * "the", "a/an", nothing (bare), a demonstrative (this/these, that/those), or a quantifier
 * (some/no/many/few/all, and P09-E25's each/every/both/most/several/enough/such). "a" vs "an" is chosen on the sound of `lead` — the first word that
 * will actually follow the article (an adjective if present, else the noun) — and an
 * indefinite plural is bare ("a wolf" → plural "wolves"). Returns the determiner with a
 * trailing space, or "" for bare.
 */
export function determiner(forms: Record<string, string>, lead: string, superlative = false): string {
  // "almost all", "quasi tutti" (P09-E38): the approximator stands before whatever determiner is spelled.
  return withApproximator(forms, baseDeterminer(forms, lead, superlative));
}

function baseDeterminer(forms: Record<string, string>, lead: string, superlative = false): string {
  // A proper noun ("Africa") takes no article in English, whatever determiner was picked — except
  // under a superlative, which brings the article back ("the biggest Europe", A183). The positive and
  // the comparative stay bare ("big Europe", "bigger Europe").
  if (forms['proper'] === '1') return superlative ? 'the ' : '';
  const definiteness = forms['definiteness'] ?? 'definite';
  // English superlatives are inherently definite ("THE biggest cat"), so an indefinite or bare
  // determiner is ungrammatical with one ("a biggest cat", "biggest cats"). Force "the". The
  // other determiners (demonstratives, quantifiers, and a possessor which replaces the article
  // upstream) are already definite and read correctly with a superlative, so leave them.
  // The translator already resolves a plan's superlative as definite for every language (A175,
  // `resolveNounPhrase`). This guard still catches the phrases made bare after that: the measure
  // manner ("at the highest speed", `resolveComplements`) and the shouted alarm ("cries the biggest
  // wolf", `predicateParts`).
  if (superlative && (definiteness === 'indefinite' || definiteness === 'bare')) return 'the ';
  const mass = forms['uncountable'] === '1';
  // A demonstrative agrees with the phrase's number ("this boy" / "these boys"); a mass
  // noun never pluralises, so it always takes the singular ("this water").
  const plural = (forms['number'] ?? forms['count']) === 'plural';
  switch (definiteness) {
    case 'bare':  return '';
    case 'this':  return plural ? 'these ' : 'this ';
    case 'that':  return plural ? 'those ' : 'that ';
    case 'some':  return 'some ';
    case 'no':    return 'no ';
    case 'any':   return 'any '; // the NPI a `no` object switches to when the clause is negated elsewhere
    case 'many':  return mass ? 'much ' : 'many ';   // mass: much water
    case 'few':   return mass ? 'little ' : 'few ';  // mass: little water
    case 'all':   return 'all ';
    // P09-E25. The number each takes is settled upstream (each/every singular, both/most/several/
    // enough plural on a count noun); only "such" adds a word of its own, the indefinite article
    // a singular count noun still needs after it ("such a cat", "such cats", "such food").
    case 'each':    return 'each ';
    case 'every':   return 'every ';
    case 'both':    return 'both ';
    case 'most':    return 'most ';
    case 'several': return 'several ';
    case 'enough':  return 'enough ';
    case 'such':    return plural || mass ? 'such ' : `such ${indefiniteArticle(lead)} `;
    case 'indefinite': {
      if (mass) return '';                            // no "a water" — bare
      const count = forms['number'] ?? forms['count'] ?? 'singular';
      if (count === 'plural') return '';
      return `${indefiniteArticle(lead)} `;
    }
    default:      return 'the ';
  }
}
