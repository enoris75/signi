import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { keyboardInset, useKeyboardInset } from '../../src/hooks/useKeyboardInset.ts';

/** A stand-in visual viewport: the page's size on the glass, and its own resize/scroll events. */
class FakeViewport extends EventTarget {
  height = 844;
  offsetTop = 0;
  scale = 1;
  set(next: Partial<Pick<FakeViewport, 'height' | 'offsetTop' | 'scale'>>, event: 'resize' | 'scroll' = 'resize') {
    Object.assign(this, next);
    this.dispatchEvent(new Event(event));
  }
}

let viewport: FakeViewport;
const original = Object.getOwnPropertyDescriptor(window, 'visualViewport');
const originalHeight = Object.getOwnPropertyDescriptor(window, 'innerHeight');

beforeEach(() => {
  viewport = new FakeViewport();
  Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844 });
});

afterEach(() => {
  if (originalHeight) Object.defineProperty(window, 'innerHeight', originalHeight);
  if (original) Object.defineProperty(window, 'visualViewport', original);
  else delete (window as { visualViewport?: unknown }).visualViewport;
});

describe('keyboardInset', () => {
  const win = (height: number, offsetTop = 0, scale = 1) =>
    ({ innerHeight: 844, visualViewport: { height, offsetTop, scale } }) as unknown as Window;

  it('is 0 with the keyboard closed', () => {
    expect(keyboardInset(win(844))).toBe(0);
  });

  it('is what the keyboard covers with it open', () => {
    expect(keyboardInset(win(508))).toBe(336);
  });

  it('is what the keyboard covers, open and with the page panned to the field', () => {
    // iOS scrolls the page so the field shows: the visual viewport moves down, its foot with it.
    expect(keyboardInset(win(508, 120))).toBe(216);
  });

  it('ignores a toolbar\'s few pixels, a pinch zoom, and a browser with no visual viewport', () => {
    expect(keyboardInset(win(800))).toBe(0);
    expect(keyboardInset(win(422, 0, 2))).toBe(0);
    expect(keyboardInset({ innerHeight: 844, visualViewport: null } as unknown as Window)).toBe(0);
  });
});

describe('useKeyboardInset', () => {
  it('follows the visual viewport as the keyboard opens, the page pans and the keyboard closes', () => {
    const { result } = renderHook(() => useKeyboardInset());
    expect(result.current).toBe(0);
    act(() => viewport.set({ height: 508 }));
    expect(result.current).toBe(336);
    act(() => viewport.set({ offsetTop: 120 }, 'scroll'));
    expect(result.current).toBe(216);
    act(() => viewport.set({ height: 844, offsetTop: 0 }));
    expect(result.current).toBe(0);
  });

  it('reads nothing while disabled (not a phone)', () => {
    viewport.height = 508;
    const { result } = renderHook(() => useKeyboardInset(false));
    expect(result.current).toBe(0);
    act(() => viewport.set({ height: 400 }));
    expect(result.current).toBe(0);
  });
});
