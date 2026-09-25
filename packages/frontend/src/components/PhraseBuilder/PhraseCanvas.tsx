import type { ComponentProps, ReactNode, RefObject } from "react";
import { useRef } from "react";
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
  SlotConfig,
  WorkspaceBinding,
} from "./interfaces.ts";
import { ALL_SLOTS, BOX_COMPLEMENT_TYPES } from "./slots.ts";
import { DEFAULT_NODE_SIZE, type Edge } from "./graph.ts";
import { innerRadius } from "./ringLayout.ts";
import { useElementSize } from "./hooks/useElementSize.ts";
import { nodeElRef, SlotNode, type PhraseRenderContext } from "./phraseRender.tsx";
import { GroupBox } from "./GroupBox.tsx";
import { useBoxCursor } from "../../keyboard/KeyboardProvider.tsx";
import { focusRing } from "../../keyboard/focusRing.ts";
import { boxScopesOf } from "../../keyboard/scope.ts";
import { PICK_TARGET, pickBadgeSx } from "../../keyboard/usePickKeys.ts";
import { NounPhraseBuilder } from "./NounPhraseBuilder.tsx";
import { VerbPhraseBuilder } from "./VerbPhraseBuilder.tsx";
import { ConnectorsLayer } from "./ConnectorsLayer.tsx";
import { SatelliteControls } from "./SatelliteControls.tsx";
import { GroupPerimeterControls } from "./GroupPerimeterControls.tsx";
import { ImperativeSubjectSelector } from "./ImperativeSubjectSelector.tsx";
import { InfinitivePhraseBox } from "./InfinitivePhraseBox.tsx";

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
  // Where every ring control sits on the canvas, in px, keyed by control (see ringSpecs).
  controlPos: Record<string, { x: number; y: number }>;
  // The clear button on each chosen word's solid ring.
  clearControls: ComponentProps<typeof SatelliteControls>["clearControls"];
  // The relative-clause + possessor controls that ride each noun's dotted ring.
  perimeterByNoun: ComponentProps<
    typeof GroupPerimeterControls
  >["perimeterByNoun"];
  // The cross-container link hooks (undefined for a standalone period, which doesn't link).
  linkBinding: WorkspaceBinding | undefined;
  onSetImperativePerson: (person: ImperativePerson) => void;
  onSetImperativeRegister: (register: ImperativeRegister) => void;
  // Attached to the positioned canvas Box; the parent measures it with a ResizeObserver.
  containerRef: RefObject<HTMLDivElement>;
  // The rings hosted on this canvas — its nouns' conjuncts and owners — and the chips on the lines
  // joining them, drawn among the canvas's own constituents (see ConjunctRings, OwnerRings).
  hosted?: ReactNode;
  // Slot colours to use in place of a slot's own, by slot key: a conjunct's head wears its role's.
  recolor?: Partial<Record<string, SlotConfig["color"]>>;
  // A hosted ring's builder paints its ring onto the period's canvas, which is already on the page: it
  // draws its constituent and controls with no canvas box of its own.
  overlay?: boolean;
  // The interjection's box stays, faded, where the period no longer offers it — a linked clause, a
  // citation — but its word is still chosen (P09-E47 D2): the engine does not speak it there.
  interjectionDimmed?: boolean;
  // So does the vocative's (P11-E8) where the period no longer says one — a linked clause, a citation,
  // an instruction — while it still holds words.
  vocativeDimmed?: boolean;
}

const subjectSlot = ALL_SLOTS.find((s) => s.key === "subject")!;

// The period's drawing surface: either the empty opening word picker, or the populated
// canvas — the connectors layer, the noun/verb phrase builders, and the satellite +
// dotted ring controls. Split out of PhraseBuilder, which owns the state this
// paints from and threads it in through `ctx` plus the canvas-geometry props above.
export function PhraseCanvas({
  ctx,
  showCanvas,
  canvasHeight,
  graphSize,
  edges,
  groupEdges,
  controlPos,
  clearControls,
  perimeterByNoun,
  linkBinding,
  onSetImperativePerson,
  onSetImperativeRegister,
  containerRef,
  hosted,
  recolor,
  overlay = false,
  interjectionDimmed = false,
  vocativeDimmed = false,
}: PhraseCanvasProps) {
  const {
    selection,
    activeSlot,
    compact,
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

  // The box that replaces the subject box under a subject-dropping mood: the command box under an
  // imperative, the infinitive box under a citation. Null under neither, when the subject box stands.
  const moodBox = selection.imperative
    ? commandBox
    : selection.infinitive
      ? <InfinitivePhraseBox />
      : null;

  // The empty period's opening word picker, measured so its ring fits round it. It is on the page
  // only before the canvas is drawn and while no mood box stands in for it.
  // The mood box stands where the subject box stands, so the cursor reaches it the same way — and
  // a command's own keys (its addressee and its register) apply while it is there.
  const moodCursor = useBoxCursor("subject", boxScopesOf("subject", selection));
  // Whether the mood box is a target of the possessor pick in flight (P11-E7 D4).
  const moodPick = Boolean(moodBox) && (ctx.isPickTarget?.("subject") ?? false);
  const openingRef = useRef<HTMLDivElement>(null);
  const openingPicker = !showCanvas && !moodBox;
  const openingSize = useElementSize(openingRef, DEFAULT_NODE_SIZE, openingPicker);

  // The period's interjection (P09-E47): its word in a ring of its own before the subject, joined to
  // nothing, while the card's border toggle shows it.
  const interjectionSlot = ctx.renderedSlots?.find((s) => s.key === "interjection");
  const interjectionRect = ctx.groupRects?.find((g) => g.mainKey === "interjection");
  const interjection = interjectionSlot && (
    <Box
      data-testid={interjectionDimmed ? "interjection-dimmed" : undefined}
      sx={interjectionDimmed ? { opacity: 0.45 } : undefined}
    >
      {interjectionRect && <GroupBox rect={interjectionRect} ctx={ctx} />}
      <SlotNode slot={interjectionSlot} ctx={ctx} />
    </Box>
  );

  // What the populated canvas draws: the links, the constituents, and the controls on their rings.
  const drawing = (
    <>
      <ConnectorsLayer
        svgSize={graphSize}
        groupEdges={groupEdges}
        edges={edges}
      />

      <>
        {interjection}
        {/* The period's vocative (P11-E8): a noun box of its own after the interjection, with the
            noun ring's controls, joined to nothing, while the card's border toggle shows it. */}
        {ctx.renderedSlots?.some((s) => s.key === "vocative") && (
          <Box
            data-testid={vocativeDimmed ? "vocative-dimmed" : undefined}
            sx={vocativeDimmed ? { opacity: 0.45 } : undefined}
          >
            <NounPhraseBuilder which="vocative" ctx={ctx} />
          </Box>
        )}
        {ctx.showSubject === false ? null : moodBox ? (
          // A subject-dropping mood (command / infinitive) drops the subject, so the subject box
          // has no noun to hold: the mood box *is* the subject node — dragged, positioned and
          // measured as one, so the layout wraps it exactly as it wrapped the box it replaces.
          // The subject's own satellites are withdrawn with it (see buildSatellites), leaving
          // nothing to overlay.
          <Box
            {...ctx.makeDragProps("subject", moodPick ? () => ctx.onPickTarget?.("subject") : () => {})}
            {...moodCursor}
            // It stands for the subject in a possessor's pick too (P11-E7 D4): pointing at it is
            // pointing at the addressee or the one cited, which the plan writes as the link.
            {...(moodPick ? { [PICK_TARGET]: "subject", onClick: () => ctx.onPickTarget?.("subject") } : {})}
            data-testid="mood-box"
            sx={[
              ctx.makeDragProps("subject", () => {}).sx,
              focusRing("primary"),
              pickBadgeSx,
              moodPick && { outline: "2px dashed", outlineColor: "primary.main", outlineOffset: 4, borderRadius: 2 },
            ]}
            ref={nodeElRef(ctx, "subject")}
            onFocus={(e: React.FocusEvent<HTMLElement>) => {
              moodCursor.onFocus(e);
              ctx.handleSlotClick("subject");
            }}
          >
            {moodBox}
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

      {/* Compact view is just the words in their solid rings, each with its clear button — no
          reveal icons and no dotted-ring controls. */}
      <SatelliteControls
        satelliteIconsByParent={compact ? {} : satelliteIconsByParent}
        clearControls={clearControls}
        controlPos={controlPos}
        recolor={recolor}
        satelliteKeys={ctx.satelliteKeys}
        cursorSlot={activeSlot}
      />

      {!compact && (
        <GroupPerimeterControls
          controlPos={controlPos}
          perimeterByNoun={perimeterByNoun}
          recolor={recolor}
          linkTargetKeys={
            linkBinding
              ? (linkBinding.relative.targetKeys as Set<NounKey>)
              : undefined
          }
          registerSourceAnchor={linkBinding?.geometry.registerSourceAnchor}
          registerTargetAnchor={linkBinding?.geometry.registerTargetAnchor}
          satelliteKeys={ctx.satelliteKeys}
          cursorSlot={activeSlot}
        />
      )}

      {hosted}
    </>
  );

  if (overlay) return drawing;

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
          {moodBox ? (
            // A subject-dropping mood (command / infinitive) replaces the subject box with its own.
            moodBox
          ) : (
            // The opening word sits in a solid ring like every word on the canvas, sized to what the
            // ring holds. The wrapper measures that content alone: the ring is drawn out of flow.
            <Box ref={openingRef} sx={{ display: "inline-block" }}>
              <SlotBox
                slot={subjectSlot}
                concept={undefined}
                isActive={activeSlot === "subject"}
                onClear={() => handleClear("subject")}
                shape={{ r: innerRadius(openingSize), kind: "ring" }}
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
            </Box>
          )}
        </Box>
      ) : (
        <Box
          ref={containerRef}
          data-testid="phrase-canvas"
          sx={{
            position: "relative",
            height: canvasHeight,
            touchAction: "none",
          }}
        >
          {drawing}
        </Box>
      )}
    </Box>
  );
}
