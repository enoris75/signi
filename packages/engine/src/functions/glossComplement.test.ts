import { describe, expect, test } from 'vitest';
import type { Specifier } from '@signi/shared';
import { el, np } from '../languages/resolved.fixtures.js';
import { glossComplement } from './glossComplement.js';

const PLACE = { base: 'place', plural: 'places', count: 'singular' };
const UNDER: Specifier[] = [{ kind: 'path', value: 'under' }];

describe('glossComplement', () => {
  test('is the slot itself, as the one complement of the type it names', () => {
    const slot = el(np(PLACE, { definiteness: 'all' }, { complementGloss: { type: 'locative' } }));
    expect(glossComplement(slot)).toEqual({ locative: { phrase: slot } });
  });

  test('carries the complement\'s specifiers', () => {
    const slot = el(np(PLACE, {}, { complementGloss: { type: 'direction', specifiers: UNDER } }));
    expect(glossComplement(slot)).toEqual({ direction: { phrase: slot, specifiers: UNDER } });
  });

  test('is empty for a slot that is not a gloss, which renders no complement at all', () => {
    expect(glossComplement(el(np(PLACE)))).toEqual({});
    expect(glossComplement(el(np(PLACE, {}, { complementGloss: { type: 'locative' } }), np(PLACE)))).toEqual({});
  });
});
