import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSettleCorefPick } from '../../src/components/PhraseBuilder/hooks/useSettleCorefPick.ts';

const settle = (enabled: boolean, picking: string | null, owners: { possessed: string; named: boolean }[]) => {
  const coref = { picking, cancel: vi.fn() };
  renderHook(() => useSettleCorefPick({ enabled, coref, owners }));
  return coref.cancel;
};

describe('useSettleCorefPick', () => {
  it('ends the pick once the owner being picked for is named', () => {
    expect(settle(true, 'subject', [{ possessed: 'subject', named: true }])).toHaveBeenCalledOnce();
  });

  it('keeps the pick while that owner is still empty, or another owner is named', () => {
    expect(settle(true, 'subject', [{ possessed: 'subject', named: false }])).not.toHaveBeenCalled();
    expect(settle(true, 'subject', [{ possessed: 'directObject', named: true }])).not.toHaveBeenCalled();
  });

  it('does nothing with no pick running, or on a hosted ring’s builder', () => {
    expect(settle(true, null, [{ possessed: 'subject', named: true }])).not.toHaveBeenCalled();
    expect(settle(false, 'subject', [{ possessed: 'subject', named: true }])).not.toHaveBeenCalled();
  });
});
