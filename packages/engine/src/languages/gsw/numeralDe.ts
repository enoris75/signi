import { numeralText } from '../../functions/numeralText.js';
import { oneBesideDeterminer } from '../../functions/oneBesideDeterminer.js';
import type { Case } from './gsw.types.js';
import { CARDINALS } from './gsw.consts.js';
import { declineAdj } from './declineAdj.js';

/**
 * The cardinal a German phrase writes between its determiner and its adjectives (C31). From two up it
 * is invariable ("die zwei Hunde"), and a bare one is the indefinite article already (`cardinalOne`).
 * Beside a definite or demonstrative determiner, one declines as an adjective does after it, the weak
 * ending of the determiner's case: "der eine Hund", "den einen Hund", "dem einen Hund", "dieser eine
 * Hund" (A319). A pronominal possessive in that determiner's place is an ein-word, after which one
 * takes the mixed ending as any adjective does: "ihr einer Freund", "ihren einen Freund", "ihres einen
 * Freundes" (A357). `declension` is the determiner the phrase's adjectives decline after, and `forms`
 * carry the phrase's own determiner, the one a possessive stands in for.
 *
 * A possessive in a bare head's place identifies it as well, and one after it takes the same mixed
 * ending (A365): `pronominalPossessive`.
 *
 * *wessen* declines nothing itself, and a one after it is left as it is (`wessen`).
 */
export function numeralDe(forms: Record<string, string>, _case: Case, declension: string, wessen: boolean, pronominalPossessive = false): string {
  if (!wessen && oneBesideDeterminer(forms, pronominalPossessive)) {
    return declineAdj('ein', _case, forms['gender'] ?? 'neut', false, declension);
  }
  return numeralText(forms, CARDINALS);
}
