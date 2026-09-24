import type { Case, Slot } from './de.types.js';
import { questionPronoun } from './questionPronoun.js';
import { DEM_ENDINGS, WEAK_ENDINGS } from './de.consts.js';
import { defArticle } from './defArticle.js';
import { demForm } from './demForm.js';
import { indefArticle } from './indefArticle.js';
import { keinForm } from './keinForm.js';
import { relativePronoun } from './relativePronoun.js';

/**
 * The determiner for a noun phrase, from its `definiteness` (default 'definite'), declined
 * for case — including the dative, which the motion/dative complements use (einem/einer,
 * keinem/keiner, diesem/jener, einigen/vielen/wenigen/allen), and the genitive, which the
 * object of a nominalised infinitive takes ("mit dem Wählen eines Wortes"). "kein" is
 * self-negating (no verb concord); einige/viele/wenige/alle are plural quantifiers.
 */
export function determiner(forms: Record<string, string>, _case: Case, plural: boolean): string {
  // Most proper names go bare in German ("Afrika"), whatever determiner the user picked. But a
  // class of them is inherently articled — "die Antarktis", "die Schweiz", "die Türkei" — and that
  // is a property of the name, not a choice, so the lexicon marks it and the definite article wins.
  if (forms['proper'] === '1') {
    return forms['takes_article'] === '1' ? defArticle(forms, _case, plural) : '';
  }
  const definiteness = forms['definiteness'] ?? 'definite';
  if (definiteness === 'definite') return defArticle(forms, _case, plural);
  // The relativizer stand-in of a complement relative (see `relativeGapComplement`): "in dem", "mit denen".
  if (definiteness === 'relative') return relativePronoun(forms, _case, plural);
  // The question stand-in of a complement question (see `questionGapComplement`, P09-E15): *wer*
  // declined for a person — "mit wem", "über wen", the bare dative "wem" — and *was* for a thing,
  // which does not decline ("dank was"); a thing's compound with the preposition is `woCompound`'s.
  if (definiteness === 'question') return questionPronoun(forms, _case);
  const gender = forms['gender'] ?? 'neut';
  // The der-word endings (dies-/jen-'s) that jed- and solch- take (P09-E25), and the weak adjective
  // endings "meist-" declines with after the definite article ("die meisten", "das meiste Wasser").
  const slot = (pl: boolean): Slot => pl ? 'plural' : gender === 'masc' || gender === 'fem' ? gender : 'neut';
  const derWord = (stem: string, pl: boolean) => `${stem}${DEM_ENDINGS[_case][slot(pl)]}`;
  const meist = (pl: boolean) => `${defArticle(forms, _case, pl)} meist${WEAK_ENDINGS[_case][slot(pl)]}`;
  // Mass nouns ("Wasser") stay singular and take the invariant mass quantifiers
  // "etwas / viel / wenig"; "all das Wasser"; no indefinite article.
  if (forms['uncountable'] === '1') {
    switch (definiteness) {
      case 'bare':        return '';
      case 'indefinite':  return '';                       // no "ein Wasser"
      case 'this':        return demForm(false, _case, gender, false);
      case 'that':        return demForm(true, _case, gender, false);
      case 'no':          return keinForm(_case, gender, false);
      case 'some':        return 'etwas';
      case 'many':        return 'viel';
      case 'few':         return 'wenig';
      case 'all':         return `all ${defArticle(forms, _case, false)}`;
      // P09-E25 on a mass noun: "jedes Wasser", "das meiste Wasser", the invariant "genug Wasser",
      // and "solches Wasser".
      case 'each':
      case 'every':       return derWord('jed', false);
      case 'most':        return meist(false);
      case 'enough':      return 'genug';
      case 'such':        return derWord('solch', false);
      default:            return defArticle(forms, _case, false);
    }
  }
  // Dative plural quantifiers add -n (mit einigen/vielen/wenigen/allen Häusern); the genitive
  // takes -r (die Wahl einiger/vieler/weniger/aller Wörter).
  const dat = _case === 'dat';
  const gen = _case === 'gen';
  switch (definiteness) {
    case 'bare': return '';
    case 'this': return demForm(false, _case, gender, plural);
    case 'that': return demForm(true, _case, gender, plural);
    case 'no':   return keinForm(_case, gender, plural);
    case 'some': return dat ? 'einigen' : gen ? 'einiger' : 'einige';
    case 'many': return dat ? 'vielen'  : gen ? 'vieler'  : 'viele';
    case 'few':  return dat ? 'wenigen' : gen ? 'weniger' : 'wenige';
    case 'all':  return dat ? 'allen'   : gen ? 'aller'   : 'alle';
    // P09-E25. jed- is a singular der-word ("jeder Kater", "jede Katze", "jedes Haus"); beide and
    // mehrere decline like alle and einige; "die meisten" is the definite article + weak "meist-";
    // "genug" is invariant. "such" is "so ein" in the singular ("so ein Kater", "so einen Kater")
    // and the der-word solch- in the plural ("solche Kater").
    case 'each':
    case 'every':   return derWord('jed', false);
    case 'both':    return dat ? 'beiden'   : gen ? 'beider'   : 'beide';
    case 'most':    return meist(true);
    case 'several': return dat ? 'mehreren' : gen ? 'mehrerer' : 'mehrere';
    case 'enough':  return 'genug';
    case 'such':    return plural ? derWord('solch', true) : `so ${indefArticle(_case, gender, false)}`;
    default:     return indefArticle(_case, gender, plural);
  }
}
