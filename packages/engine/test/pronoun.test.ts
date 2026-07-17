import { describe, expect, test } from 'vitest';
import type { NounPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

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

  // The plural has no neuter pronoun in any of the seven — a group of "it"s is "they" — so a neuter
  // third plural is the genderless plural form, identical to the (masculine-default) plain plural.
  test('neuter is a no-op in the plural — a neuter "they" is the plain "they"', () => {
    const neutPl = sayAll(clause(np('THIRD_PERSON', { gender: 'neut', number: 'plural' }), 'EAT'));
    expect(neutPl).toMatchObject({
      en: 'they eat.', it: 'mangiano.', fr: 'ils mangent.', es: 'comen.',
      pt: 'comem.', de: 'sie essen.', ja: '彼らは食べます。',
    });
    expect(neutPl).toEqual(sayAll(clause(np('THIRD_PERSON', { number: 'plural' }), 'EAT')));
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
