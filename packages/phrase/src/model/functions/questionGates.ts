import type { Concept } from "@signi/shared";
import type { PhraseSelection, QuestionRole } from "../interfaces.ts";

/**
 * What the question and the existential controls may reach (P09-E12 M6, M7). Each gate mirrors a
 * refusal of the engine — `resolveQuestion` for a wh-question, `existentialPlan` / `withExistential`
 * for an existential — so a control is withdrawn exactly where the plan it would make is refused, and
 * the plan builder reads the same gate before it writes the field (`selectionToPlan`, `askQuestion`):
 * a mark the selection still holds after the period changed under it (a passive set, a verb swapped)
 * is kept for the user and left out of the plan, as a degree left on a noun is.
 */

/** The word held in a subject or object gap, whose `human` the who / what chip defaults to. */
const heldWord = (sel: PhraseSelection, role: QuestionRole): Concept | undefined =>
  role === "subject" ? sel.subject : role === "directObject" ? sel.directObject : undefined;

/**
 * Whether the question over `role` asks *who* rather than *what*: the chip's own setting, else the
 * held word's `human` (a man is a who, a cat a what), else *what*. Only a subject or an object gap
 * has the two words.
 */
export function questionAnimateOf(sel: PhraseSelection, role: QuestionRole | undefined = sel.questionRole): boolean {
  if (role !== "subject" && role !== "directObject") return false;
  return sel.questionAnimate ?? Boolean(heldWord(sel, role)?.human);
}

/** Whether the period's force is a question the engine asks: a verb, and no command or citation. */
export const asksQuestion = (sel: PhraseSelection): boolean =>
  Boolean(sel.interrogative && sel.verb && !sel.imperative && !sel.infinitive);

/**
 * Whether `role` may be the gap of this period's wh-question. Not in the passive (the passive
 * re-maps the slots the gap names), not on an existential, not under a command or a citation; the
 * slot must be the verb's to have — an object for a verb that takes one, a complement it licenses —
 * and a locative only in its plain relation (*where* is *in*), a cause only neutral and not denied
 * (*why* is *because of*).
 */
export function canAsk(sel: PhraseSelection, role: QuestionRole): boolean {
  const verb = sel.verb;
  if (!verb || sel.imperative || sel.infinitive || sel.existential) return false;
  if (sel.verbVoice === "passive") return false;
  switch (role) {
    case "subject":
      return true;
    case "directObject":
      return verb.transitivity !== "intransitive";
    case "locative":
      return Boolean(verb.complements?.includes("locative")) && (sel.locativeSpecifier ?? "in") === "in";
    case "manner":
      return Boolean(verb.complements?.includes("manner"));
    case "cause":
      return (
        Boolean(verb.complements?.includes("cause")) &&
        (sel.causeSentiment ?? "neutral") === "neutral" &&
        !sel.causeNegative
      );
  }
}

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
