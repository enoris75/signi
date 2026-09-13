import { describe, expect, it, vi } from 'vitest';
import { fireEvent, renderHook } from '@testing-library/react';
import { useWindowDrag } from '../../src/hooks/useWindowDrag.ts';

function startedDrag() {
  const onMove = vi.fn();
  const onEnd = vi.fn();
  const view = renderHook(() => useWindowDrag());
  view.result.current(onMove, onEnd);
  return { ...view, onMove, onEnd };
}

describe('useWindowDrag', () => {
  it('follows the pointer anywhere in the window', () => {
    const { onMove } = startedDrag();

    fireEvent.pointerMove(window, { clientX: 40 });
    fireEvent.pointerMove(document.body, { clientX: 90 });

    expect(onMove.mock.calls.map(([ev]) => (ev as PointerEvent).clientX)).toEqual([40, 90]);
  });

  it.each([
    ['released', fireEvent.pointerUp],
    ['cancelled', fireEvent.pointerCancel],
  ])('ends once when the pointer is %s, and stops listening', (_, end) => {
    const { onMove, onEnd } = startedDrag();

    end(window);
    fireEvent.pointerMove(window, { clientX: 40 });
    fireEvent.pointerUp(window);
    fireEvent.pointerCancel(window);

    expect(onEnd).toHaveBeenCalledOnce();
    expect(onMove).not.toHaveBeenCalled();
  });

  it('drops the drag under way when a new one starts', () => {
    const { result, onMove, onEnd } = startedDrag();
    const nextMove = vi.fn();
    const nextEnd = vi.fn();

    result.current(nextMove, nextEnd);
    fireEvent.pointerMove(window, { clientX: 40 });
    fireEvent.pointerUp(window);

    expect(onMove).not.toHaveBeenCalled();
    expect(onEnd).not.toHaveBeenCalled();
    expect(nextMove).toHaveBeenCalledOnce();
    expect(nextEnd).toHaveBeenCalledOnce();
  });

  it('lets go of the pointer, without ending the drag, when its owner unmounts', () => {
    const { unmount, onMove, onEnd } = startedDrag();

    unmount();
    fireEvent.pointerMove(window, { clientX: 40 });
    fireEvent.pointerUp(window);

    expect(onMove).not.toHaveBeenCalled();
    expect(onEnd).not.toHaveBeenCalled();
  });

  it('hands back the same function on every render', () => {
    const { result, rerender } = renderHook(() => useWindowDrag());
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });
});
