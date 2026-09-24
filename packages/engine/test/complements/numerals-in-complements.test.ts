import { describe, expect, test } from 'vitest';
import type { ComplementType, NounPhrase, PronominalPossessor } from '@signi/shared';
import { clause, np, sayAll } from '../harness.js';

// A cardinal (C31) inside a complement. The subject and the direct object have their own noun-phrase
// renderers, which place it. A complement's phrase is built by each language's complement renderer
// instead, and German, Spanish and Portuguese build it without the numeral: *in the three houses*
// comes out as "in den Häusern", "en las casas", "nas casas" (A291). French keeps the numeral but
// writes the indefinite plural's "de" in front of a bare one: "avec de trois chiens" (A292).

const my: PronominalPossessor = { kind: 'pronominal', person: '1', number: 'singular' };
const verbFor: Partial<Record<ComplementType, string>> = {
  comitative: 'PLAY_GAME', opponent: 'PLAY_GAME', instrumental: 'CUT', source: 'COME',
};
const inComplement = (type: ComplementType, phrase: NounPhrase, extra: object = {}) =>
  sayAll(clause(np('CAT'), verbFor[type] ?? 'RUN', { complements: { [type]: { phrase, ...extra } } }));
const houses = (extra: Partial<NounPhrase> = {}) => np('HOUSE', { numeral: 3, ...extra });
const dogs = (extra: Partial<NounPhrase> = {}) => np('DOG', { numeral: 3, ...extra });
const bare = { definiteness: 'bare' } as const;
const under = { specifiers: [{ kind: 'path', value: 'under' }] };

// A291. The de/es/pt complement renderers assemble determiner + possessive + adjective + noun and
// never read `forms['numeral']`, which their `nounPhrase` does. The phrase keeps its plural, so it
// reads as *the houses*: the count is lost, and a bare one can no longer be told from a bare plural.
describe('known bugs: german, spanish and portuguese drop the numeral inside a complement (A291)', () => {
  test('a definite place', () => {
    expect(inComplement('locative', houses())).toMatchObject({
      de: 'der Kater läuft in den drei Häusern.', es: 'el gato corre en las tres casas.', pt: 'o gato corre nas três casas.',
    });
  });

  test('a bare place', () => {
    expect(inComplement('locative', houses(bare))).toMatchObject({
      de: 'der Kater läuft in drei Häusern.', es: 'el gato corre en tres casas.', pt: 'o gato corre em três casas.',
    });
  });

  test('a demonstrative place', () => {
    expect(inComplement('locative', houses({ definiteness: 'this' }))).toMatchObject({
      de: 'der Kater läuft in diesen drei Häusern.', es: 'el gato corre en estas tres casas.', pt: 'o gato corre nestas três casas.',
    });
  });

  test('a definite companion', () => {
    expect(inComplement('comitative', dogs())).toMatchObject({
      de: 'der Kater spielt mit den drei Hunden.', es: 'el gato juega con los tres perros.', pt: 'o gato joga com os três cães.',
    });
  });

  test('a bare companion', () => {
    expect(inComplement('comitative', dogs(bare))).toMatchObject({
      de: 'der Kater spielt mit drei Hunden.', es: 'el gato juega con tres perros.', pt: 'o gato joga com três cães.',
    });
  });

  test('a companion with a possessive', () => {
    expect(inComplement('comitative', dogs({ possessor: my }))).toMatchObject({
      de: 'der Kater spielt mit meinen drei Hunden.', es: 'el gato juega con mis tres perros.', pt: 'o gato joga com os meus três cães.',
    });
  });

  test('a companion with an adjective', () => {
    expect(inComplement('comitative', dogs({ adjectives: ['BIG'] }))).toMatchObject({
      de: 'der Kater spielt mit den drei großen Hunden.', es: 'el gato juega con los tres perros grandes.',
      pt: 'o gato joga com os três cães grandes.',
    });
  });

  test('an opponent', () => {
    expect(inComplement('opponent', dogs())).toMatchObject({
      de: 'der Kater spielt gegen die drei Hunde.', es: 'el gato juega contra los tres perros.', pt: 'o gato joga contra os três cães.',
    });
  });

  test('an instrument', () => {
    expect(inComplement('instrumental', np('STICK', { numeral: 2 }))).toMatchObject({
      de: 'der Kater schneidet mit den zwei Stöcken.', es: 'el gato corta con los dos palos.', pt: 'o gato corta com os dois paus.',
    });
  });

  test('a goal', () => {
    expect(inComplement('direction', np('HOUSE', { numeral: 2 }))).toMatchObject({
      de: 'der Kater läuft zu den zwei Häusern.', es: 'el gato corre a las dos casas.', pt: 'o gato corre às duas casas.',
    });
  });

  test('a source', () => {
    expect(inComplement('source', np('HOUSE', { numeral: 2 }))).toMatchObject({
      de: 'der Kater kommt aus den zwei Häusern.', es: 'el gato viene de las dos casas.', pt: 'o gato vem das duas casas.',
    });
  });

  test('a place under a spatial relation', () => {
    expect(inComplement('locative', np('HOUSE', { numeral: 2 }), under)).toMatchObject({
      de: 'der Kater läuft unter den zwei Häusern.', es: 'el gato corre debajo de las dos casas.', pt: 'o gato corre debaixo das duas casas.',
    });
  });

  test('a time', () => {
    expect(inComplement('temporal', np('DAY', { numeral: 2 }))).toMatchObject({
      de: 'der Kater läuft an den zwei Tagen.', es: 'el gato corre en los dos días.', pt: 'o gato corre nos dois dias.',
    });
  });

  test('a recipient', () => {
    expect(sayAll(clause(np('CAT'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: dogs() } } })))
      .toMatchObject({
        de: 'der Kater gibt den drei Hunden das Buch.', es: 'el gato da el libro a los tres perros.', pt: 'o gato dá o livro aos três cães.',
      });
  });

  // "one" is the article's own word in Spanish and Portuguese; German's cardinal "ein" does not
  // decline for case in any slot yet ("sieht ein Hund"), so its row waits on that (see the bug file).
  test('a bare "one" in Spanish and Portuguese', () => {
    expect(inComplement('comitative', np('DOG', { numeral: 1, ...bare }))).toMatchObject({
      es: 'el gato juega con un perro.', pt: 'o gato joga com um cão.',
    });
  });

  // Beyond the catalogued rows: the possessive detached behind a demonstrative, "todos" before an
  // unstressed possessive, a prenominal adjective after the numeral, the relations that govern
  // their own case (the genitive "während", "wegen" on a bare plural) or scope over the group
  // ("zwischen"), and the impersonal "hace" / "há" P09-E24 reported ("two days ago").
  test('the numeral keeps its place beside every determiner, possessive and relation', () => {
    expect(inComplement('locative', houses({ definiteness: 'this', possessor: my }))).toMatchObject({
      de: 'der Kater läuft in diesen drei Häusern von mir.', es: 'el gato corre en estas tres casas mías.',
      pt: 'o gato corre nestas três casas minhas.',
    });
    expect(inComplement('locative', houses({ definiteness: 'all', possessor: my }))).toMatchObject({
      de: 'der Kater läuft in allen meinen drei Häusern.', es: 'el gato corre en todas mis tres casas.',
      pt: 'o gato corre em todas as minhas três casas.',
    });
    expect(inComplement('comitative', dogs({ adjectives: ['FIRST'] }))).toMatchObject({
      de: 'der Kater spielt mit den drei ersten Hunden.', es: 'el gato juega con los tres primeros perros.',
      pt: 'o gato joga com os três primeiros cães.',
    });
    expect(inComplement('temporal', np('DAY', { numeral: 2, ...bare }), { specifiers: [{ kind: 'temporal', value: 'ago' }] }))
      .toMatchObject({ de: 'der Kater läuft vor zwei Tagen.', es: 'el gato corre hace dos días.', pt: 'o gato corre há dois dias.' });
    expect(inComplement('temporal', np('NIGHT', { numeral: 2 }), { specifiers: [{ kind: 'temporal', value: 'during' }] }))
      .toMatchObject({
        de: 'der Kater läuft während der zwei Nächte.', es: 'el gato corre durante las dos noches.', pt: 'o gato corre durante as duas noites.',
      });
    expect(inComplement('cause', np('DOG', { numeral: 2, ...bare }))).toMatchObject({
      de: 'der Kater läuft wegen zwei Hunden.', es: 'el gato corre a causa de dos perros.', pt: 'o gato corre por causa de dois cães.',
    });
    expect(inComplement('locative', np('HOUSE', { numeral: 2 }), { specifiers: [{ kind: 'path', value: 'between' }] })).toMatchObject({
      de: 'der Kater läuft zwischen den zwei Häusern.', es: 'el gato corre entre las dos casas.', pt: 'o gato corre entre as duas casas.',
    });
  });

  // The feminine cardinal agrees as the subject's does: "una casa", "uma casa", "duas casas".
  test('a feminine count agrees', () => {
    expect(inComplement('locative', np('HOUSE', { numeral: 1, ...bare }))).toMatchObject({
      es: 'el gato corre en una casa.', pt: 'o gato corre em uma casa.',
    });
    expect(inComplement('source', np('HOUSE', { numeral: 2, ...bare })).pt).toBe('o gato vem de duas casas.');
  });

  test('regression: the other four keep it, as the subject and the object do in all seven', () => {
    expect(inComplement('locative', houses())).toMatchObject({
      en: 'the cat runs in the three houses.', it: 'il gatto corre nelle tre case.', fr: 'le chat court dans les trois maisons.',
      ja: '猫は三軒の家で走ります。',
    });
    expect(inComplement('comitative', dogs(bare))).toMatchObject({
      en: 'the cat plays with three dogs.', it: 'il gatto gioca con tre cani.', ja: '猫は三匹の犬と遊びます。',
    });
    expect(inComplement('comitative', dogs({ possessor: my }))).toMatchObject({
      en: 'the cat plays with my three dogs.', it: 'il gatto gioca con i miei tre cani.', fr: 'le chat joue avec mes trois chiens.',
      ja: '猫は私の三匹の犬と遊びます。',
    });
    expect(sayAll(clause(np('HOUSE', { numeral: 3 }), 'BURN'))).toMatchObject({
      de: 'die drei Häuser brennen.', es: 'las tres casas arden.', pt: 'as três casas ardem.',
    });
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: dogs() }))).toMatchObject({
      de: 'der Kater sieht die drei Hunde.', es: 'el gato ve los tres perros.', pt: 'o gato vê os três cães.',
    });
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: dogs(bare) }))).toMatchObject({
      de: 'der Kater sieht drei Hunde.', es: 'el gato ve tres perros.', pt: 'o gato vê três cães.',
    });
    // A complement with no numeral is untouched.
    expect(inComplement('locative', np('HOUSE', { number: 'plural' }))).toMatchObject({
      de: 'der Kater läuft in den Häusern.', es: 'el gato corre en las casas.', pt: 'o gato corre nas casas.',
    });
    expect(inComplement('comitative', np('DOG', { number: 'plural', ...bare }))).toMatchObject({
      de: 'der Kater spielt mit Hunden.', es: 'el gato juega con perros.', pt: 'o gato joga com cães.',
    });
  });
});

// A292. French keeps the numeral in a complement, but A196's rewrite of a bare plural to the
// indefinite ("dans des parenthèses") reaches a counted one too, and `artFor` then writes the plural
// "de" it writes before a prenominal adjective, because the numeral leads in place of the noun. A
// numeral is no adjective and replaces the article outright (C31): "avec trois chiens". Related to
// A289, the definite *object* that loses its article to a numeral; this is the bare complement.
describe('known bugs: french writes de before a bare numeral in a complement (A292)', () => {
  test.fails('a bare companion', () => {
    expect(inComplement('comitative', dogs(bare)).fr).toBe('le chat joue avec trois chiens.');
  });

  test.fails('a companion picked as indefinite', () => {
    expect(inComplement('comitative', dogs({ definiteness: 'indefinite' })).fr).toBe('le chat joue avec trois chiens.');
  });

  test.fails('a bare companion with an adjective', () => {
    expect(inComplement('comitative', dogs({ ...bare, adjectives: ['BIG'] })).fr).toBe('le chat joue avec trois grands chiens.');
  });

  test.fails('a bare place', () => {
    expect(inComplement('locative', houses(bare)).fr).toBe('le chat court dans trois maisons.');
  });

  test.fails('a bare place under a spatial relation', () => {
    expect(inComplement('locative', np('HOUSE', { numeral: 2, ...bare }), under).fr).toBe('le chat court sous deux maisons.');
  });

  test.fails('a bare goal', () => {
    expect(inComplement('direction', np('HOUSE', { numeral: 2, ...bare })).fr).toBe('le chat court à deux maisons.');
  });

  test.fails('a bare opponent', () => {
    expect(inComplement('opponent', dogs(bare)).fr).toBe('le chat joue contre trois chiens.');
  });

  test.fails('a bare instrument', () => {
    expect(inComplement('instrumental', np('STICK', { numeral: 2, ...bare })).fr).toBe('le chat coupe avec deux bâtons.');
  });

  test('regression: the bare plural keeps its des, a counted phrase with a determiner is right, and de-governing relations say de', () => {
    const fr = (type: ComplementType, phrase: NounPhrase, extra?: object) => inComplement(type, phrase, extra).fr;
    expect(fr('comitative', np('DOG', { number: 'plural', ...bare }))).toBe('le chat joue avec des chiens.');
    expect(fr('locative', np('HOUSE', { number: 'plural', ...bare }))).toBe('le chat court dans des maisons.');
    expect(fr('comitative', np('DOG', { number: 'plural', ...bare, adjectives: ['BIG'] }))).toBe('le chat joue avec de grands chiens.');
    expect(fr('comitative', dogs())).toBe('le chat joue avec les trois chiens.');
    expect(fr('comitative', dogs({ definiteness: 'this' }))).toBe('le chat joue avec ces trois chiens.');
    expect(fr('comitative', dogs({ possessor: my }))).toBe('le chat joue avec mes trois chiens.');
    expect(fr('instrumental', np('STICK', { numeral: 2 }))).toBe('le chat coupe avec les deux bâtons.');
    expect(fr('source', np('HOUSE', { numeral: 2, ...bare }))).toBe('le chat vient de deux maisons.');
    expect(fr('cause', np('DOG', { numeral: 2, ...bare }))).toBe('le chat court à cause de deux chiens.');
    // The other six say a bare counted companion with no article.
    expect(inComplement('comitative', dogs(bare))).toMatchObject({
      en: 'the cat plays with three dogs.', it: 'il gatto gioca con tre cani.', ja: '猫は三匹の犬と遊びます。',
    });
  });
});
