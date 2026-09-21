import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';

/**
 * The determiners the Saxon genitive can carry for the head it possesses. "the cat's book" is
 * definite, an indefinite or bare head is left on the clitic by decision (A184), and "all" simply
 * stacks in front of it ("all the cat's books"). Every other determiner — a demonstrative, a
 * quantifier, `no` — has nowhere to stand once the possessor owns the determiner slot, so the head
 * keeps it by going to the of-genitive instead.
 */
const SAXON_GENITIVE_HEAD: ReadonlySet<string> = new Set(['definite', 'indefinite', 'bare', 'all']);

/**
 * Whether a possessed head has a determiner of its own that the Saxon genitive would swallow, so
 * the phrase must take the of-genitive ("this book of the cat", "no book of the cat"). A proper
 * name takes no determiner in English, so the clitic loses nothing there.
 */
export function keepsHeadDeterminer(forms: Record<string, string>): boolean {
  if (forms['proper'] === '1') return false;
  return !SAXON_GENITIVE_HEAD.has(forms['definiteness'] ?? 'definite');
}

/**
 * Whether a possessor is post-modified — so heavy that the Saxon clitic "'s" would land on the
 * wrong word (the last word of a relative clause, or of an of-phrase) rather than on the
 * possessor's head. English forbids the Saxon genitive here (the "group genitive" constraint) and
 * uses the of-genitive instead. A relative clause is one post-modifier; a trailing of-genitive is
 * the other, whether it comes from a post-modified possessor further down the chain or from the
 * phrase keeping a determiner of its own (A184: "this father of the cat" → "the book of this
 * father of the cat").
 */
export function isPostModified(np: ResolvedNounPhrase): boolean {
  if (np.relative) return true;
  if (!np.possessor) return false;
  // A pronominal possessor ("his") is a bare prenominal word, so it post-modifies nothing and
  // propagates nothing — unless the head kept its own determiner and sent it to the of-genitive
  // too ("this book of hers", A187).
  if (isPronominalPossessor(np.possessor)) return keepsHeadDeterminer(np.head.forms);
  return keepsHeadDeterminer(np.head.forms) || isPostModified(np.possessor);
}
