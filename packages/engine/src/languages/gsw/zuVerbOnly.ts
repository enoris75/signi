import type { ResolvedPhrase } from '../../types.js';

/**
 * A governed infinitive clause cut down to its verb alone: the verb, and the voice and auxiliary that
 * spell it ("zu handeln", "zurückzukehren", "gegessen zu werden"), with everything else dropped —
 * objects, complements, the agent, adverbs, every negation, a nested infinitive, a purpose, content
 * and adverbial clauses. A modal chain counts as a nested infinitive, since each modal governs the
 * verb below it: "wünschen, handeln zu wollen". It is a whitelist, so a slot added later counts as
 * "more" by default.
 *
 * `renderClause` renders both and compares them (A266): a zu-infinitive that renders as no more than
 * this is bare, and German writes it with no comma ("braucht zu laufen", "fähig zu fressen"); one that
 * renders more is a group, set off by one ("braucht, das Essen zu fressen", "veranlassen, berechtigt
 * zu sein zu handeln", whose inner "zu handeln" is bare in its turn), as `prospectiveFrame` draws the same line. The caller folds a modal governor
 * first (see `foldModalGovernor`), so a modal-headed complement is compared as the chain it renders.
 */
export function zuVerbOnly(phrase: ResolvedPhrase): ResolvedPhrase {
  const vp = phrase.verbPhrase;
  if (!vp) return { subject: phrase.subject };
  const { verb, voice, passiveAux, mood, tense, aspect, bareInfinitive, register } = vp;
  return {
    subject: phrase.subject,
    verbPhrase: {
      verb,
      modals: [],
      ...(voice !== undefined ? { voice } : {}),
      ...(passiveAux !== undefined ? { passiveAux } : {}),
      ...(mood !== undefined ? { mood } : {}),
      ...(tense !== undefined ? { tense } : {}),
      ...(aspect !== undefined ? { aspect } : {}),
      ...(bareInfinitive !== undefined ? { bareInfinitive } : {}),
      ...(register !== undefined ? { register } : {}),
    },
  };
}
