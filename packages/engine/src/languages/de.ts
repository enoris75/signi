import { COMPLEMENT_RENDER_ORDER, type ComplementType } from '@signi/shared';
import { npAdj, pathSpecifier, type ResolvedComplement, type LanguageEngine, type ResolvedPhrase } from '../types.js';

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
function routeHead(c: ResolvedComplement, plural: boolean): string {
  const f = c.phrase.head.forms;
  switch (pathSpecifier(c)) {
    case 'under':       return `unter ${defArticle(f, 'dat', plural)}`;
    case 'over':        return `über ${defArticle(f, 'dat', plural)}`;
    case 'around':      return `um ${defArticle(f, 'acc', plural)}`;
    case 'behind':      return `hinter ${defArticle(f, 'dat', plural)}`;
    case 'in_front_of': return `vor ${defArticle(f, 'dat', plural)}`;
    case 'through':
    default:            return `durch ${defArticle(f, 'acc', plural)}`;
  }
}

function complementsPhrase(complements?: Partial<Record<ComplementType, ResolvedComplement>>): string {
  if (!complements) return '';
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      const f = c.phrase.head.forms;
      const plural = (f['number'] ?? f['count']) === 'plural';
      const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
      const a = npAdj(c.phrase);
      const adj = a ? `${a} ` : '';
      // route → path preposition (+ its case); locative/direction/source → two-way
      // preps + dative with the usual in+dem=im, zu+dem=zum, zu+der=zur fusions.
      let head: string;
      if (type === 'route') {
        head = routeHead(c, plural);
      } else {
        const art = defArticle(f, 'dat', plural); // dem / der / den
        if (type === 'locative')  head = art === 'dem' ? 'im' : `in ${art}`;
        else if (type === 'direction') head = art === 'dem' ? 'zum' : art === 'der' ? 'zur' : `zu ${art}`;
        else /* source */         head = `aus ${art}`;
      }
      return `${head} ${adj}${word}`;
    })
    .filter(Boolean)
    .join(' ');
}

export const germanEngine: LanguageEngine = {
  language: 'de',
  render(phrase: ResolvedPhrase): string {
    const { subject, verbPhrase, directObject, indirectObject } = phrase;
    const { verb, negative: verbNegative, modifier } = verbPhrase;

    const subjectText = subjectPhrase(subject.head.forms, npAdj(subject));
    const verbText = conjugate(verb.forms, subject.head.forms);
    const directObjectText = directObject
      ? nounPhrase(directObject.head.forms, 'acc', npAdj(directObject))
      : '';
    // German: dative (indirect) comes BEFORE accusative (direct) when both are noun phrases
    const indirectObjectText = indirectObject
      ? nounPhrase(indirectObject.head.forms, 'dat', npAdj(indirectObject))
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
