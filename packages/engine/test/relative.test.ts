import { describe, expect, test } from 'vitest';
import type { VerbPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// A restrictive relative clause. The head noun fills one slot of the clause — its subject by
// default, or any slot named by `headRole` — and clauses nest, since the clause's own objects
// are themselves noun phrases that may carry a `relative`.
describe('relative clauses', () => {
  test('the head is the clause subject by default', () => {
    expect(sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT' } } }), 'RUN')))
      .toMatchObject({
        it: 'il gatto che mangia corre.',
        fr: 'le chat qui mange court.',
        es: 'el gato que come corre.',
        pt: 'o gato que come corre.',
      });
  });

  test('the clause carries its own object', () => {
    expect(sayAll(clause(
      np('CAT', { relative: { verbPhrase: { verb: 'EAT' }, directObject: np('MOUSE') } }),
      'RUN',
    ))).toMatchObject({
      en: 'the cat who eats the mouse runs.',
      it: 'il gatto che mangia il topo corre.',
      fr: 'le chat qui mange la souris court.',
      // German sends the relative clause's verb to the end.
      de: 'der Kater, der die Maus isst läuft.',
    });
  });

  test('headRole puts the gap in another slot — "the mouse that the cat eats"', () => {
    expect(sayAll(clause(
      np('MOUSE', {
        relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'EAT' } },
      }),
      'RUN',
    ))).toMatchObject({
      it: 'il topo che il gatto mangia corre.',
      // French distinguishes the subject relativiser (qui) from the object one (que).
      fr: 'la souris que le chat mange court.',
      es: 'el ratón que el gato come corre.',
      de: 'die Maus, die der Kater isst läuft.',
    });
  });

  test('the clause carries its own tense', () => {
    expect(sayAll(clause(np('DOG'), 'SEE', {
      directObject: np('CAT', { relative: { verbPhrase: { verb: 'EAT', tense: 'past' } } }),
    }))).toMatchObject({
      en: 'the dog sees the cat who ate.',
      it: 'il cane vede il gatto che mangiò.',
      fr: 'le chien voit le chat qui mangea.',
      de: 'der Hund sieht den Kater, der aß.',
    });
  });

  test('relative clauses nest', () => {
    expect(sayAll(clause(
      np('CAT', {
        relative: {
          verbPhrase: { verb: 'EAT' },
          directObject: np('MOUSE', { relative: { verbPhrase: { verb: 'RUN' } } }),
        },
      }),
      'RUN',
    ))).toMatchObject({
      it: 'il gatto che mangia il topo che corre corre.',
      fr: 'le chat qui mange la souris qui court court.',
      es: 'el gato que come el ratón que corre corre.',
    });
  });
});

describe('known bugs: relative clauses', () => {
  // en.ts keys the relativiser off ANIMACY ("who" for an animate head, "that" otherwise), but
  // English keys it off PERSONHOOD: an animal is animate and still takes "that"/"which".
  // Fixing this needs a `person`/`human` feature on the concept — animacy cannot stand in.
  test.fails('English should not relativise a non-person with "who"', () => {
    expect(sayAll(clause(
      np('MOUSE', {
        relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'EAT' } },
      }),
      'RUN',
    ))).toMatchObject({ en: 'the mouse that the cat eats runs.' });
  });

  // A German relative clause is set off by commas at BOTH ends; the engine only opens one.
  // de.ts calls this out: "(The closing comma is omitted; a known first-cut simplification.)"
  test.fails('German should close the relative clause with a comma', () => {
    expect(sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT' } } }), 'RUN')))
      .toMatchObject({ de: 'der Kater, der isst, läuft.' });
  });

  // The clearest bug in the engine: ja.ts's own comment says the clause verb "takes the *plain*
  // form (食べた猫), not the polite ます/ました of a main clause — Japanese requires plain form on a
  // prenominal predicate (see plainVerbSeg)" — but `plainVerbSeg` was never written, and the
  // relative path calls the polite `predicateSegs`. Intent documented, never implemented.
  test.fails('Japanese should use the plain form inside a relative clause', () => {
    expect(sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT' } } }), 'RUN')))
      .toMatchObject({ ja: '食べる猫は走ります。' });
  });

  test.fails('Japanese should use the plain past inside a relative clause', () => {
    expect(sayAll(clause(np('DOG'), 'SEE', {
      directObject: np('CAT', { relative: { verbPhrase: { verb: 'EAT', tense: 'past' } } }),
    }))).toMatchObject({ ja: '犬は食べた猫を見ます。' });
  });
});

// The relative clause carries its own VerbPhrase, so its tense, aspect, polarity and modals are
// independent of the matrix clause's. "the cat that WILL EAT SAW the mouse" is a perfectly good
// plan, and each half has to conjugate on its own terms.
//
// The German strings below still lack the relative clause's closing comma — that is the known bug
// pinned above, not a claim that the comma should be absent.
const matrix = (main: Partial<VerbPhrase>, rel: Partial<VerbPhrase>) =>
  sayAll(clause(
    np('CAT', { relative: { verbPhrase: { verb: 'EAT', ...rel } } }),
    'SEE',
    { verbPhrase: main, directObject: np('MOUSE') },
  ));

describe('relative clauses: a tense of their own', () => {
  test('a past clause under a present matrix, and the reverse', () => {
    expect(matrix({}, { tense: 'past' })).toMatchObject({
      en: 'the cat who ate sees the mouse.',
      it: 'il gatto che mangiò vede il topo.',
      fr: 'le chat qui mangea voit la souris.',
      de: 'der Kater, der aß sieht die Maus.',
    });

    expect(matrix({ tense: 'past' }, {})).toMatchObject({
      en: 'the cat who eats saw the mouse.',
      it: 'il gatto che mangia vide il topo.', // mangia present, vide past
      es: 'el gato que come vio el ratón.',
      de: 'der Kater, der isst sah die Maus.',
    });
  });

  test('a future clause under a past matrix — the two tenses need not be ordered', () => {
    expect(matrix({ tense: 'past' }, { tense: 'future' })).toMatchObject({
      en: 'the cat who will eat saw the mouse.',
      it: 'il gatto che mangerà vide il topo.',
      fr: 'le chat qui mangera vit la souris.',
      de: 'der Kater, der essen wird sah die Maus.', // verb-final: the auxiliary goes last
    });

    expect(matrix({ tense: 'future' }, { tense: 'past' })).toMatchObject({
      en: 'the cat who ate will see the mouse.',
      it: 'il gatto che mangiò vedrà il topo.',
      pt: 'o gato que comeu verá o rato.',
    });
  });
});

describe('relative clauses: an aspect of their own', () => {
  test('a resultative clause under a present matrix', () => {
    expect(matrix({}, { aspect: 'resultative' })).toMatchObject({
      en: 'the cat who has eaten sees the mouse.',
      it: 'il gatto che ha mangiato vede il topo.',
      fr: 'le chat qui a mangé voit la souris.',
      es: 'el gato que ha comido ve el ratón.',
    });
  });

  test('a resultative matrix over a present clause', () => {
    expect(matrix({ aspect: 'resultative' }, {})).toMatchObject({
      en: 'the cat who eats has seen the mouse.',
      it: 'il gatto che mangia ha visto il topo.',
      fr: 'le chat qui mange a vu la souris.',
      de: 'der Kater, der isst hat die Maus gesehen.', // the matrix aspect DOES render
    });
  });

  test('a different aspect on each side', () => {
    expect(matrix({ aspect: 'progressive' }, { aspect: 'resultative' })).toMatchObject({
      en: 'the cat who has eaten is seeing the mouse.',
      it: 'il gatto che ha mangiato sta vedendo il topo.',
      fr: 'le chat qui a mangé est en train de voir la souris.',
    });

    expect(matrix({ aspect: 'resultative' }, { aspect: 'progressive' })).toMatchObject({
      en: 'the cat who is eating has seen the mouse.',
      it: 'il gatto che sta mangiando ha visto il topo.',
      es: 'el gato que está comiendo ha visto el ratón.',
    });
  });
});

describe('relative clauses: tense and aspect together, differing on both sides', () => {
  test('a past perfect matrix over a future progressive clause', () => {
    expect(matrix(
      { tense: 'past', aspect: 'resultative' },
      { tense: 'future', aspect: 'progressive' },
    )).toMatchObject({
      en: 'the cat who will be eating had seen the mouse.',
      it: 'il gatto che starà mangiando aveva visto il topo.',
      fr: 'le chat qui sera en train de manger avait vu la souris.',
      es: 'el gato que estará comiendo había visto el ratón.',
    });
  });

  test('and the reverse', () => {
    expect(matrix(
      { tense: 'future', aspect: 'progressive' },
      { tense: 'past', aspect: 'resultative' },
    )).toMatchObject({
      en: 'the cat who had eaten will be seeing the mouse.',
      it: 'il gatto che aveva mangiato starà vedendo il topo.',
      pt: 'o gato que tinha comido estará vendo o rato.',
    });
  });
});

describe('relative clauses: polarity and modals of their own', () => {
  test('the negation belongs to one clause, not the other', () => {
    expect(matrix({ negative: true }, {})).toMatchObject({
      en: 'the cat who eats does not see the mouse.',
      it: 'il gatto che mangia non vede il topo.',
      de: 'der Kater, der isst sieht die Maus nicht.',
    });

    expect(matrix({}, { negative: true })).toMatchObject({
      en: 'the cat who does not eat sees the mouse.',
      fr: 'le chat qui ne mange pas voit la souris.',
      de: 'der Kater, der nicht isst sieht die Maus.', // negation survives into the clause
      ja: '食べません猫はネズミを見ます。',
    });
  });

  test('a modal in one clause and not the other', () => {
    expect(matrix({ modals: ['MUST'] }, {})).toMatchObject({
      en: 'the cat who eats must see the mouse.',
      it: 'il gatto che mangia deve vedere il topo.',
    });

    expect(matrix({}, { modals: ['CAN'] })).toMatchObject({
      en: 'the cat who can eat sees the mouse.',
      it: 'il gatto che può mangiare vede il topo.',
      de: 'der Kater, der essen kann sieht die Maus.', // modal goes final, like the tense auxiliary
    });
  });
});

describe('known bugs: relative clauses (aspect)', () => {
  // German DROPS the aspect inside a relative clause. Everything else survives — the tense
  // ("der aß", "der essen wird"), the negation ("der nicht isst") and a modal ("der essen kann")
  // are all rendered — but an aspect is silently discarded and the clause falls back to a plain
  // present:
  //
  //     got   "der Kater, der ISST sieht die Maus."
  //     want  "der Kater, der GEGESSEN HAT, sieht die Maus."
  //
  // The matrix clause renders the same aspect perfectly ("hat die Maus gesehen"), so the
  // machinery exists; it simply is not reached from the relative-clause path.
  test.fails('German should render a resultative inside a relative clause', () => {
    expect(matrix({}, { aspect: 'resultative' }))
      .toMatchObject({ de: 'der Kater, der gegessen hat, sieht die Maus.' });
  });

  test.fails('German should render a progressive inside a relative clause', () => {
    // "der gerade isst" — the adverbial progressive German uses everywhere else.
    expect(matrix({ aspect: 'resultative' }, { aspect: 'progressive' }).de)
      .not.toBe('der Kater, der isst hat die Maus gesehen.');
  });

  test.fails('German should keep BOTH the tense and the aspect of a relative clause', () => {
    // Past + resultative in the clause: the tense survives ("aß") and the aspect is thrown away,
    // so a pluperfect collapses into a simple past.
    expect(matrix(
      { tense: 'future', aspect: 'progressive' },
      { tense: 'past', aspect: 'resultative' },
    )).toMatchObject({ de: 'der Kater, der gegessen hatte, wird gerade die Maus sehen.' });
  });
});

// Relative clauses nest, and each level keeps its own verb phrase. Three levels means three
// independent tense/aspect choices at once:
//
//   matrix        the cat …            SEES the dog
//   outer clause  the cat THAT EATS    the mouse
//   inner clause  … the mouse THAT RUNS
const nested = (
  matrixVp: Partial<VerbPhrase>,
  outer: Partial<VerbPhrase>,
  inner: Partial<VerbPhrase>,
) =>
  sayAll(clause(
    np('CAT', {
      relative: {
        verbPhrase: { verb: 'EAT', ...outer },
        directObject: np('MOUSE', { relative: { verbPhrase: { verb: 'RUN', ...inner } } }),
      },
    }),
    'SEE',
    { verbPhrase: matrixVp, directObject: np('DOG') },
  ));

describe('nested relative clauses: three tenses at once', () => {
  test('past matrix, present outer, future inner', () => {
    expect(nested({ tense: 'past' }, {}, { tense: 'future' })).toMatchObject({
      en: 'the cat who eats the mouse who will run saw the dog.',
      it: 'il gatto che mangia il topo che correrà vide il cane.',
      fr: 'le chat qui mange la souris qui courra vit le chien.',
      es: 'el gato que come el ratón que correrá vio el perro.',
      pt: 'o gato que come o rato que correrá viu o cão.',
    });
  });

  test('future matrix, past outer, present inner', () => {
    expect(nested({ tense: 'future' }, { tense: 'past' }, {})).toMatchObject({
      en: 'the cat who ate the mouse who runs will see the dog.',
      it: 'il gatto che mangiò il topo che corre vedrà il cane.',
      fr: 'le chat qui mangea la souris qui court verra le chien.',
      // Each German clause is verb-final on its own: "die läuft" inside "der … aß".
      de: 'der Kater, der die Maus, die läuft aß wird den Hund sehen.',
    });
  });

  test('present matrix, future outer, past inner', () => {
    expect(nested({}, { tense: 'future' }, { tense: 'past' })).toMatchObject({
      en: 'the cat who will eat the mouse who ran sees the dog.',
      it: 'il gatto che mangerà il topo che corse vede il cane.',
      es: 'el gato que comerá el ratón que corrió ve el perro.',
      de: 'der Kater, der die Maus, die lief essen wird sieht den Hund.',
    });
  });
});

describe('nested relative clauses: three aspects at once', () => {
  test('progressive matrix, resultative outer, prospective inner', () => {
    expect(nested(
      { aspect: 'progressive' }, { aspect: 'resultative' }, { aspect: 'prospective' },
    )).toMatchObject({
      en: 'the cat who has eaten the mouse who is about to run is seeing the dog.',
      it: 'il gatto che ha mangiato il topo che sta per correre sta vedendo il cane.',
      fr: 'le chat qui a mangé la souris qui est sur le point de courir est en train de voir le chien.',
      es: 'el gato que ha comido el ratón que está a punto de correr está viendo el perro.',
    });
  });

  test('resultative matrix, prospective outer, progressive inner', () => {
    expect(nested(
      { aspect: 'resultative' }, { aspect: 'prospective' }, { aspect: 'progressive' },
    )).toMatchObject({
      en: 'the cat who is about to eat the mouse who is running has seen the dog.',
      it: 'il gatto che sta per mangiare il topo che sta correndo ha visto il cane.',
      pt: 'o gato que está prestes a comer o rato que está correndo tem visto o cão.',
    });
  });

  test('prospective matrix, progressive outer, resultative inner', () => {
    expect(nested(
      { aspect: 'prospective' }, { aspect: 'progressive' }, { aspect: 'resultative' },
    )).toMatchObject({
      en: 'the cat who is eating the mouse who has run is about to see the dog.',
      it: 'il gatto che sta mangiando il topo che ha corso sta per vedere il cane.',
      fr: 'le chat qui est en train de manger la souris qui a couru est sur le point de voir le chien.',
    });
  });
});

describe('nested relative clauses: three tenses AND three aspects', () => {
  test('past-perfect matrix over a present-progressive clause over a future-prospective one', () => {
    expect(nested(
      { tense: 'past', aspect: 'resultative' },
      { aspect: 'progressive' },
      { tense: 'future', aspect: 'prospective' },
    )).toMatchObject({
      en: 'the cat who is eating the mouse who will be about to run had seen the dog.',
      it: 'il gatto che sta mangiando il topo che starà per correre aveva visto il cane.',
      fr: 'le chat qui est en train de manger la souris qui sera sur le point de courir avait vu le chien.',
      es: 'el gato que está comiendo el ratón que estará a punto de correr había visto el perro.',
      pt: 'o gato que está comendo o rato que estará prestes a correr tinha visto o cão.',
    });
  });

  test('and a different permutation of the same six choices', () => {
    expect(nested(
      { tense: 'future', aspect: 'progressive' },
      { tense: 'past', aspect: 'prospective' },
      { aspect: 'resultative' },
    )).toMatchObject({
      en: 'the cat who was about to eat the mouse who has run will be seeing the dog.',
      it: 'il gatto che stava per mangiare il topo che ha corso starà vedendo il cane.',
      fr: 'le chat qui était sur le point de manger la souris qui a couru sera en train de voir le chien.',
      es: 'el gato que estaba a punto de comer el ratón que ha corrido estará viendo el perro.',
    });
  });

  test('Japanese composes tense and aspect at every depth', () => {
    // The politeness is wrong at every level (see the plain-form bug above), but the tense and
    // aspect themselves compose correctly right down the nest — worth separating the two.
    expect(nested(
      { tense: 'past', aspect: 'resultative' },
      { aspect: 'progressive' },
      { tense: 'future', aspect: 'prospective' },
    ).ja).toBe('走るところですネズミを食べています猫は犬を見てしまいました。');
  });
});

describe('known bugs: nested relative clauses', () => {
  // The German aspect-drop compounds with depth: EVERY relative clause falls back to a plain
  // tense, so a three-level plan loses two aspects at once. Below, the outer clause should be a
  // perfect ("der gegessen hat") and the inner a prospective ("die im Begriff ist zu laufen");
  // both come out as bare presents, and only the matrix keeps its aspect.
  test.fails('German should render an aspect at every relative depth, not just the matrix', () => {
    const de = nested(
      { aspect: 'progressive' }, { aspect: 'resultative' }, { aspect: 'prospective' },
    ).de;
    // Both clauses collapse to "isst" / "läuft" — the two aspects vanish.
    expect(de).not.toBe('der Kater, der die Maus, die läuft isst sieht gerade den Hund.');
  });

  test('…while the TENSE survives at every depth, which is what makes it a bug', () => {
    // Same nest, tenses instead of aspects: all three levels render. The path exists.
    expect(nested({}, { tense: 'future' }, { tense: 'past' }))
      .toMatchObject({ de: 'der Kater, der die Maus, die lief essen wird sieht den Hund.' });
  });
});
