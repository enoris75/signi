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

  test('"nicht" leads a prepositional complement in the declarative', () => {
    expect(notWith('GO', theMarket)).toBe('der Kater geht nicht zum Markt.'); // now: "zum Markt nicht."
    expect(notWith('COME', theHouse('source'))).toBe('der Kater kommt nicht aus dem Haus.');
    expect(notWith('BE', theHouse('locative'))).toBe('der Kater ist nicht im Haus.'); // now ungrammatical
    expect(notWith('RUN', theHouse('locative'))).toBe('der Kater läuft nicht im Haus.');
  });

  test('the command, the modal and the relative clause place it the same way', () => {
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

  // Every complement that takes a preposition, not just the three in the bug's table: the
  // instrumental "mit", the cause "wegen", the manner "mit", the route's spatial preposition, and an
  // INANIMATE terminus, which is a destination rather than a recipient and so takes "in".
  test('"nicht" leads every complement that carries a preposition', () => {
    const the = (concept: string) => np(concept, { definiteness: 'definite' as const });
    expect(notWith('EAT', { instrumental: { phrase: the('WORD') } })).toBe('der Kater frisst nicht mit dem Wort.');
    expect(notWith('CRY', { cause: { phrase: the('DOG') } })).toBe('der Kater weint nicht wegen des Hundes.');
    expect(notWith('RUN', { manner: { phrase: the('SPEED') } })).toBe('der Kater läuft nicht mit der Geschwindigkeit.');
    expect(notWith('GO', { route: { phrase: the('MARKET') } })).toBe('der Kater geht nicht durch den Markt.');
    expect(say(clause(np('MAN'), 'GIVE', {
      verbPhrase: { negative: true }, directObject: the('BOOK'), complements: { terminus: { phrase: the('HOUSE') } },
    }), 'de')).toBe('der Mann gibt das Buch nicht ins Haus.');
  });

  // The slot is between the objects and the complements, so both sides keep their order around it:
  // the accusative object and the bare-dative recipient stay in front of "nicht", the PP behind. With
  // TWO complements of which only one is a PP, "nicht" leads the group.
  test('"nicht" sits between the objects and the prepositional complement', () => {
    const the = (concept: string) => np(concept, { definiteness: 'definite' as const });
    expect(say(clause(np('CAT'), 'EAT', {
      verbPhrase: { negative: true }, directObject: the('MOUSE'), complements: theHouse('locative'),
    }), 'de')).toBe('der Kater frisst die Maus nicht im Haus.');
    expect(say(clause(np('MAN'), 'GIVE', {
      verbPhrase: { negative: true }, directObject: the('BOOK'),
      complements: { terminus: { phrase: the('DOG') }, locative: { phrase: the('HOUSE') } },
    }), 'de')).toBe('der Mann gibt dem Hund das Buch nicht im Haus.');
    expect(say(clause(np('CAT'), 'GO', {
      verbPhrase: { negative: true }, complements: { terminus: { phrase: the('DOG') }, ...theMarket },
    }), 'de')).toBe('der Kater geht dem Hund nicht zum Markt.');
  });

  // The two complements that are NOT prepositional phrases, and so do not pull "nicht" forward: a
  // `process` instrumental is a means clause in the Nachfeld, behind the verb entirely, and a
  // Mittelfeld adverb still outranks the complement slot ("geht nicht schnell zum Markt").
  test('a means clause and an adverb leave the slot alone', () => {
    expect(say(clause(np('CAT'), 'EAT', {
      verbPhrase: { negative: true },
      complements: { instrumental: {
        phrase: np('WORD', { definiteness: 'indefinite' }),
        specifiers: [{ kind: 'abstraction', value: 'process' }], action: { verb: 'CHOOSE' },
      } },
    }), 'de')).toBe('der Kater frisst nicht, indem er ein Wort wählt.');
    expect(say(clause(np('CAT'), 'GO', {
      verbPhrase: { negative: true, modifier: 'FAST' }, complements: theMarket,
    }), 'de')).toBe('der Kater geht nicht schnell zum Markt.');
  });

  // The other two clause orders `finiteNegation` serves: the instruction register's clause-final
  // infinitive, and the verb-final "wenn" protasis.
  test('the instruction and the verb-final protasis place it the same way', () => {
    expect(say({
      subject: np('SECOND_PERSON'), verbPhrase: { verb: 'GO', negative: true },
      imperative: true, imperativeRegister: 'instruction', complements: theMarket,
    }, 'de')).toBe('nicht zum Markt gehen.');
    expect(say({
      ...clause(np('DOG'), 'RUN'),
      condition: clause(np('CAT'), 'GO', { verbPhrase: { negative: true }, complements: theMarket }),
    }, 'de')).toBe('wenn der Kater nicht zum Markt gehen würde, würde der Hund laufen.');
  });
});

// A160. A `no` SUBJECT already negates the clause, so a second negation source after it — a `no`
// object, a `no` complement, or the verb's own `negative` — doubles the negative in the two
// languages without negative concord. This is the corner A35 left: it fixed the `no`-subject case
// for Italian/Spanish/Portuguese and the object-side collapse for English/German, and recorded the
// English/German subject double as unpinned. It is the subject-side twin of A158.
describe('known bugs: a negative subject is not collapsed', () => {
  const noCat = noNP('CAT');

  test('English switches the second negative to the "any" NPI, or drops "not"', () => {
    expect(sayAll(clause(noCat, 'EAT', { directObject: noNP('MOUSE') })).en)
      .toBe('no cat eats any mouse.'); // now: "no cat eats no mouse."
    expect(sayAll(clause(noCat, 'RUN', {
      complements: { locative: { phrase: noNP('HOUSE') } },
    })).en).toBe('no cat runs in any house.'); // now: "in no house"
    expect(sayAll(clause(noCat, 'RUN', { verbPhrase: { negative: true } })).en)
      .toBe('no cat runs.'); // now: "no cat does not run."
  });

  test('German falls to a plain indefinite, or drops "nicht"', () => {
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

  // The subject outranks every other source at once, not one at a time.
  test('a negative subject takes the object AND the complement with it', () => {
    expect(sayAll(clause(noCat, 'EAT', {
      verbPhrase: { negative: true },
      directObject: noNP('MOUSE'), complements: { locative: { phrase: noNP('HOUSE') } },
    }))).toMatchObject({
      en: 'no cat eats any mouse in any house.',
      de: 'kein Kater frisst eine Maus in einem Haus.',
    });
  });

  // Suppressing the finite "not" is a branch per verb shape, so each one has to drop it: the
  // do-support past, the periphrastic future and progressive, a modal, and the copula.
  test('every finite shape drops its "not" under a negative subject', () => {
    const notRun = (verbPhrase: Partial<VerbPhrase>) =>
      sayAll(clause(noCat, 'RUN', { verbPhrase: { negative: true, ...verbPhrase } }));
    expect(notRun({ tense: 'past' })).toMatchObject({ en: 'no cat ran.', de: 'kein Kater lief.' });
    expect(notRun({ tense: 'future' })).toMatchObject({ en: 'no cat will run.', de: 'kein Kater wird laufen.' });
    expect(notRun({ aspect: 'progressive' })).toMatchObject({ en: 'no cat is running.', de: 'kein Kater läuft gerade.' });
    expect(notRun({ modals: ['CAN'] })).toMatchObject({ en: 'no cat can run.', de: 'kein Kater kann laufen.' });
    expect(sayAll(clause(noCat, 'BE', {
      verbPhrase: { negative: true }, complements: { predicative: { phrase: np('TIRED') } },
    }))).toMatchObject({ en: 'no cat is tired.', de: 'kein Kater ist müde.' });
  });

  // The head of a RELATIVE clause stands in for its subject, but a `no` head negates the MATRIX
  // clause, not the relative one — so the relative clause keeps its own negation. English and German
  // are right here today and must stay right: the collapse reads only the clause's own subject.
  test('a `no` head does not disarm the negation inside its relative clause', () => {
    expect(sayAll(clause(np('CAT', {
      definiteness: 'no', relative: { verbPhrase: { verb: 'EAT', negative: true } },
    }), 'RUN'))).toMatchObject({
      en: 'no cat that does not eat runs.',
      de: 'kein Kater, der nicht frisst, läuft.',
    });
    expect(sayAll(clause(np('CAT', {
      definiteness: 'no', relative: { verbPhrase: { verb: 'EAT' }, directObject: noNP('MOUSE') },
    }), 'RUN'))).toMatchObject({
      en: 'no cat that eats no mouse runs.',
      de: 'kein Kater, der keine Maus frisst, läuft.',
    });
  });
});

// A166. A160's collapse leaves relative clauses out because a `no` HEAD negates the matrix clause —
// but that covers only a SUBJECT relative. A relative on the object or a complement carries its own
// subject, and that subject's `no` belongs to the relative clause, where English and German now
// double the negative: "the mouse that no cat does not eat", "die Maus, die kein Kater nicht frisst".
describe('known bugs: a relative clause\'s own negative subject is not collapsed', () => {
  const mouseThatNoCat = (rel: { verbPhrase: Partial<VerbPhrase> & { verb: string }, complements?: Record<string, unknown> }) =>
    sayAll(clause(np('MOUSE', { relative: { headRole: 'directObject', subject: noNP('CAT'), ...rel } }), 'RUN'));
  const houseWhereNoCat = (verbPhrase: Partial<VerbPhrase> & { verb: string }) =>
    sayAll(clause(np('DOG'), 'SEE', { directObject: np('HOUSE', { relative: { headRole: 'locative', subject: noNP('CAT'), verbPhrase } }) }));

  test('English and German drop the relative verb\'s "not" under its own `no` subject', () => {
    expect(mouseThatNoCat({ verbPhrase: { verb: 'EAT', negative: true } })).toMatchObject({
      en: 'the mouse that no cat eats runs.', // now: "that no cat does not eat"
      de: 'die Maus, die kein Kater frisst, läuft.', // now: "kein Kater nicht frisst"
    });
    expect(houseWhereNoCat({ verb: 'RUN', negative: true })).toMatchObject({
      en: 'the dog sees the house where no cat runs.',
      de: 'der Hund sieht das Haus, in dem kein Kater läuft.',
    });
  });

  test('…and switch a second `no` phrase to "any" / the plain indefinite', () => {
    expect(mouseThatNoCat({ verbPhrase: { verb: 'EAT' }, complements: { locative: { phrase: noNP('HOUSE') } } })).toMatchObject({
      en: 'the mouse that no cat eats in any house runs.', // now: "in no house"
      de: 'die Maus, die kein Kater in einem Haus frisst, läuft.', // now: "in keinem Haus"
    });
  });

  // Suppressing the relative's finite "not" is the same branch per verb shape as in the main clause,
  // and a plural `no` subject counts as much as a singular one.
  test('every finite shape in the relative drops its "not", and a plural `no` subject counts', () => {
    const notEat = (verbPhrase: Partial<VerbPhrase>) =>
      mouseThatNoCat({ verbPhrase: { verb: 'EAT', negative: true, ...verbPhrase } });
    expect(notEat({ tense: 'past' })).toMatchObject({
      en: 'the mouse that no cat ate runs.', de: 'die Maus, die kein Kater fraß, läuft.',
    });
    expect(notEat({ modals: ['CAN'] })).toMatchObject({
      en: 'the mouse that no cat can eat runs.', de: 'die Maus, die kein Kater fressen kann, läuft.',
    });
    expect(notEat({ aspect: 'progressive' })).toMatchObject({
      en: 'the mouse that no cat is eating runs.', de: 'die Maus, die kein Kater gerade frisst, läuft.',
    });
    expect(sayAll(clause(np('MOUSE', {
      relative: { headRole: 'directObject', subject: noNP('CAT', { number: 'plural' }), verbPhrase: { verb: 'EAT', negative: true } },
    }), 'RUN'))).toMatchObject({
      en: 'the mouse that no cats eat runs.', de: 'die Maus, die keine Kater fressen, läuft.',
    });
  });

  // A relative on a complement keeps its own direct object, which falls to "any" / the plain indefinite
  // under the relative's `no` subject, as in the main clause.
  test('a locative relative\'s own `no` subject takes a `no` object with it', () => {
    expect(sayAll(clause(np('DOG'), 'SEE', { directObject: np('HOUSE', { relative: {
      headRole: 'locative', subject: noNP('CAT'), verbPhrase: { verb: 'EAT' }, directObject: noNP('MOUSE'),
    } }) }))).toMatchObject({
      en: 'the dog sees the house where no cat eats any mouse.',
      de: 'der Hund sieht das Haus, in dem kein Kater eine Maus frisst.',
    });
  });

  // A genitive relative's possessed phrase gives its determiner up to "whose" / "dessen", so its `no`
  // never reaches the surface and cannot stand in for the relative's own negation.
  test('a genitive relative keeps its "not": the possessed phrase\'s `no` is gone', () => {
    expect(sayAll(clause(np('DOG'), 'SEE', { directObject: np('BOY', { relative: {
      headRole: 'possessor', subject: noNP('CAT'), verbPhrase: { verb: 'EAT', negative: true },
    } }) }))).toMatchObject({
      en: 'the dog sees the boy whose cat does not eat.',
      de: 'der Hund sieht den Jungen, dessen Kater nicht frisst.',
    });
  });

  // Regression: the five concord languages already collapse here, a lone `no` subject is right, and
  // a negated relative under a positive subject keeps its "not".
  test('the concord languages, a lone `no` subject and a positive subject are unchanged', () => {
    expect(mouseThatNoCat({ verbPhrase: { verb: 'EAT', negative: true } })).toMatchObject({
      it: 'il topo che nessun gatto mangia corre.',
      fr: "la souris qu'aucun chat ne mange court.",
      es: 'el ratón que ningún gato come corre.',
      pt: 'o rato que nenhum gato come corre.',
    });
    expect(mouseThatNoCat({ verbPhrase: { verb: 'EAT' } })).toMatchObject({
      en: 'the mouse that no cat eats runs.', de: 'die Maus, die kein Kater frisst, läuft.',
    });
    expect(sayAll(clause(np('MOUSE', {
      relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'EAT', negative: true } },
    }), 'RUN'))).toMatchObject({
      en: 'the mouse that the cat does not eat runs.', de: 'die Maus, die der Kater nicht frisst, läuft.',
    });
  });
});

// A167. A `no` head negates the MATRIX clause, not its relative clause — A160 pinned that for English
// and German above. The Romance engines read "does the subject already negate?" off the forms they
// are handed, and a subject relative is handed the head's, `no` included. Italian, Spanish and
// Portuguese so drop the relative's own "non" / "no" / "não" (a negated relative reads as a positive
// one); French takes the head's "aucun" as self-negating and prints a lone "ne" either way. With A170
// in too, the Spanish and Portuguese relatives here are in the subjunctive: "ningún gato que no coma".
describe('known bugs: a negative head erases its relative clause\'s polarity', () => {
  const noCatThat = (verbPhrase: Partial<VerbPhrase>, extra: { directObject?: NounPhrase } = {}) =>
    sayAll(clause(noNP('CAT', { relative: { verbPhrase: { verb: 'EAT', ...verbPhrase }, ...extra } }), 'RUN'));
  const dogSeesNoCatThat = (verbPhrase: Partial<VerbPhrase>) =>
    sayAll(clause(np('DOG'), 'SEE', { directObject: noNP('CAT', { relative: { verbPhrase: { verb: 'EAT', ...verbPhrase } } }) }));

  test('the relative clause keeps its own negator (it, es, pt)', () => {
    expect(noCatThat({ negative: true })).toMatchObject({
      it: 'nessun gatto che non mangia corre.', // now: "che mangia" — the positive
      es: 'ningún gato que no coma corre.',
      pt: 'nenhum gato que não coma corre.',
    });
    // A postverbal n-word or "mai" inside the relative needs the preverbal negator the concord obliges.
    expect(noCatThat({}, { directObject: noNP('MOUSE') })).toMatchObject({
      it: 'nessun gatto che non mangia nessun topo corre.',
      es: 'ningún gato que no coma ningún ratón corre.',
      pt: 'nenhum gato que não coma nenhum rato corre.',
    });
    expect(noCatThat({ modifier: 'NEVER' }).it).toBe('nessun gatto che non mangia mai corre.');
    // The head's position does not matter; its `no` does.
    expect(dogSeesNoCatThat({ negative: true })).toMatchObject({
      it: 'il cane non vede nessun gatto che non mangia.',
      es: 'el perro no ve ningún gato que no coma.',
      pt: 'o cão não vê nenhum gato que não coma.',
    });
  });

  test('French keeps a positive relative positive and a negative one "ne … pas"', () => {
    expect(noCatThat({}).fr).toBe('aucun chat qui mange ne court.'); // now: "qui ne mange"
    expect(noCatThat({ negative: true }).fr).toBe('aucun chat qui ne mange pas ne court.'); // now: "qui ne mange"
    expect(dogSeesNoCatThat({ negative: true }).fr).toBe('le chien ne voit aucun chat qui ne mange pas.');
    expect(dogSeesNoCatThat({}).fr).toBe('le chien ne voit aucun chat qui mange.');
  });

  // Keeping the negator is one flag per clause, not per verb shape, but each shape builds its finite
  // group apart: the past, a modal, the progressive's auxiliary and the copula. Spanish and Portuguese
  // put each in the subjunctive under the `no` head (A170): the imperfect in the past, else the present.
  test('every finite shape in the relative keeps its negator under a `no` head', () => {
    expect(noCatThat({ negative: true, tense: 'past' })).toMatchObject({
      it: 'nessun gatto che non mangiò corre.', fr: 'aucun chat qui ne mangea pas ne court.',
      es: 'ningún gato que no comiera corre.', pt: 'nenhum gato que não comesse corre.',
    });
    expect(noCatThat({ negative: true, modals: ['CAN'] })).toMatchObject({
      it: 'nessun gatto che non può mangiare corre.', fr: 'aucun chat qui ne peut pas manger ne court.',
      es: 'ningún gato que no pueda comer corre.', pt: 'nenhum gato que não possa comer corre.',
    });
    expect(noCatThat({ negative: true, aspect: 'progressive' })).toMatchObject({
      it: 'nessun gatto che non sta mangiando corre.', fr: "aucun chat qui n'est pas en train de manger ne court.",
      es: 'ningún gato que no esté comiendo corre.', pt: 'nenhum gato que não esteja comendo corre.',
    });
    expect(sayAll(clause(noNP('CAT', {
      relative: { verbPhrase: { verb: 'BE', negative: true }, complements: { predicative: { phrase: np('TIRED') } } },
    }), 'RUN'))).toMatchObject({
      it: 'nessun gatto che non è stanco corre.', fr: "aucun chat qui n'est pas fatigué ne court.",
      es: 'ningún gato que no esté cansado corre.', pt: 'nenhum gato que não esteja cansado corre.',
    });
  });

  // A postverbal `no` complement inside the relative obliges the preverbal negator, as a `no` object does.
  test('a `no` complement inside the relative takes the negator the concord obliges', () => {
    expect(sayAll(clause(noNP('CAT', {
      relative: { verbPhrase: { verb: 'RUN' }, complements: { locative: { phrase: noNP('HOUSE') } } },
    }), 'EAT'))).toMatchObject({
      it: 'nessun gatto che non corre in nessuna casa mangia.',
      fr: 'aucun chat qui ne court dans aucune maison ne mange.',
      es: 'ningún gato que no corra en ninguna casa come.',
      pt: 'nenhum gato que não corra em nenhuma casa come.',
    });
  });

  // Only the relative's OWN subject decides. Under a `no` head, a definite subject leaves the relative
  // its "non" / "ne … pas", and a `no` one carries the negation itself.
  test('under a `no` head, the relative\'s own subject still decides', () => {
    const noMouseThat = (subject: NounPhrase) => sayAll(clause(noNP('MOUSE', {
      relative: { headRole: 'directObject', subject, verbPhrase: { verb: 'EAT', negative: true } },
    }), 'RUN'));
    expect(noMouseThat(np('CAT'))).toMatchObject({
      it: 'nessun topo che il gatto non mangia corre.',
      fr: 'aucune souris que le chat ne mange pas ne court.',
      es: 'ningún ratón que el gato no coma corre.',
      pt: 'nenhum rato que o gato não coma corre.',
    });
    expect(noMouseThat(noNP('CAT'))).toMatchObject({
      it: 'nessun topo che nessun gatto mangia corre.',
      fr: "aucune souris qu'aucun chat ne mange ne court.",
      es: 'ningún ratón que ningún gato coma corre.',
      pt: 'nenhum rato que nenhum gato coma corre.',
    });
  });

  // A genitive relative's possessed phrase gives its determiner up to "il cui" / "dont le" / "cuyo" /
  // "cujo", so its `no` never reaches the surface and cannot stand in for the relative's polarity. This
  // was the same defect on the genitive branch: "il cui gatto mangia" for a negated relative, and a
  // French positive relative read "dont le chat ne mange".
  test('a genitive relative keeps its polarity: the possessed phrase\'s `no` is gone', () => {
    const boyWhoseNoCat = (verbPhrase: Partial<VerbPhrase>) => sayAll(clause(np('DOG'), 'SEE', {
      directObject: np('BOY', { relative: { headRole: 'possessor', subject: noNP('CAT'), verbPhrase: { verb: 'EAT', ...verbPhrase } } }),
    }));
    expect(boyWhoseNoCat({ negative: true })).toMatchObject({
      it: 'il cane vede il ragazzo il cui gatto non mangia.',
      fr: 'le chien voit le garçon dont le chat ne mange pas.',
      es: 'el perro ve al niño cuyo gato no come.',
      pt: 'o cão vê o menino cujo gato não come.',
    });
    expect(boyWhoseNoCat({})).toMatchObject({
      it: 'il cane vede il ragazzo il cui gatto mangia.',
      fr: 'le chien voit le garçon dont le chat mange.',
      es: 'el perro ve al niño cuyo gato come.',
      pt: 'o cão vê o menino cujo gato come.',
    });
  });

  // Regression: a positive relative in the three that only drop, the preverbal "nunca" and French
  // "jamais" / "aucun" that carry the relative's negation themselves, and a head that is not `no`.
  // (Spanish and Portuguese are left out of the `no`-head lines: their relative there takes the
  // subjunctive, A170, which pins it.)
  test('a positive relative, a self-negating word inside it, and a definite head are unchanged', () => {
    expect(noCatThat({}).it).toBe('nessun gatto che mangia corre.');
    expect(noCatThat({ modifier: 'NEVER' }).fr).toBe('aucun chat qui ne mange jamais ne court.');
    expect(noCatThat({}, { directObject: noNP('MOUSE') }).fr).toBe('aucun chat qui ne mange aucune souris ne court.');
    expect(sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT', negative: true } } }), 'RUN'))).toMatchObject({
      it: 'il gatto che non mangia corre.', fr: 'le chat qui ne mange pas court.',
      es: 'el gato que no come corre.', pt: 'o gato que não come corre.',
    });
  });
});

// A170. A relative clause whose antecedent is negated asserts nothing about a real referent, so
// Spanish and Portuguese put its verb in the subjunctive: "ningún gato que coma", "nenhum gato que
// coma" (the imperfect subjunctive in the past). The engine renders every relative in the indicative.
// The negated relative is A167's and is left out here: with both fixed it reads "que no coma".
describe('known bugs: a relative under a negative head keeps the indicative', () => {
  const noCatThat = (verbPhrase: Partial<VerbPhrase>) =>
    sayAll(clause(noNP('CAT', { relative: { verbPhrase: { verb: 'EAT', ...verbPhrase } } }), 'RUN'));

  test('Spanish and Portuguese take the subjunctive in a relative on a `no` head', () => {
    expect(noCatThat({})).toMatchObject({
      es: 'ningún gato que coma corre.', // now: "que come"
      pt: 'nenhum gato que coma corre.',
    });
    expect(noCatThat({ tense: 'past' })).toMatchObject({
      es: 'ningún gato que comiera corre.', // now: "que comió"
      pt: 'nenhum gato que comesse corre.',
    });
    expect(noCatThat({ modifier: 'NEVER' })).toMatchObject({
      es: 'ningún gato que nunca coma corre.',
      pt: 'nenhum gato que nunca coma corre.',
    });
    expect(sayAll(clause(noNP('CAT', {
      relative: { verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np('TIRED') } } },
    }), 'RUN'))).toMatchObject({
      es: 'ningún gato que esté cansado corre.',
      pt: 'nenhum gato que esteja cansado corre.',
    });
  });

  test('…whether the gap is the relative\'s object and whether the head is the matrix object', () => {
    expect(sayAll(clause(noNP('MOUSE', {
      relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'EAT' } },
    }), 'RUN'))).toMatchObject({
      es: 'ningún ratón que el gato coma corre.',
      pt: 'nenhum rato que o gato coma corre.',
    });
    expect(sayAll(clause(np('DOG'), 'SEE', {
      directObject: noNP('CAT', { relative: { verbPhrase: { verb: 'RUN' } } }),
    }))).toMatchObject({
      es: 'el perro no ve ningún gato que corra.',
      pt: 'o cão não vê nenhum gato que corra.',
    });
  });

  // Every finite shape takes the mood: the future as the present subjunctive (Spanish; Portuguese
  // renders the same, though some registers use its future subjunctive "que comer"), and the aspect
  // auxiliaries and a modal as the finite verb, present or imperfect by the relative's tense.
  test('the future, the aspect auxiliaries and a modal take the subjunctive too', () => {
    expect(noCatThat({ tense: 'future' }).es).toBe('ningún gato que coma corre.');
    expect(noCatThat({ aspect: 'progressive' })).toMatchObject({
      es: 'ningún gato que esté comiendo corre.', pt: 'nenhum gato que esteja comendo corre.',
    });
    expect(noCatThat({ aspect: 'resultative' })).toMatchObject({
      es: 'ningún gato que haya comido corre.', pt: 'nenhum gato que tenha comido corre.',
    });
    expect(noCatThat({ aspect: 'progressive', tense: 'past' })).toMatchObject({
      es: 'ningún gato que estuviera comiendo corre.', pt: 'nenhum gato que estivesse comendo corre.',
    });
    expect(noCatThat({ aspect: 'resultative', tense: 'past' })).toMatchObject({
      es: 'ningún gato que hubiera comido corre.', pt: 'nenhum gato que tivesse comido corre.',
    });
    expect(noCatThat({ modals: ['CAN'] })).toMatchObject({
      es: 'ningún gato que pueda comer corre.', pt: 'nenhum gato que possa comer corre.',
    });
    expect(noCatThat({ modals: ['WILL'] })).toMatchObject({
      es: 'ningún gato que quiera comer corre.', pt: 'nenhum gato que queira comer corre.',
    });
  });

  // The present subjunctive's own irregular stems, which the 1sg present cannot give: ser, estar, ir,
  // dar. A reflexive verb takes its clitic ahead of the plain verb's form.
  test('the irregular and reflexive verbs take their own subjunctive', () => {
    const noCatThatVerb = (verb: string, extra: Record<string, unknown> = {}) =>
      sayAll(clause(noNP('CAT', { relative: { verbPhrase: { verb }, ...extra } }), 'RUN'));
    expect(noCatThatVerb('BE', { complements: { predicative: { phrase: np('STRONG') } } })).toMatchObject({
      es: 'ningún gato que sea fuerte corre.', pt: 'nenhum gato que seja forte corre.',
    });
    expect(noCatThatVerb('BE', { complements: { locative: { phrase: np('HOUSE') } } })).toMatchObject({
      es: 'ningún gato que esté en la casa corre.', pt: 'nenhum gato que esteja na casa corre.',
    });
    expect(noCatThatVerb('GO')).toMatchObject({ es: 'ningún gato que vaya corre.', pt: 'nenhum gato que vá corre.' });
    expect(noCatThatVerb('GIVE', { directObject: np('BOOK') })).toMatchObject({
      es: 'ningún gato que dé el libro corre.', pt: 'nenhum gato que dê o livro corre.',
    });
    expect(noCatThatVerb('MOVE_ONESELF')).toMatchObject({
      es: 'ningún gato que se mueva corre.', pt: 'nenhum gato que se mova corre.',
    });
  });

  // The genitive relative and the plain locative gap hang off the head too, and take the same mood.
  test('a genitive relative and a locative gap on a `no` head take it too', () => {
    expect(sayAll(clause(noNP('BOY', {
      relative: { headRole: 'possessor', subject: np('CAT'), verbPhrase: { verb: 'EAT' } },
    }), 'RUN'))).toMatchObject({
      es: 'ningún niño cuyo gato coma corre.', pt: 'nenhum menino cujo gato coma corre.',
    });
    expect(sayAll(clause(np('DOG'), 'SEE', {
      directObject: noNP('HOUSE', { relative: { headRole: 'locative', subject: np('CAT'), verbPhrase: { verb: 'EAT' } } }),
    }))).toMatchObject({
      es: 'el perro no ve ninguna casa donde el gato coma.', pt: 'o cão não vê nenhuma casa onde o gato coma.',
    });
  });

  // Regression: a head that is not `no` keeps the indicative, and so does the main clause.
  test('a definite or quantified head and the main clause keep the indicative', () => {
    expect(sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT' } } }), 'RUN'))).toMatchObject({
      es: 'el gato que come corre.', pt: 'o gato que come corre.',
    });
    expect(sayAll(clause(np('CAT', {
      number: 'plural', definiteness: 'few', relative: { verbPhrase: { verb: 'EAT' } },
    }), 'RUN'))).toMatchObject({ es: 'pocos gatos que comen corren.', pt: 'poucos gatos que comem correm.' });
    expect(sayAll(clause(noNP('CAT'), 'EAT'))).toMatchObject({ es: 'ningún gato come.', pt: 'nenhum gato come.' });
    // Italian and French are out of scope: the indicative is widely accepted there (see A170).
    expect(sayAll(clause(noNP('CAT', { relative: { verbPhrase: { verb: 'EAT' } } }), 'RUN'))).toMatchObject({
      it: 'nessun gatto che mangia corre.', fr: 'aucun chat qui mange ne court.',
    });
  });
});

// A171. An infinitive complement or a clause of purpose is resolved with its controller as its
// subject, `no` included, and five engines read that `no` as the embedded clause's own negative
// subject. But a `no` controller negates the MATRIX clause only: "no cat desires not to eat" has two
// negations. English, German and Italian drop the infinitive's own "not", French prints a lone "ne"
// whatever the infinitive's polarity, and Japanese negates a positive infinitive.
describe('known bugs: a negative controller negates its infinitive', () => {
  const noCat = () => noNP('CAT');
  const desires = (negative: boolean, extra: object = {}) =>
    sayAll(clause(noCat(), 'DESIRE', { infinitiveComplement: { verbPhrase: { verb: 'EAT', negative }, ...extra } }));
  const runs = (negative: boolean) =>
    sayAll(clause(noCat(), 'RUN', { purpose: { verbPhrase: { verb: 'EAT', negative } } }));

  test('a negated infinitive complement under a `no` subject keeps its own negation', () => {
    expect(desires(true)).toMatchObject({
      en: 'no cat desires not to eat.', // now: "no cat desires to eat."
      it: 'nessun gatto desidera non mangiare.', // now: "desidera mangiare"
      fr: 'aucun chat ne désire ne pas manger.', // now: "ne désire ne manger"
      de: 'kein Kater wünscht, nicht zu fressen.', // now: "wünscht, zu fressen"
    });
    expect(runs(true)).toMatchObject({
      en: 'no cat runs not to eat.',
      it: 'nessun gatto corre per non mangiare.',
      fr: 'aucun chat ne court pour ne pas manger.',
      de: 'kein Kater läuft, um nicht zu fressen.',
    });
  });

  test('a positive infinitive under a `no` subject stays positive (fr, ja)', () => {
    expect(desires(false)).toMatchObject({
      fr: 'aucun chat ne désire manger.', // now: "ne désire ne manger"
      ja: 'どの猫も食べることを望んでいません。', // now: 食べないこと
    });
    expect(runs(false)).toMatchObject({
      fr: 'aucun chat ne court pour manger.',
      ja: 'どの猫も食べるために走りません。',
    });
    expect(desires(false, { directObject: np('MOUSE') })).toMatchObject({
      fr: 'aucun chat ne désire manger la souris.',
      ja: 'どの猫もネズミを食べることを望んでいません。',
    });
  });

  // Regression: what is already right. Spanish and Portuguese keep the infinitive's own polarity;
  // under a definite controller every language does; and the matrix clause keeps its `no`.
  test('Spanish and Portuguese, and every definite controller, are already right', () => {
    expect(desires(true)).toMatchObject({ es: 'ningún gato desea no comer.', pt: 'nenhum gato deseja não comer.' });
    expect(desires(false)).toMatchObject({
      en: 'no cat desires to eat.', it: 'nessun gatto desidera mangiare.', de: 'kein Kater wünscht, zu fressen.',
      es: 'ningún gato desea comer.', pt: 'nenhum gato deseja comer.',
    });
    expect(runs(true)).toMatchObject({ es: 'ningún gato corre para no comer.', pt: 'nenhum gato corre para não comer.' });
    expect(desires(true).ja).toBe('どの猫も食べないことを望んでいません。');
    expect(sayAll(clause(np('CAT'), 'DESIRE', { infinitiveComplement: { verbPhrase: { verb: 'EAT', negative: true } } })))
      .toMatchObject({
        en: 'the cat desires not to eat.', it: 'il gatto desidera non mangiare.',
        fr: 'le chat désire ne pas manger.', de: 'der Kater wünscht, nicht zu fressen.',
        ja: '猫は食べないことを望んでいます。',
      });
    expect(sayAll(clause(np('CAT'), 'RUN', { purpose: { verbPhrase: { verb: 'EAT' } } })))
      .toMatchObject({ fr: 'le chat court pour manger.', ja: '猫は食べるために走ります。' });
  });

  // Object control takes its subject by the same path. A `no` causee negates the causing clause, as a
  // `no` object always does, and the clause it controls keeps its own polarity. Japanese speaks the
  // causee inside that clause (どの犬も), but its negation is still the causing predicate's (しません).
  test('a `no` causee negates the causing clause, and the clause it controls keeps its own polarity', () => {
    const causes = (object: NounPhrase, negative: boolean, subject = np('CAT')) => sayAll(clause(subject, 'CAUSE_VERB', {
      directObject: object, infinitiveComplement: { verbPhrase: { verb: 'EAT', negative }, control: 'object' },
    }));
    expect(causes(noNP('DOG'), false)).toEqual({
      en: 'the cat causes no dog to eat.',
      it: 'il gatto non induce nessun cane a mangiare.',
      fr: "le chat n'induit aucun chien à manger.", // was "à ne manger"
      de: 'der Kater veranlasst keinen Hund, zu fressen.',
      es: 'el gato no induce ningún perro a comer.',
      ja: '猫はどの犬も食べるようにしません。', // was 食べないようにします: "makes no dog eat"
      pt: 'o gato não induz nenhum cão a comer.',
    });
    expect(causes(noNP('DOG'), true)).toEqual({
      en: 'the cat causes no dog not to eat.', // was "causes no dog to eat"
      it: 'il gatto non induce nessun cane a non mangiare.', // was "a mangiare"
      fr: "le chat n'induit aucun chien à ne pas manger.", // was "à ne manger"
      de: 'der Kater veranlasst keinen Hund, nicht zu fressen.', // was ", zu fressen"
      es: 'el gato no induce ningún perro a no comer.',
      ja: '猫はどの犬も食べないようにしません。', // was 食べないようにします
      pt: 'o gato não induz nenhum cão a não comer.',
    });
    // Regression: a `no` subject over a definite causee was already right, in both polarities.
    expect(causes(np('DOG'), true, noCat())).toEqual({
      en: 'no cat causes the dog not to eat.',
      it: 'nessun gatto induce il cane a non mangiare.',
      fr: "aucun chat n'induit le chien à ne pas manger.",
      de: 'kein Kater veranlasst den Hund, nicht zu fressen.',
      es: 'ningún gato induce el perro a no comer.',
      ja: 'どの猫も犬が食べないようにしません。',
      pt: 'nenhum gato induz o cão a não comer.',
    });
    expect(causes(np('DOG'), false, noCat())).toMatchObject({
      fr: "aucun chat n'induit le chien à manger.", ja: 'どの猫も犬が食べるようにしません。',
    });
  });

  // The controller's `no` stays out of everything the embedded clause holds: an infinitive it governs in
  // turn, a predicate adjective that still agrees with the controller, its own object, and every
  // conjunct of a coordinated controller.
  test('the `no` stays out of a nested infinitive, an agreeing adjective, an object and a coordinated controller', () => {
    expect(sayAll(clause(noCat(), 'DESIRE', {
      infinitiveComplement: {
        verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np('ABLE') } },
        infinitiveComplement: { verbPhrase: { verb: 'EAT', negative: true } },
      },
    }))).toEqual({
      en: 'no cat desires to be able not to eat.',
      it: 'nessun gatto desidera essere capace di non mangiare.',
      fr: 'aucun chat ne désire être capable de ne pas manger.',
      de: 'kein Kater wünscht, fähig zu sein, nicht zu fressen.',
      es: 'ningún gato desea ser capaz de no comer.',
      ja: 'どの猫も食べないことが可能であることを望んでいません。',
      pt: 'nenhum gato deseja ser capaz de não comer.',
    });
    expect(sayAll(clause(noNP('CAT', { gender: 'fem' }), 'DESIRE', {
      infinitiveComplement: { verbPhrase: { verb: 'BE', negative: true }, complements: { predicative: { phrase: np('CAREFUL') } } },
    }))).toEqual({
      en: 'no cat desires not to be careful.',
      it: 'nessuna gatta desidera non essere attenta.',
      fr: 'aucune chatte ne désire ne pas être prudente.',
      de: 'keine Katze wünscht, nicht vorsichtig zu sein.',
      es: 'ninguna gata desea no ser cuidadosa.',
      ja: 'どの猫も慎重ではないことを望んでいません。',
      pt: 'nenhuma gata deseja não ser cuidadosa.',
    });
    expect(sayAll(clause(noCat(), 'RUN', { purpose: { verbPhrase: { verb: 'EAT', negative: true }, directObject: np('MOUSE') } })))
      .toEqual({
        en: 'no cat runs not to eat the mouse.',
        it: 'nessun gatto corre per non mangiare il topo.',
        fr: 'aucun chat ne court pour ne pas manger la souris.',
        de: 'kein Kater läuft, um die Maus nicht zu fressen.',
        es: 'ningún gato corre para no comer el ratón.',
        ja: 'どの猫もネズミを食べないために走りません。',
        pt: 'nenhum gato corre para não comer o rato.',
      });
    expect(sayAll(clause({ conjuncts: [noNP('CAT'), noNP('DOG')], conjunction: 'and' }, 'DESIRE', {
      infinitiveComplement: { verbPhrase: { verb: 'EAT', negative: true } },
    }))).toMatchObject({
      en: 'no cat and no dog desire not to eat.',
      it: 'nessun gatto e nessun cane desiderano non mangiare.',
      fr: 'aucun chat et aucun chien ne désirent ne pas manger.',
      es: 'ningún gato y ningún perro desean no comer.',
      pt: 'nenhum gato e nenhum cão desejam não comer.',
    });
  });
});
