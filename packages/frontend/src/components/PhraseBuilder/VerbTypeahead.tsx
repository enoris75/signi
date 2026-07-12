import { Box, InputBase, Popper, Paper } from "@mui/material";
import { Concept } from "@signi/shared";
import { useState, useRef } from "react";
import { useConcepts } from "../../hooks/useConcepts";
import { useUiString } from "../../i18n/useUiString.ts";
import { ConceptWord } from "../../i18n/ConceptWord.tsx";
import {
  useConceptGloss,
  useConceptSearch,
} from "../../i18n/useConceptLabel.ts";

export function VerbTypeahead({
  onSelect,
}: {
  onSelect: (concept: Concept) => void;
}) {
  const { data: allVerbs = [] } = useConcepts("verb");
  const t = useUiString();
  const gloss = useConceptGloss();
  const matches = useConceptSearch();
  const prompt = `${t("slot.verb.placeholder")}…`;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const anchorRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Modals are verb concepts too, but they govern a verb rather than heading a clause,
  // so they belong in the modal slots (see ModalTypeahead), never here.
  const verbs = allVerbs.filter((v) => !v.modal);
  const filtered = verbs.filter((v) => matches(v, query));

  function commit(idx: number) {
    const v = filtered[idx];
    if (!v) return;
    onSelect(v);
    setOpen(false);
    setQuery("");
    setHighlightedIdx(0);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(highlightedIdx + 1, filtered.length - 1);
      setHighlightedIdx(next);
      listRef.current?.children[next]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.max(highlightedIdx - 1, 0);
      setHighlightedIdx(next);
      listRef.current?.children[next]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      commit(highlightedIdx);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <Box
      ref={anchorRef}
      onPointerDown={(e) => e.stopPropagation()}
      sx={{ mt: 0.25 }}
    >
      <InputBase
        autoFocus
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlightedIdx(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={handleKeyDown}
        placeholder={prompt}
        // Size the field to its placeholder rather than the browser default
        // (~20ch); otherwise the empty verb box overflows the 160px-wide dashed
        // group box that's padded to PIX_PAD_H (widest-slot half-width) each side.
        inputProps={{ size: prompt.length }}
        sx={{
          fontFamily: '"Inter", sans-serif',
          fontSize: "0.8rem",
          color: "text.primary",
          "& input": { p: 0 },
        }}
      />
      <Popper
        open={open && filtered.length > 0}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        style={{ zIndex: 1300 }}
        modifiers={[{ name: "offset", options: { offset: [0, 4] } }]}
      >
        <Paper
          ref={listRef}
          elevation={4}
          sx={{ minWidth: 160, maxHeight: 200, overflow: "auto", py: 0.5 }}
        >
          {filtered.map((v, i) => (
            <Box
              key={v.id}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setHighlightedIdx(i)}
              onClick={() => commit(i)}
              sx={{
                px: 1.5,
                py: 0.5,
                fontFamily: '"Lora", Georgia, serif',
                fontSize: "0.85rem",
                fontStyle: "italic",
                cursor: "pointer",
                bgcolor:
                  i === highlightedIdx ? "action.selected" : "transparent",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <ConceptWord concept={v} />
              {gloss(v) ? (
                <Box
                  component="span"
                  sx={{ ml: 0.5, color: "text.secondary", fontStyle: "normal" }}
                >
                  ({gloss(v)})
                </Box>
              ) : null}
            </Box>
          ))}
        </Paper>
      </Popper>
    </Box>
  );
}
