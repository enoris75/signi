import { describe, expect, test } from 'vitest';
import type { NounPhrase, VerbPhrase } from '@signi/shared';
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
      en: 'the cat that eats the mouse runs.',
      it: 'il gatto che mangia il topo corre.',
      fr: 'le chat qui mange la souris court.',
      // German sends the relative clause's verb to the end, and brackets the clause in commas.
      de: 'der Kater, der die Maus isst, läuft.',
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
      de: 'die Maus, die der Kater isst, läuft.',
    });
  });

  test('the clause carries its own tense', () => {
    expect(sayAll(clause(np('DOG'), 'SEE', {
      directObject: np('CAT', { relative: { verbPhrase: { verb: 'EAT', tense: 'past' } } }),
    }))).toMatchObject({
      en: 'the dog sees the cat that ate.',
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
  // en.ts now keys the relativiser off PERSONHOOD, not animacy: an animal is animate and still
  // takes "that"/"which" — only a person (the `human` concept feature) takes "who". A subject
  // (CAT) and head (MOUSE) that are both non-persons therefore both relativise with "that".
  test('English should not relativise a non-person with "who"', () => {
    expect(sayAll(clause(
      np('MOUSE', {
        relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'EAT' } },
      }),
      'RUN',
    ))).toMatchObject({ en: 'the mouse that the cat eats runs.' });
  });

  // The generalisation: a person head DOES take "who" (this is what animacy could not express —
  // a cat is animate but not a person), and a person still takes "who" in object position too.
  test('English relativises a person with "who"', () => {
    expect(sayAll(clause(
      np('BOY', { relative: { verbPhrase: { verb: 'EAT' } } }),
      'RUN',
    )).en).toBe('the boy who eats runs.');
    expect(sayAll(clause(
      np('CHILD', { relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'SEE' } } }),
      'RUN',
    )).en).toBe('the child who the cat sees runs.');
    // A non-person head with a person subject still takes "that" on the head.
    expect(sayAll(clause(
      np('MOUSE', { relative: { headRole: 'directObject', subject: np('PERSON'), verbPhrase: { verb: 'EAT' } } }),
      'RUN',
    )).en).toBe('the mouse that the person eats runs.');
  });

  // A German relative clause is set off by commas at BOTH ends; the engine now closes it too.
  // A closing comma that lands against the sentence-final stop is absorbed by it (see the
  // sibling cases below where the clause ends the sentence).
  test('German closes the relative clause with a comma', () => {
    expect(sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT' } } }), 'RUN')))
      .toMatchObject({ de: 'der Kater, der isst, läuft.' });
  });

  // The closing comma merges with the sentence-final full stop when the clause ends the sentence:
  // no ", ." — just ".". (The head noun is the matrix direct object, so the clause is last.)
  test('German drops the closing comma into the sentence-final stop', () => {
    expect(sayAll(clause(np('DOG'), 'SEE', {
      directObject: np('CAT', { relative: { verbPhrase: { verb: 'EAT' } } }),
    })).de).toBe('der Hund sieht den Kater, der isst.');
  });

  // The clearest bug in the engine: ja.ts's own comment says the clause verb "takes the *plain*
  // form (食べた猫), not the polite ます/ました of a main clause — Japanese requires plain form on a
  // prenominal predicate (see plainVerbSeg)" — but `plainVerbSeg` was never written, and the
  // relative path calls the polite `predicateSegs`. Intent documented, never implemented.
  test('Japanese should use the plain form inside a relative clause', () => {
    expect(sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT' } } }), 'RUN')))
      .toMatchObject({ ja: '食べる猫は走ります。' });
  });

  test('Japanese should use the plain past inside a relative clause', () => {
    expect(sayAll(clause(np('DOG'), 'SEE', {
      directObject: np('CAT', { relative: { verbPhrase: { verb: 'EAT', tense: 'past' } } }),
    }))).toMatchObject({ ja: '犬は食べた猫を見ます。' });
  });

  // The plain form generalises to every affirmative-neutral relative clause, not just a
  // subject-relative present. Below are the siblings the fix must also cover.

  // Future has no dedicated Japanese form; it reuses the present, so it too is the plain
  // dictionary form (食べる), never the polite 食べます.
  test('Japanese future in a relative clause reuses the plain present', () => {
    expect(sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT', tense: 'future' } } }), 'RUN')))
      .toMatchObject({ ja: '食べる猫は走ります。' });
  });

  // An object-relative ("the mouse that the cat eats") — the clause's own subject leads,
  // marked by が, and its verb is still plain: 食べる non-past, 食べた past.
  test('Japanese object-relative clauses are plain too', () => {
    const objRel = (tense?: 'past') => sayAll(clause(
      np('MOUSE', {
        relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'EAT', tense } },
      }),
      'RUN',
    )).ja;
    expect(objRel()).toBe('猫が食べるネズミは走ります。');
    expect(objRel('past')).toBe('猫が食べたネズミは走ります。');
  });

  // Nested relative clauses are all subordinate, so the plain form applies at every depth:
  // both 走る (inner) and 食べる (outer) are plain, only the matrix 走ります stays polite.
  test('Japanese plain form reaches every depth of a nested relative clause', () => {
    expect(sayAll(clause(
      np('CAT', {
        relative: {
          verbPhrase: { verb: 'EAT' },
          directObject: np('MOUSE', { relative: { verbPhrase: { verb: 'RUN' } } }),
        },
      }),
      'RUN',
    ))).toMatchObject({ ja: '走るネズミを食べる猫は走ります。' });
  });

  // Regression guard on the documented boundary of this fix: the matrix (main-clause) verb
  // keeps its polite ます. Only the subordinate relative clause is plain-formed.
  test('Japanese keeps the polite form on the matrix verb', () => {
    expect(sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT' } } }), 'RUN')).ja)
      .toContain('走ります');
  });
});

// The relative clause carries its own VerbPhrase, so its tense, aspect, polarity and modals are
// independent of the matrix clause's. "the cat that WILL EAT SAW the mouse" is a perfectly good
// plan, and each half has to conjugate on its own terms.
//
// The German strings below bracket the relative clause in commas at both ends (the clause sits on
// the subject, so the closing comma is clause-medial and visible before the matrix verb).
const matrix = (main: Partial<VerbPhrase>, rel: Partial<VerbPhrase>) =>
  sayAll(clause(
    np('CAT', { relative: { verbPhrase: { verb: 'EAT', ...rel } } }),
    'SEE',
    { verbPhrase: main, directObject: np('MOUSE') },
  ));

describe('relative clauses: a tense of their own', () => {
  test('a past clause under a present matrix, and the reverse', () => {
    expect(matrix({}, { tense: 'past' })).toMatchObject({
      en: 'the cat that ate sees the mouse.',
      it: 'il gatto che mangiò vede il topo.',
      fr: 'le chat qui mangea voit la souris.',
      de: 'der Kater, der aß, sieht die Maus.',
    });

    expect(matrix({ tense: 'past' }, {})).toMatchObject({
      en: 'the cat that eats saw the mouse.',
      it: 'il gatto che mangia vide il topo.', // mangia present, vide past
      es: 'el gato que come vio el ratón.',
      de: 'der Kater, der isst, sah die Maus.',
    });
  });

  test('a future clause under a past matrix — the two tenses need not be ordered', () => {
    expect(matrix({ tense: 'past' }, { tense: 'future' })).toMatchObject({
      en: 'the cat that will eat saw the mouse.',
      it: 'il gatto che mangerà vide il topo.',
      fr: 'le chat qui mangera vit la souris.',
      de: 'der Kater, der essen wird, sah die Maus.', // verb-final: the auxiliary goes last
    });

    expect(matrix({ tense: 'future' }, { tense: 'past' })).toMatchObject({
      en: 'the cat that ate will see the mouse.',
      it: 'il gatto che mangiò vedrà il topo.',
      pt: 'o gato que comeu verá o rato.',
    });
  });
});

describe('relative clauses: an aspect of their own', () => {
  test('a resultative clause under a present matrix', () => {
    expect(matrix({}, { aspect: 'resultative' })).toMatchObject({
      en: 'the cat that has eaten sees the mouse.',
      it: 'il gatto che ha mangiato vede il topo.',
      fr: 'le chat qui a mangé voit la souris.',
      es: 'el gato que ha comido ve el ratón.',
    });
  });

  test('a resultative matrix over a present clause', () => {
    expect(matrix({ aspect: 'resultative' }, {})).toMatchObject({
      en: 'the cat that eats has seen the mouse.',
      it: 'il gatto che mangia ha visto il topo.',
      fr: 'le chat qui mange a vu la souris.',
      de: 'der Kater, der isst, hat die Maus gesehen.', // the matrix aspect DOES render
    });
  });

  test('a different aspect on each side', () => {
    expect(matrix({ aspect: 'progressive' }, { aspect: 'resultative' })).toMatchObject({
      en: 'the cat that has eaten is seeing the mouse.',
      it: 'il gatto che ha mangiato sta vedendo il topo.',
      fr: 'le chat qui a mangé est en train de voir la souris.',
    });

    expect(matrix({ aspect: 'resultative' }, { aspect: 'progressive' })).toMatchObject({
      en: 'the cat that is eating has seen the mouse.',
      it: 'il gatto che sta mangiando ha visto il topo.',
      es: 'el gato que está comiendo ha visto el ratón.',
    });
  });
});

// French agrees a past participle with a PRECEDING direct object (the accord du participe passé du
// COD antéposé): in an object-relative clause under the compound past, the participle agrees with
// the antecedent — "la souris QUE le chat a mangéE". Only French makes this obligatory: Italian's
// relative-clause agreement is optional (ha mangiato is fine), and Spanish/Portuguese never agree an
// haber/ter participle. The head is the object of the clause and it is resolved in the resultative.
const eatenByCat = (head: string, extra: Partial<NounPhrase> = {}) =>
  sayAll(clause(
    np(head, {
      ...extra,
      relative: {
        headRole: 'directObject',
        subject: np('CAT'),
        verbPhrase: { verb: 'EAT', aspect: 'resultative' },
      },
    }),
    'RUN',
  ));

describe('relative clauses: preceding-object participle agreement', () => {
  test('Spanish and Portuguese correctly do NOT agree the participle with the antecedent', () => {
    expect(eatenByCat('MOUSE')).toMatchObject({
      es: 'el ratón que el gato ha comido corre.',
      pt: 'o rato que o gato comeu corre.',
    });
  });

  test('a masculine antecedent shows no visible agreement in French either', () => {
    // The control: "mangé" is already the form a masculine antecedent takes, so the agreement is
    // invisible here — which is why the feminine antecedent below is what exposes the gap.
    expect(eatenByCat('BOOK')).toMatchObject({ fr: 'le livre que le chat a mangé court.' });
  });
});

// A generic / impersonal subject (GENERIC_PERSON) filling the subject of an object-gap relative —
// "a thing one eats". The head is the clause's direct object (the gap); the generic subject is what
// C04 needed. Its surface splits three ways: a placed subject word in en/de/fr ("one"/"man"/"on",
// French eliding to "qu'on"), a preverbal impersonal clitic in the Romance clitic languages (it
// "si", es/pt "se") with no subject word, and dropped entirely in Japanese (食べる物体).
describe('generic / impersonal subject', () => {
  // The patient gloss as a bare noun phrase, exactly as a concept `definition` renders it.
  const patient = (genus: string, verb: string, negative = false) =>
    sayAll({
      subject: np(genus, {
        definiteness: 'indefinite',
        relative: {
          headRole: 'directObject',
          subject: np('GENERIC_PERSON'),
          verbPhrase: { verb, ...(negative ? { negative: true } : {}) },
        },
      }),
    });

  test('the impersonal subject renders per language — placed word, clitic, or dropped', () => {
    expect(patient('OBJECT_THING', 'EAT')).toEqual({
      en: 'an object that one eats.',
      it: 'un oggetto che si mangia.', // impersonal "si" proclitic, no subject word
      fr: "un objet qu'on mange.", // "on" placed, "que" elided
      de: 'ein Gegenstand, den man isst.', // "man" placed, verb-final
      es: 'un objeto que se come.', // impersonal "se"
      ja: '食べる物体。', // the generic subject is dropped, leaving the bare prenominal clause
      pt: 'um objeto que se come.',
    });
  });

  // Negation is where a placed "si"/"se" subject word would come out wrong ("che si non mangia"):
  // the clitic must sit AFTER the negator — "non si mangia" / "no se come" / "não se come".
  test('the impersonal clitic sits after the negator', () => {
    expect(patient('OBJECT_THING', 'EAT', true)).toMatchObject({
      en: 'an object that one does not eat.',
      it: 'un oggetto che non si mangia.',
      fr: "un objet qu'on ne mange pas.",
      de: 'ein Gegenstand, den man nicht isst.',
      es: 'un objeto que no se come.',
      pt: 'um objeto que não se come.',
    });
  });

  // The same subject at clause level, not just in a relative: pro-drop still hides the pronoun in
  // it/es/pt, but the impersonal clitic must survive it ("si mangia il topo", not "mangia il topo").
  test('a top-level impersonal subject keeps its clitic through pro-drop', () => {
    expect(sayAll({
      subject: np('GENERIC_PERSON'),
      verbPhrase: { verb: 'EAT' },
      directObject: np('MOUSE'),
    })).toEqual({
      en: 'one eats the mouse.',
      it: 'si mangia il topo.',
      fr: 'on mange la souris.',
      de: 'man isst die Maus.',
      es: 'se come el ratón.',
      ja: '人はネズミを食べます。',
      pt: 'se come o rato.',
    });
  });
});

describe('known bugs: French preceding-object participle agreement', () => {
  // French obligatorily agrees the participle with a preceding direct object, so a feminine
  // antecedent gives "mangée" (singular) / "mangées" (plural). The engine now agrees an avoir
  // participle with the antecedent of an object-relative clause (the accord du COD antéposé); it
  // still does not agree with the SUBJECT ("elle a vu").
  test('French agrees with a feminine singular antecedent: "a mangée"', () => {
    expect(eatenByCat('MOUSE')).toMatchObject({ fr: 'la souris que le chat a mangée court.' });
  });

  test('…and with a feminine plural antecedent: "a mangées"', () => {
    expect(eatenByCat('MOUSE', { number: 'plural' }))
      .toMatchObject({ fr: 'les souris que le chat a mangées courent.' });
  });

  // A masculine PLURAL antecedent also shows the agreement — the plural -s is visible even without a
  // gender change: "les livres que le chat a mangés".
  test('French agrees with a masculine plural antecedent: "a mangés"', () => {
    expect(eatenByCat('BOOK', { number: 'plural' }))
      .toMatchObject({ fr: 'les livres que le chat a mangés courent.' });
  });

  // Regression: the agreement is triggered by a preceding OBJECT only. A feminine head that is the
  // clause's SUBJECT (a subject-relative whose object follows) does NOT agree the participle, and
  // neither does a plain main clause — avoir never agrees with its subject.
  test('French does not agree the participle with the subject', () => {
    expect(sayAll(clause(np('CAT', {
      gender: 'fem',
      relative: { verbPhrase: { verb: 'EAT', aspect: 'resultative' }, directObject: np('MOUSE') },
    }), 'RUN')).fr).toBe('la chatte qui a mangé la souris court.');
    expect(sayAll(clause(np('CAT', { gender: 'fem' }), 'EAT', {
      verbPhrase: { aspect: 'resultative' }, directObject: np('MOUSE'),
    })).fr).toBe('la chatte a mangé la souris.');
  });

  // Regression: Spanish and Portuguese still never agree the haber/ter participle with the
  // antecedent, plural or not.
  test('Spanish and Portuguese still do not agree with a plural antecedent', () => {
    expect(eatenByCat('MOUSE', { number: 'plural' })).toMatchObject({
      es: 'los ratones que el gato ha comido corren.',
      pt: 'os ratos que o gato comeu correm.',
    });
  });
});

describe('relative clauses: tense and aspect together, differing on both sides', () => {
  test('a past perfect matrix over a future progressive clause', () => {
    expect(matrix(
      { tense: 'past', aspect: 'resultative' },
      { tense: 'future', aspect: 'progressive' },
    )).toMatchObject({
      en: 'the cat that will be eating had seen the mouse.',
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
      en: 'the cat that had eaten will be seeing the mouse.',
      it: 'il gatto che aveva mangiato starà vedendo il topo.',
      pt: 'o gato que tinha comido estará vendo o rato.',
    });
  });
});

describe('relative clauses: polarity and modals of their own', () => {
  test('the negation belongs to one clause, not the other', () => {
    expect(matrix({ negative: true }, {})).toMatchObject({
      en: 'the cat that eats does not see the mouse.',
      it: 'il gatto che mangia non vede il topo.',
      de: 'der Kater, der isst, sieht die Maus nicht.',
    });

    expect(matrix({}, { negative: true })).toMatchObject({
      en: 'the cat that does not eat sees the mouse.',
      fr: 'le chat qui ne mange pas voit la souris.',
      de: 'der Kater, der nicht isst, sieht die Maus.', // negation survives into the clause
      ja: '食べません猫はネズミを見ます。',
    });
  });

  test('a modal in one clause and not the other', () => {
    expect(matrix({ modals: ['MUST'] }, {})).toMatchObject({
      en: 'the cat that eats must see the mouse.',
      it: 'il gatto che mangia deve vedere il topo.',
    });

    expect(matrix({}, { modals: ['CAN'] })).toMatchObject({
      en: 'the cat that can eat sees the mouse.',
      it: 'il gatto che può mangiare vede il topo.',
      de: 'der Kater, der essen kann, sieht die Maus.', // modal goes final, like the tense auxiliary
    });
  });
});

describe('known bugs: relative clauses (aspect)', () => {
  // German used to DROP the aspect inside a relative clause — the tense ("der aß", "der essen
  // wird"), the negation ("der nicht isst") and a modal ("der essen kann") all survived, but an
  // aspect was silently discarded and the clause fell back to a plain present. The relative path
  // now runs the same verbGroup/modalVerbGroup the matrix clause does, so the aspect renders here
  // too — verb-final: the finite auxiliary closes the clause behind the participle/infinitive.
  test('German renders a resultative inside a relative clause', () => {
    expect(matrix({}, { aspect: 'resultative' }))
      .toMatchObject({ de: 'der Kater, der gegessen hat, sieht die Maus.' });
  });

  test('German renders a progressive inside a relative clause', () => {
    // "der gerade isst" — the adverbial progressive German uses everywhere else, unaffected by the
    // matrix clause carrying an aspect of its own ("hat … gesehen").
    expect(matrix({ aspect: 'resultative' }, { aspect: 'progressive' }).de)
      .toBe('der Kater, der gerade isst, hat die Maus gesehen.');
  });

  test('German renders a prospective inside a relative clause', () => {
    // "im Begriff zu essen", with the finite "ist" pushed to the clause end (verb-final).
    expect(matrix({}, { aspect: 'prospective' }).de)
      .toBe('der Kater, der im Begriff zu essen ist, sieht die Maus.');
  });

  test('German keeps BOTH the tense and the aspect of a relative clause', () => {
    // Past + resultative in the clause is a pluperfect ("gegessen hatte"), not the simple past the
    // aspect-drop used to collapse it into.
    expect(matrix(
      { tense: 'future', aspect: 'progressive' },
      { tense: 'past', aspect: 'resultative' },
    )).toMatchObject({ de: 'der Kater, der gegessen hatte, wird gerade die Maus sehen.' });
  });

  test('German renders a future perfect inside a relative clause', () => {
    // Future + resultative stacks the auxiliary's infinitive behind the participle, with "werden"
    // finite and clause-final: "gegessen haben wird".
    expect(matrix({}, { tense: 'future', aspect: 'resultative' }).de)
      .toBe('der Kater, der gegessen haben wird, sieht die Maus.');
  });

  test('German orders the clause object before the resultative participle', () => {
    // The aspect does not disturb the verb-final order: the object still precedes the
    // participle + auxiliary ("die Maus gegessen hat").
    expect(sayAll(clause(
      np('CAT', { relative: { verbPhrase: { verb: 'EAT', aspect: 'resultative' }, directObject: np('MOUSE') } }),
      'RUN',
    )).de).toBe('der Kater, der die Maus gegessen hat, läuft.');
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
      en: 'the cat that eats the mouse that will run saw the dog.',
      it: 'il gatto che mangia il topo che correrà vide il cane.',
      fr: 'le chat qui mange la souris qui courra vit le chien.',
      es: 'el gato que come el ratón que correrá vio el perro.',
      pt: 'o gato que come o rato que correrá viu o cão.',
    });
  });

  test('future matrix, past outer, present inner', () => {
    expect(nested({ tense: 'future' }, { tense: 'past' }, {})).toMatchObject({
      en: 'the cat that ate the mouse that runs will see the dog.',
      it: 'il gatto che mangiò il topo che corre vedrà il cane.',
      fr: 'le chat qui mangea la souris qui court verra le chien.',
      // Each German clause is verb-final on its own: "die läuft," inside "der … aß,".
      de: 'der Kater, der die Maus, die läuft, aß, wird den Hund sehen.',
    });
  });

  test('present matrix, future outer, past inner', () => {
    expect(nested({}, { tense: 'future' }, { tense: 'past' })).toMatchObject({
      en: 'the cat that will eat the mouse that ran sees the dog.',
      it: 'il gatto che mangerà il topo che corse vede il cane.',
      es: 'el gato que comerá el ratón que corrió ve el perro.',
      de: 'der Kater, der die Maus, die lief, essen wird, sieht den Hund.',
    });
  });
});

describe('nested relative clauses: three aspects at once', () => {
  test('progressive matrix, resultative outer, prospective inner', () => {
    expect(nested(
      { aspect: 'progressive' }, { aspect: 'resultative' }, { aspect: 'prospective' },
    )).toMatchObject({
      en: 'the cat that has eaten the mouse that is about to run is seeing the dog.',
      it: 'il gatto che ha mangiato il topo che sta per correre sta vedendo il cane.',
      fr: 'le chat qui a mangé la souris qui est sur le point de courir est en train de voir le chien.',
      es: 'el gato que ha comido el ratón que está a punto de correr está viendo el perro.',
    });
  });

  test('resultative matrix, prospective outer, progressive inner', () => {
    expect(nested(
      { aspect: 'resultative' }, { aspect: 'prospective' }, { aspect: 'progressive' },
    )).toMatchObject({
      en: 'the cat that is about to eat the mouse that is running has seen the dog.',
      it: 'il gatto che sta per mangiare il topo che sta correndo ha visto il cane.',
      pt: 'o gato que está prestes a comer o rato que está correndo viu o cão.',
    });
  });

  test('prospective matrix, progressive outer, resultative inner', () => {
    expect(nested(
      { aspect: 'prospective' }, { aspect: 'progressive' }, { aspect: 'resultative' },
    )).toMatchObject({
      en: 'the cat that is eating the mouse that has run is about to see the dog.',
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
      en: 'the cat that is eating the mouse that will be about to run had seen the dog.',
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
      en: 'the cat that was about to eat the mouse that has run will be seeing the dog.',
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
  // The German aspect-drop used to compound with depth: every relative clause fell back to a plain
  // tense, so a three-level plan lost an aspect at every level. Now each level renders its own:
  // the outer clause is a perfect ("gegessen hat"), the inner a prospective ("im Begriff zu laufen
  // ist"), and only the matrix stays a progressive ("sieht gerade").
  test('German renders an aspect at every relative depth, not just the matrix', () => {
    const de = nested(
      { aspect: 'progressive' }, { aspect: 'resultative' }, { aspect: 'prospective' },
    ).de;
    expect(de).toBe('der Kater, der die Maus, die im Begriff zu laufen ist, gegessen hat, sieht gerade den Hund.');
  });

  test('…and the TENSE still survives at every depth alongside it', () => {
    // Same nest, tenses instead of aspects: all three levels render. The path exists.
    expect(nested({}, { tense: 'future' }, { tense: 'past' }))
      .toMatchObject({ de: 'der Kater, der die Maus, die lief, essen wird, sieht den Hund.' });
  });
});
