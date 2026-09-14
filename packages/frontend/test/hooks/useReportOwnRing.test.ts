import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReportOwnRing } from '../../src/components/PhraseBuilder/hooks/useReportOwnRing.ts';
import { perimeterControlKey } from '../../src/components/PhraseBuilder/ringSpecs.ts';
import type { GroupRect } from '../../src/components/PhraseBuilder/graph.ts';
import type { Pt } from '../../src/components/PhraseBuilder/ringLayout.ts';
import type { RingHost } from '../../src/components/PhraseBuilder/ringHost.ts';

const POSSESSOR = perimeterControlKey('possessor', 'subject');

const host = (key: string, onRing: RingHost['onRing'], portKeys: string[] = []): RingHost =>
  ({ kind: 'conjunct', key, role: 'subject', ports: portKeys.map((k) => ({ key: k, toward: { x: 0, y: 0 } })), onRing }) as RingHost;

const drawn = (rOut: number): GroupRect =>
  ({ mainKey: 'subject', center: { x: 100, y: 200 }, rIn: rOut - 30, orbit: rOut - 20, rOut }) as GroupRect;

type Props = { ringHost: RingHost | undefined; ownRing: GroupRect | undefined; controlPos: Record<string, Pt> };

const renderReport = (initialProps: Props) =>
  renderHook(({ ringHost, ownRing, controlPos }: Props) => useReportOwnRing(ringHost, ownRing, controlPos), {
    initialProps,
  });

describe('useReportOwnRing', () => {
  it('reports the ring drawn, with its ports and possessor control relative to its centre', () => {
    const onRing = vi.fn();

    renderReport({
      ringHost: host('subject+1', onRing, ['subject+1>subject', 'subject+1>subject+2']),
      ownRing: drawn(80),
      // The second port is not seated yet, so it is left out.
      controlPos: { 'subject+1>subject': { x: 100, y: 120 }, [POSSESSOR]: { x: 170, y: 230 }, other: { x: 0, y: 0 } },
    });

    expect(onRing).toHaveBeenCalledExactlyOnceWith({
      rIn: 50,
      orbit: 60,
      rOut: 80,
      ports: { 'subject+1>subject': { x: 0, y: -80 }, [POSSESSOR]: { x: 70, y: 30 } },
    });
  });

  it('reports nothing for a builder that hosts no ring, or before its ring is drawn', () => {
    const onRing = vi.fn();

    renderReport({ ringHost: undefined, ownRing: drawn(80), controlPos: {} });
    renderReport({ ringHost: host('subject+1', onRing), ownRing: undefined, controlPos: {} });

    expect(onRing).not.toHaveBeenCalled();
  });

  it('reports again only when the ring really changed', () => {
    const onRing = vi.fn();
    const ringHost = host('subject+1', onRing);
    const { rerender } = renderReport({ ringHost, ownRing: drawn(80), controlPos: {} });

    rerender({ ringHost, ownRing: drawn(80.2), controlPos: {} });
    expect(onRing).toHaveBeenCalledTimes(1);

    rerender({ ringHost, ownRing: drawn(90), controlPos: {} });
    expect(onRing).toHaveBeenCalledTimes(2);
    expect(onRing).toHaveBeenLastCalledWith(expect.objectContaining({ rOut: 90 }));
  });

  it('reports the ring gone once its builder unmounts', () => {
    const onRing = vi.fn();
    const { unmount } = renderReport({ ringHost: host('subject+1', onRing), ownRing: drawn(80), controlPos: {} });

    unmount();

    expect(onRing).toHaveBeenLastCalledWith(null);
  });

  it('reports the ring gone under its old key, and drawn under its new one, when its key changes', () => {
    const before = vi.fn();
    const after = vi.fn();
    const { rerender } = renderReport({ ringHost: host('subject+2', before), ownRing: drawn(80), controlPos: {} });

    // A conjunct before it was removed: the same builder now answers to the key one step up.
    rerender({ ringHost: host('subject+1', after), ownRing: drawn(80), controlPos: {} });

    expect(before.mock.calls).toEqual([[expect.objectContaining({ rOut: 80 })], [null]]);
    expect(after).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ rOut: 80 }));
  });
});
