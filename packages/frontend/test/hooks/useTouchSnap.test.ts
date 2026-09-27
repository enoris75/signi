import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  TAP_OWNER_ATTR,
  TOUCH_SNAP_ATTR,
  installTouchSnap,
  pickSnapTarget,
} from '../../src/hooks/useTouchSnap.ts';

const rect = (left: number, top: number, width = 20, height = 20) => ({ left, top, width, height });

describe('pickSnapTarget', () => {
  it('takes a tap inside a 20 px control\'s 44 px square, and none outside it', () => {
    const at = [{ target: 'a', rect: rect(100, 100) }]; // centre (110, 110)
    expect(pickSnapTarget(131, 110, at)).toBe('a');
    expect(pickSnapTarget(110, 89, at)).toBe('a');
    expect(pickSnapTarget(133, 110, at)).toBeUndefined();
    expect(pickSnapTarget(110, 87, at)).toBeUndefined();
  });

  it('gives a tap between two controls to the nearer one', () => {
    const at = [
      { target: 'a', rect: rect(100, 100) }, // centre (110, 110)
      { target: 'b', rect: rect(130, 100) }, // centre (140, 110)
    ];
    expect(pickSnapTarget(123, 110, at)).toBe('a');
    expect(pickSnapTarget(127, 110, at)).toBe('b');
  });

  it('keeps a control wider than the square its own width', () => {
    const at = [{ target: 'wide', rect: rect(0, 0, 100, 20) }];
    expect(pickSnapTarget(99, 10, at)).toBe('wide');
  });

  it('scales the square with the size it is given (a pinched-in page)', () => {
    const at = [{ target: 'a', rect: rect(100, 100) }];
    expect(pickSnapTarget(131, 110, at, 22)).toBeUndefined();
  });
});

describe('installTouchSnap', () => {
  let uninstall: () => void;
  let control: HTMLButtonElement;
  let paper: HTMLDivElement;
  let pressed: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    document.body.innerHTML = '';
    paper = document.createElement('div');
    control = document.createElement('button');
    control.setAttribute(TOUCH_SNAP_ATTR, '');
    pressed = vi.fn();
    control.addEventListener('click', pressed);
    document.body.append(paper, control);
    control.getBoundingClientRect = () => ({ ...rect(100, 100), right: 120, bottom: 120, x: 100, y: 100, toJSON: () => ({}) });
    // jsdom lays nothing out: the control is what sits at its own centre.
    document.elementFromPoint = () => control;
    uninstall = installTouchSnap(document);
  });

  afterEach(() => uninstall());

  // A press and its click, as a finger's tap (or a mouse's) makes them.
  function tap(on: Element, x: number, y: number, pointerType = 'touch') {
    const down = new Event('pointerdown', { bubbles: true }) as PointerEvent;
    Object.defineProperty(down, 'pointerType', { value: pointerType });
    on.dispatchEvent(down);
    const click = new MouseEvent('click', { bubbles: true, cancelable: true, clientX: x, clientY: y });
    on.dispatchEvent(click);
  }

  it('hands a finger\'s near miss to the control', () => {
    tap(paper, 128, 110);
    expect(pressed).toHaveBeenCalledTimes(1);
  });

  it('leaves a mouse\'s near miss alone, and a click no press started', () => {
    tap(paper, 128, 110, 'mouse');
    paper.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 128, clientY: 110 }));
    expect(pressed).not.toHaveBeenCalled();
  });

  it('leaves a tap on another control, or on a box that takes its own taps, where it landed', () => {
    const other = document.createElement('button');
    const box = document.createElement('div');
    box.setAttribute(TAP_OWNER_ATTR, '');
    const inBox = document.createElement('span');
    box.append(inBox);
    document.body.append(other, box);
    tap(other, 128, 110);
    tap(inBox, 128, 110);
    expect(pressed).not.toHaveBeenCalled();
  });

  it('skips a control something else is drawn over (a sheet, a stowed view)', () => {
    document.elementFromPoint = () => paper;
    tap(paper, 128, 110);
    expect(pressed).not.toHaveBeenCalled();
  });

  it('skips a disabled control', () => {
    control.disabled = true;
    tap(paper, 128, 110);
    expect(pressed).not.toHaveBeenCalled();
  });
});
