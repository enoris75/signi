import { deSyncopate } from './deSyncopate.js';

/**
 * The comparative stem: "-er", a bare "-r" on a base already ending in -e (müde → müder), and "-er"
 * on the syncopated stem of an adjective in unstressed -el (dunkel → dunkler).
 */
export function deComparative(base: string): string {
  return base.endsWith('e') ? `${base}r` : `${deSyncopate(base)}er`;
}
