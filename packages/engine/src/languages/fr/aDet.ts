import { datPrep } from './datPrep.js';
import { prepDet } from './prepDet.js';

/**
 * "à" + determiner. Only the definite fuses (au/aux/à la/à l'); otherwise a plain "à" leads
 * the chosen determiner ("à une maison", "à quelques maisons") — "à" never elides.
 */
export function aDet(forms: Record<string, string>, plural: boolean, lead: string): string {
  if ((forms['definiteness'] ?? 'definite') === 'definite') return datPrep(forms, plural, lead);
  // "les deux" is the article + the numeral, and the article fuses: "aux deux chats" (P09-E25).
  if (forms['definiteness'] === 'both') return `${datPrep(forms, true, lead)} deux`;
  return prepDet('à', forms, plural, lead);
}
