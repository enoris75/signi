import { COMPLEMENT_RENDER_ORDER, type ComplementType } from '@signi/shared';
import { adjString, pathSpecifier, type ConceptForms, type LanguageEngine, type ResolvedPhrase } from '../types.js';

function defArticle(forms: Record<string, string>, plural = false): string {
  const gender = forms['gender'] ?? 'masc';
  if (plural) return gender === 'fem' ? 'las' : 'los';
  return gender === 'fem' ? 'la' : 'el';
}

/** Spanish "de" (from) + article: de+el=del; otherwise "de la/los/las". */
function dePrep(forms: Record<string, string>, plural = false): string {
  const art = defArticle(forms, plural);
  if (art === 'el') return 'del';
  return `de ${art}`;
}

/**
 * Spanish "a" (to) + definite article contractions:
 * a+el=al (only masculine singular contracts)
 */
function datPrep(forms: Record<string, string>, plural = false): string {
  const art = defArticle(forms, plural);
  if (art === 'el') return 'al';
  return `a ${art}`;
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
  const a = adj ? ` ${adj}` : '';
  return `${defArticle(forms, plural)} ${word}${a}`;
}

function indirectNounPhrase(forms: Record<string, string>, adj?: string): string {
  const count = forms['number'] ?? forms['count'] ?? 'singular';
  const plural = count === 'plural';
  const word = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const a = adj ? ` ${adj}` : '';
  return `${datPrep(forms, plural)} ${word}${a}`;
}

function subjectPhrase(forms: Record<string, string>, adj?: string): string {
  if (forms['person']) {
    if (forms['number'] === 'plural' && forms['plural']) return forms['plural'];
    return forms['base'] ?? '';
  }
  return nounPhrase(forms, adj); // noun — definite article
}

/** route path relation → preposition (most are "de"-locutions: debajo del, …). */
function routeHead(c: ConceptForms, plural: boolean): string {
  switch (pathSpecifier(c)) {
    case 'under':       return `debajo ${dePrep(c.forms, plural)}`;
    case 'over':        return `por encima ${dePrep(c.forms, plural)}`;
    case 'around':      return `alrededor ${dePrep(c.forms, plural)}`;
    case 'behind':      return `detrás ${dePrep(c.forms, plural)}`;
    case 'in_front_of': return `delante ${dePrep(c.forms, plural)}`;
    case 'through':
    default:            return `por ${defArticle(c.forms, plural)}`;
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
      // locative→en, direction→a (al/a la), source→de (del/de la), route→path preposition
      const head =
        type === 'locative'  ? `en ${defArticle(c.forms, plural)}` :
        type === 'direction' ? datPrep(c.forms, plural) :
        type === 'source'    ? dePrep(c.forms, plural) :
        routeHead(c, plural);
      return `${head} ${word}`;
    })
    .filter(Boolean)
    .join(' ');
}

export const spanishEngine: LanguageEngine = {
  language: 'es',
  render(phrase: ResolvedPhrase): string {
    const { subject, subjectAdjective, subjectAdjective2, verb, verbNegative,
      directObject, directObjectAdjective, directObjectAdjective2,
      indirectObject, indirectObjectAdjective, indirectObjectAdjective2, modifier } = phrase;

    const subjectText = subjectPhrase(subject.forms, adjString(subjectAdjective, subjectAdjective2));
    const conjugated = conjugate(verb.forms, subject.forms);
    const verbText = verbNegative ? `no ${conjugated}` : conjugated;
    const directObjectText = directObject
      ? nounPhrase(directObject.forms, adjString(directObjectAdjective, directObjectAdjective2))
      : '';
    // S V Adv DirectObj IndirectObj(a+article)
    const indirectObjectText = indirectObject
      ? indirectNounPhrase(indirectObject.forms, adjString(indirectObjectAdjective, indirectObjectAdjective2))
      : '';
    const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
    // "nunca" goes pre-verbal without "no": "yo nunca bebo"
    // but post-verbal with "no": "yo no bebo nunca"
    const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
    const preVerb = (modifierIsNegative && !verbNegative) ? modifierText : '';
    const postVerb = (modifierIsNegative && !verbNegative) ? '' : modifierText;

    const complementsText = complementsPhrase(phrase.complements);

    return [subjectText, preVerb, verbText, postVerb, directObjectText, indirectObjectText, complementsText]
      .filter(Boolean)
      .join(' ')
      .trim();
  },
};
