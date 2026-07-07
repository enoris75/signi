import { useRef, useState } from "react";
import type { PhrasePlan } from "@signi/shared";
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
import { useTranslation } from "./hooks/useTranslation.ts";

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `c${Math.random().toString(36).slice(2)}`;

// One root sentence's translations. A component (not a loop) so useTranslation runs once
// per sentence, honouring the rules of hooks as sentences are added/removed.
function SentenceTranslation({
  plan,
  index,
  total,
}: {
  plan: Partial<PhrasePlan>;
  index: number;
  total: number;
}) {
  const { data: translations, isLoading, isError } = useTranslation(plan);
  // A subject alone is enough to translate — a verbless period is a bare noun phrase.
  const isReady = Boolean(plan.subject?.concept);
  return (
    <Box sx={{ mb: 3 }}>
      {total > 1 && (
        <Typography
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "text.secondary",
            mb: 1,
          }}
        >
          Sentence {index + 1}
        </Typography>
      )}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Could not reach the translation server.
        </Alert>
      )}
      <TranslationPanel
        translations={translations}
        isLoading={isLoading}
        isReady={isReady}
      />
    </Box>
  );
}

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

  // One plan per root container (a container no link targets); linked containers fold in
  // as relative clauses. Each root renders its own translations block.
  const sentences = workspaceToPlans(containers, links);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header. Sticky and stacked above the word-palette overlay (which is a
          fixed drawer) so its toggle control stays clickable while the panel is
          open and the panel appears to slide out from beneath it. */}
      <Box
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
              Semantic phrase builder
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
              Words
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

        {/* Translations: one block per root sentence, full width below */}
        {sentences.map((s, i) => (
          <SentenceTranslation
            key={s.containerId}
            plan={s.plan}
            index={i}
            total={sentences.length}
          />
        ))}
      </Container>
    </Box>
  );
}
