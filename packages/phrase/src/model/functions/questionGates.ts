import { DEFAULT_TEMPORAL_RELATION, type Concept } from "@signi/shared";
import { offeredComplements } from "../slots.ts";
import { POSSESSOR_KEY, POSSESSOR_REF_KEY, type NounAddress, type NounKey, type PhraseSelection, type QuestionRole, type SlotQuestionRole } from "../interfaces.ts";
import { resolveAntecedent } from "../selectionToPlan/functions/resolveAntecedent.ts";
import { field } from "../selectionToPlan/functions/field.ts";

/**
 * What the question and the existential controls may reach (P09-E12 M6, M7). Each gate mirrors a
 * refusal of the engine — `resolveQuestion` for a wh-question, `existentialPlan` / `withExistential`
 * for an existential — so a control is withdrawn exactly where the plan it would make is refused, and
 * the plan builder reads the same gate before it writes the field (`selectionToPlan`, `askQuestion`):
 * a mark the selection still holds after the period changed under it (a command set, a verb swapped)
 * is kept for the user and left out of the plan, as a degree left on a noun is.
 */

/** The word held in the asked slot, whose `human` the who / what chip defaults to. */
const heldWord = (sel: PhraseSelection, role: QuestionRole): Concept | undefined =>
  role === "possessor" ? undefined : sel[role];

/**
 * Whether the question over `role` has the two words *who* and *what* (P09-E53 D4): the subject and
 * the object, and the complements whose question word changes with the answer's animacy — *con chi* /
 * *con che cosa*, *zu wem* / *wohin*, *unter wem* / *worunter*, *dank wem* / *dank was*. Not the
 * adverbial gaps (*when*, *how*, a plain *where*, a neutral *why*), not the negative cause (always
 * *whose fault*), and not the route, whose animate question reads "for whom" (es) or takes an object
 * (ja).
 */
export function hasQuestionAnimacy(sel: PhraseSelection, role: QuestionRole | undefined): boolean {
  switch (role) {
    case "subject":
    case "directObject":
    case "terminus":
    case "comitative":
    case "topic":
    case "direction":
    case "source":
      return true;
    case "locative":
      return (sel.locativeSpecifier ?? "in") !== "in";
    case "cause":
      return sel.causeSentiment === "positive";
    default:
      return false;
  }
}

/**
 * Whether the question over `role` asks *who* rather than *what*: the chip's own setting, else the
 * held word's `human` (a man is a who, a cat a what), else *what*. Only a gap with the two words has
 * them (see hasQuestionAnimacy).
 */
export function questionAnimateOf(sel: PhraseSelection, role: QuestionRole | undefined = sel.questionRole): boolean {
  if (!role || !hasQuestionAnimacy(sel, role)) return false;
  return sel.questionAnimate ?? Boolean(heldWord(sel, role)?.human);
}

/** Whether the period's force is a question the engine asks: a verb, and no command or citation. */
export const asksQuestion = (sel: PhraseSelection): boolean =>
  Boolean(sel.interrogative && sel.verb && !sel.imperative && !sel.infinitive);

/**
 * Whether `role` may be the gap of this period's wh-question. Not on an existential, not under a
 * command or a citation; the slot must be the verb's to have — an object for a verb that takes one,
 * a complement it is offered (`offeredComplements`, so a time and a companion on any verb). A
 * complement keeps its relation (P09-E15, P09-E53 D2): a place, a direction, a source or a route in
 * any relation, a cause in any stance but not denied (a gap has no complement to carry the denial),
 * a time only *at* or *until*.
 *
 * The passive asks every slot (P09-E16, P09-E54 D1): the roles stay the active ones, the object's
 * gap asks the patient ("what is eaten by the cat?") and the subject's the agent ("who is the food
 * eaten by?"). Not over a verb whose object takes a preposition in some language
 * (`prepositionalObject`, D3): that language has no passive, and in the active the gap would name
 * another slot, so the engine refuses the question.
 */
export function canAsk(
  sel: PhraseSelection,
  role: QuestionRole,
  possessed: "subject" | "directObject" = sel.questionPossessed ?? "subject",
): boolean {
  const verb = sel.verb;
  if (!verb || sel.imperative || sel.infinitive || sel.existential) return false;
  if (sel.verbVoice === "passive" && verb.prepositionalObject) return false;
  // A passive question needs a patient to promote, the engine's own condition: an object, or the
  // object as the gap. A passive left on a period whose object is gone asks nothing.
  if (sel.verbVoice === "passive" && !sel.directObject && role !== "directObject") return false;
  switch (role) {
    case "subject":
      return true;
    case "possessor":
      return canAskOwner(sel, possessed);
    case "directObject":
      return verb.transitivity !== "intransitive";
    default:
      if (!offeredComplements(verb).includes(role)) return false;
      if (role === "cause") return !sel.causeNegative;
      if (role === "temporal") {
        const relation = sel.temporalRelation ?? DEFAULT_TEMPORAL_RELATION;
        return relation === "at" || relation === "until";
      }
      return true;
  }
}

/**
 * Whether the owner of the subject or the object may be asked, "**whose** food does the cat eat?"
 * (P09-E52 D2), past the clause's own conditions: the possessed slot holds a single noun — no
 * pronoun, no coordination — whose owner is a named ring, not a pointed-to noun, and is its owner
 * rather than the whole it is part of or the parts it is made of; the object is the verb's to have;
 * and in the passive only the patient's owner, the agent's being refused (P09-E54 D4). Each mirrors a
 * refusal of the engine's `possessorQuestion` / `resolvePhrase`.
 */
function canAskOwner(sel: PhraseSelection, possessed: "subject" | "directObject"): boolean {
  if (possessed === "directObject" && sel.verb?.transitivity === "intransitive") return false;
  if (sel.verbVoice === "passive" && possessed !== "directObject") return false;
  if (sel[possessed]?.role !== "noun") return false;
  const conjuncts = (sel[`${possessed}Conjuncts`] ?? []) as PhraseSelection[];
  if (conjuncts.some((c) => c.subject)) return false;
  if (sel[`${possessed}PossessorRef`]) return false;
  const role = sel.possessorRoles?.[possessed];
  return role !== "whole" && role !== "parts";
}

/**
 * Whether the period has a patient for the passive to promote (P09-E54 D2): an object that holds a
 * word, or one a wh-question asks about, which is usually empty — the engine counts the gap as the
 * object ("what is eaten by the cat?").
 */
export const hasPatient = (sel: PhraseSelection): boolean =>
  Boolean(sel.directObject) || sel.questionRole === "directObject";

/**
 * Whether a box's relation is there to choose (P09-E53 D3): on a box that holds a word, and on the
 * one a wh-question asks about, which is usually empty — the relation is the gap's ("**under what**").
 */
export const hasRelation = (sel: PhraseSelection, slot: SlotQuestionRole | "objectPredicative"): boolean =>
  Boolean(sel[slot]) || sel.questionRole === slot;

/** The wh-question's gap as the plan will carry it: the marked slot, where the engine asks it. */
export function askedRole(sel: PhraseSelection): QuestionRole | undefined {
  const role = sel.questionRole;
  return role && asksQuestion(sel) && canAsk(sel, role) ? role : undefined;
}

/**
 * Whether the subject may be an existential's pivot: the verb is BE, the clause active, with no
 * command, citation or wh-question, and the pivot a noun or an indefinite pronoun — *something*, not
 * *me* (the engine has no existential of a personal pronoun yet). A coordinated pivot is a group, not
 * a pronoun, and stays — unless it holds the generic person, which has no object form for the
 * pivot to take (A354: "there is a night and one" is refused), head or conjunct alike.
 */
export function canBeExistential(sel: PhraseSelection): boolean {
  if (sel.verb?.id !== "BE" || sel.imperative || sel.infinitive || sel.questionRole) return false;
  if (sel.verbVoice === "passive") return false;
  const pivot = sel.subject;
  if (!pivot) return false;
  if ([pivot, ...(sel.subjectConjuncts ?? []).map((c) => c.subject)].some((w) => w?.id === "GENERIC_PERSON")) return false;
  if (pivot.role === "noun") return true;
  if (pivot.role !== "pronoun") return false;
  // A conjunct counts once it holds a word: an empty one is left out of the plan.
  return pivot.slot === "indefinite" || Boolean(sel.subjectConjuncts?.some((c) => c.subject));
}

/**
 * Whether the period may be said with the **humble** verb, the Japanese 謙譲語 (P11-E6): 私は
 * いただきます, 父と私は参ります. It mirrors the engine's gate (`buildClauseSegments`, `jaRespectRegister`)
 * so the subject's toggle is offered exactly where it changes the Japanese sentence, and the plan
 * builder reads it before it writes `VerbPhrase.humble`:
 *
 *  - the verb has a humble word (`Concept.humble`), or is BE without a predicative — the existential
 *    or locative いる, whose おる is the engine's own (`JA_IRU`), not the copula;
 *  - the clause says its subject and keeps its verb: no command, no citation, no passive;
 *  - the subject is not the wh-question's gap, which is a throwaway with no one to lower;
 *  - every subject conjunct that holds a word is the speaker's own side (see isOwnSide).
 *
 * A plain clause (relative, content, adverbial) is not asked about: the selection does not know that
 * a link makes it one, and the engine leaves the flag alone there, as it does the existential's.
 */
export function canBeHumble(sel: PhraseSelection): boolean {
  const verb = sel.verb;
  if (!verb || sel.imperative || sel.infinitive || sel.verbVoice === "passive") return false;
  if (!verb.humble && !(verb.id === "BE" && !sel.predicative)) return false;
  if (askedRole(sel) === "subject") return false;
  if (!isOwnSide(sel, "subject", sel)) return false;
  const conjuncts = (sel.subjectConjuncts ?? []).filter((c) => c.subject);
  return conjuncts.every((c) => isOwnSide(c, "subject", sel));
}

/**
 * Whether the noun in `sel[key]` is the speaker's own side, the engine's `isOwnSide`: a 1st-person
 * pronoun (*I*, *we*), or a relative (`Concept.relative`) whose owner is the speaker (see
 * ownedBySpeaker). `root` is the period, where a pointed-to owner is resolved.
 */
function isOwnSide(sel: PhraseSelection, key: NounKey, root: PhraseSelection): boolean {
  const word = field<Concept>(sel, key);
  if (word?.role === "pronoun") return word.person === "1";
  return word?.role === "noun" && Boolean(word.relative) && ownedBySpeaker(sel, key, root);
}

/**
 * Whether the owner of the noun in `sel[key]` makes it the speaker's, as `applyPossessorForm` carries
 * the engine's `own`: a possessor that points at a 1st-person word (*I and my father*), or a named
 * owner that is itself the speaker's own side — a relative owned by the speaker, one link at a time
 * (my brother's wife). A named owner that is a kind of person rather than a person (*a* brother's,
 * brothers') makes no one one's own, as the engine's early return says.
 */
function ownedBySpeaker(sel: PhraseSelection, key: NounKey, root: PhraseSelection): boolean {
  const ref = field<NounAddress>(sel, POSSESSOR_REF_KEY(key));
  if (ref) return resolveAntecedent(root, ref)?.features.person === "1";
  const owner = field<PhraseSelection>(sel, POSSESSOR_KEY(key));
  if (!owner?.subject) return false;
  if (owner.subjectDefiniteness === "indefinite" || owner.subjectDefiniteness === "bare") return false;
  return isOwnSide(owner, "subject", root);
}
