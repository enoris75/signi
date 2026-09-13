import type { Tense } from '@signi/shared';
import { adjDegree, firstConjunct, type ResolvedComplement, type RubySegment } from '../../types.js';
import { JA_DEGREE } from './ja.consts.js';
import { elSegs } from './elSegs.js';
import { jaComparisonAdj } from './jaComparisonAdj.js';
import { wordSeg } from './wordSeg.js';

/**
 * The copula (BE) predicate: the predicate adjective or noun with an inflected です — the
 * plain "is careful" (慎重です) that the になる-based predicative can't express. An i-adjective
 * inflects itself (楽しいです / 楽しくなかったです); a na-adjective (strip the attributive な) or a
 * noun takes the copula proper (慎重です / 慎重ではありませんでした). Future reuses the present.
 */
export function copulaSegs(pred: ResolvedComplement, tense: Tense, negative: boolean): RubySegment[] {
  // The inflected copula agrees with one head; a coordinated copular predicate takes the first
  // conjunct's form (a documented approximation — the UI's copula predicate is a single phrase).
  const head = firstConjunct(pred.phrase);
  const f = head.head.forms;
  const past = tense === 'past';
  const isAdj = f['role'] === 'adjective';
  // The lowered degrees negate the adjective (大きい → 大きくない, itself an い-adjective, so the
  // い-branch below inflects its copula: 大きくないです).
  const { base, reading } = isAdj ? jaComparisonAdj(head.head) : { base: f['base'] ?? '', reading: f['reading'] };
  // The predicate adjective's degree adverb leads, as it does attributively (もっと楽しいです).
  const deg = isAdj ? JA_DEGREE[adjDegree(head.head)] : '';
  const degSegs: RubySegment[] = deg ? [{ t: deg }] : [];
  if (isAdj && base.endsWith('い')) {
    const ending = negative
      ? (past ? 'くなかったです' : 'くないです')
      : (past ? 'かったです' : 'いです');
    return [
      ...degSegs,
      wordSeg(base.slice(0, -1), reading?.endsWith('い') ? reading.slice(0, -1) : reading),
      { t: ending },
    ];
  }
  const cop = negative
    ? (past ? 'ではありませんでした' : 'ではありません')
    : (past ? 'でした' : 'です');
  // na-adjective: strip the attributive な, then the copula. A noun predicate is a full NP
  // (its own adjectives/possessor) rendered by npSegs, then the copula.
  if (isAdj && base.endsWith('な')) {
    return [
      ...degSegs,
      wordSeg(base.slice(0, -1), reading?.endsWith('な') ? reading.slice(0, -1) : reading),
      { t: cop },
    ];
  }
  return [...elSegs(pred.phrase), { t: cop }];
}
