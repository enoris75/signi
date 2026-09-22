import { describe, expect, test } from 'vitest';
import type { Specifier } from '@signi/shared';
import type { RubySegment } from '../../types.js';
import { complement, el, type Forms, IE, np } from './ja.fixtures.js';
import { complementGlossSegs } from './complementGlossSegs.js';
import { complementSegs } from './complementSegs.js';

const text = (segs: RubySegment[]): string => segs.map((s) => s.t).join('');

/** A verbless subject flagged as the `type` complement, with that complement's specifiers. */
const gloss = (extra: Forms, type: 'locative' | 'direction', specifiers?: Specifier[]) =>
  el(np(IE, extra, { complementGloss: { type, ...(specifiers ? { specifiers } : {}) } }));
const UNDER: Specifier[] = [{ kind: 'path', value: 'under' }];
const INTO: Specifier[] = [{ kind: 'path', value: 'in' }];

describe('complementGlossSegs', () => {
  test('a locative is the place where something happens, closed by で', () => {
    expect(complementGlossSegs(gloss({ definiteness: 'all', number: 'plural' }, 'locative')))
      .toEqual([{ t: 'すべての' }, { t: '家', r: 'いえ' }, { t: 'で' }]);
  });

  test('a direction with no relation is the plain goal, closed by へ', () => {
    expect(text(complementGlossSegs(gloss({ definiteness: 'indefinite' }, 'direction')))).toBe('家へ');
  });

  // With no verb there is no existential or `locative_particle` to ask for に.
  test('a relation puts its relational noun before the particle', () => {
    expect(text(complementGlossSegs(gloss({}, 'locative', UNDER)))).toBe('家の下で');
    expect(text(complementGlossSegs(gloss({}, 'direction', INTO)))).toBe('家の中へ');
  });

  test('it is exactly what a clause renders for the same complement', () => {
    for (const type of ['locative', 'direction'] as const) {
      expect(complementGlossSegs(gloss({}, type))).toEqual(complementSegs({ [type]: complement(np(IE)) }));
    }
  });
});
