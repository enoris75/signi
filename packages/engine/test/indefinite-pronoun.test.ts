import { describe, expect, test } from 'vitest';
import type { LanguageCode, PhrasePlan } from '@signi/shared';
import { clause, furigana, np, say, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// Localization C32: SOMETHING, the pronoun that stands for a thing and turns into another word
// under negation. The seeded persons have one form each; this one has two, and the negative half
// carries the concord every language spells differently.

const seed = (id: string) => concepts.find((c) => c.id === id);

function definitionAll(id: string): Record<LanguageCode, string> {
  const concept = seed(id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
}

describe('the positive pronoun', () => {
  test('as a direct object, and as a subject', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', { directObject: np('SOMETHING') }))).toEqual({
      en: 'the cat eats something.', it: 'il gatto mangia qualcosa.', fr: 'le chat mange quelque chose.',
      de: 'der Kater frisst etwas.', es: 'el gato come algo.', ja: '猫は何かを食べます。', pt: 'o gato come algo.',
    });
    // It is a pronoun by its lexicon and a phrase by its syntax: no Romance clitic, and no pro-drop
    // — "qualcosa mangia", never a bare "mangia" (see `isPronounElement`).
    expect(sayAll(clause(np('SOMETHING'), 'EAT'))).toEqual({
      en: 'something eats.', it: 'qualcosa mangia.', fr: 'quelque chose mange.', de: 'etwas isst.',
      es: 'algo come.', ja: '何かは食べます。', pt: 'algo come.',
    });
  });

  test('the Spanish and Portuguese personal "a" marks a person, so a thing takes none', () => {
    expect(say(clause(np('CAT'), 'EAT', { directObject: np('SOMETHING') }), 'es')).toBe('el gato come algo.');
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('SOMETHING') }), 'pt')).toBe('o gato vê algo.');
  });
});

describe('the negative pronoun', () => {
  // Each language spells the concord its own way: English leaves the negation on the verb and says
  // "anything"; the Romance languages keep their preverbal negator beside the negative word; German
  // and French let the word carry the negation alone, so "nicht" and "pas" give way.
  test('as a direct object', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', {
      verbPhrase: { negative: true }, directObject: np('SOMETHING'),
    }))).toEqual({
      en: 'the cat does not eat anything.', it: 'il gatto non mangia niente.',
      fr: 'le chat ne mange rien.', de: 'der Kater frisst nichts.', es: 'el gato no come nada.',
      ja: '猫は何も食べません。', pt: 'o gato não come nada.',
    });
  });

  // English has a third form in the subject slot, where the pronoun absorbs the negation:
  // "nothing eats", not "*anything does not eat".
  test('as a subject', () => {
    expect(sayAll(clause(np('SOMETHING'), 'EAT', { verbPhrase: { negative: true } }))).toEqual({
      en: 'nothing eats.', it: 'niente mangia.', fr: 'rien ne mange.', de: 'nichts isst.',
      es: 'nada come.', ja: '何も食べません。', pt: 'nada come.',
    });
  });

  test('tense rides on it unchanged', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', {
      verbPhrase: { tense: 'past', negative: true }, directObject: np('SOMETHING'),
    }))).toMatchObject({
      en: 'the cat did not eat anything.', it: 'il gatto non mangiò niente.',
      fr: 'le chat ne mangea rien.', de: 'der Kater fraß nichts.', ja: '猫は何も食べませんでした。',
    });
  });

  test('Japanese writes the circumfix and no prenominal どの', () => {
    expect(say(clause(np('CAT'), 'EAT', {
      verbPhrase: { negative: true }, directObject: np('SOMETHING'),
    }), 'ja')).toBe('猫は何も食べません。');
    // A `no` **noun** still takes its どの, which is what the circumfix is built from.
    expect(say(clause(np('CAT'), 'EAT', {
      directObject: np('MOUSE', { definiteness: 'no' }),
    }), 'ja')).toBe('猫はどのネズミも食べません。');
  });
});

describe('the words', () => {
  test('SOMETHING is glossed on THING', () => {
    expect(definitionAll('SOMETHING')).toEqual({
      en: 'an unknown thing.', it: 'una cosa sconosciuta.', fr: 'une chose inconnue.',
      de: 'ein unbekanntes Ding.', es: 'una cosa desconocida.', ja: '不明なもの。', pt: 'uma coisa desconhecida.',
    });
  });

  // ONLY stays on the literal: "and nothing more" wants a verbless "and" fragment, and a verbless
  // period cannot be negated at all — the negative pronoun alone renders as its positive half.
  // "In a sole way" says *uniquely*, which B67 already refused (see the ticket).
  test('ONLY has no gloss', () => {
    expect(seed('ONLY')?.definition).toBeUndefined();
  });

  // It is a pronoun of a kind the chooser's person row has no place for, so it names its slot and
  // the row skips it — without which it would take the 3rd person's, being the first such concept
  // by id.
  test('SOMETHING names the slot it fills', () => {
    expect(seed('SOMETHING')?.slot).toBe('indefinite');
    expect(seed('THIRD_PERSON')?.slot).toBeUndefined();
  });
});

// P09-E40: SOMEONE, SOMETHING's person counterpart. It is a full phrase for the same reason (the
// concept's `slot: 'indefinite'`, not `thing`), and a person where that matters: the Spanish
// personal "a", German's declined *jemanden* / *jemandem*, and the Japanese animacy.
describe('the person pronoun (P09-E40)', () => {
  test('as a direct object: no clitic, the Spanish personal "a", the German accusative', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('SOMEONE') }))).toEqual({
      en: 'the cat sees someone.', it: 'il gatto vede qualcuno.', fr: 'le chat voit quelqu\'un.',
      de: 'der Kater sieht jemanden.', es: 'el gato ve a alguien.', ja: '猫は誰かを見ます。', pt: 'o gato vê alguém.',
    });
  });

  test('as a subject: never dropped', () => {
    expect(sayAll(clause(np('SOMEONE'), 'RUN'))).toEqual({
      en: 'someone runs.', it: 'qualcuno corre.', fr: 'quelqu\'un court.', de: 'jemand läuft.',
      es: 'alguien corre.', ja: '誰かは走ります。', pt: 'alguém corre.',
    });
    expect(sayAll(clause(np('SOMEONE'), 'SEE', { verbPhrase: { tense: 'past' }, directObject: np('CAT') }))).toEqual({
      en: 'someone saw the cat.', it: 'qualcuno vide il gatto.', fr: 'quelqu\'un vit le chat.',
      de: 'jemand sah den Kater.', es: 'alguien vio el gato.', ja: '誰かは猫を見ました。', pt: 'alguém viu o gato.',
    });
  });

  test('negated as a direct object: German niemanden, Spanish "a nadie"', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', { verbPhrase: { negative: true }, directObject: np('SOMEONE') }))).toEqual({
      en: 'the cat does not see anyone.', it: 'il gatto non vede nessuno.', fr: 'le chat ne voit personne.',
      de: 'der Kater sieht niemanden.', es: 'el gato no ve a nadie.', ja: '猫は誰も見ません。', pt: 'o gato não vê ninguém.',
    });
  });

  test('negated as a subject: English "nobody" absorbs the negation', () => {
    expect(sayAll(clause(np('SOMEONE'), 'RUN', { verbPhrase: { negative: true } }))).toEqual({
      en: 'nobody runs.', it: 'nessuno corre.', fr: 'personne ne court.', de: 'niemand läuft.',
      es: 'nadie corre.', ja: '誰も走りません。', pt: 'ninguém corre.',
    });
  });

  test('German declines it in the dative, positive and negative', () => {
    // HELP governs its object in the dative (`object_case`), which reads the `disjunctive`.
    expect(sayAll(clause(np('CAT'), 'HELP_VERB', { directObject: np('SOMEONE') }))).toMatchObject({
      de: 'der Kater hilft jemandem.', es: 'el gato ayuda a alguien.', pt: 'o gato ajuda alguém.',
    });
    expect(say(clause(np('CAT'), 'HELP_VERB', { verbPhrase: { negative: true }, directObject: np('SOMEONE') }), 'de'))
      .toBe('der Kater hilft niemandem.');
    // A preposition's case: *mit* the dative, *für* the accusative.
    expect(say(clause(np('CAT'), 'RUN', { complements: { comitative: { phrase: np('SOMEONE') } } }), 'de'))
      .toBe('der Kater läuft mit jemandem.');
    expect(say(clause(np('CAT'), 'RUN', { complements: { purpose: { phrase: np('SOMEONE') } } }), 'de'))
      .toBe('der Kater läuft für jemanden.');
  });

  test('SOMEONE is glossed on PERSON, and names the slot it fills', () => {
    expect(definitionAll('SOMEONE')).toEqual({
      en: 'an unknown person.', it: 'una persona sconosciuta.', fr: 'une personne inconnue.',
      de: 'eine unbekannte Person.', es: 'una persona desconocida.', ja: '不明な人。', pt: 'uma pessoa desconhecida.',
    });
    expect(seed('SOMEONE')?.slot).toBe('indefinite');
    expect(seed('SOMEONE')?.human).toBe(true);
  });
});

// P09-E36: an adjective on an indefinite pronoun, which six of the seven used to drop. Each language
// spells it its own way: postposed in English, Spanish and Portuguese, with di / de in Italian and
// French, a neuter adjectival noun in German, prenominal in Japanese. OTHER is a word of its own
// there (*else*, *d'autre*, *anderes*, *más*) or fuses with the pronoun (*qualcos'altro*, *autre
// chose*, *otra cosa*, *outra pessoa*).
describe('a modifier on the pronoun (P09-E36)', () => {
  const eats = (adjective: string, negative = false) => clause(np('CAT'), 'EAT', {
    directObject: np('SOMETHING', { adjectives: [adjective] }), ...(negative ? { verbPhrase: { negative } } : {}),
  });
  const sees = (adjective: string, negative = false) => clause(np('CAT'), 'SEE', {
    directObject: np('SOMEONE', { adjectives: [adjective] }), ...(negative ? { verbPhrase: { negative } } : {}),
  });
  const runs = (id: string, adjective: string, negative = false) => clause(np(id, { adjectives: [adjective] }), 'RUN',
    negative ? { verbPhrase: { negative } } : {});

  test('something big', () => {
    expect(sayAll(eats('BIG'))).toEqual({
      en: 'the cat eats something big.', it: 'il gatto mangia qualcosa di grande.',
      fr: 'le chat mange quelque chose de grand.', de: 'der Kater frisst etwas Großes.',
      es: 'el gato come algo grande.', ja: '猫は大きい何かを食べます。', pt: 'o gato come algo grande.',
    });
    expect(sayAll(runs('SOMETHING', 'BIG'))).toEqual({
      en: 'something big runs.', it: 'qualcosa di grande corre.', fr: 'quelque chose de grand court.',
      de: 'etwas Großes läuft.', es: 'algo grande corre.', ja: '大きい何かは走ります。', pt: 'algo grande corre.',
    });
  });

  test('something else', () => {
    expect(sayAll(eats('OTHER'))).toEqual({
      en: 'the cat eats something else.', it: 'il gatto mangia qualcos\'altro.',
      fr: 'le chat mange autre chose.', de: 'der Kater frisst etwas anderes.',
      es: 'el gato come otra cosa.', ja: '猫は別の何かを食べます。', pt: 'o gato come outra coisa.',
    });
    expect(sayAll(runs('SOMETHING', 'OTHER'))).toEqual({
      en: 'something else runs.', it: 'qualcos\'altro corre.', fr: 'autre chose court.',
      de: 'etwas anderes läuft.', es: 'otra cosa corre.', ja: '別の何かは走ります。', pt: 'outra coisa corre.',
    });
  });

  test('nothing big: Japanese puts the adjective on もの and the negative word after it', () => {
    expect(sayAll(eats('BIG', true))).toEqual({
      en: 'the cat does not eat anything big.', it: 'il gatto non mangia niente di grande.',
      fr: 'le chat ne mange rien de grand.', de: 'der Kater frisst nichts Großes.',
      es: 'el gato no come nada grande.', ja: '猫は大きいものを何も食べません。', pt: 'o gato não come nada grande.',
    });
    expect(sayAll(runs('SOMETHING', 'BIG', true))).toEqual({
      en: 'nothing big runs.', it: 'niente di grande corre.', fr: 'rien de grand ne court.',
      de: 'nichts Großes läuft.', es: 'nada grande corre.', ja: '大きいものは何も走りません。', pt: 'nada grande corre.',
    });
  });

  test('nothing else: Japanese says ほかに', () => {
    expect(sayAll(eats('OTHER', true))).toEqual({
      en: 'the cat does not eat anything else.', it: 'il gatto non mangia nient\'altro.',
      fr: 'le chat ne mange rien d\'autre.', de: 'der Kater frisst nichts anderes.',
      es: 'el gato no come nada más.', ja: '猫はほかに何も食べません。', pt: 'o gato não come nada mais.',
    });
    expect(sayAll(runs('SOMETHING', 'OTHER', true))).toEqual({
      en: 'nothing else runs.', it: 'nient\'altro corre.', fr: 'rien d\'autre ne court.',
      de: 'nichts anderes läuft.', es: 'nada más corre.', ja: 'ほかに何も走りません。', pt: 'nada mais corre.',
    });
    // ほかに is kana; 何 keeps its reading.
    expect(furigana(eats('OTHER', true))).toEqual(['ねこ', 'なに', 'たべません']);
  });

  test('someone new', () => {
    expect(sayAll(sees('NEW'))).toEqual({
      en: 'the cat sees someone new.', it: 'il gatto vede qualcuno di nuovo.',
      fr: 'le chat voit quelqu\'un de nouveau.', de: 'der Kater sieht jemand Neues.',
      es: 'el gato ve a alguien nuevo.', ja: '猫は新しい誰かを見ます。', pt: 'o gato vê alguém novo.',
    });
    expect(sayAll(runs('SOMEONE', 'NEW'))).toEqual({
      en: 'someone new runs.', it: 'qualcuno di nuovo corre.', fr: 'quelqu\'un de nouveau court.',
      de: 'jemand Neues läuft.', es: 'alguien nuevo corre.', ja: '新しい誰かは走ります。', pt: 'alguém novo corre.',
    });
  });

  test('someone else', () => {
    expect(sayAll(sees('OTHER'))).toEqual({
      en: 'the cat sees someone else.', it: 'il gatto vede qualcun altro.',
      fr: 'le chat voit quelqu\'un d\'autre.', de: 'der Kater sieht jemand anderes.',
      es: 'el gato ve a alguien más.', ja: '猫は別の誰かを見ます。', pt: 'o gato vê outra pessoa.',
    });
    expect(sayAll(runs('SOMEONE', 'OTHER'))).toEqual({
      en: 'someone else runs.', it: 'qualcun altro corre.', fr: 'quelqu\'un d\'autre court.',
      de: 'jemand anderes läuft.', es: 'alguien más corre.', ja: '別の誰かは走ります。', pt: 'outra pessoa corre.',
    });
  });

  test('nobody new, nobody else', () => {
    expect(sayAll(sees('NEW', true))).toEqual({
      en: 'the cat does not see anyone new.', it: 'il gatto non vede nessuno di nuovo.',
      fr: 'le chat ne voit personne de nouveau.', de: 'der Kater sieht niemand Neues.',
      es: 'el gato no ve a nadie nuevo.', ja: '猫は新しい人を誰も見ません。', pt: 'o gato não vê ninguém novo.',
    });
    expect(sayAll(runs('SOMEONE', 'NEW', true))).toEqual({
      en: 'nobody new runs.', it: 'nessuno di nuovo corre.', fr: 'personne de nouveau ne court.',
      de: 'niemand Neues läuft.', es: 'nadie nuevo corre.', ja: '新しい人は誰も走りません。', pt: 'ninguém novo corre.',
    });
    expect(sayAll(sees('OTHER', true))).toEqual({
      en: 'the cat does not see anyone else.', it: 'il gatto non vede nessun altro.',
      fr: 'le chat ne voit personne d\'autre.', de: 'der Kater sieht niemand anderes.',
      es: 'el gato no ve a nadie más.', ja: '猫はほかに誰も見ません。', pt: 'o gato não vê ninguém mais.',
    });
    expect(sayAll(runs('SOMEONE', 'OTHER', true))).toEqual({
      en: 'nobody else runs.', it: 'nessun altro corre.', fr: 'personne d\'autre ne court.',
      de: 'niemand anderes läuft.', es: 'nadie más corre.', ja: 'ほかに誰も走りません。', pt: 'ninguém mais corre.',
    });
    // 人 carries its reading on the plain noun.
    expect(furigana(sees('NEW', true))).toContain('ひと');
  });

  test('German declines the adjectival noun for the dative; French elides before a vowel', () => {
    expect(sayAll(clause(np('CAT'), 'HELP_VERB', { directObject: np('SOMEONE', { adjectives: ['OTHER'] }) }))).toMatchObject({
      de: 'der Kater hilft jemand anderem.', es: 'el gato ayuda a alguien más.', pt: 'o gato ajuda outra pessoa.',
    });
    expect(say(clause(np('CAT'), 'HELP_VERB', { verbPhrase: { negative: true }, directObject: np('SOMEONE', { adjectives: ['NEW'] }) }), 'de'))
      .toBe('der Kater hilft niemand Neuem.');
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { comitative: { phrase: np('SOMETHING', { adjectives: ['BIG'] }) } } }))).toEqual({
      en: 'the cat runs with something big.', it: 'il gatto corre con qualcosa di grande.',
      fr: 'le chat court avec quelque chose de grand.', de: 'der Kater läuft mit etwas Großem.',
      es: 'el gato corre con algo grande.', ja: '猫は大きい何かと走ります。', pt: 'o gato corre com algo grande.',
    });
    expect(say(clause(np('CAT'), 'RUN', { complements: { purpose: { phrase: np('SOMEONE', { adjectives: ['NEW'] }) } } }), 'de'))
      .toBe('der Kater läuft für jemand Neues.');
    expect(sayAll(eats('INTERESTING'))).toMatchObject({
      fr: 'le chat mange quelque chose d\'intéressant.', de: 'der Kater frisst etwas Interessantes.',
      it: 'il gatto mangia qualcosa di interessante.',
    });
  });

  // A pronoun never loses the adjective its plan names: what no language can say is refused.
  test('guard: an adjective the pronoun cannot say fails loudly', () => {
    expect(() => sayAll(clause(np('CAT'), 'SEE', { directObject: np('THIRD_PERSON', { adjectives: ['BIG'] }) })))
      .toThrow(/personal pronoun takes no adjective/);
    expect(() => sayAll(clause(np('FIRST_PERSON', { adjectives: ['BIG'] }), 'RUN'))).toThrow(/personal pronoun/);
    expect(() => sayAll(eatsTwo())).toThrow(/one adjective/);
    expect(() => sayAll(clause(np('CAT'), 'EAT', {
      directObject: np('SOMETHING', { adjectives: ['BIG'], adjectiveDegrees: ['more'] }),
    }))).toThrow(/degree/);
    // The builder's explicit positive degree is no degree at all.
    expect(say(clause(np('CAT'), 'EAT', {
      directObject: np('SOMETHING', { adjectives: ['BIG'], adjectiveDegrees: ['positive'] }),
    }), 'en')).toBe('the cat eats something big.');
  });

  const eatsTwo = () => clause(np('CAT'), 'EAT', { directObject: np('SOMETHING', { adjectives: ['BIG', 'NEW'] }) });
});

// A308. The negative swap (someone → anyone / nessuno / personne / niemand / nadie / 誰も / ninguém)
// reaches SOMEONE and SOMETHING as the subject and the direct object, but not inside a complement:
// "does not run with someone", "läuft nicht mit jemandem", 誰かと走りません. The complement keeps the
// positive pronoun under a negated verb, which reads "there is someone it does not run with".
describe('known bugs: negation does not reach an indefinite pronoun inside a complement (A308)', () => {
  const notRun = (complements: NonNullable<PhrasePlan['complements']>) =>
    sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { negative: true }, complements }));

  test('SOMEONE, comitative', () => {
    expect(notRun({ comitative: { phrase: np('SOMEONE') } })).toEqual({
      en: 'the cat does not run with anyone.', it: 'il gatto non corre con nessuno.', fr: 'le chat ne court avec personne.',
      de: 'der Kater läuft mit niemandem.', es: 'el gato no corre con nadie.', ja: '猫は誰とも走りません。', pt: 'o gato não corre com ninguém.',
    });
  });

  test('SOMETHING, comitative', () => {
    expect(notRun({ comitative: { phrase: np('SOMETHING') } })).toEqual({
      en: 'the cat does not run with anything.', it: 'il gatto non corre con niente.', fr: 'le chat ne court avec rien.',
      de: 'der Kater läuft mit nichts.', es: 'el gato no corre con nada.', ja: '猫は何とも走りません。', pt: 'o gato não corre com nada.',
    });
  });

  test('SOMEONE, purpose', () => {
    expect(notRun({ purpose: { phrase: np('SOMEONE') } })).toEqual({
      en: 'the cat does not run for anyone.', it: 'il gatto non corre per nessuno.', fr: 'le chat ne court pour personne.',
      de: 'der Kater läuft für niemanden.', es: 'el gato no corre para nadie.', ja: '猫は誰のためにも走りません。', pt: 'o gato não corre para ninguém.',
    });
  });

  test('SOMEONE, terminus', () => {
    expect(sayAll(clause(np('CAT'), 'GIVE', {
      verbPhrase: { negative: true }, directObject: np('BOOK'), complements: { terminus: { phrase: np('SOMEONE') } },
    }))).toEqual({
      en: 'the cat does not give the book to anyone.', it: 'il gatto non dà il libro a nessuno.', fr: 'le chat ne donne le livre à personne.',
      de: 'der Kater gibt niemandem das Buch.', es: 'el gato no da el libro a nadie.', ja: '猫は誰にも本をあげません。', pt: 'o gato não dá o livro a ninguém.',
    });
  });

  test('in the past, and SOMETHING as the purpose', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { negative: true, tense: 'past' }, complements: { comitative: { phrase: np('SOMEONE') } } }))).toEqual({
      en: 'the cat did not run with anyone.', it: 'il gatto non corse con nessuno.', fr: 'le chat ne courut avec personne.',
      de: 'der Kater lief mit niemandem.', es: 'el gato no corrió con nadie.', ja: '猫は誰とも走りませんでした。', pt: 'o gato não correu com ninguém.',
    });
  });

  // Two negative words: Romance concord says both ("non dà niente a nessuno"), French drops its "pas"
  // for both, English keeps "anything … anyone" under the one "not", and Japanese writes the も…ない
  // circumfix on each. German, which has no negative concord, is left out: it wants one negative word
  // ("gibt niemandem etwas"), and the engine writes two.
  test('two negative words: a negative object beside a negative complement, and a negative subject', () => {
    expect(sayAll(clause(np('CAT'), 'GIVE', {
      verbPhrase: { negative: true }, directObject: np('SOMETHING'), complements: { terminus: { phrase: np('SOMEONE') } },
    }))).toMatchObject({
      en: 'the cat does not give anything to anyone.', it: 'il gatto non dà niente a nessuno.', fr: 'le chat ne donne rien à personne.',
      es: 'el gato no da nada a nadie.', ja: '猫は誰にも何もあげません。', pt: 'o gato não dá nada a ninguém.',
    });
    expect(sayAll(clause(np('SOMEONE'), 'RUN', { verbPhrase: { negative: true }, complements: { comitative: { phrase: np('SOMEONE') } } }))).toMatchObject({
      en: 'nobody runs with anyone.', it: 'nessuno corre con nessuno.', fr: 'personne ne court avec personne.',
      es: 'nadie corre con nadie.', ja: '誰も誰とも走りません。', pt: 'ninguém corre com ninguém.',
    });
  });

  test('regression: the direct object swaps already, and the positive complement keeps the positive pronoun', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', { verbPhrase: { negative: true }, directObject: np('SOMEONE') }))).toEqual({
      en: 'the cat does not see anyone.', it: 'il gatto non vede nessuno.', fr: 'le chat ne voit personne.', de: 'der Kater sieht niemanden.',
      es: 'el gato no ve a nadie.', ja: '猫は誰も見ません。', pt: 'o gato não vê ninguém.',
    });
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { comitative: { phrase: np('SOMEONE') } } }))).toEqual({
      en: 'the cat runs with someone.', it: 'il gatto corre con qualcuno.', fr: "le chat court avec quelqu'un.", de: 'der Kater läuft mit jemandem.',
      es: 'el gato corre con alguien.', ja: '猫は誰かと走ります。', pt: 'o gato corre com alguém.',
    });
  });
});

// A309. A relative clause on SOMEONE or SOMETHING is dropped without a word in the six European
// languages as the direct object and in a complement, and in Italian, French and German as the
// subject too: "the cat sees someone.", "qualcuno vede il gatto." Japanese keeps it (走る誰か), and a
// noun head keeps it everywhere ("the person who runs").
describe('known bugs: a relative clause on SOMEONE or SOMETHING is dropped (A309)', () => {
  const runs = { verbPhrase: { verb: 'RUN' } };

  test('SOMEONE who runs, as the object', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('SOMEONE', { relative: runs }) }))).toEqual({
      en: 'the cat sees someone who runs.', it: 'il gatto vede qualcuno che corre.', fr: "le chat voit quelqu'un qui court.",
      de: 'der Kater sieht jemanden, der läuft.', es: 'el gato ve a alguien que corre.', ja: '猫は走る誰かを見ます。', pt: 'o gato vê alguém que corre.',
    });
  });

  test('SOMETHING that burns, as the object', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('SOMETHING', { relative: { verbPhrase: { verb: 'BURN' } } }) }))).toEqual({
      en: 'the cat sees something that burns.', it: 'il gatto vede qualcosa che brucia.', fr: 'le chat voit quelque chose qui brûle.',
      de: 'der Kater sieht etwas, das brennt.', es: 'el gato ve algo que arde.', ja: '猫は燃える何かを見ます。', pt: 'o gato vê algo que arde.',
    });
  });

  test('SOMETHING the dog eats, an object gap', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', {
      directObject: np('SOMETHING', { relative: { headRole: 'directObject', subject: np('DOG'), verbPhrase: { verb: 'EAT' } } }),
    }))).toEqual({
      en: 'the cat sees something that the dog eats.', it: 'il gatto vede qualcosa che il cane mangia.', fr: 'le chat voit quelque chose que le chien mange.',
      de: 'der Kater sieht etwas, das der Hund frisst.', es: 'el gato ve algo que el perro come.', ja: '猫は犬が食べる何かを見ます。', pt: 'o gato vê algo que o cão come.',
    });
  });

  test('SOMEONE who runs, as the subject', () => {
    expect(sayAll(clause(np('SOMEONE', { relative: runs }), 'SEE', { directObject: np('CAT') }))).toEqual({
      en: 'someone who runs sees the cat.', it: 'qualcuno che corre vede il gatto.', fr: "quelqu'un qui court voit le chat.",
      de: 'jemand, der läuft, sieht den Kater.', es: 'alguien que corre ve el gato.', ja: '走る誰かは猫を見ます。', pt: 'alguém que corre vê o gato.',
    });
  });

  test('SOMEONE who runs, in a complement', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { comitative: { phrase: np('SOMEONE', { relative: runs }) } } }))).toEqual({
      en: 'the cat runs with someone who runs.', it: 'il gatto corre con qualcuno che corre.', fr: "le chat court avec quelqu'un qui court.",
      de: 'der Kater läuft mit jemandem, der läuft.', es: 'el gato corre con alguien que corre.', ja: '猫は走る誰かと走ります。', pt: 'o gato corre com alguém que corre.',
    });
  });

  test('SOMETHING that burns as the subject, and SOMEONE as the recipient and the passive agent', () => {
    const burns = { relative: { verbPhrase: { verb: 'BURN' } } };
    expect(sayAll(clause(np('SOMETHING', burns), 'RUN'))).toEqual({
      en: 'something that burns runs.', it: 'qualcosa che brucia corre.', fr: 'quelque chose qui brûle court.',
      de: 'etwas, das brennt, läuft.', es: 'algo que arde corre.', ja: '燃える何かは走ります。', pt: 'algo que arde corre.',
    });
    expect(sayAll(clause(np('CAT'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('SOMEONE', { relative: runs }) } } }))).toEqual({
      en: 'the cat gives the book to someone who runs.', it: 'il gatto dà il libro a qualcuno che corre.',
      fr: "le chat donne le livre à quelqu'un qui court.", de: 'der Kater gibt jemandem, der läuft, das Buch.',
      es: 'el gato da el libro a alguien que corre.', ja: '猫は走る誰かに本をあげます。', pt: 'o gato dá o livro a alguém que corre.',
    });
    expect(sayAll(clause(np('SOMEONE', { relative: runs }), 'SEE', { verbPhrase: { voice: 'passive' }, directObject: np('CAT') }))).toEqual({
      en: 'the cat is seen by someone who runs.', it: 'il gatto è visto da qualcuno che corre.', fr: "le chat est vu par quelqu'un qui court.",
      de: 'der Kater wird von jemandem, der läuft, gesehen.', es: 'el gato es visto por alguien que corre.', ja: '猫は走る誰かに見られます。',
      pt: 'o gato é visto por alguém que corre.',
    });
  });

  test('regression: a noun head keeps its relative', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('PERSON', { relative: runs }) }))).toEqual({
      en: 'the cat sees the person who runs.', it: 'il gatto vede la persona che corre.', fr: 'le chat voit la personne qui court.',
      de: 'der Kater sieht die Person, die läuft.', es: 'el gato ve a la persona que corre.', ja: '猫は走る人を見ます。', pt: 'o gato vê a pessoa que corre.',
    });
  });
});
