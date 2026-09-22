import type { Aspect, Tense } from '@signi/shared';
import type { ResolvedModal } from '../../types.js';
import type { VerbComplex } from './de.types.js';
import { HAETTE, WERDEN, WUERDE } from './de.consts.js';
import { conjPn } from './conjPn.js';
import { isConditionalMood } from './isConditionalMood.js';
import { modalStack } from './modalStack.js';
import { zuInfinitive } from './zuInfinitive.js';

/**
 * The verb complex when a modal chain governs the predicate. The outermost modal is the
 * finite verb in the V2 slot, and the clause closes with the main verb group's infinitive
 * followed by the modal stack. The aspect contributes exactly the material it does without a
 * modal, only non-finite: "gerade" in the Mittelfeld for the progressive, "im Begriff … sein" plus
 * its `zuInfinitive` for the prospective ("er muss im Begriff sein zu gehen" — see
 * `prospectiveFrame`), and Partizip + sein/haben for the resultative — so "er muss die Katze gesehen
 * haben" and "er wird gehen müssen" both fall out of the same shape.
 *
 * A `conditional` outermost modal (sollte, könnte) is a Konjunktiv II already. It has no future and
 * takes no würde, so it stays finite in its one form ("er sollte gehen", "wenn er gehen sollte"), and
 * its past is the pluperfect subjunctive: hätte in V2 over the whole stack, the modal's infinitive
 * standing in for its participle ("er hätte gehen sollen", "er hätte gehen können").
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
    aspect === 'progressive' ? { mid: 'gerade', tail: [base], zuInfinitive: '' } :
    aspect === 'prospective' ? { mid: 'im Begriff', tail: ['sein'], zuInfinitive: zuInfinitive(verbForms) } :
    aspect === 'resultative' ? { mid: '', tail: [participle, perfAux], zuInfinitive: '' } :
    { mid: '', tail: [base], zuInfinitive: '' };
  const conditionalModal = modals[0].verb.forms['conditional'] === '1';
  const perfect = conditionalModal && tense === 'past';
  // Conditional stacks every modal after würde, exactly as the future does after werden.
  const conditional = isConditionalMood(mood) && !conditionalModal;
  const periphrastic = (tense === 'future' && !conditionalModal) || conditional;
  const stacked = periphrastic || perfect;
  return {
    v2: perfect ? (HAETTE[pn] ?? 'hätte')
      : periphrastic ? (conditional ? (WUERDE[pn] ?? 'würde') : (WERDEN[pn] ?? 'wird'))
      : conjPn(modals[0].verb.forms, pn, conditionalModal ? 'present' : tense),
    mid: group.mid,
    tail: [...group.tail, ...modalStack(modals, stacked)].join(' '),
    zuInfinitive: group.zuInfinitive,
    // Under werden/würde/hätte the cluster closes on a modal infinitive: a double infinitive, which
    // fronts the finite auxiliary in a verb-final clause ("wenn er die Maus würde essen müssen").
    ...(stacked ? { finiteLeadsTail: true as const } : {}),
  };
}
