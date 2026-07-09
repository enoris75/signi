import { COMPLEMENT_RENDER_ORDER, type Aspect, type ComplementType, type Degree, type ModifierRelation, type Tense } from '@signi/shared';
import { adjDegree, causeSentiment, modalChain, pathSpecifier, type ConceptForms, type ResolvedComplement, type ResolvedNounPhrase, type ResolvedVerbPhrase, type LanguageEngine, type ResolvedPhrase } from '../types.js';

// Degree adverb placed before the (agreed) adjective. Comparative and relative superlative
// share "più"/"meno" in Italian — the noun phrase's definite article is what distinguishes
// them ("un gatto più grande" = a bigger cat vs "il gatto più grande" = the biggest), so
// only the adverb is added here. Equality uses the invariant "ugualmente".
const IT_DEGREE: Record<Degree, string> = {
  positive: '', more: 'più', most: 'più', less: 'meno', least: 'meno', equally: 'ugualmente',
};

/** Prefix an adjective's degree adverb onto its already-agreed surface ("più grande"). */
function itDeg(a: ConceptForms, surface: string): string {
  const d = IT_DEGREE[adjDegree(a)];
  return d && surface ? `${d} ${surface}` : surface;
}

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

/**
 * The indefinite article, by gender and the sound of the following word (`lead`):
 * masc "un" ("un cane") / "uno" (s-impura, z: "uno studente") · fem "una" / "un'"
 * before a vowel ("un'amica"). Plural indefinite has no article here (bare "cani").
 */
function indefArticle(forms: Record<string, string>, plural: boolean, lead?: string): string {
  if (plural) return '';
  const gender = forms['gender'] ?? 'masc';
  const base = lead ?? '';
  if (gender === 'fem') return VOWEL_START.test(base) ? "un'" : 'una';
  return SPECIAL_START.test(base) ? 'uno' : 'un';
}

/**
 * "nessun" (no), inflected like the indefinite article: masc "nessun" / "nessuno"
 * (s-impura, z) · fem "nessuna" / "nessun'" before a vowel. Always singular.
 */
function nessunForm(gender: string, lead: string): string {
  if (gender === 'fem') return VOWEL_START.test(lead) ? "nessun'" : 'nessuna';
  return SPECIAL_START.test(lead) ? 'nessuno' : 'nessun';
}

/**
 * The determiner for a subject/direct-object noun phrase, from its `definiteness`
 * (default 'definite'): the definite/indefinite article, nothing (bare), or a
 * quantifier agreeing in gender (and, for "tutti/e", carrying the definite article).
 */
function artFor(forms: Record<string, string>, plural: boolean, lead: string): string {
  const definiteness = forms['definiteness'] ?? 'definite';
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  // Mass nouns ("acqua") stay singular and take the partitive / singular quantifiers:
  // "dell'acqua", "molta acqua", "poca acqua", "tutta l'acqua".
  if (forms['uncountable'] === '1') {
    switch (definiteness) {
      case 'bare':       return '';
      case 'indefinite': return '';                                   // bare: "bevo acqua"
      case 'some':       return prepArt('di', forms, false, lead);    // partitive: "dell'acqua"
      case 'many':       return fem ? 'molta' : 'molto';
      case 'few':        return fem ? 'poca' : 'poco';
      case 'all':        return `${fem ? 'tutta' : 'tutto'} ${defArticle(forms, false, lead)}`;
      case 'no':         return nessunForm(forms['gender'] ?? 'masc', lead);
      default:           return defArticle(forms, false, lead);
    }
  }
  switch (definiteness) {
    case 'bare':       return '';
    case 'indefinite': return indefArticle(forms, plural, lead);
    case 'some':       return fem ? 'alcune' : 'alcuni';
    case 'many':       return fem ? 'molte' : 'molti';
    case 'few':        return fem ? 'poche' : 'pochi';
    case 'all':        return `${fem ? 'tutte' : 'tutti'} ${defArticle(forms, true, lead)}`;
    case 'no':         return nessunForm(forms['gender'] ?? 'masc', lead);
    default:           return defArticle(forms, plural, lead);
  }
}

/** Join an article/preposition head to the following word: no space after elision. */
function joinArt(head: string, word: string): string {
  if (!head) return word; // bare noun phrase — no article
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
 * Preposition + determiner for an adposition-bearing complement, honoring the head's
 * `definiteness`. Only the *definite* article fuses with the preposition (al/alla/nel/dal…);
 * an indefinite article, quantifier, or bare noun stays uncontracted after the plain prep —
 * "a una casa", "a nessuna casa", "a molte case", "a casa". `all` keeps its own definite
 * article, which likewise doesn't fuse ("a tutte le case").
 */
function prepDet(prep: 'a' | 'da' | 'in' | 'di', forms: Record<string, string>, plural: boolean, lead: string): string {
  if ((forms['definiteness'] ?? 'definite') === 'definite') return prepArt(prep, forms, plural, lead);
  const det = artFor(forms, plural, lead);
  return det ? `${prep} ${det}` : prep;
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
    // A comparative/superlative adjective is postnominal in Italian ("il gatto più grande"),
    // even when its plain form would precede the noun — this also avoids article-elision
    // artefacts ("l'ugualmente grande gatto").
    const prenominal = PRENOMINAL.has(a.conceptId) && adjDegree(a) === 'positive';
    (prenominal ? pre : post).push(a);
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
      // Chain agreement off the bare surface, but emit it with any degree adverb prepended.
      out.unshift(itDeg(pre[i], surf));
      next = surf;
    }
  }
  return out;
}

/** Italian linking preposition for an attributive noun, chosen by its relation (bare, no article). */
const REL_PREP_IT: Record<ModifierRelation, string> = { feature: 'a', purpose: 'da', material: 'di' };

/** Postnominal attributive nouns as a bare "prep + noun" string ("a vela", "da sole"). */
function itMods(np: ResolvedNounPhrase): string {
  return np.nounModifiers
    .map((m) => {
      const base = m.concept.forms['base'];
      return base ? `${REL_PREP_IT[m.relation]} ${base}` : '';
    })
    .filter(Boolean)
    .join(' ');
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
    .map((a) => itDeg(a, agreeAdj(a.forms['base'] ?? '', gender, plural)))
    .filter(Boolean)
    .join(' e '); // coordinate multiple postnominal adjectives ("grande e forte")
  const postAdj = postStr ? `${core} ${postStr}` : core;
  // Attributive nouns are postnominal and bare (no article), the relation choosing the
  // preposition: feature "a" (barca a vela), purpose "da" (occhiali da sole), material
  // "di" (bicchiere di vino). This is deliberately distinct from the possessor's "del".
  const mods = itMods(np);
  const withPost = mods ? `${postAdj} ${mods}` : postAdj;
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

/** Person/number key ("1sg" … "3pl") into the auxiliary conjugation tables below. */
function auxKey(subjectForms: Record<string, string>): string {
  const person = subjectForms['person'] ?? '3';
  const n = (subjectForms['number'] ?? 'singular') === 'plural' ? 'pl' : 'sg';
  return `${person}${n}`;
}

// "stare" — the progressive/prospective auxiliary ("sto andando", "sto per andare"). Past
// uses the *imperfect* ("stavo andando"): the progressive past is imperfective, so the
// passato remoto ("stetti") the engine uses elsewhere would be ungrammatical here.
const STARE_IT: Record<Tense, Record<string, string>> = {
  present: { '1sg': 'sto', '2sg': 'stai', '3sg': 'sta', '1pl': 'stiamo', '2pl': 'state', '3pl': 'stanno' },
  past:    { '1sg': 'stavo', '2sg': 'stavi', '3sg': 'stava', '1pl': 'stavamo', '2pl': 'stavate', '3pl': 'stavano' },
  future:  { '1sg': 'starò', '2sg': 'starai', '3sg': 'starà', '1pl': 'staremo', '2pl': 'starete', '3pl': 'staranno' },
};

// "essere" — the resultative auxiliary of the unaccusatives ("sono andato"), past again
// imperfect ("ero andato").
const ESSERE_IT: Record<Tense, Record<string, string>> = {
  present: { '1sg': 'sono', '2sg': 'sei', '3sg': 'è', '1pl': 'siamo', '2pl': 'siete', '3pl': 'sono' },
  past:    { '1sg': 'ero', '2sg': 'eri', '3sg': 'era', '1pl': 'eravamo', '2pl': 'eravate', '3pl': 'erano' },
  future:  { '1sg': 'sarò', '2sg': 'sarai', '3sg': 'sarà', '1pl': 'saremo', '2pl': 'sarete', '3pl': 'saranno' },
};

// "avere" — the resultative auxiliary everywhere else ("ho visto"), the majority case.
const AVERE_IT: Record<Tense, Record<string, string>> = {
  present: { '1sg': 'ho', '2sg': 'hai', '3sg': 'ha', '1pl': 'abbiamo', '2pl': 'avete', '3pl': 'hanno' },
  past:    { '1sg': 'avevo', '2sg': 'avevi', '3sg': 'aveva', '1pl': 'avevamo', '2pl': 'avevate', '3pl': 'avevano' },
  future:  { '1sg': 'avrò', '2sg': 'avrai', '3sg': 'avrà', '1pl': 'avremo', '2pl': 'avrete', '3pl': 'avranno' },
};

/**
 * The verb group for a non-neutral aspect: progressive = stare + gerundio ("sto andando"),
 * prospective = stare + "per" + infinito ("sto per andare"), resultative = essere/avere +
 * participio passato. Which auxiliary is a lexical property of the verb (the seed marks the
 * essere-selecting ones with forms.aux = "be"); only an essere participle agrees with the
 * subject — "la ragazza è andata" but "la ragazza ha visto". Negation ("non") is prepended
 * by the caller, as for the neutral verb.
 */
function aspectVerb(
  verbForms: Record<string, string>,
  subjectForms: Record<string, string>,
  tense: Tense,
  aspect: Aspect,
): string {
  const key = auxKey(subjectForms);
  const inf = verbForms['base'] ?? '';
  if (aspect === 'resultative') {
    const essere = verbForms['aux'] === 'be';
    const aux = (essere ? ESSERE_IT : AVERE_IT)[tense][key];
    const base = verbForms['participle'] ?? inf;
    const part = essere
      ? agreeAdj(base, subjectForms['gender'] ?? 'masc', (subjectForms['number'] ?? 'singular') === 'plural')
      : base;
    return `${aux} ${part}`.trim();
  }
  const aux = STARE_IT[tense][key];
  if (aspect === 'prospective') return `${aux} per ${inf}`.trim();
  return `${aux} ${verbForms['gerund'] ?? inf}`.trim(); // progressive
}

/**
 * The main verb's whole group as an infinitive — what a modal governs. Neutral is the bare
 * infinito ("deve andare"); the marked aspects put their auxiliary in the infinitive ("deve
 * stare andando", "deve stare per andare"). The resultative infinitive apocopates "avere"
 * to "aver" before the participle, as Italian does ("deve aver visto"), while the
 * essere-selecting verbs keep the full auxiliary and agree their participle with the
 * subject ("deve essere andata").
 */
function verbGroupInfinitive(
  verbForms: Record<string, string>,
  subjectForms: Record<string, string>,
  aspect: Aspect,
): string {
  const inf = verbForms['base'] ?? '';
  if (aspect === 'progressive') return `stare ${verbForms['gerund'] ?? inf}`;
  if (aspect === 'prospective') return `stare per ${inf}`;
  if (aspect === 'resultative') {
    const base = verbForms['participle'] ?? inf;
    if (verbForms['aux'] !== 'be') return `aver ${base}`;
    const part = agreeAdj(base, subjectForms['gender'] ?? 'masc', (subjectForms['number'] ?? 'singular') === 'plural');
    return `essere ${part}`;
  }
  return inf;
}

function subjectPhrase(np: ResolvedNounPhrase): string {
  const forms = np.head.forms;
  if (forms['person']) {
    if (forms['number'] === 'plural' && forms['plural']) return forms['plural'];
    return forms['base'] ?? '';
  }
  return renderNP(np, (plural, lead) => artFor(forms, plural, lead)); // noun — determiner from forms
}

/**
 * route path relation → preposition, honoring the head's determiner. The place adverbs
 * (sotto/sopra/dietro/attraverso) take a plain, non-fusing article, so the determiner rides
 * straight off `artFor` ("sotto la casa" / "sotto una casa" / "sotto casa"). "intorno" and
 * "davanti" govern "a", which fuses only with the definite ("intorno alla casa" but
 * "intorno a una casa"), so they route through `prepDet`.
 */
function routeHead(c: ResolvedComplement, plural: boolean, lead: string): string {
  const f = c.phrase.head.forms;
  const adv = (a: string): string => { const det = artFor(f, plural, lead); return det ? `${a} ${det}` : a; };
  switch (pathSpecifier(c)) {
    case 'under':       return adv('sotto');
    case 'over':        return adv('sopra');
    case 'around':      return `intorno ${prepDet('a', f, plural, lead)}`;
    case 'behind':      return adv('dietro');
    case 'in_front_of': return `davanti ${prepDet('a', f, plural, lead)}`;
    case 'through':
    default:            return adv('attraverso');
  }
}

function complementsPhrase(
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
  subjectForms: Record<string, string>,
): string {
  if (!complements) return '';
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      const f = c.phrase.head.forms;
      // Subject complement: a predicate adjective agrees with the *subject* ("sembra
      // stanca"); a predicate noun keeps its own article, no preposition ("diventa una
      // leggenda").
      if (type === 'predicative') {
        if (f['role'] === 'adjective') {
          return agreeAdj(f['base'] ?? '', subjectForms['gender'] ?? 'masc', subjectForms['number'] === 'plural');
        }
        return renderNP(c.phrase, (plural, lead) => artFor(f, plural, lead));
      }
      // A pronoun cause: positive "grazie a me/te/lui…" uses the tonic pronoun; neutral and
      // negative take the possessive, agreeing with feminine "causa"/"colpa" — "a causa mia",
      // "per colpa mia" — NOT "a causa di me" (which sounds off, like "*per colpa di me").
      // "loro" is invariable. Only cause accepts a pronoun in the UI today.
      if (type === 'cause' && f['person']) {
        const sent = causeSentiment(c);
        if (sent === 'positive') return `grazie a ${f['disjunctive'] ?? f['base'] ?? ''}`;
        const plural = f['number'] === 'plural';
        const poss =
          f['person'] === '1' ? (plural ? 'nostra' : 'mia') :
          f['person'] === '2' ? (plural ? 'vostra' : 'tua') :
          plural ? 'loro' : 'sua';
        return sent === 'negative' ? `per colpa ${poss}` : `a causa ${poss}`;
      }
      // locative→in, direction→a, source→"via da" (all fuse with article); route→path prep.
      // A direction toward an *animate* goal takes "da" ("corro dal bambino" = to/towards
      // the child — the "andare da qualcuno" construction), not bare "a", which is for
      // places ("corro alla casa"). Because source also governs "da", it is prefixed with
      // the ablative adverb "via" so the two senses never collide: "corro dal bambino"
      // (motion to) vs "corro via dal bambino" (motion away from).
      // Cause reads "a causa di" + the "di"-fused article ("a causa del cane"); the sentiment
      // swaps the connector — negative "per colpa del cane", positive "grazie al cane" ("a"-fused).
      const causeSent = type === 'cause' ? causeSentiment(c) : 'neutral';
      const headFor = (plural: boolean, lead: string): string =>
        type === 'locative'  ? prepDet('in', f, plural, lead) :
        type === 'terminus'  ? prepDet('a', f, plural, lead) :
        type === 'direction' ? prepDet(f['animate'] === '1' ? 'da' : 'a', f, plural, lead) :
        type === 'source'    ? `via ${prepDet('da', f, plural, lead)}` :
        type === 'cause'     ? (
          causeSent === 'positive' ? `grazie ${prepArt('a', f, plural, lead)}` :
          causeSent === 'negative' ? `per colpa ${prepArt('di', f, plural, lead)}` :
          `a causa ${prepArt('di', f, plural, lead)}`
        ) :
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
  const { verb, negative: verbNegative, modifier, tense = 'present', aspect = 'neutral', modals } = verbPhrase;
  // A modal chain makes the outermost modal the finite verb; every inner modal takes its
  // apocopated infinitive ("voglio poter andare") and the main verb closes the chain as the
  // infinitive of its whole group. "non" is prepended below, exactly as for a plain verb.
  const verbText = modals.length > 0
    ? [
        ...modalChain(modals, (m) => conjugate(m.forms, subjectForms, tense)),
        verbGroupInfinitive(verb.forms, subjectForms, aspect),
      ].join(' ')
    : aspect === 'neutral'
      ? conjugate(verb.forms, subjectForms, tense)
      : aspectVerb(verb.forms, subjectForms, tense, aspect);
  // "mai" always requires "non": "io non bevo mai" even without verbNegative.
  // A "nessun" (no) direct object is post-verbal, so it triggers negative concord —
  // "non vede nessun ragazzo" — whereas a pre-verbal "nessun" subject does not.
  const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
  const objectIsNegative = directObject?.head.forms['definiteness'] === 'no';
  const negText = (verbNegative || modifierIsNegative || objectIsNegative) ? 'non' : '';
  const directObjectText = directObject
    ? renderNP(directObject, (plural, lead) => artFor(directObject.head.forms, plural, lead))
    : '';
  // [non] V Adv DirectObj IndirectObj(a+article)
  const indirectObjectText = indirectObject
    ? renderNP(indirectObject, (plural, lead) => datPrep(indirectObject.head.forms, plural, lead))
    : '';
  const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
  const complementsText = complementsPhrase(complements, subjectForms);
  return [negText, verbText, modifierText, directObjectText, indirectObjectText, complementsText]
    .filter(Boolean)
    .join(' ');
}

/**
 * A relative clause on `np`: invariant "che" for both subject- and object-relatives. A
 * subject-relative agrees with the head ("il ragazzo che piange"); an object-relative
 * carries the clause's own subject, which drives agreement ("il libro che io leggo").
 */
function relativeText(np: ResolvedNounPhrase): string {
  const rel = np.relative;
  if (!rel) return '';
  const subjectRelative = rel.headRole === 'subject' || !rel.subject;
  const agreeForms = subjectRelative ? np.head.forms : rel.subject!.head.forms;
  const subjText = subjectRelative ? '' : subjectPhrase(rel.subject!);
  const pred = predicateText(agreeForms, rel.verbPhrase, rel.directObject, rel.indirectObject, rel.complements);
  return `che ${[subjText, pred].filter(Boolean).join(' ')}`.trim();
}

export const italianEngine: LanguageEngine = {
  language: 'it',
  render(phrase: ResolvedPhrase): string {
    const { subject } = phrase;
    const subjectText = subjectPhrase(subject);
    // Verbless period: a bare noun phrase ("ultime notizie").
    if (!phrase.verbPhrase) return subjectText.trim();
    const predicate = predicateText(
      subject.head.forms, phrase.verbPhrase, phrase.directObject, phrase.indirectObject, phrase.complements,
    );
    return [subjectText, predicate].filter(Boolean).join(' ').trim();
  },
};
