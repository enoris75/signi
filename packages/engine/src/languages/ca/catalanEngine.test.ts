import { describe, expect, test } from 'vitest';
import { clause, concept, CORRER, GAT, GOS, GRAN, BO, MENJAR, np, CASA, vp, el, RATOLI } from './ca.fixtures.js';
import { catalanEngine } from './catalanEngine.js';

describe('catalanEngine', () => {
  test('renders a clause, a condition before it and a coordination after it', () => {
    const phrase = clause(np(GAT), vp(MENJAR, { mood: 'conditional' }), {
      directObject: el(np(RATOLI)),
      condition: clause(np(GOS), vp(CORRER, { mood: 'subjunctive' })),
    });
    expect(catalanEngine.render(phrase)).toBe('si el gos corregués, el gat menjaria el ratolí');
    const both = clause(np(GAT), vp(MENJAR), { coordination: { conjunction: 'but', clause: clause(np(GOS), vp(CORRER)) } });
    expect(catalanEngine.render(both)).toBe('el gat menja, però el gos corre');
    const however = clause(np(GAT), vp(MENJAR), { coordination: { conjunction: 'however', clause: clause(np(GOS), vp(CORRER)) } });
    expect(catalanEngine.render(however)).toBe('el gat menja; tanmateix, el gos corre');
  });

  test('cites a word, a determiner and a possessive', () => {
    expect(catalanEngine.renderWord!(concept({ ...GRAN, gender: 'fem', number: 'plural' }))).toBe('grans');
    expect(catalanEngine.renderDeterminer!(concept({ ...CASA, definiteness: 'this' }))).toBe('aquesta');
    expect(catalanEngine.renderPossessive!(concept(CASA), { kind: 'pronominal', person: '1', number: 'singular' })).toBe('meva');
  });

  test('cites a subordinator and a conjunction', () => {
    expect(catalanEngine.renderSubordinator!('that')).toBe('que');
    expect(catalanEngine.renderSubordinator!('whether')).toBe('si');
    expect(catalanEngine.renderSubordinator!('before')).toBe('abans que');
    expect(catalanEngine.renderConjunction!('and')).toBe('i');
  });

  test('cites a specifier on a bare noun', () => {
    const bare = concept({ ...CASA, definiteness: 'bare' });
    expect(catalanEngine.renderSpecifier!(bare, { kind: 'path', value: 'behind' })).toBe('darrere de');
    expect(catalanEngine.renderSpecifier!(bare, { kind: 'sentiment', value: 'positive' })).toBe('gràcies a');
    expect(catalanEngine.renderSpecifier!(bare, { kind: 'temporal', value: 'until' } as never)).toBe('fins a');
  });

  test('cites a degree, suppletive for bo', () => {
    expect(catalanEngine.renderDegree!(concept(GRAN), 'more')).toBe('més');
    expect(catalanEngine.renderDegree!(concept(GRAN), 'most')).toBe('el més');
    expect(catalanEngine.renderDegree!(concept(BO), 'most')).toBe('el millor');
  });

  test('cites the examples relation', () => {
    expect(catalanEngine.renderExamples!('inclusion')).toBe('inclòs');
  });
});
