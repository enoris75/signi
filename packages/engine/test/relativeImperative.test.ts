import { describe, expect, test } from 'vitest';
import type { NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// A command's direct object is a noun phrase, so it can carry a relative clause: "eat the mouse
// that runs!". The imperative drops the subject and takes the command form of the MATRIX verb only;
// the relative clause is subordinate, so it keeps its ordinary indicative shape — Japanese in
// particular keeps the plain form inside the relative while the command outside stays ～てください.
const eatThe = (
  head: NounPhrase,
  plan: Partial<PhrasePlan> = {},
  addressee: NounPhrase = np('SECOND_PERSON'),
  verbPhrase: Partial<VerbPhrase> = {},
): PhrasePlan => ({
  ...clause(addressee, 'EAT', { directObject: head, verbPhrase }),
  imperative: true,
  ...plan,
});

const MOUSE_THAT_RUNS = np('MOUSE', { relative: { verbPhrase: { verb: 'RUN' } } });

describe('relative × imperative', () => {
  test('a command whose object carries a relative clause', () => {
    expect(sayAll(eatThe(MOUSE_THAT_RUNS))).toEqual({
      en: 'eat the mouse that runs.',
      it: 'mangia il topo che corre.',
      fr: 'mange la souris qui court.',
      es: 'come el ratón que corre.',
      pt: 'coma o rato que corre.', // Portuguese commands with the subjunctive (matrix only)
      de: 'iss die Maus, die läuft.',
      ja: '走るネズミを食べてください。', // plain 走る in the relative, polite request outside
    });
  });

  test('the relative clause keeps its own tense under the command', () => {
    expect(sayAll(eatThe(np('MOUSE', { relative: { verbPhrase: { verb: 'RUN', tense: 'past' } } }))))
      .toMatchObject({
        en: 'eat the mouse that ran.',
        it: 'mangia il topo che corse.',
        de: 'iss die Maus, die lief.',
        ja: '走ったネズミを食べてください。', // plain past inside, command outside
      });
  });

  test('an object-relative clause under a command — the gap is the clause object', () => {
    expect(sayAll(eatThe(np('MOUSE', {
      relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'SEE' } },
    })))).toMatchObject({
      en: 'eat the mouse that the cat sees.',
      fr: 'mange la souris que le chat voit.',
      de: 'iss die Maus, die der Kater sieht.',
      ja: '猫が見るネズミを食べてください。',
    });
  });

  test('the addressee still picks the command form, relative clause untouched', () => {
    // 2nd plural moves the matrix verb ("mangiate" / "esst"); the relative clause is unaffected.
    expect(sayAll(eatThe(MOUSE_THAT_RUNS, {}, np('SECOND_PERSON', { number: 'plural' })))).toMatchObject({
      it: 'mangiate il topo che corre.',
      fr: 'mangez la souris qui court.',
      es: 'comed el ratón que corre.',
      de: 'esst die Maus, die läuft.',
    });
  });

  test('a negative command over a relative object negates only the matrix verb', () => {
    // The negation brackets the command, not the relative clause: "do not eat the mouse that RUNS".
    // German's "nicht" lands after the comma-bracketed clause; Japanese takes the plain prohibitive
    // ～な on the matrix while the relative stays plain affirmative (走る).
    expect(sayAll(eatThe(MOUSE_THAT_RUNS, {}, np('SECOND_PERSON'), { negative: true }))).toMatchObject({
      en: 'do not eat the mouse that runs.',
      it: 'non mangiare il topo che corre.', // 2sg negative imperative is the infinitive
      fr: 'ne mange pas la souris qui court.',
      es: 'no comas el ratón que corre.',
      de: 'iss die Maus, die läuft, nicht.',
      ja: '走るネズミを食べるな。',
    });
  });
});
