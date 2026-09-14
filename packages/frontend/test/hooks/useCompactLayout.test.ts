import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { computeCompactLayout } from '../../src/components/PhraseBuilder/layout.ts';
import { useCompactLayout } from '../../src/components/PhraseBuilder/hooks/useCompactLayout.ts';

const CORNER = { w: 0, h: 0 };

type Props = { enabled: boolean; keys: string[]; width: number; halfW: number };

const renderLayout = (initialProps: Props) =>
  renderHook(
    ({ enabled, keys, width, halfW }: Props) =>
      useCompactLayout({ enabled, keys, width, corner: CORNER, cell: { halfW, halfH: 30 } }),
    { initialProps },
  );

describe('useCompactLayout', () => {
  it('packs nothing while compact view is off', () => {
    expect(renderLayout({ enabled: false, keys: ['subject'], width: 600, halfW: 66 }).result.current).toBeNull();
  });

  it('packs the keys across the canvas width', () => {
    const { result } = renderLayout({ enabled: true, keys: ['subject', 'verb'], width: 600, halfW: 66 });

    expect(result.current).toEqual(computeCompactLayout(['subject', 'verb'], 600, CORNER, { halfW: 66, halfH: 30 }));
  });

  it('keeps the packing while the keys spell the same, and repacks when they or the width change', () => {
    const { result, rerender } = renderLayout({ enabled: true, keys: ['subject', 'verb'], width: 600, halfW: 66 });
    const packed = result.current;

    rerender({ enabled: true, keys: ['subject', 'verb'], width: 600, halfW: 66 });
    expect(result.current).toBe(packed);

    rerender({ enabled: true, keys: ['subject', 'verb', 'directObject'], width: 600, halfW: 66 });
    expect(result.current).not.toBe(packed);
    const three = result.current;

    rerender({ enabled: true, keys: ['subject', 'verb', 'directObject'], width: 300, halfW: 66 });
    expect(result.current).not.toBe(three);
  });
});
