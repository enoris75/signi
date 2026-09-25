import type { NounKey, PhraseSelection, SlotConfig } from "../interfaces.ts";
import { ALL_SLOTS, getActiveSlots, offeredComplements, REVEALABLE_SLOT_KEYS } from "../slots.ts";

/** What a hosted ring's head slot wears in place of its builder's own `subject` slot. */
export type RoleSlot = Pick<SlotConfig, "label" | "labelKey" | "required" | "color">;

/** The part of the canvas's `RingHost` that names a hosted ring's role: what the ring is, and the period noun it goes with. */
export interface RingRole {
  kind: "conjunct" | "owner" | "standard";
  role: NounKey;
  // A standard under a superlative, which reads as the set it picks from (P09-E51 D2).
  set?: boolean;
}

/**
 * A conjunct's head word plays the role of the noun it is coordinated with, so its ring wears that
 * role's name and colour ("DIRECT OBJECT", in green) rather than its builder's `subject` slot's. An
 * owner's ring is named for what it is, in the colour of the noun it hangs off. Undefined for a
 * builder with no host.
 */
export function roleSlotFor(ringHost: RingRole | undefined): RoleSlot | undefined {
  const hostRole = ringHost && ALL_SLOTS.find((s) => s.key === ringHost.role);
  if (!hostRole) return undefined;
  if (ringHost.kind === "owner")
    return { label: "Possessor", labelKey: "slot.possessor", required: false, color: hostRole.color };
  // A standard of comparison is named for what it is too, in the predicative's colour (P09-E12 D5):
  // on a superlative, the set it picks from (P09-E51 D2).
  if (ringHost.kind === "standard")
    return ringHost.set
      ? { label: "Comparison set", labelKey: "slot.comparisonSet", required: false, color: hostRole.color }
      : { label: "Standard of comparison", labelKey: "slot.standard", required: false, color: hostRole.color };
  return hostRole;
}

/**
 * A passive swaps which box is the clause's subject: the patient in the direct-object box is
 * promoted to subject, and the agent stays where it was but is no longer one — it is spoken as the
 * by-phrase (see `ResolvedPhrase.agent`). The boxes keep their places and their words; only what
 * they are *called* changes, so the canvas says what the translation says.
 *
 * It applies only where the voice actually takes (a transitive verb with an object to promote),
 * which is the condition the translator checks before it re-maps anything (see `resolveVoice`), and
 * the same one the voice satellite is shown on.
 */
export function passiveCaptions(slot: SlotConfig): SlotConfig {
  if (slot.key === "subject") return { ...slot, label: "Agent", labelKey: "slot.agent" };
  if (slot.key === "directObject") {
    const subject = ALL_SLOTS.find((s) => s.key === "subject")!;
    return { ...slot, label: subject.label, labelKey: subject.labelKey };
  }
  return slot;
}

/** Whether this period's voice is one the engines will actually render (see `passiveCaptions`). */
export function rendersPassive(selection: PhraseSelection): boolean {
  const transitivity = selection.verb?.transitivity;
  return (
    selection.verbVoice === "passive" &&
    !selection.imperative &&
    (transitivity === "transitive" || transitivity === "ditransitive") &&
    Boolean(selection.directObject)
  );
}

/** The slots a period shows for what it holds, its subject slot dressed as `roleSlot` if given. */
export function visibleSlotsFor(selection: PhraseSelection, roleSlot: RoleSlot | undefined): SlotConfig[] {
  const passive = rendersPassive(selection);
  return (
    getActiveSlots(
      selection.verb?.transitivity,
      selection.subject?.role,
      Boolean(selection.subjectAdjective),
      offeredComplements(selection.verb),
    )
      // Objects hang off the verb, so a subject-only (verbless) period shows none —
      // otherwise an empty Direct Object box would appear before any verb is chosen.
      .filter((s) => selection.verb || !s.key.startsWith("directObject"))
      .map((s) => (passive ? passiveCaptions(s) : s))
      .map((s) =>
        roleSlot && s.key === "subject"
          ? { ...s, label: roleSlot.label, labelKey: roleSlot.labelKey, required: roleSlot.required, color: roleSlot.color }
          : s,
      )
  );
}

/**
 * The visible slots that render a box: satellite slots (adjective / adverb) only when revealed or
 * filled; the direct object, only while its own control on the verb-phrase box has it unfolded.
 */
export function renderedSlotsFor(visibleSlots: SlotConfig[], shownMap: Record<string, boolean>): SlotConfig[] {
  return visibleSlots.filter((s) => !REVEALABLE_SLOT_KEYS.has(s.key) || shownMap[s.key]);
}
