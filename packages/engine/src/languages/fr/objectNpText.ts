import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { ownHeadForms } from '../../functions/possessedHeadForms.js';
import { keptBesidePossessive } from '../../possessive.js';
import { npText } from './npText.js';
import { objectArtFor } from './objectArtFor.js';
import { renderNP } from './renderNP.js';

/**
 * One direct-object conjunct as a noun phrase, its determiner chosen by `objectArtFor`: "des souris"
 * for a bare plural, "de souris" when `negated`. A possessive stands in for the article whatever the
 * polarity ("ne mange pas sa souris"), so a possessed object renders as any other noun phrase does.
 *
 * A determiner kept beside a detached possessive is the object's own, though, and a negation turns
 * its indefinite or partitive article into "de" as it would without the possessive: "ne voit pas
 * d'ami à moi", "ne boit pas d'eau à moi" (A327). `objectArtFor` leaves "cet", "aucun" and
 * "quelques" as they are.
 */
export function objectNpText(np: ResolvedNounPhrase, negated: boolean): string {
  if (np.possessor && isPronominalPossessor(np.possessor)) {
    if (!negated || !keptBesidePossessive(np.head.forms)) return npText(np);
    const own = ownHeadForms(np);
    return renderNP(np, (plural, lead) => objectArtFor(own, plural, lead, true), (plural, lead) => objectArtFor(own, plural, lead, true));
  }
  return renderNP(np, (plural, lead) => objectArtFor(np.head.forms, plural, lead, negated));
}
