import { Box } from "@mui/material";
import { SatelliteButton, type SatelliteIcon } from "./Boxes.tsx";
import type { GroupRect } from "./graph.ts";
import type { NounKey, SlotConfig } from "./interfaces.ts";
import { ALL_SLOTS } from "./slots.ts";

type PerimeterEntry = { relative?: SatelliteIcon; possessor?: SatelliteIcon };

// The relative-clause + possessor controls (and the receiving dots for incoming
// links) ride each noun's *dotted-box* perimeter rather than the word box: the
// controls sit on the box's bottom edge and are where the dotted connector lines
// start, while a small dot on the top edge marks where an incoming subordinate
// link lands. Because they're pinned to the group rect, they follow the whole
// constituent as its boxes move.
export function GroupPerimeterControls({
  groupRects,
  perimeterByNoun,
  linkTargetKeys,
  registerSourceAnchor,
  registerTargetAnchor,
  registerPossessorControl,
}: {
  groupRects: GroupRect[];
  perimeterByNoun: Partial<Record<NounKey, PerimeterEntry>>;
  // Nouns that are the target ("gap") of an incoming subordinate link — they get a
  // receiving dot on their top edge.
  linkTargetKeys?: Set<NounKey>;
  // Register the relative-clause control (line start) / receiving dot (line end) with
  // the workspace so it can measure the cross-container link between containers.
  registerSourceAnchor?: (nounKey: NounKey, el: HTMLElement | null) => void;
  registerTargetAnchor?: (nounKey: NounKey, el: HTMLElement | null) => void;
  // Register the possessor control (its connector's start) with the local builder.
  registerPossessorControl: (nounKey: NounKey, el: HTMLElement | null) => void;
}) {
  const rectFor = (nounKey: NounKey) =>
    groupRects.find((g) => g.nodeKeys.includes(nounKey));
  const colorFor = (nounKey: NounKey): SlotConfig["color"] =>
    ALL_SLOTS.find((s) => s.key === nounKey)?.color ?? "primary";

  // Every noun that needs either a perimeter control or a receiving dot.
  const nounKeys = new Set<NounKey>([
    ...(Object.keys(perimeterByNoun) as NounKey[]),
    ...(linkTargetKeys ? [...linkTargetKeys] : []),
  ]);

  return (
    <>
      {[...nounKeys].map((nounKey) => {
        const rect = rectFor(nounKey);
        if (!rect) return null;
        const color = colorFor(nounKey);
        const entry = perimeterByNoun[nounKey];
        const isTarget = linkTargetKeys?.has(nounKey) ?? false;
        const cx = rect.x + rect.width / 2;

        return (
          <Box key={nounKey} component="span">
            {/* Receiving dot on the top edge — where an incoming subordinate link lands. */}
            {isTarget && (
              <Box
                ref={(el: HTMLElement | null) => registerTargetAnchor?.(nounKey, el)}
                sx={{
                  position: "absolute",
                  left: cx,
                  top: rect.y,
                  transform: "translate(-50%, -50%)",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: `${color}.main`,
                  border: "2px solid",
                  borderColor: "background.paper",
                  zIndex: 3,
                }}
              />
            )}
            {/* Relative + possessor controls on the bottom edge — each the start of its
                connector line. */}
            {(entry?.relative || entry?.possessor) && (
              <Box
                sx={{
                  position: "absolute",
                  left: cx,
                  top: rect.y + rect.height,
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  gap: 0.5,
                  zIndex: 3,
                }}
              >
                {entry?.relative && (
                  <Box
                    ref={(el: HTMLElement | null) =>
                      registerSourceAnchor?.(nounKey, el)
                    }
                  >
                    <SatelliteButton sat={entry.relative} color={color} />
                  </Box>
                )}
                {entry?.possessor && (
                  <Box
                    ref={(el: HTMLElement | null) =>
                      registerPossessorControl(nounKey, el)
                    }
                  >
                    <SatelliteButton sat={entry.possessor} color={color} />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        );
      })}
    </>
  );
}
