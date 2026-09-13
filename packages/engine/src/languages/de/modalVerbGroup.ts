import type { Aspect, Tense } from '@signi/shared';
import type { ResolvedModal } from '../../types.js';
import type { VerbComplex } from './de.types.js';
import { WERDEN, WUERDE } from './de.consts.js';
import { conjPn } from './conjPn.js';
import { isConditionalMood } from './isConditionalMood.js';
import { modalStack } from './modalStack.js';

/**
 * The verb complex when a modal chain governs the predicate. The outermost modal is the
 * finite verb in the V2 slot, and the clause closes with the main verb group's infinitive
 * followed by the modal stack. The aspect contributes exactly the material it does without a
 * modal, only non-finite: "gerade" in the Mittelfeld for the progressive, "im Begriff … zu …
 * sein" for the prospective, and Partizip + sein/haben for the resultative — so "er muss die
 * Katze gesehen haben" and "er wird gehen müssen" both fall out of the same shape.
 */
export function modalVerbGroup(
  modals: ResolvedModal[],
  verbForms: Record<string, string>,
  pn: string,
  tense: Tense,
  aspect: Aspect,
  mood?: string,
): VerbComplex {
  const base = verbForms['base'] ?? '';
  const participle = verbForms['participle'] ?? base;
  const perfAux = verbForms['aux'] === 'be' ? 'sein' : 'haben';
  const group =
    aspect === 'progressive' ? { mid: 'gerade', tail: [base] } :
    aspect === 'prospective' ? { mid: 'im Begriff', tail: [`zu ${base}`, 'sein'] } :
    aspect === 'resultative' ? { mid: '', tail: [participle, perfAux] } :
    { mid: '', tail: [base] };
  // Conditional stacks every modal after würde, exactly as the future does after werden.
  const conditional = isConditionalMood(mood);
  const periphrastic = tense === 'future' || conditional;
  return {
    v2: periphrastic ? (conditional ? (WUERDE[pn] ?? 'würde') : (WERDEN[pn] ?? 'wird')) : conjPn(modals[0].verb.forms, pn, tense),
    mid: group.mid,
    tail: [...group.tail, ...modalStack(modals, periphrastic)].join(' '),
  };
}
