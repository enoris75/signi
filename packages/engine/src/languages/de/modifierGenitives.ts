import type { ResolvedNounModifier, ResolvedNounPhrase } from '../../types.js';
import { declineAdj } from './declineAdj.js';
import { genitiveS } from './genitiveS.js';
import { postnominal } from './postnominal.js';

/**
 * Whether an attributive noun breaks out of the compound into the postposed genitive: it carries an
 * adjective, its own or one its name holds (YOUNG_WOMAN's inherent "jung", `forms.adjective`), or a
 * name's fixed genitive after the head (LOCATIVE's "des Ortes", `forms.postnominal`). A compound can
 * hold neither an inflected adjective nor a genitive (A295).
 */
export function isGenitiveModifier(m: ResolvedNounModifier): boolean {
  const f = m.concept.forms;
  return m.adjectives.length > 0 || !!f['adjective'] || !!f['postnominal'];
}

/**
 * A modifier that carries its own adjective is rendered as a postposed bare genitive, not folded
 * into the compound: "der alte Schöpfer semantischer Phrasen", never "*der semantische alte
 * Phraseschöpfer" — which would (wrongly) attribute the adjective to the head. Article-less, so the
 * adjective takes the strong genitive ending ("semantischer") and the noun its genitive -(e)s on a
 * masculine/neuter singular, or -(e)n on a weak noun ("kleinen Jungen"). Empty when no modifier carries an adjective. One space-led phrase per
 * such modifier, in order.
 *
 * A name's inherent adjective declines after the modifier's own, closest to the noun, as `adjPhrase`
 * orders them on a head ("kleiner junger Frauen"); a name's postnominal genitive follows the noun
 * ("adverbialer Bestimmungen des Ortes"). Either takes the modifier out of the compound too (A295,
 * `isGenitiveModifier`).
 */
export function modifierGenitives(np: ResolvedNounPhrase): string {
  return np.nounModifiers
    .filter(isGenitiveModifier)
    .map((m) => {
      const f = m.concept.forms;
      const plural = (f['number'] ?? f['count']) === 'plural';
      const gender = f['gender'] ?? 'neut';
      const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
      // A weak noun takes -(e)n, never the -(e)s, in the genitive ("kleinen Jungen"): see `genitiveS`.
      const noun = genitiveS(word, 'gen', f, plural);
      const stems = [...m.adjectives.map((a) => a.forms['base'] ?? ''), f['adjective'] ?? ''];
      const adjs = stems.filter(Boolean).map((stem) => declineAdj(stem, 'gen', gender, plural, 'bare'));
      return [...adjs, noun].filter(Boolean).join(' ') + postnominal(f);
    })
    .filter(Boolean)
    .map((phrase) => ` ${phrase}`)
    .join('');
}
