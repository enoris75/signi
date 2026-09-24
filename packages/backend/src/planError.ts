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
const LINKED_KEYS = new Set(LINKED_CLAUSES.map(([key]) => key));

/**
 * What is missing from a translate request's plan, as the message `/api/translate` answers its 400
 * with, or `undefined` when nothing is. The engine refuses the same plans with an error of its own,
 * so a malformed plan is named at the boundary rather than answered with a 500.
 *
 *  - every clause needs a subject — the top clause and each clause it links (A267), found by the
 *    path it hangs on: `plan.condition.subject.concept is required`. A command's coordinate is
 *    exempt: it takes the command's addressee as its subject.
 *  - every relative clause needs a verb phrase (A273), wherever its noun hangs — a subject, an
 *    object, a complement, a possessor, a conjunct, or a noun inside another relative clause:
 *    `plan.directObject.relative.verbPhrase.verb is required`; and one whose head is not its subject
 *    needs a subject of its own (A275): `plan.subject.relative.subject.concept is required`. Its head
 *    cannot be the role, which no language here relativises (A288):
 *    `plan.directObject.relative.headRole: a relative clause cannot gap a role`.
 *  - a coreferent possessor points at its clause's subject (P11-E2), so it cannot stand inside that
 *    subject — in its possessor chain, a conjunct or a standard, though a relative clause there has a
 *    subject of its own: `plan.subject.possessor: a coreferent possessor cannot stand in the subject it
 *    points at`.
 */
export function planError(plan: unknown): string | undefined {
  if (!isNode(plan)) return 'plan.subject.concept is required';
  return clauseError(plan, 'plan', plan['imperative'] === true && !plan['condition']);
}

function clauseError(clause: Node, path: string, command = false, addressed = false): string | undefined {
  if (!addressed && !hasHead(clause['subject'])) return `${path}.subject.concept is required`;
  const selfLink = coreferentPath(clause['subject'], `${path}.subject`);
  if (selfLink) return selfLink;
  // The clause's own slots, where a noun may carry a relative clause; the linked clauses are
  // clauses of their own, checked below.
  for (const [key, value] of Object.entries(clause)) {
    if (LINKED_KEYS.has(key)) continue;
    const error = nounsError(value, `${path}.${key}`);
    if (error) return error;
  }
  for (const [key, inner] of LINKED_CLAUSES) {
    const link = clause[key];
    const linked = inner && isNode(link) ? link[inner] : link;
    if (!isNode(linked)) continue;
    const error = clauseError(linked, inner ? `${path}.${key}.${inner}` : `${path}.${key}`, false, command && key === 'coordination');
    if (error) return error;
  }
  return undefined;
}

/** What is missing from a relative clause found anywhere below `value`, by its path. */
function nounsError(value: unknown, path: string): string | undefined {
  if (Array.isArray(value)) {
    for (const [i, item] of value.entries()) {
      const error = nounsError(item, `${path}[${i}]`);
      if (error) return error;
    }
    return undefined;
  }
  if (!isNode(value)) return undefined;
  if (isNode(value['relative'])) {
    const error = relativeError(value['relative'], `${path}.relative`);
    if (error) return error;
  }
  for (const [key, inner] of Object.entries(value)) {
    const error = nounsError(inner, `${path}.${key}`);
    if (error) return error;
  }
  return undefined;
}

/**
 * What a relative clause is missing: the verb phrase that says what it says of its head (A273), and,
 * where the head is not its subject, a subject of its own (A275) — without one the engine would read
 * it as a subject relative, the head turned into the one who acts. A head gapped as the role is
 * refused outright (A288): no language here has a relative over its "as".
 */
function relativeError(relative: Node, path: string): string | undefined {
  const verbPhrase = relative['verbPhrase'];
  if (!isNode(verbPhrase) || !verbPhrase['verb']) return `${path}.verbPhrase.verb is required`;
  const headRole = relative['headRole'] ?? 'subject';
  if (headRole === 'role') return `${path}.headRole: a relative clause cannot gap a role`;
  if (headRole !== 'subject' && !hasHead(relative['subject'])) return `${path}.subject.concept is required`;
  return coreferentPath(relative['subject'], `${path}.subject`);
}

/**
 * Where a subject holds a coreferent possessor, which would point at the subject it stands in
 * (P11-E2), as the message naming it — or `undefined`. A relative clause in the subject is a clause
 * of its own whose links name its own subject, so it is not entered here.
 */
function coreferentPath(value: unknown, path: string): string | undefined {
  if (Array.isArray(value)) {
    for (const [i, item] of value.entries()) {
      const found = coreferentPath(item, `${path}[${i}]`);
      if (found) return found;
    }
    return undefined;
  }
  if (!isNode(value)) return undefined;
  if (isNode(value['possessor']) && value['possessor']['kind'] === 'coreferent') {
    return `${path}.possessor: a coreferent possessor cannot stand in the subject it points at`;
  }
  for (const [key, inner] of Object.entries(value)) {
    if (key === 'relative') continue;
    const found = coreferentPath(inner, `${path}.${key}`);
    if (found) return found;
  }
  return undefined;
}
