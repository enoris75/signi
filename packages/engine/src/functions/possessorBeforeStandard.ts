import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../types.js';

/**
 * Whether a Romance noun phrase writes its postnominal possessor **ahead of** its post-nominal
 * adjectives: when one of them carries an attributive standard or set (P09-E18, P09-E19) and the
 * possessor is a *de*-phrase. Behind the standard the possessor would attach to the standard's noun
 * — "un chat plus grand que le chien de la femme" is *a cat bigger than the woman's dog* (A372), "la
 * maison la plus grande de la ville de la femme" *the biggest house in the woman's city* (A371) — so
 * it follows the noun, in Italian's order: "un chat de la femme plus grand que le chien". A pronominal
 * possessor is prenominal and moves nothing; a possessor question's *de qui* stands in the genitive's
 * slot and moves with it.
 */
export function possessorBeforeStandard(np: ResolvedNounPhrase): boolean {
  return !!np.adjectiveStandard && !!np.possessor && !isPronominalPossessor(np.possessor);
}
