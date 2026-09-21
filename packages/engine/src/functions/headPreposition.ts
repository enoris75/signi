/**
 * The last word of a complement's head — the preposition that actually governs whatever follows it,
 * where the head is a locution built on one ("debaixo **de**", "intorno **a**", "alrededor **de**").
 * It is what decides how a tonic pronoun attaches: Portuguese fuses "em"/"de" with it ("debaixo
 * dele"), Italian reaches it through "di" after some of them ("sotto di lui") and not after others
 * ("intorno a lui"), and the Iberian similative "como" wants the nominative. A203.
 */
export function headPreposition(head: string): string {
  return head.slice(head.lastIndexOf(' ') + 1);
}
