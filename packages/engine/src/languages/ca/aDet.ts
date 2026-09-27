import { contractArt } from './contractArt.js';
import { prepDet } from './prepDet.js';

/** "a" + determiner; a definite one is gated as `contractArt` gates it ("a l'Àfrica", "a Europa"). */
export function aDet(forms: Record<string, string>, plural = false): string {
  if ((forms['definiteness'] ?? 'definite') !== 'definite') return prepDet('a', forms, plural);
  const art = contractArt(forms, plural);
  return art ? `a ${art}` : 'a';
}
