import type { LanguageColumn } from '../types.js';

// The adverbs, keyed as Spanish's are (style-pl.md § Adverbs): `subtype`, `polarity`, `negative`,
// `negative_slot`, `interrogative`, `fuses_with`/`fused`, `negator_lead`, `fronted`, the degree words
// and `drop_degrees` mirror the Spanish entry one for one, the word in Polish. The manner adverbs with a
// synthetic comparative also store it and its superlative (*szybciej, najszybciej*). A fixed phrase is
// stored whole (*w górę*, *na zewnątrz*). Every form is (verify) until the native review (P05-E11); the
// ones marked are the least sure.
export const PL_ADVERBS: LanguageColumn = {
  FAST: { base: 'szybko', comparative: 'szybciej', superlative: 'najszybciej' },
  // *powoli*; its comparative is *wolno*'s (verify: against base *wolno*, which also means "allowed").
  SLOWLY: { base: 'powoli', comparative: 'wolniej', superlative: 'najwolniej' },
  WELL: { base: 'dobrze', comparative: 'lepiej', superlative: 'najlepiej' },
  // *razem* never agrees, so Spanish's `predicative` (*juntos/junto*) is dropped.
  TOGETHER: { base: 'razem' },
  REPEATEDLY: { base: 'wielokrotnie' },
  AGAIN: { base: 'znowu' },
  ONCE: { base: 'raz' },
  SUDDENLY: { base: 'nagle' },
  EXACTLY: { base: 'dokładnie' },
  UP: { base: 'w górę', subtype: 'direction' },
  DOWN: { base: 'w dół', subtype: 'direction' },
  OUTSIDE: { base: 'na zewnątrz', subtype: 'direction' }, // (verify) against *na dwór*
  LEFT: { base: 'w lewo', subtype: 'direction' },
  RIGHT: { base: 'w prawo', subtype: 'direction' },
  BACKWARDS: { base: 'do tyłu', subtype: 'direction' },
  EVERYWHERE: { base: 'wszędzie', subtype: 'place' },
  HERE: { base: 'tutaj', subtype: 'place' },
  THERE: { base: 'tam', subtype: 'place' },
  FAR_AWAY: { base: 'daleko', subtype: 'place' },
  NOW: { base: 'teraz' },
  TODAY: { base: 'dzisiaj' },
  // *jeszcze nie zjadł*: the negated *już* is *jeszcze*, before the negator.
  ALREADY: { base: 'już', subtype: 'frequency', negative: 'jeszcze', negative_slot: 'pre-negator' },
  STILL: { base: 'nadal', subtype: 'frequency' },
  RECENTLY: { base: 'niedawno' },
  LATER: { base: 'później' },
  ALWAYS: { base: 'zawsze', subtype: 'frequency' },
  OFTEN: { base: 'często', subtype: 'frequency' },
  // *nigdy* is negative, and takes *nie* on the verb (negative concord: *nigdy nie je*); in a question
  // it is *kiedykolwiek* (*Czy byłeś kiedykolwiek w Rzymie?*); with AGAIN, *nigdy więcej*.
  NEVER: {
    base: 'nigdy', subtype: 'frequency', polarity: 'negative', interrogative: 'kiedykolwiek', fuses_with: 'AGAIN', fused: 'nigdy więcej',
  },
  // *już nie*, the negator behind *już* as Spanish *ya no* (`negator_lead`).
  NO_LONGER: { base: 'już nie', subtype: 'frequency', polarity: 'negative', negator_lead: 'już' },
  // *właśnie zjadł*, "has just eaten" (verify: against *dopiero co*, *przed chwilą*).
  JUST: { base: 'właśnie', subtype: 'frequency' },
  // Polish keeps *też* under negation and puts it before the negator (*kot też nie je*), as German's
  // *auch nicht*, not as Spanish *tampoco*, which replaces the negation (verify).
  ALSO: { base: 'też', subtype: 'frequency', negative: 'też', negative_slot: 'pre-negator' },
  ONLY: { base: 'tylko', subtype: 'frequency' },
  REALLY: { base: 'naprawdę', subtype: 'frequency' },
  MAYBE: { base: 'może', subtype: 'sentence', negative_slot: 'pre-negator' },
  PROBABLY: { base: 'prawdopodobnie', subtype: 'sentence', negative_slot: 'pre-negator' },
  // Polish sets a fronted *właściwie* / *oczywiście* off with a comma optionally (verify both).
  ACTUALLY: { base: 'właściwie', subtype: 'sentence', negative_slot: 'pre-negator', fronted: 'comma' },
  OF_COURSE: { base: 'oczywiście', subtype: 'sentence', negative_slot: 'pre-negator', fronted: 'comma' },
  // *o wiele większy*, *tak samo duży*, *zdecydowanie największy* (verify the equative and superlative).
  VERY: { base: 'bardzo', comparative: 'o wiele', equative: 'tak samo', superlative: 'zdecydowanie' },
  TOO: { base: 'za' },
  A_LITTLE: { base: 'trochę', drop_degrees: 'equally,most,least' },
};
