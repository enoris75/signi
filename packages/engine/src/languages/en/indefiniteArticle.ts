// A vowel letter read as a consonant sound takes "a": the /j/ of "uni-" (unit, unique, universal — not
// the "un-" of unimportant), "use-", "usu-", "uti-" and "eu-", and the /w/ of "one".
const CONSONANT_SOUND = /^(?:uni(?:[cfqtvls]|on)|use|usu|uti|ubi|eu|one\b|once)/i;
// A silent "h" leaves a vowel sound, which takes "an".
const VOWEL_SOUND = /^(?:hour|honest|honou?r|heir)/i;

/**
 * The indefinite article before `lead`, the first word that follows it, chosen on its sound rather
 * than its first letter: "an old cat", "a high cat", "a universal cat", "an hour".
 */
export function indefiniteArticle(lead: string): 'a' | 'an' {
  if (CONSONANT_SOUND.test(lead)) return 'a';
  if (VOWEL_SOUND.test(lead)) return 'an';
  return /^[aeiou]/i.test(lead) ? 'an' : 'a';
}
