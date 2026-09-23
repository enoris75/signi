import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounElement, ResolvedNounPhrase } from '../../types.js';

/** A register of respect a Japanese verb can be spoken in (P11-E1 D1): 尊敬語 or 謙譲語. */
export type JaRespect = 'honorific' | 'humble';

/** The determiners under which a genitive possessor is a kind of person rather than a person. */
const NOBODY_IN_PARTICULAR = new Set(['indefinite', 'bare']);

/**
 * Whether a subject conjunct is **someone else's relative**, the one who is raised: a `kin` head that
 * is not one's own, with a possessor who is a person in particular — あなたのお母さん, 男の子のお母さん.
 * It is the same line `applyPossessorForm` draws when it picks the noun's `honorific` column (P11 D3),
 * read back off the resolved phrase, so the verb is honorific exactly where the noun is: 猫の母 (a cat
 * is no one to be polite to), 母親 (nobody's) and 親の母親 (a kind of person) keep the plain verb.
 */
function isOthersKin(np: ResolvedNounPhrase): boolean {
  const forms = np.head.forms;
  if (forms['kin'] !== '1' || forms['own'] === '1' || !np.possessor) return false;
  const possessor = np.possessor;
  if (isPronominalPossessor(possessor)) {
    return possessor.person === '2' || (possessor.person === '3' && possessor.gender !== 'neut');
  }
  return possessor.head.forms['human'] === '1'
    && !NOBODY_IN_PARTICULAR.has(possessor.head.forms['definiteness'] ?? 'definite');
}

/** Whether a subject conjunct is the speaker's own side: the 1st person, or one's own relative (私の父). */
function isOwnSide(np: ResolvedNounPhrase): boolean {
  return np.head.forms['person'] === '1' || (np.head.forms['kin'] === '1' && np.head.forms['own'] === '1');
}

/**
 * The register the verb of a Japanese clause takes from **whose** its subject is (P11-E1): someone
 * else's relative is raised with the honorific (あなたのお母さんがいらっしゃいます), and the speaker's own
 * side is lowered with the humble — but only when the plan asks for it (`humble`, D4), because
 * humility is towards a listener the plan does not model, where the honorific on someone else's
 * mother is close to obligatory. Every other subject — a cat, a man, a teacher (D3) — is plain.
 *
 * A coordinated subject takes a register only when every conjunct does: あなたのお母さんと猫 is
 * spoken of plainly.
 */
export function jaRespectRegister(subject: ResolvedNounElement, humble = false): JaRespect | undefined {
  const { conjuncts } = subject;
  if (conjuncts.length === 0) return undefined;
  if (conjuncts.every(isOthersKin)) return 'honorific';
  if (humble && conjuncts.every(isOwnSide)) return 'humble';
  return undefined;
}
