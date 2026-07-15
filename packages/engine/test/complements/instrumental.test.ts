import { describe, expect, test } from 'vitest';
import type { AbstractionLevel } from '@signi/shared';
import { clause, np, sayAll } from '../harness.js';

// What the action was done with. The instrumental is the one complement with an abstraction
// gradient: the same instrument can be presented as a thing, as an action, or as an action
// nominalised. The two action levels render the verb non-finitely and take `Complement.action`.
//
// Thirteen verbs license it. The direct object is left off throughout: it is not what these are
// about, and dropping it keeps the instrument next to the verb where it can be read.
const INSTRUMENTAL_VERBS = [
  'CUT', 'EAT', 'DRINK', 'SEE', 'KILL', 'READ', 'BEAT',
  'SET_ON_FIRE', 'EXTINGUISH', 'MAKE', 'COMPACT', 'EXPAND', 'START',
];

const withStick = (verb: string, level: AbstractionLevel) =>
  sayAll(clause(np('CAT'), verb, {
    complements: {
      instrumental: {
        phrase: np('STICK'),
        specifiers: [{ kind: 'abstraction', value: level }],
        // `object` is the reified level: the noun phrase stands alone, so there is no action.
        ...(level === 'object' ? {} : { action: { verb: 'CHOOSE' } }),
      },
    },
  }));

describe('instrumental', () => {
  test('object — the instrument is a thing', () => {
    expect(withStick('CUT', 'object')).toEqual({
      en: 'the cat cuts with the stick.',
      it: 'il gatto taglia con il bastone.',
      fr: 'le chat coupe avec le bâton.',
      es: 'el gato corta con el palo.',
      pt: 'o gato corta com o pau.',
      de: 'der Kater schneidet mit dem Stock.', // mit governs the dative
      ja: '猫は棒で切ります。', // the instrumental particle で
    });
  });

  test('process — the instrument is an action, rendered non-finitely', () => {
    expect(withStick('CUT', 'process')).toEqual({
      en: 'the cat cuts by choosing the stick.',
      it: 'il gatto taglia scegliendo il bastone.', // gerund
      fr: 'le chat coupe en choisissant le bâton.', // en + participle
      es: 'el gato corta eligiendo el palo.',
      pt: 'o gato corta escolhendo o pau.',
      // German has no gerund, so it parts ways completely: a subordinate means clause, verb-final,
      // in the Nachfeld — and its noun is a plain direct object, hence ACCUSATIVE ("den Stock"),
      // not the dative that "mit" would have given it.
      de: 'der Kater schneidet, indem man den Stock wählt.',
      ja: '猫は棒を選んで切ります。', // te-form
    });
  });

  test('concept — the action nominalised', () => {
    expect(withStick('CUT', 'concept')).toEqual({
      en: 'the cat cuts with the choosing of the stick.',
      it: 'il gatto taglia con lo scegliere il bastone.',
      fr: 'le chat coupe avec le fait de choisir le bâton.',
      es: 'el gato corta con el elegir el palo.',
      pt: 'o gato corta com o escolher o pau.',
      // Back to a phrase, so back to the dative "mit" — and the nominalised verb takes a genitive.
      de: 'der Kater schneidet mit dem Wählen des Stockes.',
      ja: '猫は棒を選ぶことで切ります。', // ことで
    });
  });
});

// The marking is a property of the COMPLEMENT, not of the verb: every licensing verb takes its
// instrument the same way, and only the verb itself changes. These are the invariants that would
// break if a verb ever grew a special-cased instrumental.
describe('instrumental: every licensing verb', () => {
  test.each(INSTRUMENTAL_VERBS)('%s takes an object-level instrument the same way', (verb) => {
    const said = withStick(verb, 'object');

    expect(said.en).toMatch(/ with the stick\.$/);
    expect(said.it).toMatch(/ con il bastone\.$/);
    expect(said.fr).toMatch(/ avec le bâton\.$/);
    expect(said.es).toMatch(/ con el palo\.$/);
    expect(said.pt).toMatch(/ com o pau\.$/);
    // \S rather than \w: the German verbs here carry umlauts (tötet, schlägt, löscht), and \w
    // is ASCII-only.
    expect(said.de).toMatch(/^der Kater \S+ mit dem Stock\.$/);
    expect(said.ja).toMatch(/^猫は棒で.+ます。$/);
  });

  test.each(INSTRUMENTAL_VERBS)('%s takes a process-level instrument the same way', (verb) => {
    const said = withStick(verb, 'process');

    expect(said.en).toMatch(/ by choosing the stick\.$/);
    expect(said.it).toMatch(/ scegliendo il bastone\.$/);
    expect(said.fr).toMatch(/ en choisissant le bâton\.$/);
    expect(said.es).toMatch(/ eligiendo el palo\.$/);
    // The means clause is clause-final in German, after the verb material.
    expect(said.de).toMatch(/^der Kater \S+, indem man den Stock wählt\.$/);
    // The te-form links the instrument's verb to the main one.
    expect(said.ja).toMatch(/^猫は棒を選んで.+ます。$/);
  });
});

// A few of the thirteen in full, chosen because their lexemes are the awkward ones.
describe('instrumental: the verbs that are not one word', () => {
  test('EXTINGUISH is a phrasal verb in English', () => {
    expect(withStick('EXTINGUISH', 'object')).toMatchObject({
      en: 'the cat puts out with the stick.',
      it: 'il gatto spegne con il bastone.',
      de: 'der Kater löscht mit dem Stock.',
      ja: '猫は棒で消します。',
    });
  });

  test('SET_ON_FIRE is the causative of BURN', () => {
    expect(withStick('SET_ON_FIRE', 'object')).toMatchObject({
      en: 'the cat burns with the stick.',
      es: 'el gato quema con el palo.',
      de: 'der Kater verbrennt mit dem Stock.', // the ver- prefix marks the causative
      ja: '猫は棒で燃やします。',
    });
  });

  test('the app\'s own vocabulary licenses it too', () => {
    // COMPACT / EXPAND / START are the verbs behind Signi's own canvas controls.
    expect(withStick('COMPACT', 'object')).toMatchObject({
      en: 'the cat compacts with the stick.',
      de: 'der Kater verdichtet mit dem Stock.',
      ja: '猫は棒で圧縮します。',
    });
    expect(withStick('EXPAND', 'process')).toMatchObject({
      en: 'the cat expands by choosing the stick.',
      it: 'il gatto espande scegliendo il bastone.',
    });
  });
});

// Complement.action is a full verb phrase, but only its verb and its ADVERB are read (an instrument
// has no tense/mood of its own — it takes them from the clause). The adverb attaches to the
// non-finite action — the gerund / te-form / indem-clause — not to the matrix verb.
describe('instrumental: an adverb on the action', () => {
  const cutChoosing = (level: 'process' | 'concept', adverb: string) =>
    sayAll(clause(np('CAT'), 'CUT', {
      complements: {
        instrumental: {
          phrase: np('STICK'),
          specifiers: [{ kind: 'abstraction', value: level }],
          action: { verb: 'CHOOSE', modifier: adverb },
        },
      },
    }));

  test('a manner adverb attaches to the process-level gerund', () => {
    expect(cutChoosing('process', 'WELL')).toEqual({
      en: 'the cat cuts by choosing the stick well.',
      it: 'il gatto taglia scegliendo il bastone bene.',
      fr: 'le chat coupe en choisissant le bâton bien.',
      es: 'el gato corta eligiendo el palo bien.',
      pt: 'o gato corta escolhendo o pau bem.',
      // German drops it into the indem-clause, preverbally (the clause is verb-final): "gut wählt".
      de: 'der Kater schneidet, indem man den Stock gut wählt.',
      ja: '猫は棒をよく選んで切ります。', // よく attaches to the te-form action
    });
  });

  test('a different adverb changes only the action', () => {
    expect(cutChoosing('process', 'FAST')).toMatchObject({
      en: 'the cat cuts by choosing the stick fast.',
      it: 'il gatto taglia scegliendo il bastone velocemente.',
      de: 'der Kater schneidet, indem man den Stock schnell wählt.',
      ja: '猫は棒を速く選んで切ります。',
    });
  });

  test('at the concept level German turns the adverb into an adjective on the nominalisation', () => {
    // A nominalised verb ("das Wählen") takes an ADJECTIVE, not an adverb: German declines "gut" →
    // "guten" inside the noun phrase ("mit dem guten Wählen"). The others keep it as an adverb.
    expect(cutChoosing('concept', 'WELL')).toMatchObject({
      en: 'the cat cuts with the choosing of the stick well.',
      it: 'il gatto taglia con lo scegliere il bastone bene.',
      de: 'der Kater schneidet mit dem guten Wählen des Stockes.',
      ja: '猫は棒をよく選ぶことで切ります。',
    });
  });

  test('the adverb is what adds the word — without it the action is bare', () => {
    const bare = sayAll(clause(np('CAT'), 'CUT', {
      complements: {
        instrumental: {
          phrase: np('STICK'),
          specifiers: [{ kind: 'abstraction', value: 'process' }],
          action: { verb: 'CHOOSE' },
        },
      },
    }));
    expect(bare.en).toBe('the cat cuts by choosing the stick.');
    expect(cutChoosing('process', 'WELL').en).not.toBe(bare.en);
  });
});

// DELIBERATE — do not "fix" without a product decision.
describe('documented simplifications: instrumental', () => {
  // German's means clause needs an overt subject (it cannot drop one the way a gerund does), and
  // de.ts fills it with the impersonal "man" — "indem MAN den Stock wählt", i.e. "by ONE choosing
  // the stick". But the instrument is wielded by the clause's own subject, so the agreeing form
  // is "indem ER den Stock wählt". As it stands the German quietly generalises an action the
  // other six attribute to the cat.
  test.fails('German should agree the means clause with the subject, not use impersonal "man"', () => {
    expect(withStick('CUT', 'process'))
      .toMatchObject({ de: 'der Kater schneidet, indem er den Stock wählt.' });
  });
});
