import { Box, ButtonBase } from "@mui/material";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import TranslateIcon from "@mui/icons-material/Translate";
import TerminalIcon from "@mui/icons-material/Terminal";
import type { UiStringKey } from "@signi/shared";
import { useUiString } from "../i18n/useUiString.ts";

/** The views a phone shows one at a time (P17). */
export type MobileView = "canvas" | "translations" | "console";

const TABS: { view: MobileView; label: UiStringKey; icon: React.ReactNode }[] = [
  { view: "canvas", label: "view.canvas", icon: <HubOutlinedIcon /> },
  { view: "translations", label: "translations.heading", icon: <TranslateIcon /> },
  { view: "console", label: "console.name", icon: <TerminalIcon /> },
];

/** How tall the bar is, above the home indicator: what the page keeps free at its foot. */
export const TAB_BAR_HEIGHT = 64;

/**
 * The phone's tab bar (P17): one workspace, several views of it, one at a time. Every view reads and
 * writes the same history, so what one does the others show, and undo takes it back from any of them.
 */
export function MobileTabBar({ view, onChange }: { view: MobileView; onChange: (view: MobileView) => void }) {
  const t = useUiString();
  return (
    <Box
      component="nav"
      data-testid="tab-bar"
      sx={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: (theme) => theme.zIndex.drawer + 3,
        display: "grid",
        gridTemplateColumns: `repeat(${TABS.length}, minmax(0, 1fr))`,
        gap: 0.5,
        px: 1,
        pt: 0.75,
        pb: "calc(6px + env(safe-area-inset-bottom))",
        minHeight: TAB_BAR_HEIGHT,
        boxSizing: "border-box",
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      {TABS.map((tab) => {
        const current = tab.view === view;
        return (
          <ButtonBase
            key={tab.view}
            data-testid={`tab-${tab.view}`}
            aria-current={current ? "page" : undefined}
            onClick={() => onChange(tab.view)}
            sx={{
              minHeight: 52,
              display: "flex",
              flexDirection: "column",
              gap: 0.4,
              borderRadius: 2,
              fontFamily: '"Inter", sans-serif',
              fontSize: "0.7rem",
              fontWeight: current ? 600 : 500,
              color: current ? "primary.main" : "text.secondary",
            }}
          >
            <Box
              component="span"
              sx={{
                width: 56,
                height: 28,
                borderRadius: 14,
                display: "grid",
                placeItems: "center",
                bgcolor: current ? "rgba(44, 74, 110, 0.12)" : "transparent",
                "& svg": { fontSize: 20 },
              }}
            >
              {tab.icon}
            </Box>
            {t(tab.label)}
          </ButtonBase>
        );
      })}
    </Box>
  );
}
