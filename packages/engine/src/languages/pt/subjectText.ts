import type { ResolvedNounElement } from '../../types.js';
import { coordinateElement } from './coordinateElement.js';
import { ptAdj } from './ptAdj.js';
import { ptPossessiveWord } from './ptPossessiveWord.js';
import { subjectPhrase } from './subjectPhrase.js';
import { withRelative } from './withRelative.js';

/** A subject slot: each conjunct with its own article/adjectives/relative, coordinated. */
export function subjectText(el: ResolvedNounElement): string {
  return coordinateElement(el, (np) => withRelative(subjectPhrase(np.head.forms, ptAdj(np), ptPossessiveWord(np)), np));
}
