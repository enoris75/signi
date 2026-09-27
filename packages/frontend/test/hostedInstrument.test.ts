import { describe, expect, it } from 'vitest';
import type { Concept } from '@signi/shared';
import {
  addInstrumental,
  hostedInstrumentIds,
  hostOfInstrument,
  numberedContainers,
  periodOf,
  pruneUnhosted,
  setInstrumentalHosted,
} from '@signi/phrase/model/linkRules.ts';
import type { PhraseContainer, PhraseLink } from '@signi/phrase/model/interfaces.ts';
import { workspaceToPlans } from '@signi/phrase/model/workspacePlan/functions/workspaceToPlans.ts';

// P12: an instrument made in place is drawn inside its clause. The link says so; the plan does not
// change, and the period belongs to its clause — it has no number, and goes with its link.
const noun = (id: string): Concept => ({ id, role: 'noun', description: id });
const verb = (id: string, complements: Concept['complements'] = []): Concept => ({ id, role: 'verb', description: id, transitivity: 'transitive', complements });

const MAN_CUTS: PhraseContainer = { id: 'a', selection: { subject: noun('MAN'), verb: verb('CUT', ['instrumental']), directObject: noun('BOOK') } };
const STICK: PhraseContainer = { id: 'b', selection: { subject: noun('STICK') } };
const DOG: PhraseContainer = { id: 'c', selection: { subject: noun('DOG') } };

describe('the hosted instrument', () => {
  const hosted = addInstrumental([], 'a', 'b', 'l', 'object', true);
  const linked = addInstrumental([], 'a', 'b', 'l', 'object');

  it('is a flag on the link, set from either end', () => {
    expect(hosted[0]).toMatchObject({ kind: 'instrumental', hosted: true });
    expect(linked[0]).not.toHaveProperty('hosted');
    expect(setInstrumentalHosted(linked, 'b', true)).toEqual(hosted);
    expect(setInstrumentalHosted(hosted, 'a', false)).toEqual(linked);
  });

  it('plans exactly as the linked instrument does, at every level', () => {
    const containers = [MAN_CUTS, STICK, DOG];
    for (const level of ['object', 'process', 'concept'] as const) {
      const a = workspaceToPlans(containers, addInstrumental([], 'a', 'b', 'l', level, true));
      const b = workspaceToPlans(containers, addInstrumental([], 'a', 'b', 'l', level));
      expect(a).toEqual(b);
    }
  });

  it('has no number, and is said in its clause', () => {
    const links = hosted;
    expect([...hostedInstrumentIds(links)]).toEqual(['b']);
    expect(hostOfInstrument(links, 'b')).toBe('a');
    expect(numberedContainers([MAN_CUTS, STICK, DOG], links).map((c) => c.id)).toEqual(['a', 'c']);
    expect(periodOf(links, 'b')).toBe('a');
    expect(periodOf(linked, 'b')).toBe('b');
  });

  it('goes with its link, and takes the links it took part in with it', () => {
    const relative: PhraseLink = { id: 'r', source: { containerId: 'b', nounKey: 'subject' }, target: { containerId: 'c', nounKey: 'subject' } };
    const state = { containers: [MAN_CUTS, STICK, DOG], links: [...hosted, relative] };
    const pruned = pruneUnhosted({ containers: state.containers, links: [relative] }, state.links);
    expect(pruned.containers.map((c) => c.id)).toEqual(['a', 'c']);
    expect(pruned.links).toEqual([]);
  });

  it('stays while it is still some clause’s instrument, drawn as a card', () => {
    const state = { containers: [MAN_CUTS, STICK], links: setInstrumentalHosted(hosted, 'a', false) };
    expect(pruneUnhosted(state, hosted)).toEqual(state);
  });

  it('leaves a linked instrument’s period behind as a card when its link goes', () => {
    const state = { containers: [MAN_CUTS, STICK], links: [] };
    expect(pruneUnhosted(state, linked).containers).toHaveLength(2);
  });
});
