import type { Case, Slot } from './gsw.types.js';
import { deSyncopate } from './deSyncopate.js';
import { endingsFor } from './endingsFor.js';

/**
 * An attributive adjective with its ending (see `endingsFor`): *gross* → *grosse, grossi, grosses*.
 * A base in *-e* is a Standard German *-en* whose *n* Swiss German drops at the end of a word and keeps
 * before an ending: *offe* → *e offeni Tür, en offene Laade*; *erwachse* → *e erwachseni Frau*. One
 * ending in an unstressed *-el / -er* syncopates before a vowel, as in German (*tunkel* → *tunkli*).
 */
export function declineAdj(base: string, _case: Case, gender: string, plural: boolean, definiteness: string): string {
  const slot: Slot = plural ? 'plural' : gender === 'masc' || gender === 'fem' ? gender : 'neut';
  const ending = endingsFor(_case, definiteness, plural)[slot];
  if (!ending) return base;
  if (base.endsWith('e')) return `${base}n${ending}`;
  return deSyncopate(base) + ending;
}
