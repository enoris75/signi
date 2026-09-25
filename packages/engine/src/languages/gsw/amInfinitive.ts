/**
 * The *am*-progressive's verb (P10-E9 D1): the infinitive nominalised — capitalised, a separable
 * particle joined on as the infinitive already carries it — after *am*: *am Frässe*, *am Zruggchoo*,
 * *am Schaffe*. No form key of its own: it is the `base`, which is the style sheet's infinitive. A
 * particle written apart from its verb (B40) closes up, as a noun is one word.
 */
export function amInfinitive(verbForms: Record<string, string>): string {
  const base = (verbForms['base'] ?? '').replace(/ /g, '');
  return base ? `am ${base.charAt(0).toUpperCase()}${base.slice(1)}` : '';
}
