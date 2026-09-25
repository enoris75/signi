import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { Concept } from '@signi/shared';
import {
  SlotNode,
  nodeElRef,
  type PhraseRenderContext,
} from '../src/components/PhraseBuilder/phraseRender.tsx';
import type { PhraseSelection, SlotKey } from '../src/components/PhraseBuilder/interfaces.ts';
import type { GroupRect } from '../src/components/PhraseBuilder/graph.ts';
import { ALL_SLOTS } from '../src/components/PhraseBuilder/slots.ts';
import { renderWithProviders, type Seed } from './render.tsx';

const concept = (id: string, role: Concept['role']): Concept => ({
  id,
  role,
  description: `the ${id.toLowerCase()}`,
  label: id.toLowerCase(),
});

const CAT = concept('CAT', 'noun');
const BOAT = concept('BOAT', 'noun');
const SAIL = concept('SAIL', 'noun');
const LEGEND = concept('LEGEND', 'noun');
const BIG = concept('BIG', 'adjective');
const HAPPY = concept('HAPPY', 'adjective');
const SEMANTIC = concept('SEMANTIC', 'adjective');
const SEE = concept('SEE', 'verb');

// Every vocabulary a picker might ask for, so none of them reaches for the network.
const CONCEPTS: Seed['concepts'] = {
  noun: [CAT, BOAT, SAIL, LEGEND],
  pronoun: [],
  adjective: [BIG, HAPPY, SEMANTIC],
  verb: [SEE],
  adverb: [],
};

const slot = (key: SlotKey) => ALL_SLOTS.find((s) => s.key === key)!;

function context(overrides: Partial<PhraseRenderContext> = {}) {
  const startDrag = vi.fn(() => {});
  const ctx: PhraseRenderContext = {
    selection: {},
    activeSlot: null,
    renderedSlots: [slot('subject'), slot('verb'), slot('directObject')],
    shownMap: {},
    satelliteIconsByParent: {},
    complementToggleIcons: [],
    groupRects: [],
    discs: {},
    controlPos: {},
    collapsedGroups: {},
    compact: false,
    draggingKey: null,
    // Like useDrag, a press released without travel counts as a click on the node.
    makeDragProps: vi.fn((_key: string, onActivate: () => void) => ({
      onPointerDown: startDrag,
      onPointerMove: () => {},
      onPointerUp: onActivate,
      onPointerCancel: () => {},
      sx: { position: 'absolute', left: '25%', top: '40%' },
    })),
    makeGroupDragProps: () => ({
      onPointerDown: () => {},
      onPointerMove: () => {},
      onPointerUp: () => {},
      onPointerCancel: () => {},
    }),
    slotEls: { current: new Map() },
    handleSlotClick: vi.fn(() => {}),
    editingSlot: null,
    handleEditSlot: vi.fn(() => {}),
    handleCancelEdit: vi.fn(() => {}),
    handleConceptSelect: vi.fn(() => {}),
    slotKind: (key) => (/Adjective\d?$/.test(key) ? 'adjective' : 'noun'),
    onSlotKindChange: vi.fn(() => {}),
    handleClear: vi.fn(() => {}),
    handleToggleNumber: vi.fn(() => {}),
    handleToggleGender: vi.fn(() => {}),
    handleSetDefiniteness: vi.fn(() => {}),
    handleCycleModifierRelation: vi.fn(() => {}),
    handleCycleModifierNumber: vi.fn(() => {}),
    handleSetModifierAdjective: vi.fn(() => {}),
    handleCycleDegree: vi.fn(() => {}),
    handleToggleNegative: vi.fn(() => {}),
    handleCycleTense: vi.fn(() => {}),
    handleCycleAspect: vi.fn(() => {}),
    handleCycleVoice: vi.fn(() => {}),
    handleSelectSpecifier: vi.fn(() => {}),
    handleSelectLocativeSpecifier: vi.fn(() => {}),
    handleSelectTemporalRelation: vi.fn(() => {}),
    handleSelectPredication: vi.fn(() => {}),
    handleSetNumeral: vi.fn(() => {}),
    handleSetContrastive: vi.fn(() => {}),
    handleSelectDirectionSpecifier: vi.fn(() => {}),
    handleSelectSentiment: vi.fn(() => {}),
    handleToggleCollapse: vi.fn(() => {}),
    handleRemoveComplement: vi.fn(() => {}),
    satelliteKeys: {},
    determinerMenuFor: null,
    onDeterminerMenu: vi.fn(),
    complementMenuOpen: false,
    onComplementMenu: vi.fn(),
    toolbarFor: null,
    onArmToolbar: vi.fn(),
    ...overrides,
  };
  return { ctx, startDrag };
}

// The draggable node around a slot's box.
const nodeOf = (key: SlotKey) => screen.getByTestId(`box-${key}`).parentElement!;
// The outlined card inside the box, which carries its border and width.
const cardOf = (key: SlotKey) => screen.getByTestId(`box-${key}`).firstElementChild!;

function renderNodes(keys: SlotKey[], overrides: Partial<PhraseRenderContext> = {}) {
  const { ctx, startDrag } = context(overrides);
  const view = renderWithProviders(
    <>
      {keys.map((key) => (
        <SlotNode key={key} slot={slot(key)} ctx={ctx} />
      ))}
    </>,
    { concepts: CONCEPTS },
  );
  return { ...view, ctx, startDrag };
}

function renderNode(key: SlotKey, overrides: Partial<PhraseRenderContext> = {}) {
  const view = renderNodes([key], overrides);
  return { ...view, node: nodeOf(key) };
}

const option = (id: string) =>
  screen.getAllByTestId('typeahead-option').find((row) => row.dataset['concept'] === id)!;

describe('nodeElRef', () => {
  it('registers a node’s element under its key and forgets it once detached', () => {
    const { ctx } = context();
    const tense = document.createElement('div');
    const aspect = document.createElement('div');

    nodeElRef(ctx, 'verbTense')(tense);
    nodeElRef(ctx, 'verbAspect')(aspect);
    expect(ctx.slotEls.current.get('verbTense')).toBe(tense);

    nodeElRef(ctx, 'verbTense')(null);
    expect(ctx.slotEls.current.has('verbTense')).toBe(false);
    expect(ctx.slotEls.current.get('verbAspect')).toBe(aspect);
  });
});

describe('SlotNode', () => {
  describe('on the canvas', () => {
    it('shows the slot’s word in its box', () => {
      renderNode('subject', { selection: { subject: CAT } });

      expect(screen.getByTestId('box-subject')).toHaveTextContent('cat');
    });

    it('is positioned and dragged by the drag machinery, under its own key', () => {
      const { ctx, node, startDrag } = renderNode('verb');

      expect(ctx.makeDragProps).toHaveBeenCalledWith('verb', expect.any(Function));
      expect(getComputedStyle(node).left).toBe('25%');
      fireEvent.pointerDown(node);
      expect(startDrag).toHaveBeenCalledOnce();
    });

    it('is reachable from the keyboard', () => {
      const { node } = renderNode('verb');

      expect(node).toHaveAttribute('tabindex', '0');
    });

    it('registers its element for measuring and with the workspace until unmounted', () => {
      const onBoxRef = vi.fn(() => {});
      const { ctx, node, unmount } = renderNode('subject', { onBoxRef });

      expect(ctx.slotEls.current.get('subject')).toBe(node);
      expect(onBoxRef).toHaveBeenLastCalledWith('subject', node);

      unmount();

      expect(ctx.slotEls.current.has('subject')).toBe(false);
      expect(onBoxRef).toHaveBeenLastCalledWith('subject', null);
    });

    it('marks its box active while its slot is the active one', () => {
      const selection = { subject: CAT };
      const { unmount } = renderNode('subject', { selection, activeSlot: 'verb' });
      const idle = getComputedStyle(cardOf('subject')).borderColor;
      unmount();

      renderNode('subject', { selection, activeSlot: 'subject' });

      expect(getComputedStyle(cardOf('subject')).borderColor).not.toBe(idle);
    });

    it('clears its slot from the box’s clear button', () => {
      const { ctx } = renderNode('verb', { selection: { verb: SEE } });

      fireEvent.click(screen.getByRole('button', { name: 'Clear the verb' }));

      expect(ctx.handleClear).toHaveBeenCalledExactlyOnceWith('verb');
    });
  });

  describe('a click', () => {
    it('on an empty box selects its slot', () => {
      const { ctx, node } = renderNode('subject');

      fireEvent.pointerUp(node);

      expect(ctx.handleSlotClick).toHaveBeenCalledExactlyOnceWith('subject');
      expect(ctx.handleEditSlot).not.toHaveBeenCalled();
    });

    it('on a filled box that is not in hand only selects its slot', () => {
      const { ctx, node } = renderNode('subject', {
        selection: { subject: CAT },
        activeSlot: 'verb',
      });

      fireEvent.pointerDown(node);
      fireEvent.pointerUp(node);

      expect(ctx.handleSlotClick).toHaveBeenCalledExactlyOnceWith('subject');
      expect(ctx.handleEditSlot).not.toHaveBeenCalled();
    });

    it('on a filled box already in hand opens its word for re-picking', () => {
      const { ctx, node } = renderNode('subject', {
        selection: { subject: CAT },
        activeSlot: 'subject',
      });

      fireEvent.pointerDown(node);
      fireEvent.pointerUp(node);

      expect(ctx.handleEditSlot).toHaveBeenCalledExactlyOnceWith('subject');
      expect(ctx.handleSlotClick).not.toHaveBeenCalled();
    });

    it('still only selects when focus took the slot mid-click', () => {
      // The box takes focus on pointer-down and focus selects the slot, so the box is already
      // in hand by the time the click it started completes. What decides is the press.
      const { ctx } = context({ selection: { subject: CAT }, activeSlot: 'verb' });
      const { rerender } = renderWithProviders(<SlotNode slot={slot('subject')} ctx={ctx} />, {
        concepts: CONCEPTS,
      });

      fireEvent.pointerDown(nodeOf('subject'));
      rerender(<SlotNode slot={slot('subject')} ctx={{ ...ctx, activeSlot: 'subject' }} />);
      fireEvent.pointerUp(nodeOf('subject'));

      expect(ctx.handleSlotClick).toHaveBeenCalledExactlyOnceWith('subject');
      expect(ctx.handleEditSlot).not.toHaveBeenCalled();
    });

    it('on an eligible link target completes the link, however it is greyed', () => {
      const onPickTarget = vi.fn(() => {});
      const { ctx, node } = renderNode('subject', {
        selection: { subject: CAT },
        isPickTarget: (key) => key === 'subject',
        onPickTarget,
        dimmedKeys: new Set(['subject']),
      });

      fireEvent.pointerUp(node);

      expect(onPickTarget).toHaveBeenCalledExactlyOnceWith('subject');
      expect(ctx.handleEditSlot).not.toHaveBeenCalled();
    });

    it('on a greyed link target does nothing', () => {
      const onPickTarget = vi.fn(() => {});
      const { ctx, node } = renderNode('subject', {
        selection: { subject: CAT },
        isPickTarget: () => false,
        onPickTarget,
        dimmedKeys: new Set(['subject']),
      });

      fireEvent.pointerUp(node);

      expect(onPickTarget).not.toHaveBeenCalled();
      expect(ctx.handleEditSlot).not.toHaveBeenCalled();
      expect(ctx.handleSlotClick).not.toHaveBeenCalled();
    });

    it('on a box that is not a link target behaves as usual while linking', () => {
      const onPickTarget = vi.fn(() => {});
      const { ctx, node } = renderNode('subject', {
        selection: { subject: CAT },
        activeSlot: 'subject',
        isPickTarget: (key) => key === 'directObject',
        onPickTarget,
        dimmedKeys: new Set(['directObject']),
      });

      fireEvent.pointerDown(node);
      fireEvent.pointerUp(node);

      expect(ctx.handleEditSlot).toHaveBeenCalledExactlyOnceWith('subject');
      expect(onPickTarget).not.toHaveBeenCalled();
    });
  });

  describe('while linking', () => {
    it('greys a link target, leaving it nothing to clear', () => {
      renderNode('subject', { selection: { subject: CAT }, dimmedKeys: new Set(['subject']) });

      expect(screen.queryByRole('button', { name: 'Clear the subject' })).not.toBeInTheDocument();
    });

    it('highlights an eligible target', () => {
      renderNodes(['subject', 'verb'], {
        selection: { subject: CAT, verb: SEE },
        isPickTarget: (key) => key === 'subject',
      });

      expect(getComputedStyle(cardOf('subject')).borderStyle).toBe('dashed');
      expect(getComputedStyle(cardOf('verb')).borderStyle).toBe('solid');
    });
  });

  describe('the cursor', () => {
    const renderRow = () =>
      renderNodes(['subject', 'verb', 'directObject'], { selection: { subject: CAT } });

    it('selects its slot when the box takes focus', () => {
      const { ctx } = renderRow();

      act(() => nodeOf('verb').focus());

      expect(ctx.handleSlotClick).toHaveBeenCalledExactlyOnceWith('verb');
    });

    it('declares the scopes its keys are looked up in, from the word it holds', () => {
      renderNodes(['subject', 'verb', 'subjectAdjective'], {
        selection: { subject: CAT, verb: SEE },
      });

      expect(nodeOf('subject')).toHaveAttribute('data-kb-scope', 'box:noun box');
      expect(nodeOf('verb')).toHaveAttribute('data-kb-scope', 'box:verb box');
      expect(nodeOf('subjectAdjective')).toHaveAttribute('data-kb-scope', 'box:adjective box');
    });

    it('joins the walk the arrows and ⇥ move over', () => {
      renderRow();

      for (const key of ['subject', 'verb', 'directObject'] as const) {
        expect(nodeOf(key)).toHaveAttribute('data-kb-box', key);
        expect(nodeOf(key)).toHaveAttribute('tabindex', '0');
      }
    });

    // The box used to run a Tab/arrow loop over its period's slots, which trapped focus inside
    // one period. Moving the cursor is now the app's one key handler's job (see KeyboardProvider),
    // so every one of those keys passes straight through this box.
    it('runs no navigation of its own', () => {
      const { ctx } = renderRow();

      for (const key of ['Tab', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Enter']) {
        expect(fireEvent.keyDown(nodeOf('subject'), { key })).toBe(true);
      }
      expect(ctx.handleSlotClick).not.toHaveBeenCalled();
    });

    // esc steps out exactly one level: the first closes the picker's list (its own handler, which
    // keeps the key to itself), the second leaves the picker for the box it is in.
    it('steps out of the open picker back onto the box on a second esc', () => {
      const { node } = renderNode('subject', { activeSlot: 'subject' });
      const input = screen.getByPlaceholderText('type a subject…');

      fireEvent.keyDown(input, { key: 'Escape' });
      expect(node).not.toHaveFocus();

      fireEvent.keyDown(input, { key: 'Escape' });
      expect(node).toHaveFocus();
    });

    it('restores the word when esc steps out of a re-pick', () => {
      const { ctx, node } = renderNode('subject', {
        selection: { subject: CAT },
        editingSlot: 'subject',
      });
      const input = screen.getByPlaceholderText('type a subject…');

      fireEvent.keyDown(input, { key: 'Escape' });
      expect(ctx.handleCancelEdit).not.toHaveBeenCalled();

      fireEvent.keyDown(input, { key: 'Escape' });
      expect(node).toHaveFocus();
      expect(ctx.handleCancelEdit).toHaveBeenCalledExactlyOnceWith('subject');
    });
  });

  describe('re-picking a word', () => {
    const editing = { selection: { subject: CAT }, editingSlot: 'subject' as const };

    it('opens the slot’s picker over the word', () => {
      renderNode('subject', editing);

      expect(screen.getByPlaceholderText('type a subject…')).toBeInTheDocument();
      expect(screen.getByTestId('box-subject')).not.toHaveTextContent('cat');
    });

    it('restores the word once focus leaves the box', () => {
      const { ctx, node } = renderNode('subject', editing);

      fireEvent.blur(node, { relatedTarget: document.body });

      expect(ctx.handleCancelEdit).toHaveBeenCalledExactlyOnceWith('subject');
    });

    it('keeps the picker open while focus moves within the box', () => {
      const { ctx, node } = renderNode('subject', editing);

      fireEvent.blur(node, { relatedTarget: screen.getByPlaceholderText('type a subject…') });

      expect(ctx.handleCancelEdit).not.toHaveBeenCalled();
    });

    it('cancels nothing when focus leaves a box that is not being re-picked', () => {
      const { ctx, node } = renderNode('subject', { selection: { subject: CAT } });

      fireEvent.blur(node, { relatedTarget: document.body });

      expect(ctx.handleCancelEdit).not.toHaveBeenCalled();
    });

    it('leaves the other boxes showing their words', () => {
      const { ctx } = renderNodes(['subject', 'verb'], {
        selection: { subject: CAT, verb: SEE },
        editingSlot: 'verb',
      });

      expect(screen.getByTestId('box-subject')).toHaveTextContent('cat');
      fireEvent.blur(nodeOf('subject'), { relatedTarget: document.body });
      expect(ctx.handleCancelEdit).not.toHaveBeenCalled();
    });
  });

  describe('the word picker', () => {
    it('opens in the active empty slot and commits the word picked into that slot', () => {
      const { ctx } = renderNode('directObject', { activeSlot: 'directObject' });

      expect(screen.getByPlaceholderText('type a noun or a pronoun…')).toBeInTheDocument();
      fireEvent.click(option('CAT'));

      expect(ctx.handleConceptSelect).toHaveBeenCalledExactlyOnceWith(
        CAT,
        'directObject',
        undefined,
      );
    });

    it('stays closed in a slot that is not the active one', () => {
      renderNode('directObject', { activeSlot: 'subject' });

      expect(screen.queryByPlaceholderText('type a noun or a pronoun…')).not.toBeInTheDocument();
      expect(screen.getByTestId('box-directObject')).toHaveTextContent('empty');
    });

    it('searches the vocabulary the box’s category switch has chosen', () => {
      const selection: PhraseSelection = { subject: BOAT };
      const { unmount } = renderNode('subjectAdjective', {
        selection,
        activeSlot: 'subjectAdjective',
        slotKind: () => 'noun',
      });
      expect(screen.getByPlaceholderText('type a noun…')).toBeInTheDocument();
      unmount();

      renderNode('subjectAdjective', {
        selection,
        activeSlot: 'subjectAdjective',
        slotKind: () => 'adjective',
      });
      expect(screen.getByPlaceholderText('type an adjective…')).toBeInTheDocument();
    });

    it('reports a category picked inside the dropdown for that slot', () => {
      const { ctx } = renderNode('subjectAdjective', {
        activeSlot: 'subjectAdjective',
        slotKind: () => 'noun',
      });

      const dropdown = within(screen.getByRole('tooltip'));
      fireEvent.click(dropdown.getByRole('button', { name: 'Adjective' }));

      expect(ctx.onSlotKindChange).toHaveBeenCalledExactlyOnceWith('subjectAdjective', 'adjective');
    });

    it('offers a noun phrase’s head the noun-only picker, with no category switch', () => {
      renderNode('subject', { activeSlot: 'subject', nounPhrase: true });

      expect(screen.getByPlaceholderText('type a noun…')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Pronoun' })).not.toBeInTheDocument();
    });
  });

  describe('the category switch', () => {
    it('rides an empty switchable box, showing and changing that slot’s category', () => {
      const { ctx } = renderNode('subject', {
        slotKind: (key) => (key === 'subject' ? 'pronoun' : 'noun'),
      });

      const pronoun = screen.getByRole('button', { name: 'Pronoun' });
      expect(pronoun).toHaveAttribute('aria-pressed', 'true');
      fireEvent.click(screen.getByRole('button', { name: 'Noun' }));

      expect(ctx.onSlotKindChange).toHaveBeenCalledExactlyOnceWith('subject', 'noun');
    });

    it.each<[string, SlotKey, Partial<PhraseRenderContext>]>([
      ['a filled box', 'subject', { selection: { subject: CAT } }],
      ['a single-vocabulary box', 'verb', {}],
      ['a noun phrase’s head', 'subject', { nounPhrase: true }],
    ])('is left off %s', (_, key, overrides) => {
      renderNode(key, overrides);

      expect(screen.queryByRole('button', { name: 'Noun' })).not.toBeInTheDocument();
    });
  });

  describe('a noun used as a modifier', () => {
    // "sail boat": the noun SAIL sits in the subject's adjective slot.
    const MODIFIER: PhraseSelection = { subject: BOAT, subjectAdjective: SAIL };

    it('carries its relation, its number and an adjective of its own, at their defaults', () => {
      renderNode('subjectAdjective', { selection: MODIFIER });

      const chip = (name: string) => screen.getByLabelText(name);
      expect(chip('Relationship: Feature or means — click to change')).toHaveTextContent('feature');
      expect(chip('Number: Singular — click to change')).toHaveTextContent('SG');
      const add = chip('Add an adjective that describes this modifier');
      expect(add).toHaveTextContent('');
      expect(within(add).getByTestId('AddIcon')).toBeInTheDocument();
      expect(screen.queryByText('±')).not.toBeInTheDocument();
    });

    it('names its chips in the UI language', () => {
      localStorage.setItem('signi:uiLanguage', 'it');
      const { ctx } = context({ selection: { ...MODIFIER, modifierRelations: { subjectAdjective: 'purpose' } } });
      renderWithProviders(<SlotNode slot={slot('subjectAdjective')} ctx={ctx} />, {
        concepts: CONCEPTS,
        strings: {
          'modifier.relation': { it: 'Relazione' },
          'modifier.relation.purpose': { it: 'scopo' },
          'modifier.relation.purpose.gloss': { it: 'Scopo o uso' },
          'modifier.addAdjective': { it: 'Aggiungi un aggettivo che descrive questo modificatore' },
        },
      });

      expect(screen.getByLabelText('Relazione: Scopo o uso — click to change')).toHaveTextContent('scopo');
      expect(screen.getByLabelText('Aggiungi un aggettivo che descrive questo modificatore')).toBeInTheDocument();
    });

    it('shows the relation, number and adjective chosen for its own slot', () => {
      renderNode('subjectAdjective', {
        selection: {
          ...MODIFIER,
          modifierRelations: { subjectAdjective: 'material', directObjectAdjective: 'purpose' },
          modifierNumbers: { subjectAdjective: 'plural' },
          modifierAdjectives: { subjectAdjective: SEMANTIC },
        },
      });

      const chip = (name: string) => screen.getByLabelText(name);
      expect(chip('Relationship: Material or content — click to change')).toHaveTextContent('material');
      expect(chip('Number: Plural — click to change')).toHaveTextContent('PL');
      const adjective = chip("The modifier's adjective: semantic — click to change");
      expect(adjective).toHaveTextContent('semantic');
      expect(adjective).toHaveStyle({ fontStyle: 'italic' });
    });

    it('ignores the choices recorded for other slots', () => {
      renderNode('subjectAdjective', {
        selection: {
          ...MODIFIER,
          modifierRelations: { directObjectAdjective: 'purpose' },
          modifierNumbers: { directObjectAdjective: 'plural' },
          modifierAdjectives: { directObjectAdjective: SEMANTIC },
        },
      });

      expect(screen.getByLabelText(/^Relationship:/)).toHaveTextContent('feature');
      expect(screen.getByLabelText(/^Number: .* — click to change$/)).toHaveTextContent('SG');
      expect(screen.getByLabelText(/describes this modifier/)).toHaveTextContent('');
    });

    it('cycles its relation and number for its own slot', () => {
      const { ctx } = renderNode('subjectAdjective', { selection: MODIFIER });

      fireEvent.click(screen.getByText('feature'));
      fireEvent.click(screen.getByText('SG'));

      expect(ctx.handleCycleModifierRelation).toHaveBeenCalledExactlyOnceWith('subjectAdjective');
      expect(ctx.handleCycleModifierNumber).toHaveBeenCalledExactlyOnceWith('subjectAdjective');
      expect(ctx.handleEditSlot).not.toHaveBeenCalled();
    });

    it('keeps a press or click on its chips from reaching the box and the canvas', () => {
      const onCanvasClick = vi.fn(() => {});
      const { ctx, startDrag } = context({ selection: MODIFIER });
      renderWithProviders(
        <div onClick={onCanvasClick}>
          <SlotNode slot={slot('subjectAdjective')} ctx={ctx} />
        </div>,
        { concepts: CONCEPTS },
      );

      for (const chip of [
        screen.getByText('feature'),
        screen.getByText('SG'),
        screen.getByLabelText('Add an adjective that describes this modifier'),
      ]) {
        fireEvent.pointerDown(chip);
        fireEvent.click(chip);
      }

      expect(startDrag).not.toHaveBeenCalled();
      expect(onCanvasClick).not.toHaveBeenCalled();
    });

    it('picks the modifier’s adjective from a picker docked under the chip', async () => {
      const { ctx } = renderNode('subjectAdjective', { selection: MODIFIER });

      fireEvent.click(screen.getByLabelText('Add an adjective that describes this modifier'));
      expect(screen.queryByText('clear')).not.toBeInTheDocument();
      fireEvent.click(option('SEMANTIC'));

      expect(ctx.handleSetModifierAdjective).toHaveBeenCalledExactlyOnceWith(
        'subjectAdjective',
        SEMANTIC,
      );
      await waitFor(() =>
        expect(screen.queryByPlaceholderText('type an adjective…')).not.toBeInTheDocument(),
      );
    });

    it('clears the modifier’s adjective from the same picker', async () => {
      const { ctx } = renderNode('subjectAdjective', {
        selection: { ...MODIFIER, modifierAdjectives: { subjectAdjective: SEMANTIC } },
      });

      fireEvent.click(screen.getByText('semantic'));
      fireEvent.click(screen.getByText('clear'));

      expect(ctx.handleSetModifierAdjective).toHaveBeenCalledExactlyOnceWith(
        'subjectAdjective',
        undefined,
      );
      await waitFor(() => expect(screen.queryByText('clear')).not.toBeInTheDocument());
    });
  });

  describe('an adjective', () => {
    it('carries a muted degree chip at the plain degree', () => {
      renderNode('subjectAdjective', { selection: { subject: CAT, subjectAdjective: BIG } });

      expect(screen.getByLabelText('Degree: — — click to change')).toHaveTextContent('±');
      expect(screen.queryByText('feature')).not.toBeInTheDocument();
      expect(screen.queryByText('SG')).not.toBeInTheDocument();
    });

    it('shows the degree chosen for its own slot, unmuted', () => {
      const selection = { subject: CAT, subjectAdjective: BIG };
      const { unmount } = renderNode('subjectAdjective', { selection });
      const muted = getComputedStyle(screen.getByText('±')).color;
      unmount();

      renderNode('subjectAdjective', {
        selection: {
          ...selection,
          adjectiveDegrees: { subjectAdjective: 'more', directObjectAdjective: 'least' },
        },
      });

      const chip = screen.getByLabelText('Degree: more — click to change');
      expect(chip).toHaveTextContent('more');
      expect(getComputedStyle(chip).color).not.toBe(muted);
    });

    it('cycles the degree of its own slot without dragging the box', () => {
      const { ctx, startDrag } = renderNode('directObjectAdjective', {
        selection: { directObject: CAT, directObjectAdjective: BIG },
      });

      fireEvent.pointerDown(screen.getByText('±'));
      fireEvent.click(screen.getByText('±'));

      expect(ctx.handleCycleDegree).toHaveBeenCalledExactlyOnceWith('directObjectAdjective');
      expect(startDrag).not.toHaveBeenCalled();
      expect(ctx.handleEditSlot).not.toHaveBeenCalled();
    });

    it('carries the degree chip as a predicate adjective too', () => {
      renderNode('predicative', { selection: { predicative: HAPPY } });

      expect(screen.getByText('±')).toBeInTheDocument();
    });
  });

  it.each<[string, SlotKey, PhraseSelection]>([
    ['a subject noun', 'subject', { subject: CAT }],
    ['a predicate noun', 'predicative', { predicative: LEGEND }],
    ['a verb', 'verb', { verb: SEE }],
  ])('gives %s no footer chips', (_, key, selection) => {
    renderNode(key, { selection });

    expect(screen.queryByText('±')).not.toBeInTheDocument();
    expect(screen.queryByText('feature')).not.toBeInTheDocument();
  });

  describe('shape', () => {
    // The ring layout sizes each shape from the content it measured; these hand it a radius.
    const ring = (mainKey: string, rIn: number): GroupRect => ({
      label: mainKey,
      color: '#000',
      mainKey,
      nodeKeys: [mainKey],
      center: { x: 200, y: 150 },
      rIn,
      orbit: rIn,
      rOut: rIn + 26,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });

    it("draws a constituent's word inside its solid ring, at the ring's radius", () => {
      renderNode('verb', { selection: { verb: SEE }, groupRects: [ring('verb', 40)] });

      expect(screen.getByTestId('box-verb')).toHaveAttribute('data-shape', 'ring');
      const circle = getComputedStyle(cardOf('verb'));
      expect(circle.width).toBe('80px');
      expect(circle.height).toBe('80px');
      expect(circle.borderRadius).toBe('50%');
      // A word's clear button is one of its ring's controls, not part of the shape.
      expect(screen.queryByLabelText('Clear the verb')).not.toBeInTheDocument();
    });

    it('draws a satellite as a disc that says only its word, its degree on the rim', () => {
      renderNode('subjectAdjective', {
        selection: { subject: CAT, subjectAdjective: BIG },
        discs: { subjectAdjective: { x: 100, y: 40, r: 22, a: 0 } },
      });

      expect(screen.getByTestId('box-subjectAdjective')).toHaveAttribute('data-shape', 'disc');
      expect(getComputedStyle(cardOf('subjectAdjective')).width).toBe('44px');
      expect(screen.queryByText('Adjective')).not.toBeInTheDocument();
      expect(screen.getByTestId('degree-subjectAdjective')).toHaveTextContent('±');
      expect(screen.getByLabelText('Clear the adjective')).toBeInTheDocument();
    });

    it('keeps the plain box for a slot with no ring or disc to sit in', () => {
      renderNode('verb', { selection: { verb: SEE } });

      expect(screen.getByTestId('box-verb')).not.toHaveAttribute('data-shape');
      expect(getComputedStyle(cardOf('verb')).minWidth).toBe('80px');
    });
  });
});
