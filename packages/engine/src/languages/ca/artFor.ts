import { defArticle } from './defArticle.js';
import { demonstrative } from './demonstrative.js';
import { indefArticle } from './indefArticle.js';
import { withApproximator } from '../../functions/withApproximator.js';

/**
 * The determiner for a subject/direct-object noun phrase, from its `definiteness` (default
 * 'definite'): the definite/indefinite article, nothing (bare), a demonstrative, or a quantifier
 * agreeing in gender (P03 §2.1). "tots els / totes les" carry the definite article; "cap" is singular
 * and invariable, and drives the verb's "no" upstream (negative concord). Every quantifier *(verify)*.
 */
export function artFor(forms: Record<string, string>, plural = false): string {
  // "almost all", "gairebé tots" (P09-E38): the approximator stands before whatever determiner is spelled.
  return withApproximator(forms, baseArtFor(forms, plural));
}

function baseArtFor(forms: Record<string, string>, plural = false): string {
  // Most place names go bare ("Europa"), whatever determiner was picked; a few are inherently
  // articled — "l'Àfrica", "el Japó" — and the lexeme says so (`takes_article`).
  if (forms['proper'] === '1') {
    return forms['takes_article'] === '1' ? defArticle(forms, plural) : '';
  }
  const definiteness = forms['definiteness'] ?? 'definite';
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  // A mass noun ("aigua") stays singular: "una mica d'aigua", "molta aigua", "tota l'aigua"; its
  // negative is "gens de" ("no hi ha gens d'aigua").
  if (forms['uncountable'] === '1') {
    switch (definiteness) {
      case 'bare':       return '';
      case 'indefinite': return '';
      case 'this':       return demonstrative(false, forms, false);
      case 'that':       return demonstrative(true, forms, false);
      case 'some':       return 'una mica de';
      case 'many':       return fem ? 'molta' : 'molt';
      case 'few':        return fem ? 'poca' : 'poc';
      case 'all':        return `${fem ? 'tota' : 'tot'} ${defArticle(forms, false)}`;
      case 'no':         return 'gens de';
      case 'each':
      case 'every':      return 'cada';
      case 'most':       return `la major part de ${defArticle(forms, false)}`;
      case 'enough':     return 'prou';
      case 'such':       return 'tal';
      default:           return defArticle(forms, false);
    }
  }
  switch (definiteness) {
    case 'bare':       return '';
    case 'indefinite': return indefArticle(forms, plural);
    case 'this':       return demonstrative(false, forms, plural);
    case 'that':       return demonstrative(true, forms, plural);
    case 'some':       return fem ? 'algunes' : 'alguns';
    case 'many':       return fem ? 'moltes' : 'molts';
    case 'few':        return fem ? 'poques' : 'pocs';
    case 'all':        return `${fem ? 'totes' : 'tots'} ${defArticle(forms, true)}`;
    // Invariable and singular (NO_TAKES_SINGULAR): "cap gat", "cap casa".
    case 'no':         return 'cap';
    // P09-E25. "cada" is invariable and singular; "tots dos / totes dues" (both) agree in gender;
    // "la majoria de" + the definite plural; "diversos / diverses"; "prou" is invariable; "tal(s)".
    case 'each':
    case 'every':      return 'cada';
    case 'both':       return fem ? 'totes dues' : 'tots dos';
    case 'most':       return `la majoria de ${defArticle(forms, true)}`;
    case 'several':    return fem ? 'diverses' : 'diversos';
    case 'enough':     return 'prou';
    case 'such':       return plural ? 'tals' : 'tal';
    default:           return defArticle(forms, plural);
  }
}
