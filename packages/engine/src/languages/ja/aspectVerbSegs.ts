import type { ResolvedVerbPhrase, RubySegment } from '../../types.js';
import type { JaEnding } from './ja.types.js';
import { plainVerbSeg } from './plainVerbSeg.js';
import { taraSeg } from './taraSeg.js';
import { verbSeg } from './verbSeg.js';
import { volitionalSeg } from './volitionalSeg.js';
import { wordSeg } from './wordSeg.js';

/**
 * The verb segment(s) for a non-neutral aspect:
 *   progressive → the te-form + います ("行っています", past ～ていました)
 *   resultative → a perfect (B05): "has eaten" is the past, 食べました; every other cell is the
 *                 resultant state 〜ている (see below)
 *   prospective → dictionary form + ところです ("行くところです", past ～ところでした)
 * Future reuses the present, as elsewhere in the Japanese engine.
 *
 * The resultative is the perfect the other six languages render, not the completive 〜てしまう it
 * used to map to (which read "will end up eating" and so meant something else). Japanese has no
 * perfect of its own. Its affirmative present "has eaten" is the plain past (もう食べました). Everywhere
 * else it is the resultant state 〜ている: the negative "has not eaten" 食べていません (まだ食べていません),
 * the past perfect "had eaten" 食べていました, the future perfect "will have eaten" 食べています
 * (明日には食べています), the "if" clause's 食べていたら ("if it had eaten"). A state verb's perfect is its
 * state, so "has had" is 持っていました, not the event 持ちました ("took hold of"). A verb whose negative
 * is the event's keeps it (知りません, never 知っていません; A132).
 *
 * `ending` is where the predicate closes (see `JaEnding`): the polite main clause above, the たら of an
 * "if" clause, or the plain form a prenominal relative clause takes (B14). The plain progressive and
 * resultative put their fixed auxiliary in the plain form (食べている猫, 食べていない猫, 食べた猫).
 * The prospective's ところです has no prenominal form a relative can close on (ところの is translationese),
 * so the plain prospective is 〜ようとしている, "is about to", on the volitional: 食べようとしている猫,
 * 食べようとしていた猫. It inflects as the progressive does.
 */
export function aspectVerbSegs(verbPhrase: ResolvedVerbPhrase, negative: boolean, ending: JaEnding = 'polite'): RubySegment[] {
  const { verb, tense = 'present', aspect = 'neutral' } = verbPhrase;
  const past = tense === 'past';
  const dictSeg = wordSeg(verb.forms['base'] ?? '', verb.forms['reading']);
  const te = verb.forms['te'];
  const teSeg = te ? wordSeg(te, verb.forms['te_reading']) : dictSeg;
  // The plain form of the auxiliary いる, which the progressive, the perfect and the plain prospective
  // close on.
  const iru = negative ? (past ? 'いなかった' : 'いない') : (past ? 'いた' : 'いる');
  if (aspect === 'resultative') {
    // A verb whose negative is the event's says "has not known" as it says "does not know": 知りません,
    // 知らなかった猫, 知らなかったら.
    if (negative && verb.forms['event_negative'] === '1') {
      if (ending === 'tara') return [taraSeg(verb, true)];
      return [ending === 'plain' ? plainVerbSeg(verb, tense, true) : verbSeg(verb, true, tense)];
    }
    // "Has eaten" is the past: 食べました, 食べた猫. A state verb's is its state's past: 持っていました.
    if (!negative && tense === 'present' && ending !== 'tara') {
      if (verb.forms['stative'] === '1' && verb.forms['state_verb'] !== '1') {
        return [teSeg, { t: ending === 'plain' ? 'いた' : 'いました' }];
      }
      return [ending === 'plain' ? plainVerbSeg(verb, 'past') : verbSeg(verb, false, 'past')];
    }
    // Every other cell of the perfect is the resultant state 〜ている, built exactly as the progressive.
  }
  // An "if" clause puts the aspect's own fixed ending in the たら form, whatever the tense: 食べていたら,
  // 食べるところだったら, and in the negative いなかったら / ところではなかったら.
  if (ending === 'tara') {
    if (aspect === 'prospective') return [dictSeg, { t: 'ところ' }, { t: negative ? 'ではなかったら' : 'だったら' }];
    return [teSeg, { t: negative ? 'いなかったら' : 'いたら' }];
  }
  if (ending === 'plain') {
    if (aspect === 'prospective') {
      const volitional = volitionalSeg(verb);
      if (volitional) return [volitional, { t: 'として' }, { t: iru }];
      // With no nai-form to build the volitional on, ところ takes the plain copula a noun takes before
      // its head (食べるところである猫).
      const cop = negative ? (past ? 'ではなかった' : 'ではない') : (past ? 'だった' : 'である');
      return [dictSeg, { t: 'ところ' }, { t: cop }];
    }
    return [teSeg, { t: iru }];
  }
  if (aspect === 'prospective') {
    // The copula carries the polarity: affirmative です/でした, negative ではありません(でした) —
    // the same copula negation the na-adjective/noun predicate uses. Without this the prospective
    // renders identically for both polarities.
    const cop = negative
      ? (past ? 'ではありませんでした' : 'ではありません')
      : (past ? 'でした' : 'です');
    return [dictSeg, { t: 'ところ' }, { t: cop }];
  }
  // The progressive and the perfect's resultant state: the te-form + the polite い-stem of いる.
  const suffix = negative
    ? (past ? 'いませんでした' : 'いません')
    : (past ? 'いました' : 'います');
  return [teSeg, { t: suffix }];
}
