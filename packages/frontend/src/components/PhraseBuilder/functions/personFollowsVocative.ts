import { CONJUNCTS_KEY, imperativePerson, type PhraseSelection } from "../interfaces.ts";

/** Whether the vocative calls more than one hearer: a plural, or a group of two or more. */
export function vocativeIsPlural(sel: PhraseSelection): boolean {
  if (!sel.vocative) return false;
  const conjuncts = (sel[CONJUNCTS_KEY("vocative")] as PhraseSelection[] | undefined) ?? [];
  return sel.vocativeNumber === "plural" || conjuncts.some((c) => c.subject);
}

/**
 * The command's person follows the vocative's number (P11-E8 D4) — a default the canvas applies to
 * what one of its own actions just did, and never the reducers, so the console's deliberate person
 * holds. A command that calls "Mom and Dad" is said to them both: *Mamma e papà, correte*, not
 * *corri*. So when the vocative turns plural — its number, a second word in its group, a plural "you"
 * — or the period turns into a command with a plural vocative, the 2nd singular becomes the 2nd
 * plural; when it turns singular again, the 2nd plural goes back. "Let's" (1st plural) is never
 * touched, nor a person the vocative's number did not just change under.
 */
export function personFollowsVocative(prev: PhraseSelection, next: PhraseSelection): PhraseSelection {
  if (!next.imperative) return next;
  const was = Boolean(prev.imperative) && vocativeIsPlural(prev);
  const now = vocativeIsPlural(next);
  if (was === now) return next;
  const person = imperativePerson(next);
  if (now && person === "2sg") return { ...next, imperativePerson: "2pl" };
  if (!now && person === "2pl" && prev.imperative) {
    const { imperativePerson: _plural, ...rest } = next;
    return rest;
  }
  return next;
}
