import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Resizer } from '../src/components/PhraseBuilder/Resizer.tsx';

function renderResizer({ height = 300, minHeight = 200, withEnd = true } = {}) {
  const onResize = vi.fn();
  const onResizeEnd = vi.fn();
  const view = render(
    <Resizer
      height={height}
      minHeight={minHeight}
      onResize={onResize}
      onResizeEnd={withEnd ? onResizeEnd : undefined}
    />,
  );
  const bar = screen.getByRole('separator', { name: 'Resize period container' });
  return { ...view, bar, onResize, onResizeEnd };
}

// A drag listens on window, which outlives the rendered bar: release whatever drag a test left
// open so its listeners do not run into the next test.
afterEach(() => {
  fireEvent.pointerUp(window);
});

describe('Resizer', () => {
  it('is a focusable horizontal separator', () => {
    const { bar } = renderResizer();

    expect(bar).toHaveAttribute('aria-orientation', 'horizontal');
    expect(bar).toHaveAttribute('tabindex', '0');
    expect(getComputedStyle(bar).cursor).toBe('ns-resize');
  });

  describe('from the keyboard', () => {
    it('grows the canvas a step on ArrowDown, and settles there at once', () => {
      const { bar, onResize, onResizeEnd } = renderResizer();

      // fireEvent returns false when the handler called preventDefault: the page does not scroll.
      expect(fireEvent.keyDown(bar, { key: 'ArrowDown' })).toBe(false);

      expect(onResize).toHaveBeenCalledExactlyOnceWith(316);
      expect(onResizeEnd).toHaveBeenCalledExactlyOnceWith(316);
    });

    it('shrinks the canvas a step on ArrowUp', () => {
      const { bar, onResize, onResizeEnd } = renderResizer();

      expect(fireEvent.keyDown(bar, { key: 'ArrowUp' })).toBe(false);

      expect(onResize).toHaveBeenCalledExactlyOnceWith(284);
      expect(onResizeEnd).toHaveBeenCalledExactlyOnceWith(284);
    });

    it('stops shrinking at the minimum height', () => {
      const { bar, onResize } = renderResizer({ height: 210, minHeight: 200 });

      fireEvent.keyDown(bar, { key: 'ArrowUp' });

      expect(onResize).toHaveBeenCalledExactlyOnceWith(200);
    });

    it('leaves every other key alone', () => {
      const { bar, onResize, onResizeEnd } = renderResizer();

      expect(fireEvent.keyDown(bar, { key: 'ArrowLeft' })).toBe(true);
      expect(fireEvent.keyDown(bar, { key: 'Enter' })).toBe(true);

      expect(onResize).not.toHaveBeenCalled();
      expect(onResizeEnd).not.toHaveBeenCalled();
    });

    it('resizes without a listener for the end of the resize', () => {
      const { bar, onResize } = renderResizer({ withEnd: false });

      fireEvent.keyDown(bar, { key: 'ArrowDown' });

      expect(onResize).toHaveBeenCalledExactlyOnceWith(316);
    });
  });

  describe('by dragging', () => {
    it('follows the pointer’s vertical travel from where the press began', () => {
      const { bar, onResize } = renderResizer();

      fireEvent.pointerDown(bar, { clientX: 400, clientY: 500 });
      fireEvent.pointerMove(window, { clientX: 460, clientY: 540 });
      fireEvent.pointerMove(window, { clientX: 460, clientY: 470 });

      expect(onResize.mock.calls).toEqual([[340], [270]]);
    });

    it('keeps following once the pointer has left the bar', () => {
      const { bar, onResize } = renderResizer();

      fireEvent.pointerDown(bar, { clientY: 500 });
      fireEvent.pointerMove(document.body, { clientY: 620 });

      expect(onResize).toHaveBeenCalledExactlyOnceWith(420);
    });

    it('stops shrinking at the minimum height', () => {
      const { bar, onResize } = renderResizer();

      fireEvent.pointerDown(bar, { clientY: 500 });
      fireEvent.pointerMove(window, { clientY: 100 });

      expect(onResize).toHaveBeenCalledExactlyOnceWith(200);
    });

    it('keeps the press from selecting text or starting a drag of anything else', () => {
      const { bar } = renderResizer();

      expect(fireEvent.pointerDown(bar, { clientY: 500 })).toBe(false);
    });

    it('settles once, on the last height, when the pointer is released', () => {
      const { bar, onResize, onResizeEnd } = renderResizer();

      fireEvent.pointerDown(bar, { clientY: 500 });
      fireEvent.pointerMove(window, { clientY: 520 });
      fireEvent.pointerMove(window, { clientY: 550 });
      expect(onResizeEnd).not.toHaveBeenCalled();

      fireEvent.pointerUp(window, { clientY: 550 });

      expect(onResizeEnd).toHaveBeenCalledExactlyOnceWith(350);
      expect(onResize).toHaveBeenCalledTimes(2);
    });

    it('settles on the starting height when released without moving', () => {
      const { bar, onResize, onResizeEnd } = renderResizer();

      fireEvent.pointerDown(bar, { clientY: 500 });
      fireEvent.pointerUp(window, { clientY: 500 });

      expect(onResize).not.toHaveBeenCalled();
      expect(onResizeEnd).toHaveBeenCalledExactlyOnceWith(300);
    });

    it('settles when the browser cancels the pointer', () => {
      const { bar, onResizeEnd } = renderResizer();

      fireEvent.pointerDown(bar, { clientY: 500 });
      fireEvent.pointerMove(window, { clientY: 480 });
      fireEvent.pointerCancel(window);

      expect(onResizeEnd).toHaveBeenCalledExactlyOnceWith(280);
    });

    it.each([
      ['released', fireEvent.pointerUp],
      ['cancelled', fireEvent.pointerCancel],
    ])('stops listening once the pointer is %s', (_, end) => {
      const { bar, onResize, onResizeEnd } = renderResizer();
      fireEvent.pointerDown(bar, { clientY: 500 });
      end(window);
      onResizeEnd.mockClear();

      fireEvent.pointerMove(window, { clientY: 600 });
      fireEvent.pointerUp(window);
      fireEvent.pointerCancel(window);

      expect(onResize).not.toHaveBeenCalled();
      expect(onResizeEnd).not.toHaveBeenCalled();
    });

    it('drags without a listener for the end of the resize', () => {
      const { bar, onResize } = renderResizer({ withEnd: false });

      fireEvent.pointerDown(bar, { clientY: 500 });
      fireEvent.pointerMove(window, { clientY: 510 });
      fireEvent.pointerUp(window);

      expect(onResize).toHaveBeenCalledExactlyOnceWith(310);
    });
  });
});
