import { describe, expect, test } from 'vitest';
import { BEWEGEN, ESSEN } from './de.fixtures.js';
import { nonReflexiveVerb } from './nonReflexiveVerb.js';

describe('nonReflexiveVerb', () => {
  test('takes "sich" off the citation and keeps the finite forms', () => {
    const plain = nonReflexiveVerb({ conceptId: 'MOVE_ONESELF', forms: BEWEGEN });
    expect(plain.forms['base']).toBe('bewegen');
    expect(plain.forms['3sg_present']).toBe('bewegt');
    expect(plain.forms['participle']).toBe('bewegt');
    expect(plain.conceptId).toBe('MOVE_ONESELF');
  });

  test('a reflexive verb forms its perfect with haben', () => {
    expect(nonReflexiveVerb({ conceptId: 'TEST', forms: { ...BEWEGEN, aux: 'be' } }).forms['aux']).toBeUndefined();
  });

  test('returns any other verb unchanged', () => {
    const verb = { conceptId: 'EAT', forms: ESSEN };
    expect(nonReflexiveVerb(verb)).toBe(verb);
  });
});
