import { describe, expect, test } from 'vitest';
import type { Definiteness, Degree, NounModifier, NounPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

const cat = (extra: Partial<NounPhrase>) => sayAll(clause(np('CAT', extra), 'EAT'));
const map = (extra: Partial<NounPhrase>) => sayAll(clause(np('MAP', extra), 'BURN'));

// Where an adjective sits, and what it agrees with.
describe('adjectives', () => {
  test('sit where each language puts them, and agree with the head', () => {
    expect(cat({ adjectives: ['BIG'] })).toEqual({
      en: 'the big cat eats.',
      it: 'il grande gatto mangia.',
      fr: 'le grand chat mange.',
      // Iberian Romance puts a qualifying adjective after the noun.
      es: 'el gato grande come.',
      pt: 'o gato grande come.',
      de: 'der große Kater isst.',
      ja: '大きい猫は食べます。',
    });
  });

  test('agree in gender and number', () => {
    expect(cat({ gender: 'fem', number: 'plural', adjectives: ['BIG'] })).toEqual({
      en: 'the big cats eat.',
      it: 'le grandi gatte mangiano.',
      fr: 'les grandes chattes mangent.',
      es: 'las gatas grandes comen.',
      pt: 'as gatas grandes comem.',
      de: 'die großen Katzen essen.',
      ja: '大きい猫は食べます。',
    });
  });
});

// Several adjectives on one head. Romance stacks them prenominally where each belongs there and
// coordinates them postnominally where it does not, so the position is decided per adjective —
// not once for the phrase.
describe('multiple adjectives', () => {
  test('two adjectives', () => {
    expect(cat({ adjectives: ['BIG', 'OLD'] })).toMatchObject({
      en: 'the big old cat eats.',
      it: 'il grande vecchio gatto mangia.',
      fr: 'le grand vieux chat mange.',
      // Iberian Romance coordinates postnominal adjectives with a conjunction.
      es: 'el gato grande y viejo come.',
      pt: 'o gato grande e velho come.',
      de: 'der große alte Kater isst.',
      ja: '大きい古い猫は食べます。',
    });
  });

  test('all of them agree with the head', () => {
    expect(cat({ gender: 'fem', number: 'plural', adjectives: ['BIG', 'OLD'] })).toMatchObject({
      it: 'le grandi vecchie gatte mangiano.',
      fr: 'les grandes vieilles chattes mangent.',
      es: 'las gatas grandes y viejas comen.',
      pt: 'as gatas grandes e velhas comem.',
      de: 'die großen alten Katzen essen.',
    });
  });

  test('position is decided per adjective, not per phrase', () => {
    // BIG is prenominal in Italian and French; BROWN is not — so one goes each side of the head.
    expect(cat({ adjectives: ['BIG', 'BROWN'] })).toMatchObject({
      it: 'il grande gatto marrone mangia.',
      fr: 'le grand chat brun mange.',
      en: 'the big brown cat eats.',
      de: 'der große braune Kater isst.',
    });
  });

  test('Italian apocopates before a consonant', () => {
    // bello → bel, prenominally: "il bel gatto", never "il bello gatto".
    expect(cat({ adjectives: ['BIG', 'OLD', 'BEAUTIFUL'] })).toMatchObject({
      it: 'il grande vecchio bel gatto mangia.',
      fr: 'le grand vieux beau chat mange.',
      de: 'der große alte schöne Kater isst.',
    });
  });
});

// A degree is index-aligned with `adjectives`: each adjective is compared on its own.
describe('degree, per adjective', () => {
  const degrees = (adjectives: string[], adjectiveDegrees: Degree[]) =>
    cat({ adjectives, adjectiveDegrees });

  test('only the adjective given a degree is compared', () => {
    expect(degrees(['BIG', 'OLD'], ['more', 'positive'])).toMatchObject({
      en: 'the bigger old cat eats.',
      // A compared adjective moves behind the noun in Italian and French, even when its plain
      // form precedes it — so BIG crosses the head and OLD stays put.
      it: 'il vecchio gatto più grande mangia.',
      fr: 'le vieux chat plus grand mange.',
      es: 'el gato más grande y viejo come.',
    });
  });

  test('the degree tracks its own index', () => {
    expect(degrees(['BIG', 'OLD'], ['positive', 'most'])).toMatchObject({
      en: 'the big oldest cat eats.',
      it: 'il grande gatto più vecchio mangia.',
      es: 'el gato grande y más viejo come.',
    });
  });
});

// A noun used attributively ("word map", "sail boat"). Unlike an adjective it does not agree; in
// Romance a relation-selected preposition links it, English and German compound, Japanese uses の.
describe('nouns as adjectives', () => {
  const modifier = (relation: NounModifier['relation']) =>
    map({ nounModifiers: [{ concept: 'WORD', relation }] });

  test('the relation selects the linking preposition in Romance', () => {
    // Italian keeps all three apart: a (means), da (purpose), di (material/content).
    expect(modifier('feature')).toMatchObject({ it: 'la mappa a parola brucia.' });
    expect(modifier('purpose')).toMatchObject({ it: 'la mappa da parola brucia.' });
    expect(modifier('material')).toMatchObject({ it: 'la mappa di parola brucia.' });
  });

  test('English and German compound instead, regardless of the relation', () => {
    expect(modifier('feature')).toMatchObject({
      en: 'the word map burns.',
      de: 'die Wortkarte brennt.',
      ja: '単語の地図は燃えます。',
    });
    expect(modifier('material')).toMatchObject({
      en: 'the word map burns.',
      de: 'die Wortkarte brennt.',
    });
  });

  test('modifiers stack, each keeping its own link', () => {
    expect(map({
      nounModifiers: [
        { concept: 'WORD', relation: 'feature' },
        { concept: 'PHRASE', relation: 'material' },
      ],
    })).toMatchObject({
      en: 'the word phrase map burns.',
      it: 'la mappa a parola di frase brucia.', // "a parola" + "di frase"
      de: 'die Wortphrasekarte brennt.',
      ja: '単語のフレーズの地図は燃えます。',
    });
  });

  test('the modifier carries its own number and adjectives, which agree with IT', () => {
    // "creator of semantic phrases" — semantiche agrees with frasi (fem pl), not with creatore.
    expect(sayAll(clause(np('CREATOR', {
      nounModifiers: [{
        concept: 'PHRASE', relation: 'material', number: 'plural', adjectives: ['SEMANTIC'],
      }],
    }), 'BURN'))).toMatchObject({
      en: 'the semantic phrase creator burns.', // English keeps the attributive noun singular
      it: 'il creatore di frasi semantiche brucia.',
      fr: 'le créateur de phrases sémantiques brûle.',
      es: 'el creador de frases semánticas arde.',
      pt: 'o criador de frases semânticas arde.',
    });
  });
});

// The two kinds of modifier on one head at once.
describe('adjectives and nouns-as-adjectives together', () => {
  test('an adjective and an attributive noun coexist', () => {
    expect(map({
      adjectives: ['BIG'],
      nounModifiers: [{ concept: 'WORD', relation: 'feature' }],
    })).toMatchObject({
      en: 'the big word map burns.',
      // The adjective agrees with the head; the attributive noun is bare and prepositional.
      it: 'la grande mappa a parola brucia.',
      fr: 'la grande carte à mot brûle.',
      es: 'el mapa grande de palabra arde.',
      de: 'die große Wortkarte brennt.', // the adjective sits outside the compound
      ja: '単語の大きい地図は燃えます。',
    });
  });

  test('the adjective agrees with the head, not with the attributive noun', () => {
    // The head is plural; WORD is not. Only the adjective moves.
    expect(map({
      number: 'plural',
      adjectives: ['BIG'],
      nounModifiers: [{ concept: 'WORD', relation: 'material' }],
    })).toMatchObject({
      en: 'the big word maps burn.',
      it: 'le grandi mappe di parola bruciano.',
      es: 'los mapas grandes de palabra arden.',
      de: 'die großen Wortkarten brennen.',
    });
  });

  test('each noun keeps the adjectives that belong to it', () => {
    // The creator is OLD; the phrases are SEMANTIC. Two adjectives, two different heads.
    expect(sayAll(clause(np('CREATOR', {
      adjectives: ['OLD'],
      nounModifiers: [{
        concept: 'PHRASE', relation: 'material', number: 'plural', adjectives: ['SEMANTIC'],
      }],
    }), 'BURN'))).toMatchObject({
      it: 'il vecchio creatore di frasi semantiche brucia.',
      fr: 'le vieux créateur de phrases sémantiques brûle.',
      es: 'el creador viejo de frases semánticas arde.',
      ja: '意味的なフレーズの古い創造者は燃えます。',
    });
  });

  test('they compose with a possessor', () => {
    expect(map({
      adjectives: ['BIG'],
      nounModifiers: [{ concept: 'WORD', relation: 'feature' }],
      possessor: np('CAT'),
    })).toMatchObject({
      en: "the cat's big word map burns.",
      it: 'la grande mappa a parola del gatto brucia.',
      ja: '猫の単語の大きい地図は燃えます。',
    });
  });
});

describe('degree', () => {
  test('English inflects short adjectives and periphrases long ones', () => {
    expect(sayAll(clause(np('CAT', {
      adjectives: ['BIG'], adjectiveDegrees: ['more'],
    }), 'EAT'))).toMatchObject({ en: 'the bigger cat eats.' });

    expect(sayAll(clause(np('CAT', {
      adjectives: ['BIG'], adjectiveDegrees: ['most'],
    }), 'EAT'))).toMatchObject({ en: 'the biggest cat eats.' });

    expect(sayAll(clause(np('CAT', {
      adjectives: ['BEAUTIFUL'], adjectiveDegrees: ['more'],
    }), 'EAT'))).toMatchObject({ en: 'the more beautiful cat eats.' });
  });

  test('English knows its suppletive comparatives', () => {
    expect(sayAll(clause(np('CAT', {
      adjectives: ['GOOD'], adjectiveDegrees: ['more'],
    }), 'EAT'))).toMatchObject({ en: 'the better cat eats.' });
  });

  test('Romance marks the comparative periphrastically', () => {
    expect(sayAll(clause(np('CAT', {
      adjectives: ['BIG'], adjectiveDegrees: ['more'],
    }), 'EAT'))).toMatchObject({
      it: 'il gatto più grande mangia.',
      es: 'el gato más grande come.',
      fr: 'le chat plus grand mange.',
    });
  });

  test('the Romance relative superlative is the comparative under a definite article', () => {
    // "il gatto più grande" is both "the bigger cat" and "the biggest cat" — with a definite
    // article the two are homophonous in Italian and Spanish. This is correct, not a gap.
    expect(sayAll(clause(np('CAT', {
      adjectives: ['BIG'], adjectiveDegrees: ['most'],
    }), 'EAT'))).toMatchObject({
      it: 'il gatto più grande mangia.',
      es: 'el gato más grande come.',
    });
  });

  test('a lowered degree is periphrastic everywhere', () => {
    expect(sayAll(clause(np('CAT', {
      adjectives: ['BIG'], adjectiveDegrees: ['less'],
    }), 'EAT'))).toMatchObject({
      en: 'the less big cat eats.',
      it: 'il gatto meno grande mangia.',
      fr: 'le chat moins grand mange.',
      es: 'el gato menos grande come.',
      de: 'der weniger große Kater isst.',
    });
  });
});

// Each of these asserts the CORRECT output and is expected to fail today. Fix the engine and
// the test will report "expected to fail but passed" — that is the signal to drop `.fails`.
describe('known bugs: degree', () => {
  const withDegree = (adjective: string, degree: 'more' | 'most') =>
    sayAll(clause(np('CAT', { adjectives: [adjective], adjectiveDegrees: [degree] }), 'EAT'));

  test('German umlauts the comparative: groß → größer', () => {
    expect(withDegree('BIG', 'more')).toMatchObject({ de: 'der größere Kater isst.' });
  });

  test('German umlauts the superlative: groß → größt', () => {
    expect(withDegree('BIG', 'most')).toMatchObject({ de: 'der größte Kater isst.' });
  });

  test('German has suppletive comparatives: gut → besser', () => {
    expect(withDegree('GOOD', 'more')).toMatchObject({ de: 'der bessere Kater isst.' });
  });

  // The fix generalises beyond groß/gut: the umlaut set, the epenthesis rule and the
  // suppletive superlative, each verified below — and the non-umlauting stems left untouched.
  test('German umlauts the whole monosyllabic set, comparative and superlative', () => {
    expect(withDegree('OLD', 'more').de).toBe('der ältere Kater isst.');
    expect(withDegree('OLD', 'most').de).toBe('der älteste Kater isst.');
    expect(withDegree('YOUNG', 'more').de).toBe('der jüngere Kater isst.');
    expect(withDegree('YOUNG', 'most').de).toBe('der jüngste Kater isst.');
    expect(withDegree('STRONG', 'more').de).toBe('der stärkere Kater isst.');
    expect(withDegree('WEAK', 'most').de).toBe('der schwächste Kater isst.');
    expect(withDegree('COLD', 'most').de).toBe('der kälteste Kater isst.'); // umlaut + epenthesis
  });

  test('German inserts the epenthetic -e- after a dental/sibilant stem', () => {
    expect(withDegree('BAD', 'most').de).toBe('der schlechteste Kater isst.'); // -t → -est
    expect(withDegree('HOT', 'most').de).toBe('der heißeste Kater isst.'); // -ß → -est, no umlaut
    expect(withDegree('QUICK', 'most').de).toBe('der schnellste Kater isst.'); // plain -st
  });

  test('German has a suppletive superlative too: gut → best', () => {
    expect(withDegree('GOOD', 'most').de).toBe('der beste Kater isst.');
  });

  // Regression guard: umlaut is lexical, not a blanket vowel rule — an unflagged stem stays put
  // (braun → brauner, never *bräuner; heiß → heißer, never *häißer).
  test('German does not umlaut an adjective not flagged for it', () => {
    expect(withDegree('BROWN', 'more').de).toBe('der braunere Kater isst.');
    expect(withDegree('HOT', 'more').de).toBe('der heißere Kater isst.');
  });

  // The same machinery feeds the predicative "am …sten" frame.
  test('German predicative superlative umlauts and takes the irregular/suppletive stems', () => {
    const pred = (adj: string, degree: 'more' | 'most') =>
      sayAll(clause(np('CAT'), 'SEEM', {
        complements: { predicative: { phrase: np(adj, { headDegree: degree }) } },
      })).de;
    expect(pred('BIG', 'most')).toBe('der Kater scheint am größten.');
    expect(pred('GOOD', 'most')).toBe('der Kater scheint am besten.');
    expect(pred('OLD', 'most')).toBe('der Kater scheint am ältesten.');
    expect(pred('BIG', 'more')).toBe('der Kater scheint größer.');
  });

  test('French has suppletive comparatives: bon → meilleur, not "plus bon"', () => {
    expect(withDegree('GOOD', 'more')).toMatchObject({ fr: 'le chat meilleur mange.' });
  });

  // The fix generalises to the other French suppletive (mauvais → pire) and agrees it with the
  // noun; it fires only on the raised degrees, leaving the lowered/equal degrees periphrastic,
  // and does not disturb a non-suppletive adjective's periphrasis.
  test('French suppletives cover mauvais → pire and agree with the noun', () => {
    expect(withDegree('BAD', 'more').fr).toBe('le chat pire mange.');
    // Feminine + plural agreement of the suppletive stem.
    expect(sayAll(clause(np('CAT', {
      gender: 'fem', number: 'plural', adjectives: ['GOOD'], adjectiveDegrees: ['more'],
    }), 'EAT')).fr).toBe('les chattes meilleures mangent.');
  });

  test('French lowered/equal degrees and non-suppletive adjectives stay periphrastic', () => {
    expect(sayAll(clause(np('CAT', { adjectives: ['GOOD'], adjectiveDegrees: ['less'] }), 'EAT')).fr)
      .toBe('le chat moins bon mange.');
    expect(sayAll(clause(np('CAT', { adjectives: ['GOOD'], adjectiveDegrees: ['equally'] }), 'EAT')).fr)
      .toBe('le chat aussi bon mange.');
    expect(withDegree('BIG', 'more').fr).toBe('le chat plus grand mange.');
  });

  test('Portuguese has suppletive comparatives: grande → maior, bom → melhor', () => {
    expect(withDegree('BIG', 'more')).toMatchObject({ pt: 'o gato maior come.' });
  });

  // The fix covers all four Portuguese suppletives on the raised degrees and agrees them (they
  // are gender-invariant, pluralising in -es); the lowered/equal degrees and a non-suppletive
  // adjective stay periphrastic.
  test('Portuguese suppletives cover bom → melhor, pequeno → menor, mau → pior', () => {
    expect(withDegree('GOOD', 'more').pt).toBe('o gato melhor come.');
    expect(withDegree('SMALL', 'more').pt).toBe('o gato menor come.');
    expect(withDegree('BAD', 'more').pt).toBe('o gato pior come.');
    // Feminine plural: the suppletive is invariant in gender, and pluralises to maiores.
    expect(sayAll(clause(np('CAT', {
      gender: 'fem', number: 'plural', adjectives: ['BIG'], adjectiveDegrees: ['more'],
    }), 'EAT')).pt).toBe('as gatas maiores comem.');
  });

  test('Portuguese lowered/equal degrees and non-suppletive adjectives stay periphrastic', () => {
    expect(sayAll(clause(np('CAT', { adjectives: ['BIG'], adjectiveDegrees: ['less'] }), 'EAT')).pt)
      .toBe('o gato menos grande come.');
    expect(sayAll(clause(np('CAT', { adjectives: ['GOOD'], adjectiveDegrees: ['equally'] }), 'EAT')).pt)
      .toBe('o gato igualmente bom come.');
    expect(withDegree('BEAUTIFUL', 'more').pt).toBe('o gato mais belo come.');
  });

});

// Deliberate: fr.ts says of the doubled superlative article, "the second article is an MVP
// approximation we skip". Recorded as the correct target, not filed as an oversight.
describe('documented simplifications: degree', () => {
  test.fails('the French relative superlative repeats the article: le chat le plus grand', () => {
    expect(sayAll(clause(np('CAT', {
      adjectives: ['BIG'], adjectiveDegrees: ['most'],
    }), 'EAT'))).toMatchObject({ fr: 'le chat le plus grand mange.' });
  });
});

describe('known bugs: adjectives', () => {
  // Three or more postnominal adjectives repeat the conjunction: "grande y viejo y hermoso".
  // Iberian Romance coordinates a list the same way it coordinates nouns — comma-separated, with
  // the conjunction only before the last: "grande, viejo y hermoso". The engine already does this
  // correctly for coordinated NOUNS ("el gato, el perro y el ratón"), so the rule exists; it is
  // simply not applied to the adjective list.
  test.fails('Spanish should comma-separate three adjectives, not repeat "y"', () => {
    expect(cat({ adjectives: ['BIG', 'OLD', 'BEAUTIFUL'] }))
      .toMatchObject({ es: 'el gato grande, viejo y hermoso come.' });
  });

  test.fails('Portuguese should comma-separate three adjectives, not repeat "e"', () => {
    expect(cat({ adjectives: ['BIG', 'OLD', 'BEAUTIFUL'] }))
      .toMatchObject({ pt: 'o gato grande, velho e belo come.' });
  });

  // German CHANGES THE MEANING here. An adjective belonging to the attributive noun is hoisted
  // out onto the head: "der semantische alte Phraseschöpfer" says the *creator* is semantic, when
  // the plan says the *phrases* are. A German compound cannot take an internal adjective, so the
  // compound has to be abandoned when the modifier carries one — the genitive does it: "der alte
  // Schöpfer semantischer Phrasen". Compare Italian, which is correct: "il vecchio creatore di
  // frasi semantiche".
  test.fails('German must not hoist the modifier\'s adjective onto the head', () => {
    expect(sayAll(clause(np('CREATOR', {
      adjectives: ['OLD'],
      nounModifiers: [{
        concept: 'PHRASE', relation: 'material', number: 'plural', adjectives: ['SEMANTIC'],
      }],
    }), 'BURN'))).toMatchObject({ de: 'der alte Schöpfer semantischer Phrasen brennt.' });
  });
});

// A full sweep: six adjectives spanning the inflection classes — BIG/OLD (short, inflecting),
// GOOD/BAD (suppletive), BEAUTIFUL/INTERESTING (long, periphrastic) — against all six degrees.
describe('every adjective at every degree', () => {
  // English carries the whole paradigm correctly, so it is asserted in full: the inflected
  // comparative/superlative for short stems, the suppletives, and the periphrasis for long ones.
  const EN: Record<string, [more: string, most: string]> = {
    BIG: ['bigger', 'biggest'],
    OLD: ['older', 'oldest'],
    GOOD: ['better', 'best'], // suppletive
    BAD: ['worse', 'worst'], // suppletive
    BEAUTIFUL: ['more beautiful', 'most beautiful'], // periphrastic
    INTERESTING: ['more interesting', 'most interesting'],
  };
  const EN_BASE: Record<string, string> = {
    BIG: 'big', OLD: 'old', GOOD: 'good', BAD: 'bad',
    BEAUTIFUL: 'beautiful', INTERESTING: 'interesting',
  };

  const en = (adj: string, deg: Degree) =>
    cat({ adjectives: [adj], adjectiveDegrees: [deg] }).en;

  test.each(Object.keys(EN))('English %s across the degrees', (adj) => {
    const [more, most] = EN[adj];
    const base = EN_BASE[adj];
    expect(en(adj, 'positive')).toBe(`the ${base} cat eats.`);
    expect(en(adj, 'more')).toBe(`the ${more} cat eats.`);
    expect(en(adj, 'most')).toBe(`the ${most} cat eats.`);
    expect(en(adj, 'less')).toBe(`the less ${base} cat eats.`);
    expect(en(adj, 'least')).toBe(`the least ${base} cat eats.`);
    expect(en(adj, 'equally')).toBe(`the equally ${base} cat eats.`);
  });

  test('Romance marks the raised and lowered degrees periphrastically', () => {
    // più/plus/más/mais for "more"; meno/moins/menos for "less". The compared adjective moves
    // behind the noun. GOOD is prenominal in the positive (buon gatto) but not when compared.
    // French and Portuguese are the exceptions: their raised GOOD is the suppletive
    // "meilleur" / "melhor", not "plus bon" / "mais bom".
    expect(cat({ adjectives: ['GOOD'], adjectiveDegrees: ['more'] })).toMatchObject({
      it: 'il gatto più buono mangia.',
      fr: 'le chat meilleur mange.',
      es: 'el gato más bueno come.',
      pt: 'o gato melhor come.',
    });
    expect(cat({ adjectives: ['BEAUTIFUL'], adjectiveDegrees: ['less'] })).toMatchObject({
      it: 'il gatto meno bello mangia.',
      fr: 'le chat moins beau mange.',
      es: 'el gato menos hermoso come.',
    });
  });

  test('the equative — "equally" — is periphrastic in every language', () => {
    expect(cat({ adjectives: ['BIG'], adjectiveDegrees: ['equally'] })).toEqual({
      en: 'the equally big cat eats.',
      it: 'il gatto ugualmente grande mangia.',
      fr: 'le chat aussi grand mange.',
      es: 'el gato igual de grande come.',
      pt: 'o gato igualmente grande come.',
      de: 'der gleich große Kater isst.',
      ja: '同じくらい大きい猫は食べます。',
    });
  });

  test('German handles the LOWERED degrees correctly (only the raised ones are buggy)', () => {
    // "weniger ADJ" for less, "am wenigsten ADJ" for least, "gleich ADJ" for equally — none of
    // which touch the umlaut/suppletive machinery that the comparative and superlative get wrong.
    expect(cat({ adjectives: ['GOOD'], adjectiveDegrees: ['less'] }))
      .toMatchObject({ de: 'der weniger gute Kater isst.' });
    expect(cat({ adjectives: ['BIG'], adjectiveDegrees: ['least'] }))
      .toMatchObject({ de: 'der am wenigsten große Kater isst.' });
    expect(cat({ adjectives: ['OLD'], adjectiveDegrees: ['equally'] }))
      .toMatchObject({ de: 'der gleich alte Kater isst.' });
  });

  test('the Romance most/least are the comparative under the (default definite) article', () => {
    // Same legitimate homophony as the single-adjective case: with a definite article "il gatto
    // più grande" is both "the bigger" and "the biggest". So most == more and least == less here,
    // and that is correct — see the dedicated test above.
    const most = cat({ adjectives: ['BIG'], adjectiveDegrees: ['most'] });
    const more = cat({ adjectives: ['BIG'], adjectiveDegrees: ['more'] });
    expect(most.it).toBe(more.it);
    expect(most.es).toBe(more.es);
  });
});

// The superlative against every determiner. The interesting axis is definiteness: an English
// superlative demands "the", and the Romance relative superlative IS the definite article doing
// the work — so the two only line up when the determiner is definite.
describe('superlative with each determiner', () => {
  const most = (definiteness: Definiteness) =>
    cat({ adjectives: ['BIG'], adjectiveDegrees: ['most'], definiteness });

  test('definite — the meaningful case, correct everywhere', () => {
    expect(most('definite')).toMatchObject({
      en: 'the biggest cat eats.',
      it: 'il gatto più grande mangia.', // definite article carries the superlative
      fr: 'le chat plus grand mange.',
      es: 'el gato más grande come.',
      de: 'der größte Kater isst.', // umlaut + irregular superlative (größt), the ending is right
    });
  });

  test('the demonstratives carry their own definiteness', () => {
    expect(most('this')).toMatchObject({
      en: 'this biggest cat eats.',
      it: 'questo gatto più grande mangia.',
      es: 'este gato más grande come.',
    });
    expect(most('that')).toMatchObject({
      en: 'that biggest cat eats.',
      it: 'quel gatto più grande mangia.',
    });
  });

  test('"all" takes the article in Romance, and the plural agrees', () => {
    expect(most('all')).toMatchObject({
      en: 'all biggest cats eat.',
      it: 'tutti i gatti più grandi mangiano.',
      fr: 'tous les chats plus grands mangent.',
      es: 'todos los gatos más grandes comen.',
    });
  });
});

describe('known bugs: degree (extended)', () => {
  // Japanese, in the attributive case now (the same two were pinned for the predicative case in
  // complements/predicative.test.ts). LEAST renders as 最も — which is MOST — so "the least big
  // cat" and "the most big cat" come out identical, inverting the meaning.
  test('Japanese attributive "least" must not render as 最も ("most")', () => {
    const least = cat({ adjectives: ['BIG'], adjectiveDegrees: ['least'] }).ja;
    const most = cat({ adjectives: ['BIG'], adjectiveDegrees: ['most'] }).ja;
    expect(least).not.toBe(most);
  });

  // LESS reuses あまり, a negative-polarity adverb: あまり大きい is ungrammatical without a negated
  // predicate (あまり大きくない). Same defect as the predicative case.
  test('Japanese attributive "less" should not use あまり with an affirmative adjective', () => {
    expect(cat({ adjectives: ['BIG'], adjectiveDegrees: ['less'] }).ja).not.toContain('あまり');
  });

  // The concrete forms: a lowered degree negates the adjective — 最も…ない ("least") and
  // それほど…ない ("less") — while the raised degrees keep the affirmative. An i-adjective
  // (大きい) negates to 大きくない; a na-adjective (幸せな) to 幸せではない, both prenominal.
  test('Japanese renders the lowered degrees as the negated attributive adjective', () => {
    const big = (d: 'more' | 'most' | 'less' | 'least') =>
      cat({ adjectives: ['BIG'], adjectiveDegrees: [d] }).ja;
    expect(big('least')).toBe('最も大きくない猫は食べます。');
    expect(big('less')).toBe('それほど大きくない猫は食べます。');
    // Regression: the raised degrees are untouched.
    expect(big('most')).toBe('最も大きい猫は食べます。');
    expect(big('more')).toBe('もっと大きい猫は食べます。');
    // A na-adjective negates with ではない, still an い-adjective and still prenominal.
    const happy = (d: 'most' | 'less' | 'least') =>
      cat({ adjectives: ['HAPPY'], adjectiveDegrees: [d] }).ja;
    expect(happy('least')).toBe('最も幸せではない猫は食べます。');
    expect(happy('less')).toBe('それほど幸せではない猫は食べます。');
    expect(happy('most')).toBe('最も幸せな猫は食べます。');
  });

  // English superlatives are inherently definite ("THE biggest"), so an indefinite article is
  // ungrammatical with one: "a biggest cat eats." The engine renders the inflected superlative
  // regardless of the determiner. Either the superlative should force the definite article, or a
  // superlative-under-indefinite plan should be refused upstream — but "a biggest" is not English.
  test('English must not render a superlative under an indefinite article', () => {
    expect(cat({ adjectives: ['BIG'], adjectiveDegrees: ['most'], definiteness: 'indefinite' }).en)
      .not.toBe('a biggest cat eats.');
  });

  // The superlative forces the definite article across the determiners that would otherwise be
  // ungrammatical with one — the indefinite (singular and plural) and the bare determiner — and
  // for both superlative degrees (inflected 'most' and periphrastic 'least').
  test('English forces "the" for a superlative under an indefinite article', () => {
    expect(cat({ adjectives: ['BIG'], adjectiveDegrees: ['most'], definiteness: 'indefinite' }).en)
      .toBe('the biggest cat eats.');
  });

  test('English forces "the" for a superlative under a bare determiner', () => {
    expect(cat({ adjectives: ['BIG'], adjectiveDegrees: ['most'], definiteness: 'bare' }).en)
      .toBe('the biggest cat eats.');
  });

  test('English forces "the" for an indefinite plural superlative', () => {
    expect(cat({ adjectives: ['BIG'], adjectiveDegrees: ['most'], definiteness: 'indefinite', number: 'plural' }).en)
      .toBe('the biggest cats eat.');
  });

  test('English forces "the" for the periphrastic superlative "least"', () => {
    expect(cat({ adjectives: ['BIG'], adjectiveDegrees: ['least'], definiteness: 'indefinite' }).en)
      .toBe('the least big cat eats.');
  });

  // The forcing is scoped to the superlative: a comparative and a positive adjective keep the
  // indefinite article ("a bigger cat", "a big cat"), and an already-definite superlative is left
  // untouched.
  test('English keeps the indefinite article for a comparative (not a superlative)', () => {
    expect(cat({ adjectives: ['BIG'], adjectiveDegrees: ['more'], definiteness: 'indefinite' }).en)
      .toBe('a bigger cat eats.');
  });

  test('English keeps the indefinite article for a plain (positive) adjective', () => {
    expect(cat({ adjectives: ['BIG'], adjectiveDegrees: ['positive'], definiteness: 'indefinite' }).en)
      .toBe('a big cat eats.');
  });

  test('English leaves an already-definite superlative unchanged', () => {
    expect(cat({ adjectives: ['BIG'], adjectiveDegrees: ['most'], definiteness: 'definite' }).en)
      .toBe('the biggest cat eats.');
  });

  // German superlatives miss the linking -e- after a stem in -t (the epenthesis rule): INTERESTING
  // gives "interessantste" for "interessanteste", and BAD "schlechtste" for "schlechteste". This
  // is separate from the umlaut/suppletive misses on BIG/OLD/GOOD already pinned above.
  test('German superlative needs epenthetic -e- after -t: "interessanteste"', () => {
    expect(cat({ adjectives: ['INTERESTING'], adjectiveDegrees: ['most'] }))
      .toMatchObject({ de: 'der interessanteste Kater isst.' });
  });
});

// At least one case for every adjective in the corpus. Many are grammatical-category concepts
// (DEFINITE, PARTITIVE, the ordinals…) that carry role='adjective' for use elsewhere in the
// grammar; forced onto a noun they read oddly ("the partitive cat") but must still render. English
// is the reliable baseline — "the <word> cat eats." — so the lexeme of each is pinned here.
const EVERY_ADJECTIVE: [id: string, en: string][] = [
  ['BAD', 'bad'], ['BEAUTIFUL', 'beautiful'], ['BIG', 'big'], ['BROWN', 'brown'],
  ['CAREFUL', 'careful'], ['COLD', 'cold'], ['DEFINITE', 'definite'], ['DIRECT', 'direct'],
  ['DISTAL', 'distal'], ['FEMALE', 'female'], ['FIRST', 'first'], ['GOOD', 'good'],
  ['HAPPY', 'happy'], ['HIDDEN', 'hidden'], ['HOT', 'hot'], ['HUNGRY', 'hungry'],
  ['INDEFINITE', 'indefinite'], ['INDIRECT', 'indirect'], ['INTERESTING', 'interesting'],
  ['LAZY', 'lazy'], ['LOADED', 'loaded'], ['MALE', 'male'], ['MULTAL', 'multal'],
  ['NEGATIVE', 'negative'], ['NEUTER', 'neuter'], ['NEW', 'new'], ['OLD', 'old'],
  ['PARTITIVE', 'partitive'], ['PAUCAL', 'paucal'], ['PLURAL', 'plural'], ['PROXIMAL', 'proximal'],
  ['QUICK', 'quick'], ['SAD', 'sad'], ['SAVED', 'saved'], ['SECOND', 'second'],
  ['SEMANTIC', 'semantic'], ['SINGULAR', 'singular'], ['SMALL', 'small'], ['STRONG', 'strong'],
  ['THIRD', 'third'], ['TIRED', 'tired'], ['UNCONNECTED', 'unconnected'], ['UNIVERSAL', 'universal'],
  ['WEAK', 'weak'], ['WHOLE', 'whole'], ['YOUNG', 'young'], ['ZERO', 'zero'],
];

describe('every adjective renders attributively', () => {
  test.each(EVERY_ADJECTIVE)('%s → "the %s cat"', (id, en) => {
    const said = cat({ adjectives: [id] });
    expect(said.en).toBe(`the ${en} cat eats.`);
    // And every language produces a non-empty, terminated sentence for it — no dropped lexeme.
    for (const lang of ['it', 'fr', 'es', 'pt', 'de', 'ja'] as const) {
      expect(said[lang]).toMatch(/[.。]$/);
      expect(said[lang]).not.toContain('undefined');
    }
  });
});

// Italian sorts adjectives into a prenominal class (a short, common core) and a postnominal one
// (everything else). The class is lexical, so it is worth a spot-check across several adjectives.
describe('adjective position: Italian', () => {
  const it = (id: string) => cat({ adjectives: [id] }).it;

  test('the prenominal class sits before the noun', () => {
    expect(it('BIG')).toBe('il grande gatto mangia.');
    expect(it('OLD')).toBe('il vecchio gatto mangia.');
    expect(it('NEW')).toBe('il nuovo gatto mangia.');
    expect(it('SMALL')).toBe('il piccolo gatto mangia.');
    expect(it('YOUNG')).toBe('il giovane gatto mangia.');
    expect(it('BAD')).toBe('il cattivo gatto mangia.');
    expect(it('GOOD')).toBe('il buon gatto mangia.'); // buono → buon before a consonant
    expect(it('BEAUTIFUL')).toBe('il bel gatto mangia.'); // bello → bel
    expect(it('FIRST')).toBe('il primo gatto mangia.'); // ordinals are prenominal
  });

  test('everything else follows the noun', () => {
    expect(it('HAPPY')).toBe('il gatto felice mangia.');
    expect(it('STRONG')).toBe('il gatto forte mangia.');
    expect(it('COLD')).toBe('il gatto freddo mangia.');
    expect(it('INTERESTING')).toBe('il gatto interessante mangia.');
    expect(it('SEMANTIC')).toBe('il gatto semantico mangia.');
    expect(it('QUICK')).toBe('il gatto veloce mangia.');
  });
});

// Japanese links an attributive adjective to its noun by one of several routes, decided by the
// adjective's class: an i-adjective attaches directly, a na-adjective takes な, a noun-adjective
// takes の, and a verb-derived one takes its plain past (た).
describe('adjective linker: Japanese', () => {
  const ja = (id: string) => cat({ adjectives: [id] }).ja;

  test('an i-adjective attaches directly', () => {
    expect(ja('BIG')).toBe('大きい猫は食べます。'); // 大きい, ends in い, no linker
    expect(ja('OLD')).toBe('古い猫は食べます。');
    expect(ja('STRONG')).toBe('強い猫は食べます。');
  });

  test('a na-adjective takes な', () => {
    expect(ja('HAPPY')).toBe('幸せな猫は食べます。');
    expect(ja('CAREFUL')).toBe('慎重な猫は食べます。');
    expect(ja('SEMANTIC')).toBe('意味的な猫は食べます。');
  });

  test('a noun-adjective takes の', () => {
    expect(ja('MALE')).toBe('男性の猫は食べます。');
    expect(ja('SEMANTIC')).not.toContain('意味的の'); // …but a na-adjective must not take の
  });

  test('a verb-derived adjective takes its plain past', () => {
    expect(ja('TIRED')).toBe('疲れた猫は食べます。'); // 疲れる → 疲れた
    expect(ja('UNCONNECTED')).toBe('孤立した猫は食べます。');
  });
});

describe('known bugs: adjective linker (Japanese)', () => {
  // BROWN is the one adjective in the corpus that attaches with NO linker: 茶色猫. 茶色 is a noun
  // ("brown[ness]"), so attributively it needs の — 茶色の猫 — exactly like the other noun-
  // adjectives (男性の, 定冠詞の). It is the only one of the 47 that comes out bare; every other
  // adjective takes い / な / の / た. (茶色い猫, the i-adjective form, would do as well — the
  // surface is a design call, but the bare compound is not it.)
  test.fails('Japanese BROWN needs a linker: 茶色の猫, not 茶色猫', () => {
    expect(cat({ adjectives: ['BROWN'] }).ja).toBe('茶色の猫は食べます。');
  });
});

// All 36 combinations of two adjectives, each at every degree. `adjectiveDegrees` is index-
// aligned, so BIG takes d1 and OLD takes d2 independently. The grid exercises two interacting
// systems at once: each adjective's own degree form, and where that degree puts it relative to
// the noun (and to the other adjective) in Romance.
describe('two adjectives across all degree combinations', () => {
  const DEGREES: Degree[] = ['positive', 'more', 'most', 'less', 'least', 'equally'];
  const pairs = DEGREES.flatMap((d1) => DEGREES.map((d2): [Degree, Degree] => [d1, d2]));

  const say = (d1: Degree, d2: Degree) =>
    cat({ adjectives: ['BIG', 'OLD'], adjectiveDegrees: [d1, d2] });

  // English keeps both adjectives prenominal in order at every degree, so its 36 outputs are
  // fully generable — the strongest way to assert "all combinations".
  const EN_BIG: Record<Degree, string> = {
    positive: 'big', more: 'bigger', most: 'biggest',
    less: 'less big', least: 'least big', equally: 'equally big',
  };
  const EN_OLD: Record<Degree, string> = {
    positive: 'old', more: 'older', most: 'oldest',
    less: 'less old', least: 'least old', equally: 'equally old',
  };

  test.each(pairs)('English BIG@%s + OLD@%s', (d1, d2) => {
    expect(say(d1, d2).en).toBe(`the ${EN_BIG[d1]} ${EN_OLD[d2]} cat eats.`);
  });

  // Romance: a positive adjective of the prenominal class stays before the noun; a compared one
  // (any non-positive degree) moves after it. So which side each adjective lands on is a function
  // of its own degree — the four quadrants below.
  test('both positive → both prenominal, juxtaposed (no conjunction)', () => {
    expect(say('positive', 'positive')).toMatchObject({
      it: 'il grande vecchio gatto mangia.',
      fr: 'le grand vieux chat mange.',
      de: 'der große alte Kater isst.',
    });
  });

  test('one compared → it crosses the noun, the positive one stays prenominal', () => {
    // OLD compared, BIG positive: BIG before, OLD after.
    expect(say('positive', 'more')).toMatchObject({
      en: 'the big older cat eats.',
      it: 'il grande gatto più vecchio mangia.',
      fr: 'le grand chat plus vieux mange.',
    });
    // BIG compared, OLD positive: the mirror image.
    expect(say('more', 'positive')).toMatchObject({
      en: 'the bigger old cat eats.',
      it: 'il vecchio gatto più grande mangia.',
      fr: 'le vieux chat plus grand mange.',
    });
  });

  test('both compared → both postnominal, and now they COORDINATE', () => {
    // Two adjectives on the same (post-nominal) side are joined with e/et, unlike the juxtaposed
    // prenominal pair above. This holds for any mix of non-positive degrees.
    expect(say('more', 'more')).toMatchObject({
      it: 'il gatto più grande e più vecchio mangia.',
      fr: 'le chat plus grand et plus vieux mange.',
      es: 'el gato más grande y más viejo come.',
    });
    expect(say('less', 'equally')).toMatchObject({
      it: 'il gatto meno grande e ugualmente vecchio mangia.',
      fr: 'le chat moins grand et aussi vieux mange.',
    });
    expect(say('most', 'least')).toMatchObject({
      // most==more and least==less under the definite article (the legitimate homophony).
      it: 'il gatto più grande e meno vecchio mangia.',
    });
  });

  test('Spanish, both postnominal, joins with "y" — but "e" before an i-sound', () => {
    // The euphonic rule: y → e before a word beginning /i/. "igual" (equally) triggers it; "más"
    // and "menos" and "viejo" do not.
    expect(say('more', 'positive').es).toBe('el gato más grande y viejo come.'); // y viejo
    expect(say('equally', 'positive').es).toBe('el gato igual de grande y viejo come.');
    expect(say('positive', 'equally').es).toBe('el gato grande e igual de viejo come.'); // e igual
    expect(say('more', 'equally').es).toBe('el gato más grande e igual de viejo come.');
  });

  // Every combination renders a well-formed sentence in every language — a guard over the whole
  // grid, catching a dropped conjunction or a stranded degree word that a spot-check would miss.
  test.each(pairs)('BIG@%s + OLD@%s is well-formed everywhere', (d1, d2) => {
    const said = say(d1, d2);
    for (const lang of ['en', 'it', 'fr', 'es', 'pt', 'de', 'ja'] as const) {
      expect(said[lang]).toMatch(/[.。]$/);
      expect(said[lang]).not.toMatch(/\s{2,}|undefined|,\s*[.。]/);
    }
  });
});

// Romance decides an adjective's side of the noun by its lexical class: a small prenominal set
// (grande, vecchio, buono…) sits before, everything else after. Combining adjectives of different
// classes is where that shows — these cover the two-postnominal and the mixed cases.
describe('Romance: two postnominal adjectives', () => {
  test('both follow the noun and are coordinated, in the given order', () => {
    expect(cat({ adjectives: ['STRONG', 'HAPPY'] })).toMatchObject({
      it: 'il gatto forte e felice mangia.',
      fr: 'le chat fort et heureux mange.',
      es: 'el gato fuerte y feliz come.',
      pt: 'o gato forte e feliz come.',
    });
    // Reversing the pair reverses the surface — postnominal order is the input order.
    expect(cat({ adjectives: ['HAPPY', 'STRONG'] })).toMatchObject({
      it: 'il gatto felice e forte mangia.',
      fr: 'le chat heureux et fort mange.',
      es: 'el gato feliz y fuerte come.',
    });
  });

  test('the coordinator takes its euphonic form before a vowel / i-sound', () => {
    // Italian "e" (no change here), Spanish "y" → "e" before /i/: "frío e interesante".
    expect(cat({ adjectives: ['COLD', 'INTERESTING'] })).toMatchObject({
      it: 'il gatto freddo e interessante mangia.',
      es: 'el gato frío e interesante come.', // e, not y, before "interesante"
      pt: 'o gato frio e interessante come.',
    });
  });

  test('both agree with the head in gender and number', () => {
    expect(cat({ gender: 'fem', number: 'plural', adjectives: ['STRONG', 'HAPPY'] }))
      .toMatchObject({
        it: 'le gatte forti e felici mangiano.',
        fr: 'les chattes fortes et heureuses mangent.',
        es: 'las gatas fuertes y felices comen.',
      });
  });
});

describe('Romance: a prenominal and a postnominal adjective', () => {
  test('the prenominal one leads, the postnominal one trails — no coordinator between them', () => {
    // They sit on opposite sides of the noun, so nothing joins them: "il grande gatto felice",
    // not "il grande e felice gatto" nor "il gatto grande e felice".
    expect(cat({ adjectives: ['BIG', 'HAPPY'] })).toMatchObject({
      it: 'il grande gatto felice mangia.',
      fr: 'le grand chat heureux mange.',
    });
    expect(cat({ adjectives: ['OLD', 'STRONG'] })).toMatchObject({
      it: 'il vecchio gatto forte mangia.',
      fr: 'le vieux chat fort mange.',
    });
    expect(cat({ adjectives: ['BEAUTIFUL', 'STRONG'] })).toMatchObject({
      it: 'il bel gatto forte mangia.', // bello → bel, prenominally
      fr: 'le beau chat fort mange.',
    });
  });

  test('Italian and French place by class, so the input order does not move them', () => {
    // [BIG, HAPPY] and [HAPPY, BIG] both yield "il grande gatto felice": grande is prenominal and
    // felice postnominal whatever order they arrive in — the position is lexical, not positional.
    const forward = cat({ adjectives: ['BIG', 'HAPPY'] });
    const reversed = cat({ adjectives: ['HAPPY', 'BIG'] });
    expect(reversed.it).toBe(forward.it);
    expect(reversed.fr).toBe(forward.fr);

    // Iberian Romance, where both are postnominal, DOES follow the input order instead.
    expect(forward.es).toBe('el gato grande y feliz come.');
    expect(reversed.es).toBe('el gato feliz y grande come.');
  });

  test('two prenominal and one postnominal: the pair juxtaposes, the last trails', () => {
    // "il grande vecchio gatto felice" — grande vecchio juxtaposed (no e), felice after the noun.
    // Only one adjective is postnominal, so no coordinator appears at all.
    expect(cat({ adjectives: ['BIG', 'OLD', 'HAPPY'] })).toMatchObject({
      it: 'il grande vecchio gatto felice mangia.',
      fr: 'le grand vieux chat heureux mange.',
    });
  });
});

describe('known bugs: Romance postnominal coordination', () => {
  // Three postnominal adjectives repeat the conjunction — "forte e felice e freddo" — where the
  // list should be comma-separated with the coordinator only before the last: "forte, felice e
  // freddo". This is the SAME defect already pinned for Spanish/Portuguese (with BIG/OLD/BEAUTIFUL),
  // but those adjectives are prenominal in Italian and French, so they juxtapose and hide it.
  // A postnominal triple shows that Italian and French have the bug too — it is Romance-wide.
  test.fails('Italian should comma-separate three postnominal adjectives', () => {
    expect(cat({ adjectives: ['STRONG', 'HAPPY', 'COLD'] }))
      .toMatchObject({ it: 'il gatto forte, felice e freddo mangia.' });
  });

  test.fails('French should comma-separate three postnominal adjectives', () => {
    expect(cat({ adjectives: ['STRONG', 'HAPPY', 'COLD'] }))
      .toMatchObject({ fr: 'le chat fort, heureux et froid mange.' });
  });

  test.fails('Spanish, likewise, for a postnominal triple', () => {
    expect(cat({ adjectives: ['STRONG', 'HAPPY', 'COLD'] }))
      .toMatchObject({ es: 'el gato fuerte, feliz y frío come.' });
  });
});
