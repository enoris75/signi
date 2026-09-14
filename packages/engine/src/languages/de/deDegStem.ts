import type { ConceptForms } from '../../types.js';
import { adjDegree } from '../../resolved/adjDegree.js';
import { deComparative } from './deComparative.js';
import { deStem } from './deStem.js';
import { deSuperlativeSuffix } from './deSuperlativeSuffix.js';

// German comparison is synthetic: the comparative adds "-er" and the superlative "-st" to
// the stem *before* the case/gender declension ending ("schön" → "schöner-e" / "schönst-e",
// the superlative leaning on the noun's definite article). Inferiority/equality stay
// periphrastic ("weniger schön", "gleich schön"). Suppletives (gut → besser / best) and the
// irregular groß → größt are seeded whole on the lexeme (`comparative` / `superlative`); umlaut
// and superlative epenthesis are otherwise derived by rule from the seeded `umlaut` flag.
export function deDegStem(a: ConceptForms, base: string): string {
  const d = adjDegree(a);
  if (d === 'more') return a.forms['comparative'] ?? deComparative(deStem(a, base));
  if (d === 'most') {
    if (a.forms['superlative']) return a.forms['superlative'];
    const stem = deStem(a, base);
    return `${stem}${deSuperlativeSuffix(stem)}`;
  }
  // The positive degree declines the attributive stem, which for most adjectives is the base but
  // for a few is irregular (hoch → hoh-: "hohe Geschwindigkeit"); the predicative base stays "hoch".
  return a.forms['attributive'] ?? base;
}
