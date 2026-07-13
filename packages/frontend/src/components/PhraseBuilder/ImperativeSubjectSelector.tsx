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
// rows are named by the engine in the UI language, buttons and tooltips alike: the button says
// the person short (it "seconda singolare"), the tooltip says it whole ("seconda persona
// singolare").
const REGISTERS: ImperativeRegister[] = ["request", "instruction"];
const PERSONS: ImperativePerson[] = ["2sg", "1pl", "2pl"];

const TOGGLE_SX = {
  px: 0.9,
  py: 0.2,
  fontSize: "0.7rem",
  textTransform: "none",
  lineHeight: 1.2,
};

// The persons are stacked, not laid side by side: their labels are two words each in every
// language ("seconda singolare"), and three of those in a row make a box three times wider than
// the node it stands in. A column is as wide as its longest label, and the box keeps the width of
// the register row above.
const PERSON_TOGGLE_SX = { ...TOGGLE_SX, py: 0.1, width: "100%", justifyContent: "center" };

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
  // An instruction is addressed to nobody, so no verb agrees with anybody and there is no
  // question to ask: the person row goes altogether rather than lingering greyed with a pick
  // still lit on it. The pick itself stays in the selection, and comes back with the order.
  const personAsked = register !== "instruction";

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

        {/* A plain column, not a ToggleButtonGroup: the group only styles ToggleButtons that are
            its *direct* children, and each of these is wrapped in the span its tooltip needs. */}
        {personAsked && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignSelf: "stretch",
              gap: 0.25,
            }}
          >
            {PERSONS.map((p) => (
              // The span is what carries the tooltip: a disabled MUI button fires no pointer
              // events, and an inherited row is disabled — exactly when a reader most needs to be
              // told what the locked person is.
              <Tooltip key={p} title={t(`imperative.person.${p}`)}>
                <Box component="span" sx={{ display: "flex" }}>
                  <ToggleButton
                    value={p}
                    disabled={inherited}
                    selected={person === p}
                    onClick={() => onPersonChange(p)}
                    sx={PERSON_TOGGLE_SX}
                  >
                    {t(`imperative.personShort.${p}`)}
                  </ToggleButton>
                </Box>
              </Tooltip>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
