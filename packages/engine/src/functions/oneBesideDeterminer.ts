/** The determiners that identify a referent the numeral one then counts: "the one dog", "this one dog". */
const IDENTIFYING: ReadonlySet<string> = new Set(['definite', 'this', 'that']);

/**
 * Whether a phrase counts one beside a definite or demonstrative determiner (A319). In Romance the
 * cardinal one is the indefinite article's own word, so beside such a determiner it says "*the a dog"
 * (`l'un cane`, `el un perro`) and is left out: the phrase is simply the singular, "il cane", "este
 * perro". German declines it as an adjective after that determiner instead: "der eine Hund", "den
 * einen Hund". English and Japanese keep their numeral as it is.
 *
 * A pronominal possessive in the determiner's place is not asked about here: the caller leaves it out.
 */
export function oneBesideDeterminer(forms: Record<string, string>): boolean {
  return forms['numeral'] === '1' && IDENTIFYING.has(forms['definiteness'] ?? 'definite');
}
