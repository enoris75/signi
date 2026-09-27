import type { ReactNode } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import DoNotDisturbAltIcon from "@mui/icons-material/DoNotDisturbAlt";
import ViewAgendaOutlinedIcon from "@mui/icons-material/ViewAgendaOutlined";
import LinkIcon from "@mui/icons-material/Link";
import { ABSTRACTION_LEVELS, type AbstractionLevel } from "@signi/shared";
import { useUiString } from "../../i18n/useUiString.ts";
import type { Pt } from "./ringLayout.ts";
import type { RingHost } from "./ringHost.ts";
import { toolbarControlKey } from "./ringSpecs.ts";

/** The controls an instrument drawn inside its clause wears at twelve on its first ring (P12). */
export const INSTRUMENT_TOOLBAR = [...ABSTRACTION_LEVELS, "without", "asPeriod", "pick"] as const;
export type InstrumentToolbarValue = (typeof INSTRUMENT_TOOLBAR)[number];
export const INSTRUMENT_TOOLBAR_TYPE = "instrument";

const ICONS: Record<InstrumentToolbarValue, ReactNode> = {
  process: <DirectionsRunIcon sx={{ fontSize: 14 }} />,
  concept: <LightbulbOutlinedIcon sx={{ fontSize: 14 }} />,
  object: <CategoryOutlinedIcon sx={{ fontSize: 14 }} />,
  without: <DoNotDisturbAltIcon sx={{ fontSize: 14 }} />,
  asPeriod: <ViewAgendaOutlinedIcon sx={{ fontSize: 14 }} />,
  pick: <LinkIcon sx={{ fontSize: 14 }} />,
};

/**
 * What the reification switch and the privative are on an instrument's card, seated on the instrument's
 * ring when it is drawn inside its clause (P12, D3): the link's level, as a relation toolbar's values —
 * the level is the link's, so it sits with what it changes — then its polarity, and the two ways out
 * of the clause: drawn as a card of its own, or a period of the workspace picked in its place.
 */
export function InstrumentToolbar({
  instrument,
  controlPos,
}: {
  instrument: NonNullable<RingHost["instrument"]>;
  controlPos: Readonly<Record<string, Pt>>;
}) {
  const t = useUiString();
  const title = (v: InstrumentToolbarValue): string => {
    if (v === "without") return `${t("satellite.polarity")}: ${t(`polarity.value.${instrument.negative ? "negative" : "positive"}`)}`;
    if (v === "asPeriod") return t("action.showAsPeriod");
    if (v === "pick") return t("pick.instrumental");
    return `${t(`instrumental.level.${v}`)}: ${t(`instrumental.level.${v}.example`)}`;
  };
  const selected = (v: InstrumentToolbarValue) =>
    v === "without" ? instrument.negative : v === instrument.level;
  const onClick = (v: InstrumentToolbarValue) => {
    if (v === "without") instrument.onNegativeChange(!instrument.negative);
    else if (v === "asPeriod") instrument.onShowAsPeriod();
    else if (v === "pick") instrument.onPickPeriod();
    else instrument.onLevelChange(v as AbstractionLevel);
  };
  return (
    <Box data-testid="instrument-toolbar" sx={{ display: "contents" }}>
      {INSTRUMENT_TOOLBAR.map((v) => {
        const at = controlPos[toolbarControlKey(INSTRUMENT_TOOLBAR_TYPE, v)];
        if (!at) return null;
        const on = selected(v);
        return (
          <Box
            key={v}
            sx={{ position: "absolute", left: at.x, top: at.y, transform: "translate(-50%, -50%)", display: "flex", zIndex: 3 }}
          >
            <Tooltip title={title(v)}>
              <IconButton
                size="small"
                data-testid={`instrument-${v}`}
                aria-label={title(v)}
                aria-pressed={v === "asPeriod" || v === "pick" ? undefined : on}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onClick(v)}
                sx={{
                  width: 20,
                  height: 20,
                  p: 0,
                  borderRadius: 1,
                  bgcolor: on ? "secondary.main" : "background.paper",
                  border: "1px solid",
                  borderColor: on ? "secondary.main" : "divider",
                  color: on ? "common.white" : "text.secondary",
                  "&:hover": { bgcolor: on ? "secondary.dark" : "action.hover", color: on ? "common.white" : "secondary.main" },
                }}
              >
                {ICONS[v]}
              </IconButton>
            </Tooltip>
          </Box>
        );
      })}
    </Box>
  );
}
