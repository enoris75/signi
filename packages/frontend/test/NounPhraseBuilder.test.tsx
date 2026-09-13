import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { Concept } from '@signi/shared';
import type { GroupRect } from '../src/components/PhraseBuilder/graph.ts';
import type { NumberSlot, SlotKey } from '../src/components/PhraseBuilder/interfaces.ts';
import { NounPhraseBuilder } from '../src/components/PhraseBuilder/NounPhraseBuilder.tsx';
import type { PhraseRenderContext } from '../src/components/PhraseBuilder/phraseRender.tsx';
import { ALL_SLOTS } from '../src/components/PhraseBuilder/slots.ts';
import { renderWithProviders } from './render.tsx';

const noun = (id: string): Concept => ({ id, role: 'noun', description: id, label: id });

const slots = (...keys: SlotKey[]) => keys.map((k) => ALL_SLOTS.find((s) => s.key === k)!);

const groupRect = (label: string, nodeKeys: string[]): GroupRect => ({
  label,
  color: '#000',
  mainKey: nodeKeys[0],
  nodeKeys,
  center: { x: 110, y: 110 },
  rIn: 40,
  orbit: 40,
  rOut: 80,
  x: 19,
  y: 19,
  width: 182,
  height: 182,
});

// The render bag PhraseBuilder threads down, with inert handlers. Each drag prop set releases
// straight into its activation, as a press that never moved does on the canvas.
function makeCtx(overrides: Partial<PhraseRenderContext> = {}) {
  const dragPointerDown = vi.fn();
  const ctx: PhraseRenderContext = {
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
      onPointerDown: dragPointerDown,
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
    handleRemoveComplement: vi.fn(),
    ...overrides,
  };
  return { ctx, dragPointerDown };
}

function renderNoun(which: NumberSlot, overrides: Partial<PhraseRenderContext> = {}) {
  const { ctx, dragPointerDown } = makeCtx(overrides);
  const view = renderWithProviders(<NounPhraseBuilder which={which} ctx={ctx} />);
  return { ...view, ctx, dragPointerDown };
}

const boxes = () => screen.queryAllByTestId(/^box-/).map((b) => b.dataset['testid']);

// The determiner toggle box, found by its heading.
const determinerBox = () =>
  screen.getByText('Determiner').closest<HTMLElement>('.MuiPaper-root')!;

describe('NounPhraseBuilder', () => {
  describe('its boxes', () => {
    it('draws the dotted box of its own noun block', () => {
      renderNoun('directObject', {
        groupRects: [
          groupRect('Subject', ['subject']),
          groupRect('Direct Object', ['directObject']),
        ],
      });

      expect(screen.getAllByTestId('group-box').map((g) => g.dataset['group'])).toEqual([
        'Direct Object',
      ]);
    });

    it('draws no dotted box while its block has none, as for a folded complement', () => {
      renderNoun('locative', { groupRects: [groupRect('Subject', ['subject'])] });

      expect(screen.queryByTestId('group-box')).not.toBeInTheDocument();
    });

    it('places its noun and adjective chain, and none of the other blocks’ words', () => {
      renderNoun('subject', {
        renderedSlots: slots(
          'subjectAdjective',
          'subject',
          'verb',
          'directObject',
          'directObjectAdjective',
          'subjectAdjective2',
        ),
      });

      expect(boxes()).toEqual(['box-subjectAdjective', 'box-subject', 'box-subjectAdjective2']);
    });

    it('places a complement’s words under the complement’s own keys', () => {
      renderNoun('locative', {
        renderedSlots: slots('subject', 'locativeAdjective', 'locative', 'sourceAdjective'),
      });

      expect(boxes()).toEqual(['box-locativeAdjective', 'box-locative']);
    });
  });

  describe('the determiner', () => {
    it('has no box until its control reveals it', () => {
      renderNoun('subject', { shownMap: { directObjectDefiniteness: true } });

      expect(screen.queryByText('Determiner')).not.toBeInTheDocument();
    });

    it('names the determiner the noun phrase carries', () => {
      renderNoun('directObject', {
        shownMap: { directObjectDefiniteness: true },
        selection: { directObject: noun('CAT'), directObjectDefiniteness: 'many' },
      });

      expect(determinerBox()).toHaveTextContent('Multal');
    });

    it('falls back on the block’s default determiner', () => {
      renderNoun('subject', { shownMap: { subjectDefiniteness: true } });
      expect(determinerBox()).toHaveTextContent('Definite');
    });

    it('falls back on the indefinite for a predicate noun', () => {
      renderNoun('predicative', { shownMap: { predicativeDefiniteness: true } });
      expect(determinerBox()).toHaveTextContent('Indefinite');
    });

    it('drags as its own node, and registers for measuring under that key', () => {
      const { ctx, unmount } = renderNoun('directObject', {
        shownMap: { directObjectDefiniteness: true },
      });

      expect(ctx.makeDragProps).toHaveBeenCalledWith(
        'directObjectDefiniteness',
        expect.any(Function),
      );
      expect(ctx.slotEls.current.get('directObjectDefiniteness')).toContainElement(determinerBox());

      unmount();

      expect(ctx.slotEls.current.has('directObjectDefiniteness')).toBe(false);
    });

    it('opens a menu of every determiner, grouped by dimension, on the current one', () => {
      renderNoun('subject', {
        shownMap: { subjectDefiniteness: true },
        selection: { subject: noun('CAT'), subjectDefiniteness: 'that' },
      });
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();

      fireEvent.pointerUp(determinerBox());

      // Each row reads "name|word"; a section heading reads "# name".
      const menu = screen.getByRole('menu');
      expect(
        [...menu.querySelectorAll('li')].map((li) =>
          li.getAttribute('role') === 'menuitem'
            ? `${li.firstChild!.textContent}|${li.querySelector('span')!.textContent}`
            : `# ${li.textContent}`,
        ),
      ).toEqual([
        '# Article',
        'Definite|the',
        'Indefinite|a / an',
        'Zero|—',
        '# Demonstrative',
        'Proximal|this',
        'Distal|that',
        '# Quantifier',
        'Partitive|some',
        'Negative|no',
        'Multal|many',
        'Paucal|few',
        'Universal|all',
      ]);
      expect(within(menu).getByRole('menuitem', { name: /Distal/ })).toHaveClass('Mui-selected');
      expect(within(menu).getByRole('menuitem', { name: /Definite/ })).not.toHaveClass(
        'Mui-selected',
      );
    });

    it('sets the picked determiner on its own block and closes the menu', async () => {
      const { ctx } = renderNoun('directObject', { shownMap: { directObjectDefiniteness: true } });
      fireEvent.pointerUp(determinerBox());

      fireEvent.click(screen.getByRole('menuitem', { name: /Paucal/ }));

      expect(ctx.handleSetDefiniteness).toHaveBeenCalledExactlyOnceWith('directObject', 'few');
      await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    });

    it('keeps a press on the menu from starting a drag of the determiner box', () => {
      // The menu is portalled, but React still bubbles its events along the component tree.
      const { dragPointerDown } = renderNoun('subject', {
        shownMap: { subjectDefiniteness: true },
      });
      fireEvent.pointerUp(determinerBox());

      fireEvent.pointerDown(screen.getByRole('menuitem', { name: /Proximal/ }));

      expect(dragPointerDown).not.toHaveBeenCalled();
    });
  });
});
