import type { GenderSlot, NounKey, NumberSlot, SlotKey } from "../../interfaces.ts";
import type { SatelliteIcon } from "../../Boxes.tsx";
import { COMPLEMENT_KEY_SET, REVEALABLE_SLOT_KEYS } from "../../slots.ts";
import type {
  BuildSatelliteIconsArgs,
  PerimeterEntry,
  SatelliteIcons,
} from "../satellites.types.tsx";

// Sort every available satellite into the three places its control can render: keyed by the
// node that carries it (a word, whose solid ring seats it, or — chained — the satellite before
// it, after whose disc it rides the orbit), on the verb-phrase dotted ring (the complement
// toggles), or on a noun's dotted ring (the relative-clause + possessor controls, which also
// anchor their connector lines). Pure derivation from the satellites and the current
// collapse / link state; the three `on*` callbacks are what each icon does when clicked.
export function buildSatelliteIcons({
  satellites,
  shownMap,
  collapsedMainKeys,
  linkBinding,
  onToggleNumber,
  onToggleGender,
  onToggleNegative,
  onToggleReveal,
  onAddConjunct,
}: BuildSatelliteIconsArgs): SatelliteIcons {
  const satelliteIconsByParent: Record<string, SatelliteIcon[]> = {};
  const complementToggleIcons: SatelliteIcon[] = [];
  const perimeterByNoun: Partial<Record<NounKey, PerimeterEntry>> = {};
  // Sits apart from the complement toggles: it is seated at the point where the object's
  // connector leaves the verb-phrase dotted ring, so it reads as that line's start (VerbPhraseBuilder).
  let directObjectToggle: SatelliteIcon | undefined;

  for (const sat of satellites) {
    if (!sat.available) continue;
    // The instrumental control is a cross-container link, not a reveal: it rides the verb-phrase
    // dotted ring (with the other complement toggles) and points at the period holding the
    // instrument. Clicking it starts a pick, or removes the link once one is made. It exists
    // only in a workspace container — a standalone period has nowhere to link to.
    if (sat.key === "instrumental") {
      if (!linkBinding) continue;
      const linked = linkBinding.instrumental.hasSource;
      complementToggleIcons.push({
        key: sat.key,
        icon: sat.icon,
        labelKey: sat.labelKey,
        // Never "active": there is no box to reveal, so the icon reads as *set* (a link exists)
        // or not, and its tooltip says what clicking will do.
        active: false,
        label: sat.label,
        isSet: linked,
        valued: false,
        valueLabel: linked ? "Linked — click to remove" : undefined,
        onToggle: () =>
          linked
            ? linkBinding.instrumental.onClear()
            : linkBinding.instrumental.onStart(),
      });
      continue;
    }
    // The "Relative clause" satellite is a cross-container link control, not a reveal.
    // It only exists in a workspace container (needs the binding); clicking it starts a
    // link (pick a noun in another container) or, when already a source, removes it.
    const relativeNoun: NounKey | null = sat.key.endsWith("Relative")
      ? (sat.key.slice(0, -"Relative".length) as NounKey)
      : null;
    if (relativeNoun) {
      if (!linkBinding) continue;
      const isSource = linkBinding.relative.sourceKeys.has(relativeNoun);
      (perimeterByNoun[relativeNoun] ??= {}).relative = {
        key: sat.key,
        icon: sat.icon,
        label: sat.label,
        active: isSource,
        isSet: isSource,
        valued: false,
        valueLabel: isSource ? "Linked — click to remove" : undefined,
        onToggle: () =>
          isSource
            ? linkBinding.relative.onRemoveLink(relativeNoun)
            : linkBinding.relative.onStartLink(relativeNoun),
      };
      continue;
    }
    // The "Coordinate" satellite rides the perimeter beside the possessor control. Clicking it
    // appends one more conjunct, whose ring joins the group on the canvas.
    const conjunctNoun: NounKey | null = sat.key.endsWith("Conjunct")
      ? (sat.key.slice(0, -"Conjunct".length) as NounKey)
      : null;
    if (conjunctNoun) {
      (perimeterByNoun[conjunctNoun] ??= {}).conjunct = {
        key: sat.key,
        icon: sat.icon,
        label: sat.label,
        // Never `active`: this control does not reveal a box that a second click would hide —
        // it *appends* a phrase, and clicking it again appends another. Saying so keeps the
        // button's tooltip on its value ("Add a conjunct") instead of offering to "Hide" it.
        active: false,
        isSet: sat.hasValue,
        valued: true,
        valueLabel: sat.valueLabel,
        onToggle: () => onAddConjunct(conjunctNoun),
      };
      continue;
    }
    // A direct-toggle satellite (number / gender / polarity) has no reveal box — its
    // ring icon flips the value in place (singular ⇄ plural, positive ⇄ negative, or
    // cycling masc → fem → …). `which` is the slot key minus the "Number" / "Gender" suffix.
    const numberSlot: NumberSlot | null =
      sat.directToggle && sat.key.endsWith("Number")
        ? (sat.key.slice(0, -"Number".length) as NumberSlot)
        : null;
    const genderSlot: GenderSlot | null =
      sat.directToggle && sat.key.endsWith("Gender")
        ? (sat.key.slice(0, -"Gender".length) as GenderSlot)
        : null;
    const iconEntry: SatelliteIcon = {
      key: sat.key,
      icon: sat.icon,
      label: sat.label,
      labelKey: sat.labelKey,
      active: sat.shown,
      isSet: sat.hasValue,
      valued: Boolean(sat.alwaysSet),
      valueLabel: sat.valueLabel,
      directToggle: sat.directToggle,
      onToggle: numberSlot
        ? () => onToggleNumber(numberSlot)
        : genderSlot
          ? () => onToggleGender(genderSlot)
          : sat.key === "verbNegative"
            ? onToggleNegative
            : () => onToggleReveal(sat),
    };
    if (sat.key === "directObject") {
      directObjectToggle = iconEntry;
      continue;
    }
    // The possessor control likewise rides the dotted ring: the line to the noun's owner leaves
    // from it. PhraseBuilder gives it what it does (name or point to the owner).
    const possessorNoun: NounKey | null = sat.key.endsWith("Possessor")
      ? (sat.key.slice(0, -"Possessor".length) as NounKey)
      : null;
    if (possessorNoun) {
      (perimeterByNoun[possessorNoun] ??= {}).possessor = iconEntry;
      continue;
    }
    if (COMPLEMENT_KEY_SET.has(sat.key as SlotKey)) {
      complementToggleIcons.push(iconEntry);
    } else {
      // A collapsed group hides its own reveal icons; complement toggles ride
      // the verb box but belong to sibling groups, so they stay above.
      if (collapsedMainKeys.has(sat.parent)) continue;
      // A control riding another satellite's box (Adjective 2 on Adjective 1) can only
      // appear while that box is itself on the canvas.
      if (REVEALABLE_SLOT_KEYS.has(sat.parent) && !shownMap[sat.parent]) continue;
      (satelliteIconsByParent[sat.parent] ??= []).push(iconEntry);
    }
  }

  return {
    satelliteIconsByParent,
    complementToggleIcons,
    perimeterByNoun,
    directObjectToggle,
  };
}
