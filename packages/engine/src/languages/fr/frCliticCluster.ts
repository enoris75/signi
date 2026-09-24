/**
 * A dative clitic and a 3rd-person object clitic written as one French cluster before the verb (A359).
 * The order turns on the dative: me / te / nous / vous come before the object ("me le", "vous la"),
 * lui / leur after it ("le lui", "les leur"). Either clitic alone is returned as it is. An affirmative
 * command puts the object first whatever the dative ("donne-le-moi"); its caller orders that one.
 */
export function frCliticCluster(dative: string, object: string): string {
  if (!dative || !object) return dative || object;
  return dative === 'lui' || dative === 'leur' ? `${object} ${dative}` : `${dative} ${object}`;
}
