import { defArticle } from './defArticle.js';
import { indefArticle } from './indefArticle.js';
import { nessunForm } from './nessunForm.js';
import { prepArt } from './prepArt.js';
import { quelloForm } from './quelloForm.js';
import { questoForm } from './questoForm.js';

/**
 * The determiner for a subject/direct-object noun phrase, from its `definiteness`
 * (default 'definite'): the definite/indefinite article, nothing (bare), a demonstrative,
 * or a quantifier agreeing in gender (and, for "tutti/e", carrying the definite article).
 */
export function artFor(forms: Record<string, string>, plural: boolean, lead: string): string {
  // A proper noun (l'Africa) always takes the definite article in Italian, whatever
  // determiner the user picked; it is a property of the name, not a choice.
  if (forms['proper'] === '1') return defArticle(forms, plural, lead);
  const definiteness = forms['definiteness'] ?? 'definite';
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  // Mass nouns ("acqua") stay singular and take the partitive / singular quantifiers:
  // "dell'acqua", "molta acqua", "poca acqua", "tutta l'acqua".
  if (forms['uncountable'] === '1') {
    switch (definiteness) {
      case 'bare':       return '';
      case 'indefinite': return '';                                   // bare: "bevo acqua"
      case 'this':       return questoForm(forms, false, lead);
      case 'that':       return quelloForm(forms, false, lead);
      case 'some':       return prepArt('di', forms, false, lead);    // partitive: "dell'acqua"
      case 'many':       return fem ? 'molta' : 'molto';
      case 'few':        return fem ? 'poca' : 'poco';
      case 'all':        return `${fem ? 'tutta' : 'tutto'} ${defArticle(forms, false, lead)}`;
      case 'no':         return nessunForm(forms['gender'] ?? 'masc', lead);
      default:           return defArticle(forms, false, lead);
    }
  }
  switch (definiteness) {
    case 'bare':       return '';
    case 'indefinite': return indefArticle(forms, plural, lead);
    case 'this':       return questoForm(forms, plural, lead);
    case 'that':       return quelloForm(forms, plural, lead);
    case 'some':       return fem ? 'alcune' : 'alcuni';
    case 'many':       return fem ? 'molte' : 'molti';
    case 'few':        return fem ? 'poche' : 'pochi';
    case 'all':        return `${fem ? 'tutte' : 'tutti'} ${defArticle(forms, true, lead)}`;
    case 'no':         return nessunForm(forms['gender'] ?? 'masc', lead);
    default:           return defArticle(forms, plural, lead);
  }
}
