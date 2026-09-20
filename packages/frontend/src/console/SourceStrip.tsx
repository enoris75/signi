import { Box } from "@mui/material";
import { useMemo } from "react";
import { printPeriod } from "./language/print.ts";
import { wordMark } from "./ConsoleMarks.tsx";
import { MONO, Token } from "./tokens.tsx";
import type { PhraseConsoleModel } from "./usePhraseConsole.ts";

/**
 * The source strip: the canonical text of the period the context is in, on the canvas's colour
 * (P02 §2.2). The token of the box the cursor is on is washed; pointing at a token lights its box,
 * and pointing at a box lights its tokens; clicking a token moves the cursor there. A click anywhere
 * else on the strip — or `/edit` — loads the whole source into the prompt, where ↵ replaces the
 * period with it.
 */
export function SourceStrip({ model }: { model: PhraseConsoleModel }) {
  const { committed, context, vocab, hoveredBox } = model;
  const printed = useMemo(() => printPeriod(committed, context.containerId, vocab), [committed, context.containerId, vocab]);
  const number = committed.containers.findIndex((c) => c.id === context.containerId) + 1;
  const cursorMark = context.word ? wordMark(context.word) : undefined;
  const hoveredMark = hoveredBox ? wordMark(hoveredBox) : undefined;

  return (
    <Box
      data-testid="source-strip"
      onClick={() => model.edit()}
      sx={{
        display: "flex",
        alignItems: "baseline",
        gap: 1.5,
        px: 2,
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
      <Box component="span" sx={{ color: "text.disabled", minWidth: "1.5ch", textAlign: "right", flexShrink: 0 }}>
        {number}
      </Box>
      <Box
        component="span"
        sx={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
      >
        {printed.tokens.length === 0 ? (
          // English literal, for /localize.
          <Box component="span" sx={{ color: "text.disabled" }}>
            empty period
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
      <Box
        component="span"
        sx={{ flexShrink: 0, fontFamily: '"Inter", sans-serif', fontSize: "0.72rem", color: "text.secondary" }}
      >
        {/* English literal, for /localize. */}
        <Box component="span" sx={{ fontFamily: MONO, fontSize: "0.85rem" }}>
          /edit
        </Box>{" "}
        or click to edit
      </Box>
    </Box>
  );
}
