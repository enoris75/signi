import { describe, expect, test } from 'vitest';
import type { PhrasePlan } from '@signi/shared';
import { clause, np, sayAll, translateAll } from './harness.js';

// P09-E30: an interjection — a word outside the clause that opens it and takes no part in its
// grammar. A sibling of the vocative (P11-E3), not part of it: "hey, the cat runs" has no addressee.
// It renders first, set off as the vocative is (a comma in six languages, 、 in Japanese), and takes
// the sentence's capital.

const hey = (plan: PhrasePlan): PhrasePlan => ({ ...plan, interjection: 'HEY' });

describe('an interjection before the clause', () => {
  test('hey, the cat runs — in all seven', () => {
    expect(sayAll(hey(clause(np('CAT'), 'RUN')))).toEqual({
      en: 'Hey, the cat runs.',
      it: 'Ehi, il gatto corre.',
      fr: 'Hé, le chat court.',
      de: 'Hey, der Kater läuft.',
      es: 'Oye, el gato corre.',
      pt: 'Ei, o gato corre.',
      ja: 'ねえ、猫は走ります。',
    });
  });

  test('before a verbless period', () => {
    expect(sayAll(hey({ subject: np('CAT') }))).toEqual({
      en: 'Hey, the cat.', it: 'Ehi, il gatto.', fr: 'Hé, le chat.', de: 'Hey, der Kater.',
      es: 'Oye, el gato.', pt: 'Ei, o gato.', ja: 'ねえ、猫。',
    });
  });

  test('before a command', () => {
    expect(sayAll(hey({ ...clause(np('SECOND_PERSON'), 'RUN'), imperative: true }))).toEqual({
      en: 'Hey, run.', it: 'Ehi, corri.', fr: 'Hé, cours.', de: 'Hey, lauf.',
      es: 'Oye, corre.', pt: 'Ei, corra.', ja: 'ねえ、走ってください。',
    });
  });

  test('outside the Spanish ¿, as the vocative is', () => {
    expect(sayAll(hey({ ...clause(np('CAT'), 'RUN'), interrogative: true }))).toMatchObject({
      en: 'Hey, does the cat run?', es: 'Oye, ¿el gato corre?', fr: 'Hé, est-ce que le chat court ?',
      ja: 'ねえ、猫は走りますか？',
    });
  });

  test('the Japanese ruby carries it, unread (it is kana)', () => {
    const ja = translateAll(hey(clause(np('CAT'), 'RUN'))).find((t) => t.language === 'ja')!;
    expect(ja.ruby?.slice(0, 2)).toEqual([{ t: 'ねえ' }, { t: '、' }]);
    expect(ja.ruby?.map((s) => s.t).join('')).toBe(ja.text);
  });
});

describe('an interjection with a vocative: interjection, vocative, clause', () => {
  test('hey, Peter, the cat runs', () => {
    expect(sayAll(hey({ ...clause(np('CAT'), 'RUN'), address: np('PETER') }))).toEqual({
      en: 'Hey, Peter, the cat runs.',
      it: 'Ehi, Pietro, il gatto corre.',
      fr: 'Hé, Pierre, le chat court.',
      de: 'Hey, Peter, der Kater läuft.',
      es: 'Oye, Pedro, el gato corre.',
      pt: 'Ei, Pedro, o gato corre.',
      ja: 'ねえ、ピーター、猫は走ります。',
    });
  });

  test('hey, Mom, run — the vocative behind it is no longer the first word', () => {
    expect(sayAll(hey({ ...clause(np('SECOND_PERSON'), 'RUN'), imperative: true, address: np('MOM') }))).toEqual({
      en: 'Hey, Mom, run.', it: 'Ehi, mamma, corri.', fr: 'Hé, Maman, cours.', de: 'Hey, Mama, lauf.',
      es: 'Oye, Mamá, corre.', pt: 'Ei, Mamãe, corra.', ja: 'ねえ、お母さん、走ってください。',
    });
    // A common noun keeps its lower case once it is not first.
    expect(sayAll(hey({ ...clause(np('SECOND_PERSON'), 'RUN'), imperative: true, address: np('CAT') })))
      .toMatchObject({ en: 'Hey, cat, run.', it: 'Ehi, gatto, corri.', de: 'Hey, Kater, lauf.' });
  });

  test('both outside the Spanish ¿', () => {
    expect(sayAll(hey({ ...clause(np('CAT'), 'RUN'), address: np('PETER'), interrogative: true }))).toMatchObject({
      es: 'Oye, Pedro, ¿el gato corre?', en: 'Hey, Peter, does the cat run?',
    });
  });

  test('without an interjection the vocative is unchanged', () => {
    expect(sayAll({ ...clause(np('CAT'), 'RUN'), address: np('MOM') })).toMatchObject({
      en: 'Mom, the cat runs.', it: 'Mamma, il gatto corre.',
    });
  });
});
