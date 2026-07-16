import { COMPLEMENT_RENDER_ORDER, type Aspect, type ComplementType, type CoordConjunction, type Tense } from '@signi/shared';
import { abstractionLevel, actionInfinitive, adjDegree, causeSentiment, firstConjunct, joinConjuncts, pathSpecifier, type ConceptForms, type ResolvedComplement, type LanguageEngine, type ResolvedNounElement, type ResolvedNounPhrase, type ResolvedPhrase } from '../types.js';

/** The comparative stem: "-er", or a bare "-r" on a base already ending in -e (müde → müder). */
function deComparative(base: string): string {
  return base.endsWith('e') ? `${base}r` : `${base}er`;
}

/**
 * Umlaut the stem vowel (a→ä, o→ö, u→ü, au→äu). Most monosyllabic adjectives mutate under
 * comparison (alt → älter, groß → größer), but many do not (klar → klarer, not *klärer) — the
 * distinction is lexical, so this is applied only when the lexeme carries the seeded `umlaut`
 * flag, never as a blanket rule. Mutates the last stem vowel (the one before the final consonant
 * run), which is the comparison-relevant one in the monosyllables that umlaut.
 */
const DE_UMLAUT: Record<string, string> = { a: 'ä', o: 'ö', u: 'ü', au: 'äu' };
function deUmlaut(base: string): string {
  return base.replace(/(au|[aou])(?=[^aeiouäöü]*$)/, (v) => DE_UMLAUT[v] ?? v);
}

/** The comparison stem: the umlauted base when the lexeme is flagged for it, else the base. */
function deStem(a: ConceptForms, base: string): string {
  return a.forms['umlaut'] ? deUmlaut(base) : base;
}

/**
 * The superlative suffix, with the epenthetic -e- German inserts to keep the "-st" pronounceable
 * after a stem ending in a dental/sibilant — -d, -t, -s, -ß, -z, -sch (interessant → interessantest,
 * kalt → kältest, heiß → heißest). Elsewhere the bare "-st" (jung → jüngst, schnell → schnellst).
 */
function deSuperlativeSuffix(stem: string): string {
  return /(sch|[dtsßz])$/.test(stem) ? 'est' : 'st';
}

// German comparison is synthetic: the comparative adds "-er" and the superlative "-st" to
// the stem *before* the case/gender declension ending ("schön" → "schöner-e" / "schönst-e",
// the superlative leaning on the noun's definite article). Inferiority/equality stay
// periphrastic ("weniger schön", "gleich schön"). Suppletives (gut → besser / best) and the
// irregular groß → größt are seeded whole on the lexeme (`comparative` / `superlative`); umlaut
// and superlative epenthesis are otherwise derived by rule from the seeded `umlaut` flag.
function deDegStem(a: ConceptForms, base: string): string {
  const d = adjDegree(a);
  if (d === 'more') return a.forms['comparative'] ?? deComparative(deStem(a, base));
  if (d === 'most') {
    if (a.forms['superlative']) return a.forms['superlative'];
    const stem = deStem(a, base);
    return `${stem}${deSuperlativeSuffix(stem)}`;
  }
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

/**
 * A predicate adjective ("wird müde") — undeclined, but still compared. The comparative
 * stays synthetic ("müder"); the *predicative* superlative takes the fixed "am …sten" frame
 * ("am müdesten"), which the attributive "-st" + declension ending can't express. The
 * periphrastic degrees reuse the prefix above ("weniger müde", "gleich müde").
 */
function dePredAdj(a: ConceptForms): string {
  const base = a.forms['base'] ?? '';
  if (!base) return '';
  const d = adjDegree(a);
  if (d === 'more') return a.forms['comparative'] ?? deComparative(deStem(a, base));
  if (d === 'most') {
    // The predicative superlative is the fixed "am …sten" frame; a seeded irregular stem
    // (größt, best) slots straight into it, else the umlaut/epenthesis rules build the stem.
    if (a.forms['superlative']) return `am ${a.forms['superlative']}en`;
    const stem = deStem(a, base);
    return `am ${stem}${deSuperlativeSuffix(stem)}en`;
  }
  return `${deDegPrefix(a)}${base}`;
}

type Case = 'nom' | 'acc' | 'dat' | 'gen';
type Slot = 'masc' | 'fem' | 'neut' | 'plural';

// Weak adjective declension (after a definite article: der/die/das). The genitive row is also
// the *mixed* genitive: after any determiner at all, a genitive adjective is invariably -en
// ("des großen Wortes", "eines großen Wortes").
const WEAK_ENDINGS: Record<Case, Record<Slot, string>> = {
  nom: { masc: 'e',  fem: 'e',  neut: 'e',  plural: 'en' },
  acc: { masc: 'en', fem: 'e',  neut: 'e',  plural: 'en' },
  dat: { masc: 'en', fem: 'en', neut: 'en', plural: 'en' },
  gen: { masc: 'en', fem: 'en', neut: 'en', plural: 'en' },
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

// Strong genitive (article-less genitive — "guten Weines", "guter Milch", "guter Wörter"): the
// masculine/neuter -en leans on the noun's own -(e)s, which already marks the case there.
const STRONG_GEN: Record<Slot, string> = { masc: 'en', fem: 'er', neut: 'en', plural: 'er' };

// Pick the ending table for a case + determiner. In the dative a *bare* phrase declines
// strong (the adjective carries the case); every other dative determiner — definite,
// ein-/kein- (mixed → -en), and einige/viele/wenige/alle — takes the invariant weak -en.
// In nom/acc an indefinite *plural* has no article, so it declines strong like a bare phrase.
//   • kein- ("no")      → like ein-: mixed in the singular, weak in the plural.
//   • einige/viele/wenige (some/many/few) → strong (no article carries the case).
//   • alle ("all"), dies-/jen- (this/that) and the definite article → weak: they are
//     der-words, carrying the case/gender ending themselves.
function endingsFor(_case: Case, definiteness: string, plural: boolean): Record<Slot, string> {
  if (_case === 'dat') return definiteness === 'bare' ? STRONG_DAT : WEAK_ENDINGS.dat;
  // The genitive collapses weak and mixed alike to -en, so only a phrase with no article at all
  // declines strong: a bare one, the article-less quantifiers, and the indefinite plural.
  if (_case === 'gen') {
    const articleless =
      definiteness === 'bare' ||
      definiteness === 'some' || definiteness === 'many' || definiteness === 'few' ||
      (definiteness === 'indefinite' && plural);
    return articleless ? STRONG_GEN : WEAK_ENDINGS.gen;
  }
  if (definiteness === 'bare') return STRONG_ENDINGS[_case];
  if (definiteness === 'indefinite') return plural ? STRONG_ENDINGS[_case] : MIXED_ENDINGS[_case];
  if (definiteness === 'no') return plural ? WEAK_ENDINGS[_case] : MIXED_ENDINGS[_case];
  if (definiteness === 'some' || definiteness === 'many' || definiteness === 'few')
    return STRONG_ENDINGS[_case];
  return WEAK_ENDINGS[_case]; // 'all', 'this', 'that' and 'definite'
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
  // German can't attach an adjective *inside* a compound ("Phrasenschöpfer"), so an
  // attributive noun's adjective is scoped over the whole compound as a prenominal
  // declined adjective ("semantischer Phrasenschöpfer") — an approximation of the
  // narrower English/Romance scope, but grammatical.
  const modAdjs = np.nounModifiers
    .flatMap((m) => m.adjectives.map((a) => a.forms['base']))
    .filter((b): b is string => Boolean(b))
    .map((base) => decline(base));
  const inherent = f['adjective'];
  return [...modAdjs, ...own, inherent ? decline(inherent) : ''].filter(Boolean).join(' ');
}

function defArticle(forms: Record<string, string>, _case: Case, plural = false): string {
  if (plural) return _case === 'dat' ? 'den' : _case === 'gen' ? 'der' : 'die';
  const gender = forms['gender'] ?? 'neut';
  if (_case === 'nom') {
    return gender === 'masc' ? 'der' : gender === 'fem' ? 'die' : 'das';
  }
  if (_case === 'acc') {
    return gender === 'masc' ? 'den' : gender === 'fem' ? 'die' : 'das';
  }
  if (_case === 'gen') {
    return gender === 'fem' ? 'der' : 'des';
  }
  // dative
  return gender === 'masc' ? 'dem' : gender === 'fem' ? 'der' : 'dem';
}

// The indefinite article ein-, declined for case/gender. Plural has no indefinite
// article (bare).
function indefArticle(_case: Case, gender: string, plural: boolean): string {
  if (plural) return '';
  if (_case === 'acc') return gender === 'masc' ? 'einen' : gender === 'fem' ? 'eine' : 'ein';
  if (_case === 'dat') return gender === 'fem' ? 'einer' : 'einem';
  if (_case === 'gen') return gender === 'fem' ? 'einer' : 'eines';
  return gender === 'fem' ? 'eine' : 'ein'; // nominative: masc/neut ein, fem eine
}

// "kein" (no), declined like ein- but with a plural (keine / keinen in the dative,
// keiner in the genitive).
function keinForm(_case: Case, gender: string, plural: boolean): string {
  if (plural) return _case === 'dat' ? 'keinen' : _case === 'gen' ? 'keiner' : 'keine';
  if (_case === 'acc') return gender === 'masc' ? 'keinen' : gender === 'fem' ? 'keine' : 'kein';
  if (_case === 'dat') return gender === 'fem' ? 'keiner' : 'keinem';
  if (_case === 'gen') return gender === 'fem' ? 'keiner' : 'keines';
  return gender === 'fem' ? 'keine' : 'kein'; // nominative: masc/neut kein, fem keine
}

// The demonstratives dies- (this) and jen- (that), der-words that take the same case/gender
// endings as the definite article: dieser/diesen/diesem, diese/dieser, dieses, diese/diesen.
const DEM_ENDINGS: Record<Case, Record<Slot, string>> = {
  nom: { masc: 'er', fem: 'e',  neut: 'es', plural: 'e'  },
  acc: { masc: 'en', fem: 'e',  neut: 'es', plural: 'e'  },
  dat: { masc: 'em', fem: 'er', neut: 'em', plural: 'en' },
  gen: { masc: 'es', fem: 'er', neut: 'es', plural: 'er' },
};
function demForm(distal: boolean, _case: Case, gender: string, plural: boolean): string {
  const slot: Slot = plural ? 'plural' : gender === 'masc' || gender === 'fem' ? gender : 'neut';
  return `${distal ? 'jen' : 'dies'}${DEM_ENDINGS[_case][slot]}`;
}

/**
 * The determiner for a noun phrase, from its `definiteness` (default 'definite'), declined
 * for case — including the dative, which the motion/dative complements use (einem/einer,
 * keinem/keiner, diesem/jener, einigen/vielen/wenigen/allen), and the genitive, which the
 * object of a nominalised infinitive takes ("mit dem Wählen eines Wortes"). "kein" is
 * self-negating (no verb concord); einige/viele/wenige/alle are plural quantifiers.
 */
function determiner(forms: Record<string, string>, _case: Case, plural: boolean): string {
  // Most proper names go bare in German ("Afrika"), whatever determiner the user picked. But a
  // class of them is inherently articled — "die Antarktis", "die Schweiz", "die Türkei" — and that
  // is a property of the name, not a choice, so the lexicon marks it and the definite article wins.
  if (forms['proper'] === '1') {
    return forms['takes_article'] === '1' ? defArticle(forms, _case, plural) : '';
  }
  const definiteness = forms['definiteness'] ?? 'definite';
  if (definiteness === 'definite') return defArticle(forms, _case, plural);
  const gender = forms['gender'] ?? 'neut';
  // Mass nouns ("Wasser") stay singular and take the invariant mass quantifiers
  // "etwas / viel / wenig"; "all das Wasser"; no indefinite article.
  if (forms['uncountable'] === '1') {
    switch (definiteness) {
      case 'bare':        return '';
      case 'indefinite':  return '';                       // no "ein Wasser"
      case 'this':        return demForm(false, _case, gender, false);
      case 'that':        return demForm(true, _case, gender, false);
      case 'no':          return keinForm(_case, gender, false);
      case 'some':        return 'etwas';
      case 'many':        return 'viel';
      case 'few':         return 'wenig';
      case 'all':         return `all ${defArticle(forms, _case, false)}`;
      default:            return defArticle(forms, _case, false);
    }
  }
  // Dative plural quantifiers add -n (mit einigen/vielen/wenigen/allen Häusern); the genitive
  // takes -r (die Wahl einiger/vieler/weniger/aller Wörter).
  const dat = _case === 'dat';
  const gen = _case === 'gen';
  switch (definiteness) {
    case 'bare': return '';
    case 'this': return demForm(false, _case, gender, plural);
    case 'that': return demForm(true, _case, gender, plural);
    case 'no':   return keinForm(_case, gender, plural);
    case 'some': return dat ? 'einigen' : gen ? 'einiger' : 'einige';
    case 'many': return dat ? 'vielen'  : gen ? 'vieler'  : 'viele';
    case 'few':  return dat ? 'wenigen' : gen ? 'weniger' : 'wenige';
    case 'all':  return dat ? 'allen'   : gen ? 'aller'   : 'alle';
    default:     return indefArticle(_case, gender, plural);
  }
}

/**
 * A complement's preposition + case-declined determiner, honoring `definiteness`. Only a
 * *definite* article triggers the German preposition-article fusions (in+dem=im, zu+dem=zum,
 * zu+der=zur); any other determiner (einem, keiner, vielen, bare) rides after the plain
 * preposition. An empty `prep` is the bare-dative terminus — the determiner alone.
 */
function prepDet(prep: string, forms: Record<string, string>, _case: Case, plural: boolean): string {
  const det = determiner(forms, _case, plural);
  if ((forms['definiteness'] ?? 'definite') === 'definite') {
    if (prep === 'in' && det === 'dem') return 'im';
    if (prep === 'zu' && det === 'dem') return 'zum';
    if (prep === 'zu' && det === 'der') return 'zur';
  }
  if (!prep) return det;
  return det ? `${prep} ${det}` : prep;
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

// Konjunktiv II of "werden" — the würde-periphrasis that realises the hypothetical
// conditional in both clauses ("wenn … essen würde, würde … laufen"). Structurally it
// behaves exactly like the future WERDEN (finite in V2, main verb infinitive at the clause
// end), so the verb-group builders treat the conditional mood like the future, only swapping
// the auxiliary. Verb-final ordering in the "wenn" clause is a documented approximation.
const WUERDE: Record<string, string> = {
  '1sg': 'würde', '2sg': 'würdest', '3sg': 'würde',
  '1pl': 'würden', '2pl': 'würdet', '3pl': 'würden',
};

/** True when a resolved verb phrase's mood calls for the würde-periphrasis (either half of a
 *  conditional). */
function isConditionalMood(mood: string | undefined): boolean {
  return mood === 'conditional' || mood === 'subjunctive';
}

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
  mood?: string,
): { v2: string; mid: string; tail: string } {
  const base = verbForms['base'] ?? '';
  const participle = verbForms['participle'] ?? base;
  // The conditional mood is periphrastic like the future — würde/werden in V2, infinitive at
  // the clause end — so the two share every branch, differing only in the auxiliary word.
  const conditional = isConditionalMood(mood);
  const periphrastic = tense === 'future' || conditional;
  const auxV2 = conditional ? (WUERDE[pn] ?? 'würde') : (WERDEN[pn] ?? 'wird');
  const sein = periphrastic ? '' : SEIN[tense][pn];
  const perfAux = verbForms['aux'] === 'be' ? 'sein' : 'haben';
  const perfFinite = periphrastic ? '' : (perfAux === 'sein' ? SEIN : HABEN)[tense][pn];
  const conjug = periphrastic ? auxV2 : (verbForms[`${pn}_${tense}`] ?? verbForms[tense] ?? verbForms[`${pn}_present`] ?? base);
  switch (aspect) {
    case 'progressive':
      // Plain finite verb + "gerade"; periphrastic keeps aux … Infinitiv, with "gerade" mid.
      return { v2: conjug, mid: 'gerade', tail: periphrastic ? base : '' };
    case 'prospective':
      return {
        v2: periphrastic ? auxV2 : sein,
        mid: 'im Begriff',
        tail: periphrastic ? `sein zu ${base}` : `zu ${base}`,
      };
    case 'resultative':
      // Future/conditional perfect stacks the auxiliary's infinitive at the clause end
      // ("wird gesehen haben" / "würde gesehen haben").
      return {
        v2: periphrastic ? auxV2 : perfFinite,
        mid: '',
        tail: periphrastic ? `${participle} ${perfAux}` : participle,
      };
    default: // neutral
      return { v2: conjug, mid: '', tail: periphrastic ? base : '' };
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
  mood?: string,
): { v2: string; mid: string; tail: string } {
  const base = verbForms['base'] ?? '';
  const participle = verbForms['participle'] ?? base;
  const perfAux = verbForms['aux'] === 'be' ? 'sein' : 'haben';
  const group =
    aspect === 'progressive' ? { mid: 'gerade', tail: [base] } :
    aspect === 'prospective' ? { mid: 'im Begriff', tail: [`zu ${base}`, 'sein'] } :
    aspect === 'resultative' ? { mid: '', tail: [participle, perfAux] } :
    { mid: '', tail: [base] };
  // Conditional stacks every modal after würde, exactly as the future does after werden.
  const conditional = isConditionalMood(mood);
  const periphrastic = tense === 'future' || conditional;
  return {
    v2: periphrastic ? (conditional ? (WUERDE[pn] ?? 'würde') : (WERDEN[pn] ?? 'wird')) : conjPn(modals[0].forms, pn, tense),
    mid: group.mid,
    tail: [...group.tail, ...modalStack(modals, periphrastic)].join(' '),
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
  const compound = germanCompound(poss, plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? ''));
  // "von" governs the dative, so a weak masculine possessor declines to -(e)n ("vom Jungen").
  const word = f['weak'] === '1' ? weakN(compound, 'dat', plural) : datPluralN(compound, 'dat', plural);
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

/**
 * The genitive -(e)s a masculine/neuter *singular* noun carries ("des Wortes", "des Mädchens"):
 * the long -es after a sibilant, where a bare -s would be unpronounceable, and after a
 * monosyllable, where it is the standard form; the short -s otherwise. A feminine or a plural
 * takes no ending at all — there the article alone marks the case ("einer Katze", "der Wörter").
 */
function genitiveS(word: string, _case: Case, forms: Record<string, string>, plural: boolean): string {
  if (_case !== 'gen' || plural || !word) return word;
  if ((forms['gender'] ?? 'neut') === 'fem') return word;
  if (/(?:s|ß|z|x|tsch)$/i.test(word)) return `${word}es`;
  const syllables = (word.match(/[aeiouäöüy]+/gi) ?? []).length;
  return syllables <= 1 ? `${word}es` : `${word}s`;
}

/**
 * A weak masculine (n-declension) noun takes -(e)n in every case but the nominative singular
 * ("der Junge" but "den/dem/des Jungen"). Weakness is a lexical property of the noun (forms.weak),
 * so it fires wherever the singular surfaces in an oblique case, and it also supplies the genitive
 * (a weak noun takes no -(e)s). The ending is -n after a final -e (Junge → Jungen), -en otherwise
 * (Mensch → Menschen). The plural already carries its own -n, so it is left alone.
 */
function weakN(word: string, _case: Case, plural: boolean): string {
  if (plural || _case === 'nom' || !word) return word;
  return word.endsWith('e') ? `${word}n` : `${word}en`;
}

function nounPhrase(np: ResolvedNounPhrase, _case: Case): string {
  const forms = np.head.forms;
  const count = forms['number'] ?? forms['count'] ?? 'singular';
  const plural = count === 'plural';
  const headWord = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const compound = germanCompound(np, headWord);
  // A weak masculine noun declines to -(e)n in the oblique singular (and takes no genitive -(e)s);
  // every other noun takes the regular dative-plural -n and masculine/neuter genitive -(e)s.
  const word = forms['weak'] === '1'
    ? weakN(compound, _case, plural)
    : genitiveS(datPluralN(compound, _case, plural), _case, forms, plural);
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

/**
 * Render every conjunct of a noun slot and coordinate them the German way: commas between all
 * but the last pair, "und" / "oder" on the last ("der Kater, der Hund und der Fuchs").
 */
function coordinate(el: ResolvedNounElement, render: (np: ResolvedNounPhrase) => string): string {
  const word = el.conjunction === 'or' ? 'oder' : 'und';
  return joinConjuncts(el.conjuncts.map(render), ', ', () => ` ${word} `);
}

/**
 * A whole noun slot in one case. Every conjunct declines for that case *individually* — German
 * marks case on the article, so it repeats across the coordination ("mit dem Messer und dem
 * Stock"), it cannot be factored out in front of the group.
 */
function elementPhrase(el: ResolvedNounElement, _case: 'nom' | 'acc' | 'dat'): string {
  return coordinate(el, (np) => nounPhrase(np, _case));
}

/** A subject slot: each conjunct in the nominative, coordinated. */
function subjectText(el: ResolvedNounElement): string {
  return coordinate(el, subjectPhrase);
}

// durch/um govern accusative; the static-relation two-way preps
// (unter/über/hinter/vor) take dative here.
function routeCase(c: ResolvedComplement): 'acc' | 'dat' {
  const spec = pathSpecifier(c);
  return spec === 'through' || spec === 'around' ? 'acc' : 'dat';
}

// route path relation → preposition + case-declined determiner (none of these preps fuse).
function routeHead(c: ResolvedComplement, f: Record<string, string>, plural: boolean): string {
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

/**
 * Split the complements into the bare-dative recipient (`terminus`) and the rest. German puts a
 * dative object before the accusative one ("gibt dem Mann das Buch" — the neutral order for two
 * full noun phrases), so its clause builders render the terminus in that slot and let the other
 * complements trail the direct object, where the shared render order puts them.
 *
 * Only an *animate* recipient is a bare dative that leads the object. An inanimate goal ("save the
 * book into the container") is not a recipient but a prepositional destination ("in den Behälter"),
 * so it stays in `rest` and trails the object like any other adjunct — see the terminus branch of
 * `complementsPhrase`.
 */
function splitDative(
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
): { dative?: Partial<Record<ComplementType, ResolvedComplement>>; rest?: Partial<Record<ComplementType, ResolvedComplement>> } {
  const terminus = complements?.['terminus'];
  if (!terminus || firstConjunct(terminus.phrase).head.forms['animate'] !== '1') return { rest: complements };
  const { terminus: _t, ...rest } = complements;
  return { dative: { terminus }, rest };
}

/**
 * A `process` instrumental is not a phrase but a subordinate means clause ("indem man ein Wort
 * wählt"), and a subordinate clause is clause-final in German: it sits in the Nachfeld, *after*
 * the verb material the other complements come before ("hat begonnen, indem man ein Wort wählt",
 * "Ein Wort wählen" → "Beginnen, indem man ein Wort wählt"). Split it out so the joiner can put
 * it last instead of burying it among the objects.
 */
function splitMeansClause(
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
): { means?: Partial<Record<ComplementType, ResolvedComplement>>; rest?: Partial<Record<ComplementType, ResolvedComplement>> } {
  const instrument = complements?.['instrumental'];
  if (!instrument?.action || abstractionLevel(instrument) !== 'process') return { rest: complements };
  const { instrumental, ...rest } = complements!;
  return { means: { instrumental }, rest };
}

function complementsPhrase(complements?: Partial<Record<ComplementType, ResolvedComplement>>): string {
  if (!complements) return '';
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      // The complement's *kind* (pronoun? adjective?) comes off its first conjunct; its surface
      // is rendered from every conjunct, each declining for the case on its own article.
      const f = firstConjunct(c.phrase).head.forms;
      // A pronoun cause ("wegen mir/ihr/ihnen") uses the dative form with no article — the
      // colloquial dative that "wegen" already takes. Positive credits with "dank" ("dank
      // dir"); German has no clean prepositional blame connector short of the genitive
      // "durch … Schuld", so negative renders like neutral ("wegen"). Only cause takes a pronoun.
      if (type === 'cause' && f['person']) {
        const prep = causeSentiment(c) === 'positive' ? 'dank' : 'wegen';
        const pronouns = coordinate(c.phrase, (np) => np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? '');
        return `${prep} ${pronouns}`;
      }
      // An instrument presented as an action. German has no gerund, so the two levels part ways
      // completely. The process level is a subordinate means clause — "indem man ein Wort wählt",
      // with the impersonal "man" and the verb pushed to the end — whose noun phrase is a plain
      // direct object, hence *accusative*, not the dative "mit" would otherwise give it.
      //
      // The concept level nominalises the infinitive instead: German turns any infinitive into a
      // neuter noun just by capitalising it ("wählen" → "das Wählen"), which "mit" then puts in
      // the dative, and — the noun being a noun — its object arrives as an attached *genitive*:
      // "mit dem Wählen eines Wortes". The action's adverb comes along as an attributive
      // adjective on that noun ("mit dem schnellen Wählen"), which is what German adverbs are.
      if (type === 'instrumental' && c.action) {
        const level = abstractionLevel(c);
        if (level !== 'object') {
          const adverb = c.action.modifier?.forms['base'] ?? '';
          if (level === 'process') {
            const object = coordinate(c.phrase, (np) => nounPhrase(np, 'acc'));
            const finite3sg = c.action.verb.forms['3sg_present'] ?? c.action.verb.forms['base'] ?? '';
            // A subordinate clause is set off by a comma ("beginnt, indem man ein Wort wählt").
            // It is emitted as a leading comma and pulled back onto the previous word when the
            // clause is joined (see `punctuate`), since the joiner knows nothing of punctuation.
            return [', indem man', object, adverb, finite3sg].filter(Boolean).join(' ');
          }
          const object = coordinate(c.phrase, (np) => nounPhrase(np, 'gen'));
          const infinitive = actionInfinitive(c.action);
          const act = infinitive.charAt(0).toUpperCase() + infinitive.slice(1);
          // Weak declension: the adjective sits behind the definite "dem" (dative neuter → -en).
          const attr = adverb ? declineAdj(adverb, 'dat', 'neut', false, 'definite') : '';
          return ['mit dem', attr, act, object].filter(Boolean).join(' ');
        }
      }
      // Subject complement: a German predicate adjective is uninflected ("wird müde",
      // "scheint groß" — no declension endings) but is still compared ("wird müder"); a
      // predicate noun takes the *nominative* case, not the dative the other complements
      // use ("wird eine Legende").
      // Coordinated conjuncts render one by one, so a group may mix the two ("wird müde und
      // eine Legende" is odd, but "scheint müde oder groß" falls out of the same map).
      if (type === 'predicative') {
        return coordinate(c.phrase, (np) =>
          np.head.forms['role'] === 'adjective' ? dePredAdj(np.head) : nounPhrase(np, 'nom'),
        );
      }
      // The preposition governs a case, and the case is spelled on each conjunct's own article
      // ("mit dem Messer und dem Stock"), so preposition and determiner are emitted per conjunct.
      return coordinate(c.phrase, (np) => {
      const f = np.head.forms;
      const plural = (f['number'] ?? f['count']) === 'plural';
      const definiteness = f['definiteness'] ?? 'definite';
      const compound = germanCompound(np, plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? ''));
      // route → path preposition (+ its case); locative/direction/source → two-way preps +
      // dative. The in+dem=im / zu+dem=zum / zu+der=zur fusions fire only for a definite
      // article; any other determiner (einem, keiner, vielen, bare) stays uncontracted.
      let head: string;
      let _case: 'nom' | 'acc' | 'dat';
      if (type === 'route') {
        _case = routeCase(c);
        head = routeHead(c, f, plural);
      } else {
        _case = 'dat';
        // Cause: "wegen" governs the genitive formally, but the dative ("wegen dem Hund") is
        // standard in speech and reuses the dative determiners; positive credits with "dank".
        if (type === 'locative')  head = prepDet('in', f, 'dat', plural);
        else if (type === 'direction') head = prepDet('zu', f, 'dat', plural);
        // Instrumental: "mit" + dative ("mit dem Messer"). The mit+dem → "beim"-style fusion
        // doesn't exist for "mit", so prepDet leaves it uncontracted.
        else if (type === 'instrumental') head = prepDet('mit', f, 'dat', plural);
        else if (type === 'cause') head = prepDet(causeSentiment(c) === 'positive' ? 'dank' : 'wegen', f, 'dat', plural);
        // Terminus. An animate recipient is a bare dative — no preposition, just the dative
        // determiner ("der Katze"), the same case German gives the plain indirect object. An
        // inanimate goal is a destination, not a recipient, so it takes a directional preposition:
        // "in" + the accusative of motion-into ("speichert das Buch in den Behälter"), never the
        // bare dative that would read as *giving the book to the container*. (Which preposition —
        // in / an / zu — is verb-dependent; "in" is the app's into-a-container default.)
        else if (type === 'terminus') {
          if (f['animate'] === '1') head = prepDet('', f, 'dat', plural);
          else { _case = 'acc'; head = prepDet('in', f, 'acc', plural); }
        }
        else /* source */         head = prepDet('aus', f, 'dat', plural);
      }
      // A weak masculine goal/place declines to -(e)n in the oblique ("zum/im/aus dem Jungen");
      // every other noun takes the regular dative-plural -n.
      const word = f['weak'] === '1' ? weakN(compound, _case, plural) : datPluralN(compound, _case, plural);
      const declined = adjPhrase(np, _case, definiteness);
      const adj = declined ? `${declined} ` : '';
      const rest = `${adj}${word}${possessorText(np)}${subordinateClause(np)}`;
      return head ? `${head} ${rest}` : rest;
      });
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
 * has no relative. The clause is bracketed by commas at both ends; a closing comma that lands
 * against the sentence-final stop (or another comma) is tidied up in `punctuate`.
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
  const agreeForms = subjectRelative ? f : rel.subject!.agreement;
  const clauseSubjectText = subjectRelative ? '' : subjectText(rel.subject!);

  const { verb, negative: verbNegative, modifier, tense = 'present', aspect = 'neutral', mood, modals } = rel.verbPhrase;
  const person = agreeForms['person'] ?? '3';
  const aPlural = (agreeForms['number'] ?? agreeForms['count']) === 'plural';
  const pn = `${person}${aPlural ? 'pl' : 'sg'}`;
  // The verb complex is built by the same `verbGroup`/`modalVerbGroup` the main clause uses, so a
  // relative clause renders its aspect too (resultative "gegessen hat", progressive "gerade isst",
  // prospective "im Begriff … zu essen"). The clause is verb-final: the finite verb (`v2`) closes
  // it, sitting after the non-finite `tail` (Partizip / infinitive / "zu …" / the modal stack),
  // while the aspect adverbial (`mid`: "gerade" / "im Begriff") sits in the Mittelfeld before the
  // objects — the mirror of the main clause, whose finite verb leads from the V2 slot instead.
  const { v2: finite, mid, tail } = modals.length > 0
    ? modalVerbGroup(modals, verb.forms, pn, tense, aspect, mood)
    : verbGroup(verb.forms, pn, tense, aspect, mood);

  const { dative, rest } = splitDative(rel.complements);
  const dativeText = complementsPhrase(dative);
  const directObjectText = rel.directObject ? elementPhrase(rel.directObject, 'acc') : '';
  const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
  const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
  const nicht = verbNegative && !modifierIsNegative ? 'nicht' : '';
  const complementsText = complementsPhrase(rest);

  const body = [pronoun, clauseSubjectText, mid, dativeText, directObjectText, complementsText, modifierText, nicht, tail, finite]
    .filter(Boolean)
    .join(' ');
  return `, ${body},`;
}

// Imperative person key from a subject: 1st-plural cohortative, else 2nd sg/pl.
type DeIPN = '2sg' | '1pl' | '2pl';
function deImperativePN(forms: Record<string, string>): DeIPN {
  const person = forms['person'] ?? '2';
  const plural = (forms['number'] ?? 'singular') === 'plural';
  return person === '1' ? '1pl' : plural ? '2pl' : '2sg';
}

// Irregular imperative surfaces by concept. The du (2sg) form is the one that misbehaves: strong
// e→i/ie verbs keep the vowel change (essen→iss, lesen→lies, sehen→sieh) that the plain infinitive
// stem loses, and sein/wissen are suppletive. ihr (2pl) is the ordinary 2pl-present, and the wir
// cohortative is the infinitive with inverted "wir" ("laufen wir", but "seien wir").
const DE_IMPERATIVE: Record<string, Partial<Record<DeIPN, string>>> = {
  BE:   { '2sg': 'sei', '1pl': 'seien', '2pl': 'seid' }, // sein
  EAT:  { '2sg': 'iss' },
  READ: { '2sg': 'lies' },
  SEE:  { '2sg': 'sieh' },
  KNOW: { '2sg': 'wisse' }, // wissen
  // Stems in -er / -d keep the du -e (speichere, lade); the bare stem rule drops it.
  SAVE: { '2sg': 'speichere' },
  LOAD: { '2sg': 'lade' },
  ADD:  { '2sg': 'addiere' },
  EXPORT: { '2sg': 'exportiere' },
  IMPORT: { '2sg': 'importiere' },
  COORDINATE: { '2sg': 'koordiniere' },
  SELECT: { '2sg': 'selektiere' },
  CLEAR: { '2sg': 'lösche' }, // löschen: the -sch stem keeps the du -e
};

/** The German imperative verb surface for a person: a single word for du/ihr, "<inf> wir" for the
 *  cohortative. Regular du is the infinitive stem (laufen→lauf); ihr the stored 2pl-present. */
function deImperativeWord(forms: Record<string, string>, conceptId: string, pn: DeIPN): string {
  const base = forms['base'] ?? '';
  const stem = base.replace(/e?n$/, '');
  const ov = DE_IMPERATIVE[conceptId];
  if (pn === '2sg') return ov?.['2sg'] ?? stem ?? base;
  if (pn === '2pl') return ov?.['2pl'] ?? forms['2pl_present'] ?? `${stem}t`;
  return `${ov?.['1pl'] ?? base} wir`; // 1pl cohortative
}

/** One clause (subject + predicate), ignoring any attached hypothetical condition. */
// `inverted` renders the clause with the finite verb ahead of the subject, for when something
// else already fills the front field (see COORD_INVERTS). A verbless or imperative clause has
// no V2 slot to invert, so the flag is inert there.
function renderClause(phrase: ResolvedPhrase, inverted = false): string {
    const { subject, verbPhrase, directObject } = phrase;
    // The dative recipient leads the accusative object; the other complements trail it, and a
    // subordinate means clause trails even the verb (see `splitMeansClause`).
    const { dative, rest: undative } = splitDative(phrase.complements);
    const { means, rest } = splitMeansClause(undative);
    const dativeText = complementsPhrase(dative);
    const meansText = complementsPhrase(means);
    const subj = subjectText(subject);
    // Verbless period: a bare noun phrase ("aktuelle Nachrichten").
    if (!verbPhrase) return subj.trim();
    const { verb, negative: verbNegative, modifier, tense = 'present', aspect = 'neutral', mood, register } = verbPhrase;

    // Imperative: a subjectless V1 command. The subject's person picks the form; "nicht" negates,
    // sitting before a predicate complement ("sei nicht vorsichtig") but after the objects
    // otherwise ("iss das Brot nicht").
    if (mood === 'imperative') {
      const word = deImperativeWord(verb.forms, verb.conceptId, deImperativePN(subject.agreement));
      const impDirect = directObject ? elementPhrase(directObject, 'acc') : '';
      const impModifier = modifier ? (modifier.forms['base'] ?? '') : '';
      const applyNicht = verbNegative === true && modifier?.forms['polarity'] !== 'negative';
      const hasPredicative = !!phrase.complements?.['predicative'];
      const impComplements = complementsPhrase(rest);
      // An instruction addressed to nobody — a button, a menu entry, a recipe step — is the
      // infinitive, and the infinitive is clause-final, so it inverts the V1 command order:
      // "Ein Satzgefüge laden", "Das Brot nicht essen" (vs the command "Iss das Brot nicht").
      if (register === 'instruction') {
        return [impModifier, dativeText, impDirect, impComplements, applyNicht ? 'nicht' : '', verb.forms['base'] ?? word, meansText]
          .filter(Boolean)
          .join(' ')
          .trim();
      }
      const parts = [word, impModifier, dativeText, impDirect];
      if (hasPredicative) {
        if (applyNicht) parts.push('nicht');
        parts.push(impComplements);
      } else {
        parts.push(impComplements);
        if (applyNicht) parts.push('nicht');
      }
      parts.push(meansText);
      return parts.filter(Boolean).join(' ').trim();
    }

    // The verb complex is split across the clause: the finite verb (werden/sein, the outermost
    // modal, or the conjugated main verb) sits in the V2 slot, any "gerade"/"im Begriff"
    // follows it, and the non-finite tail (infinitive / Partizip / "zu …" / the modal stack)
    // closes the clause. Aspect is rendered by verbGroup/modalVerbGroup, which a relative clause
    // reaches through the same helpers (see subordinateClause).
    const person = subject.agreement['person'] ?? '3';
    const number = subject.agreement['number'] ?? 'singular';
    const pn = `${person}${number === 'plural' ? 'pl' : 'sg'}`;
    const { v2: verbText, mid: aspectMid, tail: infinitiveTail } = verbPhrase.modals.length > 0
      ? modalVerbGroup(verbPhrase.modals, verb.forms, pn, tense, aspect, mood)
      : verbGroup(verb.forms, pn, tense, aspect, mood);
    const directObjectText = directObject ? elementPhrase(directObject, 'acc') : '';
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
    const complementsText = complementsPhrase(rest);
    const head = inverted ? [verbText, subj] : [subj, verbText];
    return [...head, aspectMid, negBefore, modifierText, dativeText, directObjectText, negComplement, complementsText, negAfter, infinitiveTail, meansText]
      .filter(Boolean).join(' ').trim();
}

const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'und',
  or: 'oder',
  but: 'aber',
  that_is: 'das heißt',
  therefore: 'also',
  then: 'und dann',
};

// "also" and "dann" are conjunctional *adverbs*, not coordinators: they occupy the clause's
// front field, which pushes the finite verb into second position ahead of the subject —
// "…, also läuft der Hund", "…, und dann läuft der Hund". The true coordinators (und, oder,
// aber) and the parenthetical "das heißt" sit outside the clause and leave its order alone.
const COORD_INVERTS: Record<CoordConjunction, boolean> = {
  and: false,
  or: false,
  but: false,
  that_is: false,
  therefore: true,
  then: true,
};

/**
 * Tidy the punctuation a clause part carried in with it: the parts are joined with spaces, which
 * puts one in front of a leading comma ("beginnt , indem"). A relative clause also carries a
 * closing comma; when it lands next to another comma (adjacent clauses) it collapses to one, and
 * a comma at the very end merges with the sentence-final stop the translator appends. Applied once
 * to the finished sentence.
 */
function punctuate(sentence: string): string {
  return sentence
    .replace(/\s+,/g, ',') // pull a comma back onto the preceding word
    .replace(/,(\s*,)+/g, ',') // collapse a run of commas (two abutting clauses) into one
    .replace(/,\s*$/, ''); // drop a trailing comma; the full stop closes the clause here
}

export const germanEngine: LanguageEngine = {
  language: 'de',
  render(phrase: ResolvedPhrase): string {
    const main = renderClause(phrase);
    // Hypothetical conditional: "wenn <protasis>, <apodosis>", both realised with the
    // würde-periphrasis. The "wenn" clause's verb-final ordering is approximated (a documented
    // gap it shares with the future/relative word order).
    const sentence = phrase.condition ? `wenn ${renderClause(phrase.condition)}, ${main}` : main;
    // Coordination: "<first clause>, <conjunction> <second clause>" — with the second clause
    // inverted when the conjunction is an adverb that claims the front field.
    if (!phrase.coordination) return punctuate(sentence);
    const { conjunction, clause } = phrase.coordination;
    return punctuate(
      `${sentence}, ${COORD_WORDS[conjunction]} ${renderClause(clause, COORD_INVERTS[conjunction])}`,
    );
  },
  // The determiner alone, for the menu that picks one. A German determiner is declined for case;
  // a menu names it in the nominative, the case the citation form is given in.
  renderDeterminer(noun: ConceptForms): string {
    const f = noun.forms;
    return determiner(f, 'nom', (f['number'] ?? f['count']) === 'plural');
  },
};
