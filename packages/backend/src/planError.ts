import { nounConjuncts, type NounElement } from '@signi/shared';

type Node = Record<string, unknown>;

const isNode = (value: unknown): value is Node => !!value && typeof value === 'object';

/**
 * Whether a noun element names a head. A coordinated subject ("the cat and the dog") is a group of
 * phrases rather than one, so the head to check for is its first conjunct.
 */
const hasHead = (element: unknown): boolean =>
  isNode(element) && !!nounConjuncts(element as unknown as NounElement)[0]?.concept;

/**
 * The clauses a clause links, each a clause of its own that needs a subject: its if-clause, its
 * object and subject clauses, its coordinate and its adverbial clause (A267). A purpose clause and
 * an infinitive complement are not among them: their subject is their controller's, by design.
 */
const LINKED_CLAUSES: [key: string, clause?: string][] = [
  ['condition'],
  ['contentObject'],
  ['contentSubject'],
  ['coordination', 'clause'],
  ['adverbialClause', 'clause'],
];

/**
 * What is missing from a translate request's plan, as the message `/api/translate` answers its 400
 * with, or `undefined` when nothing is. The engine refuses the same plans with an error of its own,
 * so a malformed plan is named at the boundary rather than answered with a 500.
 *
 *  - every clause needs a subject — the top clause and each clause it links (A267), found by the
 *    path it hangs on: `plan.condition.subject.concept is required`. A command's coordinate is
 *    exempt: it takes the command's addressee as its subject.
 */
export function planError(plan: unknown): string | undefined {
  if (!isNode(plan)) return 'plan.subject.concept is required';
  return clauseError(plan, 'plan', plan['imperative'] === true && !plan['condition']);
}

function clauseError(clause: Node, path: string, command = false, addressed = false): string | undefined {
  if (!addressed && !hasHead(clause['subject'])) return `${path}.subject.concept is required`;
  for (const [key, inner] of LINKED_CLAUSES) {
    const link = clause[key];
    const linked = inner && isNode(link) ? link[inner] : link;
    if (!isNode(linked)) continue;
    const error = clauseError(linked, inner ? `${path}.${key}.${inner}` : `${path}.${key}`, false, command && key === 'coordination');
    if (error) return error;
  }
  return undefined;
}
