import { useEffect, useRef, useState } from "react";
import type { UiStringKey } from "@signi/shared";
import { Box, Container, GlobalStyles, Typography, Alert, Button, IconButton, Snackbar } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TerminalIcon from "@mui/icons-material/Terminal";
import { PhraseWorkspace } from "./components/PhraseBuilder/PhraseWorkspace.tsx";
import { workspaceToPlans } from "./components/PhraseBuilder/workspacePlan/index.ts";
import TranslationPanel from "./components/TranslationPanel.tsx";
import { SavedPhrasesToolbar, isEmpty } from "./components/SavedPhrasesToolbar.tsx";
import { AppMenu } from "./components/AppMenu.tsx";
import { MobileTabBar, TAB_BAR_HEIGHT, type MobileView } from "./components/MobileTabBar.tsx";
import { ResultStrip } from "./components/ResultStrip.tsx";
import { isTouchOnly, useCompactLayout } from "./hooks/useCompactLayout.ts";
import { useHeaderOffset } from "./hooks/useHeaderOffset.ts";
import { useTouchSnap } from "./hooks/useTouchSnap.ts";
import UndoIcon from "@mui/icons-material/Undo";
import { LanguageSelector } from "./components/LanguageSelector.tsx";
import { useWindowDrag } from "./hooks/useWindowDrag.ts";
import { useTranslations } from "./hooks/useTranslation.ts";
import { useWorkspaceHistory } from "./hooks/useWorkspaceHistory.ts";
import { useUiString } from "./i18n/useUiString.ts";
import { KeyboardProvider } from "./keyboard/KeyboardProvider.tsx";
import { HelpOverlay } from "./keyboard/HelpOverlay.tsx";
import { HelpButton } from "./keyboard/HelpButton.tsx";
import { useToolbar } from "./keyboard/useToolbar.ts";
import { pressControl } from "./keyboard/controls.ts";
import { Keycap } from "./keyboard/Keycap.tsx";
import { usePhraseConsole } from "./console/usePhraseConsole.ts";
import { PhraseConsole } from "./console/PhraseConsole.tsx";
import { ConsoleMarksProvider } from "./console/ConsoleMarks.tsx";
import { CursorBridge } from "./console/CursorBridge.tsx";

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `c${Math.random().toString(36).slice(2)}`;

export default function App() {
  // The workspace, and every earlier state of it: what the phrase says is undoable, which is what
  // lets a destructive act happen at once and offer Ctrl Z rather than asking first.
  const history = useWorkspaceHistory({
    containers: [{ id: newId(), selection: {} }],
    links: [],
  });
  const { containers, links } = history;
  // What the last destructive act was, and how to take it back. Shown as the toast that replaced
  // the confirm dialog (the plan's §3.9). Held as its catalogue key, so the toast follows a change of
  // language while it shows.
  const [undoToast, setUndoToast] = useState<UiStringKey | null>(null);
  const [leftWidthPct, setLeftWidthPct] = useState<number>(() => {
    const saved = localStorage.getItem("signi:leftWidth");
    return saved ? Number(saved) : 58.33;
  });
  const startDrag = useWindowDrag();
  // The word-palette overlay's open state, owned here so the header control can
  // toggle it while the panel itself lives inside PhraseBuilder. Off by default.
  const [wordsPanelOpen, setWordsPanelOpen] = useState<boolean>(() => {
    return localStorage.getItem("signi:wordsPanelOpen") === "true";
  });

  function setWordsPanel(next: boolean) {
    localStorage.setItem("signi:wordsPanelOpen", String(next));
    setWordsPanelOpen(next);
  }
  const splitContainerRef = useRef<HTMLDivElement>(null);
  // The help overlay, opened by the corner icon or by ?, whose keyboard section lists every
  // binding there is.
  const [helpOpen, setHelpOpen] = useState(false);
  // The header is one stop in the tab order, its controls walked with ← →.
  const toolbar = useToolbar();

  // The phrase console (P02): the typed way to build a phrase, and a second view of it. It reads and
  // writes the same workspace history the canvas does; while a line is typed, what the canvas and the
  // translations show is that line's preview.
  const phraseConsole = usePhraseConsole({
    history,
    actions: {
      press: (control) => pressControl(control),
      toggleWords: () => setWordsPanel(!wordsPanelOpen),
      openHelp: () => setHelpOpen(true),
    },
  });
  const shown = phraseConsole.preview?.state ?? phraseConsole.committed;

  // A phone (P17) shows one view at a time under a tab bar. The console is one of them: shown is
  // the console tab, so ` and the console's own commands move between tabs as they show and hide it.
  const compact = useCompactLayout();
  const headerOffset = useHeaderOffset(compact);
  // A finger's tap near one of the canvas's small controls reaches it (a 44 px target).
  useTouchSnap();
  // The Phrase view is the phone's default: it exists because a finger can't work the canvas's
  // rings, so a narrowed *desktop* window (still driven by a mouse) starts on the canvas instead,
  // which the compact layout already lays out in one column.
  const [pageView, setPageView] = useState<Exclude<MobileView, "console">>(() =>
    isTouchOnly() ? "phrase" : "canvas",
  );
  const mobileView: MobileView = phraseConsole.open ? "console" : pageView;
  // Arriving at the phone layout — on load, or a window narrowed past the breakpoint — starts on a
  // page view, not the console. The console docked on a desktop is not a choice of tab, and would hide the canvas.
  useEffect(() => {
    if (compact && phraseConsole.open) phraseConsole.setOpen(false);
    // Only on the way in: afterwards the console tab is the user's to open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact]);
  function showView(view: MobileView) {
    if (view === "console") {
      phraseConsole.setOpen(true);
      return;
    }
    setPageView(view);
    if (phraseConsole.open) phraseConsole.setOpen(false);
  }
  // Translations follow the preview a beat behind the keys, so a pause asks for one and a burst of
  // typing asks for none; the committed state is never kept waiting.
  const translated = useDebounced(shown, phraseConsole.preview ? 200 : 0);
  const previewingTranslations = Boolean(phraseConsole.preview) && translated === shown;

  // What the app's own keys press. The four save/load controls own the dialogs they open, so the
  // keys press the buttons where they stand rather than lifting those dialogs out of them.
  const appKeys = () => ({
    saveWorkspace: () => pressControl("save-workspace"),
    loadWorkspace: () => pressControl("load-workspace"),
    exportWorkspace: () => pressControl("export-workspace"),
    importWorkspace: () => pressControl("import-workspace"),
    toggleWords: () => {
      const next = !wordsPanelOpen;
      setWordsPanel(next);
      // Opening it puts the cursor inside, which is the point of a key that opens a panel.
      if (next) {
        requestAnimationFrame(() => {
          document
            .querySelector<HTMLElement>('[data-kb-region="words"] [data-kb-word]')
            ?.focus();
        });
      }
    },
    toggleHelp: () => setHelpOpen((open) => !open),
    undo: history.canUndo ? history.undo : undefined,
    redo: history.canRedo ? history.redo : undefined,
    console: { toggle: phraseConsole.toggle, startCommand: phraseConsole.startCommand },
  });

  // The tagline is rendered by the engine from a fixed period, in the chosen UI language.
  const t = useUiString();
  const payoff = t('app.payoff');
  // The tab's title is the header's: the brand, which stays literal (C15), and the tagline, set as a
  // title is, with a capital (the header's CSS uppercases it instead). Keyed on the tagline, not the
  // language, so it also catches the bundle arriving after a stored language was restored.
  useEffect(() => {
    document.title = `Signi — ${payoff.charAt(0).toUpperCase()}${payoff.slice(1)}`;
  }, [payoff]);

  // One plan per root container (a container no link targets); linked containers fold in
  // as relative clauses. Every root is translated and shown in period order.
  const sentences = workspaceToPlans(translated.containers, translated.links);
  const results = useTranslations(sentences.map((s) => s.plan));
  const isError = results.some((r) => r.isError);

  return (
    // One keydown listener for the whole app: what a key does is decided by what the cursor is on
    // (see keyboard/KeyboardProvider), never by a handler hidden in the component that owns it.
    <KeyboardProvider app={appKeys}>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        {/* Header. Sticky and stacked above the word-palette overlay (which is a
            fixed drawer) so its toggle control stays clickable while the panel is
            open and the panel appears to slide out from beneath it. The panel reads
            this element's height (by the data attribute) to know where to start, so
            that its own header row lands below this one rather than beneath it. */}
        <Box
          data-signi-header=""
          sx={{
            position: "sticky",
            top: 0,
            zIndex: (t) => t.zIndex.drawer + 1,
            bgcolor: "background.paper",
            borderTop: "3px solid",
            borderBottom: "1px solid",
            borderColor: "primary.main",
            borderBottomColor: "divider",
            py: compact ? 1 : 2,
            px: compact ? 0 : 3,
            mb: compact ? 2 : 4,
          }}
        >
          <Container
            maxWidth="xl"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontSize: compact ? "1.6rem" : undefined,
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 800,
                  lineHeight: 1,
                  color: "text.primary",
                }}
              >
                Signi
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "text.secondary",
                  mt: 0.5,
                  // A phone has the width for the brand, not the tagline beside four controls.
                  display: compact ? "none" : undefined,
                }}
              >
                {payoff}
              </Typography>
            </Box>
            {/* The header is one stop in the tab order rather than seven: left as seven it sits
                between a keyboard user and the canvas, where the work is. ← → walk it. */}
            <Box
              ref={toolbar.ref}
              role={toolbar.role}
              aria-label={t("app.toolbar")}
              data-kb-region="header"
              onKeyDown={toolbar.onKeyDown}
              onFocus={toolbar.onFocus}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: compact ? 0.5 : 1,
                flexShrink: 0,
              }}
            >
              {/* The console's own control, for whoever is using the mouse: ` does the same. On a
                  phone the console is a tab instead. */}
              {!compact && <Button
                variant={phraseConsole.open ? "contained" : "outlined"}
                size="small"
                disableElevation
                data-testid="console-toggle"
                startIcon={<TerminalIcon />}
                onClick={() => phraseConsole.setOpen(!phraseConsole.open)}
                aria-pressed={phraseConsole.open}
                sx={{ textTransform: "none", gap: 0.5 }}
              >
                {t("console.name")}
                <Keycap spec="Code:Backquote" />
              </Button>}
              <LanguageSelector compact={compact} />
              {/* On a phone, undo is a tap away rather than a chord, and the rest folds into ⋯. */}
              {compact && (
                <IconButton
                  data-testid="undo-button"
                  aria-label={t("action.undo")}
                  disabled={!history.canUndo}
                  onClick={history.undo}
                  sx={{ width: 44, height: 44, color: "primary.main" }}
                >
                  <UndoIcon />
                </IconButton>
              )}
              {compact && (
                <AppMenu
                  empty={isEmpty(containers, links)}
                  wordsOpen={wordsPanelOpen}
                  onToggleWords={() => setWordsPanel(!wordsPanelOpen)}
                  onOpenHelp={() => setHelpOpen(true)}
                />
              )}
              <SavedPhrasesToolbar
                buttonsHidden={compact}
                containers={containers}
                links={links}
                // Loading or importing replaces the whole workspace in one step, so one undo
                // puts back what was on the canvas before it.
                onLoad={(nextContainers, nextLinks) =>
                  history.replace({ containers: nextContainers, links: nextLinks })
                }
              />
              {!compact && <Button
                variant={wordsPanelOpen ? "contained" : "outlined"}
                size="small"
                disableElevation
                startIcon={<MenuBookIcon />}
                onClick={() => setWordsPanel(!wordsPanelOpen)}
                aria-pressed={wordsPanelOpen}
                sx={{ textTransform: "none" }}
              >
                {t('words.heading')}
              </Button>}
            </Box>
          </Container>
        </Box>

        <Container
          maxWidth="xl"
          sx={compact ? { pb: `${TAB_BAR_HEIGHT + 16}px`, position: "relative" } : undefined}
        >
          {compact && (mobileView === "phrase" || mobileView === "canvas") && (
            <ResultStrip sentences={results} onOpen={() => showView("translations")} />
          )}
          <Box
            ref={splitContainerRef}
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-start",
              mb: 3,
              // On a phone the canvas is one tab of several, and the whole width. Stowed, not
              // unmounted or `display: none`: it measures its own width, and a width of nothing would
              // have the layout move every box to fit it.
              ...(compact && mobileView !== "canvas" && mobileView !== "phrase" ? STOWED : {}),
            }}
          >
            {/* Left: stack of phrase containers + their relative-clause links */}
            <Box
              data-kb-region="periods"
              sx={{
                width: compact ? "100%" : `${leftWidthPct}%`,
                flexShrink: 0,
                minWidth: 0,
                pr: compact ? 0 : 1.5,
              }}
            >
              {/* The canvas shows the console's preview while a line is typed, and its edits go
                  into that line — clicking and typing are one (see usePhraseConsole). */}
              <ConsoleMarksProvider marks={phraseConsole.marks}>
                <PhraseWorkspace
                  containers={shown.containers}
                  links={shown.links}
                  setContainers={phraseConsole.canvas.setContainers}
                  setLinks={phraseConsole.canvas.setLinks}
                  wordsPanelOpen={wordsPanelOpen}
                  onWordsPanelClose={() => setWordsPanel(false)}
                  onPeriodRemoved={() => setUndoToast("toast.periodRemoved")}
                  listView={compact && mobileView === "phrase"}
                  onShowCanvas={() => showView("canvas")}
                />
              </ConsoleMarksProvider>
            </Box>

            {/* Horizontal resize handle */}
            {!compact && <Box
              onPointerDown={(e) => {
                e.preventDefault();
                const startX = e.clientX;
                const startPct = leftWidthPct;
                let currentPct = startPct;
                const rect = splitContainerRef.current?.getBoundingClientRect();
                if (!rect) return;
                startDrag(
                  (ev) => {
                    currentPct = Math.max(
                      20,
                      Math.min(
                        100,
                        startPct + ((ev.clientX - startX) / rect.width) * 100,
                      ),
                    );
                    setLeftWidthPct(currentPct);
                  },
                  () =>
                    localStorage.setItem(
                      "signi:leftWidth",
                      String(Math.round(currentPct * 10) / 10),
                    ),
                );
              }}
              sx={{
                width: 6,
                alignSelf: "stretch",
                flexShrink: 0,
                cursor: "ew-resize",
                touchAction: "none",
                borderLeft: "1px solid",
                borderColor: "divider",
                opacity: 0.4,
                transition: "opacity 0.15s",
                "&:hover": { opacity: 1, borderColor: "primary.main" },
              }}
            />}

            {/* Right: empty space for balance */}
            {!compact && <Box sx={{ flex: "1 0 280px", minWidth: 0, pl: 1.5 }} />}
          </Box>

          {/* Translations: one card, each language listing every root sentence in order */}
          <Box
            data-kb-region="translations"
            sx={{ mb: 3, display: compact && mobileView !== "translations" ? "none" : undefined }}
          >
            {isError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {t("failure.phraseNotTranslated")} {t("status.isServerActive")}
              </Alert>
            )}
            <TranslationPanel sentences={results} preview={previewingTranslations} />
          </Box>
        </Container>

        {/* The console docks under the page, which keeps room for it rather than ending
            underneath it. Its prompt line is P01's hint line; hidden, nothing is docked, and the
            key tips and tooltips teach the keys. */}
        <CursorBridge follow={phraseConsole.followCursor} />
        {phraseConsole.open && !compact && <Box sx={{ height: phraseConsole.height }} aria-hidden />}
        {compact ? (
          // The console tab fills what the header and the tab bar leave.
          phraseConsole.open && (
            <Box sx={{ position: "fixed", left: 0, right: 0, top: headerOffset, bottom: TAB_BAR_HEIGHT }}>
              <PhraseConsole model={phraseConsole} wordsPanelOpen={wordsPanelOpen} docked={false} />
            </Box>
          )
        ) : (
          <PhraseConsole model={phraseConsole} wordsPanelOpen={wordsPanelOpen} />
        )}
        {compact && <MobileTabBar view={mobileView} onChange={showView} />}
        {/* What scrolls a control into view — a tap on a half-hidden one, the cursor, focus — stops
            clear of the sticky header and the tab bar rather than under them. */}
        {compact && (
          <GlobalStyles
            styles={{ html: { scrollPaddingTop: headerOffset, scrollPaddingBottom: TAB_BAR_HEIGHT + 8 } }}
          />
        )}
        <HelpOverlay
          open={helpOpen}
          onClose={() => setHelpOpen(false)}
          onConsoleCommand={(name) => {
            setHelpOpen(false);
            phraseConsole.showHelp(name);
            phraseConsole.focusPrompt();
          }}
        />
        {/* Last in the page's tab order, and out of the way of everything but the strip it steps
            over: help is wanted from wherever the work is. */}
        {/* On a phone help is in the ⋯ menu, off the tab bar's way. */}
        {!compact && (
          <HelpButton
            onClick={() => setHelpOpen(true)}
            bottom={phraseConsole.open ? phraseConsole.height + 16 : undefined}
          />
        )}

        {/* The toast that replaced the confirm dialog: the act has happened, and here is the way
            back. Reuses the filled Alert the app's other toasts use, in `info`. */}
        <Snackbar
          open={Boolean(undoToast)}
          autoHideDuration={8000}
          onClose={() => setUndoToast(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          sx={compact ? { bottom: `${TAB_BAR_HEIGHT + 8}px !important` } : undefined}
        >
          {undoToast ? (
            <Alert
              severity="info"
              variant="filled"
              data-testid="undo-toast"
              onClose={() => setUndoToast(null)}
              action={
                <Button
                  size="small"
                  color="inherit"
                  data-testid="undo-period"
                  onClick={() => {
                    history.undo();
                    setUndoToast(null);
                  }}
                  sx={{ textTransform: "none", gap: 0.5 }}
                >
                  {t("action.undo")}
                  <Keycap spec="Mod+Z" />
                </Button>
              }
            >
              {t(undoToast)}
            </Alert>
          ) : undefined}
        </Snackbar>
      </Box>
    </KeyboardProvider>
  );
}

/** A view the phone is not showing: laid out at the page's width, but out of sight and out of reach. */
const STOWED = {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  height: 0,
  overflow: "hidden",
  visibility: "hidden",
  pointerEvents: "none",
} as const;

/**
 * A value that follows `value` after `delay` ms of quiet — or at once, with no delay. Used so the
 * console's preview asks for translations after a pause rather than at every keystroke.
 */
function useDebounced<T>(value: T, delay: number): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    if (delay <= 0) {
      setSettled(value);
      return;
    }
    const timer = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return delay <= 0 ? value : settled;
}
