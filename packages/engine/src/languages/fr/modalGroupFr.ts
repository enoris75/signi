import type { Aspect, Tense } from '@signi/shared';
import { isFrequencyAdverb, type Mood, type ResolvedModal } from '../../types.js';
import { moodForm, moodPN } from '../../mood.js';
import { conjugate } from './conjugate.js';
import { verbGroupInfinitiveFr } from './verbGroupInfinitiveFr.js';

/**
 * The modal chain split for negation and per-modal adverbs. The outermost modal is the finite verb
 * that "ne … pas" wraps ("je ne veux pas pouvoir aller"); its own frequency adverb sits right after
 * it (returned as `finiteAdverb`, so it lands *after* the "ne … (pas)" bracket). Everything it
 * governs — the inner modals' infinitives, then the main verb group — trails in `tail`, each verb
 * carrying its own adverb (a frequency adverb before its infinitive, a manner adverb after). The
 * main verb's frequency adverb is passed in as `mainFreqAdverb` (its manner adverb still trails the
 * whole clause, handled by the caller).
 */
export function modalGroupFr(
  modals: ResolvedModal[],
  verbForms: Record<string, string>,
  subjectForms: Record<string, string>,
  tense: Tense,
  aspect: Aspect,
  mood: Mood | undefined,
  mainFreqAdverb: string,
  // The object clitic and the preceding object's forms, handed to the main verb group, which takes the
  // clitic before its infinitive ("doit me voir", "doit l'avoir vue") — never onto the modal.
  clitic = '',
  precedingObjectForms?: Record<string, string>,
): { finite: string; finiteAdverb: string; tail: string } {
  const pn = moodPN(subjectForms);
  const finite = moodForm('fr', modals[0].verb, pn, mood) ?? conjugate(modals[0].verb.forms, subjectForms, tense);
  const finiteAdverb = modals[0].modifier?.forms['base'] ?? '';
  const inner: string[] = [];
  modals.slice(1).forEach((m) => {
    const word = m.verb.forms['nonfinite'] ?? m.verb.forms['base'] ?? '';
    const adv = m.modifier?.forms['base'] ?? '';
    if (adv && isFrequencyAdverb(m.modifier)) inner.push(adv, word);
    else if (adv) inner.push(word, adv);
    else inner.push(word);
    if (m.verb.forms['link']) inner.push(m.verb.forms['link']);
  });
  const mainGroup = verbGroupInfinitiveFr(verbForms, subjectForms, aspect, clitic, precedingObjectForms);
  const mainPart = mainFreqAdverb ? [mainFreqAdverb, mainGroup] : [mainGroup];
  return { finite, finiteAdverb, tail: [...inner, ...mainPart].join(' ') };
}
