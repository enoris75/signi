import type { LanguageColumn } from '../types.js';

// The adverbs, keyed as Spanish's are: `subtype`, `polarity`, `negative`, `negative_slot`,
// `negator_lead`, `fronted`, the degree words and `drop_degrees` mirror the Spanish entry one for
// one, the word in Catalan. A fixed phrase is stored whole, its article included (*a l'esquerra*):
// the elision there is the phrase's own, not the engine's. Every form is (verify) until the native
// review (P03-E11); the ones marked are the least sure.
export const CA_ADVERBS: LanguageColumn = {
  FAST: { base: 'de pressa' },
  SLOWLY: { base: 'lentament' },
  WELL: { base: 'bé' },
  // A predicative adjective agreeing with the subject, as Spanish's (*les gates mengen juntes*):
  // the plural the picker cites, the masculine singular the engine agrees.
  TOGETHER: { base: 'junts', predicative: 'junt' },
  REPEATEDLY: { base: 'repetidament' },
  AGAIN: { base: 'de nou' },
  ONCE: { base: 'una vegada' },
  SUDDENLY: { base: 'de sobte' },
  EXACTLY: { base: 'exactament' },
  UP: { base: 'amunt', subtype: 'direction' },
  DOWN: { base: 'avall', subtype: 'direction' },
  OUTSIDE: { base: 'fora', subtype: 'direction' },
  LEFT: { base: "a l'esquerra", subtype: 'direction' },
  RIGHT: { base: 'a la dreta', subtype: 'direction' },
  BACKWARDS: { base: 'enrere', subtype: 'direction' },
  EVERYWHERE: { base: 'a tot arreu', subtype: 'place' },
  HERE: { base: 'aquí', subtype: 'place' },
  THERE: { base: 'allà', subtype: 'place' },
  FAR_AWAY: { base: 'lluny', subtype: 'place' },
  NOW: { base: 'ara' },
  TODAY: { base: 'avui' },
  // *encara no ha arribat*: the negated *ja* is *encara*, before the negator.
  ALREADY: { base: 'ja', subtype: 'frequency', negative: 'encara', negative_slot: 'pre-negator' },
  STILL: { base: 'encara', subtype: 'frequency' },
  RECENTLY: { base: 'recentment' },
  LATER: { base: 'més tard' },
  ALWAYS: { base: 'sempre', subtype: 'frequency' },
  OFTEN: { base: 'sovint', subtype: 'frequency' },
  // *mai* is negative; in a question it is *mai* again, positive (*Has estat mai a Roma?*) (verify:
  // against *alguna vegada*).
  NEVER: {
    base: 'mai', subtype: 'frequency', polarity: 'negative', interrogative: 'mai', fuses_with: 'AGAIN', fused: 'mai més',
  },
  // *ja no*, the negator behind *ja* as Spanish *ya no* (`negator_lead`).
  NO_LONGER: { base: 'ja no', subtype: 'frequency', polarity: 'negative', negator_lead: 'ja' },
  JUST: { base: 'tot just', subtype: 'frequency' },
  ALSO: { base: 'també', subtype: 'frequency', negative: 'tampoc', negative_slot: 'pre-negation' },
  ONLY: { base: 'només', subtype: 'frequency' },
  REALLY: { base: 'realment', subtype: 'frequency' },
  MAYBE: { base: 'potser', subtype: 'sentence', negative_slot: 'pre-negator' },
  PROBABLY: { base: 'probablement', subtype: 'sentence', negative_slot: 'pre-negator' },
  ACTUALLY: { base: 'en realitat', subtype: 'sentence', negative_slot: 'pre-negator', fronted: 'comma' },
  OF_COURSE: { base: 'per descomptat', subtype: 'sentence', negative_slot: 'pre-negator', fronted: 'comma' },
  // *molt més gran*, *igual de gran*, *de molt el més gran* (verify the superlative).
  VERY: { base: 'molt', comparative: 'molt', equative: 'igual de', superlative: 'de molt' },
  TOO: { base: 'massa' },
  A_LITTLE: { base: 'una mica', drop_degrees: 'equally,most,least' },
};
