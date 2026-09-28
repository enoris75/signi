import type { Government } from './pl.types.js';

/**
 * The case (and preposition) a verb governs its direct object in (P05 §2.1): the lexeme's
 * `object_prep` + `object_prep_case` (*czeka na mysz*), its `object_case` (*pomaga kotu*, *szuka
 * kota*, *rządzi krajem*), else the accusative — which turns genitive when the verb is negated, the
 * genitive of negation (*nie je myszy*). Only the accusative turns: a dative or instrumental object and a
 * prepositional one keep their case (*nie pomaga kotu*, *nie czeka na mysz*).
 */
export function objectGovernment(verbForms: Record<string, string>, negated: boolean): Government {
  const prep = verbForms['object_prep'];
  if (prep) return { prep, case: (verbForms['object_prep_case'] as Government['case'] | undefined) ?? 'acc' };
  const own = verbForms['object_case'] as Government['case'] | undefined;
  if (own && own !== 'acc') return { prep: '', case: own };
  return { prep: '', case: negated ? 'gen' : 'acc' };
}
