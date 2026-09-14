import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../types.js';

/**
 * A noun phrase's head forms as its determiner builders read them. A pronominal possessor fills the
 * determiner slot, so the picked determiner gives way to `definiteness`: "definite" where the
 * possessive rides on the definite article, which the complement's preposition then fuses with
 * (Italian "nella mia casa", Portuguese "na minha casa"), and "bare" where the possessive replaces
 * the article and the preposition stands alone (French "dans ma maison", Spanish "en mi casa", German
 * "in meinem Haus"). Any other noun phrase's forms are returned as they are.
 */
export function possessedHeadForms(np: ResolvedNounPhrase, definiteness: 'definite' | 'bare'): Record<string, string> {
  return np.possessor && isPronominalPossessor(np.possessor) ? { ...np.head.forms, definiteness } : np.head.forms;
}
