import type { Tense } from '@signi/shared';
import type { ConceptForms, ResolvedModal, RubySegment } from '../../types.js';
import type { JaEnding, JaForm } from './ja.types.js';
import { modalEndingSegs } from './modalEndingSegs.js';
import { modalSuffixSeg } from './modalSuffixSeg.js';
import { naiSegs } from './naiSegs.js';
import { plainVerbSeg } from './plainVerbSeg.js';
import { verbFormSeg } from './verbFormSeg.js';
import { wordSeg } from './wordSeg.js';

// ── Modality ────────────────────────────────────────────────────────────────
// Japanese has no modal *verbs*: modality is a suffix on the predicate — 〜必要がある
// (obligation), 〜ことができる (ability), 〜たい (volition). Each modal lexeme therefore
// carries `governs` (the form of the element it attaches to), `suffix_dict` / `suffix_stem`
// (its own dictionary and polite-stem shapes, so an outer modal can attach to it in turn),
// and `kind` — 〜たい is an i-adjective and inflects like one, the others are verbs.
//
// An aspect composes under a modal as the innermost element, in the form the modal governs (B07; see
// `aspectFormSegs`): 食べている必要があります "needs to be eating / to have eaten", 食べていることができます,
// 食べていたいです, 食べようとしている必要があります. The caller passes it as `governedSegs`.
//
// Polarity is per word (A03), and a suffixal modality puts each negation on the element it denies
// rather than in front of it: the finite ending carries the outermost link's (`negative`,
// 行きたくないです), an inner link wears its own on its suffix (できない必要があります), and what the
// innermost modal governs takes the ない form (`governedNegative`, 行かない必要があります), bridged
// with 〜ないでい under a stem governor (行かないでいたいです) — see `naiSegs`.
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
  modals: ResolvedModal[],
  verb: ConceptForms,
  tense: Tense,
  negative: boolean,
  index = 0,
  form?: JaForm,
  // The outermost modal's ending: polite, plain (a prenominal relative clause) or たら (an "if" clause).
  ending: JaEnding = 'polite',
  // The innermost element in the form a modal governs, and negated when the chain denies it: the verb
  // by default (行く / 行かない), the verb in its aspect (食べている必要がある; see `aspectFormSegs`), or
  // the copula's predicate, which has no verb of its own (幸せである必要がある, 幸せでない必要がある,
  // 伝説でありたい; see `copulaSegs`).
  governedSegs: (form: JaForm, negative: boolean) => RubySegment[] = (f, neg) =>
    (neg ? naiSegs([plainVerbSeg(verb, 'present', true)], f) : [verbFormSeg(verb, f)]),
  // Whether the innermost governed element is itself denied — "I want to *not* go" (A03).
  governedNegative = false,
): RubySegment[] {
  if (index === modals.length) return governedSegs(form ?? 'dict', governedNegative);
  const m = modals[index];
  const mf = m.verb;
  const governed = (mf.forms['governs'] as JaForm | undefined) ?? 'dict';
  const isIadj = mf.forms['kind'] === 'iadj';
  const innerModal = index + 1 < modals.length ? modals[index + 1] : undefined;
  const innerIsIadj = innerModal?.verb.forms['kind'] === 'iadj';
  const inner = (f: JaForm): RubySegment[] =>
    modalSegs(modals, verb, tense, negative, index + 1, f, ending, governedSegs, governedNegative);
  // This link's own suffix, in the form its governor asks for. An inner link that is itself denied
  // wears the negation on its own suffix — the plain ない form the finite slot would spell with a
  // tense (`modalEndingSegs`), reached through 〜ないでい under a stem governor: 行くことができない
  // 必要があります, 食べたくないと思うことができます. The outermost link has no `form`: its negation is
  // the clause's, and it inflects below.
  const suffix = (f: JaForm): RubySegment[] => (m.negative === true
    ? naiSegs(modalEndingSegs(mf, 'present', true, 'plain'), f)
    : [modalSuffixSeg(mf, f)]);
  // 〜たい (volition, an i-adjective) does not chain by naive suffix-gluing: attaching it to a
  // nominalising modal's stem gives できたい, and letting one nominalise it gives たいこと — both
  // ungrammatical. So it is bridged instead.
  //
  // Case A — 〜たい *over* a verb-kind modal (want to be able to …): the inner modal rides
  // ようになる ("come to be able"), and 〜たい inflects なる (its polite stem なり + たい):
  // 食べることができるようになりたいです. Governed by an outer modal it keeps its たい, in the form
  // that modal asks for (なりたい, なりたく), so the desire survives the outer bridge:
  // 食べることができるようになりたいと思う必要があります. A denied inner modal keeps the bridge and
  // negates its own suffix (食べることができないようになりたいです) — compositional, and as marginal
  // as the affirmative chain it is built on.
  if (isIadj && innerModal && !innerIsIadj) {
    return form === undefined
      ? [...inner('dict'), { t: 'ように' }, { t: 'なり' }, ...modalEndingSegs(mf, tense, negative, ending)]
      : [...inner('dict'), { t: 'ように' }, { t: 'なり' }, ...suffix(form)];
  }
  // Case B — a nominalising verb-kind modal *over* 〜たい (… can want to eat): the desire is made
  // a clause with と思う ("think that …") before the modal nominalises it: 食べたいと思うことができます.
  if (!isIadj && innerIsIadj) {
    const bridge: RubySegment[] = [{ t: 'と' }, wordSeg('思う', 'おもう')];
    return form === undefined
      ? [...inner(governed), ...bridge, ...modalEndingSegs(mf, tense, negative, ending)]
      : [...inner(governed), ...bridge, ...suffix(form)];
  }
  // No `form` means this is the outermost modal: it takes the finite, inflected ending.
  return form === undefined
    ? [...inner(governed), ...modalEndingSegs(mf, tense, negative, ending)]
    : [...inner(governed), ...suffix(form)];
}
