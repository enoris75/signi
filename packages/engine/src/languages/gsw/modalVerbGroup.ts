import type { Aspect, Tense } from '@signi/shared';
import type { ResolvedModal } from '../../types.js';
import type { VerbComplex } from './gsw.types.js';
import { HABEN, HAETTE, WUERDE } from './gsw.consts.js';
import { amInfinitive } from './amInfinitive.js';
import { conjPn } from './conjPn.js';
import { isConditionalMood } from './isConditionalMood.js';
import { modalStack } from './modalStack.js';
import { PROSPECTIVE_MID } from './verbGroup.js';
import { zuInfinitive } from './zuInfinitive.js';

/**
 * The verb complex under one or more modals (P10-E10): the outermost modal finite, the others and the
 * verb as infinitives at the clause end — "ich mues gaa". Swiss German's tense rules are `verbGroup`'s:
 * the future is the present, and the past is the perfect, with the modal's infinitive standing in for
 * its participle (*Ersatzinfinitiv*): "ich ha gaa müese".
 *
 * **The cluster keeps German's order** (P10 D11, E10 D1): the governed verb before its modal, and a
 * verb-final clause fronting the finite auxiliary over a double infinitive. Zürich raises the modal
 * ahead of the verb ("ich ha müese gaa", "… das ich cha choo"); that order is pinned `test.fails` in
 * the suite until the review rules on each cluster shape.
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
  const perfAux = verbForms['aux'] === 'be' ? 'sii' : 'haa';
  const group =
    aspect === 'progressive' ? { mid: '', tail: [amInfinitive(verbForms), 'sii'], zuInfinitive: '' } :
    aspect === 'prospective' ? { mid: PROSPECTIVE_MID, tail: ['sii'], zuInfinitive: zuInfinitive(verbForms) } :
    aspect === 'resultative' ? { mid: '', tail: [participle, perfAux], zuInfinitive: '' } :
    { mid: '', tail: [base], zuInfinitive: '' };
  const conditionalModal = modals[0].verb.forms['conditional'] === '1';
  const past = tense === 'past';
  // A conditional mood stacks every modal after *würd*.
  const conditional = isConditionalMood(mood) && !conditionalModal;
  const stacked = conditional || past;
  return {
    v2: past ? (conditionalModal || conditional ? (HAETTE[pn] ?? 'hett') : (HABEN.present[pn] ?? 'hät'))
      : conditional ? (WUERDE[pn] ?? 'würd')
      : conjPn(modals[0].verb.forms, pn, 'present'),
    mid: group.mid,
    tail: [...group.tail, ...modalStack(modals, stacked)].join(' '),
    zuInfinitive: group.zuInfinitive,
    // Over a double infinitive a verb-final clause fronts the finite auxiliary, as German does.
    ...(stacked ? { finiteLeadsTail: true as const } : {}),
  };
}
