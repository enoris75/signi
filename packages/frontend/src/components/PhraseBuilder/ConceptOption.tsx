import { Box } from "@mui/material";
import type { Concept } from "@signi/shared";
import { ConceptWord } from "../../i18n/ConceptWord.tsx";
import { useUiLanguage } from "../../i18n/LanguageContext.tsx";
import {
  useConceptDefinition,
  useConceptGloss,
  useConceptLabel,
} from "../../i18n/useConceptLabel.ts";
import { useQuery } from "@tanstack/react-query";
import { conceptsQuery } from "../../hooks/useConcepts.ts";

/**
 * One row in a word-picker dropdown: the concept's word (with furigana where the language
 * supplies a reading) and, in English, its parenthesised gloss; under it the concept's
 * definition, in the current UI language (falling back to English); and under that, where the
 * concept has any, its synonyms (≈) and antonyms (↔), as words in the UI language.
 *
 * The definition and the relations are part of the row rather than a tooltip, so a list can be
 * read — and a word told from its neighbours — without hovering each one.
 *
 * The option Box stays a direct child of the list container the typeaheads scroll by index.
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
  const { synonyms, antonyms } = useRelatedWords(concept);
  return (
    <Box
      data-testid="typeahead-option"
      data-concept={concept.id}
      // Which row ↵ would take. On the page so a keyboard walk down the list can be seen from
      // outside — the highlight is otherwise only a background colour.
      data-highlighted={highlighted ? "" : undefined}
      onMouseDown={(e) => e.preventDefault()}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      sx={{
        px: 1.5,
        py: 0.5,
        cursor: "pointer",
        bgcolor: highlighted ? "action.selected" : "transparent",
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      <Box
        data-testid="option-word"
        sx={{ fontFamily: '"Lora", Georgia, serif', fontSize: "0.85rem", fontStyle: "italic" }}
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
      <Box data-testid="option-definition" sx={DETAIL_SX}>
        {definition(concept)}
      </Box>
      {synonyms.length > 0 || antonyms.length > 0 ? (
        <Box data-testid="option-relations" sx={{ ...DETAIL_SX, display: "flex", flexWrap: "wrap", columnGap: 1.5 }}>
          {synonyms.length > 0 && (
            <span data-testid="option-synonyms">≈ {synonyms.join(", ")}</span>
          )}
          {antonyms.length > 0 && (
            <span data-testid="option-antonyms">↔ {antonyms.join(", ")}</span>
          )}
        </Box>
      ) : null}
    </Box>
  );
}

// The lines under the word: smaller and quieter than it, and wrapped at a reading width so a long
// definition deepens the row rather than widening the whole dropdown.
const DETAIL_SX = {
  fontFamily: '"Inter", sans-serif',
  fontSize: "0.72rem",
  lineHeight: 1.35,
  color: "text.secondary",
  maxWidth: 280,
  whiteSpace: "normal",
} as const;

/**
 * The words, in the UI language, of the concept's synonyms and antonyms. Synonyms are the synonym
 * concepts' words followed by the concept's own aliases in that language (*talk* for SPEAK); both
 * lists leave out the concept's own word and repeats. Related concepts share the concept's role, so
 * they are looked up in the same cached list its picker was filled from.
 */
function useRelatedWords(concept: Concept): { synonyms: string[]; antonyms: string[] } {
  const { uiLanguage } = useUiLanguage();
  const label = useConceptLabel();
  const related = Boolean(concept.synonyms?.length || concept.antonyms?.length);
  const { data: sameRole = [] } = useQuery({ ...conceptsQuery(concept.role), enabled: related });
  const own = label(concept);
  const words = (ids: string[] | undefined) =>
    (ids ?? []).flatMap((id) => {
      const c = sameRole.find((x) => x.id === id);
      return c ? [label(c)] : [];
    });
  const unique = (list: string[]) => [...new Set(list)].filter((w) => w !== own);
  return {
    synonyms: unique([...words(concept.synonyms), ...(concept.aliases?.[uiLanguage] ?? [])]),
    antonyms: unique(words(concept.antonyms)),
  };
}
