import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useWorkspaceHistory } from '../../src/hooks/useWorkspaceHistory.ts';
import type { PhraseContainer } from '../../src/components/PhraseBuilder/interfaces.ts';

const CAT = { id: 'CAT', role: 'noun' as const, description: 'a cat', label: 'cat' };
const DOG = { id: 'DOG', role: 'noun' as const, description: 'a dog', label: 'dog' };

const period = (id: string, subject?: typeof CAT): PhraseContainer => ({
  id,
  selection: subject ? { subject } : {},
});

const START = { containers: [period('c1')], links: [] };

// The clock the hook coalesces by. Held still so a burst stays a burst, and moved on by hand
// where two changes are meant to be two.
let now = 1_000;
const later = (ms: number) => {
  now += ms;
};

beforeEach(() => {
  now = 1_000;
  vi.spyOn(Date, 'now').mockImplementation(() => now);
});

afterEach(() => vi.restoreAllMocks());

function history(initial = START) {
  const { result } = renderHook(() => useWorkspaceHistory(initial));
  return {
    get current() {
      return result.current;
    },
    /** An edit, as the canvas makes them: through the setter it was handed. */
    edit(...containers: PhraseContainer[]) {
      act(() => result.current.setContainers(containers));
    },
    undo: () => act(() => result.current.undo()),
    redo: () => act(() => result.current.redo()),
    /** The ids on the canvas, which is all these tests need to tell states apart. */
    get ids() {
      return result.current.containers.map((c) => c.id);
    },
  };
}

describe('useWorkspaceHistory', () => {
  it('has nothing to take back until something changes', () => {
    const h = history();

    expect(h.current.canUndo).toBe(false);
    expect(h.current.canRedo).toBe(false);
    expect(h.ids).toEqual(['c1']);
  });

  it('takes back the last change, and puts it back again', () => {
    const h = history();

    h.edit(period('c1'), period('c2'));
    expect(h.ids).toEqual(['c1', 'c2']);
    expect(h.current.canUndo).toBe(true);

    h.undo();
    expect(h.ids).toEqual(['c1']);
    expect(h.current.canUndo).toBe(false);
    expect(h.current.canRedo).toBe(true);

    h.redo();
    expect(h.ids).toEqual(['c1', 'c2']);
    expect(h.current.canRedo).toBe(false);
  });

  it('does nothing at either end of the history', () => {
    const h = history();

    h.undo();
    h.redo();

    expect(h.ids).toEqual(['c1']);
    expect(h.current.canUndo).toBe(false);
  });

  // Cycling a tense with T T T is one thought, not three.
  it('gathers changes made in one breath into a single step back', () => {
    const h = history();

    h.edit(period('c1'), period('c2'));
    later(100);
    h.edit(period('c1'), period('c2'), period('c3'));
    later(100);
    h.edit(period('c1'), period('c2'), period('c3'), period('c4'));

    h.undo();

    expect(h.ids).toEqual(['c1']);
    expect(h.current.canUndo).toBe(false);
  });

  it('keeps two deliberate changes two', () => {
    const h = history();

    h.edit(period('c1'), period('c2'));
    later(500);
    h.edit(period('c1'), period('c2'), period('c3'));

    h.undo();
    expect(h.ids).toEqual(['c1', 'c2']);

    h.undo();
    expect(h.ids).toEqual(['c1']);
  });

  // Whatever is done after an undo is a new branch, and what was undone is not on it.
  it('forgets the redos once a new change branches off', () => {
    const h = history();
    h.edit(period('c1'), period('c2'));

    h.undo();
    expect(h.current.canRedo).toBe(true);

    h.edit(period('c1'), period('c9'));

    expect(h.current.canRedo).toBe(false);
    h.undo();
    expect(h.ids).toEqual(['c1']);
  });

  // A change straight after an undo is its own step, however quickly it comes.
  it('does not gather a change into the step it has just undone', () => {
    const h = history();
    h.edit(period('c1'), period('c2'));
    h.undo();

    h.edit(period('c1'), period('c9'));

    h.undo();
    expect(h.ids).toEqual(['c1']);
  });

  it('records the links alongside the words', () => {
    const h = history();
    const link = {
      id: 'l1',
      source: { containerId: 'c1', nounKey: 'subject' as const },
      target: { containerId: 'c2', nounKey: 'subject' as const },
    };

    act(() => h.current.setLinks([link]));
    expect(h.current.links).toEqual([link]);

    h.undo();
    expect(h.current.links).toEqual([]);
  });

  it('replaces the whole workspace in one step, as loading one does', () => {
    const h = history();
    h.edit(period('c1', CAT));
    later(500);

    act(() => h.current.replace({ containers: [period('x1', DOG), period('x2')], links: [] }));
    expect(h.ids).toEqual(['x1', 'x2']);

    h.undo();
    expect(h.ids).toEqual(['c1']);
    expect(h.current.containers[0]?.selection.subject).toBe(CAT);
  });

  it('is not a step when a setter changes nothing', () => {
    const h = history();

    act(() => h.current.setContainers((cs) => cs));

    expect(h.current.canUndo).toBe(false);
  });

  it('forgets the oldest steps rather than growing without end', () => {
    const h = history();

    for (let i = 0; i < 60; i++) {
      h.edit(period('c1'), period(`c${i + 2}`));
      later(500);
    }

    let steps = 0;
    while (h.current.canUndo && steps < 100) {
      h.undo();
      steps++;
    }

    expect(steps).toBe(50);
  });
});
