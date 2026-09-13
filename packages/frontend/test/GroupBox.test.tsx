import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type { GroupRect } from '../src/components/PhraseBuilder/graph.ts';
import { GroupBox } from '../src/components/PhraseBuilder/GroupBox.tsx';
import type { PhraseRenderContext } from '../src/components/PhraseBuilder/phraseRender.tsx';

// The subject's dotted box spans 100..300 across and 40..160 down, around its adjective too.
const SUBJECT_GROUP: GroupRect = {
  x: 100,
  y: 40,
  width: 200,
  height: 120,
  label: 'Subject',
  color: '#2c4a6e',
  nodeKeys: ['subjectAdjective', 'subject'],
};

const DIRECTION_GROUP: GroupRect = {
  x: 420,
  y: 200,
  width: 180,
  height: 110,
  label: 'Direction',
  color: '#8b6914',
  nodeKeys: ['direction'],
  removeKey: 'direction',
};

// GroupBox reads only the collapse state, the view mode, the drag state and its four handlers
// from the builder's context. It paints onto the canvas, which drags on a press of its own.
function renderGroup(rect: GroupRect, overrides: Partial<PhraseRenderContext> = {}) {
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
    makeGroupDragProps: vi.fn(() => dragProps),
    handleToggleCollapse: vi.fn(),
    handleRearrangeGroup: vi.fn(),
    handleRemoveComplement: vi.fn(),
    ...overrides,
  };
  const view = render(
    <div data-testid="canvas" onPointerDown={onCanvasPointerDown}>
      <GroupBox rect={rect} ctx={ctx as PhraseRenderContext} />
    </div>,
  );
  return { ...view, ctx, dragProps, onCanvasPointerDown };
}

const box = () => screen.getByTestId('group-box');
const position = (el: Element) => {
  const { left, top } = getComputedStyle(el);
  return { left, top };
};

describe('GroupBox', () => {
  it('draws nothing in compact view', () => {
    renderGroup(SUBJECT_GROUP, { compact: true });

    expect(screen.getByTestId('canvas')).toBeEmptyDOMElement();
  });

  it('frames the group’s measured rect in a dashed border of its colour', () => {
    renderGroup(SUBJECT_GROUP);

    expect(box()).toHaveAttribute('data-group', 'Subject');
    const style = getComputedStyle(box());
    expect(style).toMatchObject({
      position: 'absolute',
      left: '100px',
      top: '40px',
      width: '200px',
      height: '120px',
      borderStyle: 'dashed',
      borderColor: 'rgb(44, 74, 110)',
    });
  });

  it('drags every node of the group together by its frame', () => {
    const { ctx, dragProps } = renderGroup(SUBJECT_GROUP);

    expect(ctx.makeGroupDragProps).toHaveBeenCalledWith(['subjectAdjective', 'subject']);
    fireEvent.pointerDown(box());
    fireEvent.pointerMove(box());
    fireEvent.pointerUp(box());
    fireEvent.pointerCancel(box());

    expect(dragProps.onPointerDown).toHaveBeenCalledOnce();
    expect(dragProps.onPointerMove).toHaveBeenCalledOnce();
    expect(dragProps.onPointerUp).toHaveBeenCalledOnce();
    expect(dragProps.onPointerCancel).toHaveBeenCalledOnce();
  });

  it('shows the grabbing cursor only while a group is being dragged', () => {
    const cursor = (draggingKey: string | null) => {
      const { unmount } = renderGroup(SUBJECT_GROUP, { draggingKey });
      const value = getComputedStyle(box()).cursor;
      unmount();
      return value;
    };

    expect(cursor(null)).toBe('grab');
    expect(cursor('subject')).toBe('grab');
    expect(cursor('__group__')).toBe('grabbing');
  });

  describe('collapse toggle', () => {
    it('offers to collapse an expanded group, from its top-left corner', () => {
      const { ctx } = renderGroup(SUBJECT_GROUP);
      const toggle = screen.getByRole('button', { name: 'Collapse Subject' });

      expect(within(toggle).getByTestId('UnfoldLessIcon')).toBeInTheDocument();
      expect(position(toggle)).toEqual({ left: '91px', top: '31px' });

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

    it('reads only its own group’s collapse state', () => {
      renderGroup(SUBJECT_GROUP, { collapsedGroups: { Direction: true, Subject: false } });

      expect(screen.getByRole('button', { name: 'Collapse Subject' })).toBeInTheDocument();
    });
  });

  describe('tidy-up control', () => {
    it('tidies the group it sits on, just right of the collapse toggle', () => {
      const { ctx } = renderGroup(SUBJECT_GROUP);
      const tidy = screen.getByRole('button', { name: 'Tidy up Subject' });

      expect(position(tidy)).toEqual({ left: '111px', top: '31px' });

      fireEvent.click(tidy);
      expect(ctx.handleRearrangeGroup).toHaveBeenCalledExactlyOnceWith(SUBJECT_GROUP);
    });

    it('is withheld from a group of one word, which has nothing to arrange', () => {
      renderGroup({ ...SUBJECT_GROUP, nodeKeys: ['subject'] });

      expect(screen.queryByRole('button', { name: 'Tidy up Subject' })).not.toBeInTheDocument();
    });

    it('is withheld while the group is collapsed', () => {
      renderGroup(SUBJECT_GROUP, { collapsedGroups: { Subject: true } });

      expect(screen.queryByRole('button', { name: 'Tidy up Subject' })).not.toBeInTheDocument();
    });
  });

  describe('remove control', () => {
    it('removes a complement, from its top-right corner', () => {
      const { ctx } = renderGroup(DIRECTION_GROUP);
      const remove = screen.getByRole('button', { name: 'Remove Direction' });

      expect(position(remove)).toEqual({ left: '591px', top: '191px' });

      fireEvent.click(remove);
      expect(ctx.handleRemoveComplement).toHaveBeenCalledExactlyOnceWith('direction');
    });

    it('is offered on complements only', () => {
      renderGroup(SUBJECT_GROUP);

      expect(screen.queryByRole('button', { name: /^Remove/ })).not.toBeInTheDocument();
    });
  });

  it('keeps a press on any corner control from dragging the canvas', () => {
    const { onCanvasPointerDown } = renderGroup({
      ...DIRECTION_GROUP,
      nodeKeys: ['direction', 'directionAdjective'],
    });

    const controls = screen.getAllByRole('button');
    expect(controls).toHaveLength(3);
    controls.forEach((control) => fireEvent.pointerDown(control));

    expect(onCanvasPointerDown).not.toHaveBeenCalled();
  });
});
