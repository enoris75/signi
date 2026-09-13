import type { ReactNode } from "react";
import { Box } from "@mui/material";
import {
  CAUSE_SENTIMENTS,
  DEFAULT_LOCATIVE_SPECIFIER,
  DEFAULT_ROUTE_SPECIFIER,
} from "@signi/shared";
import {
  AspectToggleBox,
  SatelliteButton,
  SentimentSelector,
  SpecifierSelector,
  TenseToggleBox,
} from "./Boxes.tsx";
import { nodeElRef, PhraseRenderContext, SlotNode } from "./phraseRender.tsx";
import { GroupBox } from "./GroupBox.tsx";
import { toolbarControlKey, VERB_PHRASE } from "./ringSpecs.ts";
import { isModalAdverbSlot, isModalSlot } from "./slots.ts";

// Renders the verb phrase onto the shared canvas: the verb in its solid ring, the adverb, modal and
// tense/aspect satellites on its orbit, the complement and direct-object toggles on its dotted
// ring, and — on the route, locative and cause rings — the relation toolbar. (Polarity is a direct
// toggle on the verb's solid ring, drawn with the other satellite controls.)
export function VerbPhraseBuilder({ ctx }: { ctx: PhraseRenderContext }) {
  const {
    renderedSlots,
    shownMap,
    makeDragProps,
    selection,
    compact,
    complementToggleIcons,
    directObjectToggle,
    groupRects,
    controlPos,
    discs,
    handleCycleTense,
    handleCycleAspect,
    handleSelectSpecifier,
    handleSelectLocativeSpecifier,
    handleSelectSentiment,
    registerVerbAnchor,
  } = ctx;

  // The verb, its adverb, and its modal chain are all word slots on the verb phrase.
  const verbSlots = renderedSlots.filter(
    (s) =>
      s.key === "verb" ||
      s.key === "modifier" ||
      isModalSlot(s.key) ||
      isModalAdverbSlot(s.key),
  );

  const verbPhraseRect = groupRects.find((g) => g.label === VERB_PHRASE);
  const toolbarAt = (type: string) => (value: string) => controlPos[toolbarControlKey(type, value)];

  // A control on the verb phrase's dotted ring, centred where the ring layout seats it.
  const seated = (key: string, children: ReactNode, ref?: (el: HTMLElement | null) => void) => {
    const p = controlPos[key];
    if (!p) return null;
    return (
      <Box
        key={key}
        ref={ref}
        sx={{ position: "absolute", left: p.x, top: p.y, transform: "translate(-50%, -50%)", zIndex: 3 }}
      >
        {children}
      </Box>
    );
  };

  return (
    <>
      {verbPhraseRect && <GroupBox rect={verbPhraseRect} ctx={ctx} />}
      {verbSlots.map((slot) => (
        <SlotNode key={slot.key} slot={slot} ctx={ctx} />
      ))}
      {shownMap.verbTense && (
        <Box
          data-testid="box-verbTense"
          {...makeDragProps("verbTense", handleCycleTense)}
          ref={nodeElRef(ctx, "verbTense")}
        >
          <TenseToggleBox value={selection.verbTense ?? "present"} disc={discs.verbTense?.r} />
        </Box>
      )}
      {shownMap.verbAspect && (
        <Box
          data-testid="box-verbAspect"
          {...makeDragProps("verbAspect", handleCycleAspect)}
          ref={nodeElRef(ctx, "verbAspect")}
        >
          <AspectToggleBox value={selection.verbAspect ?? "neutral"} disc={discs.verbAspect?.r} />
        </Box>
      )}

      {/* Complement toggles ride the verb phrase's dotted ring, each facing its complement's ring
          once it is shown. The instrumental's is where its cross-container link starts. */}
      {!compact &&
        complementToggleIcons.map((icon) =>
          seated(
            icon.key,
            <SatelliteButton sat={icon} color="secondary" />,
            icon.key === "instrumental" ? registerVerbAnchor : undefined,
          ),
        )}

      {/* The direct object's fold-away control, where the line to the object leaves the ring. */}
      {!compact &&
        directObjectToggle &&
        seated(directObjectToggle.key, <SatelliteButton sat={directObjectToggle} color="success" />)}

      {/* The relation toolbars ride the top of the route, locative and cause rings — one button per
          relation, seated among the ring's other controls. Like the ring's other controls, they are
          withdrawn in compact view. */}
      {!compact && selection.route && (
        <SpecifierSelector
          value={selection.routeSpecifier ?? DEFAULT_ROUTE_SPECIFIER}
          onSelect={handleSelectSpecifier}
          placeAt={toolbarAt("route")}
        />
      )}

      {/* The locative takes the same relation toolbar as the route — it is what lets the
          place read "under the bed" or "behind the tree" rather than only "in the bed".
          Same relations, different default: the locative falls back on containment. */}
      {!compact && selection.locative && (
        <SpecifierSelector
          value={selection.locativeSpecifier ?? DEFAULT_LOCATIVE_SPECIFIER}
          onSelect={handleSelectLocativeSpecifier}
          placeAt={toolbarAt("locative")}
        />
      )}

      {!compact && selection.cause && (
        <SentimentSelector
          value={selection.causeSentiment ?? CAUSE_SENTIMENTS[0]}
          onSelect={handleSelectSentiment}
          placeAt={toolbarAt("cause")}
        />
      )}
    </>
  );
}
