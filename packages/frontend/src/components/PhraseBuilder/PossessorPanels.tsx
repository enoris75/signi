import React from "react";
import { Box } from "@mui/material";
import { type Concept } from "@signi/shared";
import {
  NounAddress,
  NounKey,
  PhraseSelection,
  POSSESSOR_KEY,
  possessorAddress,
  WorkspaceBinding,
} from "./interfaces.ts";
import { ALL_SLOTS, MUI_COLOR_HEX, NOUN_KEYS } from "./slots.ts";
import { updatePossessor } from "./phraseReducers.ts";
import type { PhraseBuilderProps } from "./PhraseBuilder.tsx";

// Noun blocks whose possessor panel is currently open (revealed or already filled).
// Also read by the owner, which measures a connector down into each open panel.
export function openPossessorsFor(
  selection: PhraseSelection,
  shownMap: Record<string, boolean>,
): NounKey[] {
  return NOUN_KEYS.filter(
    (which) => selection[which] && shownMap[`${which}Possessor`],
  );
}

const nounColor = (which: NounKey) =>
  MUI_COLOR_HEX[ALL_SLOTS.find((s) => s.key === which)?.color ?? "primary"];

interface PossessorPanelsProps {
  openPossessors: NounKey[];
  selection: PhraseSelection;
  nested: boolean;
  onPhraseUpdate: (updater: (prev: PhraseSelection) => PhraseSelection) => void;
  onRemovePossessor: (which: NounKey) => void;
  // The receiving dot on each panel's top edge, handed back to the owner so it can
  // measure the connector that runs down from the noun's possessor control.
  registerDot: (which: NounKey, el: HTMLElement | null) => void;
  binding?: WorkspaceBinding;
  possessorPath?: NounAddress;
  // A possessor is edited by the same builder that owns this panel. Injected rather than
  // imported so this module never imports back into PhraseBuilder at runtime.
  Builder: React.ComponentType<PhraseBuilderProps>;
}

// Possessor editors — one per noun block with an open possessor. Each is a verbless
// noun-phrase-mode PhraseBuilder editing that block's `${which}Possessor` slice (a noun
// phrase whose head is its `subject`); because it is the same builder, the possessor gets
// the full noun-phrase surface — adjectives, number/gender, a relative clause, and its own
// nested possessor. Being a noun phrase and not a period, each sits in a dashed box inside
// the owning period rather than in a period container of its own.
export function PossessorPanels({
  openPossessors,
  selection,
  nested,
  onPhraseUpdate,
  onRemovePossessor,
  registerDot,
  binding,
  possessorPath,
  Builder,
}: PossessorPanelsProps) {
  // A lens onto the possessor slice hanging off `which`. Handed to the nested
  // noun-phrase-mode builder as its onPhraseUpdate, so its edits land inside
  // the owning block's `${which}Possessor`.
  const makePossessorUpdate =
    (which: NounKey) => (updater: (prev: PhraseSelection) => PhraseSelection) =>
      onPhraseUpdate((prev) => updatePossessor(prev, which, updater));

  return (
    <>
      {openPossessors.map((which) => {
        const possColor = nounColor(which);
        return (
          <Box
            key={which}
            sx={{ position: "relative", mt: 1.5, pl: nested ? 1 : 2 }}
          >
            {/* Receiving dot on the panel's top edge — where this noun's possessor
                connector lands. */}
            <Box
              ref={(el: HTMLDivElement | null) => registerDot(which, el)}
              sx={{
                position: "absolute",
                left: nested ? 8 + 20 : 16 + 20,
                top: 0,
                transform: "translate(-50%, -50%)",
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: possColor,
                border: "2px solid",
                borderColor: "background.paper",
                zIndex: 2,
              }}
            />
            <Builder
              nounPhrase
              dottedColor={possColor}
              head={selection[which] as Concept}
              relativeLabel="'s"
              selection={
                (selection[POSSESSOR_KEY(which)] as PhraseSelection | undefined) ?? {}
              }
              onPhraseUpdate={makePossessorUpdate(which)}
              onRemove={() => onRemovePossessor(which)}
              // Forward the container's binding so the possessor's head can source a
              // relative-clause link, addressed under this possessor step (composes for
              // nested possessors via `possessorPath ?? which`).
              binding={binding}
              possessorPath={possessorAddress(possessorPath ?? which)}
            />
          </Box>
        );
      })}
    </>
  );
}
