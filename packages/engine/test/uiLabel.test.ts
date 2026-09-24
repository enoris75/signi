import { describe, expect, test } from 'vitest';
import { DEFINITENESS, type Definiteness, type PathSpecifier, type TemporalRelation } from '@signi/shared';
import type { PronominalPossessor } from '@signi/shared';
import { conjunctionAll, degreeAll, determinerAll, possessiveAll, specifierAll, wordAll } from './harness.js';

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
    // Japanese spells the neuter possessive with the suppletive adnominal その, not それの (A201).
    expect(of({ gender: 'neut' })).toMatchObject({ en: 'its', de: 'sein', ja: 'その' });
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

// ── translateConjunction: the word between two clauses ──────────────────────────
// A conjunction agrees with nothing, so it is the one function word cited on its own. What makes
// it an engine's business rather than a lexicon's is that the *set* differs: half of these are one
// word in some languages and two in others, and `then` is not a conjunction anywhere.
describe('conjunction menu: the word that joins two periods', () => {
  test('each conjunction in every language', () => {
    expect(conjunctionAll('and')).toEqual({
      en: 'and', it: 'e', fr: 'et', de: 'und', es: 'y', ja: 'そして', pt: 'e',
    });
    expect(conjunctionAll('but')).toEqual({
      en: 'but', it: 'ma', fr: 'mais', de: 'aber', es: 'pero', ja: 'しかし', pt: 'mas',
    });
    expect(conjunctionAll('that_is')).toMatchObject({
      en: 'that is', it: 'cioè', fr: "c'est-à-dire", de: 'das heißt', ja: 'つまり',
    });
  });

  test('the conclusive is the coordinator, not the adverb — English writes "so"', () => {
    expect(conjunctionAll('therefore')).toMatchObject({
      en: 'so', it: 'quindi', fr: 'donc', de: 'also', es: 'por lo tanto', pt: 'portanto',
    });
  });

  test('the temporal is an adverb everywhere, so it comes with its coordinator', () => {
    expect(conjunctionAll('then')).toEqual({
      en: 'and then', it: 'e poi', fr: 'et puis', de: 'und dann', es: 'y luego', ja: 'それから', pt: 'e depois',
    });
  });
});

// ── translateSpecifier: the adposition a relation is spoken with ────────────────
// Cited on a *bare* noun, so no article comes along with the preposition it would fuse to. What is
// left is the relation's own name — except in Japanese, which puts it after the noun and therefore
// writes it as a dictionary does, with the 〜 standing in for what it attaches to.
describe('relation toolbars: the adposition each specifier spells', () => {
  const path = (value: PathSpecifier) => specifierAll({ kind: 'path', value });

  test('a spatial relation, in every language', () => {
    expect(path('under')).toEqual({
      en: 'under', it: 'sotto', fr: 'sous', de: 'unter', es: 'debajo de', ja: '〜の下で', pt: 'debaixo de',
    });
    expect(path('around')).toMatchObject({
      en: 'around', it: 'intorno a', fr: 'autour de', de: 'um', es: 'alrededor de', pt: 'ao redor de',
    });
    expect(path('in_front_of')).toMatchObject({
      en: 'in front of', it: 'davanti a', fr: 'devant', de: 'vor', ja: '〜の前で',
    });
  });

  test('no article rides along: the noun is cited bare, so nothing fuses', () => {
    // "in" + the definite article would be "nella"/"im"/"dans le"; a bare noun leaves the
    // preposition alone, which is what names the relation.
    expect(path('in')).toMatchObject({ it: 'in', de: 'in', fr: 'dans', es: 'en', pt: 'em' });
  });

  test('the two relations a clause leaves to the particle are still told apart in Japanese', () => {
    // Inside a sentence both are bare (家で, 市場を). Named on their own they take the 中 and the
    // 通る the particle leaves implicit, or the menu would show one word for two relations.
    expect(path('in').ja).toBe('〜の中で');
    expect(path('through').ja).toBe('〜を通って');
  });

  // P09-E12b: the temporal toolbar's six, headed as the temporal complement heads them. `ago` is the
  // test of the citation: English and Italian postpose a word, Japanese a noun and a particle, and
  // French, Spanish and Portuguese front an impersonal verb — each of which, on a bare noun, is the
  // word alone.
  test('a temporal relation, in every language — ago the one each says its own way', () => {
    const temporal = (value: TemporalRelation) => specifierAll({ kind: 'temporal', value });
    expect(temporal('ago')).toEqual({
      en: 'ago', it: 'fa', fr: 'il y a', de: 'vor', es: 'hace', ja: '〜前に', pt: 'há',
    });
    expect(temporal('at')).toEqual({ en: 'at', it: 'a', fr: 'à', de: 'zu', es: 'en', ja: '〜に', pt: 'em' });
    expect(temporal('until')).toEqual({
      en: 'until', it: 'fino a', fr: "jusqu'à", de: 'bis zu', es: 'hasta', ja: '〜まで', pt: 'até',
    });
    expect(temporal('after')).toEqual({
      en: 'after', it: 'dopo', fr: 'après', de: 'nach', es: 'después de', ja: '〜の後に', pt: 'depois de',
    });
    expect(temporal('before')).toEqual({
      en: 'before', it: 'prima di', fr: 'avant', de: 'vor', es: 'antes de', ja: '〜の前に', pt: 'antes de',
    });
    expect(temporal('during')).toEqual({
      en: 'during', it: 'durante', fr: 'pendant', de: 'während', es: 'durante', ja: '〜の間に', pt: 'durante',
    });
    // P09-E20: the spatial `between` word, and in Japanese the same 〜の間に as `during` (D3).
    expect(temporal('between')).toEqual({
      en: 'between', it: 'tra', fr: 'entre', de: 'zwischen', es: 'entre', ja: '〜の間に', pt: 'entre',
    });
    // P09-E27: the Italian "da" cited bare, as `at`'s "a" is.
    expect(temporal('since')).toEqual({
      en: 'since', it: 'da', fr: 'depuis', de: 'seit', es: 'desde', ja: '〜から', pt: 'desde',
    });
    // P09-E34: the genitive "innerhalb", and Japanese 以内 cited on the 〜 as `ago`'s 前 is.
    expect(temporal('within')).toEqual({
      en: 'within', it: 'entro', fr: "d'ici", de: 'innerhalb', es: 'dentro de', ja: '〜以内に', pt: 'dentro de',
    });
  });

  test('a cause connector is a specifier too — the stance picks the word', () => {
    expect(specifierAll({ kind: 'sentiment', value: 'neutral' })).toEqual({
      en: 'because of', it: 'a causa di', fr: 'à cause de', de: 'wegen',
      es: 'a causa de', ja: '〜のために', pt: 'por causa de',
    });
    expect(specifierAll({ kind: 'sentiment', value: 'positive' })).toMatchObject({
      en: 'thanks to', it: 'grazie a', fr: 'grâce à', de: 'dank', ja: '〜のおかげで',
    });
    // German blames with a fixed phrase rather than a preposition.
    expect(specifierAll({ kind: 'sentiment', value: 'negative' })).toMatchObject({
      en: 'through the fault of', it: 'per colpa di', de: 'durch die Schuld', ja: '〜のせいで',
    });
  });
});

// ── translateDegree: what a degree adds to an adjective ─────────────────────────
// The one label cited on an adjective rather than on a noun, because whether a degree is a word at
// all depends on the adjective: English inflects the short ones and German inflects them all.
describe('degree chip: what each degree adds', () => {
  test('the periphrastic languages give the word, the synthetic ones the remade adjective', () => {
    expect(degreeAll('more')).toEqual({
      en: 'bigger', it: 'più', fr: 'plus', de: 'größer', es: 'más', ja: 'もっと', pt: 'mais',
    });
  });

  test('the relative superlative keeps the article that tells it from the comparative', () => {
    // Without it Romance would say "più" for both degrees; German's own superlative is the
    // predicative "am …-en", the form that stands without a noun.
    expect(degreeAll('most')).toEqual({
      en: 'biggest', it: 'il più', fr: 'le plus', de: 'am größten', es: 'el más', ja: '最も', pt: 'o mais',
    });
    expect(degreeAll('least')).toMatchObject({
      en: 'least', it: 'il meno', fr: 'le moins', de: 'am wenigsten', es: 'el menos', pt: 'o menos',
    });
  });

  test('the Japanese lowered degrees are a circumfix, and are cited whole', () => {
    // Japanese lowers a degree by negating the adjective (それほど大きくない, 最も大きくない), so the
    // opening adverb alone would name `most` and `least` with one word.
    expect(degreeAll('less').ja).toBe('それほど〜ない');
    expect(degreeAll('least').ja).toBe('最も〜ない');
    expect(degreeAll('most').ja).toBe('最も');
  });

  test('English switches to the adverb on an adjective it does not inflect', () => {
    // The whole reason the degree is cited on an adjective rather than looked up.
    expect(degreeAll('more', 'BEAUTIFUL')).toMatchObject({ en: 'more', de: 'schöner' });
    expect(degreeAll('most', 'BEAUTIFUL')).toMatchObject({ en: 'most', de: 'am schönsten' });
  });

  test('the positive degree marks nothing, and says so with the em-dash', () => {
    expect(degreeAll('positive')).toEqual({
      en: '—', it: '—', fr: '—', de: '—', es: '—', ja: '—', pt: '—',
    });
  });
});
