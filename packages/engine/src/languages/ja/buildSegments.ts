import type { ResolvedPhrase, RubySegment } from '../../types.js';
import { COORD_WORDS } from './ja.consts.js';
import { buildClauseSegments } from './buildClauseSegments.js';

export function buildSegments(phrase: ResolvedPhrase): RubySegment[] {
  // A yes/no question keeps the statement's order and closes its polite predicate on the particle か:
  // 猫は食べますか, サーバーは稼働中ですか. A clause coordinated with it is a question of its own.
  const ka: RubySegment[] = phrase.verbPhrase?.interrogative ? [{ t: 'か' }] : [];
  const main = [...buildClauseSegments(phrase, 'は'), ...ka];
  // Hypothetical conditional: もし <protasis (…たら)>、 <apodosis (…でしょう)>. The condition
  // clause's subject takes が (the neutral subject marker inside a subordinate clause).
  const sentence = phrase.condition
    ? [{ t: 'もし' }, ...buildClauseSegments(phrase.condition, 'が'), { t: '、' }, ...main]
    : main;
  if (!phrase.coordination) return sentence;
  // Coordination. The words that join two clauses (そして, しかし, …) are connectives (接続詞), not
  // conjunctive particles. After a finite polite predicate (ます / です / ください) the first clause is
  // a sentence of its own, so it closes, and the connective opens the next with its own comma:
  // 猫は走ります。しかし、犬は跳びます (A122). The instruction register and the citation end on a
  // non-polite form that stays inside one sentence (食べ物を食べ、それから走り), and keep the comma
  // before the connective.
  const vp = phrase.verbPhrase;
  const closes = !!vp && vp.mood !== 'infinitive' && !(vp.mood === 'imperative' && vp.register === 'instruction');
  const connective = { t: COORD_WORDS[phrase.coordination.conjunction] };
  return [
    ...sentence,
    ...(closes ? [{ t: '。' }, connective, { t: '、' }] : [{ t: '、' }, connective]),
    ...buildClauseSegments(phrase.coordination.clause, 'は'),
    ...ka,
  ];
}
