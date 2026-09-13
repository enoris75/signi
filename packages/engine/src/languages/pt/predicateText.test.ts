import { describe, expect, test } from 'vitest';
import { predicateText } from './predicateText.js';
import {
  BOM, CANSADO, CAO, CASA, COMER, complement, complements, concept, CRIANCA, DAR, DEVER, el, ELA, ELE, ELES, EU, FELIZ,
  type Forms, GATA, GATO, GRANDE, LENDA, LIVRO, MENINO, modal, NOS, np, NUNCA, PODER, QUERER, RAPIDAMENTE, RAPOSA,
  RATO, SE, SEMPRE, SER, VER, VOCE, vp,
} from './pt.fixtures.js';

const CORRER: Forms = {
  base: 'correr', gerund: 'correndo', participle: 'corrido',
  '1sg_present': 'corro', '3sg_present': 'corre', '3pl_present': 'correm', '3sg_past': 'correu', '1sg_future': 'correrei', '3pl_past': 'correram',
};
const PARECER: Forms = { base: 'parecer', '1sg_present': 'pareço', '3sg_present': 'parece', '3pl_present': 'parecem' };

const mouse = el(np(RATO));
const noMouse = el(np(RATO, { definiteness: 'no' }));
const inTheHouse = complements({ locative: complement(np(CASA)) });
const be = (extra: Parameters<typeof vp>[1] = {}) => vp(SER, extra, 'BE');

describe('predicateText', () => {
  describe('tense and agreement', () => {
    test('the finite verb agrees with the subject forms', () => {
      expect(predicateText(GATO, vp(COMER))).toBe('come');
      expect(predicateText(EU, vp(COMER))).toBe('como');
      expect(predicateText({ ...GATO, number: 'plural' }, vp(COMER))).toBe('comem');
      expect(predicateText(el(np(EU), np(GATO)).agreement, vp(COMER))).toBe('comemos');
    });

    test('the past is the pretérito perfeito, the future synthetic', () => {
      expect(predicateText(GATO, vp(COMER, { tense: 'past' }))).toBe('comeu');
      expect(predicateText(NOS, vp(COMER, { tense: 'future' }))).toBe('comeremos');
    });

    test('the object follows the verb, then the complements', () => {
      expect(predicateText(GATO, vp(VER), mouse)).toBe('vê o rato');
      expect(predicateText(GATO, vp(VER), el(np(RATO), np(RAPOSA)))).toBe('vê o rato e a raposa');
      expect(predicateText(GATO, vp(DAR, {}, 'GIVE'), el(np(LIVRO)), complements({ terminus: complement(np(CAO)) }))).toBe('dá o livro ao cão');
    });

    test('the verb’s concept id reaches the complements', () => {
      expect(predicateText(GATO, vp(CORRER, {}, 'RUN'), undefined, complements({ source: complement(np(CASA)) }))).toBe('corre longe da casa');
    });

    test('the adverb follows the verb, ahead of the object', () => {
      expect(predicateText(GATO, vp(COMER, { modifier: concept(RAPIDAMENTE) }), mouse)).toBe('come rapidamente o rato');
    });
  });

  describe('aspect', () => {
    test('progressive, prospective and resultative verb groups', () => {
      expect(predicateText(GATO, vp(COMER, { aspect: 'progressive' }), mouse)).toBe('está comendo o rato');
      expect(predicateText(GATO, vp(COMER, { aspect: 'prospective' }))).toBe('está prestes a comer');
      expect(predicateText(GATO, vp(COMER, { aspect: 'resultative' }))).toBe('comeu');
      expect(predicateText(GATO, vp(COMER, { aspect: 'resultative', tense: 'past' }))).toBe('tinha comido');
      expect(predicateText(GATO, vp(COMER, { aspect: 'resultative', tense: 'future' }))).toBe('terá comido');
    });
  });

  describe('modals', () => {
    test('the outermost modal is finite and governs the infinitive', () => {
      expect(predicateText(GATO, vp(COMER, { modals: [modal(DEVER)] }))).toBe('deve comer');
      expect(predicateText(EU, vp(COMER, { modals: [modal(QUERER)] }))).toBe('quero comer');
      expect(predicateText(GATO, vp(COMER, { tense: 'past', modals: [modal(PODER)] }))).toBe('pôde comer');
      expect(predicateText(GATO, vp(COMER, { modals: [modal(QUERER), modal(DEVER), modal(PODER)] }))).toBe('quer dever poder comer');
    });

    test('an aspect under a modal is an infinitival verb group', () => {
      expect(predicateText(GATO, vp(COMER, { aspect: 'resultative', modals: [modal(DEVER)] }))).toBe('deve ter comido');
      expect(predicateText(GATO, vp(COMER, { aspect: 'progressive', modals: [modal(PODER)] }))).toBe('pode estar comendo');
    });

    test('a modal takes the conditional under a hypothetical', () => {
      expect(predicateText(GATO, vp(COMER, { mood: 'conditional', modals: [modal(DEVER)] }))).toBe('deveria comer');
    });

    test('a modal’s adverb trails the modal, the main verb’s the whole group', () => {
      expect(predicateText(GATO, vp(COMER, { modals: [modal(DEVER, SEMPRE)] }))).toBe('deve sempre comer');
      expect(predicateText(GATO, vp(COMER, { modifier: concept(RAPIDAMENTE), modals: [modal(PODER)] }))).toBe('pode comer rapidamente');
    });
  });

  describe('negation', () => {
    test('"não" leads the finite verb group', () => {
      expect(predicateText(GATO, vp(COMER, { negative: true }))).toBe('não come');
      expect(predicateText(GATO, vp(COMER, { negative: true, tense: 'future' }))).toBe('não comerá');
      expect(predicateText(GATO, vp(COMER, { negative: true, modals: [modal(PODER)] }))).toBe('não pode comer');
      expect(predicateText(GATO, vp(COMER, { negative: true, aspect: 'progressive' }))).toBe('não está comendo');
    });

    test('a post-verbal nenhum object or complement needs "não" (negative concord)', () => {
      expect(predicateText(GATO, vp(COMER), noMouse)).toBe('não come nenhum rato');
      expect(predicateText(GATO, vp(COMER, { negative: true }), noMouse)).toBe('não come nenhum rato');
      expect(predicateText(GATO, vp(VER), el(np(MENINO, { definiteness: 'no' }), np(CRIANCA, { definiteness: 'no' })))).toBe('não vê nenhum menino e nenhuma criança');
      expect(predicateText(GATO, vp(CORRER, {}, 'RUN'), undefined, complements({ locative: complement(np(CASA, { definiteness: 'no' })) })))
        .toBe('não corre em nenhuma casa');
    });

    test('a preverbal nenhum subject already negates the clause', () => {
      const noCat = { ...GATO, definiteness: 'no' };
      expect(predicateText(noCat, vp(COMER, { negative: true }))).toBe('come');
      expect(predicateText(noCat, vp(COMER), noMouse)).toBe('come nenhum rato');
    });

    test('a negative adverb is fronted in place of "não"', () => {
      expect(predicateText(GATO, vp(COMER, { modifier: concept(NUNCA) }))).toBe('nunca come');
      expect(predicateText(GATO, vp(COMER, { modifier: concept(NUNCA) }), noMouse)).toBe('nunca come nenhum rato');
    });

    test('a negative adverb on a modal is fronted before the whole chain', () => {
      expect(predicateText(GATO, vp(COMER, { modals: [modal(QUERER, NUNCA)] }))).toBe('nunca quer comer');
      expect(predicateText(GATO, vp(COMER, { tense: 'past', modifier: concept(SEMPRE), modals: [modal(QUERER, NUNCA)] }))).toBe('nunca quis comer sempre');
    });

    test('under an explicit negation the negative adverb trails instead', () => {
      expect(predicateText(GATO, vp(COMER, { negative: true, modifier: concept(NUNCA) }))).toBe('não come nunca');
    });
  });

  describe('clitics', () => {
    test('a pronoun object is a proclitic before the finite verb (Brazilian order)', () => {
      expect(predicateText(GATO, vp(VER), el(np(EU)))).toBe('me vê');
      expect(predicateText(GATO, vp(VER), el(np(ELA)))).toBe('a vê');
      expect(predicateText(GATO, vp(VER), el(np(ELES)))).toBe('os vê');
      expect(predicateText(GATO, vp(VER, { tense: 'past' }), el(np(NOS)))).toBe('nos viu');
    });

    test('the clitic follows "não"', () => {
      expect(predicateText(GATO, vp(VER, { negative: true }), el(np(EU)))).toBe('não me vê');
    });

    test('a pronoun in a coordinated object is "a" + its tonic form, after the verb', () => {
      expect(predicateText(GATO, vp(VER), el(np(ELE), np(EU)))).toBe('vê a ele e a mim');
      expect(predicateText(GATO, vp(VER), el(np(CAO), np(VOCE)))).toBe('vê o cão e a você');
      expect(predicateText(GATO, vp(VER, { negative: true }), el(np(ELA), np(EU)))).toBe('não vê a ela e a mim');
    });

    test('the impersonal "se" is a proclitic standing in for the subject', () => {
      expect(predicateText(SE, vp(COMER), mouse)).toBe('se come o rato');
      expect(predicateText(SE, vp(COMER, { negative: true }))).toBe('não se come');
    });
  });

  describe('ser and estar', () => {
    test('a locative alone takes estar, in every tense and mood', () => {
      expect(predicateText(GATO, be(), undefined, inTheHouse)).toBe('está na casa');
      expect(predicateText({ ...GATO, number: 'plural' }, be(), undefined, inTheHouse)).toBe('estão na casa');
      expect(predicateText(GATO, be({ tense: 'past' }), undefined, inTheHouse)).toBe('esteve na casa');
      expect(predicateText(GATO, be({ tense: 'future' }), undefined, inTheHouse)).toBe('estará na casa');
      expect(predicateText(GATO, be({ mood: 'conditional' }), undefined, inTheHouse)).toBe('estaria na casa');
      expect(predicateText(GATO, be({ negative: true }), undefined, complements({ locative: complement(np(CASA), [{ kind: 'path', value: 'under' }]) })))
        .toBe('não está debaixo da casa');
    });

    test('a transient predicate adjective takes estar', () => {
      expect(predicateText(GATO, be(), undefined, complements({ predicative: complement(np(CANSADO)) }))).toBe('está cansado');
      expect(predicateText(GATA, be(), undefined, complements({ predicative: complement(np(FELIZ)) }))).toBe('está feliz');
    });

    // A66: the choice reaches every form of the verb, not only the finite one.
    test('estar holds under a modal, with ter, in the command and the infinitive', () => {
      const tiredCat = complements({ predicative: complement(np(CANSADO)) });
      expect(predicateText(GATO, be({ modals: [modal(DEVER)] }), undefined, inTheHouse)).toBe('deve estar na casa');
      expect(predicateText(GATO, be({ tense: 'past', aspect: 'resultative' }), undefined, tiredCat)).toBe('tinha estado cansado');
      expect(predicateText(GATO, be({ aspect: 'resultative' }), undefined, inTheHouse)).toBe('esteve na casa');
      expect(predicateText(VOCE, be({ mood: 'imperative', negative: true }), undefined, tiredCat)).toBe('não esteja cansado');
      expect(predicateText(GATO, be({ mood: 'infinitive' }), undefined, inTheHouse)).toBe('estar na casa');
      expect(predicateText(GATO, be({ modals: [modal(DEVER)] }), undefined, complements({ predicative: complement(np(LENDA, { definiteness: 'indefinite' })) })))
        .toBe('deve ser uma lenda');
    });

    test('an inherent adjective and a predicate noun keep ser', () => {
      expect(predicateText(GATO, be(), undefined, complements({ predicative: complement(np(GRANDE)) }))).toBe('é grande');
      expect(predicateText(GATO, be(), undefined, complements({ predicative: complement(np(LENDA, { definiteness: 'indefinite' })) })))
        .toBe('é uma lenda');
    });

    test('a locative beside a predicate noun is an adjunct, so ser stays', () => {
      const legendInTheHouse = complements({ predicative: complement(np(LENDA, { definiteness: 'indefinite' })), locative: complement(np(CASA)) });
      expect(predicateText(GATO, be(), undefined, legendInTheHouse)).toBe('é uma lenda na casa');
    });

    test('only BE splits: another verb keeps its own form', () => {
      expect(predicateText(GATO, vp(PARECER, {}, 'SEEM'), undefined, complements({ predicative: complement(np(CANSADO)) }))).toBe('parece cansado');
    });
  });

  describe('hypothetical moods', () => {
    test('the conditional and imperfect subjunctive of a plain verb', () => {
      expect(predicateText(GATO, vp(CORRER, { mood: 'conditional' }))).toBe('correria');
      expect(predicateText({ ...GATO, number: 'plural' }, vp(COMER, { mood: 'conditional' }))).toBe('comeriam');
      expect(predicateText(GATO, vp(COMER, { mood: 'subjunctive' }), mouse)).toBe('comesse o rato');
      expect(predicateText(GATO, be({ mood: 'subjunctive' }), undefined, complements({ predicative: complement(np(GRANDE)) }))).toBe('fosse grande');
    });

    test('a marked aspect puts the mood on its auxiliary', () => {
      expect(predicateText(GATO, vp(CORRER, { mood: 'conditional', aspect: 'progressive' }))).toBe('estaria correndo');
      expect(predicateText(GATO, vp(COMER, { mood: 'subjunctive', aspect: 'resultative' }))).toBe('tivesse comido');
    });
  });

  describe('imperative', () => {
    const command = (extra: Parameters<typeof vp>[1] = {}) => vp(COMER, { mood: 'imperative', ...extra }, 'EAT');

    // Brazilian commands follow the você/vocês paradigm: the present subjunctive.
    test('the addressee picks the subjunctive-based form', () => {
      expect(predicateText(VOCE, command())).toBe('coma');
      expect(predicateText({ ...VOCE, number: 'plural' }, command())).toBe('comam');
      expect(predicateText(NOS, command())).toBe('comamos');
      expect(predicateText(VOCE, be({ mood: 'imperative' }), undefined, complements({ predicative: complement(np(BOM)) }))).toBe('seja bom');
    });

    test('the adverb trails the verb, then the object and complements', () => {
      expect(predicateText(VOCE, command({ modifier: concept(RAPIDAMENTE) }), mouse, inTheHouse)).toBe('coma rapidamente o rato na casa');
    });

    test('a negative command, a nenhum object or a negative adverb prefixes "não"', () => {
      expect(predicateText(VOCE, command({ negative: true }), mouse)).toBe('não coma o rato');
      expect(predicateText(VOCE, command(), noMouse)).toBe('não coma nenhum rato');
      expect(predicateText(VOCE, command({ modifier: concept(NUNCA) }))).toBe('não coma nunca');
    });

    test('a first-person object clitic precedes the command', () => {
      expect(predicateText(VOCE, vp(VER, { mood: 'imperative' }, 'SEE'), el(np(EU)))).toBe('me veja');
      expect(predicateText(VOCE, vp(VER, { mood: 'imperative', negative: true }, 'SEE'), el(np(EU)))).toBe('não me veja');
    });

    test('the instruction register is the bare infinitive', () => {
      expect(predicateText(VOCE, command({ register: 'instruction' }), mouse)).toBe('comer o rato');
      expect(predicateText(VOCE, command({ register: 'instruction', negative: true }))).toBe('não comer');
    });
  });

  describe('infinitive', () => {
    const citation = (extra: Parameters<typeof vp>[1] = {}) => vp(COMER, { mood: 'infinitive', ...extra });

    test('is the bare infinitive, followed by its adverb, object and complements', () => {
      expect(predicateText(GATO, citation(), mouse)).toBe('comer o rato');
      expect(predicateText(GATO, citation({ modifier: concept(RAPIDAMENTE) }), undefined, inTheHouse)).toBe('comer rapidamente na casa');
    });

    test('negation, a nenhum object or a negative adverb prefixes "não"', () => {
      expect(predicateText(GATO, citation({ negative: true }))).toBe('não comer');
      expect(predicateText(GATO, citation(), noMouse)).toBe('não comer nenhum rato');
      expect(predicateText(GATO, citation({ modifier: concept(NUNCA) }))).toBe('não comer nunca');
    });
  });
});
