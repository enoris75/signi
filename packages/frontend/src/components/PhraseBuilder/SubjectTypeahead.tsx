import { Box, InputBase, Popper, Paper, Tabs, Tab } from "@mui/material";
import { Concept, type UiStringKey } from "@signi/shared";
import { useRef, useState, type KeyboardEvent } from "react";
import { useConcepts } from "../../hooks/useConcepts";
import { useUiString } from "../../i18n/useUiString.ts";
import { ConceptOption } from "./ConceptOption.tsx";
import { PickerFooter } from "./PickerFooter.tsx";
import { PICKER_FONT, PromptWidth } from "./PromptWidth.tsx";
import { PronounChooser } from "./PronounChooser.tsx";
import { usePickerKeys } from "./hooks/usePickerKeys.ts";
import { pronounFor, usePronounChooser, type PronounChoice, type PronounPerson } from "./hooks/usePronounChooser.ts";
import { ConceptSelectOpts } from "./interfaces.ts";
import { useMayTakeFocus } from "../../console/ConsoleMarks.tsx";

const TABS = ["noun", "pronoun"] as const;

// The keys the tabs keep for themselves while the cursor is up in them. Everything else is a
// reach for the vocabulary below, and brings the cursor back down to it.
const TAB_KEYS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter", "Escape", "Tab"];

export function SubjectTypeahead({
  onSelect,
  placeholderKey = "slot.subject.placeholder",
  kind = "noun",
  onKindChange,
  testId = "typeahead-subject",
  persons,
}: {
  onSelect: (concept: Concept, opts?: ConceptSelectOpts) => void;
  // The picker is pronoun-inclusive (pronouns + nouns); the prompt varies by slot (a subject, a
  // direct object or a causal complement — all three take a pronoun). Either is rendered by the
  // engine in the UI language; the default is the subject slot's ("type a subject…").
  placeholderKey?: UiStringKey;
  // The word-category switch (noun / pronoun), controlled from the box so the in-dropdown
  // tabs and the on-box toggle stay in sync. Standalone callers may omit it (defaults noun,
  // switchable locally within the popper via `onKindChange`).
  kind?: string;
  onKindChange?: (kind: string) => void;
  // The hook tests reach the field by. It names the *box*, not this component: the direct object
  // keeps `typeahead-noun`, which it shares with the noun-only complements, so which component
  // fills a box stays an implementation detail.
  testId?: string;
  // The pronoun persons the box takes, where not every one is (P11-E8's vocative: the 2nd alone).
  persons?: readonly PronounPerson[];
}) {
  const t = useUiString();
  const prompt = `${t(placeholderKey)}…`;
  const { data: pronouns = [] } = useConcepts("pronoun");
  const { data: allNouns = [] } = useConcepts("noun");
  // A concept whose slot is not its role's is filtered out here: it reuses this role's lexicon and
// arrives on the same fetch, but nothing it could fill is in this picker — the split
// ModalTypeahead / VerbTypeahead make on `Concept.modal`, one level out (see `ConceptSlot`).
// Here that is MR, which stands with a personal name: "the Mr eats" is not a sentence.
  const nouns = allNouns.filter((n) => !n.slot);
  // The category is controlled when the box supplies `onKindChange`; otherwise the popper
  // owns it locally so a bare <SubjectTypeahead/> still works.
  const [localTab, setLocalTab] = useState<string>(kind);
  const tab = onKindChange ? kind : localTab;
  const setTab = onKindChange ?? setLocalTab;
  const anchorRef = useRef<HTMLDivElement>(null);
  const mayTakeFocus = useMayTakeFocus();

  const picker = usePickerKeys({
    items: nouns,
    onSelect: (concept) => onSelect(concept),
    // The Noun / Pronoun tabs are this picker's category switch: ↑ from the first row moves the
    // cursor up into them, where ← → change vocabulary.
    tabs: { values: TABS, value: tab, onChange: setTab },
  });

  function commitPronoun({ person, number, gender }: PronounChoice) {
    const concept = pronounFor(pronouns, person);
    if (!concept) return;
    // The generic ("one") is a distinct pronoun concept, not one of the 1/2/3 persons; it is
    // inherently 3rd-singular, so the number and gender the grid last held are not its to carry.
    if (person === "generic") {
      onSelect(concept, { number: "singular" });
      picker.setOpen(false);
      return;
    }
    // Gender is carried for every person (it drives participle/adjective agreement in
    // Romance languages — "tu sei stato/stata"). Neuter is 3rd-person only ("it").
    onSelect(concept, {
      number,
      gender: person !== "3" && gender === "neut" ? "masc" : gender,
    });
    picker.setOpen(false);
  }

  const chooser = usePronounChooser({
    onCommit: commitPronoun,
    onExitTop: () => picker.setInTabs(true),
    onClose: () => picker.setOpen(false),
    persons,
  });

  // Which handler the keys go to.
  //
  // While the cursor is up in the tabs, the navigation keys are the tabs' — ← → switch vocabulary,
  // ↓ comes back down. Anything else is a reach for what the tab *holds*, and reaching for it is
  // what brings the cursor down to it: a letter searches the nouns, a digit names a person.
  // With the dropdown closed it is all the picker's, whose ↓ reopens it and whose esc goes on to
  // the box (see usePickerKeys).
  function onKeyDown(event: KeyboardEvent) {
    const inTabs = picker.open && picker.inTabs;
    if (inTabs && TAB_KEYS.includes(event.key)) {
      picker.onKeyDown(event);
      return;
    }
    if (inTabs) picker.setInTabs(false);
    if (picker.open && tab === "pronoun") chooser.onKeyDown(event);
    else picker.onKeyDown(event);
  }

  const showList = tab === "noun" && picker.filtered.length > 0;

  return (
    <Box ref={anchorRef} onPointerDown={(e) => e.stopPropagation()} sx={{ mt: 0.25 }}>
      <PromptWidth prompt={prompt}>
        <InputBase
          autoFocus={mayTakeFocus}
          value={picker.query}
          onChange={(e) => {
            picker.onChange(e);
            // Typing is a noun search — jump to the noun tab.
            if (e.target.value.trim()) setTab("noun");
          }}
          onFocus={picker.onFocus}
          onBlur={picker.onBlur}
          onKeyDown={onKeyDown}
          placeholder={prompt}
          inputProps={{ "data-testid": testId }}
          sx={{ ...PICKER_FONT, color: "text.primary", width: "100%", "& input": { p: 0 } }}
        />
      </PromptWidth>
      <Popper
        open={picker.open}
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
            data-kb-tabs={picker.inTabs ? "" : undefined}
            sx={{
              minHeight: 32,
              // While the cursor is up here, the tabs are what ← → act on — the row says so.
              bgcolor: picker.inTabs ? "action.selected" : "transparent",
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
            <PronounChooser
              chooser={chooser}
              pronouns={pronouns}
              persons={persons}
              onCommit={() => commitPronoun(chooser.choice)}
            />
          ) : (
            <Box ref={picker.listRef} sx={{ maxHeight: 200, overflow: "auto", py: 0.5 }}>
              {showList ? (
                picker.filtered.map((n, i) => (
                  <ConceptOption
                    key={n.id}
                    concept={n}
                    highlighted={!picker.inTabs && i === picker.highlightedIdx}
                    onMouseEnter={() => picker.setHighlightedIdx(i)}
                    onClick={() => picker.commit(i)}
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
                  {t("typeahead.noResults")}
                </Box>
              )}
            </Box>
          )}
          <PickerFooter kind={tab === "pronoun" ? "grid" : "list"} />
        </Paper>
      </Popper>
    </Box>
  );
}
