import { describe, expect, test } from 'vitest';
import type { ResolvedRelativeClause } from '../types.js';
import { el, np, vp } from '../languages/resolved.fixtures.js';
import { relativeAlarmHead } from './relativeAlarmHead.js';

const GRIDARE = { base: 'gridare', alarm_cry: '1' };
const DIRE = { base: 'dire' };
const RAGAZZO = { base: 'ragazzo', animate: '1' };
const LUPO = { base: 'lupo', gender: 'masc', animate: '1', alarm: '1', definiteness: 'definite' };
const PAROLA = { base: 'parola', gender: 'fem', definiteness: 'definite' };
const QUALE = { base: 'quale', plural: 'quali', definiteness: 'definite' };

const cried = (rest: Partial<ResolvedRelativeClause> = {}): ResolvedRelativeClause =>
  ({ headRole: 'directObject', subject: el(np(RAGAZZO)), verbPhrase: vp(GRIDARE), ...rest });

describe('relativeAlarmHead', () => {
  // A129: "il lupo al quale il ragazzo gridò" relativises the alarm as the cry's a-complement.
  test('the alarm a cry raises is a stand-in for the head, on its agreement, without its alarm', () => {
    const head = relativeAlarmHead(np(LUPO, { number: 'plural' }, { relative: cried() }), QUALE);
    expect(head?.head.forms).toEqual({ gender: 'masc', number: 'plural', animate: '1', ...QUALE });
    expect(head?.relative).toBeUndefined();
  });

  test('any other object of the crying verb is no alarm', () => {
    expect(relativeAlarmHead(np(PAROLA, {}, { relative: cried() }), QUALE)).toBeUndefined();
  });

  test('a danger under a verb that cries no alarm is no alarm', () => {
    expect(relativeAlarmHead(np(LUPO, {}, { relative: cried({ verbPhrase: vp(DIRE) }) }), QUALE)).toBeUndefined();
  });

  test('a danger in any other role of the cry is no alarm', () => {
    expect(relativeAlarmHead(np(LUPO, {}, { relative: cried({ headRole: 'subject' }) }), QUALE)).toBeUndefined();
    expect(relativeAlarmHead(np(LUPO, {}, { relative: cried({ headRole: 'terminus', directObject: el(np(PAROLA)) }) }), QUALE)).toBeUndefined();
    expect(relativeAlarmHead(np(LUPO), QUALE)).toBeUndefined();
  });
});
