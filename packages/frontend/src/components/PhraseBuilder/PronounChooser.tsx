import { Box, Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import type { ReactNode } from "react";
import { useUiString } from "../../i18n/useUiString.ts";
import {
  pronounGenders,
  type PronounChooser as Chooser,
  type PronounRow,
} from "./hooks/usePronounChooser.ts";

/**
 * The pronoun tab: person, number and gender, one row each, and the button that takes the pronoun
 * they describe. The row the keys act on is lit, so a keyboard user can see what <kbd>←</kbd>
 * <kbd>→</kbd> would change (see usePronounChooser).
 */
export function PronounChooser({
  chooser,
  onCommit,
}: {
  chooser: Chooser;
  onCommit: () => void;
}) {
  const t = useUiString();
  const { choice, set, row, setRow } = chooser;

  return (
    <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
      <ChooserRow label={t("pronoun.person")} name="person" active={row} onFocusRow={setRow}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={choice.person}
          onChange={(_, v) => v && set("person", v)}
        >
          <ToggleButton value="1">{t("pronoun.first")}</ToggleButton>
          <ToggleButton value="2">{t("pronoun.second")}</ToggleButton>
          <ToggleButton value="3">{t("pronoun.third")}</ToggleButton>
          {/* The generic / impersonal "one" — a pronoun of its own, not a 4th person. */}
          <ToggleButton value="generic" data-testid="pronoun-generic">
            {t("pronoun.generic")}
          </ToggleButton>
        </ToggleButtonGroup>
      </ChooserRow>

      {/* The generic ("one") is inherently 3rd-singular, so it offers no number/gender. */}
      {choice.person !== "generic" && (
        <>
          <ChooserRow label={t("pronoun.number")} name="number" active={row} onFocusRow={setRow}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={choice.number}
              onChange={(_, v) => v && set("number", v)}
            >
              <ToggleButton value="singular">{t("pronoun.singular")}</ToggleButton>
              <ToggleButton value="plural">{t("pronoun.plural")}</ToggleButton>
            </ToggleButtonGroup>
          </ChooserRow>

          {/* Gender matters for every person (participle/adjective agreement in Romance);
              neuter ("it") is offered only in the 3rd person. */}
          <ChooserRow label={t("pronoun.gender")} name="gender" active={row} onFocusRow={setRow}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={choice.gender}
              onChange={(_, v) => v && set("gender", v)}
            >
              {pronounGenders(choice.person).map((g) => (
                <ToggleButton key={g} value={g}>
                  {t(`pronoun.${g === "masc" ? "male" : g === "fem" ? "female" : "neuter"}`)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </ChooserRow>
        </>
      )}

      <Button
        size="small"
        variant="contained"
        disableElevation
        onClick={onCommit}
        data-testid="pronoun-commit"
        sx={{ mt: 0.5, textTransform: "none", fontFamily: '"Inter", sans-serif' }}
      >
        {t("action.select")}
      </Button>
    </Box>
  );
}

// A labelled row in the pronoun chooser: caption on the left, control on the right. The row the
// keys are on is washed in the slot colour, so ← → have somewhere visible to act.
function ChooserRow({
  label,
  name,
  active,
  onFocusRow,
  children,
}: {
  label: string;
  name: PronounRow;
  active: PronounRow;
  onFocusRow: (row: PronounRow) => void;
  children: ReactNode;
}) {
  const on = active === name;
  return (
    <Box
      data-testid={`pronoun-row-${name}`}
      data-active={on ? "" : undefined}
      onPointerDown={() => onFocusRow(name)}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        mx: -0.75,
        px: 0.75,
        py: 0.25,
        borderRadius: 1,
        bgcolor: on ? "action.selected" : "transparent",
        "& .MuiToggleButton-root": {
          px: 1,
          py: 0.25,
          textTransform: "none",
          fontFamily: '"Inter", sans-serif',
          fontSize: "0.7rem",
        },
      }}
    >
      <Box
        sx={{ fontFamily: '"Inter", sans-serif', fontSize: "0.7rem", color: "text.secondary" }}
      >
        {label}
      </Box>
      {children}
    </Box>
  );
}
