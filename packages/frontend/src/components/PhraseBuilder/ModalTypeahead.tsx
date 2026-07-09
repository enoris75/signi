import { Box, InputBase, Popper, Paper } from "@mui/material";
import { Concept } from "@signi/shared";
import { useState, useRef } from "react";
import { useConcepts } from "../../hooks/useConcepts";

// Picker for a modal slot. Modals are verb concepts, so they arrive on the same
// `role=verb` fetch as the main verbs; `Concept.modal` is what separates the two lists
// (VerbTypeahead filters them out, this one filters them in).
export function ModalTypeahead({
  onSelect,
}: {
  onSelect: (concept: Concept) => void;
}) {
  const { data: verbs = [] } = useConcepts("verb");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const anchorRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const modals = verbs.filter((v) => v.modal);
  const filtered = query.trim()
    ? modals.filter((v) =>
        `${v.label ?? v.description} ${v.synonym ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
    : modals;

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
        placeholder="type a modal…"
        inputProps={{ size: 13 }}
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
              {v.label ?? v.description}
              {v.synonym ? (
                <Box
                  component="span"
                  sx={{ ml: 0.5, color: "text.secondary", fontStyle: "normal" }}
                >
                  ({v.synonym})
                </Box>
              ) : null}
            </Box>
          ))}
        </Paper>
      </Popper>
    </Box>
  );
}
