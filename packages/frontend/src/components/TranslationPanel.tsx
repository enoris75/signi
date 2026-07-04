import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Skeleton,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import type { RubySegment, Translation } from '@signi/shared';
import { LANGUAGES } from '@signi/shared';

/** Render furigana segments: a reading `r` becomes <ruby>t<rt>r</rt></ruby>; plain runs stay text. */
function RubyText({ segments }: { segments: RubySegment[] }) {
  return (
    <>
      {segments.map((s, i) =>
        s.r ? (
          <ruby key={i}>
            {s.t}
            <rt>{s.r}</rt>
          </ruby>
        ) : (
          <span key={i}>{s.t}</span>
        ),
      )}
    </>
  );
}

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
            <TranslationRow
              key={t.language}
              translation={t}
              isLast={idx === translations.length - 1}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
}

function TranslationRow({ translation: t, isLast }: { translation: Translation; isLast: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(t.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (e.g. insecure context) — ignore
    }
  };

  return (
    <Box
      sx={{
        py: 1.75,
        borderBottom: isLast ? 'none' : '1px solid',
        borderColor: 'divider',
        '&:hover .copy-btn': { opacity: 1 },
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
        <Tooltip title={copied ? 'Copied' : 'Copy to clipboard'} placement="top">
          <IconButton
            className="copy-btn"
            onClick={handleCopy}
            size="small"
            aria-label={`Copy ${LANGUAGES[t.language]} translation`}
            sx={{
              ml: 'auto',
              p: 0.5,
              color: copied ? 'success.main' : 'text.secondary',
              opacity: copied ? 1 : 0,
              transition: 'opacity 0.15s',
            }}
          >
            {copied ? (
              <CheckIcon sx={{ fontSize: '0.95rem' }} />
            ) : (
              <ContentCopyIcon sx={{ fontSize: '0.95rem' }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>
      <Typography
        component="div"
        sx={{
          fontFamily: t.language === 'ja'
            ? '"Noto Serif JP", serif'
            : '"Lora", Georgia, serif',
          fontSize: t.language === 'ja' ? '1rem' : '1.1rem',
          // Ruby readings sit above the line; give furigana rows a little headroom.
          lineHeight: t.ruby ? 2 : 1.65,
          fontStyle: t.language !== 'ja' ? 'italic' : 'normal',
          color: 'text.primary',
          pl: 2.5,
          '& rt': { fontSize: '0.6em', fontWeight: 400, userSelect: 'none' },
        }}
      >
        {t.ruby ? <RubyText segments={t.ruby} /> : t.text}
      </Typography>
    </Box>
  );
}
