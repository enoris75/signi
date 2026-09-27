import { defArticle } from './defArticle.js';
import { demonstrative } from './demonstrative.js';
import { indefArticle } from './indefArticle.js';
import { ingunForm } from './ingunForm.js';
import { prepArt } from './prepArt.js';
import { withApproximator } from '../../functions/withApproximator.js';

/**
 * The determiner for a subject/direct-object noun phrase, from its `definiteness` (default
 * 'definite'): the definite/indefinite article, nothing (bare), a demonstrative, or a quantifier
 * agreeing in gender. *ün / üna* and *ingün* are the style sheet's; every other quantifier is the
 * author's draft *(verify)*.
 */
export function vlArticle(forms: Record<string, string>, plural: boolean, lead: string): string {
  // "almost all", "bunamaing tuots" (P09-E38): the approximator stands before whatever determiner is spelled.
  return withApproximator(forms, baseArticle(forms, plural, lead));
}

function baseArticle(forms: Record<string, string>, plural: boolean, lead: string): string {
  // A proper noun takes the definite article where its lexeme does not say otherwise; a personal name
  // says `takes_article: '0'` ("sar Peider", C38).
  if (forms['proper'] === '1') return forms['takes_article'] === '0' ? '' : defArticle(forms, plural, lead);
  const definiteness = forms['definiteness'] ?? 'definite';
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  // A mass noun ("aua") stays singular: "bler'aua" is not written: "blera aua", "paca aua", "tuot
  // l'aua". Vallader has no partitive article, so `some` is "ün pa" (a little) and the indefinite is bare.
  if (forms['uncountable'] === '1') {
    switch (definiteness) {
      case 'bare':
      case 'indefinite': return '';
      case 'this':       return demonstrative(forms, false, 'this');
      case 'that':       return demonstrative(forms, false, 'that');
      case 'some':       return 'ün pa';
      case 'many':       return fem ? 'blera' : 'bler';
      case 'few':        return fem ? 'paca' : 'pac';
      case 'all':        return `${fem ? 'tuotta' : 'tuot'} ${defArticle(forms, false, lead)}`;
      case 'no':         return ingunForm(forms['gender'] ?? 'masc');
      case 'each':
      case 'every':      return 'mincha';
      case 'most':       return `la gronda part ${prepArt('da', forms, false, lead)}`;
      case 'enough':     return 'avuonda';
      case 'such':       return fem ? 'üna tala' : 'ün tal';
      default:           return defArticle(forms, false, lead);
    }
  }
  switch (definiteness) {
    case 'bare':       return '';
    // The indefinite plural is bare: "giats cuorran".
    case 'indefinite': return indefArticle(forms, plural);
    case 'this':       return demonstrative(forms, plural, 'this');
    case 'that':       return demonstrative(forms, plural, 'that');
    case 'some':       return fem ? 'qualchünas' : 'qualchüns';
    case 'many':       return fem ? 'bleras' : 'blers';
    case 'few':        return fem ? 'pacas' : 'pacs';
    case 'all':        return `${fem ? 'tuottas' : 'tuots'} ${defArticle(forms, true, lead)}`;
    case 'no':         return ingunForm(forms['gender'] ?? 'masc', plural);
    // P09-E25: "mincha" is invariant and singular (each and every share it); "tuots duos / tuottas
    // duas" keeps the definite article as "tuots" does; the partitive "most" is "la gronda part" + the
    // contracted *da*; "tal" agrees and takes the indefinite article in the singular.
    case 'each':
    case 'every':      return 'mincha';
    case 'both':       return `${fem ? 'tuottas duas' : 'tuots duos'} ${defArticle(forms, true, lead)}`;
    case 'most':       return `la gronda part ${prepArt('da', forms, true, lead)}`;
    case 'several':    return fem ? 'plüssas' : 'plüs';
    case 'enough':     return 'avuonda';
    case 'such':       return plural ? (fem ? 'talas' : 'tals') : fem ? 'üna tala' : 'ün tal';
    default:           return defArticle(forms, plural, lead);
  }
}
