import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Skeleton,
  IconButton,
  Tooltip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import type { LanguageCode, RubySegment, Translation } from '@signi/shared';
import { LANGUAGES } from '@signi/shared';
import type { SentenceResult } from '../hooks/useTranslation.ts';

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

const LANGUAGE_CODES = Object.keys(LANGUAGES) as LanguageCode[];

interface Props {
  // One entry per root sentence, in period order. Sentences that aren't translatable yet
  // (no subject) are skipped; the panel shows its empty state when none are.
  sentences: SentenceResult[];
}

// One card holding every root sentence's translations, grouped by language: each language
// row lists its sentences one under the other, in period order.
export default function TranslationPanel({ sentences }: Props) {
  const ready = sentences.filter((s) => s.isReady);

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <Typography
        variant="h6"
        sx={{ mb: 2.5, fontFamily: '"Playfair Display", serif', fontWeight: 700, letterSpacing: '-0.01em' }}
      >
        Translations
      </Typography>

      {ready.length === 0 ? (
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
      ) : (
        <Box>
          {LANGUAGE_CODES.map((language, idx) => (
            <LanguageRow
              key={language}
              language={language}
              sentences={ready}
              isLast={idx === LANGUAGE_CODES.length - 1}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
}

// The translations of every sentence into one language, stacked in period order. A sentence
// still in flight shows a skeleton line, so a newly edited period doesn't drop the others.
function LanguageRow({
  language,
  sentences,
  isLast,
}: {
  language: LanguageCode;
  sentences: SentenceResult[];
  isLast: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const lines = sentences.map((s) => s.translations?.find((t) => t.language === language));
  const text = lines
    .filter((t): t is Translation => Boolean(t))
    .map((t) => t.text)
    .join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
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
        <Box sx={{ fontSize: '0.9rem', lineHeight: 1 }}>{FLAG[language]}</Box>
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
          {LANGUAGES[language]}
        </Typography>
        {text && (
          <Tooltip title={copied ? 'Copied' : 'Copy to clipboard'} placement="top">
            <IconButton
              className="copy-btn"
              onClick={handleCopy}
              size="small"
              aria-label={`Copy ${LANGUAGES[language]} translation`}
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
        )}
      </Box>
      {lines.map((translation, i) =>
        translation ? (
          <SentenceLine key={i} translation={translation} />
        ) : (
          <Skeleton key={i} width="75%" height={22} sx={{ ml: 2.5 }} />
        ),
      )}
    </Box>
  );
}

function SentenceLine({ translation: t }: { translation: Translation }) {
  return (
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
  );
}
