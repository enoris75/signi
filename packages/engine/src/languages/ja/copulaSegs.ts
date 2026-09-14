import type { Tense } from '@signi/shared';
import type { ResolvedComplement, RubySegment } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { JA_DEGREE } from './ja.consts.js';
import type { JaForm } from './ja.types.js';
import { elSegs } from './elSegs.js';
import { isNegativeGroup } from './isNegativeGroup.js';
import { jaAdjClass } from './jaAdjClass.js';
import { jaComparisonAdj } from './jaComparisonAdj.js';
import { wordSeg } from './wordSeg.js';

/**
 * Where the copula predicate stands, which picks its ending. `dict` and `stem` are the forms a modal
 * governs (see `JaForm`), which carries the tense and polarity itself.
 */
export type CopulaForm = 'polite' | 'prenominal' | 'tara' | JaForm;

// The endings by class and form, as [affirmative present, affirmative past, negative present, negative
// past]. A たら form ignores tense, so it repeats its two cells; a governed form ignores both, so it
// repeats one.
const I_ENDINGS: Record<CopulaForm, [string, string, string, string]> = {
  polite: ['いです', 'かったです', 'くないです', 'くなかったです'],
  prenominal: ['い', 'かった', 'くない', 'くなかった'],
  tara: ['かったら', 'かったら', 'くなかったら', 'くなかったら'],
  dict: ['い', 'い', 'い', 'い'],
  stem: ['くあり', 'くあり', 'くあり', 'くあり'],
};
const COPULA_ENDINGS: Record<CopulaForm, [string, string, string, string]> = {
  polite: ['です', 'でした', 'ではありません', 'ではありませんでした'],
  prenominal: ['である', 'だった', 'ではない', 'ではなかった'],
  tara: ['だったら', 'だったら', 'ではなかったら', 'ではなかったら'],
  dict: ['である', 'である', 'である', 'である'],
  stem: ['であり', 'であり', 'であり', 'であり'],
};
const STATE_ENDINGS: Record<CopulaForm, [string, string, string, string]> = {
  polite: ['います', 'いました', 'いません', 'いませんでした'],
  prenominal: ['いる', 'いた', 'いない', 'いなかった'],
  tara: ['いたら', 'いたら', 'いなかったら', 'いなかったら'],
  dict: ['いる', 'いる', 'いる', 'いる'],
  stem: ['い', 'い', 'い', 'い'],
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
 * clause (`prenominal`: 大きい / 幸せな / 伝説である / 疲れている, past 大きかった / 幸せだった), or in an
 * "if" clause (`tara`: 大きかったら / 幸せだったら / 疲れていたら), which carries no tense. Under a modal it
 * is the form the modal governs (A128): the dictionary form (`dict`: 大きい / 幸せである / 疲れている /
 * 伝説である, a na-adjective keeping である rather than its attributive な) or the stem 〜たい attaches to
 * (`stem`: 大きくあり / 幸せであり / 疲れてい / 伝説であり).
 */
export function copulaSegs(pred: ResolvedComplement, tense: Tense, negative: boolean, form: CopulaForm = 'polite'): RubySegment[] {
  // The inflected copula agrees with one head; a coordinated copular predicate takes the first
  // conjunct's form (a documented approximation — the UI's copula predicate is a single phrase).
  const head = firstConjunct(pred.phrase);
  const f = head.head.forms;
  const cell = (negative ? 2 : 0) + (tense === 'past' ? 1 : 0);
  // A `no` noun predicate closes its circumfix in the copula: でもありません, not ではありません, and under a
  // modal でもある.
  if (f['role'] !== 'adjective') {
    const ending = COPULA_ENDINGS[form][cell];
    return [...elSegs(pred.phrase), { t: isNegativeGroup(pred.phrase) ? ending.replace(/^では|^で(?=あ)/, 'でも') : ending }];
  }
  // The lowered degrees negate the adjective (大きい → 大きくない, itself an い-adjective, so it
  // inflects as one: 大きくないです).
  const { base, reading } = jaComparisonAdj(head.head);
  const { kind, stem, reading: stemReading, attributive } = jaAdjClass(base, reading);
  // The predicate adjective's degree adverb leads, as it does attributively (もっと楽しいです).
  const deg = JA_DEGREE[adjDegree(head.head)];
  const degSegs: RubySegment[] = deg ? [{ t: deg }] : [];
  // A na- or の-adjective before its noun keeps its own attributive particle (幸せな猫, 茶色の猫).
  const ending = kind === 'i' ? I_ENDINGS[form][cell]
    : kind === 'ta' ? STATE_ENDINGS[form][cell]
    : form === 'prenominal' && cell === 0 && attributive ? attributive
    : COPULA_ENDINGS[form][cell];
  return [...degSegs, wordSeg(stem, stemReading), { t: ending }];
}
