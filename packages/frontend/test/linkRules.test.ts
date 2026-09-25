import { describe, expect, it } from 'vitest';
import type { Concept } from '@signi/shared';
import type { PhraseContainer, PhraseLink } from '../src/components/PhraseBuilder/interfaces.ts';
import {
  addConditional,
  addCoordinative,
  addInstrumental,
  addRelativeLink,
  addSubordinate,
  canBeCondition,
  canBeCoordinate,
  canBeInstrument,
  canBeRelativeTarget,
  canBeSubordinate,
  canStartCondition,
  canStartCoordination,
  canStartSubordinate,
  clearSubordinate,
  inClauseRelation,
  setInstrumentalLevel,
  setInstrumentalNegative,
  setRelativeHeadless,
  setInfinitiveControl,
} from '../src/components/PhraseBuilder/linkRules.ts';

const noun = (id: string): Concept => ({ id, role: 'noun', description: id });
const verb = (id: string): Concept => ({ id, role: 'verb', description: id });

const A: PhraseContainer = { id: 'A', selection: { subject: noun('CAT'), verb: verb('SEE') } };
const B: PhraseContainer = { id: 'B', selection: { subject: noun('DOG'), directObject: noun('CAT'), verb: verb('EAT') } };
const C: PhraseContainer = { id: 'C', selection: { subject: noun('STICK') } };
const CONTAINERS = [A, B, C];

describe('linkRules', () => {
  it('lets a relative clause land on a filled noun of another period, once', () => {
    expect(canBeRelativeTarget(CONTAINERS, [], 'A', { containerId: 'B', nounKey: 'directObject' })).toBe(true);
    expect(canBeRelativeTarget(CONTAINERS, [], 'A', { containerId: 'A', nounKey: 'subject' })).toBe(false);
    expect(canBeRelativeTarget(CONTAINERS, [], 'A', { containerId: 'C', nounKey: 'directObject' })).toBe(false);
    const links = addRelativeLink([], { containerId: 'A', nounKey: 'subject' }, { containerId: 'B', nounKey: 'subject' }, 'l1');
    expect(canBeRelativeTarget(CONTAINERS, links, 'C', { containerId: 'B', nounKey: 'subject' })).toBe(false);
    // Nor back up the tree it hangs from.
    expect(canBeRelativeTarget(CONTAINERS, links, 'B', { containerId: 'A', nounKey: 'subject' })).toBe(false);
  });

  // P09-E44: the capacity one acts in is never a relative's gap (A288), "the friend the man acts as".
  it('never offers the role as a relative clause’s gap', () => {
    const act: PhraseContainer = { id: 'R', selection: { subject: noun('MAN'), verb: verb('ACT'), role: noun('FRIEND') } };

    expect(canBeRelativeTarget([...CONTAINERS, act], [], 'A', { containerId: 'R', nounKey: 'role' })).toBe(false);
    expect(canBeRelativeTarget([...CONTAINERS, act], [], 'A', { containerId: 'R', nounKey: 'subject' })).toBe(true);
  });

  // P09-E45: the opponent is a gap like any box, "the dog against which the cat plays".
  it('offers a filled opponent as a relative clause’s gap', () => {
    const play: PhraseContainer = { id: 'P', selection: { subject: noun('CAT'), verb: verb('PLAY_GAME'), opponent: noun('DOG') } };

    expect(canBeRelativeTarget([...CONTAINERS, play], [], 'A', { containerId: 'P', nounKey: 'opponent' })).toBe(true);
    expect(canBeRelativeTarget(CONTAINERS, [], 'A', { containerId: 'B', nounKey: 'opponent' })).toBe(false);
  });

  it('gives a period one subordinate role: a relative gap is no if-clause, coordinate or instrument', () => {
    const links = addRelativeLink([], { containerId: 'A', nounKey: 'subject' }, { containerId: 'C', nounKey: 'subject' }, 'l1');
    expect(inClauseRelation(links, 'C')).toBe(true);
    expect(canBeCondition(CONTAINERS, links, 'B', 'C')).toBe(false);
    expect(canBeCoordinate(CONTAINERS, links, 'B', 'C')).toBe(false);
    expect(canBeInstrument(CONTAINERS, links, 'B', 'C')).toBe(false);
  });

  it('takes a period out of whatever held it when it becomes a relative gap', () => {
    const cond = addConditional([], 'A', 'B', 'l1');
    const links = addRelativeLink(cond, { containerId: 'C', nounKey: 'subject' }, { containerId: 'B', nounKey: 'subject' }, 'l2');
    expect(links.map((l) => l.id)).toEqual(['l2']);
  });

  it('keeps one if-clause per main clause, and none from a command', () => {
    let links: PhraseLink[] = addConditional([], 'A', 'B', 'l1');
    links = addConditional(links, 'A', 'C', 'l2');
    expect(links).toEqual([expect.objectContaining({ id: 'l2', target: { containerId: 'C' } })]);
    expect(canStartCondition(links, { id: 'B', selection: { imperative: true } })).toBe(false);
    expect(canStartCondition([], A)).toBe(true);
    // Nor from a question: the conditional mood drops it (P09-E12 M5).
    expect(canStartCondition([], { id: 'Q', selection: { interrogative: true } })).toBe(false);
  });

  it('coordinates two periods of one mood', () => {
    const command: PhraseContainer = { id: 'D', selection: { imperative: true } };
    expect(canBeCoordinate([...CONTAINERS, command], [], 'A', 'D')).toBe(false);
    expect(canBeCoordinate(CONTAINERS, [], 'A', 'B')).toBe(true);
    // A question with a question, not with a statement: the pair shares one force (P09-E12 M5).
    const question: PhraseContainer = { id: 'Q', selection: { interrogative: true } };
    const another: PhraseContainer = { id: 'R', selection: { interrogative: true } };
    expect(canBeCoordinate([...CONTAINERS, question], [], 'A', 'Q')).toBe(false);
    expect(canBeCoordinate([question, another], [], 'Q', 'R')).toBe(true);
    const links = addCoordinative([], 'A', 'B', 'but', 'l1');
    expect(canStartCoordination(links, B)).toBe(false);
    expect(links[0]).toMatchObject({ kind: 'coordinative', conjunction: 'but' });
  });

  // P09-E12 D9: the three subordinate clauses.
  describe('subordinate clauses', () => {
    const say: Concept = { ...verb('SAY'), clauseObject: 'content' };
    const need: Concept = { ...verb('NEED'), clauseObject: 'infinitive' };
    const SAYS: PhraseContainer = { id: 'S', selection: { subject: noun('MAN'), verb: say } };
    const NEEDS: PhraseContainer = { id: 'N', selection: { subject: noun('CAT'), verb: need } };
    const ALL = [...CONTAINERS, SAYS, NEEDS];

    it('lets a verb govern what it takes: a that-clause with no object, an infinitive, an adverbial clause always', () => {
      expect(canStartSubordinate([], SAYS, 'content')).toBe(true);
      expect(canStartSubordinate([], { ...SAYS, selection: { ...SAYS.selection, directObject: noun('WORD') } }, 'content')).toBe(false);
      expect(canStartSubordinate([], SAYS, 'infinitive')).toBe(false);
      expect(canStartSubordinate([], NEEDS, 'infinitive')).toBe(true);
      expect(canStartSubordinate([], NEEDS, 'content')).toBe(false);
      expect(canStartSubordinate([], A, 'adverbial')).toBe(true);
      expect(canStartSubordinate([], C, 'adverbial')).toBe(false);
      // A period folded into another governs none: subordinate clauses do not nest.
      expect(canStartSubordinate(addSubordinate([], 'A', 'S', 'adverbial', 'l1'), SAYS)).toBe(false);
    });

    it('takes a plain clause: no mood, no link of its own, no cycle', () => {
      expect(canBeSubordinate(ALL, [], 'S', 'B', 'content')).toBe(true);
      expect(canBeSubordinate(ALL, [], 'S', 'S', 'content')).toBe(false);
      const command = { ...B, selection: { ...B.selection, imperative: true } };
      expect(canBeSubordinate([A, command, SAYS], [], 'S', 'B', 'adverbial')).toBe(false);
      const citation = { ...B, selection: { ...B.selection, infinitive: true } };
      expect(canBeSubordinate([A, citation, NEEDS], [], 'N', 'B', 'adverbial')).toBe(false);
      expect(canBeSubordinate([A, citation, NEEDS], [], 'N', 'B', 'infinitive')).toBe(true);
      expect(canBeSubordinate(ALL, addCoordinative([], 'B', 'C', 'and', 'k'), 'S', 'B', 'content')).toBe(false);
      expect(canBeSubordinate(ALL, addInstrumental([], 'B', 'C', 'i'), 'S', 'B', 'content')).toBe(false);
      expect(canBeSubordinate(ALL, addSubordinate([], 'S', 'A', 'content', 's'), 'A', 'S', 'adverbial')).toBe(false);
      // Nor a question (P09-E12 M5): a content clause keeps a statement's order, so the engine would
      // speak a question inside it ("says that does the cat run").
      const question = { ...B, selection: { ...B.selection, interrogative: true } };
      expect(canBeSubordinate([A, question, SAYS], [], 'S', 'B', 'content')).toBe(false);
      expect(canBeSubordinate([A, question, SAYS], [], 'S', 'B', 'adverbial')).toBe(false);
      const wh = { ...B, selection: { ...B.selection, interrogative: true, questionRole: 'subject' as const } };
      expect(canBeSubordinate([A, wh, SAYS], [], 'S', 'B', 'content')).toBe(false);
      // The clause governing it may be a question ("does the man say that the cat runs?").
      const asking = { ...SAYS, selection: { ...SAYS.selection, interrogative: true } };
      expect(canStartSubordinate([], asking, 'content')).toBe(true);
      expect(canBeSubordinate([A, B, asking], [], 'S', 'B', 'content')).toBe(true);
      // It may keep its relative clauses.
      const rel = addRelativeLink([], { containerId: 'B', nounKey: 'subject' }, { containerId: 'C', nounKey: 'subject' }, 'r');
      expect(canBeSubordinate(ALL, rel, 'S', 'B', 'content')).toBe(true);
    });

    it('keeps one subordinate clause per governing clause, and ties the clause up in it', () => {
      let links = addSubordinate([], 'S', 'A', 'content', 's1');
      links = addSubordinate(links, 'S', 'B', 'adverbial', 's2', 'before');
      expect(links).toEqual([{ id: 's2', kind: 'adverbial', conjunction: 'before', source: { containerId: 'S' }, target: { containerId: 'B' } }]);
      expect(inClauseRelation(links, 'B')).toBe(true);
      expect(inClauseRelation(links, 'S')).toBe(true);
      expect(canStartCondition(links, B)).toBe(false);
      expect(canStartCoordination(links, B)).toBe(false);
      expect(clearSubordinate(links, 'S', 'content')).toEqual(links);
      expect(clearSubordinate(links, 'S')).toEqual([]);
    });
  });

  it('holds an instrument as a thing only when its period has no verb, and as an act either way', () => {
    expect(canBeInstrument(CONTAINERS, [], 'A', 'C')).toBe(true);
    expect(canBeInstrument(CONTAINERS, [], 'A', 'B')).toBe(false);
    expect(canBeInstrument(CONTAINERS, [], 'A', 'B', 'process')).toBe(true);
    const links = setInstrumentalLevel(addInstrumental([], 'A', 'C', 'l1'), 'C', 'concept');
    expect(links[0]).toMatchObject({ kind: 'instrumental', level: 'concept' });
  });

  // The privative (P09-E2): the instrument denied, from either end of the link, and taken back.
  it('denies an instrument from either end, and takes the denial back without a trace', () => {
    const plain = addInstrumental([], 'A', 'C', 'l1');
    expect(plain[0]).not.toHaveProperty('negative');
    const denied = setInstrumentalNegative(plain, 'A', true);
    expect(denied[0]).toMatchObject({ kind: 'instrumental', level: 'object', negative: true });
    expect(setInstrumentalNegative(plain, 'C', true)).toEqual(denied);
    expect(setInstrumentalNegative(denied, 'C', false)).toEqual(plain);
    // A container in no instrumental link changes nothing.
    expect(setInstrumentalNegative(plain, 'B', true)).toEqual(plain);
  });

  it('hands an infinitive to the governing clause’s object from either end, and back with no flag (P13)', () => {
    const plain = addSubordinate([], 'B', 'C', 'infinitive', 'l1');
    const object = setInfinitiveControl(plain, 'B', true);
    expect(object[0]).toMatchObject({ kind: 'infinitive', control: 'object' });
    expect(setInfinitiveControl(plain, 'C', true)).toEqual(object);
    expect(setInfinitiveControl(object, 'C', false)).toEqual(plain);
    expect(setInfinitiveControl(addSubordinate([], 'B', 'C', 'content', 'l2'), 'B', true)[0]).not.toHaveProperty('control');
  });

  it('takes a gap no box holds: the instrument of a verb that takes one, and the subject’s possessor (P13)', () => {
    const cut: PhraseContainer = { id: 'K', selection: { subject: noun('BOY'), verb: { ...verb('CUT'), complements: ['instrumental'] } } };
    const owned: PhraseContainer = { id: 'O', selection: { subject: noun('CAT'), subjectPossessor: { subject: noun('MAN') }, verb: verb('RUN') } };
    const all = [...CONTAINERS, cut, owned];
    expect(canBeRelativeTarget(all, [], 'A', { containerId: 'K', nounKey: 'instrumental' })).toBe(true);
    expect(canBeRelativeTarget(all, [], 'A', { containerId: 'B', nounKey: 'instrumental' })).toBe(false);
    expect(canBeRelativeTarget(all, [], 'A', { containerId: 'O', nounKey: 'subject/possessor' })).toBe(true);
    expect(canBeRelativeTarget(all, [], 'A', { containerId: 'K', nounKey: 'subject/possessor' })).toBe(false);
    // An instrument already linked is no gap, and a gap takes no instrument link.
    expect(canBeRelativeTarget(all, addInstrumental([], 'K', 'C', 'i'), 'A', { containerId: 'K', nounKey: 'instrumental' })).toBe(false);
    const gapped = addRelativeLink([], { containerId: 'A', nounKey: 'subject' }, { containerId: 'K', nounKey: 'instrumental' }, 'r');
    expect(canBeInstrument(all, gapped, 'K', 'C')).toBe(false);
  });

  it('lets an infinitive govern an infinitive of its own, and nothing else, where it predicates one (P13)', () => {
    const allowed = { id: 'ALLOWED', role: 'adjective' as const, description: 'allowed', clauseObject: 'infinitive' as const };
    const cause = { ...verb('CAUSE_VERB'), clauseObject: 'infinitive' as const };
    const main: PhraseContainer = { id: 'M', selection: { verb: cause, directObject: noun('PERSON') } };
    const be: PhraseContainer = { id: 'I', selection: { verb: verb('BE'), predicative: allowed, infinitive: true } };
    const linked = addSubordinate([], 'M', 'I', 'infinitive', 's');
    expect(canStartSubordinate(linked, be, 'infinitive')).toBe(true);
    expect(canStartSubordinate(linked, be, 'adverbial')).toBe(false);
    expect(canStartSubordinate(addSubordinate([], 'M', 'I', 'content', 's'), be, 'infinitive')).toBe(false);
  });

  it('says a noun’s relative clause alone, and says its head again with no flag left (P13)', () => {
    const headed = addRelativeLink([], { containerId: 'A', nounKey: 'subject' }, { containerId: 'B', nounKey: 'directObject' }, 'l1');
    const headless = setRelativeHeadless(headed, 'A', 'subject', true);
    expect(headless[0]).toMatchObject({ source: { nounKey: 'subject' }, headless: true });
    expect(setRelativeHeadless(headless, 'A', 'subject', false)).toEqual(headed);
    // Only the link that noun heads.
    expect(setRelativeHeadless(headed, 'A', 'directObject', true)).toEqual(headed);
  });
});

// A268. A question can be made the if-clause of another period. `canBeCondition` takes no containers,
// so it cannot see that the period it lands on asks something; the engine renders a condition in its
// own mood and drops the question there ("if the cat ran, the man would run."), while the period's
// question control stays lit and locked. `canBeSubordinate` refuses a question for the same reason
// (P09-E12 M5), and `canStartCondition` refuses one as the main clause. The fix gives
// `canBeCondition` the containers first, as `canBeCoordinate` and `canBeSubordinate` take them; the
// pin calls it in that shape, through the cast it was written with before the signature changed.
describe('known bugs: a question can become an if-clause (A268)', () => {
  const conditionAllowed = canBeCondition as unknown as (
    containers: PhraseContainer[], links: PhraseLink[], mainId: string, ifId: string,
  ) => boolean;
  const question: PhraseContainer = { id: 'Q', selection: { ...B.selection, interrogative: true } };
  const wh: PhraseContainer = { id: 'W', selection: { ...B.selection, interrogative: true, questionRole: 'subject' } };

  it('refuses a yes/no or a wh-question as the if-clause, and still takes a statement', () => {
    expect(conditionAllowed([A, B, question, wh], [], 'A', 'Q')).toBe(false);
    expect(conditionAllowed([A, B, question, wh], [], 'A', 'W')).toBe(false);
    expect(conditionAllowed([A, B, question, wh], [], 'A', 'B')).toBe(true);
  });
});
