import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { CAUSE_SENTIMENT_LABELS, type Concept } from '@signi/shared';
import type { SatelliteIcon } from '../src/components/PhraseBuilder/Boxes.tsx';
import type { GroupRect } from '../src/components/PhraseBuilder/graph.ts';
import type { SlotKey } from '../src/components/PhraseBuilder/interfaces.ts';
import type { PhraseRenderContext } from '../src/components/PhraseBuilder/phraseRender.tsx';
import { ALL_SLOTS } from '../src/components/PhraseBuilder/slots.ts';
import { VerbPhraseBuilder } from '../src/components/PhraseBuilder/VerbPhraseBuilder.tsx';
import { renderWithProviders } from './render.tsx';

const noun = (id: string): Concept => ({ id, role: 'noun', description: id, label: id });

const slots = (...keys: SlotKey[]) => keys.map((k) => ALL_SLOTS.find((s) => s.key === k)!);

const group = (
  label: string,
  [x, y, width, height]: [number, number, number, number],
  extra: Partial<GroupRect> = {},
): GroupRect => ({ label, color: '#000', nodeKeys: [], x, y, width, height, ...extra });

// Centred at (200, 150).
const VERB_PHRASE = group('Verb Phrase', [100, 100, 200, 100], { nodeKeys: ['verb'] });

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
    handleSelectSpecifier: vi.fn(),
    handleSelectLocativeSpecifier: vi.fn(),
    handleSelectSentiment: vi.fn(),
    handleToggleCollapse: vi.fn(),
    handleRearrangeGroup: vi.fn(),
    handleRemoveComplement: vi.fn(),
    ...overrides,
  };
}

function renderVerb(overrides: Partial<PhraseRenderContext> = {}) {
  const ctx = makeCtx(overrides);
  const view = renderWithProviders(<VerbPhraseBuilder ctx={ctx} />);
  return { ...view, ctx };
}

const boxes = () => screen.queryAllByTestId(/^box-/).map((b) => b.dataset['testid']);

// A toggle box, found by its heading.
const toggleBox = (heading: string) =>
  screen.getByText(heading).closest<HTMLElement>('.MuiPaper-root')!;

// Where an overlay control is pinned on the canvas: its nearest absolutely placed ancestor.
function pinOf(el: HTMLElement) {
  let node: HTMLElement | null = el;
  while (node && getComputedStyle(node).position !== 'absolute') node = node.parentElement;
  const style = getComputedStyle(node!);
  return { x: parseFloat(style.left), y: parseFloat(style.top) };
}

// The relation / stance each toolbar has highlighted (its filled buttons).
const highlighted = () =>
  screen
    .getAllByRole('button')
    .filter((b) => getComputedStyle(b).backgroundColor !== 'rgba(0, 0, 0, 0)')
    .map((b) => b.getAttribute('aria-label'));

describe('VerbPhraseBuilder', () => {
  describe('its boxes', () => {
    it('draws the verb phrase’s dotted box, and no other', () => {
      renderVerb({
        groupRects: [
          group('Subject', [0, 0, 50, 50]),
          VERB_PHRASE,
          group('Direct Object', [300, 0, 50, 50]),
        ],
      });

      expect(screen.getAllByTestId('group-box').map((g) => g.dataset['group'])).toEqual([
        'Verb Phrase',
      ]);
    });

    it('draws no dotted box before the verb phrase has one', () => {
      renderVerb({ groupRects: [group('Subject', [0, 0, 50, 50])] });

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

  describe('the tense and aspect boxes', () => {
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

    it('cycle the tense and the aspect each from its own box', () => {
      const { ctx } = renderVerb({ shownMap: { verbTense: true, verbAspect: true } });

      fireEvent.pointerUp(toggleBox('Tense'));
      expect(ctx.handleCycleTense).toHaveBeenCalledOnce();
      expect(ctx.handleCycleAspect).not.toHaveBeenCalled();

      fireEvent.pointerUp(toggleBox('Aspect'));
      expect(ctx.handleCycleAspect).toHaveBeenCalledOnce();
      expect(ctx.handleCycleTense).toHaveBeenCalledOnce();
    });

    it('drag as their own nodes, and register for measuring under their keys', () => {
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
    it('ride the middle of the verb phrase box’s bottom edge', () => {
      renderVerb({
        groupRects: [VERB_PHRASE],
        complementToggleIcons: [toggle('locative'), toggle('cause')],
      });

      expect(pinOf(screen.getByTestId('satellite-locative'))).toEqual({ x: 200, y: 200 });
      expect(pinOf(screen.getByTestId('satellite-cause'))).toEqual({ x: 200, y: 200 });
    });

    it('each reveal their own complement', () => {
      const locative = toggle('locative');
      const cause = toggle('cause');
      renderVerb({ groupRects: [VERB_PHRASE], complementToggleIcons: [locative, cause] });

      fireEvent.click(screen.getByTestId('satellite-cause'));

      expect(cause.onToggle).toHaveBeenCalledOnce();
      expect(locative.onToggle).not.toHaveBeenCalled();
    });

    it('register their row as the anchor an instrumental link starts from', () => {
      const registerVerbAnchor = vi.fn();
      renderVerb({
        groupRects: [VERB_PHRASE],
        complementToggleIcons: [toggle('locative')],
        registerVerbAnchor,
      });

      const anchor = registerVerbAnchor.mock.calls.at(-1)![0] as HTMLElement;
      expect(anchor).toContainElement(screen.getByTestId('satellite-locative'));
    });

    it('are not drawn for a verb that licenses no complement', () => {
      const registerVerbAnchor = vi.fn();
      renderVerb({ groupRects: [VERB_PHRASE], registerVerbAnchor });

      expect(screen.queryByTestId(/^satellite-/)).not.toBeInTheDocument();
      expect(registerVerbAnchor).not.toHaveBeenCalled();
    });

    it('wait for the verb phrase box to exist', () => {
      renderVerb({ complementToggleIcons: [toggle('locative')] });

      expect(screen.queryByTestId('satellite-locative')).not.toBeInTheDocument();
    });
  });

  describe('the direct object control', () => {
    it('sits where the connector to the object leaves the verb phrase box', () => {
      // Object box centred at (400, 300): the ray from (200, 150) exits the bottom edge.
      renderVerb({
        groupRects: [VERB_PHRASE, group('Direct Object', [350, 250, 100, 100])],
        directObjectToggle: toggle('directObject'),
      });

      const pin = pinOf(screen.getByTestId('satellite-directObject'));
      expect(pin.x).toBeCloseTo(200 + 200 / 3);
      expect(pin.y).toBeCloseTo(200);
    });

    it('parks on the right edge while the object is folded away', () => {
      renderVerb({ groupRects: [VERB_PHRASE], directObjectToggle: toggle('directObject') });

      expect(pinOf(screen.getByTestId('satellite-directObject'))).toEqual({ x: 300, y: 150 });
    });

    it('folds the object from its control', () => {
      const directObject = toggle('directObject');
      renderVerb({ groupRects: [VERB_PHRASE], directObjectToggle: directObject });

      fireEvent.click(screen.getByTestId('satellite-directObject'));

      expect(directObject.onToggle).toHaveBeenCalledOnce();
    });

    it('is not drawn for an intransitive verb, or before the verb phrase box exists', () => {
      const { rerender } = renderVerb({ groupRects: [VERB_PHRASE] });
      expect(screen.queryByTestId('satellite-directObject')).not.toBeInTheDocument();

      rerender(<VerbPhraseBuilder ctx={makeCtx({ directObjectToggle: toggle('directObject') })} />);
      expect(screen.queryByTestId('satellite-directObject')).not.toBeInTheDocument();
    });
  });

  describe('the relation toolbars', () => {
    const ROUTE = group('Route', [20, 240, 160, 80], { removeKey: 'route' });
    const LOCATIVE = group('Locative', [220, 240, 120, 80], { removeKey: 'locative' });
    const CAUSE = group('Cause', [400, 240, 100, 80], { removeKey: 'cause' });

    it('ride the top edge of the route box, on "through" until one is chosen', () => {
      renderVerb({ selection: { route: noun('PARK') }, groupRects: [ROUTE] });

      expect(highlighted()).toEqual(['through']);
      expect(pinOf(screen.getByRole('button', { name: 'under' }))).toEqual({ x: 100, y: 240 });
    });

    it('show and set the route’s relation', () => {
      const { ctx } = renderVerb({
        selection: { route: noun('PARK'), routeSpecifier: 'around' },
        groupRects: [ROUTE],
      });
      expect(highlighted()).toEqual(['around']);

      fireEvent.click(screen.getByRole('button', { name: 'behind' }));

      expect(ctx.handleSelectSpecifier).toHaveBeenCalledExactlyOnceWith('behind');
      expect(ctx.handleSelectLocativeSpecifier).not.toHaveBeenCalled();
    });

    it('ride the top edge of the locative box, on "in" until one is chosen', () => {
      renderVerb({ selection: { locative: noun('BED') }, groupRects: [LOCATIVE] });

      expect(highlighted()).toEqual(['in']);
      expect(pinOf(screen.getByRole('button', { name: 'over' }))).toEqual({ x: 280, y: 240 });
    });

    it('show and set the locative’s relation', () => {
      const { ctx } = renderVerb({
        selection: { locative: noun('BED'), locativeSpecifier: 'under' },
        groupRects: [LOCATIVE],
      });
      expect(highlighted()).toEqual(['under']);

      fireEvent.click(screen.getByRole('button', { name: 'in front of' }));

      expect(ctx.handleSelectLocativeSpecifier).toHaveBeenCalledExactlyOnceWith('in_front_of');
      expect(ctx.handleSelectSpecifier).not.toHaveBeenCalled();
    });

    it('ride the top edge of the cause box, neutral until a stance is chosen', () => {
      renderVerb({ selection: { cause: noun('DOG') }, groupRects: [CAUSE] });

      expect(highlighted()).toEqual([CAUSE_SENTIMENT_LABELS.neutral]);
      expect(pinOf(screen.getByRole('button', { name: CAUSE_SENTIMENT_LABELS.positive }))).toEqual(
        { x: 450, y: 240 },
      );
    });

    it('show and set the cause’s stance', () => {
      const { ctx } = renderVerb({
        selection: { cause: noun('DOG'), causeSentiment: 'negative' },
        groupRects: [CAUSE],
      });
      expect(highlighted()).toEqual([CAUSE_SENTIMENT_LABELS.negative]);

      fireEvent.click(screen.getByRole('button', { name: CAUSE_SENTIMENT_LABELS.positive }));

      expect(ctx.handleSelectSentiment).toHaveBeenCalledExactlyOnceWith('positive');
    });

    it('need both the complement’s word and its box', () => {
      const toolbars = () => [
        ...screen.queryAllByRole('button', { name: 'under' }),
        ...screen.queryAllByRole('button', { name: CAUSE_SENTIMENT_LABELS.neutral }),
      ];
      const { rerender } = renderVerb({ groupRects: [ROUTE, LOCATIVE, CAUSE] });
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
