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
import { useConceptSearch } from "../../i18n/useConceptLabel.ts";
import { ConceptOption } from "./ConceptOption.tsx";
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
  const matches = useConceptSearch();
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
  // The pronoun chooser's in-progress decision: person, number, gender. "generic" is the
  // impersonal "one" (GENERIC_PERSON) — a pronoun in its own right, always 3rd-singular, so it
  // hides the number/gender rows when chosen.
  const [person, setPerson] = useState<"1" | "2" | "3" | "generic">("1");
  const [number, setNumber] = useState<"singular" | "plural">("singular");
  const [gender, setGender] = useState<"masc" | "fem" | "neut">("masc");
  const anchorRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredNouns = nouns.filter((n) => matches(n, query));

  function commitNoun(idx: number) {
    const n = filteredNouns[idx];
    if (!n) return;
    onSelect(n);
    reset();
  }

  function commitPronoun() {
    // The generic ("one") is a distinct pronoun concept, not one of the 1/2/3 persons (it shares
    // person 3 with THIRD_PERSON, so it must be matched by id); it is inherently 3rd-singular.
    if (person === "generic") {
      const generic = pronouns.find((p) => p.id === "GENERIC_PERSON");
      if (!generic) return;
      onSelect(generic, { number: "singular" });
      reset();
      return;
    }
    const concept = pronouns.find((p) => p.person === person && p.id !== "GENERIC_PERSON");
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
        inputProps={{ "data-testid": "typeahead-subject" }}
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
            <Tab value="noun" label={t("category.noun")} data-testid="pronoun-tab-noun" />
            <Tab value="pronoun" label={t("category.pronoun")} data-testid="pronoun-tab" />
          </Tabs>

          {tab === "pronoun" ? (
            <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
              <ChooserRow label={t("pronoun.person")}>
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
                  <ToggleButton value="1">{t("pronoun.first")}</ToggleButton>
                  <ToggleButton value="2">{t("pronoun.second")}</ToggleButton>
                  <ToggleButton value="3">{t("pronoun.third")}</ToggleButton>
                  {/* The generic / impersonal "one" — a pronoun of its own, not a 4th person. */}
                  <ToggleButton value="generic" data-testid="pronoun-generic">{t("pronoun.generic")}</ToggleButton>
                </ToggleButtonGroup>
              </ChooserRow>

              {/* The generic ("one") is inherently 3rd-singular, so it offers no number/gender. */}
              {person !== "generic" && (
                <>
                  <ChooserRow label={t("pronoun.number")}>
                    <ToggleButtonGroup
                      exclusive
                      size="small"
                      value={number}
                      onChange={(_, v) => v && setNumber(v)}
                    >
                      <ToggleButton value="singular">{t("pronoun.singular")}</ToggleButton>
                      <ToggleButton value="plural">{t("pronoun.plural")}</ToggleButton>
                    </ToggleButtonGroup>
                  </ChooserRow>

                  {/* Gender matters for every person (participle/adjective agreement in
                      Romance); neuter ("it") is offered only in the 3rd person. */}
                  <ChooserRow label={t("pronoun.gender")}>
                    <ToggleButtonGroup
                      exclusive
                      size="small"
                      value={gender}
                      onChange={(_, v) => v && setGender(v)}
                    >
                      <ToggleButton value="masc">{t("pronoun.male")}</ToggleButton>
                      <ToggleButton value="fem">{t("pronoun.female")}</ToggleButton>
                      {person === "3" && (
                        <ToggleButton value="neut">{t("pronoun.neuter")}</ToggleButton>
                      )}
                    </ToggleButtonGroup>
                  </ChooserRow>
                </>
              )}

              <Button
                size="small"
                variant="contained"
                disableElevation
                onClick={commitPronoun}
                data-testid="pronoun-commit"
                sx={{
                  mt: 0.5,
                  textTransform: "none",
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                {t("action.select")}
              </Button>
            </Box>
          ) : (
            <Box ref={listRef} sx={{ maxHeight: 200, overflow: "auto", py: 0.5 }}>
              {showList ? (
                filteredNouns.map((n, i) => (
                  <ConceptOption
                    key={n.id}
                    concept={n}
                    highlighted={i === highlightedIdx}
                    onMouseEnter={() => setHighlightedIdx(i)}
                    onClick={() => commitNoun(i)}
                  />
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
