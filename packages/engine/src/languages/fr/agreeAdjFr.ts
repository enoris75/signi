import { FR_ADJ_IRREGULAR } from './fr.consts.js';

/**
 * Agree an adjective's masculine-singular base with the noun it modifies, deriving the
 * feminine and plural by rule (French adjective forms aren't stored — only the base is).
 * Covers the seeded vocabulary: the -eau/-eux/-x/-f/-er/-on families plus the irregular
 * beau/nouveau/vieux, defaulting to a plain +e (fem) / +s (plural). Adjectives already
 * ending in -e are invariable in the feminine (triste, rapide); those in -s/-x are
 * invariable in the masculine plural (mauvais, heureux).
 */
export function agreeAdjFr(base: string, gender: string, plural: boolean): string {
  if (!base) return '';
  const fem = gender === 'fem';
  const irr = FR_ADJ_IRREGULAR[base];
  if (irr) return irr[(fem ? 1 : 0) + (plural ? 2 : 0)];
  // Feminine stem.
  let f = base;
  if (fem) {
    if (base.endsWith('e')) f = base;                              // triste, faible, rapide
    else if (base.endsWith('eux')) f = `${base.slice(0, -3)}euse`; // heureux → heureuse
    else if (base.endsWith('x')) f = `${base.slice(0, -1)}se`;     // generic -x → -se
    else if (base.endsWith('f')) f = `${base.slice(0, -1)}ve`;     // actif → active
    else if (base.endsWith('er')) f = `${base.slice(0, -2)}ère`;   // premier → première
    else if (base.endsWith('on')) f = `${base}ne`;                 // bon → bonne
    else if (base.endsWith('el')) f = `${base}le`;                 // pluriel → plurielle
    else f = `${base}e`;                                           // grand, fort, fatigué → +e
  }
  if (!plural) return f;
  if (fem) return `${f}s`;                                         // fem plural is always +s
  if (f.endsWith('s') || f.endsWith('x')) return f;                // mauvais, heureux invariable
  if (f.endsWith('al')) return `${f.slice(0, -2)}aux`;             // -al → -aux
  return `${f}s`;
}
