/** The determiners that identify a referent the numeral one then counts: "the one dog", "this one dog". */
const IDENTIFYING: ReadonlySet<string> = new Set(['definite', 'this', 'that']);

/**
 * Whether a phrase counts one beside a definite or demonstrative determiner (A319). In Romance the
 * cardinal one is the indefinite article's own word, so beside such a determiner it says "*the a dog"
 * (`l'un cane`, `el un perro`) and is left out: the phrase is simply the singular, "il cane", "este
 * perro". German declines it as an adjective after that determiner instead: "der eine Hund", "den
 * einen Hund". English and Japanese keep their numeral as it is.
 *
 * A pronominal possessive beside or in place of that determiner changes nothing (A357): "il suo
 * amico", "este amigo suyo", German "ihr einer Freund". So `forms` are the phrase's *own* head forms,
 * with the determiner the user picked, not the builder's possessed forms that gave it to the
 * possessive. The indefinite one keeps its word there, its slot given to it by `keptBesidePossessive`
 * (A329): "un mio amico".
 *
 * A head the plan marks `bare` is identified by a pronominal possessive as well, which stands in the
 * determiner's place (A365): "il suo amico", "son ami", German "ihr einer Freund", as the bare head
 * with no numeral renders "il suo amico". `pronominalPossessive` says the phrase has one. Without it
 * a bare one keeps its word ("un amico"), and so does the indefinite the translator made bare
 * (`indefinite_dropped`, A329).
 */
export function oneBesideDeterminer(forms: Record<string, string>, pronominalPossessive = false): boolean {
  if (forms['numeral'] !== '1') return false;
  const definiteness = forms['definiteness'] ?? 'definite';
  return IDENTIFYING.has(definiteness)
    || (pronominalPossessive && definiteness === 'bare' && forms['indefinite_dropped'] !== '1');
}
