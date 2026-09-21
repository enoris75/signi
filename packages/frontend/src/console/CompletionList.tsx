import { Box, Tooltip } from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import { Fragment, useEffect, useRef } from "react";
import { ConceptWord } from "../i18n/ConceptWord.tsx";
import { useConceptDefinition } from "../i18n/useConceptLabel.ts";
import { useUiString } from "../i18n/useUiString.ts";
import { Keycap } from "../keyboard/Keycap.tsx";
import type { Candidate } from "./language/complete.ts";
import { styleTokens } from "./language/parse.ts";
import { MONO, Token, tokenColor } from "./tokens.tsx";
import type { PhraseConsoleModel } from "./usePhraseConsole.ts";

/**
 * The completion list: every candidate for the token at the caret, in a popover above it, narrowed as
 * the line is typed (P02 §2.4). A word row is a picker row — its word, and its definition on hover;
 * a command row says what it does and, for a setting, what the word holds now; a reference row wears
 * the number a digit picks it by.
 */
export function CompletionList({ model, id, left = 16 }: { model: PhraseConsoleModel; id: string; left?: number }) {
  const t = useUiString();
  const definition = useConceptDefinition();
  const listRef = useRef<HTMLDivElement>(null);
  const { completion, highlight } = model;

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${highlight}"]`)?.scrollIntoView({ block: "nearest" });
  }, [highlight]);

  if (!completion) return null;
  const numbered = completion.candidates.some((c) => c.number);
  // What the list holds, then the word it is about, outside the phrase (the C14 rule): "commands · cat".
  // A list of two kinds of rows is headed by both titles: "pinned lines · recent lines".
  const keys = completion.titleKey === undefined ? [] : [completion.titleKey].flat();
  const heading = keys.length ? keys.map((k) => t(k)).join(" · ") : completion.title;
  const title = completion.about ? `${heading} · ${completion.about}` : heading;

  const row = (c: Candidate, i: number) => {
    const selected = i === highlight;
    const content = (
      <Box
        key={`${c.kind}:${c.insert}:${i}`}
        id={`console-completion-${i}`}
        role="option"
        aria-selected={selected}
        data-index={i}
        data-testid="console-option"
        data-insert={c.insert}
        data-highlighted={selected ? "" : undefined}
        onMouseDown={(e) => e.preventDefault()}
        onMouseEnter={() => model.setHighlight(i)}
        onClick={() => model.choose(c)}
        sx={{
          display: "flex",
          alignItems: "baseline",
          gap: 1.25,
          px: 2,
          py: 0.5,
          cursor: "pointer",
          bgcolor: selected ? "action.selected" : "transparent",
          "&:hover": { bgcolor: selected ? "action.selected" : "action.hover" },
        }}
      >
        {c.number !== undefined && (
          <Box
            component="span"
            sx={{
              display: "inline-grid",
              placeItems: "center",
              minWidth: 18,
              height: 18,
              borderRadius: 0.5,
              border: "1px solid",
              borderColor: "info.main",
              bgcolor: selected ? "info.main" : "transparent",
              color: selected ? "info.contrastText" : "info.main",
              fontFamily: '"Inter", sans-serif',
              fontSize: "0.68rem",
              fontWeight: 700,
            }}
          >
            {c.number}
          </Box>
        )}
        {c.kind === "history" ? (
          <Box
            component="span"
            sx={{ display: "inline-flex", alignItems: "baseline", gap: 1, minWidth: 0, fontFamily: MONO, fontSize: "0.88rem" }}
          >
            {c.pinned && (
              <PushPinIcon
                data-testid="console-option-pinned"
                sx={{ fontSize: 13, color: "primary.main", alignSelf: "center" }}
              />
            )}
            <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {styleTokens(c.insert).map((tok, j) => (
                <Fragment key={j}>
                  {j > 0 && " "}
                  <Token style={tok.style} italic={tok.italic}>
                    {c.insert.slice(tok.from, tok.to)}
                  </Token>
                </Fragment>
              ))}
            </Box>
          </Box>
        ) : c.kind === "word" && c.concept && c.concept.role !== "pronoun" ? (
          <Box
            component="span"
            sx={{
              fontFamily: '"Lora", Georgia, serif',
              fontStyle: "italic",
              fontSize: "0.95rem",
              color: tokenColor(c.color ?? "primary", true),
            }}
          >
            {c.label === c.insert ? <ConceptWord concept={c.concept} /> : c.label}
          </Box>
        ) : (
          <Box
            component="span"
            sx={{
              fontFamily: MONO,
              fontSize: "0.9rem",
              fontWeight: c.kind === "command" ? 500 : 400,
              color: tokenColor(c.color ?? "plain", c.kind === "word"),
              ...(c.kind === "ref" && { textDecoration: "underline dotted", textUnderlineOffset: "3px" }),
            }}
          >
            {c.label}
          </Box>
        )}
        {c.kind === "ref" && c.concept && (
          <Box component="span" sx={{ fontFamily: '"Lora", Georgia, serif', fontStyle: "italic" }}>
            <ConceptWord concept={c.concept} />
          </Box>
        )}
        {(c.detail || c.detailKey) && (
          <Box component="span" sx={{ fontFamily: '"Inter", sans-serif', fontSize: "0.8rem", color: "text.secondary" }}>
            {c.detailKey ? t(c.detailKey) : c.detail}
          </Box>
        )}
        {(c.current || c.alias || c.shortcut) && (
          <Box
            component="span"
            data-testid={c.alias ? "console-option-alias" : c.shortcut ? "console-option-shortcut" : "console-option-current"}
            sx={{ ml: "auto", pl: 2, fontFamily: '"Inter", sans-serif', fontSize: "0.72rem", color: "text.disabled", whiteSpace: "nowrap" }}
          >
            {/* The name matched, which is another name of the command: "alias /plural". A shortcut says
                what it is short for: `/past` = `/tense past`. And a setting what it holds: "now singular". */}
            {c.alias ? (
              `${t("console.alias.singular")} ${c.alias}`
            ) : c.shortcut ? (
              <>
                ={" "}
                <Box component="span" sx={{ fontFamily: MONO, fontSize: "0.78rem" }}>
                  {c.shortcut}
                </Box>
              </>
            ) : (
              `${t("console.now")} ${c.current!.key ? t(c.current!.key as never) : c.current!.value}`
            )}
          </Box>
        )}
      </Box>
    );
    return c.concept && c.kind === "word" ? (
      <Tooltip key={`${c.insert}:${i}`} title={definition(c.concept)} placement="right" enterDelay={400} disableInteractive>
        {content}
      </Tooltip>
    ) : (
      content
    );
  };

  return (
    <Box
      data-testid="console-list"
      sx={{
        position: "absolute",
        bottom: "100%",
        left,
        zIndex: 2,
        minWidth: 300,
        maxWidth: "min(560px, calc(100% - 32px))",
        mb: 0.5,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: 6,
        overflow: "hidden",
      }}
    >
      <Box
        data-testid="console-list-title"
        sx={{
          px: 2,
          pt: 1,
          pb: 0.5,
          fontFamily: '"Inter", sans-serif',
          fontSize: "0.62rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "text.secondary",
        }}
      >
        {title}
      </Box>
      <Box ref={listRef} id={id} role="listbox" sx={{ maxHeight: 260, overflowY: "auto", pb: 0.5 }}>
        {completion.candidates.map((c, i) => {
          // Before anything is typed the commands come topic by topic, each topic headed.
          const heading =
            completion.topics && c.topic && c.topic !== completion.candidates[i - 1]?.topic ? (
              <Box
                key={`topic:${c.topic}`}
                role="presentation"
                data-testid="console-list-topic"
                sx={{
                  px: 2,
                  pt: i === 0 ? 0.25 : 1,
                  pb: 0.25,
                  fontFamily: '"Inter", sans-serif',
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "text.disabled",
                }}
              >
                {c.topicKey ? t(c.topicKey) : c.topic}
              </Box>
            ) : null;
          return (
            <Fragment key={`${c.kind}:${c.insert}:${i}`}>
              {heading}
              {row(c, i)}
            </Fragment>
          );
        })}
      </Box>
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          px: 2,
          py: 0.75,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "action.hover",
          fontFamily: '"Inter", sans-serif',
          fontSize: "0.7rem",
          color: "text.secondary",
        }}
      >
        <Box component="span" sx={{ display: "inline-flex", gap: 0.5, alignItems: "center" }}>
          <Keycap spec="ArrowUp" />
          <Keycap spec="ArrowDown" />
          {t("action.move")}
        </Box>
        <Box component="span" sx={{ display: "inline-flex", gap: 0.5, alignItems: "center" }}>
          <Keycap spec="Tab" />
          {t("action.complete")}
        </Box>
        {/* A digit picks a row as ↵ does: the same act, CHOOSE (the A12 ruling). */}
        {numbered ? (
          <Box component="span" sx={{ display: "inline-flex", gap: 0.5, alignItems: "center" }}>
            <Keycap spec="1" />–<Keycap spec="9" />
            {t("slot.choose")}
          </Box>
        ) : (
          <Box component="span" sx={{ display: "inline-flex", gap: 0.5, alignItems: "center" }}>
            <Keycap spec="Enter" />
            {t("slot.choose")}
          </Box>
        )}
      </Box>
    </Box>
  );
}
