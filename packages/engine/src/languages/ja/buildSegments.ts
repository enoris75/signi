import type { ResolvedPhrase, RubySegment } from '../../types.js';
import { COORD_WORDS } from './ja.consts.js';
import { buildClauseSegments } from './buildClauseSegments.js';

export function buildSegments(phrase: ResolvedPhrase): RubySegment[] {
  const main = buildClauseSegments(phrase, 'は');
  // Hypothetical conditional: もし <protasis (…たら)>、 <apodosis (…でしょう)>. The condition
  // clause's subject takes が (the neutral subject marker inside a subordinate clause).
  const sentence = phrase.condition
    ? [{ t: 'もし' }, ...buildClauseSegments(phrase.condition, 'が'), { t: '、' }, ...main]
    : main;
  // Coordination: <first clause>、<conjunction> <second clause>.
  if (!phrase.coordination) return sentence;
  return [
    ...sentence,
    { t: '、' },
    { t: COORD_WORDS[phrase.coordination.conjunction] },
    ...buildClauseSegments(phrase.coordination.clause, 'は'),
  ];
}
