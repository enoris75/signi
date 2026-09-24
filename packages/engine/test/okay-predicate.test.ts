import { describe, expect, test } from 'vitest';
import type { PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { concepts } from '../../backend/src/concepts/index.js';

// P09-E31. *Okay*, the well-being predicate most languages say with a verb of their own: it *stare*,
// fr *aller*, de *gehen* with the one who fares in the dative, es / pt *estar*, ja 大丈夫 as a
// な-adjective, en BE. The plan is BE + OKAY everywhere; OKAY's lexeme names the verb as `copula`
// (BE's sense BE_FARING), which replaces BE (`lexicalCopula`), and German's lexeme names the
// experiencer frame too, whose dative leads the clause.

const okay = (subject = np('CAT'), verbPhrase: Partial<VerbPhrase> = {}): PhrasePlan =>
  clause(subject, 'BE', { verbPhrase, complements: { predicative: { phrase: np('OKAY') } } });

describe('okay, a predicate with a lexical copula (P09-E31)', () => {
  test('the cat is okay', () => {
    expect(sayAll(okay())).toEqual({
      en: 'the cat is okay.',
      it: 'il gatto sta bene.',
      fr: 'le chat va bien.',
      de: 'dem Kater geht es gut.',
      es: 'el gato está bien.',
      ja: '猫は大丈夫です。',
      pt: 'o gato está bem.',
    });
  });

  test('the past is the imperfect of a state', () => {
    expect(sayAll(okay(np('CAT'), { tense: 'past' }))).toEqual({
      en: 'the cat was okay.',
      it: 'il gatto stava bene.',
      fr: 'le chat allait bien.',
      de: 'dem Kater ging es gut.',
      es: 'el gato estaba bien.',
      ja: '猫は大丈夫でした。',
      pt: 'o gato estava bem.',
    });
  });

  test('negated, present and past', () => {
    expect(sayAll(okay(np('CAT'), { negative: true }))).toEqual({
      en: 'the cat is not okay.',
      it: 'il gatto non sta bene.',
      fr: 'le chat ne va pas bien.',
      de: 'dem Kater geht es nicht gut.',
      es: 'el gato no está bien.',
      ja: '猫は大丈夫ではありません。',
      pt: 'o gato não está bem.',
    });
    expect(sayAll(okay(np('CAT'), { tense: 'past', negative: true }))).toEqual({
      en: 'the cat was not okay.',
      it: 'il gatto non stava bene.',
      fr: "le chat n'allait pas bien.",
      de: 'dem Kater ging es nicht gut.',
      es: 'el gato no estaba bien.',
      ja: '猫は大丈夫ではありませんでした。',
      pt: 'o gato não estava bem.',
    });
  });

  test('the Romance word never agrees, and the verb agrees with the subject', () => {
    expect(sayAll(okay(np('CAT', { gender: 'fem', number: 'plural' })))).toEqual({
      en: 'the cats are okay.',
      it: 'le gatte stanno bene.',
      fr: 'les chattes vont bien.',
      de: 'den Katzen geht es gut.',
      es: 'las gatas están bien.',
      ja: '猫は大丈夫です。',
      pt: 'as gatas estão bem.',
    });
    expect(sayAll(okay(np('FIRST_PERSON')))).toEqual({
      en: 'I am okay.', it: 'sto bene.', fr: 'je vais bien.', de: 'mir geht es gut.',
      es: 'estoy bien.', ja: '私は大丈夫です。', pt: 'estou bem.',
    });
    expect(sayAll(okay(np('CAT'), { tense: 'future' }))).toMatchObject({
      it: 'il gatto starà bene.', fr: 'le chat ira bien.', de: 'dem Kater wird es gut gehen.', es: 'el gato estará bien.',
    });
  });

  test('a question keeps the dative after the verb, and a relative gaps it', () => {
    expect(sayAll({ ...okay(np('SECOND_PERSON')), interrogative: true })).toMatchObject({
      en: 'are you okay?', it: 'stai bene?', de: 'geht es dir gut?', es: '¿estás bien?', ja: 'あなたは大丈夫ですか？',
    });
    const relative = clause(np('CAT', { relative: {
      headRole: 'subject', verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np('OKAY') } },
    } }), 'RUN');
    expect(sayAll(relative)).toEqual({
      en: 'the cat that is okay runs.',
      it: 'il gatto che sta bene corre.',
      fr: 'le chat qui va bien court.',
      de: 'der Kater, dem es gut geht, läuft.',
      es: 'el gato que está bien corre.',
      ja: '大丈夫な猫は走ります。',
      pt: 'o gato que está bem corre.',
    });
  });

  test('the citation and a controlled infinitive speak no dative', () => {
    expect(sayAll({ ...okay(np('GENERIC_PERSON')), infinitive: true })).toEqual({
      en: 'to be okay.', it: 'stare bene.', fr: 'aller bien.', de: 'gut gehen.',
      es: 'estar bien.', ja: '大丈夫である。', pt: 'estar bem.',
    });
    expect(sayAll(clause(np('CAT'), 'DESIRE', {
      infinitiveComplement: { verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np('OKAY') } } },
    }))).toMatchObject({
      it: 'il gatto desidera stare bene.', fr: 'le chat désire aller bien.', es: 'el gato desea estar bien.',
    });
  });

  test('regression: another predicate keeps BE', () => {
    expect(sayAll(clause(np('CAT'), 'BE', { complements: { predicative: { phrase: np('HAPPY') } } }))).toMatchObject({
      it: 'il gatto è felice.', fr: 'le chat est heureux.', de: 'der Kater ist glücklich.', es: 'el gato está feliz.',
    });
    expect(sayAll(clause(np('CAT'), 'SEEM', { complements: { predicative: { phrase: np('OKAY') } } })).it).toBe('il gatto sembra bene.');
  });

  test('the subjunctive a conjunction governs takes the copula\'s irregular stem', () => {
    // BE_FARING is *stare* / *aller*, whose present subjunctive the stored present cannot derive
    // ("sti", "vonte"): it borrows STARE's and GO's (found landing P09-E27 beside E31).
    const before = (subject = np('CAT')): PhrasePlan => ({ ...clause(np('DOG'), 'RUN'), adverbialClause: { conjunction: 'before', clause: { subject, verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np('OKAY') } } } } });
    expect(sayAll(before())).toMatchObject({
      it: 'il cane corre prima che il gatto stia bene.', fr: 'le chien court avant que le chat aille bien.',
      es: 'el perro corre antes de que el gato esté bien.', pt: 'o cão corre antes que o gato esteja bem.',
    });
    expect(sayAll(before(np('CAT', { number: 'plural' })))).toMatchObject({
      it: 'il cane corre prima che i gatti stiano bene.', fr: 'le chien court avant que les chats aillent bien.',
    });
  });

  test('BE_FARING is a sense of BE, which no picker offers', () => {
    const faring = concepts.find((c) => c.id === 'BE_FARING');
    expect(faring?.senseOf).toBe('BE');
    expect(faring?.stative).toBe(true);
  });
});

// A316. German OKAY takes the experiencer frame: the one who fares is a dative and "es" the subject
// ("dem Kater geht es gut", "mir geht es gut"). GENERIC_PERSON's German word "man" has no dative, and
// the frame falls back to a nominative subject with no "es": "man geht gut", which is not German. The
// generic dative is "einem": "es geht einem gut". Spanish LIKE has the same gap on its dative frame:
// the generic experiencer is dropped ("el gato gusta."), where Spanish says "el gato le gusta a uno"
// (since A369, in the dative-first order: "a uno le gusta el gato").
describe('known bugs: a generic subject in a dative experiencer frame (A316)', () => {
  const okayFor = (verbPhrase: Partial<VerbPhrase> = {}) => sayAll(okay(np('GENERIC_PERSON'), verbPhrase));

  test('German OKAY, present', () => {
    expect(okayFor().de).toBe('es geht einem gut.');
  });

  test('German OKAY, negated', () => {
    expect(okayFor({ negative: true }).de).toBe('es geht einem nicht gut.');
  });

  test('German OKAY, past', () => {
    expect(okayFor({ tense: 'past' }).de).toBe('es ging einem gut.');
  });

  test('Spanish LIKE', () => {
    expect(sayAll(clause(np('GENERIC_PERSON'), 'LIKE', { directObject: np('CAT') })).es).toBe('a uno le gusta el gato.');
  });

  test('German keeps "es … einem" in a question, under a modal and in a content clause', () => {
    const G = np('GENERIC_PERSON');
    expect(sayAll({ ...okay(G), interrogative: true }).de).toBe('geht es einem gut?');
    expect(okayFor({ modals: ['MUST'] }).de).toBe('es muss einem gut gehen.');
    const { subject, verbPhrase, complements } = okay(G);
    expect(sayAll(clause(np('MAN'), 'SAY', { contentObject: { subject, verbPhrase: verbPhrase!, complements } })).de).toBe('der Mann sagt, dass es einem gut geht.');
  });

  test('Spanish keeps "le … a uno" negated, with a plural thing liked and in a relative clause; Italian still drops it', () => {
    const G = np('GENERIC_PERSON');
    expect(sayAll(clause(G, 'LIKE', { directObject: np('CAT'), verbPhrase: { negative: true } })))
      .toMatchObject({ es: 'a uno no le gusta el gato.', it: 'il gatto non piace.' });
    expect(sayAll(clause(G, 'LIKE', { directObject: np('CAT', { number: 'plural' }) })).es).toBe('a uno le gustan los gatos.');
    expect(sayAll(clause(np('CAT', { relative: { headRole: 'directObject', subject: G, verbPhrase: { verb: 'LIKE' } } }), 'RUN')).es)
      .toBe('el gato que le gusta a uno corre.');
  });

  test('the generic dative serves any dative slot: a recipient', () => {
    expect(sayAll(clause(np('CAT'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('GENERIC_PERSON') } } })))
      .toMatchObject({ de: 'der Kater gibt einem das Buch.', es: 'el gato da el libro a uno.' });
  });

  test('regression: the generic subject in the other languages, and a noun or pronoun experiencer in German', () => {
    expect(okayFor()).toMatchObject({
      en: 'one is okay.', it: 'si sta bene.', fr: 'on va bien.', es: 'se está bien.', pt: 'se está bem.',
    });
    expect(sayAll(okay(np('FIRST_PERSON'))).de).toBe('mir geht es gut.');
    expect(sayAll(okay(np('SOMEONE'))).de).toBe('jemandem geht es gut.');
  });
});

// Localization A33: OKAY's tooltip, DARK's negated HAVE in a headless relative on BEING — fine without
// *good*, *well* or BE_FARING, the copula its lexemes name.
describe("OKAY's definition", () => {
  test('that does not have problems, in all seven', () => {
    const okayConcept = concepts.find((c) => c.id === 'OKAY');
    expect(sayAll(okayConcept!.definition!)).toEqual({
      en: 'that does not have problems.',
      it: 'che non ha problemi.',
      fr: "qui n'a pas de problèmes.",
      de: 'das keine Probleme hat.',
      es: 'que no tiene problemas.',
      ja: '問題がない。',
      pt: 'que não tem problemas.',
    });
  });
});
