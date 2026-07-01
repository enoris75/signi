import { COMPLEMENT_RENDER_ORDER, type ComplementType } from '@signi/shared';
import { adjString, pathSpecifier, type ConceptForms, type LanguageEngine, type ResolvedPhrase } from '../types.js';

function defArticle(forms: Record<string, string>, plural = false): string {
  const gender = forms['gender'] ?? 'masc';
  if (plural) return gender === 'fem' ? 'as' : 'os';
  return gender === 'fem' ? 'a' : 'o';
}

/** Portuguese "em" (in) + article: em+o=no, em+a=na, em+os=nos, em+as=nas. */
function emPrep(forms: Record<string, string>, plural = false): string {
  const art = defArticle(forms, plural);
  return ({ o: 'no', a: 'na', os: 'nos', as: 'nas' } as Record<string, string>)[art] ?? `em ${art}`;
}

/** Portuguese "de" (from) + article: de+o=do, de+a=da, de+os=dos, de+as=das. */
function dePrep(forms: Record<string, string>, plural = false): string {
  const art = defArticle(forms, plural);
  return ({ o: 'do', a: 'da', os: 'dos', as: 'das' } as Record<string, string>)[art] ?? `de ${art}`;
}

/** Portuguese "por" (through) + article: por+o=pelo, por+a=pela, … */
function porPrep(forms: Record<string, string>, plural = false): string {
  const art = defArticle(forms, plural);
  return ({ o: 'pelo', a: 'pela', os: 'pelos', as: 'pelas' } as Record<string, string>)[art] ?? `por ${art}`;
}

/**
 * Portuguese "a" (to) + definite article contractions:
 * a+o=ao, a+a=à, a+os=aos, a+as=às
 */
function datPrep(forms: Record<string, string>, plural = false): string {
  const art = defArticle(forms, plural);
  if (art === 'o') return 'ao';
  if (art === 'a') return 'à';
  if (art === 'os') return 'aos';
  if (art === 'as') return 'às';
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

/** route path relation → preposition (most are "de"-locutions: debaixo do, …). */
function routeHead(c: ConceptForms, plural: boolean): string {
  switch (pathSpecifier(c)) {
    case 'under':       return `debaixo ${dePrep(c.forms, plural)}`;
    case 'over':        return `por cima ${dePrep(c.forms, plural)}`;
    case 'around':      return `ao redor ${dePrep(c.forms, plural)}`;
    case 'behind':      return `atrás ${dePrep(c.forms, plural)}`;
    case 'in_front_of': return `em frente ${dePrep(c.forms, plural)}`;
    case 'through':
    default:            return porPrep(c.forms, plural);
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
      // locative→em (no/na), direction→a (ao/à), source→de (do/da), route→path preposition
      const head =
        type === 'locative'  ? emPrep(c.forms, plural) :
        type === 'direction' ? datPrep(c.forms, plural) :
        type === 'source'    ? dePrep(c.forms, plural) :
        routeHead(c, plural);
      return `${head} ${word}`;
    })
    .filter(Boolean)
    .join(' ');
}

export const portugueseEngine: LanguageEngine = {
  language: 'pt',
  render(phrase: ResolvedPhrase): string {
    const { subject, subjectAdjective, subjectAdjective2, verb, verbNegative,
      directObject, directObjectAdjective, directObjectAdjective2,
      indirectObject, indirectObjectAdjective, indirectObjectAdjective2, modifier } = phrase;

    const subjectText = subjectPhrase(subject.forms, adjString(subjectAdjective, subjectAdjective2));
    const conjugated = conjugate(verb.forms, subject.forms);
    const verbText = verbNegative ? `não ${conjugated}` : conjugated;
    const directObjectText = directObject
      ? nounPhrase(directObject.forms, adjString(directObjectAdjective, directObjectAdjective2))
      : '';
    // S V Adv DirectObj IndirectObj(a+article)
    const indirectObjectText = indirectObject
      ? indirectNounPhrase(indirectObject.forms, adjString(indirectObjectAdjective, indirectObjectAdjective2))
      : '';
    const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
    // "nunca" goes pre-verbal without "não": "eu nunca bebo"
    // but post-verbal with "não": "eu não bebo nunca"
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
