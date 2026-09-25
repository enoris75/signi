import { DEFAULT_TEMPORAL_RELATION, type Concept } from "@signi/shared";
import { offeredComplements } from "../slots.ts";
import type { PhraseSelection, QuestionRole } from "../interfaces.ts";

/**
 * What the question and the existential controls may reach (P09-E12 M6, M7). Each gate mirrors a
 * refusal of the engine — `resolveQuestion` for a wh-question, `existentialPlan` / `withExistential`
 * for an existential — so a control is withdrawn exactly where the plan it would make is refused, and
 * the plan builder reads the same gate before it writes the field (`selectionToPlan`, `askQuestion`):
 * a mark the selection still holds after the period changed under it (a command set, a verb swapped)
 * is kept for the user and left out of the plan, as a degree left on a noun is.
 */

/** The word held in the asked slot, whose `human` the who / what chip defaults to. */
const heldWord = (sel: PhraseSelection, role: QuestionRole): Concept | undefined => sel[role];

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
export function canAsk(sel: PhraseSelection, role: QuestionRole): boolean {
  const verb = sel.verb;
  if (!verb || sel.imperative || sel.infinitive || sel.existential) return false;
  if (sel.verbVoice === "passive" && verb.prepositionalObject) return false;
  switch (role) {
    case "subject":
      return true;
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
export const hasRelation = (sel: PhraseSelection, slot: QuestionRole | "objectPredicative"): boolean =>
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
 * a pronoun, and stays.
 */
export function canBeExistential(sel: PhraseSelection): boolean {
  if (sel.verb?.id !== "BE" || sel.imperative || sel.infinitive || sel.questionRole) return false;
  if (sel.verbVoice === "passive") return false;
  const pivot = sel.subject;
  if (!pivot) return false;
  if (pivot.role === "noun") return true;
  if (pivot.role !== "pronoun") return false;
  // A conjunct counts once it holds a word: an empty one is left out of the plan.
  return pivot.slot === "indefinite" || Boolean(sel.subjectConjuncts?.some((c) => c.subject));
}
