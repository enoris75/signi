import { describe, expect, test } from 'vitest';
import { clause, np, sayAll } from './harness.js';

// A CLAUSE OF PURPOSE (localization C12): what the act is done *for*. It is an adjunct, not a
// governed complement — no word licenses it, and its unspoken subject is always the clause's own
// — so, unlike an infinitive complement, it takes no link from a lexeme. Each language writes the
// final clause its own way, and the whole of that is the engines' business:
//
//   en  the bare infinitive · it per · fr pour · es, pt para
//   de  the "um … zu" frame, extraposed behind the clause after a comma
//   ja  〜ために on the dictionary form, *ahead* of what it is done for
describe('a clause of purpose', () => {
  test('follows the clause it hangs off, with its own object', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', {
      purpose: { verbPhrase: { verb: 'EAT' }, directObject: np('FOOD') },
    }))).toEqual({
      en: 'the cat runs to eat the food.',
      it: 'il gatto corre per mangiare il cibo.',
      fr: 'le chat court pour manger la nourriture.',
      // German extraposes the zu-infinitive behind the whole clause, inside "um … zu".
      de: 'der Kater läuft, um das Essen zu fressen.',
      es: 'el gato corre para comer la comida.',
      // Japanese puts it *before* the predicate it explains, closed by ために.
      ja: '猫は食べ物を食べるために走ります。',
      pt: 'o gato corre para comer a comida.',
    });
  });

  test('carries complements of its own', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', {
      purpose: { verbPhrase: { verb: 'EAT' }, complements: { locative: { phrase: np('HOUSE') } } },
    }))).toEqual({
      en: 'the cat runs to eat in the house.',
      it: 'il gatto corre per mangiare nella casa.',
      fr: 'le chat court pour manger dans la maison.',
      de: 'der Kater läuft, um im Haus zu fressen.',
      es: 'el gato corre para comer en la casa.',
      ja: '猫は家で食べるために走ります。',
      pt: 'o gato corre para comer na casa.',
    });
  });

  test('may be negated — the act is done so as NOT to happen', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', {
      purpose: { verbPhrase: { verb: 'EAT', negative: true } },
    }))).toMatchObject({
      en: 'the cat runs not to eat.',
      it: 'il gatto corre per non mangiare.',
      fr: 'le chat court pour ne pas manger.',
      de: 'der Kater läuft, um nicht zu fressen.',
      es: 'el gato corre para no comer.',
      pt: 'o gato corre para não comer.',
      // ja is left out: the citation's negative is the polite 食べません (docs/bugs B13), which
      // ために then attaches to. The purpose clause is that gap's third call site, not a new one.
    });
  });

  test('a UI label is a command with a purpose — the shape every "click to …" takes', () => {
    expect(sayAll({
      subject: np('SECOND_PERSON', { definiteness: 'bare' }),
      verbPhrase: { verb: 'CLICK' },
      imperative: true,
      imperativeRegister: 'instruction',
      purpose: { verbPhrase: { verb: 'CHANGE' } },
    })).toEqual({
      en: 'click to change.',
      it: 'clicca per cambiare.',
      fr: 'cliquer pour changer.',
      de: 'klicken, um zu ändern.',
      es: 'clicar para cambiar.',
      ja: '変えるためにクリック。',
      pt: 'clicar para mudar.',
    });
  });

  test('a verbless period has no act to do anything for, so it drops the purpose', () => {
    expect(sayAll({ subject: np('CAT'), purpose: { verbPhrase: { verb: 'EAT' } } })).toEqual({
      en: 'the cat.',
      it: 'il gatto.',
      fr: 'le chat.',
      de: 'der Kater.',
      es: 'el gato.',
      ja: '猫。',
      pt: 'o gato.',
    });
  });
});
