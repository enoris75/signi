import { Box } from "@mui/material";
import { SatelliteButton } from "./Boxes.tsx";
import type { NounKey, SlotConfig, SlotKey } from "./interfaces.ts";
import type { PerimeterEntry } from "./satellites/index.ts";
import { perimeterControlKey } from "./ringSpecs.ts";
import { ALL_SLOTS } from "./slots.ts";

type Pt = { x: number; y: number };

// The relative-clause, possessor and coordination controls (and the receiving dot for an incoming
// link) ride each noun's *dotted* ring rather than its solid one: they are about the noun phrase's
// links to other phrases, and each is where its connector line starts — the possessor control's to
// the noun's owner — or, for the dot, where an incoming subordinate link lands. The ring layout
// seats them (see ringSpecs), so they follow the whole constituent as it moves.
export function GroupPerimeterControls({
  controlPos,
  perimeterByNoun,
  linkTargetKeys,
  registerSourceAnchor,
  registerTargetAnchor,
  recolor,
  satelliteKeys = {},
  cursorSlot = null,
}: {
  // Where every ring control sits on the canvas, keyed by control.
  controlPos: Record<string, Pt>;
  perimeterByNoun: Partial<Record<NounKey, PerimeterEntry>>;
  // Nouns that are the target ("gap") of an incoming subordinate link — they get a receiving dot.
  linkTargetKeys?: Set<NounKey>;
  // Register the relative-clause control (line start) / receiving dot (line end) with
  // the workspace so it can measure the cross-container link between containers.
  registerSourceAnchor?: (nounKey: NounKey, el: HTMLElement | null) => void;
  registerTargetAnchor?: (nounKey: NounKey, el: HTMLElement | null) => void;
  // Slot colours to use in place of a noun's own, by noun (a conjunct's head wears its role's).
  recolor?: Partial<Record<string, SlotConfig["color"]>>;
  // The key each control answers to, by satellite key, and the box the cursor rests on — only its
  // own controls wear their key as a badge (see SatelliteControls).
  satelliteKeys?: Record<string, string>;
  cursorSlot?: SlotKey | null;
}) {
  const colorFor = (nounKey: NounKey): SlotConfig["color"] =>
    recolor?.[nounKey] ?? ALL_SLOTS.find((s) => s.key === nounKey)?.color ?? "primary";

  // Every noun that needs either a perimeter control or a receiving dot.
  const nounKeys = new Set<NounKey>([
    ...(Object.keys(perimeterByNoun) as NounKey[]),
    ...(linkTargetKeys ? [...linkTargetKeys] : []),
  ]);

  const seat = (at: Pt) =>
    ({
      position: "absolute",
      left: at.x,
      top: at.y,
      transform: "translate(-50%, -50%)",
      zIndex: 3,
    }) as const;

  return (
    <>
      {[...nounKeys].map((nounKey) => {
        const color = colorFor(nounKey);
        const entry = perimeterByNoun[nounKey];
        const dot = linkTargetKeys?.has(nounKey) ? controlPos[perimeterControlKey("incoming", nounKey)] : undefined;
        const relative = entry?.relative && controlPos[perimeterControlKey("relative", nounKey)];
        const headless = entry?.headless && controlPos[perimeterControlKey("headless", nounKey)];
        const possessor = entry?.possessor && controlPos[perimeterControlKey("possessor", nounKey)];
        const standard = entry?.standard && controlPos[perimeterControlKey("standard", nounKey)];
        const conjunct = entry?.conjunct && controlPos[perimeterControlKey("conjunct", nounKey)];
        // The clause's own facts about this noun: the wh-question's mark, its who / what, the
        // existential (P09-E12). Plain toggles: no line starts from them.
        const clauseFacts = (["question", "animacy", "existential", "gloss", "glossRelation"] as const).flatMap((kind) => {
          const sat = entry?.[kind];
          const at = sat && controlPos[perimeterControlKey(kind, nounKey)];
          return sat && at ? [{ kind, sat, at }] : [];
        });

        return (
          <Box key={nounKey} component="span">
            {/* Receiving dot — where an incoming subordinate link lands. */}
            {dot && (
              <Box
                ref={(el: HTMLElement | null) => registerTargetAnchor?.(nounKey, el)}
                sx={{
                  ...seat(dot),
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: `${color}.main`,
                  border: "2px solid",
                  borderColor: "background.paper",
                }}
              />
            )}
            {relative && (
              <Box
                data-testid={`relative-ctl-${nounKey}`}
                ref={(el: HTMLElement | null) => registerSourceAnchor?.(nounKey, el)}
                sx={seat(relative)}
              >
                <SatelliteButton
                  sat={entry!.relative!}
                  color={color}
                  keySpec={satelliteKeys[entry!.relative!.key]}
                  tip={nounKey === cursorSlot}
                />
              </Box>
            )}
            {/* The relative clause said alone (P13): a plain toggle beside the relative control. */}
            {headless && (
              <Box data-testid={`headless-ctl-${nounKey}`} sx={seat(headless)}>
                <SatelliteButton
                  sat={entry!.headless!}
                  color={color}
                  keySpec={satelliteKeys[entry!.headless!.key]}
                  tip={nounKey === cursorSlot}
                />
              </Box>
            )}
            {possessor && (
              <Box data-testid={`possessor-ctl-${nounKey}`} sx={seat(possessor)}>
                <SatelliteButton
                  sat={entry!.possessor!}
                  color={color}
                  keySpec={satelliteKeys[entry!.possessor!.key]}
                  tip={nounKey === cursorSlot}
                />
              </Box>
            )}
            {standard && (
              <Box data-testid={`standard-ctl-${nounKey}`} sx={seat(standard)}>
                <SatelliteButton
                  sat={entry!.standard!}
                  color={color}
                  keySpec={satelliteKeys[entry!.standard!.key]}
                  tip={nounKey === cursorSlot}
                />
              </Box>
            )}
            {conjunct && (
              <Box sx={seat(conjunct)}>
                <SatelliteButton
                  sat={entry!.conjunct!}
                  color={color}
                  keySpec={satelliteKeys[entry!.conjunct!.key]}
                  tip={nounKey === cursorSlot}
                />
              </Box>
            )}
            {clauseFacts.map(({ kind, sat, at }) => (
              <Box key={kind} data-testid={`${kind}-ctl-${nounKey}`} sx={seat(at)}>
                <SatelliteButton
                  sat={sat}
                  color={color}
                  keySpec={satelliteKeys[sat.key]}
                  tip={nounKey === cursorSlot}
                />
              </Box>
            ))}
          </Box>
        );
      })}
    </>
  );
}
