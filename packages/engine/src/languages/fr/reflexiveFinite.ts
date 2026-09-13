import { FR_REFLEXIVE, VOWEL_START } from './fr.consts.js';
import { auxKey } from './auxKey.js';

export function reflexiveFinite(verbForms: Record<string, string>, subjectForms: Record<string, string>, finite: string): string {
  const base = verbForms['base'] ?? '';
  if (!(base.startsWith("s'") || base.startsWith('se '))) return finite;
  const clitic = FR_REFLEXIVE[auxKey(subjectForms)] ?? 'se';
  // me/te/se elide to m'/t'/s' before a vowel-initial auxiliary ("s'est"); nous/vous never elide.
  return /^(me|te|se)$/.test(clitic) && VOWEL_START.test(finite)
    ? `${clitic[0]}'${finite}`
    : `${clitic} ${finite}`;
}
