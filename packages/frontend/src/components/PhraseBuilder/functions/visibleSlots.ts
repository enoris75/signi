import type { PhraseSelection, SlotConfig } from "../interfaces.ts";
import { ALL_SLOTS, getActiveSlots, REVEALABLE_SLOT_KEYS } from "../slots.ts";
import type { RingHost } from "../ringHost.ts";

/** What a hosted ring's head slot wears in place of its builder's own `subject` slot. */
export type RoleSlot = Pick<SlotConfig, "label" | "labelKey" | "required" | "color">;

/**
 * A conjunct's head word plays the role of the noun it is coordinated with, so its ring wears that
 * role's name and colour ("DIRECT OBJECT", in green) rather than its builder's `subject` slot's. An
 * owner's ring is named for what it is, in the colour of the noun it hangs off. Undefined for a
 * builder with no host.
 */
export function roleSlotFor(ringHost: Pick<RingHost, "kind" | "role"> | undefined): RoleSlot | undefined {
  const hostRole = ringHost && ALL_SLOTS.find((s) => s.key === ringHost.role);
  if (!hostRole) return undefined;
  return ringHost.kind === "owner"
    ? { label: "Possessor", labelKey: "slot.possessor", required: false, color: hostRole.color }
    : hostRole;
}

/** The slots a period shows for what it holds, its subject slot dressed as `roleSlot` if given. */
export function visibleSlotsFor(selection: PhraseSelection, roleSlot: RoleSlot | undefined): SlotConfig[] {
  return (
    getActiveSlots(
      selection.verb?.transitivity,
      selection.subject?.role,
      Boolean(selection.subjectAdjective),
      selection.verb?.complements,
    )
      // Objects hang off the verb, so a subject-only (verbless) period shows none —
      // otherwise an empty Direct Object box would appear before any verb is chosen.
      .filter((s) => selection.verb || !s.key.startsWith("directObject"))
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
