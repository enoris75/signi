import type {
  ComponentProps,
  MutableRefObject,
  RefObject,
} from "react";
import { Box } from "@mui/material";
import { SubjectTypeahead } from "./SubjectTypeahead.tsx";
import { CategoryToggle, SlotBox } from "./Boxes.tsx";
import type { ImperativeRegister } from "@signi/shared";
import {
  ImperativePerson,
  imperativePerson,
  imperativeRegisterOf,
  NounKey,
  slotCategories,
  WorkspaceBinding,
} from "./interfaces.ts";
import { ALL_SLOTS, BOX_COMPLEMENT_TYPES } from "./slots.ts";
import type { Edge } from "./graph.ts";
import { nodeElRef, type PhraseRenderContext } from "./phraseRender.tsx";
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
  onSetImperativeRegister: (register: ImperativeRegister) => void;
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
  onSetImperativeRegister,
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

  // What the command box shows. A command that is the *second* clause of a coordination shares the
  // first's person and register — one pair of commands is one speech act — so it shows the
  // inherited ones and is locked; the user changes them on the first clause.
  const inheritedCommand = linkBinding?.coordinative.inheritedCommand;
  const person = inheritedCommand?.person ?? imperativePerson(selection);
  const register = inheritedCommand?.register ?? imperativeRegisterOf(selection);
  const commandBox = (
    <ImperativeSubjectSelector
      person={person}
      register={register}
      onPersonChange={onSetImperativePerson}
      onRegisterChange={onSetImperativeRegister}
      inherited={Boolean(inheritedCommand)}
    />
  );

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
            // A command drops its subject — the box is the command box instead.
            commandBox
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
            {ctx.showSubject === false ? null : selection.imperative ? (
              // A command drops its subject, so the subject box has no noun to hold: the command
              // box *is* the subject node — dragged, positioned and measured as one, so the layout
              // wraps it exactly as it wrapped the box it replaces. The subject's own satellites
              // are withdrawn with it (see buildSatellites), leaving nothing to overlay.
              <Box
                {...ctx.makeDragProps("subject", () => {})}
                ref={nodeElRef(ctx, "subject")}
              >
                {commandBox}
              </Box>
            ) : (
              <NounPhraseBuilder which="subject" ctx={ctx} />
            )}
            {/* A noun-phrase period has no predicate — an instrument ("a word") is a noun
                phrase, not a clause, so its canvas is the subject box alone. */}
            {!ctx.nounPhrase && (
              <>
                <VerbPhraseBuilder ctx={ctx} />
                <NounPhraseBuilder which="directObject" ctx={ctx} />
                {BOX_COMPLEMENT_TYPES.map((type) => (
                  <NounPhraseBuilder key={type} which={type} ctx={ctx} />
                ))}
              </>
            )}
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
