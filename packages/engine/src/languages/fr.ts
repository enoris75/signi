import { COMPLEMENT_RENDER_ORDER, type ComplementType } from '@signi/shared';
import { npAdj, pathSpecifier, type ResolvedComplement, type LanguageEngine, type ResolvedPhrase } from '../types.js';

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
function routeHead(c: ResolvedComplement, plural: boolean): string {
  const f = c.phrase.head.forms;
  const art = defArticle(f, plural);
  switch (pathSpecifier(c)) {
    case 'under':       return `sous ${art}`;
    case 'over':        return `au-dessus ${dePrep(f, plural)}`;
    case 'around':      return `autour ${dePrep(f, plural)}`;
    case 'behind':      return `derrière ${art}`;
    case 'in_front_of': return `devant ${art}`;
    case 'through':
    default:            return `à travers ${art}`;
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
      // locative→dans, direction→à (au/aux/à la), source→de (du/des/de la), route→path preposition
      const head =
        type === 'locative'  ? `dans ${defArticle(f, plural)}` :
        type === 'direction' ? datPrep(f, plural) :
        type === 'source'    ? dePrep(f, plural) :
        routeHead(c, plural);
      return `${head} ${adj}${word}`;
    })
    .filter(Boolean)
    .join(' ');
}

export const frenchEngine: LanguageEngine = {
  language: 'fr',
  render(phrase: ResolvedPhrase): string {
    const { subject, verbPhrase, directObject, indirectObject } = phrase;
    const { verb, negative: verbNegative, modifier } = verbPhrase;

    const subjectText = subjectPhrase(subject.head.forms, npAdj(subject));
    const conjugated = conjugate(verb.forms, subject.head.forms);
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
      ? nounPhrase(directObject.head.forms, npAdj(directObject))
      : '';
    // S V [Adv] DirectObj IndirectObj(à+article)
    const indirectObjectText = indirectObject
      ? indirectNounPhrase(indirectObject.head.forms, npAdj(indirectObject))
      : '';

    const complementsText = complementsPhrase(phrase.complements);

    return [subjectText, effectiveVerb, effectiveMod, directObjectText, indirectObjectText, complementsText]
      .filter(Boolean)
      .join(' ')
      .trim();
  },
};
