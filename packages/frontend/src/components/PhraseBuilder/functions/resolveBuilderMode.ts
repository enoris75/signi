import type { NounAddress, PhraseSelection, WorkspaceBinding } from "../interfaces.ts";

/**
 * What a builder shows, from what it edits and where it sits: a period of its own, a period that is
 * another clause's instrument, or a hosted ring's noun phrase.
 */
export function resolveBuilderMode({
  selection,
  binding,
  possessorPath,
  nounPhraseOnly,
  hosted,
}: {
  selection: PhraseSelection;
  binding: WorkspaceBinding | undefined;
  // Set for a conjunct's or an owner's builder: the address of its head in the period.
  possessorPath: NounAddress | undefined;
  nounPhraseOnly: boolean;
  // Set for a hosted ring's builder, whose ring is drawn on the period's canvas.
  hosted: boolean;
}): {
  nested: boolean;
  nounPhraseMode: boolean;
  actionMode: boolean;
  showCanvas: boolean;
  hasContent: boolean;
} {
  // A conjunct's or an owner's builder: a noun phrase inside a period, not a period of its own. It
  // takes no part in the period's moods, connectors or instrument, though `binding` is the
  // container's own.
  const nested = Boolean(possessorPath);
  // This period is the instrument of another clause, and its reification degree decides what it
  // holds — so the canvas shows exactly the boxes the sentence will read (see AbstractionLevel):
  //  · object            → a bare noun phrase ("with a word"): the subject box alone, no predicate.
  //  · process / concept → an act ("by choosing a word"): a verb and its direct object, and *no*
  //                        subject — the clause above is the one doing it.
  const isInstrument = !nested && Boolean(binding?.instrumental.hasTarget);
  const instrumentLevel = binding?.instrumental.level ?? "object";
  // A conjunct's or an owner's ring is the other bare noun phrase (see `nounPhraseOnly`).
  const nounPhraseMode = nounPhraseOnly || (isInstrument && instrumentLevel === "object");
  const actionMode = isInstrument && instrumentLevel !== "object";
  // A canvas is shown once a subject or verb is chosen (a period starts on its subject),
  // or, verbless, for a lone noun phrase (a hosted ring's). An imperative also shows it:
  // its subject is the synthesised addressee (never picked into `selection`), so the canvas
  // gives the greyed subject + addressee selector *and the verb box* — without this the empty
  // state would show only the addressee selector, with no way to add the verb to command.
  // Before that, the empty state offers the single opening word picker.
  // An instrument-as-action period draws its canvas from the start: its first box is the verb,
  // not the subject, so the subject-picking empty state would have nothing to offer.
  // A hosted ring is drawn from the start too: an empty conjunct or owner is its word picker, in its
  // ring.
  const showCanvas =
    hosted ||
    Boolean(selection.subject) ||
    Boolean(selection.verb) ||
    Boolean(selection.imperative) ||
    Boolean(selection.infinitive) ||
    actionMode;
  // Has the user put anything in this clause? An untouched container is `{}`; any picked
  // word, toggle, or nested possessor adds a key. Drives the remove-confirmation prompt.
  const hasContent = Object.values(selection).some(
    (v) => v != null && (typeof v !== "object" || Object.keys(v).length > 0),
  );
  return { nested, nounPhraseMode, actionMode, showCanvas, hasContent };
}
