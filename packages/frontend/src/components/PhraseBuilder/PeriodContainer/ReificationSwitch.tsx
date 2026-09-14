import { Box, Tooltip } from "@mui/material";
import { ABSTRACTION_LEVELS, type AbstractionLevel } from "@signi/shared";
import { useUiString } from "../../../i18n/useUiString.ts";

export interface ReificationSwitchProps {
  level: AbstractionLevel;
  onChange: (level: AbstractionLevel) => void;
}

// The reification switch, on the instrument period itself: it decides what this period holds — an
// act in flow, an act named, or the thing it leaves behind — and so what the sentence above does
// with it. Changing it changes the boxes on the period's canvas.
export function ReificationSwitch({ level, onChange }: ReificationSwitchProps) {
  const t = useUiString();
  return (
    <Box sx={{ display: "flex", gap: 0.5, ml: 1.5 }}>
      {ABSTRACTION_LEVELS.map((option) => {
        const active = level === option;
        return (
          <Tooltip key={option} title={t(`instrumental.level.${option}.example`)}>
            <Box
              component="span"
              onClick={() => onChange(option)}
              sx={{
                px: 0.75,
                py: 0.1,
                borderRadius: 1,
                border: "1px solid",
                borderColor: active ? "secondary.main" : "divider",
                bgcolor: active ? "secondary.main" : "background.paper",
                color: active ? "common.white" : "text.secondary",
                cursor: "pointer",
                fontFamily: '"Inter", sans-serif',
                fontSize: "0.55rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {t(`instrumental.level.${option}`)}
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}
