import { describe, expect, test } from 'vitest';
import type { ContentClause, LanguageCode, PhrasePlan, ReadyLanguageCode, SubordinatingConjunction, VerbPhrase } from '@signi/shared';
import { np, say, sayAll } from './harness.js';

// Localization C41: the similative *as* — a subordinating conjunction (as / come / comme / wie / como
// / como / 〜ように) whose clause says what the main one is like — and the adverbial clause said alone,
// the gloss OF_COURSE ships on ("as one expects"). The clause is asserted, so it keeps the indicative
// in every language, on its own tense; it follows the main clause in the six European languages
// (German behind a comma, verb-final) and precedes the predicate in Japanese, as every adverbial
// clause does (P09-E4). French resumes the object a likeness gaps with the clitic the verb's lexeme
// names: EXPECT is *s'attendre à* there, "comme on s'y attend".

const the = (concept: string) => np(concept, { definiteness: 'definite' });
const one = (verbPhrase: Partial<VerbPhrase> = {}, subject = np('GENERIC_PERSON')): ContentClause =>
  ({ subject, verbPhrase: { verb: 'EXPECT', ...verbPhrase } });
const runs = (clause: ContentClause, verbPhrase: Partial<VerbPhrase> = {}): PhrasePlan => ({
  subject: the('CAT'),
  verbPhrase: { verb: 'RUN', ...verbPhrase },
  adverbialClause: { conjunction: 'as', clause },
});
const alone = (clause: ContentClause, conjunction: SubordinatingConjunction = 'as'): PhrasePlan => ({
  subject: np('THING'),
  adverbialGloss: true,
  adverbialClause: { conjunction, clause },
});

describe('the similative clause in a sentence', () => {
  test('the cat runs as the dog runs', () => {
    expect(sayAll(runs({ subject: the('DOG'), verbPhrase: { verb: 'RUN' } }))).toEqual({
      en: 'the cat runs as the dog runs.', it: 'il gatto corre come il cane corre.', fr: 'le chat court comme le chien court.',
      de: 'der Kater läuft, wie der Hund läuft.', es: 'el gato corre como el perro corre.', ja: '猫は犬が走るように走ります。',
      pt: 'o gato corre como o cão corre.',
    });
  });

  // Asserted, so on its own tense and never the subjunctive: Japanese ように follows the plain past.
  test('the clause keeps its own tense, in the indicative', () => {
    expect(sayAll(runs({ subject: the('DOG'), verbPhrase: { verb: 'RUN', tense: 'past' } }, { tense: 'past' }))).toEqual({
      en: 'the cat ran as the dog ran.', it: 'il gatto corse come il cane corse.', fr: 'le chat courut comme le chien courut.',
      de: 'der Kater lief, wie der Hund lief.', es: 'el gato corrió como el perro corrió.', ja: '猫は犬が走ったように走りました。',
      pt: 'o gato correu como o cão correu.',
    });
    expect(sayAll(runs(one({ tense: 'past' })))).toEqual({
      en: 'the cat runs as one expected.', it: 'il gatto corre come si prevedeva.', fr: "le chat court comme on s'y attendait.",
      de: 'der Kater läuft, wie man erwartete.', es: 'el gato corre como se esperaba.', ja: '猫は予想したように走ります。',
      pt: 'o gato corre como se esperava.',
    });
  });

  // The clause follows everything the main clause holds; German's closes on its verb.
  test('behind an object, verb-final in German, ahead of the predicate in Japanese', () => {
    expect(sayAll({
      subject: the('CAT'), verbPhrase: { verb: 'EAT' }, directObject: the('FOOD'),
      adverbialClause: { conjunction: 'as', clause: { subject: the('DOG'), verbPhrase: { verb: 'EAT' } } },
    })).toEqual({
      en: 'the cat eats the food as the dog eats.', it: 'il gatto mangia il cibo come il cane mangia.',
      fr: 'le chat mange la nourriture comme le chien mange.', de: 'der Kater frisst das Essen, wie der Hund frisst.',
      es: 'el gato come la comida como el perro come.', ja: '猫は犬が食べるように食べ物を食べます。',
      pt: 'o gato come a comida como o cão come.',
    });
  });

  test('the cat runs as one expects, and as one does not', () => {
    expect(sayAll(runs(one()))).toEqual({
      en: 'the cat runs as one expects.', it: 'il gatto corre come si prevede.', fr: "le chat court comme on s'y attend.",
      de: 'der Kater läuft, wie man erwartet.', es: 'el gato corre como se espera.', ja: '猫は予想するように走ります。',
      pt: 'o gato corre como se espera.',
    });
    expect(sayAll(runs(one({ negative: true })))).toEqual({
      en: 'the cat runs as one does not expect.', it: 'il gatto corre come non si prevede.', fr: "le chat court comme on ne s'y attend pas.",
      de: 'der Kater läuft, wie man nicht erwartet.', es: 'el gato corre como no se espera.', ja: '猫は予想しないように走ります。',
      pt: 'o gato corre como não se espera.',
    });
  });
});

// "As one expects" says *expects it*, the main clause. French does not leave the gap: "comme on
// attend" is "as one waits". EXPECT's lexeme names the pronominal s'attendre à and its "y"
// (`as_clitic`, `as_pronominal`), and the clitic takes every place an object clitic takes.
describe('French: the gap resumed by the clitic the verb names', () => {
  test.each<[string, ContentClause, string]>([
    ['the reflexive agrees with the subject', one({}, np('FIRST_PERSON')), "le chat court comme je m'y attends."],
    ['inside the negation', one({ negative: true }, np('FIRST_PERSON')), "le chat court comme je ne m'y attends pas."],
    ['a pronominal verb takes être in the compound past', one({ aspect: 'resultative' }), "le chat court comme on s'y est attendu."],
    ['and its participle agrees with the subject', one({ aspect: 'resultative' }, np('FIRST_PERSON', { number: 'plural' })),
      'le chat court comme nous nous y sommes attendus.'],
    ['before the infinitive a modal governs', one({ modals: ['MUST'] }), "le chat court comme on doit s'y attendre."],
    ['inside the periphrasis', one({ aspect: 'progressive' }), "le chat court comme on est en train de s'y attendre."],
  ])('%s', (_, clause, rendered) => {
    expect(say(runs(clause), 'fr')).toBe(rendered);
  });

  // A clause with an object of its own gaps nothing, a verb whose lexeme names no clitic has none to
  // write, and a conjunction other than *as* is no likeness.
  test('only an as clause with no object, on a verb that names one', () => {
    expect(say(runs({ subject: the('DOG'), verbPhrase: { verb: 'EXPECT' }, directObject: the('FOOD') }), 'fr'))
      .toBe('le chat court comme le chien attend la nourriture.');
    expect(say(runs({ subject: the('DOG'), verbPhrase: { verb: 'RUN' } }), 'fr')).toBe('le chat court comme le chien court.');
    expect(say({ ...runs(one()), adverbialClause: { conjunction: 'when', clause: one() } }, 'fr')).toBe('le chat court quand on attend.');
  });
});

describe('the adverbial clause said alone', () => {
  // OF_COURSE's gloss: the clause as it follows a verb, and nothing of the throwaway subject.
  test('as one expects', () => {
    expect(sayAll(alone(one()))).toEqual({
      en: 'as one expects.', it: 'come si prevede.', fr: "comme on s'y attend.", de: 'wie man erwartet.',
      es: 'como se espera.', ja: '予想するように。', pt: 'como se espera.',
    });
  });

  // The fragment is exactly what the sentence says after its verb (before it, in Japanese).
  test('is what the clause renders in a sentence', () => {
    const fragment = sayAll(alone(one()));
    const sentence = sayAll(runs(one()));
    for (const language of Object.keys(fragment) as ReadyLanguageCode[]) {
      const bare = fragment[language].replace(/[.。]$/, '');
      expect(sentence[language], language).toContain(bare);
    }
  });

  // The construct is the conjunction's, not the similative's.
  test('any conjunction', () => {
    expect(sayAll(alone({ subject: the('CAT'), verbPhrase: { verb: 'EAT' } }, 'when'))).toEqual({
      en: 'when the cat eats.', it: 'quando il gatto mangia.', fr: 'quand le chat mange.', de: 'wenn der Kater frisst.',
      es: 'cuando el gato come.', ja: '猫が食べる時に。', pt: 'quando o gato come.',
    });
  });

  // Without the flag a verbless period drops its adverbial clause, as it drops every clause that
  // hangs off a predicate; with a verb phrase the flag is ignored.
  test('only when the plan asks, and only without a verb', () => {
    const { adverbialGloss: _, ...unflagged } = alone(one());
    expect(sayAll(unflagged)).toEqual({
      en: 'the thing.', it: 'la cosa.', fr: 'la chose.', de: 'das Ding.', es: 'la cosa.', ja: 'もの。', pt: 'a coisa.',
    });
    expect(sayAll({ ...runs(one()), adverbialGloss: true })).toEqual(sayAll(runs(one())));
  });
});
