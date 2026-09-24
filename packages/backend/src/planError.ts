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
 *  - the address calls the hearer (A338): an instruction takes none, and a personal pronoun there is
 *    the 2nd person: `plan.address: an instruction addresses nobody, so it takes no address`.
 *  - the generic person (GENERIC_PERSON) is never a direct object, wherever the object hangs — a
 *    clause's, a relative's, a content clause's, an infinitive's or a purpose's (A354):
 *    `plan.directObject: the generic person (GENERIC_PERSON) cannot be a direct object`. An addressee
 *    beside a content clause is exempt where the verb takes it to the dative, as the engine moves it,
 *    and so is the patient of a passive, which is its subject ("one is seen by the cat").
 */
export function planError(plan: unknown, formsOf?: FormsOf): string | undefined {
  if (!isNode(plan)) return 'plan.subject.concept is required';
  return clauseError(plan, 'plan', plan['imperative'] === true && !plan['condition'])
    ?? addressError(plan, formsOf)
    ?? genericObjectPath(plan, 'plan', formsOf);
}

/** A concept's forms, as the lexicon hands them to the engine, for the checks that read a word's kind. */
export type FormsOf = (conceptId: string) => Record<string, string> | undefined;

/**
 * What contradicts the top clause's address (A338). An address calls the hearer, so an instruction,
 * addressed to nobody, takes none; and a personal pronoun there is the 2nd person, the hearer's
 * (an indefinite one, "Someone, run!", calls whoever hears it). The pronoun check needs the lexicon
 * (`formsOf`), and is skipped without it.
 */
function addressError(plan: Node, formsOf?: FormsOf): string | undefined {
  const address = plan['address'];
  if (!isNode(address)) return undefined;
  if (plan['imperative'] === true && plan['imperativeRegister'] === 'instruction') {
    return 'plan.address: an instruction addresses nobody, so it takes no address';
  }
  if (!formsOf) return undefined;
  for (const [i, np] of nounConjuncts(address as unknown as NounElement).entries()) {
    const forms = typeof np?.concept === 'string' ? formsOf(np.concept) : undefined;
    const person = forms?.['indefinite'] === '1' ? undefined : forms?.['person'];
    if (person && person !== '2') {
      const path = 'conjuncts' in address ? `plan.address.conjuncts[${i}]` : 'plan.address';
      return `${path}: an address calls the hearer, so it cannot be a ${person === '1' ? '1st' : '3rd'}-person pronoun`;
    }
  }
  return undefined;
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

/**
 * Where a direct object anywhere below `value` is the generic person, which has no object form in
 * five of the languages (A354), as the message naming it — or `undefined`. A passive's object is its
 * subject ("one is seen by the cat"), so it passes. A clause's object beside a
 * content clause is the addressee the engine moves to the dative where the verb licenses a terminus
 * and the plan names none (see the engine's `addresseeObject`), so it is exempt there; without the
 * lexicon (`formsOf`) that cannot be read, and such an object is let through for the engine to judge.
 */
function genericObjectPath(value: unknown, path: string, formsOf?: FormsOf): string | undefined {
  if (Array.isArray(value)) {
    for (const [i, item] of value.entries()) {
      const found = genericObjectPath(item, `${path}[${i}]`, formsOf);
      if (found) return found;
    }
    return undefined;
  }
  if (!isNode(value)) return undefined;
  const object = value['directObject'];
  const verbPhrase = value['verbPhrase'];
  const passive = isNode(verbPhrase) && verbPhrase['voice'] === 'passive';
  if (isNode(object) && nounConjuncts(object as unknown as NounElement).some((np) => np?.concept === 'GENERIC_PERSON')
    && !passive && !movesToAddressee(value, formsOf)) {
    return `${path}.directObject: the generic person (GENERIC_PERSON) cannot be a direct object`;
  }
  for (const [key, inner] of Object.entries(value)) {
    const found = genericObjectPath(inner, `${path}.${key}`, formsOf);
    if (found) return found;
  }
  return undefined;
}

/** Whether a clause's direct object is the addressee its content clause sends to the dative (A317). */
function movesToAddressee(clause: Node, formsOf?: FormsOf): boolean {
  if (!isNode(clause['contentObject'])) return false;
  const verbPhrase = clause['verbPhrase'];
  if (!isNode(verbPhrase) || verbPhrase['voice'] === 'passive') return false;
  const complements = clause['complements'];
  if (isNode(complements) && complements['terminus']) return false;
  if (!formsOf) return true;
  const verb = typeof verbPhrase['verb'] === 'string' ? formsOf(verbPhrase['verb']) : undefined;
  return (verb?.['complements'] ?? '').split(',').map((c) => c.trim()).includes('terminus');
}
