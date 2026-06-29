import type { LanguageEngine, ResolvedPhrase } from '../types.js';

function defArticle(forms: Record<string, string>, _case: 'nom' | 'acc' | 'dat', plural = false): string {
  if (plural) return _case === 'dat' ? 'den' : 'die';
  const gender = forms['gender'] ?? 'neut';
  if (_case === 'nom') {
    return gender === 'masc' ? 'der' : gender === 'fem' ? 'die' : 'das';
  }
  if (_case === 'acc') {
    return gender === 'masc' ? 'den' : gender === 'fem' ? 'die' : 'das';
  }
  // dative
  return gender === 'masc' ? 'dem' : gender === 'fem' ? 'der' : 'dem';
}

function conjugate(forms: Record<string, string>, subjectForms: Record<string, string>): string {
  const person = subjectForms['person'] ?? '3';
  const number = subjectForms['number'] ?? 'singular';
  const key = `${person}${number === 'plural' ? 'pl' : 'sg'}_present`;
  return forms[key] ?? forms['base'] ?? '';
}

function nounPhrase(forms: Record<string, string>, _case: 'nom' | 'acc' | 'dat', adj?: string): string {
  const count = forms['number'] ?? forms['count'] ?? 'singular';
  const plural = count === 'plural';
  const word = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const a = adj ? `${adj} ` : '';
  return `${defArticle(forms, _case, plural)} ${a}${word}`;
}

function subjectPhrase(forms: Record<string, string>, adj?: string): string {
  if (forms['person']) {
    if (forms['number'] === 'plural' && forms['plural']) return forms['plural'];
    return forms['base'] ?? '';
  }
  return nounPhrase(forms, 'nom', adj); // noun — nominative article
}

export const germanEngine: LanguageEngine = {
  language: 'de',
  render(phrase: ResolvedPhrase): string {
    const { subject, subjectAdjective, verb, directObject, indirectObject, modifier } = phrase;

    const subjectText = subjectPhrase(subject.forms, subjectAdjective?.forms['base']);
    const verbText = conjugate(verb.forms, subject.forms);
    const directObjectText = directObject ? nounPhrase(directObject.forms, 'acc') : '';
    // German: dative (indirect) comes BEFORE accusative (direct) when both are noun phrases
    const indirectObjectText = indirectObject ? nounPhrase(indirectObject.forms, 'dat') : '';
    const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';

    // S V Adv IndObj(dat) DirectObj(acc)
    return [subjectText, verbText, modifierText, indirectObjectText, directObjectText]
      .filter(Boolean)
      .join(' ')
      .trim();
  },
};
