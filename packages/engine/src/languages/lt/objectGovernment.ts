import type { Government } from './lt.types.js';

/**
 * The case (and preposition) a verb governs its direct object in (P18 §2.1): the lexeme's
 * `object_prep` + `object_prep_case` (*galvoja apie pelę*), its `object_case` (*padeda katei*, *laukia
 * katės*, *groja gitara*), else the accusative — which turns genitive whenever the verb is negated,
 * the genitive of negation, **obligatory** in Lithuanian (*nevalgo pelės*). Only the accusative turns:
 * a dative or instrumental object and a prepositional one keep their case (*nepadeda katei*, *negalvoja
 * apie pelę*).
 */
export function objectGovernment(verbForms: Record<string, string>, negated: boolean): Government {
  const prep = verbForms['object_prep'];
  if (prep) return { prep, case: (verbForms['object_prep_case'] as Government['case'] | undefined) ?? 'acc' };
  const own = verbForms['object_case'] as Government['case'] | undefined;
  if (own && own !== 'acc') return { prep: '', case: own };
  return { prep: '', case: negated ? 'gen' : 'acc' };
}
