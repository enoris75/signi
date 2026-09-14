import { describe, expect, it } from 'vitest';
import { useState } from 'react';
import { renderHook } from '@testing-library/react';
import { useHostedRingPlacement } from '../../src/components/PhraseBuilder/hooks/useHostedRingPlacement.ts';
import { seedHostedPositions } from '../../src/components/PhraseBuilder/functions/seedHostedPositions.ts';
import type { PositionMap } from '../../src/components/PhraseBuilder/layout.ts';
import type { NounKey } from '../../src/components/PhraseBuilder/interfaces.ts';

const CHAIN = [{ which: 'subject' as NounKey, count: 1 }];

function useCanvas({ enabled, height, subjectY }: { enabled: boolean; height: number; subjectY: number }) {
  const [positions, setPositions] = useState<PositionMap>({ subject: { x: 50, y: subjectY } });
  const [graphHeight, setGraphHeight] = useState(height);
  useHostedRingPlacement({
    enabled,
    chains: CHAIN,
    owners: [],
    positions,
    groupRects: [],
    hostedRings: {},
    canvas: { w: 600, h: graphHeight },
    setPositions,
    setGraphHeight,
  });
  return { positions, graphHeight };
}

describe('useHostedRingPlacement', () => {
  it('places a new hosted ring in the stored positions', () => {
    const { result } = renderHook(() => useCanvas({ enabled: true, height: 1000, subjectY: 10 }));

    const { seeds } = seedHostedPositions({
      chains: CHAIN,
      owners: [],
      positions: { subject: { x: 50, y: 10 } },
      groupRects: [],
      hostedRings: {},
      canvas: { w: 600, h: 1000 },
    });
    expect(result.current.positions).toEqual({ subject: { x: 50, y: 10 }, ...seeds });
    expect(result.current.graphHeight).toBe(1000);
  });

  it('grows the canvas to hold a ring placed past its bottom edge', () => {
    const { result } = renderHook(() => useCanvas({ enabled: true, height: 200, subjectY: 80 }));

    const { bottom } = seedHostedPositions({
      chains: CHAIN,
      owners: [],
      positions: { subject: { x: 50, y: 80 } },
      groupRects: [],
      hostedRings: {},
      canvas: { w: 600, h: 200 },
    });
    expect(result.current.positions['subject+1']).toBeDefined();
    expect(result.current.graphHeight).toBe(Math.ceil(bottom));
  });

  it('places nothing for a hosted ring’s own builder', () => {
    const { result } = renderHook(() => useCanvas({ enabled: false, height: 200, subjectY: 80 }));

    expect(result.current.positions).toEqual({ subject: { x: 50, y: 80 } });
    expect(result.current.graphHeight).toBe(200);
  });
});
