import type { ConceptForms } from '../../types.js';
import { agreeAdj } from './agreeAdj.js';
import { belloForm } from './belloForm.js';
import { buonoForm } from './buonoForm.js';

export function prenominalSurface(a: ConceptForms, gender: string, plural: boolean, next: string): string {
  if (a.conceptId === 'BEAUTIFUL') return belloForm(gender, plural, next);
  if (a.conceptId === 'GOOD') return buonoForm(gender, plural, next);
  return agreeAdj(a.forms['base'] ?? '', gender, plural);
}
