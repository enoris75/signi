/**
 * A conjunct's rendering with a group-scoped preposition taken off its front, so the caller can say
 * it once over the whole group (P09-E1 D2, see `GROUP_SCOPED_SPECIFIERS`). Each conjunct is still
 * built by its engine's ordinary path — its own article, its own case, its own tonic pronoun — and
 * only the preposition that path put in front of it moves: "tra la casa" + "tra l'albero" becomes
 * "tra" over "la casa e l'albero".
 *
 * A conjunct that does not start with it (a hearth idiom, which brings its own preposition) is left
 * as it is. An empty `prep` lifts nothing.
 */
export function liftPreposition(text: string, prep: string): string {
  return prep && text.startsWith(`${prep} `) ? text.slice(prep.length + 1) : text;
}
