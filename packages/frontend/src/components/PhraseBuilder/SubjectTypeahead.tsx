import {
  Box,
  InputBase,
  Popper,
  Paper,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Button,
} from "@mui/material";
import { Concept } from "@signi/shared";
import { useState, useRef } from "react";
import { useConcepts } from "../../hooks/useConcepts";
import { useUiString } from "../../i18n/useUiString.ts";
import { ConceptSelectOpts } from "./interfaces.ts";

export function SubjectTypeahead({
  onSelect,
  placeholder,
  kind = "noun",
  onKindChange,
}: {
  onSelect: (concept: Concept, opts?: ConceptSelectOpts) => void;
  // The picker is pronoun-inclusive (pronouns + nouns); the label varies by slot
  // (a subject vs. a causal complement, which also accepts a pronoun). Left out in the
  // subject slot, whose prompt ("type a subject…") the engine renders in the UI language.
  placeholder?: string;
  // The word-category switch (noun / pronoun), controlled from the box so the in-dropdown
  // tabs and the on-box toggle stay in sync. Standalone callers may omit it (defaults noun,
  // switchable locally within the popper via `onKindChange`).
  kind?: string;
  onKindChange?: (kind: string) => void;
}) {
  const t = useUiString();
  const prompt = placeholder ?? `${t("slot.subject.placeholder")}…`;
  const { data: pronouns = [] } = useConcepts("pronoun");
  const { data: nouns = [] } = useConcepts("noun");
  // The category is controlled when the box supplies `onKindChange`; otherwise the popper
  // owns it locally so a bare <SubjectTypeahead/> still works.
  const [localTab, setLocalTab] = useState<string>(kind);
  const tab = onKindChange ? kind : localTab;
  const setTab = onKindChange ?? setLocalTab;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  // The pronoun chooser's in-progress decision: person, plurality, gender.
  const [person, setPerson] = useState<"1" | "2" | "3">("1");
  const [number, setNumber] = useState<"singular" | "plural">("singular");
  const [gender, setGender] = useState<"masc" | "fem" | "neut">("masc");
  const anchorRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const q = query.trim();
  const filteredNouns = q
    ? nouns.filter((n) =>
        `${n.label ?? n.description} ${n.synonym ?? ""}`
          .toLowerCase()
          .includes(q.toLowerCase()),
      )
    : nouns;

  function commitNoun(idx: number) {
    const n = filteredNouns[idx];
    if (!n) return;
    onSelect(n);
    reset();
  }

  function commitPronoun() {
    const concept = pronouns.find((p) => p.person === person);
    if (!concept) return;
    // Gender is carried for every person (it drives participle/adjective agreement in
    // Romance languages — "tu sei stato/stata"). Neuter is 3rd-person only ("it").
    onSelect(concept, {
      number,
      gender: person !== "3" && gender === "neut" ? "masc" : gender,
    });
    reset();
  }

  function reset() {
    setOpen(false);
    setQuery("");
    setHighlightedIdx(0);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    // On the pronoun tab the input only commits the current decision.
    if (tab === "pronoun") {
      if (e.key === "Enter") {
        e.preventDefault();
        commitPronoun();
      } else if (e.key === "Escape") {
        setOpen(false);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open || filteredNouns.length === 0) {
        setOpen(true);
        return;
      }
      const next = Math.min(highlightedIdx + 1, filteredNouns.length - 1);
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
      if (open && filteredNouns.length > 0) commitNoun(highlightedIdx);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showList = tab === "noun" && filteredNouns.length > 0;

  return (
    <Box ref={anchorRef} onPointerDown={(e) => e.stopPropagation()} sx={{ mt: 0.25 }}>
      <InputBase
        autoFocus
        value={query}
        onChange={(e) => {
          const v = e.target.value;
          setQuery(v);
          setOpen(true);
          setHighlightedIdx(0);
          // Typing is a noun search — jump to the noun tab.
          if (v.trim()) setTab("noun");
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={handleKeyDown}
        placeholder={prompt}
        sx={{
          fontFamily: '"Inter", sans-serif',
          fontSize: "0.8rem",
          color: "text.primary",
          width: "100%",
          "& input": { p: 0 },
        }}
      />
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        style={{ zIndex: 1300 }}
        modifiers={[{ name: "offset", options: { offset: [0, 4] } }]}
      >
        {/* preventDefault on mousedown keeps focus on the input so onBlur doesn't
            close the popper mid-interaction. */}
        <Paper
          elevation={4}
          onMouseDown={(e) => e.preventDefault()}
          sx={{ minWidth: 200, overflow: "hidden" }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            sx={{
              minHeight: 32,
              "& .MuiTab-root": {
                minHeight: 32,
                py: 0.5,
                fontFamily: '"Inter", sans-serif',
                fontSize: "0.7rem",
                textTransform: "none",
              },
            }}
          >
            <Tab value="noun" label="noun" />
            <Tab value="pronoun" label="pronoun" />
          </Tabs>

          {tab === "pronoun" ? (
            <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
              <ChooserRow label="person">
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={person}
                  onChange={(_, v) => {
                    if (!v) return;
                    setPerson(v);
                    // Neuter ("it") is 3rd-person only; drop it when leaving.
                    if (v !== "3" && gender === "neut") setGender("masc");
                  }}
                >
                  <ToggleButton value="1">1st</ToggleButton>
                  <ToggleButton value="2">2nd</ToggleButton>
                  <ToggleButton value="3">3rd</ToggleButton>
                </ToggleButtonGroup>
              </ChooserRow>

              <ChooserRow label="plurality">
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={number}
                  onChange={(_, v) => v && setNumber(v)}
                >
                  <ToggleButton value="singular">singular</ToggleButton>
                  <ToggleButton value="plural">plural</ToggleButton>
                </ToggleButtonGroup>
              </ChooserRow>

              {/* Gender matters for every person (participle/adjective agreement in
                  Romance); neuter ("it") is offered only in the 3rd person. */}
              <ChooserRow label="gender">
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={gender}
                  onChange={(_, v) => v && setGender(v)}
                >
                  <ToggleButton value="masc">masc.</ToggleButton>
                  <ToggleButton value="fem">fem.</ToggleButton>
                  {person === "3" && <ToggleButton value="neut">neut.</ToggleButton>}
                </ToggleButtonGroup>
              </ChooserRow>

              <Button
                size="small"
                variant="contained"
                disableElevation
                onClick={commitPronoun}
                sx={{
                  mt: 0.5,
                  textTransform: "none",
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                select
              </Button>
            </Box>
          ) : (
            <Box ref={listRef} sx={{ maxHeight: 200, overflow: "auto", py: 0.5 }}>
              {showList ? (
                filteredNouns.map((n, i) => (
                  <Box
                    key={n.id}
                    onMouseEnter={() => setHighlightedIdx(i)}
                    onClick={() => commitNoun(i)}
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
                    {n.label ?? n.description}
                    {n.synonym ? (
                      <Box
                        component="span"
                        sx={{
                          ml: 0.5,
                          color: "text.secondary",
                          fontStyle: "normal",
                        }}
                      >
                        ({n.synonym})
                      </Box>
                    ) : null}
                  </Box>
                ))
              ) : (
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    fontFamily: '"Inter", sans-serif',
                    fontSize: "0.75rem",
                    color: "text.disabled",
                  }}
                >
                  no matches
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Popper>
    </Box>
  );
}

// A labelled row in the pronoun chooser: caption on the left, control on the right.
function ChooserRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        "& .MuiToggleButton-root": {
          px: 1,
          py: 0.25,
          textTransform: "none",
          fontFamily: '"Inter", sans-serif',
          fontSize: "0.7rem",
        },
      }}
    >
      <Box
        sx={{
          fontFamily: '"Inter", sans-serif',
          fontSize: "0.7rem",
          color: "text.secondary",
        }}
      >
        {label}
      </Box>
      {children}
    </Box>
  );
}
