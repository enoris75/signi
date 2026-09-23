import { DEFAULT_LOCATIVE_SPECIFIER } from '@signi/shared';
import type { PhrasePlan } from '@signi/shared';
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
 */
export function resolveQuestion(plan: PhrasePlan, asked: boolean): ResolvedQuestion | undefined {
  const role = plan.questionRole;
  if (!role || !asked) return undefined;
  const animate = plan.questionAnimate === true;
  if (plan.verbPhrase?.voice === 'passive') throw new Error('a passive wh-question is not built yet (P09-E6)');
  if (role === 'subject' || role === 'directObject' || role === 'manner') return { role, animate };
  if (role === 'locative' && pathSpecifier({ specifiers: plan.questionSpecifiers }, DEFAULT_LOCATIVE_SPECIFIER) === 'in') {
    return { role, animate };
  }
  const sentiment = plan.questionSpecifiers?.find((s) => s.kind === 'sentiment')?.value ?? 'neutral';
  if (role === 'cause' && sentiment === 'neutral') return { role, animate };
  throw new Error(`a wh-question cannot yet ask about a ${role} gap in that relation (P09-E6)`);
}
