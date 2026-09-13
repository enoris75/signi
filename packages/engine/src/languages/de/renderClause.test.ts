import { describe, expect, test } from 'vitest';
import {
  adj, BUCH, clause, complement, complements, concept, DU, el, ESSEN, type Forms, GEBEN, GEHEN, GESCHWINDIGKEIT, GROESSE, GROSS,
  GUT, HOCH, ICH, IMMER, JUNGE, KATER, KATZE, KLEIN, KOENNEN, MAN, MANN, MAUS, MESSER, modal, MUEDE, MUESSEN, NIE, np, SCHNEIDEN,
  SCHEINEN, SCHNELL, vp, WAEHLEN, WEISE, WERDEN_VERB, WOLLEN,
} from './de.fixtures.js';
import { renderClause } from './renderClause.js';

const SEIN: Forms = {
  base: 'sein', participle: 'gewesen', aux: 'be', copula: '1', '3sg_present': 'ist', '2pl_present': 'seid',
  '2sg_imperative': 'sei', '1pl_imperative': 'seien',
};
const ZEIGEN: Forms = { base: 'zeigen', participle: 'gezeigt', '3sg_present': 'zeigt', '2pl_present': 'zeigt' };

const mouse = el(np(MAUS));
const tired = complements({ predicative: complement(np(MUEDE)) });
const LEGENDE: Forms = { base: 'Legende', plural: 'Legenden', gender: 'fem', count: 'singular' };
const aLegend = complements({ predicative: complement(np(LEGENDE, { definiteness: 'indefinite' })) });
const toTheBoy = complements({ terminus: complement(np(JUNGE)) });
// "indem man ein Messer wählt" — a process-level instrument. The subject is "man" throughout, so
// the means clause's impersonal "man" (B06) is also the right German here.
const byChoosingAKnife = complements({
  instrumental: complement(np(MESSER, { definiteness: 'indefinite' }), [{ kind: 'abstraction', value: 'process' }], vp(WAEHLEN)),
});

describe('renderClause', () => {
  describe('verbless periods', () => {
    test('a bare noun phrase stands on its own, in the nominative', () => {
      expect(renderClause(clause(np(KATER, {}, { adjectives: [adj(KLEIN)] })))).toBe('der kleine Kater');
    });

    test('a dimension gloss is von + the dative', () => {
      const subject = np(GROESSE, { definiteness: 'bare' }, { adjectives: [adj(GROSS)], dimensionGloss: true });
      expect(renderClause(clause(subject))).toBe('von großer Größe');
    });

    test('a manner gloss takes the preposition and case of its manner relation', () => {
      const measure = np(GESCHWINDIGKEIT, { definiteness: 'bare' }, { adjectives: [adj(HOCH)], mannerGloss: true });
      const mode = np(WEISE, { definiteness: 'indefinite' }, { adjectives: [adj(GUT)], mannerGloss: true });
      expect(renderClause(clause(measure))).toBe('mit hoher Geschwindigkeit');
      expect(renderClause(clause(mode))).toBe('auf eine gute Weise');
    });
  });

  describe('declarative order', () => {
    test('subject, finite verb, object', () => {
      expect(renderClause(clause(np(KATER), vp(ESSEN), { directObject: mouse }))).toBe('der Kater isst die Maus');
    });

    test('the finite verb agrees with the subject slot', () => {
      expect(renderClause(clause(np(ICH), vp(ESSEN)))).toBe('ich esse');
      expect(renderClause(clause(np(KATER, { number: 'plural' }), vp(ESSEN)))).toBe('die Kater essen');
      expect(renderClause(clause(el(np(KATER), np(KATZE)), vp(ESSEN)))).toBe('der Kater und die Katze essen');
    });

    test('past is synthetic; future and conditional put the infinitive last', () => {
      expect(renderClause(clause(np(KATER), vp(ESSEN, { tense: 'past' }), { directObject: mouse }))).toBe('der Kater aß die Maus');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { tense: 'future' }), { directObject: mouse }))).toBe('der Kater wird die Maus essen');
      expect(renderClause(clause(np(MANN), vp(GEHEN, { mood: 'conditional' })))).toBe('der Mann würde gehen');
    });

    test('the resultative closes on the participle, with haben or sein by verb', () => {
      expect(renderClause(clause(np(KATER), vp(ESSEN, { aspect: 'resultative' }), { directObject: mouse }))).toBe('der Kater hat die Maus gegessen');
      expect(renderClause(clause(np(MANN), vp(GEHEN, { aspect: 'resultative' })))).toBe('der Mann ist gegangen');
    });

    test('the progressive is the adverb gerade, the prospective im Begriff … zu', () => {
      // German has no progressive form (C05).
      expect(renderClause(clause(np(KATER), vp(ESSEN, { aspect: 'progressive' })))).toBe('der Kater isst gerade');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { aspect: 'prospective' })))).toBe('der Kater ist im Begriff zu essen');
    });

    // A52: the prospective's zu-infinitive group stays whole, after "im Begriff" and any clause-final
    // "sein". Its leading comma is pulled onto the previous word later, by `punctuate`.
    test('the prospective keeps its zu-infinitive group together, after the verb cluster', () => {
      expect(renderClause(clause(np(KATER), vp(ESSEN, { aspect: 'prospective' }), { directObject: mouse })))
        .toBe('der Kater ist im Begriff , die Maus zu essen');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { aspect: 'prospective', tense: 'future' }), { directObject: mouse })))
        .toBe('der Kater wird im Begriff sein , die Maus zu essen');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { aspect: 'prospective', modals: [modal(MUESSEN)] })))).toBe('der Kater muss im Begriff sein zu essen');
      expect(renderClause(clause(np(MANN), vp(GEBEN, { aspect: 'prospective', modifier: concept(SCHNELL) }), { directObject: el(np(BUCH)), complements: toTheBoy })))
        .toBe('der Mann ist im Begriff , schnell dem Jungen das Buch zu geben');
    });

    test('a modal’s adverb stays with the modal, ahead of "im Begriff"', () => {
      expect(renderClause(clause(np(KATER), vp(ESSEN, { aspect: 'prospective', modals: [modal(MUESSEN, IMMER)] }), { directObject: mouse })))
        .toBe('der Kater muss immer im Begriff sein , die Maus zu essen');
    });

    test('a modal takes the V2 slot and the infinitives stack at the end', () => {
      expect(renderClause(clause(np(KATER), vp(ESSEN, { modals: [modal(KOENNEN)] }), { directObject: mouse }))).toBe('der Kater kann die Maus essen');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { tense: 'past', modals: [modal(MUESSEN)] })))).toBe('der Kater musste essen');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { modals: [modal(WOLLEN), modal(KOENNEN)] })))).toBe('der Kater will essen können');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { tense: 'future', modals: [modal(MUESSEN)] })))).toBe('der Kater wird essen müssen');
    });

    test('adverbs sit in the Mittelfeld, a modal’s ahead of the main verb’s', () => {
      expect(renderClause(clause(np(KATER), vp(ESSEN, { modifier: concept(SCHNELL) })))).toBe('der Kater isst schnell');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { modifier: concept(IMMER), modals: [modal(WOLLEN, NIE)] }))))
        .toBe('der Kater will nie immer essen');
    });
  });

  describe('negation', () => {
    test('nicht trails the objects, ahead of the non-finite tail', () => {
      expect(renderClause(clause(np(KATER), vp(ESSEN, { negative: true }), { directObject: mouse }))).toBe('der Kater isst die Maus nicht');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { negative: true, aspect: 'resultative' }), { directObject: mouse })))
        .toBe('der Kater hat die Maus nicht gegessen');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { negative: true, modals: [modal(KOENNEN)] })))).toBe('der Kater kann nicht essen');
    });

    test('nicht precedes a predicate complement', () => {
      expect(renderClause(clause(np(KATER), vp(WERDEN_VERB, { negative: true }), { complements: tired }))).toBe('der Kater wird nicht müde');
    });

    test('nicht leads a Mittelfeld adverb, whoever it belongs to', () => {
      expect(renderClause(clause(np(KATER), vp(ESSEN, { negative: true, modifier: concept(IMMER) })))).toBe('der Kater isst nicht immer');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { negative: true, modals: [modal(MUESSEN, IMMER)] }))))
        .toBe('der Kater muss nicht immer essen');
      expect(renderClause(clause(np(KATER), vp(WERDEN_VERB, { negative: true, modifier: concept(IMMER) }), { complements: tired })))
        .toBe('der Kater wird nicht immer müde');
    });

    test('a negative adverb on the verb or a modal is the negator, with no nicht', () => {
      expect(renderClause(clause(np(KATER), vp(ESSEN, { negative: true, modifier: concept(NIE) })))).toBe('der Kater isst nie');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { negative: true, modals: [modal(MUESSEN, NIE)] })))).toBe('der Kater muss nie essen');
    });

    test('a kein object negates the clause without nicht', () => {
      const noMouse = el(np(MAUS, { definiteness: 'no' }));
      expect(renderClause(clause(np(KATER), vp(ESSEN, { negative: true }), { directObject: noMouse }))).toBe('der Kater isst keine Maus');
      expect(renderClause(clause(np(KATER), vp(ESSEN), { directObject: noMouse }))).toBe('der Kater isst keine Maus');
    });

    test('under nie a kein object drops to the plain indefinite', () => {
      const noMouse = el(np(MAUS, { definiteness: 'no' }));
      expect(renderClause(clause(np(KATER), vp(ESSEN, { negative: true, modifier: concept(NIE) }), { directObject: noMouse })))
        .toBe('der Kater isst nie eine Maus');
    });

    test('nicht scopes over the whole prospective, ahead of im Begriff', () => {
      expect(renderClause(clause(np(KATER), vp(ESSEN, { negative: true, aspect: 'prospective' })))).toBe('der Kater ist nicht im Begriff zu essen');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { negative: true, aspect: 'prospective', modifier: concept(IMMER) }), { directObject: mouse })))
        .toBe('der Kater ist nicht im Begriff , immer die Maus zu essen');
    });
  });

  describe('complement order', () => {
    test('an animate dative recipient precedes the accusative object', () => {
      const gives = (negative: boolean) =>
        renderClause(clause(np(MANN), vp(GEBEN, { negative }), { directObject: el(np(BUCH)), complements: toTheBoy }));
      expect(gives(false)).toBe('der Mann gibt dem Jungen das Buch');
      expect(gives(true)).toBe('der Mann gibt dem Jungen das Buch nicht');
    });

    // A46: "zu sein" closes the complements, so it sits against the non-finite tail in every order.
    test('a predicate noun under the seeming verb takes "zu sein" before the verb cluster', () => {
      expect(renderClause(clause(np(KATER), vp(SCHEINEN), { complements: aLegend }))).toBe('der Kater scheint eine Legende zu sein');
      expect(renderClause(clause(np(KATER), vp(SCHEINEN, { negative: true }), { complements: aLegend })))
        .toBe('der Kater scheint nicht eine Legende zu sein');
      expect(renderClause(clause(np(KATER), vp(SCHEINEN, { tense: 'future' }), { complements: aLegend })))
        .toBe('der Kater wird eine Legende zu sein scheinen');
      expect(renderClause(clause(np(KATER), vp(SCHEINEN, { modals: [modal(KOENNEN)] }), { complements: aLegend })))
        .toBe('der Kater kann eine Legende zu sein scheinen');
      expect(renderClause(clause(np(KATER), vp(SCHEINEN, { mood: 'conditional' }), { complements: aLegend }), false, true))
        .toBe('der Kater eine Legende zu sein scheinen würde');
      expect(renderClause(clause(np(KATER), vp(SCHEINEN, { mood: 'infinitive' }), { complements: aLegend }))).toBe('eine Legende zu sein scheinen');
      expect(renderClause(clause(np(KATER), vp(WERDEN_VERB), { complements: aLegend }))).toBe('der Kater wird eine Legende');
      expect(renderClause(clause(np(KATER), vp(SCHEINEN), { complements: tired }))).toBe('der Kater scheint müde');
    });

    test('a means clause trails the whole verb complex', () => {
      // Its leading comma is pulled onto the verb later, by `punctuate`.
      expect(renderClause(clause(np(MAN), vp(SCHNEIDEN, { modals: [modal(KOENNEN)] }), { complements: byChoosingAKnife })))
        .toBe('man kann schneiden , indem man ein Messer wählt');
      // …including the prospective's zu-infinitive group.
      expect(renderClause(clause(np(MAN), vp(SCHNEIDEN, { aspect: 'prospective' }), { directObject: mouse, complements: byChoosingAKnife })))
        .toBe('man ist im Begriff , die Maus zu schneiden , indem man ein Messer wählt');
    });
  });

  describe('inverted and verb-final order', () => {
    test('inverted puts the finite verb ahead of the subject', () => {
      expect(renderClause(clause(np(KATER), vp(ESSEN), { directObject: mouse }), true)).toBe('isst der Kater die Maus');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { aspect: 'resultative' }), { directObject: mouse }), true))
        .toBe('hat der Kater die Maus gegessen');
    });

    test('verb-final closes on the finite verb, behind the non-finite tail', () => {
      expect(renderClause(clause(np(KATER), vp(ESSEN, { mood: 'subjunctive' }), { directObject: mouse }), false, true))
        .toBe('der Kater die Maus essen würde');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { negative: true, aspect: 'resultative' }), { directObject: mouse }), false, true))
        .toBe('der Kater die Maus nicht gegessen hat');
      expect(renderClause(clause(np(KATER), vp(WERDEN_VERB, { negative: true }), { complements: tired }), false, true))
        .toBe('der Kater nicht müde wird');
    });

    // A61: a double infinitive (a modal under würde) fronts the finite auxiliary.
    test('verb-final puts würde ahead of a double infinitive', () => {
      expect(renderClause(clause(np(KATER), vp(ESSEN, { mood: 'subjunctive', modals: [modal(MUESSEN)] }), { directObject: mouse }), false, true))
        .toBe('der Kater die Maus würde essen müssen');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { mood: 'subjunctive', negative: true, modals: [modal(KOENNEN)] })), false, true))
        .toBe('der Kater nicht würde essen können');
    });

    // A52: a bare zu-infinitive stays inside the bracket; a longer group is extraposed after the
    // finite verb. Inverted order is V2 and keeps the group after the verb cluster.
    test('the prospective closes on the finite verb, or extraposes a longer group after it', () => {
      expect(renderClause(clause(np(KATER), vp(ESSEN, { mood: 'subjunctive', aspect: 'prospective' })), false, true))
        .toBe('der Kater im Begriff zu essen sein würde');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { mood: 'subjunctive', aspect: 'prospective' }), { directObject: mouse }), false, true))
        .toBe('der Kater im Begriff sein würde , die Maus zu essen');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { mood: 'conditional', aspect: 'prospective' }), { directObject: mouse }), true))
        .toBe('würde der Kater im Begriff sein , die Maus zu essen');
    });

    test('verb-final overrides inverted', () => {
      const phrase = clause(np(KATER), vp(ESSEN, { modals: [modal(KOENNEN)] }));
      expect(renderClause(phrase, true, true)).toBe('der Kater essen kann');
    });

    test('both flags are inert on verbless and imperative clauses', () => {
      expect(renderClause(clause(np(KATER)), true)).toBe('der Kater');
      expect(renderClause(clause(np(DU), vp(ESSEN, { mood: 'imperative' }), { directObject: mouse }), true, true)).toBe('iss die Maus');
    });
  });

  describe('imperative', () => {
    const command = (verb: Forms, extra: Parameters<typeof vp>[1] = {}) => vp(verb, { mood: 'imperative', ...extra });

    test('a subjectless V1 command in the du, ihr or wir form', () => {
      expect(renderClause(clause(np(DU), command(ESSEN), { directObject: mouse }))).toBe('iss die Maus');
      expect(renderClause(clause(np(DU, { number: 'plural' }), command(ESSEN), { directObject: mouse }))).toBe('esst die Maus');
      expect(renderClause(clause(np(ICH, { number: 'plural' }), command(ESSEN), { directObject: mouse }))).toBe('essen wir die Maus');
    });

    test('the du form is derived from the infinitive unless the lexeme stores one', () => {
      expect(renderClause(clause(np(DU), command(GEHEN)))).toBe('geh');
      expect(renderClause(clause(np(DU), command(SCHNEIDEN)))).toBe('schneide');
      expect(renderClause(clause(np(DU), command(GEBEN), { directObject: el(np(BUCH)), complements: toTheBoy }))).toBe('gib dem Jungen das Buch');
      expect(renderClause(clause(np(DU), command(SEIN), { complements: tired }))).toBe('sei müde');
      expect(renderClause(clause(np(ICH, { number: 'plural' }), command(SEIN), { complements: tired }))).toBe('seien wir müde');
    });

    test('nicht trails the objects', () => {
      expect(renderClause(clause(np(DU), command(ESSEN, { negative: true }), { directObject: mouse }))).toBe('iss die Maus nicht');
    });

    test('nicht precedes a predicate complement', () => {
      expect(renderClause(clause(np(DU), command(SEIN, { negative: true }), { complements: tired }))).toBe('sei nicht müde');
      expect(renderClause(clause(np(DU, { number: 'plural' }), command(SEIN, { negative: true }), { complements: tired })))
        .toBe('seid nicht müde');
    });

    // A49: the command takes the declarative's slots, so "nicht" leads the adverb as well.
    test('nicht leads an adverb, ahead of the object and a predicate complement', () => {
      expect(renderClause(clause(np(DU), command(ESSEN, { negative: true, modifier: concept(SCHNELL) })))).toBe('iss nicht schnell');
      expect(renderClause(clause(np(DU), command(ESSEN, { negative: true, modifier: concept(IMMER) }), { directObject: mouse })))
        .toBe('iss nicht immer die Maus');
      expect(renderClause(clause(np(DU), command(SEIN, { negative: true, modifier: concept(IMMER) }), { complements: tired })))
        .toBe('sei nicht immer müde');
    });

    test('a negative adverb stands in for nicht', () => {
      expect(renderClause(clause(np(DU), command(ESSEN, { negative: true, modifier: concept(NIE) })))).toBe('iss nie');
    });

    test('the adverb and dative recipient follow the verb, ahead of the object', () => {
      expect(renderClause(clause(np(DU), command(ESSEN, { modifier: concept(SCHNELL) })))).toBe('iss schnell');
      expect(renderClause(clause(np(DU), command(ZEIGEN), { directObject: el(np(BUCH)), complements: toTheBoy })))
        .toBe('zeig dem Jungen das Buch');
    });

    test('the instruction register is the clause-final infinitive', () => {
      const instruction = (verb: Forms, extra: Parameters<typeof vp>[1] = {}) => command(verb, { register: 'instruction', ...extra });
      expect(renderClause(clause(np(DU), instruction(ESSEN), { directObject: mouse }))).toBe('die Maus essen');
      expect(renderClause(clause(np(DU), instruction(ESSEN, { negative: true }), { directObject: mouse }))).toBe('die Maus nicht essen');
      expect(renderClause(clause(np(DU), instruction(ESSEN, { modifier: concept(SCHNELL) })))).toBe('schnell essen');
      // A49: "nicht" leads the adverb and the predicate complement, not the infinitive.
      expect(renderClause(clause(np(DU), instruction(ESSEN, { negative: true, modifier: concept(IMMER) })))).toBe('nicht immer essen');
      expect(renderClause(clause(np(DU), instruction(SEIN, { negative: true }), { complements: tired }))).toBe('nicht müde sein');
      expect(renderClause(clause(np(DU), instruction(ZEIGEN), { directObject: el(np(BUCH)), complements: toTheBoy })))
        .toBe('dem Jungen das Buch zeigen');
      expect(renderClause(clause(np(DU), instruction(SCHNEIDEN), { complements: byChoosingAKnife })))
        .toBe('schneiden , indem man ein Messer wählt');
    });
  });

  describe('infinitive mood', () => {
    const infinitive = (verb: Forms, extra: Parameters<typeof vp>[1] = {}) => vp(verb, { mood: 'infinitive', ...extra });

    test('the subjectless infinitive closes the phrase, after its objects', () => {
      expect(renderClause(clause(np(KATER), infinitive(ESSEN), { directObject: mouse }))).toBe('die Maus essen');
      expect(renderClause(clause(np(KATER), infinitive(ESSEN, { modifier: concept(SCHNELL) })))).toBe('schnell essen');
      expect(renderClause(clause(np(KATER), infinitive(ZEIGEN), { directObject: el(np(BUCH)), complements: toTheBoy })))
        .toBe('dem Jungen das Buch zeigen');
    });

    test('nicht trails the objects, unless a negative adverb negates', () => {
      expect(renderClause(clause(np(KATER), infinitive(ESSEN, { negative: true }), { directObject: mouse }))).toBe('die Maus nicht essen');
      expect(renderClause(clause(np(KATER), infinitive(ESSEN, { negative: true, modifier: concept(NIE) })))).toBe('nie essen');
    });

    // A49: the infinitive takes the declarative's slots.
    test('nicht leads an adverb and a predicate complement', () => {
      expect(renderClause(clause(np(KATER), infinitive(ESSEN, { negative: true, modifier: concept(IMMER) }), { directObject: mouse })))
        .toBe('nicht immer die Maus essen');
      expect(renderClause(clause(np(KATER), infinitive(SEIN, { negative: true }), { complements: tired }))).toBe('nicht müde sein');
      expect(renderClause(clause(np(KATER), infinitive(WERDEN_VERB, { negative: true, modifier: concept(IMMER) }), { complements: tired })))
        .toBe('nicht immer müde werden');
    });
  });
});
