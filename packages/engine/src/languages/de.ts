import { COMPLEMENT_RENDER_ORDER, type Aspect, type ComplementType, type Tense } from '@signi/shared';
import { adjDegree, causeSentiment, pathSpecifier, type ConceptForms, type ResolvedComplement, type LanguageEngine, type ResolvedNounPhrase, type ResolvedPhrase } from '../types.js';

// German comparison is synthetic: the comparative adds "-er" and the superlative "-st" to
// the stem *before* the case/gender declension ending ("schön" → "schöner-e" / "schönst-e",
// the superlative leaning on the noun's definite article). Inferiority/equality stay
// periphrastic ("weniger schön", "gleich schön"). MVP: ignores umlaut and irregular stems.
function deDegStem(a: ConceptForms, base: string): string {
  const d = adjDegree(a);
  if (d === 'more') return `${base}er`;
  if (d === 'most') return `${base}st`;
  return base;
}
/** Invariant adverb placed before the declined adjective for the periphrastic degrees. */
function deDegPrefix(a: ConceptForms): string {
  const d = adjDegree(a);
  if (d === 'less') return 'weniger ';
  if (d === 'least') return 'am wenigsten ';
  if (d === 'equally') return 'gleich ';
  return '';
}

type Case = 'nom' | 'acc' | 'dat';
type Slot = 'masc' | 'fem' | 'neut' | 'plural';

// Weak adjective declension (after a definite article: der/die/das).
const WEAK_ENDINGS: Record<Case, Record<Slot, string>> = {
  nom: { masc: 'e',  fem: 'e',  neut: 'e',  plural: 'en' },
  acc: { masc: 'en', fem: 'e',  neut: 'e',  plural: 'en' },
  dat: { masc: 'en', fem: 'en', neut: 'en', plural: 'en' },
};

// Mixed declension (after an indefinite article: ein/eine) — nom/acc only, since a
// subject/direct object is the only place non-definite determiners appear.
const MIXED_ENDINGS: Record<'nom' | 'acc', Record<Slot, string>> = {
  nom: { masc: 'er', fem: 'e', neut: 'es', plural: 'en' },
  acc: { masc: 'en', fem: 'e', neut: 'es', plural: 'en' },
};

// Strong declension (no article: bare noun phrase, and article-less indefinite plurals),
// where the adjective itself carries the case/gender the article would otherwise show.
const STRONG_ENDINGS: Record<'nom' | 'acc', Record<Slot, string>> = {
  nom: { masc: 'er', fem: 'e', neut: 'es', plural: 'e' },
  acc: { masc: 'en', fem: 'e', neut: 'es', plural: 'e' },
};

// Strong dative (article-less dative complement — "mit gutem Wein", "guter Milch",
// "guten Häusern"): the adjective carries the dative gender/number ending.
const STRONG_DAT: Record<Slot, string> = { masc: 'em', fem: 'er', neut: 'em', plural: 'en' };

// Pick the ending table for a case + determiner. In the dative a *bare* phrase declines
// strong (the adjective carries the case); every other dative determiner — definite,
// ein-/kein- (mixed → -en), and einige/viele/wenige/alle — takes the invariant weak -en.
// In nom/acc an indefinite *plural* has no article, so it declines strong like a bare phrase.
//   • kein- ("no")      → like ein-: mixed in the singular, weak in the plural.
//   • einige/viele/wenige (some/many/few) → strong (no article carries the case).
//   • alle ("all") and the definite article → weak.
function endingsFor(_case: Case, definiteness: string, plural: boolean): Record<Slot, string> {
  if (_case === 'dat') return definiteness === 'bare' ? STRONG_DAT : WEAK_ENDINGS.dat;
  if (definiteness === 'bare') return STRONG_ENDINGS[_case];
  if (definiteness === 'indefinite') return plural ? STRONG_ENDINGS[_case] : MIXED_ENDINGS[_case];
  if (definiteness === 'no') return plural ? WEAK_ENDINGS[_case] : MIXED_ENDINGS[_case];
  if (definiteness === 'some' || definiteness === 'many' || definiteness === 'few')
    return STRONG_ENDINGS[_case];
  return WEAK_ENDINGS[_case]; // 'all' and 'definite'
}

function declineAdj(base: string, _case: Case, gender: string, plural: boolean, definiteness: string): string {
  const slot: Slot = plural ? 'plural' : gender === 'masc' || gender === 'fem' ? gender : 'neut';
  let ending = endingsFor(_case, definiteness, plural)[slot];
  // Stems already ending in -e (e.g. "müde") absorb the ending's leading e.
  if (ending.startsWith('e') && base.endsWith('e')) ending = ending.slice(1);
  return base + ending;
}

// Decline every attributive adjective of a noun phrase for the given case, agreeing with
// the head's gender/number and determiner. Returns "" when there are none.
//
// Some heads carry an inherent adjective of their own — the concept YOUNG_WOMAN is one word
// in most languages but "junge Frau" in German. It can't be baked into the lemma, because
// its ending tracks case and determiner just like any other adjective, so the lexicon stores
// the bare stem in forms.adjective and it declines here. It sits closest to the noun, after
// the phrase's own adjectives ("die schönen jungen Frauen").
function adjPhrase(np: ResolvedNounPhrase, _case: Case, definiteness = 'definite'): string {
  const f = np.head.forms;
  const gender = f['gender'] ?? 'neut';
  const plural = (f['number'] ?? f['count']) === 'plural';
  const decline = (stem: string): string => declineAdj(stem, _case, gender, plural, definiteness);
  const own = np.adjectives
    .map((a) => {
      const base = a.forms['base'];
      if (!base) return '';
      // Synthesise the comparative/superlative stem, decline it, then prefix any
      // periphrastic degree adverb ("weniger schöne", "am wenigsten schöne").
      return `${deDegPrefix(a)}${decline(deDegStem(a, base))}`;
    })
    .filter(Boolean);
  const inherent = f['adjective'];
  return [...own, inherent ? decline(inherent) : ''].filter(Boolean).join(' ');
}

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

// The indefinite article ein-, declined for case/gender. Plural has no indefinite
// article (bare). Only nom/acc are reachable (subject/direct object).
function indefArticle(_case: 'nom' | 'acc' | 'dat', gender: string, plural: boolean): string {
  if (plural) return '';
  if (_case === 'acc') return gender === 'masc' ? 'einen' : gender === 'fem' ? 'eine' : 'ein';
  if (_case === 'dat') return gender === 'fem' ? 'einer' : 'einem';
  return gender === 'fem' ? 'eine' : 'ein'; // nominative: masc/neut ein, fem eine
}

// "kein" (no), declined like ein- but with a plural (keine / keinen in the dative).
function keinForm(_case: 'nom' | 'acc' | 'dat', gender: string, plural: boolean): string {
  if (plural) return _case === 'dat' ? 'keinen' : 'keine';
  if (_case === 'acc') return gender === 'masc' ? 'keinen' : gender === 'fem' ? 'keine' : 'kein';
  if (_case === 'dat') return gender === 'fem' ? 'keiner' : 'keinem';
  return gender === 'fem' ? 'keine' : 'kein'; // nominative: masc/neut kein, fem keine
}

/**
 * The determiner for a noun phrase, from its `definiteness` (default 'definite'), declined
 * for case — including the dative, which the motion/dative complements use (einem/einer,
 * keinem/keiner, einigen/vielen/wenigen/allen). "kein" is self-negating (no verb concord);
 * einige/viele/wenige/alle are plural quantifiers.
 */
function determiner(forms: Record<string, string>, _case: 'nom' | 'acc' | 'dat', plural: boolean): string {
  // A continent name like "Afrika" goes bare in German (no article), whatever determiner
  // the user picked.
  if (forms['proper'] === '1') return '';
  const definiteness = forms['definiteness'] ?? 'definite';
  if (definiteness === 'definite') return defArticle(forms, _case, plural);
  const gender = forms['gender'] ?? 'neut';
  // Mass nouns ("Wasser") stay singular and take the invariant mass quantifiers
  // "etwas / viel / wenig"; "all das Wasser"; no indefinite article.
  if (forms['uncountable'] === '1') {
    switch (definiteness) {
      case 'bare':        return '';
      case 'indefinite':  return '';                       // no "ein Wasser"
      case 'no':          return keinForm(_case, gender, false);
      case 'some':        return 'etwas';
      case 'many':        return 'viel';
      case 'few':         return 'wenig';
      case 'all':         return `all ${defArticle(forms, _case, false)}`;
      default:            return defArticle(forms, _case, false);
    }
  }
  // Dative plural quantifiers add -n (mit einigen/vielen/wenigen/allen Häusern).
  const dat = _case === 'dat';
  switch (definiteness) {
    case 'bare': return '';
    case 'no':   return keinForm(_case, gender, plural);
    case 'some': return dat ? 'einigen' : 'einige';
    case 'many': return dat ? 'vielen' : 'viele';
    case 'few':  return dat ? 'wenigen' : 'wenige';
    case 'all':  return dat ? 'allen' : 'alle';
    default:     return indefArticle(_case, gender, plural);
  }
}

/**
 * A complement's preposition + case-declined determiner, honoring `definiteness`. Only a
 * *definite* article triggers the German preposition-article fusions (in+dem=im, zu+dem=zum,
 * zu+der=zur); any other determiner (einem, keiner, vielen, bare) rides after the plain
 * preposition. An empty `prep` is the bare-dative terminus — the determiner alone.
 */
function prepDet(prep: string, forms: Record<string, string>, _case: 'nom' | 'acc' | 'dat', plural: boolean): string {
  const det = determiner(forms, _case, plural);
  if ((forms['definiteness'] ?? 'definite') === 'definite') {
    if (prep === 'in' && det === 'dem') return 'im';
    if (prep === 'zu' && det === 'dem') return 'zum';
    if (prep === 'zu' && det === 'der') return 'zur';
  }
  if (!prep) return det;
  return det ? `${prep} ${det}` : prep;
}

function conjugate(forms: Record<string, string>, subjectForms: Record<string, string>, tense: Tense = 'present'): string {
  const person = subjectForms['person'] ?? '3';
  const number = subjectForms['number'] ?? 'singular';
  const n = number === 'plural' ? 'pl' : 'sg';
  return forms[`${person}${n}_${tense}`] ?? forms[tense] ?? forms[`${person}${n}_present`] ?? forms['base'] ?? '';
}

/** Conjugate from a person-number key ("3sg") — the shape this engine's callers carry. */
function conjPn(forms: Record<string, string>, pn: string, tense: Tense): string {
  return forms[`${pn}_${tense}`] ?? forms[tense] ?? forms[`${pn}_present`] ?? forms['base'] ?? '';
}

// Present-tense forms of the auxiliary "werden", used to build the periphrastic
// future ("ich werde essen"). The infinitive is placed at the clause end.
const WERDEN: Record<string, string> = {
  '1sg': 'werde', '2sg': 'wirst', '3sg': 'wird',
  '1pl': 'werden', '2pl': 'werdet', '3pl': 'werden',
};

// "sein", the copula of the prospective ("ist im Begriff zu gehen") and the resultative
// auxiliary of the verbs that select it ("ist gegangen"). Only present and past are synthetic;
// the future is periphrastic on "werden" (see VERB_GROUP below), so no future column is needed.
const SEIN: Record<'present' | 'past', Record<string, string>> = {
  present: { '1sg': 'bin', '2sg': 'bist', '3sg': 'ist', '1pl': 'sind', '2pl': 'seid', '3pl': 'sind' },
  past:    { '1sg': 'war', '2sg': 'warst', '3sg': 'war', '1pl': 'waren', '2pl': 'wart', '3pl': 'waren' },
};

// "haben", the resultative auxiliary everywhere else ("hat gesehen"), the majority case.
const HABEN: Record<'present' | 'past', Record<string, string>> = {
  present: { '1sg': 'habe', '2sg': 'hast', '3sg': 'hat', '1pl': 'haben', '2pl': 'habt', '3pl': 'haben' },
  past:    { '1sg': 'hatte', '2sg': 'hattest', '3sg': 'hatte', '1pl': 'hatten', '2pl': 'hattet', '3pl': 'hatten' },
};

/**
 * The German verb complex for a tense + aspect, split across the clause: `v2` is the finite
 * verb in the V2 slot, `mid` is any material that follows it in the Mittelfeld ("gerade",
 * "im Begriff"), and `tail` is the clause-final non-finite material. German has no synthetic
 * progressive, so it is rendered with the adverb "gerade" over the plain finite verb; the
 * prospective is "im Begriff … zu + Infinitiv"; the resultative is sein/haben + Partizip II,
 * the auxiliary being a lexical property of the verb (the seed marks the sein-selecting ones
 * with forms.aux = "be") — "ist gegangen" but "hat gesehen".
 */
function verbGroup(
  verbForms: Record<string, string>,
  pn: string,
  tense: Tense,
  aspect: Aspect,
): { v2: string; mid: string; tail: string } {
  const base = verbForms['base'] ?? '';
  const participle = verbForms['participle'] ?? base;
  const isFuture = tense === 'future';
  const sein = isFuture ? '' : SEIN[tense][pn];
  const perfAux = verbForms['aux'] === 'be' ? 'sein' : 'haben';
  const perfFinite = isFuture ? '' : (perfAux === 'sein' ? SEIN : HABEN)[tense][pn];
  const conjug = isFuture ? (WERDEN[pn] ?? 'wird') : (verbForms[`${pn}_${tense}`] ?? verbForms[tense] ?? verbForms[`${pn}_present`] ?? base);
  switch (aspect) {
    case 'progressive':
      // Plain finite verb + "gerade"; future keeps werden … Infinitiv, with "gerade" mid.
      return { v2: conjug, mid: 'gerade', tail: isFuture ? base : '' };
    case 'prospective':
      return {
        v2: isFuture ? (WERDEN[pn] ?? 'wird') : sein,
        mid: 'im Begriff',
        tail: isFuture ? `sein zu ${base}` : `zu ${base}`,
      };
    case 'resultative':
      // Future perfect stacks the auxiliary's infinitive at the clause end: "wird gesehen haben".
      return {
        v2: isFuture ? (WERDEN[pn] ?? 'wird') : perfFinite,
        mid: '',
        tail: isFuture ? `${participle} ${perfAux}` : participle,
      };
    default: // neutral
      return { v2: conjug, mid: '', tail: isFuture ? base : '' };
  }
}

/**
 * A modal chain's clause-final infinitive stack, in German's mirror order: the innermost
 * modal sits nearest the verb group it governs and the outermost furthest right — "er will
 * gehen können müssen" (wants to have to be able to go). When the outermost modal is itself
 * finite in the V2 slot it is left out of the stack ("er will gehen können"); in the future
 * "werden" holds V2 instead, so every modal stacks ("er wird gehen müssen").
 */
function modalStack(modals: ConceptForms[], includeOutermost: boolean): string[] {
  const infinitives = modals.map((m) => m.forms['nonfinite'] ?? m.forms['base'] ?? '');
  return (includeOutermost ? infinitives : infinitives.slice(1)).reverse().filter(Boolean);
}

/**
 * The verb complex when a modal chain governs the predicate. The outermost modal is the
 * finite verb in the V2 slot, and the clause closes with the main verb group's infinitive
 * followed by the modal stack. The aspect contributes exactly the material it does without a
 * modal, only non-finite: "gerade" in the Mittelfeld for the progressive, "im Begriff … zu …
 * sein" for the prospective, and Partizip + sein/haben for the resultative — so "er muss die
 * Katze gesehen haben" and "er wird gehen müssen" both fall out of the same shape.
 */
function modalVerbGroup(
  modals: ConceptForms[],
  verbForms: Record<string, string>,
  pn: string,
  tense: Tense,
  aspect: Aspect,
): { v2: string; mid: string; tail: string } {
  const base = verbForms['base'] ?? '';
  const participle = verbForms['participle'] ?? base;
  const perfAux = verbForms['aux'] === 'be' ? 'sein' : 'haben';
  const group =
    aspect === 'progressive' ? { mid: 'gerade', tail: [base] } :
    aspect === 'prospective' ? { mid: 'im Begriff', tail: [`zu ${base}`, 'sein'] } :
    aspect === 'resultative' ? { mid: '', tail: [participle, perfAux] } :
    { mid: '', tail: [base] };
  const isFuture = tense === 'future';
  return {
    v2: isFuture ? (WERDEN[pn] ?? 'wird') : conjPn(modals[0].forms, pn, tense),
    mid: group.mid,
    tail: [...group.tail, ...modalStack(modals, isFuture)].join(' '),
  };
}

/**
 * A possessor rendered colloquially as "von" + dative ("das Buch vom Kind"): von+dem
 * fuses to "vom", otherwise "von der/den". The possessor's adjectives decline dative;
 * recursion carries its own nested possessor and relative clause. Empty when absent.
 */
function possessorText(np: ResolvedNounPhrase): string {
  const poss = np.possessor;
  if (!poss) return '';
  const f = poss.head.forms;
  const plural = (f['number'] ?? f['count']) === 'plural';
  const word = datPluralN(germanCompound(poss, plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '')), 'dat', plural);
  const art = defArticle(f, 'dat', plural); // dem / der / den
  const von = art === 'dem' ? 'vom' : `von ${art}`;
  const declined = adjPhrase(poss, 'dat');
  const adj = declined ? `${declined} ` : '';
  return ` ${von} ${adj}${word}${possessorText(poss)}${subordinateClause(poss)}`;
}

/**
 * German realises an attributive noun as a closed compound ("Segel" + "Boot" →
 * "Segelboot"): the modifiers are prefixed onto the head and every element but the first
 * has its initial lowercased. The relation is neutralised. Gender/declension stay the
 * head's (the compound's last element), so only the surface `word` changes. (Linking
 * morphemes like the -s- in "Arbeitsplatz" are a known simplification.)
 */
function germanCompound(np: ResolvedNounPhrase, headWord: string): string {
  const mods = np.nounModifiers.map((m) => m.concept.forms['base']).filter(Boolean);
  if (!mods.length || !headWord) return headWord;
  return [...mods, headWord]
    .map((p, i) => (i === 0 ? p : p.charAt(0).toLowerCase() + p.slice(1)))
    .join('');
}

/**
 * Dative plural nouns take an -n ("den/vielen Häusern"), unless the plural already ends in
 * -n or -s ("den Katzen", "den Autos"). Applied wherever a noun surfaces in the dative.
 */
function datPluralN(word: string, _case: Case, plural: boolean): string {
  return _case === 'dat' && plural && word && !/[ns]$/.test(word) ? `${word}n` : word;
}

function nounPhrase(np: ResolvedNounPhrase, _case: 'nom' | 'acc' | 'dat'): string {
  const forms = np.head.forms;
  const count = forms['number'] ?? forms['count'] ?? 'singular';
  const plural = count === 'plural';
  const headWord = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const word = datPluralN(germanCompound(np, headWord), _case, plural);
  const definiteness = forms['definiteness'] ?? 'definite';
  const declined = adjPhrase(np, _case, definiteness);
  const a = declined ? `${declined} ` : '';
  const art = determiner(forms, _case, plural); // der/die/das · ein/eine/einen · (bare)
  const lead = art ? `${art} ` : '';
  return `${lead}${a}${word}${possessorText(np)}${subordinateClause(np)}`;
}

function subjectPhrase(np: ResolvedNounPhrase): string {
  const forms = np.head.forms;
  if (forms['person']) {
    if (forms['number'] === 'plural' && forms['plural']) return forms['plural'];
    return forms['base'] ?? '';
  }
  return nounPhrase(np, 'nom'); // noun — nominative article
}

// durch/um govern accusative; the static-relation two-way preps
// (unter/über/hinter/vor) take dative here.
function routeCase(c: ResolvedComplement): 'acc' | 'dat' {
  const spec = pathSpecifier(c);
  return spec === 'through' || spec === 'around' ? 'acc' : 'dat';
}

// route path relation → preposition + case-declined determiner (none of these preps fuse).
function routeHead(c: ResolvedComplement, plural: boolean): string {
  const f = c.phrase.head.forms;
  const _case = routeCase(c);
  switch (pathSpecifier(c)) {
    case 'under':       return prepDet('unter', f, _case, plural);
    case 'over':        return prepDet('über', f, _case, plural);
    case 'around':      return prepDet('um', f, _case, plural);
    case 'behind':      return prepDet('hinter', f, _case, plural);
    case 'in_front_of': return prepDet('vor', f, _case, plural);
    case 'through':
    default:            return prepDet('durch', f, _case, plural);
  }
}

function complementsPhrase(complements?: Partial<Record<ComplementType, ResolvedComplement>>): string {
  if (!complements) return '';
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      const f = c.phrase.head.forms;
      // A pronoun cause ("wegen mir/ihr/ihnen") uses the dative form with no article — the
      // colloquial dative that "wegen" already takes. Positive credits with "dank" ("dank
      // dir"); German has no clean prepositional blame connector short of the genitive
      // "durch … Schuld", so negative renders like neutral ("wegen"). Only cause takes a pronoun.
      if (type === 'cause' && f['person']) {
        const prep = causeSentiment(c) === 'positive' ? 'dank' : 'wegen';
        return `${prep} ${f['disjunctive'] ?? f['base'] ?? ''}`;
      }
      // Subject complement: a German predicate adjective is uninflected ("wird müde",
      // "scheint groß" — no declension endings); a predicate noun takes the *nominative*
      // case, not the dative the other complements use ("wird eine Legende").
      if (type === 'predicative') {
        if (f['role'] === 'adjective') return f['base'] ?? '';
        return nounPhrase(c.phrase, 'nom');
      }
      const plural = (f['number'] ?? f['count']) === 'plural';
      const definiteness = f['definiteness'] ?? 'definite';
      const compound = germanCompound(c.phrase, plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? ''));
      // route → path preposition (+ its case); locative/direction/source → two-way preps +
      // dative. The in+dem=im / zu+dem=zum / zu+der=zur fusions fire only for a definite
      // article; any other determiner (einem, keiner, vielen, bare) stays uncontracted.
      let head: string;
      let _case: 'nom' | 'acc' | 'dat';
      if (type === 'route') {
        _case = routeCase(c);
        head = routeHead(c, plural);
      } else {
        _case = 'dat';
        // Cause: "wegen" governs the genitive formally, but the dative ("wegen dem Hund") is
        // standard in speech and reuses the dative determiners; positive credits with "dank".
        if (type === 'locative')  head = prepDet('in', f, 'dat', plural);
        else if (type === 'direction') head = prepDet('zu', f, 'dat', plural);
        else if (type === 'cause') head = prepDet(causeSentiment(c) === 'positive' ? 'dank' : 'wegen', f, 'dat', plural);
        // Terminus (dative recipient) is a bare dative — no preposition, just the dative
        // determiner ("der Katze"), the same case German gives the plain indirect object.
        else if (type === 'terminus') head = prepDet('', f, 'dat', plural);
        else /* source */         head = prepDet('aus', f, 'dat', plural);
      }
      const word = datPluralN(compound, _case, plural);
      const declined = adjPhrase(c.phrase, _case, definiteness);
      const adj = declined ? `${declined} ` : '';
      const rest = `${adj}${word}${possessorText(c.phrase)}${subordinateClause(c.phrase)}`;
      return head ? `${head} ${rest}` : rest;
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * A restrictive relative clause on `np`, German-style: comma, relative pronoun agreeing
 * with the head in gender/number and case, then the clause with its finite verb pushed to
 * the end. A subject-relative uses a nominative pronoun and the head drives agreement
 * ("der Junge, der weint"). A direct-object relative uses an accusative pronoun, renders
 * the clause's own subject, and that subject drives agreement ("das Buch, das ich lese").
 * For nominative/accusative the relative pronoun coincides with the definite article
 * (der/die/das · den/die/das); genitive ("dessen") and dative ("denen") relatives —
 * indirect/complement — are not modelled and fall back to accusative. Returns "" if `np`
 * has no relative. (The closing comma is omitted; a known first-cut simplification.)
 */
function subordinateClause(np: ResolvedNounPhrase): string {
  const rel = np.relative;
  if (!rel) return '';
  const f = np.head.forms;
  const plural = (f['number'] ?? f['count']) === 'plural';
  const subjectRelative = rel.headRole === 'subject' || !rel.subject;
  // nom for a subject-relative, acc for a (direct-)object relative. TODO: gen/dat pronouns.
  const pronoun = defArticle(f, subjectRelative ? 'nom' : 'acc', plural);
  // Agreement + the rendered clause subject: the head fills it for a subject-relative;
  // otherwise the clause carries its own nominative subject.
  const agreeForms = subjectRelative ? f : rel.subject!.head.forms;
  const clauseSubjectText = subjectRelative ? '' : subjectPhrase(rel.subject!);

  const { verb, negative: verbNegative, modifier, tense = 'present', modals } = rel.verbPhrase;
  const person = agreeForms['person'] ?? '3';
  const aPlural = (agreeForms['number'] ?? agreeForms['count']) === 'plural';
  const pn = `${person}${aPlural ? 'pl' : 'sg'}`;
  const isFuture = tense === 'future';
  // Verb-final: the finite verb closes the clause. Future puts the infinitive
  // just before the clause-final finite "werden" ("der Wein trinken wird"). A modal chain
  // makes its outermost member the finite verb and pushes the main verb's infinitive plus
  // the modal stack in front of it ("der Junge, der gehen können muss").
  const finite = isFuture
    ? (WERDEN[pn] ?? 'wird')
    : modals.length > 0
      ? conjPn(modals[0].forms, pn, tense)
      : conjugate(verb.forms, agreeForms, tense);
  const infinitive = modals.length > 0
    ? [verb.forms['base'] ?? '', ...modalStack(modals, isFuture)].join(' ')
    : isFuture ? (verb.forms['base'] ?? '') : '';

  const indirectObjectText = rel.indirectObject ? nounPhrase(rel.indirectObject, 'dat') : '';
  const directObjectText = rel.directObject ? nounPhrase(rel.directObject, 'acc') : '';
  const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
  const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
  const nicht = verbNegative && !modifierIsNegative ? 'nicht' : '';
  const complementsText = complementsPhrase(rel.complements);

  const body = [pronoun, clauseSubjectText, indirectObjectText, directObjectText, complementsText, modifierText, nicht, infinitive, finite]
    .filter(Boolean)
    .join(' ');
  return `, ${body}`;
}

export const germanEngine: LanguageEngine = {
  language: 'de',
  render(phrase: ResolvedPhrase): string {
    const { subject, verbPhrase, directObject, indirectObject } = phrase;
    const subjectText = subjectPhrase(subject);
    // Verbless period: a bare noun phrase ("aktuelle Nachrichten").
    if (!verbPhrase) return subjectText.trim();
    const { verb, negative: verbNegative, modifier, tense = 'present', aspect = 'neutral' } = verbPhrase;

    // The verb complex is split across the clause: the finite verb (werden/sein, the outermost
    // modal, or the conjugated main verb) sits in the V2 slot, any "gerade"/"im Begriff"
    // follows it, and the non-finite tail (infinitive / Partizip / "zu …" / the modal stack)
    // closes the clause. Aspect is rendered here in the main clause only (relative clauses
    // stay neutral — a known gap).
    const person = subject.head.forms['person'] ?? '3';
    const number = subject.head.forms['number'] ?? 'singular';
    const pn = `${person}${number === 'plural' ? 'pl' : 'sg'}`;
    const { v2: verbText, mid: aspectMid, tail: infinitiveTail } = verbPhrase.modals.length > 0
      ? modalVerbGroup(verbPhrase.modals, verb.forms, pn, tense, aspect)
      : verbGroup(verb.forms, pn, tense, aspect);
    const directObjectText = directObject
      ? nounPhrase(directObject, 'acc')
      : '';
    // German: dative (indirect) comes BEFORE accusative (direct) when both are noun phrases
    const indirectObjectText = indirectObject
      ? nounPhrase(indirectObject, 'dat')
      : '';
    const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';

    // "nicht" precedes the modifier when one exists ("nicht immer"),
    // otherwise trails after objects ("das Brot nicht").
    // Skip "nicht" when the modifier is already negative ("nie" = never).
    const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
    const applyNicht = verbNegative && !modifierIsNegative;
    // A predicate complement (copula/BECOME: "ist vorsichtig") is negated by "nicht"
    // *before* it — "ist nicht vorsichtig", not "*ist vorsichtig nicht". With an adverb
    // present the "nicht immer" placement already covers it, so guard on !modifierText.
    const hasPredicative = !!phrase.complements?.['predicative'];
    const negBefore = applyNicht && modifierText ? 'nicht' : '';
    const negComplement = applyNicht && hasPredicative && !modifierText ? 'nicht' : '';
    const negAfter  = applyNicht && !modifierText && !hasPredicative ? 'nicht' : '';
    const complementsText = complementsPhrase(phrase.complements);
    return [subjectText, verbText, aspectMid, negBefore, modifierText, indirectObjectText, directObjectText, negComplement, complementsText, negAfter, infinitiveTail]
      .filter(Boolean).join(' ').trim();
  },
};
