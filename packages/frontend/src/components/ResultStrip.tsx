import { useRef } from "react";
import { Box, ButtonBase } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { SxProps, Theme } from "@mui/material";
import type { SentenceResult } from "../hooks/useTranslation.ts";
import { useUiLanguage } from "../i18n/LanguageContext.tsx";
import { useUiString } from "../i18n/useUiString.ts";

/**
 * On a phone (P17) the translations are a tab away, so the canvas keeps the phrase in the user's own
 * language above it: every sentence, in period order. A tap opens the rest.
 *
 * The console tab keeps it too (P17-E3), where the sentences are the line's preview while one is
 * typed: `preview` marks them as the translations panel marks its preview, with a dashed edge and
 * the same "preview" tag. While a new sentence is on its way the last one stays, so the strip does
 * not blink out (and the console under it jump) at every pause in the typing.
 */
export function ResultStrip({
  sentences,
  onOpen,
  preview = false,
  sx,
}: {
  sentences: SentenceResult[];
  onOpen: () => void;
  preview?: boolean;
  sx?: SxProps<Theme>;
}) {
  const { uiLanguage } = useUiLanguage();
  const t = useUiString();
  const fresh = sentences
    .filter((s) => s.isReady)
    .map((s) => s.translations?.find((tr) => tr.language === uiLanguage)?.text)
    .filter((text): text is string => Boolean(text));
  const last = useRef<string[]>([]);
  const loading = fresh.length === 0 && sentences.some((s) => s.isReady && s.isLoading);
  const texts = loading ? last.current : fresh;
  last.current = texts;
  if (texts.length === 0) return null;
  return (
    <ButtonBase
      data-testid="result-strip"
      data-preview={preview || undefined}
      onClick={onOpen}
      aria-label={t("translations.heading")}
      sx={[
        {
          width: "100%",
          mb: 1.5,
          px: 2,
          py: 1.25,
          gap: 1,
          justifyContent: "space-between",
          textAlign: "left",
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        },
        preview && { borderStyle: "dashed", borderColor: "primary.main" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        component="span"
        sx={{ fontFamily: '"Lora", Georgia, serif', fontStyle: "italic", fontSize: "1.1rem", lineHeight: 1.35 }}
      >
        {texts.join(" ")}
      </Box>
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
        {preview && (
          <Box
            component="span"
            data-testid="result-strip-preview"
            sx={{
              px: 0.75,
              border: "1px dashed",
              borderColor: "primary.main",
              borderRadius: 2,
              fontFamily: '"Inter", sans-serif',
              fontSize: "0.55rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "primary.main",
            }}
          >
            {t("status.preview")}
          </Box>
        )}
        <ChevronRightIcon sx={{ color: "text.secondary" }} />
      </Box>
    </ButtonBase>
  );
}
