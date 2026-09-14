import { describe, expect, test } from 'vitest';
import {
  BUENO, CANSADO, CASA, COMER, COMIDA, complement, complements, concept, CORRER, DAR, DEBER, EL, el, ELLA, ELLOS, FELIZ, type Forms,
  GATO, GRANDE, IR, LEYENDA, LIBRO, modal, MUJER, NINO, NOSOTROS, np, NUNCA, PARECER, PODER, QUERER, RAPIDO_ADV, RATON, SE, SER,
  PERRO, SIEMPRE, TU, VACA, VENIR, VER, VOLVERSE, VOSOTROS, vp, YO,
} from './es.fixtures.js';
import { predicateText } from './predicateText.js';

const GATOS: Forms = { ...GATO, number: 'plural' };
const food = el(np(COMIDA));
const aLegend = complements({ predicative: complement(np(LEYENDA, { definiteness: 'indefinite' })) });
const inTheHouse = complements({ locative: complement(np(CASA)) });
const tired = complements({ predicative: complement(np(CANSADO)) });

describe('predicateText', () => {
  describe('tense and agreement', () => {
    test('the finite verb agrees with the subject in person and number', () => {
      expect(predicateText(GATO, vp(COMER))).toBe('come');
      expect(predicateText(YO, vp(COMER))).toBe('como');
      expect(predicateText(TU, vp(COMER))).toBe('comes');
      expect(predicateText(NOSOTROS, vp(COMER))).toBe('comemos');
      expect(predicateText(VOSOTROS, vp(COMER))).toBe('coméis');
      expect(predicateText(GATOS, vp(COMER))).toBe('comen');
    });

    // C6: the simple past is the preterite (perfective); the perfect is the resultative aspect.
    test('the past is the preterite and the future is synthetic', () => {
      expect(predicateText(GATO, vp(COMER, { tense: 'past' }))).toBe('comió');
      expect(predicateText(YO, vp(IR, { tense: 'past' }))).toBe('fui');
      expect(predicateText(GATOS, vp(COMER, { tense: 'future' }))).toBe('comerán');
    });

    test('a reflexive verb’s finite form already carries its clitic', () => {
      expect(predicateText(GATO, vp(VOLVERSE, {}, 'BECOME'), undefined, aLegend)).toBe('se vuelve una leyenda');
      expect(predicateText(NOSOTROS, vp(VOLVERSE, { tense: 'past' }, 'BECOME'), undefined, aLegend)).toBe('nos volvimos una leyenda');
    });
  });

  describe('aspect', () => {
    test('the marked aspects build on estar and haber', () => {
      expect(predicateText(GATO, vp(COMER, { aspect: 'progressive' }))).toBe('está comiendo');
      expect(predicateText(GATOS, vp(COMER, { aspect: 'progressive', tense: 'past' }))).toBe('estaban comiendo');
      expect(predicateText(GATO, vp(COMER, { aspect: 'prospective' }))).toBe('está a punto de comer');
      expect(predicateText(YO, vp(COMER, { aspect: 'resultative' }), food)).toBe('he comido la comida');
    });

    test('a reflexive verb leads the perfect with its clitic', () => {
      expect(predicateText(GATO, vp(VOLVERSE, { aspect: 'resultative' }, 'BECOME'), undefined, aLegend)).toBe('se ha vuelto una leyenda');
    });
  });

  describe('hypothetical mood', () => {
    // A101: a reflexive verb's mood form takes the subject's clitic, not the stored one.
    test('a reflexive verb in the conditional or imperfect subjunctive takes the subject\'s clitic', () => {
      expect(predicateText(GATO, vp(VOLVERSE, { mood: 'conditional' }))).toBe('se volvería');
      expect(predicateText(TU, vp(VOLVERSE, { mood: 'conditional' }))).toBe('te volverías');
      expect(predicateText(YO, vp(VOLVERSE, { mood: 'subjunctive' }))).toBe('me volviera');
      expect(predicateText(VOSOTROS, vp(VOLVERSE, { mood: 'subjunctive', negative: true }))).toBe('no os volvierais');
    });

    test('the conditional and imperfect subjunctive come off the stored stems', () => {
      expect(predicateText(GATO, vp(COMER, { mood: 'conditional' }))).toBe('comería');
      expect(predicateText(NOSOTROS, vp(COMER, { mood: 'conditional' }))).toBe('comeríamos');
      expect(predicateText(GATO, vp(IR, { mood: 'conditional' }))).toBe('iría');
      expect(predicateText(GATO, vp(COMER, { mood: 'subjunctive' }))).toBe('comiera');
      expect(predicateText(GATO, vp(IR, { mood: 'subjunctive' }))).toBe('fuera');
      expect(predicateText(GATO, vp(SER, { mood: 'conditional' }, 'BE'), undefined, aLegend)).toBe('sería una leyenda');
    });

    test('a marked aspect puts the mood on its auxiliary', () => {
      expect(predicateText(GATO, vp(COMER, { mood: 'conditional', aspect: 'progressive' }))).toBe('estaría comiendo');
      expect(predicateText(GATO, vp(COMER, { mood: 'subjunctive', aspect: 'resultative' }))).toBe('hubiera comido');
    });

    test('a modal takes the mood, and no still leads', () => {
      expect(predicateText(GATO, vp(COMER, { mood: 'conditional', modals: [modal(DEBER)] }))).toBe('debería comer');
      expect(predicateText(GATO, vp(COMER, { mood: 'subjunctive', modals: [modal(PODER)] }))).toBe('pudiera comer');
      expect(predicateText(GATO, vp(COMER, { mood: 'conditional', negative: true }))).toBe('no comería');
    });
  });

  describe('modals', () => {
    test('the outermost modal is finite and the rest are infinitives', () => {
      expect(predicateText(GATO, vp(COMER, { modals: [modal(DEBER)] }))).toBe('debe comer');
      expect(predicateText(YO, vp(COMER, { modals: [modal(QUERER)] }))).toBe('quiero comer');
      expect(predicateText(GATO, vp(COMER, { tense: 'past', modals: [modal(DEBER)] }))).toBe('debió comer');
      expect(predicateText(GATO, vp(COMER, { modals: [modal(QUERER), modal(PODER)] }))).toBe('quiere poder comer');
    });

    test('a marked aspect puts its auxiliary in the infinitive', () => {
      expect(predicateText(GATO, vp(COMER, { aspect: 'resultative', modals: [modal(DEBER)] }))).toBe('debe haber comido');
      expect(predicateText(GATO, vp(COMER, { aspect: 'progressive', modals: [modal(DEBER)] }))).toBe('debe estar comiendo');
      expect(predicateText(GATO, vp(COMER, { aspect: 'prospective', modals: [modal(PODER)] }))).toBe('puede estar a punto de comer');
    });

    test('no leads the finite modal', () => {
      expect(predicateText(GATO, vp(COMER, { negative: true, modals: [modal(PODER)] }))).toBe('no puede comer');
      expect(predicateText(GATO, vp(COMER, { negative: true, modals: [modal(QUERER), modal(DEBER)] }))).toBe('no quiere deber comer');
    });

    test('a modal’s adverb trails the modal, the verb’s trails the verb', () => {
      expect(predicateText(GATO, vp(COMER, { modals: [modal(DEBER, SIEMPRE)] }))).toBe('debe siempre comer');
      expect(predicateText(GATO, vp(COMER, { modifier: concept(RAPIDO_ADV), modals: [modal(PODER)] }))).toBe('puede comer rápido');
    });

    test('a pronoun object climbs ahead of the finite modal', () => {
      expect(predicateText(GATO, vp(COMER, { modals: [modal(DEBER)] }), el(np(EL)))).toBe('lo debe comer');
      expect(predicateText(GATO, vp(VER, { negative: true, modals: [modal(PODER)] }), el(np(ELLA)))).toBe('no la puede ver');
    });
  });

  describe('adverbs', () => {
    test('the adverb trails the verb, ahead of the object', () => {
      expect(predicateText(GATO, vp(COMER, { modifier: concept(RAPIDO_ADV) }))).toBe('come rápido');
      expect(predicateText(GATO, vp(COMER, { modifier: concept(SIEMPRE) }), food)).toBe('come siempre la comida');
    });
  });

  describe('negation', () => {
    test('no precedes the whole verb group', () => {
      expect(predicateText(GATO, vp(COMER, { negative: true }))).toBe('no come');
      expect(predicateText(GATO, vp(COMER, { negative: true, aspect: 'resultative' }))).toBe('no ha comido');
      expect(predicateText(GATO, vp(COMER, { negative: true, aspect: 'progressive' }))).toBe('no está comiendo');
      expect(predicateText(GATO, vp(VOLVERSE, { negative: true }, 'BECOME'), undefined, aLegend)).toBe('no se vuelve una leyenda');
    });

    test('nunca fronts and replaces no, whichever verb it modifies', () => {
      expect(predicateText(GATO, vp(COMER, { modifier: concept(NUNCA) }))).toBe('nunca come');
      expect(predicateText(GATO, vp(COMER, { modifier: concept(NUNCA), aspect: 'resultative' }))).toBe('nunca ha comido');
      expect(predicateText(GATO, vp(COMER, { modals: [modal(DEBER, NUNCA)] }))).toBe('nunca debe comer');
      expect(predicateText(GATO, vp(COMER, { modifier: concept(NUNCA), modals: [modal(QUERER)] }))).toBe('nunca quiere comer');
      expect(predicateText(GATO, vp(COMER, { tense: 'past', modifier: concept(SIEMPRE), modals: [modal(QUERER, NUNCA)] })))
        .toBe('nunca quiso comer siempre');
    });

    test('an explicitly negated verb keeps no, and nunca stays after it', () => {
      expect(predicateText(GATO, vp(COMER, { negative: true, modifier: concept(NUNCA) }))).toBe('no come nunca');
    });

    test('a postverbal ningún object or complement requires no', () => {
      expect(predicateText(GATO, vp(VER), el(np(RATON, { definiteness: 'no' })))).toBe('no ve ningún ratón');
      expect(predicateText(GATO, vp(VER, { negative: true }), el(np(VACA, { definiteness: 'no' })))).toBe('no ve ninguna vaca');
      expect(predicateText(GATO, vp(CORRER, {}, 'RUN'), undefined, complements({ direction: complement(np(CASA, { definiteness: 'no' })) })))
        .toBe('no corre a ninguna casa');
    });

    test('a preverbal ningún subject already negates, so no is dropped', () => {
      const noCat = { ...GATO, definiteness: 'no' };
      expect(predicateText(noCat, vp(COMER, { negative: true }))).toBe('come');
      expect(predicateText(noCat, vp(VER), el(np(RATON, { definiteness: 'no' })))).toBe('ve ningún ratón');
    });
  });

  describe('objects', () => {
    // A98: the personal "a" before a human with a determiner.
    test('a human noun object takes the personal a; a non-human does not', () => {
      expect(predicateText(GATO, vp(VER), el(np(NINO)))).toBe('ve al niño');
      expect(predicateText(GATO, vp(VER), el(np(NINO), np(GATO)))).toBe('ve al niño y el gato');
      expect(predicateText(GATO, vp(VER), el(np(RATON)))).toBe('ve el ratón');
    });

    test('a noun object follows the verb, each conjunct with its article', () => {
      expect(predicateText(GATO, vp(VER), el(np(LIBRO)))).toBe('ve el libro');
      expect(predicateText(GATO, vp(VER), el(np(LIBRO), np(CASA, { definiteness: 'indefinite' })))).toBe('ve el libro y una casa');
    });

    test('a pronoun object is a proclitic before the finite verb', () => {
      expect(predicateText(GATO, vp(VER), el(np(YO)))).toBe('me ve');
      expect(predicateText(GATO, vp(VER), el(np(TU)))).toBe('te ve');
      expect(predicateText(GATO, vp(VER), el(np(NOSOTROS)))).toBe('nos ve');
      expect(predicateText(GATO, vp(VER), el(np(ELLA)))).toBe('la ve');
      expect(predicateText(GATO, vp(VER), el(np(ELLOS)))).toBe('los ve');
      expect(predicateText(GATO, vp(VER), el(np(ELLOS, { gender: 'fem' })))).toBe('las ve');
    });

    test('the clitic sits after no and before the auxiliary', () => {
      expect(predicateText(GATO, vp(VER, { negative: true }), el(np(YO)))).toBe('no me ve');
      expect(predicateText(GATO, vp(VER, { aspect: 'resultative' }), el(np(YO)))).toBe('me ha visto');
      expect(predicateText(GATO, vp(VER, { aspect: 'progressive' }), el(np(ELLA)))).toBe('la está viendo');
    });

    test('a coordinated pronoun object is "a" + each tonic pronoun, doubled by the group\'s plural clitic', () => {
      expect(predicateText(GATO, vp(VER), el(np(YO), np(TU)))).toBe('nos ve a mí y a ti');
      expect(predicateText(GATO, vp(VER), el(np(TU), np(EL)))).toBe('os ve a ti y a él');
      expect(predicateText(GATO, vp(VER, { negative: true }), el(np(EL), np(YO)))).toBe('no nos ve a él y a mí');
    });

    test('a coordinated object mixing a noun and a pronoun is left undoubled', () => {
      expect(predicateText(GATO, vp(VER), el(np(LIBRO), np(EL)))).toBe('ve el libro y a él');
    });

    test('a generic subject is the impersonal se, ahead of any object clitic', () => {
      expect(predicateText(SE, vp(COMER))).toBe('se come');
      expect(predicateText(SE, vp(COMER, { negative: true }))).toBe('no se come');
      expect(predicateText(SE, vp(COMER), el(np(EL)))).toBe('se lo come');
    });

    // A73: with a plural noun object se is passive, and the finite verb agrees with its patient.
    test('a plural noun object agrees the finite verb, in the compound tense too', () => {
      expect(predicateText(SE, vp(COMER), el(np(RATON, { number: 'plural' })))).toBe('se comen los ratones');
      expect(predicateText(SE, vp(COMER, { aspect: 'resultative' }), el(np(RATON, { number: 'plural' })))).toBe('se han comido los ratones');
      expect(predicateText(SE, vp(COMER), el(np(ELLOS)))).toBe('se los come');
    });

    // A98: an object with the personal "a" keeps se impersonal and the verb singular.
    test('a plural human object takes the personal a and keeps the verb singular', () => {
      expect(predicateText(SE, vp(VER), el(np(NINO, { number: 'plural' })))).toBe('se ve a los niños');
    });

    test('a recipient follows the object', () => {
      expect(predicateText(GATO, vp(DAR, {}, 'GIVE'), el(np(LIBRO)), complements({ terminus: complement(np(NINO)) }))).toBe('da el libro al niño');
    });
  });

  // A47: estar for location and for a transient state; ser everywhere else.
  describe('ser and estar', () => {
    const be = (extra: Parameters<typeof vp>[1] = {}) => vp(SER, extra, 'BE');

    test('a locative on its own selects estar, in every tense and mood', () => {
      expect(predicateText(GATO, be(), undefined, inTheHouse)).toBe('está en la casa');
      expect(predicateText(YO, be(), undefined, inTheHouse)).toBe('estoy en la casa');
      expect(predicateText(GATOS, be({ tense: 'past' }), undefined, inTheHouse)).toBe('estuvieron en la casa');
      expect(predicateText(GATO, be({ mood: 'conditional' }), undefined, inTheHouse)).toBe('estaría en la casa');
      expect(predicateText(GATO, be({ mood: 'subjunctive' }), undefined, inTheHouse)).toBe('estuviera en la casa');
      expect(predicateText(GATO, be({ negative: true }), undefined, inTheHouse)).toBe('no está en la casa');
    });

    test('a transient predicate adjective selects estar', () => {
      expect(predicateText(GATO, be(), undefined, tired)).toBe('está cansado');
      expect(predicateText(MUJER, be(), undefined, tired)).toBe('está cansada');
      expect(predicateText(GATOS, be(), undefined, complements({ predicative: complement(np(FELIZ)) }))).toBe('están felices');
    });

    // A66: the choice reaches every form of the verb, not only the finite one.
    test('estar holds under a modal, in the compound tense, the command and the infinitive', () => {
      expect(predicateText(GATO, be({ modals: [modal(DEBER)] }), undefined, inTheHouse)).toBe('debe estar en la casa');
      expect(predicateText(GATO, be({ aspect: 'resultative' }), undefined, tired)).toBe('ha estado cansado');
      expect(predicateText(TU, be({ mood: 'imperative', negative: true }), undefined, inTheHouse)).toBe('no estés en la casa');
      expect(predicateText(VOSOTROS, be({ mood: 'imperative' }), undefined, inTheHouse)).toBe('estad en la casa');
      expect(predicateText(GATO, be({ mood: 'infinitive' }), undefined, tired)).toBe('estar cansado');
      expect(predicateText(GATO, be({ modals: [modal(DEBER)] }), undefined, aLegend)).toBe('debe ser una leyenda');
    });

    test('an inherent adjective or a predicate noun keeps ser', () => {
      expect(predicateText(GATO, be(), undefined, complements({ predicative: complement(np(GRANDE)) }))).toBe('es grande');
      expect(predicateText(GATO, be(), undefined, aLegend)).toBe('es una leyenda');
    });

    test('beside a predicate noun a locative is an adjunct, and ser stays', () => {
      expect(predicateText(GATO, be(), undefined, { ...aLegend, ...inTheHouse })).toBe('es una leyenda en la casa');
    });

    test('only the copula is swapped', () => {
      expect(predicateText(GATO, vp(COMER, {}, 'EAT'), undefined, inTheHouse)).toBe('come en la casa');
      expect(predicateText(MUJER, vp(PARECER, {}, 'SEEM'), undefined, tired)).toBe('parece cansada');
    });
  });

  describe('imperative', () => {
    const command = (verb: Forms, conceptId: string, extra: Parameters<typeof vp>[1] = {}) =>
      vp(verb, { mood: 'imperative', ...extra }, conceptId);

    test('the tú form is the 3sg present, nosotros the subjunctive, vosotros -d', () => {
      expect(predicateText(TU, command(COMER, 'EAT'), food)).toBe('come la comida');
      expect(predicateText(NOSOTROS, command(COMER, 'EAT'), food)).toBe('comamos la comida');
      expect(predicateText(VOSOTROS, command(COMER, 'EAT'), food)).toBe('comed la comida');
    });

    // A70: the pronoun follows an affirmative command and an infinitive, in front of a negative command.
    test('an object pronoun attaches after an affirmative command, with its accent', () => {
      expect(predicateText(TU, command(COMER, 'EAT'), el(np(EL)))).toBe('cómelo');
      expect(predicateText(NOSOTROS, command(COMER, 'EAT'), el(np(EL)))).toBe('comámoslo');
      expect(predicateText(VOSOTROS, command(COMER, 'EAT'), el(np(ELLA)))).toBe('comedla');
      expect(predicateText(TU, command(COMER, 'EAT', { negative: true }), el(np(EL)))).toBe('no lo comas');
      expect(predicateText(GATO, vp(COMER, { mood: 'infinitive' }, 'EAT'), el(np(EL)))).toBe('comerlo');
    });

    test('every negative command is the present subjunctive', () => {
      expect(predicateText(TU, command(COMER, 'EAT', { negative: true }))).toBe('no comas');
      expect(predicateText(NOSOTROS, command(COMER, 'EAT', { negative: true }))).toBe('no comamos');
      expect(predicateText(VOSOTROS, command(COMER, 'EAT', { negative: true }))).toBe('no comáis');
    });

    test('ser has its own command forms', () => {
      const good = complements({ predicative: complement(np(BUENO)) });
      expect(predicateText(TU, command(SER, 'BE'), undefined, good)).toBe('sé bueno');
      expect(predicateText(VOSOTROS, command(SER, 'BE'), undefined, good)).toBe('sed buenos');
      expect(predicateText(TU, command(SER, 'BE', { negative: true }), undefined, good)).toBe('no seas bueno');
    });

    test('a ningún object or nunca makes the command negative', () => {
      expect(predicateText(TU, command(COMER, 'EAT'), el(np(COMIDA, { definiteness: 'no' })))).toBe('no comas ninguna comida');
      expect(predicateText(TU, command(COMER, 'EAT', { modifier: concept(NUNCA) }))).toBe('no comas nunca');
    });

    test('the adverb, object and complements follow the verb', () => {
      expect(predicateText(TU, command(COMER, 'EAT', { modifier: concept(RAPIDO_ADV) }), food)).toBe('come rápido la comida');
      expect(predicateText(TU, command(CORRER, 'RUN'), undefined, complements({ direction: complement(np(CASA)) }))).toBe('corre a la casa');
    });

    // A100: a reflexive command takes the addressee's clitic, attached when affirmative (the 1st plural
    // losing -s before nos, the 2nd plural -d before os) and in front when negative.
    test('a reflexive command takes the addressee\'s clitic', () => {
      const LAVARSE: Forms = { base: 'lavarse', '1sg_present': 'me lavo', '3sg_present': 'se lava', '1pl_present': 'nos lavamos' };
      expect(predicateText(TU, command(LAVARSE, 'WASH'))).toBe('lávate');
      expect(predicateText(NOSOTROS, command(LAVARSE, 'WASH'))).toBe('lavémonos');
      expect(predicateText(VOSOTROS, command(LAVARSE, 'WASH'))).toBe('lavaos');
      expect(predicateText(TU, command(LAVARSE, 'WASH', { negative: true }))).toBe('no te laves');
      expect(predicateText(NOSOTROS, command(LAVARSE, 'WASH', { negative: true }))).toBe('no nos lavemos');
      expect(predicateText(VOSOTROS, command(LAVARSE, 'WASH', { negative: true }))).toBe('no os lavéis');
      expect(predicateText(TU, command(LAVARSE, 'WASH', { register: 'instruction' }))).toBe('lavarse');
    });

    test('a negative command keeps a pronoun object proclitic', () => {
      expect(predicateText(TU, command(COMER, 'EAT', { negative: true }), el(np(EL)))).toBe('no lo comas');
    });

    test('the instruction register is the infinitive, for any addressee', () => {
      const instruction = (extra: Parameters<typeof vp>[1] = {}) => command(COMER, 'EAT', { register: 'instruction', ...extra });
      expect(predicateText(TU, instruction(), food)).toBe('comer la comida');
      expect(predicateText(NOSOTROS, instruction(), food)).toBe('comer la comida');
      expect(predicateText(TU, instruction({ negative: true }), food)).toBe('no comer la comida');
    });
  });

  describe('infinitive mood', () => {
    const infinitive = (verb: Forms, extra: Parameters<typeof vp>[1] = {}, conceptId?: string) =>
      vp(verb, { mood: 'infinitive', ...extra }, conceptId);

    test('the bare infinitive, followed by its adverb, object and complements', () => {
      expect(predicateText(SE, infinitive(COMER), food)).toBe('comer la comida');
      expect(predicateText(GATO, infinitive(COMER, { modifier: concept(RAPIDO_ADV) }))).toBe('comer rápido');
      expect(predicateText(GATO, infinitive(VENIR, {}, 'COME'), undefined, complements({ source: complement(np(CASA)) }))).toBe('venir de la casa');
    });

    test('negation, a ningún object or nunca prefixes no', () => {
      expect(predicateText(GATO, infinitive(COMER, { negative: true }))).toBe('no comer');
      expect(predicateText(GATO, infinitive(COMER), el(np(COMIDA, { definiteness: 'no' })))).toBe('no comer ninguna comida');
      expect(predicateText(GATO, infinitive(COMER, { modifier: concept(NUNCA) }))).toBe('no comer nunca');
    });
  });

  describe('complements', () => {
    test('the source adverb is keyed off the verb', () => {
      const fromTheHouse = complements({ source: complement(np(CASA)) });
      expect(predicateText(GATO, vp(CORRER, {}, 'RUN'), undefined, fromTheHouse)).toBe('corre lejos de la casa');
      expect(predicateText(GATO, vp(VENIR, {}, 'COME'), undefined, fromTheHouse)).toBe('viene de la casa');
    });
  });

  // A121: a bare copula that elides the subject complement before it leaves its pro-form, and takes the
  // copula the complement would take.
  describe('an elided subject complement', () => {
    const be = (extra: Parameters<typeof vp>[1]) => vp(SER, extra, 'BE');
    const aLegendElided = { type: 'predicative' as const, complement: complement(np(LEYENDA, { definiteness: 'indefinite' })) };
    const happy = { type: 'predicative' as const, complement: complement(np(FELIZ)) };
    const inTheHouseElided = { type: 'locative' as const, complement: complement(np(CASA)) };

    test('a predicate leaves the invariable lo, with ser or estar as the predicate takes', () => {
      expect(predicateText(PERRO, be({ negative: true, elided: aLegendElided }))).toBe('no lo es');
      expect(predicateText(PERRO, be({ negative: true, elided: happy }))).toBe('no lo está');
      expect(predicateText({ ...PERRO, number: 'plural' }, be({ elided: happy }))).toBe('lo están');
      expect(predicateText(PERRO, be({ tense: 'past', negative: true, elided: happy }))).toBe('no lo estuvo');
    });

    test('a place leaves nothing, and takes estar', () => {
      expect(predicateText(PERRO, be({ negative: true, elided: inTheHouseElided }))).toBe('no está');
    });
  });
});
