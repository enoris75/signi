import { describe, expect, test } from 'vitest';
import type { CauseSentiment, Specifier } from '@signi/shared';
import type { ResolvedRelativeClause } from '../../types.js';
import {
  BEHAELTER, BEWEGEN, BUCH, complement, concept, DU, el, ER, ESSEN, type Forms, GEBEN, GEHEN, HAUS, HINZUFUEGEN, ICH, IMMER, JUNGE, KATER, KATZE, KOENNEN, MAN,
  MANN, MAUS, MESSER, modal, MUEDE, MUESSEN, NIE, np, SCHEINEN, SCHNEIDEN, SCHNELL, vp, WAEHLEN, WERDEN_VERB, WOLLEN, WORT,
} from './de.fixtures.js';
import { subordinateClause } from './subordinateClause.js';

const KIND: Forms = { base: 'Kind', plural: 'Kinder', gender: 'neut', count: 'singular', animate: '1' };
const BRIEF: Forms = { base: 'Brief', plural: 'Briefe', gender: 'masc', count: 'singular' };
const LESEN: Forms = {
  base: 'lesen', participle: 'gelesen',
  '1sg_present': 'lese', '2sg_present': 'liest', '3sg_present': 'liest',
  '1pl_present': 'lesen', '2pl_present': 'lest', '3pl_present': 'lesen',
};

const sentiment = (value: CauseSentiment): Specifier => ({ kind: 'sentiment', value });

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

    // A52: the prospective's zu-infinitive group stays whole. Bare, it stays inside the bracket; a
    // longer group is extraposed after the finite verb, led by a comma `punctuate` tidies later.
    test('the prospective keeps a bare zu-infinitive inside the bracket and extraposes a longer group', () => {
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN, { aspect: 'prospective', tense: 'future' }) }))
        .toBe(', der im Begriff zu essen sein wird,');
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN, { aspect: 'prospective', modals: [modal(MUESSEN)] }) }))
        .toBe(', der im Begriff zu essen sein muss,');
      expect(relativeOn(MANN, { headRole: 'subject', verbPhrase: vp(LESEN, { aspect: 'prospective' }), directObject: el(np(BUCH)) }))
        .toBe(', der im Begriff ist , das Buch zu lesen,');
      expect(relativeOn(JUNGE, {
        headRole: 'subject',
        verbPhrase: vp(GEBEN, { aspect: 'prospective', tense: 'future' }),
        directObject: el(np(BUCH)),
        complements: { terminus: complement(np(MANN)) },
      })).toBe(', der im Begriff sein wird , dem Mann das Buch zu geben,');
    });

    test('the outermost modal is finite and last, behind the infinitives', () => {
      expect(relativeOn(MANN, { headRole: 'subject', verbPhrase: vp(LESEN, { modals: [modal(KOENNEN)] }), directObject: el(np(BUCH)) }))
        .toBe(', der das Buch lesen kann,');
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN, { modals: [modal(WOLLEN), modal(KOENNEN)] }) }))
        .toBe(', der essen können will,');
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN, { aspect: 'resultative', modals: [modal(MUESSEN)] }) }))
        .toBe(', der gegessen haben muss,');
    });

    test('over a double infinitive the future auxiliary leads the infinitives', () => {
      expect(relativeOn(MANN, { headRole: 'subject', verbPhrase: vp(LESEN, { tense: 'future', modals: [modal(KOENNEN)] }), directObject: el(np(BUCH)) }))
        .toBe(', der das Buch wird lesen können,');
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN, { tense: 'future', modals: [modal(WOLLEN), modal(KOENNEN)] }) }))
        .toBe(', der wird essen können wollen,');
    });

    // A127: an object pronoun leads even "gerade", and opens the prospective's zu-infinitive group.
    test('an object pronoun leads the progressive adverbial and the prospective group', () => {
      const him = el(np(ER));
      expect(relativeOn(MANN, { headRole: 'subject', verbPhrase: vp(LESEN, { aspect: 'progressive' }), directObject: him }))
        .toBe(', der ihn gerade liest,');
      // The frequency adverb leaves the group for the slot ahead of "im Begriff" (A146); the pronoun
      // still opens what is left of it.
      expect(relativeOn(MANN, { headRole: 'subject', verbPhrase: vp(LESEN, { aspect: 'prospective', modifier: concept(IMMER) }), directObject: him }))
        .toBe(', der immer im Begriff ist , ihn zu lesen,');
      expect(relativeOn(MANN, { headRole: 'subject', verbPhrase: vp(LESEN, { modifier: concept(IMMER), negative: true }), directObject: him }))
        .toBe(', der ihn nicht immer liest,');
    });

    test('adverbs follow the objects, a modal’s before the main verb’s', () => {
      expect(relativeOn(MANN, {
        headRole: 'subject',
        verbPhrase: vp(LESEN, { modifier: concept(SCHNELL), modals: [modal(WOLLEN, IMMER)] }),
        directObject: el(np(BUCH)),
      })).toBe(', der das Buch immer schnell lesen will,');
    });

    test('adverbs lead the other complements, so a predicate complement stays against the verb', () => {
      expect(relativeOn(MANN, {
        headRole: 'subject', verbPhrase: vp(LESEN, { modifier: concept(IMMER) }), directObject: el(np(BUCH)), complements: { locative: complement(np(HAUS)) },
      })).toBe(', der das Buch immer im Haus liest,');
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(WERDEN_VERB, { modifier: concept(IMMER) }), complements: { predicative: complement(np(MUEDE)) } }))
        .toBe(', der immer müde wird,');
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

    // A50: the main clause's rules, through the shared `finiteNegation`.
    test('a kein object is the negator, with no "nicht"', () => {
      const noMouse = el(np(MAUS, { definiteness: 'no' }));
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN, { negative: true }), directObject: noMouse })).toBe(', der keine Maus isst,');
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN, { negative: true, tense: 'future' }), directObject: noMouse }))
        .toBe(', der keine Maus essen wird,');
    });

    // A166: a relative that is not a subject relative renders its own subject, and that subject's
    // "kein" is this clause's negator, as in the main clause. A "kein" HEAD negates the matrix clause,
    // and a genitive relative's possessed phrase has lost its article, so neither counts.
    test('the clause\'s own kein subject takes the "nicht" and a kein phrase with it', () => {
      const noCat = el(np(KATER, { definiteness: 'no' }));
      expect(relativeOn(MAUS, { headRole: 'directObject', subject: noCat, verbPhrase: vp(ESSEN, { negative: true }) }))
        .toBe(', die kein Kater isst,');
      expect(relativeOn(HAUS, { headRole: 'locative', subject: noCat, verbPhrase: vp(ESSEN), directObject: el(np(MAUS, { definiteness: 'no' })) }))
        .toBe(', in dem kein Kater eine Maus isst,');
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN, { negative: true }) }, { definiteness: 'no' }))
        .toBe(', der nicht isst,');
      expect(relativeOn(JUNGE, { headRole: 'possessor', subject: noCat, verbPhrase: vp(ESSEN, { negative: true }) }))
        .toBe(', dessen Kater nicht isst,');
    });

    test('"nicht" leads an adverb, whoever it belongs to', () => {
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN, { negative: true, modifier: concept(IMMER) }) })).toBe(', der nicht immer isst,');
      expect(relativeOn(MANN, { headRole: 'subject', verbPhrase: vp(LESEN, { negative: true, modifier: concept(IMMER) }), directObject: el(np(BUCH)) }))
        .toBe(', der das Buch nicht immer liest,');
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN, { negative: true, modals: [modal(WOLLEN, IMMER)] }) }))
        .toBe(', der nicht immer essen will,');
    });

    test('"nicht" leads a predicate complement, behind an adverb', () => {
      const tired = { predicative: complement(np(MUEDE)) };
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(WERDEN_VERB, { negative: true }), complements: tired })).toBe(', der nicht müde wird,');
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(WERDEN_VERB, { negative: true, modifier: concept(IMMER) }), complements: tired }))
        .toBe(', der nicht immer müde wird,');
    });

    test('"nicht" leads the whole prospective, outside its zu-infinitive group', () => {
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN, { negative: true, aspect: 'prospective' }) }))
        .toBe(', der nicht im Begriff zu essen ist,');
      expect(relativeOn(MANN, { headRole: 'subject', verbPhrase: vp(LESEN, { negative: true, aspect: 'prospective' }), directObject: el(np(BUCH)) }))
        .toBe(', der nicht im Begriff ist , das Buch zu lesen,');
    });

    // A03: a denied word of the verb group spells its own "nicht" here too, through the shared
    // `finiteNegation` — the verb-final clause keeps them in the Mittelfeld, ahead of the cluster.
    test('each denied word of the verb group adds a "nicht", ahead of the verb-final cluster', () => {
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(GEHEN, { modals: [modal(WOLLEN)], governedNegative: true }) }))
        .toBe(', der nicht gehen will,');
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(GEHEN, { negative: true, modals: [modal(WOLLEN)], governedNegative: true }) }))
        .toBe(', der nicht nicht gehen will,');
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(GEHEN, { negative: true, modals: [modal(MUESSEN), { ...modal(KOENNEN), negative: true }] }) }))
        .toBe(', der nicht nicht gehen können muss,');
      expect(relativeOn(MANN, { headRole: 'subject', verbPhrase: vp(LESEN, { negative: true, modals: [modal(WOLLEN)], governedNegative: true }), directObject: el(np(BUCH)) }))
        .toBe(', der das Buch nicht nicht lesen will,');
      // A "kein" object outranks them all, as it outranks the finite "nicht" (A50).
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN, { modals: [modal(WOLLEN)], governedNegative: true }), directObject: el(np(MAUS, { definiteness: 'no' })) }))
        .toBe(', der keine Maus essen will,');
    });
  });

  // A51: a process-level instrument is a subordinate "indem" clause, split out as in the main clause.
  // B06: its subject is the relative clause's own, as a pronoun — the head's in a subject relative.
  describe('means clause', () => {
    const byChoosingAWord = {
      instrumental: complement(np(WORT, { definiteness: 'indefinite' }), [{ kind: 'abstraction', value: 'process' }], vp(WAEHLEN)),
    };

    test('the "indem" clause trails the finite verb', () => {
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN), complements: byChoosingAWord }))
        .toBe(', der isst , indem er ein Wort wählt,');
      expect(relativeOn(MANN, { headRole: 'subject', verbPhrase: vp(LESEN, { negative: true, aspect: 'resultative' }), directObject: el(np(BUCH)), complements: byChoosingAWord }))
        .toBe(', der das Buch nicht gelesen hat , indem er ein Wort wählt,');
      expect(relativeOn(BUCH, { headRole: 'directObject', subject: el(np(ICH)), verbPhrase: vp(LESEN), complements: byChoosingAWord }))
        .toBe(', das ich lese , indem ich ein Wort wähle,');
    });

    test('its pronoun agrees with whoever does the act: the head, the subject, or the passive agent', () => {
      expect(relativeOn(KATZE, { headRole: 'subject', verbPhrase: vp(ESSEN), complements: byChoosingAWord }))
        .toBe(', die isst , indem sie ein Wort wählt,');
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN), complements: byChoosingAWord }, { number: 'plural' }))
        .toBe(', die essen , indem sie ein Wort wählen,');
      expect(relativeOn(BUCH, { headRole: 'directObject', subject: el(np(MAN)), verbPhrase: vp(LESEN), complements: byChoosingAWord }))
        .toBe(', das man liest , indem man ein Wort wählt,');
    });

    test('…and a prospective’s extraposed zu-infinitive group', () => {
      expect(relativeOn(MANN, { headRole: 'subject', verbPhrase: vp(LESEN, { aspect: 'prospective' }), directObject: el(np(BUCH)), complements: byChoosingAWord }))
        .toBe(', der im Begriff ist , das Buch zu lesen , indem er ein Wort wählt,');
    });

    test('a concept-level instrument is a phrase, not a clause, and stays in the Mittelfeld', () => {
      const byTheChoosing = {
        instrumental: complement(np(WORT, { definiteness: 'indefinite' }), [{ kind: 'abstraction', value: 'concept' }], vp(WAEHLEN)),
      };
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN), complements: byTheChoosing }))
        .toBe(', der mit dem Wählen eines Wortes isst,');
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

    // A46: a predicate noun under the seeming verb closes on "zu sein", right before the finite verb.
    test('a predicate noun under the seeming verb takes "zu sein" before the verb', () => {
      const LEGENDE: Forms = { base: 'Legende', plural: 'Legenden', gender: 'fem', count: 'singular' };
      expect(relativeOn(KATER, {
        headRole: 'subject', verbPhrase: vp(SCHEINEN), complements: { predicative: complement(np(LEGENDE, { definiteness: 'indefinite' })) },
      })).toBe(', der eine Legende zu sein scheint,');
      expect(relativeOn(KATER, {
        headRole: 'subject', verbPhrase: vp(SCHEINEN), complements: { predicative: complement(np(MUEDE)) },
      })).toBe(', der müde scheint,');
    });

    // The cause's own shapes come from `causePhrase`; the clause only places them.
    test('a cause trails the direct object, ahead of the verb', () => {
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN), directObject: el(np(MAUS)), complements: { cause: complement(np(ICH)) } }))
        .toBe(', der die Maus meinetwegen isst,');
      expect(relativeOn(KATER, {
        headRole: 'subject', verbPhrase: vp(ESSEN, { aspect: 'resultative' }), directObject: el(np(MAUS)),
        complements: { cause: complement(np(MANN), [sentiment('negative')]) },
      })).toBe(', der die Maus durch die Schuld des Mannes gegessen hat,');
      expect(relativeOn(MAUS, {
        headRole: 'directObject', subject: el(np(KATER)), verbPhrase: vp(ESSEN), complements: { cause: complement(el(np(MANN), np(DU)), [sentiment('positive')]) },
      })).toBe(', die der Kater dank dem Mann und dir isst,');
    });

    test('a dative recipient and a means clause split out of the same complements', () => {
      expect(relativeOn(JUNGE, {
        headRole: 'subject', verbPhrase: vp(GEBEN), directObject: el(np(BUCH)),
        complements: {
          terminus: complement(np(MANN)),
          instrumental: complement(np(WORT, { definiteness: 'indefinite' }), [{ kind: 'abstraction', value: 'process' }], vp(WAEHLEN)),
        },
      })).toBe(', der dem Mann das Buch gibt , indem er ein Wort wählt,');
    });

    test('a relative clause nests inside another', () => {
      const walking = np(KATZE, {}, { relative: { headRole: 'subject', verbPhrase: vp(GEHEN) } });
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN), directObject: el(walking) }))
        .toBe(', der die Katze, die geht, isst,');
    });
  });

  describe('a lexeme missing a form', () => {
    test('an adverb with no base form adds nothing', () => {
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(ESSEN, { modifier: concept({}) }) })).toBe(', der isst,');
    });
  });

  describe('a head filling a complement', () => {
    test('takes the complement\'s preposition and the pronoun in its case', () => {
      expect(relativeOn(HAUS, { headRole: 'locative', subject: el(np(KATER)), verbPhrase: vp(ESSEN) })).toBe(', in dem der Kater isst,');
      expect(relativeOn(HAUS, { headRole: 'locative', subject: el(np(KATER)), verbPhrase: vp(ESSEN), headSpecifiers: [{ kind: 'path', value: 'under' }] }, { number: 'plural' }))
        .toBe(', unter denen der Kater isst,');
      expect(relativeOn(BEHAELTER, { headRole: 'terminus', subject: el(np(MANN)), verbPhrase: vp(GEBEN, {}, 'GIVE'), directObject: el(np(BUCH)) }))
        .toBe(', in den der Mann das Buch gibt,');
    });

    test('an animate recipient is the bare dative, and a negative cause the genitive ahead of "Schuld"', () => {
      expect(relativeOn(JUNGE, { headRole: 'terminus', subject: el(np(MANN)), verbPhrase: vp(GEBEN, {}, 'GIVE'), directObject: el(np(BUCH)) }))
        .toBe(', dem der Mann das Buch gibt,');
      expect(relativeOn(KATZE, { headRole: 'cause', subject: el(np(MANN)), verbPhrase: vp(ESSEN), headSpecifiers: [{ kind: 'sentiment', value: 'negative' }] }))
        .toBe(', durch deren Schuld der Mann isst,');
    });

    // Only a definite article fuses with its preposition ("zum", "im"); the relative pronoun never does.
    test('the other complements\' prepositions stay apart from the pronoun', () => {
      expect(relativeOn(MESSER, { headRole: 'instrumental', subject: el(np(MANN)), verbPhrase: vp(SCHNEIDEN) })).toBe(', mit dem der Mann schneidet,');
      expect(relativeOn(MESSER, { headRole: 'instrumental', subject: el(np(MANN)), verbPhrase: vp(SCHNEIDEN) }, { number: 'plural' }))
        .toBe(', mit denen der Mann schneidet,');
      expect(relativeOn(HAUS, { headRole: 'source', subject: el(np(KATER)), verbPhrase: vp(GEHEN) })).toBe(', aus dem der Kater geht,');
      expect(relativeOn(HAUS, { headRole: 'direction', subject: el(np(KATER)), verbPhrase: vp(GEHEN) })).toBe(', zu dem der Kater geht,');
    });

    test('a cause takes "wegen" with the genitive pronoun or "dank" with the dative, and blames through the genitive', () => {
      const cause = (forms: Forms, value: CauseSentiment, extra: Forms = {}) =>
        relativeOn(forms, { headRole: 'cause', subject: el(np(KATER)), verbPhrase: vp(ESSEN), headSpecifiers: [sentiment(value)] }, extra);
      expect(cause(MANN, 'neutral')).toBe(', wegen dessen der Kater isst,');
      expect(cause(KATZE, 'neutral')).toBe(', wegen deren der Kater isst,');
      expect(cause(MANN, 'positive', { number: 'plural' })).toBe(', dank denen der Kater isst,');
      expect(cause(MANN, 'negative')).toBe(', durch dessen Schuld der Kater isst,');
      expect(cause(MANN, 'negative', { number: 'plural' })).toBe(', durch deren Schuld der Kater isst,');
    });

    test('a predicate noun takes the nominative pronoun, with no preposition', () => {
      expect(relativeOn(JUNGE, { headRole: 'predicative', subject: el(np(MANN)), verbPhrase: vp(WERDEN_VERB) })).toBe(', der der Mann wird,');
    });
  });

  // A139: CLICK's lexeme takes its object with "auf" + accusative.
  describe('an object a preposition leads (A139)', () => {
    const KLICKEN: Forms = { base: 'klicken', object_prep: 'auf', participle: 'geklickt', '3sg_present': 'klickt' };

    test('a head gapped as that object takes the preposition before its pronoun', () => {
      expect(relativeOn(BUCH, { headRole: 'directObject', subject: el(np(KATER)), verbPhrase: vp(KLICKEN) })).toBe(', auf das der Kater klickt,');
    });

    test('a relative keeping the object leads it with the preposition, after nicht', () => {
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(KLICKEN, { negative: true }), directObject: el(np(HAUS)) }))
        .toBe(', der nicht auf das Haus klickt,');
    });
  });

  // A138: a relative clause is verb-final, so a separable verb's particle rejoins its finite verb.
  test('a separable verb closes the relative whole', () => {
    expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(HINZUFUEGEN), directObject: el(np(MAUS)) })).toBe(', der die Maus hinzufügt,');
    expect(relativeOn(MAUS, { headRole: 'directObject', subject: el(np(KATER)), verbPhrase: vp(HINZUFUEGEN, { negative: true }) })).toBe(', die der Kater nicht hinzufügt,');
    expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(HINZUFUEGEN, { aspect: 'prospective' }) })).toBe(', der im Begriff hinzuzufügen ist,');
  });

  // C17: the reflexive pronoun leads the verb-final clause's Mittelfeld, agreeing with the head.
  describe('a reflexive verb', () => {
    test('the pronoun follows the relative pronoun and leads nicht and the adverb', () => {
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(BEWEGEN) })).toBe(', der sich bewegt,');
      expect(relativeOn(KATER, { headRole: 'subject', verbPhrase: vp(BEWEGEN, { negative: true, modifier: concept(SCHNELL) }) }))
        .toBe(', der sich nicht schnell bewegt,');
      expect(relativeOn(KATZE, { headRole: 'subject', verbPhrase: vp(BEWEGEN, { aspect: 'resultative' }) }, { number: 'plural' }))
        .toBe(', die sich bewegt haben,');
    });
  });
});
