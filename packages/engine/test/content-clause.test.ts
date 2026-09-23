import { describe, expect, test } from 'vitest';
import type { LanguageCode, PhrasePlan } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// Localization C30: a content clause standing where the subject would — what an evaluative predicate
// is said *of*. MUST, CAN, WILL and MAY are glossed "to be obliged / able / to desire / allowed to
// act", where the adjective is said of the one who acts; *right* and *possible* are said of the act,
// and until this construct no plan could make an act a subject.

function definitionAll(id: string): Record<LanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
}

const evaluative = (adjective: string, clause?: PhrasePlan['contentSubject']): PhrasePlan => ({
  subject: np('THING'),
  contentSubject: clause ?? { subject: np('GENERIC_PERSON'), verbPhrase: { verb: 'ACT' } },
  verbPhrase: { verb: 'BE' },
  complements: { predicative: { phrase: np(adjective) } },
});

describe('a content clause as the subject', () => {
  test('the seven renderings', () => {
    expect(sayAll(evaluative('RIGHT_CORRECT'))).toEqual({
      en: 'it is right that one acts.', it: 'è giusto che si agisca.', fr: "il est juste qu'on agisse.",
      de: 'es ist richtig, dass man handelt.', es: 'es correcto que se actúe.',
      ja: '行動することが正しいです。', pt: 'é certo que se aja.',
    });
  });

  // Three languages write an expletive in the slot the clause left and extrapose it; three write no
  // subject pronoun at all; and Japanese leaves the clause where it is, nominalized and marked が.
  test('each language puts the clause where its own grammar takes it', () => {
    const rendered = sayAll(evaluative('RIGHT_CORRECT'));
    expect(rendered.en.startsWith('it is')).toBe(true);
    expect(rendered.fr.startsWith('il est')).toBe(true);
    expect(rendered.de.startsWith('es ist')).toBe(true);
    expect(rendered.it.startsWith('è')).toBe(true);
    expect(rendered.es.startsWith('es ')).toBe(true);
    expect(rendered.pt.startsWith('é ')).toBe(true);
    expect(rendered.ja.startsWith('行動することが')).toBe(true);
  });

  // The four Romance languages put such a clause in the present subjunctive, which the engine derives
  // from a stored present rather than seeding a paradigm: "agisca", "agisse", "actúe", "aja".
  test('the Romance clause is in the present subjunctive', () => {
    expect(sayAll(evaluative('RIGHT_CORRECT'))).toMatchObject({
      it: 'è giusto che si agisca.', fr: "il est juste qu'on agisse.",
      es: 'es correcto que se actúe.', pt: 'é certo que se aja.',
    });
    // …and it is the clause's own verb that goes into it, with its subject and object intact.
    expect(sayAll(evaluative('RIGHT_CORRECT', {
      subject: np('CAT'), verbPhrase: { verb: 'EAT' }, directObject: np('FOOD'),
    }))).toEqual({
      en: 'it is right that the cat eats the food.', it: 'è giusto che il gatto mangi il cibo.',
      fr: 'il est juste que le chat mange la nourriture.',
      de: 'es ist richtig, dass der Kater das Essen frisst.',
      es: 'es correcto que el gato coma la comida.', ja: '猫が食べ物を食べることが正しいです。',
      pt: 'é certo que o gato coma a comida.',
    });
  });

  // What agrees with a clausal subject agrees with a clause: 3rd singular, and masculine where the
  // language genders a predicate adjective — "è giusto", not the "è giusta" the throwaway noun in
  // the subject slot would have given.
  test('the predicate adjective agrees with the clause, not with the plan\'s own subject', () => {
    expect(sayAll(evaluative('GOOD'))).toMatchObject({
      it: 'è buono che si agisca.', fr: "il est bon qu'on agisse.",
      es: 'es bueno que se actúe.', pt: 'é bom que se aja.',
    });
  });

  // German closes the clause on its finite verb, as it does every subordinate clause.
  test('the German clause is verb-final behind "dass"', () => {
    expect(say(evaluative('RIGHT_CORRECT', {
      subject: np('CAT'), verbPhrase: { verb: 'EAT' }, directObject: np('FOOD'),
    }), 'de')).toBe('es ist richtig, dass der Kater das Essen frisst.');
  });

  // Japanese needs no expletive and no extraposition: the nominalized clause IS the subject, so it
  // stays in front, in the plain form, with a generic subject left unsaid as any citation leaves it.
  test('the Japanese clause is nominalized, plain, and in the subject slot', () => {
    expect(say(evaluative('RIGHT_CORRECT'), 'ja')).toBe('行動することが正しいです。');
    expect(say(evaluative('RIGHT_CORRECT', {
      subject: np('CAT'), verbPhrase: { verb: 'EAT' }, directObject: np('FOOD'),
    }), 'ja')).toBe('猫が食べ物を食べることが正しいです。');
  });
});

describe('the two modals it unblocks', () => {
  test.each<[string, Record<LanguageCode, string>]>([
    ['SHOULD', {
      en: 'it is right that one acts.', it: 'è giusto che si agisca.', fr: "il est juste qu'on agisse.",
      de: 'es ist richtig, dass man handelt.', es: 'es correcto que se actúe.',
      ja: '行動することが正しいです。', pt: 'é certo que se aja.',
    }],
    ['MIGHT', {
      en: 'it is possible that one acts.', it: 'è possibile che si agisca.',
      fr: "il est possible qu'on agisse.", de: 'es ist möglich, dass man handelt.',
      es: 'es posible que se actúe.', ja: '行動することが起こり得ます。', pt: 'é possível que se aja.',
    }],
  ])('%s', (id, rendered) => {
    expect(definitionAll(id)).toEqual(rendered);
  });

  // MIGHT is not CAN. Japanese is where that could have gone wrong: ABLE is 可能な, so POSSIBLE takes
  // 起こり得る — said of the act coming about, not of anyone's power to do it.
  test('MIGHT and CAN do not say the same thing', () => {
    expect(definitionAll('MIGHT')).not.toEqual(definitionAll('CAN'));
    expect(definitionAll('CAN').ja).toBe('行動することが可能である。');
    expect(definitionAll('MIGHT').ja).not.toContain('可能');
  });
});

// P09-E4: the same clause in the object slot — what a verb of saying, thinking or knowing reports. The
// host decides three things: the mood (the verb's lexeme, indicative by default), the expletive (none),
// and in Japanese whether the clause is quoted (と) or nominalized (ことを).
const reports = (verb: string, extra: Partial<PhrasePlan> = {}): PhrasePlan => ({
  subject: np('MAN'),
  verbPhrase: { verb },
  contentObject: { subject: np('CAT'), verbPhrase: { verb: 'RUN' } },
  ...extra,
});

describe('a content clause as the object', () => {
  test.each<[string, Record<LanguageCode, string>]>([
    ['SAY', {
      en: 'the man says that the cat runs.', it: "l'uomo dice che il gatto corre.",
      fr: "l'homme dit que le chat court.", de: 'der Mann sagt, dass der Kater läuft.',
      es: 'el hombre dice que el gato corre.', ja: '男は猫が走ると言います。', pt: 'o homem diz que o gato corre.',
    }],
    ['THINK', {
      en: 'the man thinks that the cat runs.', it: "l'uomo pensa che il gatto corra.",
      fr: "l'homme pense que le chat court.", de: 'der Mann denkt, dass der Kater läuft.',
      es: 'el hombre piensa que el gato corre.', ja: '男は猫が走ると考えます。', pt: 'o homem pensa que o gato corre.',
    }],
    ['BELIEVE', {
      en: 'the man believes that the cat runs.', it: "l'uomo crede che il gatto corra.",
      fr: "l'homme croit que le chat court.", de: 'der Mann glaubt, dass der Kater läuft.',
      es: 'el hombre cree que el gato corre.', ja: '男は猫が走ると信じています。', pt: 'o homem acredita que o gato corre.',
    }],
    ['KNOW', {
      en: 'the man knows that the cat runs.', it: "l'uomo sa che il gatto corre.",
      fr: "l'homme sait que le chat court.", de: 'der Mann weiß, dass der Kater läuft.',
      es: 'el hombre sabe que el gato corre.', ja: '男は猫が走ることを知っています。', pt: 'o homem sabe que o gato corre.',
    }],
  ])('%s', (verb, rendered) => {
    expect(sayAll(reports(verb))).toEqual(rendered);
  });

  // TELL is said *to* someone, and English writes that addressee bare ahead of a clause — "tells the
  // dog that", never "tells to the dog that" — where a story keeps its "to".
  test('TELL, with its addressee', () => {
    expect(sayAll(reports('TELL', { complements: { terminus: { phrase: np('DOG') } } }))).toEqual({
      en: 'the man tells the dog that the cat runs.', it: "l'uomo racconta al cane che il gatto corre.",
      fr: "l'homme raconte au chien que le chat court.", de: 'der Mann erzählt dem Hund, dass der Kater läuft.',
      es: 'el hombre cuenta al perro que el gato corre.', ja: '男は猫が走ると犬に伝えます。',
      pt: 'o homem conta ao cão que o gato corre.',
    });
    expect(say(clause(np('MAN'), 'TELL', { directObject: np('STORY'), complements: { terminus: { phrase: np('DOG') } } }), 'en'))
      .toBe('the man tells the story to the dog.');
  });

  // D1: an assertion is in the indicative. The subject clause's subjunctive must not leak into it — "dice
  // che il gatto corre", never "corra" — and its object and complements come along intact. Italian
  // pensare and credere are the verbs whose own lexeme asks for the subjunctive.
  test('the Romance object clause is in the indicative unless the verb says otherwise', () => {
    const eats = reports('SAY', { contentObject: { subject: np('CAT'), verbPhrase: { verb: 'EAT' }, directObject: np('FOOD') } });
    expect(sayAll(eats)).toMatchObject({
      it: "l'uomo dice che il gatto mangia il cibo.", fr: "l'homme dit que le chat mange la nourriture.",
      es: 'el hombre dice que el gato come la comida.', pt: 'o homem diz que o gato come a comida.',
    });
    expect(say(reports('THINK'), 'it')).toBe("l'uomo pensa che il gatto corra.");
    expect(say(reports('THINK'), 'fr')).toBe("l'homme pense que le chat court.");
  });

  // KNOW's object sense (conoscere / connaître / kennen) is for a noun object. A clause is a fact, which
  // is sapere / savoir / wissen.
  test('KNOW keeps its fact sense before a clause', () => {
    expect(sayAll(reports('KNOW'))).toMatchObject({
      it: "l'uomo sa che il gatto corre.", fr: "l'homme sait que le chat court.", de: 'der Mann weiß, dass der Kater läuft.',
    });
  });

  // D2: the verbs of saying and thinking quote with と, the rest nominalize with ことを — not
  // interchangeable, since 猫が走ることを言います says "says the fact that the cat runs". The clause inside
  // is plain either way, its subject が; a quoted copula closes on its terminal form, not the attributive
  // な a head noun would take.
  test('Japanese quotes with と and nominalizes with ことを', () => {
    for (const verb of ['SAY', 'THINK', 'BELIEVE', 'TELL']) expect(say(reports(verb), 'ja')).toMatch(/^男は猫が走ると/);
    expect(say(reports('KNOW'), 'ja')).toBe('男は猫が走ることを知っています。');
    expect(say(reports('SAY', {
      contentObject: { subject: np('CAT'), verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np('HAPPY') } } },
    }), 'ja')).toBe('男は猫が幸せであると言います。');
  });

  // D3: the subject clause writes an expletive in the slot it left; the object clause leaves none.
  test('a subject clause keeps its expletive and an object clause takes none', () => {
    const subject = sayAll(evaluative('RIGHT_CORRECT'));
    const object = sayAll(reports('SAY'));
    expect([subject.en, subject.fr, subject.de].map((s) => s.split(' ')[0])).toEqual(['it', 'il', 'es']);
    expect(object.en).not.toMatch(/\bit\b/);
    expect(object.fr).not.toMatch(/\bil\b/);
    expect(object.de).not.toMatch(/\bes\b/);
  });

  // German extraposes the object clause as it does the subject clause: comma, dass, verb-final.
  test('the German object clause is verb-final behind a comma and "dass"', () => {
    expect(say(reports('SAY', {
      contentObject: { subject: np('CAT'), verbPhrase: { verb: 'EAT' }, directObject: np('FOOD') },
    }), 'de')).toBe('der Mann sagt, dass der Kater das Essen frisst.');
  });

  // A question inverts the clause it asks, and never the clause it reports.
  test('under a question the reported clause keeps its statement order', () => {
    expect(say(reports('SAY', { interrogative: true }), 'en')).toBe('does the man say that the cat runs?');
    expect(say(reports('SAY', { interrogative: true }), 'de')).toBe('sagt der Mann, dass der Kater läuft?');
    expect(say(reports('SAY', { interrogative: true }), 'fr')).toBe("est-ce que l'homme dit que le chat court ?");
  });

  // "que" elides before a vowel, and the pro-drop languages drop a pronoun subject inside the clause
  // as they do anywhere else.
  test('a pronoun subject inside the clause', () => {
    expect(sayAll(reports('SAY', {
      contentObject: { subject: np('THIRD_PERSON', { gender: 'masc' }), verbPhrase: { verb: 'RUN' } },
    }))).toEqual({
      en: 'the man says that he runs.', it: "l'uomo dice che corre.", fr: "l'homme dit qu'il court.",
      de: 'der Mann sagt, dass er läuft.', es: 'el hombre dice que corre.', ja: '男は彼が走ると言います。',
      pt: 'o homem diz que corre.',
    });
  });
});

// A247. A content clause's mood is read off its governor (`content_clause_mood`, P09-E4) and never
// off its polarity, so a negated belief keeps the indicative its affirmative takes in French, Spanish
// and Portuguese: "no cree que el gato corre", "não acredita que o gato corre", "ne croit pas que le
// chat court". Negating a verb of belief denies the proposition, and the three languages put the
// denied one in the subjunctive: "corra", "corra", "coure". Italian already has it (credere and
// pensare govern the subjunctive either way), and the affirmative is right in all seven.
describe('known bugs: a negated belief keeps the indicative (A247)', () => {
  const believes = (verb: string, negative = true): PhrasePlan => ({
    subject: np('MAN'),
    verbPhrase: { verb, negative },
    contentObject: { subject: np('CAT'), verbPhrase: { verb: 'RUN' } },
  });

  test('Spanish: no cree que el gato corra', () => {
    expect(say(believes('BELIEVE'), 'es')).toBe('el hombre no cree que el gato corra.');
    expect(say(believes('THINK'), 'es')).toBe('el hombre no piensa que el gato corra.');
  });

  test('Portuguese: não acredita que o gato corra', () => {
    expect(say(believes('BELIEVE'), 'pt')).toBe('o homem não acredita que o gato corra.');
    expect(say(believes('THINK'), 'pt')).toBe('o homem não pensa que o gato corra.');
  });

  test('French: ne croit pas que le chat coure', () => {
    expect(say(believes('BELIEVE'), 'fr')).toBe("l'homme ne croit pas que le chat coure.");
    expect(say(believes('THINK'), 'fr')).toBe("l'homme ne pense pas que le chat coure.");
  });

  test('regression: Italian, the three without a subjunctive, and the affirmative are right', () => {
    expect(sayAll(believes('BELIEVE'))).toMatchObject({
      en: 'the man does not believe that the cat runs.', it: "l'uomo non crede che il gatto corra.",
      de: 'der Mann glaubt nicht, dass der Kater läuft.', ja: '男は猫が走ると信じていません。',
    });
    expect(say(believes('THINK'), 'it')).toBe("l'uomo non pensa che il gatto corra.");
    expect(sayAll(believes('BELIEVE', false))).toMatchObject({
      fr: "l'homme croit que le chat court.", es: 'el hombre cree que el gato corre.',
      pt: 'o homem acredita que o gato corre.',
    });
  });

  test('regression: the affirmative THINK keeps the indicative in French, Spanish and Portuguese', () => {
    expect(sayAll(believes('THINK', false))).toMatchObject({
      fr: "l'homme pense que le chat court.", es: 'el hombre piensa que el gato corre.',
      pt: 'o homem pensa que o gato corre.', it: "l'uomo pensa che il gatto corra.",
    });
  });

  test('regression: a negated SAY still reports in the indicative — the mood is the lexeme\'s, not the negation\'s', () => {
    expect(sayAll(believes('SAY'))).toEqual({
      en: 'the man does not say that the cat runs.', it: "l'uomo non dice che il gatto corre.",
      fr: "l'homme ne dit pas que le chat court.", de: 'der Mann sagt nicht, dass der Kater läuft.',
      es: 'el hombre no dice que el gato corre.', ja: '男は猫が走ると言いません。',
      pt: 'o homem não diz que o gato corre.',
    });
  });
});
