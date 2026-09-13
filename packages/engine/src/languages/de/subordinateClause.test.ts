import { describe, expect, test } from 'vitest';
import type { ResolvedRelativeClause } from '../../types.js';
import {
  BEHAELTER, BUCH, complement, concept, el, ESSEN, type Forms, GEBEN, GEHEN, HAUS, ICH, IMMER, JUNGE, KATER, KATZE, KOENNEN, MAN,
  MANN, modal, MUESSEN, NIE, np, SCHNELL, vp, WOLLEN,
} from './de.fixtures.js';
import { subordinateClause } from './subordinateClause.js';

const KIND: Forms = { base: 'Kind', plural: 'Kinder', gender: 'neut', count: 'singular', animate: '1' };
const BRIEF: Forms = { base: 'Brief', plural: 'Briefe', gender: 'masc', count: 'singular' };
const LESEN: Forms = {
  base: 'lesen', participle: 'gelesen',
  '1sg_present': 'lese', '2sg_present': 'liest', '3sg_present': 'liest',
  '1pl_present': 'lesen', '2pl_present': 'lest', '3pl_present': 'lesen',
};

/** `forms` as the head of a noun phrase carrying `relative`. */
const relativeOn = (forms: Forms, relative: ResolvedRelativeClause, extra: Forms = {}) =>
  subordinateClause(np(forms, extra, { relative }));

describe('subordinateClause', () => {
  test('renders nothing when the noun has no relative', () => {
    expect(subordinateClause(np(KATER))).toBe('');
  });

  describe('subject relative', () => {
    test('a nominative pronoun agreeing with the head, the verb last, bracketed by commas', () => {
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN) })).toBe(', der isst,');
      expect(relativeOn(KATZE, { headRole: 'subject', verbPhrase: vp(ESSEN) })).toBe(', die isst,');
      expect(relativeOn(KIND, { headRole: 'subject', verbPhrase: vp(ESSEN) })).toBe(', das isst,');
    });

    test('the head drives verb agreement', () => {
      expect(relativeOn(KATZE, { headRole: 'subject', verbPhrase: vp(ESSEN) }, { number: 'plural' })).toBe(', die essen,');
    });

    test('the direct object sits before the verb', () => {
      expect(relativeOn(MANN, { headRole: 'subject', verbPhrase: vp(LESEN), directObject: el(np(BUCH)) })).toBe(', der das Buch liest,');
    });

    test('a clause with no subject of its own relativises on the subject', () => {
      expect(relativeOn(KATER, { headRole: 'directObject', verbPhrase: vp(ESSEN) })).toBe(', der isst,');
    });
  });

  describe('direct-object relative', () => {
    test('an accusative pronoun, followed by the clause’s own subject', () => {
      expect(relativeOn(BRIEF, { headRole: 'directObject', subject: el(np(ICH)), verbPhrase: vp(LESEN) })).toBe(', den ich lese,');
      expect(relativeOn(BUCH, { headRole: 'directObject', subject: el(np(MANN)), verbPhrase: vp(LESEN) })).toBe(', das der Mann liest,');
      expect(relativeOn(BUCH, { headRole: 'directObject', subject: el(np(MAN)), verbPhrase: vp(LESEN) }, { number: 'plural' }))
        .toBe(', die man liest,');
    });

    test('the clause subject drives verb agreement, not the head', () => {
      expect(relativeOn(BUCH, { headRole: 'directObject', subject: el(np(ICH, { number: 'plural' })), verbPhrase: vp(LESEN) }))
        .toBe(', das wir lesen,');
      expect(relativeOn(BUCH, { headRole: 'directObject', subject: el(np(MANN), np(KATZE)), verbPhrase: vp(LESEN) }))
        .toBe(', das der Mann und die Katze lesen,');
    });
  });

  describe('verb complex', () => {
    test('a tensed verb or the future auxiliary closes the clause', () => {
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN, { tense: 'past' }) })).toBe(', der aß,');
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN, { tense: 'future' }) })).toBe(', der essen wird,');
    });

    test('the resultative puts the participle before the finite auxiliary', () => {
      expect(relativeOn(MANN, { headRole: 'subject', verbPhrase: vp(LESEN, { aspect: 'resultative' }), directObject: el(np(BUCH)) }))
        .toBe(', der das Buch gelesen hat,');
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(GEHEN, { aspect: 'resultative' }) })).toBe(', der gegangen ist,');
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN, { tense: 'past', aspect: 'resultative' }) }))
        .toBe(', der gegessen hatte,');
    });

    test('the progressive and prospective adverbials lead the Mittelfeld', () => {
      expect(relativeOn(MANN, { headRole: 'subject', verbPhrase: vp(LESEN, { aspect: 'progressive' }), directObject: el(np(BUCH)) }))
        .toBe(', der gerade das Buch liest,');
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN, { aspect: 'prospective' }) })).toBe(', der im Begriff zu essen ist,');
    });

    test('the outermost modal is finite and last, behind the infinitives', () => {
      expect(relativeOn(MANN, { headRole: 'subject', verbPhrase: vp(LESEN, { modals: [modal(KOENNEN)] }), directObject: el(np(BUCH)) }))
        .toBe(', der das Buch lesen kann,');
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN, { modals: [modal(WOLLEN), modal(KOENNEN)] }) }))
        .toBe(', der essen können will,');
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN, { aspect: 'resultative', modals: [modal(MUESSEN)] }) }))
        .toBe(', der gegessen haben muss,');
    });

    test('adverbs follow the objects, a modal’s before the main verb’s', () => {
      expect(relativeOn(MANN, {
        headRole: 'subject',
        verbPhrase: vp(LESEN, { modifier: concept(SCHNELL), modals: [modal(WOLLEN, IMMER)] }),
        directObject: el(np(BUCH)),
      })).toBe(', der das Buch immer schnell lesen will,');
    });
  });

  describe('negation', () => {
    test('"nicht" sits right before the verb complex', () => {
      expect(relativeOn(MANN, { headRole: 'subject', verbPhrase: vp(LESEN, { negative: true }), directObject: el(np(BUCH)) }))
        .toBe(', der das Buch nicht liest,');
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN, { negative: true, aspect: 'resultative' }) }))
        .toBe(', der nicht gegessen hat,');
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN, { negative: true, modals: [modal(KOENNEN)] }) }))
        .toBe(', der nicht essen kann,');
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN, { negative: true, aspect: 'progressive' }) }))
        .toBe(', der gerade nicht isst,');
      expect(relativeOn(BUCH, { headRole: 'directObject', subject: el(np(ICH)), verbPhrase: vp(LESEN, { negative: true }) }))
        .toBe(', das ich nicht lese,');
    });

    test('a negative adverb on the verb or a modal replaces "nicht"', () => {
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN, { negative: true, modifier: concept(NIE) }) }))
        .toBe(', der nie isst,');
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN, { negative: true, modals: [modal(WOLLEN, NIE)] }) }))
        .toBe(', der nie essen will,');
    });
  });

  describe('complements', () => {
    // German puts the dative recipient before the accusative object.
    test('an animate recipient leads the direct object', () => {
      expect(relativeOn(JUNGE, {
        headRole: 'subject', verbPhrase: vp(GEBEN), directObject: el(np(BUCH)), complements: { terminus: complement(np(MANN)) },
      })).toBe(', der dem Mann das Buch gibt,');
    });

    test('an inanimate goal and the other complements trail the direct object', () => {
      expect(relativeOn(JUNGE, {
        headRole: 'subject', verbPhrase: vp(GEBEN), directObject: el(np(BUCH)), complements: { terminus: complement(np(BEHAELTER)) },
      })).toBe(', der das Buch in den Behälter gibt,');
      expect(relativeOn(MANN, {
        headRole: 'subject', verbPhrase: vp(LESEN), directObject: el(np(BUCH)), complements: { locative: complement(np(HAUS)) },
      })).toBe(', der das Buch im Haus liest,');
    });

    test('a relative clause nests inside another', () => {
      const walking = np(KATZE, {}, { relative: { headRole: 'subject', verbPhrase: vp(GEHEN) } });
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN), directObject: el(walking) }))
        .toBe(', der die Katze, die geht, isst,');
    });
  });
});
