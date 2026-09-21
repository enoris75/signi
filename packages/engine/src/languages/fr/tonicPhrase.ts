/**
 * A bare adposition + the tonic form of a pronoun. French elides "de" before a vowel, and the
 * elided form carries its apostrophe rather than a space — "à cause d'eux", "autour d'elles" —
 * which is the one join that differs from the ordinary "vers lui", "comme elle". A203, the shape
 * the causal adjunct has always written by hand.
 */
export function tonicPhrase(head: string, tonic: string): string {
  return head.endsWith("'") ? `${head}${tonic}` : `${head} ${tonic}`;
}
