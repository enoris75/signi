import { describe, expect, test } from 'vitest';
import { concept, np } from '../languages/resolved.fixtures.js';
import { alarmCry } from './alarmCry.js';

const GRIDARE = concept({ base: 'gridare', alarm_cry: '1' }, 'SHOUT');
const DIRE = concept({ base: 'dire' }, 'SAY');
const LUPO = { base: 'lupo', gender: 'masc', alarm: '1' };
const PAROLA = { base: 'parola', gender: 'fem' };

describe('alarmCry', () => {
  // A124: a cry raises an alarm only when the verb cries one and the noun names a danger. A163: the
  // alarm has no determiner slot, so a definite one comes back as it is.
  test('a danger shouted by a crying verb is the alarm, the definite one as it is', () => {
    const wolf = np(LUPO, { definiteness: 'definite' });
    expect(alarmCry(GRIDARE, wolf)).toBe(wolf);
  });

  // A163: whatever determiner the plan gave it collapses into the definite, which the alarm frame fuses
  // ("gridò al lupo", never "*a un lupo"). The number and the possessor are not determiners, and stay.
  test('any other determiner comes back definite, the rest of the phrase kept', () => {
    for (const definiteness of ['indefinite', 'no', 'some', 'many', 'few', 'all', 'this', 'that']) {
      expect(alarmCry(GRIDARE, np(LUPO, { definiteness }))?.head.forms['definiteness']).toBe('definite');
    }
    const theirWolves = np(LUPO, { definiteness: 'indefinite', number: 'plural' }, { possessor: { kind: 'pronominal', person: '3', number: 'plural' } });
    expect(alarmCry(GRIDARE, theirWolves)).toMatchObject({
      head: { forms: { number: 'plural', definiteness: 'definite' } },
      possessor: { kind: 'pronominal', person: '3', number: 'plural' },
    });
  });

  test('any other object of the crying verb stays plain', () => {
    expect(alarmCry(GRIDARE, np(PAROLA, { definiteness: 'definite' }))).toBeUndefined();
  });

  test('a danger under a verb that cries no alarm stays plain', () => {
    expect(alarmCry(DIRE, np(LUPO, { definiteness: 'definite' }))).toBeUndefined();
  });

  test('a bare cry takes the definite article, leaving the original phrase untouched', () => {
    const bare = np(LUPO, { definiteness: 'bare' });
    const alarm = alarmCry(GRIDARE, bare);
    expect(alarm?.head.forms).toEqual({ ...LUPO, definiteness: 'definite' });
    expect(bare.head.forms['definiteness']).toBe('bare');
  });
});
