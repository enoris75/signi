import type { Concept } from "@signi/shared";
import { useState, type KeyboardEvent } from "react";

/**
 * The pronoun chooser's three rows as one grid (the plan's §4.5).
 *
 * A pronoun is not searched for, it is *described* — a person, a number and a gender — so its tab
 * holds three rows of toggles rather than a list. That makes it a grid, and it is driven like one:
 * <kbd>↑</kbd><kbd>↓</kbd> pick the row, <kbd>←</kbd><kbd>→</kbd> its value, <kbd>1</kbd>–<kbd>4</kbd>
 * jump straight to a person, and <kbd>↵</kbd> takes the pronoun described.
 */

export type PronounPerson = "1" | "2" | "3" | "generic";
export type PronounNumber = "singular" | "plural";
export type PronounGender = "masc" | "fem" | "neut";

export interface PronounChoice {
  person: PronounPerson;
  number: PronounNumber;
  gender: PronounGender;
}

export type PronounRow = "person" | "number" | "gender";

/** The digits 1–4, in the order the row shows them. */
export const PRONOUN_PERSONS: readonly PronounPerson[] = ["1", "2", "3", "generic"];
const NUMBERS: readonly PronounNumber[] = ["singular", "plural"];

/**
 * Neuter ("it") is third person only; every other person offers masculine and feminine, which
 * still matter outside English (a participle agrees with them: "tu sei stata").
 */
export const pronounGenders = (person: PronounPerson): readonly PronounGender[] =>
  person === "3" ? ["masc", "fem", "neut"] : ["masc", "fem"];

/** The rows on offer: the generic ("one") is inherently third singular, so it asks nothing more. */
export const pronounRows = (person: PronounPerson): readonly PronounRow[] =>
  person === "generic" ? ["person"] : ["person", "number", "gender"];

/**
 * The pronoun concept a person names. The generic ("one") is a pronoun of its own rather than a
 * fourth person, and it shares person 3 with THIRD_PERSON, so it is matched by id and kept out of
 * the deictic lookup — which is why this is one place both the chooser and the commit read.
 */
// The chooser's rows are the three grammatical persons and the generic "one". A pronoun whose slot
// is not a person's has no row — SOMETHING is 3rd singular and would otherwise take the third
// person's, being the first such concept by id — so `slot` is what keeps it out (see `ConceptSlot`,
// localization C32). A row of its own is the builder work that pronoun is still waiting for.
export const pronounFor = (
  pronouns: readonly Concept[],
  person: PronounPerson,
): Concept | undefined =>
  person === "generic"
    ? pronouns.find((p) => p.id === "GENERIC_PERSON")
    : pronouns.find((p) => p.person === person && p.id !== "GENERIC_PERSON" && !p.slot);

export interface PronounChooser {
  choice: PronounChoice;
  set: <K extends PronounRow>(row: K, value: PronounChoice[K]) => void;
  /** The row the keys act on. */
  row: PronounRow;
  setRow: (row: PronounRow) => void;
  onKeyDown: (event: KeyboardEvent) => void;
}

export function usePronounChooser({
  onCommit,
  // ↑ from the top row leaves the grid for the category tabs, as it leaves a list of words.
  onExitTop,
  onClose,
}: {
  onCommit: (choice: PronounChoice) => void;
  onExitTop: () => void;
  onClose: () => void;
}): PronounChooser {
  const [choice, setChoice] = useState<PronounChoice>({
    person: "1",
    number: "singular",
    gender: "masc",
  });
  const [row, setRow] = useState<PronounRow>("person");

  const set = <K extends PronounRow>(which: K, value: PronounChoice[K]) =>
    setChoice((prev) => {
      const next = { ...prev, [which]: value };
      // Leaving the third person takes its neuter with it; "tu" is never "it".
      if (which === "person" && value !== "3" && prev.gender === "neut") next.gender = "masc";
      return next;
    });

  /** The values the focused row offers, and where in them the current choice sits. */
  function rowValues(): readonly string[] {
    if (row === "person") return PRONOUN_PERSONS;
    if (row === "number") return NUMBERS;
    return pronounGenders(choice.person);
  }

  function stepValue(delta: 1 | -1) {
    const values = rowValues();
    const at = values.indexOf(choice[row]);
    const next = values[Math.min(Math.max(at + delta, 0), values.length - 1)];
    if (next) set(row, next as PronounChoice[typeof row]);
  }

  function stepRow(delta: 1 | -1) {
    const rows = pronounRows(choice.person);
    const at = rows.indexOf(row);
    // Above the first row are the tabs, which is how the noun vocabulary is come back to.
    if (at + delta < 0) {
      onExitTop();
      return;
    }
    const next = rows[Math.min(at + delta, rows.length - 1)];
    if (next) setRow(next);
  }

  function onKeyDown(event: KeyboardEvent) {
    // A digit names a person wherever the cursor is in the grid: the person is the first thing
    // chosen and the one most often changed.
    const person = PRONOUN_PERSONS[Number(event.key) - 1];
    if (person && event.key >= "1" && event.key <= "4") {
      event.preventDefault();
      set("person", person);
      setRow("person");
      return;
    }
    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        stepRow(-1);
        return;
      case "ArrowDown":
        event.preventDefault();
        stepRow(1);
        return;
      case "ArrowLeft":
      case "ArrowRight":
        event.preventDefault();
        stepValue(event.key === "ArrowRight" ? 1 : -1);
        return;
      case "Enter":
        event.preventDefault();
        onCommit(choice);
        return;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        onClose();
    }
  }

  return { choice, set, row, setRow, onKeyDown };
}
