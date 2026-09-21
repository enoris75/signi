import type { ConceptForms } from '../types.js';

/**
 * The participle a **passive** is built on, before any agreement is applied to it.
 *
 * Normally that is the verb's one `participle` — the same word the resultative perfect takes. But
 * some verbs have *two*, an **abundant participle**: a regular one the perfect auxiliary governs
 * and a short one the copula does. Portuguese has a whole class of them (salvar → *tinha salvado*
 * but *foi salvo*; also aceitar/aceito, entregar/entregue, gastar/gasto, pagar/pago), Spanish and
 * Italian a handful. Which of the two is spoken is decided by the auxiliary, and the passive's
 * auxiliary is always the copula — so the passive is exactly the place the short form belongs.
 *
 * A verb with one participle needs no `participle_passive`, and every branch that is not a passive
 * (the perfect, the citation) reads `participle` directly and is untouched by this.
 */
export function passiveParticiple(verb: ConceptForms): string {
  return verb.forms['participle_passive'] ?? verb.forms['participle'] ?? verb.forms['base'] ?? '';
}
