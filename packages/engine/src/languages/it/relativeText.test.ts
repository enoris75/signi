import { describe, expect, test } from 'vitest';
import type { ResolvedRelativeClause } from '../../types.js';
import { CANE, CASA, complement, complements, DARE, DONNA, el, type Forms, GATTO, IO, LIBRO, LUPO, MANGIARE, MONETA, np, SI, TOPO, vp } from './it.fixtures.js';
import { relativeText } from './relativeText.js';

const GRIDARE: Forms = { base: 'gridare', alarm_cry: '1', '3sg_present': 'grida', '3sg_past': 'gridò', '3pl_present': 'gridano' };
const LUPO_ALARM: Forms = { ...LUPO, alarm: '1' };
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
    // A plural head is the passive si's patient, and the verb agrees with it.
    expect(relativeText(np(TOPO, { number: 'plural' }, { relative: objectRelative(el(np(SI))) }))).toBe('che si mangiano');
    expect(relativeText(np(TOPO, {}, { relative: objectRelative(el(np(SI)), { verbPhrase: vp(MANGIARE, { negative: true }) }) })))
      .toBe('che non si mangia');
  });

  test('a head filling a complement takes its preposition fused with an agreeing il quale', () => {
    expect(relativeText(np(CASA, {}, { relative: { headRole: 'locative', subject: el(np(GATTO)), verbPhrase: vp(MANGIARE) } }))).toBe('nella quale il gatto mangia');
    expect(relativeText(np(CASA, { number: 'plural' }, {
      relative: { headRole: 'locative', subject: el(np(GATTO)), verbPhrase: vp(MANGIARE), headSpecifiers: [{ kind: 'path', value: 'under' }] },
    }))).toBe('sotto le quali il gatto mangia');
    expect(relativeText(np(DONNA, {}, { relative: { headRole: 'terminus', subject: el(np(GATTO)), verbPhrase: vp(DARE, {}, 'GIVE'), directObject: el(np(LIBRO)) } })))
      .toBe('alla quale il gatto dà il libro');
  });

  // A129: the alarm a cry raises is the cry's a-complement, so its relative takes "al quale", not "che".
  test('a head that is the alarm a cry raises takes a fused with an agreeing il quale', () => {
    const cried = (subject: ResolvedRelativeClause['subject'], tense: 'present' | 'past' = 'past') =>
      objectRelative(subject, { verbPhrase: vp(GRIDARE, { tense }) });
    expect(relativeText(np(LUPO_ALARM, {}, { relative: cried(el(np(GATTO))) }))).toBe('al quale il gatto gridò');
    expect(relativeText(np(LUPO_ALARM, { number: 'plural' }, { relative: cried(el(np(GATTO))) }))).toBe('ai quali il gatto gridò');
    // The alarm is no object, so an impersonal si stays impersonal rather than agreeing with it.
    expect(relativeText(np(LUPO_ALARM, { number: 'plural' }, { relative: cried(el(np(SI)), 'present') }))).toBe('ai quali si grida');
    // A plain object of the same verb keeps che.
    expect(relativeText(np(LUPO, {}, { relative: cried(el(np(GATTO))) }))).toBe('che il gatto gridò');
  });
});
