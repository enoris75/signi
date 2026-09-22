import { describe, expect, test } from 'vitest';
import type { CauseSentiment, Specifier } from '@signi/shared';
import {
  adj, BEWEGEN, BUCH, clause, complement, complements, concept, DU, el, ESSEN, type Forms, GEBEN, GEHEN, GESCHWINDIGKEIT, group, GROESSE, GROSS, HINZUFUEGEN,
  ER, GUT, HAUS, HOCH, ICH, IMMER, JUNGE, KATER, KATZE, KLEIN, KOENNEN, MAN, MANN, MAUS, MESSER, modal, MUEDE, MUESSEN, NIE, np, SCHNEIDEN,
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
// "indem man ein Messer wählt" — a process-level instrument. The subject is "man" throughout, and
// the means clause's subject is the clause's own (B06), so it is "man" here too.
const byChoosingAKnife = complements({
  instrumental: complement(np(MESSER, { definiteness: 'indefinite' }), [{ kind: 'abstraction', value: 'process' }], vp(WAEHLEN)),
});
const inTheHouse = complements({ locative: complement(np(HAUS)) });
const sentiment = (value: CauseSentiment): Specifier => ({ kind: 'sentiment', value });

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
    // A119: the command, the instruction and the infinitive share the declarative's negation gate.
    test('a kein object negates a command or an infinitive alone, and drops to ein under nie', () => {
      const noMouse = el(np(MAUS, { definiteness: 'no' }));
      expect(renderClause(clause(np(DU), vp(ESSEN, { mood: 'imperative', negative: true }), { directObject: noMouse }))).toBe('iss keine Maus');
      expect(renderClause(clause(np(DU), vp(ESSEN, { mood: 'imperative', modifier: concept(NIE) }), { directObject: noMouse }))).toBe('iss nie eine Maus');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { mood: 'infinitive', negative: true }), { directObject: noMouse }))).toBe('keine Maus essen');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { mood: 'infinitive', modifier: concept(NIE) }), { directObject: noMouse }))).toBe('nie eine Maus essen');
    });

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

    // A182: an indefinite nominal absorbs the "nicht" as "kein", in the object slot and in the
    // predicate one alike; the adverb keeps its own slot in front of it.
    test('an indefinite object or predicate nominal takes the nicht as kein', () => {
      const aMouse = el(np(MAUS, { definiteness: 'indefinite' }));
      expect(renderClause(clause(np(KATER), vp(ESSEN, { negative: true }), { directObject: aMouse }))).toBe('der Kater isst keine Maus');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { negative: true, modifier: concept(SCHNELL) }), { directObject: aMouse })))
        .toBe('der Kater isst schnell keine Maus');
      expect(renderClause(clause(np(KATER), vp(WERDEN_VERB, { negative: true }), { complements: aLegend }))).toBe('der Kater wird keine Legende');
    });

    // A191: a known object keeps the place it holds without the adverb — ahead of the whole "nicht"
    // + adverb group — and takes the dative recipient with it. A quantified object stays behind
    // them, where its scope is unchanged, and a pronoun leads from the pronoun slot as it always did.
    test('a known object leads nicht and the adverb; a quantified one and a pronoun do not move', () => {
      expect(renderClause(clause(np(KATER), vp(ESSEN, { negative: true, modifier: concept(SCHNELL) }), { directObject: mouse })))
        .toBe('der Kater isst die Maus nicht schnell');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { negative: true, modifier: concept(IMMER), aspect: 'resultative' }), { directObject: mouse })))
        .toBe('der Kater hat die Maus nicht immer gegessen');
      expect(renderClause(clause(np(MANN), vp(GEBEN, { negative: true, modifier: concept(IMMER) }), { directObject: el(np(BUCH)), complements: toTheBoy })))
        .toBe('der Mann gibt dem Jungen das Buch nicht immer');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { negative: true, modifier: concept(SCHNELL) }), { directObject: el(np(MAUS, { definiteness: 'some', number: 'plural' })) })))
        .toBe('der Kater isst nicht schnell einige Mäuse');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { negative: true, modifier: concept(SCHNELL) }), { directObject: el(np(ER)) })))
        .toBe('der Kater isst ihn nicht schnell');
    });

    test('nicht scopes over the whole prospective, ahead of im Begriff', () => {
      expect(renderClause(clause(np(KATER), vp(ESSEN, { negative: true, aspect: 'prospective' })))).toBe('der Kater ist nicht im Begriff zu essen');
      // A frequency adverb scopes over the prospective too, so it follows the "nicht" and both stand
      // ahead of "im Begriff" (A146).
      expect(renderClause(clause(np(KATER), vp(ESSEN, { negative: true, aspect: 'prospective', modifier: concept(IMMER) }), { directObject: mouse })))
        .toBe('der Kater ist nicht immer im Begriff , die Maus zu essen');
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
        .toBe('der Kater scheint keine Legende zu sein'); // A182: the negation is spelled into the nominal
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

    test('the other complements trail the object, ahead of the non-finite tail', () => {
      expect(renderClause(clause(np(KATER), vp(ESSEN), { directObject: mouse, complements: inTheHouse }))).toBe('der Kater isst die Maus im Haus');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { aspect: 'resultative' }), { directObject: mouse, complements: inTheHouse })))
        .toBe('der Kater hat die Maus im Haus gegessen');
      expect(renderClause(clause(np(MANN), vp(SCHNEIDEN, { modals: [modal(KOENNEN)] }), { directObject: el(np(BUCH)), complements: complements({ instrumental: complement(np(MESSER)) }) })))
        .toBe('der Mann kann das Buch mit dem Messer schneiden');
      // …while the dative recipient still leads the object.
      expect(renderClause(clause(np(MANN), vp(GEBEN), { directObject: el(np(BUCH)), complements: complements({ terminus: complement(np(JUNGE)), locative: complement(np(HAUS)) }) })))
        .toBe('der Mann gibt dem Jungen das Buch im Haus');
    });

    // The cause's own shapes come from `causePhrase`; the clause only places them.
    test('a cause trails the object like any other complement', () => {
      const eatsTheMouse = (cause: ReturnType<typeof complement>, extra: Parameters<typeof vp>[1] = {}) =>
        renderClause(clause(np(KATER), vp(ESSEN, extra), { directObject: mouse, complements: complements({ cause }) }));
      expect(eatsTheMouse(complement(np(ICH)))).toBe('der Kater isst die Maus meinetwegen');
      expect(eatsTheMouse(complement(el(np(MANN), np(DU)), [sentiment('positive')]))).toBe('der Kater isst die Maus dank dem Mann und dir');
      expect(eatsTheMouse(complement(np(MANN), [sentiment('negative')]), { aspect: 'resultative' }))
        .toBe('der Kater hat die Maus durch die Schuld des Mannes gegessen');
    });

    test('a concept-level instrument is a phrase in the Mittelfeld, not a trailing clause', () => {
      const byTheChoosingOfAKnife = complements({
        instrumental: complement(np(MESSER, { definiteness: 'indefinite' }), [{ kind: 'abstraction', value: 'concept' }], vp(WAEHLEN)),
      });
      expect(renderClause(clause(np(MAN), vp(SCHNEIDEN, { modals: [modal(KOENNEN)] }), { complements: byTheChoosingOfAKnife })))
        .toBe('man kann mit dem Wählen eines Messers schneiden');
    });

    test('a means clause trails the whole verb complex', () => {
      // Its leading comma is pulled onto the verb later, by `punctuate`.
      expect(renderClause(clause(np(MAN), vp(SCHNEIDEN, { modals: [modal(KOENNEN)] }), { complements: byChoosingAKnife })))
        .toBe('man kann schneiden , indem man ein Messer wählt');
      // …including the prospective's zu-infinitive group.
      expect(renderClause(clause(np(MAN), vp(SCHNEIDEN, { aspect: 'prospective' }), { directObject: mouse, complements: byChoosingAKnife })))
        .toBe('man ist im Begriff , die Maus zu schneiden , indem man ein Messer wählt');
    });

    test('a means clause trails the verb in inverted, verb-final and infinitive order too', () => {
      const canCut = clause(np(MAN), vp(SCHNEIDEN, { modals: [modal(KOENNEN)] }), { complements: byChoosingAKnife });
      expect(renderClause(canCut, true)).toBe('kann man schneiden , indem man ein Messer wählt');
      expect(renderClause(canCut, false, true)).toBe('man schneiden kann , indem man ein Messer wählt');
      expect(renderClause(clause(np(MAN), vp(SCHNEIDEN, { mood: 'infinitive' }), { directObject: mouse, complements: byChoosingAKnife })))
        .toBe('die Maus schneiden , indem man ein Messer wählt');
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

    // A210: a verb ahead of its subject agrees with an "or" group's first conjunct — the element's
    // `invertedAgreement` — while V2 and verb-final order keep the group's own agreement.
    test('inverted order reads the inverted agreement', () => {
      const katerOrKatze = { ...group('or', np(KATER, { number: 'plural' }), np(KATZE)), invertedAgreement: { number: 'plural', gender: 'masc' } };
      expect(renderClause(clause(katerOrKatze, vp(ESSEN)), true)).toBe('essen die Kater oder die Katze');
      expect(renderClause(clause(katerOrKatze, vp(ESSEN)))).toBe('die Kater oder die Katze isst');
      expect(renderClause(clause(katerOrKatze, vp(ESSEN, { mood: 'subjunctive' })), true, true)).toBe('die Kater oder die Katze essen würde');
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

    // A49: the command takes the declarative's slots, so "nicht" leads the adverb as well — behind a
    // definite object, which keeps the place it has without the adverb (A191).
    test('nicht leads an adverb, behind the object and ahead of a predicate complement', () => {
      expect(renderClause(clause(np(DU), command(ESSEN, { negative: true, modifier: concept(SCHNELL) })))).toBe('iss nicht schnell');
      expect(renderClause(clause(np(DU), command(ESSEN, { negative: true, modifier: concept(IMMER) }), { directObject: mouse })))
        .toBe('iss die Maus nicht immer');
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
        .toBe('die Maus nicht immer essen'); // A191: the definite object leads the group
      expect(renderClause(clause(np(KATER), infinitive(SEIN, { negative: true }), { complements: tired }))).toBe('nicht müde sein');
      expect(renderClause(clause(np(KATER), infinitive(WERDEN_VERB, { negative: true, modifier: concept(IMMER) }), { complements: tired })))
        .toBe('nicht immer müde werden');
    });
  });

  describe('a lexeme missing a form', () => {
    const noBase = concept({});

    test('an adverb with no base form adds nothing, in every mood', () => {
      expect(renderClause(clause(np(KATER), vp(ESSEN, { modifier: noBase })))).toBe('der Kater isst');
      expect(renderClause(clause(np(DU), vp(ESSEN, { mood: 'imperative', modifier: noBase })))).toBe('iss');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { mood: 'infinitive', modifier: noBase })))).toBe('essen');
    });

    test('a verb with no infinitive leaves the instruction its command form, and the infinitive nothing', () => {
      const STORED_ONLY: Forms = { '2sg_imperative': 'iss' };
      expect(renderClause(clause(np(DU), vp(STORED_ONLY, { mood: 'imperative', register: 'instruction' }), { directObject: mouse }))).toBe('die Maus iss');
      expect(renderClause(clause(np(KATER), vp(STORED_ONLY, { mood: 'infinitive' }), { directObject: mouse }))).toBe('die Maus');
    });
  });

  // A121: a bare copula that elides the subject complement before it leaves its pro-form.
  describe('an elided subject complement', () => {
    const tiredElided = { type: 'predicative' as const, complement: complement(np(MUEDE)) };
    const inTheHouse = { type: 'locative' as const, complement: complement(np(HAUS)) };

    test('a predicate leaves es in the object slot, ahead of nicht', () => {
      expect(renderClause(clause(np(KATER), vp(SEIN, { negative: true, elided: tiredElided })))).toBe('der Kater ist es nicht');
      expect(renderClause(clause(np(KATER), vp(SEIN, { elided: tiredElided })))).toBe('der Kater ist es');
      expect(renderClause(clause(np(KATER), vp(SEIN, { modals: [modal(MUESSEN)], negative: true, elided: tiredElided }))))
        .toBe('der Kater muss es nicht sein');
    });

    test('a place leaves da, which nicht leads as it leads a predicate', () => {
      expect(renderClause(clause(np(KATER), vp(SEIN, { negative: true, elided: inTheHouse })))).toBe('der Kater ist nicht da');
      expect(renderClause(clause(np(KATER), vp(SEIN, { modals: [modal(KOENNEN)], elided: inTheHouse })))).toBe('der Kater kann da sein');
    });

    test('a command and an instruction take the pro-form in the same slots', () => {
      expect(renderClause(clause(np(DU), vp(SEIN, { mood: 'imperative', negative: true, elided: tiredElided })))).toBe('sei es nicht');
      expect(renderClause(clause(np(DU), vp(SEIN, { mood: 'imperative', register: 'instruction', negative: true, elided: inTheHouse }))))
        .toBe('nicht da sein');
    });
  });

  // A127: an unstressed object pronoun leads the Mittelfeld, ahead of "gerade", "nicht" and the adverbs,
  // where a noun object follows them.
  describe('an object pronoun', () => {
    const him = el(np(ER));

    test('leads the adverb, nicht and gerade in V2 order', () => {
      expect(renderClause(clause(np(KATER), vp(ESSEN, { modifier: concept(IMMER) }), { directObject: him }))).toBe('der Kater isst ihn immer');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { modifier: concept(IMMER), negative: true }), { directObject: him })))
        .toBe('der Kater isst ihn nicht immer');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { aspect: 'progressive', negative: true }), { directObject: him })))
        .toBe('der Kater isst ihn gerade nicht');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { modals: [modal(WOLLEN, NIE)], modifier: concept(SCHNELL) }), { directObject: him })))
        .toBe('der Kater will ihn nie schnell essen');
    });

    test('leads a noun dative recipient', () => {
      expect(renderClause(clause(np(MANN), vp(GEBEN, { modifier: concept(IMMER) }), { directObject: el(np(ER, { gender: 'neut' })), complements: toTheBoy })))
        .toBe('der Mann gibt es immer dem Jungen');
    });

    test('opens the prospective\'s zu-infinitive group, behind "nicht im Begriff"', () => {
      expect(renderClause(clause(np(KATER), vp(ESSEN, { aspect: 'prospective', modifier: concept(SCHNELL), negative: true }), { directObject: him })))
        .toBe('der Kater ist nicht im Begriff , ihn schnell zu essen');
    });

    test('leads the Mittelfeld in inverted and verb-final order', () => {
      expect(renderClause(clause(np(KATER), vp(ESSEN, { modifier: concept(IMMER) }), { directObject: him }), true)).toBe('isst der Kater ihn immer');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { modifier: concept(IMMER), mood: 'conditional' }), { directObject: him }), false, true))
        .toBe('der Kater ihn immer essen würde');
    });

    test('leads the adverb in a command, an instruction and the infinitive', () => {
      expect(renderClause(clause(np(DU), vp(ESSEN, { mood: 'imperative', modifier: concept(IMMER), negative: true }), { directObject: him })))
        .toBe('iss ihn nicht immer');
      expect(renderClause(clause(np(DU), vp(ESSEN, { mood: 'imperative', register: 'instruction', modifier: concept(SCHNELL) }), { directObject: him })))
        .toBe('ihn schnell essen');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { mood: 'infinitive', modifier: concept(IMMER) }), { directObject: him }))).toBe('ihn immer essen');
    });

    test('the pro-form es of an elided predicate takes the same slot', () => {
      const tiredElided = { type: 'predicative' as const, complement: complement(np(MUEDE)) };
      expect(renderClause(clause(np(KATER), vp(SEIN, { modifier: concept(IMMER), negative: true, elided: tiredElided })))).toBe('der Kater ist es nicht immer');
    });

    test('regression: a noun object, or a coordination of pronouns, follows the adverb', () => {
      expect(renderClause(clause(np(KATER), vp(ESSEN, { modifier: concept(IMMER) }), { directObject: mouse }))).toBe('der Kater isst immer die Maus');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { aspect: 'progressive' }), { directObject: mouse }))).toBe('der Kater isst gerade die Maus');
      expect(renderClause(clause(np(KATER), vp(ESSEN, { modifier: concept(IMMER) }), { directObject: el(np(ER), np(ICH)) })))
        .toBe('der Kater isst immer ihn und mich');
    });
  });

  // A139: CLICK's lexeme takes its object with "auf" + accusative.
  describe('an object a preposition leads (A139)', () => {
    const KLICKEN: Forms = { base: 'klicken', object_prep: 'auf', participle: 'geklickt', '3sg_present': 'klickt', '2sg_imperative': 'klick' };

    test('the object is a prepositional phrase, which nicht leads', () => {
      expect(renderClause(clause(np(KATER), vp(KLICKEN), { directObject: el(np(BUCH)) }))).toBe('der Kater klickt auf das Buch');
      expect(renderClause(clause(np(KATER), vp(KLICKEN, { negative: true }), { directObject: el(np(BUCH)) }))).toBe('der Kater klickt nicht auf das Buch');
      expect(renderClause(clause(np(KATER), vp(KLICKEN, { aspect: 'resultative' }), { directObject: el(np(BUCH)), complements: inTheHouse })))
        .toBe('der Kater hat auf das Buch im Haus geklickt');
    });

    test('a pronoun is no unstressed object: it follows the preposition, and a neuter one is darauf', () => {
      expect(renderClause(clause(np(KATER), vp(KLICKEN, { modifier: concept(IMMER) }), { directObject: el(np(ER)) }))).toBe('der Kater klickt immer auf ihn');
      expect(renderClause(clause(np(KATER), vp(KLICKEN), { directObject: el(np(ER, { gender: 'neut' })) }))).toBe('der Kater klickt darauf');
    });

    test('the command, the instruction and the infinitive', () => {
      expect(renderClause(clause(np(DU), vp(KLICKEN, { mood: 'imperative', negative: true }), { directObject: el(np(BUCH)) }))).toBe('klick nicht auf das Buch');
      expect(renderClause(clause(np(DU), vp(KLICKEN, { mood: 'imperative', register: 'instruction' }), { directObject: el(np(BUCH)) }))).toBe('auf das Buch klicken');
      expect(renderClause(clause(np(MAN), vp(KLICKEN, { mood: 'infinitive' }), { directObject: el(np(BUCH)) }))).toBe('auf das Buch klicken');
    });
  });

  // A138: a separable verb leaves its particle last in a main clause and a command, and rejoins it in
  // verb-final order and the infinitive.
  describe('a separable verb (A138)', () => {
    test('the particle closes a V2 clause, after nicht and the objects', () => {
      expect(renderClause(clause(np(KATER), vp(HINZUFUEGEN), { directObject: mouse }))).toBe('der Kater fügt die Maus hinzu');
      expect(renderClause(clause(np(KATER), vp(HINZUFUEGEN, { negative: true, tense: 'past' }), { directObject: mouse }))).toBe('der Kater fügte die Maus nicht hinzu');
      expect(renderClause(clause(np(KATER), vp(HINZUFUEGEN), { directObject: el(np(ER)), complements: inTheHouse }))).toBe('der Kater fügt ihn im Haus hinzu');
      expect(renderClause(clause(np(KATER), vp(HINZUFUEGEN), { directObject: mouse }), true)).toBe('fügt der Kater die Maus hinzu');
    });

    test('the non-finite verb keeps it, and verb-final order joins it to the finite verb', () => {
      expect(renderClause(clause(np(KATER), vp(HINZUFUEGEN, { aspect: 'resultative' }), { directObject: mouse }))).toBe('der Kater hat die Maus hinzugefügt');
      expect(renderClause(clause(np(KATER), vp(HINZUFUEGEN, { modals: [modal(MUESSEN)] }), { directObject: mouse }))).toBe('der Kater muss die Maus hinzufügen');
      expect(renderClause(clause(np(KATER), vp(HINZUFUEGEN), { directObject: mouse }), false, true)).toBe('der Kater die Maus hinzufügt');
    });

    test('the command puts it last; the instruction and the infinitive keep it', () => {
      expect(renderClause(clause(np(DU), vp(HINZUFUEGEN, { mood: 'imperative', negative: true }), { directObject: mouse }))).toBe('füge die Maus nicht hinzu');
      expect(renderClause(clause(np(DU), vp(HINZUFUEGEN, { mood: 'imperative', register: 'instruction' }), { directObject: mouse }))).toBe('die Maus hinzufügen');
      expect(renderClause(clause(np(MAN), vp(HINZUFUEGEN, { mood: 'infinitive' }), { directObject: mouse }))).toBe('die Maus hinzufügen');
    });
  });

  // C17: a reflexive verb's pronoun agrees with the subject and leads the Mittelfeld's pronoun slot,
  // ahead of "gerade", "nicht" and the adverbs; the verb forms are the plain verb's.
  describe('a reflexive verb', () => {
    const move = (extra: Parameters<typeof vp>[1] = {}) => vp(BEWEGEN, extra);

    test('the pronoun follows the finite verb and leads nicht and the adverb', () => {
      expect(renderClause(clause(np(KATER), move()))).toBe('der Kater bewegt sich');
      expect(renderClause(clause(np(ICH), move({ negative: true })))).toBe('ich bewege mich nicht');
      expect(renderClause(clause(np(ICH, { number: 'plural' }), move({ modifier: concept(SCHNELL), tense: 'past' })))).toBe('wir bewegten uns schnell');
      expect(renderClause(clause(np(KATER), move({ aspect: 'progressive' })))).toBe('der Kater bewegt sich gerade');
    });

    test('the perfect takes haben, and the non-finite verb closes the clause', () => {
      expect(renderClause(clause(np(KATER), move({ aspect: 'resultative' })))).toBe('der Kater hat sich bewegt');
      expect(renderClause(clause(np(KATER), move({ tense: 'future', modifier: concept(SCHNELL) })))).toBe('der Kater wird sich schnell bewegen');
      expect(renderClause(clause(np(ICH), move({ modals: [modal(MUESSEN)] })))).toBe('ich muss mich bewegen');
    });

    // The group's comma is pulled onto "Begriff" later, by `punctuate`.
    test('the prospective keeps the pronoun in its zu-infinitive group', () => {
      expect(renderClause(clause(np(KATER), move({ aspect: 'prospective' })))).toBe('der Kater ist im Begriff , sich zu bewegen');
    });

    test('verb-final order keeps it after the subject', () => {
      expect(renderClause(clause(np(KATER), move({ mood: 'conditional' })), false, true)).toBe('der Kater sich bewegen würde');
    });

    test('a command takes the addressee\'s pronoun; the instruction and the citation take sich', () => {
      expect(renderClause(clause(np(DU), move({ mood: 'imperative' })))).toBe('beweg dich');
      expect(renderClause(clause(np(DU, { number: 'plural' }), move({ mood: 'imperative', negative: true })))).toBe('bewegt euch nicht');
      expect(renderClause(clause(np(ICH, { number: 'plural' }), move({ mood: 'imperative' })))).toBe('bewegen wir uns');
      expect(renderClause(clause(np(DU), move({ mood: 'imperative', register: 'instruction' })))).toBe('sich bewegen');
      expect(renderClause(clause(np(MAN), move({ mood: 'infinitive', modifier: concept(SCHNELL) })))).toBe('sich schnell bewegen');
    });
  });

  describe('infinitive complement', () => {
    const FAEHIG: Forms = { role: 'adjective', base: 'fähig' };
    const able = complements({ predicative: complement(np(FAEHIG)) });
    const eats = (subject = np(KATZE)) => clause(subject, vp(ESSEN, { mood: 'infinitive' }), { directObject: el(np(MAUS)) });

    test('is extraposed behind the clause as a zu-infinitive, after a comma', () => {
      expect(renderClause(clause(np(KATZE), vp(SEIN), { complements: able, infinitiveComplement: eats() })))
        .toBe('die Katze ist fähig, die Maus zu essen');
    });

    test('follows a citation, and nests', () => {
      const ableToEat = clause(np(MAN), vp(SEIN, { mood: 'infinitive' }), { complements: able, infinitiveComplement: eats(np(MAN)) });
      expect(renderClause(ableToEat)).toBe('fähig sein, die Maus zu essen');
      expect(renderClause(clause(np(MAN), vp(SEIN, { mood: 'infinitive' }), { complements: able, infinitiveComplement: ableToEat })))
        .toBe('fähig sein, fähig zu sein, die Maus zu essen');
    });

    test('the zu of a separable verb goes between its particle and its stem', () => {
      expect(renderClause(clause(np(MAN), vp(HINZUFUEGEN, { mood: 'infinitive' }), { directObject: el(np(MAUS)) }), false, false, true))
        .toBe('die Maus hinzuzufügen');
    });
  });
});
