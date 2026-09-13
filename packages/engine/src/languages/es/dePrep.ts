import { contractArt } from './contractArt.js';

/** Spanish "de" (from) + article: de+el=del; bare "de" for an unarticled proper noun; else "de la/los/las". */
export function dePrep(forms: Record<string, string>, plural = false): string {
  const art = contractArt(forms, plural);
  if (art === 'el') return 'del';
  return art ? `de ${art}` : 'de';
}
