import { Box } from "@mui/material";
import { Fragment, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ALL_SLOTS } from "../components/PhraseBuilder/slots.ts";
import { useUiString } from "../i18n/useUiString.ts";
import { Keycap } from "../keyboard/Keycap.tsx";
import { styleTokens } from "./language/parse.ts";
import { wordInfo } from "./language/words.ts";
import { CompletionList } from "./CompletionList.tsx";
import { HintKeys } from "./HintKeys.tsx";
import { MONO, Token, tokenColor } from "./tokens.tsx";
import type { PhraseConsoleModel } from "./usePhraseConsole.ts";

/**
 * The prompt: a real `<textarea>` with a highlighted mirror behind it — the same text, coloured token
 * by token, and the ghost at the caret — so native editing, input methods and screen readers keep
 * working on plain text while the line reads in colour (P02 §5). The line wraps, and the prompt grows
 * with it up to eight rows; ⇧↵ breaks it.
 *
 * To its left the context chip, where the next command will attach: `1 · VERB eat ›`. To its right
 * the keys that apply now — the console's own while the prompt has the keyboard, the canvas box's
 * while it does not (the prompt line doubles as P01's hint line).
 */
const LINE = 28;
const MAX_ROWS = 8;

export function ConsolePrompt({ model }: { model: PhraseConsoleModel }) {
  const t = useUiString();
  const { text, ghost, listShown, completion, diagnostic, caret } = model;
  const styled = useMemo(() => styleTokens(text), [text]);
  const listId = "console-completions";
  const active = listShown ? `console-completion-${model.highlight}` : undefined;

  // The list opens above the token it completes: a zero-width anchor in the mirror marks where that
  // token starts, and the list is placed over it once laid out.
  const rowRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const [listLeft, setListLeft] = useState(16);
  const anchorAt = listShown && completion ? completion.from : -1;
  useLayoutEffect(() => {
    const row = rowRef.current;
    const anchor = anchorRef.current;
    if (!row || !anchor) return;
    const left = anchor.getBoundingClientRect().left - row.getBoundingClientRect().left - 16;
    setListLeft(Math.max(16, Math.min(left, row.clientWidth - 320)));
  }, [anchorAt, text]);

  // Which row the caret is on, read off the mirror: ↑ and ↓ walk the history only from the edges.
  model.rows.current = {
    first: () => {
      const c = caretRef.current?.getBoundingClientRect();
      const m = mirrorRef.current?.getBoundingClientRect();
      return !c || !m || c.top < m.top + LINE * 0.75;
    },
    last: () => {
      const c = caretRef.current?.getBoundingClientRect();
      const m = mirrorRef.current?.getBoundingClientRect();
      return !c || !m || c.bottom > m.bottom - LINE * 0.75;
    },
  };

  // The mirror: each token in its colour, the gaps between as they were typed, the mistake wavy —
  // and, cut in where they fall, the list's anchor, the caret's mark and the ghost.
  const markers: { at: number; key: string; node: React.ReactNode }[] = [];
  if (anchorAt >= 0) markers.push({ at: anchorAt, key: "anchor", node: <span ref={anchorRef} /> });
  markers.push({ at: caret, key: "caret", node: <span ref={caretRef} /> });
  if (ghost)
    markers.push({
      at: caret,
      key: "ghost",
      node: (
        <Box component="span" data-testid="console-ghost" sx={{ color: "text.disabled" }}>
          {ghost}
        </Box>
      ),
    });
  markers.sort((a, b) => a.at - b.at);
  const pieces: { from: number; to: number; tok?: (typeof styled)[number] }[] = [];
  let at = 0;
  for (const tok of styled) {
    if (tok.from > at) pieces.push({ from: at, to: tok.from });
    pieces.push({ from: tok.from, to: tok.to, tok });
    at = tok.to;
  }
  if (at < text.length) pieces.push({ from: at, to: text.length });
  const mirror: React.ReactNode[] = [];
  let m = 0;
  const flush = (upTo: number) => {
    while (m < markers.length && markers[m]!.at <= upTo) {
      mirror.push(<Fragment key={markers[m]!.key}>{markers[m]!.node}</Fragment>);
      m++;
    }
  };
  const piece = (p: (typeof pieces)[number], from: number, to: number) => {
    if (from >= to) return;
    const slice = text.slice(from, to);
    if (!p.tok) {
      mirror.push(<Fragment key={`g${from}`}>{slice}</Fragment>);
      return;
    }
    const wrong = diagnostic && p.tok.from < diagnostic.to && p.tok.to > diagnostic.from;
    mirror.push(
      <Token key={`t${from}`} style={p.tok.style} italic={p.tok.italic} wrong={Boolean(wrong) || p.tok.style === "unknown"}>
        {slice}
      </Token>,
    );
  };
  for (const p of pieces) {
    flush(p.from);
    let from = p.from;
    while (m < markers.length && markers[m]!.at < p.to) {
      const cut = markers[m]!.at;
      piece(p, from, cut);
      from = cut;
      flush(cut);
    }
    piece(p, from, p.to);
  }
  flush(Number.POSITIVE_INFINITY);
  // A line that ends in a break has one more row, empty: the mirror must have it too.
  if (text.endsWith("\n")) mirror.push("\u200b");

  // The text wraps the same in the mirror and in the field over it.
  const flow = {
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    lineHeight: `${LINE}px`,
    font: "inherit",
    letterSpacing: "inherit",
    p: 0,
    m: 0,
  } as const;

  return (
    <Box ref={rowRef} sx={{ position: "relative" }}>
      {listShown && completion && <CompletionList model={model} id={listId} left={listLeft} />}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1.25,
          px: 2,
          py: 1,
          fontFamily: MONO,
          fontSize: "0.95rem",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ minHeight: LINE, display: "flex", alignItems: "center", flexShrink: 0 }}>
          <ContextChip model={model} />
        </Box>
        <Box data-testid="console-prompt-scroll" sx={{ flex: 1, minWidth: 0, maxHeight: LINE * MAX_ROWS, overflowY: "auto" }}>
          <Box sx={{ position: "relative" }}>
            {/* The mirror sits exactly under the field's own text, which is transparent. */}
            <Box aria-hidden ref={mirrorRef} sx={{ ...flow, minHeight: LINE, pointerEvents: "none" }}>
              {mirror}
            </Box>
            <Box
              component="textarea"
              ref={model.inputRef}
              rows={1}
              data-testid="console-prompt"
              data-console-prompt=""
              value={text}
              spellCheck={false}
              autoComplete="off"
              aria-label="Console"
              aria-autocomplete="both"
              aria-expanded={listShown}
              aria-controls={listShown ? listId : undefined}
              aria-activedescendant={active}
              aria-multiline
              role="combobox"
              // The key that starts a command is a value, not a word: it follows the phrase.
              placeholder={`${t("console.placeholder")} (/)`}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                model.onChange(
                  e.target.value,
                  e.target.selectionStart ?? e.target.value.length,
                  Boolean((e.nativeEvent as InputEvent).isComposing),
                )
              }
              // The selection's end: with a word selected, the console reads what the word is.
              onSelect={(e: React.SyntheticEvent<HTMLTextAreaElement>) =>
                model.setCaret(e.currentTarget.selectionEnd ?? e.currentTarget.value.length)
              }
              onKeyDown={model.onKeyDown}
              onFocus={() => model.setFocused(true)}
              onBlur={() => model.setFocused(false)}
              sx={{
                ...flow,
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                border: 0,
                outline: 0,
                resize: "none",
                overflow: "hidden",
                background: "transparent",
                // The text itself is drawn by the mirror; the caret stays the field's own.
                color: "transparent",
                caretColor: (theme) => theme.palette.text.primary,
                "&::placeholder": { color: "text.disabled", fontStyle: "normal" },
                "&::selection": { bgcolor: "action.selected", color: "transparent" },
              }}
            />
          </Box>
        </Box>
        <Box sx={{ minHeight: LINE, display: "flex", alignItems: "center", flexShrink: 0 }}>
          <PromptKeys model={model} />
        </Box>
      </Box>
      {diagnostic && (
        <Box
          role="status"
          data-testid="console-diagnostic"
          sx={{
            display: "flex",
            alignItems: "baseline",
            gap: 1,
            px: 2,
            pb: 1,
            bgcolor: "background.paper",
            fontFamily: '"Inter", sans-serif',
            fontSize: "0.8rem",
            color: model.unfinished ? "text.secondary" : "text.primary",
          }}
        >
          <Box component="span" sx={{ color: model.unfinished ? "text.disabled" : "error.main", fontWeight: 700 }}>
            {model.unfinished ? "…" : "!"}
          </Box>
          <MessageText message={diagnostic.message} />
        </Box>
      )}
    </Box>
  );
}

/** A diagnostic's text, its `/commands` set in the console's type. */
function MessageText({ message }: { message: string }) {
  const parts = message.split(/(\/[a-z]+(?: \/[a-z]+)?)/g);
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith("/") ? (
          <Box key={i} component="span" sx={{ fontFamily: MONO, fontSize: "0.78rem" }}>
            {part}
          </Box>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </span>
  );
}

/**
 * `1 · VERB eat ›` — or, inside brackets, `1 › rel › 2 · OBJ cat ›`. While a period is being edited,
 * the badge says which, and the word after it where the caret is: `EDITING PERIOD 1 › SUBJ uomo ›`.
 */
function ContextChip({ model }: { model: PhraseConsoleModel }) {
  const t = useUiString();
  const { chip, editing } = model;
  const word = chip.word;
  const info = word ? wordInfo((model.preview?.state ?? model.committed).containers, word) : undefined;
  const slot = word && ALL_SLOTS.find((s) => s.key === word.slot);
  const wordPart = word && (
    <>
      <Box
        component="span"
        sx={{
          fontFamily: '"Inter", sans-serif',
          fontSize: "0.6rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {word.modifierAdjective ? t("category.adjective") : slot?.labelKey ? t(slot.labelKey) : slot?.label}
      </Box>
      {info?.concept && (
        <Box
          component="span"
          sx={{
            fontFamily: '"Lora", Georgia, serif',
            fontStyle: "italic",
            color: slot ? tokenColor(slot.color, true) : "text.primary",
          }}
        >
          {model.vocab.label(info.concept)}
        </Box>
      )}
    </>
  );
  const rowSx = { flexShrink: 0, display: "flex", alignItems: "baseline", gap: 0.75, color: "text.secondary", fontSize: "0.85rem" };
  if (editing !== undefined) {
    return (
      <Box data-testid="console-chip" sx={rowSx}>
        <Box
          component="span"
          sx={{
            px: 0.75,
            borderRadius: 0.5,
            bgcolor: (theme) => `${theme.palette.primary.main}1a`,
            color: "primary.main",
            fontFamily: '"Inter", sans-serif',
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {/* English literal, for /localize. */}
          Editing period {editing} ›
        </Box>
        {word && (
          <>
            {wordPart}
            <Box component="span">›</Box>
          </>
        )}
      </Box>
    );
  }
  return (
    <Box data-testid="console-chip" sx={rowSx}>
      {chip.path.map((step, i) => (
        <Fragment key={i}>
          {i > 0 && <Box component="span">› {step.via}</Box>}
          {/* A bracket that opens a period of its own says which; a possessor's or a conjunct's
              stays in the period it is in. */}
          {(i === 0 || step.period !== chip.path[i - 1]!.period) && (
            <Box component="span">
              {i > 0 ? "› " : ""}
              {step.period}
            </Box>
          )}
        </Fragment>
      ))}
      {word && (
        <>
          <Box component="span">·</Box>
          {wordPart}
        </>
      )}
      <Box component="span">›</Box>
    </Box>
  );
}

/** The keys that apply now, at the right of the prompt line. */
function PromptKeys({ model }: { model: PhraseConsoleModel }) {
  const t = useUiString();
  const keysSx = {
    display: "flex",
    alignItems: "center",
    gap: 1.25,
    flexShrink: 0,
    fontFamily: '"Inter", sans-serif',
    fontSize: "0.72rem",
    color: "text.secondary",
  } as const;
  // Away from the prompt the line is the hint line: the keys of the box under the canvas cursor.
  if (!model.focused) return <HintKeys />;
  const key = (spec: string, label: React.ReactNode) => (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
      <Keycap spec={spec} />
      {label}
    </Box>
  );
  // The English literals wait on B43 and B45: "next word", "complete", "apply", "close the list",
  // "back to the canvas", and the history tag.
  return (
    <Box sx={keysSx}>
      {model.walk && (
        <Box
          component="span"
          data-testid="console-history-tag"
          sx={{ px: 0.75, border: "1px solid", borderColor: "divider", borderRadius: 2, fontSize: "0.68rem" }}
        >
          history · {model.walk.at} of {model.walk.of}
        </Box>
      )}
      {model.editing !== undefined ? (
        <>
          {key("Tab", "next word")}
          {key("Enter", t("action.replacePeriod"))}
          {/* The dialogs' Cancel, lower-case among the hints: a command, so no language minds. */}
          {key("Escape", <Box component="span" sx={{ textTransform: "lowercase" }}>{t("action.cancel")}</Box>)}
        </>
      ) : model.listShown ? (
        <>
          {key("Tab", "complete")}
          {key("Enter", t("slot.choose"))}
          {key("Escape", "close the list")}
        </>
      ) : model.text ? (
        <>
          {key("Tab", model.ghost ? "complete" : "next word")}
          {key("Enter", "apply")}
          {key("Escape", t("action.clear"))}
        </>
      ) : (
        <>
          {key("Escape", "back to the canvas")}
        </>
      )}
    </Box>
  );
}
