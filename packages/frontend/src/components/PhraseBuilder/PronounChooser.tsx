import { Box, Button, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import type { Concept } from "@signi/shared";
import type { ReactNode } from "react";
import { useConceptDefinition } from "../../i18n/useConceptLabel.ts";
import { useUiString } from "../../i18n/useUiString.ts";
import {
  PRONOUN_PERSONS,
  pronounFor,
  pronounGenders,
  type PronounChooser as Chooser,
  type PronounPerson,
  type PronounRow,
} from "./hooks/usePronounChooser.ts";

/**
 * The pronoun tab: person, number and gender, one row each, and the button that takes the pronoun
 * they describe. The row the keys act on is lit, so a keyboard user can see what <kbd>←</kbd>
 * <kbd>→</kbd> would change (see usePronounChooser).
 */
export function PronounChooser({
  chooser,
  pronouns,
  onCommit,
  persons = PRONOUN_PERSONS,
}: {
  chooser: Chooser;
  // The pronoun vocabulary, so the person row can name the concept each option stands for and
  // show its definition on hover — the tooltip the noun list gets from ConceptOption.
  pronouns: readonly Concept[];
  onCommit: () => void;
  // The persons the box takes (P11-E8's vocative: the 2nd alone); the others are shown, greyed, as the
  // imperative's selector greys its persons under an instruction.
  persons?: readonly PronounPerson[];
}) {
  const t = useUiString();
  const { choice, set, row, setRow } = chooser;
  const off = (person: PronounPerson) => !persons.includes(person);

  return (
    <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
      <ChooserRow label={t("pronoun.person")} name="person" active={row} onFocusRow={setRow}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={choice.person}
          onChange={(_, v) => v && !off(v) && set("person", v)}
        >
          <PersonToggle person="1" pronouns={pronouns} label={t("pronoun.first")} disabled={off("1")} />
          <PersonToggle person="2" pronouns={pronouns} label={t("pronoun.second")} disabled={off("2")} />
          <PersonToggle person="3" pronouns={pronouns} label={t("pronoun.third")} disabled={off("3")} />
          {/* The generic / impersonal "one" — a pronoun of its own, not a 4th person. */}
          <PersonToggle
            person="generic"
            pronouns={pronouns}
            label={t("pronoun.generic")}
            testId="pronoun-generic"
            disabled={off("generic")}
          />
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

/**
 * One person in the top row, and the pronoun's definition surface.
 *
 * A pronoun is described rather than searched for, so it never passes through a picker list and
 * never through [ConceptOption](./ConceptOption.tsx) — which is where every other word gets its
 * hover definition. The option that names the person is where it belongs here: it carries the
 * concept's `data-concept` and the same tooltip, so "the first person" reads the way "a small
 * mammal" does in the noun list, in the UI language.
 *
 * ToggleButtonGroup passes `value`/`selected` down by context rather than by cloning its children,
 * so a Tooltip may sit between the group and its button without breaking the toggle.
 */
function PersonToggle({
  person,
  pronouns,
  label,
  testId,
  disabled = false,
}: {
  person: PronounPerson;
  pronouns: readonly Concept[];
  label: string;
  testId?: string;
  // Shown but not offered (P11-E9's owner, P11-E8's vocative): greyed and marked `aria-disabled`
  // rather than `disabled`, so the definition tooltip still answers the pointer — a disabled button
  // receives no events.
  disabled?: boolean;
}) {
  const definition = useConceptDefinition();
  const concept = pronounFor(pronouns, person);
  return (
    // An empty title renders no tooltip — which is what a person whose pronoun has not loaded yet
    // (or is missing from the corpus) should show. `describeChild` keeps the button's accessible
    // name the ordinal it reads ("second"), with the definition as its description; without it MUI
    // would hang the definition on the button as an aria-label and rename the option.
    <Tooltip
      title={concept ? definition(concept) : ""}
      describeChild
      placement="right"
      enterDelay={400}
      disableInteractive
    >
      <ToggleButton
        value={person}
        data-concept={concept?.id}
        data-testid={testId}
        aria-disabled={disabled || undefined}
        sx={disabled ? { color: "text.disabled", cursor: "default" } : undefined}
      >
        {label}
      </ToggleButton>
    </Tooltip>
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
