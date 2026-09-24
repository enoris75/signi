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
// English links with "to", German extraposes a zu-infinitive (after a comma when it is a group, A266),
// and Japanese puts a こと clause ahead of the predicate, marked with the governor's particle (が / を).

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
      de: 'verpflichtet sein zu handeln.',
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
      de: 'fähig sein zu handeln.',
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
      de: 'wünschen zu handeln.',
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
      de: 'die Katze ist fähig, das Essen zu fressen.',
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
      de: 'der Hund wünscht, das Essen zu fressen.',
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
      de: 'die Kater waren verpflichtet, das Essen zu fressen.',
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
      de: 'der Hund ist nicht fähig zu laufen.',
      es: 'el perro no es capaz de correr.',
      ja: '犬は走ることが可能ではありません。',
      pt: 'o cão não é capaz de correr.',
    });
  });

  // Japanese negates the こと clause with the citation's plain negative, 行動しない (B13).
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
      ja: '行動しないことが可能である。',
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
      de: 'wünschen, fähig zu sein zu handeln.',
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
      de: 'wenn der Kater fressen würde, würde der Hund fähig sein zu laufen.',
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

// A266. German sets every extraposed zu-infinitive off with a comma, the bare one included: "der
// Kater braucht, zu laufen". A zu-infinitive with nothing of its own takes none — "er braucht zu
// laufen", "er versucht zu laufen", "fähig zu handeln" — and after *brauchen*, which governs its
// infinitive the way a modal does, the comma is not merely unusual but wrong. The prospective already
// draws the line here (`prospectiveFrame`: "ist im Begriff zu essen", "im Begriff, die Maus zu
// essen"); a group that holds more than its infinitive keeps the comma, as does "um … zu".
describe('known bugs: German sets a bare zu-infinitive off with a comma (A266)', () => {
  test('a bare zu-infinitive takes no comma, under a verb and under an adjective', () => {
    expect(sayAll(clause(np('CAT'), 'NEED', { infinitiveComplement: acts('RUN') })).de).toBe('der Kater braucht zu laufen.');
    expect(sayAll(clause(np('DOG'), 'DESIRE', { infinitiveComplement: acts() })).de).toBe('der Hund wünscht zu handeln.');
    expect(sayAll(clause(np('CAT'), 'BE', { complements: predicate('ABLE'), infinitiveComplement: acts('EAT') })).de)
      .toBe('der Kater ist fähig zu fressen.');
  });

  test('a separable zu-infinitive is bare too, and so is one under any tense of its governor', () => {
    expect(sayAll(clause(np('CAT'), 'NEED', { infinitiveComplement: acts('RETURN') })).de).toBe('der Kater braucht zurückzukehren.');
    expect(sayAll(clause(np('CAT'), 'NEED', { verbPhrase: { tense: 'past' }, infinitiveComplement: acts('RUN') })).de)
      .toBe('der Kater brauchte zu laufen.');
    expect(sayAll(clause(np('CAT'), 'NEED', { verbPhrase: { tense: 'future' }, infinitiveComplement: acts('RUN') })).de)
      .toBe('der Kater wird brauchen zu laufen.');
  });

  test('its own negation, adverb, complement or modal chain makes it a group, with the comma', () => {
    expect(sayAll(clause(np('CAT'), 'NEED', { infinitiveComplement: acts('RUN', { verbPhrase: { verb: 'RUN', negative: true } }) })).de)
      .toBe('der Kater braucht, nicht zu laufen.');
    expect(sayAll(clause(np('CAT'), 'NEED', { infinitiveComplement: acts('RUN', { verbPhrase: { verb: 'RUN', modifier: 'WELL' } }) })).de)
      .toBe('der Kater braucht, gut zu laufen.');
    expect(sayAll(clause(np('CAT'), 'NEED', { infinitiveComplement: acts('RUN', { complements: { comitative: { phrase: np('DOG', { definiteness: 'definite' }) } } }) })).de)
      .toBe('der Kater braucht, mit dem Hund zu laufen.');
    expect(sayAll({ subject: np('GENERIC_PERSON'), verbPhrase: { verb: 'DESIRE' }, infinitiveComplement: { verbPhrase: { verb: 'WILL' }, infinitiveComplement: acts() }, infinitive: true }).de)
      .toBe('wünschen, handeln zu wollen.');
  });

  test('a nested group keeps its comma, and the bare infinitive inside it has none', () => {
    expect(definitionAll('LET').de).toBe('eine Person veranlassen, berechtigt zu sein zu handeln.');
  });

  test('regression: a group with more than its infinitive, and "um … zu", keep the comma', () => {
    expect(sayAll(clause(np('CAT'), 'NEED', { infinitiveComplement: acts('EAT', { directObject: np('FOOD') }) })).de)
      .toBe('der Kater braucht, das Essen zu fressen.');
    expect(sayAll(clause(np('MAN'), 'RUN', { purpose: { verbPhrase: { verb: 'CRY' } } })).de).toBe('der Mann läuft, um zu weinen.');
  });
});

// P09-E43. An infinitive whose controller is the governing verb's object, read with that verb's
// lexical object case (C35's `object_case`) and its `infinitive_link`: the Romance four put ALLOW's
// and TELL_ORDER's controller in the dative (*al gatto, au chat, al gato, ao gato*), German
// *erlauben* declines it so (`controller_case`), Japanese marks it に, and HELP_VERB keeps its
// accusative in Romance but links with *a* / *à*. TELL governing an infinitive is TELL_ORDER, its
// `infinitive_sense`. LET, the bare-infinitive causative, does not move.
describe('an infinitive controlled by a dative object (P09-E43)', () => {
  const runs = (control: InfinitiveComplement['control'] = 'object'): InfinitiveComplement => ({ verbPhrase: { verb: 'RUN' }, control });
  const governs = (verb: string, extra: Parameters<typeof clause>[2] = {}) =>
    sayAll(clause(np('MAN'), verb, { directObject: np('CAT'), infinitiveComplement: runs(), ...extra }));

  test('the man allows the cat to run', () => {
    expect(governs('ALLOW')).toEqual({
      en: 'the man allows the cat to run.',
      it: "l'uomo permette al gatto di correre.",
      fr: "l'homme permet au chat de courir.",
      de: 'der Mann erlaubt dem Kater zu laufen.',
      es: 'el hombre permite al gato correr.',
      ja: '男は猫に走ることを許します。',
      pt: 'o homem permite ao gato correr.',
    });
  });

  test('the man helps the cat to run: an accusative, and the link', () => {
    expect(governs('HELP_VERB')).toEqual({
      en: 'the man helps the cat to run.',
      it: "l'uomo aiuta il gatto a correre.",
      fr: "l'homme aide le chat à courir.",
      de: 'der Mann hilft dem Kater zu laufen.',
      es: 'el hombre ayuda al gato a correr.', // the personal a, not a dative
      ja: '男は猫が走ることを手伝います。',
      pt: 'o homem ajuda o gato a correr.',
    });
  });

  test('the man tells the cat to run: TELL_ORDER, not the narrating TELL', () => {
    expect(governs('TELL')).toEqual({
      en: 'the man tells the cat to run.',
      it: "l'uomo dice al gatto di correre.",
      fr: "l'homme dit au chat de courir.",
      de: 'der Mann sagt dem Kater zu laufen.',
      es: 'el hombre manda al gato correr.', // *decir que* is a finite clause; *mandar* takes the infinitive
      ja: '男は猫に走るように言います。',
      pt: 'o homem diz ao gato para correr.',
    });
  });

  test('the past and the negation stay on the governing verb', () => {
    const pastNegative = { verbPhrase: { tense: 'past' as const, negative: true } };
    expect(governs('ALLOW', pastNegative)).toEqual({
      en: 'the man did not allow the cat to run.',
      it: "l'uomo non permise al gatto di correre.",
      fr: "l'homme ne permit pas au chat de courir.",
      de: 'der Mann erlaubte dem Kater nicht zu laufen.',
      es: 'el hombre no permitió al gato correr.',
      ja: '男は猫に走ることを許しませんでした。',
      pt: 'o homem não permitiu ao gato correr.',
    });
    expect(governs('TELL', pastNegative)).toMatchObject({
      it: "l'uomo non disse al gatto di correre.", fr: "l'homme ne dit pas au chat de courir.",
      de: 'der Mann sagte dem Kater nicht zu laufen.', es: 'el hombre no mandó al gato correr.',
      ja: '男は猫に走るように言いませんでした。', pt: 'o homem não disse ao gato para correr.',
    });
    expect(governs('HELP_VERB', pastNegative)).toMatchObject({
      it: "l'uomo non aiutò il gatto a correre.", fr: "l'homme n'aida pas le chat à courir.",
      es: 'el hombre no ayudó al gato a correr.', pt: 'o homem não ajudou o gato a correr.',
    });
  });

  test('the dative contracts with a plural article, and the infinitive keeps its own object', () => {
    expect(sayAll(clause(np('MAN'), 'ALLOW', {
      directObject: np('CAT', { number: 'plural' }),
      infinitiveComplement: { verbPhrase: { verb: 'EAT' }, directObject: np('FOOD'), control: 'object' },
    }))).toEqual({
      en: 'the man allows the cats to eat the food.',
      it: "l'uomo permette ai gatti di mangiare il cibo.",
      fr: "l'homme permet aux chats de manger la nourriture.",
      de: 'der Mann erlaubt den Katern, das Essen zu fressen.',
      es: 'el hombre permite a los gatos comer la comida.',
      ja: '男は猫に食べ物を食べることを許します。',
      pt: 'o homem permite aos gatos comer a comida.',
    });
  });

  test('a pronoun controller is the dative clitic in Italian, French and Spanish', () => {
    expect(governs('ALLOW', { directObject: np('THIRD_PERSON', { gender: 'fem' }) })).toMatchObject({
      en: 'the man allows her to run.',
      it: "l'uomo le permette di correre.",
      fr: "l'homme lui permet de courir.",
      de: 'der Mann erlaubt ihr zu laufen.',
      es: 'el hombre le permite correr.',
      ja: '男は彼女に走ることを許します。',
    });
    expect(governs('ALLOW', { directObject: np('THIRD_PERSON', { number: 'plural' }) })).toMatchObject({
      it: "l'uomo gli permette di correre.", fr: "l'homme leur permet de courir.", es: 'el hombre les permite correr.',
    });
    expect(governs('TELL', { directObject: np('FIRST_PERSON') })).toMatchObject({
      it: "l'uomo mi dice di correre.", fr: "l'homme me dit de courir.", es: 'el hombre me manda correr.',
    });
  });

  test('without an infinitive ALLOW takes a plain object, and TELL still narrates', () => {
    expect(sayAll(clause(np('MAN'), 'ALLOW', { directObject: np('FOOD') }))).toEqual({
      en: 'the man allows the food.',
      it: "l'uomo permette il cibo.",
      fr: "l'homme permet la nourriture.",
      de: 'der Mann erlaubt das Essen.',
      es: 'el hombre permite la comida.',
      ja: '男は食べ物を許します。',
      pt: 'o homem permite a comida.',
    });
    expect(sayAll(clause(np('WOMAN'), 'TELL', { directObject: np('STORY') }))).toMatchObject({
      it: 'la donna racconta la storia.', de: 'die Frau erzählt die Geschichte.',
    });
  });

  test('ALLOW conjugates, and takes its compound past', () => {
    expect(sayAll(clause(np('FIRST_PERSON'), 'ALLOW', { verbPhrase: { tense: 'future' }, directObject: np('FOOD') }))).toMatchObject({
      en: 'I will allow the food.', it: 'permetterò il cibo.', fr: 'je permettrai la nourriture.',
      de: 'ich werde das Essen erlauben.', es: 'permitiré la comida.', pt: 'permitirei a comida.',
    });
    expect(sayAll(clause(np('FIRST_PERSON', { number: 'plural' }), 'ALLOW', { verbPhrase: { tense: 'past' }, directObject: np('FOOD') }))).toEqual({
      en: 'we allowed the food.', it: 'permettemmo il cibo.', fr: 'nous permîmes la nourriture.',
      de: 'wir erlaubten das Essen.', es: 'permitimos la comida.', ja: '私たちは食べ物を許しました。', pt: 'permitimos a comida.',
    });
    expect(governs('ALLOW', { verbPhrase: { aspect: 'resultative' } })).toMatchObject({
      it: "l'uomo ha permesso al gatto di correre.", fr: "l'homme a permis au chat de courir.",
      de: 'der Mann hat dem Kater erlaubt zu laufen.', es: 'el hombre ha permitido al gato correr.',
    });
  });

  test('regression: LET is the bare-infinitive causative still', () => {
    expect(governs('LET')).toEqual({
      en: 'the man lets the cat run.',
      it: "l'uomo lascia il gatto correre.",
      fr: "l'homme laisse le chat courir.",
      de: 'der Mann lässt den Kater laufen.',
      es: 'el hombre deja el gato correr.',
      ja: '男は猫を走らせます。',
      pt: 'o homem deixa o gato correr.',
    });
  });

  test('ALLOW is "to let a person act" (B85)', () => {
    expect(definitionAll('ALLOW')).toEqual({
      en: 'to let a person act.',
      it: 'lasciare una persona agire.',
      fr: 'laisser une personne agir.',
      de: 'eine Person handeln lassen.',
      es: 'dejar a una persona actuar.',
      ja: '人を行動させる。',
      pt: 'deixar uma pessoa agir.',
    });
  });
});

// P09-E42. The aspectual verbs over another verb's activity. Each language spells the complement its
// own way, and the governing lexeme names it: English and Spanish *seguir* take the gerund
// (`complement_form`), the Romance links are TRY's (`infinitive_link`), Japanese やめる takes a の
// clause (its link, のを), German *weiter-* rides the governed verb as its particle and Japanese 続ける
// compounds onto its stem (`fuseGovernedVerb`). TRY, NEED and DESIRE do not move.
describe('stop doing, continue doing (P09-E42)', () => {
  const doing = (verb: string, extra: Parameters<typeof clause>[2] = {}, subject = np('CAT')) =>
    sayAll(clause(subject, verb, { infinitiveComplement: acts('RUN'), ...extra }));

  test('the cat stops running', () => {
    expect(doing('STOP_DOING')).toEqual({
      en: 'the cat stops running.',
      it: 'il gatto smette di correre.',
      fr: 'le chat arrête de courir.',
      de: 'der Kater hört auf zu laufen.',
      es: 'el gato deja de correr.',
      ja: '猫は走るのをやめます。',
      pt: 'o gato para de correr.',
    });
  });

  test('the cat continues running', () => {
    expect(doing('CONTINUE_DOING')).toEqual({
      en: 'the cat continues running.',
      it: 'il gatto continua a correre.',
      fr: 'le chat continue à courir.',
      de: 'der Kater läuft weiter.',
      es: 'el gato sigue corriendo.',
      ja: '猫は走り続けます。',
      pt: 'o gato continua a correr.',
    });
  });

  test('the past', () => {
    expect(doing('STOP_DOING', { verbPhrase: { tense: 'past' } })).toEqual({
      en: 'the cat stopped running.',
      it: 'il gatto smise di correre.',
      fr: 'le chat arrêta de courir.',
      de: 'der Kater hörte auf zu laufen.',
      es: 'el gato dejó de correr.',
      ja: '猫は走るのをやめました。',
      pt: 'o gato parou de correr.',
    });
    expect(doing('CONTINUE_DOING', { verbPhrase: { tense: 'past' } })).toEqual({
      en: 'the cat continued running.',
      it: 'il gatto continuò a correre.',
      fr: 'le chat continua à courir.',
      de: 'der Kater lief weiter.',
      es: 'el gato siguió corriendo.',
      ja: '猫は走り続けました。',
      pt: 'o gato continuou a correr.',
    });
  });

  test('negated', () => {
    expect(doing('STOP_DOING', { verbPhrase: { negative: true } })).toEqual({
      en: 'the cat does not stop running.',
      it: 'il gatto non smette di correre.',
      fr: "le chat n'arrête pas de courir.",
      de: 'der Kater hört nicht auf zu laufen.',
      es: 'el gato no deja de correr.',
      ja: '猫は走るのをやめません。',
      pt: 'o gato não para de correr.',
    });
    expect(doing('CONTINUE_DOING', { verbPhrase: { negative: true } })).toEqual({
      en: 'the cat does not continue running.',
      it: 'il gatto non continua a correre.',
      fr: 'le chat ne continue pas à courir.',
      de: 'der Kater läuft nicht weiter.',
      es: 'el gato no sigue corriendo.',
      ja: '猫は走り続けません。',
      pt: 'o gato não continua a correr.',
    });
  });

  test('the governed verb brings its object: the gerund takes a clitic, German declines it before weiter', () => {
    const eats = { infinitiveComplement: acts('EAT', { directObject: np('FOOD') }) };
    expect(doing('CONTINUE_DOING', eats, np('CAT', { number: 'plural' }))).toEqual({
      en: 'the cats continue eating the food.',
      it: 'i gatti continuano a mangiare il cibo.',
      fr: 'les chats continuent à manger la nourriture.',
      de: 'die Kater fressen das Essen weiter.',
      es: 'los gatos siguen comiendo la comida.',
      ja: '猫は食べ物を食べ続けます。',
      pt: 'os gatos continuam a comer a comida.',
    });
    expect(doing('STOP_DOING', eats, np('CAT', { number: 'plural' }))).toMatchObject({
      en: 'the cats stop eating the food.', de: 'die Kater hören auf, das Essen zu fressen.', ja: '猫は食べ物を食べるのをやめます。',
    });
    const eatsIt = { infinitiveComplement: acts('EAT', { directObject: np('THIRD_PERSON', { antecedent: 'FOOD' }) }) };
    expect(doing('CONTINUE_DOING', eatsIt)).toMatchObject({
      en: 'the cat continues eating it.', es: 'el gato sigue comiéndola.', de: 'der Kater frisst es weiter.', ja: '猫はそれを食べ続けます。',
    });
  });

  test('the compound past takes the governed verb\'s auxiliary in German', () => {
    expect(doing('CONTINUE_DOING', { verbPhrase: { aspect: 'resultative' } }, np('CAT', { gender: 'fem' }))).toMatchObject({
      en: 'the cat has continued running.', it: 'la gatta ha continuato a correre.', fr: 'la chatte a continué à courir.',
      de: 'die Katze ist weitergelaufen.', es: 'la gata ha seguido corriendo.',
    });
    expect(doing('STOP_DOING', { verbPhrase: { aspect: 'resultative' } }, np('CAT', { gender: 'fem' }))).toMatchObject({
      it: 'la gatta ha smesso di correre.', de: 'die Katze hat aufgehört zu laufen.', es: 'la gata ha dejado de correr.',
    });
  });

  test('a separable governed verb, and a copula', () => {
    expect(doing('CONTINUE_DOING', { infinitiveComplement: acts('RETURN') })).toMatchObject({
      de: 'der Kater kehrt weiter zurück.', ja: '猫は戻り続けます。', es: 'el gato sigue volviendo.',
    });
    expect(doing('CONTINUE_DOING', { infinitiveComplement: acts('BE', { complements: predicate('HAPPY') }) }, np('CAT', { gender: 'fem' }))).toEqual({
      en: 'the cat continues being happy.',
      it: 'la gatta continua a essere felice.',
      fr: 'la chatte continue à être heureuse.',
      de: 'die Katze ist weiter glücklich.',
      es: 'la gata sigue estando feliz.',
      ja: '猫は幸せであることを続けます。', // a copula has no ます stem to compound
      pt: 'a gata continua a estar feliz.',
    });
  });

  test('the citations, and the glosses', () => {
    const cited = (verb: string) => sayAll({ ...clause(np('GENERIC_PERSON'), verb, { infinitiveComplement: acts() }), infinitive: true });
    expect(cited('STOP_DOING')).toEqual({
      en: 'to stop acting.', it: 'smettere di agire.', fr: "arrêter d'agir.", de: 'aufhören zu handeln.',
      es: 'dejar de actuar.', ja: '行動するのをやめる。', pt: 'parar de agir.',
    });
    expect(cited('CONTINUE_DOING')).toEqual({
      en: 'to continue acting.', it: 'continuare ad agire.', fr: 'continuer à agir.', de: 'weiterhandeln.',
      es: 'seguir actuando.', ja: '行動し続ける。', pt: 'continuar a agir.',
    });
    expect(definitionAll('STOP_DOING')).toEqual({
      en: 'not to continue acting.', it: 'non continuare ad agire.', fr: 'ne pas continuer à agir.', de: 'nicht weiterhandeln.',
      es: 'no seguir actuando.', ja: '行動し続けない。', pt: 'não continuar a agir.',
    });
    expect(definitionAll('CONTINUE_DOING')).toEqual({
      en: 'still to act.', it: 'agire ancora.', fr: 'agir encore.', de: 'noch handeln.',
      es: 'actuar todavía.', ja: 'まだ行動する。', pt: 'agir ainda.',
    });
  });

  test('both conjugate', () => {
    expect(doing('CONTINUE_DOING', { verbPhrase: { tense: 'future' }, infinitiveComplement: acts() }, np('FIRST_PERSON'))).toMatchObject({
      en: 'I will continue acting.', it: 'continuerò ad agire.', fr: 'je continuerai à agir.', de: 'ich werde weiterhandeln.',
      es: 'seguiré actuando.', pt: 'continuarei a agir.',
    });
    expect(doing('STOP_DOING', { verbPhrase: { tense: 'future' }, infinitiveComplement: acts() }, np('FIRST_PERSON'))).toMatchObject({
      en: 'I will stop acting.', it: 'smetterò di agire.', fr: "j'arrêterai d'agir.", de: 'ich werde aufhören zu handeln.',
      es: 'dejaré de actuar.', pt: 'pararei de agir.',
    });
    expect(sayAll(clause(np('FIRST_PERSON'), 'CONTINUE_DOING'))).toMatchObject({ it: 'continuo.', es: 'sigo.', de: 'ich mache weiter.' });
    expect(sayAll(clause(np('FIRST_PERSON'), 'STOP_DOING'))).toMatchObject({ it: 'smetto.', de: 'ich höre auf.', pt: 'paro.' });
  });

  test('regression: TRY, NEED and DESIRE keep the linked infinitive', () => {
    expect(doing('TRY')).toEqual({
      en: 'the cat tries to run.', it: 'il gatto prova a correre.', fr: 'le chat essaie de courir.',
      de: 'der Kater versucht zu laufen.', es: 'el gato intenta correr.', ja: '猫は走ることを試みます。', pt: 'o gato tenta correr.',
    });
    expect(doing('NEED', { verbPhrase: { tense: 'past' } })).toMatchObject({
      en: 'the cat needed to run.', de: 'der Kater brauchte zu laufen.', es: 'el gato necesitaba correr.', ja: '猫は走ることを必要としていました。',
    });
    expect(doing('DESIRE', { verbPhrase: { negative: true } })).toMatchObject({
      en: 'the cat does not desire to run.', de: 'der Kater wünscht nicht zu laufen.', ja: '猫は走ることを望んでいません。',
    });
  });
});
