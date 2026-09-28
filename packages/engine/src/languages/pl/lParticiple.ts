import { aspectForm } from './aspectForm.js';
import type { VerbAgr } from './pl.types.js';

/**
 * The *l*-participle agreeing with the subject (P05 §2.2): masculine / feminine / neuter in the
 * singular, virile / non-virile in the plural (*zjadł, zjadła, zjadło, zjedli, zjadły*). The past, the
 * conditional, the imperfective future and *gdyby* are all built on it.
 */
export function lParticiple(forms: Record<string, string>, perfective: boolean, agr: VerbAgr): string {
  const key = agr.plural ? (agr.virile ? 'past_virile' : 'past_nonvirile') : `past_${agr.gender}`;
  return aspectForm(forms, perfective, key) ?? aspectForm(forms, perfective, 'past_masc') ?? forms['base'] ?? '';
}
