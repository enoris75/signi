import type { Case, Slot } from './gsw.types.js';
import { questionPronoun } from './questionPronoun.js';
import { DEM_ENDINGS, WEAK_ENDINGS } from './gsw.consts.js';
import { defArticle } from './defArticle.js';
import { demForm } from './demForm.js';
import { indefArticle } from './indefArticle.js';
import { keinForm } from './keinForm.js';
import { relativePronoun } from './relativePronoun.js';
import { withApproximator } from '../../functions/withApproximator.js';
import { NEGATOR } from './nichtSlots.js';

/**
 * The determiner for a noun phrase, from its `definiteness` (default 'definite'), declined
 * for case — including the dative, which the motion/dative complements use (einem/einer,
 * keinem/keiner, diesem/jener, einigen/vielen/wenigen/allen), and the genitive, which the
 * object of a nominalised infinitive takes ("mit dem Wählen eines Wortes"). "kein" is
 * self-negating (no verb concord); einige/viele/wenige/alle are plural quantifiers.
 */
export function determiner(forms: Record<string, string>, _case: Case, plural: boolean): string {
  // "almost all", "quasi tutti" (P09-E38): the approximator stands before whatever determiner is spelled.
  const spelled = withApproximator(forms, baseDeterminer(forms, _case, plural));
  // A negated clause's "nicht", carried by an object's amount quantifier (A310, see `finiteNegation`):
  // "nicht viel Essen", "nicht genug Hunde".
  return forms['nicht_det'] === '1' && spelled ? `${NEGATOR} ${spelled}` : spelled;
}

function baseDeterminer(forms: Record<string, string>, _case: Case, plural: boolean): string {
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
  const meist = (pl: boolean) => `${defArticle(forms, _case, pl)} meischt${WEAK_ENDINGS[_case][slot(pl)]}`;
  // Mass nouns ("Wasser") stay singular and take the invariant mass quantifiers
  // "etwas / viel / wenig"; "all das Wasser"; no indefinite article.
  if (forms['uncountable'] === '1') {
    switch (definiteness) {
      case 'bare':        return '';
      case 'indefinite':  return '';                       // no "ein Wasser"
      case 'this':        return demForm(false, _case, gender, false);
      case 'that':        return demForm(true, _case, gender, false);
      case 'no':          return keinForm(_case, gender, false);
      case 'some':        return 'e chli';
      case 'many':        return 'vill';
      case 'few':         return 'wenig';
      case 'all':         return `all ${defArticle(forms, _case, false)}`;
      // P09-E25 on a mass noun: "jedes Wasser", "das meiste Wasser", the invariant "genug Wasser",
      // and "solches Wasser".
      case 'each':
      case 'every':       return derWord('jed', false);
      case 'most':        return meist(false);
      case 'enough':      return 'gnueg';
      case 'such':        return derWord('settig', false);
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
    // Swiss German's quantifiers barely decline: *es paar*, *vill* and *wenig* not at all, *alli* and
    // *beidi* take the dative *-ne* (*mit allne Chatze*). A genitive slot is the dative (P10 D7).
    case 'some': return 'es paar';
    case 'many': return 'vill';
    case 'few':  return 'wenig';
    case 'all':  return dat || gen ? 'allne' : 'alli';
    // P09-E25. jed- is a singular der-word ("jeder Kater", "jede Katze", "jedes Haus"); beide and
    // mehrere decline like alle and einige; "die meisten" is the definite article + weak "meist-";
    // "genug" is invariant. "such" is "so ein" in the singular ("so ein Kater", "so einen Kater")
    // and the der-word solch- in the plural ("solche Kater").
    case 'each':
    case 'every':   return derWord('jed', false);
    case 'both':    return dat || gen ? 'beidne' : 'beidi';
    case 'most':    return meist(true);
    case 'several': return dat || gen ? 'mehrere' : 'mehreri';
    case 'enough':  return 'gnueg';
    case 'such':    return plural ? derWord('settig', true) : `so ${indefArticle(_case, gender, false)}`;
    default:     return indefArticle(_case, gender, plural);
  }
}
