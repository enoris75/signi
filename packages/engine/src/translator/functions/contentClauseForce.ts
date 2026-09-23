import type { ContentClause } from '@signi/shared';
import type { ConceptForms } from '../../types.js';

/**
 * Whether an object clause **asks** — the indirect question, "asks **whether** the cat runs", "knows
 * **where** the cat eats" (P09-E17) — checked against what its governing verb takes. The force is the
 * clause's own (`interrogative`, or a `questionRole`, which implies it); what licenses it is the verb,
 * whose lexeme names it as `content_clause_force`:
 *  - `'interrogative'` — a question only. ASK reports a question, and a statement under it is the
 *    mandative "asks that the cat run", a sense it does not have.
 *  - `'either'` — a statement or a question: KNOW, SAY, TELL ("knows that…", "knows whether…").
 *  - absent — a statement only: THINK and BELIEVE ("*thinks whether the cat runs").
 *
 * A mismatch is refused rather than rendered as the other force, which would say something else.
 */
export function contentClauseForce(clause: ContentClause, governor: ConceptForms): boolean {
  const asks = !!clause.interrogative || !!clause.questionRole;
  const licensed = governor.forms['content_clause_force'];
  if (asks && licensed !== 'interrogative' && licensed !== 'either') {
    throw new Error(`${governor.conceptId} does not take an indirect question (P09-E17)`);
  }
  if (!asks && licensed === 'interrogative') {
    throw new Error(`${governor.conceptId} takes an indirect question, not a statement (P09-E17)`);
  }
  return asks;
}

/**
 * The clause with its question fields dropped: a content clause asks only as a verb's object (see
 * `contentClauseForce`), so under an evaluative predicate or a subordinating conjunction it is the
 * plain statement — "it is right that the cat runs", "runs when the cat runs" — as a condition, a
 * command and a citation already drop a question (A272).
 */
export function declarativeClause<T extends ContentClause>(clause: T): T {
  const { interrogative: _i, questionRole: _r, questionSpecifiers: _s, questionAnimate: _a, ...rest } = clause;
  return rest as T;
}
