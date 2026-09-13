import { describe, expect, test } from 'vitest';
import type { PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';

// BE with no subject complement of its own, in the clauses the period links join: a coordination, an
// IF condition and a relative clause, alone and together. Such a copula is one of two things. After a
// clause with a subject complement it elides that complement ("…, but the dog is not") and wants a
// pro-form in most languages (A121). With no such antecedent it asserts existence ("the cat is"),
// which is what every engine but the Japanese renders today (A120). The passing tests pin the second
// reading, and the English and Portuguese null pro-form, so a fix for the first leaves them alone.
// Japanese is asserted only in the known-bugs blocks.

const be = (subject: string, verbPhrase: Partial<VerbPhrase> = {}, predicate?: string): PhrasePlan =>
  clause(np(subject), 'BE', {
    verbPhrase,
    ...(predicate ? { complements: { predicative: { phrase: np(predicate) } } } : {}),
  });
const but = (first: PhrasePlan, second: PhrasePlan): PhrasePlan =>
  ({ ...first, coordination: { conjunction: 'but', clause: second } });
const ifThen = (protasis: PhrasePlan, main: PhrasePlan): PhrasePlan => ({ ...main, condition: protasis });
const that = (verbPhrase: VerbPhrase) => ({ relative: { verbPhrase } });

describe('BE without a subject complement: coordination', () => {
  test('with no subject complement before it, the copula asserts existence', () => {
    expect(sayAll(but(be('CAT'), be('DOG', { negative: true })))).toMatchObject({
      en: 'the cat is, but the dog is not.',
      it: 'il gatto è, ma il cane non è.',
      fr: "le chat est, mais le chien n'est pas.",
      es: 'el gato es, pero el perro no es.',
      pt: 'o gato é, mas o cão não é.',
      de: 'der Kater ist, aber der Hund ist nicht.',
    });
    expect(sayAll(but(clause(np('CAT'), 'RUN'), be('DOG', { negative: true })))).toMatchObject({
      en: 'the cat runs, but the dog is not.',
      it: 'il gatto corre, ma il cane non è.',
      fr: "le chat court, mais le chien n'est pas.",
      es: 'el gato corre, pero el perro no es.',
      pt: 'o gato corre, mas o cão não é.',
      de: 'der Kater läuft, aber der Hund ist nicht.',
    });
  });

  test('the ellipsis only looks back: a subject complement in the second clause leaves the first bare', () => {
    expect(sayAll(but(be('CAT', { negative: true }), be('DOG', {}, 'LEGEND')))).toMatchObject({
      en: 'the cat is not, but the dog is a legend.',
      it: 'il gatto non è, ma il cane è una leggenda.',
      fr: "le chat n'est pas, mais le chien est une légende.",
      es: 'el gato no es, pero el perro es una leyenda.',
      pt: 'o gato não é, mas o cão é uma lenda.',
      de: 'der Kater ist nicht, aber der Hund ist eine Legende.',
    });
  });

  test('a second clause with a subject complement of its own elides nothing', () => {
    expect(sayAll(but(be('CAT', {}, 'LEGEND'), be('DOG', { negative: true }, 'HAPPY')))).toMatchObject({
      en: 'the cat is a legend, but the dog is not happy.',
      it: 'il gatto è una leggenda, ma il cane non è felice.',
      fr: "le chat est une légende, mais le chien n'est pas heureux.",
      es: 'el gato es una leyenda, pero el perro no está feliz.',
      pt: 'o gato é uma lenda, mas o cão não está feliz.',
      de: 'der Kater ist eine Legende, aber der Hund ist nicht glücklich.',
    });
  });

  test('English and Portuguese leave an elided subject complement unspoken', () => {
    expect(sayAll(but(
      clause(np('AFRICA'), 'BE', {
        complements: { predicative: { phrase: np('CONTINENT') }, locative: { phrase: np('ASIA') } },
      }),
      be('ANTARCTICA', { tense: 'future', negative: true }),
    ))).toMatchObject({
      en: 'Africa is a continent in Asia, but Antarctica will not be.',
      pt: 'a África é um continente na Ásia, mas a Antártida não será.',
    });
    expect(sayAll(but(be('CAT', {}, 'LEGEND'), be('DOG', { negative: true })))).toMatchObject({
      en: 'the cat is a legend, but the dog is not.',
      pt: 'o gato é uma lenda, mas o cão não é.',
    });
  });
});

describe('BE without a subject complement: the IF condition', () => {
  test('a bare protasis asserts existence, in either polarity', () => {
    expect(sayAll(ifThen(be('CAT'), clause(np('DOG'), 'RUN')))).toMatchObject({
      en: 'if the cat was, the dog would run.',
      it: 'se il gatto fosse, il cane correrebbe.',
      fr: 'si le chat était, le chien courrait.',
      es: 'si el gato fuera, el perro correría.',
      pt: 'se o gato fosse, o cão correria.',
      de: 'wenn der Kater sein würde, würde der Hund laufen.',
    });
    expect(sayAll(ifThen(be('CAT', { negative: true }), clause(np('DOG'), 'RUN')))).toMatchObject({
      en: 'if the cat was not, the dog would run.',
      it: 'se il gatto non fosse, il cane correrebbe.',
      fr: "si le chat n'était pas, le chien courrait.",
      es: 'si el gato no fuera, el perro correría.',
      pt: 'se o gato não fosse, o cão correria.',
      de: 'wenn der Kater nicht sein würde, würde der Hund laufen.',
    });
  });

  test('a bare main clause after a protasis with no subject complement asserts existence', () => {
    expect(sayAll(ifThen(clause(np('CAT'), 'EAT'), be('DOG')))).toMatchObject({
      en: 'if the cat ate, the dog would be.',
      it: 'se il gatto mangiasse, il cane sarebbe.',
      fr: 'si le chat mangeait, le chien serait.',
      es: 'si el gato comiera, el perro sería.',
      pt: 'se o gato comesse, o cão seria.',
      de: 'wenn der Kater essen würde, würde der Hund sein.',
    });
  });

  test('the ellipsis only looks back: a subject complement in the main clause leaves the protasis bare', () => {
    expect(sayAll(ifThen(be('CAT', { negative: true }), be('DOG', {}, 'LEGEND')))).toMatchObject({
      en: 'if the cat was not, the dog would be a legend.',
      it: 'se il gatto non fosse, il cane sarebbe una leggenda.',
      fr: "si le chat n'était pas, le chien serait une légende.",
      es: 'si el gato no fuera, el perro sería una leyenda.',
      pt: 'se o gato não fosse, o cão seria uma lenda.',
      de: 'wenn der Kater nicht sein würde, würde der Hund eine Legende sein.',
    });
  });

  test('English and Portuguese leave a subject complement elided from the protasis unspoken', () => {
    expect(sayAll(ifThen(be('CAT', {}, 'LEGEND'), be('DOG', { negative: true })))).toMatchObject({
      en: 'if the cat was a legend, the dog would not be.',
      pt: 'se o gato fosse uma lenda, o cão não seria.',
    });
  });
});

describe('BE without a subject complement: the relative clause', () => {
  test('a bare relative asserts existence, in its own tense and polarity', () => {
    expect(sayAll(clause(np('DOG', that({ verb: 'BE' })), 'RUN'))).toMatchObject({
      en: 'the dog that is runs.',
      it: 'il cane che è corre.',
      fr: 'le chien qui est court.',
      es: 'el perro que es corre.',
      pt: 'o cão que é corre.',
      de: 'der Hund, der ist, läuft.',
    });
    expect(sayAll(clause(np('DOG', that({ verb: 'BE', tense: 'past', negative: true })), 'RUN'))).toMatchObject({
      en: 'the dog that was not runs.',
      it: 'il cane che non fu corre.',
      fr: 'le chien qui ne fut pas court.',
      es: 'el perro que no fue corre.',
      pt: 'o cão que não foi corre.',
      de: 'der Hund, der nicht war, läuft.',
    });
  });

  test('a relative whose head fills the subject complement takes no pro-form', () => {
    // The head is the relative's subject complement, so the clause has none of its own: the relative
    // pronoun stands for it ("the legend that the dog is not").
    const aLegendThatTheDogIsNot = np('LEGEND', {
      relative: { headRole: 'predicative', subject: np('DOG'), verbPhrase: { verb: 'BE', negative: true } },
    });
    expect(sayAll(clause(np('CAT'), 'BE', { complements: { predicative: { phrase: aLegendThatTheDogIsNot } } })))
      .toMatchObject({
        en: 'the cat is a legend that the dog is not.',
        it: 'il gatto è una leggenda che il cane non è.',
        fr: "le chat est une légende que le chien n'est pas.",
        es: 'el gato es una leyenda que el perro no es.',
        pt: 'o gato é uma lenda que o cão não é.',
        de: 'der Kater ist eine Legende, die der Hund nicht ist.',
      });
    const theCatThatTheDogIs = np('CAT', {
      relative: { headRole: 'predicative', subject: np('DOG'), verbPhrase: { verb: 'BE' } },
    });
    expect(sayAll(clause(np('BOY'), 'SEE', { directObject: theCatThatTheDogIs }))).toMatchObject({
      en: 'the boy sees the cat that the dog is.',
      it: 'il ragazzo vede il gatto che il cane è.',
      fr: 'le garçon voit le chat que le chien est.',
      es: 'el niño ve el gato que el perro es.',
      pt: 'o menino vê o gato que o cão é.',
      de: 'der Junge sieht den Kater, der der Hund ist.',
    });
  });
});

describe('BE without a subject complement: a coordination with a subordinate clause', () => {
  test('a bare relative in either coordinated clause asserts existence', () => {
    expect(sayAll(but(clause(np('CAT', that({ verb: 'BE' })), 'RUN'), clause(np('DOG'), 'JUMP')))).toMatchObject({
      en: 'the cat that is runs, but the dog jumps.',
      it: 'il gatto che è corre, ma il cane salta.',
      fr: 'le chat qui est court, mais le chien saute.',
      es: 'el gato que es corre, pero el perro salta.',
      pt: 'o gato que é corre, mas o cão pula.',
      de: 'der Kater, der ist, läuft, aber der Hund springt.',
    });
    expect(sayAll(but(clause(np('CAT'), 'RUN'), clause(np('DOG', that({ verb: 'BE' })), 'JUMP')))).toMatchObject({
      en: 'the cat runs, but the dog that is jumps.',
      it: 'il gatto corre, ma il cane che è salta.',
      fr: 'le chat court, mais le chien qui est saute.',
      es: 'el gato corre, pero el perro que es salta.',
      pt: 'o gato corre, mas o cão que é pula.',
      de: 'der Kater läuft, aber der Hund, der ist, springt.',
    });
  });

  test('a bare protasis, then a bare coordinated clause, both assert existence', () => {
    expect(sayAll({
      ...ifThen(be('MAN'), clause(np('CAT'), 'RUN')),
      coordination: { conjunction: 'and', clause: be('DOG', { negative: true }) },
    })).toMatchObject({
      en: 'if the man was, the cat would run, and the dog is not.',
      it: "se l'uomo fosse, il gatto correrebbe, e il cane non è.",
      fr: "si l'homme était, le chat courrait, et le chien n'est pas.",
      es: 'si el hombre fuera, el gato correría, y el perro no es.',
      pt: 'se o homem fosse, o gato correria, e o cão não é.',
      de: 'wenn der Mann sein würde, würde der Kater laufen, und der Hund ist nicht.',
    });
  });

  test('English and Portuguese leave the elided subject complement unspoken beside a condition or a relative', () => {
    expect(sayAll({
      ...ifThen(clause(np('MAN'), 'EAT'), be('CAT', {}, 'LEGEND')),
      coordination: { conjunction: 'but', clause: be('DOG', { negative: true }) },
    })).toMatchObject({
      en: 'if the man ate, the cat would be a legend, but the dog is not.',
      pt: 'se o homem comesse, o gato seria uma lenda, mas o cão não é.',
    });
    expect(sayAll(but(
      clause(np('CAT', that({ verb: 'RUN' })), 'BE', { complements: { predicative: { phrase: np('LEGEND') } } }),
      be('DOG', { negative: true }),
    ))).toMatchObject({
      en: 'the cat that runs is a legend, but the dog is not.',
      pt: 'o gato que corre é uma lenda, mas o cão não é.',
    });
    expect(sayAll(but(
      be('CAT', {}, 'LEGEND'),
      clause(np('DOG', that({ verb: 'RUN' })), 'BE', { verbPhrase: { negative: true } }),
    ))).toMatchObject({
      en: 'the cat is a legend, but the dog that runs is not.',
      pt: 'o gato é uma lenda, mas o cão que corre não é.',
    });
  });
});

// A120, in the linked clauses. A bare BE renders です in a protasis, a main clause, a relative and a
// coordinated clause alike. The relatives here are affirmative: a negated relative's plain form is B13.
describe('known bugs: Japanese BE with no complement, in linked clauses', () => {
  test.fails('Japanese renders the bare BE of a linked clause as the existential いる / ある', () => {
    expect(say(ifThen(be('CAT', { negative: true }), clause(np('DOG'), 'RUN')), 'ja')).toBe('もし猫がいなかったら、犬は走ります。');
    expect(say(ifThen(clause(np('CAT'), 'EAT'), be('DOG')), 'ja')).toBe('もし猫が食べたら、犬はいます。');
    expect(say(ifThen(be('CAT', { negative: true }), be('DOG', {}, 'LEGEND')), 'ja')).toBe('もし猫がいなかったら、犬は伝説です。');
    expect(say(clause(np('DOG', that({ verb: 'BE', tense: 'past' })), 'RUN'), 'ja')).toBe('いた犬は走ります。');
    // The join between the coordinated clauses is A122.
    expect(say(but(clause(np('CAT', that({ verb: 'BE' })), 'RUN'), clause(np('DOG'), 'JUMP')), 'ja')).toMatch(/^いる猫は走ります/);
    expect(say(but(clause(np('CAT'), 'RUN'), clause(np('DOG', that({ verb: 'BE' })), 'JUMP')), 'ja')).toMatch(/いる犬は跳びます。$/);
    const bothBare = say(but(be('CAT'), be('DOG', { negative: true })), 'ja');
    expect(bothBare).toMatch(/^猫はいます/);
    expect(bothBare).toMatch(/犬はいません。$/);
    const conditionThenAnd = say({
      ...ifThen(be('MAN'), clause(np('CAT'), 'RUN')),
      coordination: { conjunction: 'and', clause: be('DOG', { negative: true }) },
    }, 'ja');
    expect(conditionThenAnd).toMatch(/^もし男がいたら、猫は走ります/);
    expect(conditionThenAnd).toMatch(/犬はいません。$/);
  });
});

// A121, beside a condition and a relative. The antecedent of the elided subject complement may be the
// protasis ("if the cat were a legend, the dog would not be"), and the clauses may carry a condition or
// a relative of their own; the pro-form is wanted all the same.
describe('known bugs: an elided subject complement beside a condition or a relative', () => {
  test.fails('a bare main clause elides the subject complement of its protasis', () => {
    expect(sayAll(ifThen(be('CAT', {}, 'LEGEND'), be('DOG', { negative: true })))).toMatchObject({
      it: 'se il gatto fosse una leggenda, il cane non lo sarebbe.',
      fr: 'si le chat était une légende, le chien ne le serait pas.',
      es: 'si el gato fuera una leyenda, el perro no lo sería.',
      de: 'wenn der Kater eine Legende sein würde, würde der Hund es nicht sein.',
      ja: expect.stringMatching(/犬はそうではありません。$/),
    });
    // estar: Spanish and Portuguese keep the protasis's copula.
    expect(sayAll(ifThen(be('CAT', {}, 'HAPPY'), be('DOG')))).toMatchObject({
      it: 'se il gatto fosse felice, il cane lo sarebbe.',
      fr: 'si le chat était heureux, le chien le serait.',
      es: 'si el gato estuviera feliz, el perro lo estaría.',
      pt: 'se o gato estivesse feliz, o cão estaria.',
      de: 'wenn der Kater glücklich sein würde, würde der Hund es sein.',
      ja: expect.stringMatching(/犬はそうです。$/),
    });
  });

  test.fails('a condition on the pair, or a relative on either subject, keeps the pro-form', () => {
    expect(sayAll({
      ...ifThen(clause(np('MAN'), 'EAT'), be('CAT', {}, 'LEGEND')),
      coordination: { conjunction: 'but', clause: be('DOG', { negative: true }) },
    })).toMatchObject({
      it: "se l'uomo mangiasse, il gatto sarebbe una leggenda, ma il cane non lo è.",
      fr: "si l'homme mangeait, le chat serait une légende, mais le chien ne l'est pas.",
      es: 'si el hombre comiera, el gato sería una leyenda, pero el perro no lo es.',
      de: 'wenn der Mann essen würde, würde der Kater eine Legende sein, aber der Hund ist es nicht.',
      ja: expect.stringMatching(/犬はそうではありません。$/),
    });
    expect(sayAll(but(
      clause(np('CAT', that({ verb: 'RUN' })), 'BE', { complements: { predicative: { phrase: np('LEGEND') } } }),
      be('DOG', { negative: true }),
    ))).toMatchObject({
      it: 'il gatto che corre è una leggenda, ma il cane non lo è.',
      fr: "le chat qui court est une légende, mais le chien ne l'est pas.",
      es: 'el gato que corre es una leyenda, pero el perro no lo es.',
      de: 'der Kater, der läuft, ist eine Legende, aber der Hund ist es nicht.',
      ja: expect.stringMatching(/犬はそうではありません。$/),
    });
    expect(sayAll(but(
      be('CAT', {}, 'LEGEND'),
      clause(np('DOG', that({ verb: 'RUN' })), 'BE', { verbPhrase: { negative: true } }),
    ))).toMatchObject({
      it: 'il gatto è una leggenda, ma il cane che corre non lo è.',
      fr: "le chat est une légende, mais le chien qui court ne l'est pas.",
      es: 'el gato es una leyenda, pero el perro que corre no lo es.',
      de: 'der Kater ist eine Legende, aber der Hund, der läuft, ist es nicht.',
      ja: expect.stringMatching(/走る犬はそうではありません。$/),
    });
  });
});

// A123. A relative whose head fills BE's subject complement ("a legend that the dog is not") renders
// BE's stemless fallback です before the head: 犬がです伝説. Japanese cannot leave a predicate nominal
// as a gap, so the pro-form そう takes its place, with the plain copula a relative takes: 犬がそうでは
// ない伝説, 犬がそうである猫.
describe('known bugs: Japanese relative on the subject complement of BE', () => {
  test.fails('Japanese fills the subject-complement gap with そう', () => {
    const aLegendThatTheDogIsNot = np('LEGEND', {
      relative: { headRole: 'predicative', subject: np('DOG'), verbPhrase: { verb: 'BE', negative: true } },
    });
    expect(say(clause(np('CAT'), 'BE', { complements: { predicative: { phrase: aLegendThatTheDogIsNot } } }), 'ja'))
      .toBe('猫は犬がそうではない伝説です。');
    const theCatThatTheDogIs = np('CAT', {
      relative: { headRole: 'predicative', subject: np('DOG'), verbPhrase: { verb: 'BE' } },
    });
    expect(say(clause(np('BOY'), 'SEE', { directObject: theCatThatTheDogIs }), 'ja')).toBe('男の子は犬がそうである猫を見ます。');
  });
});
