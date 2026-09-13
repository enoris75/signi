import { describe, expect, test } from 'vitest';
import type { ResolvedRelativeClause } from '../../types.js';
import { CANE, complement, complements, DARE, el, type Forms, GATTO, IO, LIBRO, MANGIARE, MONETA, np, SI, TOPO, vp } from './it.fixtures.js';
import { relativeText } from './relativeText.js';

const LEGGERE: Forms = { base: 'leggere', '1sg_present': 'leggo', '3sg_present': 'legge', '3pl_present': 'leggono' };

const subjectRelative = (rest: Partial<ResolvedRelativeClause> = {}): ResolvedRelativeClause =>
  ({ headRole: 'subject', verbPhrase: vp(MANGIARE), ...rest });
const objectRelative = (subject: ResolvedRelativeClause['subject'], rest: Partial<ResolvedRelativeClause> = {}): ResolvedRelativeClause =>
  ({ headRole: 'directObject', subject, verbPhrase: vp(MANGIARE), ...rest });

describe('relativeText', () => {
  test('renders nothing without a relative clause', () => {
    expect(relativeText(np(GATTO))).toBe('');
  });

  test('a subject relative is che + the predicate, agreeing with the head', () => {
    const eatsTheMouse = subjectRelative({ directObject: el(np(TOPO)) });
    expect(relativeText(np(GATTO, {}, { relative: eatsTheMouse }))).toBe('che mangia il topo');
    expect(relativeText(np(GATTO, { number: 'plural' }, { relative: eatsTheMouse }))).toBe('che mangiano il topo');
    const givesTheCoin = subjectRelative({
      verbPhrase: vp(DARE, {}, 'GIVE'), directObject: el(np(MONETA)), complements: complements({ terminus: complement(np(CANE)) }),
    });
    expect(relativeText(np(GATTO, {}, { relative: givesTheCoin }))).toBe('che dà la moneta al cane');
  });

  test('the relative keeps its own tense, aspect and negation', () => {
    expect(relativeText(np(GATTO, {}, { relative: subjectRelative({ verbPhrase: vp(MANGIARE, { tense: 'past' }) }) }))).toBe('che mangiò');
    expect(relativeText(np(GATTO, {}, { relative: subjectRelative({ verbPhrase: vp(MANGIARE, { aspect: 'resultative' }) }) })))
      .toBe('che ha mangiato');
    expect(relativeText(np(GATTO, {}, { relative: subjectRelative({ verbPhrase: vp(MANGIARE, { negative: true }) }) }))).toBe('che non mangia');
  });

  test('an object relative carries its own subject, which drives agreement', () => {
    expect(relativeText(np(TOPO, {}, { relative: objectRelative(el(np(GATTO, { number: 'plural' }))) }))).toBe('che i gatti mangiano');
    expect(relativeText(np(LIBRO, {}, { relative: objectRelative(el(np(IO)), { verbPhrase: vp(LEGGERE) }) }))).toBe('che io leggo');
    expect(relativeText(np(TOPO, {}, { relative: objectRelative(el(np(GATTO), np(CANE))) }))).toBe('che il gatto e il cane mangiano');
  });

  test('an impersonal subject is the si clitic, not a subject word', () => {
    expect(relativeText(np(TOPO, {}, { relative: objectRelative(el(np(SI))) }))).toBe('che si mangia');
    expect(relativeText(np(TOPO, {}, { relative: objectRelative(el(np(SI)), { verbPhrase: vp(MANGIARE, { negative: true }) }) })))
      .toBe('che non si mangia');
  });
});
