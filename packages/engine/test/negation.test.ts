import { describe, expect, test } from 'vitest';
import type { NounPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

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
      de: 'der Kater isst keine Maus.', // "kein" is a single negation — no concord needed
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
        de: 'der Kater aß keine Maus.',
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

// Japanese renders no article and does not weave determiner-borne negation into the verb, so a
// `no` object comes out identical to a plain one — the negation is not expressed. This is the same
// standing limitation pinned for complement determiners (see determiner.test.ts): Japanese has no
// article surface, and quantifier/negator-on-a-noun-phrase is a larger unbuilt feature. Pinned as
// current behaviour, not filed as a per-value bug.
describe('negative direct object: Japanese does not express it', () => {
  test('a `no` object is rendered like a plain object', () => {
    expect(eats(noNP('MOUSE')).ja).toBe('猫はネズミを食べます。');
    // The verb DOES negate when the negation is on the verb phrase itself, rather than the object.
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { negative: true }, directObject: np('MOUSE') })).ja)
      .toBe('猫はネズミを食べません。');
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

  // Regression: English and German DO pluralise a `no` phrase (their negatives have a plural), and
  // French already forces the singular ("aucune souris"); none of them is touched.
  test('English/German pluralise `no`, and French keeps its singular', () => {
    expect(noMice()).toMatchObject({
      en: 'the cat eats no mice.',
      de: 'der Kater isst keine Mäuse.',
      fr: 'le chat ne mange aucune souris.',
    });
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
  // A `no` object already negates the clause. When a SECOND negation source is present — the verb's
  // own `negative`, a `NEVER` adverb, or a `no` subject — the languages that manage a single
  // preverbal negator fail to de-duplicate, and a double negative escapes. The single-`no` cases
  // above are correct, so the concord itself works; it just is not idempotent across sources.

  // The surface each language should settle on is a design call (drop the redundant negator, or
  // switch the object to an "any"-series word), so these are asserted negatively: whatever is
  // chosen, the doubled form is wrong.
  test.fails('a `negative` verb plus a `no` object must not double-negate (en, de)', () => {
    const said = sayAll(clause(np('CAT'), 'EAT', {
      verbPhrase: { negative: true }, directObject: noNP('MOUSE'),
    }));
    expect(said.en).not.toBe('the cat does not eat no mouse.');
    expect(said.de).not.toBe('der Kater isst keine Maus nicht.'); // kein AND nicht
  });

  test.fails('a NEVER adverb plus a `no` object must not stack negators (en, es, pt, de)', () => {
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

  test.fails('a `no` subject must not add a postverbal negator to a `no` object (it, es, pt)', () => {
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
});
