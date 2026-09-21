import type { NounPhrase } from '@signi/shared';
import type { LexiconLookup } from '../translator.types.js';
import { applyNounGender } from './applyNounGender.js';
import { resolve } from './resolve.js';

type Gender = 'masc' | 'fem' | 'neut';

/**
 * What a 3rd-person pronoun standing for a noun takes from it (NounPhrase.antecedent), in one
 * language: the gender it agrees in, or, where no pronoun can be said without guessing, the noun
 * phrase that stands in its place.
 */
export type AntecedentAgreement = { gender: Gender } | { anaphor: NounPhrase };

/**
 * The gender a pronoun takes from its antecedent (localization C20). Which gender that is, is
 * settled by the antecedent's own lexeme in this language, not by a list of languages:
 *
 *  - A lexeme that carries a **grammatical** gender (every noun in de, it, fr, es, pt) gives it:
 *    *Inhalt* is masculine, so "ihn"; *opzione* is feminine, so "la"; *Tier* is neuter, so "es". The
 *    pronoun's own `gender` is the referent's, and is applied to the noun the way a noun phrase
 *    applies it, so it tells only where the noun has a feminine counterpart ("la compagna" → "la")
 *    and a fixed gender holds whoever it names ("la persona" → "la", "das Mädchen" → "es").
 *  - A lexeme that carries none (every noun in en and ja) leaves the **natural** gender, which is
 *    the referent's: the pronoun's own `gender` when the plan states one, else neuter for anything
 *    that is not a person ("it", それ; an animal of unknown sex too). A person has a natural gender
 *    the lexicon never records — grammatical gender is no guide to it: PERSON is feminine in all
 *    five gendered lexicons, exactly as WOMAN is, and SPEAKER masculine as the generic — so it is
 *    not guessed. The plural pronoun is already neutral (they, 彼ら). The singular is not
 *    pronominalised at all: it reads as the antecedent under the anaphoric demonstrative, "that
 *    person", その人.
 */
export function antecedentAgreement(
  pronoun: NounPhrase,
  antecedent: string,
  language: string,
  lookup: LexiconLookup,
): AntecedentAgreement {
  const noun = resolve(antecedent, language, lookup).forms;
  if (noun['gender']) {
    noun['number'] = pronoun.number ?? 'singular';
    applyNounGender(noun, pronoun.gender);
    return { gender: noun['gender'] as Gender };
  }
  if (pronoun.gender) return { gender: pronoun.gender };
  if (noun['human'] !== '1') return { gender: 'neut' };
  // The unmarked plural: English has one form, and Japanese keeps 彼女ら for the feminine alone.
  if (pronoun.number === 'plural') return { gender: 'masc' };
  return { anaphor: { concept: antecedent, definiteness: 'that' } };
}
