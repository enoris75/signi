import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import {
  NounAddress,
  NounKey,
  PhraseSelection,
  POSSESSOR_KEY,
  POSSESSOR_REF_KEY,
  possessorAddress,
  WorkspaceBinding,
} from "./interfaces.ts";
import { ALL_SLOTS, MUI_COLOR_HEX, NOUN_KEYS } from "./slots.ts";
import { setPossessorRef, updatePossessor } from "./phraseReducers.ts";
import { CorefPick, possessiveHintEn } from "./CorefPickContext.tsx";
import type { PhraseBuilderProps } from "./PhraseBuilder.tsx";

// Noun blocks whose possessor panel is currently open (revealed or already filled — either a
// genitive phrase or a pronominal reference). Also read by the owner, which measures a connector
// down into each open panel.
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

// Which way this noun's possessor slot is filled — a genitive noun phrase, or a pronominal
// reference to another noun. Derived from the selection: a reference is set iff its address is.
type PossessorMode = "genitive" | "reference";

interface PossessorPanelsProps {
  openPossessors: NounKey[];
  selection: PhraseSelection;
  onPhraseUpdate: (updater: (prev: PhraseSelection) => PhraseSelection) => void;
  onRemovePossessor: (which: NounKey) => void;
  // The receiving dot on each panel's top edge, handed back to the owner so it can
  // measure the connector that runs down from the noun's possessor control.
  registerDot: (which: NounKey, el: HTMLElement | null) => void;
  binding?: WorkspaceBinding;
  possessorPath?: NounAddress;
  // The coref-pick coordinator (for a pronominal possessor), and the mapping from this builder's
  // local noun key to its period-root address (what a reference stores / points at).
  coref: CorefPick;
  corefAddr: (which: NounKey) => NounAddress;
  // A possessor is edited by the same builder that owns this panel. Injected rather than
  // imported so this module never imports back into PhraseBuilder at runtime.
  Builder: React.ComponentType<PhraseBuilderProps>;
}

// Possessor editors — one per noun block with an open possessor. Each block's possessor is filled
// one of two ways, chosen by a toggle at the top of its panel:
//  · "Owned by a phrase" — a verbless noun-phrase-mode PhraseBuilder editing that block's
//    `${which}Possessor` slice (a Saxon genitive, "the cat's book"): the full noun-phrase surface,
//    adjectives, number/gender, a relative clause, and its own nested possessor.
//  · "Refers to a noun" — a pronominal possessor ("the boy and *his* horse"): pinpoint another
//    noun in the same period as the antecedent, and the engine renders a possessive pronoun
//    agreeing with it. Stored as that antecedent's address in `${which}PossessorRef`.
export function PossessorPanels({
  openPossessors,
  selection,
  onPhraseUpdate,
  onRemovePossessor,
  registerDot,
  binding,
  possessorPath,
  coref,
  corefAddr,
  Builder,
}: PossessorPanelsProps) {
  // Per-block choice of empty-panel mode. Once a reference address is set the mode is fixed to
  // "reference" by the selection; this only remembers the toggle while the panel is still empty.
  const [modeByWhich, setModeByWhich] = useState<Partial<Record<NounKey, PossessorMode>>>({});

  // A lens onto the possessor slice hanging off `which`, for the genitive sub-builder.
  const makePossessorUpdate =
    (which: NounKey) => (updater: (prev: PhraseSelection) => PhraseSelection) =>
      onPhraseUpdate((prev) => updatePossessor(prev, which, updater));

  return (
    <>
      {openPossessors.map((which) => {
        const possColor = nounColor(which);
        const refAddress = selection[POSSESSOR_REF_KEY(which)] as NounAddress | undefined;
        const mode: PossessorMode = refAddress
          ? "reference"
          : modeByWhich[which] ?? "genitive";
        const ownerAddr = corefAddr(which);
        const picking = coref.picking === ownerAddr;
        const resolved = refAddress ? coref.resolve(refAddress) : undefined;

        return (
          <Box key={which} sx={{ position: "relative", mt: 1.5, pl: 2 }}>
            {/* Receiving dot on the panel's top edge — where this noun's possessor
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
                bgcolor: possColor,
                border: "2px solid",
                borderColor: "background.paper",
                zIndex: 2,
              }}
            />

            {/* Mode toggle: a genitive owning phrase, or a pronominal reference to a noun. */}
            <ToggleButtonGroup
              size="small"
              exclusive
              value={mode}
              onChange={(_e, next: PossessorMode | null) => {
                if (!next || next === mode) return;
                if (next === "genitive") {
                  // Leaving reference mode drops the reference; the genitive editor opens empty.
                  if (refAddress) onPhraseUpdate((prev) => {
                    const clone = { ...prev };
                    delete clone[POSSESSOR_REF_KEY(which)];
                    return clone;
                  });
                  coref.cancel();
                }
                setModeByWhich((prev) => ({ ...prev, [which]: next }));
              }}
              sx={{ mb: 1 }}
            >
              <ToggleButton value="genitive">Owned by a phrase</ToggleButton>
              <ToggleButton value="reference">Refers to a noun</ToggleButton>
            </ToggleButtonGroup>

            {mode === "genitive" ? (
              <Builder
                selection={
                  (selection[POSSESSOR_KEY(which)] as PhraseSelection | undefined) ?? {}
                }
                onPhraseUpdate={makePossessorUpdate(which)}
                onRemove={() => onRemovePossessor(which)}
                // Forward the container's binding so the possessor's head can source a
                // relative-clause link.
                binding={binding}
                possessorPath={possessorAddress(possessorPath ?? which)}
              />
            ) : resolved ? (
              // A reference is set: show what it points at and the pronoun it will render.
              <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 0.5 }}>
                <Chip
                  icon={<LinkIcon />}
                  color="primary"
                  variant="outlined"
                  label={
                    <span>
                      {resolved.concept.emoji ? `${resolved.concept.emoji} ` : ""}
                      {resolved.concept.label ?? resolved.concept.id}
                      {" · "}
                      <em>“{possessiveHintEn(resolved.features)}”</em>
                    </span>
                  }
                  onClick={() =>
                    coref.start(ownerAddr, (target) =>
                      onPhraseUpdate((prev) => setPossessorRef(prev, which, target)),
                    )
                  }
                />
                <Button size="small" color="inherit" onClick={() => onRemovePossessor(which)}>
                  Clear
                </Button>
              </Stack>
            ) : picking ? (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 0.5 }}>
                <Typography variant="body2" color="primary">
                  Click a noun in this period to be the owner…
                </Typography>
                <Button size="small" color="inherit" onClick={() => coref.cancel()}>
                  Cancel
                </Button>
              </Stack>
            ) : (
              <Button
                size="small"
                startIcon={<LinkIcon />}
                onClick={() =>
                  coref.start(ownerAddr, (target) =>
                    onPhraseUpdate((prev) => setPossessorRef(prev, which, target)),
                  )
                }
              >
                Pick a noun…
              </Button>
            )}
          </Box>
        );
      })}
    </>
  );
}
