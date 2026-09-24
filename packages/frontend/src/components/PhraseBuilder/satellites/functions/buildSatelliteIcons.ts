import type { GenderSlot, NounKey, NumberSlot, QuestionRole, SlotKey } from "../../interfaces.ts";
import type { SatelliteIcon } from "../../Boxes.tsx";
import type { NegativeField } from "../../phraseReducers.ts";
import { COMPLEMENT_KEY_SET, isModalNegativeField, REVEALABLE_SLOT_KEYS } from "../../slots.ts";
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
  onToggleQuestion,
  onToggleQuestionAnimate,
  onToggleExistential,
  onCycleGloss,
  onCycleGlossRelation,
  onCyclePossessorRole,
  t,
}: BuildSatelliteIconsArgs): SatelliteIcons {
  // What a made link says of itself, and what clicking it will do — the same pair on the
  // instrumental control and on every noun's relative-clause control.
  const linkedLabel = `${t("status.linked")} — ${t("hint.clickToRemove")}`;
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
        valueLabel: linked ? linkedLabel : undefined,
        link: true,
        onToggle: () =>
          linked
            ? linkBinding.instrumental.onClear()
            : linkBinding.instrumental.onStart(),
      });
      continue;
    }
    // The wh-question's mark, its who / what chip and the existential ride the noun's dotted ring
    // (P09-E12 M6, M7): each is about the phrase and the clause it is in, not about the word, and the
    // solid rings they would otherwise join are full. Each flips a value in place; each is named by
    // its label alone, since the label says what it does ("Question", "Who acts?", "There is
    // something") and it reveals no box.
    const perimeterKind = sat.key.endsWith("QuestionAnimate")
      ? ("animacy" as const)
      : sat.key.endsWith("Question")
        ? ("question" as const)
        : sat.key === "subjectExistential"
          ? ("existential" as const)
          : sat.key === "subjectGloss"
            ? ("gloss" as const)
            : sat.key === "subjectGlossRelation"
              ? ("glossRelation" as const)
              : null;
    if (perimeterKind) {
      const noun = sat.parent as NounKey;
      const onToggle =
        perimeterKind === "question"
          ? onToggleQuestion && (() => onToggleQuestion(noun as QuestionRole))
          : perimeterKind === "animacy"
            ? onToggleQuestionAnimate
            : perimeterKind === "gloss"
              ? onCycleGloss
              : perimeterKind === "glossRelation"
                ? onCycleGlossRelation
                : onToggleExistential;
      if (!onToggle) continue;
      (perimeterByNoun[noun] ??= {})[perimeterKind] = {
        key: sat.key,
        icon: sat.icon,
        label: sat.label,
        labelKey: sat.labelKey,
        active: false,
        isSet: sat.hasValue,
        valued: false,
        directToggle: true,
        named: true,
        // A reading and its relation say which one they hold (P13).
        ...(sat.valueLabel !== undefined && (perimeterKind === "gloss" || perimeterKind === "glossRelation")
          ? { valueLabel: sat.valueLabel }
          : {}),
        onToggle,
      };
      continue;
    }
    // What a noun's genitive possessor is to it (P13): a chip beside the possessor control that names
    // the role it holds and moves it on — owner, whole, parts.
    const roleNoun: NounKey | null = sat.key.endsWith("PossessorRole")
      ? (sat.key.slice(0, -"PossessorRole".length) as NounKey)
      : null;
    if (roleNoun) {
      if (!onCyclePossessorRole) continue;
      (perimeterByNoun[roleNoun] ??= {}).possessorRole = {
        key: sat.key,
        icon: sat.icon,
        label: sat.label,
        labelKey: sat.labelKey,
        active: false,
        isSet: sat.hasValue,
        valued: false,
        directToggle: true,
        named: true,
        valueLabel: sat.valueLabel,
        onToggle: () => onCyclePossessorRole(roleNoun),
      };
      continue;
    }
    // The chip that says a noun's relative clause alone, its head unspoken (P13): it rides beside the
    // relative control, and only while the noun heads a clause. It flips the link's flag in place.
    const headlessNoun: NounKey | null = sat.key.endsWith("Headless")
      ? (sat.key.slice(0, -"Headless".length) as NounKey)
      : null;
    if (headlessNoun) {
      if (!linkBinding?.relative.sourceKeys.has(headlessNoun)) continue;
      const headless = linkBinding.relative.headlessKeys.has(headlessNoun);
      (perimeterByNoun[headlessNoun] ??= {}).headless = {
        key: sat.key,
        icon: sat.icon,
        label: sat.label,
        labelKey: sat.labelKey,
        active: false,
        isSet: headless,
        valued: false,
        directToggle: true,
        named: true,
        onToggle: () => linkBinding.relative.onSetHeadless(headlessNoun, !headless),
      };
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
        // Never "active", as the instrumental: a made link reads as *set*, and the tooltip names the
        // link rather than offering to hide a box (A141).
        active: false,
        isSet: isSource,
        valued: false,
        valueLabel: isSource ? linkedLabel : undefined,
        link: true,
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
    // Polarity is per word of the verb group: the verb's own control and each modal's flip the
    // field that denies the word the control is drawn on.
    const negativeField: NegativeField | null =
      sat.directToggle && (sat.key === "verbNegative" || isModalNegativeField(sat.key))
        ? (sat.key as NegativeField)
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
          : negativeField
            ? () => onToggleNegative(negativeField)
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
    // So does the standard of comparison's: the line to its ring leaves from it. PhraseBuilder gives
    // it what it does (open, fold or name the standard).
    if (sat.key === "predicativeStandard") {
      (perimeterByNoun.predicative ??= {}).standard = iconEntry;
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
