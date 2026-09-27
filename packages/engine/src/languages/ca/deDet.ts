import { contractArt } from './contractArt.js';
import { prepDet } from './prepDet.js';

/** "de" + determiner; a definite one is gated as `contractArt` gates it ("de la casa", "d'Europa"). */
export function deDet(forms: Record<string, string>, plural = false): string {
  if ((forms['definiteness'] ?? 'definite') !== 'definite') return prepDet('de', forms, plural);
  const art = contractArt(forms, plural);
  return art ? `de ${art}` : 'de';
}
