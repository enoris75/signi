import React from "react";
import { Box } from "@mui/material";
import type { CoordConjunction } from "@signi/shared";
import {
  builderNounAddress,
  conjunctAddress,
  COORD_CONJUNCTION_LABEL_KEY,
  NounAddress,
  NounKey,
  PhraseSelection,
  WorkspaceBinding,
} from "./interfaces.ts";
import { useUiString } from "../../i18n/useUiString.ts";
import { ALL_SLOTS, MUI_COLOR_HEX } from "./slots.ts";
import { conjunctionOf, conjunctsOf, updateConjunct } from "./phraseReducers.ts";
import type { ConjunctLink } from "./conjunctChain.ts";
import type { Pt } from "./ringLayout.ts";
import type { RingHost } from "./ringHost.ts";
import type { PhraseBuilderProps } from "./PhraseBuilder.tsx";

const nounColor = (which: NounKey) =>
  MUI_COLOR_HEX[ALL_SLOTS.find((s) => s.key === which)?.color ?? "primary"];

/**
 * A chip sitting on a line between two rings, saying what the line means: the conjunction joining a
 * coordinated group, or the possessive pronoun a pointed-to owner renders. Clickable when it does
 * something.
 */
export function LinkChip({
  label,
  color,
  at,
  onClick,
  dashed = true,
  testId,
}: {
  label: string;
  color: string;
  at: Pt;
  onClick?: () => void;
  dashed?: boolean;
  testId: string;
}) {
  return (
    <Box
      {...(onClick && {
        role: "button",
        tabIndex: 0,
        onClick,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          onClick();
        },
      })}
      data-testid={testId}
      onPointerDown={(e) => e.stopPropagation()}
      sx={{
        position: "absolute",
        left: at.x,
        top: at.y,
        transform: "translate(-50%, -50%)",
        zIndex: 3,
        px: 0.75,
        py: 0.1,
        cursor: onClick ? "pointer" : "default",
        borderRadius: 1,
        border: `1px ${dashed ? "dashed" : "solid"}`,
        borderColor: color,
        bgcolor: "background.paper",
        color,
        fontSize: "0.65rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        lineHeight: 1.6,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        userSelect: "none",
        ...(onClick && { "&:hover, &:focus-visible": { bgcolor: "action.hover", outline: "none" } }),
      }}
    >
      {label}
    </Box>
  );
}

/**
 * The conjunction joining a group, as a chip sitting on a link between two of its rings. One
 * conjunction covers the whole group ("the cat, the dog **and** the fox" — not a separate word per
 * junction), so every chip of a group shows it, and clicking any of them cycles and ⇄ or.
 */
export function ConjunctionChip({
  conjunction,
  color,
  at,
  onClick,
}: {
  conjunction: CoordConjunction;
  color: string;
  at: Pt;
  onClick: () => void;
}) {
  const t = useUiString();
  return (
    <LinkChip
      label={t(COORD_CONJUNCTION_LABEL_KEY[conjunction])}
      color={color}
      at={at}
      onClick={onClick}
      testId="conjunction-chip"
    />
  );
}

interface ConjunctRingsProps {
  // The coordinated blocks on this canvas, with the number of conjuncts each has.
  chains: { which: NounKey; count: number }[];
  selection: PhraseSelection;
  onPhraseUpdate: (updater: (prev: PhraseSelection) => PhraseSelection) => void;
  onRemoveConjunct: (which: NounKey, i: number) => void;
  onCycleConjunction: (which: NounKey) => void;
  // The head canvas's hand-off to conjunct `i` of `which`.
  hostFor: (which: NounKey, i: number) => RingHost;
  // The lines joining each group's rings, where the chips sit.
  links: ConjunctLink[];
  binding?: WorkspaceBinding;
  possessorPath?: NounAddress;
  // A conjunct is edited by the same builder that owns this canvas. Injected rather than imported so
  // this module never imports back into PhraseBuilder at runtime.
  Builder: React.ComponentType<PhraseBuilderProps>;
}

/**
 * Coordination on the canvas — for each coordinating noun block, one ring per conjunct after the
 * block's own, each painted by a verbless noun-phrase-mode PhraseBuilder editing that block's
 * `${which}Conjuncts[i]` slice (a noun phrase whose head is its `subject`). Because it is the same
 * builder, a conjunct gets the full noun-phrase surface — determiner, adjectives, number/gender, a
 * relative clause, its own possessor — so the conjuncts of a group need not resemble each other
 * ("Peter and the old dog that barks").
 *
 * The block's own ring is the *first* conjunct; the chip on each link says how the group is joined.
 */
export function ConjunctRings({
  chains,
  selection,
  onPhraseUpdate,
  onRemoveConjunct,
  onCycleConjunction,
  hostFor,
  links,
  binding,
  possessorPath,
  Builder,
}: ConjunctRingsProps) {
  // A lens onto the i-th conjunct of `which`. Handed to the nested noun-phrase-mode builder as its
  // onPhraseUpdate, so its edits land inside `${which}Conjuncts[i]`.
  const makeConjunctUpdate =
    (which: NounKey, i: number) =>
    (updater: (prev: PhraseSelection) => PhraseSelection) =>
      onPhraseUpdate((prev) => updateConjunct(prev, which, i, updater));

  return (
    <>
      {chains.map(({ which, count }) => {
        const conjuncts = conjunctsOf(selection, which).slice(0, count);
        return conjuncts.map((conjunct, i) => (
          <Builder
            key={`${which}:${i}`}
            selection={conjunct ?? {}}
            onPhraseUpdate={makeConjunctUpdate(which, i)}
            onRemove={() => onRemoveConjunct(which, i)}
            // Forward the container's binding so a conjunct's head can source a relative-clause
            // link of its own ("Peter and the dog *that barks*").
            binding={binding}
            possessorPath={conjunctAddress(builderNounAddress(possessorPath, which), i)}
            // A conjunct is a noun *phrase*, not a clause: it has no predicate of its own, so its
            // ring is the noun's alone.
            nounPhraseOnly
            ringHost={hostFor(which, i)}
          />
        ));
      })}
      {links.map((link) => (
        <ConjunctionChip
          key={`${link.which}:${link.index}`}
          conjunction={conjunctionOf(selection, link.which)}
          color={nounColor(link.which)}
          at={link.mid}
          onClick={() => onCycleConjunction(link.which)}
        />
      ))}
    </>
  );
}
