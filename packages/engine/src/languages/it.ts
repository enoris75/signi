import { COMPLEMENT_RENDER_ORDER, type ComplementType } from '@signi/shared';
import { pathSpecifier, type ResolvedComplement, type ResolvedNounPhrase, type LanguageEngine, type ResolvedPhrase } from '../types.js';

const VOWEL_START = /^[aeiouàèéìòù]/i;
/** Words that take "lo"/"gli" (s+consonant, z, ps, gn, x, y, …). */
const SPECIAL_START = /^(s[^aeiou]|z|ps|gn|x|y)/i;

function isPlural(forms: Record<string, string>): boolean {
  return (forms['number'] ?? forms['count']) === 'plural';
}

function surface(forms: Record<string, string>, plural: boolean): string {
  return (plural ? forms['plural'] : forms['base']) ?? forms['base'] ?? '';
}

function defArticle(forms: Record<string, string>, plural = false): string {
  const gender = forms['gender'] ?? 'masc';
  const base = surface(forms, plural);
  const vowel = VOWEL_START.test(base);
  if (gender === 'fem') {
    if (plural) return 'le';
    return vowel ? "l'" : 'la';
  }
  // masculine
  if (plural) return (vowel || SPECIAL_START.test(base)) ? 'gli' : 'i';
  if (vowel) return "l'";
  return SPECIAL_START.test(base) ? 'lo' : 'il';
}

/** Join an article/preposition head to the following word: no space after elision. */
function joinArt(head: string, word: string): string {
  return head.endsWith("'") ? `${head}${word}` : `${head} ${word}`;
}

/**
 * Italian "a" (to) + definite article contractions:
 * a+il=al, a+lo=allo, a+la=alla, a+l'=all', a+i=ai, a+gli=agli, a+le=alle
 */
function datPrep(forms: Record<string, string>, plural = false): string {
  const art = defArticle(forms, plural);
  switch (art) {
    case 'il':  return 'al';
    case 'lo':  return 'allo';
    case 'la':  return 'alla';
    case "l'":  return "all'";
    case 'i':   return 'ai';
    case 'gli': return 'agli';
    case 'le':  return 'alle';
    default:    return `a ${art}`;
  }
}

/**
 * Generic Italian simple-preposition + definite-article fusion for "a" (to),
 * "da" (from) and "in" (in): al/dal/nel, allo/dallo/nello, alla/dalla/nella, all'/dall'/nell', …
 */
function prepArt(prep: 'a' | 'da' | 'in', forms: Record<string, string>, plural = false): string {
  const art = defArticle(forms, plural);
  const prefix = prep === 'a' ? 'a' : prep === 'da' ? 'da' : 'ne';
  let suffix: string;
  switch (art) {
    case 'il':  suffix = 'l'; break;
    case 'lo':  suffix = 'llo'; break;
    case 'la':  suffix = 'lla'; break;
    case "l'":  suffix = "ll'"; break;
    case 'i':   suffix = 'i'; break;
    case 'gli': suffix = 'gli'; break;
    case 'le':  suffix = 'lle'; break;
    default:    return `${prep} ${art}`;
  }
  return prefix + suffix;
}

/**
 * Inflect an Italian adjective (given in masculine-singular "base" form) to agree
 * with the head noun's gender and number.
 * - "-o" class: freddo → fredda / freddi / fredde (hard c/g kept: stanco → stanchi/stanche)
 * - "-e" class: grande → grande / grandi (gender-invariant, plural -i)
 */
function agreeAdj(base: string, gender: string, plural: boolean): string {
  if (!base) return '';
  const fem = gender === 'fem';
  if (base.endsWith('o')) {
    const stem = base.slice(0, -1);
    if (!plural) return fem ? `${stem}a` : base;
    const hardStem =
      base.endsWith('co') ? `${base.slice(0, -2)}ch` :
      base.endsWith('go') ? `${base.slice(0, -2)}gh` :
      stem;
    if (fem) return `${hardStem}e`;
    return hardStem.endsWith('i') ? hardStem : `${hardStem}i`;
  }
  if (base.endsWith('e')) {
    return plural ? `${base.slice(0, -1)}i` : base;
  }
  return base;
}

/** Join a noun phrase's adjectives, each agreed with the head's gender/number. */
function itAdj(np: ResolvedNounPhrase): string {
  const gender = np.head.forms['gender'] ?? 'masc';
  const plural = isPlural(np.head.forms);
  return np.adjectives
    .map((a) => agreeAdj(a.forms['base'] ?? '', gender, plural))
    .filter(Boolean)
    .join(' ');
}

function conjugate(forms: Record<string, string>, subjectForms: Record<string, string>): string {
  const person = subjectForms['person'] ?? '3';
  const number = subjectForms['number'] ?? 'singular';
  const key = `${person}${number === 'plural' ? 'pl' : 'sg'}_present`;
  return forms[key] ?? forms['base'] ?? '';
}

function nounPhrase(forms: Record<string, string>, adj?: string): string {
  const plural = isPlural(forms);
  const word = surface(forms, plural);
  const a = adj ? ` ${adj}` : '';
  return `${joinArt(defArticle(forms, plural), word)}${a}`;
}

function indirectNounPhrase(forms: Record<string, string>, adj?: string): string {
  const plural = isPlural(forms);
  const word = surface(forms, plural);
  const a = adj ? ` ${adj}` : '';
  return `${joinArt(datPrep(forms, plural), word)}${a}`;
}

function subjectPhrase(np: ResolvedNounPhrase): string {
  const forms = np.head.forms;
  if (forms['person']) {
    if (forms['number'] === 'plural' && forms['plural']) return forms['plural'];
    return forms['base'] ?? '';
  }
  return nounPhrase(forms, itAdj(np)); // noun — definite article
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
      const plural = isPlural(f);
      const word = surface(f, plural);
      const a = itAdj(c.phrase);
      const adj = a ? ` ${a}` : '';
      // locative→in, direction→a, source→da (fuse with article); route→path preposition
      const head =
        type === 'locative'  ? prepArt('in', f, plural) :
        type === 'direction' ? prepArt('a', f, plural) :
        type === 'source'    ? prepArt('da', f, plural) :
        routeHead(c, plural);
      return `${joinArt(head, word)}${adj}`;
    })
    .filter(Boolean)
    .join(' ');
}

export const italianEngine: LanguageEngine = {
  language: 'it',
  render(phrase: ResolvedPhrase): string {
    const { subject, verbPhrase, directObject, indirectObject } = phrase;
    const { verb, negative: verbNegative, modifier } = verbPhrase;

    const subjectText = subjectPhrase(subject);
    const verbText = conjugate(verb.forms, subject.head.forms);
    // "mai" always requires "non": "io non bevo mai" even without verbNegative
    const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
    const negText = (verbNegative || modifierIsNegative) ? 'non' : '';
    const directObjectText = directObject
      ? nounPhrase(directObject.head.forms, itAdj(directObject))
      : '';
    // S [non] V Adv DirectObj IndirectObj(a+article)
    const indirectObjectText = indirectObject
      ? indirectNounPhrase(indirectObject.head.forms, itAdj(indirectObject))
      : '';
    const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
    const complementsText = complementsPhrase(phrase.complements);

    return [subjectText, negText, verbText, modifierText, directObjectText, indirectObjectText, complementsText]
      .filter(Boolean)
      .join(' ')
      .trim();
  },
};
