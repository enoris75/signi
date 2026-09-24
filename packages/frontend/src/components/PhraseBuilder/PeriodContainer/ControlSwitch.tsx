import { Box, Tooltip } from "@mui/material";
import { useUiString } from "../../../i18n/useUiString.ts";

export interface ControlSwitchProps {
  object: boolean;
  onChange: (object: boolean) => void;
}

// Whose an infinitive period is (P13), on the period beside its caption: the governing clause's
// subject, as a clause's own infinitive is ("wants to run"), or its object — the causee of a causative,
// "to cause a person to see objects", where the person sees. It names the one who acts, the AGENT,
// and says which of the two it is with their slots' names.
export function ControlSwitch({ object, onChange }: ControlSwitchProps) {
  const t = useUiString();
  return (
    <Tooltip title={t("slot.agent")}>
      <Box
        component="span"
        data-testid="infinitive-control"
        role="switch"
        aria-checked={object}
        onClick={() => onChange(!object)}
        sx={{
          ml: 1,
          px: 0.75,
          py: 0.1,
          borderRadius: 1,
          border: "1px solid",
          borderColor: object ? "error.main" : "divider",
          bgcolor: object ? "error.main" : "background.paper",
          color: object ? "common.white" : "text.secondary",
          cursor: "pointer",
          fontFamily: '"Inter", sans-serif',
          fontSize: "0.55rem",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {t(object ? "slot.directObject" : "slot.subject")}
      </Box>
    </Tooltip>
  );
}
