import { describe, expect, test } from 'vitest';
import type { NounElement, NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';

// A pronoun in the DIRECT-OBJECT slot — "the cat sees me / you / him". A pronoun object is not a
// noun object: it takes the language's oblique/accusative form, no article, and in Romance it is a
// PROCLITIC that moves in front of the finite verb ("il gatto MI vede", not "vede il gatto"). Only
// the subject slot has been exercised until now; this file covers the object slot.
const sees = (concept: string, extra: Partial<NounPhrase> = {}) =>
  sayAll(clause(np('CAT'), 'SEE', { directObject: np(concept, extra) }));

// The six person/number cells, plus the feminine third singular (which selects a distinct form in
// most languages: her / la / elle / sie / ella).
const P1SG = ['FIRST_PERSON', {}] as const;
const P1PL = ['FIRST_PERSON', { number: 'plural' }] as const;
const P2SG = ['SECOND_PERSON', {}] as const;
const P2PL = ['SECOND_PERSON', { number: 'plural' }] as const;
const P3SG = ['THIRD_PERSON', {}] as const;
const P3PL = ['THIRD_PERSON', { number: 'plural' }] as const;
const P3SGF = ['THIRD_PERSON', { gender: 'fem' }] as const;

// Japanese is correct out of the box: a pronoun object is marked with を exactly like a noun
// object, and Japanese has no article to wrongly attach and no clitic movement — so the surface is
// right for every person.
describe('object pronoun: Japanese', () => {
  test('every person takes を on the oblique pronoun', () => {
    expect(sees(...P1SG).ja).toBe('猫は私を見ます。');
    expect(sees(...P1PL).ja).toBe('猫は私たちを見ます。');
    expect(sees(...P2SG).ja).toBe('猫はあなたを見ます。');
    expect(sees(...P2PL).ja).toBe('猫はあなたたちを見ます。');
    expect(sees(...P3SG).ja).toBe('猫は彼を見ます。');
    expect(sees(...P3PL).ja).toBe('猫は彼らを見ます。');
    expect(sees(...P3SGF).ja).toBe('猫は彼女を見ます。');
  });
});

// The European languages used to get this wrong the same way: the engine rendered a pronoun object
// as though it were a NOUN — an article on the nominative citation form ("the cat sees THE I", "il
// gatto vede L'IO", "der Kater sieht DEN ICH"). A pronoun object now takes no article and its object
// form: English/German use it post-verbally ("sees me", "sieht ihn"), and Romance cliticises it
// before the finite verb ("il gatto mi vede"). One per language below.
describe('known bugs: object pronoun', () => {
  test('English uses the object form, no article: "sees me/us/you/him/her/them"', () => {
    expect(sees(...P1SG)).toMatchObject({ en: 'the cat sees me.' });
    expect(sees(...P1PL)).toMatchObject({ en: 'the cat sees us.' });
    expect(sees(...P2SG)).toMatchObject({ en: 'the cat sees you.' });
    expect(sees(...P3SG)).toMatchObject({ en: 'the cat sees him.' });
    expect(sees(...P3SGF)).toMatchObject({ en: 'the cat sees her.' });
    expect(sees(...P3PL)).toMatchObject({ en: 'the cat sees them.' });
  });

  test('Italian cliticises before the verb: "il gatto mi/ti/lo/la/ci/vi/li vede"', () => {
    expect(sees(...P1SG)).toMatchObject({ it: 'il gatto mi vede.' });
    expect(sees(...P1PL)).toMatchObject({ it: 'il gatto ci vede.' });
    expect(sees(...P2SG)).toMatchObject({ it: 'il gatto ti vede.' });
    expect(sees(...P2PL)).toMatchObject({ it: 'il gatto vi vede.' });
    expect(sees(...P3SG)).toMatchObject({ it: 'il gatto lo vede.' });
    expect(sees(...P3SGF)).toMatchObject({ it: 'il gatto la vede.' });
    expect(sees(...P3PL)).toMatchObject({ it: 'il gatto li vede.' });
  });

  test('French cliticises before the verb: "le chat me/te/le/la/nous/vous/les voit"', () => {
    expect(sees(...P1SG)).toMatchObject({ fr: 'le chat me voit.' });
    expect(sees(...P1PL)).toMatchObject({ fr: 'le chat nous voit.' });
    expect(sees(...P2SG)).toMatchObject({ fr: 'le chat te voit.' });
    expect(sees(...P2PL)).toMatchObject({ fr: 'le chat vous voit.' });
    expect(sees(...P3SG)).toMatchObject({ fr: 'le chat le voit.' });
    expect(sees(...P3SGF)).toMatchObject({ fr: 'le chat la voit.' });
    expect(sees(...P3PL)).toMatchObject({ fr: 'le chat les voit.' });
  });

  test('Spanish cliticises before the verb: "el gato me/te/lo/la/nos/os/los ve"', () => {
    expect(sees(...P1SG)).toMatchObject({ es: 'el gato me ve.' });
    expect(sees(...P1PL)).toMatchObject({ es: 'el gato nos ve.' });
    expect(sees(...P2SG)).toMatchObject({ es: 'el gato te ve.' });
    expect(sees(...P2PL)).toMatchObject({ es: 'el gato os ve.' }); // vosotros → os
    expect(sees(...P3SG)).toMatchObject({ es: 'el gato lo ve.' }); // etymological accusative (not leísta "le")
    expect(sees(...P3SGF)).toMatchObject({ es: 'el gato la ve.' });
    expect(sees(...P3PL)).toMatchObject({ es: 'el gato los ve.' });
  });

  // Portuguese asserted as the Brazilian proclitic ("o gato me vê"), consistent with the corpus's
  // Brazilian choices elsewhere (você / vocês). European Portuguese would enclise ("o gato vê-me");
  // whichever is chosen, the current "o gato vê o eu" — article + nominative — is wrong.
  test('Portuguese cliticises: "o gato me/te/o/a/nos/vos/os vê"', () => {
    expect(sees(...P1SG)).toMatchObject({ pt: 'o gato me vê.' });
    expect(sees(...P1PL)).toMatchObject({ pt: 'o gato nos vê.' });
    expect(sees(...P2SG)).toMatchObject({ pt: 'o gato te vê.' });
    expect(sees(...P3SG)).toMatchObject({ pt: 'o gato o vê.' });
    expect(sees(...P3SGF)).toMatchObject({ pt: 'o gato a vê.' });
    expect(sees(...P3PL)).toMatchObject({ pt: 'o gato os vê.' });
  });

  test('German uses the accusative form, no article: "sieht mich/dich/ihn/sie/uns/euch"', () => {
    expect(sees(...P1SG)).toMatchObject({ de: 'der Kater sieht mich.' });
    expect(sees(...P1PL)).toMatchObject({ de: 'der Kater sieht uns.' });
    expect(sees(...P2SG)).toMatchObject({ de: 'der Kater sieht dich.' });
    expect(sees(...P2PL)).toMatchObject({ de: 'der Kater sieht euch.' });
    expect(sees(...P3SG)).toMatchObject({ de: 'der Kater sieht ihn.' }); // er → ihn in the accusative
    expect(sees(...P3SGF)).toMatchObject({ de: 'der Kater sieht sie.' });
    expect(sees(...P3PL)).toMatchObject({ de: 'der Kater sieht sie.' });
  });

  // The single clearest symptom, asserted directly: no European language should attach an article
  // to a pronoun object. This is what "the cat sees THE I" / "vede L'IO" / "sieht DEN ICH" all share.
  test('no European language attaches an article to a pronoun object', () => {
    expect(sees(...P1SG).en).not.toContain('the I');
    expect(sees(...P1SG).it).not.toContain("l'io");
    expect(sees(...P1SG).fr).not.toContain('le je');
    expect(sees(...P1SG).es).not.toContain('el yo');
    expect(sees(...P1SG).pt).not.toContain('o eu');
    expect(sees(...P1SG).de).not.toContain('den ich');
  });

  // Negation composes with the clitic/object placement: English do-support, German "nicht" after
  // the object, and the Romance clitic sitting inside the negator ("non/ne … pas/no/não me …").
  const seesNeg = (concept: string, extra: Partial<NounPhrase> = {}) =>
    sayAll(clause(np('CAT'), 'SEE', { directObject: np(concept, extra), verbPhrase: { negative: true } }));
  test('negation composes with the object pronoun', () => {
    expect(seesNeg(...P1SG)).toMatchObject({
      en: 'the cat does not see me.',
      de: 'der Kater sieht mich nicht.',
      it: 'il gatto non mi vede.',
      fr: 'le chat ne me voit pas.',
      es: 'el gato no me ve.',
      pt: 'o gato não me vê.',
    });
  });

  // French elides me/te/le/la → m'/t'/l' before a vowel-initial verb ("m'ajoute", "l'ajoute").
  const frAdds = (concept: string) =>
    sayAll(clause(np('CAT'), 'ADD', { directObject: np(concept) })).fr;
  test('French elides the clitic before a vowel-initial verb', () => {
    expect(frAdds('FIRST_PERSON')).toBe("le chat m'ajoute.");
    expect(frAdds('THIRD_PERSON')).toBe("le chat l'ajoute.");
  });

  // The neuter third person takes its own object form ("lo" / "es" / "it").
  test('the neuter third person object', () => {
    expect(sees('THIRD_PERSON', { gender: 'neut' })).toMatchObject({
      en: 'the cat sees it.',
      it: 'il gatto lo vede.',
      de: 'der Kater sieht es.',
    });
  });

  // Regression: a NOUN direct object is untouched — it keeps its article and post-verbal position.
  test('a noun direct object is unchanged', () => {
    expect(sees('MOUSE')).toMatchObject({
      en: 'the cat sees the mouse.',
      it: 'il gatto vede il topo.',
      fr: 'le chat voit la souris.',
      es: 'el gato ve el ratón.',
      pt: 'o gato vê o rato.',
      de: 'der Kater sieht die Maus.',
    });
  });
});

// A53. The pronoun-object path (accusative form, no article) only fires for a single pronoun
// (`isPronounElement`). A coordinated object goes down the noun path, so each pronoun conjunct gets
// a definite article and its nominative form.
describe('known bugs: German coordinated pronoun object', () => {
  const catSees = (...conjuncts: NounPhrase[]) =>
    sayAll(clause(np('CAT'), 'SEE', { directObject: { conjuncts, conjunction: 'and' } })).de;

  test('German renders each pronoun conjunct in its accusative form, with no article', () => {
    expect(catSees(np('THIRD_PERSON'), np('FIRST_PERSON'))).toBe('der Kater sieht ihn und mich.');
    expect(catSees(np('DOG'), np('SECOND_PERSON'))).toBe('der Kater sieht den Hund und dich.');
  });

  test('German declines every person, gender and number, in either order', () => {
    expect(catSees(np('THIRD_PERSON', { gender: 'fem' }), np('THIRD_PERSON', { number: 'plural' }))).toBe('der Kater sieht sie und sie.');
    expect(catSees(np('SECOND_PERSON', { number: 'plural' }), np('THIRD_PERSON', { gender: 'fem' }))).toBe('der Kater sieht euch und sie.');
    expect(catSees(np('FIRST_PERSON'), np('DOG'))).toBe('der Kater sieht mich und den Hund.');
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: { conjuncts: [np('THIRD_PERSON'), np('FIRST_PERSON')], conjunction: 'or' } })).de)
      .toBe('der Kater sieht ihn oder mich.');
  });

  test('German keeps the accusative group in a negation, a perfect, a relative clause and a command', () => {
    const himAndMe = { conjuncts: [np('THIRD_PERSON'), np('FIRST_PERSON')], conjunction: 'and' as const };
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: himAndMe, verbPhrase: { negative: true } })).de).toBe('der Kater sieht ihn und mich nicht.');
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: himAndMe, verbPhrase: { aspect: 'resultative' } })).de).toBe('der Kater hat ihn und mich gesehen.');
    expect(sayAll(clause(np('DOG', { relative: { verbPhrase: { verb: 'SEE' }, directObject: himAndMe } }), 'RUN')).de)
      .toBe('der Hund, der ihn und mich sieht, läuft.');
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'SEE', { directObject: himAndMe }), imperative: true }).de).toBe('sieh ihn und mich.');
  });

  test('regression: a group of nouns keeps its articles', () => {
    expect(catSees(np('DOG'), np('MOUSE'))).toBe('der Kater sieht den Hund und die Maus.');
  });
});

// A67. With "avere", the Italian past participle agrees with a preceding third-person object clitic
// ("l'ha vista", "li ha visti"). `aspectVerb` agrees the participle only for an "essere" verb, with
// the subject, and never sees the object. The pin accepts "la ha" or "l'ha" and pins the agreement.
describe('known bugs: Italian participle agreement with a preceding object clitic', () => {
  test('Italian agrees the past participle with a preceding la/li', () => {
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('THIRD_PERSON', { gender: 'fem' }), verbPhrase: { aspect: 'resultative' } }), 'it'))
      .toMatch(/^il gatto (?:l'|la )ha vista\.$/);
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('THIRD_PERSON', { number: 'plural' }), verbPhrase: { aspect: 'resultative' } }), 'it'))
      .toBe('il gatto li ha visti.');
    expect(say(clause(np('CAT'), 'EAT', { directObject: np('THIRD_PERSON', { gender: 'fem' }), verbPhrase: { aspect: 'resultative', tense: 'past' } }), 'it'))
      .toMatch(/^il gatto (?:l'|la )aveva mangiata\.$/);
  });

  const sawIt = (extra: Partial<NounPhrase>, verbPhrase: Partial<VerbPhrase> = { aspect: 'resultative' }) =>
    say(clause(np('CAT'), 'SEE', { directObject: np('THIRD_PERSON', extra), verbPhrase }), 'it');

  test('Italian agrees under a modal, in a hypothetical and in a relative clause', () => {
    expect(sawIt({ gender: 'fem' }, { aspect: 'resultative', modals: [{ verb: 'MUST' }] })).toBe('il gatto la deve aver vista.');
    expect(say({ ...clause(np('DOG'), 'RUN'), condition: clause(np('CAT'), 'SEE', { directObject: np('THIRD_PERSON', { gender: 'fem' }), verbPhrase: { aspect: 'resultative' } }) }, 'it'))
      .toBe('se il gatto la avesse vista, il cane correrebbe.');
    expect(say(clause(np('DOG', { relative: { verbPhrase: { verb: 'SEE', aspect: 'resultative' }, directObject: np('THIRD_PERSON', { gender: 'fem' }) } }), 'RUN'), 'it'))
      .toBe('il cane che la ha vista corre.');
  });

  test('regression: lo, the optional mi / ti and a noun object leave the participle alone', () => {
    expect(sawIt({})).toBe('il gatto lo ha visto.');
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('FIRST_PERSON', { gender: 'fem' }), verbPhrase: { aspect: 'resultative' } }), 'it')).toBe('il gatto mi ha visto.');
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('HOUSE'), verbPhrase: { aspect: 'resultative' } }), 'it')).toBe('il gatto ha visto la casa.');
    expect(sawIt({ gender: 'fem' }, { aspect: 'progressive' })).toBe('il gatto la sta vedendo.');
  });
});

// A67. An avoir participle agrees with a preceding direct object, and an object clitic always
// precedes it: "le chat l'a vue", "les a vus". A37 threads the preceding object into
// `aspectVerbFr` only from an object-relative clause; `predicateText` never passes the clitic's forms.
describe('known bugs: French participle agreement with an object clitic', () => {
  test('French agrees the avoir participle with a preceding object clitic', () => {
    const sawIt = (extra: Parameters<typeof np>[1]) =>
      sayAll(clause(np('CAT'), 'SEE', { directObject: np('THIRD_PERSON', extra), verbPhrase: { aspect: 'resultative' } })).fr;
    expect(sawIt({ gender: 'fem' })).toBe("le chat l'a vue.");
    expect(sawIt({ number: 'plural' })).toBe('le chat les a vus.');
    expect(sawIt({ number: 'plural', gender: 'fem' })).toBe('le chat les a vues.');
  });

  test('French agrees in every person, in the pluperfect, a hypothetical and a relative clause', () => {
    const saw = (object: NounElement, verbPhrase: Partial<VerbPhrase> = { aspect: 'resultative' }) =>
      sayAll(clause(np('CAT'), 'SEE', { directObject: object, verbPhrase })).fr;
    expect(saw(np('FIRST_PERSON', { gender: 'fem' }))).toBe("le chat m'a vue.");
    expect(saw(np('FIRST_PERSON', { number: 'plural', gender: 'fem' }))).toBe('le chat nous a vues.');
    expect(saw(np('THIRD_PERSON', { gender: 'fem' }), { aspect: 'resultative', tense: 'past' })).toBe("le chat l'avait vue.");
    // A resumed group agrees as the group.
    expect(saw({ conjuncts: [np('THIRD_PERSON'), np('FIRST_PERSON')], conjunction: 'and' })).toBe('le chat nous a vus, lui et moi.');
    expect(sayAll({ ...clause(np('DOG'), 'RUN'), condition: clause(np('CAT'), 'SEE', { directObject: np('THIRD_PERSON', { gender: 'fem' }), verbPhrase: { aspect: 'resultative' } }) }).fr)
      .toBe("si le chat l'avait vue, le chien courrait.");
    expect(sayAll(clause(np('DOG', { relative: { verbPhrase: { verb: 'SEE', aspect: 'resultative' }, directObject: np('THIRD_PERSON', { gender: 'fem' }) } }), 'RUN')).fr)
      .toBe("le chien qui l'a vue court.");
  });

  test('regression: the masculine singular, a noun object and the object relative are unchanged', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('THIRD_PERSON'), verbPhrase: { aspect: 'resultative' } })).fr).toBe("le chat l'a vu.");
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('HOUSE'), verbPhrase: { aspect: 'resultative' } })).fr).toBe('le chat a vu la maison.');
    expect(sayAll(clause(np('MOUSE', { relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'EAT', aspect: 'resultative' } } }), 'RUN')).fr)
      .toBe('la souris que le chat a mangée court.');
  });
});

// A70. An object pronoun attaches after an infinitive ("comerlo") and after an affirmative command
// ("cómelo"). `predicateText` passes both through `esCliticize`, which only ever puts the clitic in
// front of the verb. The infinitive branch's comment claims enclisis ("consumirlo") but the code
// doesn't do it. The negative command ("no lo comas") and finite verbs are already right.
describe('known bugs: Spanish enclitic object pronoun', () => {
  test('Spanish attaches the object pronoun after an infinitive', () => {
    expect(sayAll({ ...clause(np('GENERIC_PERSON'), 'EAT', { directObject: np('THIRD_PERSON') }), infinitive: true }).es)
      .toBe('comerlo.');
    expect(sayAll({ ...clause(np('GENERIC_PERSON'), 'EAT', { verbPhrase: { negative: true }, directObject: np('THIRD_PERSON') }), infinitive: true }).es)
      .toBe('no comerlo.');
    expect(sayAll({ ...clause(np('GENERIC_PERSON'), 'SEE', { directObject: np('FIRST_PERSON') }), infinitive: true }).es)
      .toBe('verme.');
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'LOAD', { directObject: np('THIRD_PERSON') }), imperative: true, imperativeRegister: 'instruction' }).es)
      .toBe('cargarlo.');
  });

  test('Spanish attaches the object pronoun after an affirmative command', () => {
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'EAT', { directObject: np('THIRD_PERSON') }), imperative: true }).es)
      .toBe('cómelo.');
    expect(sayAll({ ...clause(np('FIRST_PERSON', { number: 'plural' }), 'EAT', { directObject: np('THIRD_PERSON') }), imperative: true }).es)
      .toBe('comámoslo.');
    expect(sayAll({ ...clause(np('SECOND_PERSON', { number: 'plural' }), 'EAT', { directObject: np('THIRD_PERSON') }), imperative: true }).es)
      .toBe('comedlo.');
  });

  test('Spanish attaches every object pronoun, writing the accent the longer word needs', () => {
    const command = (directObject: NounElement, extra: Partial<PhrasePlan> = {}) =>
      sayAll({ ...clause(np('SECOND_PERSON'), 'SEE', { directObject }), imperative: true, ...extra }).es;
    expect(command(np('THIRD_PERSON', { gender: 'fem' }))).toBe('vela.');
    expect(command(np('FIRST_PERSON', { number: 'plural' }))).toBe('venos.');
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'EAT', { directObject: np('THIRD_PERSON'), verbPhrase: { modifier: 'FAST' } }), imperative: true }).es).toBe('cómelo rápido.');
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'EAT', { directObject: np('THIRD_PERSON') }), imperative: true, coordination: { conjunction: 'and', clause: clause(np('SECOND_PERSON'), 'RUN') } }).es)
      .toBe('cómelo, y corre.');
    // A doubled group's clitic attaches too.
    expect(command({ conjuncts: [np('THIRD_PERSON'), np('FIRST_PERSON')], conjunction: 'and' })).toBe('venos a él y a mí.');
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'LOAD', { directObject: np('THIRD_PERSON'), verbPhrase: { negative: true } }), imperative: true, imperativeRegister: 'instruction' }).es)
      .toBe('no cargarlo.');
  });

  test('regression: the negative command, finite verbs and the modal keep the pronoun in front', () => {
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'SEE', { directObject: np('THIRD_PERSON'), verbPhrase: { negative: true } }), imperative: true }).es).toBe('no lo veas.');
    expect(sayAll(clause(np('CAT'), 'EAT', { directObject: np('THIRD_PERSON'), verbPhrase: { modals: [{ verb: 'MUST' }] } })).es).toBe('el gato lo debe comer.');
  });
});

// A70. `ptCliticize` puts every object clitic before the verb. That is the Brazilian order after a
// subject or "não", and "me" / "te" may lead a clause colloquially, but a 3rd-person o / a / os / as
// cannot open one: an affirmative command, an infinitive and a subjectless (pro-drop) clause attach
// it after the verb ("veja-o", "comê-lo", "vejo-o").
describe('known bugs: Portuguese clitic enclisis', () => {
  const him = np('THIRD_PERSON');

  test('Portuguese attaches a 3rd-person clitic after a clause-initial verb', () => {
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'SEE', { directObject: him }), imperative: true }).pt).toBe('veja-o.');
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'SEE', { directObject: np('THIRD_PERSON', { gender: 'fem' }) }), imperative: true }).pt).toBe('veja-a.');
    expect(sayAll({ ...clause(np('FIRST_PERSON', { number: 'plural' }), 'EAT', { directObject: him }), imperative: true }).pt).toBe('comamo-lo.');
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'SEE', { directObject: him }), imperative: true, imperativeRegister: 'instruction' }).pt).toBe('vê-lo.');
    expect(sayAll({ ...clause(np('GENERIC_PERSON'), 'EAT', { directObject: np('THIRD_PERSON', { number: 'plural' }) }), infinitive: true }).pt).toBe('comê-los.');
    expect(sayAll(clause(np('FIRST_PERSON'), 'SEE', { directObject: him })).pt).toBe('vejo-o.');
    expect(sayAll(clause(np('FIRST_PERSON'), 'SEE', { directObject: him, verbPhrase: { modals: ['CAN'] } })).pt).toBe('posso vê-lo.');
  });

  const iSee = (verbPhrase: Partial<VerbPhrase>, subject: NounPhrase = np('FIRST_PERSON')) =>
    sayAll(clause(subject, 'SEE', { directObject: him, verbPhrase })).pt;

  test('Portuguese hangs the clitic on the last verb that can carry it, in its enclitic allomorph', () => {
    expect(iSee({ tense: 'past' })).toBe('vi-o.');
    expect(iSee({ aspect: 'resultative', tense: 'past' })).toBe('tinha-o visto.');
    expect(iSee({ aspect: 'progressive' })).toBe('estou vendo-o.');
    expect(iSee({}, np('FIRST_PERSON', { number: 'plural' }))).toBe('vemo-lo.');
    expect(sayAll(clause(np('THIRD_PERSON', { number: 'plural' }), 'EAT', { directObject: him })).pt).toBe('comem-no.');
    expect(sayAll({ ...clause(np('SECOND_PERSON', { number: 'plural' }), 'EAT', { directObject: np('THIRD_PERSON', { number: 'plural' }) }), imperative: true }).pt).toBe('comam-nos.');
    expect(sayAll({ ...clause(np('CAT'), 'RUN'), coordination: { conjunction: 'and', clause: clause(np('FIRST_PERSON'), 'SEE', { directObject: him }) } }).pt)
      .toBe('o gato corre, e vejo-o.');
  });

  test('regression: anything ahead of the verb keeps the clitic in front', () => {
    expect(iSee({ negative: true })).toBe('não o vejo.');
    expect(iSee({ modifier: 'NEVER' })).toBe('nunca o vejo.');
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: him })).pt).toBe('o gato o vê.');
    expect(sayAll(clause(np('DOG', { relative: { verbPhrase: { verb: 'SEE' }, directObject: him } }), 'RUN')).pt).toBe('o cão que o vê corre.');
    expect(sayAll({ ...clause(np('DOG'), 'RUN'), condition: clause(np('FIRST_PERSON'), 'SEE', { directObject: him }) }).pt).toBe('se o visse, o cão correria.');
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'SEE', { directObject: him, verbPhrase: { negative: true } }), imperative: true }).pt).toBe('não o veja.');
    // Me / te lead a clause colloquially, and the future would need mesoclisis, which is not modelled.
    expect(sayAll(clause(np('SECOND_PERSON'), 'SEE', { directObject: np('FIRST_PERSON') })).pt).toBe('me vê.');
    expect(iSee({ tense: 'future' })).toBe('o verei.');
  });
});

// A72. `objectPronounForm` ignores gender in the plural, and the Italian THIRD_PERSON lexeme seeds only
// `object_plural: 'li'`, so a feminine plural object renders "li" where Italian says "le" ("il gatto
// le vede"). A36 added the feminine plural for the subject pronoun only.
describe('known bugs: Italian feminine plural object clitic', () => {
  test('Italian uses "le" for a feminine plural object pronoun', () => {
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('THIRD_PERSON', { gender: 'fem', number: 'plural' }) }), 'it')).toBe('il gatto le vede.');
    expect(say({ ...clause(np('SECOND_PERSON'), 'SEE', { directObject: np('THIRD_PERSON', { gender: 'fem', number: 'plural' }) }), imperative: true }, 'it')).toBe('vedile.');
  });
});

// A72 (Spanish). `objectPronounForm` ignores gender in the plural, so a feminine plural object
// pronoun renders "los" where Spanish says "las".
describe('known bugs: Spanish feminine plural object clitic', () => {
  test('Spanish uses "las" for a feminine plural object pronoun', () => {
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('THIRD_PERSON', { gender: 'fem', number: 'plural' }) }), 'es')).toBe('el gato las ve.');
  });
});

// A72 (Portuguese). `objectPronounForm` ignores gender in the plural, so a feminine plural object
// pronoun renders "os" where Portuguese says "as".
describe('known bugs: Portuguese feminine plural object clitic', () => {
  test('Portuguese uses "as" for a feminine plural object pronoun', () => {
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('THIRD_PERSON', { gender: 'fem', number: 'plural' }) }), 'pt')).toBe('o gato as vê.');
  });
});

describe('feminine plural object clitic: through the other clitic paths', () => {
  const them = np('THIRD_PERSON', { gender: 'fem', number: 'plural' });

  test('the feminine plural clitic agrees the participle and attaches after a command or an infinitive', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: them, verbPhrase: { aspect: 'resultative' } }))).toMatchObject({
      it: 'il gatto le ha viste.',
      es: 'el gato las ha visto.',
      pt: 'o gato as viu.',
    });
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'SEE', { directObject: them }), imperative: true })).toMatchObject({ es: 'velas.', pt: 'veja-as.' });
    expect(sayAll({ ...clause(np('GENERIC_PERSON'), 'EAT', { directObject: them }), infinitive: true })).toMatchObject({
      it: 'mangiarle.',
      es: 'comerlas.',
      pt: 'comê-las.',
    });
    // A Spanish group of feminine pronouns is doubled by the feminine plural clitic.
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: { conjuncts: [np('THIRD_PERSON', { gender: 'fem' }), np('THIRD_PERSON', { gender: 'fem' })], conjunction: 'and' } })).es)
      .toBe('el gato las ve a ella y a ella.');
  });

  test('regression: the masculine plural keeps li / los / os, and French les has no gender', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('THIRD_PERSON', { number: 'plural' }) }))).toMatchObject({
      it: 'il gatto li vede.',
      es: 'el gato los ve.',
      pt: 'o gato os vê.',
    });
    expect(say(clause(np('CAT'), 'SEE', { directObject: them }), 'fr')).toBe('le chat les voit.');
  });
});

// A82. An Italian object clitic precedes the impersonal "si" ("lo si mangia", "mi si vede").
// `predicateText` emits the impersonal clitic first ("si lo mangia"); its comment mistakes this for
// the "se lo" order, which belongs to the reflexive/dative si.
describe('known bugs: Italian object clitic before the impersonal si', () => {
  test('Italian puts the object clitic before the impersonal si (lo si mangia)', () => {
    expect(say(clause(np('GENERIC_PERSON'), 'EAT', { directObject: np('THIRD_PERSON') }), 'it')).toBe('lo si mangia.');
    expect(say(clause(np('GENERIC_PERSON'), 'EAT', { directObject: np('THIRD_PERSON'), verbPhrase: { negative: true } }), 'it')).toBe('non lo si mangia.');
    expect(say(clause(np('GENERIC_PERSON'), 'SEE', { directObject: np('FIRST_PERSON') }), 'it')).toBe('mi si vede.');
    expect(say(clause(np('GENERIC_PERSON'), 'EAT', { directObject: np('THIRD_PERSON'), verbPhrase: { modals: [{ verb: 'MUST' }] } }), 'it')).toBe('lo si deve mangiare.');
  });

  test('Italian keeps the order for every clitic and tense', () => {
    const oneSees = (directObject: NounPhrase, verbPhrase: Partial<VerbPhrase> = {}) => say(clause(np('GENERIC_PERSON'), 'SEE', { directObject, verbPhrase }), 'it');
    expect(oneSees(np('THIRD_PERSON', { number: 'plural' }))).toBe('li si vede.');
    expect(oneSees(np('THIRD_PERSON', { gender: 'fem' }))).toBe('la si vede.');
    expect(oneSees(np('FIRST_PERSON', { number: 'plural' }))).toBe('ci si vede.');
    expect(oneSees(np('THIRD_PERSON'), { tense: 'past' })).toBe('lo si vide.');
  });

  test('regression: si with a noun object and a clitic with a noun subject are unchanged', () => {
    expect(say(clause(np('GENERIC_PERSON'), 'SEE', { directObject: np('MOUSE') }), 'it')).toBe('si vede il topo.');
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('THIRD_PERSON') }), 'it')).toBe('il gatto lo vede.');
  });
});

// A88. French has no clitic climbing: an object pronoun sits before the infinitive that governs
// it ("est en train de me voir", "doit me voir"). `predicateText` cliticises the whole verb group,
// so the pronoun lands on the finite "être" / modal ("m'est en train de voir", "me doit voir").
// Only the compound past keeps it on the auxiliary ("l'a vu").
describe('known bugs: French object clitic in a periphrasis', () => {
  const sees = (verbPhrase: NonNullable<Parameters<typeof clause>[2]>['verbPhrase'], object = 'FIRST_PERSON', verb = 'SEE') =>
    sayAll(clause(np('CAT'), verb, { directObject: np(object), verbPhrase })).fr;

  test('French puts the object clitic before the governed infinitive', () => {
    expect(sees({ aspect: 'progressive' })).toBe('le chat est en train de me voir.');
    expect(sees({ aspect: 'prospective' })).toBe('le chat est sur le point de me voir.');
    expect(sees({ aspect: 'progressive' }, 'THIRD_PERSON', 'ADD')).toBe("le chat est en train de l'ajouter.");
    expect(sees({ modals: ['MUST'] })).toBe('le chat doit me voir.');
    expect(sees({ modals: ['MUST'], negative: true })).toBe('le chat ne doit pas me voir.');
    expect(sees({ modals: ['MUST'], aspect: 'resultative' }, 'THIRD_PERSON')).toBe("le chat doit l'avoir vu.");
  });

  test('French keeps the clitic on the infinitive through agreement, adverbs, stacked modals and a resumed group', () => {
    expect(sees({ modals: ['MUST'], aspect: 'resultative' }, 'THIRD_PERSON')).toBe("le chat doit l'avoir vu.");
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('THIRD_PERSON', { gender: 'fem' }), verbPhrase: { modals: ['MUST'], aspect: 'resultative' } })).fr)
      .toBe("le chat doit l'avoir vue.");
    expect(sees({ modals: ['MUST'], modifier: 'ALWAYS' })).toBe('le chat doit toujours me voir.');
    expect(sees({ modals: ['MUST'], modifier: 'NEVER' })).toBe('le chat ne doit jamais me voir.');
    expect(sees({ modals: ['WILL', 'CAN'] })).toBe('le chat veut pouvoir me voir.');
    expect(sees({ modals: ['MUST'], aspect: 'progressive' })).toBe('le chat doit être en train de me voir.');
    expect(sees({ aspect: 'progressive', negative: true })).toBe("le chat n'est pas en train de me voir.");
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: { conjuncts: [np('THIRD_PERSON'), np('FIRST_PERSON')], conjunction: 'and' }, verbPhrase: { modals: ['MUST'] } })).fr)
      .toBe('le chat doit nous voir, lui et moi.');
  });

  test('French agrees a modal perfect participle with an object relative', () => {
    expect(sayAll(clause(np('MOUSE', { relative: { verbPhrase: { verb: 'EAT', modals: ['MUST'], aspect: 'resultative' }, subject: np('CAT'), headRole: 'directObject' } }), 'RUN')).fr)
      .toBe('la souris que le chat doit avoir mangée court.');
  });

  test('regression: the compound past keeps the clitic on the auxiliary, and a noun object stays after', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('THIRD_PERSON', { gender: 'fem' }), verbPhrase: { aspect: 'resultative' } })).fr).toBe("le chat l'a vue.");
    expect(sees({ modals: ['MUST'] }, 'DOG')).toBe('le chat doit voir le chien.');
  });
});

// A93. `predicateText` elides "ne" against the finite verb ("n'aime", "n'a") before `frCliticize`
// slips the object clitic in after it, so the elided "n'" ends up in front of a consonant clitic:
// "n'm'aime", "n'l'a". The clitic is what follows "ne", and me/te/le/la/nous/vous/les never elide it.
describe('known bugs: French ne before an object clitic', () => {
  test('French keeps "ne" whole in front of an object clitic', () => {
    expect(sayAll(clause(np('CAT'), 'LOVE', { directObject: np('FIRST_PERSON'), verbPhrase: { negative: true } })).fr)
      .toBe("le chat ne m'aime pas.");
    expect(sayAll(clause(np('CAT'), 'ADD', { directObject: np('THIRD_PERSON'), verbPhrase: { negative: true } })).fr)
      .toBe("le chat ne l'ajoute pas.");
    expect(sayAll(clause(np('CAT'), 'SEE', {
      directObject: np('THIRD_PERSON'), verbPhrase: { negative: true, aspect: 'resultative' },
    })).fr).toBe("le chat ne l'a pas vu.");
    expect(sayAll(clause(np('CAT'), 'LOVE', { directObject: np('FIRST_PERSON'), verbPhrase: { modifier: 'NEVER' } })).fr)
      .toBe("le chat ne m'aime jamais.");
  });

  test('French restores ne before every clitic, in a command, a relative, a periphrasis and a resumed group', () => {
    const cat = (extra: Parameters<typeof clause>[2]) => sayAll(clause(np('CAT'), 'LOVE', extra)).fr;
    expect(cat({ directObject: np('FIRST_PERSON', { number: 'plural' }), verbPhrase: { negative: true } })).toBe('le chat ne nous aime pas.');
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'LOVE', { directObject: np('FIRST_PERSON'), verbPhrase: { negative: true } }), imperative: true }).fr)
      .toBe("ne m'aime pas.");
    expect(sayAll(clause(np('MOUSE', { relative: { verbPhrase: { verb: 'LOVE', negative: true }, directObject: np('FIRST_PERSON') } }), 'RUN')).fr)
      .toBe("la souris qui ne m'aime pas court.");
    expect(cat({ directObject: np('THIRD_PERSON'), complements: { locative: { phrase: np('HOUSE', { definiteness: 'no' }) } } }))
      .toBe("le chat ne l'aime dans aucune maison.");
    expect(cat({ directObject: np('FIRST_PERSON'), verbPhrase: { negative: true, aspect: 'progressive' } })).toBe("le chat n'est pas en train de m'aimer.");
    expect(cat({ directObject: { conjuncts: [np('THIRD_PERSON'), np('FIRST_PERSON')], conjunction: 'and' }, verbPhrase: { negative: true } }))
      .toBe('le chat ne nous aime pas, lui et moi.');
  });

  test('regression: a vowel-initial verb with no clitic keeps n\'', () => {
    expect(sayAll(clause(np('CAT'), 'LOVE', { verbPhrase: { negative: true } })).fr).toBe("le chat n'aime pas.");
  });
});

// A53 (English). `predicateParts` takes the object-pronoun path only for a lone pronoun
// (`isPronounElement`); a coordinated object renders every conjunct with `npText`, so a pronoun
// conjunct gets "the" and its subject form.
describe('known bugs: English coordinated pronoun object', () => {
  test('English renders each pronoun conjunct in its object form, with no article', () => {
    expect(say(clause(np('CAT'), 'SEE', { directObject: { conjuncts: [np('THIRD_PERSON'), np('FIRST_PERSON')], conjunction: 'and' } }), 'en')).toBe('the cat sees him and me.');
    expect(say(clause(np('CAT'), 'SEE', { directObject: { conjuncts: [np('DOG'), np('SECOND_PERSON')], conjunction: 'and' } }), 'en')).toBe('the cat sees the dog and you.');
  });

  test('English takes the object form for every gender and number, in either order', () => {
    const sees = (...conjuncts: NounPhrase[]) => say(clause(np('CAT'), 'SEE', { directObject: { conjuncts, conjunction: 'and' } }), 'en');
    expect(sees(np('THIRD_PERSON', { gender: 'fem' }), np('THIRD_PERSON', { number: 'plural' }))).toBe('the cat sees her and them.');
    expect(sees(np('FIRST_PERSON'), np('DOG'))).toBe('the cat sees me and the dog.');
    expect(say(clause(np('CAT'), 'SEE', { directObject: { conjuncts: [np('THIRD_PERSON'), np('FIRST_PERSON')], conjunction: 'or' } }), 'en'))
      .toBe('the cat sees him or me.');
  });

  test('English keeps the object forms in a relative clause, a command and beside an "any" noun', () => {
    const himAndMe = { conjuncts: [np('THIRD_PERSON'), np('FIRST_PERSON')], conjunction: 'and' as const };
    expect(say(clause(np('DOG', { relative: { verbPhrase: { verb: 'SEE' }, directObject: himAndMe } }), 'RUN'), 'en'))
      .toBe('the dog that sees him and me runs.');
    expect(say({ ...clause(np('SECOND_PERSON'), 'SEE', { directObject: himAndMe }), imperative: true }, 'en')).toBe('see him and me.');
    // Only the noun conjunct takes the "any" series under a negated verb.
    expect(say(clause(np('CAT'), 'SEE', {
      directObject: { conjuncts: [np('DOG', { definiteness: 'no' }), np('THIRD_PERSON')], conjunction: 'and' }, verbPhrase: { negative: true },
    }), 'en')).toBe('the cat does not see any dog and him.');
  });
});

// A53 (Italian). `predicateText` cliticises only a lone pronoun object (`isPronounElement`); a
// coordinated object renders every conjunct with `npText`, so a pronoun conjunct gets an article and
// its subject form ("il tu", "l'io"). A coordinated pronoun stays post-verbal in its tonic form.
describe('known bugs: Italian coordinated pronoun object', () => {
  test('Italian renders each pronoun conjunct in its tonic form, with no article', () => {
    expect(say(clause(np('CAT'), 'SEE', { directObject: { conjuncts: [np('DOG'), np('SECOND_PERSON')], conjunction: 'and' } }), 'it')).toBe('il gatto vede il cane e te.');
    expect(say(clause(np('CAT'), 'SEE', { directObject: { conjuncts: [np('THIRD_PERSON'), np('FIRST_PERSON')], conjunction: 'and' } }), 'it')).toBe('il gatto vede lui e me.');
  });

  test('Italian takes the tonic form for every person, gender and number', () => {
    const sees = (...conjuncts: NounPhrase[]) => say(clause(np('CAT'), 'SEE', { directObject: { conjuncts, conjunction: 'and' } }), 'it');
    expect(sees(np('THIRD_PERSON', { gender: 'fem' }), np('THIRD_PERSON', { number: 'plural' }))).toBe('il gatto vede lei e loro.');
    expect(sees(np('SECOND_PERSON', { number: 'plural' }), np('THIRD_PERSON', { gender: 'fem' }))).toBe('il gatto vede voi e lei.');
  });

  test('Italian keeps the tonic group after the verb in a negation, a perfect, a modal, a relative clause and a command', () => {
    const himAndMe = { conjuncts: [np('THIRD_PERSON'), np('FIRST_PERSON')], conjunction: 'and' as const };
    const sees = (verbPhrase: Partial<VerbPhrase>) => say(clause(np('CAT'), 'SEE', { directObject: himAndMe, verbPhrase }), 'it');
    expect(sees({ negative: true })).toBe('il gatto non vede lui e me.');
    expect(sees({ aspect: 'resultative' })).toBe('il gatto ha visto lui e me.');
    expect(sees({ modals: [{ verb: 'MUST' }] })).toBe('il gatto deve vedere lui e me.');
    expect(say(clause(np('DOG', { relative: { verbPhrase: { verb: 'SEE' }, directObject: himAndMe } }), 'RUN'), 'it'))
      .toBe('il cane che vede lui e me corre.');
    expect(say({ ...clause(np('SECOND_PERSON'), 'SEE', { directObject: himAndMe }), imperative: true }, 'it')).toBe('vedi lui e me.');
  });

  test('regression: a group of nouns keeps its articles', () => {
    expect(say(clause(np('CAT'), 'SEE', { directObject: { conjuncts: [np('DOG'), np('MOUSE')], conjunction: 'and' } }), 'it'))
      .toBe('il gatto vede il cane e il topo.');
  });
});

// A53 (French). `predicateText` takes the clitic path only for a single pronoun object
// (`isPronounElement`); a coordinated object goes through `npText`, which gives each pronoun an
// article and its subject form ("l'il et le je"). French cannot coordinate clitics: it uses the
// tonic forms, resumed by the plural clitic as the subject slot already does ("moi et toi, nous").
describe('known bugs: French coordinated pronoun object', () => {
  test('French renders a coordinated pronoun object in its tonic form, resumed by a clitic', () => {
    const sees = (...ids: string[]) =>
      sayAll(clause(np('CAT'), 'SEE', { directObject: { conjuncts: ids.map((id) => np(id)), conjunction: 'and' } })).fr;
    expect(sees('THIRD_PERSON', 'FIRST_PERSON')).toBe('le chat nous voit, lui et moi.');
    expect(sees('DOG', 'SECOND_PERSON')).toBe('le chat vous voit, le chien et toi.');
  });

  test('French resumes a 3rd-person group with "les", in either order', () => {
    const sees = (...conjuncts: NounPhrase[]) => sayAll(clause(np('CAT'), 'SEE', { directObject: { conjuncts, conjunction: 'and' } })).fr;
    expect(sees(np('DOG'), np('THIRD_PERSON'))).toBe('le chat les voit, le chien et lui.');
    expect(sees(np('THIRD_PERSON', { gender: 'fem' }), np('THIRD_PERSON', { number: 'plural' }))).toBe('le chat les voit, elle et eux.');
    expect(sees(np('FIRST_PERSON'), np('DOG'))).toBe('le chat nous voit, moi et le chien.');
  });

  test('French dislocates the group past the negation and the complements, to the end of its clause', () => {
    const himAndMe = { conjuncts: [np('THIRD_PERSON'), np('FIRST_PERSON')], conjunction: 'and' as const };
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: himAndMe, verbPhrase: { negative: true } })).fr).toBe('le chat ne nous voit pas, lui et moi.');
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: himAndMe, complements: { locative: { phrase: np('HOUSE') } } })).fr)
      .toBe('le chat nous voit dans la maison, lui et moi.');
  });

  test('French closes the dislocated group on a comma inside the sentence', () => {
    const himAndMe = { conjuncts: [np('THIRD_PERSON'), np('FIRST_PERSON')], conjunction: 'and' as const };
    expect(sayAll(clause(np('DOG', { relative: { verbPhrase: { verb: 'SEE' }, directObject: himAndMe } }), 'RUN')).fr)
      .toBe('le chien qui nous voit, lui et moi, court.');
    expect(sayAll(clause(np('DOG'), 'SEE', { directObject: np('CAT', { relative: { verbPhrase: { verb: 'SEE' }, directObject: himAndMe } }) })).fr)
      .toBe('le chien voit le chat qui nous voit, lui et moi.');
    expect(sayAll({ ...clause(np('DOG'), 'RUN'), condition: clause(np('CAT'), 'SEE', { directObject: himAndMe }) }).fr)
      .toBe('si le chat nous voyait, lui et moi, le chien courrait.');
    expect(sayAll({ ...clause(np('CAT'), 'SEE', { directObject: himAndMe }), coordination: { conjunction: 'and', clause: clause(np('DOG'), 'RUN') } }).fr)
      .toBe('le chat nous voit, lui et moi, et le chien court.');
  });

  test('regression: a group of nouns, or one with an "aucun" noun, keeps the post-verbal slot', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: { conjuncts: [np('DOG'), np('MOUSE')], conjunction: 'and' } })).fr)
      .toBe('le chat voit le chien et la souris.');
    // No clitic can resume "aucun", so the tonic pronoun stays beside it.
    expect(sayAll(clause(np('CAT'), 'SEE', {
      directObject: { conjuncts: [np('DOG', { definiteness: 'no' }), np('THIRD_PERSON')], conjunction: 'and' }, verbPhrase: { negative: true },
    })).fr).toBe('le chat ne voit aucun chien et lui.');
  });
});

// A53 (Spanish). `predicateText` takes the clitic path only when `isPronounElement` holds, which
// needs a single conjunct. A coordinated pronoun object goes through `coordinateElement(npText)`,
// which gives it an article and its citation form ("ve el yo y el tú"). Spanish wants the tonic
// forms with "a", doubled by a plural clitic.
describe('known bugs: Spanish coordinated pronoun object', () => {
  test('Spanish renders a coordinated pronoun object as doubled tonic pronouns', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', {
      directObject: { conjuncts: [np('FIRST_PERSON'), np('SECOND_PERSON')], conjunction: 'and' },
    })).es).toBe('el gato nos ve a mí y a ti.');
    expect(sayAll(clause(np('CAT'), 'SEE', {
      directObject: { conjuncts: [np('THIRD_PERSON'), np('FIRST_PERSON')], conjunction: 'and' },
    })).es).toBe('el gato nos ve a él y a mí.');
  });

  test('Spanish doubles with the group\'s own person and number', () => {
    const sees = (...conjuncts: NounPhrase[]) => sayAll(clause(np('CAT'), 'SEE', { directObject: { conjuncts, conjunction: 'and' } })).es;
    expect(sees(np('SECOND_PERSON', { number: 'plural' }), np('THIRD_PERSON', { gender: 'fem' }))).toBe('el gato os ve a vosotros y a ella.');
    expect(sees(np('THIRD_PERSON', { gender: 'fem' }), np('THIRD_PERSON', { number: 'plural' }))).toBe('el gato los ve a ella y a ellos.');
  });

  test('Spanish keeps the doubling clitic before the finite verb in a negation, a perfect, a modal and a relative clause', () => {
    const himAndMe = { conjuncts: [np('THIRD_PERSON'), np('FIRST_PERSON')], conjunction: 'and' as const };
    const sees = (extra: Parameters<typeof clause>[2]) => sayAll(clause(np('CAT'), 'SEE', { directObject: himAndMe, ...extra })).es;
    expect(sees({ verbPhrase: { negative: true } })).toBe('el gato no nos ve a él y a mí.');
    expect(sees({ verbPhrase: { aspect: 'resultative' } })).toBe('el gato nos ha visto a él y a mí.');
    expect(sees({ verbPhrase: { modals: [{ verb: 'MUST' }] } })).toBe('el gato nos debe ver a él y a mí.');
    expect(sees({ complements: { locative: { phrase: np('HOUSE') } } })).toBe('el gato nos ve a él y a mí en la casa.');
    expect(sayAll(clause(np('DOG', { relative: { verbPhrase: { verb: 'SEE' }, directObject: himAndMe } }), 'RUN')).es)
      .toBe('el perro que nos ve a él y a mí corre.');
  });

  test('regression: a group of nouns keeps its articles and takes no clitic', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: { conjuncts: [np('DOG'), np('MOUSE')], conjunction: 'and' } })).es)
      .toBe('el gato ve el perro y el ratón.');
  });
});

// A53 (Portuguese). `predicateText` takes the clitic path only for a lone pronoun object
// (`isPronounElement`); a coordinated object renders every conjunct through `npText`, which puts the
// definite article in front of the pronoun's citation form. A coordinated pronoun cannot be a
// clitic, so it takes its tonic form after the preposition "a".
describe('known bugs: Portuguese coordinated pronoun object', () => {
  const catSees = (...conjuncts: ReturnType<typeof np>[]) =>
    sayAll(clause(np('CAT'), 'SEE', { directObject: { conjuncts, conjunction: 'and' } })).pt;

  test('Portuguese renders a coordinated pronoun object in its tonic form', () => {
    expect(catSees(np('THIRD_PERSON'), np('FIRST_PERSON'))).toBe('o gato vê a ele e a mim.');
    expect(catSees(np('DOG'), np('SECOND_PERSON'))).toBe('o gato vê o cão e a você.');
  });

  test('Portuguese takes "a" + the tonic form for every person, gender and number', () => {
    expect(catSees(np('THIRD_PERSON', { gender: 'fem' }), np('THIRD_PERSON', { number: 'plural' }))).toBe('o gato vê a ela e a eles.');
    expect(catSees(np('SECOND_PERSON', { number: 'plural' }), np('THIRD_PERSON', { gender: 'fem' }))).toBe('o gato vê a vocês e a ela.');
  });

  test('Portuguese keeps the group after the verb in a negation, a perfect and a relative clause', () => {
    const himAndMe = { conjuncts: [np('THIRD_PERSON'), np('FIRST_PERSON')], conjunction: 'and' as const };
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: himAndMe, verbPhrase: { negative: true } })).pt).toBe('o gato não vê a ele e a mim.');
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: himAndMe, verbPhrase: { aspect: 'resultative' } })).pt).toBe('o gato viu a ele e a mim.');
    expect(sayAll(clause(np('DOG', { relative: { verbPhrase: { verb: 'SEE' }, directObject: himAndMe } }), 'RUN')).pt)
      .toBe('o cão que vê a ele e a mim corre.');
  });

  test('regression: a group of nouns keeps its articles', () => {
    expect(catSees(np('DOG'), np('MOUSE'))).toBe('o gato vê o cão e o rato.');
  });
});

// A127. A German object pronoun is unstressed, and an unstressed pronoun leads the Mittelfeld, ahead of
// any adverb, "nicht" and the progressive's "gerade": "der Kater sieht ihn immer". The declarative,
// the protasis, the command and the infinitive put the direct object after the adverb, where a noun
// object may stand ("sieht immer den Hund"), and a pronoun reads as contrastive: "sieht immer IHN".
// The relative clause already has the right order ("der ihn immer sieht").
describe('known bugs: German object pronoun before an adverb', () => {
  const sees = (verbPhrase: Partial<VerbPhrase>, object = 'THIRD_PERSON'): PhrasePlan =>
    clause(np('CAT'), 'SEE', { verbPhrase, directObject: np(object) });

  test.fails('German puts the object pronoun ahead of the adverb, nicht and gerade', () => {
    const de = (plan: PhrasePlan) => say(plan, 'de');
    expect(de(sees({ modifier: 'ALWAYS' }))).toBe('der Kater sieht ihn immer.');
    expect(de(sees({ modifier: 'NEVER' }))).toBe('der Kater sieht ihn nie.');
    expect(de(sees({ modifier: 'FAST' }))).toBe('der Kater sieht ihn schnell.');
    expect(de(sees({ modifier: 'ALWAYS', negative: true }))).toBe('der Kater sieht ihn nicht immer.');
    expect(de(sees({ modifier: 'ALWAYS' }, 'FIRST_PERSON'))).toBe('der Kater sieht mich immer.');
    expect(de(sees({ aspect: 'progressive' }))).toBe('der Kater sieht ihn gerade.');
    expect(de(sees({ modifier: 'ALWAYS', modals: ['WILL'] }))).toBe('der Kater will ihn immer sehen.');
    expect(de(sees({ modifier: 'ALWAYS', aspect: 'resultative' }))).toBe('der Kater hat ihn immer gesehen.');
    expect(de({ ...clause(np('DOG'), 'RUN'), condition: sees({ modifier: 'ALWAYS' }) }))
      .toBe('wenn der Kater ihn immer sehen würde, würde der Hund laufen.');
    expect(de({ ...clause(np('SECOND_PERSON'), 'SEE', { verbPhrase: { modifier: 'ALWAYS' }, directObject: np('THIRD_PERSON') }), imperative: true }))
      .toBe('sieh ihn immer.');
    expect(de({ ...sees({ modifier: 'ALWAYS' }), infinitive: true })).toBe('ihn immer sehen.');
    // A121's pro-form "es" takes the same slot.
    expect(de({
      ...clause(np('CAT'), 'BE', { complements: { predicative: { phrase: np('HAPPY') } } }),
      coordination: { conjunction: 'but', clause: clause(np('DOG'), 'BE', { verbPhrase: { modifier: 'ALWAYS' } }) },
    })).toBe('der Kater ist glücklich, aber der Hund ist es immer.');
  });

  test('regression: a noun object and the relative clause keep their order', () => {
    expect(say(sees({ modifier: 'ALWAYS' }, 'DOG'), 'de')).toBe('der Kater sieht immer den Hund.');
    expect(say(clause(np('DOG', { relative: { verbPhrase: { verb: 'SEE', modifier: 'ALWAYS' }, directObject: np('THIRD_PERSON') } }), 'RUN'), 'de'))
      .toBe('der Hund, der ihn immer sieht, läuft.');
  });
});

