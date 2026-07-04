import { COMPLEMENT_RENDER_ORDER, type ComplementType, type Tense } from '@signi/shared';
import { pathSpecifier, type ResolvedComplement, type ResolvedNounPhrase, type LanguageEngine, type ResolvedPhrase } from '../types.js';

const VOWEL_START = /^[aeiouéèêëàâîïôùûü]/i;

/**
 * Concept IDs of the "BAGS" adjectives (beauty, age, goodness, size) that precede the
 * noun in French — beau, bon, grand, petit, vieux, jeune, nouveau, mauvais. Every other
 * adjective (heureux, triste, fort, …) follows the noun.
 */
const PRENOMINAL = new Set(['BIG', 'SMALL', 'GOOD', 'BAD', 'OLD', 'YOUNG', 'NEW', 'BEAUTIFUL']);

/**
 * The definite article, selected by the sound of the word that actually follows it
 * (`lead`) — the first prenominal adjective when present, otherwise the noun itself
 * ("l'ami" but "le petit ami", "le bon ami").
 */
function defArticle(forms: Record<string, string>, plural = false, lead?: string): string {
  const gender = forms['gender'] ?? 'masc';
  if (plural) return 'les';
  const base = lead ?? forms['base'] ?? '';
  if (VOWEL_START.test(base)) return "l'";
  return gender === 'fem' ? 'la' : 'le';
}

/** Join an article/preposition head to the following word: no space after elision. */
function joinArt(head: string, word: string): string {
  return head.endsWith("'") ? `${head}${word}` : `${head} ${word}`;
}

/**
 * French "à" (to) + definite article contractions:
 * à+le=au, à+les=aux, à+la=à la, à+l'=à l'
 */
function datPrep(forms: Record<string, string>, plural = false, lead?: string): string {
  const art = defArticle(forms, plural, lead);
  if (art === 'le') return 'au';
  if (art === 'les') return 'aux';
  return `à ${art}`; // "à la", "à l'"
}

/**
 * French "de" (from) + definite article contractions:
 * de+le=du, de+les=des, de+la=de la, de+l'=de l'
 */
function dePrep(forms: Record<string, string>, plural = false, lead?: string): string {
  const art = defArticle(forms, plural, lead);
  if (art === 'le') return 'du';
  if (art === 'les') return 'des';
  return `de ${art}`; // "de la", "de l'"
}

function conjugate(forms: Record<string, string>, subjectForms: Record<string, string>, tense: Tense = 'present'): string {
  const person = subjectForms['person'] ?? '3';
  const number = subjectForms['number'] ?? 'singular';
  const n = number === 'plural' ? 'pl' : 'sg';
  return forms[`${person}${n}_${tense}`] ?? forms[tense] ?? forms[`${person}${n}_present`] ?? forms['base'] ?? '';
}

/** Split a phrase's adjectives (surface = base form) into pre- and post-nominal groups. */
function splitAdjectives(np: ResolvedNounPhrase): { pre: string[]; post: string[] } {
  const pre: string[] = [];
  const post: string[] = [];
  for (const a of np.adjectives) {
    const word = a.forms['base'] ?? '';
    if (!word) continue;
    (PRENOMINAL.has(a.conceptId) ? pre : post).push(word);
  }
  return { pre, post };
}

/**
 * Render a noun phrase: [head] [prenominal adjectives] noun [postnominal adjectives].
 * `headFor` builds the article/preposition, receiving the surface of the word that will
 * follow it (`lead`) so it can pick the right elision ("le" vs "l'").
 */
function renderNP(np: ResolvedNounPhrase, headFor: (plural: boolean, lead: string) => string): string {
  const forms = np.head.forms;
  const plural = (forms['number'] ?? forms['count']) === 'plural';
  const noun = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const { pre, post } = splitAdjectives(np);
  const lead = pre[0] ?? noun;
  const core = joinArt(headFor(plural, lead), [...pre, noun].join(' '));
  const postStr = post.join(' et ');
  return postStr ? `${core} ${postStr}` : core;
}

function subjectPhrase(np: ResolvedNounPhrase): string {
  const forms = np.head.forms;
  if (forms['person']) {
    if (forms['number'] === 'plural' && forms['plural']) return forms['plural'];
    return forms['base'] ?? '';
  }
  return renderNP(np, (plural, lead) => defArticle(forms, plural, lead)); // noun — definite article
}

/** route path relation → preposition (+ "de"-contraction for those governing "de"). */
function routeHead(c: ResolvedComplement, plural: boolean, lead: string): string {
  const f = c.phrase.head.forms;
  const art = defArticle(f, plural, lead);
  switch (pathSpecifier(c)) {
    case 'under':       return `sous ${art}`;
    case 'over':        return `au-dessus ${dePrep(f, plural, lead)}`;
    case 'around':      return `autour ${dePrep(f, plural, lead)}`;
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
      // locative→dans, direction→à (au/aux/à la), source→de (du/des/de la), route→path preposition
      const headFor = (plural: boolean, lead: string): string =>
        type === 'locative'  ? `dans ${defArticle(f, plural, lead)}` :
        type === 'direction' ? datPrep(f, plural, lead) :
        type === 'source'    ? dePrep(f, plural, lead) :
        routeHead(c, plural, lead);
      return renderNP(c.phrase, headFor);
    })
    .filter(Boolean)
    .join(' ');
}

export const frenchEngine: LanguageEngine = {
  language: 'fr',
  render(phrase: ResolvedPhrase): string {
    const { subject, verbPhrase, directObject, indirectObject } = phrase;
    const { verb, negative: verbNegative, modifier, tense } = verbPhrase;

    const subjectText = subjectPhrase(subject);
    const conjugated = conjugate(verb.forms, subject.head.forms, tense);
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
      ? renderNP(directObject, (plural, lead) => defArticle(directObject.head.forms, plural, lead))
      : '';
    // S V [Adv] DirectObj IndirectObj(à+article)
    const indirectObjectText = indirectObject
      ? renderNP(indirectObject, (plural, lead) => datPrep(indirectObject.head.forms, plural, lead))
      : '';

    const complementsText = complementsPhrase(phrase.complements);

    return [subjectText, effectiveVerb, effectiveMod, directObjectText, indirectObjectText, complementsText]
      .filter(Boolean)
      .join(' ')
      .trim();
  },
};
