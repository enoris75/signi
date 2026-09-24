// Before a 3rd-person object clitic the dative's -i becomes -e: "me lo", "te la", "ce li", "ve le".
const BEFORE_OBJECT: Record<string, string> = { mi: 'me', ti: 'te', ci: 'ce', vi: 've' };

/**
 * A dative clitic and a 3rd-person object clitic written as one Italian cluster, dative first (A359):
 * "me lo", "te la", "ce li". The 3rd-person dative, "gli" or "le", is "glie" fused with the object
 * into one word: "glielo", "gliela", "glieli", "gliele". Either clitic alone is returned as it is.
 * An enclitic host takes the cluster as one word (spaces removed): "daglielo", "dammelo".
 */
export function itCliticCluster(dative: string, object: string): string {
  if (!dative || !object) return dative || object;
  if (dative === 'gli' || dative === 'le') return `glie${object}`;
  return `${BEFORE_OBJECT[dative] ?? dative} ${object}`;
}
