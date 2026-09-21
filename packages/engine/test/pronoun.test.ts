import { describe, expect, test } from 'vitest';
import type { NounPhrase } from '@signi/shared';
import { clause, furigana, np, sayAll } from './harness.js';

// A third-person pronoun subject, across the three gender values. `gender` on a NOUN head is a
// no-op (see subject.test.ts); on a third-person pronoun it selects the surface form — he / she /
// it — which is the one place the `neut` value is meaningful. Italian, Spanish and Portuguese are
// pro-drop (see the A40 block below), so the pronoun itself is dropped in a plain declarative; the
// gender selection is therefore observed in the three languages that keep an overt subject pronoun
// — English, French, German (and Japanese's topic それ) — while it/es/pt render the bare verb.
const third = (extra: Partial<NounPhrase>) => sayAll(clause(np('THIRD_PERSON', extra), 'EAT'));

describe('third-person pronoun by gender', () => {
  test('masculine is the default', () => {
    expect(third({})).toMatchObject({
      en: 'he eats.', it: 'mangia.', fr: 'il mange.', es: 'come.',
      pt: 'come.', de: 'er isst.', ja: '彼は食べます。',
    });
    expect(third({ gender: 'masc' })).toEqual(third({}));
  });

  test('feminine selects the feminine pronoun', () => {
    expect(third({ gender: 'fem' })).toMatchObject({
      en: 'she eats.', it: 'mangia.', fr: 'elle mange.', es: 'come.',
      pt: 'come.', de: 'sie isst.', ja: '彼女は食べます。',
    });
  });

  // The neuter VALUE is meaningful only here. Each language has its own genderless "it" — German
  // "es", Japanese それ, French demonstrative "cela" — distinct from both the masculine and the
  // feminine. (Italian "esso", Spanish "ello", Portuguese "isso" exist too, but pro-drop keeps them
  // off the surface as a subject, so the distinctness is checked in the languages that show it.)
  test('neuter selects the language\'s "it", distinct from he and she', () => {
    const it = third({ gender: 'neut' });
    expect(it).toMatchObject({
      en: 'it eats.', it: 'mangia.', fr: 'cela mange.', es: 'come.',
      pt: 'come.', de: 'es isst.', ja: 'それは食べます。',
    });
    // Not the masculine, and not the feminine, in the languages that surface the pronoun.
    expect(it).not.toMatchObject({ en: 'he eats.' });
    expect(it.fr).not.toBe('il mange.');
    expect(it.fr).not.toBe('elle mange.');
    expect(it.de).not.toBe('er isst.');
  });

  test('a neuter subject takes a masculine-default predicate adjective', () => {
    // Neuter has no distinct adjective form, so the predicate agrees as the masculine would. The
    // pro-drop languages drop the subject but still render the (masculine-default) adjective.
    expect(sayAll(clause(np('THIRD_PERSON', { gender: 'neut' }), 'SEEM', {
      complements: { predicative: { phrase: np('BIG') } },
    }))).toMatchObject({
      en: 'it seems big.', it: 'sembra grande.', fr: 'cela semble grand.',
      es: 'parece grande.', de: 'es scheint groß.',
    });
  });

  // Six of the seven have no neuter pronoun in the plural — a group of "it"s is "they" — so a neuter
  // third plural is the genderless plural form there, identical to the (masculine-default) plain
  // plural. Japanese is the exception, and splits its plural as it splits its singular: 彼ら is a
  // group of people, それら a group of things (A200).
  test('neuter is a no-op in the plural in six of the seven, and それら in Japanese', () => {
    const neutPl = sayAll(clause(np('THIRD_PERSON', { gender: 'neut', number: 'plural' }), 'EAT'));
    expect(neutPl).toMatchObject({
      en: 'they eat.', it: 'mangiano.', fr: 'ils mangent.', es: 'comen.',
      pt: 'comem.', de: 'sie essen.', ja: 'それらは食べます。',
    });
    const plain = sayAll(clause(np('THIRD_PERSON', { number: 'plural' }), 'EAT'));
    expect(plain.ja).toBe('彼らは食べます。');
    const { ja: _ja, ...sixOfSeven } = plain;
    expect(neutPl).toMatchObject(sixOfSeven);
  });
});

// The feminine-plural pronoun (French elles / Spanish ellas / Portuguese elas) is selected when a
// pronoun subject is feminine plural. French is NOT pro-drop, so it surfaces that pronoun overtly;
// Italian, Spanish and Portuguese are pro-drop (A40 below) and drop the subject, so the feminine is
// no longer visible on the pronoun there — it is instead carried by the agreement it drives on a
// gender-distinct predicate adjective (Italian stanche, Spanish/Portuguese cansadas). Both channels
// are tested here. (TIRED is used, not BIG: "grande" is gender-invariant in it/es/pt, so it could
// never reveal a feminine agreement; "stanco/cansado" inflects stanche/cansadas.)
describe('feminine plural pronoun', () => {
  // French surfaces the feminine third-plural pronoun overtly (it is not pro-drop); the pro-drop
  // languages drop the subject, so the pronoun's gender is not observable on the surface here.
  test('French surfaces the feminine third-plural "elles"; the pro-drop languages drop the subject', () => {
    const fem = sayAll(clause(np('THIRD_PERSON', { gender: 'fem', number: 'plural' }), 'RUN'));
    expect(fem).toMatchObject({
      fr: 'elles courent.', // not "ils courent." — French keeps the overt feminine pronoun
      es: 'corren.',        // pro-drop: subject gone (see the agreement test for the feminine)
      pt: 'correm.',
      it: 'corrono.',
    });
    expect(fem.fr).not.toBe('ils courent.');
  });

  // The feminine plural agreement is tracked whether or not the subject surfaces: it drives a
  // gender-distinct predicate adjective to its feminine form — French elles + fatiguées, and the
  // pro-drop languages a dropped subject + a feminine adjective (stanche / cansadas). This is the
  // tell that pro-drop suppresses the *pronoun*, not the gender feature.
  test('the feminine plural agreement surfaces on a gender-distinct predicate adjective', () => {
    expect(sayAll(clause(np('THIRD_PERSON', { gender: 'fem', number: 'plural' }), 'SEEM', {
      complements: { predicative: { phrase: np('TIRED') } },
    }))).toMatchObject({
      fr: 'elles semblent fatiguées.', // overt pronoun + feminine adjective
      it: 'sembrano stanche.',         // subject dropped, adjective feminine (stanche, not stanchi)
      es: 'parecen cansadas.',         // cansadas, not cansados
      pt: 'parecem cansadas.',
    });
  });

  // Spanish carries the feminine through the whole plural paradigm (nosotras / vosotras / ellas), so
  // the feature is not limited to the third person — a feminine first-plural drives "cansadas", not
  // "cansados". The pronoun itself ("nosotras") is dropped, so the feminine shows on the adjective.
  test('the Spanish feminine first-plural agreement is tracked: "parecemos cansadas"', () => {
    expect(sayAll(clause(np('FIRST_PERSON', { gender: 'fem', number: 'plural' }), 'SEEM', {
      complements: { predicative: { phrase: np('TIRED') } },
    })).es).toBe('parecemos cansadas.');
  });

  // …and the second-plural completes the Spanish paradigm: "parecéis cansadas", not "…cansados".
  test('the Spanish feminine second-plural agreement is tracked: "parecéis cansadas"', () => {
    expect(sayAll(clause(np('SECOND_PERSON', { gender: 'fem', number: 'plural' }), 'SEEM', {
      complements: { predicative: { phrase: np('TIRED') } },
    })).es).toBe('parecéis cansadas.');
  });

  // Regression: a MASCULINE plural is the default agreement, across all four — French keeps the
  // overt "ils", and the adjective is masculine (fatigués / stanchi / cansados).
  test('a masculine plural is the default agreement', () => {
    expect(sayAll(clause(np('THIRD_PERSON', { number: 'plural' }), 'RUN'))).toMatchObject({
      fr: 'ils courent.',
      es: 'corren.',
      pt: 'correm.',
    });
    expect(sayAll(clause(np('THIRD_PERSON', { number: 'plural' }), 'SEEM', {
      complements: { predicative: { phrase: np('TIRED') } },
    }))).toMatchObject({
      fr: 'ils semblent fatigués.',
      it: 'sembrano stanchi.',
      es: 'parecen cansados.',
      pt: 'parecem cansados.',
    });
  });

  // Regression: French and Portuguese have no distinct feminine first-plural pronoun, so a feminine
  // referent keeps the invariant "nous" / dropped "nós" — but Portuguese, like the others, still
  // inflects the adjective to the feminine ("cansadas"). Italian/German/English have no gendered
  // plural pronoun at all.
  test('languages without a feminine plural pronoun still track the agreement', () => {
    const fem1pl = sayAll(clause(np('FIRST_PERSON', { gender: 'fem', number: 'plural' }), 'SEEM', {
      complements: { predicative: { phrase: np('TIRED') } },
    }));
    expect(fem1pl).toMatchObject({
      fr: 'nous semblons fatiguées.', // invariant "nous", but the adjective is feminine
      pt: 'parecemos cansadas.',      // dropped "nós", feminine adjective
    });
    expect(sayAll(clause(np('THIRD_PERSON', { gender: 'fem', number: 'plural' }), 'RUN'))).toMatchObject({
      it: 'corrono.',
      de: 'sie laufen.',
      en: 'they run.',
    });
  });
});

// A40. Italian, Spanish and Portuguese are null-subject (pro-drop) languages: a personal-pronoun
// subject is dropped by default, the verb ending alone carrying the person ("mangio", not "io
// mangio"). The engine emits it overtly in every clause, so "esso deve essere stato un angelo" for
// "it must have been an angel" where a native speaker says "deve essere stato un angelo". French,
// German and English are NOT pro-drop and correctly keep the subject; Japanese topic-drop is a
// separate question and out of scope. The drop is default-only — an overt pronoun surfaces for
// emphasis/contrast, but the plan has no focus feature, so dropping is the right default here.
//
// NOTE: this DIRECTLY CONTRADICTS the passing tests above (`esso mangia.` / `ello come.` /
// `isso come.` are asserted there as correct). Fixing A40 flips those — they must be updated in the
// same change. Only a single bare pronoun subject drops (`isPronounElement`); a NOUN subject
// ("il gatto mangia") and a coordinated subject keep their surface.
describe('known bugs: Romance pro-drop — a pronoun subject is dropped', () => {
  // The reported case: "it must have been an angel" — a neuter subject, epistemic modal + perfect.
  test('the pronoun subject is dropped in it/es/pt ("it must have been an angel")', () => {
    expect(sayAll(clause(np('THIRD_PERSON', { gender: 'neut' }), 'BE', {
      verbPhrase: { modals: ['MUST'], aspect: 'resultative' },
      complements: { predicative: { phrase: np('ANGEL', { definiteness: 'indefinite' }) } },
    }))).toMatchObject({
      it: 'deve essere stato un angelo.', // not "esso deve essere stato un angelo."
      es: 'debe haber sido un ángel.',    // not "ello debe haber sido un ángel."
      pt: 'deve ter sido um anjo.',       // not "isso deve ter sido um anjo."
    });
  });

  // The drop is general to every person, not just the neuter the reporter happened to hit.
  test('a first-person pronoun subject is dropped ("io mangio" → "mangio")', () => {
    expect(sayAll(clause(np('FIRST_PERSON'), 'EAT'))).toMatchObject({
      it: 'mangio.',  // not "io mangio."
      es: 'como.',    // not "yo como."
      pt: 'como.',    // not "eu como."
    });
  });

  test('a third-person pronoun subject is dropped ("esso mangia" → "mangia")', () => {
    expect(sayAll(clause(np('THIRD_PERSON', { gender: 'neut' }), 'EAT'))).toMatchObject({
      it: 'mangia.', // not "esso mangia."
      es: 'come.',   // not "ello come."
      pt: 'come.',   // not "isso come."
    });
  });

  // Regression guards — these must stay green through the fix. A NOUN subject is NOT dropped, and
  // the two non-pro-drop languages keep their overt subject pronoun.
  test('a noun subject is never dropped', () => {
    expect(sayAll(clause(np('CAT'), 'EAT'))).toMatchObject({
      it: 'il gatto mangia.', es: 'el gato come.', pt: 'o gato come.',
    });
  });

  test('French and German keep their subject pronoun (not pro-drop)', () => {
    expect(sayAll(clause(np('THIRD_PERSON', { gender: 'neut' }), 'EAT'))).toMatchObject({
      fr: 'cela mange.', de: 'es isst.',
    });
  });

  // Only a SINGLE bare pronoun drops. A coordinated subject is not a lone pronoun
  // (isPronounElement is false for a coordination), so it keeps its overt surface.
  test('a coordinated pronoun subject is kept, not dropped', () => {
    expect(sayAll(clause({ conjuncts: [np('FIRST_PERSON'), np('THIRD_PERSON')], conjunction: 'and' }, 'EAT')))
      .toMatchObject({
        it: 'io e lui mangiamo.',
        es: 'yo y él comemos.',
        pt: 'eu e ele comemos.',
      });
  });

  // The drop is decided per clause: in a coordination each clause has its own pronoun subject, and
  // each one is dropped independently ("mangio, e corro"), the verb ending carrying the person in
  // both halves.
  test('the drop fires per clause across a coordination', () => {
    expect(sayAll({
      ...clause(np('FIRST_PERSON'), 'EAT'),
      coordination: { conjunction: 'and', clause: clause(np('FIRST_PERSON'), 'RUN') },
    })).toMatchObject({
      it: 'mangio, e corro.',
      es: 'como, y corro.',
      pt: 'como, e corro.',
    });
  });

  // …and likewise in a hypothetical: both the protasis and the apodosis drop their pronoun subject
  // ("se corressi, mangerebbe"), while French/German keep theirs ("si je courais, il mangerait").
  test('the drop fires in both halves of a hypothetical, but not in French/German', () => {
    const sentence = sayAll({
      ...clause(np('THIRD_PERSON'), 'EAT'),
      condition: clause(np('FIRST_PERSON'), 'RUN'),
    });
    expect(sentence).toMatchObject({
      it: 'se corressi, mangerebbe.',
      es: 'si corriera, comería.',
      pt: 'se corresse, comeria.',
      fr: 'si je courais, il mangerait.', // French keeps both pronouns
      de: 'wenn ich laufen würde, würde er essen.',
    });
  });
});

// A92. The subject clitic "je" elides to "j'" before a vowel-initial verb: "j'ai mangé", "j'aime".
// `subjectPhrase` returns "je" and `renderClause` / `relativeText` join it to the predicate with a
// space, so nothing elides it ("je ai mangé", "que je aime").
describe('known bugs: French je elision', () => {
  test('French elides "je" before a vowel', () => {
    expect(sayAll(clause(np('FIRST_PERSON'), 'EAT', { verbPhrase: { aspect: 'resultative' } })).fr).toBe("j'ai mangé.");
    expect(sayAll(clause(np('FIRST_PERSON'), 'LOVE', { directObject: np('CAT') })).fr).toBe("j'aime le chat.");
    expect(sayAll(clause(np('FIRST_PERSON'), 'EAT', { verbPhrase: { aspect: 'progressive', tense: 'past' } })).fr)
      .toBe("j'étais en train de manger.");
    expect(sayAll(clause(np('MOUSE', {
      relative: { headRole: 'directObject', subject: np('FIRST_PERSON'), verbPhrase: { verb: 'LOVE' } },
    }), 'RUN')).fr).toBe("la souris que j'aime court.");
    expect(sayAll({ ...clause(np('CAT'), 'RUN'), condition: clause(np('FIRST_PERSON'), 'EAT', { verbPhrase: { aspect: 'resultative' } }) }).fr)
      .toBe("si j'avais mangé, le chat courrait.");
  });

  test('French elides "je" in a lequel relative, a conditional apodosis and a coordinated clause', () => {
    expect(sayAll(clause(np('HOUSE', {
      relative: { headRole: 'locative', headSpecifiers: [{ kind: 'path', value: 'under' }], subject: np('FIRST_PERSON'), verbPhrase: { verb: 'EAT', aspect: 'resultative' } },
    }), 'BURN')).fr).toBe("la maison sous laquelle j'ai mangé brûle.");
    expect(sayAll({ ...clause(np('FIRST_PERSON'), 'LOVE'), condition: clause(np('FIRST_PERSON'), 'RUN') }).fr).toBe("si je courais, j'aimerais.");
    expect(sayAll({ ...clause(np('CAT'), 'RUN'), coordination: { conjunction: 'and', clause: clause(np('FIRST_PERSON'), 'LOVE', { directObject: np('DOG') }) } }).fr)
      .toBe("le chat court, et j'aime le chien.");
  });

  test('regression: je stays whole before a consonant, a clitic and ne, and a tonic moi never elides', () => {
    expect(sayAll(clause(np('FIRST_PERSON'), 'EAT')).fr).toBe('je mange.');
    expect(sayAll(clause(np('FIRST_PERSON'), 'LOVE', { directObject: np('THIRD_PERSON') })).fr).toBe("je l'aime.");
    expect(sayAll(clause(np('FIRST_PERSON'), 'LOVE', { verbPhrase: { negative: true } })).fr).toBe("je n'aime pas.");
    expect(sayAll(clause({ conjuncts: [np('FIRST_PERSON'), np('CAT')], conjunction: 'and' }, 'LOVE')).fr).toBe('moi et le chat, nous aimons.');
  });
});

// A108. Portuguese models the 2nd person as você / vocês, which agree like the 3rd person: the
// pronoun seed, the possessive "seu", the imperative ("coma") and 48 of 57 verbs do so. Nine verbs'
// seeded forms, the engine's estar/ter tables, the conditional/subjunctive endings in mood.ts and
// the negative cause still carry tu / vós forms ("és", "estás", "tinhas", "comesses", "tua culpa").
describe('known bugs: Portuguese você agreement', () => {
  const you = np('SECOND_PERSON');
  const youAll = np('SECOND_PERSON', { number: 'plural' });

  test('Portuguese agrees a 2nd-person subject as você / vocês', () => {
    expect(sayAll(clause(you, 'BE', { complements: { predicative: { phrase: np('STRONG') } } })).pt).toBe('é forte.');
    expect(sayAll(clause(youAll, 'BE', { complements: { predicative: { phrase: np('STRONG') } } })).pt).toBe('são fortes.');
    expect(sayAll(clause(you, 'BE', { complements: { predicative: { phrase: np('TIRED') } } })).pt).toBe('está cansado.');
    expect(sayAll(clause(you, 'EAT', { verbPhrase: { aspect: 'progressive' } })).pt).toBe('está comendo.');
    expect(sayAll(clause(you, 'EAT', { verbPhrase: { tense: 'past', aspect: 'resultative' } })).pt).toBe('tinha comido.');
    expect(sayAll(clause(you, 'EAT', { verbPhrase: { modals: ['MUST'] } })).pt).toBe('deve comer.');
    expect(sayAll(clause(you, 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('DOG') } } })).pt)
      .toBe('dá o livro ao cão.');
    expect(sayAll(clause(you, 'BECOME', { complements: { predicative: { phrase: np('STRONG') } } })).pt).toBe('se torna forte.');
    expect(sayAll(clause(np('BOOK', { relative: { headRole: 'directObject', subject: you, verbPhrase: { verb: 'SHOW' } } }), 'BURN')).pt)
      .toBe('o livro que você mostra arde.');
    expect(sayAll({ ...clause(np('DOG'), 'RUN'), condition: clause(you, 'EAT') }).pt).toBe('se comesse, o cão correria.');
    expect(sayAll({ ...clause(you, 'RUN'), condition: clause(np('CAT'), 'EAT') }).pt).toBe('se o gato comesse, correria.');
  });

  test('Portuguese blames você / vocês with "sua culpa"', () => {
    const blame = (who: Parameters<typeof np>[1]) => sayAll(clause(np('CAT'), 'CRY', {
      complements: { cause: { phrase: np('SECOND_PERSON', who), specifiers: [{ kind: 'sentiment', value: 'negative' }] } },
    })).pt;
    expect(blame({})).toBe('o gato chora por sua culpa.');
    expect(blame({ number: 'plural' })).toBe('o gato chora por sua culpa.');
  });

  test('Portuguese agrees vocês in every table: modals, BE and estar, the auxiliaries and the hypothetical', () => {
    const strong = { predicative: { phrase: np('STRONG') } };
    expect(sayAll(clause(youAll, 'EAT', { verbPhrase: { modals: ['CAN'] } })).pt).toBe('podem comer.');
    expect(sayAll(clause(youAll, 'BE', { complements: strong, verbPhrase: { tense: 'future' } })).pt).toBe('serão fortes.');
    expect(sayAll(clause(youAll, 'BE', { complements: { predicative: { phrase: np('TIRED') } } })).pt).toBe('estão cansados.');
    expect(sayAll(clause(you, 'BE', { complements: { locative: { phrase: np('HOUSE') } }, verbPhrase: { tense: 'past' } })).pt).toBe('estava na casa.');
    expect(sayAll(clause(youAll, 'EAT', { verbPhrase: { aspect: 'progressive', tense: 'future' } })).pt).toBe('estarão comendo.');
    expect(sayAll(clause(you, 'SEEM', { complements: { predicative: { phrase: np('TIRED') } } })).pt).toBe('parece cansado.');
    expect(sayAll({ ...clause(youAll, 'RUN'), condition: clause(np('CAT'), 'EAT') }).pt).toBe('se o gato comesse, correriam.');
    expect(sayAll({ ...clause(np('DOG'), 'RUN'), condition: clause(youAll, 'EAT') }).pt).toBe('se comessem, o cão correria.');
    expect(sayAll({ ...clause(you, 'EAT', { verbPhrase: { aspect: 'resultative' } }), condition: clause(np('CAT'), 'EAT') }).pt).toBe('se o gato comesse, teria comido.');
  });

  test('regression: the 1st person, the other blamers and a coordinated você keep their forms', () => {
    const blame = (who: ReturnType<typeof np>) =>
      sayAll(clause(np('CAT'), 'CRY', { complements: { cause: { phrase: who, specifiers: [{ kind: 'sentiment', value: 'negative' }] } } })).pt;
    expect(sayAll(clause(np('FIRST_PERSON'), 'BE', { complements: { predicative: { phrase: np('STRONG') } } })).pt).toBe('sou forte.');
    expect(sayAll({ ...clause(np('FIRST_PERSON', { number: 'plural' }), 'RUN'), condition: clause(np('CAT'), 'EAT') }).pt).toBe('se o gato comesse, correríamos.');
    expect(blame(np('FIRST_PERSON', { number: 'plural' }))).toBe('o gato chora por nossa culpa.');
    expect(blame(np('THIRD_PERSON'))).toBe('o gato chora por sua culpa.');
    expect(sayAll(clause({ conjuncts: [you, np('CAT')], conjunction: 'and' }, 'BE', { complements: { predicative: { phrase: np('STRONG') } } })).pt)
      .toBe('você e o gato são fortes.');
  });
});

// A161. A feminine PLURAL third person renders as 彼ら — the masculine/default plural. Japanese has
// 彼女ら (かのじょら), and the engine already selects a feminine plural surface wherever the corpus
// carries one (French elles, Spanish ellas, Portuguese elas all come out right from this plan);
// the `ja` row of THIRD_PERSON is the one gendered plural that is not seeded. English `they`,
// German `sie` and Italian `loro` have no gendered plural at all and are right as they stand.
describe('known bugs: Japanese feminine plural pronoun', () => {
  const plural = (gender: 'masc' | 'fem') =>
    sayAll(clause(np('THIRD_PERSON', { number: 'plural', gender }), 'RUN'));

  test('a feminine plural subject and object read 彼女ら', () => {
    expect(plural('fem').ja).toBe('彼女らは走ります。'); // now: 彼らは走ります。
    expect(sayAll(clause(np('CAT'), 'SEE', {
      directObject: np('THIRD_PERSON', { number: 'plural', gender: 'fem' }),
    })).ja).toBe('猫は彼女らを見ます。'); // now: 猫は彼らを見ます。
  });

  // The seed alone fixes the text but not the READING: `resolveNounPhrase` picks `plural_fem` for
  // the surface generically, then takes `plural_reading` unconditionally, so a feminine-plural
  // surface keeps the masculine reading.
  test('the furigana reads かのじょら, not かれら', () => {
    expect(furigana(clause(np('THIRD_PERSON', { number: 'plural', gender: 'fem' }), 'RUN')))
      .toEqual(['かのじょら', 'はしります']);
  });

  // Regression: the masculine/mixed plural stays 彼ら, the feminine SINGULAR is already right, and
  // the gendered-plural languages that do work must not change.
  test('the masculine plural, the feminine singular and the other six are unchanged', () => {
    expect(plural('masc').ja).toBe('彼らは走ります。');
    expect(furigana(clause(np('THIRD_PERSON', { number: 'plural', gender: 'masc' }), 'RUN')))
      .toEqual(['かれら', 'はしります']);
    expect(third({ gender: 'fem' }).ja).toBe('彼女は食べます。');
    expect(plural('fem')).toMatchObject({
      en: 'they run.', fr: 'elles courent.', de: 'sie laufen.',
      it: 'corrono.', es: 'corren.', pt: 'correm.',
    });
  });

  // The surface is the pronoun's, so it reaches every slot the pronoun does — a complement, a
  // conjunct, and both ends of one clause — and the furigana follows it there too.
  test('彼女ら reaches the complements, a coordination and both ends of a clause', () => {
    const femPlural = np('THIRD_PERSON', { number: 'plural', gender: 'fem' });
    expect(sayAll(clause(np('CAT'), 'CRY', { complements: { cause: { phrase: femPlural } } })).ja)
      .toBe('猫は彼女らのために泣きます。');
    expect(sayAll(clause(np('MAN'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: femPlural } } })).ja)
      .toBe('男は彼女らに本をあげます。');
    expect(sayAll(clause({ conjuncts: [femPlural, np('CAT')], conjunction: 'and' }, 'RUN')).ja)
      .toBe('彼女らと猫は走ります。');
    expect(sayAll(clause(femPlural, 'SEE', { directObject: femPlural })).ja).toBe('彼女らは彼女らを見ます。');
    expect(furigana(clause(np('CAT'), 'SEE', { directObject: femPlural }))).toEqual(['ねこ', 'かのじょら', 'みます']);
  });

  // The POSSESSIVE is a second surface, off a hardcoded table rather than the seed (`possessiveJa`),
  // and had the same gap: a feminine plural possessor read 彼らの where the feminine singular already
  // read 彼女の. The bug's table did not list it; it is the same missing pronoun.
  test('a feminine plural possessor reads 彼女らの', () => {
    const owns = (gender: 'masc' | 'fem', number: 'singular' | 'plural') =>
      sayAll(clause(np('CAT', { possessor: { kind: 'pronominal', person: '3', number, gender } }), 'RUN')).ja;
    expect(owns('fem', 'plural')).toBe('彼女らの猫は走ります。');
    expect(owns('masc', 'plural')).toBe('彼らの猫は走ります。');
    expect(owns('fem', 'singular')).toBe('彼女の猫は走ります。');
  });
});

// A200. 彼ら is a group of PEOPLE. A group of things is それら, the plural of それ, and the engine has
// no such word: a neuter third plural comes out 彼ら. `resolveNounPhrase` selects a plural pronoun's
// surface with `gender === 'fem' && forms['plural_fem']` — `plural_fem` is the only gendered plural
// it knows — and the `ja` row of THIRD_PERSON carries `plural` and `plural_fem` and nothing else, so
// a neuter plural misses both tests and takes the masculine default. The singular is complete
// (`singular_neut: 'それ'`, read generically), which is why それ is right and それら is not. The fix
// is a seed form AND engine logic: a `plural_neut` row the resolver does not look at changes
// nothing. This is the gap C20 named in its item 7 and did not close. A201 is the possessive, off a
// different (hardcoded) table, and is not fixed by this.
describe('known bugs: the Japanese plural neuter pronoun', () => {
  const neutPl = np('THIRD_PERSON', { gender: 'neut', number: 'plural' });

  test('a neuter plural third person reads それら in every slot', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: neutPl })).ja).toBe('猫はそれらを見ます。'); // now: 猫は彼らを見ます。
    expect(sayAll(clause(neutPl, 'RUN')).ja).toBe('それらは走ります。'); // now: 彼らは走ります。
    expect(sayAll(clause(np('CAT'), 'CRY', { complements: { cause: { phrase: neutPl } } })).ja).toBe('猫はそれらのために泣きます。');
    expect(sayAll(clause(np('MAN'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: neutPl } } })).ja)
      .toBe('男はそれらに本をあげます。');
    expect(sayAll(clause({ conjuncts: [neutPl, np('CAT')], conjunction: 'and' }, 'RUN')).ja).toBe('それらと猫は走ります。');
  });

  // それら is kana, so it takes no furigana — unlike 彼ら, whose かれら the surface drags along today.
  test('それら carries no reading', () => {
    expect(furigana(clause(neutPl, 'RUN'))).toEqual(['はしります']); // now: ['かれら', 'はしります']
  });

  // The other way in is an `antecedent`: `antecedentAgreement` hands Japanese the natural gender, and
  // a plural non-person resolves to neuter (C20's rule), so a group of things named by an antecedent
  // reads それら without the plan saying `neut` at all. The resolver's read is generic, so no other
  // lexeme moves: only the ja THIRD_PERSON row has a `plural_neut`.
  test('an antecedent naming things reaches それら too, and the first and second persons do not', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', {
      directObject: np('THIRD_PERSON', { number: 'plural', antecedent: 'BOOK' }),
    })).ja).toBe('猫はそれらを見ます。');
    expect(sayAll(clause(np('CAT'), 'SEE', {
      directObject: np('THIRD_PERSON', { number: 'plural', antecedent: 'MAN' }),
    })).ja).toBe('猫は彼らを見ます。');
    expect(sayAll(clause(np('FIRST_PERSON', { gender: 'neut', number: 'plural' }), 'RUN')).ja).toBe('私たちは走ります。');
    expect(sayAll(clause(np('SECOND_PERSON', { gender: 'neut', number: 'plural' }), 'RUN')).ja).toBe('あなたたちは走ります。');
  });

  // Regression: the masculine and mixed plural keep 彼ら and its reading, the feminine plural keeps
  // A161's 彼女ら, the neuter SINGULAR それ is already right, and the other six languages have no
  // person/thing split in the plural pronoun at all.
  test('the masculine and feminine plurals, the neuter singular and the other six are unchanged', () => {
    expect(sayAll(clause(np('THIRD_PERSON', { gender: 'masc', number: 'plural' }), 'RUN')).ja).toBe('彼らは走ります。');
    expect(furigana(clause(np('THIRD_PERSON', { gender: 'masc', number: 'plural' }), 'RUN'))).toEqual(['かれら', 'はしります']);
    expect(sayAll(clause(np('THIRD_PERSON', { gender: 'fem', number: 'plural' }), 'RUN')).ja).toBe('彼女らは走ります。');
    expect(furigana(clause(np('THIRD_PERSON', { gender: 'fem', number: 'plural' }), 'RUN'))).toEqual(['かのじょら', 'はしります']);
    expect(sayAll(clause(np('THIRD_PERSON', { gender: 'neut' }), 'RUN')).ja).toBe('それは走ります。');
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('THIRD_PERSON', { gender: 'neut' }) })).ja).toBe('猫はそれを見ます。');
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: neutPl }))).toMatchObject({
      en: 'the cat sees them.', it: 'il gatto li vede.', fr: 'le chat les voit.',
      de: 'der Kater sieht sie.', es: 'el gato los ve.', pt: 'o gato os vê.',
    });
  });
});

// A205. A pronoun behind an adposition takes its tonic (disjunctive) form, and `resolveNounPhrase`
// reads that form off `disjunctive_plural` alone — there is no `disjunctive_plural_fem`, in the seed
// or in the resolver. So a feminine group is masculine everywhere an adposition governs it, in the
// three languages that have a feminine plural tonic form: French elles, Spanish ellas / nosotras /
// vosotras, Portuguese elas. The subject surface is right (A36, A161 seeded `plural_fem` and the
// resolver reads it), which is what localises this to the tonic form. English, German and Italian
// have no gendered plural tonic (them / ihnen / loro) and are right as they stand; Japanese carries
// its 彼女ら into every slot.
describe('known bugs: the feminine plural tonic pronoun', () => {
  const femPl = { number: 'plural', gender: 'fem' } as const;
  const her = (concept = 'THIRD_PERSON') => np(concept, femPl);

  test('the feminine plural is feminine after an adposition too', () => {
    expect(sayAll(clause(np('CAT'), 'CRY', { complements: { cause: { phrase: her() } } }))).toMatchObject({
      fr: "le chat pleure à cause d'elles.", // now: "à cause d'eux"
      es: 'el gato llora a causa de ellas.', // now: "de ellos"
      pt: 'o gato chora por causa delas.',   // now: "deles"
    });
    expect(sayAll(clause(np('CAT'), 'COORDINATE', { complements: { comitative: { phrase: her() } } }))).toMatchObject({
      fr: 'le chat coordonne avec elles.', es: 'el gato coordina con ellas.', pt: 'o gato coordena com elas.',
    });
    expect(sayAll(clause(her(), 'SEE', { directObject: np('DOG'), verbPhrase: { voice: 'passive' } }))).toMatchObject({
      fr: 'le chien est vu par elles.', es: 'el perro es visto por ellas.', pt: 'o cão é visto por elas.',
    });
    expect(sayAll(clause(np('CAT'), 'CLICK', { directObject: her() }))).toMatchObject({
      fr: 'le chat clique sur elles.', es: 'el gato clica en ellas.', pt: 'o gato clica nelas.',
    });
    // Spanish is the one with a gendered 1st and 2nd plural as well.
    expect(sayAll(clause(np('CAT'), 'COORDINATE', { complements: { comitative: { phrase: her('FIRST_PERSON') } } })).es)
      .toBe('el gato coordina con nosotras.');
    expect(sayAll(clause(np('CAT'), 'COORDINATE', { complements: { comitative: { phrase: her('SECOND_PERSON') } } })).es)
      .toBe('el gato coordina con vosotras.');
  });

  // The key is read off the gender in hand, so the genders that have no feminine form to select keep
  // the one they had: a NEUTER plural is ellos / eles / eux in all three (neither Iberian language
  // spells a neuter group apart from a masculine one, and French has no neuter plural at all), and
  // that is the surface an antecedent naming things resolves to as well.
  test('the masculine and neuter plurals keep the masculine tonic form', () => {
    const withGender = (gender: 'masc' | 'neut') =>
      sayAll(clause(np('CAT'), 'CRY', { complements: { cause: { phrase: np('THIRD_PERSON', { number: 'plural', gender }) } } }));
    expect(withGender('masc')).toMatchObject({
      fr: "le chat pleure à cause d'eux.", es: 'el gato llora a causa de ellos.', pt: 'o gato chora por causa deles.',
    });
    expect(withGender('neut')).toMatchObject({
      fr: "le chat pleure à cause d'eux.", es: 'el gato llora a causa de ellos.', pt: 'o gato chora por causa deles.',
    });
    expect(sayAll(clause(np('CAT'), 'COORDINATE', {
      complements: { comitative: { phrase: np('THIRD_PERSON', { number: 'plural', antecedent: 'GATE' }) } },
    }))).toMatchObject({
      fr: 'le chat coordonne avec eux.', es: 'el gato coordina con ellos.', pt: 'o gato coordena com eles.',
    });
  });

  // The instrumental is the other slot A197 gave the tonic form, and it reads the same key. The
  // French and Portuguese 1st and 2nd plurals are the counterpart of the Spanish pair above: they
  // are invariable, so no `disjunctive_plural_fem` is seeded and each falls through to the form it
  // already had — including the Portuguese "com" + "nós" fusion.
  test('the instrumental follows, and the invariable 1st and 2nd plurals are unchanged', () => {
    expect(sayAll(clause(np('CAT'), 'COORDINATE', { complements: { instrumental: { phrase: her() } } }))).toMatchObject({
      fr: 'le chat coordonne avec elles.', es: 'el gato coordina con ellas.', pt: 'o gato coordena com elas.',
    });
    expect(sayAll(clause(np('CAT'), 'COORDINATE', { complements: { comitative: { phrase: her('FIRST_PERSON') } } })))
      .toMatchObject({ fr: 'le chat coordonne avec nous.', pt: 'o gato coordena conosco.' });
    expect(sayAll(clause(np('CAT'), 'COORDINATE', { complements: { comitative: { phrase: her('SECOND_PERSON') } } })))
      .toMatchObject({ fr: 'le chat coordonne avec vous.', pt: 'o gato coordena com vocês.' });
  });

  // Regression: the subject surface, which A36 and A161 settled, and the three languages with no
  // feminine plural tonic form to select.
  test('the subject pronoun and the languages without one are right', () => {
    expect(sayAll(clause(her(), 'RUN'))).toMatchObject({
      fr: 'elles courent.', ja: '彼女らは走ります。',
    });
    expect(sayAll(clause(np('CAT'), 'COORDINATE', { complements: { comitative: { phrase: her() } } }))).toMatchObject({
      en: 'the cat coordinates with them.', de: 'der Kater koordiniert mit ihnen.', it: 'il gatto coordina con loro.',
      ja: '猫は彼女らと調整します。',
    });
  });
});
