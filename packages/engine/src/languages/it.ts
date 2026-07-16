import { COMPLEMENT_RENDER_ORDER, type Aspect, type ComplementType, type CoordConjunction, type Degree, type ModifierRelation, type Tense } from '@signi/shared';
import { abstractionLevel, actionGerund, actionInfinitive, adjDegree, causeSentiment, firstConjunct, isRelativeSuperlative, joinConjuncts, modalChain, pathSpecifier, type ConceptForms, type Mood, type ResolvedComplement, type ResolvedNounElement, type ResolvedNounPhrase, type ResolvedVerbPhrase, type LanguageEngine, type ResolvedPhrase } from '../types.js';
import { imperativeForm, moodForm, moodPN } from '../mood.js';

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
// The ordinals join them: an ordinal precedes its noun in Italian ("il primo padre", "la
// seconda volta"), unlike the qualifying adjectives that follow it.
const PRENOMINAL = new Set([
  'BIG', 'SMALL', 'GOOD', 'BAD', 'OLD', 'YOUNG', 'NEW', 'BEAUTIFUL',
  'FIRST', 'SECOND', 'THIRD',
]);

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
 * The proximal demonstrative "questo", agreeing in gender/number and eliding before a vowel:
 * masc "questo"/"questi" · fem "questa"/"queste" · "quest'amico", "quest'amica" (the singulars
 * elide; the plurals never do).
 */
function questoForm(forms: Record<string, string>, plural: boolean, lead: string): string {
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  if (plural) return fem ? 'queste' : 'questi';
  if (VOWEL_START.test(lead)) return "quest'";
  return fem ? 'questa' : 'questo';
}

/**
 * The distal demonstrative "quello", which inflects exactly like the definite article —
 * quel/quello/quell' · quei/quegli · quella/quell' · quelle — so it is built by mapping the
 * article `defArticle` picks for the same gender/number/`lead` onto its quel- counterpart.
 */
const QUELLO_FOR_ARTICLE: Record<string, string> = {
  il: 'quel', lo: 'quello', "l'": "quell'", i: 'quei', gli: 'quegli', la: 'quella', le: 'quelle',
};
function quelloForm(forms: Record<string, string>, plural: boolean, lead: string): string {
  const art = defArticle(forms, plural, lead);
  // The feminine singular "l'" maps to "quell'" like the masculine, which the table already
  // gives; every article the function can return is covered, so the fallback never fires.
  return QUELLO_FOR_ARTICLE[art] ?? 'quel';
}

/**
 * The determiner for a subject/direct-object noun phrase, from its `definiteness`
 * (default 'definite'): the definite/indefinite article, nothing (bare), a demonstrative,
 * or a quantifier agreeing in gender (and, for "tutti/e", carrying the definite article).
 */
function artFor(forms: Record<string, string>, plural: boolean, lead: string): string {
  // A proper noun (l'Africa) always takes the definite article in Italian, whatever
  // determiner the user picked; it is a property of the name, not a choice.
  if (forms['proper'] === '1') return defArticle(forms, plural, lead);
  const definiteness = forms['definiteness'] ?? 'definite';
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  // Mass nouns ("acqua") stay singular and take the partitive / singular quantifiers:
  // "dell'acqua", "molta acqua", "poca acqua", "tutta l'acqua".
  if (forms['uncountable'] === '1') {
    switch (definiteness) {
      case 'bare':       return '';
      case 'indefinite': return '';                                   // bare: "bevo acqua"
      case 'this':       return questoForm(forms, false, lead);
      case 'that':       return quelloForm(forms, false, lead);
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
    case 'this':       return questoForm(forms, plural, lead);
    case 'that':       return quelloForm(forms, plural, lead);
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
 *
 * "con" (the instrumental) is the exception that fuses with nothing: modern standard Italian
 * writes "con il coltello", leaving the fused "col" to speech.
 */
function prepDet(prep: 'a' | 'da' | 'in' | 'di' | 'con', forms: Record<string, string>, plural: boolean, lead: string): string {
  if (prep !== 'con' && (forms['definiteness'] ?? 'definite') === 'definite') return prepArt(prep, forms, plural, lead);
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

/**
 * Postnominal attributive nouns as a bare "prep + noun" string ("a vela", "di frasi
 * semantiche"). The modifier is a real noun: it takes its own number and its adjectives
 * agree with *its* gender/number, not the head's ("creatore di frasi semantiche").
 */
function itMods(np: ResolvedNounPhrase): string {
  return np.nounModifiers
    .map((m) => {
      const forms = m.concept.forms;
      const plural = isPlural(forms);
      const noun = surface(forms, plural);
      if (!noun) return '';
      const gender = forms['gender'] ?? 'masc';
      const adjs = m.adjectives
        .map((a) => agreeAdj(a.forms['base'] ?? '', gender, plural))
        .filter(Boolean)
        .join(' ');
      const nounPart = adjs ? `${noun} ${adjs}` : noun;
      return `${REL_PREP_IT[m.relation]} ${nounPart}`;
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
  // Coordinate the postnominal adjectives as a list: commas between all but the last pair, the
  // conjunction only before the last ("forte, felice e freddo"), the way a coordinated noun slot
  // is joined — not the conjunction repeated between every pair.
  const postStr = joinConjuncts(
    post.map((a) => itDeg(a, agreeAdj(a.forms['base'] ?? '', gender, plural))),
    ', ',
    (next) => (/^e/i.test(next) ? ' ed ' : ' e '),
  );
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
// The aspect auxiliaries as minimal concepts, so `moodForm` can derive their conditional
// (apodosis) and imperfect-subjunctive (protasis) exactly as it does a plain verb — from the
// future stem (starò → starebbe) and the infinitive/irregular stem (stare → stesse via
// IT_SUBJ_STEM, essere → fosse via BE, avere → avesse). Without this a marked aspect under a
// hypothetical dropped the mood and kept the plain present indicative.
const STARE_AUX: ConceptForms = { conceptId: 'STARE', forms: { '1sg_future': 'starò', base: 'stare' } };
const ESSERE_AUX: ConceptForms = { conceptId: 'BE', forms: { '1sg_future': 'sarò', base: 'essere' } };
const AVERE_AUX: ConceptForms = { conceptId: 'AVERE', forms: { '1sg_future': 'avrò', base: 'avere' } };

/** The aspect auxiliary's finite form: its mood form under a hypothetical, else the tense form. */
function auxFinite(aux: ConceptForms, table: Record<Tense, Record<string, string>>, subjectForms: Record<string, string>, tense: Tense, mood?: Mood): string {
  return moodForm('it', aux, moodPN(subjectForms), mood) ?? table[tense][auxKey(subjectForms)];
}

function aspectVerb(
  verbForms: Record<string, string>,
  subjectForms: Record<string, string>,
  tense: Tense,
  aspect: Aspect,
  mood?: Mood,
): string {
  const inf = verbForms['base'] ?? '';
  if (aspect === 'resultative') {
    const essere = verbForms['aux'] === 'be';
    const aux = auxFinite(essere ? ESSERE_AUX : AVERE_AUX, essere ? ESSERE_IT : AVERE_IT, subjectForms, tense, mood);
    const base = verbForms['participle'] ?? inf;
    const part = essere
      ? agreeAdj(base, subjectForms['gender'] ?? 'masc', (subjectForms['number'] ?? 'singular') === 'plural')
      : base;
    return `${aux} ${part}`.trim();
  }
  const aux = auxFinite(STARE_AUX, STARE_IT, subjectForms, tense, mood);
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
 * Render every conjunct of a noun slot and coordinate them the Italian way: commas between all
 * but the last pair, the conjunction on the last ("il gatto, il cane e la volpe"). "e" becomes
 * the euphonic "ed" before a word already starting with e- ("il cane ed il gatto" — "ed elefanti").
 */
function coordinate(el: ResolvedNounElement, render: (np: ResolvedNounPhrase) => string): string {
  const link = (next: string) =>
    el.conjunction === 'or' ? ' o ' : /^e/i.test(next) ? ' ed ' : ' e ';
  return joinConjuncts(el.conjuncts.map(render), ', ', link);
}

/** A subject slot: each conjunct with its own article/adjectives/relative, coordinated. */
function subjectText(el: ResolvedNounElement): string {
  return coordinate(el, subjectPhrase);
}

/** One conjunct as a plain noun phrase carrying its own determiner ("una parola"). */
function npText(np: ResolvedNounPhrase): string {
  return renderNP(np, (plural, lead) => artFor(np.head.forms, plural, lead));
}

/**
 * route path relation → preposition, honoring the head's determiner. The place adverbs
 * (sotto/sopra/dietro/attraverso) take a plain, non-fusing article, so the determiner rides
 * straight off `artFor` ("sotto la casa" / "sotto una casa" / "sotto casa"). "intorno" and
 * "davanti" govern "a", which fuses only with the definite ("intorno alla casa" but
 * "intorno a una casa"), so they route through `prepDet`.
 */
function routeHead(c: ResolvedComplement, f: Record<string, string>, plural: boolean, lead: string): string {
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
      // The complement's *kind* (pronoun? adjective? animate goal?) comes off its first conjunct;
      // its surface is rendered from every conjunct, each with its own article and agreement.
      const f = firstConjunct(c.phrase).head.forms;
      // Subject complement: a predicate adjective agrees with the *subject* ("sembra
      // stanca") and carries its own degree ("sembra più stanca"); a predicate noun keeps
      // its own article, no preposition ("diventa una leggenda"). Every conjunct agrees with
      // the subject independently, so a coordinated one reads "sembra stanca e felice" — and a
      // coordinated *subject* resolves to masculine plural first, giving "sembrano stanchi".
      if (type === 'predicative') {
        const gender = subjectForms['gender'] ?? 'masc';
        const plural = subjectForms['number'] === 'plural';
        return coordinate(c.phrase, (np) => {
          if (np.head.forms['role'] !== 'adjective') return npText(np);
          const surface = itDeg(np.head, agreeAdj(np.head.forms['base'] ?? '', gender, plural));
          // A predicative superlative has no noun's article to borrow (unlike "il gatto più
          // grande"), so it supplies its own, agreeing with the subject: "sembra IL più felice",
          // distinguishing it from the comparative "sembra più felice".
          return isRelativeSuperlative(np.head)
            ? joinArt(defArticle({ gender }, plural, surface), surface)
            : surface;
        });
      }
      // An instrument presented as an action: the bare gerundio for the process level
      // ("scegliendo una parola" — Italian needs no preposition before it), and the substantivized
      // infinitive for the concept level ("con lo scegliere una parola"). That infinitive is an
      // ordinary masculine singular noun, so it takes the definite article its *own* sound selects
      // — "lo scegliere" (s-impura), "il mangiare", "l'aprire" — and "con" fuses with none of them.
      // The noun phrase is the action's direct object either way.
      if (type === 'instrumental' && c.action) {
        const level = abstractionLevel(c);
        if (level !== 'object') {
          const object = coordinate(c.phrase, npText);
          const infinitive = actionInfinitive(c.action);
          const verb =
            level === 'process'
              ? actionGerund(c.action)
              : joinWords(['con', defArticle({ gender: 'masc' }, false, infinitive), infinitive]);
          const adverb = c.action.modifier?.forms['base'] ?? '';
          return joinWords([verb, object, adverb]);
        }
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
      // The preposition fuses with the article ("in"+"la" → "nella"), so it cannot be factored
      // out in front of a coordinated complement — each conjunct carries its own fused head:
      // "nella casa e nel bosco", never "*nella casa e il bosco". Repeating it also lets each
      // conjunct choose its own preposition, which `direction` needs — the animate goal takes
      // "da" and the place goal "a" ("corro dal bambino e alla casa").
      // A locative proper noun (a continent — "Europa", "Africa") drops the definite article it
      // carries as a subject ("l'Europa mangia"): the "in place" locative takes a bare "in Europa",
      // not the article-fused "nell'Europa". (Cities would take "a", but only continents are seeded.)
      const causeSent = type === 'cause' ? causeSentiment(c) : 'neutral';
      const headFor = (nf: Record<string, string>) => (plural: boolean, lead: string): string =>
        type === 'locative'  ? (nf['proper'] === '1' ? 'in' : prepDet('in', nf, plural, lead)) :
        type === 'terminus'  ? prepDet('a', nf, plural, lead) :
        type === 'instrumental' ? prepDet('con', nf, plural, lead) :
        type === 'direction' ? (
          // A continent goal takes bare "in" ("va in Antartide"), not the default place "a" with
          // the proper noun's article ("all'Antartide"); an animate goal takes "da", a place "a".
          nf['isA'] === 'CONTINENT' ? 'in' :
          prepDet(nf['animate'] === '1' ? 'da' : 'a', nf, plural, lead)
        ) :
        type === 'source'    ? `via ${prepDet('da', nf, plural, lead)}` :
        type === 'cause'     ? (
          causeSent === 'positive' ? `grazie ${prepArt('a', nf, plural, lead)}` :
          causeSent === 'negative' ? `per colpa ${prepArt('di', nf, plural, lead)}` :
          `a causa ${prepArt('di', nf, plural, lead)}`
        ) :
        routeHead(c, nf, plural, lead);
      return coordinate(c.phrase, (np) => renderNP(np, headFor(np.head.forms)));
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
  directObject?: ResolvedNounElement,
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
): string {
  const { verb, negative: verbNegative, modifier, tense = 'present', aspect = 'neutral', mood, register, modals } = verbPhrase;
  // In a hypothetical conditional the finite element (the outermost modal, or the main verb)
  // takes the conditional (apodosis) or imperfect-subjunctive (protasis) form; the marked
  // aspects keep their indicative auxiliary (aspect under a conditional is a documented gap).
  const pn = moodPN(subjectForms);
  const finite = (m: ConceptForms) => moodForm('it', m, pn, mood) ?? conjugate(m.forms, subjectForms, tense);
  // A modal chain makes the outermost modal the finite verb; every inner modal takes its
  // apocopated infinitive ("voglio poter andare") and the main verb closes the chain as the
  // infinitive of its whole group. "non" is prepended below, exactly as for a plain verb.
  const verbText = modals.length > 0
    ? [
        ...modalChain(modals, finite),
        verbGroupInfinitive(verb.forms, subjectForms, aspect),
      ].join(' ')
    : aspect === 'neutral'
      ? finite(verb)
      : aspectVerb(verb.forms, subjectForms, tense, aspect, mood);
  // "mai" always requires "non": "io non bevo mai" even without verbNegative.
  // A "nessun" (no) direct object is post-verbal, so it triggers negative concord —
  // "non vede nessun ragazzo" — whereas a pre-verbal "nessun" subject does not.
  const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
  // Any "nessun" conjunct triggers the concord — "non vede nessun ragazzo e nessuna ragazza".
  const objectIsNegative = directObject?.conjuncts.some((np) => np.head.forms['definiteness'] === 'no') ?? false;
  const negText = (verbNegative || modifierIsNegative || objectIsNegative) ? 'non' : '';
  const directObjectText = directObject ? coordinate(directObject, npText) : '';
  const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
  const complementsText = complementsPhrase(complements, subjectForms);
  // Imperative: a subjectless command. The subject pronoun's person picks the form (tu / noi /
  // voi); the negative changes it (non + infinito for tu, "non" + the affirmative form for
  // noi/voi). "non" already sits in negText, so reuse it as the negation flag and prefix.
  if (mood === 'imperative') {
    // Italian is the one Romance language whose UI labels keep the imperative ("Salva", "Carica"),
    // so an instruction only pins the person to tu — it has no addressee to take noi/voi from.
    const impPN = register === 'instruction' ? '2sg' : moodPN(subjectForms);
    const impForm = imperativeForm('it', verb, impPN, negText === 'non') ?? verbText;
    return [negText, impForm, modifierText, directObjectText, complementsText]
      .filter(Boolean)
      .join(' ');
  }
  // Italian slots a FREQUENCY adverb between the auxiliary and the past participle of a compound
  // perfect ("ha SEMPRE mangiato", "non ha MAI mangiato"), not after the whole group — where a
  // MANNER adverb does belong ("ha mangiato bene"). Only the resultative splits the verb into
  // auxiliary + participle; a simple tense ("mangia sempre") and a modal chain ("deve mangiare
  // sempre") keep the adverb after the verb, so both stay on the append path below.
  const isFrequency = modifier?.forms['subtype'] === 'frequency';
  if (isFrequency && modifierText && aspect === 'resultative' && modals.length === 0) {
    const [aux, ...rest] = verbText.split(' ');
    const withAdverb = [aux, modifierText, ...rest].join(' ');
    return [negText, withAdverb, directObjectText, complementsText].filter(Boolean).join(' ');
  }
  return [negText, verbText, modifierText, directObjectText, complementsText]
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
  const agreeForms = subjectRelative ? np.head.forms : rel.subject!.agreement;
  const subjText = subjectRelative ? '' : subjectText(rel.subject!);
  const pred = predicateText(agreeForms, rel.verbPhrase, rel.directObject, rel.complements);
  return `che ${[subjText, pred].filter(Boolean).join(' ')}`.trim();
}

/** One clause (subject + predicate), ignoring any attached hypothetical condition. */
function renderClause(phrase: ResolvedPhrase): string {
  const { subject } = phrase;
  // An imperative drops its subject (the person still drives the form — see predicateText).
  const subj = phrase.verbPhrase?.mood === 'imperative' ? '' : subjectText(subject);
  // Verbless period: a bare noun phrase ("ultime notizie").
  if (!phrase.verbPhrase) return subj.trim();
  const predicate = predicateText(
    subject.agreement, phrase.verbPhrase, phrase.directObject, phrase.complements,
  );
  return [subj, predicate].filter(Boolean).join(' ').trim();
}

const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'e',
  or: 'o',
  but: 'ma',
  that_is: 'cioè',
  therefore: 'quindi',
  then: 'e poi',
};

export const italianEngine: LanguageEngine = {
  language: 'it',
  render(phrase: ResolvedPhrase): string {
    const main = renderClause(phrase);
    // Hypothetical conditional: "se <protasis (subjunctive)>, <apodosis (conditional)>".
    const sentence = phrase.condition ? `se ${renderClause(phrase.condition)}, ${main}` : main;
    // Coordination: "<first clause>, <conjunction> <second clause>".
    if (!phrase.coordination) return sentence;
    return `${sentence}, ${COORD_WORDS[phrase.coordination.conjunction]} ${renderClause(phrase.coordination.clause)}`;
  },
  renderWord(word: ConceptForms): string {
    const f = word.forms;
    const base = f['base'] ?? '';
    if (f['role'] !== 'adjective') return base;
    return agreeAdj(base, f['gender'] ?? 'masc', f['number'] === 'plural');
  },
  // The determiner alone, for the menu that picks one. Italian elides and fuses against the word
  // that follows ("l'", "quell'", "un'"), so the citation noun is passed as that word.
  renderDeterminer(noun: ConceptForms): string {
    const f = noun.forms;
    const plural = (f['number'] ?? f['count']) === 'plural';
    const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
    return artFor(f, plural, word);
  },
};
