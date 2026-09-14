import { describe, expect, it, vi } from 'vitest';
import type { WorkspaceBinding } from '../../src/components/PhraseBuilder/interfaces.ts';
import { linkPickHandlers } from '../../src/components/PhraseBuilder/functions/linkPickHandlers.ts';

// The parts of a workspace binding the noun boxes use.
function binding({ pickTargets = [] as string[] } = {}) {
  return {
    geometry: { registerBox: vi.fn(), registerVerbAnchor: vi.fn() },
    relative: {
      targetKeys: new Set(['directObject']),
      isPickTarget: vi.fn((key: string) => pickTargets.includes(key)),
      onPick: vi.fn(),
    },
  } as unknown as WorkspaceBinding;
}

const idle = { picking: null, isEligible: vi.fn(), pick: vi.fn() };
// A nested builder: its noun keys sit under its head's address.
const nounAddress = (key: string) => `subject/possessor${key === 'subject' ? '' : `/${key}`}`;

describe('linkPickHandlers', () => {
  it('wires nothing for a standalone period but its coref picks', () => {
    const coref = { picking: 'subject', isEligible: vi.fn(() => true), pick: vi.fn() };
    const handlers = linkPickHandlers({ coref, linkBinding: undefined, nounAddress });

    expect(handlers).toMatchObject({ onBoxRef: undefined, dimmedKeys: undefined, registerVerbAnchor: undefined });
    expect(handlers.isPickTarget!('directObject')).toBe(true);
    expect(linkPickHandlers({ coref: idle, linkBinding: undefined, nounAddress }).isPickTarget!('directObject')).toBe(false);
  });

  it('registers only noun boxes with the workspace, and greys its link targets', () => {
    const linkBinding = binding();
    const handlers = linkPickHandlers({ coref: idle, linkBinding, nounAddress });
    const el = document.createElement('div');

    handlers.onBoxRef!('verb', el);
    handlers.onBoxRef!('directObject', el);

    expect(linkBinding.geometry.registerBox).toHaveBeenCalledExactlyOnceWith('directObject', el);
    expect(handlers.dimmedKeys).toBe(linkBinding.relative.targetKeys);
    expect(handlers.registerVerbAnchor).toBe(linkBinding.geometry.registerVerbAnchor);
  });

  it('lights up and completes a relative-clause link on a noun the workspace offers', () => {
    const linkBinding = binding({ pickTargets: ['subject'] });
    const handlers = linkPickHandlers({ coref: idle, linkBinding, nounAddress });

    expect(handlers.isPickTarget!('subject')).toBe(true);
    expect(handlers.isPickTarget!('directObject')).toBe(false);
    expect(handlers.isPickTarget!('verb')).toBe(false);
    handlers.onPickTarget!('subject');
    expect(linkBinding.relative.onPick).toHaveBeenCalledExactlyOnceWith('subject');
  });

  it('lets a coref pick take over while it runs, by the noun’s address in the period', () => {
    const linkBinding = binding({ pickTargets: ['subject', 'directObject'] });
    const coref = { picking: 'cause', isEligible: vi.fn((address: string) => address === 'subject/possessor'), pick: vi.fn() };
    const handlers = linkPickHandlers({ coref, linkBinding, nounAddress });

    expect(handlers.isPickTarget!('subject')).toBe(true);
    expect(handlers.isPickTarget!('directObject')).toBe(false);
    handlers.onPickTarget!('directObject');

    expect(coref.pick).toHaveBeenCalledExactlyOnceWith('subject/possessor/directObject');
    expect(linkBinding.relative.onPick).not.toHaveBeenCalled();
  });
});
