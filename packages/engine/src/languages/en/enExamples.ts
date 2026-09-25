import type { ResolvedNounPhrase } from '../../types.js';
import { EN_EXAMPLES } from './en.consts.js';
import { tonicPronoun } from '../../functions/tonicPronoun.js';
import { coordinate } from './coordinate.js';
import { npText } from './npText.js';

/**
 * The members of the head's set a noun phrase names after it (P09-E33), with a leading space or
 * comma, or ''. *Such as* runs on ("animals such as the cat run"); *including* is parenthetical, set
 * off on both sides ("the animals, including the cat, run") — the closing comma gives way to the full
 * stop when the phrase ends the sentence (`tidyCommas`). A pronoun takes its object form: "such as
 * him", "including me".
 */
export function enExamples(np: ResolvedNounPhrase): string {
  const ex = np.examples;
  if (!ex) return '';
  const group = coordinate(ex.phrase, (s) => tonicPronoun(s) ?? npText(s));
  return ex.relation === 'inclusion' ? `, ${EN_EXAMPLES.inclusion} ${group},` : ` ${EN_EXAMPLES.example} ${group}`;
}
