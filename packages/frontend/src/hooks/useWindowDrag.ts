import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns `startDrag`, which follows a pointer drag across the whole window — so the drag survives
 * the pointer leaving the handle that began it — until the pointer is released or the browser
 * cancels it, then calls `onEnd`. Starting a new drag drops the one before, and unmounting the
 * handle mid-drag lets go of the pointer without ending it: nothing is left listening on window.
 */
export function useWindowDrag(): (onMove: (ev: PointerEvent) => void, onEnd: () => void) => void {
  const detachRef = useRef<(() => void) | null>(null);

  useEffect(() => () => detachRef.current?.(), []);

  return useCallback((onMove: (ev: PointerEvent) => void, onEnd: () => void) => {
    detachRef.current?.();
    const end = () => {
      detach();
      onEnd();
    };
    const detach = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      detachRef.current = null;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    detachRef.current = detach;
  }, []);
}
