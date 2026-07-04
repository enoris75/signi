import { COMPLEMENT_RENDER_ORDER, type ComplementType } from '@signi/shared';
import { pathSpecifier, type ResolvedComplement, type ResolvedNounPhrase, type LanguageEngine, type ResolvedPhrase } from '../types.js';

function defArticle(forms: Record<string, string>, plural = false): string {
  const gender = forms['gender'] ?? 'masc';
  if (plural) return gender === 'fem' ? 'las' : 'los';
  return gender === 'fem' ? 'la' : 'el';
}

/** Spanish noun/adjective pluralisation: vowel → +s, -z → -ces, consonant → +es. */
function pluralize(word: string): string {
  if (/[aeiouáéíóú]$/i.test(word)) return `${word}s`;
  if (/z$/i.test(word)) return `${word.slice(0, -1)}ces`;
  return `${word}es`;
}

/**
 * Inflect a Spanish adjective (given as masculine singular) to agree with the head
 * noun's gender and number. "-o" adjectives take -a/-os/-as; adjectives ending in
 * -e or a consonant are gender-invariant and only pluralise.
 */
function agreeAdj(base: string, gender: string, plural: boolean): string {
  if (!base) return '';
  const sg = base.endsWith('o') && gender === 'fem' ? `${base.slice(0, -1)}a` : base;
  return plural ? pluralize(sg) : sg;
}

/** Join a noun phrase's adjectives, each agreed with the head's gender/number. */
function esAdj(np: ResolvedNounPhrase): string {
  const gender = np.head.forms['gender'] ?? 'masc';
  const plural = (np.head.forms['number'] ?? np.head.forms['count']) === 'plural';
  return np.adjectives
    .map((a) => agreeAdj(a.forms['base'] ?? '', gender, plural))
    .filter(Boolean)
    .join(' ');
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
function routeHead(c: ResolvedComplement, plural: boolean): string {
  const f = c.phrase.head.forms;
  switch (pathSpecifier(c)) {
    case 'under':       return `debajo ${dePrep(f, plural)}`;
    case 'over':        return `por encima ${dePrep(f, plural)}`;
    case 'around':      return `alrededor ${dePrep(f, plural)}`;
    case 'behind':      return `detrás ${dePrep(f, plural)}`;
    case 'in_front_of': return `delante ${dePrep(f, plural)}`;
    case 'through':
    default:            return `por ${defArticle(f, plural)}`;
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
      const a = esAdj(c.phrase);
      const adj = a ? ` ${a}` : '';
      // locative→en, direction→a (al/a la), source→de (del/de la), route→path preposition
      const head =
        type === 'locative'  ? `en ${defArticle(f, plural)}` :
        type === 'direction' ? datPrep(f, plural) :
        type === 'source'    ? dePrep(f, plural) :
        routeHead(c, plural);
      return `${head} ${word}${adj}`;
    })
    .filter(Boolean)
    .join(' ');
}

export const spanishEngine: LanguageEngine = {
  language: 'es',
  render(phrase: ResolvedPhrase): string {
    const { subject, verbPhrase, directObject, indirectObject } = phrase;
    const { verb, negative: verbNegative, modifier } = verbPhrase;

    const subjectText = subjectPhrase(subject.head.forms, esAdj(subject));
    const conjugated = conjugate(verb.forms, subject.head.forms);
    const verbText = verbNegative ? `no ${conjugated}` : conjugated;
    const directObjectText = directObject
      ? nounPhrase(directObject.head.forms, esAdj(directObject))
      : '';
    // S V Adv DirectObj IndirectObj(a+article)
    const indirectObjectText = indirectObject
      ? indirectNounPhrase(indirectObject.head.forms, esAdj(indirectObject))
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
