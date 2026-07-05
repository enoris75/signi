import { useRef, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Alert,
} from "@mui/material";
import { PhraseBuilder } from "./components/PhraseBuilder/PhraseBuilder.tsx";
import { type PhraseSelection } from "./components/PhraseBuilder/interfaces.ts";
import { selectionToPlan } from "./components/PhraseBuilder/selectionToPlan.ts";
import TranslationPanel from "./components/TranslationPanel.tsx";
import { useTranslation } from "./hooks/useTranslation.ts";

export default function App() {
  const [selection, setSelection] = useState<PhraseSelection>({});
  const [leftWidthPct, setLeftWidthPct] = useState<number>(() => {
    const saved = localStorage.getItem("signi:leftWidth");
    return saved ? Number(saved) : 58.33;
  });
  const splitContainerRef = useRef<HTMLDivElement>(null);

  const plan = selectionToPlan(selection);

  const { data: translations, isLoading, isError } = useTranslation(plan);
  const isReady = Boolean(plan.subject?.concept && plan.verbPhrase?.verb);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <Box
        sx={{
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
        <Container maxWidth="xl">
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
            Semantic phrase translator · 7 languages
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl">
        <Box
          ref={splitContainerRef}
          sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", mb: 3 }}
        >
          {/* Left: phrase diagram with inline word palette sidebar */}
          <Box sx={{ width: `${leftWidthPct}%`, flexShrink: 0, minWidth: 0, pr: 1.5 }}>
            <PhraseBuilder
              selection={selection}
              onPhraseUpdate={setSelection}
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
                currentPct = Math.max(20, Math.min(100, startPct + ((ev.clientX - startX) / rect.width) * 100));
                setLeftWidthPct(currentPct);
              };
              const onUp = () => {
                localStorage.setItem("signi:leftWidth", String(Math.round(currentPct * 10) / 10));
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

        {/* Translations: full width below */}
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
      </Container>
    </Box>
  );
}
