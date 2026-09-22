/**
 * A finite form split into its verb and its lemma's tail: "a besoin" → ["a", "besoin"]. A form that
 * does not end in the tail — a one-word lemma's, or an auxiliary or modal standing in front of the
 * lemma ("a" in "a eu besoin", "doit") — comes back whole, with an empty tail.
 */
export function splitLemmaTail(finite: string, tail: string): [string, string] {
  return tail && finite.endsWith(` ${tail}`) ? [finite.slice(0, -(tail.length + 1)), tail] : [finite, ''];
}
