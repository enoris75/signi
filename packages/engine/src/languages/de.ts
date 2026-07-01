import { COMPLEMENT_RENDER_ORDER, type ComplementType } from '@signi/shared';
import { adjString, pathSpecifier, type ConceptForms, type LanguageEngine, type ResolvedPhrase } from '../types.js';

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

// route path relation → preposition + article. durch/um govern accusative;
// the static-relation two-way preps (unter/über/hinter/vor) take dative here.
function routeHead(c: ConceptForms, plural: boolean): string {
  switch (pathSpecifier(c)) {
    case 'under':       return `unter ${defArticle(c.forms, 'dat', plural)}`;
    case 'over':        return `über ${defArticle(c.forms, 'dat', plural)}`;
    case 'around':      return `um ${defArticle(c.forms, 'acc', plural)}`;
    case 'behind':      return `hinter ${defArticle(c.forms, 'dat', plural)}`;
    case 'in_front_of': return `vor ${defArticle(c.forms, 'dat', plural)}`;
    case 'through':
    default:            return `durch ${defArticle(c.forms, 'acc', plural)}`;
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
      // route → path preposition (+ its case); locative/direction/source → two-way
      // preps + dative with the usual in+dem=im, zu+dem=zum, zu+der=zur fusions.
      let head: string;
      if (type === 'route') {
        head = routeHead(c, plural);
      } else {
        const art = defArticle(c.forms, 'dat', plural); // dem / der / den
        if (type === 'locative')  head = art === 'dem' ? 'im' : `in ${art}`;
        else if (type === 'direction') head = art === 'dem' ? 'zum' : art === 'der' ? 'zur' : `zu ${art}`;
        else /* source */         head = `aus ${art}`;
      }
      return `${head} ${word}`;
    })
    .filter(Boolean)
    .join(' ');
}

export const germanEngine: LanguageEngine = {
  language: 'de',
  render(phrase: ResolvedPhrase): string {
    const { subject, subjectAdjective, subjectAdjective2, verb, verbNegative,
      directObject, directObjectAdjective, directObjectAdjective2,
      indirectObject, indirectObjectAdjective, indirectObjectAdjective2, modifier } = phrase;

    const subjectText = subjectPhrase(subject.forms, adjString(subjectAdjective, subjectAdjective2));
    const verbText = conjugate(verb.forms, subject.forms);
    const directObjectText = directObject
      ? nounPhrase(directObject.forms, 'acc', adjString(directObjectAdjective, directObjectAdjective2))
      : '';
    // German: dative (indirect) comes BEFORE accusative (direct) when both are noun phrases
    const indirectObjectText = indirectObject
      ? nounPhrase(indirectObject.forms, 'dat', adjString(indirectObjectAdjective, indirectObjectAdjective2))
      : '';
    const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';

    // "nicht" precedes the modifier when one exists ("nicht immer"),
    // otherwise trails after objects ("das Brot nicht").
    // Skip "nicht" when the modifier is already negative ("nie" = never).
    const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
    const applyNicht = verbNegative && !modifierIsNegative;
    const negBefore = applyNicht && modifierText ? 'nicht' : '';
    const negAfter  = applyNicht && !modifierText ? 'nicht' : '';
    const complementsText = complementsPhrase(phrase.complements);
    return [subjectText, verbText, negBefore, modifierText, indirectObjectText, directObjectText, complementsText, negAfter]
      .filter(Boolean).join(' ').trim();
  },
};
