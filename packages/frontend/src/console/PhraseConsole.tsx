import { Box, IconButton, Tooltip } from "@mui/material";
import TerminalIcon from "@mui/icons-material/Terminal";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useEffect, useState } from "react";
import { useWindowDrag } from "../hooks/useWindowDrag.ts";
import { useUiString } from "../i18n/useUiString.ts";
import { Keycap } from "../keyboard/Keycap.tsx";
import { ConsolePrompt } from "./ConsolePrompt.tsx";
import { SourceStrip } from "./SourceStrip.tsx";
import { Transcript } from "./Transcript.tsx";
import type { PhraseConsoleModel } from "./usePhraseConsole.ts";

/**
 * The phrase console, docked under the page (P02 §2): a title row, the transcript, the focused
 * period's source, and the prompt. It follows the page's own paper — not a dark terminal — and
 * stops at the words panel while that is open. The grip resizes it; ` shows and hides it.
 */
export function PhraseConsole({ model, wordsPanelOpen }: { model: PhraseConsoleModel; wordsPanelOpen: boolean }) {
  const t = useUiString();
  const startDrag = useWindowDrag();
  const right = useWordsPanelWidth(wordsPanelOpen);
  if (!model.open) return null;
  const number = model.committed.containers.findIndex((c) => c.id === model.context.containerId) + 1;

  return (
    <Box
      data-kb-region="console"
      data-testid="phrase-console"
      sx={{
        position: "fixed",
        left: 0,
        right,
        bottom: 0,
        height: model.height,
        zIndex: (theme) => theme.zIndex.drawer + 2,
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
        boxShadow: "0 -4px 16px rgba(26, 25, 23, 0.06)",
      }}
    >
      {/* The grip: drag to resize, ↑ ↓ from the keyboard. */}
      <Box
        role="separator"
        aria-orientation="horizontal"
        aria-label={t("action.resizeConsole")}
        aria-valuenow={model.height}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
          e.preventDefault();
          model.setHeight(model.height + (e.key === "ArrowUp" ? 16 : -16), true);
        }}
        onPointerDown={(e) => {
          e.preventDefault();
          const startY = e.clientY;
          const startH = model.height;
          let h = startH;
          startDrag(
            (ev) => {
              h = Math.min(window.innerHeight - 120, startH + (startY - ev.clientY));
              model.setHeight(h);
            },
            () => model.setHeight(h, true),
          );
        }}
        sx={{
          height: 10,
          flexShrink: 0,
          cursor: "ns-resize",
          touchAction: "none",
          display: "grid",
          placeItems: "center",
          "&::after": { content: '""', width: 48, height: 3, borderRadius: 2, bgcolor: "divider" },
          "&:hover::after, &:focus-visible::after": { bgcolor: "primary.main" },
          "&:focus": { outline: "none" },
        }}
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          pb: 0.75,
          borderBottom: "1px solid",
          borderColor: "divider",
          fontFamily: '"Inter", sans-serif',
          fontSize: "0.72rem",
          color: "text.secondary",
        }}
      >
        <TerminalIcon sx={{ fontSize: 17 }} />
        <Box component="span" sx={{ fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "text.primary" }}>
          {t("console.name")}
        </Box>
        {/* The period by its name, as rendered: German capitalizes it (Satzgefüge 1), so no CSS lowers it. */}
        <Box
          component="span"
          data-testid="console-period"
          sx={{ fontFamily: '"Lora", Georgia, serif', fontStyle: "italic", fontSize: "0.85rem" }}
        >
          {t("period.name")} {number}
        </Box>
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
            <Keycap spec="Code:Backquote" />
            {t("action.hide")}
          </Box>
          <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
            <Keycap spec="Escape" />
            {t("action.returnToCanvas")}
          </Box>
          <Tooltip title={t("action.hideConsole")}>
            <IconButton size="small" aria-label={t("action.hideConsole")} onClick={() => model.setOpen(false)}>
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Transcript entries={model.transcript} pins={model.pins} onPin={model.pin} vocab={model.vocab} />
      <SourceStrip model={model} />
      <ConsolePrompt model={model} />
    </Box>
  );
}

/**
 * How far in from the right the console stops: the words panel's width while it is open — the panel
 * is a drawer fixed to the right edge, and the console must not slide under it.
 */
function useWordsPanelWidth(open: boolean): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!open) {
      setWidth(0);
      return;
    }
    const panel = document.querySelector<HTMLElement>('[data-kb-region="words"]');
    if (!panel) return;
    const measure = () => setWidth(Math.round(panel.getBoundingClientRect().width));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [open]);
  return width;
}
