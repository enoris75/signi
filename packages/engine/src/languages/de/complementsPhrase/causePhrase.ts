import type { ConceptForms, ResolvedComplement, ResolvedNounPhrase } from '../../../types.js';
import { causeSentiment } from '../../../functions/causeSentiment.js';
import { possessiveDe, pronounPossessor } from '../../../possessive.js';
import { coordinate } from '../coordinate.js';
import { genitiveShows } from '../genitiveShows.js';
import { nounPhrase } from '../nounPhrase.js';
import { relativePronoun } from '../relativePronoun.js';

// A pronoun's possessive agreeing with feminine "Schuld" in the accusative "durch" governs: "meine",
// "deine", "seine", "ihre", "unsere", "eure".
function schuldPossessive(forms: ConceptForms['forms']): string {
  return possessiveDe(pronounPossessor(forms), 'acc', { gender: 'fem', number: 'singular' });
}

// A personal pronoun's "wegen": the genitive of a personal pronoun is not said after it, so standard
// German fuses the possessive stem with "-etwegen" — "meinetwegen", "deinetwegen", "seinetwegen",
// "ihretwegen", "unseretwegen", "euretwegen".
function pronounWegen(forms: ConceptForms['forms']): string {
  const stem = possessiveDe(pronounPossessor(forms), 'nom', { gender: 'masc', number: 'singular' });
  return `${stem === 'euer' ? 'eur' : stem}etwegen`;
}

// A noun cause after "wegen": the genitive, or the dative where the genitive would not show ("wegen
// Männern", see `genitiveShows`).
function nounWegen(np: ResolvedNounPhrase): string {
  return `wegen ${nounPhrase(np, genitiveShows(np) ? 'gen' : 'dat')}`;
}

// The blamed party after "die Schuld": the genitive, or "von" + the dative where the genitive would
// not show ("durch die Schuld von Freunden", "von Wasser", see `genitiveShows`) (A343).
function schuldOf(np: ResolvedNounPhrase): string {
  return genitiveShows(np) ? nounPhrase(np, 'gen') : `von ${nounPhrase(np, 'dat')}`;
}

// The cause shapes of their own: a group holding a pronoun, and the negative "Schuld" periphrasis.
// A neutral or positive noun cause gives undefined — it is "wegen" + the genitive or "dank" + the
// dative, spelled on each conjunct's article by the prepositional path in `complementsPhrase`.
export function causePhrase(c: ResolvedComplement): string | undefined {
  const sentiment = causeSentiment(c);
  // A neutral pronoun cause is one word, "meinetwegen" (see `pronounWegen`). Positive credits with
  // "dank" + the pronoun's dative ("dank dir"); negative lays blame with the possessive periphrasis
  // "durch <possessive> Schuld" ("durch meine/deine/seine Schuld"), the possessive agreeing with
  // feminine "Schuld".
  //
  // A group holding a pronoun renders every conjunct in its own form, never the first one's. "dank"
  // is said once, before a pronoun's dative or a noun's dative phrase ("dank dem Mann und dir"). A
  // pronoun's "wegen" is inside its one word, so every conjunct brings its own ("wegen des Mannes und
  // deinetwegen"). In the negative a group of pronouns shares one "Schuld" ("durch meine und deine
  // Schuld"); a group mixing in a noun gives each conjunct its own periphrasis.
  const pronounCause = c.phrase.conjuncts.some((np) => np.head.forms['person']);
  if (pronounCause) {
    if (sentiment === 'negative') {
      if (c.phrase.conjuncts.every((np) => np.head.forms['person'])) {
        return `durch ${coordinate(c.phrase, (np) => schuldPossessive(np.head.forms))} Schuld`;
      }
      return coordinate(c.phrase, (np) => np.head.forms['person']
        ? `durch ${schuldPossessive(np.head.forms)} Schuld`
        : `durch die Schuld ${schuldOf(np)}`);
    }
    if (sentiment === 'positive') {
      return `dank ${coordinate(c.phrase, (np) => np.head.forms['person']
        ? (np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? '')
        : nounPhrase(np, 'dat'))}`;
    }
    return coordinate(c.phrase, (np) => np.head.forms['person'] ? pronounWegen(np.head.forms) : nounWegen(np));
  }
  // A negative noun cause takes the genitive periphrasis "durch die Schuld" (through the
  // fault) + the cause in the genitive: "durch die Schuld des Hundes". "durch" governs the
  // accusative of the fixed "die Schuld"; the blamed party hangs off it as a genitive, or as "von" +
  // the dative where the genitive cannot show ("durch die Schuld von Freunden"). Emitted
  // once before the group ("durch die Schuld des Hundes und der Katze").
  if (sentiment === 'negative') {
    // A relativizer blames through its genitive, ahead of "Schuld": "der Hund, durch dessen Schuld …".
    const blamed = c.phrase.conjuncts[0].head.forms;
    if (blamed['definiteness'] === 'relative') {
      return `durch ${relativePronoun(blamed, 'gen', (blamed['number'] ?? blamed['count']) === 'plural')} Schuld`;
    }
    // A question blames the same way, through *wessen*: "durch wessen Schuld läuft der Kater?" (P09-E15).
    if (blamed['definiteness'] === 'question') return 'durch wessen Schuld';
    return `durch die Schuld ${coordinate(c.phrase, schuldOf)}`;
  }
  return undefined;
}
