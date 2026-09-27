import { defArticle } from './defArticle.js';
import { demonstrative } from './demonstrative.js';
import { indefArticle } from './indefArticle.js';
import { neginForm } from './neginForm.js';
import { prepArt } from './prepArt.js';
import { withApproximator } from '../../functions/withApproximator.js';

/**
 * The determiner for a subject/direct-object noun phrase, from its `definiteness` (default
 * 'definite'): the definite/indefinite article, nothing (bare), a demonstrative, or a quantifier
 * agreeing in gender. The style sheet names none of the quantifiers; every one is the implementer's
 * Sursilvan *(verify)* — *entgins* (some), *biars* (many), *paucs* (few), *tuts ils* (all), *negin*
 * (no), *mintga* (each), *omisdus ils* (both), *plirs* (several), *avunda* (enough), *in tal* (such),
 * *la gronda part dils* (most), *empau* (a little of a mass).
 */
export function sursilvArticle(forms: Record<string, string>, plural: boolean, lead: string): string {
  // "almost all", "bunamein tuts" (P09-E38): the approximator stands before whatever determiner is spelled.
  return withApproximator(forms, baseArticle(forms, plural, lead));
}

function baseArticle(forms: Record<string, string>, plural: boolean, lead: string): string {
  // A proper noun takes the definite article where its lexeme does not say otherwise; a personal name
  // says `takes_article: '0'` ("Peder", C38).
  if (forms['proper'] === '1') return forms['takes_article'] === '0' ? '' : defArticle(forms, plural, lead);
  const definiteness = forms['definiteness'] ?? 'definite';
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  // A mass noun ("aua") stays singular: "bia aua", "pauca aua", "tutta l'aua". Sursilvan has no
  // partitive article, so `some` is "empau" (a little, style sheet) and the indefinite is bare.
  if (forms['uncountable'] === '1') {
    switch (definiteness) {
      case 'bare':
      case 'indefinite': return '';
      case 'this':       return demonstrative(forms, false, 'this');
      case 'that':       return demonstrative(forms, false, 'that');
      case 'some':       return 'empau';
      case 'many':       return 'bia';
      case 'few':        return fem ? 'pauca' : 'pauc';
      case 'all':        return `${fem ? 'tutta' : 'tut'} ${defArticle(forms, false, lead)}`;
      case 'no':         return neginForm(forms['gender'] ?? 'masc');
      case 'each':
      case 'every':      return 'mintga';
      case 'most':       return `la gronda part ${prepArt('da', forms, false, lead)}`;
      case 'enough':     return 'avunda';
      case 'such':       return fem ? 'ina tala' : 'in tal';
      default:           return defArticle(forms, false, lead);
    }
  }
  switch (definiteness) {
    case 'bare':       return '';
    // The indefinite plural is bare: "gats curran".
    case 'indefinite': return indefArticle(forms, plural, lead);
    case 'this':       return demonstrative(forms, plural, 'this');
    case 'that':       return demonstrative(forms, plural, 'that');
    case 'some':       return fem ? 'entginas' : 'entgins';
    case 'many':       return fem ? 'biaras' : 'biars';
    case 'few':        return fem ? 'paucas' : 'paucs';
    case 'all':        return `${fem ? 'tuttas' : 'tuts'} ${defArticle(forms, true, lead)}`;
    case 'no':         return neginForm(forms['gender'] ?? 'masc', plural);
    // "mintga" is invariant and singular (each and every share it); "omisdus / omisduas" keeps the
    // definite article as "tuts" does; the partitive "most" is "la gronda part" + the contracted *da*;
    // "tal" agrees and takes the indefinite article in the singular.
    case 'each':
    case 'every':      return 'mintga';
    case 'both':       return `${fem ? 'omisduas' : 'omisdus'} ${defArticle(forms, true, lead)}`;
    case 'most':       return `la gronda part ${prepArt('da', forms, true, lead)}`;
    case 'several':    return fem ? 'pliras' : 'plirs';
    case 'enough':     return 'avunda';
    case 'such':       return plural ? (fem ? 'talas' : 'tals') : fem ? 'ina tala' : 'in tal';
    default:           return defArticle(forms, plural, lead);
  }
}
