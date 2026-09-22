import { describe, expect, test } from 'vitest';
import type { ResolvedRelativeClause } from '../../types.js';
import {
  CANE, CASA, complement, complements, DARE, DONNA, el, ESSERE, type Forms, GATTO, IO, LEI, LIBRO, LORO, LUI, LUPO, MANGIARE, MONETA, NOI, np, SI, TOPO, TU, VOLPE, vp,
} from './it.fixtures.js';
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
    expect(relativeText(np(LIBRO, {}, { relative: objectRelative(el(np(IO)), { verbPhrase: vp(LEGGERE) }) }))).toBe('che leggo');
    expect(relativeText(np(TOPO, {}, { relative: objectRelative(el(np(GATTO), np(CANE))) }))).toBe('che il gatto e il cane mangiano');
  });

  // A173: a pronoun subject drops, as in the main clause, unless "che" would then read as a subject
  // relative, the verb agreeing with the head as well.
  test('a pronoun subject drops where the verb still tells it from the head', () => {
    const eats = (subject: Forms, rest: Partial<ResolvedRelativeClause> = {}) => objectRelative(el(np(subject)), rest);
    expect(relativeText(np(TOPO, {}, { relative: eats(NOI) }))).toBe('che mangiamo');
    expect(relativeText(np(TOPO, {}, { relative: eats(TU) }))).toBe('che mangi');
    expect(relativeText(np(TOPO, {}, { relative: eats(LUI) }))).toBe('che lui mangia');
    expect(relativeText(np(TOPO, {}, { relative: eats(LEI) }))).toBe('che lei mangia');
    expect(relativeText(np(TOPO, { number: 'plural' }, { relative: eats(LORO) }))).toBe('che loro mangiano');
    expect(relativeText(np(TOPO, { number: 'plural' }, { relative: eats(LUI) }))).toBe('che mangia');
    expect(relativeText(np(TOPO, {}, { relative: eats(LORO) }))).toBe('che mangiano');
    expect(relativeText(np(TOPO, {}, { relative: eats(IO, { verbPhrase: vp(MANGIARE, { mood: 'conditional' }) }) }))).toBe('che mangerei');
    expect(relativeText(np(TOPO, {}, { relative: eats(LUI, { verbPhrase: vp(MANGIARE, { mood: 'conditional' }) }) }))).toBe('che lui mangerebbe');
    // "dove" marks the gap itself, so even the 3rd person drops.
    expect(relativeText(np(CASA, {}, { relative: { headRole: 'locative', subject: el(np(LUI)), verbPhrase: vp(MANGIARE) } }))).toBe('dove mangia');
    expect(relativeText(np(TOPO, {}, { relative: objectRelative(el(np(IO), np(LUI))) }))).toBe('che io e lui mangiamo');
  });

  test('an impersonal subject is the si clitic, not a subject word', () => {
    expect(relativeText(np(TOPO, {}, { relative: objectRelative(el(np(SI))) }))).toBe('che si mangia');
    // A plural head is the passive si's patient, and the verb agrees with it.
    expect(relativeText(np(TOPO, { number: 'plural' }, { relative: objectRelative(el(np(SI))) }))).toBe('che si mangiano');
    expect(relativeText(np(TOPO, {}, { relative: objectRelative(el(np(SI)), { verbPhrase: vp(MANGIARE, { negative: true }) }) })))
      .toBe('che non si mangia');
  });

  // A213: in the compound tense the gapped head is the participle's patient, in either number.
  test('the passive si agrees its compound participle with the gapped head', () => {
    const eaten = objectRelative(el(np(SI)), { verbPhrase: vp(MANGIARE, { aspect: 'resultative' }) });
    expect(relativeText(np(VOLPE, {}, { relative: eaten }))).toBe('che si è mangiata');
    expect(relativeText(np(TOPO, { number: 'plural' }, { relative: eaten }))).toBe('che si sono mangiati');
    expect(relativeText(np(TOPO, {}, { relative: eaten }))).toBe('che si è mangiato');
  });

  test('a head filling a complement takes its preposition fused with an agreeing il quale', () => {
    expect(relativeText(np(CASA, { number: 'plural' }, {
      relative: { headRole: 'locative', subject: el(np(GATTO)), verbPhrase: vp(MANGIARE), headSpecifiers: [{ kind: 'path', value: 'under' }] },
    }))).toBe('sotto le quali il gatto mangia');
    expect(relativeText(np(DONNA, {}, { relative: { headRole: 'terminus', subject: el(np(GATTO)), verbPhrase: vp(DARE, {}, 'GIVE'), directObject: el(np(LIBRO)) } })))
      .toBe('alla quale il gatto dà il libro');
  });

  // C07: the plain place takes the relative adverb, not "nella quale".
  test('a plain locative gap is dove, whether or not the default relation was chosen', () => {
    const eatenIn = (rest: Partial<ResolvedRelativeClause> = {}, extra: Forms = {}) =>
      relativeText(np(CASA, extra, { relative: { headRole: 'locative', subject: el(np(GATTO)), verbPhrase: vp(MANGIARE), ...rest } }));
    expect(eatenIn()).toBe('dove il gatto mangia');
    expect(eatenIn({ headSpecifiers: [{ kind: 'path', value: 'in' }] })).toBe('dove il gatto mangia');
    // The head is no object, so a plural one does not make the si passive.
    expect(eatenIn({ subject: el(np(SI)) }, { number: 'plural' })).toBe('dove si mangia');
    expect(eatenIn({ subject: el(np(SI)), verbPhrase: vp(MANGIARE, { negative: true }) })).toBe('dove non si mangia');
    expect(eatenIn({ headSpecifiers: [{ kind: 'path', value: 'under' }] })).toBe('sotto la quale il gatto mangia');
  });

  // A221: the bare copula goes before its noun subject, "dove" eliding before "è" and "era" only.
  test('a bare copula after a complement relativizer precedes its noun subject', () => {
    const isIn = (rest: Partial<ResolvedRelativeClause> = {}, subject = np(GATTO)) =>
      relativeText(np(CASA, {}, { relative: { headRole: 'locative', subject: el(subject), verbPhrase: vp(ESSERE, {}, 'BE'), ...rest } }));
    expect(isIn()).toBe("dov'è il gatto");
    expect(isIn({}, np(GATTO, { number: 'plural' }))).toBe('dove sono i gatti');
    expect(isIn({ verbPhrase: vp(ESSERE, { tense: 'future' }, 'BE') })).toBe('dove sarà il gatto');
    expect(isIn({ headSpecifiers: [{ kind: 'path', value: 'under' }] })).toBe('sotto la quale è il gatto');
    // The negative keeps SV, and so does a dropped pronoun.
    expect(isIn({ verbPhrase: vp(ESSERE, { negative: true }, 'BE') })).toBe('dove il gatto non è');
    expect(isIn({}, np(LUI))).toBe('dove è');
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

  // A139: the object of a verb that takes it with a preposition relativises on that preposition.
  test('a head that is the object of a prepositional verb takes the preposition fused with il quale', () => {
    const CLICCARE: Forms = { base: 'cliccare', object_prep: 'su', '3sg_present': 'clicca', '3pl_present': 'cliccano' };
    const clicked = (subject: ResolvedRelativeClause['subject']) => objectRelative(subject, { verbPhrase: vp(CLICCARE) });
    expect(relativeText(np(LIBRO, {}, { relative: clicked(el(np(GATTO))) }))).toBe('sul quale il gatto clicca');
    // The head is no object, so an impersonal si stays impersonal rather than agreeing with it.
    expect(relativeText(np(LIBRO, { number: 'plural' }, { relative: clicked(el(np(SI))) }))).toBe('sui quali si clicca');
  });

  // A167: a nessun head negates the matrix clause, not the relative, so the relative keeps its own
  // "non", and a postverbal nessun inside it still demands one. The relative's OWN nessun subject does
  // negate it, as a main clause's does.
  test('a nessun head leaves the relative its own polarity', () => {
    const onNoCat = (relative: ResolvedRelativeClause) => relativeText(np(GATTO, { definiteness: 'no' }, { relative }));
    expect(onNoCat(subjectRelative({ verbPhrase: vp(MANGIARE, { negative: true }) }))).toBe('che non mangia');
    expect(onNoCat(subjectRelative({ directObject: el(np(TOPO, { definiteness: 'no' })) }))).toBe('che non mangia nessun topo');
    expect(onNoCat(subjectRelative())).toBe('che mangia');
    expect(relativeText(np(TOPO, {}, { relative: objectRelative(el(np(GATTO, { definiteness: 'no' })), { verbPhrase: vp(MANGIARE, { negative: true }) }) })))
      .toBe('che nessun gatto mangia');
  });
});
