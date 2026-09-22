import type { Aspect, Tense } from '@signi/shared';
import type { Mood, ResolvedModal } from '../../types.js';
import { isFrequencyAdverb } from '../../functions/isFrequencyAdverb.js';
import { moodForm, moodPN, statePastForm } from '../../mood.js';
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
  // A short adverb that leads the main verb's own group ("doit bien manger", see `pre_nonfinite`).
  preInfinitive = '',
): { finite: string; finiteAdverb: string; tail: string } {
  const pn = moodPN(subjectForms);
  // A modal names a state, so its past is the imparfait ("voulait", "devait"), not the passé simple (A130).
  const conjugated = moodForm('fr', modals[0].verb, pn, mood) ?? statePastForm('fr', modals[0].verb, pn, tense, mood)
    ?? conjugate(modals[0].verb.forms, subjectForms, tense);
  // A compound form (SHOULD's past "aurait dû", the conditionnel passé) is finite in its auxiliary
  // alone: "ne … pas" and the modal's own adverb go around "aurait", and the participle leads the
  // tail — "n'aurait pas dû courir", "aurait toujours dû courir".
  const [finite, ...participle] = conjugated.split(' ');
  const finiteAdverb = modals[0].modifier?.forms['base'] ?? '';
  const inner: string[] = [...participle];
  modals.slice(1).forEach((m) => {
    const word = m.verb.forms['nonfinite'] ?? m.verb.forms['base'] ?? '';
    const adv = m.modifier?.forms['base'] ?? '';
    if (adv && isFrequencyAdverb(m.modifier)) inner.push(adv, word);
    else if (adv) inner.push(word, adv);
    else inner.push(word);
    if (m.verb.forms['link']) inner.push(m.verb.forms['link']);
  });
  const mainGroup = verbGroupInfinitiveFr(verbForms, subjectForms, aspect, clitic, precedingObjectForms, preInfinitive);
  const mainPart = mainFreqAdverb ? [mainFreqAdverb, mainGroup] : [mainGroup];
  return { finite, finiteAdverb, tail: [...inner, ...mainPart].join(' ') };
}
