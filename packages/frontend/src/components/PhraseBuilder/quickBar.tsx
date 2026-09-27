import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Box } from "@mui/material";

/**
 * The bar a tapped canvas box raises on a phone (P17): one bar for the page, over the tab bar, however
 * many builders draw boxes — every period, and every ring hosted in one, keeps its own selected box.
 * So the page owns the place (`host`), and the builder whose box was taken last owns what is in it.
 * A builder renders its bar into `host` through a portal while it is `owner`; `host` is null whenever
 * no bar may show (not a phone, or a view other than the canvas).
 */
interface QuickBarSlot {
  host: HTMLElement | null;
  owner: string | null;
  claim: (id: string) => void;
  release: (id: string) => void;
}

const QuickBarContext = createContext<QuickBarSlot>({
  host: null,
  owner: null,
  claim: () => {},
  release: () => {},
});

export const useQuickBar = () => useContext(QuickBarContext);

/** Its height, for the page to leave room under its last line. */
export const QUICK_BAR_HEIGHT = 64;

export function QuickBarProvider({
  enabled,
  bottom,
  children,
}: {
  /** A phone with a finger, on the canvas view. */
  enabled: boolean;
  /** What the bar sits on: the tab bar's height. */
  bottom: number;
  children: ReactNode;
}) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const claim = useCallback((id: string) => setOwner(id), []);
  const release = useCallback((id: string) => setOwner((o) => (o === id ? null : o)), []);
  const value = useMemo(
    () => ({ host: enabled ? host : null, owner, claim, release }),
    [enabled, host, owner, claim, release],
  );
  return (
    <QuickBarContext.Provider value={value}>
      {children}
      {/* Room under the page's last line, which the bar would otherwise sit over. */}
      {enabled && owner !== null && <Box aria-hidden sx={{ height: QUICK_BAR_HEIGHT }} />}
      {enabled && (
        <Box
          ref={setHost}
          data-testid="quick-bar-host"
          sx={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: `calc(${bottom}px + env(safe-area-inset-bottom))`,
            // Over the page, under the sheets it opens.
            zIndex: (theme) => theme.zIndex.drawer + 2,
            // Empty, it must not take the taps meant for the page under it.
            pointerEvents: "none",
            "& > *": { pointerEvents: "auto" },
          }}
        />
      )}
    </QuickBarContext.Provider>
  );
}
