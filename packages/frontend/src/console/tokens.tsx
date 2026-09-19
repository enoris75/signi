import { Box, type SxProps, type Theme } from "@mui/material";
import type { ReactNode } from "react";
import type { TokenColor } from "./language/commands.ts";
import type { TokenStyle } from "./language/parse.ts";

/**
 * How the console writes: IBM Plex Mono, each token in the colour of the box it fills (P02 §2.3) —
 * the colour slightly deepened for a word, which sits in italic as it does in its box — the quiet ink
 * for a setting, and a dotted underline for a reference.
 */

export const MONO = '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

/** The ink a token is drawn in. */
export function tokenColor(style: TokenStyle | TokenColor, word = false): (theme: Theme) => string {
  return (theme) => {
    switch (style) {
      case "setting":
        return theme.palette.text.secondary;
      case "plain":
      case "unknown":
        return theme.palette.text.primary;
      case "ref":
        return theme.palette.info.main;
      default: {
        const palette = theme.palette[style];
        // A word is the box's own word colour (`dark`), a command its main colour.
        return word ? palette.dark : palette.main;
      }
    }
  };
}

export function Token({
  style,
  italic,
  word,
  wrong,
  children,
  sx,
  ...rest
}: {
  style: TokenStyle | TokenColor;
  italic?: boolean;
  word?: boolean;
  /** Where the line's mistake is: underlined wavy, in the ink of a mistake. */
  wrong?: boolean;
  children: ReactNode;
  sx?: SxProps<Theme>;
} & Record<string, unknown>) {
  return (
    <Box
      component="span"
      {...rest}
      sx={[
        {
          color: tokenColor(style, word ?? italic),
          fontStyle: italic ? "italic" : "normal",
          fontWeight: style === "setting" || style === "plain" ? 400 : 500,
          ...(style === "ref" && { textDecoration: "underline dotted", textUnderlineOffset: "3px" }),
          ...(wrong && {
            textDecoration: "underline wavy",
            textDecorationColor: (theme: Theme) => theme.palette.error.main,
            textUnderlineOffset: "4px",
          }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}
