import { describe, expect, test } from 'vitest';
import { concept, np } from '../languages/resolved.fixtures.js';
import { alarmCry } from './alarmCry.js';

const GRIDARE = concept({ base: 'gridare', alarm_cry: '1' }, 'SHOUT');
const DIRE = concept({ base: 'dire' }, 'SAY');
const LUPO = { base: 'lupo', gender: 'masc', alarm: '1' };
const PAROLA = { base: 'parola', gender: 'fem' };

describe('alarmCry', () => {
  // A124: a cry raises an alarm only when the verb cries one and the noun names a danger.
  test('a danger shouted by a crying verb is the alarm, its determiner kept', () => {
    const wolf = np(LUPO, { definiteness: 'definite' });
    expect(alarmCry(GRIDARE, wolf)).toBe(wolf);
    const aWolf = np(LUPO, { definiteness: 'indefinite' });
    expect(alarmCry(GRIDARE, aWolf)).toBe(aWolf);
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
