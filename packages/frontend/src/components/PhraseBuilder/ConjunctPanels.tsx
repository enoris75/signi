import React from "react";
import { Box } from "@mui/material";
import type { CoordConjunction } from "@signi/shared";
import {
  CONJUNCTS_KEY,
  conjunctAddress,
  COORD_CONJUNCTION_LABEL,
  NounAddress,
  NounKey,
  PhraseSelection,
  WorkspaceBinding,
} from "./interfaces.ts";
import { ALL_SLOTS, COORDINABLE_NOUN_KEYS, MUI_COLOR_HEX } from "./slots.ts";
import { conjunctionOf, updateConjunct } from "./phraseReducers.ts";
import type { PhraseBuilderProps } from "./PhraseBuilder.tsx";

// Noun blocks that currently coordinate — the ones with at least one conjunct panel open.
// Also read by the owner, which measures a connector down into each open panel.
export function openConjunctsFor(selection: PhraseSelection): NounKey[] {
  return COORDINABLE_NOUN_KEYS.filter(
    (which) =>
      selection[which] &&
      ((selection[CONJUNCTS_KEY(which)] as PhraseSelection[] | undefined)?.length ?? 0) > 0,
  );
}

const nounColor = (which: NounKey) =>
  MUI_COLOR_HEX[ALL_SLOTS.find((s) => s.key === which)?.color ?? "primary"];

interface ConjunctPanelsProps {
  openConjuncts: NounKey[];
  selection: PhraseSelection;
  onPhraseUpdate: (updater: (prev: PhraseSelection) => PhraseSelection) => void;
  onRemoveConjunct: (which: NounKey, i: number) => void;
  onCycleConjunction: (which: NounKey) => void;
  // The receiving dot on each block's panel stack, handed back to the owner so it can
  // measure the connector that runs down from the noun's coordination control.
  registerDot: (which: NounKey, el: HTMLElement | null) => void;
  binding?: WorkspaceBinding;
  possessorPath?: NounAddress;
  // A conjunct is edited by the same builder that owns this panel. Injected rather than
  // imported so this module never imports back into PhraseBuilder at runtime.
  Builder: React.ComponentType<PhraseBuilderProps>;
}

/**
 * The conjunction joining a block's group, as a chip sitting between the conjuncts. One
 * conjunction covers the whole group ("the cat, the dog **and** the fox" — not a separate word
 * per junction), so it is shown once, on the first gap, and clicking it cycles and ⇄ or.
 */
function ConjunctionChip({
  conjunction,
  color,
  onClick,
}: {
  conjunction: CoordConjunction;
  color: string;
  onClick: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      role="button"
      sx={{
        alignSelf: "flex-start",
        ml: 4.5,
        my: 0.25,
        px: 1,
        py: 0.15,
        cursor: "pointer",
        borderRadius: 1,
        border: "1px dashed",
        borderColor: color,
        color,
        fontSize: "0.7rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        userSelect: "none",
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      {COORD_CONJUNCTION_LABEL[conjunction]}
    </Box>
  );
}

/**
 * Coordination editors — for each coordinating noun block, one verbless noun-phrase-mode
 * PhraseBuilder per conjunct, editing that block's `${which}Conjuncts[i]` slice (a noun phrase
 * whose head is its `subject`). Because it is the same builder, a conjunct gets the full
 * noun-phrase surface — determiner, adjectives, number/gender, a relative clause, its own
 * possessor — so the conjuncts of a group need not resemble each other ("Peter and the old dog
 * that barks").
 *
 * The block's own noun box is the *first* conjunct and stays on the canvas above; these panels
 * are the rest of the group, which is why the conjunction chip leads each one.
 */
export function ConjunctPanels({
  openConjuncts,
  selection,
  onPhraseUpdate,
  onRemoveConjunct,
  onCycleConjunction,
  registerDot,
  binding,
  possessorPath,
  Builder,
}: ConjunctPanelsProps) {
  // A lens onto the i-th conjunct of `which`. Handed to the nested noun-phrase-mode builder as
  // its onPhraseUpdate, so its edits land inside `${which}Conjuncts[i]`.
  const makeConjunctUpdate =
    (which: NounKey, i: number) =>
    (updater: (prev: PhraseSelection) => PhraseSelection) =>
      onPhraseUpdate((prev) => updateConjunct(prev, which, i, updater));

  return (
    <>
      {openConjuncts.map((which) => {
        const color = nounColor(which);
        const conjuncts =
          (selection[CONJUNCTS_KEY(which)] as PhraseSelection[] | undefined) ?? [];
        const conjunction = conjunctionOf(selection, which);
        return (
          <Box key={which} sx={{ position: "relative", mt: 1.5, pl: 2 }}>
            {/* Receiving dot on the stack's top edge — where this noun's coordination
                connector lands. */}
            <Box
              ref={(el: HTMLDivElement | null) => registerDot(which, el)}
              sx={{
                position: "absolute",
                left: 16 + 20,
                top: 0,
                transform: "translate(-50%, -50%)",
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: color,
                border: "2px solid",
                borderColor: "background.paper",
                zIndex: 2,
              }}
            />
            {conjuncts.map((conjunct, i) => (
              <Box key={i}>
                <ConjunctionChip
                  conjunction={conjunction}
                  color={color}
                  onClick={() => onCycleConjunction(which)}
                />
                <Box sx={{ position: "relative" }}>
                  <Builder
                    selection={conjunct ?? {}}
                    onPhraseUpdate={makeConjunctUpdate(which, i)}
                    onRemove={() => onRemoveConjunct(which, i)}
                    // Forward the container's binding so a conjunct's head can source a
                    // relative-clause link of its own ("Peter and the dog *that barks*").
                    binding={binding}
                    possessorPath={conjunctAddress(possessorPath ?? which, i)}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        );
      })}
    </>
  );
}
