/**
 * Lower case, accents off: what two spellings of one word have in common. The console's completion
 * and the concept pickers' search both match on it, so *gia* finds *già*. Catalan's middle dot goes
 * too (P03 §3), so *collegi* finds *col·legi*. Polish *ł* has no decomposition, so it is mapped to *l*
 * by hand (P05 §3): *zolw* finds *żółw*.
 */
export const fold = (s: string): string => s.toLowerCase().normalize('NFD').replace(/\p{M}|·/gu, '').replace(/ł/g, 'l');
