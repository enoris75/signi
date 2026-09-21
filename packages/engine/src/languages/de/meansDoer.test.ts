import { describe, expect, test } from 'vitest';
import { clause, DU, el, ESSEN, ICH, KATER, KATZE, MAN, MAUS, np, vp } from './de.fixtures.js';
import { meansDoer } from './meansDoer.js';

describe('meansDoer', () => {
  test("a statement's means clause is its subject's, generic or not", () => {
    expect(meansDoer(clause(np(KATER), vp(ESSEN)))).toEqual(KATER);
    expect(meansDoer(clause(np(ICH), vp(ESSEN, { mood: 'conditional' })))).toEqual(ICH);
    expect(meansDoer(clause(el(np(KATER), np(KATZE)), vp(ESSEN)))).toEqual({ person: '3', number: 'plural', gender: 'masc' });
    expect(meansDoer(clause(np(MAN), vp(ESSEN)))).toEqual(MAN);
  });

  // The patient is the passive's subject; the act is still the agent's.
  test("a passive's is its agent's, and nobody's without one", () => {
    const passive = vp(ESSEN, { voice: 'passive' });
    expect(meansDoer(clause(np(MAUS), passive, { agent: el(np(KATER)) }))).toEqual(KATER);
    expect(meansDoer(clause(np(MAUS), passive))).toBeUndefined();
  });

  test("a command's is its addressee's; an instruction's is nobody's", () => {
    const command = (register?: 'instruction') => vp(ESSEN, { mood: 'imperative', ...(register ? { register } : {}) });
    expect(meansDoer(clause(np(DU), command()))).toEqual({ person: '2', number: 'singular' });
    expect(meansDoer(clause(np(DU, { number: 'plural' }), command()))).toEqual({ person: '2', number: 'plural' });
    expect(meansDoer(clause(np(ICH, { number: 'plural' }), command()))).toEqual({ person: '1', number: 'plural' });
    expect(meansDoer(clause(np(DU), command('instruction')))).toBeUndefined();
  });

  test("a citation's is nobody's, a zu-infinitive's its controller's", () => {
    const infinitive = vp(ESSEN, { mood: 'infinitive' });
    expect(meansDoer(clause(np(KATER), infinitive))).toBeUndefined();
    expect(meansDoer(clause(np(KATER), infinitive), true)).toEqual(KATER);
  });
});
