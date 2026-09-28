import { declineAdj } from './declineAdj.js';
import type { VerbAgr } from './pl.types.js';

/**
 * The passive participle agreeing with the promoted patient (A01): the stored masculine and virile
 * forms of the aspect the clause picked (*zjedzony / zjedzeni*, *jedzony / jedzeni*), declined in the
 * nominative as the adjective it is (*zjedzona, zjedzone*). A verb with none of that aspect takes the
 * other's; one with none at all (an intransitive the plan still made passive) says its infinitive.
 */
export function passiveParticiplePl(forms: Record<string, string>, perfective: boolean, agr: VerbAgr): string {
  const pf = perfective && forms['pf_passive'] !== undefined;
  const base = (pf ? forms['pf_passive'] : forms['passive'] ?? forms['pf_passive']) ?? forms['base'] ?? '';
  const virile = pf ? forms['pf_passive_virile'] : forms['passive'] !== undefined ? forms['passive_virile'] : forms['pf_passive_virile'];
  return declineAdj(base, virile, 'nom', { gender: agr.gender, plural: agr.plural, virile: agr.virile, animate: false });
}
