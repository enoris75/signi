import { Box } from "@mui/material";
import { useEffect, useMemo, useRef } from "react";
import { useUiString } from "../i18n/useUiString.ts";
import { printPeriod, type PrintedPeriod } from "./language/print.ts";
import { wordMark } from "./ConsoleMarks.tsx";
import { MONO, Token } from "./tokens.tsx";
import type { PhraseConsoleModel } from "./usePhraseConsole.ts";

/**
 * The source strip: the canonical text of the workspace, a numbered line per period, on the canvas's
 * colour (P02 §2.2). The period the context is in has its number in ink, and the strip scrolls to it
 * once there are more periods than it has room for. The token of the box the cursor is on is washed;
 * pointing at a token lights its box, and pointing at a box lights its tokens; clicking a token moves
 * the cursor there. A click anywhere else on a line loads that period's source into the prompt — as
 * `/edit` does the focused one's — where ↵ replaces the period with it.
 */
export function SourceStrip({ model }: { model: PhraseConsoleModel }) {
  const { committed, context, vocab } = model;
  const printed = useMemo(
    () => committed.containers.map((c) => ({ id: c.id, period: printPeriod(committed, c.id, vocab) })),
    [committed, vocab],
  );
  const strip = useRef<HTMLElement | null>(null);
  useEffect(() => {
    // Optional: jsdom has no scrolling.
    strip.current?.querySelector<HTMLElement>("[data-current]")?.scrollIntoView?.({ block: "nearest" });
  }, [context.containerId, printed.length]);

  return (
    <Box
      ref={strip}
      data-testid="source-strip"
      onClick={() => model.edit()}
      sx={{
        flexShrink: 0,
        maxHeight: "40%",
        overflowY: "auto",
        py: 0.75,
        borderTop: "1px solid",
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "action.hover",
        fontFamily: MONO,
        fontSize: "0.92rem",
        cursor: "text",
      }}
    >
      {printed.map(({ id, period }, i) => {
        const focused = id === context.containerId;
        return (
          <SourceLine
            key={id}
            model={model}
            number={i + 1}
            printed={period}
            focused={focused}
            onEdit={() => model.edit(id)}
          />
        );
      })}
    </Box>
  );
}

function SourceLine({
  model,
  number,
  printed,
  focused,
  onEdit,
}: {
  model: PhraseConsoleModel;
  number: number;
  printed: PrintedPeriod;
  focused: boolean;
  onEdit: () => void;
}) {
  const t = useUiString();
  const { context, hoveredBox } = model;
  const cursorMark = context.word ? wordMark(context.word) : undefined;
  const hoveredMark = hoveredBox ? wordMark(hoveredBox) : undefined;

  return (
    <Box
      data-testid="source-line"
      data-period={number}
      data-current={focused ? "" : undefined}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit();
      }}
      sx={{ display: "flex", alignItems: "baseline", gap: 1.5, px: 2 }}
    >
      <Box
        component="span"
        sx={{ color: focused ? "text.primary" : "text.disabled", minWidth: "1.5ch", textAlign: "right", flexShrink: 0 }}
      >
        {number}
      </Box>
      <Box
        component="span"
        sx={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
      >
        {printed.tokens.length === 0 ? (
          <Box component="span" sx={{ color: "text.disabled" }}>
            {t("period.empty")}
          </Box>
        ) : (
          printed.tokens.map((tok, i) => {
            const mark = tok.word ? wordMark(tok.word) : undefined;
            const on = mark !== undefined && (mark === cursorMark || mark === hoveredMark);
            return (
              <Box component="span" key={i}>
                {i > 0 && " "}
                <Token
                  style={tok.color}
                  italic={tok.italic}
                  data-testid="source-token"
                  data-mark={mark}
                  // Washed because the cursor is on this word or its box is under the pointer —
                  // a background colour alone, which nothing can read back.
                  data-lit={on ? "" : undefined}
                  onMouseEnter={() => tok.word && model.setHoveredToken(tok.word)}
                  onMouseLeave={() => model.setHoveredToken(null)}
                  onClick={(e: React.MouseEvent) => {
                    if (!tok.word) return;
                    // A token is a way to the box it belongs to, not a way into the prompt.
                    e.stopPropagation();
                    model.setContext({ containerId: tok.word.containerId, word: tok.word });
                    model.focusPrompt();
                  }}
                  sx={{
                    cursor: tok.word ? "pointer" : "text",
                    borderRadius: 0.5,
                    px: 0.25,
                    mx: -0.25,
                    bgcolor: on ? "action.selected" : "transparent",
                  }}
                >
                  {tok.text}
                </Token>
              </Box>
            );
          })
        )}
      </Box>
      {focused && (
        <Box
          component="span"
          sx={{ flexShrink: 0, fontFamily: '"Inter", sans-serif', fontSize: "0.72rem", color: "text.secondary" }}
        >
          {/* The command is a value, not a word: it stays as written, a middle dot before the hint. */}
          <Box component="span" sx={{ fontFamily: MONO, fontSize: "0.85rem" }}>
            /edit
          </Box>{" · "}
          {t("hint.clickToEdit")}
        </Box>
      )}
    </Box>
  );
}
