import type { ConceptForms } from '../../types.js';
import { FR_PARTICIPLE_STEM } from './fr.consts.js';

/**
 * The present participle, for the gérondif ("en choisissant"). French seeds no gerund — its
 * progressive is periphrastic ("en train de") — so it is derived the way the moods are: from the
 * "nous" present minus its -ons ending, which carries any stem irregularity with it (nous
 * choisissons → choisissant, nous mangeons → mangeant). The three verbs whose participle that
 * rule misses are listed.
 */
export function presentParticiple(verb: ConceptForms): string {
  const irregular = FR_PARTICIPLE_STEM[verb.conceptId];
  if (irregular) return `${irregular}ant`;
  const nous = verb.forms['1pl_present'];
  if (nous?.endsWith('ons')) return `${nous.slice(0, -3)}ant`;
  return verb.forms['base'] ?? '';
}
