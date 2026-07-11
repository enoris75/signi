import type {
  ComponentProps,
  MutableRefObject,
  RefObject,
} from "react";
import { Box } from "@mui/material";
import { COMPLEMENT_TYPES } from "@signi/shared";
import { SubjectTypeahead } from "./SubjectTypeahead.tsx";
import { CategoryToggle, SlotBox } from "./Boxes.tsx";
import {
  ImperativePerson,
  NounKey,
  slotCategories,
  WorkspaceBinding,
} from "./interfaces.ts";
import { ALL_SLOTS } from "./slots.ts";
import type { Edge } from "./graph.ts";
import { type PhraseRenderContext } from "./phraseRender.tsx";
import { NounPhraseBuilder } from "./NounPhraseBuilder.tsx";
import { VerbPhraseBuilder } from "./VerbPhraseBuilder.tsx";
import { ConnectorsLayer } from "./ConnectorsLayer.tsx";
import { SatelliteControls } from "./SatelliteControls.tsx";
import { GroupPerimeterControls } from "./GroupPerimeterControls.tsx";
import { ImperativeSubjectSelector } from "./ImperativeSubjectSelector.tsx";

export interface PhraseCanvasProps {
  // The shared render bag threaded to every noun/verb phrase builder; the canvas reads
  // its selection, active slot, handlers, and per-group state straight off it.
  ctx: PhraseRenderContext;
  // A canvas is drawn once a subject or verb is chosen; before that the empty state offers
  // the single opening word picker.
  showCanvas: boolean;
  // The tight compact height, or the resizable full-view height — the same value the group
  // rects and box positions are computed against.
  canvasHeight: number;
  graphSize: { w: number; h: number };
  edges: Edge[];
  groupEdges: Edge[];
  // Absolute canvas-pixel position of each satellite reveal control, keyed by satellite key.
  controlPos: Record<string, { x: number; y: number }>;
  // The relative-clause + possessor controls that ride each noun's dotted-box perimeter.
  perimeterByNoun: ComponentProps<
    typeof GroupPerimeterControls
  >["perimeterByNoun"];
  // The cross-container link hooks (undefined for possessor sub-builders that don't link).
  linkBinding: WorkspaceBinding | undefined;
  onSetImperativePerson: (person: ImperativePerson) => void;
  // Attached to the positioned canvas Box; the parent measures it with a ResizeObserver.
  containerRef: RefObject<HTMLDivElement>;
  // Receives each noun's possessor control element (its connector's start), measured up in
  // the parent against the root Box.
  possessorControlEls: MutableRefObject<Map<string, HTMLElement>>;
}

const subjectSlot = ALL_SLOTS.find((s) => s.key === "subject")!;

// The period's drawing surface: either the empty opening word picker, or the populated
// canvas — the connectors layer, the noun/verb phrase builders, and the satellite +
// dotted-box perimeter controls. Split out of PhraseBuilder, which owns the state this
// paints from and threads it in through `ctx` plus the canvas-geometry props above.
export function PhraseCanvas({
  ctx,
  showCanvas,
  canvasHeight,
  graphSize,
  edges,
  groupEdges,
  controlPos,
  perimeterByNoun,
  linkBinding,
  onSetImperativePerson,
  containerRef,
  possessorControlEls,
}: PhraseCanvasProps) {
  const {
    selection,
    activeSlot,
    compact,
    groupRects,
    satelliteIconsByParent,
    handleClear,
    handleConceptSelect,
    slotKind,
    onSlotKindChange,
  } = ctx;

  return (
    <Box sx={{ minWidth: 0 }}>
      {!showCanvas ? (
        // An empty period is still the full, resizable canvas height — the bottom
        // edge resizes it just as it does once words land on the canvas.
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: canvasHeight,
          }}
        >
          {selection.imperative ? (
            // A command drops its subject — the box becomes the addressee selector instead.
            <ImperativeSubjectSelector
              value={selection.imperativePerson ?? "2sg"}
              onChange={onSetImperativePerson}
            />
          ) : (
            <SlotBox
              slot={subjectSlot}
              concept={undefined}
              isActive={activeSlot === "subject"}
              onClear={() => handleClear("subject")}
              categoryToggle={
                <CategoryToggle
                  options={slotCategories("subject")!.options}
                  value={slotKind("subject")}
                  onChange={(v) => onSlotKindChange("subject", v)}
                />
              }
              emptyContent={
                <SubjectTypeahead
                  onSelect={(c, opts) =>
                    handleConceptSelect(c, "subject", opts)
                  }
                  kind={slotKind("subject")}
                  onKindChange={(v) => onSlotKindChange("subject", v)}
                />
              }
            />
          )}
        </Box>
      ) : (
        <Box
          ref={containerRef}
          sx={{
            position: "relative",
            height: canvasHeight,
            touchAction: "none",
          }}
        >
          <ConnectorsLayer
            svgSize={graphSize}
            groupEdges={groupEdges}
            edges={edges}
          />

          <>
            {selection.imperative ? (
              // A command drops its subject: grey the subject box (kept for layout) and overlay
              // the addressee selector on its footprint.
              <>
                <Box sx={{ opacity: 0.35, pointerEvents: "none" }}>
                  <NounPhraseBuilder which="subject" ctx={ctx} />
                </Box>
                <ImperativeSubjectSelector
                  value={selection.imperativePerson ?? "2sg"}
                  onChange={onSetImperativePerson}
                  rect={groupRects.find((g) => g.nodeKeys.includes("subject"))}
                />
              </>
            ) : (
              <NounPhraseBuilder which="subject" ctx={ctx} />
            )}
            <VerbPhraseBuilder ctx={ctx} />
            <NounPhraseBuilder which="directObject" ctx={ctx} />
            <NounPhraseBuilder which="indirectObject" ctx={ctx} />
            {COMPLEMENT_TYPES.map((type) => (
              <NounPhraseBuilder key={type} which={type} ctx={ctx} />
            ))}
          </>

          {/* Compact view is just the bare core-word chips — no reveal icons
              on the box borders and no dotted-box perimeter controls. */}
          {!compact && (
            <SatelliteControls
              satelliteIconsByParent={satelliteIconsByParent}
              controlPos={controlPos}
            />
          )}

          {!compact && (
            <GroupPerimeterControls
              groupRects={groupRects}
              perimeterByNoun={perimeterByNoun}
              linkTargetKeys={
                linkBinding
                  ? (linkBinding.relative.targetKeys as Set<NounKey>)
                  : undefined
              }
              registerSourceAnchor={linkBinding?.geometry.registerSourceAnchor}
              registerTargetAnchor={linkBinding?.geometry.registerTargetAnchor}
              registerPossessorControl={(nounKey, el) => {
                if (el) possessorControlEls.current.set(nounKey, el);
                else possessorControlEls.current.delete(nounKey);
              }}
            />
          )}
        </Box>
      )}
    </Box>
  );
}
