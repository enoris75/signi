import { Box } from "@mui/material";
import { PATH_SPECIFIERS } from "@signi/shared";
import {
  NegativeToggleBox,
  SatelliteRow,
  SpecifierSelector,
} from "./Boxes.tsx";
import { PhraseRenderContext, SlotNode } from "./phraseRender.tsx";

// Renders the verb phrase onto the shared canvas: the verb box, the adverb box,
// the polarity toggle, the complement-toggle row that rides the Verb Phrase
// dotted box, and — when a route is set — the path-specifier toolbar on the
// route box.
export function VerbPhraseBuilder({ ctx }: { ctx: PhraseRenderContext }) {
  const {
    renderedSlots,
    shownMap,
    makeDragProps,
    selection,
    complementToggleIcons,
    groupRects,
    handleToggleNegative,
    handleSelectSpecifier,
  } = ctx;

  const verbSlots = renderedSlots.filter(
    (s) => s.key === "verb" || s.key === "modifier",
  );

  const verbPhraseRect = groupRects.find((g) => g.label === "Verb Phrase");
  const routeRect = groupRects.find((g) => g.removeKey === "route");

  return (
    <>
      {verbSlots.map((slot) => (
        <SlotNode key={slot.key} slot={slot} ctx={ctx} />
      ))}
      {shownMap.verbNegative && (
        <Box {...makeDragProps("verbNegative", handleToggleNegative)}>
          <NegativeToggleBox value={selection.verbNegative ?? false} />
        </Box>
      )}

      {/* Complement toggles ride the bottom edge of the Verb Phrase dotted box,
          not the verb box itself. */}
      {complementToggleIcons.length > 0 && verbPhraseRect && (
        <Box
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
    </>
  );
}
