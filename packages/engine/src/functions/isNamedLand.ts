/** The hypernyms whose children are lands: a continent or a country (localization B36). */
const LANDS = new Set(['CONTINENT', 'COUNTRY']);

/**
 * Whether a noun names a **land**, a continent or a country: the places a language goes *to* and is
 * *in* with the words it keeps for them, not the ones it uses for a house. Italian goes "in Italia",
 * not "all'Italia"; French goes "en Italie" and "au Japon", not "à l'Italie"; German goes "nach
 * Italien", not "zu Italien". Keyed off the direct hypernym (`isA`), which the lexicon threads into a
 * noun's forms, so it holds for every language's lexeme of the concept.
 *
 * It does not say whether the name is bare. That is each engine's call, because a possessive or an
 * adjective gives the name its article back ("nella tua Italia", "dans la grande Italie").
 */
export function isNamedLand(forms: Record<string, string>): boolean {
  return LANDS.has(forms['isA'] ?? '');
}
