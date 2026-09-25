import { DE_REFLEXIVE } from './gsw.consts.js';

/**
 * A reflexive verb's pronoun for the person-number `pn` ("mich", "sich", "uns"), or "" for any other
 * verb. The clause stands it in the Mittelfeld's unstressed-pronoun slot, the one `splitObject` opened
 * for an object pronoun (A127): "der Kater bewegt sich nicht", "der sich bewegt", "sich schnell
 * bewegen", "beweg dich", "im Begriff, sich zu bewegen".
 */
export function reflexivePronoun(verbForms: Record<string, string>, pn: string): string {
  if (!(verbForms['base'] ?? '').startsWith('sich ')) return '';
  return DE_REFLEXIVE[pn] ?? 'sich';
}
