import { describe, expect, test } from 'vitest';
import { concept, el, group, np } from '../../languages/resolved.fixtures.js';
import { withAlarmCry } from './withAlarmCry.js';

const GRIDARE = concept({ base: 'gridare', alarm_cry: '1' }, 'CRY_OUT');
const VEDERE = concept({ base: 'vedere' }, 'SEE');
const LUPO = { base: 'lupo', plural: 'lupi', gender: 'masc', alarm: '1' };
const FUOCO = { base: 'fuoco', plural: 'fuochi', gender: 'masc', alarm: '1' };
const PAROLA = { base: 'parola', plural: 'parole', gender: 'fem' };

describe('withAlarmCry', () => {
  // A163: the alarm a cry raises has no determiner slot, so the plan's is dropped for the definite.
  test('makes the alarm a cry raises definite, whatever determiner it carries', () => {
    const cried = withAlarmCry(el(np(LUPO, { definiteness: 'indefinite' })), GRIDARE, 'it');
    expect(cried.conjuncts[0].head.forms).toMatchObject({ base: 'lupo', definiteness: 'definite' });
    expect(cried.agreement).toBe(cried.conjuncts[0].head.forms);
  });

  test('hands back an object that is already definite, or no alarm, as it is', () => {
    const theWolf = el(np(LUPO, { definiteness: 'definite' }));
    expect(withAlarmCry(theWolf, GRIDARE, 'it')).toBe(theWolf);
    const aWord = el(np(PAROLA, { definiteness: 'indefinite' }));
    expect(withAlarmCry(aWord, GRIDARE, 'it')).toBe(aWord);
    const aWolfSeen = el(np(LUPO, { definiteness: 'indefinite' }));
    expect(withAlarmCry(aWolfSeen, VEDERE, 'it')).toBe(aWolfSeen);
    expect(withAlarmCry(aWolfSeen, undefined, 'it')).toBe(aWolfSeen);
  });

  // A `no` conjunct marks the whole group negative, so the group agrees again once the alarm has none.
  test('resolves a group again, so an alarm leaves no negation on it', () => {
    const cried = withAlarmCry(group('and', np(LUPO, { definiteness: 'no' }), np(FUOCO, { definiteness: 'indefinite' })), GRIDARE, 'it');
    expect(cried.conjuncts.map((c) => c.head.forms['definiteness'])).toEqual(['definite', 'definite']);
    expect(cried.agreement).toEqual({ person: '3', number: 'plural', gender: 'masc' });
    expect(cried.conjunction).toBe('and');
  });

  test('leaves any other conjunct of the group, and its negation, alone', () => {
    const cried = withAlarmCry(group('and', np(LUPO, { definiteness: 'indefinite' }), np(PAROLA, { definiteness: 'no' })), GRIDARE, 'it');
    expect(cried.conjuncts.map((c) => c.head.forms['definiteness'])).toEqual(['definite', 'no']);
    expect(cried.agreement).toMatchObject({ number: 'plural', definiteness: 'no' });
  });
});
