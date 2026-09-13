import type { ResolvedNounElement } from '../../types.js';
import { coordinate } from './coordinate.js';
import { subjectPhrase } from './subjectPhrase.js';
import { withRelative } from './withRelative.js';

/** A subject slot: each conjunct with its own relative clause, coordinated. */
export function subjectText(el: ResolvedNounElement): string {
  return coordinate(el, (np) => withRelative(subjectPhrase(np), np));
}
