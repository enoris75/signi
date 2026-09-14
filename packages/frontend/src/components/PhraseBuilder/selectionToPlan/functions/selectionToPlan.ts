import type { PhrasePlan } from "@signi/shared";
import type { PhraseSelection } from "../../interfaces.ts";
import { buildComplements } from "./buildComplements.ts";
import { buildNounElement } from "./buildNounElement.ts";
import { buildVerbPhrase } from "./buildVerbPhrase.ts";
import { imperativeSubject } from "./imperativeSubject.ts";

// Serialise one container's flat selection into a wire PhrasePlan (its noun phrases carry
// no relative clauses; those are attached from cross-container links in workspacePlan).
export function selectionToPlan(sel: PhraseSelection): Partial<PhrasePlan> {
  // An imperative is a command, so it only takes effect once there is a verb to command.
  // Until then the period behaves like any other: an empty container stays empty instead of
  // leaking the synthesised addressee pronoun ("you.") that the subject-dropping mood would
  // otherwise render with no verb to attach to.
  const imperative = Boolean(sel.imperative && sel.verb);
  // The infinitive citation is likewise a subject-dropping mood that needs a verb to cite; until
  // one is picked the period stays a plain (buildable) subject. The engines drop the subject, so
  // it takes a throwaway GENERIC_PERSON purely to satisfy the plan's required `subject` field —
  // the same placeholder the seeded verb definitions use.
  const infinitive = Boolean(sel.infinitive && sel.verb);
  return {
    // An imperative synthesises its subject from the chosen addressee (the user's own subject
    // pick is left untouched in the selection, so toggling the command off restores it); an
    // infinitive drops it entirely behind the impersonal placeholder.
    subject: imperative
      ? imperativeSubject(sel.imperativePerson)
      : infinitive
        ? { concept: "GENERIC_PERSON" }
        : buildNounElement(sel, "subject"),
    verbPhrase: buildVerbPhrase(sel),
    directObject: buildNounElement(sel, "directObject"),
    complements: buildComplements(sel),
    // The register rides along with the mood: absent ⇒ 'request', a command spoken to the
    // addressee above. 'instruction' addresses nobody, and the engines then ignore the person.
    ...(imperative && {
      imperative: true,
      ...(sel.imperativeRegister && { imperativeRegister: sel.imperativeRegister }),
    }),
    ...(infinitive && { infinitive: true }),
  };
}
