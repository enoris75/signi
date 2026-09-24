import { describe, expect, test } from 'vitest';
import type { NounPhrase, PronominalPossessor } from '@signi/shared';
import { ACQUA, CANE, CASA, GATTO, GRANDE, IO, lexicon, LOOKUP, LUI, ROSSO, type Forms } from '../translator.fixtures.js';
import type { LexiconLookup } from '../translator.types.js';
import { resolveNounPhrase } from './resolveNounPhrase.js';

const resolveIt = (np: NounPhrase, lookup: LexiconLookup = LOOKUP) => resolveNounPhrase(np, 'it', lookup);
const headForms = (np: NounPhrase, lookup?: LexiconLookup) => resolveIt(np, lookup).head.forms;
const only = (conceptId: string, forms: Forms) => lexicon({ [conceptId]: forms });

describe('resolveNounPhrase', () => {
  describe('a noun head', () => {
    test('is definite and singular unless the plan picks otherwise, with nothing attached', () => {
      expect(resolveIt({ concept: 'CAT' })).toEqual({
        head: { conceptId: 'CAT', forms: { ...GATTO, number: 'singular', definiteness: 'definite' } },
        adjectives: [],
        nounModifiers: [],
        relative: undefined,
        possessor: undefined,
        dimensionGloss: undefined,
        mannerGloss: undefined,
      });
    });

    test('keeps the chosen number and determiner', () => {
      expect(headForms({ concept: 'CAT', number: 'plural', definiteness: 'indefinite' }))
        .toMatchObject({ number: 'plural', definiteness: 'indefinite' });
    });

    // The Romance negative quantifiers are singular ("nessun gatto", "aucun chat"); English and German
    // keep the number picked ("no cats", "keine Kater").
    test('the negative quantifier takes a singular noun in the Romance languages', () => {
      const noCats: NounPhrase = { concept: 'CAT', number: 'plural', definiteness: 'no' };
      for (const language of ['it', 'fr', 'es', 'pt']) {
        expect(resolveNounPhrase(noCats, language, LOOKUP).head.forms['number']).toBe('singular');
      }
      for (const language of ['en', 'de']) {
        expect(resolveNounPhrase(noCats, language, LOOKUP).head.forms['number']).toBe('plural');
      }
    });

    test('a plural with no plural surface stays singular, and remembers the plural asked (A348)', () => {
      expect(headForms({ concept: 'WATER', number: 'plural' })).toMatchObject({ number: 'singular', plural_unmarked: '1' });
      expect(headForms({ concept: 'CAT', number: 'plural' })['plural_unmarked']).toBeUndefined();
      expect(headForms({ concept: 'WATER' })['plural_unmarked']).toBeUndefined();
    });

    test.each(['some', 'many', 'few', 'all'] as const)('%s forces the plural surface', (definiteness) => {
      expect(headForms({ concept: 'CAT', definiteness })['number']).toBe('plural');
    });

    test('a quantifier leaves a mass noun singular, and any other determiner keeps the chosen number', () => {
      expect(headForms({ concept: 'WATER', definiteness: 'some' })).toEqual({ ...ACQUA, number: 'singular', definiteness: 'some' });
      expect(headForms({ concept: 'CAT', definiteness: 'this' })['number']).toBe('singular');
    });

    test('OTHER takes the indefinite article’s place in Spanish and Portuguese, and follows it elsewhere', () => {
      const other: NounPhrase = { concept: 'CAT', definiteness: 'indefinite', adjectives: ['OTHER'] };
      const lookup = lexicon({ CAT: GATTO, BIG: GRANDE, OTHER: { role: 'adjective', base: 'altro' } });
      const definiteness = (language: string, np: NounPhrase = other) =>
        resolveNounPhrase(np, language, lookup).head.forms['definiteness'];

      expect(definiteness('es')).toBe('bare');
      expect(definiteness('pt')).toBe('bare');
      expect(definiteness('it')).toBe('indefinite');
      expect(definiteness('en')).toBe('indefinite');
      // Only an indefinite yields: "el otro gato" keeps its article.
      expect(definiteness('es', { ...other, definiteness: 'definite' })).toBe('definite');
      expect(definiteness('es', { ...other, adjectives: ['BIG'] })).toBe('indefinite');
    });

    // A175: a relative superlative picks one member out of a set, so it is definite in every language.
    test('a superlative makes an indefinite or bare phrase definite, in every language', () => {
      const biggest = (definiteness: NounPhrase['definiteness'], degree: 'most' | 'least' = 'most'): NounPhrase =>
        ({ concept: 'DOG', definiteness, adjectives: ['BIG'], adjectiveDegrees: [degree] });
      for (const language of ['en', 'it', 'fr', 'de', 'es', 'pt', 'ja']) {
        expect(resolveNounPhrase(biggest('indefinite'), language, LOOKUP).head.forms['definiteness']).toBe('definite');
      }
      expect(headForms(biggest('bare'))['definiteness']).toBe('definite');
      expect(headForms(biggest('indefinite', 'least'))['definiteness']).toBe('definite');
      expect(headForms({ ...biggest('indefinite'), number: 'plural' })).toMatchObject({ number: 'plural', definiteness: 'definite' });
      // One superlative among several adjectives is enough.
      expect(headForms({ concept: 'DOG', definiteness: 'indefinite', adjectives: ['RED', 'BIG'], adjectiveDegrees: ['positive', 'most'] })['definiteness'])
        .toBe('definite');
    });

    test('a superlative leaves every other determiner as picked, and a comparative leaves the indefinite', () => {
      const biggest = (definiteness: NounPhrase['definiteness']): NounPhrase =>
        ({ concept: 'DOG', definiteness, adjectives: ['BIG'], adjectiveDegrees: ['most'] });
      for (const definiteness of ['this', 'that', 'no', 'some', 'many', 'few', 'all'] as const) {
        expect(headForms(biggest(definiteness))['definiteness']).toBe(definiteness);
      }
      for (const degree of ['more', 'less', 'equally', 'positive'] as const) {
        expect(headForms({ concept: 'DOG', definiteness: 'indefinite', adjectives: ['BIG'], adjectiveDegrees: [degree] })['definiteness'])
          .toBe('indefinite');
      }
      // A degree with no adjective to carry it is not a superlative.
      expect(headForms({ concept: 'DOG', definiteness: 'indefinite', adjectiveDegrees: ['most'] })['definiteness']).toBe('indefinite');
    });

    // The superlative wins before OTHER is read, so Spanish keeps the article: "el otro perro más grande".
    test('a superlative with OTHER is definite in Spanish and Portuguese too', () => {
      const lookup = lexicon({ DOG: CANE, BIG: GRANDE, OTHER: { role: 'adjective', base: 'otro' } });
      const otherBiggest: NounPhrase = { concept: 'DOG', definiteness: 'indefinite', adjectives: ['OTHER', 'BIG'], adjectiveDegrees: ['positive', 'most'] };
      expect(resolveNounPhrase(otherBiggest, 'es', lookup).head.forms['definiteness']).toBe('definite');
      expect(resolveNounPhrase(otherBiggest, 'pt', lookup).head.forms['definiteness']).toBe('definite');
    });

    // A180: a proper name takes the article its language fixes, never the one the plan picked, so the
    // determiner is resolved to `definite` here — the article builders already assumed it, and every
    // other reader of `definiteness` (declension, contraction, the quantifier, negative concord) now
    // agrees with them.
    test('a proper name is definite whatever determiner the plan picked, in every language', () => {
      const europa = only('EUROPE', { base: 'Europa', plural: 'Europe', gender: 'fem', proper: '1' });
      const name = (definiteness: NounPhrase['definiteness']): NounPhrase => ({ concept: 'EUROPE', definiteness });
      for (const definiteness of ['indefinite', 'bare', 'this', 'that', 'no', 'some', 'many', 'few', 'all'] as const) {
        for (const language of ['en', 'it', 'fr', 'de', 'es', 'pt', 'ja']) {
          expect(resolveNounPhrase(name(definiteness), language, europa).head.forms['definiteness']).toBe('definite');
        }
      }
      // So a quantifier no longer forces the plural surface on it either.
      expect(headForms(name('many'), europa)).toMatchObject({ base: 'Europa', number: 'singular' });
      // A common noun still keeps the determiner it was given.
      expect(headForms({ concept: 'CAT', definiteness: 'many' })['definiteness']).toBe('many');
    });

    test('a feminine referent takes the feminine forms', () => {
      expect(headForms({ concept: 'CAT', number: 'plural', gender: 'fem' })).toMatchObject({ base: 'gatte', gender: 'fem' });
    });
  });

  describe('a pronoun head', () => {
    test("a 1st-person singular keeps its base, carrying number and the referent's gender, but no determiner", () => {
      expect(headForms({ concept: 'I', gender: 'fem', definiteness: 'indefinite' }))
        .toEqual({ ...IO, number: 'singular', gender: 'fem' });
    });

    test('defaults to the masculine singular', () => {
      expect(headForms({ concept: 'I' })).toMatchObject({ number: 'singular', gender: 'masc' });
    });

    test('a plural takes the plural surface and the plural oblique', () => {
      expect(headForms({ concept: 'I', number: 'plural' })).toMatchObject({ base: 'noi', plural: 'noi', disjunctive: 'noi' });
    });

    test('a feminine plural takes its own surface where the language has one', () => {
      const ils = only('THEY', { base: 'il', person: '3', singular_fem: 'elle', plural: 'ils', plural_fem: 'elles' });
      expect(headForms({ concept: 'THEY', number: 'plural', gender: 'fem' }, ils)).toMatchObject({ base: 'elles', plural: 'elles' });
      expect(headForms({ concept: 'THEY', number: 'plural', gender: 'masc' }, ils)).toMatchObject({ base: 'ils', plural: 'ils' });
      expect(headForms({ concept: 'HE', number: 'plural', gender: 'fem' })).toMatchObject({ base: 'loro', plural: 'loro' });
    });

    test('a 3rd-person singular takes the surface of its gender, when there is one', () => {
      expect(headForms({ concept: 'HE', gender: 'fem' })).toMatchObject({ base: 'lei', disjunctive: 'lei' });
      expect(headForms({ concept: 'HE', gender: 'masc' })).toMatchObject({ base: 'lui', disjunctive: 'lui' });
    });

    test('the furigana reading follows the surface it goes with', () => {
      const kare = only('HE', {
        base: '彼', reading: 'かれ', person: '3',
        singular_fem: '彼女', singular_fem_reading: 'かのじょ', plural: '彼ら', plural_reading: 'かれら',
      });
      expect(headForms({ concept: 'HE', number: 'plural' }, kare)).toMatchObject({ base: '彼ら', reading: 'かれら' });
      expect(headForms({ concept: 'HE', gender: 'fem' }, kare)).toMatchObject({ base: '彼女', reading: 'かのじょ' });
      expect(headForms({ concept: 'HE', gender: 'masc' }, kare)).toMatchObject({ base: '彼', reading: 'かれ' });
    });

    // A161. A gendered plural surface takes the gendered plural reading; without one it keeps the
    // plain `plural_reading`, so a language that seeds the surface alone is no worse off.
    test('a feminine plural surface takes the feminine plural reading', () => {
      const forms = {
        base: '彼', reading: 'かれ', person: '3', plural: '彼ら', plural_reading: 'かれら',
        plural_fem: '彼女ら', plural_fem_reading: 'かのじょら',
      };
      const kanojora = only('HE', forms);
      expect(headForms({ concept: 'HE', number: 'plural', gender: 'fem' }, kanojora))
        .toMatchObject({ base: '彼女ら', plural: '彼女ら', reading: 'かのじょら' });
      expect(headForms({ concept: 'HE', number: 'plural', gender: 'masc' }, kanojora))
        .toMatchObject({ base: '彼ら', plural: '彼ら', reading: 'かれら' });
      const { plural_fem_reading: _dropped, ...noReading } = forms;
      const noFemReading = only('HE', noReading);
      expect(headForms({ concept: 'HE', number: 'plural', gender: 'fem' }, noFemReading))
        .toMatchObject({ base: '彼女ら', reading: 'かれら' });
    });

    test('a missing plural surface, or plural oblique, falls back to what the pronoun has', () => {
      const si = only('SELF', { base: 'sé', person: '3', disjunctive: 'sé' });
      expect(headForms({ concept: 'SELF', number: 'plural' }, si)).toEqual({ base: 'sé', person: '3', disjunctive: 'sé', number: 'plural', gender: 'masc' });
    });

    test('a pronoun with no oblique form gets none', () => {
      const ci = only('THERE', { base: 'ci', person: '3' });
      expect(headForms({ concept: 'THERE' }, ci)).not.toHaveProperty('disjunctive');
    });

    // C20. The gender comes from the noun the pronoun stands for, before the surface is picked.
    test('a 3rd-person pronoun takes its gender from its antecedent, over its own', () => {
      expect(headForms({ concept: 'HE', antecedent: 'HOUSE' })).toMatchObject({ base: 'lei', disjunctive: 'lei', gender: 'fem' });
      expect(headForms({ concept: 'HE', antecedent: 'DOG', gender: 'fem' })).toMatchObject({ base: 'lui', gender: 'masc' });
      expect(headForms({ concept: 'HE', antecedent: 'HOUSE', number: 'plural' })).toMatchObject({ base: 'loro', number: 'plural', gender: 'fem' });
    });

    test('a 1st- or 2nd-person pronoun, or the generic one, has no antecedent to agree with', () => {
      expect(headForms({ concept: 'I', antecedent: 'HOUSE' })).toMatchObject({ gender: 'masc' });
      const si = lexicon({ ONE: { base: 'si', person: '3', generic: '1' }, HOUSE: CASA });
      expect(headForms({ concept: 'ONE', antecedent: 'HOUSE' }, si)).toMatchObject({ gender: 'masc' });
    });

    test('where the language could only guess, the antecedent itself stands in, under the demonstrative', () => {
      const lookup = lexicon({ HE: { base: 'he', person: '3', singular_fem: 'she' }, PERSON: { base: 'person', human: '1' } });
      expect(resolveNounPhrase({ concept: 'HE', antecedent: 'PERSON' }, 'en', lookup).head)
        .toEqual({ conceptId: 'PERSON', forms: { base: 'person', human: '1', number: 'singular', definiteness: 'that' } });
    });
  });

  describe('the head degree', () => {
    test('an adjective head carries its comparative degree', () => {
      expect(headForms({ concept: 'HAPPY', headDegree: 'more' })['degree']).toBe('more');
    });

    test('the positive degree, or no degree, or a noun head, carries none', () => {
      expect(headForms({ concept: 'HAPPY', headDegree: 'positive' })).not.toHaveProperty('degree');
      expect(headForms({ concept: 'HAPPY' })).not.toHaveProperty('degree');
      expect(headForms({ concept: 'CAT', headDegree: 'more' })).not.toHaveProperty('degree');
    });
  });

  describe('what hangs off the head', () => {
    test('adjectives resolve in order, each carrying its own degree unless positive', () => {
      expect(resolveIt({ concept: 'CAT', adjectives: ['BIG', 'RED', 'BIG'], adjectiveDegrees: ['most', 'positive'] }).adjectives).toEqual([
        { conceptId: 'BIG', forms: { ...GRANDE, degree: 'most' } },
        { conceptId: 'RED', forms: ROSSO },
        { conceptId: 'BIG', forms: GRANDE },
      ]);
    });

    test('attributive nouns carry their relation, their own number, and their own adjectives', () => {
      const { nounModifiers } = resolveIt({
        concept: 'CAT',
        nounModifiers: [
          { concept: 'HOUSE', relation: 'feature', number: 'plural', adjectives: ['RED'] },
          { concept: 'WATER', relation: 'material', number: 'plural' },
          { concept: 'HOUSE', relation: 'purpose' },
        ],
      });
      expect(nounModifiers).toEqual([
        { concept: { conceptId: 'HOUSE', forms: { ...CASA, number: 'plural' } }, relation: 'feature', adjectives: [{ conceptId: 'RED', forms: ROSSO }] },
        { concept: { conceptId: 'WATER', forms: { ...ACQUA, number: 'singular' } }, relation: 'material', adjectives: [] },
        { concept: { conceptId: 'HOUSE', forms: { ...CASA, number: 'singular' } }, relation: 'purpose', adjectives: [] },
      ]);
    });

    test('a relative clause resolves with the head in its subject slot by default', () => {
      const { relative } = resolveIt({ concept: 'CAT', relative: { verbPhrase: { verb: 'RUN' } } });
      expect(relative?.headRole).toBe('subject');
      expect(relative?.verbPhrase.verb.conceptId).toBe('RUN');
    });

    test('a pronominal possessor passes straight through', () => {
      const mine: PronominalPossessor = { kind: 'pronominal', person: '1', number: 'singular' };
      expect(resolveIt({ concept: 'HOUSE', possessor: mine }).possessor).toBe(mine);
    });

    test('a genitive possessor resolves as a noun phrase of its own, to any depth', () => {
      const { possessor } = resolveIt({ concept: 'HOUSE', possessor: { concept: 'CAT', gender: 'fem', possessor: { concept: 'HE' } } });
      expect(possessor).toMatchObject({
        head: { conceptId: 'CAT', forms: { base: 'gatta', definiteness: 'definite' } },
        possessor: { head: { conceptId: 'HE', forms: { base: 'lui', number: 'singular' } } },
      });
    });

    // C26: what the possessor is to the head — only English reads it, so it rides through as given.
    test("the possessor's role rides through", () => {
      expect(resolveIt({ concept: 'HOUSE', possessor: { concept: 'CAT' }, possessorRole: 'whole' }).possessorRole).toBe('whole');
      expect(resolveIt({ concept: 'HOUSE', possessor: { concept: 'CAT' } }).possessorRole).toBeUndefined();
    });

    test('the gloss flags ride through', () => {
      expect(resolveIt({ concept: 'SPEED', dimensionGloss: true, mannerGloss: true })).toMatchObject({ dimensionGloss: true, mannerGloss: true });
    });

    // The head of a relative-clause gloss is never spoken, but it resolves in full: the clause agrees
    // with its forms, as a headed relative's does.
    test('the relative-gloss flag rides through beside a resolved head and relative', () => {
      const resolved = resolveIt({ concept: 'CAT', relativeGloss: true, relative: { verbPhrase: { verb: 'EAT' } } });
      expect(resolved).toMatchObject({ relativeGloss: true, head: { forms: { base: 'gatto' } }, relative: { verbPhrase: { verb: { forms: { base: 'mangiare' } } } } });
    });
  });
  // ── P11: kin terms, and whose family they are ─────────────────────────────
  // The head's own word may depend on an adjective it fuses (D5) and on who owns it (D2, D3, D6), so
  // the possessor resolves first and the head's forms are settled around it.

  describe('a kin head', () => {
    const KIN = lexicon({
      // BROTHER: one word for a brother of unstated age, another for the older one, each honorific its own.
      BROTHER: {
        base: '兄弟', reading: 'きょうだい', kin: '1', human: '1', honorific: 'ご兄弟',
        with_ELDER: '兄', with_ELDER_reading: 'あに', with_ELDER_honorific: 'お兄さん',
      },
      // SON fuses nothing: Japanese says 上の息子, the older son.
      SON: { base: '息子', reading: 'むすこ', kin: '1', human: '1', honorific: '息子さん' },
      WIFE: { base: '妻', reading: 'つま', kin: '1', human: '1', honorific: '奥さん', honorific_reading: 'おくさん' },
      BOY: { base: '男の子', reading: 'おとこのこ', human: '1' },
      CAT: { base: '猫', reading: 'ねこ', animate: '1' },
      ELDER: { role: 'adjective', base: '上の' },
      BIG: { role: 'adjective', base: '大きい' },
    });
    const ja = (phrase: NounPhrase) => resolveNounPhrase(phrase, 'ja', KIN);
    const word = (phrase: NounPhrase) => ja(phrase).head.forms['base'];
    const mine: PronominalPossessor = { kind: 'pronominal', person: '1', number: 'singular' };
    const yours: PronominalPossessor = { kind: 'pronominal', person: '2', number: 'singular' };

    test('fuses the adjective it has a word for, and drops it from the adjectives', () => {
      const resolved = ja({ concept: 'BROTHER', adjectives: ['ELDER'] });
      expect(resolved.head.forms).toMatchObject({ base: '兄', reading: 'あに' });
      expect(resolved.adjectives).toEqual([]);
    });

    test('keeps an adjective it has no word for', () => {
      const resolved = ja({ concept: 'SON', adjectives: ['ELDER'] });
      expect(resolved.head.forms['base']).toBe('息子');
      expect(resolved.adjectives.map((a) => a.forms['base'])).toEqual(['上の']);
    });

    test('the adjectives that stay keep the degree their own index carries', () => {
      const resolved = ja({ concept: 'BROTHER', adjectives: ['BIG', 'ELDER'], adjectiveDegrees: ['more', 'positive'] });
      expect(resolved.adjectives.map((a) => [a.forms['base'], a.forms['degree']])).toEqual([['大きい', 'more']]);
    });

    test('the possessor then picks a form of the word the fusion left', () => {
      expect(word({ concept: 'BROTHER', adjectives: ['ELDER'], possessor: yours })).toBe('お兄さん');
      expect(word({ concept: 'BROTHER', adjectives: ['ELDER'], possessor: mine })).toBe('兄');
      expect(word({ concept: 'BROTHER', possessor: yours })).toBe('ご兄弟');
    });

    // D3: 私の兄の妻 is 兄の妻, own all the way down; あなたのお兄さんの奥さん is someone else's, all the way down.
    test('own and someone else\'s carry down a genitive chain', () => {
      const brother = (possessor: PronominalPossessor) => ({ concept: 'BROTHER', adjectives: ['ELDER'], possessor });
      expect(word({ concept: 'WIFE', possessor: brother(mine) })).toBe('妻');
      expect(word({ concept: 'WIFE', possessor: brother(yours) })).toBe('奥さん');
    });

    test('a human possessor that is nobody\'s relative is still someone else\'s', () => {
      expect(word({ concept: 'WIFE', possessor: { concept: 'BOY' } })).toBe('奥さん');
    });

    test('a possessor that is not a person takes no honorific', () => {
      expect(word({ concept: 'WIFE', possessor: { concept: 'CAT' } })).toBe('妻');
      expect(word({ concept: 'WIFE' })).toBe('妻');
    });

    test('the own mark rides on the head for the phrase above to read', () => {
      expect(ja({ concept: 'WIFE', possessor: mine }).head.forms['own']).toBe('1');
      expect(ja({ concept: 'WIFE', possessor: yours }).head.forms['own']).toBeUndefined();
    });

    // The other six seed none of these columns, so nothing above fires for them.
    test('a language with no such column resolves as it always did', () => {
      const resolved = resolveIt({ concept: 'CAT', adjectives: ['BIG'], possessor: mine });
      expect(resolved.head.forms).toMatchObject({ base: 'gatto' });
      expect(resolved.head.forms['own']).toBeUndefined();
      expect(resolved.adjectives.map((a) => a.forms['base'])).toEqual(['grande']);
    });
  });
});
