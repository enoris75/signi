import { isNounGroup } from '@signi/shared';
import type { NounElement, PhrasePlan } from '@signi/shared';
import type { ResolvedQuestion } from '../../types.js';
import { causeSentiment } from '../../functions/causeSentiment.js';
import { temporalRelation } from '../../functions/temporalRelation.js';

/**
 * The gap of a wh-question (P09-E6), or undefined when `plan` asks none or its force does not hold —
 * `asked` is false under a condition, a command or a citation, which drop the question the way they
 * drop a yes/no one (see PhrasePlan.interrogative).
 *
 * The subject and the direct object are *who* / *what*, the manner *how* and a neutral cause *why*
 * (P09-E6). Every other complement keeps its relation (P09-E15): the gap carries the plan's
 * `questionSpecifiers`, and each engine asks it through its own complement path ("under what?",
 * "thanks to whom?", "with what?") or, where the relation is plain, with an adverb (*where*, *where
 * from*, *when*, *until when* — see `questionAdverbial`). A negative cause asks *whose fault* and so is
 * always a person. What is refused, and why, each naming its follow-up:
 *  - the predicative, the object predicative and the role, which take no adposition ("what does the
 *    cat become?") — the predicative question's own task;
 *  - the purpose, whose "what for?" overlaps *why*;
 *  - the temporal `ago`, `after`, `before` and `during` ("how long ago" is a quantity question, and
 *    "after what?" is not a question anyone asks of a time);
 *  - an instrument presented as an action (`process` / `concept`, "by choosing a word"), whose
 *    question is *how*.
 * The roles are the plan's, the **active** slots, whatever its voice: a passive question's gap is
 * moved by `resolvePhrase` once it knows the verb passivizes (P09-E16, see `passiveGap`).
 *
 * A **possessor** gap (P09-E14, "whose food does the cat eat?") asks inside the noun phrase that
 * `questionPossessed` names, the subject by default; that slot stays filled. It is always a person,
 * whatever `questionAnimate` says (*whose*). The slot must hold a single noun phrase with no possessor
 * of its own, in the owner relation — a coordination, a noun that already has a possessor, or a
 * part-whole relation ("the part of what?", a thing question) are refused here, a pronoun by
 * `resolvePhrase`, which is where the lexicon says what a pronoun is.
 */
export function resolveQuestion(plan: PhrasePlan, asked: boolean): ResolvedQuestion | undefined {
  const role = plan.questionRole;
  if (!role || !asked) return undefined;
  const animate = plan.questionAnimate === true;
  if (role === 'possessor') return possessorQuestion(plan);
  if (role === 'subject' || role === 'directObject' || role === 'manner') return { role, animate };
  const specifiers = plan.questionSpecifiers;
  const gap = { specifiers };
  if (role === 'predicative' || role === 'objectPredicative' || role === 'role') {
    throw new Error(`a wh-question cannot yet ask about a ${role} gap: it takes no adposition (the predicative question, a follow-up of P09-E15)`);
  }
  if (role === 'purpose') throw new Error('a wh-question cannot yet ask about a purpose gap: "what for?" overlaps why (a follow-up of P09-E15)');
  if (role === 'temporal' && temporalRelation(gap) !== 'at' && temporalRelation(gap) !== 'until') {
    throw new Error(`a wh-question cannot yet ask about a temporal gap in the ${temporalRelation(gap)} relation (a follow-up of P09-E15)`);
  }
  // The gap has no action to fall back from, so the level is the one the plan names.
  const level = specifiers?.find((s) => s.kind === 'abstraction')?.value ?? 'object';
  if (role === 'instrumental' && level !== 'object') {
    throw new Error(`a wh-question cannot ask about an instrumental gap at the ${level} level: its question is how (P09-E15)`);
  }
  // A negative cause is a possessor of its fault, and asks *whose* (D4).
  const person = animate || (role === 'cause' && causeSentiment(gap) === 'negative');
  return { role, animate: person, ...(specifiers ? { specifiers } : {}) };
}

/** The possessor gap's question, or a refusal naming what the possessed slot cannot be (P09-E14). */
function possessorQuestion(plan: PhrasePlan): ResolvedQuestion {
  const possessed = plan.questionPossessed ?? 'subject';
  if (possessed !== 'subject' && possessed !== 'directObject') {
    throw new Error(`a possessor question can ask inside the subject or the direct object only, not a ${String(possessed)} (P09-E14)`);
  }
  const slot: NounElement | undefined = possessed === 'subject' ? plan.subject : plan.directObject;
  if (!slot) throw new Error(`a possessor question over the ${possessed} needs a ${possessed} to possess (P09-E14)`);
  if (isNounGroup(slot)) throw new Error('a possessor question cannot ask inside a coordination (P09-E14)');
  if (slot.possessor) throw new Error('a possessor question cannot ask about a noun that already has a possessor (P09-E14)');
  if (slot.possessorRole === 'whole' || slot.possessorRole === 'parts') {
    throw new Error(`a possessor question asks for an owner, not a ${slot.possessorRole} (P09-E14)`);
  }
  return { role: 'possessor', possessed, animate: true };
}
