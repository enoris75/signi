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
import { APP_KEYMAP, KEYMAP, PERIOD_KEYMAP } from "./keymap.ts";
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
 * without a key wait on vocabulary (B41, B43, B44) or are prose (C22).
 */
interface SheetSection {
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
  { scope: "app", title: "Anywhere", note: "Ctrl is ⌘ on a Mac" },
  {
    scope: "period",
    title: "Period",
    titleKey: "period.name",
    note: "with the cursor on the period (esc from a box)",
  },
  { scope: "box", title: "Moving around", note: "inside a period" },
  {
    scope: "box:noun",
    title: "Noun",
    titleKey: "category.noun",
    note: "subject, object, complement, possessor, conjunct",
  },
  { scope: "box:adjective", title: "Adjective", titleKey: "category.adjective" },
  { scope: "box:verb", title: "Verb", titleKey: "slot.verb" },
  {
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
    title: "Word picker",
    rows: [
      { keys: ["ArrowUp", "ArrowDown"], label: "Move", labelKey: "action.move" },
      { keys: ["Enter"], label: "Choose", labelKey: "slot.choose" },
      { keys: ["Tab"], label: "Choose and go to the next box" },
      { keys: ["ArrowUp"], label: "Up from the first row: the category tabs" },
      { keys: ["ArrowLeft", "ArrowRight"], label: "Switch vocabulary, in the tabs" },
      { keys: ["1", "4"], label: "Pronoun person", labelKey: "help.pronounPerson" },
      { keys: ["Escape"], label: "Close · again restores the word" },
    ],
  },
  {
    title: "Menus",
    rows: [
      { keys: ["1", "9"], label: "The row's own key picks it" },
      { keys: ["ArrowUp", "ArrowDown"], label: "Move", labelKey: "action.move" },
      // "Pick" and "Choose" are the same act, so the sheet calls both what the picker's ↵ is called.
      { keys: ["Enter"], label: "Pick", labelKey: "slot.choose" },
      { keys: ["Escape"], label: "Close", labelKey: "action.close" },
    ],
  },
  {
    title: "Picking a link",
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
      { keys: ["1", "9"], label: "Pick a numbered target" },
      { keys: ["Tab"], label: "Next target" },
      { keys: ["Enter"], label: "Pick", labelKey: "slot.choose" },
      { keys: ["Escape"], label: "Cancel", labelKey: "action.cancel" },
    ],
  },
  {
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
      { keys: ["Escape"], label: "Words: back to the canvas" },
    ],
  },
];

/**
 * All a command has to say about itself to be listed. The three keymaps differ in the context
 * their commands run against, and none of that matters here — the sheet reads what they are
 * called and what they answer to.
 */
interface Binding {
  scope: Scope;
  keys: string[];
  label: string;
  labelKey?: UiStringKey;
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
      label: c.labelKey ? t(c.labelKey) : c.label,
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
          {/* English literal, for /localize: the catalogue has no word for help yet. */}
          <Typography id={titleId} variant="h5" sx={{ fontWeight: 700, flex: 1 }}>
            Help
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
        <Box component="section" aria-labelledby={sectionId}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              {/* English literal, for /localize. */}
              <Typography id={sectionId} variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Keyboard navigation
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
                key={section.scope}
                title={titleOf(section)}
                note={noteOf(section)}
                rows={byScope(section.scope)}
                platform={platform}
              />
            ))}
            {HOOK_SECTIONS.map((section) => (
              <Section
                key={section.title}
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
  title,
  note,
  rows,
  platform,
}: {
  title: string;
  note?: string;
  rows: { keys: string[]; label: string }[];
  platform: Platform;
}) {
  if (rows.length === 0) return null;
  return (
    <Box sx={{ mb: 3 }}>
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
