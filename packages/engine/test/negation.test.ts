import { describe, expect, test } from 'vitest';
import type { NounPhrase, VerbPhrase } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';

// A `no`-determined DIRECT OBJECT ("the cat eats no mouse"). Unlike the article determiners, the
// negative quantifier carries polarity: the Romance languages weave it into the verb as negative
// concord (the preverbal non / ne / no / não), German declines "kein", and English says "no". The
// determiner is postverbal here, and — unlike a complement (see A33) — the object path handles the
// concord correctly. Only `no` on a subject was pinned until now (subject.test.ts); this is the
// object.
const eats = (object: NounPhrase) => sayAll(clause(np('CAT'), 'EAT', { directObject: object }));
const sees = (object: NounPhrase) => sayAll(clause(np('CAT'), 'SEE', { directObject: object }));
const noNP = (concept: string, extra: Partial<NounPhrase> = {}) =>
  np(concept, { definiteness: 'no', ...extra });

describe('negative direct object: concord', () => {
  test('the negator is woven into the verb for a `no` object', () => {
    expect(eats(noNP('MOUSE'))).toMatchObject({
      en: 'the cat eats no mouse.',
      it: 'il gatto non mangia nessun topo.', // non … nessun — the concord pair
      fr: 'le chat ne mange aucune souris.', // ne … aucune
      es: 'el gato no come ningún ratón.',
      pt: 'o gato não come nenhum rato.',
      de: 'der Kater frisst keine Maus.', // "kein" is a single negation — no concord needed
    });
  });

  test('the concord survives the past tense', () => {
    expect(eats(noNP('MOUSE'))).toMatchObject({ it: 'il gatto non mangia nessun topo.' });
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { tense: 'past' }, directObject: noNP('MOUSE') })))
      .toMatchObject({
        en: 'the cat ate no mouse.',
        it: 'il gatto non mangiò nessun topo.', // non + the perfective
        fr: 'le chat ne mangea aucune souris.',
        es: 'el gato no comió ningún ratón.',
        pt: 'o gato não comeu nenhum rato.',
        de: 'der Kater fraß keine Maus.',
      });
  });

  test('the negative determiner agrees with the gender of the object', () => {
    // nessuno → nessuna, ninguno → ninguna, nenhum → nenhuma; German declines kein for gender AND
    // the accusative case (keinen / keine / kein).
    expect(sees(noNP('HOUSE'))).toMatchObject({
      it: 'il gatto non vede nessuna casa.', // fem
      es: 'el gato no ve ninguna casa.',
      pt: 'o gato não vê nenhuma casa.',
      fr: 'le chat ne voit aucune maison.',
      de: 'der Kater sieht kein Haus.', // neuter
    });
    expect(sees(noNP('DOG'))).toMatchObject({
      it: 'il gatto non vede nessun cane.', // masc
      de: 'der Kater sieht keinen Hund.', // accusative masculine: keinen
    });
  });
});

// Japanese expresses a `no` object with the どの…も…ない circumfix: どの leads the noun phrase, も
// replaces the object particle を (Japanese does not stack も with を), and the negation weaves into
// the verb as clause-final concord — どのネズミも食べません, exactly as 決して…ない fires for a
// negative-polarity adverb. (See determiner.test.ts for the demonstrative/quantifier NP rendering
// this shares.)
describe('negative direct object: the どの…も…ない circumfix', () => {
  test('a `no` object forces the negative concord: どのネズミも食べません', () => {
    expect(eats(noNP('MOUSE')).ja).toBe('猫はどのネズミも食べません。');
    // The same negated verb arises when the negation is on the verb phrase itself, with a plain
    // (particle-bearing) object: ネズミを食べません.
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { negative: true }, directObject: np('MOUSE') })).ja)
      .toBe('猫はネズミを食べません。');
  });

  test('a `no` subject forces the concord and drops は: どの猫もネズミを食べません', () => {
    expect(sayAll(clause(noNP('CAT'), 'EAT', { directObject: np('MOUSE') })).ja)
      .toBe('どの猫もネズミを食べません。');
  });

  // A verbless period has no predicate to carry the ない, so the circumfix closes on ない itself — as the
  // manner gloss of NEVER does (どの時間もない) — rather than leaving a dangling どの.
  test('a verbless `no` phrase closes the circumfix itself: どの結果もない', () => {
    expect(sayAll({ subject: noNP('RESULT', { number: 'plural' }) }).ja).toBe('どの結果もない。');
    expect(sayAll({ subject: noNP('PHRASE', { adjectives: ['SAVED'] }) }).ja).toBe('どの保存済みのフレーズもない。');
    // Regression: a verbless phrase without `no` is still a bare title.
    expect(sayAll({ subject: np('RESULT', { definiteness: 'bare' }) }).ja).toBe('結果。');
  });
});

describe('known bugs: negative determiner with a plural noun', () => {
  // `no` + a plural noun used to over-pluralise the noun while the determiner stayed singular,
  // giving the agreement mismatch "nessun topi" (singular nessun + plural topi). The Romance
  // negative quantifiers (nessuno / ninguno / nenhum) are singular-only, so a `no` phrase now stays
  // singular — "nessun topo" — regardless of the requested number. English pluralises correctly
  // ("no mice") and German too ("keine Mäuse"); only it/es/pt produced the mismatch.
  const noMice = () => eats(noNP('MOUSE', { number: 'plural' }));

  test('Italian forces a `no` phrase singular: "nessun topo", not "nessun topi"', () => {
    expect(noMice()).toMatchObject({ it: 'il gatto non mangia nessun topo.' });
  });

  test('Spanish forces a `no` phrase singular: "ningún ratón", not "ningún ratones"', () => {
    expect(noMice()).toMatchObject({ es: 'el gato no come ningún ratón.' });
  });

  test('Portuguese forces a `no` phrase singular: "nenhum rato", not "nenhum ratos"', () => {
    expect(noMice()).toMatchObject({ pt: 'o gato não come nenhum rato.' });
  });

  // It is not specific to the object slot: a `no`-plural phrase in a COMPLEMENT stays singular too.
  test('a `no`-plural complement is singular in Romance', () => {
    const noHouses = sayAll(clause(np('CAT'), 'RUN', {
      complements: { locative: { phrase: np('HOUSE', { definiteness: 'no', number: 'plural' }) } },
    }));
    expect(noHouses).toMatchObject({
      it: 'il gatto non corre in nessuna casa.',
      es: 'el gato no corre en ninguna casa.',
      pt: 'o gato não corre em nenhuma casa.',
    });
  });

  // A modifying adjective agrees with the (now singular) phrase, not the requested plural.
  test('an adjective on a `no`-plural phrase is singular too', () => {
    const bigMice = eats(np('MOUSE', { definiteness: 'no', number: 'plural', adjectives: ['BIG'] }));
    expect(bigMice).toMatchObject({
      it: 'il gatto non mangia nessun grande topo.',
      es: 'el gato no come ningún ratón grande.',
    });
  });

  // Regression: English and German DO pluralise a `no` phrase (their negatives have a plural).
  test('English/German pluralise `no`', () => {
    expect(noMice()).toMatchObject({
      en: 'the cat eats no mice.',
      de: 'der Kater frisst keine Mäuse.',
    });
  });

  // French "souris" is the same in both numbers, which hid that French pluralised the noun after its
  // singular "aucun" as well ("*aucunes phrases enregistrées"). The translator now puts every Romance
  // `no` phrase in the singular, French included.
  test('French forces a `no` phrase singular: "aucun livre", not "aucun livres"', () => {
    expect(eats(noNP('MOUSE', { number: 'plural' })).fr).toBe('le chat ne mange aucune souris.');
    expect(eats(noNP('BOOK', { number: 'plural' })).fr).toBe('le chat ne mange aucun livre.');
    expect(sayAll({ subject: noNP('PHRASE', { number: 'plural', adjectives: ['SAVED'] }) })).toMatchObject({
      fr: 'aucune phrase enregistrée.',
      it: 'nessuna frase salvata.',
      en: 'no saved phrases.',
      de: 'keine gespeicherten Phrasen.',
    });
    expect(sayAll(clause(noNP('CAT', { number: 'plural' }), 'EAT')).fr).toBe('aucun chat ne mange.');
  });

  // Regression: an ordinary (positive) plural object still pluralises.
  test('a positive plural noun still pluralises', () => {
    expect(eats(np('MOUSE', { number: 'plural' }))).toMatchObject({
      it: 'il gatto mangia i topi.',
      es: 'el gato come los ratones.',
    });
  });
});

describe('known bugs: stacked negation is not collapsed', () => {
  // A `no` object already negates the clause. When a SECOND negation source was present — the verb's
  // own `negative`, a `NEVER` adverb, or a `no` subject — the languages that manage a single
  // preverbal negator failed to de-duplicate, and a double negative escaped. They now collapse to a
  // single negation: the non-concord languages (English/German) switch the object to a non-negative
  // form ("any mouse" / a plain "eine Maus"), and Romance drops the redundant preverbal negator.

  // The surface for the verb-`negative` / `NEVER` cases was a design call (English uses the "any"
  // NPI; German keeps "kein" for the negated verb but a plain indefinite under a negative adverb),
  // so those stay asserted negatively: whatever is chosen, the doubled form is wrong.
  test('a `negative` verb plus a `no` object must not double-negate (en, de)', () => {
    const said = sayAll(clause(np('CAT'), 'EAT', {
      verbPhrase: { negative: true }, directObject: noNP('MOUSE'),
    }));
    expect(said.en).not.toBe('the cat does not eat no mouse.');
    expect(said.de).not.toBe('der Kater isst keine Maus nicht.'); // kein AND nicht
  });

  test('a NEVER adverb plus a `no` object must not stack negators (en, es, pt, de)', () => {
    const said = sayAll(clause(np('CAT'), 'EAT', {
      verbPhrase: { modifier: 'NEVER' }, directObject: noNP('MOUSE'),
    }));
    expect(said.en).not.toBe('the cat never eats no mouse.');
    expect(said.es).not.toContain('nunca no'); // Spanish stacks nunca + no
    expect(said.pt).not.toContain('nunca não');
    expect(said.de).not.toBe('der Kater isst nie keine Maus.'); // nie + keine
    // Italian and French compose these correctly (non … mai … nessun / ne … jamais … aucune).
    expect(said.it).toBe('il gatto non mangia mai nessun topo.');
    expect(said.fr).toBe('le chat ne mange jamais aucune souris.');
  });

  test('a `no` subject must not add a postverbal negator to a `no` object (it, es, pt)', () => {
    // A preverbal negative subject already negates the clause, so Italian/Spanish/Portuguese take
    // NO further preverbal negator — "nessun gatto mangia nessun topo", not "… non mangia …".
    // (French keeps "ne" everywhere and is correct: "aucun chat ne mange aucune souris".)
    const said = sayAll(clause(noNP('CAT'), 'EAT', { directObject: noNP('MOUSE') }));
    expect(said).toMatchObject({
      it: 'nessun gatto mangia nessun topo.',
      es: 'ningún gato come ningún ratón.',
      pt: 'nenhum gato come nenhum rato.',
    });
  });

  // The chosen collapsed surfaces, now pinned positively. A negated verb + `no` object: English's
  // "any" NPI, German's "kein" (with the redundant "nicht" gone), and the single Romance negator.
  test('the collapsed surface for a negated verb + `no` object', () => {
    const said = sayAll(clause(np('CAT'), 'EAT', {
      verbPhrase: { negative: true }, directObject: noNP('MOUSE'),
    }));
    expect(said).toMatchObject({
      en: 'the cat does not eat any mouse.',
      de: 'der Kater frisst keine Maus.',
      it: 'il gatto non mangia nessun topo.',
      es: 'el gato no come ningún ratón.',
      pt: 'o gato não come nenhum rato.',
      fr: 'le chat ne mange aucune souris.',
    });
  });

  // A NEVER adverb + `no` object: English's "any", German's plain indefinite under the adverb
  // ("nie eine Maus"), and Spanish/Portuguese with the single preverbal "nunca".
  test('the collapsed surface for NEVER + `no` object', () => {
    const said = sayAll(clause(np('CAT'), 'EAT', {
      verbPhrase: { modifier: 'NEVER' }, directObject: noNP('MOUSE'),
    }));
    expect(said).toMatchObject({
      en: 'the cat never eats any mouse.',
      de: 'der Kater frisst nie eine Maus.',
      es: 'el gato nunca come ningún ratón.',
      pt: 'o gato nunca come nenhum rato.',
    });
  });

  // Regression: a LONE `no` object is unchanged — English keeps "no" (not "any"), and the Romance
  // preverbal negator is present, since there is no second source to de-duplicate against.
  test('a lone `no` object is unchanged (no over-collapse)', () => {
    const said = sayAll(clause(np('CAT'), 'EAT', { directObject: noNP('MOUSE') }));
    expect(said).toMatchObject({
      en: 'the cat eats no mouse.',
      de: 'der Kater frisst keine Maus.',
      it: 'il gatto non mangia nessun topo.',
      es: 'el gato no come ningún ratón.',
    });
  });
});

// A74. When a negated verb or NEVER meets a `no` object, English switches the object to "any" (A35).
// `predicateParts` makes that switch for every conjunct once any one of them is `no`, so a
// definite or demonstrative conjunct loses its own determiner ("any mouse or any food"). Only the
// `no` conjunct should become "any".
describe('known bugs: English "any" on every conjunct of a negated object', () => {
  test('English switches only the `no` conjunct to "any"', () => {
    expect(say(clause(np('CAT'), 'EAT', { verbPhrase: { negative: true }, directObject: { conjuncts: [np('MOUSE'), np('FOOD', { definiteness: 'no' })], conjunction: 'or' } }), 'en')).toBe('the cat does not eat the mouse or any food.');
    expect(say(clause(np('CAT'), 'EAT', { verbPhrase: { negative: true }, directObject: { conjuncts: [np('MOUSE', { definiteness: 'this' }), np('FOOD', { definiteness: 'no' })], conjunction: 'or' } }), 'en')).toBe('the cat does not eat this mouse or any food.');
    expect(say(clause(np('CAT'), 'EAT', { verbPhrase: { modifier: 'NEVER' }, directObject: { conjuncts: [np('MOUSE'), np('FOOD', { definiteness: 'no' })], conjunction: 'or' } }), 'en')).toBe('the cat never eats the mouse or any food.');
  });

  test('English switches only the `no` conjunct in a relative clause, under a modal\'s NEVER and in either order', () => {
    const mouseOrNoFood = { conjuncts: [np('MOUSE'), np('FOOD', { definiteness: 'no' })], conjunction: 'or' as const };
    expect(say(clause(np('DOG', { relative: { verbPhrase: { verb: 'EAT', negative: true }, directObject: mouseOrNoFood } }), 'RUN'), 'en'))
      .toBe('the dog that does not eat the mouse or any food runs.');
    expect(say(clause(np('CAT'), 'EAT', { verbPhrase: { modals: [{ verb: 'MUST', modifier: 'NEVER' }] }, directObject: mouseOrNoFood }), 'en'))
      .toBe('the cat must never eat the mouse or any food.');
    expect(say(clause(np('CAT'), 'EAT', { verbPhrase: { negative: true }, directObject: { conjuncts: [np('FOOD', { definiteness: 'no' }), np('MOUSE', { definiteness: 'indefinite' })], conjunction: 'and' } }), 'en'))
      .toBe('the cat does not eat any food and a mouse.');
  });

  test('regression: every `no` conjunct still switches, and the affirmative keeps "no"', () => {
    expect(say(clause(np('CAT'), 'EAT', { verbPhrase: { negative: true }, directObject: { conjuncts: [np('MOUSE', { definiteness: 'no' }), np('FOOD', { definiteness: 'no' })], conjunction: 'or' } }), 'en'))
      .toBe('the cat does not eat any mouse or any food.');
    expect(say(clause(np('CAT'), 'EAT', { directObject: { conjuncts: [np('MOUSE'), np('FOOD', { definiteness: 'no' })], conjunction: 'or' } }), 'en'))
      .toBe('the cat eats the mouse or no food.');
  });
});

// A78. English puts a frequency adverb after a negated auxiliary's "not": "has not always eaten",
// "cannot always eat". `afterFirstAux` inserts it after the first word, before the "not" ("has
// always not eaten", "could always not eat"). A modal's own adverb is placed from the first word of
// the negated finite, so "cannot" and do-support ("does not have to") get it in front.
describe('known bugs: English frequency adverb inside a negated auxiliary', () => {
  test('English puts ALWAYS after the auxiliary\'s "not"', () => {
    expect(say(clause(np('CAT'), 'EAT', { verbPhrase: { modifier: 'ALWAYS', negative: true, aspect: 'resultative' } }), 'en')).toBe('the cat has not always eaten.');
    expect(say(clause(np('CAT'), 'EAT', { verbPhrase: { modifier: 'ALWAYS', negative: true, aspect: 'progressive' } }), 'en')).toBe('the cat is not always eating.');
    expect(say(clause(np('CAT'), 'EAT', { verbPhrase: { negative: true, modals: [{ verb: 'CAN', modifier: 'ALWAYS' }] } }), 'en')).toBe('the cat cannot always eat.');
    expect(say(clause(np('CAT'), 'EAT', { verbPhrase: { negative: true, tense: 'past', modals: [{ verb: 'CAN', modifier: 'ALWAYS' }] } }), 'en')).toBe('the cat could not always eat.');
    expect(say(clause(np('CAT'), 'EAT', { verbPhrase: { negative: true, modals: [{ verb: 'MUST', modifier: 'ALWAYS' }] } }), 'en')).toBe('the cat does not always have to eat.');
    expect(say(clause(np('CAT'), 'EAT', { verbPhrase: { negative: true, modals: [{ verb: 'WILL', modifier: 'ALWAYS' }] } }), 'en')).toBe('the cat does not always want to eat.');
  });

  test('English puts the adverb after "not" in every negated group of the table', () => {
    const cat = (verbPhrase: Partial<VerbPhrase>) => say(clause(np('CAT'), 'EAT', { verbPhrase }), 'en');
    expect(cat({ modifier: 'ALWAYS', negative: true, aspect: 'progressive' })).toBe('the cat is not always eating.');
    expect(cat({ modifier: 'ALWAYS', negative: true, aspect: 'resultative', tense: 'future' })).toBe('the cat will not always have eaten.');
    expect(say(clause(np('DOG', { relative: { verbPhrase: { verb: 'EAT', modifier: 'ALWAYS', negative: true, aspect: 'resultative' } } }), 'RUN'), 'en'))
      .toBe('the dog that has not always eaten runs.');
    expect(cat({ negative: true, tense: 'future', modals: [{ verb: 'CAN', modifier: 'ALWAYS' }] })).toBe('the cat will not always be able to eat.');
    expect(cat({ negative: true, tense: 'past', modals: [{ verb: 'MUST', modifier: 'ALWAYS' }] })).toBe('the cat did not always have to eat.');
    expect(cat({ negative: true, modals: [{ verb: 'WILL', modifier: 'ALWAYS' }] })).toBe('the cat does not always want to eat.');
  });

  test('regression: the affirmative groups keep their slots', () => {
    const cat = (verbPhrase: Partial<VerbPhrase>) => say(clause(np('CAT'), 'EAT', { verbPhrase }), 'en');
    expect(cat({ modifier: 'ALWAYS', aspect: 'resultative' })).toBe('the cat has always eaten.');
    expect(cat({ modals: [{ verb: 'MUST', modifier: 'ALWAYS' }] })).toBe('the cat must always eat.');
    expect(cat({ modals: [{ verb: 'WILL', modifier: 'NEVER' }] })).toBe('the cat never wants to eat.');
    expect(cat({ negative: true, modifier: 'ALWAYS', modals: [{ verb: 'CAN' }] })).toBe('the cat cannot always eat.');
  });
});

// A97. A coordinated group of negative ("ningún") conjuncts after the verb is joined with "ni" in
// Spanish. `coordinateElement` picks its link (y/e/o/u) only from the conjunction and the next
// word's sound, so a negated group comes out with "y". `predicateText`'s own comment gives the
// target: "no veo ningún niño ni ninguna niña".
describe('known bugs: Spanish "ni" in a negative coordination', () => {
  test('Spanish joins negative conjuncts with "ni"', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', {
      directObject: { conjuncts: [np('MOUSE', { definiteness: 'no' }), np('COW', { definiteness: 'no' })], conjunction: 'and' },
    })).es).toBe('el gato no ve ningún ratón ni ninguna vaca.');
    expect(sayAll(clause(np('CAT'), 'SEE', {
      directObject: { conjuncts: [np('MOUSE', { definiteness: 'no' }), np('COW', { definiteness: 'no' }), np('DOG', { definiteness: 'no' })], conjunction: 'and' },
    })).es).toBe('el gato no ve ningún ratón, ninguna vaca ni ningún perro.');
    expect(sayAll(clause(np('CAT'), 'RUN', {
      complements: { locative: { phrase: { conjuncts: [np('HOUSE', { definiteness: 'no' }), np('MARKET', { definiteness: 'no' })], conjunction: 'and' } } },
    })).es).toBe('el gato no corre en ninguna casa ni en ningún mercado.');
    expect(sayAll({
      ...clause(np('SECOND_PERSON'), 'EAT', {
        directObject: { conjuncts: [np('MOUSE', { definiteness: 'no' }), np('COW', { definiteness: 'no' })], conjunction: 'and' },
      }),
      imperative: true,
    }).es).toBe('no comas ningún ratón ni ninguna vaca.');
  });

  test('Spanish uses "ni" after "o", in a relative, an infinitive and a direction', () => {
    const no = (id: string) => np(id, { definiteness: 'no' });
    const and = (...conjuncts: ReturnType<typeof np>[]) => ({ conjuncts, conjunction: 'and' as const });
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: { conjuncts: [no('MOUSE'), no('COW')], conjunction: 'or' } })).es)
      .toBe('el gato no ve ningún ratón ni ninguna vaca.');
    expect(sayAll(clause(np('DOG', { relative: { verbPhrase: { verb: 'SEE' }, directObject: and(no('MOUSE'), no('COW')) } }), 'RUN')).es)
      .toBe('el perro que no ve ningún ratón ni ninguna vaca corre.');
    expect(sayAll({ ...clause(np('GENERIC_PERSON'), 'EAT', { directObject: and(no('MOUSE'), no('COW')) }), infinitive: true }).es)
      .toBe('no comer ningún ratón ni ninguna vaca.');
    expect(sayAll(clause(np('CAT'), 'GO', { complements: { direction: { phrase: and(no('HOUSE'), no('MARKET')) } } })).es)
      .toBe('el gato no va a ninguna casa ni a ningún mercado.');
  });

  test('regression: an affirmative object group under a negated verb keeps "y"', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', { verbPhrase: { negative: true }, directObject: { conjuncts: [np('MOUSE'), np('COW')], conjunction: 'and' } })).es)
      .toBe('el gato no ve el ratón y la vaca.');
  });
});

// A149. French has no zero article on an object. Where English leaves an indefinite object bare
// ("eats mice", "drinks water"), French writes the indefinite or partitive article, and a negation
// turns that article into "de" ("ne mange pas de souris", "ne boit jamais d'eau"). The object used
// to come out bare ("mange souris", "un lieu qui a murs"), and a negated one kept its article ("ne
// mange pas des souris"). The other languages take a bare object as it is.
describe('A149: the French object has no zero article, and a negation makes it de', () => {
  const bareMice = np('MOUSE', { definiteness: 'bare', number: 'plural' });
  const eats = (object: NounPhrase, extra: Partial<VerbPhrase> = {}, subject = np('CAT')) =>
    sayAll(clause(subject, 'EAT', { directObject: object, verbPhrase: extra }));

  test('a bare object takes the indefinite or partitive article', () => {
    expect(eats(bareMice)).toEqual({
      en: 'the cat eats mice.',
      it: 'il gatto mangia topi.',
      fr: 'le chat mange des souris.',
      de: 'der Kater frisst Mäuse.',
      es: 'el gato come ratones.',
      ja: '猫はネズミを食べます。',
      pt: 'o gato come ratos.',
    });
    expect(sayAll(clause(np('CAT'), 'DRINK', { directObject: np('WATER', { definiteness: 'bare' }) })).fr)
      .toBe("le chat boit de l'eau.");
    expect(eats(np('MOUSE', { definiteness: 'bare', number: 'plural', adjectives: ['BIG'] })).fr)
      .toBe('le chat mange de grandes souris.');
  });

  test('a negation turns the indefinite and the partitive into de', () => {
    expect(eats(np('MOUSE', { definiteness: 'indefinite' }), { negative: true }).fr).toBe('le chat ne mange pas de souris.');
    expect(eats(np('MOUSE', { definiteness: 'indefinite', number: 'plural' }), { negative: true }).fr)
      .toBe('le chat ne mange pas de souris.');
    expect(eats(bareMice, { negative: true }).fr).toBe('le chat ne mange pas de souris.');
    expect(sayAll(clause(np('CAT'), 'DRINK', { directObject: np('WATER', { definiteness: 'bare' }), verbPhrase: { modifier: 'NEVER' } })).fr)
      .toBe("le chat ne boit jamais d'eau.");
    expect(eats(bareMice, {}, np('CAT', { definiteness: 'no' })).fr).toBe('aucun chat ne mange de souris.');
  });

  test('wherever the negation sits in the verb group', () => {
    expect(eats(bareMice, { negative: true, modals: ['MUST'] }).fr).toBe('le chat ne doit pas manger de souris.');
    expect(eats(bareMice, { negative: true, aspect: 'resultative' }).fr).toBe("le chat n'a pas mangé de souris.");
    expect(sayAll({ ...clause(np('GENERIC_PERSON'), 'EAT', { directObject: bareMice, verbPhrase: { negative: true } }), infinitive: true }).fr)
      .toBe('ne pas manger de souris.');
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'EAT', { directObject: bareMice, verbPhrase: { negative: true } }), imperative: true }).fr)
      .toBe('ne mange pas de souris.');
    expect(sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT', negative: true }, directObject: bareMice } }), 'RUN')).fr)
      .toBe('le chat qui ne mange pas de souris court.');
  });

  test('an instrument and a prepositional object are never bare, and keep their article under a negation', () => {
    expect(sayAll(clause(np('BOY'), 'BUY', {
      directObject: np('BOOK', { definiteness: 'bare', number: 'plural' }),
      complements: { instrumental: { phrase: np('MONEY', { definiteness: 'bare' }) } },
    })).fr).toBe("le garçon achète des livres avec de l'argent.");
    expect(sayAll(clause(np('BOY'), 'CLICK', {
      directObject: np('BUTTON', { definiteness: 'bare', number: 'plural' }), verbPhrase: { negative: true },
    })).fr).toBe('le garçon ne clique pas sur des boutons.');
  });

  test('regression: the definite article, a possessive and a predicate noun keep theirs', () => {
    expect(eats(np('MOUSE'), { negative: true }).fr).toBe('le chat ne mange pas la souris.');
    expect(sayAll(clause(np('CAT'), 'HAVE', {
      directObject: np('BOOK', { possessor: { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' } }),
      verbPhrase: { negative: true },
    })).fr).toBe("le chat n'a pas son livre.");
    // "ne … pas de" is the direct object's alone; être keeps its article.
    expect(sayAll(clause(np('CAT', { number: 'plural' }), 'BE', {
      verbPhrase: { negative: true },
      complements: { predicative: { phrase: np('LEGEND', { definiteness: 'indefinite', number: 'plural' }) } },
    })).fr).toBe('les chats ne sont pas des légendes.');
  });
});

// A159. German sentence negation puts "nicht" after the OBJECTS but BEFORE a constituent belonging
// to the predicate, and a complement realized as a prepositional phrase is one: "geht nicht zum
// Markt", never "*geht zum Markt nicht". The engine treats every complement like an object and puts
// "nicht" last — marked-contrastive at best, and with "sein" ungrammatical ("*ist im Haus nicht").
// A49 wrote the rule as "after the objects AND complements"; that half is what is wrong.
describe('known bugs: German "nicht" and a prepositional complement', () => {
  const notWith = (verb: string, complements: Record<string, unknown>) =>
    say(clause(np('CAT'), verb, { verbPhrase: { negative: true }, complements }), 'de');
  const theMarket = { direction: { phrase: np('MARKET', { definiteness: 'definite' as const }) } };
  const theHouse = (type: 'locative' | 'source') =>
    ({ [type]: { phrase: np('HOUSE', { definiteness: 'definite' as const }) } });

  test.fails('"nicht" leads a prepositional complement in the declarative', () => {
    expect(notWith('GO', theMarket)).toBe('der Kater geht nicht zum Markt.'); // now: "zum Markt nicht."
    expect(notWith('COME', theHouse('source'))).toBe('der Kater kommt nicht aus dem Haus.');
    expect(notWith('BE', theHouse('locative'))).toBe('der Kater ist nicht im Haus.'); // now ungrammatical
    expect(notWith('RUN', theHouse('locative'))).toBe('der Kater läuft nicht im Haus.');
  });

  test.fails('the command, the modal and the relative clause place it the same way', () => {
    expect(say({
      subject: np('SECOND_PERSON'), verbPhrase: { verb: 'GO', negative: true },
      imperative: true, complements: theMarket,
    }, 'de')).toBe('geh nicht zum Markt.'); // now: "geh zum Markt nicht."
    expect(say(clause(np('CAT'), 'GO', {
      verbPhrase: { negative: true, modals: ['CAN'] }, complements: theMarket,
    }), 'de')).toBe('der Kater kann nicht zum Markt gehen.');
    // The relative clause computes the slot inline in `subordinateClause.ts` — a separate site.
    expect(say(clause(np('CAT', {
      relative: { verbPhrase: { verb: 'GO', negative: true }, complements: theMarket },
    }), 'RUN'), 'de')).toBe('der Kater, der nicht zum Markt geht, läuft.');
  });

  // Regression: "after" stays right for everything that is NOT a prepositional phrase — a direct
  // object, an ANIMATE terminus (a bare dative, not a PP), and the predicative, which already leads.
  test('an object, a bare-dative terminus and a predicative are unchanged', () => {
    expect(say(clause(np('CAT'), 'EAT', {
      verbPhrase: { negative: true }, directObject: np('MOUSE', { definiteness: 'definite' }),
    }), 'de')).toBe('der Kater frisst die Maus nicht.');
    expect(say(clause(np('MAN'), 'GIVE', {
      verbPhrase: { negative: true },
      directObject: np('BOOK', { definiteness: 'definite' }),
      complements: { terminus: { phrase: np('DOG', { definiteness: 'definite' }) } },
    }), 'de')).toBe('der Mann gibt dem Hund das Buch nicht.');
    // What is pinned here is the POSITION — "nicht" leads the predicative, as it already did.
    // Whether the predicative should read "keine Legende" rather than "nicht eine Legende" is a
    // separate question (German prefers "kein" for an indefinite predicate noun); this asserts
    // today's string so the slot change is visible, and takes no position on that.
    expect(notWith('BE', { predicative: { phrase: np('LEGEND', { definiteness: 'indefinite' }) } }))
      .toBe('der Kater ist nicht eine Legende.');
    // English is unaffected by the German slot.
    expect(say(clause(np('CAT'), 'GO', { verbPhrase: { negative: true }, complements: theMarket }), 'en'))
      .toBe('the cat does not go to the market.');
  });
});

// A160. A `no` SUBJECT already negates the clause, so a second negation source after it — a `no`
// object, a `no` complement, or the verb's own `negative` — doubles the negative in the two
// languages without negative concord. This is the corner A35 left: it fixed the `no`-subject case
// for Italian/Spanish/Portuguese and the object-side collapse for English/German, and recorded the
// English/German subject double as unpinned. It is the subject-side twin of A158.
describe('known bugs: a negative subject is not collapsed', () => {
  const noCat = noNP('CAT');

  test.fails('English switches the second negative to the "any" NPI, or drops "not"', () => {
    expect(sayAll(clause(noCat, 'EAT', { directObject: noNP('MOUSE') })).en)
      .toBe('no cat eats any mouse.'); // now: "no cat eats no mouse."
    expect(sayAll(clause(noCat, 'RUN', {
      complements: { locative: { phrase: noNP('HOUSE') } },
    })).en).toBe('no cat runs in any house.'); // now: "in no house"
    expect(sayAll(clause(noCat, 'RUN', { verbPhrase: { negative: true } })).en)
      .toBe('no cat runs.'); // now: "no cat does not run."
  });

  test.fails('German falls to a plain indefinite, or drops "nicht"', () => {
    expect(sayAll(clause(noCat, 'EAT', { directObject: noNP('MOUSE') })).de)
      .toBe('kein Kater frisst eine Maus.'); // now: "kein Kater frisst keine Maus."
    expect(sayAll(clause(noCat, 'RUN', {
      complements: { locative: { phrase: noNP('HOUSE') } },
    })).de).toBe('kein Kater läuft in einem Haus.'); // now: "in keinem Haus"
    expect(sayAll(clause(noCat, 'RUN', { verbPhrase: { negative: true } })).de)
      .toBe('kein Kater läuft.'); // now: "kein Kater läuft nicht."
  });

  // Regression: a LONE `no` subject is right everywhere, and the five languages that already
  // collapse a negative subject against a second source must keep exactly one negator.
  test('a lone `no` subject, and the five languages already right, are unchanged', () => {
    expect(sayAll(clause(noCat, 'RUN'))).toMatchObject({
      en: 'no cat runs.', de: 'kein Kater läuft.', it: 'nessun gatto corre.',
      fr: 'aucun chat ne court.', ja: 'どの猫も走りません。',
    });
    expect(sayAll(clause(noCat, 'EAT', { directObject: noNP('MOUSE') }))).toMatchObject({
      it: 'nessun gatto mangia nessun topo.',
      fr: 'aucun chat ne mange aucune souris.',
      es: 'ningún gato come ningún ratón.',
      pt: 'nenhum gato come nenhum rato.',
      ja: 'どの猫もどのネズミも食べません。',
    });
    expect(sayAll(clause(noCat, 'RUN', { verbPhrase: { negative: true } }))).toMatchObject({
      it: 'nessun gatto corre.', fr: 'aucun chat ne court.',
      es: 'ningún gato corre.', pt: 'nenhum gato corre.',
    });
  });
});
