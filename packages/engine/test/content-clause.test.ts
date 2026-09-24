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

// P09-E17. The indirect question: an object clause that asks. A yes/no one opens on the language's
// *whether* (whether / se / si / ob / si / se / かどうか), a wh-one on its word, and neither inverts or
// takes a question mark. English, French, German and Portuguese keep the statement's order behind the
// word (German verb-final); Italian and Spanish the subject-last order their direct question has.
describe('the indirect question', () => {
  const man = np('MAN');
  const dog = { terminus: { phrase: np('DOG') } };
  const runs = { subject: np('CAT'), verbPhrase: { verb: 'RUN' } };
  const eats = { subject: np('CAT'), verbPhrase: { verb: 'EAT' } };
  const whether = { ...runs, interrogative: true };
  const asks = (contentObject: NonNullable<PhrasePlan['contentObject']>, extra: Omit<Partial<PhrasePlan>, 'subject' | 'verbPhrase'> = {}) =>
    sayAll(clause(man, 'ASK', { contentObject, ...extra }));

  test.each<[string, PhrasePlan, Record<LanguageCode, string>]>([
    ['the man asks whether the cat runs', clause(man, 'ASK', { contentObject: whether }), {
      en: 'the man asks whether the cat runs.', it: "l'uomo chiede se il gatto corre.",
      fr: "l'homme demande si le chat court.", de: 'der Mann fragt, ob der Kater läuft.',
      es: 'el hombre pregunta si el gato corre.', ja: '男は猫が走るかどうか尋ねます。',
      pt: 'o homem pergunta se o gato corre.',
    }],
    ['the man asks what the cat eats', clause(man, 'ASK', { contentObject: { ...eats, questionRole: 'directObject' } }), {
      en: 'the man asks what the cat eats.', it: "l'uomo chiede che cosa mangia il gatto.",
      fr: "l'homme demande ce que le chat mange.", de: 'der Mann fragt, was der Kater frisst.',
      es: 'el hombre pregunta qué come el gato.', ja: '男は猫が何を食べるか尋ねます。',
      pt: 'o homem pergunta o que o gato come.',
    }],
    ['the man knows where the cat eats', clause(man, 'KNOW', { contentObject: { ...eats, questionRole: 'locative' } }), {
      en: 'the man knows where the cat eats.', it: "l'uomo sa dove mangia il gatto.",
      fr: "l'homme sait où le chat mange.", de: 'der Mann weiß, wo der Kater frisst.',
      es: 'el hombre sabe dónde come el gato.', ja: '男は猫がどこで食べるか知っています。',
      pt: 'o homem sabe onde o gato come.',
    }],
    // The person asked stands before the clause, bare in English and accusative in German, and German
    // ASK's "nach" is not read: there is no noun object to take it (D6).
    ['the man asks the dog whether the cat runs', clause(man, 'ASK', { complements: dog, contentObject: whether }), {
      en: 'the man asks the dog whether the cat runs.', it: "l'uomo chiede al cane se il gatto corre.",
      fr: "l'homme demande au chien si le chat court.", de: 'der Mann fragt den Hund, ob der Kater läuft.',
      es: 'el hombre pregunta al perro si el gato corre.', ja: '男は猫が走るかどうか犬に尋ねます。',
      pt: 'o homem pergunta ao cão se o gato corre.',
    }],
  ])('%s', (_, plan, want) => {
    expect(sayAll(plan)).toEqual(want);
  });

  test('TELL reports one to its addressee', () => {
    expect(sayAll(clause(man, 'TELL', { complements: dog, contentObject: { ...eats, questionRole: 'directObject' } }))).toEqual({
      en: 'the man tells the dog what the cat eats.', it: "l'uomo racconta al cane che cosa mangia il gatto.",
      fr: "l'homme raconte au chien ce que le chat mange.", de: 'der Mann erzählt dem Hund, was der Kater frisst.',
      es: 'el hombre cuenta al perro qué come el gato.', ja: '男は猫が何を食べるか犬に伝えます。',
      pt: 'o homem conta ao cão o que o gato come.',
    });
  });

  // Japanese takes neither of KNOW's ことを nor SAY's と after the question particle.
  test('KNOW and SAY take a yes/no one too', () => {
    expect(sayAll(clause(man, 'KNOW', { contentObject: whether }))).toEqual({
      en: 'the man knows whether the cat runs.', it: "l'uomo sa se il gatto corre.",
      fr: "l'homme sait si le chat court.", de: 'der Mann weiß, ob der Kater läuft.',
      es: 'el hombre sabe si el gato corre.', ja: '男は猫が走るかどうか知っています。',
      pt: 'o homem sabe se o gato corre.',
    });
    expect(sayAll(clause(man, 'SAY', { contentObject: whether })).ja).toBe('男は猫が走るかどうか言います。');
  });

  test('a negated governor keeps the indicative and the question', () => {
    expect(sayAll(clause(man, 'KNOW', { verbPhrase: { negative: true }, contentObject: whether }))).toEqual({
      en: 'the man does not know whether the cat runs.', it: "l'uomo non sa se il gatto corre.",
      fr: "l'homme ne sait pas si le chat court.", de: 'der Mann weiß nicht, ob der Kater läuft.',
      es: 'el hombre no sabe si el gato corre.', ja: '男は猫が走るかどうか知りません。',
      pt: 'o homem não sabe se o gato corre.',
    });
  });

  describe("each of E6's gaps, embedded", () => {
    const eatsFood = { subject: np('GENERIC_PERSON'), verbPhrase: { verb: 'EAT' }, directObject: np('FOOD') };

    test('who, over the subject: the word stands in the subject slot', () => {
      expect(asks({ ...eatsFood, questionRole: 'subject', questionAnimate: true })).toEqual({
        en: 'the man asks who eats the food.', it: "l'uomo chiede chi mangia il cibo.",
        fr: "l'homme demande qui mange la nourriture.", de: 'der Mann fragt, wer das Essen isst.',
        es: 'el hombre pregunta quién come la comida.', ja: '男は誰が食べ物を食べるか尋ねます。',
        pt: 'o homem pergunta quem come a comida.',
      });
    });

    // French asks a thing as a subject with "ce qui", where the direct question says "qu'est-ce qui".
    test('what, over the subject: French "ce qui"', () => {
      expect(asks({ ...eatsFood, questionRole: 'subject' })).toEqual({
        en: 'the man asks what eats the food.', it: "l'uomo chiede che cosa mangia il cibo.",
        fr: "l'homme demande ce qui mange la nourriture.", de: 'der Mann fragt, was das Essen isst.',
        es: 'el hombre pregunta qué come la comida.', ja: '男は何が食べ物を食べるか尋ねます。',
        pt: 'o homem pergunta o que come a comida.',
      });
    });

    test('who, over the object', () => {
      expect(asks({ subject: np('CAT'), verbPhrase: { verb: 'SEE' }, questionRole: 'directObject', questionAnimate: true })).toEqual({
        en: 'the man asks who the cat sees.', it: "l'uomo chiede chi vede il gatto.",
        fr: "l'homme demande qui le chat voit.", de: 'der Mann fragt, wen der Kater sieht.',
        es: 'el hombre pregunta a quién ve el gato.', ja: '男は猫が誰を見るか尋ねます。',
        pt: 'o homem pergunta quem o gato vê.',
      });
    });

    test('how and why', () => {
      expect(asks({ ...eats, questionRole: 'manner' })).toEqual({
        en: 'the man asks how the cat eats.', it: "l'uomo chiede come mangia il gatto.",
        fr: "l'homme demande comment le chat mange.", de: 'der Mann fragt, wie der Kater frisst.',
        es: 'el hombre pregunta cómo come el gato.', ja: '男は猫がどうやって食べるか尋ねます。',
        pt: 'o homem pergunta como o gato come.',
      });
      expect(asks({ ...eats, questionRole: 'cause' })).toEqual({
        en: 'the man asks why the cat eats.', it: "l'uomo chiede perché mangia il gatto.",
        fr: "l'homme demande pourquoi le chat mange.", de: 'der Mann fragt, warum der Kater frisst.',
        es: 'el hombre pregunta por qué come el gato.', ja: '男は猫がなぜ食べるか尋ねます。',
        pt: 'o homem pergunta por que o gato come.',
      });
    });
  });

  // French "si" elides before "il" and "ils" alone; "ce que" elides as "que" always does.
  test('French "s\'il", but "si elle", and "ce qu\'il"', () => {
    const he = np('THIRD_PERSON', { gender: 'masc' });
    const she = np('THIRD_PERSON', { gender: 'fem' });
    expect(asks({ subject: he, verbPhrase: { verb: 'RUN' }, interrogative: true })).toMatchObject({
      en: 'the man asks whether he runs.', fr: "l'homme demande s'il court.", it: "l'uomo chiede se corre.",
      de: 'der Mann fragt, ob er läuft.',
    });
    expect(asks({ subject: she, verbPhrase: { verb: 'RUN' }, interrogative: true }).fr).toBe("l'homme demande si elle court.");
    expect(asks({ subject: he, verbPhrase: { verb: 'EAT' }, questionRole: 'directObject' }).fr).toBe("l'homme demande ce qu'il mange.");
  });

  // A past governor shifts the clause's future to the conditional where the language does, and the
  // question holds in that mood (it is the clause's own, not the mood's).
  test('the question holds under a past governor', () => {
    expect(sayAll(clause(man, 'ASK', {
      verbPhrase: { tense: 'past' },
      contentObject: { subject: np('CAT'), verbPhrase: { verb: 'EAT', tense: 'future' }, questionRole: 'directObject' },
    }))).toMatchObject({
      en: 'the man asked what the cat would eat.', it: "l'uomo chiese che cosa avrebbe mangiato il gatto.",
      fr: "l'homme demanda ce que le chat mangerait.", es: 'el hombre preguntó qué comería el gato.',
      pt: 'o homem perguntou o que o gato comeria.', ja: '男は猫が何を食べるか尋ねました。',
      // German keeps the clause's own tense under a past governor, by design (A254's regression).
      de: 'der Mann fragte, was der Kater fressen wird.',
    });
  });

  describe('beside a direct question', () => {
    test('a yes/no question over an indirect one asks once, in the matrix clause', () => {
      expect(sayAll(clause(man, 'ASK', { interrogative: true, contentObject: whether }))).toEqual({
        en: 'does the man ask whether the cat runs?', it: "l'uomo chiede se il gatto corre?",
        fr: "est-ce que l'homme demande si le chat court\u00a0?", de: 'fragt der Mann, ob der Kater läuft?',
        es: '¿el hombre pregunta si el gato corre?', ja: '男は猫が走るかどうか尋ねますか？',
        pt: 'o homem pergunta se o gato corre?',
      });
    });

    test('a wh-question over a statement stays E4 and E6\'s', () => {
      expect(sayAll(clause(man, 'SAY', { questionRole: 'locative', contentObject: runs }))).toEqual({
        en: 'where does the man say that the cat runs?', it: "dove dice l'uomo che il gatto corre?",
        fr: "où est-ce que l'homme dit que le chat court\u00a0?", de: 'wo sagt der Mann, dass der Kater läuft?',
        es: '¿dónde dice el hombre que el gato corre?', ja: '男は猫が走るとどこで言いますか？',
        pt: 'onde o homem diz que o gato corre?',
      });
    });

    test('a wh-question over an indirect one writes both words', () => {
      expect(sayAll(clause(np('GENERIC_PERSON'), 'ASK', {
        questionRole: 'subject', questionAnimate: true, contentObject: { ...eats, questionRole: 'directObject' },
      }))).toEqual({
        en: 'who asks what the cat eats?', it: 'chi chiede che cosa mangia il gatto?',
        fr: 'qui demande ce que le chat mange\u00a0?', de: 'wer fragt, was der Kater frisst?',
        es: '¿quién pregunta qué come el gato?', ja: '誰が猫が何を食べるか尋ねますか？',
        pt: 'quem pergunta o que o gato come?',
      });
    });
  });

  describe('what licenses it', () => {
    test('a verb of thinking takes no question', () => {
      expect(() => sayAll(clause(man, 'THINK', { contentObject: whether }))).toThrow(/THINK does not take an indirect question/);
      expect(() => sayAll(clause(man, 'BELIEVE', { contentObject: { ...eats, questionRole: 'directObject' } })))
        .toThrow(/BELIEVE does not take an indirect question/);
    });

    test('ASK takes nothing but a question', () => {
      expect(() => sayAll(clause(man, 'ASK', { contentObject: runs }))).toThrow(/ASK takes an indirect question, not a statement/);
    });

    // A subject clause and an adverbial clause never ask: the question is dropped (A272), not refused.
    test('the other two hosts drop it and say the statement', () => {
      const right = (contentSubject: NonNullable<PhrasePlan['contentSubject']>): PhrasePlan => ({
        subject: np('THING'), contentSubject, verbPhrase: { verb: 'BE' },
        complements: { predicative: { phrase: np('RIGHT_CORRECT') } },
      });
      expect(sayAll(right(whether))).toEqual(sayAll(right(runs)));
      expect(sayAll(right({ ...eats, questionRole: 'directObject' }))).toEqual(sayAll(right(eats)));
      const when = (c: NonNullable<PhrasePlan['adverbialClause']>['clause']) =>
        sayAll(clause(man, 'RUN', { adverbialClause: { conjunction: 'when', clause: c } }));
      expect(when(whether)).toEqual(when(runs));
      expect(when({ ...eats, questionRole: 'locative' })).toEqual(when(eats));
    });
  });
});

// The gaps P09-E14, E15 and E16 added, embedded (P09-E17): the fronting is the direct question's, in
// the indirect question's order — German verb-final behind the fronted phrase, French with no
// "est-ce que", Japanese closing on か.
describe('the indirect question over the possessor, a marked relation and the passive', () => {
  const man = np('MAN');
  const eatsFood = { subject: np('CAT'), verbPhrase: { verb: 'EAT' }, directObject: np('FOOD') };

  test.each<[string, PhrasePlan, Record<LanguageCode, string>]>([
    ['the man asks whose food the cat eats', clause(man, 'ASK', { contentObject: { ...eatsFood, questionRole: 'possessor', questionPossessed: 'directObject' } }), {
      en: 'the man asks whose food the cat eats.', it: "l'uomo chiede di chi mangia il cibo il gatto.",
      fr: "l'homme demande de qui le chat mange la nourriture.", de: 'der Mann fragt, wessen Essen der Kater frisst.',
      es: 'el hombre pregunta de quién come el gato la comida.', ja: '男は猫が誰の食べ物を食べるか尋ねます。',
      pt: 'o homem pergunta de quem o gato come a comida.',
    }],
    ['the man asks whose cat eats the food', clause(man, 'ASK', { contentObject: { ...eatsFood, questionRole: 'possessor' } }), {
      en: 'the man asks whose cat eats the food.', it: "l'uomo chiede il gatto di chi mangia il cibo.",
      fr: "l'homme demande le chat de qui mange la nourriture.", de: 'der Mann fragt, wessen Kater das Essen frisst.',
      es: 'el hombre pregunta el gato de quién come la comida.', ja: '男は誰の猫が食べ物を食べるか尋ねます。',
      pt: 'o homem pergunta o gato de quem come a comida.',
    }],
    ['the man knows where the cat comes from', clause(man, 'KNOW', { contentObject: { subject: np('CAT'), verbPhrase: { verb: 'COME' }, questionRole: 'source' } }), {
      en: 'the man knows where the cat comes from.', it: "l'uomo sa da dove viene il gatto.",
      fr: "l'homme sait d'où le chat vient.", de: 'der Mann weiß, woher der Kater kommt.',
      es: 'el hombre sabe de dónde viene el gato.', ja: '男は猫がどこから来るか知っています。',
      pt: 'o homem sabe de onde o gato vem.',
    }],
    ['the man asks who the woman gives the book to', clause(man, 'ASK', { contentObject: { subject: np('WOMAN'), verbPhrase: { verb: 'GIVE' }, directObject: np('BOOK'), questionRole: 'terminus', questionAnimate: true } }), {
      en: 'the man asks who the woman gives the book to.', it: "l'uomo chiede a chi dà il libro la donna.",
      fr: "l'homme demande à qui la femme donne le livre.", de: 'der Mann fragt, wem die Frau das Buch gibt.',
      es: 'el hombre pregunta a quién da la mujer el libro.', ja: '男は女が誰に本をあげるか尋ねます。',
      pt: 'o homem pergunta a quem a mulher dá o livro.',
    }],
    ['the man asks what is eaten by the cat', clause(man, 'ASK', { contentObject: { subject: np('CAT'), verbPhrase: { verb: 'EAT', voice: 'passive' }, questionRole: 'directObject' } }), {
      en: 'the man asks what is eaten by the cat.', it: "l'uomo chiede che cosa è mangiato dal gatto.",
      fr: "l'homme demande ce qui est mangé par le chat.", de: 'der Mann fragt, was vom Kater gefressen wird.',
      es: 'el hombre pregunta qué es comido por el gato.', ja: '男は何が猫に食べられるか尋ねます。',
      pt: 'o homem pergunta o que é comido pelo gato.',
    }],
    ['the man asks who the food is eaten by', clause(man, 'ASK', { contentObject: { ...eatsFood, verbPhrase: { verb: 'EAT', voice: 'passive' }, questionRole: 'subject', questionAnimate: true } }), {
      en: 'the man asks who the food is eaten by.', it: "l'uomo chiede da chi è mangiato il cibo.",
      fr: "l'homme demande par qui la nourriture est mangée.", de: 'der Mann fragt, von wem das Essen gegessen wird.',
      es: 'el hombre pregunta por quién es comida la comida.', ja: '男は食べ物が誰に食べられるか尋ねます。',
      pt: 'o homem pergunta por quem a comida é comida.',
    }],
  ])('%s', (_, plan, want) => {
    expect(sayAll(plan)).toEqual(want);
  });

  test('under what: the stranded preposition stays in its slot', () => {
    expect(sayAll(clause(man, 'ASK', { contentObject: {
      subject: np('CAT'), verbPhrase: { verb: 'EAT' }, questionRole: 'locative', questionSpecifiers: [{ kind: 'path', value: 'under' }],
    } }))).toEqual({
      en: 'the man asks what the cat eats under.', it: "l'uomo chiede sotto che cosa mangia il gatto.",
      fr: "l'homme demande sous quoi le chat mange.", de: 'der Mann fragt, worunter der Kater frisst.',
      es: 'el hombre pregunta debajo de qué come el gato.', ja: '男は猫が何の下で食べるか尋ねます。',
      pt: 'o homem pergunta debaixo de que o gato come.',
    });
  });
});

// P09-E17 coverage: the indirect question under the governor forms and inside the clause shapes the
// tests above leave out. A past governor shifts the clause as a that-clause shifts (A254, A263) while
// German keeps its own tense; a negation, an aspect, a modal or a complement inside the clause comes
// along untouched; and P09-E15's marked relations front inside it as they do in the direct question.
describe('the indirect question: the governor\'s forms and the clause\'s own', () => {
  const man = np('MAN');
  const dog = { terminus: { phrase: np('DOG') } };
  const runs = { subject: np('CAT'), verbPhrase: { verb: 'RUN' } };
  const eats = { subject: np('CAT'), verbPhrase: { verb: 'EAT' } };
  const whether = { ...runs, interrogative: true };
  const they = np('THIRD_PERSON', { gender: 'masc', number: 'plural' });

  describe('under a past governor', () => {
    test('a present yes/no question shifts to the imperfect, and German keeps its present', () => {
      expect(sayAll(clause(man, 'ASK', { verbPhrase: { tense: 'past' }, contentObject: whether }))).toEqual({
        en: 'the man asked whether the cat ran.', it: "l'uomo chiese se il gatto correva.",
        fr: "l'homme demanda si le chat courait.", de: 'der Mann fragte, ob der Kater läuft.',
        es: 'el hombre preguntó si el gato corría.', ja: '男は猫が走るかどうか尋ねました。',
        pt: 'o homem perguntou se o gato corria.',
      });
    });

    // The resultative anterior to a past governor is the pluperfect on the embedded path too (A263's
    // `anteriorToPast`), in the indicative an indirect question keeps.
    test('a resultative wh-question is the pluperfect: asked what the cat had eaten', () => {
      expect(sayAll(clause(man, 'ASK', {
        verbPhrase: { tense: 'past' },
        contentObject: { ...eats, verbPhrase: { verb: 'EAT', aspect: 'resultative' }, questionRole: 'directObject' },
      }))).toEqual({
        en: 'the man asked what the cat had eaten.', it: "l'uomo chiese che cosa aveva mangiato il gatto.",
        fr: "l'homme demanda ce que le chat avait mangé.", de: 'der Mann fragte, was der Kater gefressen hat.',
        es: 'el hombre preguntó qué había comido el gato.', ja: '男は猫が何を食べたか尋ねました。',
        pt: 'o homem perguntou o que o gato tinha comido.',
      });
    });

    test('a past KNOW over a wh-locative: knew where the cat ate', () => {
      expect(sayAll(clause(man, 'KNOW', { verbPhrase: { tense: 'past' }, contentObject: { ...eats, questionRole: 'locative' } }))).toEqual({
        en: 'the man knew where the cat ate.', it: "l'uomo sapeva dove mangiava il gatto.",
        fr: "l'homme savait où le chat mangeait.", de: 'der Mann wusste, wo der Kater frisst.',
        es: 'el hombre sabía dónde comía el gato.', ja: '男は猫がどこで食べるか知っていました。',
        pt: 'o homem sabia onde o gato comia.',
      });
    });
  });

  // French "si" and "que" elide before the plural "ils" as before "il".
  test('French "s\'ils" and "ce qu\'ils"', () => {
    expect(sayAll(clause(man, 'ASK', { contentObject: { subject: they, verbPhrase: { verb: 'RUN' }, interrogative: true } }))).toEqual({
      en: 'the man asks whether they run.', it: "l'uomo chiede se corrono.",
      fr: "l'homme demande s'ils courent.", de: 'der Mann fragt, ob sie laufen.',
      es: 'el hombre pregunta si corren.', ja: '男は彼らが走るかどうか尋ねます。',
      pt: 'o homem pergunta se correm.',
    });
    expect(sayAll(clause(man, 'ASK', { contentObject: { subject: they, verbPhrase: { verb: 'EAT' }, questionRole: 'directObject' } }))).toEqual({
      en: 'the man asks what they eat.', it: "l'uomo chiede che cosa mangiano.",
      fr: "l'homme demande ce qu'ils mangent.", de: 'der Mann fragt, was sie essen.',
      es: 'el hombre pregunta qué comen.', ja: '男は彼らが何を食べるか尋ねます。',
      pt: 'o homem pergunta o que comem.',
    });
  });

  describe('a negation', () => {
    test('inside the clause: why the cat does not eat, whether the cat does not run', () => {
      expect(sayAll(clause(man, 'ASK', { contentObject: { ...eats, verbPhrase: { verb: 'EAT', negative: true }, questionRole: 'cause' } }))).toEqual({
        en: 'the man asks why the cat does not eat.', it: "l'uomo chiede perché non mangia il gatto.",
        fr: "l'homme demande pourquoi le chat ne mange pas.", de: 'der Mann fragt, warum der Kater nicht frisst.',
        es: 'el hombre pregunta por qué no come el gato.', ja: '男は猫がなぜ食べないか尋ねます。',
        pt: 'o homem pergunta por que o gato não come.',
      });
      expect(sayAll(clause(man, 'ASK', { contentObject: { ...runs, verbPhrase: { verb: 'RUN', negative: true }, interrogative: true } }))).toEqual({
        en: 'the man asks whether the cat does not run.', it: "l'uomo chiede se il gatto non corre.",
        fr: "l'homme demande si le chat ne court pas.", de: 'der Mann fragt, ob der Kater nicht läuft.',
        es: 'el hombre pregunta si el gato no corre.', ja: '男は猫が走らないかどうか尋ねます。',
        pt: 'o homem pergunta se o gato não corre.',
      });
    });

    // A negated SAY keeps the indicative before a question, as KNOW does (A247's mood is a belief's).
    test('on SAY, TELL and ASK: the governor is denied, the question kept in the indicative', () => {
      expect(sayAll(clause(man, 'SAY', { verbPhrase: { negative: true }, contentObject: whether }))).toEqual({
        en: 'the man does not say whether the cat runs.', it: "l'uomo non dice se il gatto corre.",
        fr: "l'homme ne dit pas si le chat court.", de: 'der Mann sagt nicht, ob der Kater läuft.',
        es: 'el hombre no dice si el gato corre.', ja: '男は猫が走るかどうか言いません。',
        pt: 'o homem não diz se o gato corre.',
      });
      expect(sayAll(clause(man, 'TELL', { verbPhrase: { negative: true }, complements: dog, contentObject: { ...eats, questionRole: 'directObject' } }))).toEqual({
        en: 'the man does not tell the dog what the cat eats.', it: "l'uomo non racconta al cane che cosa mangia il gatto.",
        fr: "l'homme ne raconte pas au chien ce que le chat mange.", de: 'der Mann erzählt dem Hund nicht, was der Kater frisst.',
        es: 'el hombre no cuenta al perro qué come el gato.', ja: '男は猫が何を食べるか犬に伝えません。',
        pt: 'o homem não conta ao cão o que o gato come.',
      });
      expect(sayAll(clause(man, 'ASK', { verbPhrase: { negative: true }, contentObject: whether }))).toEqual({
        en: 'the man does not ask whether the cat runs.', it: "l'uomo non chiede se il gatto corre.",
        fr: "l'homme ne demande pas si le chat court.", de: 'der Mann fragt nicht, ob der Kater läuft.',
        es: 'el hombre no pregunta si el gato corre.', ja: '男は猫が走るかどうか尋ねません。',
        pt: 'o homem não pergunta se o gato corre.',
      });
    });
  });

  describe('inside the clause', () => {
    test('the progressive: what the cat is eating', () => {
      expect(sayAll(clause(man, 'ASK', { contentObject: { ...eats, verbPhrase: { verb: 'EAT', aspect: 'progressive' }, questionRole: 'directObject' } }))).toEqual({
        en: 'the man asks what the cat is eating.', it: "l'uomo chiede che cosa sta mangiando il gatto.",
        fr: "l'homme demande ce que le chat est en train de manger.", de: 'der Mann fragt, was der Kater gerade frisst.',
        es: 'el hombre pregunta qué está comiendo el gato.', ja: '男は猫が何を食べているか尋ねます。',
        pt: 'o homem pergunta o que o gato está comendo.',
      });
    });

    test('a modal: whether the cat can run', () => {
      expect(sayAll(clause(man, 'ASK', { contentObject: { ...runs, verbPhrase: { verb: 'RUN', modals: ['CAN'] }, interrogative: true } }))).toEqual({
        en: 'the man asks whether the cat can run.', it: "l'uomo chiede se il gatto può correre.",
        fr: "l'homme demande si le chat peut courir.", de: 'der Mann fragt, ob der Kater laufen kann.',
        es: 'el hombre pregunta si el gato puede correr.', ja: '男は猫が走ることができるかどうか尋ねます。',
        pt: 'o homem pergunta se o gato pode correr.',
      });
    });

    test('when', () => {
      expect(sayAll(clause(man, 'ASK', { contentObject: { ...eats, questionRole: 'temporal' } }))).toEqual({
        en: 'the man asks when the cat eats.', it: "l'uomo chiede quando mangia il gatto.",
        fr: "l'homme demande quand le chat mange.", de: 'der Mann fragt, wann der Kater frisst.',
        es: 'el hombre pregunta cuándo come el gato.', ja: '男は猫がいつ食べるか尋ねます。',
        pt: 'o homem pergunta quando o gato come.',
      });
    });

    test('a wh-object beside a filled terminus: what the woman gives to the dog', () => {
      expect(sayAll(clause(man, 'ASK', { contentObject: { subject: np('WOMAN'), verbPhrase: { verb: 'GIVE' }, complements: dog, questionRole: 'directObject' } }))).toEqual({
        en: 'the man asks what the woman gives to the dog.', it: "l'uomo chiede che cosa dà al cane la donna.",
        fr: "l'homme demande ce que la femme donne au chien.", de: 'der Mann fragt, was die Frau dem Hund gibt.',
        es: 'el hombre pregunta qué da la mujer al perro.', ja: '男は女が犬に何をあげるか尋ねます。',
        pt: 'o homem pergunta o que a mulher dá ao cão.',
      });
    });

    // \`ContentClause\` has no clause of its own, so only a hand-written plan (the console) nests one; the
    // translator resolves it as it resolves the outer clause. Japanese is pinned under A279, where KNOW
    // takes its dictionary form.
    test('another indirect question: whether the woman knows what the cat eats', () => {
      expect(sayAll(clause(man, 'ASK', { contentObject: {
        subject: np('WOMAN'), verbPhrase: { verb: 'KNOW' }, contentObject: { ...eats, questionRole: 'directObject' }, interrogative: true,
      } as NonNullable<PhrasePlan['contentObject']> }))).toMatchObject({
        en: 'the man asks whether the woman knows what the cat eats.', it: "l'uomo chiede se la donna sa che cosa mangia il gatto.",
        fr: "l'homme demande si la femme sait ce que le chat mange.", de: 'der Mann fragt, ob die Frau weiß, was der Kater frisst.',
        es: 'el hombre pregunta si la mujer sabe qué come el gato.', pt: 'o homem pergunta se a mulher sabe o que o gato come.',
      });
    });
  });

  describe('the governor\'s other forms', () => {
    test('a command: ask whether the cat runs', () => {
      expect(sayAll(clause(np('SECOND_PERSON'), 'ASK', { imperative: true, contentObject: whether }))).toEqual({
        en: 'ask whether the cat runs.', it: 'chiedi se il gatto corre.',
        fr: 'demande si le chat court.', de: 'frag, ob der Kater läuft.',
        es: 'pregunta si el gato corre.', ja: '猫が走るかどうか尋ねてください。',
        pt: 'pergunte se o gato corre.',
      });
    });

    // The present perfect is not a past governor: the clause keeps its present.
    test('the resultative: has asked whether the cat runs', () => {
      expect(sayAll(clause(man, 'ASK', { verbPhrase: { aspect: 'resultative' }, contentObject: whether }))).toMatchObject({
        en: 'the man has asked whether the cat runs.', it: "l'uomo ha chiesto se il gatto corre.",
        fr: "l'homme a demandé si le chat court.", de: 'der Mann hat gefragt, ob der Kater läuft.',
        es: 'el hombre ha preguntado si el gato corre.', ja: '男は猫が走るかどうか尋ねました。',
      });
    });

    // The matrix clause asks over its own terminus, and the indirect question stays one.
    test('a wh-question over the person told: who does the man tell whether the cat runs?', () => {
      expect(sayAll(clause(man, 'TELL', { questionRole: 'terminus', questionAnimate: true, contentObject: whether }))).toEqual({
        en: 'who does the man tell whether the cat runs?', it: "a chi racconta l'uomo se il gatto corre?",
        fr: "à qui est-ce que l'homme raconte si le chat court ?", de: 'wem erzählt der Mann, ob der Kater läuft?',
        es: '¿a quién cuenta el hombre si el gato corre?', ja: '男は猫が走るかどうか誰に伝えますか？',
        pt: 'a quem o homem conta se o gato corre?',
      });
    });
  });

  // P09-E15's marked relations, embedded: the fronted relation is the direct question's.
  describe('a marked relation, embedded', () => {
    const cut = { subject: np('WOMAN'), verbPhrase: { verb: 'CUT' }, directObject: np('BOOK') };

    test('the comitative: who the cat runs with', () => {
      expect(sayAll(clause(man, 'KNOW', { contentObject: { ...runs, questionRole: 'comitative', questionAnimate: true } }))).toEqual({
        en: 'the man knows who the cat runs with.', it: "l'uomo sa con chi corre il gatto.",
        fr: "l'homme sait avec qui le chat court.", de: 'der Mann weiß, mit wem der Kater läuft.',
        es: 'el hombre sabe con quién corre el gato.', ja: '男は猫が誰と走るか知っています。',
        pt: 'o homem sabe com quem o gato corre.',
      });
    });

    test('the negative cause: through whose fault the cat runs', () => {
      expect(sayAll(clause(man, 'ASK', { contentObject: { ...runs,
        questionRole: 'cause', questionSpecifiers: [{ kind: 'sentiment', value: 'negative' }],
      } }))).toEqual({
        en: 'the man asks through whose fault the cat runs.', it: "l'uomo chiede per colpa di chi corre il gatto.",
        fr: "l'homme demande par la faute de qui le chat court.", de: 'der Mann fragt, durch wessen Schuld der Kater läuft.',
        es: 'el hombre pregunta por culpa de quién corre el gato.', ja: '男は猫が誰のせいで走るか尋ねます。',
        pt: 'o homem pergunta por culpa de quem o gato corre.',
      });
    });

    test('the positive cause: who the cat runs thanks to', () => {
      expect(sayAll(clause(man, 'KNOW', { contentObject: { ...runs,
        questionRole: 'cause', questionSpecifiers: [{ kind: 'sentiment', value: 'positive' }], questionAnimate: true,
      } }))).toEqual({
        en: 'the man knows who the cat runs thanks to.', it: "l'uomo sa grazie a chi corre il gatto.",
        fr: "l'homme sait grâce à qui le chat court.", de: 'der Mann weiß, dank wem der Kater läuft.',
        es: 'el hombre sabe gracias a quién corre el gato.', ja: '男は猫が誰のおかげで走るか知っています。',
        pt: 'o homem sabe graças a quem o gato corre.',
      });
    });

    test('the instrumental: what the woman cuts the book with', () => {
      expect(sayAll(clause(man, 'ASK', { contentObject: { ...cut, questionRole: 'instrumental' } }))).toEqual({
        en: 'the man asks what the woman cuts the book with.', it: "l'uomo chiede con che cosa taglia il libro la donna.",
        fr: "l'homme demande avec quoi la femme coupe le livre.", de: 'der Mann fragt, womit die Frau das Buch schneidet.',
        es: 'el hombre pregunta con qué corta la mujer el libro.', ja: '男は女が何で本を切るか尋ねます。',
        pt: 'o homem pergunta com que a mulher corta o livro.',
      });
    });

    test('the direction: where the cat goes', () => {
      expect(sayAll(clause(man, 'KNOW', { contentObject: { subject: np('CAT'), verbPhrase: { verb: 'GO' }, questionRole: 'direction' } }))).toEqual({
        en: 'the man knows where the cat goes.', it: "l'uomo sa dove va il gatto.",
        fr: "l'homme sait où le chat va.", de: 'der Mann weiß, wohin der Kater geht.',
        es: 'el hombre sabe adónde va el gato.', ja: '男は猫がどこへ行くか知っています。',
        pt: 'o homem sabe aonde o gato vai.',
      });
    });

    test('under a past governor: what the cat ate under', () => {
      expect(sayAll(clause(man, 'ASK', { verbPhrase: { tense: 'past' }, contentObject: { ...eats,
        questionRole: 'locative', questionSpecifiers: [{ kind: 'path', value: 'under' }],
      } }))).toEqual({
        en: 'the man asked what the cat ate under.', it: "l'uomo chiese sotto che cosa mangiava il gatto.",
        fr: "l'homme demanda sous quoi le chat mangeait.", de: 'der Mann fragte, worunter der Kater frisst.',
        es: 'el hombre preguntó debajo de qué comía el gato.', ja: '男は猫が何の下で食べるか尋ねました。',
        pt: 'o homem perguntou debaixo de que o gato comia.',
      });
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

// A254. A content clause's tense was resolved as any clause's is, absolutely, so under a past governor
// it kept the present its plan names: "non credeva che il gatto corra", "no creía que el gato corra",
// "the man believed that the cat runs". A clause simultaneous with a past governor shifts back — the
// Romance subjunctive into the imperfect subjunctive ("corresse", "corriera"), the indicative into the
// imperfect ("correva", "courait", "corría", "corria"), English into the past ("ran"), and a future
// into the conditional ("would run", "courrait"). French keeps the present subjunctive of speech
// ("ne croyait pas que le chat coure"), German's dass-clause keeps its own tense, and Japanese's
// clause tense is relative already — all three are right.
describe('known bugs: a content clause under a past governor keeps the present (A254)', () => {
  const past = (verb: string, negative = false, inner: Partial<NonNullable<PhrasePlan['contentObject']>['verbPhrase']> = {}): PhrasePlan => ({
    subject: np('MAN'),
    verbPhrase: { verb, negative, tense: 'past' },
    contentObject: { subject: np('CAT'), verbPhrase: { verb: 'RUN', ...inner } },
  });

  test('the subjunctive shifts to the imperfect subjunctive: non credeva che il gatto corresse', () => {
    expect(sayAll(past('BELIEVE', true))).toMatchObject({
      it: "l'uomo non credeva che il gatto corresse.", es: 'el hombre no creía que el gato corriera.',
      pt: 'o homem não acreditava que o gato corresse.',
    });
    expect(say(past('BELIEVE'), 'it')).toBe("l'uomo credeva che il gatto corresse.");
    expect(sayAll(past('THINK', true))).toMatchObject({
      it: "l'uomo non pensò che il gatto corresse.", es: 'el hombre no pensó que el gato corriera.',
      pt: 'o homem não pensou que o gato corresse.',
    });
  });

  test('the indicative shifts to the imperfect: credeva, croyait, creía que el gato corría', () => {
    expect(sayAll(past('BELIEVE'))).toMatchObject({
      fr: "l'homme croyait que le chat courait.", es: 'el hombre creía que el gato corría.',
      pt: 'o homem acreditava que o gato corria.',
    });
    expect(sayAll(past('SAY'))).toMatchObject({
      it: "l'uomo disse che il gatto correva.", fr: "l'homme dit que le chat courait.",
      es: 'el hombre dijo que el gato corría.', pt: 'o homem disse que o gato corria.',
    });
    expect(sayAll(past('KNOW'))).toMatchObject({
      it: "l'uomo sapeva che il gatto correva.", fr: "l'homme savait que le chat courait.",
      es: 'el hombre sabía que el gato corría.', pt: 'o homem sabia que o gato corria.',
    });
  });

  test('English backshifts: the man did not believe that the cat ran', () => {
    expect(say(past('BELIEVE', true), 'en')).toBe('the man did not believe that the cat ran.');
    expect(say(past('BELIEVE'), 'en')).toBe('the man believed that the cat ran.');
    expect(say(past('SAY'), 'en')).toBe('the man said that the cat ran.');
  });

  test('a future under a past governor is the conditional: would run, courrait, correría', () => {
    expect(sayAll(past('SAY', false, { tense: 'future' }))).toMatchObject({
      en: 'the man said that the cat would run.', fr: "l'homme dit que le chat courrait.",
      es: 'el hombre dijo que el gato correría.', pt: 'o homem disse que o gato correria.',
    });
  });

  test('a subject clause under a past predicate shifts too: era giusto che il gatto corresse', () => {
    expect(sayAll({
      subject: np('THING'), contentSubject: { subject: np('CAT'), verbPhrase: { verb: 'RUN' } },
      verbPhrase: { verb: 'BE', tense: 'past' }, complements: { predicative: { phrase: np('RIGHT_CORRECT') } },
    })).toMatchObject({
      it: 'era giusto che il gatto corresse.', es: 'era correcto que el gato corriera.', pt: 'era certo que o gato corresse.',
    });
  });

  test('the Italian future in the past is the condizionale composto, with the verb\'s own auxiliary', () => {
    expect(say(past('SAY', false, { tense: 'future' }), 'it')).toBe("l'uomo disse che il gatto avrebbe corso.");
    expect(say(past('SAY', false, { verb: 'GO', tense: 'future' }), 'it')).toBe("l'uomo disse che il gatto sarebbe andato.");
    expect(say({ ...past('SAY', false, { verb: 'EAT', tense: 'future' }), contentObject: {
      subject: np('CAT'), verbPhrase: { verb: 'EAT', tense: 'future' }, directObject: np('FOOD'),
    } }, 'it')).toBe("l'uomo disse che il gatto avrebbe mangiato il cibo.");
  });

  test('a marked aspect, a modal, a passive and a plural shift with it', () => {
    expect(sayAll(past('SAY', false, { aspect: 'progressive' }))).toMatchObject({
      en: 'the man said that the cat was running.', it: "l'uomo disse che il gatto stava correndo.",
      fr: "l'homme dit que le chat était en train de courir.", es: 'el hombre dijo que el gato estaba corriendo.',
      pt: 'o homem disse que o gato estava correndo.',
    });
    expect(sayAll(past('BELIEVE', true, { aspect: 'progressive' }))).toMatchObject({
      it: "l'uomo non credeva che il gatto stesse correndo.", es: 'el hombre no creía que el gato estuviera corriendo.',
      pt: 'o homem não acreditava que o gato estivesse correndo.',
    });
    expect(sayAll(past('SAY', false, { modals: ['CAN'] }))).toMatchObject({
      en: 'the man said that the cat could run.', it: "l'uomo disse che il gatto poteva correre.",
      fr: "l'homme dit que le chat pouvait courir.", es: 'el hombre dijo que el gato podía correr.',
      pt: 'o homem disse que o gato podia correr.',
    });
    expect(sayAll({ ...past('SAY'), contentObject: {
      subject: np('MAN'), verbPhrase: { verb: 'EAT', voice: 'passive' }, directObject: np('FOOD'),
    } })).toMatchObject({
      en: 'the man said that the food was eaten by the man.', it: "l'uomo disse che il cibo era mangiato dall'uomo.",
      es: 'el hombre dijo que la comida era comida por el hombre.',
    });
    expect(sayAll({ ...past('KNOW'), contentObject: { subject: { ...np('CAT'), number: 'plural' }, verbPhrase: { verb: 'RUN' } } }))
      .toMatchObject({
        en: 'the man knew that the cats ran.', it: "l'uomo sapeva che i gatti correvano.",
        fr: "l'homme savait que les chats couraient.", es: 'el hombre sabía que los gatos corrían.',
        pt: 'o homem sabia que os gatos corriam.',
      });
  });

  test('regression: a past clause under a past governor keeps its own past', () => {
    expect(sayAll(past('SAY', false, { tense: 'past' }))).toMatchObject({
      en: 'the man said that the cat ran.', it: "l'uomo disse che il gatto corse.",
      es: 'el hombre dijo que el gato corrió.', pt: 'o homem disse que o gato correu.',
    });
  });

  test('regression: French speech, German, Japanese and a present governor are right', () => {
    expect(sayAll(past('BELIEVE', true))).toMatchObject({
      fr: "l'homme ne croyait pas que le chat coure.", de: 'der Mann glaubte nicht, dass der Kater läuft.',
      ja: '男は猫が走ると信じていませんでした。',
    });
    expect(say(past('SAY'), 'ja')).toBe('男は猫が走ると言いました。');
    expect(sayAll({ ...past('BELIEVE', true), verbPhrase: { verb: 'BELIEVE', negative: true } })).toMatchObject({
      it: "l'uomo non crede che il gatto corra.", es: 'el hombre no cree que el gato corra.',
      en: 'the man does not believe that the cat runs.',
    });
  });
});

// A260. A subjunctive content clause was resolved in `presentSubjunctive`, which every Romance engine
// builds from the stored present whatever the clause's own tense: a past clause lost its past —
// "crede che il gatto corra", "no cree que el gato corra" for "believes the cat ran". The indicative
// keeps it ("cree que el gato corrió"), so only the subjunctive is wrong. A past clause under a present
// governor is the perfect subjunctive: "abbia corso", "ait couru", "haya corrido", "tenha corrido".
describe('known bugs: a subjunctive content clause drops its own past (A260)', () => {
  const believes = (negative: boolean): PhrasePlan => ({
    subject: np('MAN'),
    verbPhrase: { verb: 'BELIEVE', negative },
    contentObject: { subject: np('CAT'), verbPhrase: { verb: 'RUN', tense: 'past' } },
  });

  test('under a negated belief: no cree que el gato haya corrido', () => {
    expect(sayAll(believes(true))).toMatchObject({
      it: "l'uomo non crede che il gatto abbia corso.", fr: "l'homme ne croit pas que le chat ait couru.",
      es: 'el hombre no cree que el gato haya corrido.', pt: 'o homem não acredita que o gato tenha corrido.',
    });
    expect(say(believes(false), 'it')).toBe("l'uomo crede che il gatto abbia corso.");
  });

  test('under an evaluative predicate: è giusto che il gatto abbia corso', () => {
    expect(sayAll({
      subject: np('THING'), contentSubject: { subject: np('CAT'), verbPhrase: { verb: 'RUN', tense: 'past' } },
      verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np('RIGHT_CORRECT') } },
    })).toMatchObject({
      it: 'è giusto che il gatto abbia corso.', fr: 'il est juste que le chat ait couru.',
      es: 'es correcto que el gato haya corrido.', pt: 'é certo que o gato tenha corrido.',
    });
  });

  test('the auxiliary is the verb\'s own, and an essere / être participle agrees', () => {
    const goes = (plural: boolean): PhrasePlan => ({
      subject: np('MAN'), verbPhrase: { verb: 'BELIEVE', negative: true },
      contentObject: { subject: plural ? { ...np('CAT'), number: 'plural' } : np('CAT'), verbPhrase: { verb: 'GO', tense: 'past' } },
    });
    expect(sayAll(goes(false))).toMatchObject({
      it: "l'uomo non crede che il gatto sia andato.", fr: "l'homme ne croit pas que le chat soit allé.",
      es: 'el hombre no cree que el gato haya ido.', pt: 'o homem não acredita que o gato tenha ido.',
    });
    expect(sayAll(goes(true))).toMatchObject({
      it: "l'uomo non crede che i gatti siano andati.", fr: "l'homme ne croit pas que les chats soient allés.",
      es: 'el hombre no cree que los gatos hayan ido.', pt: 'o homem não acredita que os gatos tenham ido.',
    });
  });

  test('an object and a passive come along', () => {
    expect(sayAll({ ...believes(true), contentObject: {
      subject: np('CAT'), verbPhrase: { verb: 'EAT', tense: 'past' }, directObject: np('FOOD'),
    } })).toMatchObject({
      it: "l'uomo non crede che il gatto abbia mangiato il cibo.",
      fr: "l'homme ne croit pas que le chat ait mangé la nourriture.",
      es: 'el hombre no cree que el gato haya comido la comida.',
      pt: 'o homem não acredita que o gato tenha comido a comida.',
    });
    expect(sayAll({ ...believes(true), contentObject: {
      subject: np('MAN'), verbPhrase: { verb: 'EAT', tense: 'past', voice: 'passive' }, directObject: np('FOOD'),
    } })).toMatchObject({
      it: "l'uomo non crede che il cibo sia stato mangiato dall'uomo.",
      fr: "l'homme ne croit pas que la nourriture ait été mangée par l'homme.",
      es: 'el hombre no cree que la comida haya sido comida por el hombre.',
      pt: 'o homem não acredita que a comida tenha sido comida pelo homem.',
    });
  });

  test('under a future governor too: non crederà che il gatto abbia corso', () => {
    expect(sayAll({ ...believes(true), verbPhrase: { verb: 'BELIEVE', negative: true, tense: 'future' } })).toMatchObject({
      it: "l'uomo non crederà che il gatto abbia corso.", fr: "l'homme ne croira pas que le chat ait couru.",
      es: 'el hombre no creerá que el gato haya corrido.', pt: 'o homem não acreditará que o gato tenha corrido.',
    });
  });

  test('regression: a future clause keeps the present subjunctive', () => {
    expect(sayAll({ ...believes(true), contentObject: { subject: np('CAT'), verbPhrase: { verb: 'RUN', tense: 'future' } } }))
      .toMatchObject({
        it: "l'uomo non crede che il gatto corra.", fr: "l'homme ne croit pas que le chat coure.",
        es: 'el hombre no cree que el gato corra.', pt: 'o homem não acredita que o gato corra.',
      });
  });

  test('regression: the indicative keeps its past, and the three without a subjunctive are right', () => {
    expect(sayAll(believes(false))).toMatchObject({
      en: 'the man believes that the cat ran.', fr: "l'homme croit que le chat courut.",
      de: 'der Mann glaubt, dass der Kater lief.', es: 'el hombre cree que el gato corrió.',
      ja: '男は猫が走ったと信じています。', pt: 'o homem acredita que o gato correu.',
    });
  });
});

// The Italian progressive's auxiliary, *stare*, keeps its indicative in a subjunctive clause: the
// present subjunctive is built for the clause's own verb, and STARE_AUX has no override the way AVERE
// and AVOIR gained one (A260), so the clause says "sta correndo" where it wants "stia correndo".
describe('known bugs: the Italian progressive keeps the indicative in a subjunctive clause (A261)', () => {
  const progressive = { subject: np('CAT'), verbPhrase: { verb: 'RUN', aspect: 'progressive' as const } };

  test('under a negated belief: non crede che il gatto stia correndo', () => {
    expect(say({ subject: np('MAN'), verbPhrase: { verb: 'BELIEVE', negative: true }, contentObject: progressive }, 'it'))
      .toBe("l'uomo non crede che il gatto stia correndo.");
  });

  test('under an evaluative predicate and under "before": è giusto che, prima che il gatto stia correndo', () => {
    expect(say(evaluative('RIGHT_CORRECT', progressive), 'it')).toBe('è giusto che il gatto stia correndo.');
    expect(say({
      subject: np('MAN'), verbPhrase: { verb: 'RUN' },
      adverbialClause: { conjunction: 'before', clause: progressive },
    }, 'it')).toBe("l'uomo corre prima che il gatto stia correndo.");
  });

  test('in the plural, and a past governor keeps its imperfect subjunctive', () => {
    expect(say({
      subject: np('MAN'), verbPhrase: { verb: 'BELIEVE', negative: true },
      contentObject: { ...progressive, subject: { ...np('CAT'), number: 'plural' } },
    }, 'it')).toBe("l'uomo non crede che i gatti stiano correndo.");
    expect(say({ subject: np('MAN'), verbPhrase: { verb: 'BELIEVE', negative: true, tense: 'past' }, contentObject: progressive }, 'it'))
      .toBe("l'uomo non credeva che il gatto stesse correndo.");
  });

  test('regression: an indicative clause keeps sta correndo', () => {
    expect(say({ subject: np('MAN'), verbPhrase: { verb: 'SAY' }, contentObject: progressive }, 'it'))
      .toBe("l'uomo dice che il gatto sta correndo.");
  });
});

// A past progressive under a present subjunctive governor is built from the present subjunctive of
// the progressive's auxiliary, whatever the clause's tense (A260 gave the neutral aspect its perfect
// subjunctive and no more), so "does not believe that the cat was running" says "is running".
describe('known bugs: a past progressive in a subjunctive clause drops its past (A262)', () => {
  const plan: PhrasePlan = {
    subject: np('MAN'), verbPhrase: { verb: 'BELIEVE', negative: true },
    contentObject: { subject: np('CAT'), verbPhrase: { verb: 'RUN', aspect: 'progressive', tense: 'past' } },
  };

  test('the auxiliary is in the imperfect subjunctive: no cree que el gato estuviera corriendo', () => {
    expect(sayAll(plan)).toMatchObject({
      it: "l'uomo non crede che il gatto stesse correndo.",
      es: 'el hombre no cree que el gato estuviera corriendo.',
      pt: 'o homem não acredita que o gato estivesse correndo.',
    });
  });

  test('in the plural, and under an evaluative predicate: è giusto che il gatto stesse correndo', () => {
    const cats = { subject: { ...np('CAT'), number: 'plural' as const }, verbPhrase: { verb: 'RUN', aspect: 'progressive' as const, tense: 'past' as const } };
    expect(sayAll({ ...plan, contentObject: cats })).toMatchObject({
      it: "l'uomo non crede che i gatti stessero correndo.",
      es: 'el hombre no cree que los gatos estuvieran corriendo.',
      pt: 'o homem não acredita que os gatos estivessem correndo.',
    });
    expect(sayAll(evaluative('RIGHT_CORRECT', plan.contentObject))).toMatchObject({
      it: 'è giusto che il gatto stesse correndo.', es: 'es correcto que el gato estuviera corriendo.',
      pt: 'é certo que o gato estivesse correndo.',
    });
  });

  test('under a past governor too: non credeva che il gatto stesse correndo', () => {
    const past: PhrasePlan = { ...plan, verbPhrase: { verb: 'BELIEVE', negative: true, tense: 'past' } };
    expect(sayAll(past)).toMatchObject({
      it: "l'uomo non credeva che il gatto stesse correndo.",
      es: 'el hombre no creía que el gato estuviera corriendo.',
      pt: 'o homem não acreditava que o gato estivesse correndo.',
    });
    expect(sayAll({ ...past, contentObject: { ...plan.contentObject!, subject: { ...np('CAT'), number: 'plural' } } })).toMatchObject({
      it: "l'uomo non credeva che i gatti stessero correndo.",
      es: 'el hombre no creía que los gatos estuvieran corriendo.',
      pt: 'o homem não acreditava que os gatos estivessem correndo.',
    });
  });

  test('regression: an indicative clause keeps its imperfect progressive, and English its past', () => {
    expect(sayAll({ ...plan, verbPhrase: { verb: 'SAY' } })).toMatchObject({
      en: 'the man says that the cat was running.', it: "l'uomo dice che il gatto stava correndo.",
      es: 'el hombre dice que el gato estaba corriendo.', pt: 'o homem diz que o gato estava correndo.',
    });
  });
});

// A past or resultative clause under a past governor is left where A254 put it: A254 shifts only a
// present or future clause, so a clause anterior to a past governor keeps the present subjunctive
// ("non credeva che il gatto corra") or the present perfect ("said that the cat has run") where
// both want the pluperfect.
describe('known bugs: a clause anterior to a past governor takes no pluperfect (A263)', () => {
  const under = (governor: PhrasePlan['verbPhrase'], inner: Partial<NonNullable<PhrasePlan['contentObject']>['verbPhrase']>): PhrasePlan => ({
    subject: np('MAN'), verbPhrase: governor,
    contentObject: { subject: np('CAT'), verbPhrase: { verb: 'RUN', ...inner } },
  });

  test('a past clause under a past subjunctive governor: non credeva che il gatto avesse corso', () => {
    expect(sayAll(under({ verb: 'BELIEVE', negative: true, tense: 'past' }, { tense: 'past' }))).toMatchObject({
      it: "l'uomo non credeva che il gatto avesse corso.", fr: "l'homme ne croyait pas que le chat ait couru.",
      es: 'el hombre no creía que el gato hubiera corrido.', pt: 'o homem não acreditava que o gato tivesse corrido.',
    });
  });

  test('a resultative under a past governor: said that the cat had run', () => {
    expect(sayAll(under({ verb: 'SAY', tense: 'past' }, { aspect: 'resultative' }))).toMatchObject({
      en: 'the man said that the cat had run.', it: "l'uomo disse che il gatto aveva corso.",
      fr: "l'homme dit que le chat avait couru.", es: 'el hombre dijo que el gato había corrido.',
      pt: 'o homem disse que o gato tinha corrido.',
    });
    expect(sayAll(under({ verb: 'BELIEVE', negative: true, tense: 'past' }, { aspect: 'resultative' }))).toMatchObject({
      en: 'the man did not believe that the cat had run.', it: "l'uomo non credeva che il gatto avesse corso.",
      es: 'el hombre no creía que el gato hubiera corrido.', pt: 'o homem não acreditava que o gato tivesse corrido.',
    });
  });

  test('the auxiliary is the verb\'s own, and an essere / être participle agrees', () => {
    expect(sayAll({
      subject: np('MAN'), verbPhrase: { verb: 'BELIEVE', negative: true, tense: 'past' },
      contentObject: { subject: { ...np('CAT'), number: 'plural' }, verbPhrase: { verb: 'GO', tense: 'past' } },
    })).toMatchObject({
      it: "l'uomo non credeva che i gatti fossero andati.", fr: "l'homme ne croyait pas que les chats soient allés.",
      es: 'el hombre no creía que los gatos hubieran ido.', pt: 'o homem não acreditava que os gatos tivessem ido.',
    });
    expect(sayAll({
      subject: np('MAN'), verbPhrase: { verb: 'SAY', tense: 'past' },
      contentObject: { subject: np('CAT'), verbPhrase: { verb: 'GO', aspect: 'resultative' } },
    })).toMatchObject({
      it: "l'uomo disse che il gatto era andato.", fr: "l'homme dit que le chat était allé.",
      es: 'el hombre dijo que el gato había ido.', pt: 'o homem disse que o gato tinha ido.',
    });
  });

  test('an object, a passive and an evaluative predicate come along', () => {
    expect(sayAll({
      subject: np('MAN'), verbPhrase: { verb: 'SAY', tense: 'past' },
      contentObject: { subject: np('CAT'), verbPhrase: { verb: 'EAT', aspect: 'resultative' }, directObject: np('FOOD') },
    })).toMatchObject({
      en: 'the man said that the cat had eaten the food.', it: "l'uomo disse che il gatto aveva mangiato il cibo.",
      fr: "l'homme dit que le chat avait mangé la nourriture.", es: 'el hombre dijo que el gato había comido la comida.',
      pt: 'o homem disse que o gato tinha comido a comida.',
    });
    expect(sayAll({
      subject: np('MAN'), verbPhrase: { verb: 'BELIEVE', negative: true, tense: 'past' },
      contentObject: { subject: np('MAN'), verbPhrase: { verb: 'EAT', tense: 'past', voice: 'passive' }, directObject: np('FOOD') },
    })).toMatchObject({
      it: "l'uomo non credeva che il cibo fosse stato mangiato dall'uomo.",
      fr: "l'homme ne croyait pas que la nourriture ait été mangée par l'homme.",
      es: 'el hombre no creía que la comida hubiera sido comida por el hombre.',
      pt: 'o homem não acreditava que a comida tivesse sido comida pelo homem.',
    });
    expect(sayAll({
      subject: np('THING'), contentSubject: { subject: np('CAT'), verbPhrase: { verb: 'RUN', tense: 'past' } },
      verbPhrase: { verb: 'BE', tense: 'past' }, complements: { predicative: { phrase: np('RIGHT_CORRECT') } },
    })).toMatchObject({
      it: 'era giusto che il gatto avesse corso.', fr: 'il était juste que le chat ait couru.',
      es: 'era correcto que el gato hubiera corrido.', pt: 'era certo que o gato tivesse corrido.',
    });
  });

  test('regression: a plain past indicative, and a pluperfect already, are left alone; German keeps its tense', () => {
    expect(sayAll(under({ verb: 'SAY', tense: 'past' }, { tense: 'past' }))).toMatchObject({
      en: 'the man said that the cat ran.', it: "l'uomo disse che il gatto corse.",
      es: 'el hombre dijo que el gato corrió.', pt: 'o homem disse que o gato correu.',
    });
    expect(sayAll(under({ verb: 'SAY', tense: 'past' }, { tense: 'past', aspect: 'resultative' }))).toMatchObject({
      en: 'the man said that the cat had run.', it: "l'uomo disse che il gatto aveva corso.",
      de: 'der Mann sagte, dass der Kater gelaufen war.',
    });
    expect(sayAll(under({ verb: 'SAY', tense: 'past' }, { aspect: 'resultative' })).de)
      .toBe('der Mann sagte, dass der Kater gelaufen ist.');
  });
});

// A272. A content clause has no field for a question (`ContentClause`), and the builder refuses a
// question as one (P09-E12 M5), but a plan that carries `interrogative` or `questionRole` on it is
// rendered as asked: English inverts inside the clause ("says that does the cat run"), and a
// wh-question writes its question word in five languages ("dice che che cosa mangia il gatto") while
// French and German drop it (French keeps a subject's: "demande que qu'est-ce qui mange"). An adverbial clause, the same type, does the same ("runs when does the
// cat run"). Until indirect questions exist (P09-E17), the translator drops the question inside a
// subordinate clause, as it already does under a condition, a command and a citation — which is what
// Italian, French, German, Spanish and Portuguese already render for the yes/no case.
describe('known bugs: a question inside a content clause leaks into it (A272)', () => {
  const yesNo = { subject: np('CAT'), verbPhrase: { verb: 'RUN' }, interrogative: true };
  const what = { subject: np('CAT'), verbPhrase: { verb: 'EAT' }, questionRole: 'directObject' as const };
  const says = (contentObject: NonNullable<PhrasePlan['contentObject']>) => sayAll(clause(np('MAN'), 'SAY', { contentObject }));

  // Under an object clause the question is P09-E17's indirect question now, which this pin predates.
  test('a yes/no question in an object clause is the indirect question, never an inverted one', () => {
    expect(says(yesNo).en).toBe('the man says whether the cat runs.');
  });

  test('a wh-question in an object clause writes its word once, in the indirect question\'s order', () => {
    expect(says(what)).toEqual({
      en: 'the man says what the cat eats.', it: "l'uomo dice che cosa mangia il gatto.",
      fr: "l'homme dit ce que le chat mange.", de: 'der Mann sagt, was der Kater frisst.',
      es: 'el hombre dice qué come el gato.', ja: '男は猫が何を食べるか言います。',
      pt: 'o homem diz o que o gato come.',
    });
  });

  test('nor does a subject clause or an adverbial clause ask', () => {
    expect(sayAll({
      subject: np('THING'), contentSubject: yesNo, verbPhrase: { verb: 'BE' },
      complements: { predicative: { phrase: np('RIGHT_CORRECT') } },
    }).en).toBe('it is right that the cat runs.');
    expect(sayAll(clause(np('MAN'), 'RUN', { adverbialClause: { conjunction: 'when', clause: yesNo } })).en)
      .toBe('the man runs when the cat runs.');
  });

  test('regression: the clause that governs it may ask', () => {
    expect(sayAll(clause(np('MAN'), 'SAY', { interrogative: true, contentObject: { subject: np('CAT'), verbPhrase: { verb: 'RUN' } } })).en)
      .toBe('does the man say that the cat runs?');
  });
});

// A278. A Japanese indirect question closes on か / かどうか, which follows a predicate's plain terminal
// form, never its attributive one. The clause is built with `plain: true`, the prenominal form a relative
// clause takes, so a な-adjective keeps the な it writes before a noun: 猫が幸せなかどうか, 誰が幸せなか.
// The target is 幸せであるかどうか, the form a noun predicate already takes there (動物であるかどうか).
describe('known bugs: a Japanese な-adjective keeps its な before the indirect question\'s か (A278)', () => {
  const man = np('MAN');
  const happy = { subject: np('CAT'), verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np('HAPPY') } } };

  test('a yes/no question: 猫が幸せであるかどうか', () => {
    expect(say(clause(man, 'ASK', { contentObject: { ...happy, interrogative: true } }), 'ja')).toBe('男は猫が幸せであるかどうか尋ねます。');
  });

  test('a wh-question over the subject: 誰が幸せであるか', () => {
    expect(say(clause(man, 'ASK', { contentObject: {
      ...happy, subject: np('GENERIC_PERSON'), questionRole: 'subject', questionAnimate: true,
    } }), 'ja')).toBe('男は誰が幸せであるか尋ねます。');
  });

  test('a wh-question over an adjunct: 猫がどこで幸せであるか', () => {
    expect(say(clause(man, 'ASK', { contentObject: { ...happy, questionRole: 'locative' } }), 'ja')).toBe('男は猫がどこで幸せであるか尋ねます。');
  });

  test('KNOW\'s indirect question, a coordinated predicate, and the relative clause\'s な', () => {
    expect(say(clause(man, 'KNOW', { contentObject: { ...happy, interrogative: true } }), 'ja')).toBe('男は猫が幸せであるかどうか知っています。');
    expect(say(clause(man, 'KNOW', { contentObject: { ...happy, questionRole: 'locative' } }), 'ja')).toBe('男は猫がどこで幸せであるか知っています。');
    expect(say(clause(man, 'ASK', { contentObject: {
      ...happy, complements: { predicative: { phrase: { conjuncts: [np('BIG'), np('HAPPY')], conjunction: 'and' } } }, interrogative: true,
    } }), 'ja')).toBe('男は猫が大きくて幸せであるかどうか尋ねます。');
    // A head noun still follows the attributive な.
    expect(say(clause(np('CAT', { relative: { verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np('HAPPY') } } } }), 'RUN'), 'ja'))
      .toBe('幸せな猫は走ります。');
  });

  test('regression: an い-adjective, a noun, the past, the negative, and the other links are right', () => {
    const asks = (contentObject: NonNullable<PhrasePlan['contentObject']>, verb = 'ASK') => say(clause(man, verb, { contentObject }), 'ja');
    expect(asks({ ...happy, complements: { predicative: { phrase: np('BIG') } }, interrogative: true }, 'KNOW')).toBe('男は猫が大きいかどうか知っています。');
    expect(asks({ ...happy, complements: { predicative: { phrase: np('ANIMAL', { definiteness: 'indefinite' }) } }, interrogative: true }))
      .toBe('男は猫が動物であるかどうか尋ねます。');
    expect(asks({ ...happy, verbPhrase: { verb: 'BE', tense: 'past' }, interrogative: true })).toBe('男は猫が幸せだったかどうか尋ねます。');
    expect(asks({ ...happy, verbPhrase: { verb: 'BE', negative: true }, interrogative: true })).toBe('男は猫が幸せではないかどうか尋ねます。');
    // The quotative と takes the terminal である, and KNOW's こと the attributive な a noun would take.
    expect(asks(happy, 'SAY')).toBe('男は猫が幸せであると言います。');
    expect(asks(happy, 'KNOW')).toBe('男は猫が幸せなことを知っています。');
    expect(sayAll(clause(man, 'ASK', { contentObject: { ...happy, interrogative: true } }))).toMatchObject({
      en: 'the man asks whether the cat is happy.', de: 'der Mann fragt, ob der Kater glücklich ist.',
    });
  });
});

// A279. A Japanese state verb (持つ, 愛する, 知る) says that the state holds with the resultant 〜ている;
// its dictionary form names the change of state. A132 gave a finite main clause 持っています, but
// `predicateSegs` keeps the plain verb whenever `plain` is set, which covers a content clause as well as
// the relative clause A132 meant to leave alone: 猫が本を持つと言います ("says the cat will pick up the
// book"), 女が猫を知るかどうか.
describe('known bugs: a Japanese state verb in a content clause takes its dictionary form (A279)', () => {
  const man = np('MAN');
  const hasBook = { subject: np('CAT'), verbPhrase: { verb: 'HAVE' }, directObject: np('BOOK') };
  const knowsCat = { subject: np('WOMAN'), verbPhrase: { verb: 'KNOW' }, directObject: np('CAT') };
  const ja = (verb: string, contentObject: NonNullable<PhrasePlan['contentObject']>) => say(clause(man, verb, { contentObject }), 'ja');

  test('a yes/no question: 女が猫を知っているかどうか, 猫が本を持っているかどうか', () => {
    expect(ja('ASK', { ...knowsCat, interrogative: true })).toBe('男は女が猫を知っているかどうか尋ねます。');
    expect(ja('ASK', { ...hasBook, interrogative: true })).toBe('男は猫が本を持っているかどうか尋ねます。');
  });

  test('a wh-question: 猫が何を持っているか', () => {
    expect(ja('ASK', { subject: np('CAT'), verbPhrase: { verb: 'HAVE' }, questionRole: 'directObject' })).toBe('男は猫が何を持っているか尋ねます。');
  });

  test('a quoted clause: 猫が本を持っていると, and its past and negative', () => {
    expect(ja('SAY', hasBook)).toBe('男は猫が本を持っていると言います。');
    expect(ja('SAY', { ...hasBook, verbPhrase: { verb: 'HAVE', tense: 'past' } })).toBe('男は猫が本を持っていたと言います。');
    expect(ja('SAY', { ...hasBook, verbPhrase: { verb: 'HAVE', negative: true } })).toBe('男は猫が本を持っていないと言います。');
    expect(ja('SAY', { subject: np('CAT'), verbPhrase: { verb: 'LOVE' }, directObject: np('DOG') })).toBe('男は猫が犬を愛していると言います。');
    expect(ja('SAY', knowsCat)).toBe('男は女が猫を知っていると言います。');
  });

  test('a nominalized clause: 猫が本を持っていることを', () => {
    expect(ja('KNOW', hasBook)).toBe('男は猫が本を持っていることを知っています。');
  });

  test('an indirect question under KNOW, itself in an indirect question', () => {
    expect(ja('ASK', {
      subject: np('WOMAN'), verbPhrase: { verb: 'KNOW' }, contentObject: { subject: np('CAT'), verbPhrase: { verb: 'EAT' }, questionRole: 'directObject' }, interrogative: true,
    } as NonNullable<PhrasePlan['contentObject']>)).toBe('男は女が猫が何を食べるか知っているかどうか尋ねます。');
  });

  test('the subject clause, the past of a question, the past negative, and THINK\'s と', () => {
    expect(say({
      subject: np('THING'), contentSubject: hasBook, verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np('RIGHT_CORRECT') } },
    }, 'ja')).toBe('猫が本を持っていることが正しいです。');
    expect(ja('ASK', { ...hasBook, verbPhrase: { verb: 'HAVE', tense: 'past' }, interrogative: true })).toBe('男は猫が本を持っていたかどうか尋ねます。');
    expect(ja('SAY', { ...hasBook, verbPhrase: { verb: 'HAVE', tense: 'past', negative: true } })).toBe('男は猫が本を持っていなかったと言います。');
    expect(ja('THINK', hasBook)).toBe('男は猫が本を持っていると考えます。');
  });

  test('regression: a relative clause, an adverbial clause and a modal keep the dictionary form', () => {
    expect(say(clause(np('CAT', { relative: { verbPhrase: { verb: 'HAVE' }, directObject: np('BOOK') } }), 'RUN'), 'ja')).toBe('本を持つ猫は走ります。');
    expect(say({ subject: man, verbPhrase: { verb: 'RUN' }, adverbialClause: { conjunction: 'because', clause: hasBook } }, 'ja'))
      .toBe('男は猫が本を持つので走ります。');
    expect(ja('SAY', { ...hasBook, verbPhrase: { verb: 'HAVE', modals: ['MUST'] } })).toBe('男は猫が本を持つ必要があると言います。');
  });

  test('regression: an event verb, KNOW\'s negative, the progressive and the main clause are right', () => {
    expect(ja('SAY', { ...hasBook, verbPhrase: { verb: 'EAT' } })).toBe('男は猫が本を食べると言います。');
    expect(ja('SAY', { ...knowsCat, verbPhrase: { verb: 'KNOW', negative: true } })).toBe('男は女が猫を知らないと言います。');
    expect(ja('SAY', { ...hasBook, verbPhrase: { verb: 'HAVE', aspect: 'progressive' } })).toBe('男は猫が本を持っていると言います。');
    expect(say(clause(np('CAT'), 'HAVE', { directObject: np('BOOK') }), 'ja')).toBe('猫は本を持っています。');
    expect(sayAll(clause(man, 'ASK', { contentObject: { ...hasBook, interrogative: true } }))).toMatchObject({
      en: 'the man asks whether the cat has the book.', de: 'der Mann fragt, ob der Kater das Buch hat.',
    });
  });
});

// A317. TELL's addressee is a terminus ("racconta al cane che…", pinned above), but English writes it
// bare ahead of a content clause ("tells the dog that…"), so a plan can put it in the direct object.
// The other languages then read the narrating sense's object: "racconta il cane che il gatto corre",
// "raconte le chien que", "erzählt den Hund, dass", "cuenta el perro que", 犬を伝えます, "conta o cão
// que", and a pronoun "erzählt dich" / あなたを. Beside a content clause the object is the addressee
// and should render as the terminus does. Whether TELL + a content clause should also switch to the
// saying verb (dice, dit, sagt, dice, diz) is a Decision in the bug file; it moves the terminus test
// above with it.
describe('known bugs: TELL with a direct object and a content clause makes the addressee the told thing (A317)', () => {
  const runs = { subject: np('CAT'), verbPhrase: { verb: 'RUN' } };

  test.fails('a noun addressee', () => {
    expect(sayAll(clause(np('MAN'), 'TELL', { directObject: np('DOG'), contentObject: runs }))).toEqual({
      en: 'the man tells the dog that the cat runs.', it: "l'uomo racconta al cane che il gatto corre.",
      fr: "l'homme raconte au chien que le chat court.", de: 'der Mann erzählt dem Hund, dass der Kater läuft.',
      es: 'el hombre cuenta al perro que el gato corre.', ja: '男は猫が走ると犬に伝えます。', pt: 'o homem conta ao cão que o gato corre.',
    });
  });

  test.fails('a feminine noun addressee', () => {
    expect(sayAll(clause(np('MAN'), 'TELL', { directObject: np('WOMAN'), contentObject: runs }))).toMatchObject({
      it: "l'uomo racconta alla donna che il gatto corre.", fr: "l'homme raconte à la femme que le chat court.",
      de: 'der Mann erzählt der Frau, dass der Kater läuft.', ja: '男は猫が走ると女に伝えます。', pt: 'o homem conta à mulher que o gato corre.',
    });
  });

  test.fails('a pronoun addressee', () => {
    expect(sayAll(clause(np('MAN'), 'TELL', { directObject: np('SECOND_PERSON'), contentObject: runs }))).toMatchObject({
      de: 'der Mann erzählt dir, dass der Kater läuft.', ja: '男は猫が走るとあなたに伝えます。',
    });
  });

  test('regression: the terminus addressee, the story object, and the clitic addressee in Romance', () => {
    expect(sayAll(clause(np('MAN'), 'TELL', { complements: { terminus: { phrase: np('DOG') } }, contentObject: runs }))).toMatchObject({
      it: "l'uomo racconta al cane che il gatto corre.", de: 'der Mann erzählt dem Hund, dass der Kater läuft.', ja: '男は猫が走ると犬に伝えます。',
    });
    expect(say(clause(np('MAN'), 'TELL', { directObject: np('STORY'), complements: { terminus: { phrase: np('DOG') } } }), 'it'))
      .toBe("l'uomo racconta la storia al cane.");
    expect(sayAll(clause(np('MAN'), 'TELL', { directObject: np('SECOND_PERSON'), contentObject: runs }))).toMatchObject({
      it: "l'uomo ti racconta che il gatto corre.", fr: "l'homme te raconte que le chat court.", es: 'el hombre te cuenta que el gato corre.',
    });
  });
});
