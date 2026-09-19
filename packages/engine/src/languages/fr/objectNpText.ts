import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { npText } from './npText.js';
import { objectArtFor } from './objectArtFor.js';
import { renderNP } from './renderNP.js';

/**
 * One direct-object conjunct as a noun phrase, its determiner chosen by `objectArtFor`: "des souris"
 * for a bare plural, "de souris" when `negated`. A possessive stands in for the article whatever the
 * polarity ("ne mange pas sa souris"), so a possessed object renders as any other noun phrase does.
 */
export function objectNpText(np: ResolvedNounPhrase, negated: boolean): string {
  if (np.possessor && isPronominalPossessor(np.possessor)) return npText(np);
  return renderNP(np, (plural, lead) => objectArtFor(np.head.forms, plural, lead, negated));
}
