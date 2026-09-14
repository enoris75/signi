import { describe, expect, it, vi } from 'vitest';
import type React from 'react';
import { act, renderHook } from '@testing-library/react';
import { useBorderDrag } from '../../../src/components/PhraseBuilder/PeriodContainer/hooks/useBorderDrag.ts';
import { placed } from '../../hooks/dom.ts';

type Point = { x: number; y: number };

// A 400×300 card at (100, 100), dragged to (40, 60) already. jsdom has no pointer capture, so the
// card gets a stub.
function renderDrag({
  enabled = true,
  position = { x: 40, y: 60 },
}: { enabled?: boolean; position?: Point | null } = {}) {
  const onPositionChange = vi.fn();
  const hook = renderHook((props) => useBorderDrag(props), {
    initialProps: { enabled, position, onPositionChange },
  });
  const card = placed(100, 100, 400, 300);
  card.setPointerCapture = vi.fn();
  const pointer = (clientX: number, clientY: number) =>
    ({ clientX, clientY, pointerId: 3, currentTarget: card }) as unknown as React.PointerEvent<HTMLElement>;
  const handlers = () => hook.result.current.dragHandlers;
  return { ...hook, card, pointer, handlers, onPositionChange };
}

describe('useBorderDrag', () => {
  it.each([
    ['left', 103, 250],
    ['right', 497, 250],
    ['top', 300, 103],
    ['bottom', 300, 397],
  ])('floats the card by its %s border', (_, x, y) => {
    const { card, pointer, handlers, onPositionChange } = renderDrag();

    act(() => handlers().onPointerDown(pointer(x, y)));
    act(() => handlers().onPointerMove(pointer(x + 30, y - 20)));

    expect(card.setPointerCapture).toHaveBeenCalledExactlyOnceWith(3);
    expect(onPositionChange).toHaveBeenCalledExactlyOnceWith({ x: 70, y: 40 });
  });

  it.each([
    ['the middle', 300, 250],
    ['8px inside the left border', 108, 250],
    ['8px inside the right border', 492, 250],
    ['8px inside the top border', 300, 108],
    ['8px inside the bottom border', 300, 392],
  ])('does not drag from %s of the card', (_, x, y) => {
    const { card, pointer, handlers, onPositionChange, result } = renderDrag();

    act(() => handlers().onPointerDown(pointer(x, y)));
    act(() => handlers().onPointerMove(pointer(x + 30, y - 20)));

    expect(card.setPointerCapture).not.toHaveBeenCalled();
    expect(onPositionChange).not.toHaveBeenCalled();
    expect(result.current.dragging).toBe(false);
  });

  it('does not drag a card that may not float', () => {
    const { card, pointer, handlers, onPositionChange } = renderDrag({ enabled: false });

    act(() => handlers().onPointerDown(pointer(103, 250)));
    act(() => handlers().onPointerMove(pointer(133, 250)));

    expect(card.setPointerCapture).not.toHaveBeenCalled();
    expect(onPositionChange).not.toHaveBeenCalled();
  });

  it('starts a card still in the page flow from the origin', () => {
    const { pointer, handlers, onPositionChange } = renderDrag({ position: null });

    act(() => handlers().onPointerDown(pointer(103, 250)));
    act(() => handlers().onPointerMove(pointer(113, 245)));

    expect(onPositionChange).toHaveBeenCalledExactlyOnceWith({ x: 10, y: -5 });
  });

  it('measures every move from where the drag began, however the owner re-renders', () => {
    const { pointer, handlers, onPositionChange, rerender } = renderDrag();

    act(() => handlers().onPointerDown(pointer(103, 250)));
    act(() => handlers().onPointerMove(pointer(133, 270)));
    rerender({ enabled: true, position: { x: 70, y: 80 }, onPositionChange });
    act(() => handlers().onPointerMove(pointer(153, 260)));

    expect(onPositionChange.mock.calls).toEqual([[{ x: 70, y: 80 }], [{ x: 90, y: 70 }]]);
  });

  it.each(['onPointerUp', 'onPointerCancel'] as const)('ends on %s', (end) => {
    const { pointer, handlers, onPositionChange, result } = renderDrag();

    act(() => handlers().onPointerDown(pointer(103, 250)));
    expect(result.current.dragging).toBe(true);
    act(() => handlers()[end]());
    act(() => handlers().onPointerMove(pointer(123, 250)));

    expect(result.current.dragging).toBe(false);
    expect(onPositionChange).not.toHaveBeenCalled();
  });
});
