import { Box, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import LinkIcon from "@mui/icons-material/Link";
import type { ImperativeRegister } from "@signi/shared";
import { useUiString } from "../../i18n/useUiString.ts";
import type { ImperativePerson } from "./interfaces.ts";

// The two registers, and the three persons — two questions, asked separately. The register is a
// speech act: an order is addressed to somebody, an instruction to nobody (a button, a menu
// entry, a recipe step), which most languages render outside the imperative altogether (fr
// "courir", de "laufen", ja "実行"). The person is the form the order's verb agrees with. Both
// are named by the engine in the UI language; only the person *buttons* carry the compact
// grammatical codes instead, which are language-neutral and fit the box (their tooltips spell
// them out).
const REGISTERS: ImperativeRegister[] = ["request", "instruction"];
const PERSONS: { value: ImperativePerson; code: string }[] = [
  { value: "2sg", code: "2sg" },
  { value: "1pl", code: "1pl" },
  { value: "2pl", code: "2pl" },
];

const TOGGLE_SX = {
  px: 0.9,
  py: 0.2,
  fontSize: "0.7rem",
  textTransform: "none",
  lineHeight: 1.2,
};

/**
 * The command box: what the subject box *becomes* under an imperative. A command drops its
 * subject from every surface, so there is no noun to pick there — the box holds the two choices
 * a command does carry instead. It replaces the subject box rather than overlaying it (see
 * PhraseCanvas, which renders it as the subject node), and the subject's own satellites are
 * withdrawn for the same reason (see buildSatellites).
 *
 * `inherited` marks the second command of a coordination, which is one speech act with the
 * first: it shows the first clause's choices, read-only — they are made there.
 */
export function ImperativeSubjectSelector({
  person,
  register,
  onPersonChange,
  onRegisterChange,
  inherited = false,
}: {
  person: ImperativePerson;
  register: ImperativeRegister;
  onPersonChange: (person: ImperativePerson) => void;
  onRegisterChange: (register: ImperativeRegister) => void;
  inherited?: boolean;
}) {
  const t = useUiString();
  // An instruction is addressed to nobody, so no verb agrees with anybody: the person row is
  // greyed rather than cleared, keeping the pick for a switch back to an order.
  const personMoot = register === "instruction";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        px: 1,
        py: 0.75,
        border: "2px dashed",
        borderColor: "success.main",
        borderRadius: 2,
        bgcolor: "background.paper",
        boxShadow: 1,
        cursor: "default",
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
          {t("imperative.command")}
        </Typography>
        {/* The second command of a coordination is one speech act with the first: it wears the
            first's choices, locked, and the link icon says where they come from. */}
        {inherited && (
          <Tooltip title={t("imperative.firstCommand")}>
            <LinkIcon sx={{ fontSize: 13, color: "text.disabled" }} />
          </Tooltip>
        )}
      </Box>

      {/* The box is dragged by its frame, like the subject box it replaces — but a pointerdown on
          a toggle must not start that drag: the canvas would capture the pointer and the click
          would never land. So the controls swallow it, and the frame around them still drags. */}
      <Box
        onPointerDown={(e) => e.stopPropagation()}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0.5,
          cursor: "default",
        }}
      >
        <ToggleButtonGroup
          exclusive
          size="small"
          disabled={inherited}
          value={register}
          onChange={(_, v) => {
            if (v) onRegisterChange(v as ImperativeRegister);
          }}
        >
          {REGISTERS.map((r) => (
            <ToggleButton key={r} value={r} sx={TOGGLE_SX}>
              {t(`imperative.register.${r}`)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* A plain row, not a ToggleButtonGroup: the group only styles ToggleButtons that are its
            *direct* children, and each of these is wrapped in the span its tooltip needs. */}
        <Box sx={{ display: "flex", gap: 0.25 }}>
          {PERSONS.map((p) => (
            // The span is what carries the tooltip: a disabled MUI button fires no pointer
            // events, and the person row *is* disabled under an instruction — exactly when a
            // reader most needs to be told what the greyed codes mean.
            <Tooltip key={p.value} title={t(`imperative.person.${p.value}`)}>
              <Box component="span" sx={{ display: "inline-flex" }}>
                <ToggleButton
                  value={p.value}
                  disabled={inherited || personMoot}
                  selected={person === p.value}
                  onClick={() => onPersonChange(p.value)}
                  sx={TOGGLE_SX}
                >
                  {p.code}
                </ToggleButton>
              </Box>
            </Tooltip>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
