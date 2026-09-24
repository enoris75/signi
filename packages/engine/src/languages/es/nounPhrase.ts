import { keptBesidePossessive, possessiveEsStressed } from '../../possessive.js';
import type { EsAdjectives } from './es.types.js';
import { numeralText } from '../../functions/numeralText.js';
import { oneBesideDeterminer } from '../../functions/oneBesideDeterminer.js';
import { CARDINALS } from './es.consts.js';
import { artFor } from './artFor.js';
import { artForms } from './artForms.js';
import { isPlural } from './isPlural.js';
import { withAdj } from './withAdj.js';

export function nounPhrase(forms: Record<string, string>, adj?: EsAdjectives, possessive?: string): string {
  const plural = isPlural(forms);
  const word = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  // A cardinal stands between the determiner and the prenominal adjectives: "las dos casas
  // grandes" (C31). It agrees only at one — and in Portuguese at two as well (dois / duas).
  // At one the cardinal is the indefinite article's own word: beside a definite or demonstrative
  // determiner it is left out, and the phrase is the singular it counts: "el perro", "este perro" (A319).
  const numeral = oneBesideDeterminer(forms) ? '' : numeralText(forms, CARDINALS);
  const noun = `${numeral ? `${numeral} ` : ''}${withAdj(word, adj)}`;
  const definiteness = forms['definiteness'] ?? 'definite';
  // A pronominal possessive ("su perro") replaces the article, whatever determiner was picked —
  // unless the head carries a determiner of its own. Spanish keeps both by moving the possessive
  // behind the noun in its stressed form: "este libro suyo", "ningún libro suyo" (A187). After
  // "todos" the unstressed possessive stays in front, in the article's place: "todos sus libros".
  if (possessive) {
    const fem = (forms['gender'] ?? 'masc') === 'fem';
    if (definiteness === 'all') {
      return `${plural ? (fem ? 'todas' : 'todos') : (fem ? 'toda' : 'todo')} ${possessive} ${noun}`;
    }
    // The partitive "most" gives its article to the unstressed possessive: "la mayoría de sus
    // gatos", "la mayor parte de su agua" (A314).
    if (definiteness === 'most') return `${plural ? 'la mayoría' : 'la mayor parte'} de ${possessive} ${noun}`;
    if (keptBesidePossessive(forms)) {
      const stressed = possessiveEsStressed(possessive, { gender: fem ? 'fem' : 'masc', number: plural ? 'plural' : 'singular' });
      const det = artFor(artForms(forms, adj), plural);
      return det ? `${det} ${noun} ${stressed}` : `${noun} ${stressed}`;
    }
    return `${possessive} ${noun}`;
  }
  const art = artFor(artForms(forms, adj), plural); // definite / indefinite / bare
  return art ? `${art} ${noun}` : noun;
}
