import type { LanguageEngine, ResolvedPhrase } from '../types.js';

function defArticle(forms: Record<string, string>, plural = false): string {
  const gender = forms['gender'] ?? 'masc';
  const base = (plural ? forms['plural'] : forms['base']) ?? '';
  if (gender === 'fem') return plural ? 'le' : 'la';
  if (!plural) return /^(s[^aeiou]|z|ps|gn|x|y)/i.test(base) ? 'lo' : 'il';
  return /^(s[^aeiou]|z|ps|gn|x|y)/i.test(base) ? 'gli' : 'i';
}

/**
 * Italian "a" (to) + definite article contractions:
 * a+il=al, a+lo=allo, a+la=alla, a+l'=all', a+i=ai, a+gli=agli, a+le=alle
 */
function datPrep(forms: Record<string, string>, plural = false): string {
  const art = defArticle(forms, plural);
  const base = (plural ? forms['plural'] : forms['base']) ?? '';
  const vowelStart = /^[aeiouàèéìòù]/i.test(base);
  if (art === "il") return "al";
  if (art === "lo") return "allo";
  if (art === "la") return vowelStart ? "all'" : "alla";
  if (art === "i") return "ai";
  if (art === "gli") return "agli";
  if (art === "le") return "alle";
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

function indirectNounPhrase(forms: Record<string, string>): string {
  const count = forms['number'] ?? forms['count'] ?? 'singular';
  const plural = count === 'plural';
  const word = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  return `${datPrep(forms, plural)} ${word}`;
}

function subjectPhrase(forms: Record<string, string>, adj?: string): string {
  if (forms['person']) {
    if (forms['number'] === 'plural' && forms['plural']) return forms['plural'];
    return forms['base'] ?? '';
  }
  return nounPhrase(forms, adj); // noun — definite article
}

export const italianEngine: LanguageEngine = {
  language: 'it',
  render(phrase: ResolvedPhrase): string {
    const { subject, subjectAdjective, verb, directObject, indirectObject, modifier } = phrase;

    const subjectText = subjectPhrase(subject.forms, subjectAdjective?.forms['base']);
    const verbText = conjugate(verb.forms, subject.forms);
    const directObjectText = directObject ? nounPhrase(directObject.forms) : '';
    // S V Adv DirectObj IndirectObj(a+article)
    const indirectObjectText = indirectObject ? indirectNounPhrase(indirectObject.forms) : '';
    const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';

    return [subjectText, verbText, modifierText, directObjectText, indirectObjectText]
      .filter(Boolean)
      .join(' ')
      .trim();
  },
};
