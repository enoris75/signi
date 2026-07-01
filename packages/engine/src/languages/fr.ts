import { COMPLEMENT_RENDER_ORDER, type ComplementType } from '@signi/shared';
import { adjString, pathSpecifier, type ConceptForms, type LanguageEngine, type ResolvedPhrase } from '../types.js';

function defArticle(forms: Record<string, string>, plural = false): string {
  const gender = forms['gender'] ?? 'masc';
  if (plural) return 'les';
  const base = forms['base'] ?? '';
  if (/^[aeiouéèêëàâîïôùûü]/i.test(base)) return "l'";
  return gender === 'fem' ? 'la' : 'le';
}

/**
 * French "à" (to) + definite article contractions:
 * à+le=au, à+les=aux, à+la=à la, à+l'=à l'
 */
function datPrep(forms: Record<string, string>, plural = false): string {
  const art = defArticle(forms, plural);
  if (art === 'le') return 'au';
  if (art === 'les') return 'aux';
  return `à ${art}`; // "à la", "à l'"
}

/**
 * French "de" (from) + definite article contractions:
 * de+le=du, de+les=des, de+la=de la, de+l'=de l'
 */
function dePrep(forms: Record<string, string>, plural = false): string {
  const art = defArticle(forms, plural);
  if (art === 'le') return 'du';
  if (art === 'les') return 'des';
  return `de ${art}`; // "de la", "de l'"
}

function conjugate(forms: Record<string, string>, subjectForms: Record<string, string>): string {
  const person = subjectForms['person'] ?? '3';
  const number = subjectForms['number'] ?? 'singular';
  const key = `${person}${number === 'plural' ? 'pl' : 'sg'}_present`;
  return forms[key] ?? forms['base'] ?? '';
}

function nounPhrase(forms: Record<string, string>, adj?: string): string {
  const count = forms['number'] ?? forms['count'] ?? 'singular';
  const plural = count === 'plural';
  const word = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const a = adj ? `${adj} ` : '';
  return `${defArticle(forms, plural)} ${a}${word}`;
}

function indirectNounPhrase(forms: Record<string, string>, adj?: string): string {
  const count = forms['number'] ?? forms['count'] ?? 'singular';
  const plural = count === 'plural';
  const word = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const a = adj ? `${adj} ` : '';
  return `${datPrep(forms, plural)} ${a}${word}`;
}

function subjectPhrase(forms: Record<string, string>, adj?: string): string {
  if (forms['person']) {
    if (forms['number'] === 'plural' && forms['plural']) return forms['plural'];
    return forms['base'] ?? '';
  }
  return nounPhrase(forms, adj); // noun — definite article
}

/** route path relation → preposition (+ "de"-contraction for those governing "de"). */
function routeHead(c: ConceptForms, plural: boolean): string {
  const art = defArticle(c.forms, plural);
  switch (pathSpecifier(c)) {
    case 'under':       return `sous ${art}`;
    case 'over':        return `au-dessus ${dePrep(c.forms, plural)}`;
    case 'around':      return `autour ${dePrep(c.forms, plural)}`;
    case 'behind':      return `derrière ${art}`;
    case 'in_front_of': return `devant ${art}`;
    case 'through':
    default:            return `à travers ${art}`;
  }
}

function complementsPhrase(complements?: Partial<Record<ComplementType, ConceptForms>>): string {
  if (!complements) return '';
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      const plural = (c.forms['number'] ?? c.forms['count']) === 'plural';
      const word = plural ? (c.forms['plural'] ?? c.forms['base'] ?? '') : (c.forms['base'] ?? '');
      // locative→dans, direction→à (au/aux/à la), source→de (du/des/de la), route→path preposition
      const head =
        type === 'locative'  ? `dans ${defArticle(c.forms, plural)}` :
        type === 'direction' ? datPrep(c.forms, plural) :
        type === 'source'    ? dePrep(c.forms, plural) :
        routeHead(c, plural);
      return `${head} ${word}`;
    })
    .filter(Boolean)
    .join(' ');
}

export const frenchEngine: LanguageEngine = {
  language: 'fr',
  render(phrase: ResolvedPhrase): string {
    const { subject, subjectAdjective, subjectAdjective2, verb, verbNegative,
      directObject, directObjectAdjective, directObjectAdjective2,
      indirectObject, indirectObjectAdjective, indirectObjectAdjective2, modifier } = phrase;

    const subjectText = subjectPhrase(subject.forms, adjString(subjectAdjective, subjectAdjective2));
    const conjugated = conjugate(verb.forms, subject.forms);
    const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
    // "jamais" uses ne...jamais (replaces "pas"), even without verbNegative
    const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
    let effectiveVerb: string;
    let effectiveMod: string;
    if (modifierIsNegative) {
      effectiveVerb = `ne ${conjugated} ${modifierText}`;
      effectiveMod = '';
    } else if (verbNegative) {
      effectiveVerb = `ne ${conjugated} pas`;
      effectiveMod = modifierText;
    } else {
      effectiveVerb = conjugated;
      effectiveMod = modifierText;
    }
    const directObjectText = directObject
      ? nounPhrase(directObject.forms, adjString(directObjectAdjective, directObjectAdjective2))
      : '';
    // S V [Adv] DirectObj IndirectObj(à+article)
    const indirectObjectText = indirectObject
      ? indirectNounPhrase(indirectObject.forms, adjString(indirectObjectAdjective, indirectObjectAdjective2))
      : '';

    const complementsText = complementsPhrase(phrase.complements);

    return [subjectText, effectiveVerb, effectiveMod, directObjectText, indirectObjectText, complementsText]
      .filter(Boolean)
      .join(' ')
      .trim();
  },
};
