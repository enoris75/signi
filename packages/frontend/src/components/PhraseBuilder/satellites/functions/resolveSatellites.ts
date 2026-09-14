import type {
  BuiltSatellites,
  RawSatellite,
  ResolveSatellitesOptions,
  Satellite,
} from "../satellites.types.tsx";

// Settle the satellites against each other and the reveal state: withdraw the families whose head
// is off the canvas, then decide whether each remaining satellite's box is shown (an explicit reveal
// toggle wins; otherwise its default, which for most is whether it holds a value).
export function resolveSatellites(
  raw: RawSatellite[],
  { revealed, subjectDropped }: ResolveSatellitesOptions,
): BuiltSatellites {
  const isShown = (s: RawSatellite, available: boolean): boolean =>
    // A direct-toggle satellite (number) has no box to reveal — its ring icon
    // carries the value. Otherwise an explicit toggle wins; else a set one auto-expands.
    available && !s.directToggle && (revealed[s.key] ?? s.defaultShown ?? s.hasValue);

  // A command or an infinitive citation drops its subject: the subject box is replaced by the mood
  // box (PhraseCanvas), so the whole subject family — its adjectives, number/gender, determiner,
  // relative clause and possessor — has no head to hang off and is withdrawn. Every one of those
  // satellites is keyed off the subject, and dropping them here is what keeps their controls, their
  // boxes and their connectors from floating over the box that took its place.
  const inDroppedSubject = (key: string) => subjectDropped && key.startsWith("subject");

  // Folding the direct object's box away takes its whole family with it — its adjectives,
  // number/gender, determiner, relative clause, possessor and conjuncts all hang off a head
  // that is no longer on the canvas. Same move as `inDroppedSubject` above, and what keeps
  // their controls and connectors from floating over the space the box used to hold.
  const directObject = raw.find((s) => s.key === "directObject");
  const directObjectShown = Boolean(directObject && isShown(directObject, directObject.available));
  const inFoldedObject = (key: string) =>
    !directObjectShown && key.startsWith("directObject") && key !== "directObject";

  const satellites: Satellite[] = raw.map((s) => {
    const available = s.available && !inDroppedSubject(s.key) && !inFoldedObject(s.key);
    return { ...s, available, shown: isShown(s, available) };
  });
  const shownMap: Record<string, boolean> = Object.fromEntries(
    satellites.map((s) => [s.key, s.shown]),
  );

  return { satellites, shownMap };
}
