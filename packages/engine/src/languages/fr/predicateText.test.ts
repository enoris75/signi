import { describe, expect, test } from 'vitest';
import {
  ALLER, CHAT, CHIEN, complement, complements, concept, DEVOIR, EFFONDRER, el, ETRE, FATIGUE, FEMME, FEU, type Forms, HABITER, IL, JAMAIS, JE, LIVRE,
  HEUREUX, MAISON, MANGER, modal, np, NOURRITURE, POUVOIR, SEMBLER, SOURIS, TOUJOURS, TU, VITE, VOIR, VOULOIR, vp,
} from './fr.fixtures.js';
import { predicateText } from './predicateText.js';

// CRY_OUT's lexeme raises an alarm; WOLF and FIRE name a danger (A124).
const CRIER: Forms = { base: 'crier', alarm_cry: '1', participle: 'crié', '3sg_present': 'crie', '3sg_past': 'cria' };
const LOUP: Forms = { base: 'loup', plural: 'loups', gender: 'masc', count: 'singular', animate: '1' };
const ALARM_LOUP: Forms = { ...LOUP, alarm: '1' };
const ALARM_FEU: Forms = { ...FEU, alarm: '1' };

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

    // A130: the passé simple makes a state an event, so a state's past is the imparfait.
    test('the past of a state is the imparfait', () => {
      expect(predicateText(FEMME, vp(SEMBLER, { tense: 'past' }), undefined, complements({ predicative: complement(np(FATIGUE)) })))
        .toBe('semblait fatiguée');
      expect(predicateText({ ...JE, number: 'plural' }, vp(ETRE, { tense: 'past' }, 'BE'), undefined, careful)).toBe('étions prudents');
      expect(predicateText(CHAT, vp(ETRE, { tense: 'past', negative: true }, 'BE'), undefined, careful)).toBe("n'était pas prudent");
      expect(predicateText(CHAT, vp(MANGER, { tense: 'past', modals: [modal(DEVOIR)] }), mouse)).toBe('devait manger la souris');
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

    // A137: the stored forms carry one person's clitic, so a pronominal verb takes the subject's.
    test('a pronominal verb takes the clitic of its subject', () => {
      expect(predicateText(CHAT, vp(EFFONDRER, { mood: 'conditional' }))).toBe("s'effondrerait");
      expect(predicateText(CHAT, vp(EFFONDRER, { mood: 'subjunctive' }))).toBe("s'effondrait");
      expect(predicateText(JE, vp(EFFONDRER, { mood: 'subjunctive' }))).toBe("m'effondrais");
      expect(predicateText({ ...JE, number: 'plural' }, vp(EFFONDRER, { mood: 'conditional' }))).toBe('nous effondrerions');
      expect(predicateText(CHAT, vp(EFFONDRER, { mood: 'conditional', negative: true }))).toBe("ne s'effondrerait pas");
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

    // A227: an h muet is a vowel sound, and the verb's lexeme says which h is one.
    test('ne elides before a verb on an h muet, not before an h aspiré', () => {
      expect(predicateText(CHAT, vp(HABITER, { negative: true }))).toBe("n'habite pas");
      expect(predicateText(CHAT, vp(HABITER, { modifier: concept(JAMAIS) }))).toBe("n'habite jamais");
      expect(predicateText(CHAT, vp({ base: 'hurler', '3sg_present': 'hurle' }, { negative: true }))).toBe('ne hurle pas');
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

    // A167: whether the subject is the self-negating "aucun" is the caller's. A relative on a `no` head
    // agrees with it, but the head negates the matrix clause, so the relative clause says `false`: a
    // positive relative stays positive and a negative one takes "ne … pas".
    test('a caller that says the subject does not negate gets its own polarity back', () => {
      const noCat = { ...CHAT, definiteness: 'no' };
      expect(predicateText(noCat, vp(MANGER), undefined, undefined, undefined, undefined, false)).toBe('mange');
      expect(predicateText(noCat, vp(MANGER, { negative: true }), undefined, undefined, undefined, undefined, false)).toBe('ne mange pas');
      expect(predicateText(CHAT, vp(MANGER), undefined, undefined, undefined, undefined, true)).toBe('ne mange');
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
      expect(predicateText(CHAT, vp(MANGER, { tense: 'past', modals: [modal(VOULOIR), modal(POUVOIR)] }))).toBe('voulait pouvoir manger');
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
      expect(predicateText(CHAT, vp(AIMER, { negative: true }), el(np(JE)))).toBe("ne m'aime pas");
      expect(predicateText(CHAT, vp(VOIR, { aspect: 'resultative' }), el(np(IL)))).toBe("l'a vu");
    });

    // A88: no clitic climbing onto être or a modal.
    test('it goes before the infinitive of a periphrasis or a modal', () => {
      expect(predicateText(CHAT, vp(VOIR, { aspect: 'progressive' }), el(np(JE)))).toBe('est en train de me voir');
      expect(predicateText(CHAT, vp(AIMER, { aspect: 'prospective', negative: true }), el(np(IL)))).toBe("n'est pas sur le point de l'aimer");
      expect(predicateText(CHAT, vp(VOIR, { modals: [modal(DEVOIR)], negative: true }), el(np(JE)))).toBe('ne doit pas me voir');
      expect(predicateText(CHAT, vp(VOIR, { modals: [modal(DEVOIR)], aspect: 'resultative' }), el(np(IL, { gender: 'fem' })))).toBe("doit l'avoir vue");
    });

    test('an avoir participle agrees with the preceding clitic', () => {
      expect(predicateText(CHAT, vp(VOIR, { aspect: 'resultative' }), el(np(IL, { gender: 'fem' })))).toBe("l'a vue");
      expect(predicateText(CHAT, vp(VOIR, { aspect: 'resultative' }), el(np(IL, { number: 'plural', gender: 'fem' })))).toBe('les a vues');
      expect(predicateText(CHAT, vp(VOIR, { aspect: 'resultative' }), el(np(IL), np(JE)))).toBe('nous a vus, lui et moi,');
    });

    // The closing comma is tidied against the full stop by `punctuate`, in the engine.
    test('a coordinated object holding a pronoun is resumed by its plural clitic and dislocated', () => {
      expect(predicateText(CHAT, vp(VOIR), el(np(IL), np(JE)))).toBe('nous voit, lui et moi,');
      expect(predicateText(CHAT, vp(VOIR), el(np(SOURIS), np(TU)))).toBe('vous voit, la souris et toi,');
      expect(predicateText(CHAT, vp(VOIR), el(np(SOURIS), np(IL)))).toBe('les voit, la souris et lui,');
      expect(predicateText(CHAT, vp(VOIR, { negative: true }), el(np(IL), np(JE)))).toBe('ne nous voit pas, lui et moi,');
    });

    test('a coordinated object of nouns keeps the post-verbal slot', () => {
      expect(predicateText(CHAT, vp(VOIR), el(np(SOURIS), np(LIVRE)))).toBe('voit la souris et le livre');
    });
  });

  describe('imperative', () => {
    const command = (verb: Forms, extra: Parameters<typeof vp>[1] = {}, conceptId?: string) =>
      vp(verb, { mood: 'imperative', ...extra }, conceptId);

    // A70: an affirmative command puts its pronouns after it, hyphenated.
    test('an affirmative command takes its pronouns after the verb, a negative one before', () => {
      expect(predicateText(TU, command(VOIR), el(np(JE)))).toBe('vois-moi');
      expect(predicateText({ ...TU, number: 'plural' }, command(VOIR), el(np(IL)))).toBe('voyez-le');
      expect(predicateText(TU, command(EFFONDRER, {}, 'COLLAPSE'))).toBe('effondre-toi');
      expect(predicateText(TU, command(VOIR, { negative: true }), el(np(JE)))).toBe('ne me vois pas');
    });

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
      // ne elides before a command on an h muet (A227).
      expect(predicateText(TU, command(HABITER, { negative: true }))).toBe("n'habite pas");
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
      expect(predicateText(TU, instruction(AIMER, { negative: true }), el(np(JE)))).toBe("ne pas m'aimer");
      expect(predicateText(TU, instruction(COURIR, { modifier: concept(JAMAIS) }))).toBe('ne jamais courir');
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

    // A91: the whole negation precedes the clitic and the infinitive.
    test('the negation precedes the clitic; jamais replaces pas and aucun takes ne alone', () => {
      expect(predicateText(CHAT, infinitive(VOIR, { negative: true }), el(np(IL)))).toBe('ne pas le voir');
      expect(predicateText(CHAT, infinitive(MANGER, { modifier: concept(JAMAIS) }))).toBe('ne jamais manger');
      expect(predicateText(CHAT, infinitive(VOIR, { modifier: concept(JAMAIS), negative: true }), el(np(IL, { gender: 'fem' })))).toBe('ne jamais la voir');
      expect(predicateText(CHAT, infinitive(MANGER), el(np(SOURIS, { definiteness: 'no' })))).toBe('ne manger aucune souris');
      expect(predicateText(CHAT, infinitive(AIMER), el(np(CHAT, { definiteness: 'no' })))).toBe("n'aimer aucun chat");
      expect(predicateText(CHAT, infinitive(HABITER), undefined, complements({ locative: complement(np(MAISON, { definiteness: 'no' })) })))
        .toBe("n'habiter dans aucune maison");
    });

    test('an object pronoun is proclitic to the infinitive', () => {
      expect(predicateText(CHAT, infinitive(MANGER), el(np(IL)))).toBe('le manger');
      expect(predicateText(CHAT, infinitive(AIMER), el(np(JE)))).toBe("m'aimer");
    });
  });

  describe('an alarm cry (A124)', () => {
    test('a danger cried out takes "à" and the article, bare or not', () => {
      expect(predicateText(CHAT, vp(CRIER, { tense: 'past' }), el(np(ALARM_LOUP)))).toBe('cria au loup');
      expect(predicateText(CHAT, vp(CRIER, { tense: 'past' }), el(np(ALARM_LOUP, { definiteness: 'bare' })))).toBe('cria au loup');
      expect(predicateText(CHAT, vp(CRIER), el(np(ALARM_FEU, { definiteness: 'bare', number: 'plural' })))).toBe('crie aux feux');
      expect(predicateText(CHAT, vp(CRIER, { negative: true }), el(np(ALARM_LOUP), np(ALARM_FEU)))).toBe('ne crie pas au loup et au feu');
    });

    test('the frame needs both the crying verb and the danger', () => {
      expect(predicateText(CHAT, vp(CRIER), el(np(LOUP)))).toBe('crie le loup');
      expect(predicateText(CHAT, vp(VOIR), el(np(ALARM_LOUP)))).toBe('voit le loup');
    });
  });

  // A121: a bare copula that elides the subject complement before it leaves its pro-form.
  describe('an elided subject complement', () => {
    const happy = { type: 'predicative' as const, complement: complement(np(HEUREUX)) };
    const inTheHouse = { type: 'locative' as const, complement: complement(np(MAISON)) };

    test('a predicate leaves the invariable le, eliding before a vowel', () => {
      expect(predicateText(CHIEN, vp(ETRE, { negative: true, elided: happy }))).toBe("ne l'est pas");
      expect(predicateText({ ...CHIEN, number: 'plural' }, vp(ETRE, { negative: true, elided: happy }))).toBe('ne le sont pas');
      expect(predicateText(CHIEN, vp(ETRE, { tense: 'future', elided: happy }))).toBe('le sera');
    });

    test('a place leaves y, and ne elides before it', () => {
      expect(predicateText(CHIEN, vp(ETRE, { elided: inTheHouse }))).toBe('y est');
      expect(predicateText(CHIEN, vp(ETRE, { negative: true, elided: inTheHouse }))).toBe("n'y est pas");
    });

    // The pro-form is no object: the avoir participle stays "été", and a modal takes it before the infinitive.
    test('the compound past and a modal place the pro-form as they place a clitic', () => {
      expect(predicateText(CHIEN, vp(ETRE, { aspect: 'resultative', negative: true, elided: happy }))).toBe("ne l'a pas été");
      expect(predicateText(CHIEN, vp(ETRE, { modals: [modal(DEVOIR)], negative: true, elided: happy }))).toBe("ne doit pas l'être");
    });
  });

  // A139: CLICK's lexeme takes its object with "sur".
  describe('an object a preposition leads (A139)', () => {
    const CLIQUER: Forms = { base: 'cliquer', object_prep: 'sur', '3sg_present': 'clique', '2sg_present': 'cliques', participle: 'cliqué' };

    test('the object takes the preposition, inside ne … pas', () => {
      expect(predicateText(CHAT, vp(CLIQUER), el(np(LIVRE)))).toBe('clique sur le livre');
      expect(predicateText(CHAT, vp(CLIQUER, { negative: true }), el(np(LIVRE), np(MAISON)))).toBe('ne clique pas sur le livre et sur la maison');
    });

    test('a pronoun is no clitic, is never dislocated, and no participle agrees with it', () => {
      expect(predicateText(CHAT, vp(CLIQUER), el(np(JE)))).toBe('clique sur moi');
      expect(predicateText(CHAT, vp(CLIQUER), el(np(IL), np(JE)))).toBe('clique sur lui et sur moi');
      expect(predicateText(CHAT, vp(CLIQUER, { aspect: 'resultative' }), el(np(MAISON)))).toBe('a cliqué sur la maison');
      expect(predicateText(TU, vp(CLIQUER, { mood: 'imperative' }), el(np(JE)))).toBe('clique sur moi');
    });
  });

  // NEED's lemma is avoir besoin (B62): every finite form carries the noun, and the negation and a
  // frequency or short adverb go between the verb and the noun, as between an auxiliary and its
  // participle.
  describe('a multiword lemma: avoir besoin (B62)', () => {
    const AVOIR_BESOIN: Forms = {
      base: 'avoir besoin', object_prep: 'de', stative: '1', participle: 'eu besoin',
      '1sg_present': 'ai besoin', '2sg_present': 'as besoin', '3sg_present': 'a besoin', '1pl_present': 'avons besoin',
      '3sg_past': 'eut besoin', '1sg_future': 'aurai besoin', '3sg_future': 'aura besoin',
    };
    const food = el(np(NOURRITURE));
    const need = (extra: Parameters<typeof vp>[1] = {}) => vp(AVOIR_BESOIN, extra, 'NEED');

    test('the negation wraps the verb, not the verb and its noun', () => {
      expect(predicateText(CHAT, need(), food)).toBe('a besoin de la nourriture');
      expect(predicateText(CHAT, need({ negative: true }), food)).toBe("n'a pas besoin de la nourriture");
      expect(predicateText(JE, need({ negative: true }), food)).toBe("n'ai pas besoin de la nourriture");
      expect(predicateText(CHAT, need({ tense: 'future', negative: true }), food)).toBe("n'aura pas besoin de la nourriture");
    });

    test('a frequency adverb and "bien" go between the verb and its noun', () => {
      expect(predicateText(CHAT, need({ modifier: concept(TOUJOURS) }), food)).toBe('a toujours besoin de la nourriture');
      expect(predicateText(CHAT, need({ modifier: concept(JAMAIS) }), food)).toBe("n'a jamais besoin de la nourriture");
      expect(predicateText(CHAT, need({ modifier: concept(TOUJOURS), negative: true }), food)).toBe("n'a pas toujours besoin de la nourriture");
      expect(predicateText(CHAT, need({ modifier: concept({ base: 'bien', pre_nonfinite: '1' }) }), food)).toBe('a bien besoin de la nourriture');
    });

    test('a compound tense and a modal negate their own finite, as for any verb', () => {
      expect(predicateText(CHAT, need({ aspect: 'resultative', negative: true }), food)).toBe("n'a pas eu besoin de la nourriture");
      expect(predicateText(CHAT, need({ aspect: 'resultative', modifier: concept(JAMAIS) }), food)).toBe("n'a jamais eu besoin de la nourriture");
      expect(predicateText(CHAT, need({ modals: [modal(DEVOIR)], negative: true }), food)).toBe('ne doit pas avoir besoin de la nourriture');
    });

    // The state's imparfait and the conditional are derived on "avoir" and keep the noun (mood.ts).
    test('the derived moods keep the noun after the verb', () => {
      expect(predicateText(CHAT, need({ tense: 'past', negative: true }), food)).toBe("n'avait pas besoin de la nourriture");
      expect(predicateText(CHAT, need({ mood: 'conditional' }), food)).toBe('aurait besoin de la nourriture');
    });

    test('a command takes avoir\'s imperative, inside ne … pas', () => {
      expect(predicateText(TU, need({ mood: 'imperative' }), food)).toBe('aie besoin de la nourriture');
      expect(predicateText(TU, need({ mood: 'imperative', negative: true }), food)).toBe("n'aie pas besoin de la nourriture");
      expect(predicateText(TU, need({ mood: 'imperative', modifier: concept(JAMAIS) }), food)).toBe("n'aie jamais besoin de la nourriture");
    });
  });
});
