import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { renderWithProviders, type Seed } from './render.tsx';
import type { GroupRect } from '../src/components/PhraseBuilder/graph.ts';
import { GroupBox } from '../src/components/PhraseBuilder/GroupBox.tsx';
import type { PhraseRenderContext } from '../src/components/PhraseBuilder/phraseRender.tsx';
import { collapseControlKey, removeControlKey } from '../src/components/PhraseBuilder/ringSpecs.ts';

// The subject's dotted ring: radius 90 round (200, 100), its adjective orbiting inside it.
const SUBJECT_GROUP: GroupRect = {
  label: 'Subject',
  color: '#2c4a6e',
  mainKey: 'subject',
  nodeKeys: ['subject', 'subjectAdjective'],
  center: { x: 200, y: 100 },
  rIn: 40,
  orbit: 66,
  rOut: 90,
  x: 99,
  y: -1,
  width: 202,
  height: 202,
};

const DIRECTION_GROUP: GroupRect = {
  label: 'Direction',
  labelKey: 'slot.direction',
  color: '#8b6914',
  mainKey: 'direction',
  nodeKeys: ['direction'],
  removeKey: 'direction',
  center: { x: 500, y: 250 },
  rIn: 40,
  orbit: 40,
  rOut: 66,
  x: 423,
  y: 173,
  width: 154,
  height: 154,
};

// Where the ring layout seated the ring's chrome.
const CONTROL_POS = {
  [collapseControlKey('Subject')]: { x: 136, y: 36 },
  [collapseControlKey('Direction')]: { x: 453, y: 203 },
  [removeControlKey('Direction')]: { x: 547, y: 203 },
};

// GroupBox reads only the collapse state, the view mode, the drag state, the seated controls and
// its handlers from the builder's context. It paints onto the canvas, which drags on a press of
// its own.
function renderGroup(
  rect: GroupRect,
  overrides: Partial<PhraseRenderContext> = {},
  seed: Seed = {},
) {
  const onCanvasPointerDown = vi.fn();
  const dragProps = {
    onPointerDown: vi.fn(),
    onPointerMove: vi.fn(),
    onPointerUp: vi.fn(),
    onPointerCancel: vi.fn(),
  };
  const ctx = {
    collapsedGroups: {},
    compact: false,
    draggingKey: null,
    controlPos: CONTROL_POS,
    makeGroupDragProps: vi.fn(() => dragProps),
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
  const view = renderWithProviders(
    <div data-testid="canvas" onPointerDown={onCanvasPointerDown}>
      <GroupBox rect={rect} ctx={ctx as PhraseRenderContext} />
    </div>,
    seed,
  );
  return { ...view, ctx, dragProps, onCanvasPointerDown };
}

const ring = () => screen.getByTestId('group-box');
const position = (el: Element) => {
  const { left, top } = getComputedStyle(el);
  return { left, top };
};

describe('GroupBox', () => {
  it('draws nothing in compact view', () => {
    renderGroup(SUBJECT_GROUP, { compact: true });

    expect(screen.getByTestId('canvas')).toBeEmptyDOMElement();
  });

  it('draws the dotted ring round the constituent’s word, in its colour', () => {
    renderGroup(SUBJECT_GROUP);

    expect(ring()).toHaveAttribute('data-group', 'Subject');
    expect(getComputedStyle(ring())).toMatchObject({
      position: 'absolute',
      left: '110px',
      top: '10px',
      width: '180px',
      height: '180px',
      borderRadius: '50%',
      borderStyle: 'dashed',
      borderColor: 'rgb(44, 74, 110)',
    });
  });

  it('drags the whole constituent by its word, which its satellites orbit', () => {
    const { ctx, dragProps } = renderGroup(SUBJECT_GROUP);

    expect(ctx.makeGroupDragProps).toHaveBeenCalledWith(['subject']);
    fireEvent.pointerDown(ring());
    fireEvent.pointerMove(ring());
    fireEvent.pointerUp(ring());
    fireEvent.pointerCancel(ring());

    expect(dragProps.onPointerDown).toHaveBeenCalledOnce();
    expect(dragProps.onPointerMove).toHaveBeenCalledOnce();
    expect(dragProps.onPointerUp).toHaveBeenCalledOnce();
    expect(dragProps.onPointerCancel).toHaveBeenCalledOnce();
  });

  it('shows the grabbing cursor only while a group is being dragged', () => {
    const cursor = (draggingKey: string | null) => {
      const { unmount } = renderGroup(SUBJECT_GROUP, { draggingKey });
      const value = getComputedStyle(ring()).cursor;
      unmount();
      return value;
    };

    expect(cursor(null)).toBe('grab');
    expect(cursor('subject')).toBe('grab');
    expect(cursor('__group__')).toBe('grabbing');
  });

  describe('collapse toggle', () => {
    it('offers to collapse an expanded group, where the ring layout seated it', () => {
      const { ctx } = renderGroup(SUBJECT_GROUP);
      const toggle = screen.getByRole('button', { name: 'Compact Subject' });

      expect(within(toggle).getByTestId('UnfoldLessIcon')).toBeInTheDocument();
      expect(position(toggle)).toEqual({ left: '136px', top: '36px' });

      fireEvent.click(toggle);
      expect(ctx.handleToggleCollapse).toHaveBeenCalledExactlyOnceWith('Subject');
    });

    it('offers to expand a collapsed group', () => {
      const { ctx } = renderGroup(SUBJECT_GROUP, { collapsedGroups: { Subject: true } });
      const toggle = screen.getByRole('button', { name: 'Expand Subject' });

      expect(within(toggle).getByTestId('UnfoldMoreIcon')).toBeInTheDocument();

      fireEvent.click(toggle);
      expect(ctx.handleToggleCollapse).toHaveBeenCalledExactlyOnceWith('Subject');
    });

    it('names the part it compacts and expands in the UI language, keyed by its English label', () => {
      localStorage.setItem('signi:uiLanguage', 'de');
      const named = { ...SUBJECT_GROUP, labelKey: 'slot.subject' as const };
      const strings = {
        'action.compact.subject': { de: 'Das Subjekt verdichten' },
        'action.expand.subject': { de: 'Das Subjekt erweitern' },
      };
      const { ctx, rerender } = renderGroup(named, {}, { strings });
      fireEvent.click(screen.getByRole('button', { name: 'Das Subjekt verdichten' }));
      // The collapse state stays keyed by the English label, whatever language the tooltip is in.
      expect(ctx.handleToggleCollapse).toHaveBeenCalledExactlyOnceWith('Subject');

      rerender(<GroupBox rect={named} ctx={{ ...ctx, collapsedGroups: { Subject: true } } as PhraseRenderContext} />);
      expect(screen.getByRole('button', { name: 'Das Subjekt erweitern' })).toBeInTheDocument();
    });

    it('names the verb phrase it compacts in the UI language', () => {
      localStorage.setItem('signi:uiLanguage', 'it');
      const verbPhrase = { ...SUBJECT_GROUP, label: 'Verb Phrase', labelKey: 'slot.verbPhrase' as const, mainKey: 'verb' };
      const controlPos = { [collapseControlKey('Verb Phrase')]: { x: 136, y: 36 } };
      const strings = { 'action.compact.verbPhrase': { it: 'Compatta il sintagma verbale' } };
      const { ctx } = renderGroup(verbPhrase, { controlPos }, { strings });

      fireEvent.click(screen.getByRole('button', { name: 'Compatta il sintagma verbale' }));
      expect(ctx.handleToggleCollapse).toHaveBeenCalledExactlyOnceWith('Verb Phrase');
    });

    it('reads only its own group’s collapse state', () => {
      renderGroup(SUBJECT_GROUP, { collapsedGroups: { Direction: true, Subject: false } });

      expect(screen.getByRole('button', { name: 'Compact Subject' })).toBeInTheDocument();
    });

    it('is left off until the ring layout has seated it', () => {
      renderGroup(SUBJECT_GROUP, { controlPos: {} });

      expect(screen.queryByRole('button', { name: 'Compact Subject' })).not.toBeInTheDocument();
    });
  });

  it('offers no tidy-up of its own: a ring’s satellites always sit on their orbit', () => {
    renderGroup(SUBJECT_GROUP);

    expect(screen.queryByRole('button', { name: /^Tidy up/ })).not.toBeInTheDocument();
  });

  describe('remove control', () => {
    it('removes a complement, from where the ring layout seated it', () => {
      const { ctx } = renderGroup(DIRECTION_GROUP);
      const remove = screen.getByRole('button', { name: 'Remove the direction' });

      expect(position(remove)).toEqual({ left: '547px', top: '203px' });

      fireEvent.click(remove);
      expect(ctx.handleRemoveComplement).toHaveBeenCalledExactlyOnceWith('direction');
    });

    it('names the complement it removes in the UI language', () => {
      const manner = {
        ...DIRECTION_GROUP,
        label: 'Manner',
        labelKey: 'slot.manner' as const,
        mainKey: 'manner',
        removeKey: 'manner' as const,
      };
      const controlPos = { [removeControlKey('Manner')]: { x: 547, y: 203 } };
      const { unmount } = renderGroup(manner, { controlPos });
      expect(screen.getByRole('button', { name: 'Remove the adverbial of manner' })).toBeInTheDocument();
      unmount();

      localStorage.setItem('signi:uiLanguage', 'de');
      const strings = { 'action.remove.manner': { de: 'Die adverbiale Bestimmung der Art und Weise entfernen' } };
      const { ctx } = renderGroup(manner, { controlPos }, { strings });
      fireEvent.click(
        screen.getByRole('button', { name: 'Die adverbiale Bestimmung der Art und Weise entfernen' }),
      );
      expect(ctx.handleRemoveComplement).toHaveBeenCalledExactlyOnceWith('manner');
    });

    it('is offered on complements only', () => {
      renderGroup(SUBJECT_GROUP);

      expect(screen.queryByRole('button', { name: /^Remove/ })).not.toBeInTheDocument();
    });
  });

  it('keeps a press on any ring control from dragging the canvas', () => {
    const { onCanvasPointerDown } = renderGroup(DIRECTION_GROUP);

    const controls = screen.getAllByRole('button');
    expect(controls).toHaveLength(2);
    controls.forEach((control) => fireEvent.pointerDown(control));

    expect(onCanvasPointerDown).not.toHaveBeenCalled();
  });
});
