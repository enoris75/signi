import { useRef, useState } from "react";
import { Box, Container, Typography, Alert, Button } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { PhraseWorkspace } from "./components/PhraseBuilder/PhraseWorkspace.tsx";
import {
  type PhraseContainer,
  type PhraseLink,
} from "./components/PhraseBuilder/interfaces.ts";
import { workspaceToPlans } from "./components/PhraseBuilder/workspacePlan/index.ts";
import TranslationPanel from "./components/TranslationPanel.tsx";
import { SavedPhrasesToolbar } from "./components/SavedPhrasesToolbar.tsx";
import { LanguageSelector } from "./components/LanguageSelector.tsx";
import { useWindowDrag } from "./hooks/useWindowDrag.ts";
import { useTranslations } from "./hooks/useTranslation.ts";
import { useUiString } from "./i18n/useUiString.ts";
import { KeyboardProvider } from "./keyboard/KeyboardProvider.tsx";
import { HintLine } from "./keyboard/HintLine.tsx";
import { ShortcutSheet } from "./keyboard/ShortcutSheet.tsx";
import { useToolbar } from "./keyboard/useToolbar.ts";
import { pressControl } from "./keyboard/controls.ts";

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `c${Math.random().toString(36).slice(2)}`;

export default function App() {
  const [containers, setContainers] = useState<PhraseContainer[]>(() => [
    { id: newId(), selection: {} },
  ]);
  const [links, setLinks] = useState<PhraseLink[]>([]);
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
  // The ? sheet, which lists every binding there is.
  const [sheetOpen, setSheetOpen] = useState(false);
  // The header is one stop in the tab order, its controls walked with ← →.
  const toolbar = useToolbar();

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
    toggleSheet: () => setSheetOpen((open) => !open),
  });

  // The tagline is rendered by the engine from a fixed period, in the chosen UI language.
  const t = useUiString();
  const payoff = t('app.payoff');

  // One plan per root container (a container no link targets); linked containers fold in
  // as relative clauses. Every root is translated and shown in period order.
  const sentences = workspaceToPlans(containers, links);
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
            py: 2,
            px: 3,
            mb: 4,
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
              // No aria-label: the catalogue has no word for this row yet, and a wrong name is
              // worse than none. One for /localize.
              data-kb-region="header"
              onKeyDown={toolbar.onKeyDown}
              onFocus={toolbar.onFocus}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexShrink: 0,
              }}
            >
              <LanguageSelector />
              <SavedPhrasesToolbar
                containers={containers}
                links={links}
                onLoad={(nextContainers, nextLinks) => {
                  setContainers(nextContainers);
                  setLinks(nextLinks);
                }}
              />
              <Button
                variant={wordsPanelOpen ? "contained" : "outlined"}
                size="small"
                disableElevation
                startIcon={<MenuBookIcon />}
                onClick={() => setWordsPanel(!wordsPanelOpen)}
                aria-pressed={wordsPanelOpen}
                sx={{ textTransform: "none" }}
              >
                {t('words.heading')}
              </Button>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="xl">
          <Box
            ref={splitContainerRef}
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-start",
              mb: 3,
            }}
          >
            {/* Left: stack of phrase containers + their relative-clause links */}
            <Box
              data-kb-region="periods"
              sx={{
                width: `${leftWidthPct}%`,
                flexShrink: 0,
                minWidth: 0,
                pr: 1.5,
              }}
            >
              <PhraseWorkspace
                containers={containers}
                links={links}
                setContainers={setContainers}
                setLinks={setLinks}
                wordsPanelOpen={wordsPanelOpen}
                onWordsPanelClose={() => setWordsPanel(false)}
              />
            </Box>

            {/* Horizontal resize handle */}
            <Box
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
            />

            {/* Right: empty space for balance */}
            <Box sx={{ flex: "1 0 280px", minWidth: 0, pl: 1.5 }} />
          </Box>

          {/* Translations: one card, each language listing every root sentence in order */}
          <Box data-kb-region="translations" sx={{ mb: 3 }}>
            {isError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Could not reach the translation server.
              </Alert>
            )}
            <TranslationPanel sentences={results} />
          </Box>
        </Container>

        {/* What the keys do here, for whoever is driving with the keyboard. */}
        <HintLine />
        <ShortcutSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
      </Box>
    </KeyboardProvider>
  );
}
