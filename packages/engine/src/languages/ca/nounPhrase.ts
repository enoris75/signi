import { keptBesidePossessive } from '../../possessive.js';
import type { CaAdjectives } from './ca.types.js';
import { numeralText } from '../../functions/numeralText.js';
import { oneBesideDeterminer } from '../../functions/oneBesideDeterminer.js';
import { CARDINALS } from './ca.consts.js';
import { artFor } from './artFor.js';
import { artForms } from './artForms.js';
import { defArticle } from './defArticle.js';
import { isPlural } from './isPlural.js';
import { joinHead } from './joinHead.js';
import { withAdj } from './withAdj.js';

/**
 * A noun phrase with its determiner: "el gat", "una casa", "aquests gats", "les dues cases grans". A
 * pronominal possessive rides on the definite article ("el meu gat", "la meva casa") and keeps it
 * after *tots* ("tots els meus gats") and *la majoria de* ("la majoria dels meus gats"). A head with
 * a determiner of its own keeps it and says the possessive after the noun: "aquest llibre meu", "un
 * amic meu" (A187).
 */
export function nounPhrase(forms: Record<string, string>, adj?: CaAdjectives, possessive?: string): string {
  const plural = isPlural(forms);
  const word = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  // A cardinal stands between the determiner and the prenominal adjectives: "les dues cases grans"
  // (C31); at one beside a definite or demonstrative it is left out (A319).
  const numeral = oneBesideDeterminer(forms, !!possessive) ? '' : numeralText(forms, CARDINALS);
  const noun = `${numeral ? `${numeral} ` : ''}${withAdj(word, adj)}`;
  const definiteness = forms['definiteness'] ?? 'definite';
  if (possessive) {
    const fem = (forms['gender'] ?? 'masc') === 'fem';
    const article = defArticle(forms, plural);
    if (definiteness === 'all') {
      return `${plural ? (fem ? 'totes' : 'tots') : (fem ? 'tota' : 'tot')} ${article} ${possessive} ${noun}`;
    }
    if (definiteness === 'most') return `${plural ? 'la majoria de' : 'la major part de'} ${article} ${possessive} ${noun}`;
    if (keptBesidePossessive(forms)) {
      const det = artFor(artForms(forms, adj), plural);
      return det ? `${det} ${noun} ${possessive}` : `${noun} ${possessive}`;
    }
    return `${article} ${possessive} ${noun}`;
  }
  const af = artForms(forms, adj);
  return joinHead(artFor(af, plural), noun, af, adj, numeral);
}
