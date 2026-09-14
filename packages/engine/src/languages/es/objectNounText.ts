import type { ResolvedNounPhrase } from '../../types.js';
import { possessedHeadForms } from '../../resolved/possessedHeadForms.js';
import { aDet } from './aDet.js';
import { artForms } from './artForms.js';
import { esAdj } from './esAdj.js';
import { esPossessiveWord } from './esPossessiveWord.js';
import { isPlural } from './isPlural.js';
import { npText } from './npText.js';
import { takesPersonalA } from './takesPersonalA.js';
import { withAdj } from './withAdj.js';
import { withRelative } from './withRelative.js';

/**
 * One noun conjunct of a direct object. A human with a determiner takes the personal "a", fused
 * with it as the dative "a" is ("ve al niño", "a la mujer", "a un hombre", "a ningún niño", "a su
 * padre"). A bare human is non-specific and takes none ("busca niños"), and every non-human keeps
 * the plain noun phrase ("ve el perro").
 */
export function objectNounText(np: ResolvedNounPhrase): string {
  if (!takesPersonalA(np)) return npText(np);
  const f = possessedHeadForms(np, 'bare');
  const plural = isPlural(f);
  const adj = esAdj(np);
  const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
  const noun = [esPossessiveWord(np), withAdj(word, adj)].filter(Boolean).join(' ');
  return withRelative(`${aDet(artForms(f, adj), plural)} ${noun}`, np);
}
