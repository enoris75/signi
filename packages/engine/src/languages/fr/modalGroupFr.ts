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
 *
 * Every element *below* the finite one can carry a negation of its own — an inner modal's
 * (`ResolvedModal.negative`, "je dois ne pas pouvoir aller") and the main verb's
 * (`ResolvedVerbPhrase.governedNegative`, "je dois ne pas aller"). French keeps that negator
 * together in front of the group it denies instead of splitting around it the way the finite
 * "ne … pas" does, so each is just a prefix. The caller builds it (`negateInner` / `negateGoverned`)
 * because the choice of "ne pas" vs bare "ne", and whether "ne" elides, are the clause's business.
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
  // Wraps an inner modal that denies itself, adverb and all ("ne pas toujours pouvoir").
  negateInner?: (word: string) => string,
  // Wraps the whole governed main-verb group when the main verb denies itself — the infinitive, its
  // auxiliary, its clitic and its own frequency adverb ("ne pas avoir mangé", "ne pas me voir").
  negateGoverned?: (group: string) => string,
): { finite: string; finiteAdverb: string; tail: string } {
  const pn = moodPN(subjectForms);
  // A modal names a state, so its past is the imparfait ("voulait", "devait"), not the passé simple (A130).
  const finite = moodForm('fr', modals[0].verb, pn, mood) ?? statePastForm('fr', modals[0].verb, pn, tense, mood)
    ?? conjugate(modals[0].verb.forms, subjectForms, tense);
  const finiteAdverb = modals[0].modifier?.forms['base'] ?? '';
  const inner: string[] = [];
  modals.slice(1).forEach((m) => {
    const word = m.verb.forms['nonfinite'] ?? m.verb.forms['base'] ?? '';
    const adv = m.modifier?.forms['base'] ?? '';
    const parts = adv && isFrequencyAdverb(m.modifier) ? [adv, word] : adv ? [word, adv] : [word];
    // An inner modal's own negation leads it and its adverb, closest to the word it denies.
    const group = parts.filter(Boolean).join(' ');
    inner.push(m.negative && negateInner ? negateInner(group) : group);
    if (m.verb.forms['link']) inner.push(m.verb.forms['link']);
  });
  const mainGroup = verbGroupInfinitiveFr(verbForms, subjectForms, aspect, clitic, precedingObjectForms, preInfinitive);
  // The main verb's own negation leads its whole group, its frequency adverb included: "doit ne pas
  // toujours aller" — the negator sits ahead of everything it denies, as it does on a citation
  // infinitive ("ne pas toujours aller").
  const mainPart = [mainFreqAdverb, mainGroup].filter(Boolean).join(' ');
  return { finite, finiteAdverb, tail: [...inner, negateGoverned ? negateGoverned(mainPart) : mainPart].filter(Boolean).join(' ') };
}
