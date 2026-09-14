import { causeSentiment, type ConceptForms, type PronominalPossessor, type ResolvedComplement } from '../../../types.js';
import { possessiveDe } from '../../../possessive.js';
import { coordinate } from '../coordinate.js';
import { nounPhrase } from '../nounPhrase.js';
import { relativePronoun } from '../relativePronoun.js';

// A pronoun's possessive agreeing with feminine "Schuld" in the accusative "durch" governs: "meine",
// "deine", "seine", "ihre", "unsere", "eure".
function schuldPossessive(forms: ConceptForms['forms']): string {
  const owner: PronominalPossessor = {
    kind: 'pronominal',
    person: forms['person'] === '1' || forms['person'] === '2' ? forms['person'] : '3',
    number: forms['number'] === 'plural' ? 'plural' : 'singular',
    gender: forms['gender'] === 'fem' ? 'fem' : undefined,
  };
  return possessiveDe(owner, 'acc', { gender: 'fem', number: 'singular' });
}

// The cause shapes of their own: a group holding a pronoun, and the negative "Schuld" periphrasis.
// A neutral or positive noun cause gives undefined — it is "wegen" / "dank" + the dative, spelled on
// each conjunct's article by the prepositional path in `complementsPhrase`.
export function causePhrase(c: ResolvedComplement): string | undefined {
  const sentiment = causeSentiment(c);
  // A pronoun cause ("wegen mir/ihr/ihnen") uses the dative form with no article — the
  // colloquial dative that "wegen" already takes. Positive credits with "dank" ("dank
  // dir"); negative lays blame with the possessive periphrasis "durch <possessive> Schuld"
  // ("durch meine/deine/seine Schuld"), the possessive agreeing with feminine "Schuld".
  //
  // A group holding a pronoun renders every conjunct in its own form, never the first one's:
  // the preposition once, then a pronoun's dative or a noun's dative phrase ("wegen dem Mann und
  // dir"). In the negative a group of pronouns shares one "Schuld" ("durch meine und deine
  // Schuld"); a group mixing in a noun gives each conjunct its own periphrasis.
  const pronounCause = c.phrase.conjuncts.some((np) => np.head.forms['person']);
  if (pronounCause) {
    if (sentiment === 'negative') {
      if (c.phrase.conjuncts.every((np) => np.head.forms['person'])) {
        return `durch ${coordinate(c.phrase, (np) => schuldPossessive(np.head.forms))} Schuld`;
      }
      return coordinate(c.phrase, (np) => np.head.forms['person']
        ? `durch ${schuldPossessive(np.head.forms)} Schuld`
        : `durch die Schuld ${nounPhrase(np, 'gen')}`);
    }
    const prep = sentiment === 'positive' ? 'dank' : 'wegen';
    const conjuncts = coordinate(c.phrase, (np) => np.head.forms['person']
      ? (np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? '')
      : nounPhrase(np, 'dat'));
    return `${prep} ${conjuncts}`;
  }
  // A negative noun cause takes the genitive periphrasis "durch die Schuld" (through the
  // fault) + the cause in the genitive: "durch die Schuld des Hundes". "durch" governs the
  // accusative of the fixed "die Schuld"; the blamed party hangs off it as a genitive. Emitted
  // once before the group ("durch die Schuld des Hundes und der Katze").
  if (sentiment === 'negative') {
    // A relativizer blames through its genitive, ahead of "Schuld": "der Hund, durch dessen Schuld …".
    const blamed = c.phrase.conjuncts[0].head.forms;
    if (blamed['definiteness'] === 'relative') {
      return `durch ${relativePronoun(blamed, 'gen', (blamed['number'] ?? blamed['count']) === 'plural')} Schuld`;
    }
    return `durch die Schuld ${coordinate(c.phrase, (np) => nounPhrase(np, 'gen'))}`;
  }
  return undefined;
}
