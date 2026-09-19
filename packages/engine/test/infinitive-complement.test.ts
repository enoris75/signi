import { describe, expect, test } from 'vitest';
import type { InfinitiveComplement, LanguageCode, PhrasePlan } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// An infinitive complement (PhrasePlan.infinitiveComplement) is a clause another clause's predicate
// governs: "the cat is able TO EAT", "to desire TO ACT". Its subject is the governing clause's own, so
// it is never spoken, and it renders as an infinitive citation. The word linking it belongs to the
// governor — the predicate adjective when there is one, else the verb — so the lexeme names it:
// capace DI, obbligato A, capable DE, capaz DE; desiderare / désirer / desear / desejar take it bare.
// English links with "to", German extraposes a zu-infinitive after a comma, and Japanese puts a こと
// clause ahead of the predicate, marked with the governor's particle (が / を).

const acts = (verb = 'ACT', extra: Partial<InfinitiveComplement> = {}): InfinitiveComplement => ({
  verbPhrase: { verb },
  ...extra,
});
const predicate = (adjective: string) => ({ predicative: { phrase: np(adjective) } });

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Record<LanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
}

describe('the modal definitions (localization C09)', () => {
  test('MUST is "to be obliged to act"', () => {
    expect(definitionAll('MUST')).toEqual({
      en: 'to be obliged to act.',
      it: 'essere obbligato ad agire.', // the euphonic d before another a
      fr: "être obligé d'agir.",
      de: 'verpflichtet sein, zu handeln.',
      es: 'estar obligado a actuar.', // a duty that holds, not a trait: estar
      ja: '行動することが義務的である。',
      pt: 'estar obrigado a agir.',
    });
  });

  test('CAN is "to be able to act"', () => {
    expect(definitionAll('CAN')).toEqual({
      en: 'to be able to act.',
      it: 'essere capace di agire.',
      fr: "être capable d'agir.",
      de: 'fähig sein, zu handeln.',
      es: 'ser capaz de actuar.',
      ja: '行動することが可能である。',
      pt: 'ser capaz de agir.',
    });
  });

  test('WILL is "to desire to act", never its own lemma', () => {
    expect(definitionAll('WILL')).toEqual({
      en: 'to desire to act.',
      it: 'desiderare agire.',
      fr: 'désirer agir.',
      de: 'wünschen, zu handeln.',
      es: 'desear actuar.',
      ja: '行動することを望む。',
      pt: 'desejar agir.',
    });
  });
});

describe('infinitive complement', () => {
  test('a predicate adjective governs it with its own preposition', () => {
    expect(sayAll(clause(np('CAT', { gender: 'fem' }), 'BE', {
      complements: predicate('ABLE'),
      infinitiveComplement: acts('EAT', { directObject: np('FOOD') }),
    }))).toEqual({
      en: 'the cat is able to eat the food.',
      it: 'la gatta è capace di mangiare il cibo.',
      fr: 'la chatte est capable de manger la nourriture.',
      de: 'die Katze ist fähig, das Essen zu essen.',
      es: 'la gata es capaz de comer la comida.',
      ja: '猫は食べ物を食べることが可能です。',
      pt: 'a gata é capaz de comer a comida.',
    });
  });

  test('a verb governs it bare in the Romance languages and with を in Japanese', () => {
    expect(sayAll(clause(np('DOG'), 'DESIRE', { infinitiveComplement: acts('EAT', { directObject: np('FOOD') }) }))).toEqual({
      en: 'the dog desires to eat the food.',
      it: 'il cane desidera mangiare il cibo.',
      fr: 'le chien désire manger la nourriture.',
      de: 'der Hund wünscht, das Essen zu essen.',
      es: 'el perro desea comer la comida.',
      ja: '犬は食べ物を食べることを望んでいます。', // DESIRE is a state: 〜ている
      pt: 'o cão deseja comer a comida.',
    });
  });

  test('its predicate adjective agrees with the controller, the governing clause\'s subject', () => {
    expect(sayAll(clause(np('CAT', { gender: 'fem' }), 'DESIRE', {
      infinitiveComplement: acts('BE', { complements: predicate('CAREFUL') }),
    }))).toEqual({
      en: 'the cat desires to be careful.',
      it: 'la gatta desidera essere attenta.',
      fr: 'la chatte désire être prudente.',
      de: 'die Katze wünscht, vorsichtig zu sein.',
      es: 'la gata desea ser cuidadosa.',
      ja: '猫は慎重であることを望んでいます。',
      pt: 'a gata deseja ser cuidadosa.',
    });
  });

  test('the governing clause keeps its tense, agreement and copula choice', () => {
    expect(sayAll(clause(np('CAT', { number: 'plural' }), 'BE', {
      verbPhrase: { tense: 'past' },
      complements: predicate('OBLIGED'),
      infinitiveComplement: acts('EAT', { directObject: np('FOOD') }),
    }))).toEqual({
      en: 'the cats were obliged to eat the food.',
      it: 'i gatti erano obbligati a mangiare il cibo.',
      fr: 'les chats étaient obligés de manger la nourriture.',
      de: 'die Kater waren verpflichtet, das Essen zu essen.',
      es: 'los gatos estaban obligados a comer la comida.',
      ja: '猫は食べ物を食べることが義務的でした。',
      pt: 'os gatos estavam obrigados a comer a comida.',
    });
  });

  test('the governing clause negates on itself', () => {
    expect(sayAll(clause(np('DOG'), 'BE', {
      verbPhrase: { negative: true },
      complements: predicate('ABLE'),
      infinitiveComplement: acts('RUN'),
    }))).toEqual({
      en: 'the dog is not able to run.',
      it: 'il cane non è capace di correre.',
      fr: "le chien n'est pas capable de courir.",
      de: 'der Hund ist nicht fähig, zu laufen.',
      es: 'el perro no es capaz de correr.',
      ja: '犬は走ることが可能ではありません。',
      pt: 'o cão não é capaz de correr.',
    });
  });

  // Japanese is left out: a negated こと clause takes the citation's polite negative, 行動しません (B13).
  test('the infinitive negates on its own, inside the link', () => {
    expect(sayAll({
      ...clause(np('GENERIC_PERSON'), 'BE', { complements: predicate('ABLE'), infinitiveComplement: acts('ACT', { verbPhrase: { verb: 'ACT', negative: true } }) }),
      infinitive: true,
    })).toMatchObject({
      en: 'to be able not to act.',
      it: 'essere capace di non agire.',
      fr: 'être capable de ne pas agir.', // "de" keeps its e before "ne"
      de: 'fähig sein, nicht zu handeln.',
      es: 'ser capaz de no actuar.',
      pt: 'ser capaz de não agir.',
    });
  });

  test('an infinitive may govern one in turn', () => {
    expect(sayAll({
      ...clause(np('GENERIC_PERSON'), 'DESIRE', { infinitiveComplement: acts('BE', { complements: predicate('ABLE'), infinitiveComplement: acts() }) }),
      infinitive: true,
    })).toEqual({
      en: 'to desire to be able to act.',
      it: 'desiderare essere capace di agire.',
      fr: "désirer être capable d'agir.",
      de: 'wünschen, fähig zu sein, zu handeln.',
      es: 'desear ser capaz de actuar.',
      ja: '行動することが可能であることを望む。',
      pt: 'desejar ser capaz de agir.',
    });
  });

  test('Italian "a" takes the euphonic d only before another a', () => {
    const obliged = (verb: string) => sayAll({
      ...clause(np('GENERIC_PERSON'), 'BE', { complements: predicate('OBLIGED'), infinitiveComplement: acts(verb) }),
      infinitive: true,
    }).it;
    expect(obliged('ACT')).toBe('essere obbligato ad agire.');
    expect(obliged('EAT')).toBe('essere obbligato a mangiare.');
  });

  test('it rides a conditional main clause behind the clause, after the "if" clause', () => {
    const plan: PhrasePlan = {
      ...clause(np('DOG'), 'BE', { complements: predicate('ABLE'), infinitiveComplement: acts('RUN') }),
      condition: clause(np('CAT'), 'EAT'),
    };
    expect(sayAll(plan)).toMatchObject({
      en: 'if the cat ate, the dog would be able to run.',
      it: 'se il gatto mangiasse, il cane sarebbe capace di correre.',
      de: 'wenn der Kater essen würde, würde der Hund fähig sein, zu laufen.',
      ja: 'もし猫が食べたら、犬は走ることが可能です。',
    });
  });
});

// A citation's subject is nobody. Italian used to agree its predicate adjective with the impersonal si
// the generic subject stands for, giving the masculine plural of "si è attenti" to the citation.
describe('Italian citation agreement', () => {
  test('a citation\'s predicate adjective takes the citation form', () => {
    expect(sayAll({ ...clause(np('GENERIC_PERSON'), 'BE', { complements: predicate('CAREFUL') }), infinitive: true }).it)
      .toBe('essere attento.');
  });

  test('regression: under the impersonal si the controlled infinitive still agrees in the plural', () => {
    expect(sayAll(clause(np('GENERIC_PERSON'), 'DESIRE', { infinitiveComplement: acts('BE', { complements: predicate('HAPPY') }) })).it)
      .toBe('si desidera essere felici.');
    expect(sayAll(clause(np('GENERIC_PERSON'), 'BE', { complements: predicate('TIRED') })).it).toBe('si è stanchi.');
  });
});

// The Japanese citation of a copula closes in the plain written style, as a verb's closes on its
// dictionary form — never the polite です of a sentence.
describe('Japanese copula citation', () => {
  test('closes on である / い / ている', () => {
    const be = (adjective: string, negative = false) =>
      sayAll({ ...clause(np('GENERIC_PERSON'), 'BE', { verbPhrase: { negative }, complements: predicate(adjective) }), infinitive: true }).ja;
    expect(be('CAREFUL')).toBe('慎重である。');
    expect(be('BIG')).toBe('大きい。');
    expect(be('TIRED')).toBe('疲れている。');
    expect(be('CAREFUL', true)).toBe('慎重ではない。');
  });
});

// The words seeded for the modal definitions: ACT and DESIRE conjugate, ABLE and OBLIGED agree.
describe('ACT and DESIRE conjugate', () => {
  test('ACT in the present, past and future', () => {
    expect(sayAll(clause(np('DOG'), 'ACT'))).toEqual({
      en: 'the dog acts.',
      it: 'il cane agisce.',
      fr: 'le chien agit.',
      de: 'der Hund handelt.',
      es: 'el perro actúa.',
      ja: '犬は行動します。',
      pt: 'o cão age.',
    });
    expect(sayAll(clause(np('FIRST_PERSON'), 'ACT'))).toMatchObject({
      it: 'agisco.', fr: "j'agis.", de: 'ich handle.', es: 'actúo.', pt: 'ajo.',
    });
    expect(sayAll(clause(np('DOG', { number: 'plural' }), 'ACT', { verbPhrase: { tense: 'past' } }))).toMatchObject({
      en: 'the dogs acted.', it: 'i cani agirono.', fr: 'les chiens agirent.', de: 'die Hunde handelten.',
      es: 'los perros actuaron.', ja: '犬は行動しました。', pt: 'os cães agiram.',
    });
    expect(sayAll(clause(np('DOG'), 'ACT', { verbPhrase: { tense: 'future' } }))).toMatchObject({
      en: 'the dog will act.', it: 'il cane agirà.', fr: 'le chien agira.', de: 'der Hund wird handeln.',
      es: 'el perro actuará.', pt: 'o cão agirá.',
    });
  });

  test('DESIRE takes an object, and its past is the imperfect of a state', () => {
    expect(sayAll(clause(np('CAT'), 'DESIRE', { directObject: np('FOOD') }))).toEqual({
      en: 'the cat desires the food.',
      it: 'il gatto desidera il cibo.',
      fr: 'le chat désire la nourriture.',
      de: 'der Kater wünscht das Essen.',
      es: 'el gato desea la comida.',
      ja: '猫は食べ物を望んでいます。',
      pt: 'o gato deseja a comida.',
    });
    expect(sayAll(clause(np('CAT'), 'DESIRE', { directObject: np('FOOD'), verbPhrase: { tense: 'past' } }))).toMatchObject({
      en: 'the cat desired the food.', it: 'il gatto desiderava il cibo.', es: 'el gato deseaba la comida.',
      pt: 'o gato desejava a comida.', de: 'der Kater wünschte das Essen.',
    });
  });
});

describe('ABLE and OBLIGED agree as predicates', () => {
  test('ABLE is ser / ser, OBLIGED the transient estar / estar', () => {
    const is = (adjective: string) =>
      sayAll(clause(np('CAT', { gender: 'fem', number: 'plural' }), 'BE', { complements: predicate(adjective) }));
    expect(is('ABLE')).toMatchObject({
      en: 'the cats are able.', it: 'le gatte sono capaci.', fr: 'les chattes sont capables.',
      es: 'las gatas son capaces.', pt: 'as gatas são capazes.', de: 'die Katzen sind fähig.',
    });
    expect(is('OBLIGED')).toMatchObject({
      en: 'the cats are obliged.', it: 'le gatte sono obbligate.', fr: 'les chattes sont obligées.',
      es: 'las gatas están obligadas.', pt: 'as gatas estão obrigadas.', de: 'die Katzen sind verpflichtet.',
    });
  });
});
