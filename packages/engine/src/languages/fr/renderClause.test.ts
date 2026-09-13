import { describe, expect, test } from 'vitest';
import {
  ALLER, BON, CHAT, CHIEN, clause, complement, complements, concept, DEVOIR, el, FEMME, type Forms, GARCON, GRAND, IL,
  JAMAIS, JE, MAISON, MANGER, MANIERE, modal, np, NOURRITURE, ON, PETIT, POUVOIR, SEMBLER, SOURIS, TAILLE, TU, VIEUX, VOIR,
  vp,
} from './fr.fixtures.js';
import { renderClause } from './renderClause.js';

const COURIR: Forms = { base: 'courir', participle: 'couru', '2sg_present': 'cours', '3sg_present': 'court', '3pl_present': 'courent', '1sg_future': 'courrai' };
const PLEURER: Forms = { base: 'pleurer', '3sg_present': 'pleure' };

const mouse = el(np(SOURIS));
const CHATTE: Forms = { ...CHAT, gender: 'fem', base: 'chatte', plural: 'chattes' };

describe('renderClause', () => {
  describe('verbless periods', () => {
    test('a bare noun phrase stands on its own', () => {
      expect(renderClause(clause(np(CHAT, {}, { adjectives: [concept(GRAND, 'BIG')] })))).toBe('le grand chat');
    });

    test('a dimension gloss is a prepositional fragment', () => {
      const subject = np(TAILLE, { definiteness: 'bare' }, { adjectives: [concept(PETIT, 'SMALL')], dimensionGloss: true });
      expect(renderClause(clause(subject))).toBe('de petite taille');
    });

    test('a manner gloss keeps its determiner under its adposition', () => {
      const subject = np(MANIERE, { definiteness: 'indefinite' }, { adjectives: [concept(BON, 'GOOD')], mannerGloss: true });
      expect(renderClause(clause(subject))).toBe("d'une bonne manière");
    });

    test('a gloss flag is ignored once the clause has a verb', () => {
      const subject = np(TAILLE, {}, { dimensionGloss: true });
      expect(renderClause(clause(subject, vp(SEMBLER), { complements: complements({ predicative: complement(np(PETIT)) }) })))
        .toBe('la taille semble petite');
    });
  });

  describe('subject and agreement', () => {
    test('subject, verb, object', () => {
      expect(renderClause(clause(np(CHAT), vp(MANGER), { directObject: mouse }))).toBe('le chat mange la souris');
      expect(renderClause(clause(np(ON), vp(MANGER), { directObject: mouse }))).toBe('on mange la souris');
      expect(renderClause(clause(np(IL, { gender: 'fem', number: 'plural', base: 'elles', plural: 'elles' }), vp(COURIR)))).toBe('elles courent');
    });

    // A92: the subject clitic je elides before a vowel-initial predicate.
    test('je elides before a vowel, not before a consonant, a clitic or ne', () => {
      expect(renderClause(clause(np(JE), vp(MANGER, { aspect: 'resultative' })))).toBe("j'ai mangé");
      expect(renderClause(clause(np(JE), vp(MANGER, { aspect: 'progressive', tense: 'past' })))).toBe("j'étais en train de manger");
      expect(renderClause(clause(np(JE), vp(MANGER)))).toBe('je mange');
      expect(renderClause(clause(np(JE), vp(VOIR, { aspect: 'resultative' }), { directObject: el(np(IL)) }))).toBe("je l'ai vu");
      expect(renderClause(clause(np(JE), vp(MANGER, { aspect: 'resultative', negative: true })))).toBe("je n'ai pas mangé");
    });

    test('the verb agrees with the subject slot as a group', () => {
      expect(renderClause(clause(el(np(CHAT), np(CHIEN)), vp(COURIR)))).toBe('le chat et le chien courent');
      expect(renderClause(clause(el(np(JE), np(CHAT)), vp(MANGER)))).toBe('moi et le chat, nous mangeons');
      expect(renderClause(clause(el(np(TU), np(CHAT)), vp(MANGER)))).toBe('toi et le chat, vous mangez');
    });

    // A group is feminine only if every conjunct is.
    test('a predicate adjective and an être participle agree with the group', () => {
      const seemOld = { complements: complements({ predicative: complement(np(VIEUX)) }) };
      expect(renderClause(clause(el(np(CHATTE), np(MAISON)), vp(SEMBLER), seemOld))).toBe('la chatte et la maison semblent vieilles');
      expect(renderClause(clause(el(np(CHATTE), np(CHIEN)), vp(SEMBLER), seemOld))).toBe('la chatte et le chien semblent vieux');
      expect(renderClause(clause(el(np(CHATTE), np(CHIEN)), vp(ALLER, { aspect: 'resultative' })))).toBe('la chatte et le chien sont allés');
    });

    test('a subject relative clause agrees with its head', () => {
      const cat = np(CHAT, { number: 'plural' }, { relative: { headRole: 'subject', verbPhrase: vp(MANGER) } });
      expect(renderClause(clause(cat, vp(COURIR)))).toBe('les chats qui mangent courent');
    });
  });

  describe('tense, aspect and mood', () => {
    test('the simple tenses are synthetic', () => {
      expect(renderClause(clause(np(CHAT), vp(MANGER, { tense: 'past' }), { directObject: mouse }))).toBe('le chat mangea la souris');
      expect(renderClause(clause(np(CHAT), vp(MANGER, { tense: 'future' }), { directObject: mouse }))).toBe('le chat mangera la souris');
    });

    test('the marked aspects are periphrastic', () => {
      expect(renderClause(clause(np(CHAT), vp(MANGER, { aspect: 'progressive' })))).toBe('le chat est en train de manger');
      expect(renderClause(clause(np(CHAT), vp(MANGER, { aspect: 'prospective', tense: 'past' })))).toBe('le chat était sur le point de manger');
      expect(renderClause(clause(np(FEMME), vp(ALLER, { aspect: 'resultative', tense: 'future' })))).toBe('la femme sera allée');
    });

    test('a hypothetical clause takes the conditional or the imparfait, ignoring its condition', () => {
      const phrase = clause(np(CHIEN), vp(COURIR, { mood: 'conditional' }), { condition: clause(np(CHAT), vp(MANGER, { mood: 'subjunctive' })) });
      expect(renderClause(phrase)).toBe('le chien courrait');
      expect(renderClause(clause(np(CHAT), vp(MANGER, { mood: 'subjunctive', aspect: 'resultative' })))).toBe('le chat avait mangé');
    });

    test('a modal chain governs the main infinitive', () => {
      expect(renderClause(clause(np(CHAT), vp(MANGER, { modals: [modal(DEVOIR), modal(POUVOIR)] }), { directObject: mouse })))
        .toBe('le chat doit pouvoir manger la souris');
    });
  });

  describe('negation', () => {
    test('ne … pas brackets the finite verb or auxiliary', () => {
      expect(renderClause(clause(np(CHAT), vp(MANGER, { negative: true }), { directObject: mouse }))).toBe('le chat ne mange pas la souris');
      expect(renderClause(clause(np(CHAT), vp(MANGER, { negative: true, aspect: 'resultative' })))).toBe("le chat n'a pas mangé");
      expect(renderClause(clause(np(CHAT), vp(MANGER, { negative: true, modals: [modal(DEVOIR)] })))).toBe('le chat ne doit pas manger');
    });

    test('jamais and aucun take ne alone', () => {
      expect(renderClause(clause(np(CHAT), vp(MANGER, { modifier: concept(JAMAIS) })))).toBe('le chat ne mange jamais');
      expect(renderClause(clause(np(GARCON, { definiteness: 'no' }), vp(PLEURER)))).toBe('aucun garçon ne pleure');
      expect(renderClause(clause(np(CHAT), vp(MANGER), { directObject: el(np(SOURIS, { definiteness: 'no' })) }))).toBe('le chat ne mange aucune souris');
    });
  });

  describe('object pronouns', () => {
    test('a pronoun object cliticises between the subject and the verb', () => {
      expect(renderClause(clause(np(CHAT), vp(VOIR), { directObject: el(np(JE)) }))).toBe('le chat me voit');
      expect(renderClause(clause(np(CHAT), vp(VOIR, { negative: true }), { directObject: el(np(JE)) }))).toBe('le chat ne me voit pas');
    });
  });

  describe('imperative', () => {
    test('drops the subject, whose person still picks the form', () => {
      expect(renderClause(clause(np(TU), vp(MANGER, { mood: 'imperative' }), { directObject: mouse }))).toBe('mange la souris');
      expect(renderClause(clause(np(TU, { number: 'plural' }), vp(MANGER, { mood: 'imperative' }), { directObject: mouse }))).toBe('mangez la souris');
      expect(renderClause(clause(np(TU), vp(MANGER, { mood: 'imperative', negative: true })))).toBe('ne mange pas');
    });

    test('the instruction register is the subjectless infinitive', () => {
      const instruction = vp(MANGER, { mood: 'imperative', register: 'instruction', negative: true });
      expect(renderClause(clause(np(TU), instruction, { directObject: el(np(NOURRITURE)) }))).toBe('ne pas manger la nourriture');
    });
  });

  describe('infinitive mood', () => {
    test('drops the subject', () => {
      expect(renderClause(clause(np(ON), vp(MANGER, { mood: 'infinitive' }), { directObject: el(np(NOURRITURE)) }))).toBe('manger la nourriture');
      expect(renderClause(clause(np(ON), vp(MANGER, { mood: 'infinitive', negative: true })))).toBe('ne pas manger');
    });
  });
});
