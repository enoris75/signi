import { describe, expect, it } from 'vitest';
import { useState } from 'react';
import { act, fireEvent, renderHook } from '@testing-library/react';
import type { Concept } from '@signi/shared';
import { useWorkspaceLinks } from '../../src/components/PhraseBuilder/hooks/useWorkspaceLinks.ts';
import type {
  PhraseContainer,
  PhraseLink,
  PhraseSelection,
} from '../../src/components/PhraseBuilder/interfaces.ts';

const CAT: Concept = { id: 'CAT', role: 'noun', description: 'a small feline', label: 'cat', labels: { en: 'cat' } };
const DOG: Concept = { id: 'DOG', role: 'noun', description: 'a canine', label: 'dog', labels: { en: 'dog' } };
const SEE: Concept = { id: 'SEE', role: 'verb', description: 'perceive by sight', label: 'see', labels: { en: 'see' } };

const container = (id: string, selection: PhraseSelection = {}): PhraseContainer => ({ id, selection });

// A, B and C are full clauses ("the cat sees the dog"); N is a bare noun phrase with no verb.
const clause = { subject: CAT, verb: SEE, directObject: DOG };
const WORKSPACE = [container('A', clause), container('B', clause), container('C', clause), container('N', { subject: CAT })];

// The caller owns `links` (it's persisted with the workspace), so the harness keeps it in state.
function renderLinks(containers = WORKSPACE, initialLinks: PhraseLink[] = []) {
  const hook = renderHook(() => {
    const [links, setLinks] = useState(initialLinks);
    return { links, ...useWorkspaceLinks(containers, links, setLinks) };
  });
  const byId = (id: string) => containers.find((c) => c.id === id)!;
  const of = (id: string) => hook.result.current.compartmentsFor(byId(id));
  return { ...hook, of };
}

const withoutIds = (links: PhraseLink[]) => links.map(({ id: _id, ...rest }) => rest);

describe('useWorkspaceLinks', () => {
  describe('pick mode', () => {
    it('starts a pick from the control clicked, and Escape abandons it', () => {
      const { result, of } = renderLinks();

      act(() => of('A').conditional.onStart());
      expect(result.current.pick).toEqual({ active: true, kind: 'conditional', source: { containerId: 'A' } });

      act(() => {
        fireEvent.keyDown(window, { key: 'Escape' });
      });
      expect(result.current.pick).toEqual({ active: false });
    });

    it('cancels from the banner too', () => {
      const { result, of } = renderLinks();

      act(() => of('A').relative.onStartLink('subject'));
      act(() => result.current.cancelPick());

      expect(result.current.pick).toEqual({ active: false });
    });

    it('ends the pick whether or not the target was legal', () => {
      const { result, of } = renderLinks();

      act(() => of('A').conditional.onStart());
      act(() => of('A').conditional.onPick());

      expect(result.current.pick).toEqual({ active: false });
      expect(result.current.links).toEqual([]);
    });

    it('ignores a pick landing on a control of a different kind', () => {
      const { result, of } = renderLinks();

      act(() => of('A').conditional.onStart());
      act(() => of('B').instrumental.onPick());

      expect(result.current.links).toEqual([]);
      expect(result.current.pick.active).toBe(true);
    });
  });

  describe('a relative clause', () => {
    it('links the source noun to the noun picked in another container', () => {
      const { result, of } = renderLinks();

      act(() => of('A').relative.onStartLink('subject'));
      act(() => of('B').relative.onPick('directObject'));

      expect(withoutIds(result.current.links)).toEqual([
        { source: { containerId: 'A', nounKey: 'subject' }, target: { containerId: 'B', nounKey: 'directObject' } },
      ]);
      expect(result.current.pick).toEqual({ active: false });
      expect([...of('A').relative.sourceKeys]).toEqual(['subject']);
      expect([...of('B').relative.targetKeys]).toEqual(['directObject']);
    });

    it('offers only filled nouns of other containers that are not already a gap', () => {
      const { of } = renderLinks([container('A', clause), container('B', { subject: CAT })], [
        { id: 'x', source: { containerId: 'A', nounKey: 'directObject' }, target: { containerId: 'B', nounKey: 'subject' } },
      ]);

      act(() => of('A').relative.onStartLink('subject'));

      expect(of('B').relative.isPickTarget('directObject')).toBe(false); // empty
      expect(of('B').relative.isPickTarget('subject')).toBe(false); // already a gap
      expect(of('A').relative.isPickTarget('directObject')).toBe(false); // own container
    });

    it('refuses a link that would close a cycle', () => {
      // A heads a clause in B, so B's noun may not head a clause in A.
      const { result, of } = renderLinks(WORKSPACE, [
        { id: 'x', source: { containerId: 'A', nounKey: 'subject' }, target: { containerId: 'B', nounKey: 'subject' } },
      ]);

      act(() => of('B').relative.onStartLink('directObject'));
      expect(of('A').relative.isPickTarget('directObject')).toBe(false);

      act(() => of('A').relative.onPick('directObject'));
      expect(result.current.links).toHaveLength(1);
    });

    it('keeps one link per source noun and one incoming link per container', () => {
      const { result, of } = renderLinks();

      act(() => of('A').relative.onStartLink('subject'));
      act(() => of('B').relative.onPick('subject'));
      // Re-linking the same source noun replaces its link…
      act(() => of('A').relative.onStartLink('subject'));
      act(() => of('C').relative.onPick('subject'));
      // …and a second link into C replaces the one already there.
      act(() => of('B').relative.onStartLink('directObject'));
      act(() => of('C').relative.onPick('directObject'));

      expect(withoutIds(result.current.links)).toEqual([
        { source: { containerId: 'B', nounKey: 'directObject' }, target: { containerId: 'C', nounKey: 'directObject' } },
      ]);
    });

    it('removes only the link sourced at the noun asked', () => {
      const { result, of } = renderLinks(WORKSPACE, [
        { id: 's', source: { containerId: 'A', nounKey: 'subject' }, target: { containerId: 'B', nounKey: 'subject' } },
        { id: 'o', source: { containerId: 'A', nounKey: 'directObject' }, target: { containerId: 'C', nounKey: 'subject' } },
      ]);

      act(() => of('A').relative.onRemoveLink('subject'));

      expect(result.current.links.map((l) => l.id)).toEqual(['o']);
    });
  });

  describe('a conditional', () => {
    it('makes the container picked the “if” clause of the one that started', () => {
      const { result, of } = renderLinks();

      act(() => of('A').conditional.onStart());
      expect(of('B').conditional.isPickTarget).toBe(true);
      expect(of('A').conditional.isPickTarget).toBe(false);
      act(() => of('B').conditional.onPick());

      expect(withoutIds(result.current.links)).toEqual([
        { kind: 'conditional', source: { containerId: 'A' }, target: { containerId: 'B' } },
      ]);
      expect(of('A').conditional).toMatchObject({ hasSource: true, hasTarget: false });
      expect(of('B').conditional).toMatchObject({ hasSource: false, hasTarget: true });
    });

    it('gives a main clause one “if” clause: picking again replaces it', () => {
      const { result, of } = renderLinks();

      act(() => of('A').conditional.onStart());
      act(() => of('B').conditional.onPick());
      act(() => of('A').conditional.onStart());
      act(() => of('C').conditional.onPick());

      expect(withoutIds(result.current.links)).toEqual([
        { kind: 'conditional', source: { containerId: 'A' }, target: { containerId: 'C' } },
      ]);
    });

    it('refuses a container already in another clause-level relation', () => {
      const { result, of } = renderLinks(WORKSPACE, [
        { id: 'co', kind: 'coordinative', conjunction: 'and', source: { containerId: 'B' }, target: { containerId: 'C' } },
      ]);

      act(() => of('A').conditional.onStart());
      expect(of('B').conditional.isPickTarget).toBe(false);
      expect(of('C').conditional.isPickTarget).toBe(false);
      act(() => of('C').conditional.onPick());

      expect(result.current.links.map((l) => l.id)).toEqual(['co']);
    });

    it('clears the main clause’s conditional', () => {
      const { result, of } = renderLinks(WORKSPACE, [
        { id: 'if', kind: 'conditional', source: { containerId: 'A' }, target: { containerId: 'B' } },
      ]);

      act(() => of('A').conditional.onClear());

      expect(result.current.links).toEqual([]);
    });
  });

  describe('a coordination', () => {
    it('joins the two clauses with the conjunction chosen, shown on both ends', () => {
      const { result, of } = renderLinks();

      act(() => of('A').coordinative.onStart('but'));
      act(() => of('B').coordinative.onPick());

      expect(withoutIds(result.current.links)).toEqual([
        { kind: 'coordinative', conjunction: 'but', source: { containerId: 'A' }, target: { containerId: 'B' } },
      ]);
      expect(of('A').coordinative).toMatchObject({ hasSource: true, conjunction: 'but' });
      expect(of('B').coordinative).toMatchObject({ hasTarget: true, conjunction: 'but' });
    });

    it('only joins clauses of the same mood', () => {
      const command = { ...clause, imperative: true };
      const { of } = renderLinks([container('A', command), container('B', clause), container('C', command)]);

      act(() => of('A').coordinative.onStart('and'));

      expect(of('B').coordinative.isPickTarget).toBe(false);
      expect(of('C').coordinative.isPickTarget).toBe(true);
    });

    it('passes a command’s person and register on to the clause coordinated with it', () => {
      const command: PhraseSelection = { ...clause, imperative: true, imperativePerson: '1pl', imperativeRegister: 'instruction' };
      const { of } = renderLinks([container('A', command), container('B', { ...clause, imperative: true })], [
        { id: 'co', kind: 'coordinative', conjunction: 'then', source: { containerId: 'A' }, target: { containerId: 'B' } },
      ]);

      expect(of('B').coordinative.inheritedCommand).toEqual({ person: '1pl', register: 'instruction' });
      expect(of('A').coordinative.inheritedCommand).toBeUndefined();
    });
  });

  describe('an instrument', () => {
    it('links a clause to a verbless period, starting at the object level', () => {
      const { result, of } = renderLinks();

      act(() => of('A').instrumental.onStart());
      expect(of('B').instrumental.isPickTarget).toBe(false); // has a verb
      expect(of('N').instrumental.isPickTarget).toBe(true);
      act(() => of('N').instrumental.onPick());

      expect(withoutIds(result.current.links)).toEqual([
        { kind: 'instrumental', level: 'object', source: { containerId: 'A' }, target: { containerId: 'N' } },
      ]);
      expect(of('N').instrumental).toMatchObject({ hasTarget: true, level: 'object' });
    });

    it('changes the reification level from either end', () => {
      const { result, of } = renderLinks(WORKSPACE, [
        { id: 'i', kind: 'instrumental', source: { containerId: 'A' }, target: { containerId: 'N' } },
      ]);

      act(() => of('N').instrumental.onLevelChange('process'));
      expect(of('A').instrumental.level).toBe('process');

      act(() => of('A').instrumental.onLevelChange('concept'));
      expect(result.current.links[0]).toMatchObject({ level: 'concept' });
    });

    it('leaves the acting clause free to take a condition, but not the instrument', () => {
      const { of } = renderLinks(WORKSPACE, [
        { id: 'i', kind: 'instrumental', source: { containerId: 'A' }, target: { containerId: 'N' } },
      ]);

      act(() => of('B').conditional.onStart());

      expect(of('A').conditional.isPickTarget).toBe(true);
      expect(of('N').conditional.isPickTarget).toBe(false);
    });

    it('clears the clause’s instrument', () => {
      const { result, of } = renderLinks(WORKSPACE, [
        { id: 'i', kind: 'instrumental', source: { containerId: 'A' }, target: { containerId: 'N' } },
      ]);

      act(() => of('A').instrumental.onClear());

      expect(result.current.links).toEqual([]);
    });
  });

  describe('dropping a container', () => {
    it('removes every link touching it, whichever end', () => {
      const { result } = renderLinks(WORKSPACE, [
        { id: 'in', kind: 'conditional', source: { containerId: 'A' }, target: { containerId: 'B' } },
        { id: 'out', source: { containerId: 'B', nounKey: 'subject' }, target: { containerId: 'C', nounKey: 'subject' } },
        { id: 'kept', kind: 'instrumental', source: { containerId: 'C' }, target: { containerId: 'N' } },
      ]);

      act(() => result.current.dropContainer('B'));

      expect(result.current.links.map((l) => l.id)).toEqual(['kept']);
    });

    it('abandons a pick sourced there, and only there', () => {
      const { result, of } = renderLinks();

      act(() => of('A').conditional.onStart());
      act(() => result.current.dropContainer('B'));
      expect(result.current.pick.active).toBe(true);

      act(() => result.current.dropContainer('A'));
      expect(result.current.pick).toEqual({ active: false });
    });
  });
});
