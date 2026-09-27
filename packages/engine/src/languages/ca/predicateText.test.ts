import { describe, expect, test } from 'vitest';
import {
  CANSAT, CASA, complement, complements, CORRER, DONAR, el, ELL, ELLA, ES, ESTIMAR, FELIC, GAT, GOS, group, HAVER_DE, JA, JA_NO,
  JO, LLEGENDA, LLIBRE, MAI, MENJAR, MENJAR_N, modal, NEN, NOSALTRES, np, PODER, RATOLI, SEMBLAR, SEMPRE, SER, TAMBE, TORNAR_SE, TU,
  VEURE, VOLER, VOSALTRES, vp, ATURAR_SE, JUNTS, concept,
} from './ca.fixtures.js';
import { predicateText } from './predicateText.js';

const GATS = { ...GAT, number: 'plural' };
const mouse = el(np(RATOLI));
const aLegend = complements({ predicative: complement(np(LLEGENDA, { definiteness: 'indefinite' })) });
const tired = complements({ predicative: complement(np(CANSAT)) });
const inTheHouse = complements({ locative: complement(np(CASA)) });

describe('predicateText', () => {
  describe('tense and agreement', () => {
    test('the finite verb agrees with the subject in person and number', () => {
      expect(predicateText(GAT, vp(MENJAR))).toBe('menja');
      expect(predicateText(JO, vp(MENJAR))).toBe('menjo');
      expect(predicateText(TU, vp(MENJAR))).toBe('menges');
      expect(predicateText(NOSALTRES, vp(MENJAR))).toBe('mengem');
      expect(predicateText(VOSALTRES, vp(MENJAR))).toBe('mengeu');
      expect(predicateText(GATS, vp(MENJAR))).toBe('mengen');
    });

    test('the past is the periphrastic va + infinitive (D2), the future stored', () => {
      expect(predicateText(GAT, vp(MENJAR, { tense: 'past' }), mouse)).toBe('va menjar el ratolí');
      expect(predicateText(JO, vp(CORRER, { tense: 'past' }))).toBe('vaig córrer');
      expect(predicateText(GATS, vp(MENJAR, { tense: 'future' }))).toBe('menjaran');
    });

    test('the past of a state is the imperfect (A130)', () => {
      expect(predicateText(NOSALTRES, vp(SER, { tense: 'past' }, 'BE'), undefined, aLegend)).toBe('érem una llegenda');
      expect(predicateText(GAT, vp(SEMBLAR, { tense: 'past' }), undefined, tired)).toBe('semblava cansat');
      expect(predicateText(GATS, vp(MENJAR, { tense: 'past', modals: [modal(VOLER), modal(PODER)] }))).toBe('volien poder menjar');
    });
  });

  describe('the copula', () => {
    test('ser, and estar for a transient adjective', () => {
      expect(predicateText(GAT, vp(SER, {}, 'BE'), undefined, aLegend)).toBe('és una llegenda');
      expect(predicateText(GAT, vp(SER, {}, 'BE'), undefined, tired)).toBe('està cansat');
      expect(predicateText(JO, vp(SER, { tense: 'past' }, 'BE'), undefined, tired)).toBe('estava cansat');
    });

    test('location is ser', () => {
      expect(predicateText(GAT, vp(SER, {}, 'BE'), undefined, inTheHouse)).toBe('és a la casa');
    });

    test('an elided predicate leaves ho, an elided place hi (A121)', () => {
      const elidedTired = vp(SER, { negative: true, elided: { type: 'predicative', complement: complement(np(CANSAT)) } }, 'BE');
      expect(predicateText(GOS, elidedTired)).toBe('no ho està');
      const elidedPlace = vp(SER, { negative: true, elided: { type: 'locative', complement: complement(np(CASA)) } }, 'BE');
      expect(predicateText(GOS, elidedPlace)).toBe('no hi és');
    });
  });

  describe('a pronominal verb', () => {
    test('its clitic agrees with the subject before the finite word', () => {
      expect(predicateText(GAT, vp(TORNAR_SE, {}, 'BECOME'), undefined, aLegend)).toBe('es torna una llegenda');
      expect(predicateText(JO, vp(TORNAR_SE, {}, 'BECOME'), undefined, aLegend)).toBe('em torno una llegenda');
      expect(predicateText(GAT, vp(ATURAR_SE))).toBe("s'atura");
    });

    test('before the periphrastic past and the perfect', () => {
      expect(predicateText(GAT, vp(TORNAR_SE, { tense: 'past' }, 'BECOME'), undefined, aLegend)).toBe('es va tornar una llegenda');
      expect(predicateText(GAT, vp(TORNAR_SE, { aspect: 'resultative' }, 'BECOME'), undefined, aLegend)).toBe("s'ha tornat una llegenda");
    });

    test('after the gerund and under a modal', () => {
      expect(predicateText(GAT, vp(TORNAR_SE, { aspect: 'progressive' }, 'BECOME'), undefined, aLegend)).toBe('està tornant-se una llegenda');
      expect(predicateText(JO, vp(TORNAR_SE, { modals: [modal(HAVER_DE)] }, 'BECOME'), undefined, aLegend)).toBe("he de tornar-me una llegenda");
    });

    test('the generic subject is un beside it (A152)', () => {
      expect(predicateText(ES, vp(TORNAR_SE, {}, 'BECOME'), undefined, aLegend)).toBe('un es torna una llegenda');
    });
  });

  describe('aspect', () => {
    test('estar + gerund, estar a punt de + infinitive, haver + participle', () => {
      expect(predicateText(GAT, vp(MENJAR, { aspect: 'progressive' }))).toBe('està menjant');
      expect(predicateText(GATS, vp(MENJAR, { aspect: 'progressive', tense: 'past' }))).toBe('estaven menjant');
      expect(predicateText(GAT, vp(MENJAR, { aspect: 'prospective' }))).toBe('està a punt de menjar');
      expect(predicateText(JO, vp(MENJAR, { aspect: 'resultative' }), mouse)).toBe('he menjat el ratolí');
    });

    test('a frequency adverb follows the prospective\'s estar (A147)', () => {
      expect(predicateText(GAT, vp(MENJAR, { aspect: 'prospective', modifier: concept(SEMPRE) }))).toBe('està sempre a punt de menjar');
    });
  });

  describe('modals', () => {
    test('haver de takes its de, elided before a vowel; inner modals are infinitives', () => {
      expect(predicateText(GAT, vp(MENJAR, { modals: [modal(HAVER_DE)] }))).toBe('ha de menjar');
      expect(predicateText(GAT, vp({ ...MENJAR, base: 'anar' }, { modals: [modal(HAVER_DE)] }))).toBe("ha d'anar");
      expect(predicateText(GAT, vp(CORRER, { modals: [modal(VOLER), modal(PODER)] }))).toBe('vol poder córrer');
    });

    test('a modal in the conditional and the past', () => {
      expect(predicateText(GAT, vp(CORRER, { modals: [modal(HAVER_DE)], mood: 'conditional' }))).toBe('hauria de córrer');
      expect(predicateText(GAT, vp(CORRER, { modals: [modal(HAVER_DE)], tense: 'past' }))).toBe('havia de córrer');
    });

    test('the governed group takes its own no', () => {
      expect(predicateText(GAT, vp(CORRER, { modals: [modal(VOLER)], governedNegative: true }))).toBe('vol no córrer');
    });
  });

  describe('negation', () => {
    test('no before the verb group', () => {
      expect(predicateText(GAT, vp(MENJAR, { negative: true }), mouse)).toBe('no menja el ratolí');
      expect(predicateText(GAT, vp(MENJAR, { negative: true, tense: 'past' }), mouse)).toBe('no va menjar el ratolí');
    });

    test('negative concord: mai after the verb, the no kept', () => {
      expect(predicateText(GAT, vp(MENJAR, { modifier: concept(MAI) }), mouse)).toBe('no menja mai el ratolí');
      expect(predicateText(GAT, vp(CORRER, { modals: [modal(VOLER, MAI)] }))).toBe('no vol mai córrer');
    });

    test('a cap object takes the no', () => {
      expect(predicateText(GAT, vp(VEURE), el(np(GOS, { definiteness: 'no' })))).toBe('no veu cap gos');
      expect(predicateText(GAT, vp(VEURE), group('and', np(NEN, { definiteness: 'no' }), np(GOS, { definiteness: 'no' })))).toBe('no veu cap nen ni cap gos');
    });

    test('a negative subject keeps the no (verify)', () => {
      expect(predicateText({ ...GOS, definiteness: 'no' }, vp(CORRER))).toBe('no corre');
    });

    test('ja no stands before the verb in place of the no', () => {
      expect(predicateText(GAT, vp(MENJAR, { modifier: concept(JA_NO) }), mouse)).toBe('ja no menja el ratolí');
    });

    test('a focus adverb takes its negative word before the negated group', () => {
      expect(predicateText(GAT, vp(MENJAR, { negative: true, modifier: concept(TAMBE) }), mouse)).toBe('tampoc no menja el ratolí');
      expect(predicateText(GAT, vp(MENJAR, { negative: true, aspect: 'resultative', modifier: concept(JA) }), mouse)).toBe('encara no ha menjat el ratolí');
    });
  });

  describe('pronouns', () => {
    test('an object pronoun is a proclitic, eliding before a vowel', () => {
      expect(predicateText(JO, vp(VEURE), el(np(ELL)))).toBe('el veig');
      expect(predicateText(GAT, vp(VEURE), el(np(ELLA)))).toBe('la veu');
      expect(predicateText(GAT, vp(VEURE), el(np(JO)))).toBe('em veu');
      expect(predicateText(GAT, vp(ESTIMAR), el(np(ELL)))).toBe("l'estima");
      expect(predicateText(GAT, vp(VEURE, { negative: true, tense: 'past' }), el(np(ELL)))).toBe('no el va veure');
    });

    test('a coordination holding a pronoun is doubled by its clitic', () => {
      expect(predicateText(GAT, vp(VEURE), el(np(JO), np(TU)))).toBe('ens veu a mi i a tu');
    });

    test('a pronoun recipient is the dative clitic; beside an object clitic, one cluster', () => {
      const toHim = complements({ terminus: complement(np(ELL)) });
      expect(predicateText(JO, vp(DONAR), el(np(LLIBRE)), toHim)).toBe('li dono el llibre');
      expect(predicateText(JO, vp(DONAR), el(np(ELL)), toHim)).toBe("l'hi dono");
    });
  });

  describe('the impersonal es', () => {
    test('es before the verb, the verb agreeing with a plural object', () => {
      expect(predicateText(ES, vp(MENJAR), mouse)).toBe('es menja el ratolí');
      expect(predicateText(ES, vp(MENJAR), el(np(RATOLI, { number: 'plural' })))).toBe('es mengen els ratolins');
    });

    test('before an object clitic it is se', () => {
      expect(predicateText(ES, vp(MENJAR), el(np(ELL)))).toBe("se'l menja");
    });
  });

  describe('the existential', () => {
    const exists = (extra = {}) => vp(concept({ base: 'tenir' }).forms, { existential: true, ...extra }, 'HAVE');
    test('hi ha, hi havia, no hi ha cap', () => {
      expect(predicateText(ELL, exists(), el(np(GAT, { definiteness: 'indefinite' })))).toBe('hi ha un gat');
      expect(predicateText(ELL, exists({ tense: 'past' }), el(np(GAT, { definiteness: 'indefinite' })))).toBe('hi havia un gat');
      expect(predicateText(ELL, exists(), el(np(GAT, { definiteness: 'no' })))).toBe('no hi ha cap gat');
    });

    test('under a modal the hi rides on the infinitive', () => {
      expect(predicateText(ELL, exists({ modals: [modal(PODER)] }), el(np(GAT, { definiteness: 'indefinite' })))).toBe('pot haver-hi un gat');
    });
  });

  describe('moods', () => {
    test('the conditional and the imperfect subjunctive', () => {
      expect(predicateText(GAT, vp(MENJAR, { mood: 'conditional' }), mouse)).toBe('menjaria el ratolí');
      expect(predicateText(GOS, vp(CORRER, { mood: 'subjunctive' }))).toBe('corregués');
      expect(predicateText(GOS, vp(CORRER, { mood: 'presentSubjunctive' }))).toBe('corri');
    });

    test('the imperative: tu, nosaltres, vosaltres; no + the present subjunctive', () => {
      expect(predicateText(TU, vp(MENJAR, { mood: 'imperative' }), mouse)).toBe('menja el ratolí');
      expect(predicateText(NOSALTRES, vp(MENJAR, { mood: 'imperative' }), mouse)).toBe('mengem el ratolí');
      expect(predicateText(VOSALTRES, vp(MENJAR, { mood: 'imperative' }), mouse)).toBe('mengeu el ratolí');
      expect(predicateText(TU, vp(MENJAR, { mood: 'imperative', negative: true }), mouse)).toBe('no mengis el ratolí');
      expect(predicateText(VOSALTRES, vp(MENJAR, { mood: 'imperative', negative: true }), mouse)).toBe('no mengeu el ratolí');
    });

    test('a command\'s pronoun follows the affirmative and precedes the negative', () => {
      expect(predicateText(TU, vp(MENJAR, { mood: 'imperative' }), el(np(ELL)))).toBe("menja'l");
      expect(predicateText(VOSALTRES, vp(MENJAR, { mood: 'imperative' }), el(np(ELL)))).toBe('mengeu-lo');
      expect(predicateText(TU, vp(MENJAR, { mood: 'imperative', negative: true }), el(np(ELL)))).toBe('no el mengis');
      expect(predicateText(TU, vp(TORNAR_SE, { mood: 'imperative' }))).toBe("torna't");
      expect(predicateText(NOSALTRES, vp(TORNAR_SE, { mood: 'imperative' }))).toBe('tornem-nos');
      expect(predicateText(TU, vp(TORNAR_SE, { mood: 'imperative', negative: true }))).toBe('no et tornis');
    });

    test('an instruction is the infinitive', () => {
      expect(predicateText(TU, vp(MENJAR, { mood: 'imperative', register: 'instruction' }), el(np(ELL)))).toBe('menjar-lo');
    });

    test('the infinitive, a pronoun attached', () => {
      expect(predicateText(GAT, vp(MENJAR, { mood: 'infinitive' }), el(np(MENJAR_N)))).toBe('menjar el menjar');
      expect(predicateText(GAT, vp(MENJAR, { mood: 'infinitive', negative: true }), el(np(ELL)))).toBe('no menjar-lo');
    });
  });

  describe('the passive', () => {
    test('ser + the participle agreeing with the patient, the agent under per', () => {
      const passive = vp(MENJAR, { voice: 'passive', passiveAux: concept(SER, 'BE') });
      expect(predicateText(RATOLI, passive, undefined, undefined, el(np(GAT)))).toBe('és menjat pel gat');
      expect(predicateText({ ...CASA, number: 'plural' }, passive)).toBe('són menjades');
    });
  });

  test('TOGETHER agrees with the subject', () => {
    expect(predicateText({ ...GAT, gender: 'fem', number: 'plural' }, vp(MENJAR, { modifier: concept(JUNTS) }))).toBe('mengen juntes');
  });

  test('a transient predicative agrees with the subject', () => {
    expect(predicateText({ ...GAT, gender: 'fem' }, vp(SER, {}, 'BE'), undefined, complements({ predicative: complement(np(FELIC)) }))).toBe('està feliç');
  });
});
