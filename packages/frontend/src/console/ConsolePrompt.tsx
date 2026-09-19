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
 * The prompt: a real `<input>` with a highlighted mirror behind it — the same text, coloured token by
 * token, and the ghost after the caret — so native editing, input methods and screen readers keep
 * working on plain text while the line reads in colour (P02 §5).
 *
 * To its left the context chip, where the next command will attach: `1 · VERB eat ›`. To its right
 * the keys that apply now — the console's own while the prompt has the keyboard, the canvas box's
 * while it does not (the prompt line doubles as P01's hint line).
 */
export function ConsolePrompt({ model }: { model: PhraseConsoleModel }) {
  const { text, ghost, listShown, completion, diagnostic } = model;
  const styled = useMemo(() => styleTokens(text), [text]);
  const listId = "console-completions";
  const active = listShown ? `console-completion-${model.highlight}` : undefined;

  // The list opens above the token it completes: a zero-width anchor in the mirror marks where that
  // token starts, and the list is placed over it once laid out.
  const rowRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [listLeft, setListLeft] = useState(16);
  const anchorAt = listShown && completion ? completion.from : -1;
  useLayoutEffect(() => {
    const row = rowRef.current;
    const anchor = anchorRef.current;
    if (!row || !anchor) return;
    const left = anchor.getBoundingClientRect().left - row.getBoundingClientRect().left - 16;
    setListLeft(Math.max(16, Math.min(left, row.clientWidth - 320)));
  }, [anchorAt, text]);
  const anchor = <span key="anchor" ref={anchorRef} />;

  // The mirror: each token in its colour, the gaps between as they were typed, the mistake wavy.
  const mirror: React.ReactNode[] = [];
  let at = 0;
  let anchored = anchorAt < 0;
  const place = (upTo: number) => {
    if (!anchored && anchorAt <= upTo) {
      mirror.push(anchor);
      anchored = true;
    }
  };
  styled.forEach((tok, i) => {
    place(tok.from);
    if (tok.from > at) mirror.push(<Fragment key={`g${i}`}>{text.slice(at, tok.from)}</Fragment>);
    place(tok.from);
    const wrong = diagnostic && tok.from < diagnostic.to && tok.to > diagnostic.from;
    mirror.push(
      <Token key={i} style={tok.style} italic={tok.italic} wrong={Boolean(wrong) || tok.style === "unknown"}>
        {text.slice(tok.from, tok.to)}
      </Token>,
    );
    at = tok.to;
  });
  if (at < text.length) mirror.push(<Fragment key="tail">{text.slice(at)}</Fragment>);
  place(text.length);

  return (
    <Box ref={rowRef} sx={{ position: "relative" }}>
      {listShown && completion && <CompletionList model={model} id={listId} left={listLeft} />}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          px: 2,
          py: 1,
          fontFamily: MONO,
          fontSize: "0.95rem",
          bgcolor: "background.paper",
        }}
      >
        <ContextChip model={model} />
        <Box sx={{ position: "relative", flex: 1, minWidth: 0 }}>
          {/* The mirror sits exactly under the input's own text, which is transparent. */}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              whiteSpace: "pre",
              overflow: "hidden",
              pointerEvents: "none",
              lineHeight: "28px",
            }}
          >
            {mirror}
            {ghost && (
              <Box component="span" data-testid="console-ghost" sx={{ color: "text.disabled" }}>
                {ghost}
              </Box>
            )}
          </Box>
          <Box
            component="input"
            ref={model.inputRef}
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
            role="combobox"
            // English literal, for /localize.
            placeholder="type a word, or / for a command"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              model.onChange(e.target.value, e.target.selectionStart ?? e.target.value.length)
            }
            onSelect={(e: React.SyntheticEvent<HTMLInputElement>) =>
              model.setCaret(e.currentTarget.selectionStart ?? e.currentTarget.value.length)
            }
            onKeyDown={model.onKeyDown}
            onFocus={() => model.setFocused(true)}
            onBlur={() => model.setFocused(false)}
            onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
              const pasted = e.clipboardData.getData("text/plain");
              if (pasted.includes("\n")) {
                e.preventDefault();
                model.paste(pasted);
              }
            }}
            sx={{
              position: "relative",
              width: "100%",
              border: 0,
              outline: 0,
              p: 0,
              m: 0,
              background: "transparent",
              font: "inherit",
              lineHeight: "28px",
              // The text itself is drawn by the mirror; the caret stays the input's own.
              color: "transparent",
              caretColor: (theme) => theme.palette.text.primary,
              "&::placeholder": { color: "text.disabled", fontStyle: "normal" },
              "&::selection": { bgcolor: "action.selected", color: "transparent" },
            }}
          />
        </Box>
        <PromptKeys model={model} />
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

/** `1 · VERB eat ›` — or, inside brackets, `1 › rel › 2 · OBJ cat ›`. */
function ContextChip({ model }: { model: PhraseConsoleModel }) {
  const t = useUiString();
  const { chip, editing } = model;
  if (editing !== undefined) {
    return (
      <Box
        data-testid="console-chip"
        sx={{
          flexShrink: 0,
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
    );
  }
  const word = chip.word;
  const info = word ? wordInfo((model.preview?.state ?? model.committed).containers, word) : undefined;
  const slot = word && ALL_SLOTS.find((s) => s.key === word.slot);
  return (
    <Box
      data-testid="console-chip"
      sx={{
        flexShrink: 0,
        display: "flex",
        alignItems: "baseline",
        gap: 0.75,
        color: "text.secondary",
        fontSize: "0.85rem",
      }}
    >
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
      )}
      <Box component="span">›</Box>
    </Box>
  );
}

/** The keys that apply now, at the right of the prompt line. */
function PromptKeys({ model }: { model: PhraseConsoleModel }) {
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
  const key = (spec: string, label: string) => (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
      <Keycap spec={spec} />
      {label}
    </Box>
  );
  // English literals, for /localize.
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
          {key("Enter", "replace the period")}
          {key("Escape", "cancel")}
        </>
      ) : model.listShown ? (
        <>
          {key("Tab", "complete")}
          {key("Enter", "choose")}
          {key("Escape", "close the list")}
        </>
      ) : model.text ? (
        <>
          {model.ghost && key("Tab", "complete")}
          {key("Enter", "apply")}
          {key("Escape", "clear")}
        </>
      ) : (
        <>
          {key("Escape", "back to the canvas")}
        </>
      )}
    </Box>
  );
}
