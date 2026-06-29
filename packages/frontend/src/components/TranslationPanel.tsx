import {
  Box,
  Paper,
  Typography,
  Skeleton,
  Stack,
} from '@mui/material';
import type { Translation } from '@signi/shared';
import { LANGUAGES } from '@signi/shared';

const FLAG: Record<string, string> = {
  en: '🇬🇧',
  it: '🇮🇹',
  fr: '🇫🇷',
  de: '🇩🇪',
  es: '🇪🇸',
  ja: '🇯🇵',
  pt: '🇵🇹',
};

interface Props {
  translations?: Translation[];
  isLoading: boolean;
  isReady: boolean;
}

export default function TranslationPanel({ translations, isLoading, isReady }: Props) {
  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <Typography
        variant="h6"
        sx={{ mb: 2.5, fontFamily: '"Playfair Display", serif', fontWeight: 700, letterSpacing: '-0.01em' }}
      >
        Translations
      </Typography>

      {!isReady && (
        <Typography
          sx={{
            fontFamily: '"Lora", serif',
            fontStyle: 'italic',
            color: 'text.secondary',
            lineHeight: 1.75,
            fontSize: '0.95rem',
          }}
        >
          Select at least a subject and a verb to see translations.
        </Typography>
      )}

      {isReady && isLoading && (
        <Stack spacing={0}>
          {Object.keys(LANGUAGES).map((lang, idx, arr) => (
            <Box
              key={lang}
              sx={{
                py: 1.75,
                borderBottom: idx < arr.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Skeleton width={90} height={14} sx={{ mb: 0.75 }} />
              <Skeleton width="75%" height={22} sx={{ ml: 2.5 }} />
            </Box>
          ))}
        </Stack>
      )}

      {isReady && !isLoading && translations && (
        <Box>
          {translations.map((t, idx) => (
            <Box
              key={t.language}
              sx={{
                py: 1.75,
                borderBottom: idx < translations.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                <Box sx={{ fontSize: '0.9rem', lineHeight: 1 }}>{FLAG[t.language]}</Box>
                <Typography
                  component="span"
                  sx={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                  }}
                >
                  {LANGUAGES[t.language]}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontFamily: t.language === 'ja'
                    ? '"Noto Serif JP", serif'
                    : '"Lora", Georgia, serif',
                  fontSize: t.language === 'ja' ? '1rem' : '1.1rem',
                  lineHeight: 1.65,
                  fontStyle: t.language !== 'ja' ? 'italic' : 'normal',
                  color: 'text.primary',
                  pl: 2.5,
                }}
              >
                {t.text}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}
