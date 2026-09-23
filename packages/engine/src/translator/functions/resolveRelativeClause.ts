import type { RelativeClause } from '@signi/shared';
import type { ResolvedNounElement, ResolvedRelativeClause } from '../../types.js';
import { RELATIVIZES_AGENT } from '../translator.consts.js';
import type { LexiconLookup } from '../translator.types.js';
import { bindComplements, bindCoreferents, subjectBinding } from './bindCoreferents.js';
import { passiveGap } from './passiveGap.js';
import { resolveComplements } from './resolveComplements.js';
import { resolveNounElement } from './resolveNounElement.js';
import { resolveVerbPhrase } from './resolveVerbPhrase.js';
import { withAlarmCry } from './withAlarmCry.js';

/**
 * Resolve a relative clause: its verb phrase, optional objects, and complements. The
 * gap slot named by `headRole` (default 'subject') is filled by the head noun above,
 * so it is absent from the clause's own fields; a non-subject relative carries its own
 * `subject`, which the engines use for agreement.
 *
 * A `'possessor'` gap gaps no slot: the head owns the clause's own `subject`, which is present and
 * drives agreement exactly as a non-subject relative's does ("a period whose noun is a word").
 *
 * `headForms` are the head noun's, passed down from `resolveNounPhrase`. They stand in for the
 * clause's subject where the gap IS the subject, which is what a `subject_sense` reads ("der Kater,
 * der die Maus frisst", A157).
 *
 * A **passive** relative is re-mapped here, as `resolvePhrase` re-maps a main clause (A01): the patient
 * is promoted to subject and the agent demoted to the by-phrase — and the gap moves with whichever of
 * the two the head is (see `passiveRemap`).
 */
export function resolveRelativeClause(
  clause: RelativeClause,
  language: string,
  lookup: LexiconLookup,
  headForms?: Record<string, string>,
): ResolvedRelativeClause {
  // A relative clause is what its verb says of the head: one without a verb phrase is a malformed
  // plan, refused by name rather than left to die destructuring it (A273). `/api/translate` says the
  // same with the field's path.
  if (!clause.verbPhrase) throw new Error('a relative clause needs a verb phrase: relative.verbPhrase.verb is required (A273)');
  const headRole = clause.headRole ?? 'subject';
  // A clause whose gap is not its subject says a subject of its own. Without one it would render as a
  // subject relative, the head turned into the one who acts ("the cat that eats" for *the cat that
  // [someone] eats*), so it is refused by name instead — not filled in with the generic person, which
  // the plan can name itself, and not turned into a passive, another construct (A275).
  if (headRole !== 'subject' && !clause.subject) {
    throw new Error(`a relative clause whose head is its ${headRole} needs a subject of its own: relative.subject.concept is required (A275)`);
  }
  const subject = clause.subject
    ? resolveNounElement(bindCoreferents(clause.subject, undefined, 'subject'), language, lookup)
    : undefined;
  // A possessor linked to the subject names the relative's own (P11-E2, see `bindCoreferents`): its
  // `subject`, or, where the gap is the subject, the head that fills it — "the man who sees his
  // mother". The head's forms are final by now, the possessor's form and all.
  const binding = subject && clause.subject
    ? subjectBinding(subject, clause.subject)
    : headRole === 'subject' && headForms
      ? subjectBinding({ conjuncts: [{ head: { conceptId: '', forms: headForms }, adjectives: [], nounModifiers: [] }], agreement: headForms }, { concept: '' })
      : undefined;
  const resolvedObject = clause.directObject
    ? resolveNounElement(bindCoreferents(clause.directObject, binding, 'directObject'), language, lookup)
    : undefined;
  // Two gaps keep the relative **active** whatever voice its plan names, since the passive would demote
  // the head (or what it owns) to a by-phrase no relativizer here can say: a genitive relative's head
  // owns the agent ("*the girl by whose cat the food is eaten"), and Japanese relativises no agent at
  // all (see RELATIVIZES_AGENT). The plain active clause is still a true sentence.
  const keepsActive = headRole === 'possessor' || (headRole === 'subject' && !RELATIVIZES_AGENT.has(language));
  const { voice: _voice, ...activePlan } = clause.verbPhrase;
  // The head gapped as the direct object is the verb's object too ("il ragazzo che il gatto conosce").
  // The sense is the agent's under either voice, so it reads the plan's own subject (see resolveVerbPhrase).
  const verbPhrase = resolveVerbPhrase(
    keepsActive ? activePlan : clause.verbPhrase, language, lookup, undefined, undefined,
    !!clause.directObject || headRole === 'directObject',
    headRole === 'subject' ? headForms : subject?.agreement,
  );
  // The alarm a cry raises has no determiner slot, as in a main clause: "the boy who cried wolf" (A163).
  const directObject = resolvedObject && withAlarmCry(resolvedObject, verbPhrase.verb, language);
  // An experiencer verb re-maps a relative clause as it re-maps a main one (see `resolvePhrase`,
  // C34), and the gap moves with the slot the head fills.
  const { experiencer, ...experiencerSlots } = verbPhrase.verb.forms['experiencer'] === '1'
    ? experiencerRemap(headRole, subject, directObject)
    : { experiencer: undefined, headRole, subject, directObject };
  const slots = verbPhrase.voice === 'passive'
    ? passiveRemap(headRole, subject, directObject)
    : experiencerSlots;
  const complements = resolveComplements(bindComplements(clause.complements, binding), language, lookup, verbPhrase.verb.forms);
  return {
    ...slots,
    ...(clause.headSpecifiers?.length ? { headSpecifiers: clause.headSpecifiers } : {}),
    verbPhrase,
    complements: experiencer ? { ...complements, terminus: { phrase: experiencer } } : complements,
  };
}

/**
 * The core slots of an experiencer relative (see `resolvePhrase`): the thing liked is the clause's
 * subject and the one who likes is its dative, so the gap moves with whichever of the two the head
 * is.
 *
 *  - the head is the **experiencer** (gapped as the subject): the thing liked becomes the clause's
 *    own subject and the gap becomes the dative — "il gatto **a cui** piace il cane";
 *  - the head is the **thing liked** (gapped as the object): it is the clause's subject now, and the
 *    experiencer follows as the dative — "il cane **che** piace al gatto";
 *  - the head fills a **complement**, which the frame leaves where it was.
 *
 * A generic experiencer is dropped, as a generic agent is under the passive.
 */
function experiencerRemap(
  headRole: ResolvedRelativeClause['headRole'],
  subject: ResolvedNounElement | undefined,
  directObject: ResolvedNounElement | undefined,
): Pick<ResolvedRelativeClause, 'headRole' | 'subject' | 'directObject'> & { experiencer?: ResolvedNounElement } {
  const dative = subject && subject.agreement['generic'] !== '1' ? subject : undefined;
  if (headRole === 'subject') return { headRole: 'terminus', subject: directObject };
  if (headRole === 'directObject') return { headRole: 'subject', experiencer: dative };
  return { headRole, subject: directObject, experiencer: dative };
}

/**
 * The core slots of a passive relative. `resolveVerbPhrase` has already checked there is a patient to
 * promote — the plan's object, or the head gapped as it — so the three gaps a passive can have are:
 *
 *  - the head is the **patient** (gapped as the object): it is the clause's subject now, and the
 *    agent follows as the by-phrase — "the book that is written by the child";
 *  - the head is the **agent** (gapped as the subject): the object is promoted to the clause's own
 *    subject, and the head is the by-phrase's gap — "the child by whom the book is written";
 *  - the head fills a **complement**, which the voice leaves where it was: "the house in which the book
 *    is written by the child".
 *
 * A generic agent is demoted to nothing, as in a main clause: "the book that is written".
 */
function passiveRemap(
  headRole: ResolvedRelativeClause['headRole'],
  subject: ResolvedNounElement | undefined,
  directObject: ResolvedNounElement | undefined,
): Pick<ResolvedRelativeClause, 'headRole' | 'subject' | 'directObject' | 'agent'> {
  // The gap moves as `passiveGap` moves it, which a passive wh-question shares (P09-E16).
  const gap = passiveGap(headRole);
  if (gap === 'agent') return { headRole: gap, subject: directObject };
  const agent = subject && subject.agreement['generic'] !== '1' ? { agent: subject } : {};
  if (headRole === 'directObject') return { headRole: gap, ...agent };
  return { headRole: gap, subject: directObject, ...agent };
}
