// The stressed forms a clitic takes after the verb; the rest keep their shape ("vois-le", "voyez-nous").
const STRESSED: Record<string, string> = { me: 'moi', te: 'toi' };
// A reflexive verb's imperative is built from its present, which carries the clitic in front.
const LEADING_REFLEXIVE = /^(?:m'|t'|s'|me |te |se |nous |vous )/;
const REFLEXIVE_BY_PERSON: Record<string, string> = { '2sg': 'toi', '1pl': 'nous', '2pl': 'vous' };

/**
 * An affirmative French command with its pronouns after the verb, hyphenated: "vois-moi",
 * "ajoute-le", "effondre-toi", "effondrez-vous". A reflexive verb's leading clitic ("t'effondre")
 * moves behind it in the person's stressed form, ahead of any object pronoun. The negative command
 * keeps its pronouns in front ("ne me vois pas") and does not come here.
 */
export function frEnclitic(verb: string, objectClitic: string, reflexive: boolean, pn: string): string {
  const bare = reflexive ? verb.replace(LEADING_REFLEXIVE, '') : verb;
  // A cluster comes in its postverbal order, object first ("le lui", "le me"), each pronoun its own
  // hyphenated word: "donne-le-lui", "donne-le-moi" (A359).
  const objects = objectClitic.split(' ').filter(Boolean).map((c) => STRESSED[c] ?? c);
  const pronouns = [reflexive ? REFLEXIVE_BY_PERSON[pn] ?? '' : '', ...objects].filter(Boolean);
  return [bare, ...pronouns].join('-');
}
