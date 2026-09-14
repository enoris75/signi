import type { ConceptForms } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { deComparative } from './deComparative.js';
import { deDegPrefix } from './deDegPrefix.js';
import { deStem } from './deStem.js';
import { deSuperlativeSuffix } from './deSuperlativeSuffix.js';

/**
 * A predicate adjective ("wird müde") — undeclined, but still compared. The comparative
 * stays synthetic ("müder"); the *predicative* superlative takes the fixed "am …sten" frame
 * ("am müdesten"), which the attributive "-st" + declension ending can't express. The
 * periphrastic degrees reuse `deDegPrefix` ("weniger müde", "gleich müde").
 */
export function dePredAdj(a: ConceptForms): string {
  const base = a.forms['base'] ?? '';
  if (!base) return '';
  const d = adjDegree(a);
  if (d === 'more') return a.forms['comparative'] ?? deComparative(deStem(a, base));
  if (d === 'most') {
    // The predicative superlative is the fixed "am …sten" frame; a seeded irregular stem
    // (größt, best) slots straight into it, else the umlaut/epenthesis rules build the stem.
    if (a.forms['superlative']) return `am ${a.forms['superlative']}en`;
    const stem = deStem(a, base);
    return `am ${stem}${deSuperlativeSuffix(stem)}en`;
  }
  return `${deDegPrefix(a)}${base}`;
}
