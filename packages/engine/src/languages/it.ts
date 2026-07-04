import { COMPLEMENT_RENDER_ORDER, type ComplementType } from '@signi/shared';
import { npAdj, pathSpecifier, type ResolvedComplement, type LanguageEngine, type ResolvedPhrase } from '../types.js';

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

/**
 * Generic Italian simple-preposition + definite-article fusion for "a" (to),
 * "da" (from) and "in" (in): al/dal/nel, allo/dallo/nello, alla/dalla/nella, …
 */
function prepArt(prep: 'a' | 'da' | 'in', forms: Record<string, string>, plural = false): string {
  const art = defArticle(forms, plural);
  const word = (plural ? forms['plural'] : forms['base']) ?? '';
  const vowelStart = /^[aeiouàèéìòù]/i.test(word);
  const prefix = prep === 'a' ? 'a' : prep === 'da' ? 'da' : 'ne';
  let suffix: string;
  switch (art) {
    case 'il':  suffix = 'l'; break;
    case 'lo':  suffix = 'llo'; break;
    case 'la':  suffix = vowelStart ? "ll'" : 'lla'; break;
    case 'i':   suffix = 'i'; break;
    case 'gli': suffix = 'gli'; break;
    case 'le':  suffix = 'lle'; break;
    default:    return `${prep} ${art}`;
  }
  return prefix + suffix;
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

/** route path relation → preposition (+ "a"-fusion for those that govern "a"). */
function routeHead(c: ResolvedComplement, plural: boolean): string {
  const f = c.phrase.head.forms;
  const art = defArticle(f, plural);
  switch (pathSpecifier(c)) {
    case 'under':       return `sotto ${art}`;
    case 'over':        return `sopra ${art}`;
    case 'around':      return `intorno ${datPrep(f, plural)}`;
    case 'behind':      return `dietro ${art}`;
    case 'in_front_of': return `davanti ${datPrep(f, plural)}`;
    case 'through':
    default:            return `attraverso ${art}`;
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
      const adj = a ? ` ${a}` : '';
      // locative→in, direction→a, source→da (fuse with article); route→path preposition
      const head =
        type === 'locative'  ? prepArt('in', f, plural) :
        type === 'direction' ? prepArt('a', f, plural) :
        type === 'source'    ? prepArt('da', f, plural) :
        routeHead(c, plural);
      return `${head} ${word}${adj}`;
    })
    .filter(Boolean)
    .join(' ');
}

export const italianEngine: LanguageEngine = {
  language: 'it',
  render(phrase: ResolvedPhrase): string {
    const { subject, verbPhrase, directObject, indirectObject } = phrase;
    const { verb, negative: verbNegative, modifier } = verbPhrase;

    const subjectText = subjectPhrase(subject.head.forms, npAdj(subject));
    const verbText = conjugate(verb.forms, subject.head.forms);
    // "mai" always requires "non": "io non bevo mai" even without verbNegative
    const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
    const negText = (verbNegative || modifierIsNegative) ? 'non' : '';
    const directObjectText = directObject
      ? nounPhrase(directObject.head.forms, npAdj(directObject))
      : '';
    // S [non] V Adv DirectObj IndirectObj(a+article)
    const indirectObjectText = indirectObject
      ? indirectNounPhrase(indirectObject.head.forms, npAdj(indirectObject))
      : '';
    const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
    const complementsText = complementsPhrase(phrase.complements);

    return [subjectText, negText, verbText, modifierText, directObjectText, indirectObjectText, complementsText]
      .filter(Boolean)
      .join(' ')
      .trim();
  },
};
