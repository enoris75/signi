import { describe, expect, test } from 'vitest';
import {
  ALLER, CHAT, complement, complements, concept, DEVOIR, EFFONDRER, el, ETRE, FATIGUE, FEMME, type Forms, IL, JAMAIS, JE, LIVRE,
  MAISON, MANGER, modal, np, NOURRITURE, POUVOIR, SEMBLER, SOURIS, TOUJOURS, TU, VITE, VOIR, VOULOIR, vp,
} from './fr.fixtures.js';
import { predicateText } from './predicateText.js';

const COURIR: Forms = {
  base: 'courir', participle: 'couru',
  '2sg_present': 'cours', '3sg_present': 'court', '1pl_present': 'courons', '3pl_present': 'courent', '1sg_future': 'courrai',
};
const AIMER: Forms = { base: 'aimer', participle: 'aimé', '3sg_present': 'aime', '1pl_present': 'aimons', '1sg_future': 'aimerai' };
const CHARGER: Forms = { base: 'charger', participle: 'chargé', '2sg_present': 'charges', '3sg_present': 'charge' };
const PRUDENT: Forms = { role: 'adjective', base: 'prudent' };
const PERIODE: Forms = { base: 'période', plural: 'périodes', gender: 'fem', count: 'singular' };

const mouse = el(np(SOURIS));
const careful = complements({ predicative: complement(np(PRUDENT)) });

describe('predicateText', () => {
  describe('tense and agreement', () => {
    test('the finite verb agrees with the subject in its tense', () => {
      expect(predicateText(CHAT, vp(MANGER))).toBe('mange');
      expect(predicateText({ ...CHAT, number: 'plural' }, vp(MANGER))).toBe('mangent');
      expect(predicateText(JE, vp(MANGER, { tense: 'past' }))).toBe('mangeai');
      expect(predicateText({ ...JE, number: 'plural' }, vp(MANGER, { tense: 'future' }))).toBe('mangerons');
    });

    test('the object and then the complements follow the verb', () => {
      expect(predicateText(CHAT, vp(MANGER), mouse)).toBe('mange la souris');
      expect(predicateText(CHAT, vp(MANGER), el(np(SOURIS), np(NOURRITURE)))).toBe('mange la souris et la nourriture');
      expect(predicateText(CHAT, vp(MANGER), mouse, complements({ locative: complement(np(MAISON)) }))).toBe('mange la souris dans la maison');
    });

    test('the complements see the subject and the verb', () => {
      expect(predicateText(FEMME, vp(SEMBLER), undefined, complements({ predicative: complement(np(FATIGUE)) }))).toBe('semble fatiguée');
      expect(predicateText(CHAT, vp(COURIR, {}, 'RUN'), undefined, complements({ source: complement(np(MAISON)) })))
        .toBe('court loin de la maison');
    });

    test('a manner adverb follows the verb, ahead of the object', () => {
      expect(predicateText(CHAT, vp(MANGER, { modifier: concept(VITE) }), mouse)).toBe('mange vite la souris');
    });
  });

  describe('hypothetical mood', () => {
    test('the apodosis takes the conditional and the protasis the imparfait', () => {
      expect(predicateText(CHAT, vp(MANGER, { mood: 'conditional' }))).toBe('mangerait');
      expect(predicateText({ ...CHAT, number: 'plural' }, vp(COURIR, { mood: 'conditional' }))).toBe('courraient');
      expect(predicateText(CHAT, vp(MANGER, { mood: 'subjunctive' }))).toBe('mangeait');
      expect(predicateText(CHAT, vp(ETRE, { mood: 'subjunctive' }, 'BE'), undefined, careful)).toBe('était prudent');
    });

    test('a marked aspect puts the mood on its auxiliary', () => {
      expect(predicateText(CHAT, vp(COURIR, { mood: 'conditional', aspect: 'resultative' }))).toBe('aurait couru');
      expect(predicateText(CHAT, vp(MANGER, { mood: 'subjunctive', aspect: 'progressive' }))).toBe('était en train de manger');
    });
  });

  describe('negation', () => {
    test('ne … pas brackets the finite verb, ne eliding before a vowel', () => {
      expect(predicateText(CHAT, vp(MANGER, { negative: true }), mouse)).toBe('ne mange pas la souris');
      expect(predicateText(CHAT, vp(ETRE, { negative: true }), undefined, careful)).toBe("n'est pas prudent");
      expect(predicateText(CHAT, vp(AIMER, { negative: true }), mouse)).toBe("n'aime pas la souris");
    });

    test('jamais replaces pas, and negates even without the negative flag', () => {
      expect(predicateText(CHAT, vp(MANGER, { negative: true, modifier: concept(JAMAIS) }))).toBe('ne mange jamais');
      expect(predicateText(CHAT, vp(MANGER, { modifier: concept(JAMAIS) }))).toBe('ne mange jamais');
    });

    test('any other frequency adverb follows pas', () => {
      expect(predicateText(CHAT, vp(MANGER, { negative: true, modifier: concept(TOUJOURS) }))).toBe('ne mange pas toujours');
    });

    test('aucun negates with ne alone, wherever it stands', () => {
      expect(predicateText({ ...CHAT, definiteness: 'no' }, vp(COURIR))).toBe('ne court');
      expect(predicateText(CHAT, vp(MANGER), el(np(SOURIS, { definiteness: 'no' })))).toBe('ne mange aucune souris');
      expect(predicateText(CHAT, vp(MANGER, { negative: true }), el(np(SOURIS, { definiteness: 'no' })))).toBe('ne mange aucune souris');
      expect(predicateText(CHAT, vp(COURIR), undefined, complements({ locative: complement(np(MAISON, { definiteness: 'no' })) })))
        .toBe('ne court dans aucune maison');
    });
  });

  describe('aspect', () => {
    test('the progressive and prospective are periphrastic on être', () => {
      expect(predicateText(CHAT, vp(MANGER, { aspect: 'progressive' }), mouse)).toBe('est en train de manger la souris');
      expect(predicateText(CHAT, vp(ALLER, { aspect: 'prospective', tense: 'past' }))).toBe("était sur le point d'aller");
    });

    test('the resultative takes avoir or être by verb, restoring a reflexive clitic', () => {
      expect(predicateText(CHAT, vp(MANGER, { aspect: 'resultative' }), mouse)).toBe('a mangé la souris');
      expect(predicateText(FEMME, vp(ALLER, { aspect: 'resultative' }))).toBe('est allée');
      expect(predicateText(FEMME, vp(EFFONDRER, { aspect: 'resultative' }))).toBe("s'est effondrée");
    });

    test('negation wraps the auxiliary and leaves the tail', () => {
      expect(predicateText(CHAT, vp(MANGER, { aspect: 'resultative', negative: true }))).toBe("n'a pas mangé");
      expect(predicateText(CHAT, vp(MANGER, { aspect: 'progressive', negative: true, tense: 'future' }))).toBe('ne sera pas en train de manger');
      expect(predicateText(CHAT, vp(VOIR, { aspect: 'resultative' }), el(np(SOURIS, { definiteness: 'no' })))).toBe("n'a vu aucune souris");
    });

    test('a frequency adverb sits between the auxiliary and the tail', () => {
      expect(predicateText(CHAT, vp(MANGER, { aspect: 'resultative', modifier: concept(JAMAIS) }))).toBe("n'a jamais mangé");
      expect(predicateText(CHAT, vp(ETRE, { aspect: 'resultative', modifier: concept(TOUJOURS) }), undefined, careful)).toBe('a toujours été prudent');
    });

    // An object-relative clause passes its antecedent: "la souris que le chat a mangée".
    test('an avoir participle agrees with a preceding direct object', () => {
      expect(predicateText(CHAT, vp(MANGER, { aspect: 'resultative' }), undefined, undefined, SOURIS)).toBe('a mangée');
      expect(predicateText(CHAT, vp(MANGER, { aspect: 'resultative' }), undefined, undefined, { ...LIVRE, number: 'plural' })).toBe('a mangés');
    });
  });

  describe('modals', () => {
    test('the outermost modal is finite and governs the infinitives', () => {
      expect(predicateText(CHAT, vp(MANGER, { modals: [modal(DEVOIR)] }), mouse)).toBe('doit manger la souris');
      expect(predicateText({ ...CHAT, number: 'plural' }, vp(MANGER, { modals: [modal(DEVOIR)] }))).toBe('doivent manger');
      expect(predicateText(CHAT, vp(MANGER, { tense: 'past', modals: [modal(VOULOIR), modal(POUVOIR)] }))).toBe('voulut pouvoir manger');
      expect(predicateText(CHAT, vp(MANGER, { aspect: 'resultative', modals: [modal(DEVOIR)] }))).toBe('doit avoir mangé');
      expect(predicateText(CHAT, vp(MANGER, { mood: 'conditional', modals: [modal(DEVOIR)] }))).toBe('devrait manger');
    });

    test('negation brackets only the finite modal', () => {
      expect(predicateText(CHAT, vp(MANGER, { negative: true, modals: [modal(VOULOIR), modal(POUVOIR)] }))).toBe('ne veut pas pouvoir manger');
      expect(predicateText(CHAT, vp(MANGER, { modals: [modal(DEVOIR)] }), el(np(SOURIS, { definiteness: 'no' })))).toBe('ne doit manger aucune souris');
    });

    test('a frequency adverb follows the finite modal, a manner adverb the infinitive', () => {
      expect(predicateText(CHAT, vp(MANGER, { modals: [modal(DEVOIR)], modifier: concept(TOUJOURS) }))).toBe('doit toujours manger');
      expect(predicateText(CHAT, vp(MANGER, { negative: true, modals: [modal(DEVOIR)], modifier: concept(TOUJOURS) })))
        .toBe('ne doit pas toujours manger');
      expect(predicateText(CHAT, vp(MANGER, { modals: [modal(POUVOIR)], modifier: concept(VITE) }), mouse)).toBe('peut manger vite la souris');
    });

    test('jamais on the main verb or on a modal negates the finite modal', () => {
      expect(predicateText(CHAT, vp(MANGER, { modals: [modal(DEVOIR)], modifier: concept(JAMAIS) }))).toBe('ne doit jamais manger');
      expect(predicateText(CHAT, vp(MANGER, { negative: true, modals: [modal(VOULOIR, JAMAIS)] }))).toBe('ne veut jamais manger');
    });
  });

  describe('object pronouns', () => {
    test('a pronoun object is a proclitic before the finite verb', () => {
      expect(predicateText(CHAT, vp(VOIR), el(np(JE)))).toBe('me voit');
      expect(predicateText(CHAT, vp(VOIR), el(np(IL, { gender: 'fem' })))).toBe('la voit');
      expect(predicateText(CHAT, vp(VOIR), el(np(IL, { number: 'plural' })))).toBe('les voit');
      expect(predicateText(CHAT, vp(AIMER), el(np(JE)))).toBe("m'aime");
    });

    test('it sits inside ne … pas and before the auxiliary', () => {
      expect(predicateText(CHAT, vp(VOIR, { negative: true }), el(np(JE)))).toBe('ne me voit pas');
      expect(predicateText(CHAT, vp(VOIR, { aspect: 'resultative' }), el(np(IL)))).toBe("l'a vu");
    });
  });

  describe('imperative', () => {
    const command = (verb: Forms, extra: Parameters<typeof vp>[1] = {}, conceptId?: string) =>
      vp(verb, { mood: 'imperative', ...extra }, conceptId);

    test('a subjectless command in the tu, nous or vous form', () => {
      expect(predicateText(TU, command(MANGER), mouse)).toBe('mange la souris');
      expect(predicateText({ ...TU, number: 'plural' }, command(MANGER), mouse)).toBe('mangez la souris');
      expect(predicateText({ ...JE, number: 'plural' }, command(MANGER), mouse)).toBe('mangeons la souris');
      expect(predicateText(TU, command(COURIR))).toBe('cours');
    });

    test('être and aller take their irregular forms', () => {
      expect(predicateText(TU, command(ETRE, {}, 'BE'), undefined, careful)).toBe('sois prudent');
      expect(predicateText({ ...TU, number: 'plural' }, command(ALLER, {}, 'GO'))).toBe('allez');
    });

    test('negation brackets the command, with ne alone under jamais or aucun', () => {
      expect(predicateText(TU, command(MANGER, { negative: true }))).toBe('ne mange pas');
      expect(predicateText(TU, command(ETRE, { negative: true }, 'BE'), undefined, careful)).toBe('ne sois pas prudent');
      expect(predicateText(TU, command(MANGER, { negative: true, modifier: concept(JAMAIS) }))).toBe('ne mange jamais');
      expect(predicateText(TU, command(MANGER), el(np(SOURIS, { definiteness: 'no' })))).toBe('ne mange aucune souris');
    });

    test('a negative command keeps its object clitic inside the bracket', () => {
      expect(predicateText(TU, command(VOIR, { negative: true }), el(np(JE)))).toBe('ne me vois pas');
    });

    test('the adverb follows the verb', () => {
      expect(predicateText(TU, command(MANGER, { modifier: concept(VITE) }))).toBe('mange vite');
    });

    // A button or a recipe step: "Charger une période", "Ne pas courir".
    test('the instruction register is the infinitive', () => {
      const instruction = (verb: Forms, extra: Parameters<typeof vp>[1] = {}) => command(verb, { register: 'instruction', ...extra });
      expect(predicateText(TU, instruction(CHARGER), el(np(PERIODE, { definiteness: 'indefinite' })))).toBe('charger une période');
      expect(predicateText(TU, instruction(COURIR, { negative: true }))).toBe('ne pas courir');
      expect(predicateText(TU, instruction(VOIR), el(np(IL)))).toBe('le voir');
    });
  });

  describe('infinitive mood', () => {
    const infinitive = (verb: Forms, extra: Parameters<typeof vp>[1] = {}) => vp(verb, { mood: 'infinitive', ...extra });

    test('the bare infinitive, followed by its adverb and objects', () => {
      expect(predicateText(CHAT, infinitive(MANGER), el(np(NOURRITURE)))).toBe('manger la nourriture');
      expect(predicateText(CHAT, infinitive(MANGER, { modifier: concept(VITE) }))).toBe('manger vite');
    });

    test('ne pas brackets the whole infinitive', () => {
      expect(predicateText(CHAT, infinitive(MANGER, { negative: true }), el(np(NOURRITURE)))).toBe('ne pas manger la nourriture');
    });

    test('an object pronoun is proclitic to the infinitive', () => {
      expect(predicateText(CHAT, infinitive(MANGER), el(np(IL)))).toBe('le manger');
      expect(predicateText(CHAT, infinitive(AIMER), el(np(JE)))).toBe("m'aimer");
    });
  });
});
