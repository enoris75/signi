import type { Tense } from '@signi/shared';
import type { ConceptForms, RubySegment } from '../../types.js';
import type { JaEnding, JaForm } from './ja.types.js';
import { modalEndingSegs } from './modalEndingSegs.js';
import { modalSuffixSeg } from './modalSuffixSeg.js';
import { plainVerbSeg } from './plainVerbSeg.js';
import { verbFormSeg } from './verbFormSeg.js';
import { wordSeg } from './wordSeg.js';

// ── Modality ────────────────────────────────────────────────────────────────
// Japanese has no modal *verbs*: modality is a suffix on the predicate — 〜必要がある
// (obligation), 〜ことができる (ability), 〜たい (volition). Each modal lexeme therefore
// carries `governs` (the form of the element it attaches to), `suffix_dict` / `suffix_stem`
// (its own dictionary and polite-stem shapes, so an outer modal can attach to it in turn),
// and `kind` — 〜たい is an i-adjective and inflects like one, 〜べき is a noun-like word the
// copula closes, the others are verbs.
//
// An aspect composes under a modal as the innermost element, in the form the modal governs (B07; see
// `aspectFormSegs`): 食べている必要があります "needs to be eating / to have eaten", 食べていることができます,
// 食べていたいです, 食べようとしている必要があります. The caller passes it as `governedSegs`.
/**
 * The modal chain, built inside-out. `modals[0]` is the outermost and is the only one
 * inflected; each modal governs the form named by its `governs` key, so the main verb
 * surfaces as a dictionary form under 〜ことができる / 〜必要がある and as a polite stem
 * under 〜たい. A governed verb-kind modal contributes its own bare `suffix_dict` /
 * `suffix_stem`, which is what lets two of them stack directly (行くことができる必要があります).
 * The volitional 〜たい cannot stack that way, so it is bridged (ようになる / と思う) — see the two
 * i-adjective cases below.
 *
 * A modal that `governs: 'plain'` (〜かもしれない) is the exception to "only the outermost is
 * inflected": the element before it takes the tense and the polarity, in its plain form, and the
 * suffix keeps only the politeness — 走らないかもしれません "might not run", 走ったかもしれません "might
 * have run", 走ることができないかもしれません. `finiteSegs` is that plain form of the innermost element:
 * the verb's (plainVerbSeg) by default, or the aspect's or the copula predicate's, which the caller
 * passes as it passes `governedSegs`.
 */
export function modalSegs(
  modals: ConceptForms[],
  verb: ConceptForms,
  tense: Tense,
  negative: boolean,
  index = 0,
  form?: JaForm,
  // The outermost modal's ending: polite, plain (a prenominal relative clause) or たら (an "if" clause).
  ending: JaEnding = 'polite',
  // The innermost element in the form a modal governs: the verb by default, the verb in its aspect
  // (食べている必要がある; see `aspectFormSegs`), or the copula's predicate, which has no verb of its own
  // (幸せである必要がある, 伝説でありたい; see `copulaSegs`).
  governedSegs: (form: JaForm) => RubySegment[] = (f) => [verbFormSeg(verb, f)],
  // The innermost element in its plain finite form, which a `governs: 'plain'` modal attaches to.
  finiteSegs: (tense: Tense, negative: boolean) => RubySegment[] = (t, n) => [plainVerbSeg(verb, t, n)],
): RubySegment[] {
  if (index === modals.length) return governedSegs(form ?? 'dict');
  const m = modals[index];
  // 〜かもしれない: the element before it is finite. Outermost, that element carries the clause's tense
  // and polarity and the suffix closes on the ending; governed, it is the plain present, and the suffix
  // stands in the form the outer modal asks for (走るかもしれない必要があります).
  if (m.forms['governs'] === 'plain') {
    const t = form === undefined ? tense : 'present';
    const n = form === undefined ? negative : false;
    const inner = index + 1 === modals.length
      ? finiteSegs(t, n)
      : modalSegs(modals, verb, t, n, index + 1, undefined, 'plain', governedSegs, finiteSegs);
    if (form !== undefined) return [...inner, modalSuffixSeg(m, form)];
    return [...inner, plainModalEnding(m, ending)];
  }
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
  // 食べることができるようになりたいです. Governed by an outer modal it keeps its たい, in the form
  // that modal asks for (なりたい, なりたく), so the desire survives the outer bridge:
  // 食べることができるようになりたいと思う必要があります.
  if (isIadj && innerModal && !innerIsIadj) {
    const inner = modalSegs(modals, verb, tense, negative, index + 1, 'dict', ending, governedSegs, finiteSegs);
    return form === undefined
      ? [...inner, { t: 'ように' }, { t: 'なり' }, ...modalEndingSegs(m, tense, negative, ending)]
      : [...inner, { t: 'ように' }, { t: 'なり' }, modalSuffixSeg(m, form)];
  }
  // Case B — a nominalising verb-kind modal *over* 〜たい (… can want to eat): the desire is made
  // a clause with と思う ("think that …") before the modal nominalises it: 食べたいと思うことができます.
  if (!isIadj && innerIsIadj) {
    const inner = modalSegs(modals, verb, tense, negative, index + 1, governed, ending, governedSegs, finiteSegs);
    const bridge: RubySegment[] = [{ t: 'と' }, wordSeg('思う', 'おもう')];
    return form === undefined
      ? [...inner, ...bridge, ...modalEndingSegs(m, tense, negative, ending)]
      : [...inner, ...bridge, modalSuffixSeg(m, form)];
  }
  const inner = modalSegs(modals, verb, tense, negative, index + 1, governed, ending, governedSegs, finiteSegs);
  // No `form` means this is the outermost modal: it takes the finite, inflected ending.
  return form === undefined
    ? [...inner, ...modalEndingSegs(m, tense, negative, ending)]
    : [...inner, modalSuffixSeg(m, form)];
}

/**
 * A `governs: 'plain'` modal's own ending, which says the politeness and nothing else: its plain
 * 〜ない becomes the polite 〜ません (かもしれません), stays as it is before a head noun (走るかもしれない
 * 猫), and takes なら in an "if" clause (走るかもしれないなら), the tense having gone to the verb.
 */
function plainModalEnding(m: ConceptForms, ending: JaEnding): RubySegment {
  const dict = m.forms['suffix_dict'] ?? '';
  const reading = m.forms['suffix_dict_reading'];
  const polite = (s: string) => s.replace(/ない$/, 'ません');
  if (ending === 'polite') return wordSeg(polite(dict), reading ? polite(reading) : undefined);
  if (ending === 'tara') return wordSeg(`${dict}なら`, reading ? `${reading}なら` : undefined);
  return wordSeg(dict, reading);
}
