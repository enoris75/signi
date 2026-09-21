import { describe, expect, test } from 'vitest';
import type { NounPhrase } from '@signi/shared';
import { CASA, GATTO, lexicon } from '../translator.fixtures.js';
import { antecedentAgreement } from './antecedentAgreement.js';

// The same concepts in a gendered lexicon (Italian, German) and in two that carry no gender
// (English, Japanese), the way the seeded lexicon has them: only the five gendered languages give a
// noun a `gender`, and `human` is concept-level, so every language has it.
const LOOKUP = lexicon(
  {},
  {
    it: { CAT: GATTO, HOUSE: CASA, PERSON: { base: 'persona', gender: 'fem', human: '1' } },
    de: { ANIMAL: { base: 'Tier', gender: 'neut' }, CONTENT: { base: 'Inhalt', gender: 'masc' } },
    en: { CONTENT: { base: 'content' }, CAT: { base: 'cat', animate: '1' }, PERSON: { base: 'person', human: '1' } },
    ja: { PERSON: { base: '人', human: '1' } },
  },
);
const agree = (antecedent: string, pronoun: Partial<NounPhrase> = {}, language = 'it') =>
  antecedentAgreement({ concept: 'THIRD_PERSON', ...pronoun }, antecedent, language, LOOKUP);

describe('antecedentAgreement', () => {
  describe('a lexeme with a grammatical gender gives it', () => {
    test('masculine, feminine and neuter alike', () => {
      expect(agree('CONTENT', {}, 'de')).toEqual({ gender: 'masc' });
      expect(agree('HOUSE')).toEqual({ gender: 'fem' });
      expect(agree('ANIMAL', {}, 'de')).toEqual({ gender: 'neut' });
    });

    test('a pronoun gender reaches it only through the noun’s own feminine counterpart', () => {
      // gatto has one ("la gatta"), so a female cat is "la"; persona is feminine whoever it names.
      expect(agree('CAT', { gender: 'fem' })).toEqual({ gender: 'fem' });
      expect(agree('CAT')).toEqual({ gender: 'masc' });
      expect(agree('PERSON', { gender: 'masc' })).toEqual({ gender: 'fem' });
      // A neuter asked of a masculine noun is not a gender the noun has.
      expect(agree('CONTENT', { gender: 'neut' }, 'de')).toEqual({ gender: 'masc' });
    });
  });

  describe('a lexeme with none leaves the natural gender', () => {
    test('a thing, or an animal of unknown sex, is neuter', () => {
      expect(agree('CONTENT', {}, 'en')).toEqual({ gender: 'neut' });
      expect(agree('CAT', {}, 'en')).toEqual({ gender: 'neut' });
    });

    test('the pronoun’s own gender, when the plan states it, is the referent’s', () => {
      expect(agree('PERSON', { gender: 'fem' }, 'en')).toEqual({ gender: 'fem' });
      expect(agree('CAT', { gender: 'masc' }, 'en')).toEqual({ gender: 'masc' });
    });

    test('a person of unstated sex is never guessed at', () => {
      // The singular gives way to the antecedent under the anaphoric demonstrative ("that person");
      // the plural pronoun is neutral already ("they", 彼ら).
      expect(agree('PERSON', {}, 'en')).toEqual({ anaphor: { concept: 'PERSON', definiteness: 'that' } });
      expect(agree('PERSON', {}, 'ja')).toEqual({ anaphor: { concept: 'PERSON', definiteness: 'that' } });
      expect(agree('PERSON', { number: 'plural' }, 'en')).toEqual({ gender: 'masc' });
    });

    test('an antecedent missing from the lexicon reads as a thing', () => {
      expect(agree('NOWHERE', {}, 'en')).toEqual({ gender: 'neut' });
    });
  });
});
