import { describe, expect, test } from 'vitest';
import type { Complement, ComplementType, NounPhrase, RelativeClause, VerbPhrase } from '@signi/shared';
import { clause, furigana, np, sayAll } from './harness.js';

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
      de: 'der Kater, der die Maus frisst, läuft.',
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
      de: 'die Maus, die der Kater frisst, läuft.',
    });
  });

  test('the clause carries its own tense', () => {
    expect(sayAll(clause(np('DOG'), 'SEE', {
      directObject: np('CAT', { relative: { verbPhrase: { verb: 'EAT', tense: 'past' } } }),
    }))).toMatchObject({
      en: 'the dog sees the cat that ate.',
      it: 'il cane vede il gatto che mangiò.',
      fr: 'le chien voit le chat qui mangea.',
      de: 'der Hund sieht den Kater, der fraß.',
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
  // The English engine now keys the relativiser off PERSONHOOD, not animacy: an animal is animate and still
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
      .toMatchObject({ de: 'der Kater, der frisst, läuft.' });
  });

  // The closing comma merges with the sentence-final full stop when the clause ends the sentence:
  // no ", ." — just ".". (The head noun is the matrix direct object, so the clause is last.)
  test('German drops the closing comma into the sentence-final stop', () => {
    expect(sayAll(clause(np('DOG'), 'SEE', {
      directObject: np('CAT', { relative: { verbPhrase: { verb: 'EAT' } } }),
    })).de).toBe('der Hund sieht den Kater, der frisst.');
  });

  // The clearest bug in the engine: the Japanese engine's own comment says the clause verb "takes the *plain*
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
      de: 'der Kater, der fraß, sieht die Maus.',
    });

    expect(matrix({ tense: 'past' }, {})).toMatchObject({
      en: 'the cat that eats saw the mouse.',
      it: 'il gatto che mangia vide il topo.', // mangia present, vide past
      es: 'el gato que come vio el ratón.',
      de: 'der Kater, der frisst, sah die Maus.',
    });
  });

  test('a future clause under a past matrix — the two tenses need not be ordered', () => {
    expect(matrix({ tense: 'past' }, { tense: 'future' })).toMatchObject({
      en: 'the cat that will eat saw the mouse.',
      it: 'il gatto che mangerà vide il topo.',
      fr: 'le chat qui mangera vit la souris.',
      de: 'der Kater, der fressen wird, sah die Maus.', // verb-final: the auxiliary goes last
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
      de: 'der Kater, der frisst, hat die Maus gesehen.', // the matrix aspect DOES render
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
      de: 'der Kater, der frisst, sieht die Maus nicht.',
    });

    expect(matrix({}, { negative: true })).toMatchObject({
      en: 'the cat that does not eat sees the mouse.',
      fr: 'le chat qui ne mange pas voit la souris.',
      de: 'der Kater, der nicht frisst, sieht die Maus.', // negation survives into the clause
      ja: '食べない猫はネズミを見ます。', // the plain negative before the head noun (B13)
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
      de: 'der Kater, der fressen kann, sieht die Maus.', // modal goes final, like the tense auxiliary
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
      .toMatchObject({ de: 'der Kater, der gefressen hat, sieht die Maus.' });
  });

  test('German renders a progressive inside a relative clause', () => {
    // "der gerade isst" — the adverbial progressive German uses everywhere else, unaffected by the
    // matrix clause carrying an aspect of its own ("hat … gesehen").
    expect(matrix({ aspect: 'resultative' }, { aspect: 'progressive' }).de)
      .toBe('der Kater, der gerade frisst, hat die Maus gesehen.');
  });

  test('German renders a prospective inside a relative clause', () => {
    // "im Begriff zu essen", with the finite "ist" pushed to the clause end (verb-final).
    expect(matrix({}, { aspect: 'prospective' }).de)
      .toBe('der Kater, der im Begriff zu fressen ist, sieht die Maus.');
  });

  test('German keeps BOTH the tense and the aspect of a relative clause', () => {
    // Past + resultative in the clause is a pluperfect ("gegessen hatte"), not the simple past the
    // aspect-drop used to collapse it into.
    expect(matrix(
      { tense: 'future', aspect: 'progressive' },
      { tense: 'past', aspect: 'resultative' },
    )).toMatchObject({ de: 'der Kater, der gefressen hatte, wird gerade die Maus sehen.' });
  });

  test('German renders a future perfect inside a relative clause', () => {
    // Future + resultative stacks the auxiliary's infinitive behind the participle, with "werden"
    // finite and clause-final: "gegessen haben wird".
    expect(matrix({}, { tense: 'future', aspect: 'resultative' }).de)
      .toBe('der Kater, der gefressen haben wird, sieht die Maus.');
  });

  test('German orders the clause object before the resultative participle', () => {
    // The aspect does not disturb the verb-final order: the object still precedes the
    // participle + auxiliary ("die Maus gegessen hat").
    expect(sayAll(clause(
      np('CAT', { relative: { verbPhrase: { verb: 'EAT', aspect: 'resultative' }, directObject: np('MOUSE') } }),
      'RUN',
    )).de).toBe('der Kater, der die Maus gefressen hat, läuft.');
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
      de: 'der Kater, der die Maus, die läuft, fraß, wird den Hund sehen.',
    });
  });

  test('present matrix, future outer, past inner', () => {
    expect(nested({}, { tense: 'future' }, { tense: 'past' })).toMatchObject({
      en: 'the cat that will eat the mouse that ran sees the dog.',
      it: 'il gatto che mangerà il topo che corse vede il cane.',
      es: 'el gato que comerá el ratón que corrió ve el perro.',
      de: 'der Kater, der die Maus, die lief, fressen wird, sieht den Hund.',
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
    // Each relative clause closes on the plain form of its aspect (B14): the prospective 〜ようとしている
    // and the progressive 〜ている, where only the matrix clause is polite. The matrix past perfect "had
    // seen" is the past resultant state 見ていました (B05).
    expect(nested(
      { tense: 'past', aspect: 'resultative' },
      { aspect: 'progressive' },
      { tense: 'future', aspect: 'prospective' },
    ).ja).toBe('走ろうとしているネズミを食べている猫は犬を見ていました。');
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
    expect(de).toBe('der Kater, der die Maus, die im Begriff zu laufen ist, gefressen hat, sieht gerade den Hund.');
  });

  test('…and the TENSE still survives at every depth alongside it', () => {
    // Same nest, tenses instead of aspects: all three levels render. The path exists.
    expect(nested({}, { tense: 'future' }, { tense: 'past' }))
      .toMatchObject({ de: 'der Kater, der die Maus, die lief, fressen wird, sieht den Hund.' });
  });
});

// A50. The relative clause builds its own "nicht" slot and misses the rules the main clause
// (`renderClause`) applies: a "kein" object already negates, "nicht" leads a predicate complement
// and a Mittelfeld adverb, and it scopes over the whole prospective (A19, fixed only in the main clause).
describe('known bugs: German negation inside a relative clause', () => {
  const dogWho = (relative: RelativeClause) => sayAll(clause(np('DOG', { relative }), 'RUN')).de;

  test('German negates a relative clause the way it negates a main clause', () => {
    expect(dogWho({ verbPhrase: { verb: 'EAT', negative: true }, directObject: np('MOUSE', { definiteness: 'no' }) }))
      .toBe('der Hund, der keine Maus frisst, läuft.');
    expect(dogWho({ verbPhrase: { verb: 'BECOME', negative: true }, complements: { predicative: { phrase: np('TIRED') } } }))
      .toBe('der Hund, der nicht müde wird, läuft.');
    expect(dogWho({ verbPhrase: { verb: 'EAT', negative: true, modifier: 'ALWAYS' } }))
      .toBe('der Hund, der nicht immer frisst, läuft.');
    expect(dogWho({ verbPhrase: { verb: 'EAT', negative: true, aspect: 'prospective' } }))
      .toBe('der Hund, der nicht im Begriff zu fressen ist, läuft.');
  });

  test('German "nicht" leads any adverb, after an object and ahead of a predicate complement', () => {
    expect(dogWho({ verbPhrase: { verb: 'EAT', negative: true, modifier: 'ALWAYS' }, directObject: np('MOUSE') }))
      .toBe('der Hund, der die Maus nicht immer frisst, läuft.');
    expect(dogWho({ verbPhrase: { verb: 'EAT', modals: [{ verb: 'MUST', modifier: 'ALWAYS', negative: true }] } }))
      .toBe('der Hund, der nicht immer fressen muss, läuft.');
    expect(dogWho({ verbPhrase: { verb: 'BECOME', negative: true, modifier: 'ALWAYS' }, complements: { predicative: { phrase: np('TIRED') } } }))
      .toBe('der Hund, der nicht immer müde wird, läuft.');
    expect(sayAll(clause(np('MOUSE', {
      relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'EAT', negative: true, modifier: 'ALWAYS' } },
    }), 'RUN')).de).toBe('die Maus, die der Kater nicht immer frisst, läuft.');
  });

  test('German negates the relative the same way in another tense or aspect', () => {
    expect(dogWho({ verbPhrase: { verb: 'EAT', negative: true, tense: 'future' }, directObject: np('MOUSE', { definiteness: 'no' }) }))
      .toBe('der Hund, der keine Maus fressen wird, läuft.');
    expect(dogWho({ verbPhrase: { verb: 'BECOME', negative: true, aspect: 'resultative' }, complements: { predicative: { phrase: np('TIRED') } } }))
      .toBe('der Hund, der nicht müde geworden ist, läuft.');
    expect(dogWho({ verbPhrase: { verb: 'EAT', negative: true, aspect: 'prospective' }, directObject: np('MOUSE') }))
      .toBe('der Hund, der nicht im Begriff ist, die Maus zu fressen, läuft.');
    // An un-negated verb with a "kein" object is negative all the same.
    expect(dogWho({ verbPhrase: { verb: 'EAT' }, directObject: np('MOUSE', { definiteness: 'no' }) }))
      .toBe('der Hund, der keine Maus frisst, läuft.');
  });

  test('regression: "nicht" still trails the objects, "nie" still replaces it', () => {
    expect(dogWho({ verbPhrase: { verb: 'EAT', negative: true }, directObject: np('MOUSE') }))
      .toBe('der Hund, der die Maus nicht frisst, läuft.');
    expect(dogWho({ verbPhrase: { verb: 'EAT', negative: true, modifier: 'NEVER' } }))
      .toBe('der Hund, der nie frisst, läuft.');
    // An adverb now leads the other complements, as in the main clause, instead of trailing them.
    expect(dogWho({ verbPhrase: { verb: 'EAT', modifier: 'ALWAYS' }, complements: { locative: { phrase: np('MARKET') } } }))
      .toBe('der Hund, der immer im Markt frisst, läuft.');
  });
});

// A51. A `process` instrumental is a subordinate "indem" clause, which the main clause moves to the
// Nachfeld (`splitMeansClause`). The relative clause never splits it out, so it lands mid-clause,
// before the relative's own verb. Its subject is the relative clause's own, as a pronoun (B06).
describe('known bugs: German means clause inside a relative clause', () => {
  const dogWho = (relative: RelativeClause) => sayAll(clause(np('DOG', { relative }), 'RUN')).de;
  const byChoosing = (value: 'process' | 'concept'): Complement => ({
    phrase: np('WORD', { definiteness: 'indefinite' }),
    specifiers: [{ kind: 'abstraction', value }],
    action: { verb: 'CHOOSE' },
  });

  test('German puts the "indem" clause after the relative clause\'s verb', () => {
    expect(sayAll(clause(np('DOG', {
      relative: {
        verbPhrase: { verb: 'EAT' },
        complements: {
          instrumental: {
            phrase: np('WORD', { definiteness: 'indefinite' }),
            specifiers: [{ kind: 'abstraction', value: 'process' }],
            action: { verb: 'CHOOSE' },
          },
        },
      },
    }), 'RUN')).de).toBe('der Hund, der frisst, indem er ein Wort wählt, läuft.');
  });

  test('German keeps the "indem" clause last with an object, a tense, a negation or an object relative', () => {
    const instrumental = byChoosing('process');
    expect(dogWho({ verbPhrase: { verb: 'EAT' }, directObject: np('MOUSE'), complements: { instrumental } }))
      .toBe('der Hund, der die Maus frisst, indem er ein Wort wählt, läuft.');
    expect(dogWho({ verbPhrase: { verb: 'EAT', aspect: 'resultative' }, complements: { instrumental } }))
      .toBe('der Hund, der gefressen hat, indem er ein Wort wählt, läuft.');
    expect(dogWho({ verbPhrase: { verb: 'EAT', negative: true }, complements: { instrumental } }))
      .toBe('der Hund, der nicht frisst, indem er ein Wort wählt, läuft.');
    expect(sayAll(clause(np('MOUSE', {
      relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'EAT' }, complements: { instrumental } },
    }), 'RUN')).de).toBe('die Maus, die der Kater frisst, indem er ein Wort wählt, läuft.');
  });

  test('German closes a sentence-final relative on the "indem" clause', () => {
    expect(sayAll(clause(np('DOG'), 'SEE', {
      directObject: np('CAT', { relative: { verbPhrase: { verb: 'EAT' }, complements: { instrumental: byChoosing('process') } } }),
    })).de).toBe('der Hund sieht den Kater, der frisst, indem er ein Wort wählt.');
  });

  test('regression: a concept-level instrument is a phrase and stays before the verb', () => {
    expect(dogWho({ verbPhrase: { verb: 'EAT' }, complements: { instrumental: byChoosing('concept') } }))
      .toBe('der Hund, der mit dem Wählen eines Wortes frisst, läuft.');
  });
});

// A62. The UI can relativise on a complement slot ("the house the cat eats IN"), but the engines
// render the relative as if the head were the direct object: English "the house that the cat
// eats", German the accusative "das". The relative needs the complement's preposition and case.
// Only English and German are pinned; see the bug file for the Romance targets.
describe('known bugs: relative clause on a complement slot', () => {
  test('the relative keeps the complement\'s preposition and case', () => {
    // A plain locative is the relative adverb where German has none to prefer (C07, see below).
    expect(sayAll(clause(np('HOUSE', {
      relative: { headRole: 'locative', subject: np('CAT'), verbPhrase: { verb: 'EAT' } },
    }), 'BURN'))).toMatchObject({
      en: 'the house where the cat eats burns.',
      de: 'das Haus, in dem der Kater frisst, brennt.',
    });
    expect(sayAll(clause(np('BOY', {
      relative: { headRole: 'terminus', subject: np('MAN'), verbPhrase: { verb: 'GIVE' }, directObject: np('BOOK') },
    }), 'RUN'))).toMatchObject({
      en: 'the boy to whom the man gives the book runs.',
      de: 'der Junge, dem der Mann das Buch gibt, läuft.',
    });
  });

  // The Romance languages have several standard forms; the engines take the preposition with the
  // article and "il quale" / "lequel" / "el que" / "o qual", which falls out of each complement path.
  test('the Romance languages take the complement\'s preposition with an agreeing "quale / lequel / que / qual"', () => {
    expect(sayAll(clause(np('HOUSE', {
      relative: { headRole: 'locative', subject: np('CAT'), verbPhrase: { verb: 'EAT' }, headSpecifiers: [{ kind: 'path', value: 'behind' }] },
    }), 'BURN'))).toMatchObject({
      it: 'la casa dietro la quale il gatto mangia brucia.',
      fr: 'la maison derrière laquelle le chat mange brûle.',
      es: 'la casa detrás de la que el gato come arde.',
      pt: 'a casa atrás da qual o gato come arde.',
    });
    expect(sayAll(clause(np('BOY', {
      relative: { headRole: 'terminus', subject: np('MAN'), verbPhrase: { verb: 'GIVE' }, directObject: np('BOOK') },
    }), 'RUN'))).toMatchObject({
      it: 'il ragazzo al quale l\'uomo dà il libro corre.',
      fr: 'le garçon auquel l\'homme donne le livre court.',
      es: 'el niño al que el hombre da el libro corre.',
      pt: 'o menino ao qual o homem dá o livro corre.',
    });
  });

  const gapped = (head: string, headRole: ComplementType, verb: string, extra: Partial<RelativeClause> = {}, headExtra: Partial<NounPhrase> = {}) => {
    const all = sayAll(clause(np(head, { ...headExtra, relative: { headRole, subject: np('CAT'), verbPhrase: { verb }, ...extra } }), 'BURN'));
    return { en: all.en, de: all.de, it: all.it, fr: all.fr, es: all.es, pt: all.pt };
  };

  test('the gap\'s specifiers pick the preposition, and the relativizer agrees in gender and number', () => {
    expect(gapped('HOUSE', 'locative', 'EAT', { headSpecifiers: [{ kind: 'path', value: 'under' }] })).toEqual({
      en: 'the house under which the cat eats burns.',
      de: 'das Haus, unter dem der Kater frisst, brennt.',
      it: 'la casa sotto la quale il gatto mangia brucia.',
      fr: 'la maison sous laquelle le chat mange brûle.',
      es: 'la casa debajo de la que el gato come arde.',
      pt: 'a casa debaixo da qual o gato come arde.',
    });
    expect(gapped('HOUSE', 'locative', 'EAT', { headSpecifiers: [{ kind: 'path', value: 'around' }] }, { number: 'plural' })).toEqual({
      en: 'the houses around which the cat eats burn.',
      de: 'die Häuser, um die der Kater frisst, brennen.',
      it: 'le case intorno alle quali il gatto mangia bruciano.',
      fr: 'les maisons autour desquelles le chat mange brûlent.',
      es: 'las casas alrededor de las que el gato come arden.',
      pt: 'as casas ao redor das quais o gato come ardem.',
    });
    expect(gapped('DOG', 'cause', 'RUN', { headSpecifiers: [{ kind: 'sentiment', value: 'negative' }] })).toEqual({
      en: 'the dog through the fault of which the cat runs burns.',
      de: 'der Hund, durch dessen Schuld der Kater läuft, brennt.',
      it: 'il cane per colpa del quale il gatto corre brucia.',
      fr: 'le chien par la faute duquel le chat court brûle.',
      es: 'el perro por culpa del que el gato corre arde.',
      pt: 'o cão por culpa do qual o gato corre arde.',
    });
    expect(gapped('WOMAN', 'cause', 'RUN', { headSpecifiers: [{ kind: 'sentiment', value: 'positive' }] })).toEqual({
      en: 'the woman thanks to whom the cat runs burns.',
      de: 'die Frau, dank der der Kater läuft, brennt.',
      it: 'la donna grazie alla quale il gatto corre brucia.',
      fr: 'la femme grâce à laquelle le chat court brûle.',
      es: 'la mujer gracias a la que el gato corre arde.',
      pt: 'a mulher graças à qual o gato corre arde.',
    });
  });

  test('every other complement takes its own preposition and case', () => {
    expect(gapped('HOUSE', 'source', 'COME')).toEqual({
      en: 'the house from which the cat comes burns.',
      de: 'das Haus, aus dem der Kater kommt, brennt.',
      it: 'la casa dalla quale il gatto viene brucia.',
      fr: 'la maison de laquelle le chat vient brûle.',
      es: 'la casa de la que el gato viene arde.',
      pt: 'a casa da qual o gato vem arde.',
    });
    // The source's ablative "via / loin / lejos / longe" belongs to the verb's own complement, not to the relativizer.
    expect(gapped('HOUSE', 'source', 'RUN').it).toBe('la casa dalla quale il gatto corre brucia.');
    expect(gapped('MARKET', 'direction', 'GO')).toEqual({
      en: 'the market to which the cat goes burns.',
      de: 'der Markt, zu dem der Kater geht, brennt.',
      it: 'il mercato al quale il gatto va brucia.',
      fr: 'le marché auquel le chat va brûle.',
      es: 'el mercado al que el gato va arde.',
      pt: 'o mercado ao qual o gato vai arde.',
    });
    expect(sayAll(clause(np('STICK', {
      relative: { headRole: 'instrumental', subject: np('MAN'), verbPhrase: { verb: 'CUT' }, directObject: np('BOOK') },
    }), 'BURN'))).toMatchObject({
      en: 'the stick with which the man cuts the book burns.',
      de: 'der Stock, mit dem der Mann das Buch schneidet, brennt.',
      it: 'il bastone con il quale l\'uomo taglia il libro brucia.',
      fr: 'le bâton avec lequel l\'homme coupe le livre brûle.',
      es: 'el palo con el que el hombre corta el libro arde.',
      pt: 'o pau com o qual o homem corta o livro arde.',
    });
    expect(gapped('SPEED', 'manner', 'RUN')).toEqual({
      en: 'the speed at which the cat runs burns.',
      de: 'die Geschwindigkeit, mit der der Kater läuft, brennt.',
      it: 'la velocità alla quale il gatto corre brucia.',
      fr: 'la vitesse à laquelle le chat court brûle.',
      es: 'la velocidad a la que el gato corre arde.',
      pt: 'a velocidade à qual o gato corre arde.',
    });
  });

  test('German declines the pronoun for the case the preposition governs', () => {
    expect(gapped('BOY', 'terminus', 'GIVE', { directObject: np('BOOK') }, { number: 'plural' }).de).toBe('die Jungen, denen der Kater das Buch gibt, brennen.');
    expect(gapped('WOMAN', 'terminus', 'GIVE', { directObject: np('BOOK') }).de).toBe('die Frau, der der Kater das Buch gibt, brennt.');
    // An inanimate goal takes "in" + the accusative, which a relative pronoun never fuses with.
    expect(gapped('CONTAINER', 'terminus', 'SAVE', { directObject: np('BOOK') }).de).toBe('der Behälter, in den der Kater das Buch speichert, brennt.');
    expect(gapped('HOUSE', 'route', 'RUN', { headSpecifiers: [{ kind: 'path', value: 'through' }] }).de).toBe('das Haus, durch das der Kater läuft, brennt.');
    expect(gapped('WOMAN', 'cause', 'RUN', { headSpecifiers: [{ kind: 'sentiment', value: 'negative' }] }).de).toBe('die Frau, durch deren Schuld der Kater läuft, brennt.');
    expect(gapped('TIME', 'manner', 'RUN').de).toBe('die Zeit, zu der der Kater läuft, brennt.');
  });

  test('a predicate-noun gap takes no preposition, and German puts its pronoun in the nominative', () => {
    expect(gapped('DOG', 'predicative', 'BECOME')).toEqual({
      en: 'the dog that the cat becomes burns.',
      de: 'der Hund, der der Kater wird, brennt.',
      it: 'il cane che il gatto diventa brucia.',
      fr: 'le chien que le chat devient brûle.',
      es: 'el perro que el gato se vuelve arde.',
      pt: 'o cão que o gato se torna arde.',
    });
  });
});

// C07. A place noun is defined by what happens there: HOME is "a place where one lives". The head fills
// the clause's locative slot, co-indexed with a locative adjunct, while the clause keeps its own
// (often generic) subject. When the relation is the plain default `in`, every language with a locative
// relative adverb uses it instead of the preposition + relative pronoun a marked relation needs.
// German keeps its prepositional pronoun, and Japanese needs no relativizer at all.
describe('locative relative clause: the place where', () => {
  const placeWhere = (verb: string, rest: Partial<RelativeClause> = {}, head: Partial<NounPhrase> = {}) => ({
    subject: np('PLACE', {
      definiteness: 'indefinite',
      ...head,
      relative: { headRole: 'locative', subject: np('GENERIC_PERSON'), verbPhrase: { verb }, ...rest },
    }),
  });

  test('a place where one does something, in every language', () => {
    expect(sayAll(placeWhere('EAT'))).toEqual({
      en: 'a place where one eats.',
      it: 'un luogo dove si mangia.',
      fr: "un lieu où l'on mange.",
      de: 'ein Ort, an dem man isst.',
      es: 'un lugar donde se come.',
      ja: '食べる場所。',
      pt: 'um lugar onde se come.',
    });
  });

  test('the clause keeps its own object, negation and tense', () => {
    expect(sayAll(placeWhere('BUY', { directObject: np('OBJECT_THING', { definiteness: 'bare', number: 'plural' }) }))).toMatchObject({
      en: 'a place where one buys objects.',
      it: 'un luogo dove si comprano oggetti.',
      fr: "un lieu où l'on achète des objets.", // the object's partitive (A149)
      de: 'ein Ort, an dem man Gegenstände kauft.',
      es: 'un lugar donde se compran objetos.',
      ja: '物体を買う場所。',
    });
    expect(sayAll(placeWhere('EAT', { verbPhrase: { verb: 'EAT', negative: true } }))).toMatchObject({
      en: 'a place where one does not eat.',
      it: 'un luogo dove non si mangia.',
      fr: "un lieu où l'on ne mange pas.",
      de: 'ein Ort, an dem man nicht isst.',
      es: 'un lugar donde no se come.',
      pt: 'um lugar onde não se come.',
    });
    expect(sayAll(placeWhere('EAT', { verbPhrase: { verb: 'EAT', tense: 'past' } }))).toMatchObject({
      en: 'a place where one ate.',
      fr: "un lieu où l'on mangea.",
      de: 'ein Ort, an dem man aß.',
    });
  });

  test('a specific subject, a plural head and a sentence around it', () => {
    expect(sayAll(clause(np('HOUSE', {
      number: 'plural',
      relative: { headRole: 'locative', subject: np('CAT'), verbPhrase: { verb: 'EAT' } },
    }), 'BURN'))).toEqual({
      en: 'the houses where the cat eats burn.',
      it: 'le case dove il gatto mangia bruciano.',
      fr: 'les maisons où le chat mange brûlent.',
      de: 'die Häuser, in denen der Kater frisst, brennen.',
      es: 'las casas donde el gato come arden.',
      ja: '猫が食べる家は燃えます。',
      pt: 'as casas onde o gato come ardem.',
    });
  });

  test('choosing the default relation is the same place as leaving it out', () => {
    const house = (headSpecifiers?: RelativeClause['headSpecifiers']) => sayAll(clause(np('HOUSE', {
      relative: { headRole: 'locative', subject: np('CAT'), verbPhrase: { verb: 'EAT' }, ...(headSpecifiers ? { headSpecifiers } : {}) },
    }), 'BURN'));
    expect(house([{ kind: 'path', value: 'in' }])).toEqual(house());
  });

  test('regression: a marked relation keeps its preposition', () => {
    expect(sayAll(placeWhere('EAT', { headSpecifiers: [{ kind: 'path', value: 'under' }] }))).toMatchObject({
      en: 'a place under which one eats.',
      it: 'un luogo sotto il quale si mangia.',
      fr: 'un lieu sous lequel on mange.',
      de: 'ein Ort, unter dem man isst.',
    });
  });

  test('regression: où takes the euphonic l\' only before the generic on', () => {
    expect(sayAll(clause(np('HOUSE', {
      relative: { headRole: 'locative', subject: np('FIRST_PERSON'), verbPhrase: { verb: 'EAT', aspect: 'resultative' } },
    }), 'BURN')).fr).toBe("la maison où j'ai mangé brûle.");
    expect(sayAll(clause(np('FOOD', {
      relative: { headRole: 'directObject', subject: np('GENERIC_PERSON'), verbPhrase: { verb: 'EAT' } },
    }), 'BURN')).fr).toBe("la nourriture qu'on mange brûle.");
  });
});

// B13 (fixed). A negated relative clause or citation used to fall back to the polite verbSeg
// (食べません猫, 食べません。). A prenominal clause and a citation both take the plain form, so the
// negative is the plain one, built on the seeded nai-form: 食べない猫, 食べなかった猫, 食べない。
describe('Japanese plain negative', () => {
  test('Japanese uses the plain negative in a relative clause and a citation', () => {
    const eatsWho = (verbPhrase: object) =>
      sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT', ...verbPhrase } } }), 'RUN')).ja;
    expect(eatsWho({ negative: true })).toBe('食べない猫は走ります。');
    expect(eatsWho({ negative: true, tense: 'past' })).toBe('食べなかった猫は走ります。');
    expect(eatsWho({ modifier: 'NEVER' })).toBe('決して食べない猫は走ります。');
    expect(sayAll({ ...clause(np('GENERIC_PERSON'), 'EAT', { verbPhrase: { negative: true } }), infinitive: true }).ja)
      .toBe('食べない。');
  });

  test('a negative-concord argument and an object gap take the plain negative too', () => {
    expect(sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT' }, directObject: np('MOUSE', { definiteness: 'no' }) } }), 'RUN')).ja)
      .toBe('どのネズミも食べない猫は走ります。');
    expect(sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT', negative: true }, directObject: np('MOUSE') } }), 'RUN')).ja)
      .toBe('ネズミを食べない猫は走ります。');
    expect(sayAll(clause(np('MOUSE', {
      relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'EAT', negative: true, tense: 'past' } },
    }), 'RUN')).ja).toBe('猫が食べなかったネズミは走ります。');
  });

  test('every verb class reads its own seeded nai-form', () => {
    const who = (verb: string, verbPhrase: object = {}, extra: object = {}) =>
      sayAll(clause(np('CAT', { relative: { verbPhrase: { verb, negative: true, ...verbPhrase }, ...extra } }), 'RUN')).ja;
    expect(who('RUN')).toBe('走らない猫は走ります。'); // a godan -る verb, not *走るない
    expect(who('COME')).toBe('来ない猫は走ります。');
    expect(who('COME', { tense: 'past' })).toBe('来なかった猫は走ります。');
    expect(who('CONSUME', { tense: 'past' })).toBe('摂取しなかった猫は走ります。');
    // The state verbs keep the plain form a relative takes, not the 〜ている of a main clause.
    expect(who('HAVE', {}, { directObject: np('BOOK') })).toBe('本を持たない猫は走ります。');
    expect(who('KNOW', {}, { directObject: np('BOOK') })).toBe('本を知らない猫は走ります。');
    // The existential and the passive are verbs of their own, with their own nai-forms.
    expect(who('BE', {}, { complements: { locative: { phrase: np('HOUSE') } } })).toBe('家にいない猫は走ります。');
    expect(sayAll(clause(np('FOOD', {
      relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'EAT', voice: 'passive', negative: true } },
    }), 'RUN')).ja).toBe('猫に食べられない食べ物は走ります。');
  });

  test('the furigana follows the nai-form, not the dictionary form', () => {
    // 来る reads く, but 来ない reads こ.
    expect(furigana(clause(np('CAT', { relative: { verbPhrase: { verb: 'COME', negative: true, tense: 'past' } } }), 'RUN')))
      .toEqual(['こなかった', 'ねこ', 'はしります']);
  });

  test('regression: the main clause keeps its polite negative', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { negative: true } })).ja).toBe('猫は食べません。');
    expect(sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT', negative: true } } }), 'RUN', { verbPhrase: { negative: true } })).ja)
      .toBe('食べない猫は走りません。');
  });
});

// B14 (fixed). `aspectVerbSegs` used to build only the polite forms, so an aspectual relative clause
// kept 〜ています / 〜てしまいます before its head noun (食べています猫). It now takes the relative clause's
// plain ending: the fixed auxiliary goes plain (食べている猫, 食べていない猫), and the prospective, whose
// ところです has no prenominal form, is 〜ようとしている, "is about to" (食べようとしている猫).
describe('Japanese aspect in a relative clause', () => {
  const who = (verbPhrase: Partial<VerbPhrase>, extra: Partial<RelativeClause> = {}) =>
    sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT', ...verbPhrase }, ...extra } }), 'RUN')).ja;

  test('Japanese puts an aspectual relative clause in the plain form', () => {
    const eatsWho = (aspect: 'progressive' | 'resultative') =>
      sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT', aspect } } }), 'RUN')).ja;
    expect(eatsWho('progressive')).toBe('食べている猫は走ります。');
    expect(eatsWho('resultative')).toBe('食べた猫は走ります。');
  });

  test('the progressive takes the plain いる in every tense and polarity', () => {
    expect(who({ aspect: 'progressive', tense: 'past' })).toBe('食べていた猫は走ります。');
    expect(who({ aspect: 'progressive', tense: 'future' })).toBe('食べている猫は走ります。');
    // The negative is the fixed いない, so it needs no nai-form of the verb's own.
    expect(who({ aspect: 'progressive', negative: true })).toBe('食べていない猫は走ります。');
    expect(who({ aspect: 'progressive', negative: true, tense: 'past' })).toBe('食べていなかった猫は走ります。');
    expect(who({ aspect: 'progressive', modifier: 'NEVER' })).toBe('決して食べていない猫は走ります。');
  });

  test('the prospective is 〜ようとしている on the volitional', () => {
    expect(who({ aspect: 'prospective' })).toBe('食べようとしている猫は走ります。');
    expect(who({ aspect: 'prospective', tense: 'past' })).toBe('食べようとしていた猫は走ります。');
    expect(who({ aspect: 'prospective', negative: true })).toBe('食べようとしていない猫は走ります。');
    expect(who({ aspect: 'prospective', negative: true, tense: 'past' })).toBe('食べようとしていなかった猫は走ります。');
    // A godan verb moves to the お row (走ろう), する and 来る take よう (摂取しよう, 来よう).
    expect(who({ verb: 'RUN', aspect: 'prospective' })).toBe('走ろうとしている猫は走ります。');
    expect(who({ verb: 'CONSUME', aspect: 'prospective' })).toBe('摂取しようとしている猫は走ります。');
    expect(who({ verb: 'COME', aspect: 'prospective' })).toBe('来ようとしている猫は走ります。');
    expect(furigana(clause(np('CAT', { relative: { verbPhrase: { verb: 'COME', aspect: 'prospective' } } }), 'RUN')))
      .toEqual(['こよう', 'ねこ', 'はしります']);
  });

  test('an object, an object gap, a passive and a state verb all close on the plain aspect', () => {
    expect(who({ aspect: 'progressive' }, { directObject: np('MOUSE') })).toBe('ネズミを食べている猫は走ります。');
    expect(who({ verb: 'HAVE', aspect: 'progressive' }, { directObject: np('BOOK') })).toBe('本を持っている猫は走ります。');
    expect(sayAll(clause(np('MOUSE', {
      relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'EAT', aspect: 'progressive' } },
    }), 'RUN')).ja).toBe('猫が食べているネズミは走ります。');
    expect(sayAll(clause(np('FOOD', {
      relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'EAT', voice: 'passive', aspect: 'progressive' } },
    }), 'RUN')).ja).toBe('猫に食べられている食べ物は走ります。');
  });

  test('regression: the main clause keeps its polite aspect', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'progressive' } })).ja).toBe('猫は食べています。');
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective' } })).ja).toBe('猫は食べるところです。');
  });
});

// A116. `predicateSegs` hands its `plain` flag only to the neutral-aspect verb branch. A relative
// clause with a modal (modalSegs) or a copula (copulaSegs) keeps its polite ます/です in front of the
// head noun: 食べることができます猫, 幸せです猫. Their plain endings are fixed and need no nai-form,
// unlike the documented negation/aspect gaps.
describe('known bugs: Japanese relative clause with a modal or a copula', () => {
  test('Japanese puts a modal or copular relative clause in the plain form', () => {
    const eatsWho = (verbPhrase: object) =>
      sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT', ...verbPhrase } } }), 'RUN')).ja;
    const isWho = (predicate: string, tense: 'present' | 'past' = 'present') =>
      sayAll(clause(np('CAT', {
        relative: { verbPhrase: { verb: 'BE', tense }, complements: { predicative: { phrase: np(predicate) } } },
      }), 'RUN')).ja;
    expect(eatsWho({ modals: ['CAN'] })).toBe('食べることができる猫は走ります。');
    expect(eatsWho({ modals: ['WILL'] })).toBe('食べたい猫は走ります。');
    expect(eatsWho({ modals: ['MUST'], tense: 'past' })).toBe('食べる必要があった猫は走ります。');
    expect(isWho('HAPPY')).toBe('幸せな猫は走ります。');
    expect(isWho('BIG', 'past')).toBe('大きかった猫は走ります。');
  });

  test('Japanese keeps the plain form under negation, past, an object gap, a の/た predicate and a bridged chain', () => {
    const eatsWho = (verbPhrase: object) =>
      sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT', ...verbPhrase } } }), 'RUN')).ja;
    const isWho = (predicate: string, verbPhrase: object = {}) =>
      sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'BE', ...verbPhrase }, complements: { predicative: { phrase: np(predicate) } } } }), 'RUN')).ja;
    expect(eatsWho({ modals: [{ verb: 'CAN', negative: true }] })).toBe('食べることができない猫は走ります。');
    expect(eatsWho({ modals: [{ verb: 'WILL', negative: true }] })).toBe('食べたくない猫は走ります。');
    expect(eatsWho({ modals: [{ verb: 'MUST', negative: true }], tense: 'past' })).toBe('食べる必要がなかった猫は走ります。');
    expect(eatsWho({ modals: ['CAN', 'WILL'] })).toBe('食べたいと思うことができる猫は走ります。');
    expect(sayAll(clause(np('MOUSE', { relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'EAT', modals: ['CAN'] } } }), 'RUN')).ja)
      .toBe('猫が食べることができるネズミは走ります。');
    expect(isWho('LEGEND')).toBe('伝説である猫は走ります。');
    expect(isWho('LEGEND', { tense: 'past' })).toBe('伝説だった猫は走ります。');
    expect(isWho('HAPPY', { negative: true })).toBe('幸せではない猫は走ります。');
    expect(isWho('BROWN')).toBe('茶色の猫は走ります。');
    expect(isWho('TIRED')).toBe('疲れている猫は走ります。');
  });

  test('regression: the main clause keeps its polite modal', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { modals: ['CAN'] } })).ja).toBe('猫は食べることができます。');
  });
});

// The GENITIVE relative (localization C12): `headRole: 'possessor'`, the one gap that gaps no
// slot. The head does not fill a position in the clause — it *owns* the clause's subject, which
// stays where it is and drives agreement. Every language writes the relativizer together with
// that possessed phrase, and each does it differently: English and German put a possessive
// pronoun in the article's place, Italian an article *before* "cui", Spanish and Portuguese an
// agreeing "cuyo"/"cujo", and French "dont", which leaves the phrase its own article.
describe('a genitive relative clause — "the cat whose book …"', () => {
  test('the possessive relativizer, and the clause agreeing with what is possessed', () => {
    expect(sayAll(clause(
      np('CAT', {
        relative: {
          headRole: 'possessor',
          subject: np('BOOK'),
          verbPhrase: { verb: 'BE' },
          complements: { predicative: { phrase: np('BEAUTIFUL') } },
        },
      }),
      'RUN',
    ))).toEqual({
      en: 'the cat whose book is beautiful runs.',
      it: 'il gatto il cui libro è bello corre.', // the article agrees with "libro", not "gatto"
      fr: 'le chat dont le livre est beau court.', // "dont" keeps the possessed article
      de: 'der Kater, dessen Buch schön ist, läuft.', // genitive relative pronoun, verb-final
      es: 'el gato cuyo libro es hermoso corre.',
      // Japanese needs no relativizer at all: the clause simply precedes the head.
      ja: '本が美しい猫は走ります。',
      pt: 'o gato cujo livro é belo corre.',
    });
  });

  test('the relativizer agrees with the POSSESSED phrase, not with the head', () => {
    // A feminine head owning plural masculine books: Italian "i cui", Spanish "cuyos", German
    // "deren" (which reads off the head) — the two systems pull apart exactly here.
    expect(sayAll(clause(
      np('WOMAN', {
        gender: 'fem',
        relative: {
          headRole: 'possessor',
          subject: np('BOOK', { number: 'plural' }),
          verbPhrase: { verb: 'BE' },
          complements: { predicative: { phrase: np('BEAUTIFUL') } },
        },
      }),
      'RUN',
    ))).toEqual({
      en: 'the woman whose books are beautiful runs.',
      it: 'la donna i cui libri sono belli corre.',
      fr: 'la femme dont les livres sont beaux court.',
      de: 'die Frau, deren Bücher schön sind, läuft.',
      es: 'la mujer cuyos libros son hermosos corre.',
      ja: '本が美しい女は走ります。',
      pt: 'a mulher cujos livros são belos corre.',
    });
  });

  test('the clause takes an object of its own, as any relative does', () => {
    expect(sayAll(clause(
      np('CAT', {
        relative: {
          headRole: 'possessor',
          subject: np('CHILD'),
          verbPhrase: { verb: 'EAT' },
          directObject: np('FOOD'),
        },
      }),
      'RUN',
    ))).toEqual({
      en: 'the cat whose child eats the food runs.',
      it: 'il gatto il cui bambino mangia il cibo corre.',
      fr: "le chat dont l'enfant mange la nourriture court.",
      de: 'der Kater, dessen Kind das Essen isst, läuft.',
      es: 'el gato cuyo niño come la comida corre.',
      ja: '子供が食べ物を食べる猫は走ります。',
      pt: 'o gato cuja criança come a comida corre.',
    });
  });
});

// A173. Italian, Spanish and Portuguese drop a pronoun subject by default, and A40 made the main clause
// do so. A relative clause builds its own subject text and still printed it: "il libro che io leggo".
// Fixed: `relativeDropsSubject` drops a single pronoun subject in every person, except where the bare
// "che" / "que" would then read as a subject relative, the verb rendered with the pronoun's agreement
// being the one rendered with the head's: "il gatto che lui vede", "o livro que você mostra", and a
// form shared across persons ("ningún gato que yo vea"). A relativizer that marks the gap drops it.
describe('known bugs: a pronoun subject in a relative clause', () => {
  const bookThat = (subject: NonNullable<RelativeClause['subject']>, verbPhrase: Partial<VerbPhrase> = {}) =>
    sayAll(clause(np('BOOK', { relative: { headRole: 'directObject', subject, verbPhrase: { verb: 'READ', ...verbPhrase } } }), 'BURN'));

  test('a 1st-person pronoun subject is dropped', () => {
    expect(bookThat(np('FIRST_PERSON'))).toMatchObject({
      it: 'il libro che leggo brucia.', // now: "che io leggo"
      es: 'el libro que leo arde.',     // now: "que yo leo"
      pt: 'o livro que leio arde.',     // now: "que eu leio"
    });
    expect(bookThat(np('FIRST_PERSON', { number: 'plural' }))).toMatchObject({
      it: 'il libro che leggiamo brucia.', es: 'el libro que leemos arde.', pt: 'o livro que lemos arde.',
    });
    expect(bookThat(np('FIRST_PERSON'), { tense: 'past' })).toMatchObject({
      it: 'il libro che lessi brucia.', es: 'el libro que leí arde.', pt: 'o livro que li arde.',
    });
  });

  test('a 2nd-person pronoun subject is dropped in Italian and Spanish', () => {
    expect(bookThat(np('SECOND_PERSON'))).toMatchObject({
      it: 'il libro che leggi brucia.', // now: "che tu leggi"
      es: 'el libro que lees arde.',    // now: "que tú lees"
    });
    expect(bookThat(np('SECOND_PERSON', { number: 'plural' }))).toMatchObject({
      it: 'il libro che leggete brucia.', es: 'el libro que leéis arde.',
    });
  });

  test('a complement relative drops it too, as in the random phrase that found it', () => {
    expect(sayAll(clause(np('HOUSE', { relative: { headRole: 'locative', subject: np('FIRST_PERSON'), verbPhrase: { verb: 'EAT' } } }), 'BURN')))
      .toMatchObject({
        it: 'la casa dove mangio brucia.', // now: "dove io mangio"
        es: 'la casa donde como arde.',
        pt: 'a casa onde como arde.',
      });
    // Seed 892057, "… an old loud feeling that we put out up like sharp Europe slowly?"
    expect(sayAll({
      subject: np('FEELING', { number: 'plural', adjectives: ['BROWN'], adjectiveDegrees: ['equally'] }),
      verbPhrase: { verb: 'DIVIDE', tense: 'past', aspect: 'prospective', modifier: 'SLOWLY' },
      directObject: np('FEELING', {
        definiteness: 'indefinite', adjectives: ['OLD', 'LOUD'],
        relative: { verbPhrase: { verb: 'EXTINGUISH', tense: 'present', modifier: 'UP' }, headRole: 'directObject', subject: np('FIRST_PERSON', { number: 'plural' }) },
      }),
      complements: { manner: { phrase: np('EUROPE', { adjectives: ['SHARP'] }) } },
      interrogative: true,
    })).toMatchObject({
      it: "i sentimenti ugualmente marroni stavano per dividere lentamente un vecchio sentimento forte che spegniamo su come l'Europa affilata?",
      pt: 'os sentimentos igualmente castanhos estavam prestes a dividir devagar um sentimento velho e alto que apagamos para cima como a Europa afiada?',
      // With A172 fixed too, the whole Spanish phrase is right.
      es: '¿los sentimientos igual de marrones estaban a punto de dividir lentamente un sentimiento viejo y fuerte que apagamos arriba como la Europa afilada?',
    });
  });

  // The 3rd person drops too, unless the bare complementizer would then read as a subject relative:
  // the verb the pronoun's agreement renders is the one the head's renders. A number or person the
  // head does not have marks another subject, and so does a relativizer that marks the gap.
  test('the pronoun stays only where dropping it would read as a subject relative', () => {
    const catThat = (subject: NonNullable<RelativeClause['subject']>, head: Partial<NounPhrase> = {}, verbPhrase: Partial<VerbPhrase> = {}) =>
      sayAll(clause(np('CAT', { ...head, relative: { headRole: 'directObject', subject, verbPhrase: { verb: 'SEE', ...verbPhrase } } }), 'RUN'));
    // Kept: the verb agrees with the head as well.
    expect(catThat(np('THIRD_PERSON'))).toMatchObject({
      it: 'il gatto che lui vede corre.', es: 'el gato que él ve corre.', pt: 'o gato que ele vê corre.',
    });
    expect(catThat(np('THIRD_PERSON', { gender: 'fem' }))).toMatchObject({ it: 'il gatto che lei vede corre.', es: 'el gato que ella ve corre.' });
    expect(catThat(np('THIRD_PERSON', { number: 'plural' }), { number: 'plural' })).toMatchObject({
      it: 'i gatti che loro vedono corrono.', es: 'los gatos que ellos ven corren.', pt: 'os gatos que eles veem correm.',
    });
    expect(catThat(np('SECOND_PERSON')).pt).toBe('o gato que você vê corre.');
    // Dropped: the verb's number differs from the head's.
    expect(catThat(np('THIRD_PERSON'), { number: 'plural' })).toMatchObject({
      it: 'i gatti che vede corrono.', es: 'los gatos que ve corren.', pt: 'os gatos que vê correm.',
    });
    expect(catThat(np('THIRD_PERSON', { number: 'plural' }))).toMatchObject({
      it: 'il gatto che vedono corre.', es: 'el gato que ven corre.', pt: 'o gato que veem corre.',
    });
    expect(catThat(np('SECOND_PERSON'), { number: 'plural' })).toMatchObject({ it: 'i gatti che vedi corrono.', pt: 'os gatos que vê correm.' });
    // Kept: a 1st person singular syncretic with the 3rd, in the Spanish and Portuguese imperfect and
    // in the subjunctive a `no` head takes (A170). Italian's forms differ, so it drops.
    expect(catThat(np('FIRST_PERSON'), {}, { tense: 'past', aspect: 'progressive' })).toMatchObject({
      it: 'il gatto che stavo vedendo corre.', es: 'el gato que yo estaba viendo corre.', pt: 'o gato que eu estava vendo corre.',
    });
    expect(catThat(np('FIRST_PERSON'), { definiteness: 'no' })).toMatchObject({
      it: 'nessun gatto che vedo corre.', es: 'ningún gato que yo vea corre.', pt: 'nenhum gato que eu veja corre.',
    });
    expect(catThat(np('FIRST_PERSON', { number: 'plural' }), { definiteness: 'no' })).toMatchObject({
      es: 'ningún gato que veamos corre.', pt: 'nenhum gato que vejamos corre.',
    });
    // Dropped: "dove", "donde", "onde" and a preposition + relative mark the gap themselves.
    const houseWhere = (headSpecifiers?: RelativeClause['headSpecifiers']) => sayAll(clause(np('HOUSE', {
      relative: { headRole: 'locative', ...(headSpecifiers ? { headSpecifiers } : {}), subject: np('THIRD_PERSON'), verbPhrase: { verb: 'EAT' } },
    }), 'BURN'));
    expect(houseWhere()).toMatchObject({ it: 'la casa dove mangia brucia.', es: 'la casa donde come arde.', pt: 'a casa onde come arde.' });
    expect(houseWhere([{ kind: 'path', value: 'under' }])).toMatchObject({
      it: 'la casa sotto la quale mangia brucia.', es: 'la casa debajo de la que come arde.', pt: 'a casa debaixo da qual come arde.',
    });
  });

  // Regression: a noun, a coordinated pronoun and the impersonal subject, French and German, and the
  // main clause A40 already drops in.
  test('a noun, a coordination, the impersonal subject, French and German and the main clause are unchanged', () => {
    expect(bookThat(np('CAT'))).toMatchObject({
      it: 'il libro che il gatto legge brucia.', es: 'el libro que el gato lee arde.', pt: 'o livro que o gato lê arde.',
    });
    expect(bookThat({ conjuncts: [np('FIRST_PERSON'), np('THIRD_PERSON')], conjunction: 'and' })).toMatchObject({
      it: 'il libro che io e lui leggiamo brucia.', es: 'el libro que yo y él leemos arde.', pt: 'o livro que eu e ele lemos arde.',
    });
    expect(sayAll(clause(np('MOUSE', { relative: { headRole: 'directObject', subject: np('GENERIC_PERSON'), verbPhrase: { verb: 'EAT' } } }), 'RUN')).it)
      .toBe('il topo che si mangia corre.');
    expect(bookThat(np('FIRST_PERSON'))).toMatchObject({ fr: 'le livre que je lis brûle.', de: 'das Buch, das ich lese, brennt.' });
    expect(sayAll(clause(np('FIRST_PERSON'), 'EAT'))).toMatchObject({ it: 'mangio.', es: 'como.', pt: 'como.' });
  });
});

// A199. A47 settled the locative copula — a place is "estar", unconditionally — but only for a
// locative the clause carries. Relativise the place and it becomes the GAP: it is not in
// `rel.complements`, `withRelative` renders it as the relativizer ("donde" / "onde", or the
// complement's preposition), and `predicateText`, which decides the copula off
// `complements?.locative`, sees a clause with no place in it and picks "ser". So "the slot where
// the cursor is" reads "el slot donde el cursor ES" / "o slot onde o cursor É" — the copula of
// identity. The same relative clause with the locative as a complement rather than the gap is
// already right ("el gato que está en la casa corre"). The stranded Romance copula ("dove il
// cursore è", "où le curseur est") was a separate concern, A221.
describe('known bugs: Spanish and Portuguese use ser in a place relative clause', () => {
  const houseWhereIs = (verbPhrase: Partial<VerbPhrase> = {}, headSpecifiers?: RelativeClause['headSpecifiers']) =>
    sayAll(clause(np('HOUSE', {
      relative: {
        headRole: 'locative', ...(headSpecifiers ? { headSpecifiers } : {}),
        subject: np('CAT'), verbPhrase: { verb: 'BE', ...verbPhrase },
      },
    }), 'BURN'));

  test('a locative gap over BE takes estar, as the main clause does', () => {
    expect(houseWhereIs()).toMatchObject({
      es: 'la casa donde el gato está arde.', // now: "donde el gato es"
      pt: 'a casa onde o gato está arde.',    // now: "onde o gato é"
    });
    // The past is the imperfect of "estar" (A130's state-verb rule), as it already is in the main
    // clause ("el gato estaba en la casa").
    expect(houseWhereIs({ tense: 'past' })).toMatchObject({
      es: 'la casa donde el gato estaba arde.', pt: 'a casa onde o gato estava arde.',
    });
    expect(houseWhereIs({ negative: true })).toMatchObject({
      es: 'la casa donde el gato no está arde.', pt: 'a casa onde o gato não está arde.',
    });
    // A marked relation keeps its preposition + relative instead of the relative adverb; the copula
    // is the same choice either way.
    expect(houseWhereIs({}, [{ kind: 'path', value: 'under' }])).toMatchObject({
      es: 'la casa debajo de la que el gato está arde.', pt: 'a casa debaixo da qual o gato está arde.',
    });
    // The head in the object slot, and the plan that found it.
    expect(sayAll(clause(np('DOG'), 'SEE', {
      directObject: np('HOUSE', { relative: { headRole: 'locative', subject: np('CAT'), verbPhrase: { verb: 'BE' } } }),
    }))).toMatchObject({ es: 'el perro ve la casa donde el gato está.', pt: 'o cão vê a casa onde o gato está.' });
    expect(sayAll(clause(np('SLOT_COMPUTING', {
      definiteness: 'definite',
      relative: { headRole: 'locative', subject: np('CURSOR', { definiteness: 'definite' }), verbPhrase: { verb: 'BE' } },
    }), 'BURN'))).toMatchObject({
      es: 'el slot donde el cursor está arde.', pt: 'o slot onde o cursor está arde.',
    });
  });

  // Every branch of `predicateText` builds its verb group out of the copula it chose, so the choice
  // follows into the non-finite forms, the future and the present subjunctive a negated antecedent
  // takes (A170) — the same forms the main clause gives.
  test('the choice follows into a modal, the aspects, the future and a negated antecedent', () => {
    expect(houseWhereIs({ modals: ['MUST'] })).toMatchObject({
      es: 'la casa donde el gato debe estar arde.', pt: 'a casa onde o gato deve estar arde.',
    });
    expect(houseWhereIs({ aspect: 'resultative' })).toMatchObject({
      es: 'la casa donde el gato ha estado arde.', pt: 'a casa onde o gato esteve arde.',
    });
    expect(houseWhereIs({ tense: 'future' })).toMatchObject({
      es: 'la casa donde el gato estará arde.', pt: 'a casa onde o gato estará arde.',
    });
    expect(sayAll(clause(np('HOUSE', {
      definiteness: 'no',
      relative: { headRole: 'locative', subject: np('CAT'), verbPhrase: { verb: 'BE' } },
    }), 'BURN'))).toMatchObject({
      es: 'ninguna casa donde el gato esté arde.', pt: 'nenhuma casa onde o gato esteja arde.',
    });
  });

  // Regression: the main clause A47 fixed, a locative COMPLEMENT inside a relative clause, a
  // predicate nominal (which keeps "ser"), a lexical verb under the same gap, and the other five
  // languages — Japanese takes the existential いる, which is its own A109 rule.
  test('the main clause, a locative complement, a predicate nominal and the other five are right', () => {
    expect(sayAll(clause(np('CAT'), 'BE', { complements: { locative: { phrase: np('HOUSE') } } }))).toMatchObject({
      es: 'el gato está en la casa.', pt: 'o gato está na casa.',
    });
    expect(sayAll(clause(np('CAT'), 'BE', { verbPhrase: { tense: 'past' }, complements: { locative: { phrase: np('HOUSE') } } }))).toMatchObject({
      es: 'el gato estaba en la casa.', pt: 'o gato estava na casa.',
    });
    expect(sayAll(clause(np('CAT', {
      relative: { verbPhrase: { verb: 'BE' }, complements: { locative: { phrase: np('HOUSE') } } },
    }), 'RUN'))).toMatchObject({ es: 'el gato que está en la casa corre.', pt: 'o gato que está na casa corre.' });
    expect(sayAll(clause(np('CAT', {
      relative: { verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np('LEGEND', { definiteness: 'indefinite' }) } } },
    }), 'RUN'))).toMatchObject({ es: 'el gato que es una leyenda corre.', pt: 'o gato que é uma lenda corre.' });
    expect(sayAll(clause(np('HOUSE', {
      relative: { headRole: 'locative', subject: np('CAT'), verbPhrase: { verb: 'EAT' } },
    }), 'BURN'))).toMatchObject({ es: 'la casa donde el gato come arde.', pt: 'a casa onde o gato come arde.' });
    expect(houseWhereIs()).toMatchObject({
      en: 'the house where the cat is burns.', de: 'das Haus, in dem der Kater ist, brennt.',
      it: "la casa dov'è il gatto brucia.", fr: 'la maison où est le chat brûle.', ja: '猫がいる家は燃えます。',
    });
  });
});

// A206. The impersonal "se" is the passive "se" before a plural object, and the verb agrees with it.
// A73 fixed Italian and Spanish and left Portuguese out by name, because its main-clause target
// ("comem-se os ratos") also moves the clitic. In a relative clause Portuguese is proclitic anyway,
// so only the agreement is missing — and every whereGloss/whoGloss definition with a plural object
// goes through this path. Filed while authoring localization A23 (CANVAS).
describe('known bugs: the Portuguese impersonal se and a plural object (A206)', () => {
  // CANVAS's own definition plan: a locative-gap relative with a generic subject and a bare plural
  // object. Italian and Spanish agree the verb, and so, since the fix, does Portuguese.
  const canvas = {
    subject: {
      concept: 'PLACE',
      definiteness: 'indefinite' as const,
      relative: {
        headRole: 'locative' as const,
        subject: { concept: 'GENERIC_PERSON' },
        verbPhrase: { verb: 'MAKE' },
        directObject: { concept: 'PHRASE', definiteness: 'bare' as const, number: 'plural' as const },
      },
    },
  };

  test('Portuguese agrees the impersonal verb with its plural object', () => {
    expect(sayAll(canvas).pt).toBe('um lugar onde se fazem frases.');
  });

  // Already right, and what the fix must not disturb: A73's two languages, and a singular object.
  test('Italian and Spanish already agree, and a singular object stays singular', () => {
    expect(sayAll(canvas)).toMatchObject({
      it: 'un luogo dove si fanno frasi.',
      es: 'un lugar donde se hacen frases.',
    });
    expect(sayAll({ ...canvas, subject: { ...canvas.subject, relative: { ...canvas.subject.relative, directObject: { concept: 'PHRASE', definiteness: 'bare' as const } } } }).pt)
      .toBe('um lugar onde se faz frase.');
  });

  // The fix is the agreement alone: a main clause keeps the proclitic it had (the standard writes
  // "comem-se os ratos", a separate question), and the object relative — the head gapped as the passive
  // se's patient — agrees with its plural head, in the simple and the compound tense alike.
  const GENERIC = np('GENERIC_PERSON');
  const MICE = np('MOUSE', { number: 'plural' });
  test('a main clause agrees with its plural object, and keeps its proclitic', () => {
    expect(sayAll(clause(GENERIC, 'EAT', { directObject: MICE })).pt).toBe('se comem os ratos.');
    expect(sayAll(clause(GENERIC, 'EAT', { directObject: MICE, verbPhrase: { tense: 'past' } })).pt).toBe('se comeram os ratos.');
    expect(sayAll(clause(GENERIC, 'EAT', { directObject: MICE, verbPhrase: { modals: ['MUST'] } })).pt).toBe('se devem comer os ratos.');
  });
  test('an object relative agrees with its plural head', () => {
    const eaten = (verbPhrase: VerbPhrase) =>
      np('MOUSE', { number: 'plural', relative: { headRole: 'directObject', subject: GENERIC, verbPhrase } });
    expect(sayAll(clause(eaten({ verb: 'EAT' }), 'RUN')).pt).toBe('os ratos que se comem correm.');
    expect(sayAll({ subject: eaten({ verb: 'EAT', aspect: 'resultative' }) }).pt).toBe('os ratos que se comeram.');
  });
  test('a clitic or a singular object keeps se impersonal and singular', () => {
    expect(sayAll(clause(GENERIC, 'EAT', { directObject: np('THIRD_PERSON', { number: 'plural' }) })).pt).toBe('se os come.');
    expect(sayAll(clause(GENERIC, 'EAT', { directObject: np('MOUSE') })).pt).toBe('se come o rato.');
  });
});

// A213. With the impersonal si, a compound tense is the passive si's, and its participle agrees with the
// patient — "si è salvata l'opzione", "le opzioni che si sono salvate". The main clause did this for a
// plural object only, and an object relative not at all: its gapped head is the patient, but nothing
// handed it to the participle, and the plural head's agreement was switched off in the compound tense.
// Found while building the headless relative gloss (localization C23), whose Italian read "che si è
// salvato" under a feminine antecedent.
describe('known bugs: the Italian passive si and its compound participle (A213)', () => {
  const GENERIC = np('GENERIC_PERSON');
  const SAVED = { verb: 'SAVE', aspect: 'resultative' as const };
  const saved = (head: string, number?: 'plural', verbPhrase: VerbPhrase = SAVED) =>
    np(head, { ...(number ? { number } : {}), relative: { headRole: 'directObject', subject: GENERIC, verbPhrase } });

  test('a main clause agrees the participle with a singular patient too', () => {
    expect(sayAll(clause(GENERIC, 'SAVE', { directObject: np('OPTION'), verbPhrase: SAVED })).it).toBe("si è salvata l'opzione.");
    expect(sayAll(clause(GENERIC, 'SAVE', { directObject: np('OPTION', { number: 'plural' }), verbPhrase: SAVED })).it).toBe('si sono salvate le opzioni.');
    expect(sayAll(clause(GENERIC, 'SAVE', { directObject: np('BOOK'), verbPhrase: SAVED })).it).toBe('si è salvato il libro.');
  });

  test('an object relative agrees the auxiliary and the participle with its head', () => {
    expect(sayAll({ subject: saved('OPTION') }).it).toBe("l'opzione che si è salvata.");
    expect(sayAll({ subject: saved('OPTION', 'plural') }).it).toBe('le opzioni che si sono salvate.');
    expect(sayAll({ subject: saved('BOOK', 'plural') }).it).toBe('i libri che si sono salvati.');
    expect(sayAll({ subject: saved('BOOK') }).it).toBe('il libro che si è salvato.');
  });

  // The modal's compound infinitive takes the same agreement the main clause already gave it
  // ("si devono aver salvate le opzioni"), and the simple tenses are untouched.
  test('the modal and the simple tenses read as the main clause does', () => {
    expect(sayAll({ subject: saved('OPTION', 'plural', { ...SAVED, modals: ['MUST'] }) }).it).toBe('le opzioni che si devono aver salvate.');
    expect(sayAll({ subject: saved('OPTION', 'plural', { verb: 'SAVE' }) }).it).toBe('le opzioni che si salvano.');
    expect(sayAll({ subject: saved('OPTION', undefined, { verb: 'SAVE', tense: 'past' }) }).it).toBe("l'opzione che si salvò.");
  });
});

// A221. A place relative whose predicate is the bare copula left "è" / "est" alone at the end of the
// clause, after its noun subject: "un luogo dove il gatto è", "un lieu où le chat est". Italian and
// French put the verb first there — "dov'è il gatto", "où est le chat" — and in the subject slot the
// SV order runs the two verbs together: "la casa dove il gatto è brucia". A predicate, another verb, a
// pronoun or the generic subject keeps SV. Found authoring the C23-C28 sweep.
describe('known bugs: an Italian or French place relative ends on a bare copula (A221)', () => {
  const where = (subject: NonNullable<RelativeClause['subject']>, verbPhrase: Partial<VerbPhrase> = {}, extra: Partial<RelativeClause> = {}): RelativeClause =>
    ({ headRole: 'locative', subject, verbPhrase: { verb: 'BE', ...verbPhrase }, ...extra });
  const place = (relative: RelativeClause) => sayAll({ subject: np('PLACE', { definiteness: 'indefinite', relative }) });
  const itFr = (said: Record<string, string>) => ({ it: said['it'], fr: said['fr'] });

  test('the copula comes before its noun subject', () => {
    expect(itFr(place(where(np('CAT'))))).toEqual({ it: "un luogo dov'è il gatto.", fr: 'un lieu où est le chat.' });
    expect(itFr(place(where(np('CAT', { number: 'plural' }))))).toEqual({ it: 'un luogo dove sono i gatti.', fr: 'un lieu où sont les chats.' });
    expect(itFr(place(where(np('CAT'), { tense: 'past' })))).toEqual({ it: "un luogo dov'era il gatto.", fr: 'un lieu où était le chat.' });
    expect(itFr(place(where(np('CAT'), { tense: 'future' })))).toEqual({ it: 'un luogo dove sarà il gatto.', fr: 'un lieu où sera le chat.' });
    expect(itFr(sayAll(clause(np('HOUSE', { relative: where(np('CAT')) }), 'BURN'))))
      .toEqual({ it: "la casa dov'è il gatto brucia.", fr: 'la maison où est le chat brûle.' });
    expect(itFr(sayAll(clause(np('DOG'), 'SEE', { directObject: np('HOUSE', { relative: where(np('CAT')) }) }))))
      .toEqual({ it: "il cane vede la casa dov'è il gatto.", fr: 'le chien voit la maison où est le chat.' });
    expect(itFr(sayAll({ subject: np('SLOT', { relative: where(np('CURSOR')) }) })))
      .toEqual({ it: "la fessura dov'è il cursore.", fr: 'la fente où est le curseur.' });
    expect(itFr(sayAll({
      subject: np('HOUSE', { definiteness: 'indefinite', relative: where(np('CAT'), {}, { headSpecifiers: [{ kind: 'path', value: 'under' }] }) }),
    }))).toEqual({ it: 'una casa sotto la quale è il gatto.', fr: 'une maison sous laquelle est le chat.' });
  });

  test('a plural past, a group, an elided article and a marked relation in the past', () => {
    expect(itFr(place(where(np('CAT', { number: 'plural' }), { tense: 'past' }))))
      .toEqual({ it: 'un luogo dove erano i gatti.', fr: 'un lieu où étaient les chats.' });
    expect(itFr(place(where({ conjuncts: [np('CAT'), np('DOG')], conjunction: 'and' }))))
      .toEqual({ it: 'un luogo dove sono il gatto e il cane.', fr: 'un lieu où sont le chat et le chien.' });
    expect(itFr(sayAll({ subject: np('HOUSE', { relative: where(np('MAN')) }) })))
      .toEqual({ it: "la casa dov'è l'uomo.", fr: "la maison où est l'homme." });
    expect(itFr(sayAll({
      subject: np('HOUSE', { definiteness: 'indefinite', relative: where(np('CAT'), { tense: 'past' }, { headSpecifiers: [{ kind: 'path', value: 'under' }] }) }),
    }))).toEqual({ it: 'una casa sotto la quale era il gatto.', fr: 'une maison sous laquelle était le chat.' });
  });

  // As ruled: only the affirmative, simple, modal-free bare copula inverts. The negative keeps SV in
  // both languages, and so do a compound tense, a modal, an adverb and a `no` subject.
  test('the negative, the compound tenses, a modal, an adverb and a no subject keep SV', () => {
    expect(itFr(place(where(np('CAT'), { negative: true })))).toEqual({ it: 'un luogo dove il gatto non è.', fr: "un lieu où le chat n'est pas." });
    expect(itFr(place(where(np('CAT'), { modifier: 'NEVER' })))).toEqual({ it: 'un luogo dove il gatto non è mai.', fr: "un lieu où le chat n'est jamais." });
    expect(itFr(place(where(np('CAT', { definiteness: 'no' }))))).toEqual({ it: 'un luogo dove nessun gatto è.', fr: "un lieu où aucun chat n'est." });
    expect(itFr(place(where(np('CAT'), { aspect: 'resultative' })))).toEqual({ it: 'un luogo dove il gatto è stato.', fr: 'un lieu où le chat a été.' });
    expect(itFr(place(where(np('CAT'), { modals: ['MUST'] })))).toEqual({ it: 'un luogo dove il gatto deve essere.', fr: 'un lieu où le chat doit être.' });
    expect(itFr(place(where(np('CAT'), { modifier: 'ALWAYS' })))).toEqual({ it: 'un luogo dove il gatto è sempre.', fr: 'un lieu où le chat est toujours.' });
    // A dropped pronoun keeps the unelided "dove è", and a group with a pronoun is resumed by it.
    expect(place(where(np('THIRD_PERSON', { gender: 'masc' }))).it).toBe('un luogo dove è.');
    expect(itFr(place(where({ conjuncts: [np('CAT'), np('FIRST_PERSON')], conjunction: 'and' }))))
      .toEqual({ it: 'un luogo dove il gatto e io siamo.', fr: 'un lieu où le chat et moi, nous sommes.' });
  });

  test('regression: a pronoun, the generic subject, a predicate, another verb and the other languages', () => {
    expect(itFr(place(where(np('FIRST_PERSON'))))).toEqual({ it: 'un luogo dove sono.', fr: 'un lieu où je suis.' });
    expect(place(where(np('THIRD_PERSON', { gender: 'masc' }))).fr).toBe('un lieu où il est.');
    expect(itFr(place(where(np('GENERIC_PERSON'))))).toEqual({ it: 'un luogo dove si è.', fr: "un lieu où l'on est." });
    expect(itFr(place(where(np('CAT'), {}, { complements: { predicative: { phrase: np('HAPPY') } } }))))
      .toEqual({ it: 'un luogo dove il gatto è felice.', fr: 'un lieu où le chat est heureux.' });
    expect(itFr(place({ headRole: 'locative', subject: np('CAT'), verbPhrase: { verb: 'EAT' } })))
      .toEqual({ it: 'un luogo dove il gatto mangia.', fr: 'un lieu où le chat mange.' });
    expect(place(where(np('CAT')))).toMatchObject({
      en: 'a place where the cat is.',
      es: 'un lugar donde el gato está.',
      pt: 'um lugar onde o gato está.',
    });
  });
});

// A273. A relative clause with no verb phrase (`relative: {}`, or one naming only its gap and its
// subject) reaches `resolveRelativeClause`, which destructures `clause.verbPhrase` and dies on a
// TypeError ("Cannot destructure property 'voice' of 'clause.verbPhrase' as it is undefined"), so
// `/api/translate` answers 500. `RelativeClause.verbPhrase` is required, and the builder never sends
// one without (`buildRelativeClause` returns nothing until the period has a verb): this is A267's
// malformed plan in a relative clause, and wants A267's answer — refused, with the missing verb phrase
// named. The backend's 400 is pinned in packages/backend/src/index.test.ts.
describe('known bugs: a relative clause with no verb phrase crashes the engine (A273)', () => {
  const bare = {} as unknown as RelativeClause;
  const gapOnly = { headRole: 'directObject', subject: np('DOG') } as unknown as RelativeClause;

  test.fails.each([
    ['on the subject', clause(np('CAT', { relative: bare }), 'RUN')],
    ['on the object', clause(np('MAN'), 'SEE', { directObject: np('CAT', { relative: bare }) })],
    ['naming only its gap and its subject', clause(np('CAT', { relative: gapOnly }), 'RUN')],
  ])('%s is refused with an error naming its missing verb phrase', (_, plan) => {
    // Named, not the TypeError from the innards, whose message happens to say "verbPhrase" too.
    let thrown: unknown;
    try { sayAll(plan); } catch (error) { thrown = error; }
    expect(thrown).toBeInstanceOf(Error);
    expect(thrown).not.toBeInstanceOf(TypeError);
    expect((thrown as Error).message).toMatch(/verb ?phrase/i);
  });
});

// A275. A relative clause whose gap is not its subject — the head is its object, a complement or a
// possessor — needs a subject of its own (`RelativeClause.subject`, "present when headRole !==
// 'subject'"). Without one the engine renders the clause as a subject relative: "the cat that eats
// runs." for *the cat that [someone] eats*, the meaning flipped, and "the house where eats burns.",
// fr "la maison qui mange brûle." for a place gap. As A267 and A273, the plan is refused with a named
// error: not filled in with GENERIC_PERSON, and not turned into a passive (the user can pick the
// generic person as the subject). The backend's 400 is pinned in packages/backend/src/index.test.ts,
// the builder's side in packages/frontend/test/workspacePlan/functions/workspaceToPlans.test.ts.
describe('known bugs: an object relative with no subject reads as a subject relative (A275)', () => {
  const eats = (headRole: RelativeClause['headRole']): RelativeClause => ({ headRole, verbPhrase: { verb: 'EAT' } });

  test.fails.each([
    ['an object gap', clause(np('CAT', { relative: eats('directObject') }), 'RUN')],
    ['a place gap', clause(np('HOUSE', { relative: eats('locative') }), 'BURN')],
    ['a possessor gap', clause(np('CAT', { relative: eats('possessor') }), 'RUN')],
  ])('%s with no subject is refused with an error naming the missing subject', (_, plan) => {
    expect(() => sayAll(plan)).toThrow(/subject/);
  });

  test('regression: the object relative with its subject, and the subject relative', () => {
    expect(sayAll(clause(np('CAT', { relative: { ...eats('directObject'), subject: np('DOG') } }), 'RUN'))).toMatchObject({
      en: 'the cat that the dog eats runs.', fr: 'le chat que le chien mange court.', de: 'der Kater, den der Hund frisst, läuft.',
    });
    expect(sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT' } } }), 'RUN')).en).toBe('the cat that eats runs.');
  });
});
