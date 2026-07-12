import { Box, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import type { ImperativeAddress } from "./interfaces.ts";

// Who an imperative is addressed to. The subject is dropped from every rendered sentence, so the
// three persons only pick the person/number the command's verb form agrees with — familiar
// 2nd-singular ("run!"), the 1st-plural cohortative ("let's run!"), and 2nd-plural ("run!", plural).
// "Nobody" is not a person but the instruction register: a command with no addressee, which most
// languages render outside the imperative altogether (fr "courir", de "laufen", ja "実行").
const OPTIONS: { value: ImperativeAddress; label: string; hint: string }[] = [
  { value: "2sg", label: "You", hint: "2nd person singular — “run!”" },
  { value: "1pl", label: "Let’s", hint: "1st person plural — “let’s run!”" },
  { value: "2pl", label: "You all", hint: "2nd person plural — “run!” (plural)" },
  { value: "none", label: "Nobody", hint: "Instruction — a button, a menu entry, a recipe step: “run” / fr “courir”" },
];

// The subject box, under an imperative, is replaced by this addressee selector: the command has
// no overt subject, so instead of a noun/pronoun the box picks who is being addressed. Rendered
// greyed to signal it is not an ordinary subject. When `rect` is given it overlays that box on
// the canvas; otherwise it lays out inline (the empty-period placeholder).
export function ImperativeSubjectSelector({
  value,
  onChange,
  rect,
}: {
  value: ImperativeAddress;
  onChange: (address: ImperativeAddress) => void;
  rect?: { x: number; y: number; width: number; height: number };
}) {
  const body = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        px: 1,
        py: 0.75,
        border: "1px dashed",
        borderColor: "success.main",
        borderRadius: "6px",
        // Solid so it cleanly occludes the greyed-out subject box it overlays; the greying
        // signal ("not a real subject") is carried by that dimmed box behind, not this control.
        bgcolor: "background.paper",
        boxShadow: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <CampaignIcon sx={{ fontSize: 14, color: "success.main" }} />
        <Typography
          sx={{
            fontSize: "0.58rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "text.secondary",
          }}
        >
          Address
        </Typography>
      </Box>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={value}
        onChange={(_, v) => {
          if (v) onChange(v as ImperativeAddress);
        }}
      >
        {OPTIONS.map((o) => (
          <Tooltip key={o.value} title={o.hint}>
            <ToggleButton
              value={o.value}
              sx={{ px: 0.9, py: 0.2, fontSize: "0.7rem", textTransform: "none", lineHeight: 1.2 }}
            >
              {o.label}
            </ToggleButton>
          </Tooltip>
        ))}
      </ToggleButtonGroup>
    </Box>
  );

  if (!rect) return body;

  // Overlay the selector centered on the subject box's footprint on the canvas.
  return (
    <Box
      sx={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        minWidth: rect.width,
        minHeight: rect.height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 4,
      }}
    >
      {body}
    </Box>
  );
}
