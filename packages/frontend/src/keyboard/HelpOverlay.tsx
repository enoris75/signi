import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useId, useState } from "react";
import { useUiString } from "../i18n/useUiString.ts";
import type { UiStringKey } from "@signi/shared";
import { useKeyPlatform } from "./KeyboardProvider.tsx";
import { APP_KEYMAP, commandLabel, KEYMAP, PERIOD_KEYMAP, type CommandName } from "./keymap.ts";
import { ConsoleHelp } from "../console/ConsoleHelp.tsx";
import { keycapLabels, type Platform } from "./matchKey.ts";
import type { Scope } from "./scope.ts";

/**
 * The help overlay: opened by the corner icon, or by <kbd>?</kbd> from anywhere.
 *
 * Its one section for now is keyboard navigation — every binding there is, grouped by the level it
 * belongs to. That section is generated from the keymaps rather than written out, so it cannot
 * list a key that is not bound or miss one that is, which is the whole reason the keymaps are
 * data. Its <kbd>Ctrl</kbd> caps are drawn for whichever platform the switch is on, so a Mac user
 * can read the Windows column and a Windows user the Mac one.
 */

/**
 * A heading or a row, named the way a keymap command is: `title` / `label` is the English, and the
 * catalogue key beside it is what the sheet shows, wherever the words are seeded. The literals left
 * without a key are prose (C22). Each section is found by its `id` (its `data-testid` is
 * `help-section-<id>`), since its title follows the UI language.
 */
interface SheetSection {
  id: string;
  title: string;
  titleKey?: UiStringKey;
  note?: string;
  /** A list of names, the note spelled as the controls themselves are named, joined with commas. */
  noteKeys?: UiStringKey[];
}

interface SheetRow {
  keys: string[];
  label: string;
  labelKey?: UiStringKey;
  /** The panel a row's key works in, written before its label with a colon ("Words: the word map"). */
  whereKey?: UiStringKey;
}

/** The order the sheet reads in, and what each section is called. */
const SECTIONS: (SheetSection & { scope: Scope })[] = [
  {
    id: "app",
    scope: "app",
    title: "Everywhere",
    titleKey: "help.section.app",
    note: "Ctrl is ⌘ on a Mac",
  },
  {
    id: "period",
    scope: "period",
    title: "Period",
    titleKey: "period.name",
    note: "with the cursor on the period (esc from a box)",
  },
  { id: "box", scope: "box", title: "Navigation", titleKey: "help.section.box", note: "inside a period" },
  {
    id: "noun",
    scope: "box:noun",
    title: "Noun",
    titleKey: "category.noun",
    note: "subject, object, complement, possessor, conjunct",
  },
  { id: "adjective", scope: "box:adjective", title: "Adjective", titleKey: "category.adjective" },
  { id: "verb", scope: "box:verb", title: "Verb", titleKey: "slot.verb" },
  {
    id: "mood",
    scope: "box:mood",
    title: "Command subject",
    titleKey: "help.commandSubject",
    note: "the box a command puts in place of the subject",
  },
];

/**
 * The levels whose keys live beside their own handler rather than in a keymap — a picker, a menu,
 * a pick in flight. Each is one table, read here and by the strip that teaches it on screen, so
 * the sheet and the page cannot disagree.
 */
const HOOK_SECTIONS: (SheetSection & { rows: SheetRow[] })[] = [
  {
    id: "picker",
    title: "Word list",
    titleKey: "help.section.picker",
    rows: [
      { keys: ["ArrowUp", "ArrowDown"], label: "Move", labelKey: "action.move" },
      { keys: ["Enter"], label: "Choose", labelKey: "slot.choose" },
      // The footer's own words for ⇥, as the picker's strip shows them.
      { keys: ["Tab"], label: "Choose, and then go to the next slot", labelKey: "hint.chooseAndNext" },
      { keys: ["ArrowUp"], label: "Up from the first row: the category tabs" },
      { keys: ["ArrowLeft", "ArrowRight"], label: "Switch vocabulary, in the tabs" },
      { keys: ["1", "4"], label: "Pronoun person", labelKey: "help.pronounPerson" },
      { keys: ["Escape"], label: "Close · again restores the word" },
    ],
  },
  {
    id: "menu",
    title: "Menus",
    titleKey: "help.section.menu",
    rows: [
      // The keycaps beside it say which digits: a menu numbers its rows.
      { keys: ["1", "9"], label: "Choose a numbered row", labelKey: "help.pickNumberedRow" },
      { keys: ["ArrowUp", "ArrowDown"], label: "Move", labelKey: "action.move" },
      // "Pick" and "Choose" are the same act, so the sheet calls both what the picker's ↵ is called.
      { keys: ["Enter"], label: "Pick", labelKey: "slot.choose" },
      { keys: ["Escape"], label: "Close", labelKey: "action.close" },
    ],
  },
  {
    // A pick chooses the target of a link, which is what the section is named for.
    id: "pick",
    title: "Targets",
    titleKey: "help.section.pick",
    // The five link controls a pick serves, by their own names.
    note: "relative clause, if, join, instrument, possessor",
    noteKeys: [
      "satellite.relative",
      "clause.conditional",
      "clause.coordinated",
      "slot.instrumental",
      "slot.possessor",
    ],
    rows: [
      { keys: ["1", "9"], label: "Choose a numbered target", labelKey: "help.pickNumbered" },
      { keys: ["Tab"], label: "Next target", labelKey: "help.nextTarget" },
      { keys: ["Enter"], label: "Pick", labelKey: "slot.choose" },
      { keys: ["Escape"], label: "Cancel", labelKey: "action.cancel" },
    ],
  },
  {
    id: "panels",
    title: "Translations & words",
    titleKey: "help.translationsAndWords",
    rows: [
      // The ↑ ↓ caps beside it say where.
      { keys: ["ArrowUp", "ArrowDown"], label: "Move between rows", labelKey: "action.move" },
      { keys: ["Enter", "C"], label: "Copy a language", labelKey: "action.copyLanguage" },
      // ↵ on a word chooses it for the box, which is what the picker's ↵ is called.
      {
        keys: ["Enter"],
        label: "Words: put it in the box",
        labelKey: "slot.choose",
        whereKey: "words.heading",
      },
      {
        keys: ["M"],
        label: "Words: the word map",
        labelKey: "wordMap.heading",
        whereKey: "words.heading",
      },
      {
        keys: ["Escape"],
        label: "Words: return to the canvas",
        labelKey: "action.returnToCanvas",
        whereKey: "words.heading",
      },
    ],
  },
];

/**
 * All a command has to say about itself to be listed. The three keymaps differ in the context
 * their commands run against, and none of that matters here — the sheet reads what they are
 * called and what they answer to.
 */
interface Binding extends CommandName {
  scope: Scope;
  keys: string[];
}

const ALL_BINDINGS: Binding[] = [...APP_KEYMAP, ...PERIOD_KEYMAP, ...KEYMAP];

export function HelpOverlay({
  open,
  onClose,
  onConsoleCommand,
}: {
  open: boolean;
  onClose: () => void;
  /** A console command's row was chosen: show its page in the console. */
  onConsoleCommand?: (name: string) => void;
}) {
  const here = useKeyPlatform();
  const [platform, setPlatform] = useState<Platform>(here);
  const t = useUiString();
  // The overlay is named by its title, and its section by its heading, so what a screen reader
  // announces on opening is what is written at the top of it.
  const titleId = useId();
  const sectionId = useId();

  const byScope = (scope: Scope) =>
    ALL_BINDINGS.filter((c) => c.scope === scope).map((c) => ({
      keys: c.keys,
      label: commandLabel(c, t),
    }));
  const titleOf = (section: SheetSection) =>
    section.titleKey ? t(section.titleKey) : section.title;
  const noteOf = (section: SheetSection) =>
    section.noteKeys ? section.noteKeys.map((key) => t(key)).join(", ") : section.note;
  const rowOf = ({ keys, label, labelKey, whereKey }: SheetRow) => ({
    keys,
    label: !labelKey ? label : whereKey ? `${t(whereKey)}: ${t(labelKey)}` : t(labelKey),
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
      aria-labelledby={titleId}
      data-testid="help-overlay"
    >
      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3 }}>
          <Typography id={titleId} variant="h5" sx={{ fontWeight: 700, flex: 1 }}>
            {t("help.heading")}
          </Typography>
          <IconButton
            onClick={onClose}
            aria-label={t("action.cancel")}
            sx={{ flexShrink: 0, mt: -1, mr: -1 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* The keys, then the console's commands. Others (what the canvas is, saving and loading)
            belong beside them rather than in a page of their own, which is why the overlay is not
            the sheet. */}
        <Box component="section" aria-labelledby={sectionId} data-testid="help-keyboard">
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography id={sectionId} variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {t("help.keyboard")}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: "0.85rem", lineHeight: 1.6 }}>
                A bare key acts on what the cursor is on — a box, or the period once you step out
                with esc. Ctrl acts on the app. Keys that cycle a value run backwards with ⇧.
              </Typography>
            </Box>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={platform}
              onChange={(_, v) => v && setPlatform(v)}
              sx={{ flexShrink: 0 }}
            >
              <ToggleButton value="other" sx={{ textTransform: "none", fontSize: "0.72rem" }}>
                Windows &amp; Linux
              </ToggleButton>
              <ToggleButton value="mac" sx={{ textTransform: "none", fontSize: "0.72rem" }}>
                Mac
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box
            sx={{
              columnCount: { xs: 1, md: 2, lg: 3 },
              columnGap: 4,
              "& > *": { breakInside: "avoid" },
            }}
          >
            {SECTIONS.map((section) => (
              <Section
                key={section.id}
                id={section.id}
                title={titleOf(section)}
                note={noteOf(section)}
                rows={byScope(section.scope)}
                platform={platform}
              />
            ))}
            {HOOK_SECTIONS.map((section) => (
              <Section
                key={section.id}
                id={section.id}
                title={titleOf(section)}
                note={noteOf(section)}
                rows={section.rows.map(rowOf)}
                platform={platform}
              />
            ))}
          </Box>
        </Box>
        <ConsoleHelp onCommand={onConsoleCommand} />
      </DialogContent>
    </Dialog>
  );
}

function Section({
  id,
  title,
  note,
  rows,
  platform,
}: {
  id: string;
  title: string;
  note?: string;
  rows: { keys: string[]; label: string }[];
  platform: Platform;
}) {
  if (rows.length === 0) return null;
  return (
    <Box sx={{ mb: 3 }} data-testid={`help-section-${id}`}>
      <Typography
        sx={{
          fontFamily: '"Inter", sans-serif',
          fontSize: "0.62rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "primary.main",
        }}
      >
        {title}
      </Typography>
      {note && (
        <Typography
          sx={{ fontStyle: "italic", fontSize: "0.72rem", color: "text.secondary", mb: 0.5 }}
        >
          {note}
        </Typography>
      )}
      {rows.map((row, i) => (
        <Box
          key={`${row.label}-${i}`}
          sx={{
            display: "flex",
            alignItems: "baseline",
            gap: 1.5,
            py: 0.4,
            fontSize: "0.82rem",
          }}
        >
          {/* A row reads as a sentence, so it starts on a capital — which the bare commands the
              picker's strip shares ("move", "choose") are catalogued without. Only ever raised,
              never lowered: a German noun keeps its capital wherever it stands. */}
          <Box sx={{ flex: 1, "&::first-letter": { textTransform: "uppercase" } }}>
            {row.label}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
            {row.keys.map((spec, k) => (
              <Box key={spec} sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                {k > 0 && (
                  <Box component="span" sx={{ color: "text.disabled", fontSize: "0.7rem" }}>
                    /
                  </Box>
                )}
                {/* Drawn for whichever platform the switch is on, not for this machine. */}
                <SheetCap spec={spec} platform={platform} />
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

/** A keycap for the sheet's chosen platform rather than for the one the app is running on. */
function SheetCap({ spec, platform }: { spec: string; platform: Platform }) {
  const caps = keycapLabels(spec, platform);
  return (
    <Box component="span" aria-hidden sx={{ display: "inline-flex", gap: 0.25 }}>
      {caps.map((cap, i) => (
        <Box
          key={`${cap}-${i}`}
          component="kbd"
          sx={{
            display: "inline-grid",
            placeItems: "center",
            minWidth: 16,
            height: 16,
            px: 0.4,
            borderRadius: 0.75,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: "0 1px 0 rgba(0,0,0,0.08)",
            fontFamily: '"Inter", sans-serif',
            fontSize: "0.6rem",
            fontWeight: 700,
            lineHeight: 1,
            color: "text.secondary",
          }}
        >
          {cap}
        </Box>
      ))}
    </Box>
  );
}
