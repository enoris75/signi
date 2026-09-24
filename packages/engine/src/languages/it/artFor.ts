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
  // A proper noun (l'Africa) always takes the definite article in Italian, whatever determiner the
  // user picked; it is a property of the name, not a choice. A personal name is the exception —
  // "Pietro", never "il Pietro" — which its forms mark with `takes_article: '0'` (C38).
  if (forms['proper'] === '1') return forms['takes_article'] === '0' ? '' : defArticle(forms, plural, lead);
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
      // P09-E25 on a mass noun: "ogni acqua", "la maggior parte dell'acqua", "abbastanza acqua",
      // "un tale coraggio". (`both` and `several` never reach here: a mass noun resolves them to the
      // definite and `some`, see `resolveNounPhrase`.)
      case 'each':
      case 'every':      return 'ogni';
      case 'most':       return `la maggior parte ${prepArt('di', forms, false, lead)}`;
      case 'enough':     return 'abbastanza';
      case 'such':       return `${indefArticle(forms, false, 'tale')} tale`;
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
    // P09-E25. "ogni" is invariant and singular (each and every share it); "entrambi/e" keeps the
    // definite article as "tutti" does; the partitive "most" is a fixed "la maggior parte" + the
    // definite genitive ("dei gatti", "degli uccelli", "delle case"); "tale" takes the indefinite
    // article in the singular ("un tale gatto", "una tale casa") and none in the plural ("tali gatti").
    case 'each':
    case 'every':      return 'ogni';
    case 'both':       return `${fem ? 'entrambe' : 'entrambi'} ${defArticle(forms, true, lead)}`;
    case 'most':       return `la maggior parte ${prepArt('di', forms, true, lead)}`;
    case 'several':    return fem ? 'parecchie' : 'parecchi';
    case 'enough':     return 'abbastanza';
    case 'such':       return plural ? 'tali' : `${indefArticle(forms, false, 'tale')} tale`;
    default:           return defArticle(forms, plural, lead);
  }
}
