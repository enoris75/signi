/**
 * A dative clitic and a 3rd-person object clitic written as one Spanish cluster, dative first (A359):
 * "me lo", "te la", "nos los". The 3rd-person dative, "le" or "les", is "se" before lo / la / los /
 * las: "se lo", "se las" — the plain clitic, undoubled, as A351 ruled for the lone dative. Either
 * clitic alone is returned as it is. An enclitic host takes the cluster as one word (spaces removed):
 * "dáselo", "dámelo".
 */
export function esCliticCluster(dative: string, object: string): string {
  if (!dative || !object) return dative || object;
  return `${dative === 'le' || dative === 'les' ? 'se' : dative} ${object}`;
}
