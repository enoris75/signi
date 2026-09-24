import { defArticle } from './defArticle.js';
import { demArticle } from './demArticle.js';
import { dePrep } from './dePrep.js';
import { elidesBefore } from './elidesBefore.js';
import { indefArticle } from './indefArticle.js';
import { withApproximator } from '../../functions/withApproximator.js';

/**
 * The determiner for a subject/direct-object noun phrase, from its `definiteness`
 * (default 'definite'): the definite/indefinite article, nothing (bare), the demonstrative,
 * or a quantifier. "beaucoup/peu de" take a bare noun (the "de" elides before a vowel);
 * "tous/toutes les" carry the definite article; "aucun/e" is singular and drives verb
 * negation ("ne") upstream.
 */
export function artFor(forms: Record<string, string>, plural: boolean, lead: string): string {
  // "almost all", "quasi tutti" (P09-E38): the approximator stands before whatever determiner is spelled.
  return withApproximator(forms, baseArtFor(forms, plural, lead));
}

function baseArtFor(forms: Record<string, string>, plural: boolean, lead: string): string {
  // A proper noun (l'Afrique) always takes the definite article in French, whatever determiner the
  // user picked; it is a property of the name, not a choice. A personal name is the exception —
  // "Pierre", never "le Pierre" — which its forms mark with `takes_article: '0'` (C38).
  if (forms['proper'] === '1') return forms['takes_article'] === '0' ? '' : defArticle(forms, plural, lead);
  const definiteness = forms['definiteness'] ?? 'definite';
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  const de = elidesBefore(forms, lead) ? "d'" : 'de';
  // Mass nouns ("eau") stay singular and take the partitive "de l'/du/de la" for
  // some/indefinite; "beaucoup/peu de" already work; "all" → "tout/toute" + article.
  if (forms['uncountable'] === '1') {
    switch (definiteness) {
      case 'bare':       return '';
      case 'indefinite': return dePrep(forms, false, lead);   // partitive: "de l'eau"
      case 'this':
      case 'that':       return demArticle(forms, false, lead);
      case 'some':       return dePrep(forms, false, lead);   // partitive: "de l'eau"
      case 'many':       return `beaucoup ${de}`;
      case 'few':        return `peu ${de}`;
      case 'all':        return `${fem ? 'toute' : 'tout'} ${defArticle(forms, false, lead)}`;
      case 'no':         return fem ? 'aucune' : 'aucun';
      // P09-E25 on a mass noun: "chaque eau", "la plus grande partie de l'eau" (la plupart is the
      // count noun's), "assez d'eau", "une telle nourriture".
      case 'each':
      case 'every':      return 'chaque';
      case 'most':       return `la plus grande partie ${dePrep(forms, false, lead)}`;
      case 'enough':     return `assez ${de}`;
      case 'such':       return `${indefArticle(forms, false)} ${fem ? 'telle' : 'tel'}`;
      default:           return defArticle(forms, false, lead);
    }
  }
  switch (definiteness) {
    case 'bare':       return '';
    // Written French drops the plural "des" to "de" before an adjective that precedes the noun:
    // "d'autres chats", "de grands chats". The noun leading means no adjective stands in between.
    // A counted phrase has none: the numeral takes the indefinite article's place outright (C31,
    // A292) — "avec trois chiens", never the "de" a prenominal adjective would call for.
    case 'indefinite': return forms['numeral'] !== undefined ? ''
      : plural && lead !== (forms['plural'] ?? forms['base']) ? de : indefArticle(forms, plural);
    case 'this':
    case 'that':       return demArticle(forms, plural, lead);
    case 'some':       return 'quelques';
    case 'many':       return `beaucoup ${de}`;
    case 'few':        return `peu ${de}`;
    case 'all':        return `${fem ? 'toutes' : 'tous'} ${defArticle(forms, true, lead)}`;
    // Singular (NO_TAKES_SINGULAR), but for a plurale tantum: "aucunes nouvelles".
    case 'no':         return plural ? (fem ? 'aucunes' : 'aucuns') : fem ? 'aucune' : 'aucun';
    // P09-E25. "chaque" is invariant and singular (each and every share it); "les deux" is the
    // article + the numeral (fused by a preposition: "aux deux chats", "des deux chats", see `aDet` /
    // `deDet`); "la plupart" + the definite genitive; "plusieurs" is invariant; "assez de" works like
    // "beaucoup de"; "tel" is an adjective before the noun, with the indefinite article in the
    // singular ("un tel chat") and "de" in the plural ("de tels chats", as "de grands chats").
    case 'each':
    case 'every':      return 'chaque';
    case 'both':       return 'les deux';
    case 'most':       return `la plupart ${dePrep(forms, true, lead)}`;
    case 'several':    return 'plusieurs';
    case 'enough':     return `assez ${de}`;
    case 'such':       return plural ? `de ${fem ? 'telles' : 'tels'}` : `${indefArticle(forms, false)} ${fem ? 'telle' : 'tel'}`;
    default:           return defArticle(forms, plural, lead);
  }
}
