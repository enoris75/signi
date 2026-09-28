import { KAS, KURIS } from './lt.consts.js';
import { pronominalForm } from './pronominalForm.js';
import type { Agr, Case } from './lt.types.js';

/**
 * The relative pronoun (P18 §0.5): *kuris / kuri*, agreeing with its head in gender and number and
 * taking its case from its role in the clause (*katė, kuri valgo*; *pelė, kurią katė valgo*; *namas,
 * kuriame katė valgo*; *šunys, kuriuos katė mato*). An indefinite pronoun head takes *kas* instead
 * (*kažkas, kas bėga*; *kažkas, ko katė nevalgo*).
 */
export function kurisForm(kase: Case, agr: Agr, pronoun = false): string {
  const c = kase === 'voc' ? 'nom' : kase;
  if (pronoun) return KAS[c];
  return pronominalForm(KURIS, c, agr);
}
