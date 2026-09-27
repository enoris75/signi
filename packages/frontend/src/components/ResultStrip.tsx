import { Box, ButtonBase } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { SentenceResult } from "../hooks/useTranslation.ts";
import { useUiLanguage } from "../i18n/LanguageContext.tsx";
import { useUiString } from "../i18n/useUiString.ts";

/**
 * On a phone (P17) the translations are a tab away, so the canvas keeps the phrase in the user's own
 * language above it: every sentence, in period order. A tap opens the rest.
 */
export function ResultStrip({ sentences, onOpen }: { sentences: SentenceResult[]; onOpen: () => void }) {
  const { uiLanguage } = useUiLanguage();
  const t = useUiString();
  const texts = sentences
    .filter((s) => s.isReady)
    .map((s) => s.translations?.find((tr) => tr.language === uiLanguage)?.text)
    .filter((text): text is string => Boolean(text));
  if (texts.length === 0) return null;
  return (
    <ButtonBase
      data-testid="result-strip"
      onClick={onOpen}
      aria-label={t("translations.heading")}
      sx={{
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
      }}
    >
      <Box
        component="span"
        sx={{ fontFamily: '"Lora", Georgia, serif', fontStyle: "italic", fontSize: "1.1rem", lineHeight: 1.35 }}
      >
        {texts.join(" ")}
      </Box>
      <ChevronRightIcon sx={{ color: "text.secondary", flexShrink: 0 }} />
    </ButtonBase>
  );
}
