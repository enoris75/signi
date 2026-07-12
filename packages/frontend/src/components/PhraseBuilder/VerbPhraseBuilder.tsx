import { Box } from "@mui/material";
import { CAUSE_SENTIMENTS, PATH_SPECIFIERS } from "@signi/shared";
import {
  AspectToggleBox,
  SatelliteRow,
  SentimentSelector,
  SpecifierSelector,
  TenseToggleBox,
} from "./Boxes.tsx";
import { nodeElRef, PhraseRenderContext, SlotNode } from "./phraseRender.tsx";
import { GroupBox } from "./GroupBox.tsx";
import { isModalSlot } from "./slots.ts";

// Renders the verb phrase onto the shared canvas: the verb box, the adverb box,
// the tense and aspect boxes, the complement-toggle row that rides the Verb Phrase
// dotted box, and — when a route is set — the path-specifier toolbar on the
// route box. (Polarity is a direct toggle on the verb box border, not a box here.)
export function VerbPhraseBuilder({ ctx }: { ctx: PhraseRenderContext }) {
  const {
    renderedSlots,
    shownMap,
    makeDragProps,
    selection,
    complementToggleIcons,
    groupRects,
    handleCycleTense,
    handleCycleAspect,
    handleSelectSpecifier,
    handleSelectSentiment,
    registerVerbAnchor,
  } = ctx;

  // The verb, its adverb, and its modal chain are all word boxes on the verb phrase.
  const verbSlots = renderedSlots.filter(
    (s) => s.key === "verb" || s.key === "modifier" || isModalSlot(s.key),
  );

  const verbPhraseRect = groupRects.find((g) => g.label === "Verb Phrase");
  const routeRect = groupRects.find((g) => g.removeKey === "route");
  const causeRect = groupRects.find((g) => g.removeKey === "cause");

  return (
    <>
      {verbPhraseRect && <GroupBox rect={verbPhraseRect} ctx={ctx} />}
      {verbSlots.map((slot) => (
        <SlotNode key={slot.key} slot={slot} ctx={ctx} />
      ))}
      {shownMap.verbTense && (
        <Box
          {...makeDragProps("verbTense", handleCycleTense)}
          ref={nodeElRef(ctx, "verbTense")}
        >
          <TenseToggleBox value={selection.verbTense ?? "present"} />
        </Box>
      )}
      {shownMap.verbAspect && (
        <Box
          {...makeDragProps("verbAspect", handleCycleAspect)}
          ref={nodeElRef(ctx, "verbAspect")}
        >
          <AspectToggleBox value={selection.verbAspect ?? "neutral"} />
        </Box>
      )}

      {/* Complement toggles ride the bottom edge of the Verb Phrase dotted box,
          not the verb box itself. */}
      {complementToggleIcons.length > 0 && verbPhraseRect && (
        <Box
          ref={registerVerbAnchor}
          sx={{
            position: "absolute",
            left: verbPhraseRect.x + verbPhraseRect.width / 2,
            top: verbPhraseRect.y + verbPhraseRect.height,
            transform: "translate(-50%, -50%)",
            zIndex: 3,
          }}
        >
          <SatelliteRow satellites={complementToggleIcons} color="secondary" />
        </Box>
      )}

      {/* Path-relation toolbar rides the top edge of the Route dotted box — one
          selectable icon per specifier. */}
      {selection.route && routeRect && (
        <Box
          sx={{
            position: "absolute",
            left: routeRect.x + routeRect.width / 2,
            top: routeRect.y,
            transform: "translate(-50%, -50%)",
            zIndex: 3,
          }}
        >
          <SpecifierSelector
            value={selection.routeSpecifier ?? PATH_SPECIFIERS[0]}
            onSelect={handleSelectSpecifier}
          />
        </Box>
      )}

      {/* Sentiment toolbar rides the top edge of the Cause dotted box — neutral /
          negative / positive, mirroring the route's path-relation toolbar. */}
      {selection.cause && causeRect && (
        <Box
          sx={{
            position: "absolute",
            left: causeRect.x + causeRect.width / 2,
            top: causeRect.y,
            transform: "translate(-50%, -50%)",
            zIndex: 3,
          }}
        >
          <SentimentSelector
            value={selection.causeSentiment ?? CAUSE_SENTIMENTS[0]}
            onSelect={handleSelectSentiment}
          />
        </Box>
      )}
    </>
  );
}
