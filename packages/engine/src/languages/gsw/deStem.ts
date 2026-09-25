import type { ConceptForms } from '../../types.js';
import { deUmlaut } from './deUmlaut.js';

/** The comparison stem: the umlauted base when the lexeme is flagged for it, else the base. */
export function deStem(a: ConceptForms, base: string): string {
  return a.forms['umlaut'] ? deUmlaut(base) : base;
}
