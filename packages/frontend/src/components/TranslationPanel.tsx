import { useRef, useState, type KeyboardEvent } from 'react';
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
import { FLAG } from '../i18n/flags.ts';
import { useUiString } from '../i18n/useUiString.ts';
import { focusRing } from '../keyboard/focusRing.ts';

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
  const t = useUiString();
  const heading = t('translations.heading');
  const listRef = useRef<HTMLDivElement | null>(null);

  // The rows are a list, so they are walked like one: ↑ ↓ between languages, and ↵ or C copies
  // the one the cursor is on (the plan's §4.6). Each row is its own tab stop as well, since a
  // reader may want to tab straight to the language they are checking.
  function onKeyDown(event: KeyboardEvent) {
    const delta = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
    if (!delta) return;
    const rows = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('[data-kb-lang]') ?? [],
    );
    const at = rows.findIndex((row) => row.contains(document.activeElement));
    const next = rows[Math.min(Math.max(at + delta, 0), rows.length - 1)];
    if (!next) return;
    event.preventDefault();
    next.focus();
  }

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <Typography
        variant="h6"
        sx={{ mb: 2.5, fontFamily: '"Playfair Display", serif', fontWeight: 700, letterSpacing: '-0.01em' }}
      >
        {heading}
      </Typography>

      {ready.length === 0 ? (
        <Typography
          data-testid="translations-empty"
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
        <Box ref={listRef} onKeyDown={onKeyDown}>
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
  // Named `uiString` rather than `t` — the translation lambdas below already bind `t`.
  const uiString = useUiString();
  const name = uiString(`language.${language}`);
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
      data-testid={`translation-${language}`}
      data-kb-lang={language}
      tabIndex={0}
      aria-label={name}
      // ↵ and C copy the row the cursor is on; the button is reachable in its own right too.
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key !== 'Enter' && event.key.toLowerCase() !== 'c') return;
        if (!text) return;
        event.preventDefault();
        void handleCopy();
      }}
      sx={{
        py: 1.75,
        px: 1,
        mx: -1,
        borderRadius: 1,
        borderBottom: isLast ? 'none' : '1px solid',
        borderColor: 'divider',
        // The copy button is drawn only for the row in hand — under the mouse, or under the
        // cursor. Before this it showed on hover alone, so a keyboard never reached it.
        '&:hover .copy-btn, &:focus-within .copy-btn': { opacity: 1 },
        ...focusRing('primary'),
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
          {name}
        </Typography>
        {text && (
          <Tooltip title={uiString(copied ? 'status.copied' : 'action.copyTranslation')} placement="top">
            <IconButton
              className="copy-btn"
              onClick={handleCopy}
              size="small"
              // The plan can't carry the row's language, so it follows in brackets.
              aria-label={`${uiString('action.copyTranslation')} (${name})`}
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
      data-testid="sentence"
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
