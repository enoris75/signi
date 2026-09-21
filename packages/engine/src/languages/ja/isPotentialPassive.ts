import type { ResolvedPhrase } from '../../types.js';

/**
 * Whether this passive clause is one Japanese says with the **potential on the active verb** rather
 * than with 〜れる/られる: 「フレーズは保存することができません」, not 「フレーズは保存されることができません」.
 *
 * Both the passive morphology and 〜ことができる demote the agent and leave the patient as the topic,
 * so stacking them marks the same thing twice — which is why the language does not: what it says for
 * "X cannot be V-ed" is the ability on the plain verb, the topic は already doing the promotion the
 * passive would have done. (This is the periphrastic potential; the synthetic 保存できない is the same
 * construction contracted.)
 *
 * It holds only for the **agentless** passive. With an agent spoken the に phrase needs the
 * 〜られる to attach to — 「食べ物は猫に食べられることができます」 is clumsy, but dropping the passive
 * there would leave 猫に as an unread dative beside an active verb and say something else — so the
 * doubling stands, and only the agentless clause (which is what a "could not be …" message is)
 * takes the potential.
 *
 * The potential modal is the one marked `potential` in its lexeme (CAN), and it has to be the
 * **innermost** link of the chain: only a modal sitting directly on the verb is in a position to
 * absorb its voice (「保存することができる必要があります」 keeps the obligation outside).
 */
export function isPotentialPassive(phrase: ResolvedPhrase): boolean {
  const verbPhrase = phrase.verbPhrase;
  if (!verbPhrase || verbPhrase.voice !== 'passive' || phrase.agent) return false;
  const innermost = verbPhrase.modals[verbPhrase.modals.length - 1];
  return innermost?.verb.forms['potential'] === '1';
}
