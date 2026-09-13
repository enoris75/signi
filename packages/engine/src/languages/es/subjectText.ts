import type { ResolvedNounElement } from '../../types.js';
import { coordinateElement } from './coordinateElement.js';
import { esAdj } from './esAdj.js';
import { esPossessiveWord } from './esPossessiveWord.js';
import { subjectPhrase } from './subjectPhrase.js';
import { withRelative } from './withRelative.js';

/** A subject slot: each conjunct with its own article/adjectives/relative, coordinated. */
export function subjectText(el: ResolvedNounElement): string {
  return coordinateElement(el, (np) => withRelative(subjectPhrase(np.head.forms, esAdj(np), esPossessiveWord(np)), np));
}
