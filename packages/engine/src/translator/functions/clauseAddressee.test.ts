import { describe, expect, test } from 'vitest';
import { vp } from '../../languages/resolved.fixtures.js';
import { clauseAddressee } from './clauseAddressee.js';

const tell = vp({ base: 'tell', clause_terminus_bare: '1' });

describe('clauseAddressee', () => {
  test('a verb naming clause_terminus_bare leaves its addressee bare before a clause (tells the dog that…)', () => {
    expect(clauseAddressee(tell, true)?.verb.forms['terminus_bare']).toBe('1');
  });

  test('a noun object keeps the addressee behind "to" (tells the story to the man)', () => {
    expect(clauseAddressee(tell, false)).toBe(tell);
  });

  test('a verb that does not say so is unchanged (says to the dog that…)', () => {
    const say = vp({ base: 'say' });
    expect(clauseAddressee(say, true)).toBe(say);
    expect(clauseAddressee(undefined, true)).toBeUndefined();
  });
});
