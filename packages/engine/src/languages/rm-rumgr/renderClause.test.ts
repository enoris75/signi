import { describe, expect, test } from 'vitest';
import { CHAUN, CURRER, GIAT, INS, JAU, MANGIAR, MIEUR, NUS, TI, clause, el, np, vp } from './rumgr.fixtures.js';
import { renderClause } from './renderClause.js';
import { rumantschGrischunEngine } from './rumantschGrischunEngine.js';

const KNOW = { base: 'savair', '1sg_present': 'sai', '3sg_present': 'sa' };

describe('renderClause', () => {
  test('the subject is always spoken, a pronoun included', () => {
    expect(renderClause(clause(np(GIAT), vp(MANGIAR), { directObject: el(np(MIEUR)) }))).toBe('il giat mangia la mieur');
    expect(renderClause(clause(np(NUS), vp(MANGIAR)))).toBe('nus mangiain');
    expect(renderClause(clause(np(INS), vp(MANGIAR), { directObject: el(np(MIEUR)) }))).toBe('ins mangia la mieur');
  });

  test('a command and an infinitive say none', () => {
    expect(renderClause(clause(np(TI), vp(MANGIAR, { mood: 'imperative' })))).toBe('mangia');
    expect(renderClause(clause(np(INS), vp(MANGIAR, { mood: 'infinitive' })))).toBe('mangiar');
  });

  test('an object clause under che, eliding before a vowel', () => {
    const content = clause(np(GIAT), vp(MANGIAR));
    expect(renderClause(clause(np(JAU), vp(KNOW), { contentObject: content }))).toBe("jau sai ch'il giat mangia");
  });

  test('an adverbial clause under its conjunction', () => {
    const when = { conjunction: 'when' as const, clause: clause(np(CHAUN), vp(CURRER)) };
    expect(renderClause(clause(np(GIAT), vp(MANGIAR), { adverbialClause: when }))).toBe("il giat mangia cura ch'il chaun curra");
  });

  test('a wh-question fronts its word and puts the subject last', () => {
    expect(renderClause(clause(np(TI), vp(MANGIAR), { question: { role: 'directObject', animate: false } as never }))).toBe('tge mangias ti');
  });
});

describe('rumantschGrischunEngine.render', () => {
  test('the hypothetical: sche + the conditional in both clauses', () => {
    const main = clause(np(GIAT), vp(MANGIAR, { mood: 'conditional' }));
    const condition = clause(np(CHAUN), vp(CURRER, { mood: 'subjunctive' }));
    expect(rumantschGrischunEngine.render({ ...main, condition })).toBe("sch'il chaun curriss, il giat mangiass");
  });

  test('coordination: , ma …; dentant as a clause of its own', () => {
    const second = clause(np(CHAUN), vp(MANGIAR));
    expect(rumantschGrischunEngine.render({ ...clause(np(GIAT), vp(CURRER)), coordination: { conjunction: 'but', clause: second } })).toBe('il giat curra, ma il chaun mangia');
    expect(rumantschGrischunEngine.render({ ...clause(np(GIAT), vp(CURRER)), coordination: { conjunction: 'however', clause: second } })).toBe('il giat curra; dentant, il chaun mangia');
  });

  test('the citation words', () => {
    expect(rumantschGrischunEngine.renderSubordinator!('whether')).toBe('sche');
    expect(rumantschGrischunEngine.renderSubordinator!('before')).toBe('avant che');
    expect(rumantschGrischunEngine.renderDegree!({ conceptId: 'BIG', forms: {} }, 'most')).toBe('il pli');
    expect(rumantschGrischunEngine.renderConjunction!('or')).toBe('u');
  });
});
