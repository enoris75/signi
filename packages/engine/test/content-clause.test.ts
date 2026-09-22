import { describe, expect, test } from 'vitest';
import type { LanguageCode, PhrasePlan } from '@signi/shared';
import { np, say, sayAll } from './harness.js';
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
