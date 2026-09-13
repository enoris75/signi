import type { ResolvedNounElement } from '../../types.js';
import { coordinate } from './coordinate.js';
import { subjectPhrase } from './subjectPhrase.js';

/** A subject slot: each conjunct in the nominative, coordinated. */
export function subjectText(el: ResolvedNounElement): string {
  return coordinate(el, subjectPhrase);
}
