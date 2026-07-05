import { COMPLEMENT_RENDER_ORDER, type ComplementType, type Tense } from '@signi/shared';
import { pathSpecifier, type ResolvedComplement, type ResolvedNounPhrase, type ResolvedVerbPhrase, type LanguageEngine, type ResolvedPhrase } from '../types.js';

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

/** Coordinate adjectives with "y", switching to "e" before an i-/hi- sound (but not "hie-"). */
function coordinate(parts: string[]): string {
  return parts.reduce((acc, w, i) => {
    if (i === 0) return w;
    const conj = /^(i|hi(?!e))/i.test(w) ? 'e' : 'y';
    return `${acc} ${conj} ${w}`;
  }, '');
}

/** Join a noun phrase's adjectives, each agreed with the head's gender/number. */
function esAdj(np: ResolvedNounPhrase): string {
  const gender = np.head.forms['gender'] ?? 'masc';
  const plural = (np.head.forms['number'] ?? np.head.forms['count']) === 'plural';
  return coordinate(
    np.adjectives
      .map((a) => agreeAdj(a.forms['base'] ?? '', gender, plural))
      .filter(Boolean),
  );
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

function conjugate(forms: Record<string, string>, subjectForms: Record<string, string>, tense: Tense = 'present'): string {
  const person = subjectForms['person'] ?? '3';
  const number = subjectForms['number'] ?? 'singular';
  const n = number === 'plural' ? 'pl' : 'sg';
  return forms[`${person}${n}_${tense}`] ?? forms[tense] ?? forms[`${person}${n}_present`] ?? forms['base'] ?? '';
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
      // locative→en, direction→a (al/a la), source→"lejos de" (lejos del/de la),
      // route→path preposition. A direction toward an *animate* goal takes "hacia"
      // (toward) — bare "a" + person doesn't read as a motion destination ("corro hacia
      // el niño", not "*al niño"); "hacia" doesn't contract. Source is prefixed with the
      // ablative adverb "lejos" so it reads as motion away ("corro lejos del niño"); bare
      // "de" reads as origin/possession, not departure.
      const head =
        type === 'locative'  ? `en ${defArticle(f, plural)}` :
        type === 'direction' ? (f['animate'] === '1' ? `hacia ${defArticle(f, plural)}` : datPrep(f, plural)) :
        type === 'source'    ? `lejos ${dePrep(f, plural)}` :
        routeHead(c, plural);
      return withRelative(`${head} ${word}${adj}`, c.phrase);
    })
    .filter(Boolean)
    .join(' ');
}

/** Append a noun phrase's relative clause ("que" + predicate) to its rendered surface. */
function withRelative(text: string, np: ResolvedNounPhrase): string {
  const rel = np.relative;
  if (!rel) return text;
  const clause = predicateText(np.head.forms, rel.verbPhrase, rel.directObject, rel.indirectObject, rel.complements);
  return `${text} que ${clause}`.trimEnd();
}

/**
 * The predicate half of a phrase — everything after the subject noun. Shared by the
 * top-level sentence and by relative clauses, which pass the head noun's forms as
 * `subjectForms` so the verb agrees with the head.
 */
function predicateText(
  subjectForms: Record<string, string>,
  verbPhrase: ResolvedVerbPhrase,
  directObject?: ResolvedNounPhrase,
  indirectObject?: ResolvedNounPhrase,
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
): string {
  const { verb, negative: verbNegative, modifier, tense } = verbPhrase;
  const conjugated = conjugate(verb.forms, subjectForms, tense);
  const verbText = verbNegative ? `no ${conjugated}` : conjugated;
  const directObjectText = directObject
    ? withRelative(nounPhrase(directObject.head.forms, esAdj(directObject)), directObject)
    : '';
  // V Adv DirectObj IndirectObj(a+article)
  const indirectObjectText = indirectObject
    ? withRelative(indirectNounPhrase(indirectObject.head.forms, esAdj(indirectObject)), indirectObject)
    : '';
  const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
  // "nunca" goes pre-verbal without "no": "yo nunca bebo"
  // but post-verbal with "no": "yo no bebo nunca"
  const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
  const preVerb = (modifierIsNegative && !verbNegative) ? modifierText : '';
  const postVerb = (modifierIsNegative && !verbNegative) ? '' : modifierText;
  const complementsText = complementsPhrase(complements);
  return [preVerb, verbText, postVerb, directObjectText, indirectObjectText, complementsText]
    .filter(Boolean)
    .join(' ');
}

export const spanishEngine: LanguageEngine = {
  language: 'es',
  render(phrase: ResolvedPhrase): string {
    const { subject } = phrase;
    const subjectText = withRelative(subjectPhrase(subject.head.forms, esAdj(subject)), subject);
    const predicate = predicateText(
      subject.head.forms, phrase.verbPhrase, phrase.directObject, phrase.indirectObject, phrase.complements,
    );
    return [subjectText, predicate].filter(Boolean).join(' ').trim();
  },
};
