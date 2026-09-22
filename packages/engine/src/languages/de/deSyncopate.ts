/**
 * The stem an ending attaches to. An adjective in unstressed -el drops that e before any ending,
 * which always starts with a vowel: dunkel → der dunkle Teil, eine dunkle Nacht, and the comparative
 * dunkler (edel → edle, übel → üble, flexibel → flexible). The superlative keeps it, because its -st
 * is a consonant (am dunkelsten, der dunkelste), and so does the undeclined predicate (ist dunkel).
 *
 * The -el must be an unstressed final syllable: a monosyllable has none to lose (hell and schnell
 * end in -ll anyway), and the stressed -lel of parallel keeps its e (parallele). The same syncope
 * takes -er after a diphthong (teuer → teure, sauer → saure); no seeded adjective has that shape yet.
 */
export function deSyncopate(base: string): string {
  const syllables = base.match(/[aeiouäöüy]+/gi)?.length ?? 0;
  if (syllables > 1 && /[^aeiouäöüyl]el$/i.test(base)) return `${base.slice(0, -2)}l`;
  return base;
}
