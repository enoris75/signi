import { Box, InputBase, Popper, Paper } from "@mui/material";
import { Concept } from "@signi/shared";
import { useState, useRef } from "react";
import { useConcepts } from "../../hooks/useConcepts";
import { useConceptSearch } from "../../i18n/useConceptLabel.ts";
import { ConceptOption } from "./ConceptOption.tsx";

// The inline picker for the verb's adverb (`modifier`) slot. A single-vocabulary
// typeahead over the adverb concepts — the mirror of AdjectiveTypeahead. Without it the
// adverb satellite opens a box with no way to choose a word.
export function AdverbTypeahead({
  onSelect,
}: {
  onSelect: (concept: Concept) => void;
}) {
  const { data: adverbs = [] } = useConcepts("adverb");
  const matches = useConceptSearch();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const anchorRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = adverbs.filter((a) => matches(a, query));

  function commit(idx: number) {
    const a = filtered[idx];
    if (!a) return;
    onSelect(a);
    setOpen(false);
    setQuery("");
    setHighlightedIdx(0);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open || filtered.length === 0) {
        setOpen(true);
        return;
      }
      const next = Math.min(highlightedIdx + 1, filtered.length - 1);
      setHighlightedIdx(next);
      listRef.current?.children[next]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return;
      const next = Math.max(highlightedIdx - 1, 0);
      setHighlightedIdx(next);
      listRef.current?.children[next]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && filtered.length > 0) commit(highlightedIdx);
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
        placeholder="type an adverb…"
        sx={{
          fontFamily: '"Inter", sans-serif',
          fontSize: "0.8rem",
          color: "text.primary",
          width: "100%",
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
          {filtered.map((a, i) => (
            <ConceptOption
              key={a.id}
              concept={a}
              highlighted={i === highlightedIdx}
              onMouseEnter={() => setHighlightedIdx(i)}
              onClick={() => commit(i)}
            />
          ))}
        </Paper>
      </Popper>
    </Box>
  );
}
