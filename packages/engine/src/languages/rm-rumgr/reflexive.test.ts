import { describe, expect, test } from 'vitest';
import { INS, JAU, MANGIAR, NUS, SA_TSCHENTAR, concept } from './rumgr.fixtures.js';
import { isReflexive, nonReflexiveVerb } from './nonReflexiveVerb.js';
import { reflexiveClitic, withClitic } from './reflexiveClitic.js';
import { withReflexive } from './withReflexive.js';

describe('nonReflexiveVerb', () => {
  test('strips the clitic off the base, the cells and the imperatives', () => {
    const plain = nonReflexiveVerb(concept(SA_TSCHENTAR)).forms;
    expect(isReflexive(SA_TSCHENTAR)).toBe(true);
    expect(plain['base']).toBe('tschentar');
    expect(plain['1sg_present']).toBe('tschent');
    expect(plain['2sg_imperative']).toBe('tschenta');
    expect(plain['aux']).toBe('be');
  });

  test('leaves any other verb alone', () => {
    const verb = concept(MANGIAR);
    expect(nonReflexiveVerb(verb)).toBe(verb);
  });
});

describe('reflexiveClitic / withClitic', () => {
  test("the subject's clitic, ins taking sa", () => {
    expect(reflexiveClitic(SA_TSCHENTAR, JAU)).toBe('ma');
    expect(reflexiveClitic(SA_TSCHENTAR, NUS)).toBe('ans');
    expect(reflexiveClitic(SA_TSCHENTAR, INS)).toBe('sa');
    expect(reflexiveClitic(MANGIAR, JAU)).toBe('');
  });

  test('ma, ta, sa elide before a vowel', () => {
    expect(withClitic('sa', 'avra')).toBe("s'avra");
    expect(withClitic('ans', 'avrin')).toBe('ans avrin');
    expect(withClitic('ma', 'tschent')).toBe('ma tschent');
  });
});

describe('withReflexive', () => {
  test('the clitic before the lexical verb: the finite one, or the last of the group', () => {
    expect(withReflexive({ finite: 'tschenta', rest: [] }, 'sa')).toEqual({ finite: 'sa tschenta', rest: [] });
    expect(withReflexive({ finite: 'è', rest: ['tschentà'] }, 'sa')).toEqual({ finite: 'è', rest: ['sa tschentà'] });
    expect(withReflexive({ finite: 'vegn', rest: ['a', 'tschentar'] }, 'sa').rest).toEqual(['a', 'sa tschentar']);
  });
});
