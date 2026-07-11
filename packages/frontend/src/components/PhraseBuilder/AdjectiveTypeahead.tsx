import { Box, InputBase, Popper, Paper } from "@mui/material";
import { Concept } from "@signi/shared";
import { ReactNode, useState, useRef } from "react";
import { useConcepts } from "../../hooks/useConcepts";

export function AdjectiveTypeahead({
  onSelect,
  // Optional sticky content pinned to the top of the dropdown — used to surface the
  // word-category switch inside the picker (mirroring the on-box toggle).
  header,
}: {
  onSelect: (concept: Concept) => void;
  header?: ReactNode;
}) {
  const { data: adjectives = [] } = useConcepts("adjective");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const anchorRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? adjectives.filter((a) =>
        (a.label ?? a.description).toLowerCase().includes(query.toLowerCase()),
      )
    : adjectives;

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
        placeholder="type an adjective…"
        sx={{
          fontFamily: '"Inter", sans-serif',
          fontSize: "0.8rem",
          color: "text.primary",
          width: "100%",
          "& input": { p: 0 },
        }}
      />
      <Popper
        open={(open && filtered.length > 0) || Boolean(header && open)}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        style={{ zIndex: 1300 }}
        modifiers={[{ name: "offset", options: { offset: [0, 4] } }]}
      >
        <Paper elevation={4} sx={{ minWidth: 160, overflow: "hidden" }}>
          {header && (
            <Box
              sx={{
                px: 1,
                py: 0.5,
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              {header}
            </Box>
          )}
          <Box ref={listRef} sx={{ maxHeight: 200, overflow: "auto", py: 0.5 }}>
            {filtered.map((a, i) => (
              <Box
                key={a.id}
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
                {a.label ?? a.description}
              </Box>
            ))}
          </Box>
        </Paper>
      </Popper>
    </Box>
  );
}
