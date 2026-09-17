import { describe, expect, test } from 'vitest';
import { DEFINITENESS, type Definiteness } from '@signi/shared';
import type { PronominalPossessor } from '@signi/shared';
import { determinerAll, possessiveAll, wordAll } from './harness.js';

// The single-word UI-label path — `translateWord` and `translateDeterminer`, the engine entry
// points the sentence helpers never exercise. A label is a word standing alone (a menu entry, a
// row value), not a period: an adjective label still has to AGREE with the noun its row is about,
// even though that noun is nowhere in the label; a determiner label is the function word the menu
// shows for one determiner value, and a possessive label the one a coreference link spells. These
// back the `word` / `determiner` / `possessive` entries of UI_STRINGS.

// ── translateWord: an adjective label agrees with its (unseen) noun ──────────────
// The pronoun chooser's person row shows "first / second / third" agreeing with the row's noun
// PERSON_GRAMMAR — feminine in Romance ("persona" / "personne"), so the labels are feminine.
describe('UI label: adjective agreement', () => {
  test('the person row agrees with the feminine "person"', () => {
    expect(wordAll('FIRST', 'PERSON_GRAMMAR')).toMatchObject({
      en: 'first',
      it: 'prima', // feminine — not "primo"
      fr: 'première',
      es: 'primera',
      pt: 'primeira',
      de: 'erste',
      ja: '第一',
    });
    expect(wordAll('SECOND', 'PERSON_GRAMMAR')).toMatchObject({
      it: 'seconda', fr: 'deuxième', es: 'segunda', pt: 'segunda', ja: '第二',
    });
    expect(wordAll('THIRD', 'PERSON_GRAMMAR')).toMatchObject({
      it: 'terza', fr: 'troisième', es: 'tercera', pt: 'terceira', ja: '第三',
    });
  });

  test('agreement is what settles the form — without it the adjective is masculine', () => {
    // The same concept with no `agreesWith` falls back to the citation (masculine) form, so the
    // feminine above is the agreement doing real work, not a lexical accident.
    expect(wordAll('FIRST')).toMatchObject({
      it: 'primo', fr: 'premier', es: 'primero', pt: 'primeiro',
    });
  });

  test('the gender row agrees with the masculine "gender"', () => {
    expect(wordAll('MALE', 'GENDER')).toMatchObject({
      en: 'male', it: 'maschile', fr: 'masculin', es: 'masculino', de: 'männlich', ja: '男性',
    });
    expect(wordAll('FEMALE', 'GENDER')).toMatchObject({ it: 'femminile', fr: 'féminin', ja: '女性' });
    expect(wordAll('NEUTER', 'GENDER')).toMatchObject({ it: 'neutro', de: 'sächlich', ja: '中性' });
  });

  test('the number row', () => {
    expect(wordAll('SINGULAR', 'NUMBER_GRAMMAR')).toMatchObject({
      en: 'singular', it: 'singolare', de: 'singularisch', ja: '単数',
    });
    expect(wordAll('PLURAL', 'NUMBER_GRAMMAR')).toMatchObject({
      it: 'plurale', de: 'pluralisch', ja: '複数',
    });
  });

  test('the determiner-menu section names agree with their category noun', () => {
    expect(wordAll('DEFINITE', 'ARTICLE')).toMatchObject({
      en: 'definite', it: 'determinativo', de: 'bestimmt', ja: '定冠詞',
    });
    expect(wordAll('PARTITIVE', 'QUANTIFIER')).toMatchObject({ it: 'partitivo', ja: '部分詞' });
    expect(wordAll('UNIVERSAL', 'QUANTIFIER')).toMatchObject({ it: 'universale', ja: '全称' });
  });
});

// ── translateWord: several words naming one thing, joined per language ───────────
// The command person, "second singular", is two adjectives; each agrees, and they are joined the
// way the language joins words — a space in the European ones, NOTHING in Japanese (第二単数).
describe('UI label: multi-word join (wordJoiner)', () => {
  test('a space joins the European languages, nothing joins Japanese', () => {
    expect(wordAll(['SECOND', 'SINGULAR'], 'PERSON_GRAMMAR')).toMatchObject({
      en: 'second singular',
      it: 'seconda singolare', // both feminine, space-joined
      fr: 'deuxième singulière',
      de: 'zweite singularisch',
      ja: '第二単数', // no separator
    });
    expect(wordAll(['FIRST', 'PLURAL'], 'PERSON_GRAMMAR')).toMatchObject({
      it: 'prima plurale', fr: 'première plurielle', ja: '第一複数',
    });
  });
});

// ── translateDeterminer: the determiner menu ────────────────────────────────────
// One function word per determiner value, agreeing with the noun it determines (NOUN by default).
// Japanese spells no article, so the two articles come back as the em-dash it uses for "no word".
describe('determiner menu: every value against the masculine grammar noun', () => {
  test('identifiability — the articles (Japanese shows the em-dash)', () => {
    expect(determinerAll('definite')).toEqual({
      en: 'the', it: 'il', fr: 'le', es: 'el', pt: 'o', de: 'das', ja: '—',
    });
    expect(determinerAll('indefinite')).toEqual({
      en: 'a', it: 'un', fr: 'un', es: 'un', pt: 'um', de: 'ein', ja: '—',
    });
    // The bare determiner is no word at all — the em-dash in every language.
    expect(determinerAll('bare')).toEqual({
      en: '—', it: '—', fr: '—', es: '—', pt: '—', de: '—', ja: '—',
    });
  });

  test('deixis — the demonstratives', () => {
    expect(determinerAll('this')).toMatchObject({
      en: 'this', it: 'questo', fr: 'ce', es: 'este', pt: 'este', de: 'dieses', ja: 'この',
    });
    expect(determinerAll('that')).toMatchObject({
      en: 'that', it: 'quel', fr: 'ce', es: 'ese', pt: 'esse', de: 'jenes', ja: 'その',
    });
  });

  test('quantity — the quantifiers, named in the plural where they inflect', () => {
    expect(determinerAll('some')).toMatchObject({
      en: 'some', it: 'alcuni', fr: 'quelques', es: 'algunos', pt: 'alguns', de: 'einige', ja: 'いくつかの',
    });
    expect(determinerAll('no')).toMatchObject({
      en: 'no', it: 'nessun', fr: 'aucun', es: 'ningún', pt: 'nenhum', de: 'kein', ja: 'どの…もない',
    });
    expect(determinerAll('many')).toMatchObject({
      en: 'many', it: 'molti', fr: 'beaucoup de', es: 'muchos', de: 'viele', ja: '多くの',
    });
    expect(determinerAll('few')).toMatchObject({
      en: 'few', it: 'pochi', fr: 'peu de', es: 'pocos', de: 'wenige', ja: '少しの',
    });
    expect(determinerAll('all')).toMatchObject({
      en: 'all', it: 'tutti i', fr: 'tous les', es: 'todos los', pt: 'todos os', de: 'alle', ja: 'すべての',
    });
  });

  test('every value renders a non-empty label in every language', () => {
    for (const value of DEFINITENESS) {
      const said = determinerAll(value);
      for (const lang of ['en', 'it', 'fr', 'es', 'pt', 'de', 'ja'] as const) {
        expect(said[lang]).toBeTruthy();
        expect(said[lang]).not.toContain('undefined');
      }
    }
  });
});

// The determiner agrees with the noun it is cited on — masculine NOUN gives "il", a feminine noun
// gives "la" — so the menu shows the form the user will actually see on the word they are editing.
describe('determiner menu: agreement with the cited noun', () => {
  const onHouse = (value: Definiteness) => determinerAll(value, 'HOUSE'); // casa / maison — feminine

  test('a feminine noun feminises the article and the demonstrative', () => {
    expect(onHouse('definite')).toMatchObject({ it: 'la', fr: 'la', es: 'la', pt: 'a' });
    expect(onHouse('indefinite')).toMatchObject({ it: 'una', fr: 'une', es: 'una', pt: 'uma' });
    expect(onHouse('this')).toMatchObject({ it: 'questa', fr: 'cette', es: 'esta', pt: 'esta' });
    expect(onHouse('some')).toMatchObject({ it: 'alcune', es: 'algunas' });
  });

  test('the masculine grammar noun gives the masculine forms — the contrast', () => {
    // Same values, cited on the (masculine) grammar noun: "il" / "un" / "questo", not the feminine
    // above. It is the noun's gender doing the work, not the determiner value.
    expect(determinerAll('definite')).toMatchObject({ it: 'il', fr: 'le' });
    expect(determinerAll('this')).toMatchObject({ it: 'questo', es: 'este' });
  });
});

// The possessive label on a coreference link. Like a determiner it is a function word with no
// citation form: the antecedent's person/number settle it everywhere, its natural gender only in
// the languages that spell it, and the Romance/German forms then agree with the noun it is cited on.
describe('coreference chip: the possessive the link spells', () => {
  const of = (over: Partial<PronominalPossessor> = {}, agreesWith?: string) =>
    possessiveAll({ kind: 'pronominal', person: '3', number: 'singular', ...over }, agreesWith);

  test('the antecedent’s person and number settle the word in every language', () => {
    expect(of({ person: '1' })).toMatchObject({ en: 'my', it: 'mio', fr: 'mon', de: 'mein', es: 'mi', ja: '私の', pt: 'meu' });
    expect(of({ person: '2', number: 'plural' })).toMatchObject({ en: 'your', it: 'vostro', fr: 'votre', de: 'euer', es: 'vuestro' });
    expect(of({ person: '3', number: 'plural' })).toMatchObject({ en: 'their', it: 'loro', fr: 'leur', de: 'ihr', ja: '彼らの' });
  });

  test('only the languages that spell the antecedent’s gender split his from her', () => {
    expect(of({ gender: 'fem' })).toMatchObject({ en: 'her', de: 'ihr', ja: '彼女の' });
    expect(of({ gender: 'neut' })).toMatchObject({ en: 'its', de: 'sein', ja: 'それの' });
    // The Romance possessive agrees with what is possessed, not with who possesses it: one word.
    expect(of({ gender: 'fem' })).toMatchObject({ it: 'suo', fr: 'son', es: 'su', pt: 'seu' });
    expect(of({ gender: 'masc' })).toMatchObject({ it: 'suo', fr: 'son', es: 'su', pt: 'seu' });
  });

  test('the possessive agrees with the noun it is cited on', () => {
    // casa / maison / casa — feminine, against the masculine grammar noun NOUN above.
    expect(of({}, 'HOUSE')).toMatchObject({ it: 'sua', fr: 'sa', pt: 'sua' });
    // Invariant of the possessed in the languages that do not agree it.
    expect(of({}, 'HOUSE')).toMatchObject({ en: 'his', ja: '彼の' });
  });
});
