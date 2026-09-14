import type { UiStringKey } from "@signi/shared";
import type { PhraseSelection, SlotConfig, SlotKey } from "../interfaces.ts";

/**
 * The words whose solid ring carries a clear button: a chosen word that is not a link target's
 * greyed endpoint, not open for re-picking, and not the subject a mood has replaced.
 */
export function clearableKeys({
  groups,
  selection,
  linkTargetKeys,
  editingSlot,
}: {
  groups: readonly { mainKey: string }[];
  selection: PhraseSelection;
  linkTargetKeys: ReadonlySet<string> | undefined;
  editingSlot: SlotKey | null;
}): Set<string> {
  const moodSubject = Boolean(selection.imperative || selection.infinitive);
  return new Set(
    groups
      .map((g) => g.mainKey)
      .filter(
        (k) =>
          Boolean(selection[k as SlotKey]) &&
          !linkTargetKeys?.has(k) &&
          editingSlot !== k &&
          !(k === "subject" && moodSubject),
      ),
  );
}

/** The clear button on each clearable word's solid ring, titled by its slot. */
export function clearControlsFor({
  clearable,
  visibleSlots,
  onClear,
}: {
  clearable: ReadonlySet<string>;
  visibleSlots: readonly Pick<SlotConfig, "key" | "label" | "labelKey">[];
  onClear: (slot: SlotKey) => void;
}): { mainKey: string; label: string; labelKey?: UiStringKey; onClear: () => void }[] {
  return [...clearable].map((mainKey) => {
    const slot = visibleSlots.find((s) => s.key === mainKey);
    return {
      mainKey,
      label: slot?.label ?? mainKey,
      labelKey: slot?.labelKey,
      onClear: () => onClear(mainKey as SlotKey),
    };
  });
}
