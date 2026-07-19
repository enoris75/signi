import { Box, Typography } from "@mui/material";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import { useUiString } from "../../i18n/useUiString.ts";

/**
 * The infinitive box: what the subject box *becomes* under the infinitive render mode. A citation
 * drops its subject from every surface, so there is no noun to pick there — and, unlike the command
 * box it is modelled on (ImperativeSubjectSelector), a citation addresses nobody, so it carries no
 * person or register either. The box is therefore a plain caption: it holds no choices, only says
 * what the period now is. It replaces the subject node rather than overlaying it (see PhraseCanvas),
 * and the subject's own satellites are withdrawn for the same reason (see buildSatellites).
 */
export function InfinitivePhraseBox() {
  const t = useUiString();
  return (
    <Box
      data-testid="infinitive-box"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        px: 1,
        py: 0.75,
        border: "2px dashed",
        borderColor: "primary.main",
        borderRadius: 2,
        bgcolor: "background.paper",
        boxShadow: 1,
        cursor: "default",
      }}
    >
      <AllInclusiveIcon sx={{ fontSize: 14, color: "primary.main" }} />
      <Typography
        sx={{
          fontSize: "0.58rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "text.secondary",
        }}
      >
        {t("infinitive.phrase")}
      </Typography>
    </Box>
  );
}
