import type { Aspect, Tense } from '@signi/shared';
import { auxBe } from './auxBe.js';
import { auxHave } from './auxHave.js';

/**
 * The finite verb group for a non-neutral aspect: an auxiliary (tense/subject-inflected) plus
 * the main verb's non-finite form — "be" + gerund for progressive ("is going"), "be" + "about
 * to" + base for prospective ("is about to go"), and for the resultative "have" + past
 * participle ("has seen"), or "be" + past participle on the verbs the seed marks with
 * forms.aux = "be" ("is gone"). Negation attaches to the auxiliary ("is not going", "has not
 * seen", "will not be going").
 */
export function aspectVerb(
  verbForms: Record<string, string>,
  subjectForms: Record<string, string>,
  tense: Tense,
  aspect: Aspect,
  negative: boolean,
): string {
  const base = verbForms['base'] ?? '';
  const perfectBe = verbForms['aux'] === 'be';
  const aux = aspect === 'resultative' && !perfectBe
    ? auxHave(subjectForms, tense)
    : auxBe(subjectForms, tense);
  const nonfinite =
    aspect === 'progressive' ? (verbForms['gerund'] ?? base) :
    aspect === 'resultative' ? (verbForms['participle'] ?? base) :
    `about to ${base}`; // prospective
  const auxStr = negative ? [aux[0], 'not', ...aux.slice(1)].join(' ') : aux.join(' ');
  return `${auxStr} ${nonfinite}`.trim();
}
