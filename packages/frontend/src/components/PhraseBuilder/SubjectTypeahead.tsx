import { Box, InputBase, Popper, Paper } from "@mui/material";
import { Concept } from "@signi/shared";
import { useState, useRef } from "react";
import { useConcepts } from "../../hooks/useConcepts";

export function SubjectTypeahead({
  onSelect,
  placeholder = "type a subject…",
}: {
  onSelect: (concept: Concept) => void;
  // The picker is pronoun-inclusive (pronouns + nouns); the label varies by slot
  // (a subject vs. a causal complement, which also accepts a pronoun).
  placeholder?: string;
}) {
  const { data: pronouns = [] } = useConcepts("pronoun");
  const { data: nouns = [] } = useConcepts("noun");
  const all = [...pronouns, ...nouns];
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const anchorRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? all.filter((c) =>
        (c.label ?? c.description).toLowerCase().includes(query.toLowerCase()),
      )
    : all;

  function commit(idx: number) {
    const c = filtered[idx];
    if (!c) return;
    onSelect(c);
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
        placeholder={placeholder}
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
          {filtered.map((c, i) => (
            <Box
              key={c.id}
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
              {c.label ?? c.description}
            </Box>
          ))}
        </Paper>
      </Popper>
    </Box>
  );
}
