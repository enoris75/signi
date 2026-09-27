import { describe, expect, test } from 'vitest';
import {
  CASA, complement, CORRER, CREADOR, DONAR, el, ELL, ELLA, type Forms, FRASE, GAT, HOME, LLIBRE, MENJAR, NEN, NOSALTRES,
  nounModifier, np, RATOLI, TU, VEURE, vp, JO,
} from './ca.fixtures.js';
import { withRelative } from './withRelative.js';

const PLORAR: Forms = { base: 'plorar', '3sg_present': 'plora', '3pl_present': 'ploren' };
const LLEGIR: Forms = { base: 'llegir', '1sg_present': 'llegeixo', '3sg_present': 'llegeix', '3pl_present': 'llegeixen' };

describe('withRelative', () => {
  test('without a relative clause it appends the attributive nouns and the possessor', () => {
    const phrase = np(CREADOR, {}, { nounModifiers: [nounModifier({ ...FRASE, number: 'plural' })], possessor: np(NEN) });
    expect(withRelative('el creador', phrase)).toBe('el creador de frases del nen');
    expect(withRelative('la casa', np(CASA, {}, { possessor: np(HOME) }))).toBe("la casa de l'home");
  });

  test('a subject relative is que + a predicate agreeing with the head', () => {
    const cries = { headRole: 'subject' as const, verbPhrase: vp(PLORAR) };
    expect(withRelative('el nen', np(NEN, {}, { relative: cries }))).toBe('el nen que plora');
    expect(withRelative('els nens', np(NEN, { number: 'plural' }, { relative: cries }))).toBe('els nens que ploren');
  });

  test('the relative predicate carries its own tense, negation, object and complements', () => {
    const ate = { headRole: 'subject' as const, verbPhrase: vp(MENJAR, { tense: 'past' }), directObject: el(np(RATOLI)) };
    expect(withRelative('el gat', np(GAT, {}, { relative: ate }))).toBe('el gat que va menjar el ratolí');
    const runsHome = { headRole: 'subject' as const, verbPhrase: vp(CORRER, {}, 'RUN'), complements: { direction: complement(np(CASA)) } };
    expect(withRelative('el gat', np(GAT, {}, { relative: runsHome }))).toBe('el gat que corre a la casa');
  });

  test('an object relative names its own subject; a pronoun one drops where the verb tells it apart', () => {
    const reads = (subject: Forms, extra: Forms = {}) =>
      ({ headRole: 'directObject' as const, subject: el(np(subject, extra)), verbPhrase: vp(LLEGIR) });
    expect(withRelative('el llibre', np(LLIBRE, {}, { relative: reads(NEN, { number: 'plural' }) }))).toBe('el llibre que els nens llegeixen');
    expect(withRelative('el llibre', np(LLIBRE, {}, { relative: reads(JO) }))).toBe('el llibre que llegeixo');
    const sees = (subject: Forms) => ({ headRole: 'directObject' as const, subject: el(np(subject)), verbPhrase: vp(VEURE) });
    expect(withRelative('el llibre', np(LLIBRE, {}, { relative: sees(NOSALTRES) }))).toBe('el llibre que veiem');
    expect(withRelative('el llibre', np(LLIBRE, {}, { relative: sees(TU) }))).toBe('el llibre que veus');
    expect(withRelative('el gat', np(GAT, {}, { relative: sees(ELL) }))).toBe('el gat que ell veu');
    expect(withRelative('el gat', np(GAT, {}, { relative: sees(ELLA) }))).toBe('el gat que ella veu');
  });

  test('a plain locative gap is on', () => {
    const eatsThere = { headRole: 'locative' as const, subject: el(np(GAT)), verbPhrase: vp(MENJAR) };
    expect(withRelative('la casa', np(CASA, {}, { relative: eatsThere }))).toBe('la casa on el gat menja');
  });

  test('a complement gap is the preposition + el qual, or qui for a person', () => {
    const under = { headRole: 'locative' as const, headSpecifiers: [{ kind: 'path' as const, value: 'under' as const }], subject: el(np(GAT)), verbPhrase: vp(MENJAR) };
    expect(withRelative('la casa', np(CASA, {}, { relative: under }))).toBe('la casa sota la qual el gat menja');
    const given = (head: Forms) => ({ headRole: 'terminus' as const, subject: el(np(HOME)), verbPhrase: vp(DONAR), directObject: el(np(LLIBRE)) });
    expect(withRelative('el nen', np(NEN, {}, { relative: given(NEN) }))).toBe("el nen a qui l'home dona el llibre");
    expect(withRelative('el gat', np(GAT, {}, { relative: given(GAT) }))).toBe("el gat al qual l'home dona el llibre");
    expect(withRelative('els gats', np(GAT, { number: 'plural' }, { relative: given(GAT) }))).toBe("els gats als quals l'home dona el llibre");
  });

  test('a possessor gap: the possessed phrase, then del qual agreeing with the head', () => {
    const whose = { headRole: 'possessor' as const, subject: el(np(RATOLI)), verbPhrase: vp(CORRER) };
    expect(withRelative('el gat', np(GAT, {}, { relative: whose }))).toBe('el gat el ratolí del qual corre');
    expect(withRelative('la casa', np(CASA, {}, { relative: whose }))).toBe('la casa el ratolí de la qual corre');
    expect(withRelative("l'home", np(HOME, {}, { relative: whose }))).toBe("l'home el ratolí de qui corre");
  });
});
