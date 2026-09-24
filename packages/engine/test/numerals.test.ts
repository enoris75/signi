import { describe, expect, test } from 'vitest';
import type { LanguageCode, NounPhrase, VerbPhrase } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// Localization C31: the cardinal numeral. It is a value beside `definiteness`, not a concept — no
// picker offers one word for it, and Japanese has no word at all without the counter its noun
// chooses. From two up it counts, so the phrase is plural; the indefinite article gives way to it.

const seed = (id: string) => concepts.find((c) => c.id === id);

function definitionAll(id: string): Record<LanguageCode, string> {
  const concept = seed(id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
}

describe('a counted noun phrase', () => {
  test('the numeral pluralises the noun and takes the indefinite article\'s place', () => {
    expect(sayAll(clause(np('CAT', { numeral: 2, definiteness: 'indefinite' }), 'RUN'))).toEqual({
      en: 'two cats run.', it: 'due gatti corrono.', fr: 'deux chats courent.',
      de: 'zwei Kater laufen.', es: 'dos gatos corren.', ja: '二匹の猫は走ります。', pt: 'dois gatos correm.',
    });
  });

  test('a definite determiner keeps its place in front of it', () => {
    expect(sayAll(clause(np('CAT', { numeral: 2 }), 'RUN'))).toEqual({
      en: 'the two cats run.', it: 'i due gatti corrono.', fr: 'les deux chats courent.',
      de: 'die zwei Kater laufen.', es: 'los dos gatos corren.', ja: '二匹の猫は走ります。',
      pt: 'os dois gatos correm.',
    });
  });

  test('it stands ahead of the adjectives', () => {
    expect(sayAll(clause(np('HOUSE', { numeral: 2, adjectives: ['BIG'] }), 'RUN'))).toMatchObject({
      en: 'the two big houses run.', it: 'le due grandi case corrono.',
      fr: 'les deux grandes maisons courent.', de: 'die zwei großen Häuser laufen.',
      es: 'las dos casas grandes corren.', ja: '二軒の大きい家は走ります。',
    });
  });

  // Every language's cardinals are invariable from two up, except Portuguese dois/duas. At one the
  // numeral is the indefinite article's own word, so five of the seven agree it.
  test('it agrees only where the language agrees it', () => {
    expect(sayAll(clause(np('HOUSE', { numeral: 1, definiteness: 'indefinite' }), 'RUN'))).toMatchObject({
      en: 'one house runs.', it: 'una casa corre.', fr: 'une maison court.', de: 'ein Haus läuft.',
      es: 'una casa corre.', pt: 'uma casa corre.',
    });
    expect(say(clause(np('HOUSE', { numeral: 2, definiteness: 'indefinite' }), 'RUN'), 'pt'))
      .toBe('duas casas correm.');
    expect(say(clause(np('CAT', { numeral: 2, definiteness: 'indefinite' }), 'RUN'), 'pt'))
      .toBe('dois gatos correm.');
  });

  // French has no zero article for a direct object — a bare plural takes the partitive "des" — but
  // a counted one has none at all, negated or not.
  test('the French object takes no partitive under a numeral', () => {
    expect(say(clause(np('CAT'), 'EAT', { directObject: np('MOUSE', { numeral: 2, definiteness: 'indefinite' }) }), 'fr'))
      .toBe('le chat mange deux souris.');
    expect(say(clause(np('CAT'), 'EAT', {
      verbPhrase: { negative: true }, directObject: np('MOUSE', { numeral: 2, definiteness: 'indefinite' }),
    }), 'fr')).toBe('le chat ne mange pas deux souris.');
  });

  test('a value the table does not spell comes back as its digits', () => {
    expect(sayAll(clause(np('CAT', { numeral: 47, definiteness: 'indefinite' }), 'RUN'))).toMatchObject({
      en: '47 cats run.', de: '47 Kater laufen.', ja: '47匹の猫は走ります。',
    });
  });
});

describe('the Japanese counter', () => {
  test('the noun chooses it — its own, or one its animacy picks', () => {
    expect(say(clause(np('CAT', { numeral: 2, definiteness: 'indefinite' }), 'RUN'), 'ja')).toBe('二匹の猫は走ります。');
    expect(say(clause(np('HOUSE', { numeral: 2, definiteness: 'indefinite' }), 'RUN'), 'ja')).toBe('二軒の家は走ります。');
    expect(say({ subject: np('OBJECT_THING', { numeral: 3, definiteness: 'indefinite' }) }, 'ja')).toBe('三つの物体。');
    expect(say({ subject: np('PERSON', { numeral: 2, definiteness: 'indefinite' }) }, 'ja')).toBe('二人の人。');
  });

  test('a time word is its own counter and is not said twice', () => {
    expect(say({ subject: np('HOUR', { numeral: 24, definiteness: 'indefinite' }) }, 'ja')).toBe('二十四時間。');
    expect(say({ subject: np('DAY', { numeral: 7, definiteness: 'indefinite' }) }, 'ja')).toBe('七日。');
    expect(say({ subject: np('MONTH', { numeral: 12, definiteness: 'indefinite' }) }, 'ja')).toBe('十二か月。');
  });
});

describe('the time words the numerals unlock', () => {
  test.each<[string, Record<LanguageCode, string>]>([
    ['DAY', {
      en: 'a period of twenty-four hours.', it: 'un periodo di ventiquattro ore.',
      fr: 'une période de vingt-quatre heures.', de: 'ein Zeitraum von vierundzwanzig Stunden.',
      es: 'un período de veinticuatro horas.', ja: '二十四時間の期間。', pt: 'um período de vinte e quatro horas.',
    }],
    ['WEEK', {
      en: 'a period of seven days.', it: 'un periodo di sette giorni.', fr: 'une période de sept jours.',
      de: 'ein Zeitraum von sieben Tagen.', es: 'un período de siete días.', ja: '七日の期間。',
      pt: 'um período de sete dias.',
    }],
    ['YEAR', {
      en: 'a period of twelve months.', it: 'un periodo di dodici mesi.', fr: 'une période de douze mois.',
      de: 'ein Zeitraum von zwölf Monaten.', es: 'un período de doce meses.', ja: '十二か月の期間。',
      pt: 'um período de doze meses.',
    }],
  ])('%s', (id, rendered) => {
    expect(definitionAll(id)).toEqual(rendered);
  });

  // After a cardinal French says "an", not "année" — a lexical fact about the noun, not the numeral.
  test('French picks the cardinal form of YEAR', () => {
    expect(say({ subject: np('YEAR', { numeral: 12, definiteness: 'indefinite' }) }, 'fr')).toBe('douze ans.');
    expect(say({ subject: np('YEAR', { number: 'plural' }) }, 'fr')).toBe('les années.');
  });

  // HOUR stays on the literal: Japanese 時間 is TIME's own word, so a gloss on TIME would say the
  // same thing twice there (see the ticket).
  test('HOUR and MONTH are seeded, and HOUR has no gloss', () => {
    expect(seed('HOUR')?.definition).toBeUndefined();
    expect(seed('MONTH')?.definition).toBeUndefined();
  });
});

// A289. `objectArtFor` drops every article from a counted French object, to keep the partitive and
// the negative "de" off "mange deux souris" (C31). Only the indefinite gives way to a numeral
// (`numeralSuppressesArticle`), so a definite or demonstrative object loses a determiner the subject
// keeps ("les deux livres brûlent"). The other six languages keep it.
describe('known bugs: a French definite object with a numeral drops its article (A289)', () => {
  const reads = (extra: Partial<NounPhrase> = {}, verbPhrase: Partial<VerbPhrase> = {}) =>
    clause(np('CAT'), 'READ', { verbPhrase, directObject: np('BOOK', { numeral: 2, ...extra }) });

  test('a definite object', () => {
    expect(say(reads(), 'fr')).toBe('le chat lit les deux livres.');
  });

  test('a definite object, negated — the definite article is no partitive', () => {
    expect(say(reads({}, { negative: true }), 'fr')).toBe('le chat ne lit pas les deux livres.');
  });

  test('a definite object with a genitive possessor', () => {
    expect(say(reads({ possessor: np('MAN') }), 'fr')).toBe("le chat lit les deux livres de l'homme.");
  });

  test('a demonstrative object', () => {
    expect(say(reads({ definiteness: 'this' }), 'fr')).toBe('le chat lit ces deux livres.');
  });

  test('an animate definite object', () => {
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('DOG', { numeral: 3 }) }), 'fr')).toBe('le chat voit les trois chiens.');
  });

  test('the object of a possessor question', () => {
    expect(say({ ...reads(), questionRole: 'possessor', questionPossessed: 'directObject' }, 'fr'))
      .toBe('de qui est-ce que le chat lit les deux livres ?');
  });

  test('a feminine counted object keeps the definite and the distal, negated or not; the indefinite takes no de', () => {
    const eats = (extra: Partial<NounPhrase>, negative = false) =>
      say(clause(np('CAT'), 'EAT', { verbPhrase: { negative }, directObject: np('MOUSE', { numeral: 3, ...extra }) }), 'fr');
    expect(eats({ definiteness: 'that' })).toBe('le chat mange ces trois souris.');
    expect(eats({}, true)).toBe('le chat ne mange pas les trois souris.');
    expect(eats({ definiteness: 'this' }, true)).toBe('le chat ne mange pas ces trois souris.');
    expect(eats({ definiteness: 'indefinite' }, true)).toBe('le chat ne mange pas trois souris.');
  });

  test('regression: the other six keep it, as the French subject does; the indefinite and the possessive are right', () => {
    expect(sayAll(reads())).toMatchObject({
      en: 'the cat reads the two books.', it: 'il gatto legge i due libri.', de: 'der Kater liest die zwei Bücher.',
      es: 'el gato lee los dos libros.', ja: '猫は二つの本を読みます。', pt: 'o gato lê os dois livros.',
    });
    expect(sayAll(reads({ definiteness: 'this' }))).toMatchObject({
      en: 'the cat reads these two books.', it: 'il gatto legge questi due libri.', de: 'der Kater liest diese zwei Bücher.',
      es: 'el gato lee estos dos libros.', ja: '猫はこの二つの本を読みます。', pt: 'o gato lê estes dois livros.',
    });
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('DOG', { numeral: 3 }) }))).toMatchObject({
      en: 'the cat sees the three dogs.', it: 'il gatto vede i tre cani.', de: 'der Kater sieht die drei Hunde.',
      es: 'el gato ve los tres perros.', ja: '猫は三匹の犬を見ます。', pt: 'o gato vê os três cães.',
    });
    expect(sayAll({ ...reads(), questionRole: 'possessor', questionPossessed: 'directObject' })).toMatchObject({
      en: 'whose two books does the cat read?', it: 'di chi legge i due libri il gatto?', de: 'wessen zwei Bücher liest der Kater?',
      es: '¿de quién lee el gato los dos libros?', ja: '猫は誰の二つの本を読みますか？', pt: 'de quem o gato lê os dois livros?',
    });
    expect(say(clause(np('BOOK', { numeral: 2 }), 'BURN'), 'fr')).toBe('les deux livres brûlent.');
    expect(say(reads({ definiteness: 'indefinite' }), 'fr')).toBe('le chat lit deux livres.');
    expect(say(reads({ possessor: { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' } }), 'fr'))
      .toBe('le chat lit ses deux livres.');
  });
});

// A demonstrative keeps its slot beside a pronominal possessive, and the numeral stands after it; the
// possessive goes behind the noun where A187 detaches it, and stacks in Italian (P11-E4 audit).
describe('a counted phrase beside a pronominal possessive', () => {
  const mine = { kind: 'pronominal', person: '1', number: 'singular' } as const;

  test('these two friends of mine', () => {
    expect(sayAll(clause(np('FRIEND', { numeral: 2, number: 'plural', definiteness: 'this', possessor: mine }), 'RUN'))).toEqual({
      en: 'these two friends of mine run.', it: 'questi miei due amici corrono.', fr: 'ces deux amis à moi courent.',
      de: 'diese zwei Freunde von mir laufen.', es: 'estos dos amigos míos corren.', ja: '私のこの二人の友達は走ります。',
      pt: 'estes dois amigos meus correm.',
    });
  });

  test('my two friends: the definite gives its slot to the possessive, and the numeral follows', () => {
    expect(sayAll(clause(np('FRIEND', { numeral: 2, number: 'plural', possessor: mine }), 'RUN'))).toEqual({
      en: 'my two friends run.', it: 'i miei due amici corrono.', fr: 'mes deux amis courent.',
      de: 'meine zwei Freunde laufen.', es: 'mis dos amigos corren.', ja: '私の二人の友達は走ります。',
      pt: 'os meus dois amigos correm.',
    });
  });
});

// A329. An indefinite gives way to a numeral by resolving `bare` (C31), and a bare head gives its
// determiner slot to a pronominal possessive, so "two friends of mine" comes out as the definite "my
// two friends": the indefinite A277 taught every builder to keep is lost again once a numeral stands
// beside it. At one the numeral lands behind the possessive as if it were an adjective ("mein ein
// Freund", "il mio un amico"), which predates A277. Distinct from A289 (French objects) and A291/A292
// (numerals inside a complement).
describe('known bugs: a numeral beside a possessive ignores the indefinite (A329)', () => {
  const mine = { kind: 'pronominal', person: '1', number: 'singular' } as const;
  const friends = (numeral: number, extra: Partial<NounPhrase> = {}) =>
    sayAll(clause(np('FRIEND', { numeral, definiteness: 'indefinite', possessor: mine, ...extra }), 'RUN'));

  test.fails('two friends of mine', () => {
    expect(friends(2, { number: 'plural' })).toEqual({
      en: 'two friends of mine run.', it: 'due miei amici corrono.', fr: 'deux amis à moi courent.',
      de: 'zwei Freunde von mir laufen.', es: 'dos amigos míos corren.', ja: '私の二人の友達は走ります。',
      pt: 'dois amigos meus correm.',
    });
  });

  test.fails('one friend of mine: at one the numeral is the article in five of the seven', () => {
    expect(friends(1)).toEqual({
      en: 'one friend of mine runs.', it: 'un mio amico corre.', fr: 'un ami à moi court.',
      de: 'ein Freund von mir läuft.', es: 'un amigo mío corre.', ja: '私の一人の友達は走ります。',
      pt: 'um amigo meu corre.',
    });
  });

  test('regression: the same phrases without the numeral, or without the possessive, are right', () => {
    expect(sayAll(clause(np('FRIEND', { definiteness: 'indefinite', possessor: mine }), 'RUN'))).toEqual({
      en: 'a friend of mine runs.', it: 'un mio amico corre.', fr: 'un ami à moi court.',
      de: 'ein Freund von mir läuft.', es: 'un amigo mío corre.', ja: '私の友達は走ります。', pt: 'um amigo meu corre.',
    });
    expect(sayAll(clause(np('FRIEND', { numeral: 2, number: 'plural', definiteness: 'indefinite' }), 'RUN'))).toEqual({
      en: 'two friends run.', it: 'due amici corrono.', fr: 'deux amis courent.',
      de: 'zwei Freunde laufen.', es: 'dos amigos corren.', ja: '二人の友達は走ります。', pt: 'dois amigos correm.',
    });
    expect(sayAll(clause(np('FRIEND', { numeral: 1, definiteness: 'indefinite' }), 'RUN'))).toEqual({
      en: 'one friend runs.', it: 'un amico corre.', fr: 'un ami court.',
      de: 'ein Freund läuft.', es: 'un amigo corre.', ja: '一人の友達は走ります。', pt: 'um amigo corre.',
    });
  });
});

// A319. The numeral one beside a definite or demonstrative determiner: Romance writes the article
// and then the numeral that is its own indefinite article (l'un cane, el un perro, o um cão), and
// German leaves ein undeclined (der ein Hund, den ein Hund). Romance drops the one, which is what the
// same plan says without it; German declines it weak, as an adjective after der (der alte Hund).
// The French object (le chat voit un chien) is A289's; the German complement is A291's for now.
describe('known bugs: the numeral one beside a definite or demonstrative determiner (A319)', () => {
  const one = (definiteness: 'definite' | 'this') => np('DOG', { numeral: 1, definiteness });

  test.fails('Romance drops the one beside the definite, subject and object', () => {
    expect(sayAll(clause(one('definite'), 'RUN'))).toMatchObject({
      it: 'il cane corre.', fr: 'le chien court.', es: 'el perro corre.', pt: 'o cão corre.',
    });
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: one('definite') }))).toMatchObject({
      it: 'il gatto vede il cane.', es: 'el gato ve el perro.', pt: 'o gato vê o cão.',
    });
  });

  test.fails('Romance drops the one beside the demonstrative', () => {
    expect(sayAll(clause(one('this'), 'RUN'))).toMatchObject({
      it: 'questo cane corre.', fr: 'ce chien court.', es: 'este perro corre.', pt: 'este cão corre.',
    });
  });

  test.fails('Romance drops the one in a complement', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { comitative: { phrase: one('definite') } } }))).toMatchObject({
      it: 'il gatto corre con il cane.', fr: 'le chat court avec le chien.',
    });
  });

  test.fails('German declines ein weak after der and dieser', () => {
    expect([
      say(clause(one('definite'), 'RUN'), 'de'),
      say(clause(np('CAT'), 'SEE', { directObject: one('definite') }), 'de'),
      say(clause(one('this'), 'RUN'), 'de'),
      say(clause(np('CAT'), 'RUN', { complements: { comitative: { phrase: one('definite') } } }), 'de'),
    ]).toEqual([
      'der eine Hund läuft.',
      'der Kater sieht den einen Hund.',
      'dieser eine Hund läuft.',
      'der Kater läuft mit dem einen Hund.',
    ]);
  });

  test('regression: English, Japanese, the indefinite one and the definite two', () => {
    expect(sayAll(clause(one('definite'), 'RUN'))).toMatchObject({ en: 'the one dog runs.', ja: '一匹の犬は走ります。' });
    expect(sayAll(clause(np('DOG', { numeral: 1, definiteness: 'indefinite' }), 'RUN'))).toEqual({
      en: 'one dog runs.', it: 'un cane corre.', fr: 'un chien court.', de: 'ein Hund läuft.',
      es: 'un perro corre.', ja: '一匹の犬は走ります。', pt: 'um cão corre.',
    });
    expect(sayAll(clause(np('DOG', { numeral: 2, number: 'plural', definiteness: 'definite' }), 'RUN'))).toMatchObject({
      it: 'i due cani corrono.', fr: 'les deux chiens courent.', de: 'die zwei Hunde laufen.',
      es: 'los dos perros corren.', pt: 'os dois cães correm.',
    });
    // The Romance Want is the plan without the numeral; the German one is the weak ending after der.
    expect(sayAll(clause(np('DOG', { definiteness: 'definite' }), 'RUN'))).toMatchObject({
      it: 'il cane corre.', fr: 'le chien court.', es: 'el perro corre.', pt: 'o cão corre.',
    });
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('DOG', { definiteness: 'definite', adjectives: ['OLD'] }) }), 'de'))
      .toBe('der Kater sieht den alten Hund.');
  });
});

// A320. Italian elides the feminine indefinite before a vowel ("un'ora", "un'amica"), and the
// article path does it ("entro un'ora" for an indefinite HOUR). The cardinal one is spelled from the
// numeral table instead, which writes "una" whatever follows: "entro una ora", "per una ora", "una
// ora brucia", "vede una amica". Masculine "un" needs no elision ("un amico"), so only "una" is hit.
describe('known bugs: the Italian cardinal una does not elide before a vowel (A320)', () => {
  const temporal = (value: 'within' | 'for' | 'during') => say(clause(np('CAT'), 'RUN', {
    complements: { temporal: { phrase: np('HOUR', { definiteness: 'bare', numeral: 1 }), specifiers: [{ kind: 'temporal', value }] } },
  }), 'it');

  test('within one hour', () => {
    expect(temporal('within')).toBe("il gatto corre entro un'ora.");
  });

  test('for one hour', () => {
    expect(temporal('for')).toBe("il gatto corre per un'ora.");
  });

  test('during one hour', () => {
    expect(temporal('during')).toBe("il gatto corre durante un'ora.");
  });

  test('as the subject', () => {
    expect(say(clause(np('HOUR', { definiteness: 'bare', numeral: 1 }), 'BURN'), 'it')).toBe("un'ora brucia.");
  });

  test('as the object, a feminine person', () => {
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('FRIEND', { gender: 'fem', definiteness: 'bare', numeral: 1 }) }), 'it'))
      .toBe("il gatto vede un'amica.");
  });

  test('the masculine takes uno before an s-impura, and the elision survives an approximator or an adjective', () => {
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('STUDENT', { definiteness: 'bare', numeral: 1 }) }), 'it'))
      .toBe('il gatto vede uno studente.');
    expect(say(clause(np('CAT'), 'RUN', {
      complements: { temporal: { phrase: np('HOUR', { definiteness: 'bare', numeral: 1, approximator: 'about' }), specifiers: [{ kind: 'temporal', value: 'for' }] } },
    }), 'it')).toBe("il gatto corre per circa un'ora.");
    expect(say(clause(np('HOUR', { definiteness: 'bare', numeral: 1, adjectives: ['OTHER'] }), 'BURN'), 'it')).toBe("un'altra ora brucia.");
  });

  test('regression: the indefinite article elides already, and a consonant or a masculine keeps its form', () => {
    expect(say(clause(np('CAT'), 'RUN', {
      complements: { temporal: { phrase: np('HOUR', { definiteness: 'indefinite' }), specifiers: [{ kind: 'temporal', value: 'within' }] } },
    }), 'it')).toBe("il gatto corre entro un'ora.");
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('HOUSE', { definiteness: 'bare', numeral: 1 }) }), 'it')).toBe('il gatto vede una casa.');
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('DOG', { definiteness: 'bare', numeral: 1 }) }), 'it')).toBe('il gatto vede un cane.');
  });
});
