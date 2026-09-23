import { DEFAULT_LOCATIVE_SPECIFIER, isNounGroup } from '@signi/shared';
import type { NounElement, PhrasePlan } from '@signi/shared';
import type { ResolvedQuestion } from '../../types.js';
import { pathSpecifier } from '../../functions/pathSpecifier.js';

/**
 * The gap of a wh-question (P09-E6), or undefined when `plan` asks none or its force does not hold —
 * `asked` is false under a condition, a command or a citation, which drop the question the way they
 * drop a yes/no one (see PhrasePlan.interrogative).
 *
 * Only five gaps have a question word yet: the subject and the direct object (*who* / *what*), the
 * plain locative (*where*), the manner (*how*) and a neutral cause (*why*). A marked relation asks
 * with a preposition over *what* ("under what?", "thanks to whom?"), and every other complement gap
 * needs one too; that is not built, and a plan asking it is refused here rather than rendered as a
 * question about something else — no builder control can produce one yet. So is a **passive**
 * question: the passive re-maps the plan's slots (the object asked about would become the subject),
 * and the gap would have to move with them, as a relative clause's does (`passiveRemap`).
 *
 * A **possessor** gap (P09-E14, "whose food does the cat eat?") asks inside the noun phrase that
 * `questionPossessed` names, the subject by default; that slot stays filled. It is always a person,
 * whatever `questionAnimate` says (*whose*). The slot must hold a single noun phrase with no possessor
 * of its own, in the owner relation — a coordination, a noun that already has a possessor, or a part-whole relation
 * ("the part of what?", a thing question) are refused here, a pronoun by `resolvePhrase`, which is
 * where the lexicon says what a pronoun is.
 */
export function resolveQuestion(plan: PhrasePlan, asked: boolean): ResolvedQuestion | undefined {
  const role = plan.questionRole;
  if (!role || !asked) return undefined;
  const animate = plan.questionAnimate === true;
  if (plan.verbPhrase?.voice === 'passive') throw new Error('a passive wh-question is not built yet (P09-E6)');
  if (role === 'possessor') return possessorQuestion(plan);
  if (role === 'subject' || role === 'directObject' || role === 'manner') return { role, animate };
  if (role === 'locative' && pathSpecifier({ specifiers: plan.questionSpecifiers }, DEFAULT_LOCATIVE_SPECIFIER) === 'in') {
    return { role, animate };
  }
  const sentiment = plan.questionSpecifiers?.find((s) => s.kind === 'sentiment')?.value ?? 'neutral';
  if (role === 'cause' && sentiment === 'neutral') return { role, animate };
  throw new Error(`a wh-question cannot yet ask about a ${role} gap in that relation (P09-E6)`);
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
