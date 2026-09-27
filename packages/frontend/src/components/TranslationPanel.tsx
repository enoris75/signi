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
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type { LanguageCode, RubySegment, Translation, UiStringKey } from '@signi/shared';
import { isPreviewLanguage, UI_STRINGS } from '@signi/shared';
import type { SentenceResult } from '../hooks/useTranslation.ts';
import { useLanguageOrder } from '../hooks/useLanguageOrder.ts';
import { Flag } from '../i18n/flags.tsx';
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

interface Props {
  // One entry per root sentence, in period order. Sentences that aren't translatable yet
  // (no subject) are skipped; the panel shows its empty state when none are.
  sentences: SentenceResult[];
  // The sentences are the console's preview of a line not yet committed (P02 §4): each language
  // says so, until ↵ makes them the phrase's own.
  preview?: boolean;
}

// One card holding every root sentence's translations, grouped by language: each language
// row lists its sentences one under the other, in period order.
export default function TranslationPanel({ sentences, preview = false }: Props) {
  const ready = sentences.filter((s) => s.isReady);
  const t = useUiString();
  const heading = t('translations.heading');
  const listRef = useRef<HTMLDivElement | null>(null);
  const [order, moveLanguage] = useLanguageOrder();

  // A moved row keeps the cursor: React re-inserts its element, which can drop focus, so whatever
  // held it (the row, or its arrow button) takes it back once the list has re-rendered.
  function move(language: LanguageCode, delta: number) {
    const held = document.activeElement as HTMLElement | null;
    moveLanguage(language, delta);
    requestAnimationFrame(() => {
      if (held && held.isConnected && document.activeElement !== held) held.focus();
    });
  }

  // The rows are a list, so they are walked like one: ↑ ↓ between languages, and ↵ or C copies
  // the one the cursor is on (the plan's §4.6). Each row is its own tab stop as well, since a
  // reader may want to tab straight to the language they are checking. ⇧↑ ⇧↓ move the row itself,
  // as they move a period.
  function onKeyDown(event: KeyboardEvent) {
    const delta = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
    if (!delta) return;
    if (event.shiftKey) {
      const row = (event.target as HTMLElement).closest<HTMLElement>('[data-kb-lang]');
      if (!row) return;
      event.preventDefault();
      move(row.dataset.kbLang as LanguageCode, delta);
      return;
    }
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
          {t('hint.selectToTranslate')}
        </Typography>
      ) : (
        <Box ref={listRef} onKeyDown={onKeyDown}>
          {order.map((language, idx) => (
            <LanguageRow
              key={language}
              language={language}
              sentences={ready}
              isLast={idx === order.length - 1}
              preview={preview}
              onMoveUp={idx > 0 ? () => move(language, -1) : undefined}
              onMoveDown={idx < order.length - 1 ? () => move(language, 1) : undefined}
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
  preview,
  onMoveUp,
  onMoveDown,
}: {
  language: LanguageCode;
  sentences: SentenceResult[];
  isLast: boolean;
  preview: boolean;
  // Absent at the end the row cannot move past; the button then stays, disabled, so the cluster
  // does not shift as a row reaches the top or bottom.
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  // Named `uiString` rather than `t` — the translation lambdas below already bind `t`.
  const uiString = useUiString();
  // A row whose variety is not recoverable from its text names it (P10-E2, P04-E2): Swiss German
  // says which dialect it writes, "Swiss German (Zürich)", and each Romansh row which written
  // standard, "Romansh (Sursilvan)". Swiss German also says in its tooltip how it spells, and that no
  // standard spelling exists to be checked against.
  const dialectKey = `language.${language}.dialect`;
  const dialect = dialectKey in UI_STRINGS ? uiString(dialectKey as UiStringKey) : '';
  const name = dialect ? `${uiString(`language.${language}`)} (${dialect})` : uiString(`language.${language}`);
  const about = language === 'gsw' ? [uiString('language.gsw.spelling'), uiString('language.gsw.caveat')] : [];
  const unready = isPreviewLanguage(language);
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
        '&:hover .copy-btn, &:focus-within .copy-btn, &:hover .move-btn, &:focus-within .move-btn': { opacity: 1 },
        ...focusRing('primary'),
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
        <Box sx={{ fontSize: '0.9rem', lineHeight: 1 }}>
          <Flag language={language} />
        </Box>
        <Tooltip
          title={about.length ? about.map((line) => <Box key={line}>{line}</Box>) : ''}
          placement="top"
        >
          <Typography
            component="span"
            data-testid={`row-name-${language}`}
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
        </Tooltip>
        {/* A language still in preview (P10-E1): rendered, not yet reviewed. */}
        {unready && (
          <Box
            component="span"
            data-testid="row-language-preview"
            sx={{
              px: 0.75,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              fontFamily: '"Inter", sans-serif',
              fontSize: '0.55rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            {uiString('status.preview')}
          </Box>
        )}
        {preview && (
          <Box
            component="span"
            data-testid="translation-preview"
            sx={{
              px: 0.75,
              border: '1px dashed',
              borderColor: 'primary.main',
              borderRadius: 2,
              fontFamily: '"Inter", sans-serif',
              fontSize: '0.55rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'primary.main',
            }}
          >
            {uiString('status.preview')}
          </Box>
        )}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
          {(
            [
              ['up', 'action.moveLanguageUp', ArrowUpwardIcon, onMoveUp],
              ['down', 'action.moveLanguageDown', ArrowDownwardIcon, onMoveDown],
            ] as const
          ).map(([dir, labelKey, Icon, onMove]) => (
            <Tooltip key={dir} title={onMove ? uiString(labelKey) : ''} placement="top">
              {/* A disabled button fires no events, so the tooltip hangs on a span around it. */}
              <span>
                <IconButton
                  className="move-btn"
                  data-testid={`move-language-${dir}`}
                  onClick={onMove}
                  disabled={!onMove}
                  size="small"
                  aria-label={`${uiString(labelKey)} (${name})`}
                  sx={{ p: 0.5, color: 'text.secondary', opacity: 0, transition: 'opacity 0.15s' }}
                >
                  <Icon sx={{ fontSize: '0.95rem' }} />
                </IconButton>
              </span>
            </Tooltip>
          ))}
          {text && (
            <Tooltip title={uiString(copied ? 'status.copied' : 'action.copyTranslation')} placement="top">
              <IconButton
                className="copy-btn"
                onClick={handleCopy}
                size="small"
                // The plan can't carry the row's language, so it follows in brackets.
                aria-label={`${uiString('action.copyTranslation')} (${name})`}
                sx={{
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
