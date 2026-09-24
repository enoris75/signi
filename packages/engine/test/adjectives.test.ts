import { describe, expect, test } from 'vitest';
import type { Definiteness, Degree, NounModifier, NounPhrase } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';

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
      de: 'der große Kater frisst.',
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
      de: 'die großen Katzen fressen.',
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
      // Italian gives the prenominal slot to one qualifying adjective; the second follows the
      // noun (A145). French stacks two of them idiomatically.
      it: 'il grande gatto vecchio mangia.',
      fr: 'le grand vieux chat mange.',
      // Iberian Romance coordinates postnominal adjectives with a conjunction.
      es: 'el gato grande y viejo come.',
      pt: 'o gato grande e velho come.',
      de: 'der große alte Kater frisst.',
      ja: '大きい古い猫は食べます。',
    });
  });

  test('all of them agree with the head', () => {
    expect(cat({ gender: 'fem', number: 'plural', adjectives: ['BIG', 'OLD'] })).toMatchObject({
      it: 'le grandi gatte vecchie mangiano.',
      fr: 'les grandes vieilles chattes mangent.',
      es: 'las gatas grandes y viejas comen.',
      pt: 'as gatas grandes e velhas comem.',
      de: 'die großen alten Katzen fressen.',
    });
  });

  test('position is decided per adjective, not per phrase', () => {
    // BIG is prenominal in Italian and French; BROWN is not — so one goes each side of the head.
    expect(cat({ adjectives: ['BIG', 'BROWN'] })).toMatchObject({
      it: 'il grande gatto marrone mangia.',
      fr: 'le grand chat brun mange.',
      en: 'the big brown cat eats.',
      de: 'der große braune Kater frisst.',
    });
  });

  test('Italian apocopates before a consonant', () => {
    // bello → bel, prenominally: "il bel gatto", never "il bello gatto". It only apocopates where it
    // stands before the noun, so it has to lead the list — behind another BAGS adjective it is
    // demoted and takes its plain postnominal form (A145).
    expect(cat({ adjectives: ['BEAUTIFUL', 'OLD'] })).toMatchObject({
      it: 'il bel gatto vecchio mangia.',
    });
    expect(cat({ adjectives: ['BIG', 'OLD', 'BEAUTIFUL'] })).toMatchObject({
      it: 'il grande gatto vecchio e bello mangia.',
      fr: 'le grand vieux beau chat mange.',
      de: 'der große alte schöne Kater frisst.',
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
      de: 'die Wortphrasenkarte brennt.', // the feminine -e takes its linking -n- (B10)
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
      de: 'der weniger große Kater frisst.',
    });
  });
});

// Each of these asserts the CORRECT output and is expected to fail today. Fix the engine and
// the test will report "expected to fail but passed" — that is the signal to drop `.fails`.
describe('known bugs: degree', () => {
  const withDegree = (adjective: string, degree: 'more' | 'most') =>
    sayAll(clause(np('CAT', { adjectives: [adjective], adjectiveDegrees: [degree] }), 'EAT'));

  test('German umlauts the comparative: groß → größer', () => {
    expect(withDegree('BIG', 'more')).toMatchObject({ de: 'der größere Kater frisst.' });
  });

  test('German umlauts the superlative: groß → größt', () => {
    expect(withDegree('BIG', 'most')).toMatchObject({ de: 'der größte Kater frisst.' });
  });

  test('German has suppletive comparatives: gut → besser', () => {
    expect(withDegree('GOOD', 'more')).toMatchObject({ de: 'der bessere Kater frisst.' });
  });

  // The fix generalises beyond groß/gut: the umlaut set, the epenthesis rule and the
  // suppletive superlative, each verified below — and the non-umlauting stems left untouched.
  test('German umlauts the whole monosyllabic set, comparative and superlative', () => {
    expect(withDegree('OLD', 'more').de).toBe('der ältere Kater frisst.');
    expect(withDegree('OLD', 'most').de).toBe('der älteste Kater frisst.');
    expect(withDegree('YOUNG', 'more').de).toBe('der jüngere Kater frisst.');
    expect(withDegree('YOUNG', 'most').de).toBe('der jüngste Kater frisst.');
    expect(withDegree('STRONG', 'more').de).toBe('der stärkere Kater frisst.');
    expect(withDegree('WEAK', 'most').de).toBe('der schwächste Kater frisst.');
    expect(withDegree('COLD', 'most').de).toBe('der kälteste Kater frisst.'); // umlaut + epenthesis
  });

  test('German inserts the epenthetic -e- after a dental/sibilant stem', () => {
    expect(withDegree('BAD', 'most').de).toBe('der schlechteste Kater frisst.'); // -t → -est
    expect(withDegree('HOT', 'most').de).toBe('der heißeste Kater frisst.'); // -ß → -est, no umlaut
    expect(withDegree('QUICK', 'most').de).toBe('der schnellste Kater frisst.'); // plain -st
  });

  test('German has a suppletive superlative too: gut → best', () => {
    expect(withDegree('GOOD', 'most').de).toBe('der beste Kater frisst.');
  });

  // Regression guard: umlaut is lexical, not a blanket vowel rule — an unflagged stem stays put
  // (braun → brauner, never *bräuner; heiß → heißer, never *häißer).
  test('German does not umlaut an adjective not flagged for it', () => {
    expect(withDegree('BROWN', 'more').de).toBe('der braunere Kater frisst.');
    expect(withDegree('HOT', 'more').de).toBe('der heißere Kater frisst.');
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

// French doubles the definite article on a postnominal relative superlative — "le chat le plus
// grand" — which is what distinguishes it from the homophonous comparative "le chat plus grand".
// Italian/Spanish/Portuguese do NOT double (that homophony is deliberate; see C01). Was B04.
describe('French relative superlative doubles the article', () => {
  test('masculine singular: le chat le plus grand', () => {
    expect(sayAll(clause(np('CAT', {
      adjectives: ['BIG'], adjectiveDegrees: ['most'],
    }), 'EAT'))).toMatchObject({ fr: 'le chat le plus grand mange.' });
  });

  test('feminine singular agrees the article: la souris la plus grande', () => {
    expect(sayAll(clause(np('MOUSE', {
      adjectives: ['BIG'], adjectiveDegrees: ['most'],
    }), 'EAT'))).toMatchObject({ fr: 'la souris la plus grande mange.' });
  });

  test('the lowered superlative ("least") doubles too: le chat le moins grand', () => {
    expect(sayAll(clause(np('CAT', {
      adjectives: ['BIG'], adjectiveDegrees: ['least'],
    }), 'EAT'))).toMatchObject({ fr: 'le chat le moins grand mange.' });
  });

  test('a suppletive superlative doubles as well: le chat le meilleur', () => {
    expect(sayAll(clause(np('CAT', {
      adjectives: ['GOOD'], adjectiveDegrees: ['most'],
    }), 'EAT'))).toMatchObject({ fr: 'le chat le meilleur mange.' });
  });

  // Regression: the doubling is French-only. The comparative keeps a single article in French,
  // and Italian/Spanish/Portuguese keep a single article for the superlative (C01 homophony).
  test('French comparative is NOT doubled, and It/Es/Pt superlatives keep one article', () => {
    expect(sayAll(clause(np('CAT', {
      adjectives: ['BIG'], adjectiveDegrees: ['more'],
    }), 'EAT'))).toMatchObject({ fr: 'le chat plus grand mange.' });
    expect(sayAll(clause(np('CAT', {
      adjectives: ['BIG'], adjectiveDegrees: ['most'],
    }), 'EAT'))).toMatchObject({
      it: 'il gatto più grande mangia.',
      es: 'el gato más grande come.',
      pt: 'o maior gato come.',
    });
  });
});

describe('known bugs: adjectives', () => {
  // Three or more coordinated adjectives used to repeat the conjunction: "grande y viejo y hermoso".
  // Iberian Romance coordinates a list the same way it coordinates nouns — comma-separated, with
  // the conjunction only before the last: "grande, viejo y hermoso". The engine already did this
  // correctly for coordinated NOUNS ("el gato, el perro y el ratón"), so the rule existed; it is
  // now applied to the adjective list too.
  test('Spanish comma-separates three adjectives, not repeat "y"', () => {
    expect(cat({ adjectives: ['BIG', 'OLD', 'BEAUTIFUL'] }))
      .toMatchObject({ es: 'el gato grande, viejo y hermoso come.' });
  });

  test('Portuguese comma-separates three adjectives, not repeat "e"', () => {
    expect(cat({ adjectives: ['BIG', 'OLD', 'BEAUTIFUL'] }))
      .toMatchObject({ pt: 'o gato grande, velho e belo come.' });
  });

  // German used to CHANGE THE MEANING here. An adjective belonging to the attributive noun was
  // hoisted out onto the head: "der semantische alte Phraseschöpfer" said the *creator* was
  // semantic, when the plan says the *phrases* are. A German compound cannot take an internal
  // adjective, so the compound is abandoned when the modifier carries one — a postposed genitive
  // does it: "der alte Schöpfer semantischer Phrasen". Compare Italian, likewise correct: "il
  // vecchio creatore di frasi semantiche".
  test('German must not hoist the modifier\'s adjective onto the head', () => {
    expect(sayAll(clause(np('CREATOR', {
      adjectives: ['OLD'],
      nounModifiers: [{
        concept: 'PHRASE', relation: 'material', number: 'plural', adjectives: ['SEMANTIC'],
      }],
    }), 'BURN'))).toMatchObject({ de: 'der alte Schöpfer semantischer Phrasen brennt.' });
  });

  // A singular neuter modifier takes the genitive singular: strong -en on the adjective and the
  // noun's own -es ("großen Wortes"), the head keeping none of it.
  test('German renders a singular modifier-with-adjective as a genitive singular', () => {
    expect(sayAll(clause(np('CREATOR', {
      nounModifiers: [{ concept: 'WORD', relation: 'material', adjectives: ['BIG'] }],
    }), 'BURN')).de).toBe('der Schöpfer großen Wortes brennt.');
  });

  // Two modifiers, one bare and one adjective-bearing: the bare one still compounds onto the head
  // ("Wortschöpfer"), only the adjective-bearing one breaks out into the genitive.
  test('German compounds the bare modifier but genitivises the adjective-bearing one', () => {
    expect(sayAll(clause(np('CREATOR', {
      nounModifiers: [
        { concept: 'WORD', relation: 'material' },
        { concept: 'PHRASE', relation: 'material', number: 'plural', adjectives: ['SEMANTIC'] },
      ],
    }), 'BURN')).de).toBe('der Wortschöpfer semantischer Phrasen brennt.');
  });

  // The genitive modifier is invariant to the head's case: the head declines accusative
  // ("den alten Schöpfer") while "semantischer Phrasen" stays put.
  test('German keeps the modifier genitive when the head is an accusative object', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', {
      directObject: np('CREATOR', {
        adjectives: ['OLD'],
        nounModifiers: [{ concept: 'PHRASE', relation: 'material', number: 'plural', adjectives: ['SEMANTIC'] }],
      }),
    })).de).toBe('der Kater sieht den alten Schöpfer semantischer Phrasen.');
  });

  // Regression: an adjective-LESS modifier still forms the closed compound it always did.
  test('German still compounds a modifier that carries no adjective', () => {
    expect(sayAll(clause(np('CREATOR', {
      nounModifiers: [{ concept: 'WORD', relation: 'material' }],
    }), 'BURN')).de).toBe('der Wortschöpfer brennt.');
  });

  // A43. French forms the feminine of an adjective by rule (+e), correct for "grand → grande",
  // "haut → haute", but WRONG for the irregular "bas" (LOW): its feminine doubles the s → "basse",
  // not "base". The rule in agreeAdjFr has no -s branch, so it falls through to the plain
  // +e. Latent until a feminine noun took LOW; the seeded feminine dimension noun TEMPERATURE
  // surfaces it — the gloss COLD will use reads "à température basse". Fix: add
  // `bas: ['bas', 'basse', 'bas', 'basses']` to FR_ADJ_IRREGULAR in fr.consts.ts.
  test('French feminine of "bas" (LOW) is "basse", not "base"', () => {
    expect(cat({ gender: 'fem', adjectives: ['LOW'] }))
      .toMatchObject({ fr: 'la chatte basse mange.' });
  });

  // Feminine plural is the feminine stem + s: "basses" (not "bases").
  test('French feminine plural of "bas" is "basses"', () => {
    expect(cat({ gender: 'fem', number: 'plural', adjectives: ['LOW'] }))
      .toMatchObject({ fr: 'les chattes basses mangent.' });
  });

  // Regression: the masculine is unchanged by the fix — "bas" in the singular, and invariable in
  // the plural (the -s/-x masculine-plural rule at the tail of agreeAdjFr), never "*base".
  test('French masculine of "bas" stays "bas", invariable in the plural', () => {
    expect(cat({ adjectives: ['LOW'] })).toMatchObject({ fr: 'le chat bas mange.' });
    expect(cat({ number: 'plural', adjectives: ['LOW'] }))
      .toMatchObject({ fr: 'les chats bas mangent.' });
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
      de: 'der gleich große Kater frisst.',
      ja: '同じくらい大きい猫は食べます。',
    });
  });

  test('German handles the LOWERED degrees correctly (only the raised ones are buggy)', () => {
    // "weniger ADJ" for less, "am wenigsten ADJ" for least, "gleich ADJ" for equally — none of
    // which touch the umlaut/suppletive machinery that the comparative and superlative get wrong.
    expect(cat({ adjectives: ['GOOD'], adjectiveDegrees: ['less'] }))
      .toMatchObject({ de: 'der weniger gute Kater frisst.' });
    expect(cat({ adjectives: ['BIG'], adjectiveDegrees: ['least'] }))
      .toMatchObject({ de: 'der am wenigsten große Kater frisst.' });
    expect(cat({ adjectives: ['OLD'], adjectiveDegrees: ['equally'] }))
      .toMatchObject({ de: 'der gleich alte Kater frisst.' });
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
      fr: 'le chat le plus grand mange.', // French doubles the article for the superlative
      es: 'el gato más grande come.',
      de: 'der größte Kater frisst.', // umlaut + irregular superlative (größt), the ending is right
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
      fr: 'tous les chats les plus grands mangent.', // doubled article, agreed plural
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
      .toMatchObject({ de: 'der interessanteste Kater frisst.' });
  });
});

// At least one case for every adjective in the corpus. Many are grammatical-category concepts
// (DEFINITE, PARTITIVE, the ordinals…) that carry role='adjective' for use elsewhere in the
// grammar; forced onto a noun they read oddly ("the partitive cat") but must still render. English
// is the reliable baseline — "the <word> cat eats." — so the lexeme of each is pinned here.
const EVERY_ADJECTIVE: [id: string, en: string][] = [
  ['ABLE', 'able'], ['ACTIVE', 'active'], ['ADDED', 'added'], ['ADULT', 'adult'], ['ADVERSATIVE', 'adversative'], ['BAD', 'bad'], ['BEAUTIFUL', 'beautiful'], ['BIG', 'big'],
  ['BROWN', 'brown'], ['CANINE', 'canine'], ['CAREFUL', 'careful'], ['CASTRATED', 'castrated'], ['CLOSED', 'closed'],
  ['COLD', 'cold'], ['COLD_CLIMATE', 'cold'], ['CONCLUSIVE', 'conclusive'], ['CONDITIONAL', 'conditional'], ['COORDINATED', 'coordinated'],
  ['COPIED', 'copied'], ['COPULATIVE', 'copulative'], ['DEFINITE', 'definite'], ['DIRECT', 'direct'], ['DISJUNCTIVE', 'disjunctive'],
  ['DISTAL', 'distal'], ['DOMESTIC', 'domestic'], ['ELDER', 'older'], ['EMPTY', 'empty'], ['EXPLICATIVE', 'explicative'],
  ['FAILED', 'failed'], ['FAR', 'far'], ['FEMALE', 'female'],
  ['FIRST', 'first'], ['FUTURE', 'future'], ['GOOD', 'good'],
  ['HAPPY', 'happy'], ['HIDDEN', 'hidden'], ['HOT', 'hot'], ['HOT_CLIMATE', 'hot'], ['HUNGRY', 'hungry'],
  ['INDEFINITE', 'indefinite'], ['INDIRECT', 'indirect'], ['INTERESTING', 'interesting'],
  ['KNOWN', 'known'],
  ['LAZY', 'lazy'], ['LINKED', 'linked'], ['LOADED', 'loaded'], ['LOUD', 'loud'], ['MAIN', 'main'], ['MALE', 'male'], ['MANIFOLD', 'manifold'], ['MISSING', 'missing'], ['MULTAL', 'multal'],
  ['NEAR', 'near'], ['NEGATIVE', 'negative'], ['NEUTER', 'neuter'], ['NEUTRAL', 'neutral'], ['NEW', 'new'], ['NEXT', 'next'],
  ['NUMBERED', 'numbered'],
  ['OBLIGED', 'obliged'], ['OLD', 'old'], ['OPEN_ADJECTIVE', 'open'],
  ['OTHER', 'other'], ['PARTITIVE', 'partitive'], ['PAST', 'past'], ['PAUCAL', 'paucal'], ['PRESENT', 'present'], ['PINNED', 'pinned'], ['PLURAL', 'plural'],
  ['POSITIVE', 'positive'], ['PREVIOUS', 'previous'], ['PROGRESSIVE', 'progressive'], ['PROSPECTIVE', 'prospective'], ['PROXIMAL', 'proximal'],
  ['QUICK', 'quick'], ['RECENT', 'recent'], ['REMOVED', 'removed'], ['RESULTATIVE', 'resultative'], ['ROUND', 'round'], ['SAD', 'sad'], ['SAVED', 'saved'],
  ['SECOND', 'second'], ['SEMANTIC', 'semantic'], ['SHARP', 'sharp'], ['SINGULAR', 'singular'], ['SMALL', 'small'], ['SOLE', 'sole'], ['SOLID', 'solid'],
  ['SPATIAL', 'spatial'], ['STRONG', 'strong'], ['SUBORDINATE', 'subordinate'], ['SWEET', 'sweet'], ['TEMPORAL', 'temporal'], ['THIRD', 'third'], ['TIDY', 'tidy'], ['TIRED', 'tired'], ['UNCONNECTED', 'unconnected'],
  ['UNEXPECTED', 'unexpected'], ['UNIVERSAL', 'universal'], ['UNKNOWN', 'unknown'], ['UNPINNED', 'unpinned'], ['UNTITLED', 'untitled'], ['VALID', 'valid'], ['VISIBLE', 'visible'], ['WARM', 'warm'], ['WEAK', 'weak'], ['WHOLE', 'whole'],
  ['WILD', 'wild'],
  ['WRITTEN', 'written'], ['YOUNG', 'young'], ['YOUNGER', 'younger'], ['ZERO', 'zero'],
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
    expect(it('WILD')).toBe('il gatto selvatico mangia.');
    expect(it('DOMESTIC')).toBe('il gatto domestico mangia.');
    expect(it('CANINE')).toBe('il gatto canino mangia.');
    expect(it('ADULT')).toBe('il gatto adulto mangia.');
    expect(it('CASTRATED')).toBe('il gatto castrato mangia.'); // past participle, postnominal
    expect(it('ROUND')).toBe('il gatto rotondo mangia.');
    expect(it('WRITTEN')).toBe('il gatto scritto mangia.'); // past participle, agrees & postnominal
    expect(it('SHARP')).toBe('il gatto affilato mangia.');
    expect(it('LOUD')).toBe('il gatto forte mangia.');
    expect(it('NEAR')).toBe('il gatto vicino mangia.');
    expect(it('FAR')).toBe('il gatto lontano mangia.');
  });
});

// SHARP and LOUD, the differentia adjectives of a blade and a sound. Both are postnominal in
// Romance and agree with a feminine or plural head; German umlauts SHARP in the comparative
// (scharf → schärfer). SHARP is a sharpened state, so es/pt predicate it with estar; LOUD is an
// inherent property and keeps ser.
// WARM, seeded for AFFECTION's gloss (B30). The figurative sense, so the Romance words are not the
// temperature ones: it caloroso, fr chaleureux, pt caloroso. French is the reason this is worth a
// case of its own — chaleureux declines by the -eux → -euse rule, and its masculine plural is
// invariable, which no other seeded adjective exercises.
describe('adjective agreement: the B30 adjective WARM', () => {
  test('WARM agrees, and French chaleureux takes -euse in the feminine', () => {
    expect(sayAll(clause(np('CAT', { gender: 'fem', adjectives: ['WARM'] }), 'RUN'))).toEqual({
      en: 'the warm cat runs.',
      it: 'la gatta calorosa corre.',
      fr: 'la chatte chaleureuse court.',
      es: 'la gata cálida corre.',
      pt: 'a gata calorosa corre.',
      de: 'die warme Katze läuft.',
      ja: '温かい猫は走ります。',
    });
    expect(sayAll(clause(np('CAT', { gender: 'fem', number: 'plural', adjectives: ['WARM'] }), 'RUN'))).toEqual({
      en: 'the warm cats run.',
      it: 'le gatte calorose corrono.',
      fr: 'les chattes chaleureuses courent.',
      es: 'las gatas cálidas corren.',
      pt: 'as gatas calorosas correm.',
      de: 'die warmen Katzen laufen.',
      ja: '温かい猫は走ります。',
    });
    // The masculine plural is invariable in French (chaleureux, like heureux), where Italian,
    // Spanish and Portuguese all take -s.
    expect(sayAll(clause(np('CAT', { number: 'plural', adjectives: ['WARM'] }), 'RUN'))).toMatchObject({
      it: 'i gatti calorosi corrono.',
      fr: 'les chats chaleureux courent.',
      es: 'los gatos cálidos corren.',
      pt: 'os gatos calorosos correm.',
    });
  });

  test('WARM on FEELING is AFFECTION\'s gloss, rendered as a subject', () => {
    // The exact noun phrase the AFFECTION definition composes — glossOf('FEELING', 'WARM') — but
    // run through a clause, so the agreement is visible on a neuter German head and a masculine
    // Romance one. Italian puts caloroso after its noun; German inflects warm before it.
    expect(sayAll(clause(np('FEELING', { definiteness: 'indefinite', adjectives: ['WARM'] }), 'RUN'))).toEqual({
      en: 'a warm feeling runs.',
      it: 'un sentimento caloroso corre.',
      fr: 'un sentiment chaleureux court.',
      es: 'un sentimiento cálido corre.',
      pt: 'um sentimento caloroso corre.',
      de: 'ein warmes Gefühl läuft.',
      ja: '温かい感情は走ります。',
    });
  });
});

describe('adjective agreement: SHARP and LOUD', () => {
  test('SHARP agrees with a feminine head, singular and plural', () => {
    expect(sayAll(clause(np('BLADE', { definiteness: 'indefinite', adjectives: ['SHARP'] }), 'RUN'))).toEqual({
      en: 'a sharp blade runs.',
      it: 'una lama affilata corre.',
      fr: 'une lame tranchante court.',
      es: 'una cuchilla afilada corre.',
      pt: 'uma lâmina afiada corre.',
      de: 'eine scharfe Klinge läuft.',
      ja: '鋭い刃は走ります。',
    });
    expect(sayAll(clause(np('BLADE', { number: 'plural', adjectives: ['SHARP'] }), 'RUN'))).toEqual({
      en: 'the sharp blades run.',
      it: 'le lame affilate corrono.',
      fr: 'les lames tranchantes courent.',
      es: 'las cuchillas afiladas corren.',
      pt: 'as lâminas afiadas correm.',
      de: 'die scharfen Klingen laufen.',
      ja: '鋭い刃は走ります。',
    });
  });

  test('SHARP follows the head\'s own gender: masculine teeth, but feminine "dents" in French', () => {
    expect(sayAll(clause(np('TOOTH', { number: 'plural', adjectives: ['SHARP'] }), 'RUN'))).toEqual({
      en: 'the sharp teeth run.',
      it: 'i denti affilati corrono.',
      fr: 'les dents tranchantes courent.',
      es: 'los dientes afilados corren.',
      pt: 'os dentes afiados correm.',
      de: 'die scharfen Zähne laufen.',
      ja: '鋭い歯は走ります。',
    });
  });

  test('German umlauts SHARP in the comparative', () => {
    expect(sayAll(clause(np('BLADE', { adjectives: ['SHARP'], adjectiveDegrees: ['more'] }), 'RUN'))).toMatchObject({
      en: 'the sharper blade runs.',
      de: 'die schärfere Klinge läuft.',
      it: 'la lama più affilata corre.',
    });
  });

  test('LOUD agrees with a masculine plural and a feminine plural head', () => {
    expect(sayAll(clause(np('SOUND', { number: 'plural', definiteness: 'indefinite', adjectives: ['LOUD'] }), 'RUN'))).toEqual({
      en: 'loud sounds run.',
      it: 'suoni forti corrono.',
      fr: 'des sons forts courent.',
      es: 'unos sonidos fuertes corren.',
      pt: 'uns sons altos correm.',
      de: 'laute Geräusche laufen.',
      ja: '大きい音は走ります。',
    });
    expect(sayAll(clause(np('TEAR', { number: 'plural', adjectives: ['LOUD'] }), 'RUN'))).toMatchObject({
      it: 'le lacrime forti corrono.',
      fr: 'les larmes fortes courent.',
      es: 'las lágrimas fuertes corren.',
      pt: 'as lágrimas altas correm.',
      de: 'die lauten Tränen laufen.',
    });
  });

  test('predicatively, SHARP takes estar and LOUD keeps ser', () => {
    const isThat = (subject: NounPhrase, adjective: string) =>
      sayAll(clause(subject, 'BE', { complements: { predicative: { phrase: np(adjective) } } }));
    expect(isThat(np('BLADE'), 'SHARP')).toEqual({
      en: 'the blade is sharp.',
      it: 'la lama è affilata.',
      fr: 'la lame est tranchante.',
      es: 'la cuchilla está afilada.',
      pt: 'a lâmina está afiada.',
      de: 'die Klinge ist scharf.',
      ja: '刃は鋭いです。',
    });
    expect(isThat(np('SOUND', { number: 'plural' }), 'LOUD')).toEqual({
      en: 'the sounds are loud.',
      it: 'i suoni sono forti.',
      fr: 'les sons sont forts.',
      es: 'los sonidos son fuertes.',
      pt: 'os sons são altos.',
      de: 'die Geräusche sind laut.',
      ja: '音は大きいです。',
    });
  });
});

// NEAR and FAR, the distance adjectives. Romance builds them from the derived adjectives, not the
// bare distance adverbs (lejos/loin/longe cannot modify a noun), so both agree and sit after the
// head; Iberian Romance locates with estar, so both predicate with it. German umlauts NEAR under
// comparison with an irregular superlative (nah → näher / nächst) where FAR ("fern") is regular,
// and English compares "far" suppletively (farther/farthest).
describe('adjective agreement and comparison: NEAR and FAR', () => {
  test('both agree with a feminine plural head', () => {
    expect(cat({ gender: 'fem', number: 'plural', adjectives: ['NEAR'] })).toEqual({
      en: 'the near cats eat.',
      it: 'le gatte vicine mangiano.',
      fr: 'les chattes proches mangent.',
      es: 'las gatas cercanas comen.',
      pt: 'as gatas próximas comem.',
      de: 'die nahen Katzen fressen.', // nah + the weak plural -en
      ja: '近い猫は食べます。',
    });
    expect(cat({ gender: 'fem', number: 'plural', adjectives: ['FAR'] })).toEqual({
      en: 'the far cats eat.',
      it: 'le gatte lontane mangiano.',
      fr: 'les chattes lointaines mangent.', // lointain → lointaine, not the adverb "loin"
      es: 'las gatas lejanas comen.',
      pt: 'as gatas distantes comem.', // -e adjective: gender-invariant, plural only
      de: 'die fernen Katzen fressen.',
      ja: '遠い猫は食べます。',
    });
  });

  test('predicatively, both take estar in Spanish and Portuguese', () => {
    const isThat = (adjective: string) =>
      sayAll(clause(np('HOUSE'), 'BE', { complements: { predicative: { phrase: np(adjective) } } }));
    expect(isThat('NEAR')).toEqual({
      en: 'the house is near.',
      it: 'la casa è vicina.',
      fr: 'la maison est proche.',
      es: 'la casa está cercana.',
      pt: 'a casa está próxima.',
      de: 'das Haus ist nah.', // the predicative keeps the undeclined base
      ja: '家は近いです。',
    });
    expect(isThat('FAR')).toEqual({
      en: 'the house is far.',
      it: 'la casa è lontana.',
      fr: 'la maison est lointaine.',
      es: 'la casa está lejana.',
      pt: 'a casa está distante.',
      de: 'das Haus ist fern.',
      ja: '家は遠いです。',
    });
  });

  test('compare: NEAR umlauts to näher/nächst, FAR is suppletive in English', () => {
    const degreed = (adjective: string, degree: Degree) =>
      cat({ adjectives: [adjective], adjectiveDegrees: [degree] });
    expect(degreed('NEAR', 'more')).toMatchObject({ en: 'the nearer cat eats.', de: 'der nähere Kater frisst.' });
    // nächst, seeded whole: the umlaut rule alone would build *nähst.
    expect(degreed('NEAR', 'most')).toMatchObject({ en: 'the nearest cat eats.', de: 'der nächste Kater frisst.' });
    expect(degreed('FAR', 'more')).toMatchObject({ en: 'the farther cat eats.', de: 'der fernere Kater frisst.' });
    expect(degreed('FAR', 'most')).toMatchObject({ en: 'the farthest cat eats.', de: 'der fernste Kater frisst.' });
    // Romance and Japanese stay periphrastic for both.
    expect(degreed('FAR', 'more')).toMatchObject({
      it: 'il gatto più lontano mangia.',
      fr: 'le chat plus lointain mange.',
      es: 'el gato más lejano come.',
      pt: 'o gato mais distante come.',
      ja: 'もっと遠い猫は食べます。',
    });
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
    expect(ja('WILD')).toBe('野生の猫は食べます。');
    expect(ja('DOMESTIC')).toBe('家庭の猫は食べます。');
    expect(ja('CANINE')).toBe('犬の猫は食べます。');
    expect(ja('ADULT')).toBe('大人の猫は食べます。');
    expect(ja('SEMANTIC')).not.toContain('意味的の'); // …but a na-adjective must not take の
  });

  test('a verb-derived adjective takes its plain past', () => {
    expect(ja('TIRED')).toBe('疲れた猫は食べます。'); // 疲れる → 疲れた
    expect(ja('UNCONNECTED')).toBe('孤立した猫は食べます。');
    expect(ja('CASTRATED')).toBe('去勢された猫は食べます。'); // 去勢される → 去勢された
  });
});

describe('known bugs: adjective linker (Japanese)', () => {
  // BROWN is the one adjective in the corpus that attaches with NO linker: 茶色猫. 茶色 is a noun
  // ("brown[ness]"), so attributively it needs の — 茶色の猫 — exactly like the other noun-
  // adjectives (男性の, 定冠詞の). It is the only one of the 47 that comes out bare; every other
  // adjective takes い / な / の / た. (茶色い猫, the i-adjective form, would do as well — the
  // surface is a design call, but the bare compound is not it.)
  test('Japanese BROWN needs a linker: 茶色の猫, not 茶色猫', () => {
    expect(cat({ adjectives: ['BROWN'] }).ja).toBe('茶色の猫は食べます。');
  });

  // The linker holds wherever 茶色 attaches: never the bare compound 茶色猫, and の survives when
  // BROWN is one of several adjectives — the same の the other noun-adjectives (男性の) take.
  test('Japanese BROWN keeps its の linker alongside other adjectives', () => {
    expect(cat({ adjectives: ['BROWN'] }).ja).not.toContain('茶色猫');
    expect(cat({ adjectives: ['BIG', 'BROWN'] }).ja).toBe('大きい茶色の猫は食べます。');
    expect(cat({ adjectives: ['BROWN', 'HAPPY'] }).ja).toBe('茶色の幸せな猫は食べます。');
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
  test('both positive → French juxtaposes them, Italian keeps only the first', () => {
    expect(say('positive', 'positive')).toMatchObject({
      it: 'il grande gatto vecchio mangia.',
      fr: 'le grand vieux chat mange.',
      de: 'der große alte Kater frisst.',
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

  test('two prenominal and one postnominal: French juxtaposes the pair, Italian demotes the second', () => {
    // French: "le grand vieux chat heureux" — grand vieux juxtaposed (no et), heureux after the noun.
    // Italian keeps one qualifying adjective in front, so "vecchio" joins "felice" behind the noun
    // and A27's list coordinates the pair (A145).
    expect(cat({ adjectives: ['BIG', 'OLD', 'HAPPY'] })).toMatchObject({
      it: 'il grande gatto vecchio e felice mangia.',
      fr: 'le grand vieux chat heureux mange.',
    });
  });
});

describe('known bugs: Romance postnominal coordination', () => {
  // Three postnominal adjectives used to repeat the conjunction — "forte e felice e freddo" — where
  // the list should be comma-separated with the coordinator only before the last: "forte, felice e
  // freddo". This is the SAME defect already pinned for Spanish/Portuguese (with BIG/OLD/BEAUTIFUL),
  // but those adjectives are prenominal in Italian and French, so they juxtapose and hide it.
  // A postnominal triple shows Italian and French had the bug too — it was Romance-wide.
  test('Italian comma-separates three postnominal adjectives', () => {
    expect(cat({ adjectives: ['STRONG', 'HAPPY', 'COLD'] }))
      .toMatchObject({ it: 'il gatto forte, felice e freddo mangia.' });
  });

  test('French comma-separates three postnominal adjectives', () => {
    expect(cat({ adjectives: ['STRONG', 'HAPPY', 'COLD'] }))
      .toMatchObject({ fr: 'le chat fort, heureux et froid mange.' });
  });

  test('Spanish, likewise, for a postnominal triple', () => {
    expect(cat({ adjectives: ['STRONG', 'HAPPY', 'COLD'] }))
      .toMatchObject({ es: 'el gato fuerte, feliz y frío come.' });
  });

  // Portuguese completes the Romance set (its qualifying adjectives are postnominal too).
  test('Portuguese comma-separates a postnominal triple', () => {
    expect(cat({ adjectives: ['STRONG', 'HAPPY', 'COLD'] }))
      .toMatchObject({ pt: 'o gato forte, feliz e frio come.' });
  });

  // Regression: a PAIR takes only the conjunction, no comma ("forte e felice", "fort et heureux").
  test('a postnominal pair keeps just the conjunction, no comma', () => {
    expect(cat({ adjectives: ['STRONG', 'HAPPY'] })).toMatchObject({
      it: 'il gatto forte e felice mangia.',
      fr: 'le chat fort et heureux mange.',
      es: 'el gato fuerte y feliz come.',
      pt: 'o gato forte e feliz come.',
    });
  });

  // The euphonic conjunction survives the list join: Spanish "y" → "e" before an i- sound, so a
  // list ending in "interesante" reads "fuerte e interesante", not "fuerte y interesante".
  test('the list join keeps the Spanish euphonic "e" before an i- sound', () => {
    expect(cat({ adjectives: ['STRONG', 'INTERESTING'] }).es).toBe('el gato fuerte e interesante come.');
  });

  // Regression: PRENOMINAL adjectives (Italian/French BAGS set) still juxtapose with no comma and
  // no conjunction — the fix touches only the coordinated (postnominal / Iberian) list.
  test("French's prenominal adjectives still juxtapose, uncoordinated", () => {
    // Italian keeps one of the three in front and coordinates the other two behind the noun (A145);
    // French stacks all three, juxtaposed with no "et".
    expect(cat({ adjectives: ['BIG', 'OLD', 'BEAUTIFUL'] })).toMatchObject({
      it: 'il grande gatto vecchio e bello mangia.',
      fr: 'le grand vieux beau chat mange.',
    });
  });
});

// A55. HIGH is seeded with only its irregular attributive stem (`attributive: 'hoh'`), so comparison
// runs the regular rule on the base "hoch": no umlaut, and the -ch kept. The comparative is "höher"
// and the superlative "höchst-" — the same irregular pair A2-A4 names, never added to the corpus.
describe('known bugs: German comparison of hoch', () => {
  test('German compares hoch as höher / höchst', () => {
    expect(map({ adjectives: ['HIGH'], adjectiveDegrees: ['more'] }).de).toBe('die höhere Karte brennt.');
    expect(map({ adjectives: ['HIGH'], adjectiveDegrees: ['most'] }).de).toBe('die höchste Karte brennt.');
    expect(sayAll(clause(np('HOUSE'), 'BECOME', { complements: { predicative: { phrase: np('HIGH', { headDegree: 'more' }) } } })).de)
      .toBe('das Haus wird höher.');
    expect(sayAll(clause(np('HOUSE'), 'BECOME', { complements: { predicative: { phrase: np('HIGH', { headDegree: 'most' }) } } })).de)
      .toBe('das Haus wird am höchsten.');
  });

  test('German declines höher / höchst like any comparison stem', () => {
    expect(map({ adjectives: ['HIGH'], adjectiveDegrees: ['more'], definiteness: 'indefinite' }).de).toBe('eine höhere Karte brennt.');
    expect(map({ adjectives: ['HIGH'], adjectiveDegrees: ['most'], number: 'plural' }).de).toBe('die höchsten Karten brennen.');
    expect(map({ adjectives: ['HIGH'], adjectiveDegrees: ['more'], definiteness: 'bare', number: 'plural' }).de).toBe('höhere Karten brennen.');
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('DOG', { adjectives: ['HIGH'], adjectiveDegrees: ['more'], definiteness: 'indefinite' }) })).de)
      .toBe('der Kater sieht einen höheren Hund.');
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { locative: { phrase: np('HOUSE', { adjectives: ['HIGH'], adjectiveDegrees: ['more'] }) } } })).de)
      .toBe('der Kater läuft im höheren Haus.');
  });

  test('regression: the positive keeps its attributive stem "hoh-" and its predicative "hoch"', () => {
    expect(map({ adjectives: ['HIGH'] }).de).toBe('die hohe Karte brennt.');
    expect(sayAll(clause(np('HOUSE'), 'BECOME', { complements: { predicative: { phrase: np('HIGH') } } })).de).toBe('das Haus wird hoch.');
  });
});

// A57. A modifier that carries an adjective breaks out of the compound into a postposed genitive
// (A20). That genitive adds the masculine/neuter -(e)s to the noun without checking for a weak
// noun, which takes -(e)n in every oblique case instead: "des Jungen", never "*des Junges".
describe('known bugs: German weak noun as a genitive modifier', () => {
  test('German gives a weak noun modifier its genitive -n', () => {
    expect(sayAll(clause(np('CREATOR', {
      nounModifiers: [{ concept: 'BOY', relation: 'feature', adjectives: ['SMALL'] }],
    }), 'BURN')).de).toBe('der Schöpfer kleinen Jungen brennt.');
  });

  test('German gives every weak noun its -n, in any case of the head, and leaves the plural alone', () => {
    const creatorOf = (concept: string, extra: { number?: 'plural' } = {}) =>
      sayAll(clause(np('CREATOR', { nounModifiers: [{ concept, relation: 'feature', adjectives: ['SMALL'], ...extra }] }), 'BURN')).de;
    expect(creatorOf('OX')).toBe('der Schöpfer kleinen Ochsen brennt.');
    expect(creatorOf('BOY', { number: 'plural' })).toBe('der Schöpfer kleiner Jungen brennt.');
    expect(sayAll(clause(np('CAT'), 'RUN', {
      complements: { direction: { phrase: np('CREATOR', { nounModifiers: [{ concept: 'BOY', relation: 'feature', adjectives: ['SMALL'] }] }) } },
    })).de).toBe('der Kater läuft zum Schöpfer kleinen Jungen.');
  });

  test('regression: a strong masculine or neuter noun keeps its genitive -(e)s', () => {
    const creatorOf = (concept: string) =>
      sayAll(clause(np('CREATOR', { nounModifiers: [{ concept, relation: 'feature', adjectives: ['SMALL'] }] }), 'BURN')).de;
    expect(creatorOf('DOG')).toBe('der Schöpfer kleinen Hundes brennt.');
    expect(creatorOf('HOUSE')).toBe('der Schöpfer kleinen Hauses brennt.');
  });
});

// A64. The superlative inserts an -e- after a stem-final dental or sibilant ("kältest", "heißest",
// "hübschest"). An unstressed derivational -isch does not take it: "semantischste", "am
// semantischsten", like "typischste" and "praktischste". The rule matches on -sch alone.
describe('known bugs: German superlative after -isch', () => {
  test('German builds the -isch superlative with a bare -st', () => {
    expect(sayAll(clause(np('WORD', { adjectives: ['SEMANTIC'], adjectiveDegrees: ['most'] }), 'BURN')).de)
      .toBe('das semantischste Wort brennt.');
    expect(sayAll(clause(np('WORD'), 'BECOME', { complements: { predicative: { phrase: np('SEMANTIC', { headDegree: 'most' }) } } })).de)
      .toBe('das Wort wird am semantischsten.');
  });

  test('German takes the bare -st on every seeded -isch adjective, in any case and number', () => {
    const mostWord = (adjective: string, extra: Partial<NounPhrase> = {}) =>
      sayAll(clause(np('WORD', { adjectives: [adjective], adjectiveDegrees: ['most'], ...extra }), 'BURN')).de;
    expect(mostWord('SINGULAR')).toBe('das singularischste Wort brennt.');
    expect(mostWord('PLURAL')).toBe('das pluralischste Wort brennt.');
    expect(mostWord('SEMANTIC', { number: 'plural' })).toBe('die semantischsten Wörter brennen.');
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { locative: { phrase: np('HOUSE', { adjectives: ['SEMANTIC'], adjectiveDegrees: ['most'] }) } } })).de)
      .toBe('der Kater läuft im semantischsten Haus.');
  });

  test('regression: a monosyllabic dental root keeps its -e-, and the comparative is unchanged', () => {
    expect(sayAll(clause(np('WORD', { adjectives: ['COLD'], adjectiveDegrees: ['most'] }), 'BURN')).de).toBe('das kälteste Wort brennt.');
    expect(sayAll(clause(np('WORD', { adjectives: ['SEMANTIC'], adjectiveDegrees: ['more'] }), 'BURN')).de).toBe('das semantischere Wort brennt.');
  });
});

// B10, fixed. A German compound joins its parts with the linking element (Fugenelement) its first
// element takes: -n- after a feminine -e ("Phrasenschöpfer") or a weak noun ("Jungenbuch"), -s-
// after -keit/-heit/-ung/-tät/-ion/-schaft ("Geschwindigkeitswort"), and a seeded `compound` stem
// where the choice is lexical ("Hundebuch", "Kinderbuch", "Sprachtaste"). See de/compoundStem.ts.
describe('German compound linking elements', () => {
  const compound = (head: string, modifier: string) =>
    sayAll(clause(np(head, { nounModifiers: [{ concept: modifier, relation: 'feature' }] }), 'BURN')).de;

  test('German compounds take their linking element', () => {
    expect(compound('CREATOR', 'PHRASE')).toBe('der Phrasenschöpfer brennt.');
    expect(compound('BOOK', 'BOY')).toBe('das Jungenbuch brennt.');
    expect(compound('WORD', 'SPEED')).toBe('das Geschwindigkeitswort brennt.');
  });

  // The suffix rule: every feminine suffix that takes the -s-, including the C10 string's "the
  // translation server", which had to drop its modifier rather than ship *Übersetzungserver.
  test('-s- after the feminine suffixes -ung, -keit, -tät and -ion', () => {
    expect(compound('SERVER', 'TRANSLATION')).toBe('der Übersetzungsserver brennt.');
    expect(compound('WORD', 'CONDITION')).toBe('das Bedingungswort brennt.');
    expect(compound('BOOK', 'QUALITY')).toBe('das Qualitätsbuch brennt.');
    expect(compound('BOOK', 'POLARITY')).toBe('das Polaritätsbuch brennt.');
    expect(compound('BUTTON', 'OPTION')).toBe('die Optionstaste brennt.');
  });

  test('-n- after a feminine -e and after a weak masculine', () => {
    expect(compound('BOOK', 'BUTTON')).toBe('das Tastenbuch brennt.');
    expect(compound('BOOK', 'SIZE')).toBe('das Größenbuch brennt.');
    expect(compound('BOOK', 'OX')).toBe('das Ochsenbuch brennt.');
    expect(compound('BOOK', 'YOUNG_MAN')).toBe('das Burschenbuch brennt.');
  });

  // Where the rule would be wrong the lexicon seeds the stem: an -e- or -s- the rule has no reason
  // for, a plural, a feminine that drops its -e or keeps it bare, a weak noun that takes -ns-.
  test('a seeded compound stem wins over the rule', () => {
    expect(compound('BOOK', 'DOG')).toBe('das Hundebuch brennt.');
    expect(compound('BOOK', 'LIFE')).toBe('das Lebensbuch brennt.');
    expect(compound('BOOK', 'CHILD')).toBe('das Kinderbuch brennt.');
    expect(compound('BUTTON', 'LANGUAGE')).toBe('die Sprachtaste brennt.');
    expect(compound('BUTTON', 'CLIPBOARD')).toBe('die Zwischenablagetaste brennt.');
    expect(compound('BUTTON', 'NAME_NOUN')).toBe('die Namenstaste brennt.');
    expect(compound('ICON', 'LOADING')).toBe('das Ladesymbol brennt.');
  });

  test('a modifier that takes no linking element is joined bare, as before', () => {
    expect(compound('CREATOR', 'WORD')).toBe('der Wortschöpfer brennt.');
    expect(compound('BOOK', 'HOUSE')).toBe('das Hausbuch brennt.');
  });

  test('each of several modifiers takes its own linking element', () => {
    const stacked = (head: string, ...modifiers: string[]) =>
      sayAll(clause(np(head, { nounModifiers: modifiers.map((concept) => ({ concept, relation: 'feature' as const })) }), 'BURN')).de;
    expect(stacked('BUTTON', 'LANGUAGE', 'OPTION')).toBe('die Sprachoptionstaste brennt.');
    expect(stacked('MAP', 'TRANSLATION', 'WORD')).toBe('die Übersetzungswortkarte brennt.');
  });

  // The linking element belongs to the modifier; the head still declines as itself.
  test('the head keeps its own case and number', () => {
    const creator = (extra: Partial<NounPhrase> = {}) =>
      np('CREATOR', { nounModifiers: [{ concept: 'PHRASE', relation: 'feature' }], ...extra });
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: creator() })).de).toBe('der Kater sieht den Phrasenschöpfer.');
    expect(sayAll(clause(creator({ number: 'plural' }), 'BURN')).de).toBe('die Phrasenschöpfer brennen.');
    expect(sayAll(clause(np('CAT'), 'RUN', {
      complements: { locative: { phrase: np('SERVER', { nounModifiers: [{ concept: 'TRANSLATION', relation: 'feature' }] }) } },
    })).de).toBe('der Kater läuft im Übersetzungsserver.');
  });

  test('the other languages are untouched', () => {
    expect(sayAll(clause(np('CREATOR', { nounModifiers: [{ concept: 'PHRASE', relation: 'feature' }] }), 'BURN'))).toEqual({
      en: 'the phrase creator burns.',
      it: 'il creatore a frase brucia.',
      fr: 'le créateur à phrase brûle.',
      es: 'el creador de frase arde.',
      pt: 'o criador a frase arde.',
      de: 'der Phrasenschöpfer brennt.',
      ja: 'フレーズの創造者は燃えます。',
    });
  });
});

// A68. "zéro" used as an adjective ("l'article zéro") is invariable. `agreeAdjFr` has no invariable
// class, so it falls through to the default +e / +s and writes "zéroe" / "zéros".
describe('known bugs: French invariable zéro', () => {
  test('French keeps "zéro" invariable', () => {
    expect(sayAll(clause(np('PHRASE', { adjectives: ['ZERO'] }), 'BURN')).fr).toBe('la phrase zéro brûle.');
    expect(sayAll(clause(np('ARTICLE', { adjectives: ['ZERO'], number: 'plural' }), 'BURN')).fr)
      .toBe('les articles zéro brûlent.');
    expect(sayAll(clause(np('PHRASE', { adjectives: ['ZERO'], number: 'plural' }), 'BURN')).fr)
      .toBe('les phrases zéro brûlent.');
  });
});

// A68. `agreeAdj` inflects every adjective ending in -o like "pequeno" (-a / -os / -as), so ZERO
// ("zero") comes out as "zera" / "zeros". Used as an adjective, "zero" is invariable in gender and
// number ("tolerância zero", "os quilômetros zero").
describe('known bugs: Portuguese invariable "zero"', () => {
  test('Portuguese keeps ZERO invariable', () => {
    expect(sayAll(clause(np('HOUSE', { adjectives: ['ZERO'] }), 'BURN')).pt).toBe('a casa zero arde.');
    expect(sayAll(clause(np('CAT', { number: 'plural', adjectives: ['ZERO'] }), 'EAT')).pt).toBe('os gatos zero comem.');
    expect(sayAll(clause(np('HOUSE'), 'BE', { complements: { predicative: { phrase: np('ZERO') } } })).pt).toBe('a casa é zero.');
  });

  // The same defect reached Italian "zero" ("zera") and Spanish "cero" ("cera").
  test('Italian and Spanish keep ZERO invariable too, attributive and predicative', () => {
    expect(sayAll(clause(np('PHRASE', { adjectives: ['ZERO'], number: 'plural' }), 'BURN'))).toMatchObject({
      it: 'le frasi zero bruciano.',
      es: 'las frases cero arden.',
      pt: 'as frases zero ardem.',
    });
    expect(sayAll(clause(np('ARTICLE', { adjectives: ['ZERO'], number: 'plural' }), 'BURN'))).toMatchObject({
      it: 'gli articoli zero bruciano.',
      es: 'los artículos cero arden.',
    });
    expect(sayAll(clause(np('HOUSE', { number: 'plural' }), 'BE', { complements: { predicative: { phrase: np('ZERO') } } }))).toMatchObject({
      it: 'le case sono zero.',
      es: 'las casas son cero.',
      fr: 'les maisons sont zéro.',
      pt: 'as casas são zero.',
    });
  });

  test('regression: a regular adjective still agrees', () => {
    expect(sayAll(clause(np('PHRASE', { adjectives: ['SMALL'], number: 'plural' }), 'BURN'))).toMatchObject({
      it: 'le piccole frasi bruciano.',
      es: 'las frases pequeñas arden.',
      fr: 'les petites phrases brûlent.',
      pt: 'as frases pequenas ardem.',
    });
  });
});

// A75. English picks -er/-est for a two-syllable adjective from its spelling: any -er or -le ending
// inflects. NEUTER then also doubles its final r (the doubling rule assumes a stressed final
// syllable, true only of a monosyllable) and gives "neuterrer"; FEMALE, whose -le is not the
// syllabic -le of "simple", gives "femaler". Both compare with more/most.
describe('known bugs: English comparison of two-syllable adjectives', () => {
  test('English compares NEUTER and FEMALE with more/most', () => {
    expect(say(clause(np('CAT', { adjectives: ['NEUTER'], adjectiveDegrees: ['more'] }), 'RUN'), 'en')).toBe('the more neuter cat runs.');
    expect(say(clause(np('CAT', { adjectives: ['NEUTER'], adjectiveDegrees: ['most'] }), 'RUN'), 'en')).toBe('the most neuter cat runs.');
    expect(say(clause(np('CAT', { adjectives: ['FEMALE'], adjectiveDegrees: ['more'] }), 'RUN'), 'en')).toBe('the more female cat runs.');
    expect(say(clause(np('CAT'), 'SEEM', { complements: { predicative: { phrase: np('FEMALE', { headDegree: 'more' }) } } }), 'en')).toBe('the cat seems more female.');
  });

  test('English compares them with most in the superlative and the predicate too', () => {
    expect(say(clause(np('CAT', { adjectives: ['FEMALE'], adjectiveDegrees: ['most'] }), 'RUN'), 'en')).toBe('the most female cat runs.');
    expect(say(clause(np('CAT'), 'SEEM', { complements: { predicative: { phrase: np('NEUTER', { headDegree: 'most' }) } } }), 'en')).toBe('the cat seems most neuter.');
  });

  test('regression: the other two-syllable adjectives keep -er / -est', () => {
    const more = (adjective: string) => say(clause(np('CAT', { adjectives: [adjective], adjectiveDegrees: ['more'] }), 'RUN'), 'en');
    expect(more('LAZY')).toBe('the lazier cat runs.');
    expect(more('HAPPY')).toBe('the happier cat runs.');
    expect(more('LOW')).toBe('the lower cat runs.');
  });
});

// A81. `agreeAdj` hardens every masculine plural in -co to -chi, the rule for an adjective stressed
// on its second-to-last syllable (stanco → stanchi). One stressed a syllable earlier (domestico,
// selvatico, semantico) takes -ci. The feminine plural (-che) is right for both.
describe('known bugs: Italian masculine plural of -ico adjectives', () => {
  test('Italian pluralises domestico/selvatico/semantico to -ici', () => {
    expect(say(clause(np('ANIMAL', { number: 'plural', adjectives: ['DOMESTIC'] }), 'EAT'), 'it')).toBe('gli animali domestici mangiano.');
    expect(say(clause(np('CAT', { number: 'plural', adjectives: ['WILD'] }), 'EAT'), 'it')).toBe('i gatti selvatici mangiano.');
    expect(say(clause(np('BOOK', { number: 'plural', adjectives: ['SEMANTIC'] }), 'BURN'), 'it')).toBe('i libri semantici bruciano.');
    expect(say(clause(np('CAT', { number: 'plural' }), 'SEEM', { complements: { predicative: { phrase: np('WILD') } } }), 'it')).toBe('i gatti sembrano selvatici.');
  });

  test('regression: the feminine plural and a two-syllable -co keep the hard sound', () => {
    expect(say(clause(np('CAT', { number: 'plural', gender: 'fem', adjectives: ['WILD'] }), 'EAT'), 'it')).toBe('le gatte selvatiche mangiano.');
    expect(say(clause(np('WORD', { number: 'plural', adjectives: ['SEMANTIC'] }), 'BURN'), 'it')).toBe('le parole semantiche bruciano.');
    expect(say(clause(np('CAT', { number: 'plural', adjectives: ['TIRED'] }), 'EAT'), 'it')).toBe('i gatti stanchi mangiano.');
  });
});

// A94. `frMods` hand-builds the attributive noun ("de maisons") instead of using the noun-phrase
// rules: it elides "de" on a first-letter vowel test, so the mute h of "hommes" (A24's `elides`
// flag) is missed, and it puts every adjective after the modifier noun, so the prenominal
// petit / beau stay behind it.
describe('known bugs: French attributive noun modifier', () => {
  test('French elides "de" before a mute h and places a prenominal adjective before the modifier noun', () => {
    expect(sayAll(clause(np('PRISON', {
      nounModifiers: [{ concept: 'MAN', relation: 'purpose', number: 'plural' }],
    }), 'BURN')).fr).toBe("la prison d'hommes brûle.");
    expect(sayAll(clause(np('CREATOR', {
      nounModifiers: [{ concept: 'HOUSE', relation: 'purpose', number: 'plural', adjectives: ['SMALL'] }],
    }), 'EAT')).fr).toBe('le créateur de petites maisons mange.');
    expect(sayAll(clause(np('CREATOR', {
      nounModifiers: [{ concept: 'HOUSE', relation: 'purpose', number: 'plural', adjectives: ['BEAUTIFUL'] }],
    }), 'EAT')).fr).toBe('le créateur de belles maisons mange.');
  });

  test('French splits the modifier\'s adjectives around it, takes the liaison form and elides before a vowel', () => {
    const creatorOf = (modifier: NonNullable<Parameters<typeof np>[1]>['nounModifiers']) => sayAll(clause(np('CREATOR', { nounModifiers: modifier }), 'EAT')).fr;
    expect(creatorOf([{ concept: 'HOUSE', relation: 'purpose', number: 'plural', adjectives: ['SMALL', 'COLD'] }])).toBe('le créateur de petites maisons froides mange.');
    expect(creatorOf([{ concept: 'HOUSE', relation: 'purpose', number: 'plural', adjectives: ['BIG'] }])).toBe('le créateur de grandes maisons mange.');
    expect(creatorOf([{ concept: 'MAN', relation: 'purpose', adjectives: ['OLD'] }])).toBe('le créateur de vieil homme mange.');
  });

  test('regression: a true vowel still elides and a feature à never does', () => {
    expect(sayAll(clause(np('PRISON', { nounModifiers: [{ concept: 'CHILD', relation: 'purpose', number: 'plural' }] }), 'BURN')).fr)
      .toBe("la prison d'enfants brûle.");
    expect(sayAll(clause(np('HOUSE', { nounModifiers: [{ concept: 'MAN', relation: 'feature' }] }), 'BURN')).fr).toBe('la maison à homme brûle.');
  });
});

// A95. A masculine singular "beau" / "nouveau" / "vieux" takes its liaison form "bel" / "nouvel" /
// "vieil" before a vowel or a mute h. `agreeAdjFr` only knows the masc.sg / fem.sg / masc.pl /
// fem.pl cells of FR_ADJ_IRREGULAR and never sees the word that follows, so the prenominal
// adjective keeps "beau" / "nouveau" / "vieux" in front of "ange", "argent", "enfant", "homme".
describe('known bugs: French bel/nouvel/vieil before a vowel', () => {
  test('French uses the liaison form of beau/nouveau/vieux before a vowel or mute h', () => {
    expect(sayAll(clause(np('MAN', { adjectives: ['OLD'] }), 'EAT')).fr).toBe('le vieil homme mange.');
    expect(sayAll(clause(np('ANGEL', { adjectives: ['BEAUTIFUL'], definiteness: 'indefinite' }), 'EAT')).fr)
      .toBe('un bel ange mange.');
    expect(sayAll(clause(np('MONEY', { adjectives: ['NEW'], definiteness: 'this' }), 'BURN')).fr)
      .toBe('ce nouvel argent brûle.');
    expect(sayAll(clause(np('CHILD', { adjectives: ['NEW'] }), 'EAT')).fr).toBe('le nouvel enfant mange.');
  });

  test('French takes the liaison form after a possessive, as an object and a complement, and before another adjective', () => {
    expect(sayAll(clause(np('CHILD', { adjectives: ['NEW'], possessor: { kind: 'pronominal', person: '1', number: 'singular' } }), 'EAT')).fr)
      .toBe('mon nouvel enfant mange.');
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('MAN', { adjectives: ['OLD'] }) })).fr).toBe('le chat voit le vieil homme.');
    expect(sayAll(clause(np('CAT'), 'EAT', { complements: { locative: { phrase: np('MAN', { adjectives: ['OLD'] }) } } })).fr)
      .toBe('le chat mange dans le vieil homme.');
    expect(sayAll(clause(np('MAN', { adjectives: ['BEAUTIFUL', 'OLD'] }), 'EAT')).fr).toBe('le beau vieil homme mange.');
  });

  test('regression: the plural, the feminine, a consonant and the superlative keep the plain form', () => {
    expect(sayAll(clause(np('MAN', { adjectives: ['OLD'], number: 'plural' }), 'EAT')).fr).toBe('les vieux hommes mangent.');
    expect(sayAll(clause(np('WING', { adjectives: ['BEAUTIFUL'] }), 'BURN')).fr).toBe('la belle aile brûle.');
    expect(sayAll(clause(np('CAT', { adjectives: ['OLD'] }), 'EAT')).fr).toBe('le vieux chat mange.');
    expect(sayAll(clause(np('MAN', { adjectives: ['OLD'], adjectiveDegrees: ['most'] }), 'EAT')).fr).toBe("l'homme le plus vieux mange.");
  });
});

// A145. `splitAdjectives` (it) sends EVERY adjective in PRENOMINAL to the front of the noun, so a
// phrase with two of them stacks both ("il bel grande angelo") and three stacks three ("il grande
// vecchio bell'angelo"). Italian takes at most one qualifying adjective before its noun; the rest
// follow it, coordinated the way A27 already joins a postnominal list. The allomorphy is not at
// fault — `prenominalChain` picks bel / bei / begli / bell' correctly against whatever follows, and
// a single prenominal adjective ("il bell'angelo", "pochi begli angeli") is right today. Only the
// split is wrong: `pre` should keep the first and demote the rest to `post`.
//
// it.consts' PRENOMINAL comment calls the stacking a deliberate trade-off of putting both size
// adjectives in the set; that comment goes when this is fixed.
//
// French is deliberately NOT part of this: it stacks two prenominal adjectives idiomatically ("un
// beau grand jardin", "de beaux grands anges"), so only its three-adjective case reads wrong, and
// the right target there is a separate call. The regression below pins French unchanged.
describe('known bugs: Italian stacked prenominal adjectives', () => {
  const cries = (concept: string, adjectives: string[], extra = {}) =>
    sayAll(clause(np(concept, { adjectives, ...extra }), 'CRY_OUT'));

  test('Italian keeps one adjective before the noun and puts the rest after it', () => {
    expect(cries('ANGEL', ['BEAUTIFUL', 'BIG']).it).toBe("il bell'angelo grande grida.");
    expect(cries('CAT', ['BEAUTIFUL', 'BIG']).it).toBe('il bel gatto grande grida.');
    expect(cries('ANGEL', ['OLD', 'BEAUTIFUL']).it).toBe('il vecchio angelo bello grida.');
  });

  test('the demoted adjectives coordinate as a list (A27)', () => {
    expect(cries('ANGEL', ['BIG', 'OLD', 'BEAUTIFUL']).it).toBe('il grande angelo vecchio e bello grida.');
    expect(cries('CAT', ['BIG', 'OLD', 'BEAUTIFUL']).it).toBe('il grande gatto vecchio e bello grida.');
  });

  test('the surviving prenominal adjective agrees with the noun it now precedes', () => {
    // "begli" (not "bei") once "grandi" no longer stands between "bello" and the vowel of "angeli".
    expect(cries('ANGEL', ['BEAUTIFUL', 'BIG'], { number: 'plural', definiteness: 'few' }).it)
      .toBe('pochi begli angeli grandi gridano.');
    expect(cries('ANGEL', ['BIG', 'OLD', 'BEAUTIFUL'], { number: 'plural', definiteness: 'few' }).it)
      .toBe('pochi grandi angeli vecchi e belli gridano.');
  });

  // The generalisation: the cap is on the *qualifying* (BAGS) adjectives, so a determiner-like
  // prenominal — an ordinal, OTHER — still leads one of them, a fourth adjective joins the list,
  // and a graded adjective was already postnominal and never held the slot.
  test('a determiner-like prenominal still leads a qualifying one', () => {
    expect(cries('ANGEL', ['FIRST', 'BIG', 'OLD']).it).toBe('il primo grande angelo vecchio grida.');
    expect(cries('CAT', ['OTHER', 'BEAUTIFUL', 'BIG'], { definiteness: 'indefinite' }).it)
      .toBe('un altro bel gatto grande grida.');
  });

  test('a fourth adjective joins the postnominal list, and a graded one was never in front', () => {
    expect(cries('ANGEL', ['BIG', 'OLD', 'BEAUTIFUL', 'GOOD']).it)
      .toBe('il grande angelo vecchio, bello e buono grida.');
    expect(cries('ANGEL', ['HIGH', 'BIG', 'OLD']).it).toBe('il grande angelo alto e vecchio grida.');
    expect(cries('ANGEL', ['BIG', 'BEAUTIFUL'], { adjectiveDegrees: ['more', 'positive'] }).it)
      .toBe("il bell'angelo più grande grida.");
  });

  test('regression: one prenominal adjective, a postnominal one, and French are already right', () => {
    expect(cries('ANGEL', ['BEAUTIFUL']).it).toBe("il bell'angelo grida.");
    expect(cries('ANGEL', ['BIG']).it).toBe('il grande angelo grida.');
    expect(cries('ANGEL', ['HIGH']).it).toBe("l'angelo alto grida.");
    expect(cries('ANGEL', ['BEAUTIFUL', 'HIGH'], { number: 'plural', definiteness: 'few' }).it)
      .toBe('pochi begli angeli alti gridano.');
    // French stacks two prenominal adjectives idiomatically and must not follow Italian here.
    expect(cries('ANGEL', ['BEAUTIFUL', 'BIG']).fr).toBe('le beau grand ange crie.');
    expect(cries('ANGEL', ['BEAUTIFUL', 'BIG'], { number: 'plural', definiteness: 'few' }).fr)
      .toBe('peu de beaux grands anges crient.');
  });
});

// A99. `pluralize` adds -es to a consonant-final adjective and never changes its written accent. A
// word stressed on the syllable before the new -es needs an accent it doesn't have ("jovenes",
// want "jóvenes"). An oxytone in -ón has to drop the one it has ("marrónes", want "marrones").
describe('known bugs: Spanish plural adjective accent', () => {
  test('Spanish adjusts the written accent when an adjective takes -es', () => {
    expect(sayAll(clause(np('CAT', { number: 'plural', adjectives: ['YOUNG'] }), 'EAT')).es).toBe('los gatos jóvenes comen.');
    expect(sayAll(clause(np('DOG', { number: 'plural', adjectives: ['BROWN'] }), 'EAT')).es).toBe('los perros marrones comen.');
    expect(sayAll(clause(np('CAT', { number: 'plural' }), 'BE', {
      complements: { predicative: { phrase: np('BROWN') } },
    })).es).toBe('los gatos son marrones.');
  });

  test('Spanish keeps the accent right in the feminine, under SEEM and in the comparative', () => {
    expect(sayAll(clause(np('COW', { number: 'plural', adjectives: ['BROWN'] }), 'EAT')).es).toBe('las vacas marrones comen.');
    expect(sayAll(clause(np('WOMAN', { number: 'plural', adjectives: ['YOUNG'] }), 'EAT')).es).toBe('las mujeres jóvenes comen.');
    expect(sayAll(clause(np('CAT', { number: 'plural' }), 'SEEM', { complements: { predicative: { phrase: np('YOUNG') } } })).es).toBe('los gatos parecen jóvenes.');
    expect(sayAll(clause(np('CAT', { number: 'plural', adjectives: ['YOUNG'], adjectiveDegrees: ['more'] }), 'EAT')).es).toBe('los gatos más jóvenes comen.');
  });

  test('regression: the singular and -l / -z adjectives are unchanged', () => {
    expect(sayAll(clause(np('CAT', { adjectives: ['YOUNG'] }), 'EAT')).es).toBe('el gato joven come.');
    expect(sayAll(clause(np('CAT', { number: 'plural', adjectives: ['WEAK'] }), 'EAT')).es).toBe('los gatos débiles comen.');
    expect(sayAll(clause(np('CAT', { number: 'plural', adjectives: ['HAPPY'] }), 'EAT')).es).toBe('los gatos felices comen.');
  });
});

// A106. The Portuguese suppletive comparative (A6) is keyed by concept id, and only BIG is listed
// for "grande". GREAT has the same base, so its raised degrees fall through to the periphrastic
// "mais grande", which standard Portuguese rejects: the comparative and superlative of "grande"
// are "maior" / "o maior", whichever concept carries the word.
describe('known bugs: Portuguese GREAT comparison', () => {
  test('Portuguese raises GREAT to the suppletive "maior"', () => {
    expect(sayAll(clause(np('CAT', { adjectives: ['GREAT'], adjectiveDegrees: ['more'] }), 'EAT')).pt)
      .toBe('o gato maior come.');
    expect(sayAll(clause(np('HOUSE', { number: 'plural', adjectives: ['GREAT'], adjectiveDegrees: ['more'] }), 'BURN')).pt)
      .toBe('as casas maiores ardem.');
    expect(sayAll(clause(np('HOUSE'), 'SEEM', { complements: { predicative: { phrase: np('GREAT', { headDegree: 'more' }) } } })).pt)
      .toBe('a casa parece maior.');
    expect(sayAll(clause(np('CAT'), 'BE', { complements: { predicative: { phrase: np('GREAT', { headDegree: 'most' }) } } })).pt)
      .toBe('o gato é o maior.');
  });

  test('Portuguese keeps the lowered degree of GREAT periphrastic, and the suppletives of BIG, GOOD and SMALL', () => {
    expect(sayAll(clause(np('CAT', { adjectives: ['GREAT'], adjectiveDegrees: ['less'] }), 'EAT')).pt).toBe('o gato menos grande come.');
    expect(sayAll(clause(np('CAT', { adjectives: ['GOOD'], adjectiveDegrees: ['more'] }), 'EAT')).pt).toBe('o gato melhor come.');
    expect(sayAll(clause(np('CAT', { adjectives: ['SMALL'], adjectiveDegrees: ['more'] }), 'EAT')).pt).toBe('o gato menor come.');
    expect(sayAll(clause(np('CAT', { adjectives: ['GREAT'], adjectiveDegrees: ['more'] }), 'EAT')).es).toBe('el gato más grande come.');
  });
});

// A112. `jaComparisonAdj` negates a less/least adjective by class: …い → …くない, …な → …ではない,
// anything else + ではない. A の-adjective (茶色の, 大人の) keeps its linker (茶色のではない) and a
// た-adjective (疲れた) gets a bare ではない (疲れたではない). Want 茶色ではない / 疲れていない.
describe('known bugs: Japanese lowered degree on a の/た adjective', () => {
  test('Japanese negates a の/た adjective without keeping its attributive ending', () => {
    const lowered = (adjective: string, degree: 'less' | 'least') =>
      sayAll(clause(np('CAT', { adjectives: [adjective], adjectiveDegrees: [degree] }), 'EAT')).ja;
    expect(lowered('BROWN', 'less')).toBe('それほど茶色ではない猫は食べます。');
    expect(lowered('ADULT', 'least')).toBe('最も大人ではない猫は食べます。');
    expect(lowered('TIRED', 'less')).toBe('それほど疲れていない猫は食べます。');
    expect(sayAll(clause(np('CAT'), 'BE', {
      complements: { predicative: { phrase: np('BROWN', { headDegree: 'less' }) } },
    })).ja).toBe('猫はそれほど茶色ではないです。');
  });

  test('Japanese negates the other た-adjectives and carries the negative into SEEM and BE', () => {
    expect(sayAll(clause(np('CAT', { adjectives: ['UNCONNECTED'], adjectiveDegrees: ['least'] }), 'EAT')).ja).toBe('最も孤立していない猫は食べます。');
    expect(sayAll(clause(np('CAT'), 'SEEM', { complements: { predicative: { phrase: np('BROWN', { headDegree: 'less' }) } } })).ja)
      .toBe('猫はそれほど茶色ではなく思えます。');
    expect(sayAll(clause(np('CAT'), 'BE', { complements: { predicative: { phrase: np('TIRED', { headDegree: 'less' }) } } })).ja)
      .toBe('猫はそれほど疲れていないです。');
  });

  test('regression: the i- and na-adjectives and the positive の-adjective are unchanged', () => {
    expect(sayAll(clause(np('CAT', { adjectives: ['BIG'], adjectiveDegrees: ['less'] }), 'EAT')).ja).toBe('それほど大きくない猫は食べます。');
    expect(sayAll(clause(np('CAT', { adjectives: ['HAPPY'], adjectiveDegrees: ['least'] }), 'EAT')).ja).toBe('最も幸せではない猫は食べます。');
    expect(sayAll(clause(np('CAT', { adjectives: ['BROWN'] }), 'EAT')).ja).toBe('茶色の猫は食べます。');
  });
});

// OTHER precedes its noun wherever an ordinal does, and says "another" in English. Spanish and
// Portuguese do not put the indefinite article before it ("otro gato", never "*un otro gato"), and
// written French turns the plural "des" into "d'" before it, as before any adjective that precedes
// its noun ("d'autres chats").
describe('OTHER', () => {
  test('precedes the noun, and takes the place of the indefinite article in Spanish and Portuguese', () => {
    expect(cat({ definiteness: 'indefinite', adjectives: ['OTHER'] })).toEqual({
      en: 'another cat eats.',
      it: 'un altro gatto mangia.',
      fr: 'un autre chat mange.',
      de: 'ein anderer Kater frisst.',
      es: 'otro gato come.',
      ja: '別の猫は食べます。',
      pt: 'outro gato come.',
    });
    expect(cat({ definiteness: 'indefinite', gender: 'fem', number: 'plural', adjectives: ['OTHER'] })).toEqual({
      en: 'other cats eat.',
      it: 'altre gatte mangiano.',
      fr: "d'autres chattes mangent.",
      de: 'andere Katzen fressen.',
      es: 'otras gatas comen.',
      ja: '別の猫は食べます。',
      pt: 'outras gatas comem.',
    });
  });

  test('keeps the definite article, which elides before it', () => {
    expect(cat({ gender: 'fem', adjectives: ['OTHER'] })).toEqual({
      en: 'the other cat eats.',
      it: "l'altra gatta mangia.",
      fr: "l'autre chatte mange.",
      de: 'die andere Katze frisst.',
      es: 'la otra gata come.',
      ja: '別の猫は食べます。',
      pt: 'a outra gata come.',
    });
  });

  test('leaves a preposition without its article, and stays first before another adjective', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', {
      complements: { locative: { phrase: np('HOUSE', { definiteness: 'indefinite', adjectives: ['OTHER'] }) } },
    }))).toEqual({
      en: 'the cat eats in another house.',
      it: "il gatto mangia in un'altra casa.",
      fr: 'le chat mange dans une autre maison.',
      de: 'der Kater frisst in einem anderen Haus.',
      es: 'el gato come en otra casa.',
      ja: '猫は別の家で食べます。',
      pt: 'o gato come em outra casa.',
    });
    expect(sayAll(clause(np('CAT'), 'EAT', {
      directObject: np('MOUSE', { definiteness: 'indefinite', adjectives: ['OTHER', 'BIG'] }),
    }))).toEqual({
      en: 'the cat eats another big mouse.',
      it: 'il gatto mangia un altro grande topo.',
      fr: 'le chat mange une autre grande souris.',
      de: 'der Kater frisst eine andere große Maus.',
      es: 'el gato come otro ratón grande.',
      ja: '猫は別の大きいネズミを食べます。',
      pt: 'o gato come outro rato grande.',
    });
  });
});

describe('French: an adjective before a plural noun turns des into de', () => {
  test('the indefinite plural, and the de a complement takes', () => {
    expect(cat({ definiteness: 'indefinite', number: 'plural', adjectives: ['BIG'] }).fr).toBe('de grands chats mangent.');
    expect(cat({ definiteness: 'indefinite', number: 'plural', adjectives: ['HAPPY'] }).fr).toBe('des chats heureux mangent.');
  });
});

// The adjectives the builder names clauses, conjunction kinds, aspects and polarity with, on the noun
// each describes. The Romance forms agree with it (CLAUSE, CONJUNCTION and POLARITY are feminine);
// Japanese compounds the clause names on 節 (主節, 条件節, 等位節).
describe('the grammar adjectives agree with the noun they name', () => {
  const named = (noun: string, adjective: string) =>
    sayAll({ subject: np(noun, { definiteness: 'indefinite', adjectives: [adjective] }) });

  test.each<[string, string, Record<string, string>]>([
    ['CLAUSE', 'MAIN', { en: 'a main clause.', it: 'una proposizione principale.', fr: 'une proposition principale.', de: 'ein übergeordneter Satz.', es: 'una oración principal.', ja: '主節。', pt: 'uma oração principal.' }],
    ['CLAUSE', 'CONDITIONAL', { en: 'a conditional clause.', it: 'una proposizione condizionale.', fr: 'une proposition conditionnelle.', de: 'ein konditionaler Satz.', es: 'una oración condicional.', ja: '条件節。', pt: 'uma oração condicional.' }],
    ['CLAUSE', 'COORDINATED', { en: 'a coordinated clause.', it: 'una proposizione coordinata.', fr: 'une proposition coordonnée.', de: 'ein beigeordneter Satz.', es: 'una oración coordinada.', ja: '等位節。', pt: 'uma oração coordenada.' }],
    ['CLAUSE', 'SUBORDINATE', { en: 'a subordinate clause.', it: 'una proposizione subordinata.', fr: 'une proposition subordonnée.', de: 'ein untergeordneter Satz.', es: 'una oración subordinada.', ja: '従属節。', pt: 'uma oração subordinada.' }],
    ['CONJUNCTION', 'COPULATIVE', { en: 'a copulative conjunction.', it: 'una congiunzione copulativa.', fr: 'une conjonction copulative.', de: 'eine kopulative Konjunktion.', es: 'una conjunción copulativa.', ja: '累加の接続詞。', pt: 'uma conjunção copulativa.' }],
    ['CONJUNCTION', 'DISJUNCTIVE', { en: 'a disjunctive conjunction.', it: 'una congiunzione disgiuntiva.', fr: 'une conjonction disjonctive.', de: 'eine disjunktive Konjunktion.', es: 'una conjunción disyuntiva.', ja: '選択の接続詞。', pt: 'uma conjunção disjuntiva.' }],
    ['CONJUNCTION', 'ADVERSATIVE', { en: 'an adversative conjunction.', it: 'una congiunzione avversativa.', fr: 'une conjonction adversative.', de: 'eine adversative Konjunktion.', es: 'una conjunción adversativa.', ja: '逆接の接続詞。', pt: 'uma conjunção adversativa.' }],
    ['CONJUNCTION', 'EXPLICATIVE', { en: 'an explicative conjunction.', it: 'una congiunzione esplicativa.', fr: 'une conjonction explicative.', de: 'eine explikative Konjunktion.', es: 'una conjunción explicativa.', ja: '説明の接続詞。', pt: 'uma conjunção explicativa.' }],
    ['CONJUNCTION', 'CONCLUSIVE', { en: 'a conclusive conjunction.', it: 'una congiunzione conclusiva.', fr: 'une conjonction conclusive.', de: 'eine konklusive Konjunktion.', es: 'una conjunción conclusiva.', ja: '順接の接続詞。', pt: 'uma conjunção conclusiva.' }],
    ['CONJUNCTION', 'TEMPORAL', { en: 'a temporal conjunction.', it: 'una congiunzione temporale.', fr: 'une conjonction temporelle.', de: 'eine temporale Konjunktion.', es: 'una conjunción temporal.', ja: '時間的な接続詞。', pt: 'uma conjunção temporal.' }],
    ['ASPECT', 'NEUTRAL', { en: 'a neutral aspect.', it: 'un aspetto neutrale.', fr: 'un aspect neutre.', de: 'ein neutraler Aspekt.', es: 'un aspecto neutral.', ja: '中立のアスペクト。', pt: 'um aspecto neutro.' }],
    ['ASPECT', 'PROGRESSIVE', { en: 'a progressive aspect.', it: 'un aspetto progressivo.', fr: 'un aspect progressif.', de: 'ein progressiver Aspekt.', es: 'un aspecto progresivo.', ja: '進行のアスペクト。', pt: 'um aspecto progressivo.' }],
    ['ASPECT', 'PROSPECTIVE', { en: 'a prospective aspect.', it: 'un aspetto prospettivo.', fr: 'un aspect prospectif.', de: 'ein prospektiver Aspekt.', es: 'un aspecto prospectivo.', ja: '将然のアスペクト。', pt: 'um aspecto prospectivo.' }],
    ['ASPECT', 'RESULTATIVE', { en: 'a resultative aspect.', it: 'un aspetto risultativo.', fr: 'un aspect résultatif.', de: 'ein resultativer Aspekt.', es: 'un aspecto resultativo.', ja: '結果のアスペクト。', pt: 'um aspecto resultativo.' }],
    ['POLARITY', 'POSITIVE', { en: 'a positive polarity.', it: 'una polarità positiva.', fr: 'une polarité positive.', de: 'eine positive Polarität.', es: 'una polaridad positiva.', ja: '肯定の極性。', pt: 'uma polaridade positiva.' }],
  ])('%s %s', (noun, adjective, expected) => {
    expect(named(noun, adjective)).toEqual(expected);
  });
});

// A169. A place name that takes no article alone takes one once an adjective modifies it: German "das
// große Asien", not "große Asien" (no article, and a weak ending with nothing to be weak after). The
// bare continent prepositions of Italian and French ("in Asia", "en Asie") likewise fit the bare
// name only; a prenominal adjective needs the article-bearing one ("nella grande Asia").
// Fixed: German `articledNameForms` marks such a name articled for its determiner, and the Italian
// and French bare prepositions fire only while the name leads its phrase. A postnominal adjective
// ("in Asia lontana") and Spanish ("en Asia grande") are left as they are, unpinned.
describe('known bugs: an adjective on a place name', () => {
  const bigAsia = np('ASIA', { adjectives: ['BIG'] });
  const withPlace = (type: 'locative' | 'direction' | 'source', verb: string) =>
    sayAll(clause(np('CAT'), verb, { complements: { [type]: { phrase: bigAsia } } }));

  test('German gives the modified name its article, in every position', () => {
    expect(sayAll(clause(bigAsia, 'BURN')).de).toBe('das große Asien brennt.'); // now: "große Asien"
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: bigAsia })).de).toBe('der Kater sieht das große Asien.');
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('ASIA', { adjectives: ['FAR'] }) })).de)
      .toBe('der Kater sieht das ferne Asien.');
    expect(withPlace('locative', 'RUN').de).toBe('der Kater läuft im großen Asien.'); // now: "in großen Asien"
    expect(withPlace('direction', 'GO').de).toBe('der Kater geht zum großen Asien.');
    expect(withPlace('source', 'COME').de).toBe('der Kater kommt aus dem großen Asien.');
    expect(sayAll(clause(np('BOOK', { possessor: bigAsia }), 'BURN')).de).toBe('das Buch des großen Asiens brennt.'); // genitive since B09
  });

  test('Italian and French take the article-bearing preposition before a prenominal adjective', () => {
    expect(withPlace('locative', 'RUN')).toMatchObject({
      it: 'il gatto corre nella grande Asia.', // now: "in grande Asia"
      fr: 'le chat court dans la grande Asie.', // now: "en grande Asie"
    });
    expect(withPlace('direction', 'GO')).toMatchObject({
      it: 'il gatto va nella grande Asia.',
      fr: 'le chat va dans la grande Asie.',
    });
    expect(withPlace('source', 'COME').fr).toBe('le chat vient de la grande Asie.'); // now: "de grande Asie"
  });

  // The other German prepositions fuse with the article the adjective brings back, and so does the
  // passive's "von"; a second adjective, a relation and the Italian/French source behave the same.
  test('the article comes back after every preposition, and after a relation', () => {
    const withBig = (type: 'comitative' | 'cause', phrase = bigAsia) =>
      sayAll(clause(np('CAT'), 'RUN', { complements: { [type]: { phrase } } }));
    expect(withBig('comitative')).toMatchObject({ de: 'der Kater läuft mit dem großen Asien.', it: 'il gatto corre con la grande Asia.' });
    expect(sayAll(clause(np('CAT'), 'SAVE', { directObject: np('BOOK'), complements: { terminus: { phrase: bigAsia } } })).de)
      .toBe('der Kater speichert das Buch ins große Asien.');
    expect(sayAll(clause(bigAsia, 'SEE', { directObject: np('BOOK'), verbPhrase: { voice: 'passive' } })).de)
      .toBe('das Buch wird vom großen Asien gesehen.');
    const bigFarEurope = np('EUROPE', { adjectives: ['BIG', 'FAR'] });
    expect(sayAll(clause(bigFarEurope, 'BURN')).de).toBe('das große ferne Europa brennt.');
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { locative: { phrase: bigFarEurope } } }))).toMatchObject({
      de: 'der Kater läuft im großen fernen Europa.',
      it: 'il gatto corre nella grande Europa lontana.',
      fr: 'le chat court dans la grande Europe lointaine.',
    });
    expect(sayAll(clause(np('CAT'), 'COME', { complements: { source: { phrase: np('EUROPE', { adjectives: ['SMALL'] }) } } })))
      .toMatchObject({ de: 'der Kater kommt aus dem kleinen Europa.', it: 'il gatto viene dalla piccola Europa.', fr: 'le chat vient de la petite Europe.' });
  });

  // A possessive, not the article, fills the slot of a possessed name, whatever adjective it has
  // (A165): German "deinem großen Asien", Italian and French with the article-bearing "in".
  test('a possessive and an adjective together take the possessive, not the article', () => {
    const yourBigAsia = np('ASIA', { adjectives: ['BIG'], possessor: { kind: 'pronominal', person: '2', number: 'singular', gender: 'masc' } });
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { locative: { phrase: yourBigAsia } } }))).toMatchObject({
      de: 'der Kater läuft in deinem großen Asien.',
      it: 'il gatto corre nella tua grande Asia.',
      fr: 'le chat court dans ta grande Asie.',
    });
    expect(sayAll(clause(np('CAT'), 'GO', { complements: { direction: { phrase: yourBigAsia } } }))).toMatchObject({
      it: 'il gatto va nella tua grande Asia.',
      fr: 'le chat va dans ta grande Asie.',
    });
  });

  // Regression: the positions and languages already right, an articled name, and the bare name.
  test('the articled positions, Portuguese, an articled name and the bare name are unchanged', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: bigAsia }))).toMatchObject({
      en: 'the cat sees big Asia.', it: 'il gatto vede la grande Asia.', fr: 'le chat voit la grande Asie.',
      pt: 'o gato vê a Ásia grande.',
    });
    expect(withPlace('source', 'COME').it).toBe('il gatto viene dalla grande Asia.');
    expect(withPlace('locative', 'RUN').pt).toBe('o gato corre na Ásia grande.');
    expect(sayAll(clause(np('BOOK', { possessor: bigAsia }), 'BURN')).fr).toBe('le livre de la grande Asie brûle.');
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('ANTARCTICA', { adjectives: ['BIG'] }) })).de)
      .toBe('der Kater sieht die große Antarktis.');
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { locative: { phrase: np('ASIA') } } }))).toMatchObject({
      it: 'il gatto corre in Asia.', fr: 'le chat court en Asie.', de: 'der Kater läuft in Asien.',
    });
  });
});

// A172. A Spanish place name that goes bare on its own ("Europa") takes the definite article once an
// adjective modifies it: "la Europa afilada", "en la Europa afilada". A169 did this for German,
// Italian and French. Spanish `artFor` read only the lexicon's `takes_article`.
// Fixed: `artForms` marks such a name articled for its determiner. A name beginning with a stressed a
// takes "el" as "el agua" does ("el Asia grande", "del Asia grande", "al África grande"): the lexicon
// marks "Asia" and "África" `stressed_a`, and a prenominal adjective lifts it ("la primera Asia"). A
// name with its own complement ("la América del Norte grande", adjective after "del Norte") is left.
describe('known bugs: a Spanish place name with an adjective', () => {
  const sharpEurope = np('EUROPE', { adjectives: ['SHARP'] });
  const withPlace = (type: 'locative' | 'direction' | 'source' | 'manner' | 'comitative', verb: string, phrase = sharpEurope) =>
    sayAll(clause(np('CAT'), verb, { complements: { [type]: { phrase } } })).es;

  test('the modified name takes its article as subject, object, possessor and agent', () => {
    expect(sayAll(clause(sharpEurope, 'BURN')).es).toBe('la Europa afilada arde.'); // now: "Europa afilada arde."
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: sharpEurope })).es).toBe('el gato ve la Europa afilada.');
    expect(sayAll(clause(np('BOOK', { possessor: sharpEurope }), 'BURN')).es).toBe('el libro de la Europa afilada arde.');
    expect(sayAll(clause(sharpEurope, 'SEE', { directObject: np('BOOK'), verbPhrase: { voice: 'passive' } })).es)
      .toBe('el libro es visto por la Europa afilada.');
    expect(sayAll(clause(np('EUROPE', { adjectives: ['BIG', 'FAR'] }), 'BURN')).es).toBe('la Europa grande y lejana arde.');
    expect(sayAll(clause(np('EUROPE', { adjectives: ['FIRST'] }), 'BURN')).es).toBe('la primera Europa arde.');
  });

  test('the modified name takes its article after every preposition', () => {
    expect(withPlace('locative', 'RUN')).toBe('el gato corre en la Europa afilada.'); // now: "en Europa afilada"
    expect(withPlace('direction', 'GO')).toBe('el gato va a la Europa afilada.');
    expect(withPlace('source', 'COME')).toBe('el gato viene de la Europa afilada.');
    expect(withPlace('manner', 'RUN')).toBe('el gato corre como la Europa afilada.');
    expect(withPlace('comitative', 'RUN')).toBe('el gato corre con la Europa afilada.');
    expect(withPlace('locative', 'RUN', np('OCEANIA', { adjectives: ['BIG'] }))).toBe('el gato corre en la Oceanía grande.');
    // The random phrase that found it (seed 892057). With A173 fixed too, the whole phrase is asserted.
    expect(sayAll({
      subject: np('FEELING', { number: 'plural', adjectives: ['BROWN'], adjectiveDegrees: ['equally'] }),
      verbPhrase: { verb: 'DIVIDE', tense: 'past', aspect: 'prospective', modifier: 'SLOWLY' },
      directObject: np('FEELING', {
        definiteness: 'indefinite', adjectives: ['OLD', 'LOUD'],
        relative: { verbPhrase: { verb: 'EXTINGUISH', tense: 'present', modifier: 'UP' }, headRole: 'directObject', subject: np('FIRST_PERSON', { number: 'plural' }) },
      }),
      complements: { manner: { phrase: sharpEurope } },
      interrogative: true,
    }).es).toBe('¿los sentimientos igual de marrones estaban a punto de dividir lentamente un sentimiento viejo y fuerte que apagamos arriba como la Europa afilada?'); // now: "arriba como Europa afilada?"
  });

  // A name beginning with a stressed a takes "el" once articled, as "el agua" does, and fuses it with
  // "de" and "a". A prenominal adjective parts article and noun, so "la" comes back.
  test('a name beginning with a stressed a takes "el", unless a prenominal adjective parts them', () => {
    const bigAsia = np('ASIA', { adjectives: ['BIG'] });
    const bigAfrica = np('AFRICA', { adjectives: ['BIG'] });
    expect(sayAll(clause(bigAsia, 'BURN')).es).toBe('el Asia grande arde.');
    expect(sayAll(clause(bigAfrica, 'BURN')).es).toBe('el África grande arde.');
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: bigAsia })).es).toBe('el gato ve el Asia grande.');
    expect(withPlace('source', 'COME', bigAsia)).toBe('el gato viene del Asia grande.');
    expect(withPlace('direction', 'GO', bigAfrica)).toBe('el gato va al África grande.');
    expect(withPlace('locative', 'RUN', bigAsia)).toBe('el gato corre en el Asia grande.');
    expect(withPlace('manner', 'RUN', bigAfrica)).toBe('el gato corre como el África grande.');
    expect(sayAll(clause(np('BOOK', { possessor: bigAsia }), 'BURN')).es).toBe('el libro del Asia grande arde.');
    expect(sayAll(clause(bigAfrica, 'SEE', { directObject: np('BOOK'), verbPhrase: { voice: 'passive' } })).es)
      .toBe('el libro es visto por el África grande.');
    expect(sayAll(clause(np('ASIA', { adjectives: ['FIRST'] }), 'BURN')).es).toBe('la primera Asia arde.');
    expect(sayAll(clause(np('AFRICA', { adjectives: ['FIRST'] }), 'BURN')).es).toBe('la primera África arde.');
    // Bare, the name has no article for the stressed a to change, and a possessive keeps the slot.
    expect(sayAll(clause(np('ASIA'), 'BURN')).es).toBe('Asia arde.');
    expect(withPlace('source', 'COME', np('AFRICA'))).toBe('el gato viene de África.');
    expect(withPlace('locative', 'RUN', np('ASIA', {
      adjectives: ['BIG'], possessor: { kind: 'pronominal', person: '2', number: 'singular', gender: 'masc' },
    }))).toBe('el gato corre en tu Asia grande.');
  });

  // Regression: the bare name, a name the lexicon articles, a possessive, and the other languages.
  test('the bare name, an articled name, a possessive and the other languages are unchanged', () => {
    expect(sayAll(clause(np('EUROPE'), 'BURN')).es).toBe('Europa arde.');
    expect(withPlace('locative', 'RUN', np('EUROPE'))).toBe('el gato corre en Europa.');
    expect(sayAll(clause(np('ANTARCTICA', { adjectives: ['BIG'] }), 'BURN')).es).toBe('la Antártida grande arde.');
    expect(withPlace('locative', 'RUN', np('EUROPE', {
      adjectives: ['SHARP'], possessor: { kind: 'pronominal', person: '2', number: 'singular', gender: 'masc' },
    }))).toBe('el gato corre en tu Europa afilada.');
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { manner: { phrase: sharpEurope } } }))).toMatchObject({
      en: 'the cat runs like sharp Europe.',
      it: "il gatto corre come l'Europa affilata.",
      fr: "le chat court comme l'Europe tranchante.",
      de: 'der Kater läuft wie das scharfe Europa.',
      pt: 'o gato corre como a Europa afiada.',
    });
  });
});

// A175. A relative superlative is definite ("the biggest dog"). A25 made English force "the" under an
// indefinite or bare determiner. The other languages keep the determiner the plan picked: Italian,
// Spanish and Portuguese then say the comparative ("un cane più grande", C01), French drops its first
// article ("un chien le plus grand"), and German declines a superlative under "ein" ("einen größten
// Hund"). The quantifiers (some/many/few/all) are left as A25 left them, unpinned.
// Fixed: `resolveNounPhrase` resolves an indefinite or bare superlative as definite, for every language.
describe('known bugs: a superlative under an indefinite or bare determiner', () => {
  const dog = (definiteness: Definiteness, degree: Degree = 'most', extra: Partial<NounPhrase> = {}) =>
    np('DOG', { definiteness, adjectives: ['BIG'], adjectiveDegrees: [degree], ...extra });
  const sees = (object: NounPhrase) => sayAll(clause(np('CAT'), 'SEE', { directObject: object }));

  test('an indefinite superlative takes the definite article', () => {
    expect(sees(dog('indefinite'))).toMatchObject({
      it: 'il gatto vede il cane più grande.', // now: "un cane più grande" (= a bigger dog)
      fr: 'le chat voit le chien le plus grand.', // now: "un chien le plus grand"
      de: 'der Kater sieht den größten Hund.', // now: "einen größten Hund"
      es: 'el gato ve el perro más grande.',
      pt: 'o gato vê o maior cão.',
    });
    expect(sees(dog('indefinite', 'least'))).toMatchObject({
      it: 'il gatto vede il cane meno grande.', de: 'der Kater sieht den am wenigsten großen Hund.', fr: 'le chat voit le chien le moins grand.',
    });
    expect(sees(dog('indefinite', 'most', { number: 'plural' }))).toMatchObject({
      fr: 'le chat voit les chiens les plus grands.', de: 'der Kater sieht die größten Hunde.', es: 'el gato ve los perros más grandes.',
    });
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { locative: { phrase: np('HOUSE', { definiteness: 'indefinite', adjectives: ['BIG'], adjectiveDegrees: ['most'] }) } } })))
      .toMatchObject({ it: 'il gatto corre nella casa più grande.', de: 'der Kater läuft im größten Haus.', pt: 'o gato corre na maior casa.' });
    // A predicate noun defaults to the indefinite.
    expect(sayAll(clause(np('CAT'), 'BE', { complements: { predicative: { phrase: np('DOG', { adjectives: ['BIG'], adjectiveDegrees: ['most'] }) } } })))
      .toMatchObject({ it: 'il gatto è il cane più grande.', de: 'der Kater ist der größte Hund.', fr: 'le chat est le chien le plus grand.' });
  });

  test('a bare superlative takes the definite article', () => {
    expect(sayAll(clause(dog('bare'), 'RUN'))).toMatchObject({
      it: 'il cane più grande corre.', fr: 'le chien le plus grand court.', de: 'der größte Hund läuft.', es: 'el perro más grande corre.', pt: 'o maior cão corre.',
    });
    expect(sayAll(clause(np('CAT'), 'DRINK', { directObject: np('WATER', { definiteness: 'bare', adjectives: ['COLD'], adjectiveDegrees: ['most'] }) })))
      .toMatchObject({ fr: "le chat boit l'eau la plus froide.", de: 'der Kater trinkt das kälteste Wasser.', pt: 'o gato bebe a água mais fria.' });
    // The random phrase that found it (seed 942887): a bare manner. Only its end is asserted outside
    // German, whose whole sentence is right now that A174 is fixed too.
    const phrase = sayAll({
      subject: np('FEELING', { number: 'plural', adjectives: ['DOMESTIC', 'BAD'], adjectiveDegrees: ['positive', 'least'], possessor: { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' } }),
      verbPhrase: { verb: 'USE', aspect: 'resultative', negative: true },
      directObject: np('PERSON', {
        definiteness: 'that', adjectives: ['HUNGRY', 'LAZY'],
        relative: { verbPhrase: { verb: 'START' }, headRole: 'directObject', subject: np('ANIMAL', { definiteness: 'indefinite', adjectives: ['SMALL'], adjectiveDegrees: ['equally'] }) },
      }),
      complements: { manner: { phrase: np('PHRASE', { definiteness: 'bare', adjectives: ['HUNGRY'], adjectiveDegrees: ['least'] }) } },
    });
    expect(phrase.it).toMatch(/ come la frase meno affamata\.$/); // now: "come frase meno affamata"
    expect(phrase.fr).toMatch(/ comme la phrase la moins affamée\.$/);
    expect(phrase.de).toMatch(/ nicht wie die am wenigsten hungrige Phrase verwendet\.$/);
    expect(phrase.de).toBe('ihre zahmen am wenigsten schlechten Gefühle haben jene hungrige faule Person, die ein gleich kleines Tier beginnt, nicht wie die am wenigsten hungrige Phrase verwendet.');
    expect(phrase.es).toMatch(/ como la frase menos hambrienta\.$/);
    expect(phrase.pt).toMatch(/ como a frase menos faminta\.$/);
  });

  // Every language, for both degrees, in the plural and the feminine, and in the positions around
  // the pinned ones: a bare plural object, the source and goal, a noun possessor, the passive agent,
  // and one conjunct of a group, which takes the article alone.
  test('a superlative is definite in every language, number, gender and position', () => {
    expect(sees(dog('indefinite', 'least'))).toEqual({
      en: 'the cat sees the least big dog.',
      it: 'il gatto vede il cane meno grande.',
      fr: 'le chat voit le chien le moins grand.',
      de: 'der Kater sieht den am wenigsten großen Hund.',
      es: 'el gato ve el perro menos grande.',
      pt: 'o gato vê o cão menos grande.',
      ja: '猫は最も大きくない犬を見ます。',
    });
    expect(sees(dog('indefinite', 'most', { number: 'plural' }))).toMatchObject({
      it: 'il gatto vede i cani più grandi.', pt: 'o gato vê os maiores cães.',
    });
    expect(sees(dog('bare', 'most', { number: 'plural' }))).toMatchObject({
      en: 'the cat sees the biggest dogs.', it: 'il gatto vede i cani più grandi.', fr: 'le chat voit les chiens les plus grands.',
      de: 'der Kater sieht die größten Hunde.', es: 'el gato ve los perros más grandes.', pt: 'o gato vê os maiores cães.',
    });
    expect(sees(np('CAT', { gender: 'fem', definiteness: 'indefinite', adjectives: ['BIG'], adjectiveDegrees: ['most'] }))).toMatchObject({
      it: 'il gatto vede la gatta più grande.', fr: 'le chat voit la chatte la plus grande.', de: 'der Kater sieht die größte Katze.',
      es: 'el gato ve la gata más grande.', pt: 'o gato vê a maior gata.',
    });
    const biggestHouse = np('HOUSE', { definiteness: 'indefinite', adjectives: ['BIG'], adjectiveDegrees: ['most'] });
    expect(sayAll(clause(np('CAT'), 'COME', { complements: { source: { phrase: biggestHouse } } }))).toMatchObject({
      it: 'il gatto viene dalla casa più grande.', fr: 'le chat vient de la maison la plus grande.', de: 'der Kater kommt aus dem größten Haus.',
      es: 'el gato viene de la casa más grande.', pt: 'o gato vem da maior casa.',
    });
    expect(sayAll(clause(np('CAT'), 'GO', { complements: { direction: { phrase: biggestHouse } } }))).toMatchObject({
      it: 'il gatto va alla casa più grande.', fr: 'le chat va à la maison la plus grande.', de: 'der Kater geht zum größten Haus.',
      es: 'el gato va a la casa más grande.', pt: 'o gato vai à maior casa.',
    });
    expect(sayAll(clause(np('BOOK', { possessor: dog('indefinite') }), 'BURN'))).toMatchObject({
      it: 'il libro del cane più grande brucia.', fr: 'le livre du chien le plus grand brûle.', de: 'das Buch des größten Hundes brennt.',
      es: 'el libro del perro más grande arde.', pt: 'o livro do maior cão arde.',
    });
    expect(sayAll(clause(dog('indefinite'), 'SEE', { directObject: np('BOOK'), verbPhrase: { voice: 'passive' } }))).toMatchObject({
      it: 'il libro è visto dal cane più grande.', fr: 'le livre est vu par le chien le plus grand.', de: 'das Buch wird vom größten Hund gesehen.',
      es: 'el libro es visto por el perro más grande.', pt: 'o livro é visto pelo maior cão.',
    });
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: { conjunction: 'and', conjuncts: [np('CAT', { definiteness: 'indefinite' }), dog('indefinite')] } })))
      .toMatchObject({
        en: 'the cat sees a cat and the biggest dog.', it: 'il gatto vede un gatto e il cane più grande.',
        fr: 'le chat voit un chat et le chien le plus grand.', de: 'der Kater sieht einen Kater und den größten Hund.',
        es: 'el gato ve un gato y el perro más grande.', pt: 'o gato vê um gato e o maior cão.',
      });
  });

  // Regression: English and Japanese, a comparative under an indefinite, and a superlative that is
  // already definite, demonstrative or possessed.
  test('English, Japanese, a comparative and an already definite superlative are unchanged', () => {
    expect(sees(dog('indefinite'))).toMatchObject({ en: 'the cat sees the biggest dog.', ja: '猫は最も大きい犬を見ます。' });
    expect(sees(dog('indefinite', 'more'))).toMatchObject({
      en: 'the cat sees a bigger dog.', it: 'il gatto vede un cane più grande.', fr: 'le chat voit un chien plus grand.', de: 'der Kater sieht einen größeren Hund.',
    });
    expect(sees(dog('definite'))).toMatchObject({ it: 'il gatto vede il cane più grande.', de: 'der Kater sieht den größten Hund.' });
    expect(sees(dog('that'))).toMatchObject({ it: 'il gatto vede quel cane più grande.', de: 'der Kater sieht jenen größten Hund.' });
    expect(sees(np('DOG', { adjectives: ['BIG'], adjectiveDegrees: ['most'], possessor: { kind: 'pronominal', person: '1', number: 'singular', gender: 'masc' } })))
      .toMatchObject({ it: 'il gatto vede il mio cane più grande.', fr: 'le chat voit mon chien le plus grand.', de: 'der Kater sieht meinen größten Hund.' });
  });

  // Regression: the other degrees keep the determiner picked. The lowered comparative and the
  // equative stay indefinite, and a comparative stays bare.
  test('"less", "equally" and a bare comparative keep their determiner', () => {
    expect(sees(dog('indefinite', 'less'))).toMatchObject({
      en: 'the cat sees a less big dog.', it: 'il gatto vede un cane meno grande.', fr: 'le chat voit un chien moins grand.',
      de: 'der Kater sieht einen weniger großen Hund.', es: 'el gato ve un perro menos grande.', pt: 'o gato vê um cão menos grande.',
    });
    expect(sees(dog('indefinite', 'equally'))).toMatchObject({
      en: 'the cat sees an equally big dog.', it: 'il gatto vede un cane ugualmente grande.', de: 'der Kater sieht einen gleich großen Hund.',
    });
    expect(sayAll(clause(dog('bare', 'more', { number: 'plural' }), 'RUN'))).toMatchObject({
      en: 'bigger dogs run.', it: 'cani più grandi corrono.', de: 'größere Hunde laufen.', es: 'perros más grandes corren.',
    });
  });
});

// A178. Portuguese says a suppletive superlative before the noun: "o maior continente", "o melhor
// gato". A6 made maior / melhor / menor / pior the raised degrees of grande / bom / pequeno / mau and
// kept every compared adjective after the noun, which is right for the comparative ("o gato maior",
// the bigger cat) and for a periphrastic superlative ("o gato mais belo"). At `most` the suppletive
// after the noun reads as the comparative, and the superlative loses the one place Portuguese marks
// it. Found by the ASIA and OCEANIA definitions (localization A17): "o continente maior".
describe('known bugs: Portuguese suppletive superlative before the noun', () => {
  const most = (concept: string, adjective: string, extra: Partial<NounPhrase> = {}) =>
    np(concept, { adjectives: [adjective], adjectiveDegrees: ['most'], ...extra });

  test('a suppletive superlative precedes the noun', () => {
    expect(sayAll(clause(most('CAT', 'BIG'), 'EAT')).pt).toBe('o maior gato come.'); // now: "o gato maior"
    expect(sayAll(clause(most('CAT', 'GOOD'), 'EAT')).pt).toBe('o melhor gato come.');
    expect(sayAll(clause(most('CAT', 'BAD'), 'EAT')).pt).toBe('o pior gato come.');
    expect(sayAll(clause(most('HOUSE', 'SMALL'), 'BURN')).pt).toBe('a menor casa arde.');
    expect(sayAll(clause(most('CAT', 'GREAT'), 'EAT')).pt).toBe('o maior gato come.');
    expect(sayAll(clause(most('DOG', 'BIG', { number: 'plural' }), 'RUN')).pt).toBe('os maiores cães correm.');
    expect(sayAll(clause(most('CAT', 'BIG', { gender: 'fem', number: 'plural' }), 'EAT')).pt).toBe('as maiores gatas comem.');
    // Under a preposition, a possessive, and beside a plain adjective, which keeps its own place.
    expect(sayAll(clause(np('CAT'), 'COME', { complements: { source: { phrase: most('HOUSE', 'BIG') } } })).pt)
      .toBe('o gato vem da maior casa.');
    expect(sayAll(clause(np('CAT'), 'SEE', {
      directObject: most('DOG', 'BIG', { possessor: { kind: 'pronominal', person: '1', number: 'singular', gender: 'masc' } }),
    })).pt).toBe('o gato vê o meu maior cão.');
    expect(sayAll(clause(np('CAT', { adjectives: ['BIG', 'BROWN'], adjectiveDegrees: ['most', 'positive'] }), 'EAT')).pt)
      .toBe('o maior gato castanho come.'); // now: "o gato maior e castanho"
    // The definitions that found it (ASIA, OCEANIA).
    expect(sayAll({ subject: most('CONTINENT', 'BIG', { definiteness: 'definite' }) }).pt).toBe('o maior continente.');
    expect(sayAll({ subject: most('CONTINENT', 'SMALL', { definiteness: 'definite' }) }).pt).toBe('o menor continente.');
  });

  // Regression: the comparative, the lowered degree, a periphrastic superlative and the predicative
  // superlative keep their places, and the other Romance languages are untouched.
  test('the comparative, a periphrastic superlative and the predicate stay where they are', () => {
    const withDegree = (adjective: string, degree: Degree) =>
      sayAll(clause(np('CAT', { adjectives: [adjective], adjectiveDegrees: [degree] }), 'EAT'));
    expect(withDegree('BIG', 'more').pt).toBe('o gato maior come.');
    expect(withDegree('GOOD', 'more').pt).toBe('o gato melhor come.');
    expect(withDegree('BIG', 'least').pt).toBe('o gato menos grande come.');
    expect(withDegree('BEAUTIFUL', 'most').pt).toBe('o gato mais belo come.');
    expect(sayAll(clause(np('CAT'), 'BE', { complements: { predicative: { phrase: np('BIG', { headDegree: 'most' }) } } })).pt)
      .toBe('o gato é o maior.');
    expect(withDegree('BIG', 'most')).toMatchObject({
      it: 'il gatto più grande mangia.', es: 'el gato más grande come.', fr: 'le chat le plus grand mange.',
    });
  });

  // The suppletive agrees in number before the noun exactly as it did after it (it is invariant in
  // gender and pluralises in -es), and it keeps its place under a determiner other than the definite
  // and beside an ordinal, which already precedes the noun.
  test('the prenominal suppletive agrees, and sits after an ordinal', () => {
    expect(sayAll(clause(most('CAT', 'GOOD', { number: 'plural' }), 'EAT')).pt).toBe('os melhores gatos comem.');
    expect(sayAll(clause(most('CAT', 'SMALL', { gender: 'fem', number: 'plural' }), 'EAT')).pt).toBe('as menores gatas comem.');
    expect(sayAll(clause(most('CAT', 'BAD', { gender: 'fem' }), 'EAT')).pt).toBe('a pior gata come.');
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: most('DOG', 'GOOD', { definiteness: 'indefinite' }) })).pt)
      .toBe('o gato vê o melhor cão.');
    expect(sayAll(clause(np('CAT', { adjectives: ['FIRST', 'BIG'], adjectiveDegrees: ['positive', 'most'] }), 'EAT')).pt)
      .toBe('o primeiro maior gato come.');
    // A periphrastic superlative still follows the noun in the plural too.
    expect(sayAll(clause(most('CAT', 'BEAUTIFUL', { number: 'plural' }), 'EAT')).pt).toBe('os gatos mais belos comem.');
  });
});

// A204. Iberian Romance decides *nuevo* / *novo* by position: after the noun it is "recently made"
// ("una casa nueva", a newly built house), before it "another, one more" ("una nueva casa", a second
// one). The PRENOMINAL sets hold only the ordinals and OTHER, so NEW always follows — and every
// phrase in the app that means "one more" (the console's `new clause`, `new phrase`, `new period`
// rows; `diagnostic.openClause`) reads as the other sense. Italian and French merge the two senses
// in the prenominal slot already, and en/de/ja have no contrast to get wrong.
describe('known bugs: Spanish and Portuguese NEW before the noun', () => {
  test('NEW precedes the noun in Spanish and Portuguese, as it does in Italian and French', () => {
    expect(cat({ adjectives: ['NEW'] })).toMatchObject({
      es: 'el nuevo gato come.', // now: el gato nuevo come.
      pt: 'o novo gato come.', // now: o gato novo come.
    });
    expect(cat({ definiteness: 'indefinite', adjectives: ['NEW'] }))
      .toMatchObject({ es: 'un nuevo gato come.', pt: 'um novo gato come.' });
    expect(cat({ gender: 'fem', number: 'plural', adjectives: ['NEW'] }))
      .toMatchObject({ es: 'las nuevas gatas comen.', pt: 'as novas gatas comem.' });
    // Beside a qualifying adjective, which keeps its own place after the noun rather than being
    // coordinated with this one ("un ratón nuevo y grande" today).
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('MOUSE', { definiteness: 'indefinite', adjectives: ['NEW', 'BIG'] }) })))
      .toMatchObject({ es: 'el gato ve un nuevo ratón grande.', pt: 'o gato vê um novo rato grande.' });
    // Under a preposition, and bare — the shape the console's rows render in.
    expect(sayAll(clause(np('CAT'), 'EAT', { complements: { locative: { phrase: np('HOUSE', { definiteness: 'indefinite', adjectives: ['NEW'] }) } } })))
      .toMatchObject({ es: 'el gato come en una nueva casa.', pt: 'o gato come em uma nova casa.' });
    expect(sayAll({ subject: np('CLAUSE', { definiteness: 'bare', adjectives: ['NEW'] }) }))
      .toMatchObject({ es: 'nueva oración.', pt: 'nova oração.' });
    expect(sayAll({ subject: np('PERIOD_SENTENCE', { definiteness: 'bare', adjectives: ['NEW'] }) }))
      .toMatchObject({ es: 'nuevo período.', pt: 'novo período.' });
  });

  // NEW joins the prenominal set, so it takes that set's ordering and agreement: it follows an
  // ordinal and OTHER (which are determiner-like and come first), precedes a qualifying adjective,
  // agrees in the masculine plural as in the feminine, and keeps its slot in front of the noun when
  // a genitive possessor follows it.
  test('the prenominal NEW agrees and orders like the rest of the set', () => {
    expect(cat({ number: 'plural', adjectives: ['NEW'] }))
      .toMatchObject({ es: 'los nuevos gatos comen.', pt: 'os novos gatos comem.' });
    expect(cat({ adjectives: ['FIRST', 'NEW'] }))
      .toMatchObject({ es: 'el primer nuevo gato come.', pt: 'o primeiro novo gato come.' });
    expect(cat({ adjectives: ['OTHER', 'NEW'] }))
      .toMatchObject({ es: 'el otro nuevo gato come.', pt: 'o outro novo gato come.' });
    expect(cat({ adjectives: ['NEW', 'BIG'] }))
      .toMatchObject({ es: 'el nuevo gato grande come.', pt: 'o novo gato grande come.' });
    expect(cat({ possessor: { concept: 'MAN' }, adjectives: ['NEW'] }))
      .toMatchObject({ es: 'el nuevo gato del hombre come.', pt: 'o novo gato do homem come.' });
  });

  // The position contrast is the *attributive* one, so the two places a Spanish or Portuguese
  // adjective has no position to take are untouched — and both keep the "recently made" reading the
  // corpus gloss opens with. A predicate NEW follows the copula like any other adjective, and a
  // graded one stays behind the noun with its periphrastic degree word ("el gato más nuevo" is the
  // most recently made one, which is what a comparison of newness means).
  test('a predicative and a graded NEW are unmoved', () => {
    expect(sayAll(clause(np('CAT'), 'BE', { complements: { predicative: { phrase: np('NEW') } } })))
      .toMatchObject({ es: 'el gato es nuevo.', pt: 'o gato é novo.' });
    expect(cat({ adjectives: ['NEW'], adjectiveDegrees: ['more'] }))
      .toMatchObject({ es: 'el gato más nuevo come.', pt: 'o gato mais novo come.' });
    expect(cat({ adjectives: ['NEW'], adjectiveDegrees: ['most'] }))
      .toMatchObject({ es: 'el gato más nuevo come.', pt: 'o gato mais novo come.' });
  });

  // Regression: the four languages that are already right, the rest of the prenominal set, and the
  // qualifying adjectives that must stay after the noun — the sense contrast is NEW's alone.
  test('the other four languages, OTHER, the ordinals and the qualifying adjectives are unchanged', () => {
    expect(cat({ adjectives: ['NEW'] })).toMatchObject({
      en: 'the new cat eats.', it: 'il nuovo gatto mangia.', fr: 'le nouveau chat mange.',
      de: 'der neue Kater frisst.', ja: '新しい猫は食べます。',
    });
    expect(cat({ definiteness: 'indefinite', adjectives: ['OTHER'] })).toMatchObject({ es: 'otro gato come.', pt: 'outro gato come.' });
    expect(cat({ adjectives: ['FIRST'] })).toMatchObject({ es: 'el primer gato come.', pt: 'o primeiro gato come.' });
    expect(cat({ adjectives: ['BIG'] })).toMatchObject({ es: 'el gato grande come.', pt: 'o gato grande come.' });
    expect(cat({ adjectives: ['OLD'] })).toMatchObject({ es: 'el gato viejo come.', pt: 'o gato velho come.' });
    expect(cat({ adjectives: ['BIG', 'OLD'] })).toMatchObject({ es: 'el gato grande y viejo come.', pt: 'o gato grande e velho come.' });
  });
});

// A295. German seeds YOUNG_WOMAN as "Frau" with an inherent adjective "jung", which `adjPhrase`
// declines on the head. As an attributive noun it is lost: the compound takes the bare stem
// ("Frauenbuch") and the postposed genitive (A20) declines only the modifier's own adjectives ("Buch
// kleiner Frauen"), so YOUNG_WOMAN reads as WOMAN. The grammar-term nouns lose their inherent
// adjective and their postnominal genitive the same way ("Bestimmungsbuch" for LOCATIVE).
describe('known bugs: German attributive noun drops its inherent adjective', () => {
  const bookOf = (modifier: NounModifier) => sayAll(clause(np('BOOK', { nounModifiers: [modifier] }), 'BURN')).de;

  test.fails('German keeps "jung" beside the modifier\'s own adjective', () => {
    expect(sayAll(clause(np('FEELING', {
      number: 'plural',
      nounModifiers: [{ concept: 'YOUNG_WOMAN', relation: 'purpose', number: 'plural', adjectives: ['GREAT'] }],
    }), 'RUN')).de).toBe('die Gefühle großer junger Frauen laufen.');
    expect(bookOf({ concept: 'YOUNG_WOMAN', relation: 'feature', number: 'plural', adjectives: ['SMALL'] })).toBe('das Buch kleiner junger Frauen brennt.');
    expect(bookOf({ concept: 'YOUNG_WOMAN', relation: 'feature', adjectives: ['SMALL'] })).toBe('das Buch kleiner junger Frau brennt.');
  });

  test.fails('German breaks a modifier with an inherent adjective out of the compound', () => {
    expect(bookOf({ concept: 'YOUNG_WOMAN', relation: 'feature', number: 'plural' })).toBe('das Buch junger Frauen brennt.');
    expect(sayAll(clause(np('CAT'), 'RUN', {
      complements: { direction: { phrase: np('BOOK', { nounModifiers: [{ concept: 'YOUNG_WOMAN', relation: 'feature', number: 'plural' }] }) } },
    })).de).toBe('der Kater läuft zum Buch junger Frauen.');
  });

  test.fails('German keeps a grammar term\'s adjective and postnominal genitive in the modifier', () => {
    expect(bookOf({ concept: 'LOCATIVE', relation: 'feature', number: 'plural' })).toBe('das Buch adverbialer Bestimmungen des Ortes brennt.');
    expect(bookOf({ concept: 'LOCATIVE', relation: 'feature', adjectives: ['SMALL'] })).toBe('das Buch kleiner adverbialer Bestimmung des Ortes brennt.');
  });

  test('regression: WOMAN, and YOUNG_WOMAN as a head or a possessor, are already right', () => {
    expect(bookOf({ concept: 'WOMAN', relation: 'feature' })).toBe('das Frauenbuch brennt.');
    expect(bookOf({ concept: 'WOMAN', relation: 'feature', number: 'plural', adjectives: ['SMALL'] })).toBe('das Buch kleiner Frauen brennt.');
    expect(sayAll(clause(np('FEELING', { possessor: np('YOUNG_WOMAN', { number: 'plural', adjectives: ['GREAT'] }) }), 'RUN')).de)
      .toBe('das Gefühl der großen jungen Frauen läuft.');
    expect(sayAll(clause(np('YOUNG_WOMAN', { number: 'plural', adjectives: ['GREAT'] }), 'RUN')).de).toBe('die großen jungen Frauen laufen.');
  });
});
