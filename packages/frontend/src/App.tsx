import { useRef, useState } from "react";
import { Box, Container, Typography, Alert, Button } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { PhraseWorkspace } from "./components/PhraseBuilder/PhraseWorkspace.tsx";
import {
  type PhraseContainer,
  type PhraseLink,
} from "./components/PhraseBuilder/interfaces.ts";
import { workspaceToPlans } from "./components/PhraseBuilder/workspacePlan.ts";
import TranslationPanel from "./components/TranslationPanel.tsx";
import { SavedPhrasesToolbar } from "./components/SavedPhrasesToolbar.tsx";
import { LanguageSelector } from "./components/LanguageSelector.tsx";
import { useTranslations } from "./hooks/useTranslation.ts";
import { useUiString } from "./i18n/useUiString.ts";

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

  // The tagline is rendered by the engine from a fixed period, in the chosen UI language.
  const t = useUiString();
  const payoff = t('app.payoff');

  // One plan per root container (a container no link targets); linked containers fold in
  // as relative clauses. Every root is translated and shown in period order.
  const sentences = workspaceToPlans(containers, links);
  const results = useTranslations(sentences.map((s) => s.plan));
  const isError = results.some((r) => r.isError);

  return (
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
          <Box
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
              const onMove = (ev: PointerEvent) => {
                currentPct = Math.max(
                  20,
                  Math.min(
                    100,
                    startPct + ((ev.clientX - startX) / rect.width) * 100,
                  ),
                );
                setLeftWidthPct(currentPct);
              };
              const onUp = () => {
                localStorage.setItem(
                  "signi:leftWidth",
                  String(Math.round(currentPct * 10) / 10),
                );
                window.removeEventListener("pointermove", onMove);
                window.removeEventListener("pointerup", onUp);
                window.removeEventListener("pointercancel", onUp);
              };
              window.addEventListener("pointermove", onMove);
              window.addEventListener("pointerup", onUp);
              window.addEventListener("pointercancel", onUp);
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
        <Box sx={{ mb: 3 }}>
          {isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Could not reach the translation server.
            </Alert>
          )}
          <TranslationPanel sentences={results} />
        </Box>
      </Container>
    </Box>
  );
}
