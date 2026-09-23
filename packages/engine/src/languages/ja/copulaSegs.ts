import type { Tense } from '@signi/shared';
import type { ResolvedComplement, RubySegment } from '../../types.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import type { JaForm } from './ja.types.js';
import { elSegs } from './elSegs.js';
import { isLoweredDegree } from './isLoweredDegree.js';
import { isNegativeGroup } from './isNegativeGroup.js';
import { jaAdjClass } from './jaAdjClass.js';
import { jaComparisonAdj } from './jaComparisonAdj.js';
import { jaDegreeSegs } from './jaDegreeSegs.js';
import { predicateLinkSegs } from './predicateLinkSegs.js';
import { wordSeg } from './wordSeg.js';

/**
 * Where the copula predicate stands, which picks its ending. `dict` and `stem` are the forms a modal
 * governs (see `JaForm`), which carries the tense and polarity itself. `citation` closes an infinitive
 * citation in the plain written style (可能である, 疲れている), as a verb's citation is its dictionary form.
 */
export type CopulaForm = 'polite' | 'prenominal' | 'tara' | 'citation' | JaForm;

// The endings by class and form, as [affirmative present, affirmative past, negative present, negative
// past]. A たら form ignores tense, so it repeats its two cells; a governed form ignores both, so it
// repeats one.
//
// A governed form carries a negation of its own once the modal denies what it governs (A03: 幸せで
// ない必要があります). It is the plain ない form, and a `stem` governor reaches it through the same
// 〜ないでい bridge `naiSegs` builds for a verb (幸せでないでいたいです) — marginal beside a verb's
// 行かないでいたい, but compositional and the only shape that keeps the desire on the outside.
const I_ENDINGS: Record<CopulaForm, [string, string, string, string]> = {
  polite: ['いです', 'かったです', 'くないです', 'くなかったです'],
  prenominal: ['い', 'かった', 'くない', 'くなかった'],
  tara: ['かったら', 'かったら', 'くなかったら', 'くなかったら'],
  citation: ['い', 'かった', 'くない', 'くなかった'],
  dict: ['い', 'い', 'くない', 'くない'],
  stem: ['くあり', 'くあり', 'くないでい', 'くないでい'],
};
const COPULA_ENDINGS: Record<CopulaForm, [string, string, string, string]> = {
  polite: ['です', 'でした', 'ではありません', 'ではありませんでした'],
  prenominal: ['である', 'だった', 'ではない', 'ではなかった'],
  tara: ['だったら', 'だったら', 'ではなかったら', 'ではなかったら'],
  citation: ['である', 'であった', 'ではない', 'ではなかった'],
  dict: ['である', 'である', 'でない', 'でない'],
  stem: ['であり', 'であり', 'でないでい', 'でないでい'],
};
// An intensifier's 〜すぎる is an ichidan verb, so the predicate inflects as one, on the stem
// jaAdjClass's `ru` class leaves (大きすぎ): 大きすぎます / 大きすぎました / 大きすぎません (C33).
const RU_ENDINGS: Record<CopulaForm, [string, string, string, string]> = {
  polite: ['ます', 'ました', 'ません', 'ませんでした'],
  prenominal: ['る', 'た', 'ない', 'なかった'],
  tara: ['たら', 'たら', 'なかったら', 'なかったら'],
  citation: ['る', 'た', 'ない', 'なかった'],
  dict: ['る', 'る', 'ない', 'ない'],
  stem: ['', '', 'ないでい', 'ないでい'],
};
const STATE_ENDINGS: Record<CopulaForm, [string, string, string, string]> = {
  polite: ['います', 'いました', 'いません', 'いませんでした'],
  prenominal: ['いる', 'いた', 'いない', 'いなかった'],
  tara: ['いたら', 'いたら', 'いなかったら', 'いなかったら'],
  citation: ['いる', 'いた', 'いない', 'いなかった'],
  dict: ['いる', 'いる', 'いない', 'いない'],
  stem: ['い', 'い', 'いないでい', 'いないでい'],
};

// The negative a "neither … nor" closes on, after the last conjunct's も, as [present, past]: the
// existential ない (大きくも幸せでもない), or いない after a state's 〜ても (疲れてもいない). A governed
// form takes the plain ない and its でい bridge, as the single-predicate endings above do.
const NEITHER: Record<CopulaForm, [string, string]> = {
  polite: ['ありません', 'ありませんでした'],
  prenominal: ['ない', 'なかった'],
  tara: ['なかったら', 'なかったら'],
  citation: ['ない', 'なかった'],
  dict: ['ない', 'ない'],
  stem: ['ないでい', 'ないでい'],
};
const STATE_NEITHER: Record<CopulaForm, [string, string]> = {
  polite: ['いません', 'いませんでした'],
  prenominal: ['いない', 'いなかった'],
  tara: ['いなかったら', 'いなかったら'],
  citation: ['いない', 'いなかった'],
  dict: ['いない', 'いない'],
  stem: ['いないでい', 'いないでい'],
};
// A verb closes the "neither … nor" on する, not on the existential ある: 大きすぎも小さすぎもしません.
const RU_NEITHER: Record<CopulaForm, [string, string]> = {
  polite: ['しません', 'しませんでした'],
  prenominal: ['しない', 'しなかった'],
  tara: ['しなかったら', 'しなかったら'],
  citation: ['しない', 'しなかった'],
  dict: ['しない', 'しない'],
  stem: ['しないでい', 'しないでい'],
};

/**
 * The copula (BE) predicate: the predicate adjective or noun with its copula — the plain "is careful"
 * (慎重です) that the になる-based predicative can't express. Future reuses the present. By the
 * adjective's class (see `jaAdjClass`):
 * - an i-adjective inflects itself (楽しいです / 楽しくなかったです);
 * - a na-adjective or a の-adjective drops its particle and takes the copula proper (慎重です /
 *   茶色ではありませんでした);
 * - a た-adjective names a state, 〜ている (疲れています / 疲れていません);
 * - a noun is a full noun phrase with the copula (伝説です).
 *
 * `form` is where the predicate stands: the main clause (`polite`), before a head noun in a relative
 * clause (`prenominal`: 大きい / 幸せな / 伝説である / 疲れている, past 大きかった / 幸せだった), in an
 * "if" clause (`tara`: 大きかったら / 幸せだったら / 疲れていたら), which carries no tense, or closing an
 * infinitive citation (`citation`: 大きい / 幸せである / 疲れている / 幸せではない). Under a modal it
 * is the form the modal governs (A128): the dictionary form (`dict`: 大きい / 幸せである / 疲れている /
 * 伝説である, a na-adjective keeping である rather than its attributive な) or the stem 〜たい attaches to
 * (`stem`: 大きくあり / 幸せであり / 疲れてい / 伝説であり). A governed form is negative when the modal
 * denies the predicate rather than itself (A03: 幸せでない必要があります, 幸せでないでいたいです).
 */
export function copulaSegs(pred: ResolvedComplement, tense: Tense, negative: boolean, form: CopulaForm = 'polite'): RubySegment[] {
  const { conjuncts, conjunction, ...group } = pred.phrase;
  // A coordinated predicate (B12) strings its conjuncts with their connective forms (see
  // `predicateLinkSegs`) and leaves the copula to the last one, which inflects as a predicate standing
  // alone: 大きくて幸せです, 伝説で犬です, 大きいか幸せです, 大きくて幸せな猫. A negation reads "neither … nor",
  // 〜も on every conjunct and the negative existential after the last: 大きくも幸せでもありませんでした,
  // 大きくも疲れてもいない猫. A governed form spells the same circumfix under a modal that denies what it
  // governs (A03: 大きくも幸せでもない必要があります).
  if (conjuncts.length > 1) {
    const last = conjuncts[conjuncts.length - 1];
    const governed = form === 'dict' || form === 'stem';
    if (negative) {
      const lastForms = jaComparisonAdj(last.head);
      const lastKind = last.head.forms['role'] === 'adjective'
        ? jaAdjClass(lastForms.base, lastForms.reading, false, lastForms.verbal).kind
        : 'na';
      const table = lastKind === 'ta' ? STATE_NEITHER : lastKind === 'ru' ? RU_NEITHER : NEITHER;
      const tail = table[form][tense === 'past' ? 1 : 0];
      return [...conjuncts.flatMap((np) => predicateLinkSegs(np, 'mo')), { t: tail }];
    }
    const link = conjunction === 'or' ? 'ka' : 'te';
    // An "or" is between whole predicates, so each disjunct carries the clause's past (大きかったか幸せでした);
    // a たら and a governed form carry no tense.
    const past = link === 'ka' && tense === 'past' && !governed && form !== 'tara';
    const lastAlone: ResolvedComplement = { ...pred, phrase: { ...group, conjuncts: [last] } };
    return [...conjuncts.slice(0, -1).flatMap((np) => predicateLinkSegs(np, link, past)), ...copulaSegs(lastAlone, tense, negative, form)];
  }
  const head = firstConjunct(pred.phrase);
  const f = head.head.forms;
  const cell = (negative ? 2 : 0) + (tense === 'past' ? 1 : 0);
  // A `no` noun predicate closes its circumfix in the copula: でもありません, not ではありません, and under a
  // modal でもある — or, where the modal denies it, でもない (A03).
  if (f['role'] !== 'adjective') {
    const ending = COPULA_ENDINGS[form][cell];
    return [...elSegs(pred.phrase), { t: isNegativeGroup(pred.phrase) ? ending.replace(/^では|^で(?=[あな])/, 'でも') : ending }];
  }
  // The lowered degrees negate the adjective (大きい → 大きくない, itself an い-adjective, so it
  // inflects as one: 大きくないです).
  const { base, reading, verbal } = jaComparisonAdj(head.head);
  const { kind, stem, reading: stemReading, attributive, predicative } = jaAdjClass(base, reading, f['relational'] === '1', verbal);
  // The predicate adjective's intensifier and degree adverb lead, as they do attributively
  // (とても楽しいです, もっと楽しいです). A suffix intensifier is inside the stem instead (C33).
  // A standard of comparison leads them both and takes the adverb's place (犬より大きいです, P09-E5).
  const degSegs = jaDegreeSegs(head);
  // A na- or の-adjective before its noun keeps its own attributive particle (幸せな猫, 茶色の猫).
  // A relational one keeps its の in front of the copula too, where dropping it would name the thing
  // the stem is rather than predicate of the subject (猫はアメリカのです, not 猫はアメリカです — A246).
  // A negated lowered degree (A249) denies the proposition the lowered predicate already states, so
  // the negation goes over it rather than into it: the predicate keeps its plain 大きくない and closes
  // on わけ and the negated copula, which carries the tense — 犬ほど大きくないわけではありません(でした),
  // 大きくないわけではない猫 — never the stacked litotes 大きくなくないです.
  if (negative && isLoweredDegree(head.head)) {
    return [...degSegs, wordSeg(stem, stemReading), { t: `${I_ENDINGS.dict[0]}わけ${COPULA_ENDINGS[form][cell]}` }];
  }
  const ending = kind === 'i' ? I_ENDINGS[form][cell]
    : kind === 'ta' ? STATE_ENDINGS[form][cell]
    : kind === 'ru' ? RU_ENDINGS[form][cell]
    : form === 'prenominal' && cell === 0 && attributive ? attributive
    : `${predicative}${COPULA_ENDINGS[form][cell]}`;
  return [...degSegs, wordSeg(stem, stemReading), { t: ending }];
}
