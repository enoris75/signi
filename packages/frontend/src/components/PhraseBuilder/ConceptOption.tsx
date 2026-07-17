import { Box, Tooltip } from "@mui/material";
import type { Concept } from "@signi/shared";
import { ConceptWord } from "../../i18n/ConceptWord.tsx";
import {
  useConceptDefinition,
  useConceptGloss,
} from "../../i18n/useConceptLabel.ts";

/**
 * One row in a word-picker dropdown: the concept's word (with furigana where the language
 * supplies a reading) and, in English, its parenthesised gloss. Hovering the row shows the
 * concept's definition in a tooltip — in the current UI language, falling back to English.
 *
 * MUI's Tooltip clones its single child rather than wrapping it in an extra element, so the
 * option Box stays a direct child of the list container the typeaheads scroll by index.
 */
export function ConceptOption({
  concept,
  highlighted,
  onMouseEnter,
  onClick,
}: {
  concept: Concept;
  highlighted: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
}) {
  const gloss = useConceptGloss();
  const definition = useConceptDefinition();
  const g = gloss(concept);
  return (
    <Tooltip title={definition(concept)} placement="right" enterDelay={400} disableInteractive>
      <Box
        data-testid="typeahead-option"
        data-concept={concept.id}
        onMouseDown={(e) => e.preventDefault()}
        onMouseEnter={onMouseEnter}
        onClick={onClick}
        sx={{
          px: 1.5,
          py: 0.5,
          fontFamily: '"Lora", Georgia, serif',
          fontSize: "0.85rem",
          fontStyle: "italic",
          cursor: "pointer",
          bgcolor: highlighted ? "action.selected" : "transparent",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <ConceptWord concept={concept} />
        {g ? (
          <Box
            component="span"
            sx={{ ml: 0.5, color: "text.secondary", fontStyle: "normal" }}
          >
            ({g})
          </Box>
        ) : null}
      </Box>
    </Tooltip>
  );
}
