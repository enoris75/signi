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
    expect(dogWho({ verbPhrase: { verb: 'EAT', negative: true, modals: [{ verb: 'MUST', modifier: 'ALWAYS' }] } }))
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
      de: 'ein Ort, in dem man isst.',
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
      de: 'ein Ort, in dem man Gegenstände kauft.',
      es: 'un lugar donde se compran objetos.',
      ja: '物体を買う場所。',
    });
    expect(sayAll(placeWhere('EAT', { verbPhrase: { verb: 'EAT', negative: true } }))).toMatchObject({
      en: 'a place where one does not eat.',
      it: 'un luogo dove non si mangia.',
      fr: "un lieu où l'on ne mange pas.",
      de: 'ein Ort, in dem man nicht isst.',
      es: 'un lugar donde no se come.',
      pt: 'um lugar onde não se come.',
    });
    expect(sayAll(placeWhere('EAT', { verbPhrase: { verb: 'EAT', tense: 'past' } }))).toMatchObject({
      en: 'a place where one ate.',
      fr: "un lieu où l'on mangea.",
      de: 'ein Ort, in dem man aß.',
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
    expect(eatsWho({ modals: ['CAN'], negative: true })).toBe('食べることができない猫は走ります。');
    expect(eatsWho({ modals: ['WILL'], negative: true })).toBe('食べたくない猫は走ります。');
    expect(eatsWho({ modals: ['MUST'], negative: true, tense: 'past' })).toBe('食べる必要がなかった猫は走ります。');
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
