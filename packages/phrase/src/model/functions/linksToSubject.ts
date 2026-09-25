import type { Possessor } from "@signi/shared";
import { inVocative, type NounAddress, type PhraseSelection } from "../interfaces.ts";
import { resolveAntecedent } from "../selectionToPlan/functions/resolveAntecedent.ts";

/**
 * P11-E7: a noun's possessor pointed at the clause's own subject is the link E2 built,
 * `{ kind: 'coreferent', slot: 'subject' }`, rather than a copy of the subject's features — where the
 * clause allows it. Each gate below is one reason it may not; the selection keeps the pointer either
 * way, and the plan says what the clause allows (the stale-mark rule), so switching the voice or
 * moving a noun into the subject turns a link back into a copy with no user action.
 *
 * The plan builder and the chip both read `linksToSubject`, so what the line says is what the plan
 * writes.
 */
type LinkGate = (root: PhraseSelection, possessed: NounAddress) => boolean;

const LINK_GATES: readonly LinkGate[] = [
  // Outside the subject's own subtree — its owner chain, a conjunct, a standard — where the link would
  // point at the phrase it stands in, which the engine refuses. A relative or content clause inside
  // the subject is a period of its own, judged against its own subject.
  (_root, possessed) => possessed !== "subject" && !possessed.startsWith("subject/"),
  // An active clause: under the passive the plan's subject is the demoted agent, and Japanese 自分
  // prefers the grammatical subject (E2's lead). The copy keeps today's 彼の there.
  (root) => root.verbVoice !== "passive",
  // A clause: a verbless period is its subject alone, so nothing in it but the subject could link.
  (root) => Boolean(root.verb),
  // Not in the address (P11-E8's vocative): the engine says it outside every clause, so a link there
  // has no subject to name and is refused (P11-E2). A pointer in it stays a copy.
  (_root, possessed) => !inVocative(possessed),
];

/** Whether a possessor of the noun at `possessed`, pointed at `subject`, is the link (D3). */
export function linksToSubject(root: PhraseSelection, possessed: NounAddress): boolean {
  return LINK_GATES.every((holds) => holds(root, possessed));
}

/**
 * Whether the subject box stands elsewhere on the canvas: under a command its place is the command
 * box and the plan's subject the addressee, under a citation the placeholder "one" — so a pointer at
 * `subject` there names no word the user sees, and reads none (D4).
 */
const subjectHidden = (root: PhraseSelection): boolean => Boolean((root.imperative || root.infinitive) && root.verb);

/**
 * The possessor a noun whose owner points at `antecedent` has in the plan: the link where the clause
 * allows one (D1–D3), else a copy of the antecedent's features — and nothing for a pointer at a
 * hidden subject the link cannot reach, which would otherwise copy the stashed word (D4), or at a noun
 * that has since gone.
 */
export function pointedPossessor(root: PhraseSelection, possessed: NounAddress, antecedent: NounAddress): Possessor | undefined {
  if (antecedent === "subject") {
    if (linksToSubject(root, possessed)) return { kind: "coreferent", slot: "subject" };
    if (subjectHidden(root)) return undefined;
  }
  return resolveAntecedent(root, antecedent)?.features;
}

/**
 * Whether a pointer still says something: a link, or a copy of a word still there. The console
 * prints, keeps and accepts a pointer exactly when it does, so `#1.subj` under a command applies and
 * round-trips (D6).
 */
export function pointerHolds(root: PhraseSelection, possessed: NounAddress, antecedent: NounAddress): boolean {
  return pointedPossessor(root, possessed, antecedent) !== undefined;
}
