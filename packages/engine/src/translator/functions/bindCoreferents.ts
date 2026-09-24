import type { NounElement, NounPhrase, PhrasePlan } from '@signi/shared';
import { isCoreferentPossessor, isNounGroup, isPronominalPossessor } from '@signi/shared';
import type { BoundPossessor, ResolvedNounElement } from '../../types.js';

/**
 * What a possessor linked to the clause's subject stands for, in this language (P11-E2): the
 * person, number and gender the subject agrees in — the resolved agreement a verb reads, so a
 * coordinated subject is the plural it is ("the cat and the dog see **their** mother") and a noun
 * the grammatical gender its language gives it ("die Frau sieht **ihr** Buch", "la persona vede il
 * **suo** libro").
 *
 * A language whose nouns carry no gender (en, ja) leaves the natural one, as a pronoun standing for
 * the noun does (see `antecedentAgreement`): the gender the plan names on the subject, else neuter
 * for anything that is not a person ("the cat sees **its** book"), else the sex a person noun has by
 * meaning (`sex`, concept-level: MOTHER, WOMAN and WIFE are female, FATHER male), so that "your
 * mother sees **her** book" (A293). A person of unknown sex (PERSON, FRIEND) is not guessed: the
 * possessive is then the unmarked 3rd singular *his*, which is what a pronominal possessor with no
 * gender already says. A group whose members differ in sex, or record none, has none.
 */
export function subjectBinding(subject: ResolvedNounElement, planSubject: NounElement): BoundPossessor {
  const { agreement } = subject;
  const person = agreement['person'] === '1' || agreement['person'] === '2' ? agreement['person'] : '3';
  const number = agreement['number'] === 'plural' ? 'plural' : 'singular';
  const stated = agreement['gender'];
  const grammatical = stated === 'masc' || stated === 'fem' || stated === 'neut' ? stated : undefined;
  // A pronoun's person is its personhood: *I* and *you* are people, and a 3rd-person pronoun is one
  // unless it is the neuter (*it*, それ). A noun says so on its own head (`human`); a group is people
  // when any one of it is.
  const human = subject.conjuncts.some((np) => np.head.forms['person']
    ? np.head.forms['person'] !== '3' || np.head.forms['gender'] !== 'neut'
    : np.head.forms['human'] === '1');
  // One's own family is one's own: a subject that is (P11 D3's `own` mark, set on a kin head whose
  // possessor is the speaker's) makes its relatives the speaker's too. Every one of a group must be.
  const own = subject.conjuncts.every((np) => np.head.forms['own'] === '1');
  const planGender = isNounGroup(planSubject) ? undefined : planSubject.gender;
  const sexes = new Set(subject.conjuncts.map((np) => np.head.forms['sex']));
  const only = sexes.size === 1 ? [...sexes][0] : undefined;
  const sex = only === 'masc' || only === 'fem' ? only : undefined;
  const gender = grammatical ?? planGender ?? sex ?? (human ? undefined : 'neut');
  return {
    kind: 'pronominal',
    person,
    number,
    ...(gender ? { gender } : {}),
    coreferent: 'subject',
    human,
    own,
  };
}

/**
 * A noun element with every coreferent possessor in it bound to `binding` — through the possessor
 * chain ("his mother's book") and the standards of comparison, which are the clause's own phrases.
 * A relative clause is not entered: its subject is its own, and it binds its links itself (see
 * `resolveRelativeClause`).
 *
 * With no binding — a phrase the clause's subject cannot be named for — a coreferent possessor is
 * refused by name, as a subjectless clause is (A267), rather than left to die in the noun resolver.
 * `where` names the slot for the message.
 */
export function bindCoreferents(el: NounElement, binding: BoundPossessor | undefined, where: string): NounElement {
  if (isNounGroup(el)) return { ...el, conjuncts: el.conjuncts.map((np) => bindPhrase(np, binding, where)) };
  return bindPhrase(el, binding, where);
}

function bindPhrase(np: NounPhrase, binding: BoundPossessor | undefined, where: string): NounPhrase {
  if (!hasCoreferent(np)) return np;
  const possessor = np.possessor && !isPronominalPossessor(np.possessor)
    ? isCoreferentPossessor(np.possessor)
      ? binding ?? refuse(where)
      : bindPhrase(np.possessor, binding, where)
    : np.possessor;
  return {
    ...np,
    ...(possessor ? { possessor } : {}),
    ...(np.headStandard ? { headStandard: bindCoreferents(np.headStandard, binding, where) } : {}),
    ...(np.adjectiveStandards
      ? { adjectiveStandards: np.adjectiveStandards.map((s) => s && bindCoreferents(s, binding, where)) }
      : {}),
  };
}

/** The complements of a clause, each phrase bound as `bindCoreferents` binds one. */
export function bindComplements(
  complements: PhrasePlan['complements'],
  binding: BoundPossessor | undefined,
): PhrasePlan['complements'] {
  if (!complements) return complements;
  return Object.fromEntries(Object.entries(complements).map(([type, c]) => [
    type,
    c?.phrase ? { ...c, phrase: bindCoreferents(c.phrase, binding, type) } : c,
  ])) as PhrasePlan['complements'];
}

/** Whether a phrase holds a coreferent possessor outside its relative clause. */
function hasCoreferent(np: NounPhrase): boolean {
  const inElement = (el?: NounElement) => !!el && (isNounGroup(el) ? el.conjuncts : [el]).some(hasCoreferent);
  const p = np.possessor;
  return (!!p && (isCoreferentPossessor(p) || (!isPronominalPossessor(p) && hasCoreferent(p))))
    || inElement(np.headStandard)
    || (np.adjectiveStandards ?? []).some(inElement);
}

function refuse(where: string): never {
  throw new Error(where === 'subject'
    ? 'a coreferent possessor points at the subject, so it cannot stand in the subject itself (P11-E2)'
    : `a coreferent possessor needs a subject to refer to, and the ${where} has none (P11-E2)`);
}
