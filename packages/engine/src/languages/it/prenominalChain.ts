import type { ConceptForms } from '../../types.js';
import { itDeg } from './itDeg.js';
import { prenominalSurface } from './prenominalSurface.js';

/**
 * Surface forms of the prenominal adjectives, resolved right-to-left so each (bello in
 * particular) can agree with the sound of the word immediately following it.
 */
export function prenominalChain(pre: ConceptForms[], gender: string, plural: boolean, noun: string): string[] {
  const out: string[] = [];
  let next = noun;
  for (let i = pre.length - 1; i >= 0; i--) {
    const surf = prenominalSurface(pre[i], gender, plural, next);
    if (surf) {
      // Chain agreement off the bare surface, but emit it with any degree adverb prepended.
      out.unshift(itDeg(pre[i], surf));
      next = surf;
    }
  }
  return out;
}
