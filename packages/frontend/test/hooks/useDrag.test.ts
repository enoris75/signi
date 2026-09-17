import { describe, expect, it, vi } from 'vitest';
import type React from 'react';
import { useRef, useState } from 'react';
import { act, renderHook } from '@testing-library/react';
import { useDrag, type Positions } from '../../src/components/PhraseBuilder/hooks/useDrag.ts';
import { DEFAULT_POSITIONS } from '../../src/components/PhraseBuilder/slots.ts';
import { attach, placed } from './dom.ts';

// The owning component keeps positions in state and the canvas in a ref; the hook reads both.
// The canvas is 400×200 px, so 4 px across and 2 px down are each 1%.
function useCanvas(initial: Positions, frozen: boolean) {
  const [positions, setPositions] = useState(initial);
  const containerRef = useRef<HTMLDivElement>(null);
  const drag = useDrag({ positions, setPositions, containerRef, frozen });
  return { positions, containerRef, ...drag };
}

function renderCanvas(initial: Positions = { subject: { x: 50, y: 50 } }, { frozen = false } = {}) {
  const hook = renderHook(() => useCanvas(initial, frozen));
  attach(hook.result.current.containerRef, placed(0, 0, 400, 200));
  return hook;
}

function pointer(clientX: number, clientY: number) {
  return {
    clientX,
    clientY,
    pointerId: 7,
    currentTarget: { setPointerCapture: vi.fn() },
    stopPropagation: vi.fn(),
  } as unknown as React.PointerEvent & {
    currentTarget: { setPointerCapture: ReturnType<typeof vi.fn> };
    stopPropagation: ReturnType<typeof vi.fn>;
  };
}

describe('useDrag', () => {
  describe('a node', () => {
    it('moves by the pointer’s travel, as a percentage of the canvas', () => {
      const { result } = renderCanvas();

      act(() => result.current.makeDragProps('subject', () => {}).onPointerDown(pointer(100, 100)));
      act(() => result.current.makeDragProps('subject', () => {}).onPointerMove(pointer(140, 120)));

      expect(result.current.positions.subject).toEqual({ x: 60, y: 60 });
    });

    it('captures the pointer so the drag survives leaving the box', () => {
      const { result } = renderCanvas();
      const down = pointer(0, 0);

      act(() => result.current.makeDragProps('subject', () => {}).onPointerDown(down));

      expect(down.currentTarget.setPointerCapture).toHaveBeenCalledExactlyOnceWith(7);
    });

    it('stays inside the 1..99 band however far the pointer goes', () => {
      const { result } = renderCanvas();

      act(() => result.current.makeDragProps('subject', () => {}).onPointerDown(pointer(200, 100)));
      act(() => result.current.makeDragProps('subject', () => {}).onPointerMove(pointer(5000, 5000)));
      expect(result.current.positions.subject).toEqual({ x: 99, y: 99 });

      act(() => result.current.makeDragProps('subject', () => {}).onPointerMove(pointer(-5000, -5000)));
      expect(result.current.positions.subject).toEqual({ x: 1, y: 1 });
    });

    it('starts a node with no stored position from its default', () => {
      const { result } = renderCanvas({});
      const home = DEFAULT_POSITIONS.subject;

      expect(result.current.makeDragProps('subject', () => {}).sx).toMatchObject({
        left: `${home.x}%`,
        top: `${home.y}%`,
      });

      act(() => result.current.makeDragProps('subject', () => {}).onPointerDown(pointer(0, 0)));
      act(() => result.current.makeDragProps('subject', () => {}).onPointerMove(pointer(4, 2)));

      expect(result.current.positions.subject).toEqual({ x: home.x + 1, y: home.y + 1 });
    });

    it('is raised and shows the grabbing cursor only while it is the one dragged', () => {
      const { result } = renderCanvas({ subject: { x: 50, y: 50 }, verb: { x: 20, y: 20 } });

      act(() => result.current.makeDragProps('subject', () => {}).onPointerDown(pointer(0, 0)));

      expect(result.current.draggingKey).toBe('subject');
      expect(result.current.makeDragProps('subject', () => {}).sx).toMatchObject({
        zIndex: 10,
        cursor: 'grabbing',
      });
      expect(result.current.makeDragProps('verb', () => {}).sx).toMatchObject({
        zIndex: 1,
        cursor: 'grab',
      });
    });
  });

  describe('a canvas painted from a derived layout', () => {
    it('paints a node where it is told, not at its stored position', () => {
      const { result } = renderCanvas();

      expect(result.current.makeDragProps('subject', () => {}, { x: 10, y: 20 }).sx).toMatchObject({
        left: '10%',
        top: '20%',
      });
    });

    it('moves nothing while frozen, but still clicks a box that was pressed', () => {
      const { result } = renderCanvas(undefined, { frozen: true });
      const onActivate = vi.fn();

      act(() => result.current.makeDragProps('subject', onActivate).onPointerDown(pointer(100, 100)));
      act(() => result.current.makeDragProps('subject', onActivate).onPointerMove(pointer(180, 140)));
      expect(result.current.positions.subject).toEqual({ x: 50, y: 50 });
      expect(result.current.makeDragProps('subject', onActivate).sx).toMatchObject({ cursor: 'pointer' });

      act(() => result.current.makeDragProps('subject', onActivate).onPointerUp());
      expect(onActivate).not.toHaveBeenCalled();

      act(() => result.current.makeDragProps('subject', onActivate).onPointerDown(pointer(100, 100)));
      act(() => result.current.makeDragProps('subject', onActivate).onPointerUp());
      expect(onActivate).toHaveBeenCalledOnce();
    });
  });

  describe('releasing', () => {
    it('treats a press that barely moved as a click on the box', () => {
      const { result } = renderCanvas();
      const onActivate = vi.fn();

      act(() => result.current.makeDragProps('subject', onActivate).onPointerDown(pointer(100, 100)));
      act(() => result.current.makeDragProps('subject', onActivate).onPointerMove(pointer(106, 94)));
      act(() => result.current.makeDragProps('subject', onActivate).onPointerUp());

      expect(onActivate).toHaveBeenCalledOnce();
    });

    it('does not click a box that was dragged more than 6 px', () => {
      const { result } = renderCanvas();
      const onActivate = vi.fn();

      act(() => result.current.makeDragProps('subject', onActivate).onPointerDown(pointer(100, 100)));
      act(() => result.current.makeDragProps('subject', onActivate).onPointerMove(pointer(107, 100)));
      act(() => result.current.makeDragProps('subject', onActivate).onPointerUp());

      expect(onActivate).not.toHaveBeenCalled();
    });

    it('flags the drag as moved once the pointer has travelled, for the layout effects to read', () => {
      const { result } = renderCanvas();

      act(() => result.current.makeDragProps('subject', () => {}).onPointerDown(pointer(100, 100)));
      expect(result.current.dragRef.current).toMatchObject({ keys: ['subject'], moved: false });

      act(() => result.current.makeDragProps('subject', () => {}).onPointerMove(pointer(100, 120)));
      expect(result.current.dragRef.current?.moved).toBe(true);
    });

    it('ends the drag on cancel without clicking', () => {
      const { result } = renderCanvas();
      const onActivate = vi.fn();

      act(() => result.current.makeDragProps('subject', onActivate).onPointerDown(pointer(100, 100)));
      act(() => result.current.makeDragProps('subject', onActivate).onPointerCancel());

      expect(onActivate).not.toHaveBeenCalled();
      expect(result.current.dragRef.current).toBeNull();
      expect(result.current.draggingKey).toBeNull();
    });

    it('ignores pointer moves with no drag in flight', () => {
      const { result } = renderCanvas();

      act(() => result.current.makeDragProps('subject', () => {}).onPointerMove(pointer(300, 300)));

      expect(result.current.positions.subject).toEqual({ x: 50, y: 50 });
    });
  });

  describe('a group', () => {
    it('moves every node of the group together, each from its own start', () => {
      const { result } = renderCanvas({
        subject: { x: 50, y: 50 },
        subjectAdjective: { x: 30, y: 20 },
        verb: { x: 80, y: 80 },
      });
      const group = () => result.current.makeGroupDragProps(['subject', 'subjectAdjective']);

      act(() => group().onPointerDown(pointer(0, 0)));
      act(() => group().onPointerMove(pointer(40, 20)));

      expect(result.current.positions).toEqual({
        subject: { x: 60, y: 60 },
        subjectAdjective: { x: 40, y: 30 },
        verb: { x: 80, y: 80 },
      });
      expect(result.current.draggingKey).toBe('__group__');
    });

    it('keeps the press from also starting a drag on the box beneath', () => {
      const { result } = renderCanvas();
      const down = pointer(0, 0);

      act(() => result.current.makeGroupDragProps(['subject']).onPointerDown(down));

      expect(down.stopPropagation).toHaveBeenCalledOnce();
    });

    it('ends the drag on release', () => {
      const { result } = renderCanvas();

      act(() => result.current.makeGroupDragProps(['subject']).onPointerDown(pointer(0, 0)));
      act(() => result.current.makeGroupDragProps(['subject']).onPointerUp());

      expect(result.current.dragRef.current).toBeNull();
      expect(result.current.draggingKey).toBeNull();
    });
  });

  // What ⇧ + an arrow does from the keyboard (see the keymap's box.nudge.*). The canvas is
  // 400×200 px, so 8 px across is 2% and 8 px down is 4%.
  describe('a nudge', () => {
    it('shifts a node by pixels, converted against the canvas it is placed on', () => {
      const { result } = renderCanvas();

      act(() => result.current.nudge('subject', 8, 0));
      expect(result.current.positions.subject).toEqual({ x: 52, y: 50 });

      act(() => result.current.nudge('subject', 0, -8));
      expect(result.current.positions.subject).toEqual({ x: 52, y: 46 });
    });

    it('starts from the node’s default place when it has never been moved', () => {
      const { result } = renderCanvas({});

      act(() => result.current.nudge('verb', 8, 0));

      expect(result.current.positions.verb).toEqual({
        x: DEFAULT_POSITIONS['verb']!.x + 2,
        y: DEFAULT_POSITIONS['verb']!.y,
      });
    });

    it('stays inside the 1..99 band', () => {
      const { result } = renderCanvas({ subject: { x: 2, y: 50 } });

      act(() => result.current.nudge('subject', -80, 0));

      expect(result.current.positions.subject).toEqual({ x: 1, y: 50 });
    });

    it('moves nothing while compact view paints the boxes elsewhere', () => {
      const { result } = renderCanvas(undefined, { frozen: true });

      act(() => result.current.nudge('subject', 8, 8));

      expect(result.current.positions.subject).toEqual({ x: 50, y: 50 });
    });

    it('moves nothing before the canvas has been measured', () => {
      const hook = renderHook(() => useCanvas({ subject: { x: 50, y: 50 } }, false));

      act(() => hook.result.current.nudge('subject', 8, 8));

      expect(hook.result.current.positions.subject).toEqual({ x: 50, y: 50 });
    });
  });
});
