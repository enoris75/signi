import type { ResolvedNounElement } from '../../types.js';
import { coordinate } from './coordinate.js';
import { subjectPhrase } from './subjectPhrase.js';

/** A subject slot: each conjunct with its own article/adjectives/relative, coordinated. */
export function subjectText(el: ResolvedNounElement): string {
  return coordinate(el, subjectPhrase);
}
