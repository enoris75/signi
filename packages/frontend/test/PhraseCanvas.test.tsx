import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { createRef, type ComponentProps } from 'react';
import type { Concept } from '@signi/shared';
import { PhraseCanvas } from '../src/components/PhraseBuilder/PhraseCanvas.tsx';
import { SlotBox } from '../src/components/PhraseBuilder/Boxes.tsx';
import { SubjectTypeahead } from '../src/components/PhraseBuilder/SubjectTypeahead.tsx';
import { NounPhraseBuilder } from '../src/components/PhraseBuilder/NounPhraseBuilder.tsx';
import { ConnectorsLayer } from '../src/components/PhraseBuilder/ConnectorsLayer.tsx';
import { SatelliteControls } from '../src/components/PhraseBuilder/SatelliteControls.tsx';
import { GroupPerimeterControls } from '../src/components/PhraseBuilder/GroupPerimeterControls.tsx';
import {
  ImperativeSubjectSelector,
} from '../src/components/PhraseBuilder/ImperativeSubjectSelector.tsx';
import { BOX_COMPLEMENT_TYPES } from '../src/components/PhraseBuilder/slots.ts';
import type { Edge, GroupRect } from '../src/components/PhraseBuilder/graph.ts';
import { innerRadius } from '../src/components/PhraseBuilder/ringLayout.ts';
import type { WorkspaceBinding } from '../src/components/PhraseBuilder/interfaces.ts';
import type { PhraseRenderContext } from '../src/components/PhraseBuilder/phraseRender.tsx';
import { renderWithProviders } from './render.tsx';

// The empty subject box's own chrome is covered by Boxes.test; the stub shows what the canvas
// puts in it and exposes its clear callback, which the real box offers only once filled.
vi.mock('../src/components/PhraseBuilder/Boxes.tsx', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/components/PhraseBuilder/Boxes.tsx')>()),
  SlotBox: vi.fn((p: ComponentProps<typeof SlotBox>) => (
    <div data-testid={`box-${p.slot.key}`}>
      {p.categoryToggle}
      {p.emptyContent}
    </div>
  )),
}));
// The opening picker searches the concept corpus.
// jsdom has no layout and no ResizeObserver: the opening picker measures at a fixed size.
const OPENING_SIZE = { w: 120, h: 60 };
vi.mock('../src/components/PhraseBuilder/hooks/useElementSize.ts', () => ({
  useElementSize: () => OPENING_SIZE,
}));
vi.mock('../src/components/PhraseBuilder/SubjectTypeahead.tsx', () => ({
  SubjectTypeahead: vi.fn(() => <div data-testid="subject-typeahead" />),
}));
// The phrase builders measure and drag their boxes across the canvas.
vi.mock('../src/components/PhraseBuilder/NounPhraseBuilder.tsx', () => ({
  NounPhraseBuilder: vi.fn((p: { which: string }) => (
    <div data-testid="phrase" data-which={p.which} />
  )),
}));
vi.mock('../src/components/PhraseBuilder/VerbPhraseBuilder.tsx', () => ({
  VerbPhraseBuilder: vi.fn(() => <div data-testid="phrase" data-which="verb" />),
}));
// The canvas only places these layers; what they draw is their own tests' concern.
vi.mock('../src/components/PhraseBuilder/ConnectorsLayer.tsx', () => ({
  ConnectorsLayer: vi.fn(() => <div data-testid="connectors-layer" />),
}));
vi.mock('../src/components/PhraseBuilder/SatelliteControls.tsx', () => ({
  SatelliteControls: vi.fn(() => <div data-testid="satellite-controls" />),
}));
vi.mock('../src/components/PhraseBuilder/GroupPerimeterControls.tsx', () => ({
  GroupPerimeterControls: vi.fn(() => <div data-testid="perimeter-controls" />),
}));
vi.mock('../src/components/PhraseBuilder/ImperativeSubjectSelector.tsx', () => ({
  ImperativeSubjectSelector: vi.fn(() => <div data-testid="command-box" />),
}));

// The props a stubbed child was handed on its latest render.
const propsOf = <P,>(component: (props: P) => unknown): P =>
  vi.mocked(component).mock.lastCall![0];

// A command to the first person plural, spoken as an instruction.
const COMMAND = {
  imperative: true,
  imperativePerson: '1pl',
  imperativeRegister: 'instruction',
} as const;

const CAT: Concept = { id: 'CAT', role: 'noun', description: 'a small feline', label: 'cat' };

const GROUP: GroupRect = {
  label: 'Subject',
  color: 'primary',
  mainKey: 'subject',
  nodeKeys: ['subject'],
  center: { x: 60, y: 50 },
  rIn: 34,
  orbit: 34,
  rOut: 60,
  x: -11,
  y: -21,
  width: 142,
  height: 142,
};

function makeCtx(overrides: Partial<PhraseRenderContext> = {}) {
  const dragPointerDown = vi.fn();
  const ctx = {
    selection: {},
    activeSlot: null,
    compact: false,
    groupRects: [GROUP],
    satelliteIconsByParent: { subject: [] },
    slotEls: { current: new Map<string, HTMLElement>() },
    makeDragProps: vi.fn(() => ({
      onPointerDown: dragPointerDown,
      onPointerMove: () => {},
      onPointerUp: () => {},
      onPointerCancel: () => {},
      sx: {},
    })),
    handleClear: vi.fn(),
    handleConceptSelect: vi.fn(),
    slotKind: vi.fn(() => 'noun'),
    onSlotKindChange: vi.fn(),
    satelliteKeys: {},
    determinerMenuFor: null,
    onDeterminerMenu: vi.fn(),
    ...overrides,
  } as unknown as PhraseRenderContext;
  return { ctx, dragPointerDown };
}

function renderCanvas(
  overrides: Partial<ComponentProps<typeof PhraseCanvas>> = {},
  ctxOverrides: Partial<PhraseRenderContext> = {},
) {
  const { ctx, dragPointerDown } = makeCtx(ctxOverrides);
  const props = {
    ctx,
    showCanvas: true,
    canvasHeight: 340,
    graphSize: { w: 800, h: 340 },
    edges: [] as Edge[],
    groupEdges: [] as Edge[],
    controlPos: { 'subject.number': { x: 40, y: 50 } },
    clearControls: [],
    perimeterByNoun: {},
    linkBinding: undefined,
    onSetImperativePerson: vi.fn(),
    onSetImperativeRegister: vi.fn(),
    containerRef: createRef<HTMLDivElement>(),
    ...overrides,
  };
  const view = renderWithProviders(<PhraseCanvas {...props} />);
  return { ...view, ...props, dragPointerDown };
}

const phrases = () => screen.queryAllByTestId('phrase').map((p) => p.dataset['which']);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PhraseCanvas', () => {
  describe('an empty period', () => {
    it('offers only the subject, in its solid ring with the opening word picker, at the canvas height', () => {
      renderCanvas({ showCanvas: false, canvasHeight: 280 });

      const box = screen.getByTestId('box-subject');
      expect(box).toContainElement(screen.getByTestId('subject-typeahead'));
      expect(propsOf(SlotBox).slot.key).toBe('subject');
      expect(propsOf(SlotBox).concept).toBeUndefined();
      // Sized to fit round the content it measures.
      expect(propsOf(SlotBox).shape).toEqual({ r: innerRadius(OPENING_SIZE), kind: 'ring' });
      expect(box.parentElement!.parentElement).toHaveStyle({ height: '280px' });
      expect(phrases()).toEqual([]);
      expect(screen.queryByTestId('connectors-layer')).not.toBeInTheDocument();
    });

    it('marks the subject box active only while the subject slot is', () => {
      renderCanvas({ showCanvas: false }, { activeSlot: 'subject' }).unmount();
      expect(propsOf(SlotBox).isActive).toBe(true);

      renderCanvas({ showCanvas: false }, { activeSlot: 'verb' });
      expect(propsOf(SlotBox).isActive).toBe(false);
    });

    it('selects the word picked into the subject slot, with the picker’s options', () => {
      const { ctx } = renderCanvas({ showCanvas: false });

      propsOf(SubjectTypeahead).onSelect(CAT, { number: 'plural' });

      expect(ctx.handleConceptSelect).toHaveBeenCalledExactlyOnceWith(CAT, 'subject', {
        number: 'plural',
      });
    });

    it('clears the subject slot from the subject box', () => {
      const { ctx } = renderCanvas({ showCanvas: false });

      propsOf(SlotBox).onClear();

      expect(ctx.handleClear).toHaveBeenCalledExactlyOnceWith('subject');
    });

    it('keeps the on-box switch and the picker on the subject’s word category', () => {
      const slotKind = vi.fn((slot: string) => (slot === 'subject' ? 'pronoun' : 'noun'));
      const { ctx } = renderCanvas({ showCanvas: false }, { slotKind });

      expect(screen.getByRole('button', { name: 'Pronoun' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(propsOf(SubjectTypeahead).kind).toBe('pronoun');

      fireEvent.click(screen.getByRole('button', { name: 'Noun' }));
      expect(ctx.onSlotKindChange).toHaveBeenLastCalledWith('subject', 'noun');

      propsOf(SubjectTypeahead).onKindChange!('pronoun');
      expect(ctx.onSlotKindChange).toHaveBeenLastCalledWith('subject', 'pronoun');
    });

    it('replaces the subject box with the command box under an imperative', () => {
      const { onSetImperativePerson, onSetImperativeRegister } = renderCanvas(
        { showCanvas: false },
        { selection: COMMAND },
      );

      expect(screen.getByTestId('command-box')).toBeInTheDocument();
      expect(screen.queryByTestId('box-subject')).not.toBeInTheDocument();
      expect(propsOf(ImperativeSubjectSelector)).toMatchObject({
        person: '1pl',
        register: 'instruction',
        inherited: false,
        onPersonChange: onSetImperativePerson,
        onRegisterChange: onSetImperativeRegister,
      });
    });

    it('asks a fresh command for the default addressee and register', () => {
      renderCanvas({ showCanvas: false }, { selection: { imperative: true } });

      expect(propsOf(ImperativeSubjectSelector)).toMatchObject({
        person: '2sg',
        register: 'request',
      });
    });

    it('replaces the subject box with the infinitive box under a citation', () => {
      renderCanvas({ showCanvas: false }, { selection: { infinitive: true } });

      expect(screen.getByTestId('infinitive-box')).toBeInTheDocument();
      expect(screen.queryByTestId('box-subject')).not.toBeInTheDocument();
      expect(screen.queryByTestId('command-box')).not.toBeInTheDocument();
    });
  });

  describe('a populated canvas', () => {
    it('is the measured, positioned surface at the canvas height', () => {
      const { containerRef } = renderCanvas({ canvasHeight: 420 });

      expect(containerRef.current).toHaveStyle({ position: 'relative', height: '420px' });
      expect(containerRef.current).toContainElement(screen.getByTestId('connectors-layer'));
    });

    it('hands the connectors layer the graph size and both edge sets', () => {
      const edge: Edge = { x1: 1, y1: 2, x2: 3, y2: 4, color: '#000', dashed: true };
      const groupEdge: Edge = { x1: 5, y1: 6, x2: 7, y2: 8, color: '#fff', dashed: false };
      renderCanvas({ graphSize: { w: 640, h: 300 }, edges: [edge], groupEdges: [groupEdge] });

      expect(propsOf(ConnectorsLayer)).toEqual({
        svgSize: { w: 640, h: 300 },
        edges: [edge],
        groupEdges: [groupEdge],
      });
    });

    it('draws the subject, the verb phrase, the direct object and every boxed complement', () => {
      const { ctx } = renderCanvas();

      expect(phrases()).toEqual(['subject', 'verb', 'directObject', ...BOX_COMPLEMENT_TYPES]);
      expect(screen.queryByTestId('box-subject')).not.toBeInTheDocument();
      for (const [props] of vi.mocked(NounPhraseBuilder).mock.calls) {
        expect(props.ctx).toBe(ctx);
      }
    });

    it('draws only the subject for a noun-phrase period, which has no predicate', () => {
      renderCanvas({}, { nounPhrase: true });

      expect(phrases()).toEqual(['subject']);
    });

    it('leaves the subject out when the period has none to show', () => {
      renderCanvas({}, { showSubject: false, selection: { imperative: true } });

      expect(phrases()).toEqual(['verb', 'directObject', ...BOX_COMPLEMENT_TYPES]);
      expect(screen.queryByTestId('command-box')).not.toBeInTheDocument();
    });

    it('draws the command box as the subject node under an imperative', () => {
      const { ctx, dragPointerDown } = renderCanvas({}, { selection: { imperative: true } });

      expect(phrases()).toEqual(['verb', 'directObject', ...BOX_COMPLEMENT_TYPES]);
      const node = screen.getByTestId('command-box').parentElement!;
      // It drags and measures as the subject box it replaces.
      expect(ctx.makeDragProps).toHaveBeenCalledWith('subject', expect.any(Function));
      expect(ctx.slotEls.current.get('subject')).toBe(node);
      fireEvent.pointerDown(node);
      expect(dragPointerDown).toHaveBeenCalledOnce();
    });

    it('draws the infinitive box as the subject node under a citation', () => {
      const { ctx } = renderCanvas({}, { selection: { infinitive: true } });

      expect(phrases()).not.toContain('subject');
      expect(ctx.slotEls.current.get('subject')).toBe(
        screen.getByTestId('infinitive-box').parentElement,
      );
    });

    it('releases the subject node’s measurement slot when the mood box goes', () => {
      const { ctx, unmount } = renderCanvas({}, { selection: { imperative: true } });

      unmount();

      expect(ctx.slotEls.current.has('subject')).toBe(false);
    });

    it('shows the second command of a coordination with the first’s choices, locked', () => {
      const linkBinding = binding({ inheritedCommand: { person: '2pl', register: 'request' } });
      renderCanvas({ linkBinding }, { selection: COMMAND });

      expect(propsOf(ImperativeSubjectSelector)).toMatchObject({
        person: '2pl',
        register: 'request',
        inherited: true,
      });
    });

    it('rides the satellite controls and clear buttons on the canvas where the rings seat them', () => {
      const clearControls = [{ mainKey: 'subject', label: 'Subject', onClear: () => {} }];
      const { ctx, controlPos } = renderCanvas({ clearControls });

      expect(propsOf(SatelliteControls)).toMatchObject({
        satelliteIconsByParent: ctx.satelliteIconsByParent,
        clearControls,
        controlPos,
        // Each control is handed the key it answers to, and which box the cursor is on — only
        // that box's own controls wear their key as a badge.
        satelliteKeys: ctx.satelliteKeys,
        cursorSlot: ctx.activeSlot,
      });
    });

    it('rides the perimeter controls on the dotted rings', () => {
      const perimeterByNoun = { subject: {} };
      const { controlPos } = renderCanvas({ perimeterByNoun });

      expect(propsOf(GroupPerimeterControls)).toMatchObject({ controlPos, perimeterByNoun });
    });

    it('keeps only the clear buttons in the compact view', () => {
      const clearControls = [{ mainKey: 'subject', label: 'Subject', onClear: () => {} }];
      renderCanvas({ clearControls }, { compact: true });

      expect(propsOf(SatelliteControls)).toMatchObject({ satelliteIconsByParent: {}, clearControls });
      expect(screen.queryByTestId('perimeter-controls')).not.toBeInTheDocument();
      expect(phrases()).toContain('subject');
    });

    it('wires the perimeter controls into the workspace’s links', () => {
      const linkBinding = binding();
      renderCanvas({ linkBinding });

      const props = propsOf(GroupPerimeterControls);
      expect(props.linkTargetKeys).toBe(linkBinding.relative.targetKeys);
      expect(props.registerSourceAnchor).toBe(linkBinding.geometry.registerSourceAnchor);
      expect(props.registerTargetAnchor).toBe(linkBinding.geometry.registerTargetAnchor);
    });

    it('leaves the perimeter controls unlinked outside a workspace', () => {
      renderCanvas({ linkBinding: undefined });

      const props = propsOf(GroupPerimeterControls);
      expect(props.linkTargetKeys).toBeUndefined();
      expect(props.registerSourceAnchor).toBeUndefined();
      expect(props.registerTargetAnchor).toBeUndefined();
    });
  });
});

// A container's link binding: one incoming relative link on the direct object.
function binding(
  coordinative: Partial<WorkspaceBinding['coordinative']> = {},
): WorkspaceBinding {
  return {
    containerId: 'c1',
    pickActive: false,
    relative: { targetKeys: new Set(['directObject']) },
    geometry: { registerSourceAnchor: vi.fn(), registerTargetAnchor: vi.fn() },
    coordinative,
  } as unknown as WorkspaceBinding;
}
