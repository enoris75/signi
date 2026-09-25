/**
 * The case the preposition of a prepositional object governs (A139): the object of "klicken auf",
 * "folgen auf", "warten auf" is accusative, as a verb's object after a two-way preposition always is,
 * but a preposition that only ever takes the dative keeps it for an object too — "hängt **von der**
 * Bedingung ab", "die Bedingung, **von der** der Satz abhängt", "verbindet **mit dem** Knoten".
 */
export function objectPrepCase(prep: string): 'acc' | 'dat' {
  return DATIVE_PREPOSITIONS.has(prep) ? 'dat' : 'acc';
}

// The prepositions that govern the dative alone, whatever the verb.
const DATIVE_PREPOSITIONS: ReadonlySet<string> = new Set(['vo', 'mit', 'us', 'bi', 'nach', 'sit', 'zu', 'gägenüber']);
