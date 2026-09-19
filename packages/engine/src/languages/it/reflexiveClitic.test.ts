import { describe, expect, test } from 'vitest';
import { GATTO, IO, MANGIARE, MUOVERSI, NOI, SI, TU } from './it.fixtures.js';
import { reflexiveClitic } from './reflexiveClitic.js';

describe('reflexiveClitic', () => {
  test('a non-pronominal verb has none', () => {
    expect(reflexiveClitic(MANGIARE, GATTO)).toBe('');
    expect(reflexiveClitic({}, IO)).toBe('');
  });

  test('a -rsi infinitive takes the clitic agreeing with its subject', () => {
    expect(reflexiveClitic(MUOVERSI, IO)).toBe('mi');
    expect(reflexiveClitic(MUOVERSI, TU)).toBe('ti');
    expect(reflexiveClitic(MUOVERSI, GATTO)).toBe('si');
    expect(reflexiveClitic(MUOVERSI, NOI)).toBe('ci');
    expect(reflexiveClitic(MUOVERSI, { person: '2', number: 'plural' })).toBe('vi');
    expect(reflexiveClitic(MUOVERSI, { ...GATTO, number: 'plural' })).toBe('si');
  });

  test('under the impersonal si the reflexive clitic is ci', () => {
    expect(reflexiveClitic(MUOVERSI, SI)).toBe('ci');
    expect(reflexiveClitic(MANGIARE, SI)).toBe('');
  });
});
