import type { ConceptForms, ResolvedComplement, ResolvedNounPhrase } from '../../../types.js';
import { causeSentiment } from '../../../functions/causeSentiment.js';
import { possessiveGsw, pronounPossessor } from '../../../possessive.js';
import { coordinate } from '../coordinate.js';
import { nounPhrase } from '../nounPhrase.js';
import { relativePronoun } from '../relativePronoun.js';

// A pronoun's possessive agreeing with feminine *Schuld*: "mini", "dini", "sini", "iri", "eusi", "eui".
function schuldPossessive(forms: ConceptForms['forms']): string {
  return possessiveGsw(pronounPossessor(forms), 'acc', { gender: 'fem', number: 'singular' });
}

// *vo* + a dative phrase, fused with the article where Zürich fuses it: "vom Hund", "vo de Chatz".
function vo(text: string): string {
  return text.startsWith('em ') ? `vom ${text.slice(3)}` : `vo ${text}`;
}

// The blamed party after *d Schuld*: *vo* + the dative, Swiss German having no genitive (P10 D7):
// "dur d Schuld vom Hund".
function schuldOf(np: ResolvedNounPhrase): string {
  return vo(nounPhrase(np, 'dat'));
}

/**
 * The cause shapes of their own (Standard German's *wegen* + genitive, *meinetwegen*, *durch die
 * Schuld des Hundes*), in Swiss German, which has no genitive (P10 D7): the neutral cause is *wäge* +
 * the dative, a pronoun's too ("wäge mir", "wäge em Hund"); the positive *dank* + the dative; the
 * negative *dur* + a possessive + *Schuld* for a pronoun ("dur mini Schuld") and *dur d Schuld vo* +
 * the dative for a noun ("dur d Schuld vom Hund"). A neutral or positive noun cause with no pronoun in
 * it gives undefined and is spelled by the prepositional path in `complementsPhrase`.
 */
export function causePhrase(c: ResolvedComplement): string | undefined {
  const sentiment = causeSentiment(c);
  const pronounCause = c.phrase.conjuncts.some((np) => np.head.forms['person']);
  const dative = (np: ResolvedNounPhrase) => np.head.forms['person']
    ? (np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? '')
    : nounPhrase(np, 'dat');
  if (pronounCause) {
    if (sentiment === 'negative') {
      if (c.phrase.conjuncts.every((np) => np.head.forms['person'])) {
        return `dur ${coordinate(c.phrase, (np) => schuldPossessive(np.head.forms))} Schuld`;
      }
      return coordinate(c.phrase, (np) => np.head.forms['person']
        ? `dur ${schuldPossessive(np.head.forms)} Schuld`
        : `dur d Schuld ${schuldOf(np)}`);
    }
    return `${sentiment === 'positive' ? 'dank' : 'wäge'} ${coordinate(c.phrase, dative)}`;
  }
  if (sentiment === 'negative') {
    // A relative blames through its resumptive pronoun: "de Hund, wo … dur d Schuld vo im".
    const blamed = c.phrase.conjuncts[0].head.forms;
    if (blamed['definiteness'] === 'relative') {
      return `dur d Schuld vo ${relativePronoun(blamed, 'dat', (blamed['number'] ?? blamed['count']) === 'plural')}`;
    }
    // A question blames through *wem*: "dur d Schuld vo wem springt de Chater?".
    if (blamed['definiteness'] === 'question') return 'dur d Schuld vo wem';
    return `dur d Schuld ${coordinate(c.phrase, schuldOf)}`;
  }
  return undefined;
}
