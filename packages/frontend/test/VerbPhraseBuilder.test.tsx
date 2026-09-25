import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import {
  CAUSE_SENTIMENTS,
  PATH_SPECIFIERS,
  TEMPORAL_RELATIONS,
  type CauseSentiment,
  type Concept,
} from '@signi/shared';
import type { SatelliteIcon } from '../src/components/PhraseBuilder/Boxes.tsx';

// The stance toolbar names each stance and then the connector it picks, both from the catalog
// (C13). These are the English fallbacks the component shows while the bundle is in flight.
const SENTIMENT_LABEL: Record<CauseSentiment, string> = {
  neutral: 'Neutral — because of',
  negative: 'Negative — through the fault of',
  positive: 'Positive — thanks to',
};
import type { GroupRect } from '../src/components/PhraseBuilder/graph.ts';
import type { SlotKey } from '../src/components/PhraseBuilder/interfaces.ts';
import type { PhraseRenderContext } from '../src/components/PhraseBuilder/phraseRender.tsx';
import { toolbarControlKey } from '../src/components/PhraseBuilder/ringSpecs.ts';
import { ALL_SLOTS } from '../src/components/PhraseBuilder/slots.ts';
import { VerbPhraseBuilder } from '../src/components/PhraseBuilder/VerbPhraseBuilder.tsx';
import { renderWithProviders } from './render.tsx';

const noun = (id: string): Concept => ({ id, role: 'noun', description: id, label: id });

const slots = (...keys: SlotKey[]) => keys.map((k) => ALL_SLOTS.find((s) => s.key === k)!);

// A constituent's rings, as the ring layout lays them out: centred at (200, 150), radius 80.
const ring = (label: string, mainKey: string, extra: Partial<GroupRect> = {}): GroupRect => ({
  label,
  color: '#000',
  mainKey,
  nodeKeys: [mainKey],
  center: { x: 200, y: 150 },
  rIn: 40,
  orbit: 40,
  rOut: 80,
  x: 109,
  y: 59,
  width: 182,
  height: 182,
  ...extra,
});

const VERB_PHRASE = ring('Verb Phrase', 'verb');

const toggle = (key: string): SatelliteIcon => ({
  key,
  icon: null,
  label: key,
  active: false,
  isSet: false,
  valued: false,
  onToggle: vi.fn(),
});

// The render bag PhraseBuilder threads down, with inert handlers. Each drag prop set releases
// straight into its activation, as a press that never moved does on the canvas.
function makeCtx(overrides: Partial<PhraseRenderContext> = {}): PhraseRenderContext {
  return {
    selection: {},
    activeSlot: null,
    renderedSlots: [],
    shownMap: {},
    satelliteIconsByParent: {},
    complementToggleIcons: [],
    groupRects: [],
    discs: {},
    controlPos: {},
    collapsedGroups: {},
    compact: false,
    draggingKey: null,
    makeDragProps: vi.fn((_key: string, onActivate: () => void) => ({
      onPointerDown: () => {},
      onPointerMove: () => {},
      onPointerUp: () => onActivate(),
      onPointerCancel: () => {},
      sx: {},
    })),
    makeGroupDragProps: () => ({
      onPointerDown: () => {},
      onPointerMove: () => {},
      onPointerUp: () => {},
      onPointerCancel: () => {},
    }),
    slotEls: { current: new Map() },
    handleSlotClick: vi.fn(),
    editingSlot: null,
    handleEditSlot: vi.fn(),
    handleCancelEdit: vi.fn(),
    handleConceptSelect: vi.fn(),
    slotKind: () => '',
    onSlotKindChange: vi.fn(),
    handleClear: vi.fn(),
    handleToggleNumber: vi.fn(),
    handleToggleGender: vi.fn(),
    handleSetDefiniteness: vi.fn(),
    handleCycleModifierRelation: vi.fn(),
    handleCycleModifierNumber: vi.fn(),
    handleSetModifierAdjective: vi.fn(),
    handleCycleDegree: vi.fn(),
    handleToggleNegative: vi.fn(),
    handleCycleTense: vi.fn(),
    handleCycleAspect: vi.fn(),
    handleCycleVoice: vi.fn(),
    handleSelectSpecifier: vi.fn(),
    handleSelectLocativeSpecifier: vi.fn(),
    handleSelectTemporalRelation: vi.fn(),
    handleSelectPredication: vi.fn(),
    handleSelectDirectionSpecifier: vi.fn(),
    handleSelectSentiment: vi.fn(),
    handleToggleCollapse: vi.fn(),
    handleRemoveComplement: vi.fn(),
    satelliteKeys: {},
    determinerMenuFor: null,
    onDeterminerMenu: vi.fn(),
    complementMenuOpen: false,
    onComplementMenu: vi.fn(),
    toolbarFor: null,
    onArmToolbar: vi.fn(),
    ...overrides,
  };
}

function renderVerb(overrides: Partial<PhraseRenderContext> = {}) {
  const ctx = makeCtx(overrides);
  const view = renderWithProviders(<VerbPhraseBuilder ctx={ctx} />);
  return { ...view, ctx };
}

const boxes = () => screen.queryAllByTestId(/^box-/).map((b) => b.dataset['testid']);

// A toggle as a plain box (no disc to sit in), found by its heading.
const toggleBox = (heading: string) =>
  screen.getByText(heading).closest<HTMLElement>('.MuiPaper-root')!;

// Where an overlay control is pinned on the canvas: its nearest absolutely placed ancestor.
function pinOf(el: HTMLElement) {
  let node: HTMLElement | null = el;
  while (node && getComputedStyle(node).position !== 'absolute') node = node.parentElement;
  const style = getComputedStyle(node!);
  return { x: parseFloat(style.left), y: parseFloat(style.top) };
}

// The relation / stance each toolbar has highlighted: the button filled in its colour. On a ring
// the others sit on the plain paper (MUI's default, white) rather than on nothing.
const highlighted = () =>
  screen
    .getAllByRole('button')
    .filter((b) => !['rgba(0, 0, 0, 0)', 'rgb(255, 255, 255)'].includes(getComputedStyle(b).backgroundColor))
    .map((b) => b.getAttribute('aria-label'));

describe('VerbPhraseBuilder', () => {
  describe('its rings and words', () => {
    it('draws the verb phrase’s dotted ring, and no other', () => {
      renderVerb({
        groupRects: [ring('Subject', 'subject'), VERB_PHRASE, ring('Direct Object', 'directObject')],
      });

      expect(screen.getAllByTestId('group-box').map((g) => g.dataset['group'])).toEqual([
        'Verb Phrase',
      ]);
    });

    it('draws no dotted ring before the verb phrase has one', () => {
      renderVerb({ groupRects: [ring('Subject', 'subject')] });

      expect(screen.queryByTestId('group-box')).not.toBeInTheDocument();
    });

    it('places the verb, its adverb and each modal with its adverb, and nothing else', () => {
      renderVerb({
        renderedSlots: slots(
          'subject',
          'verbModal',
          'verb',
          'subjectAdjective',
          'modifier',
          'verbModalAdverb',
          'directObject',
          'verbModal2',
          'verbModal2Adverb',
          'locative',
        ),
      });

      expect(boxes()).toEqual([
        'box-verbModal',
        'box-verb',
        'box-modifier',
        'box-verbModalAdverb',
        'box-verbModal2',
        'box-verbModal2Adverb',
      ]);
    });
  });

  describe('the tense and aspect toggles', () => {
    it('stay off the canvas until their controls reveal them', () => {
      renderVerb({ shownMap: { modifier: true } });

      expect(screen.queryByText('Tense')).not.toBeInTheDocument();
      expect(screen.queryByText('Aspect')).not.toBeInTheDocument();
    });

    it('read the implicit present and neutral aspect', () => {
      renderVerb({ shownMap: { verbTense: true, verbAspect: true } });

      expect(toggleBox('Tense')).toHaveTextContent('Present');
      expect(toggleBox('Aspect')).toHaveTextContent('Neutral');
    });

    it('read the tense and aspect the verb carries', () => {
      renderVerb({
        shownMap: { verbTense: true, verbAspect: true },
        selection: { verbTense: 'future', verbAspect: 'progressive' },
      });

      expect(toggleBox('Tense')).toHaveTextContent('Future');
      expect(toggleBox('Aspect')).toHaveTextContent('Progressive');
    });

    it('sit on the orbit as discs of the radius the ring layout gave them', () => {
      renderVerb({
        shownMap: { verbTense: true, verbAspect: true },
        discs: {
          verbTense: { x: 150, y: 60, r: 20, a: 0 },
          verbAspect: { x: 250, y: 60, r: 30, a: 0 },
        },
      });

      const width = (key: string) =>
        getComputedStyle(screen.getByTestId(`box-${key}`).querySelector('.slot-circle')!).width;
      expect(width('verbTense')).toBe('40px');
      expect(width('verbAspect')).toBe('60px');
      expect(screen.getByTitle('Tense: Present')).toBeInTheDocument();
    });

    it('cycle the tense and the aspect each from its own toggle', () => {
      const { ctx } = renderVerb({ shownMap: { verbTense: true, verbAspect: true } });

      fireEvent.pointerUp(toggleBox('Tense'));
      expect(ctx.handleCycleTense).toHaveBeenCalledOnce();
      expect(ctx.handleCycleAspect).not.toHaveBeenCalled();

      fireEvent.pointerUp(toggleBox('Aspect'));
      expect(ctx.handleCycleAspect).toHaveBeenCalledOnce();
      expect(ctx.handleCycleTense).toHaveBeenCalledOnce();
    });

    it('drag under their own keys, and register for measuring under them', () => {
      const { ctx, unmount } = renderVerb({ shownMap: { verbTense: true, verbAspect: true } });

      expect(vi.mocked(ctx.makeDragProps).mock.calls.map(([key]) => key)).toEqual([
        'verbTense',
        'verbAspect',
      ]);
      expect(ctx.slotEls.current.get('verbTense')).toContainElement(toggleBox('Tense'));
      expect(ctx.slotEls.current.get('verbAspect')).toContainElement(toggleBox('Aspect'));

      unmount();

      expect([...ctx.slotEls.current.keys()]).toEqual([]);
    });
  });

  describe('the complement toggles', () => {
    it('each sit where the ring layout seated it on the verb phrase’s dotted ring', () => {
      renderVerb({
        groupRects: [VERB_PHRASE],
        complementToggleIcons: [toggle('locative'), toggle('cause')],
        controlPos: { locative: { x: 190, y: 240 }, cause: { x: 212, y: 240 } },
      });

      expect(pinOf(screen.getByTestId('satellite-locative'))).toEqual({ x: 190, y: 240 });
      expect(pinOf(screen.getByTestId('satellite-cause'))).toEqual({ x: 212, y: 240 });
    });

    it('each reveal their own complement', () => {
      const locative = toggle('locative');
      const cause = toggle('cause');
      renderVerb({
        groupRects: [VERB_PHRASE],
        complementToggleIcons: [locative, cause],
        controlPos: { locative: { x: 0, y: 0 }, cause: { x: 30, y: 0 } },
      });

      fireEvent.click(screen.getByTestId('satellite-cause'));

      expect(cause.onToggle).toHaveBeenCalledOnce();
      expect(locative.onToggle).not.toHaveBeenCalled();
    });

    it('register the instrumental’s toggle as the anchor an instrumental link starts from', () => {
      const registerVerbAnchor = vi.fn();
      renderVerb({
        groupRects: [VERB_PHRASE],
        complementToggleIcons: [toggle('locative'), toggle('instrumental')],
        controlPos: { locative: { x: 0, y: 0 }, instrumental: { x: 30, y: 0 } },
        registerVerbAnchor,
      });

      const anchor = registerVerbAnchor.mock.calls.at(-1)![0] as HTMLElement;
      expect(anchor).toContainElement(screen.getByTestId('satellite-instrumental'));
      expect(anchor).not.toContainElement(screen.getByTestId('satellite-locative'));
    });

    it('are left off until the ring layout seats them', () => {
      renderVerb({ complementToggleIcons: [toggle('locative')] });

      expect(screen.queryByTestId('satellite-locative')).not.toBeInTheDocument();
    });

    it('are withdrawn in compact view', () => {
      renderVerb({
        complementToggleIcons: [toggle('locative')],
        controlPos: { locative: { x: 0, y: 0 } },
        compact: true,
      });

      expect(screen.queryByTestId('satellite-locative')).not.toBeInTheDocument();
    });
  });

  describe('the direct object control', () => {
    it('sits where the ring layout seated it, where the line to the object leaves the ring', () => {
      renderVerb({
        groupRects: [VERB_PHRASE, ring('Direct Object', 'directObject')],
        directObjectToggle: toggle('directObject'),
        controlPos: { directObject: { x: 290, y: 150 } },
      });

      expect(pinOf(screen.getByTestId('satellite-directObject'))).toEqual({ x: 290, y: 150 });
    });

    it('folds the object from its control', () => {
      const directObject = toggle('directObject');
      renderVerb({
        groupRects: [VERB_PHRASE],
        directObjectToggle: directObject,
        controlPos: { directObject: { x: 290, y: 150 } },
      });

      fireEvent.click(screen.getByTestId('satellite-directObject'));

      expect(directObject.onToggle).toHaveBeenCalledOnce();
    });

    it('is not drawn for an intransitive verb, or before the ring layout seats it', () => {
      const { rerender } = renderVerb({
        groupRects: [VERB_PHRASE],
        controlPos: { directObject: { x: 290, y: 150 } },
      });
      expect(screen.queryByTestId('satellite-directObject')).not.toBeInTheDocument();

      rerender(<VerbPhraseBuilder ctx={makeCtx({ directObjectToggle: toggle('directObject') })} />);
      expect(screen.queryByTestId('satellite-directObject')).not.toBeInTheDocument();
    });
  });

  describe('the relation toolbars', () => {
    const ROUTE = ring('Route', 'route', { removeKey: 'route' });
    const LOCATIVE = ring('Locative', 'locative', { removeKey: 'locative' });
    const TEMPORAL = ring('Temporal', 'temporal', { removeKey: 'temporal' });
    const CAUSE = ring('Cause', 'cause', { removeKey: 'cause' });
    // One seat per relation, fanned across the top of each complement's dotted ring.
    const seats = (type: string, values: readonly string[], x: number) =>
      Object.fromEntries(values.map((v, i) => [toolbarControlKey(type, v), { x: x + 22 * i, y: 40 }]));
    const CONTROL_POS = {
      ...seats('route', PATH_SPECIFIERS, 20),
      ...seats('locative', PATH_SPECIFIERS, 220),
      ...seats('temporal', TEMPORAL_RELATIONS, 620),
      ...seats('cause', CAUSE_SENTIMENTS, 420),
    };

    it('ride the top of the route’s ring, on "through" until one is chosen', () => {
      renderVerb({ selection: { route: noun('PARK') }, groupRects: [ROUTE], controlPos: CONTROL_POS });

      expect(highlighted()).toEqual(['through']);
      expect(pinOf(screen.getByRole('button', { name: 'under' }))).toEqual({ x: 64, y: 40 });
    });

    it('show and set the route’s relation', () => {
      const { ctx } = renderVerb({
        selection: { route: noun('PARK'), routeSpecifier: 'around' },
        groupRects: [ROUTE],
        controlPos: CONTROL_POS,
      });
      expect(highlighted()).toEqual(['around']);

      fireEvent.click(screen.getByRole('button', { name: 'behind' }));

      expect(ctx.handleSelectSpecifier).toHaveBeenCalledExactlyOnceWith('behind');
      expect(ctx.handleSelectLocativeSpecifier).not.toHaveBeenCalled();
    });

    it('ride the top of the locative’s ring, on "in" until one is chosen', () => {
      renderVerb({ selection: { locative: noun('BED') }, groupRects: [LOCATIVE], controlPos: CONTROL_POS });

      expect(highlighted()).toEqual(['in']);
      expect(pinOf(screen.getByRole('button', { name: 'over' }))).toEqual({ x: 286, y: 40 });
    });

    it('show and set the locative’s relation', () => {
      const { ctx } = renderVerb({
        selection: { locative: noun('BED'), locativeSpecifier: 'under' },
        groupRects: [LOCATIVE],
        controlPos: CONTROL_POS,
      });
      expect(highlighted()).toEqual(['under']);

      fireEvent.click(screen.getByRole('button', { name: 'in front of' }));

      expect(ctx.handleSelectLocativeSpecifier).toHaveBeenCalledExactlyOnceWith('in_front_of');
      expect(ctx.handleSelectSpecifier).not.toHaveBeenCalled();
    });

    // P09-E12b: the temporal's six relations, `at` until one is chosen.
    it('ride the top of the temporal’s ring, on "at" until one is chosen', () => {
      renderVerb({ selection: { temporal: noun('DAY') }, groupRects: [TEMPORAL], controlPos: CONTROL_POS });

      expect(screen.getByTestId('temporal-toolbar')).toBeInTheDocument();
      expect(highlighted()).toEqual(['at']);
      expect(pinOf(screen.getByRole('button', { name: 'ago' }))).toEqual({ x: 642, y: 40 });
    });

    it('show and set the temporal’s relation', () => {
      const { ctx } = renderVerb({
        selection: { temporal: noun('DAY'), temporalRelation: 'until' },
        groupRects: [TEMPORAL],
        controlPos: CONTROL_POS,
      });
      expect(highlighted()).toEqual(['until']);

      fireEvent.click(screen.getByRole('button', { name: 'during' }));

      expect(ctx.handleSelectTemporalRelation).toHaveBeenCalledExactlyOnceWith('during');
      expect(ctx.handleSelectSpecifier).not.toHaveBeenCalled();
    });

    it('ride the top of the cause’s ring, neutral until a stance is chosen', () => {
      renderVerb({ selection: { cause: noun('DOG') }, groupRects: [CAUSE], controlPos: CONTROL_POS });

      expect(highlighted()).toEqual([SENTIMENT_LABEL.neutral]);
      expect(pinOf(screen.getByRole('button', { name: SENTIMENT_LABEL.positive }))).toEqual(
        { x: 464, y: 40 },
      );
    });

    it('show and set the cause’s stance', () => {
      const { ctx } = renderVerb({
        selection: { cause: noun('DOG'), causeSentiment: 'negative' },
        groupRects: [CAUSE],
        controlPos: CONTROL_POS,
      });
      expect(highlighted()).toEqual([SENTIMENT_LABEL.negative]);

      fireEvent.click(screen.getByRole('button', { name: SENTIMENT_LABEL.positive }));

      expect(ctx.handleSelectSentiment).toHaveBeenCalledExactlyOnceWith('positive');
    });

    it('are withdrawn in compact view, with the rest of the dotted rings’ controls', () => {
      renderVerb({
        selection: { route: noun('PARK'), locative: noun('BED'), cause: noun('DOG') },
        groupRects: [ROUTE, LOCATIVE, CAUSE],
        controlPos: CONTROL_POS,
        compact: true,
      });

      expect(screen.queryByTestId('specifier-toolbar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('sentiment-toolbar')).not.toBeInTheDocument();
    });

    it('need both the complement’s word and their seats on its ring', () => {
      const toolbars = () => [
        ...screen.queryAllByRole('button', { name: 'under' }),
        ...screen.queryAllByRole('button', { name: SENTIMENT_LABEL.neutral }),
      ];
      const { rerender } = renderVerb({ groupRects: [ROUTE, LOCATIVE, CAUSE], controlPos: CONTROL_POS });
      expect(toolbars()).toEqual([]);

      rerender(
        <VerbPhraseBuilder
          ctx={makeCtx({
            selection: { route: noun('PARK'), locative: noun('BED'), cause: noun('DOG') },
            groupRects: [VERB_PHRASE],
          })}
        />,
      );
      expect(toolbars()).toEqual([]);
    });
  });
});
