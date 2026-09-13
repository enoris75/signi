import type { Tense } from '@signi/shared';
import type { ConceptForms, RubySegment } from '../../types.js';
import type { JaForm } from './ja.types.js';
import { modalEndingSegs } from './modalEndingSegs.js';
import { modalSuffixSeg } from './modalSuffixSeg.js';
import { verbFormSeg } from './verbFormSeg.js';
import { wordSeg } from './wordSeg.js';

// ── Modality ────────────────────────────────────────────────────────────────
// Japanese has no modal *verbs*: modality is a suffix on the predicate — 〜必要がある
// (obligation), 〜ことができる (ability), 〜たい (volition). Each modal lexeme therefore
// carries `governs` (the form of the element it attaches to), `suffix_dict` / `suffix_stem`
// (its own dictionary and polite-stem shapes, so an outer modal can attach to it in turn),
// and `kind` — 〜たい is an i-adjective and inflects like one, the others are verbs.
//
// Known gap: `aspect` is dropped under a modal. Stacking ～ています inside 〜必要がある is
// not something the language does periphrastically, so there is nothing to compose.
/**
 * The modal chain, built inside-out. `modals[0]` is the outermost and is the only one
 * inflected; each modal governs the form named by its `governs` key, so the main verb
 * surfaces as a dictionary form under 〜ことができる / 〜必要がある and as a polite stem
 * under 〜たい. A governed verb-kind modal contributes its own bare `suffix_dict` /
 * `suffix_stem`, which is what lets two of them stack directly (行くことができる必要があります).
 * The volitional 〜たい cannot stack that way, so it is bridged (ようになる / と思う) — see the two
 * i-adjective cases below.
 */
export function modalSegs(
  modals: ConceptForms[],
  verb: ConceptForms,
  tense: Tense,
  negative: boolean,
  index = 0,
  form?: JaForm,
): RubySegment[] {
  if (index === modals.length) return [verbFormSeg(verb, form ?? 'dict')];
  const m = modals[index];
  const governed = (m.forms['governs'] as JaForm | undefined) ?? 'dict';
  const isIadj = m.forms['kind'] === 'iadj';
  const innerModal = index + 1 < modals.length ? modals[index + 1] : undefined;
  const innerIsIadj = innerModal?.forms['kind'] === 'iadj';
  // 〜たい (volition, an i-adjective) does not chain by naive suffix-gluing: attaching it to a
  // nominalising modal's stem gives できたい, and letting one nominalise it gives たいこと — both
  // ungrammatical. So it is bridged instead.
  //
  // Case A — 〜たい *over* a verb-kind modal (want to be able to …): the inner modal rides
  // ようになる ("come to be able"), and 〜たい inflects なる (its polite stem なり + たい):
  // 食べることができるようになりたいです.
  if (isIadj && innerModal && !innerIsIadj) {
    const inner = modalSegs(modals, verb, tense, negative, index + 1, 'dict');
    return form === undefined
      ? [...inner, { t: 'ように' }, { t: 'なり' }, ...modalEndingSegs(m, tense, negative)]
      : [...inner, { t: 'ように' }, { t: form === 'stem' ? 'なり' : 'なる' }];
  }
  // Case B — a nominalising verb-kind modal *over* 〜たい (… can want to eat): the desire is made
  // a clause with と思う ("think that …") before the modal nominalises it: 食べたいと思うことができます.
  if (!isIadj && innerIsIadj) {
    const inner = modalSegs(modals, verb, tense, negative, index + 1, governed);
    const bridge: RubySegment[] = [{ t: 'と' }, wordSeg('思う', 'おもう')];
    return form === undefined
      ? [...inner, ...bridge, ...modalEndingSegs(m, tense, negative)]
      : [...inner, ...bridge, modalSuffixSeg(m, form)];
  }
  const inner = modalSegs(modals, verb, tense, negative, index + 1, governed);
  // No `form` means this is the outermost modal: it takes the finite, inflected ending.
  return form === undefined
    ? [...inner, ...modalEndingSegs(m, tense, negative)]
    : [...inner, modalSuffixSeg(m, form)];
}
