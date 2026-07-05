import { COMPLEMENT_RENDER_ORDER, type ComplementType, type Tense } from '@signi/shared';
import { pathSpecifier, type ConceptForms, type ResolvedComplement, type ResolvedNounPhrase, type ResolvedVerbPhrase, type LanguageEngine, type ResolvedPhrase } from '../types.js';

const VOWEL_START = /^[aeiouàèéìòù]/i;
/** Words that take "lo"/"gli" (s+consonant, z, ps, gn, x, y, …). */
const SPECIAL_START = /^(s[^aeiou]|z|ps|gn|x|y)/i;

/**
 * Concept IDs of the common short adjectives that idiomatically precede the noun
 * in Italian (the "BAGS"-style set: beauty, age, goodness, size). Everything else
 * (e.g. felice, triste, forte, colours) stays after the noun. Both size adjectives
 * (grande/piccolo) precede, so they behave consistently — the trade-off is that a
 * size + beauty pair stacks before the noun ("il grande bel cane").
 */
const PRENOMINAL = new Set(['BIG', 'SMALL', 'GOOD', 'BAD', 'OLD', 'YOUNG', 'NEW', 'BEAUTIFUL']);

function isPlural(forms: Record<string, string>): boolean {
  return (forms['number'] ?? forms['count']) === 'plural';
}

function surface(forms: Record<string, string>, plural: boolean): string {
  return (plural ? forms['plural'] : forms['base']) ?? forms['base'] ?? '';
}

/**
 * The definite article, selected by gender/number and by the sound of the word that
 * actually follows it (`lead`) — which is the first prenominal adjective when present,
 * otherwise the noun itself ("il gatto" but "lo studente", "il bravo studente").
 */
function defArticle(forms: Record<string, string>, plural = false, lead?: string): string {
  const gender = forms['gender'] ?? 'masc';
  const base = lead ?? surface(forms, plural);
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

/** Join a sequence of words, dropping the space after an elided word ("bell'amico"). */
function joinWords(words: string[]): string {
  return words
    .filter(Boolean)
    .reduce((acc, w) => (!acc ? w : acc.endsWith("'") ? `${acc}${w}` : `${acc} ${w}`), '');
}

/**
 * Italian "a" (to) + definite article contractions:
 * a+il=al, a+lo=allo, a+la=alla, a+l'=all', a+i=ai, a+gli=agli, a+le=alle
 */
function datPrep(forms: Record<string, string>, plural = false, lead?: string): string {
  const art = defArticle(forms, plural, lead);
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
 * "da" (from), "in" (in) and "di" (of): al/dal/nel/del, allo/dallo/nello/dello,
 * alla/dalla/nella/della, all'/dall'/nell'/dell', …
 */
function prepArt(prep: 'a' | 'da' | 'in' | 'di', forms: Record<string, string>, plural = false, lead?: string): string {
  const art = defArticle(forms, plural, lead);
  const prefix = prep === 'a' ? 'a' : prep === 'da' ? 'da' : prep === 'di' ? 'de' : 'ne';
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

/**
 * Prenominal "bello", which inflects like the definite article according to the sound
 * of the word that follows it: bel/bello/bell'/bei/begli · bella/belle/bell'.
 */
function belloForm(gender: string, plural: boolean, next: string): string {
  const vowel = VOWEL_START.test(next);
  const special = SPECIAL_START.test(next);
  if (gender === 'fem') {
    if (plural) return 'belle';
    return vowel ? "bell'" : 'bella';
  }
  if (plural) return (vowel || special) ? 'begli' : 'bei';
  if (vowel) return "bell'";
  return special ? 'bello' : 'bel';
}

/**
 * Prenominal "buono", which apocopates in the masculine singular ("il buon cane",
 * "il buon amico") except before s-impura/z ("il buono studente"); fem "buon'" elides
 * before a vowel ("la buon'amica").
 */
function buonoForm(gender: string, plural: boolean, next: string): string {
  const vowel = VOWEL_START.test(next);
  const special = SPECIAL_START.test(next);
  if (gender === 'fem') {
    if (plural) return 'buone';
    return vowel ? "buon'" : 'buona';
  }
  if (plural) return 'buoni';
  return special ? 'buono' : 'buon';
}

function prenominalSurface(a: ConceptForms, gender: string, plural: boolean, next: string): string {
  if (a.conceptId === 'BEAUTIFUL') return belloForm(gender, plural, next);
  if (a.conceptId === 'GOOD') return buonoForm(gender, plural, next);
  return agreeAdj(a.forms['base'] ?? '', gender, plural);
}

/** Split a phrase's adjectives into those that precede the noun and those that follow. */
function splitAdjectives(np: ResolvedNounPhrase): { pre: ConceptForms[]; post: ConceptForms[] } {
  const pre: ConceptForms[] = [];
  const post: ConceptForms[] = [];
  for (const a of np.adjectives) {
    (PRENOMINAL.has(a.conceptId) ? pre : post).push(a);
  }
  return { pre, post };
}

/**
 * Surface forms of the prenominal adjectives, resolved right-to-left so each (bello in
 * particular) can agree with the sound of the word immediately following it.
 */
function prenominalChain(pre: ConceptForms[], gender: string, plural: boolean, noun: string): string[] {
  const out: string[] = [];
  let next = noun;
  for (let i = pre.length - 1; i >= 0; i--) {
    const surf = prenominalSurface(pre[i], gender, plural, next);
    if (surf) {
      out.unshift(surf);
      next = surf;
    }
  }
  return out;
}

/**
 * Render a noun phrase: [head] [prenominal adjectives] noun [postnominal adjectives].
 * `headFor` builds the article/preposition, receiving the plurality and the surface of
 * the word that will follow it (`lead`) so it can pick the right form/elision.
 */
function renderNP(np: ResolvedNounPhrase, headFor: (plural: boolean, lead: string) => string): string {
  const forms = np.head.forms;
  const gender = forms['gender'] ?? 'masc';
  const plural = isPlural(forms);
  const noun = surface(forms, plural);
  const { pre, post } = splitAdjectives(np);
  const preSurfaces = prenominalChain(pre, gender, plural, noun);
  const lead = preSurfaces[0] ?? noun;
  const core = joinArt(headFor(plural, lead), joinWords([...preSurfaces, noun]));
  const postStr = post
    .map((a) => agreeAdj(a.forms['base'] ?? '', gender, plural))
    .filter(Boolean)
    .join(' e '); // coordinate multiple postnominal adjectives ("grande e forte")
  const withPost = postStr ? `${core} ${postStr}` : core;
  // A possessor is postnominal, headed by "di"+article fused ("il libro del gatto").
  // Rendering it through renderNP recurses for its own adjectives / nested possessor.
  const poss = np.possessor;
  const base = poss
    ? `${withPost} ${renderNP(poss, (plural, lead) => prepArt('di', poss.head.forms, plural, lead))}`
    : withPost;
  const rel = relativeText(np);
  return rel ? `${base} ${rel}` : base;
}

function conjugate(forms: Record<string, string>, subjectForms: Record<string, string>, tense: Tense = 'present'): string {
  const person = subjectForms['person'] ?? '3';
  const number = subjectForms['number'] ?? 'singular';
  const n = number === 'plural' ? 'pl' : 'sg';
  return forms[`${person}${n}_${tense}`] ?? forms[tense] ?? forms[`${person}${n}_present`] ?? forms['base'] ?? '';
}

function subjectPhrase(np: ResolvedNounPhrase): string {
  const forms = np.head.forms;
  if (forms['person']) {
    if (forms['number'] === 'plural' && forms['plural']) return forms['plural'];
    return forms['base'] ?? '';
  }
  return renderNP(np, (plural, lead) => defArticle(forms, plural, lead)); // noun — definite article
}

/** route path relation → preposition (+ "a"-fusion for those that govern "a"). */
function routeHead(c: ResolvedComplement, plural: boolean, lead: string): string {
  const f = c.phrase.head.forms;
  const art = defArticle(f, plural, lead);
  switch (pathSpecifier(c)) {
    case 'under':       return `sotto ${art}`;
    case 'over':        return `sopra ${art}`;
    case 'around':      return `intorno ${datPrep(f, plural, lead)}`;
    case 'behind':      return `dietro ${art}`;
    case 'in_front_of': return `davanti ${datPrep(f, plural, lead)}`;
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
      // locative→in, direction→a, source→"via da" (all fuse with article); route→path prep.
      // A direction toward an *animate* goal takes "da" ("corro dal bambino" = to/towards
      // the child — the "andare da qualcuno" construction), not bare "a", which is for
      // places ("corro alla casa"). Because source also governs "da", it is prefixed with
      // the ablative adverb "via" so the two senses never collide: "corro dal bambino"
      // (motion to) vs "corro via dal bambino" (motion away from).
      const headFor = (plural: boolean, lead: string): string =>
        type === 'locative'  ? prepArt('in', f, plural, lead) :
        type === 'direction' ? prepArt(f['animate'] === '1' ? 'da' : 'a', f, plural, lead) :
        type === 'source'    ? `via ${prepArt('da', f, plural, lead)}` :
        routeHead(c, plural, lead);
      return renderNP(c.phrase, headFor);
    })
    .filter(Boolean)
    .join(' ');
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
  const verbText = conjugate(verb.forms, subjectForms, tense);
  // "mai" always requires "non": "io non bevo mai" even without verbNegative
  const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
  const negText = (verbNegative || modifierIsNegative) ? 'non' : '';
  const directObjectText = directObject
    ? renderNP(directObject, (plural, lead) => defArticle(directObject.head.forms, plural, lead))
    : '';
  // [non] V Adv DirectObj IndirectObj(a+article)
  const indirectObjectText = indirectObject
    ? renderNP(indirectObject, (plural, lead) => datPrep(indirectObject.head.forms, plural, lead))
    : '';
  const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
  const complementsText = complementsPhrase(complements);
  return [negText, verbText, modifierText, directObjectText, indirectObjectText, complementsText]
    .filter(Boolean)
    .join(' ');
}

/** A relative clause on `np`: invariant "che" + the clause predicate (head = subject). */
function relativeText(np: ResolvedNounPhrase): string {
  const rel = np.relative;
  if (!rel) return '';
  return `che ${predicateText(np.head.forms, rel.verbPhrase, rel.directObject, rel.indirectObject, rel.complements)}`.trim();
}

export const italianEngine: LanguageEngine = {
  language: 'it',
  render(phrase: ResolvedPhrase): string {
    const { subject } = phrase;
    const subjectText = subjectPhrase(subject);
    const predicate = predicateText(
      subject.head.forms, phrase.verbPhrase, phrase.directObject, phrase.indirectObject, phrase.complements,
    );
    return [subjectText, predicate].filter(Boolean).join(' ').trim();
  },
};
