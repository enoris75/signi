import { Box } from "@mui/material";
import { keycapLabels } from "./matchKey.ts";
import { useKeyPlatform } from "./KeyboardProvider.tsx";

/**
 * A key drawn as a key: a small paper cap, the way the shortcuts sheet, the hint line and a menu's
 * rows name a binding. Its caps come from the spec, so a chord reads <kbd>⌘</kbd><kbd>S</kbd> on a
 * Mac and <kbd>Ctrl</kbd><kbd>S</kbd> elsewhere without either being written down twice.
 *
 * Hidden from the accessibility tree: a cap beside a menu row would otherwise be read as part of
 * the row's name ("1 Definite the"), and a shortcut belongs in `aria-keyshortcuts`, which is where
 * assistive tech looks for one.
 */
export function Keycap({ spec, dim = false }: { spec: string; dim?: boolean }) {
  const platform = useKeyPlatform();
  return (
    <Box
      component="span"
      aria-hidden
      sx={{ display: "inline-flex", gap: 0.25, verticalAlign: "middle" }}
    >
      {keycapLabels(spec, platform).map((cap, i) => (
        <Box
          key={`${cap}-${i}`}
          component="kbd"
          sx={{
            display: "inline-grid",
            placeItems: "center",
            minWidth: 16,
            height: 16,
            px: 0.4,
            borderRadius: 0.75,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: "0 1px 0 rgba(0,0,0,0.08)",
            fontFamily: '"Inter", sans-serif',
            fontSize: "0.6rem",
            fontWeight: 700,
            lineHeight: 1,
            color: dim ? "text.disabled" : "text.secondary",
          }}
        >
          {cap}
        </Box>
      ))}
    </Box>
  );
}
