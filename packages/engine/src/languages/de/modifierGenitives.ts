import type { ResolvedNounPhrase } from '../../types.js';
import { declineAdj } from './declineAdj.js';
import { genitiveS } from './genitiveS.js';

/**
 * A modifier that carries its own adjective is rendered as a postposed bare genitive, not folded
 * into the compound: "der alte Schöpfer semantischer Phrasen", never "*der semantische alte
 * Phraseschöpfer" — which would (wrongly) attribute the adjective to the head. Article-less, so the
 * adjective takes the strong genitive ending ("semantischer") and the noun its genitive -(e)s on a
 * masculine/neuter singular. Empty when no modifier carries an adjective. One space-led phrase per
 * such modifier, in order.
 */
export function modifierGenitives(np: ResolvedNounPhrase): string {
  return np.nounModifiers
    .filter((m) => m.adjectives.length > 0)
    .map((m) => {
      const f = m.concept.forms;
      const plural = (f['number'] ?? f['count']) === 'plural';
      const gender = f['gender'] ?? 'neut';
      const noun = genitiveS(plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? ''), 'gen', f, plural);
      const adjs = m.adjectives.map((a) => declineAdj(a.forms['base'] ?? '', 'gen', gender, plural, 'bare'));
      return [...adjs, noun].filter(Boolean).join(' ');
    })
    .filter(Boolean)
    .map((phrase) => ` ${phrase}`)
    .join('');
}
