import { Box, Tooltip } from "@mui/material";
import { useUiString } from "../../../i18n/useUiString.ts";

export interface PrivativeSwitchProps {
  negative: boolean;
  onChange: (negative: boolean) => void;
}

// The instrument's polarity, on the instrument period beside its reification switch: positive is the
// plain means ("with the knife"), negative the privative ("without the knife", P09-E2). It is the
// instrument's own negation, as the cause box's polarity is the cause's, and never the clause's — so
// it says the verb's two words, `polarity.value.*`, under the satellite's own name.
export function PrivativeSwitch({ negative, onChange }: PrivativeSwitchProps) {
  const t = useUiString();
  return (
    <Tooltip title={t("satellite.polarity")}>
      <Box
        component="span"
        data-testid="instrument-polarity"
        role="switch"
        aria-checked={negative}
        onClick={() => onChange(!negative)}
        sx={{
          ml: 1,
          px: 0.75,
          py: 0.1,
          borderRadius: 1,
          border: "1px solid",
          borderColor: negative ? "secondary.main" : "divider",
          bgcolor: negative ? "secondary.main" : "background.paper",
          color: negative ? "common.white" : "text.secondary",
          cursor: "pointer",
          fontFamily: '"Inter", sans-serif',
          fontSize: "0.55rem",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {t(`polarity.value.${negative ? "negative" : "positive"}`)}
      </Box>
    </Tooltip>
  );
}
