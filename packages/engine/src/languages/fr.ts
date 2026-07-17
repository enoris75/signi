import { COMPLEMENT_RENDER_ORDER, type Aspect, type ComplementType, type CoordConjunction, type Degree, type ModifierRelation, type Tense } from '@signi/shared';
import { abstractionLevel, actionInfinitive, adjDegree, causeSentiment, firstConjunct, isPronounElement, isRelativeSuperlative, joinConjuncts, modalChain, objectPronounForm, pathSpecifier, type ConceptForms, type Mood, type ResolvedComplement, type ResolvedNounElement, type ResolvedNounPhrase, type ResolvedVerbPhrase, type LanguageEngine, type ResolvedPhrase } from '../types.js';
import { imperativeForm, moodForm, moodPN } from '../mood.js';

// Degree adverb placed before the adjective. Comparative and relative superlative share
// "plus"/"moins"; the noun phrase's definite article distinguishes them ("un chat plus
// grand" vs "le chat le plus grand" — the second article is an MVP approximation we skip).
// Equality uses "aussi" ("aussi grand").
const FR_DEGREE: Record<Degree, string> = {
  positive: '', more: 'plus', most: 'plus', less: 'moins', least: 'moins', equally: 'aussi',
};

/** Prefix an adjective's degree adverb onto its surface ("plus grand"). */
function frDeg(a: ConceptForms, surface: string): string {
  const d = FR_DEGREE[adjDegree(a)];
  return d && surface ? `${d} ${surface}` : surface;
}

/**
 * The raised degrees (more/most) of these adjectives are suppletive in French — a single
 * word, never "plus" + base: bon → meilleur, mauvais → pire. "plus bon" is ungrammatical;
 * "plus mauvais" is merely dispreferred. Only "more"/"most" suppletise — the lowered and
 * equal degrees stay periphrastic ("moins bon", "aussi bon"). petit → moindre is deliberately
 * omitted: moindre is figurative-only, and the literal size comparative "plus petit" is
 * correct and by far the common case.
 */
const FR_SUPPLETIVE: Record<string, string> = { GOOD: 'meilleur', BAD: 'pire' };

/**
 * An adjective's comparison surface, agreed with the noun. A suppletive raised degree replaces
 * the base outright and is itself agreed (meilleur → meilleure/meilleurs); every other case is
 * the periphrastic degree adverb prefixed onto the agreed base ("plus grand", "moins bon").
 */
function frComparison(a: ConceptForms, gender: string, plural: boolean): string {
  const degree = adjDegree(a);
  const suppletive = FR_SUPPLETIVE[a.conceptId];
  if (suppletive && (degree === 'more' || degree === 'most')) {
    return agreeAdjFr(suppletive, gender, plural);
  }
  return frDeg(a, agreeAdjFr(a.forms['base'] ?? '', gender, plural));
}

/**
 * Agree an adjective's masculine-singular base with the noun it modifies, deriving the
 * feminine and plural by rule (French adjective forms aren't stored — only the base is).
 * Covers the seeded vocabulary: the -eau/-eux/-x/-f/-er/-on families plus the irregular
 * beau/nouveau/vieux, defaulting to a plain +e (fem) / +s (plural). Adjectives already
 * ending in -e are invariable in the feminine (triste, rapide); those in -s/-x are
 * invariable in the masculine plural (mauvais, heureux).
 */
const FR_ADJ_IRREGULAR: Record<string, [string, string, string, string]> = {
  // [masc.sg, fem.sg, masc.pl, fem.pl]
  beau: ['beau', 'belle', 'beaux', 'belles'],
  nouveau: ['nouveau', 'nouvelle', 'nouveaux', 'nouvelles'],
  vieux: ['vieux', 'vieille', 'vieux', 'vieilles'],
};
function agreeAdjFr(base: string, gender: string, plural: boolean): string {
  if (!base) return '';
  const fem = gender === 'fem';
  const irr = FR_ADJ_IRREGULAR[base];
  if (irr) return irr[(fem ? 1 : 0) + (plural ? 2 : 0)];
  // Feminine stem.
  let f = base;
  if (fem) {
    if (base.endsWith('e')) f = base;                              // triste, faible, rapide
    else if (base.endsWith('eux')) f = `${base.slice(0, -3)}euse`; // heureux → heureuse
    else if (base.endsWith('x')) f = `${base.slice(0, -1)}se`;     // generic -x → -se
    else if (base.endsWith('f')) f = `${base.slice(0, -1)}ve`;     // actif → active
    else if (base.endsWith('er')) f = `${base.slice(0, -2)}ère`;   // premier → première
    else if (base.endsWith('on')) f = `${base}ne`;                 // bon → bonne
    else if (base.endsWith('el')) f = `${base}le`;                 // pluriel → plurielle
    else f = `${base}e`;                                           // grand, fort, fatigué → +e
  }
  if (!plural) return f;
  if (fem) return `${f}s`;                                         // fem plural is always +s
  if (f.endsWith('s') || f.endsWith('x')) return f;                // mauvais, heureux invariable
  if (f.endsWith('al')) return `${f.slice(0, -2)}aux`;             // -al → -aux
  return `${f}s`;
}

const VOWEL_START = /^[aeiouéèêëàâîïôùûü]/i;

/**
 * Whether the article elides before a phrase whose lead word is `lead`. French elides before a
 * vowel SOUND: a first-letter test catches true vowels but misses an h muet ("homme" → l'homme)
 * and must NOT fire for an h aspiré ("héros" → le héros). That split is lexical, so a noun the
 * corpus marks `elides` counts as vowel-initial. The flag is the head noun's, so it is honoured
 * only when the noun itself leads — a prenominal adjective (never h muet in the lexicon) is judged
 * on its own spelling.
 */
function elidesBefore(forms: Record<string, string>, lead: string): boolean {
  if (VOWEL_START.test(lead)) return true;
  const nounLeads = lead === forms['base'] || lead === forms['plural'];
  return nounLeads && forms['elides'] === '1';
}

/**
 * Concept IDs of the "BAGS" adjectives (beauty, age, goodness, size) that precede the
 * noun in French — beau, bon, grand, petit, vieux, jeune, nouveau, mauvais. Every other
 * adjective (heureux, triste, fort, …) follows the noun.
 */
// The ordinals join them: an ordinal precedes its noun in French ("le premier père", "la
// deuxième fois"), whatever its "BAGS" membership.
const PRENOMINAL = new Set([
  'BIG', 'SMALL', 'GOOD', 'BAD', 'OLD', 'YOUNG', 'NEW', 'BEAUTIFUL',
  'FIRST', 'SECOND', 'THIRD',
]);

/**
 * The definite article, selected by the sound of the word that actually follows it
 * (`lead`) — the first prenominal adjective when present, otherwise the noun itself
 * ("l'ami" but "le petit ami", "le bon ami").
 */
function defArticle(forms: Record<string, string>, plural = false, lead?: string): string {
  const gender = forms['gender'] ?? 'masc';
  if (plural) return 'les';
  const base = lead ?? forms['base'] ?? '';
  if (elidesBefore(forms, base)) return "l'";
  return gender === 'fem' ? 'la' : 'le';
}

/**
 * The indefinite article: masc "un", fem "une", plural "des" (French keeps a plural
 * indefinite, unlike the Romance siblings). "un"/"une" don't elide before a vowel.
 */
function indefArticle(forms: Record<string, string>, plural: boolean): string {
  if (plural) return 'des';
  return (forms['gender'] ?? 'masc') === 'fem' ? 'une' : 'un';
}

/**
 * The demonstrative: "ce" (masc), "cet" before a vowel sound ("cet ami", "cet autre homme" —
 * chosen on `lead`, the word that actually follows), "cette" (fem), "ces" (plural).
 *
 * French neutralises the proximal/distal contrast here — a single series covers both "this"
 * and "that" ("ce livre" is either — the contrast is only ever forced with the postposed
 * clitics "-ci"/"-là", which are marked and rarely used) — so `this` and `that` both render it.
 */
function demArticle(forms: Record<string, string>, plural: boolean, lead: string): string {
  if (plural) return 'ces';
  if ((forms['gender'] ?? 'masc') === 'fem') return 'cette';
  return elidesBefore(forms, lead) ? 'cet' : 'ce';
}

/**
 * The determiner for a subject/direct-object noun phrase, from its `definiteness`
 * (default 'definite'): the definite/indefinite article, nothing (bare), the demonstrative,
 * or a quantifier. "beaucoup/peu de" take a bare noun (the "de" elides before a vowel);
 * "tous/toutes les" carry the definite article; "aucun/e" is singular and drives verb
 * negation ("ne") upstream.
 */
function artFor(forms: Record<string, string>, plural: boolean, lead: string): string {
  // A proper noun (l'Afrique) always takes the definite article in French, whatever
  // determiner the user picked; it is a property of the name, not a choice.
  if (forms['proper'] === '1') return defArticle(forms, plural, lead);
  const definiteness = forms['definiteness'] ?? 'definite';
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  const de = elidesBefore(forms, lead) ? "d'" : 'de';
  // Mass nouns ("eau") stay singular and take the partitive "de l'/du/de la" for
  // some/indefinite; "beaucoup/peu de" already work; "all" → "tout/toute" + article.
  if (forms['uncountable'] === '1') {
    switch (definiteness) {
      case 'bare':       return '';
      case 'indefinite': return dePrep(forms, false, lead);   // partitive: "de l'eau"
      case 'this':
      case 'that':       return demArticle(forms, false, lead);
      case 'some':       return dePrep(forms, false, lead);   // partitive: "de l'eau"
      case 'many':       return `beaucoup ${de}`;
      case 'few':        return `peu ${de}`;
      case 'all':        return `${fem ? 'toute' : 'tout'} ${defArticle(forms, false, lead)}`;
      case 'no':         return fem ? 'aucune' : 'aucun';
      default:           return defArticle(forms, false, lead);
    }
  }
  switch (definiteness) {
    case 'bare':       return '';
    case 'indefinite': return indefArticle(forms, plural);
    case 'this':
    case 'that':       return demArticle(forms, plural, lead);
    case 'some':       return 'quelques';
    case 'many':       return `beaucoup ${de}`;
    case 'few':        return `peu ${de}`;
    case 'all':        return `${fem ? 'toutes' : 'tous'} ${defArticle(forms, true, lead)}`;
    case 'no':         return fem ? 'aucune' : 'aucun';
    default:           return defArticle(forms, plural, lead);
  }
}

/** Join an article/preposition head to the following word: no space after elision. */
function joinArt(head: string, word: string): string {
  if (!head) return word; // bare noun phrase — no article
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

/**
 * Non-contracting preposition (dans / vers / sous / à travers …) + determiner. French only
 * fuses "à"/"de" with a definite article, so these carry whatever `artFor` yields: "dans une
 * maison", "dans la maison", bare "dans maison".
 */
/**
 * The present participle, for the gérondif ("en choisissant"). French seeds no gerund — its
 * progressive is periphrastic ("en train de") — so it is derived the way the moods are: from the
 * "nous" present minus its -ons ending, which carries any stem irregularity with it (nous
 * choisissons → choisissant, nous mangeons → mangeant). The three verbs whose participle that
 * rule misses are listed.
 */
const FR_PARTICIPLE_STEM: Record<string, string> = { BE: 'ét', HAVE: 'ay', KNOW: 'sach' };

function presentParticiple(verb: ConceptForms): string {
  const irregular = FR_PARTICIPLE_STEM[verb.conceptId];
  if (irregular) return `${irregular}ant`;
  const nous = verb.forms['1pl_present'];
  if (nous?.endsWith('ons')) return `${nous.slice(0, -3)}ant`;
  return verb.forms['base'] ?? '';
}

function prepDet(prep: string, forms: Record<string, string>, plural: boolean, lead: string): string {
  const det = artFor(forms, plural, lead);
  return det ? `${prep} ${det}` : prep;
}

/**
 * "à" + determiner. Only the definite fuses (au/aux/à la/à l'); otherwise a plain "à" leads
 * the chosen determiner ("à une maison", "à quelques maisons") — "à" never elides.
 */
function aDet(forms: Record<string, string>, plural: boolean, lead: string): string {
  if ((forms['definiteness'] ?? 'definite') === 'definite') return datPrep(forms, plural, lead);
  return prepDet('à', forms, plural, lead);
}

/**
 * "de" + determiner. Only the definite fuses (du/des/de la/de l'). Otherwise French drops the
 * indefinite/partitive article after "de" (de+des → "de maisons", de+du/de la → "d'eau") and
 * elides before a vowel; a surviving quantifier or "un/une" is kept ("de quelques maisons",
 * "d'une maison").
 */
function deDet(forms: Record<string, string>, plural: boolean, lead: string): string {
  const def = forms['definiteness'] ?? 'definite';
  if (def === 'definite') return dePrep(forms, plural, lead);
  const det = artFor(forms, plural, lead);
  const drops = det === 'des' || (forms['uncountable'] === '1' && (def === 'indefinite' || def === 'some'));
  if (!det || drops) return elidesBefore(forms, lead) ? "d'" : 'de';
  return VOWEL_START.test(det) ? `d'${det}` : `de ${det}`;
}

function conjugate(forms: Record<string, string>, subjectForms: Record<string, string>, tense: Tense = 'present'): string {
  const person = subjectForms['person'] ?? '3';
  const number = subjectForms['number'] ?? 'singular';
  const n = number === 'plural' ? 'pl' : 'sg';
  return forms[`${person}${n}_${tense}`] ?? forms[tense] ?? forms[`${person}${n}_present`] ?? forms['base'] ?? '';
}

/** Person/number key ("1sg" … "3pl") into the "être" auxiliary table below. */
function auxKey(subjectForms: Record<string, string>): string {
  const person = subjectForms['person'] ?? '3';
  const n = (subjectForms['number'] ?? 'singular') === 'plural' ? 'pl' : 'sg';
  return `${person}${n}`;
}

// "être" — the finite verb of the progressive and prospective, and the resultative auxiliary
// of the verbs that select it. French has no synthetic progressive, so the progressive/
// prospective are "être en train de" / "être sur le point de" + infinitive; the resultative is
// être/avoir + past participle. Past uses the imparfait ("était").
const ETRE_FR: Record<Tense, Record<string, string>> = {
  present: { '1sg': 'suis', '2sg': 'es', '3sg': 'est', '1pl': 'sommes', '2pl': 'êtes', '3pl': 'sont' },
  past:    { '1sg': 'étais', '2sg': 'étais', '3sg': 'était', '1pl': 'étions', '2pl': 'étiez', '3pl': 'étaient' },
  future:  { '1sg': 'serai', '2sg': 'seras', '3sg': 'sera', '1pl': 'serons', '2pl': 'serez', '3pl': 'seront' },
};

// "avoir" — the resultative auxiliary everywhere else ("a vu"), the majority case.
const AVOIR_FR: Record<Tense, Record<string, string>> = {
  present: { '1sg': 'ai', '2sg': 'as', '3sg': 'a', '1pl': 'avons', '2pl': 'avez', '3pl': 'ont' },
  past:    { '1sg': 'avais', '2sg': 'avais', '3sg': 'avait', '1pl': 'avions', '2pl': 'aviez', '3pl': 'avaient' },
  future:  { '1sg': 'aurai', '2sg': 'auras', '3sg': 'aura', '1pl': 'aurons', '2pl': 'aurez', '3pl': 'auront' },
};

/** Agree an être-selecting past participle with the subject: allé → allée / allés / allées. */
function agreeParticipleFr(base: string, subjectForms: Record<string, string>): string {
  if (!base) return '';
  const fem = (subjectForms['gender'] ?? 'masc') === 'fem';
  const plural = (subjectForms['number'] ?? 'singular') === 'plural';
  return `${base}${fem ? 'e' : ''}${plural ? 's' : ''}`;
}

/**
 * The verb group for a non-neutral aspect, split into the finite auxiliary (which negation
 * wraps) and the non-finite tail: progressive "en train de + inf", prospective "sur le
 * point de + inf" (both eliding "de" → "d'" before a vowel), resultative = the past
 * participle ("est allé", "a vu"). The resultative auxiliary is a lexical property of the
 * verb (the seed marks the être-selecting ones with forms.aux = "be"), and only an être
 * participle agrees with the subject — "elle est allée" but "elle a vu".
 */
// The aspect auxiliaries as minimal concepts, so `moodForm` derives their conditional (serait /
// aurait, from the future stem) and imparfait protasis (était via the BE stem / avait from the
// "nous" present) — the same way it handles a plain verb. Without this a marked aspect under a
// hypothetical dropped the mood and kept the plain present indicative.
const ETRE_AUX: ConceptForms = { conceptId: 'BE', forms: { '1sg_future': 'serai', '1pl_present': 'sommes' } };
const AVOIR_AUX: ConceptForms = { conceptId: 'AVOIR', forms: { '1sg_future': 'aurai', '1pl_present': 'avons' } };

/** The aspect auxiliary's finite form: its mood form under a hypothetical, else the tense form. */
function auxFiniteFr(aux: ConceptForms, table: Record<Tense, Record<string, string>>, subjectForms: Record<string, string>, tense: Tense, mood?: Mood): string {
  return moodForm('fr', aux, moodPN(subjectForms), mood) ?? table[tense][auxKey(subjectForms)];
}

// A reflexive verb's clitic, agreeing with the subject (me/te/se/nous/vous/se) and eliding before a
// vowel (m'/t'/s'). Reflexivity is lexical: the infinitive begins with the clitic ("s'effondrer"),
// which the finite present carries ("s'effondre") but the participle ("effondré") drops — so the
// compound perfect must restore it before the auxiliary: "s'est effondrée", not "est effondrée".
const FR_REFLEXIVE: Record<string, string> = { '1sg': 'me', '2sg': 'te', '3sg': 'se', '1pl': 'nous', '2pl': 'vous', '3pl': 'se' };
function reflexiveFinite(verbForms: Record<string, string>, subjectForms: Record<string, string>, finite: string): string {
  const base = verbForms['base'] ?? '';
  if (!(base.startsWith("s'") || base.startsWith('se '))) return finite;
  const clitic = FR_REFLEXIVE[auxKey(subjectForms)] ?? 'se';
  // me/te/se elide to m'/t'/s' before a vowel-initial auxiliary ("s'est"); nous/vous never elide.
  return /^(me|te|se)$/.test(clitic) && VOWEL_START.test(finite)
    ? `${clitic[0]}'${finite}`
    : `${clitic} ${finite}`;
}

function aspectVerbFr(
  verbForms: Record<string, string>,
  subjectForms: Record<string, string>,
  tense: Tense,
  aspect: Aspect,
  mood?: Mood,
): { finite: string; tail: string } {
  const inf = verbForms['base'] ?? '';
  const deInf = VOWEL_START.test(inf) ? `d'${inf}` : `de ${inf}`;
  const etreFinite = auxFiniteFr(ETRE_AUX, ETRE_FR, subjectForms, tense, mood);
  if (aspect === 'progressive') return { finite: etreFinite, tail: `en train ${deInf}` };
  if (aspect === 'prospective') return { finite: etreFinite, tail: `sur le point ${deInf}` };
  const etre = verbForms['aux'] === 'be'; // resultative
  const part = verbForms['participle'] ?? inf;
  // A reflexive verb restores its clitic before the auxiliary ("s'est effondrée"); the participle
  // had dropped it. Only être-selecting verbs are reflexive here, but the helper is a no-op otherwise.
  const auxWord = etre ? etreFinite : auxFiniteFr(AVOIR_AUX, AVOIR_FR, subjectForms, tense, mood);
  return {
    finite: reflexiveFinite(verbForms, subjectForms, auxWord),
    tail: etre ? agreeParticipleFr(part, subjectForms) : part,
  };
}

/**
 * The main verb's whole group as an infinitive — what a modal governs. Neutral is the bare
 * infinitif ("doit aller"); the marked aspects put their auxiliary in the infinitive ("doit
 * être en train d'aller", "doit avoir vu", "doit être allée" — the être participle agreeing
 * with the subject, as ever).
 */
function verbGroupInfinitiveFr(
  verbForms: Record<string, string>,
  subjectForms: Record<string, string>,
  aspect: Aspect,
): string {
  const inf = verbForms['base'] ?? '';
  const deInf = VOWEL_START.test(inf) ? `d'${inf}` : `de ${inf}`;
  if (aspect === 'progressive') return `être en train ${deInf}`;
  if (aspect === 'prospective') return `être sur le point ${deInf}`;
  if (aspect === 'resultative') {
    const etre = verbForms['aux'] === 'be';
    const part = verbForms['participle'] ?? inf;
    return etre ? `être ${agreeParticipleFr(part, subjectForms)}` : `avoir ${part}`;
  }
  return inf;
}

/**
 * The modal chain split for negation: the outermost modal is the finite verb that "ne … pas"
 * wraps ("je ne veux pas pouvoir aller"), and everything it governs — the inner modals'
 * infinitives, then the main verb group's — trails after.
 */
function modalGroupFr(
  modals: ConceptForms[],
  verbForms: Record<string, string>,
  subjectForms: Record<string, string>,
  tense: Tense,
  aspect: Aspect,
  mood?: Mood,
): { finite: string; tail: string } {
  const pn = moodPN(subjectForms);
  const [finite, ...governed] = modalChain(modals, (m) => moodForm('fr', m, pn, mood) ?? conjugate(m.forms, subjectForms, tense));
  return {
    finite,
    tail: [...governed, verbGroupInfinitiveFr(verbForms, subjectForms, aspect)].join(' '),
  };
}

/** French linking preposition for an attributive noun, by relation (bare, no article). */
const REL_PREP_FR: Record<ModifierRelation, string> = { feature: 'à', purpose: 'de', material: 'de' };

/**
 * Postnominal attributive nouns as a bare "prep + noun" string ("de phrases sémantiques");
 * "de" elides before a vowel. The modifier takes its own number and its adjectives agree
 * with *its* gender/number ("créateur de phrases sémantiques"), postnominal as in French.
 */
function frMods(np: ResolvedNounPhrase): string {
  return np.nounModifiers
    .map((m) => {
      const forms = m.concept.forms;
      const plural = (forms['number'] ?? forms['count']) === 'plural';
      const noun = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
      if (!noun) return '';
      const gender = forms['gender'] ?? 'masc';
      const adjs = m.adjectives
        .map((a) => agreeAdjFr(a.forms['base'] ?? '', gender, plural))
        .filter(Boolean)
        .join(' ');
      const nounPart = adjs ? `${noun} ${adjs}` : noun;
      const prep = REL_PREP_FR[m.relation];
      // Elision keys on the noun that immediately follows "de" (the adjective is postnominal).
      return prep === 'de' && VOWEL_START.test(noun) ? `d'${nounPart}` : `${prep} ${nounPart}`;
    })
    .filter(Boolean)
    .join(' ');
}

/** Split a phrase's adjectives (surface = base form) into pre- and post-nominal groups. */
function splitAdjectives(np: ResolvedNounPhrase): { pre: string[]; post: string[] } {
  const pre: string[] = [];
  const post: string[] = [];
  const gender = np.head.forms['gender'] ?? 'masc';
  const plural = (np.head.forms['number'] ?? np.head.forms['count']) === 'plural';
  for (const a of np.adjectives) {
    const word = frComparison(a, gender, plural);
    if (!word) continue;
    // A comparative/superlative adjective is postnominal in French ("le chat plus grand",
    // "le chat meilleur"), even when its plain form would precede the noun — this also avoids
    // elision artefacts ("l'aussi grand chat").
    const prenominal = PRENOMINAL.has(a.conceptId) && adjDegree(a) === 'positive';
    (prenominal ? pre : post).push(word);
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
  // Coordinate the postnominal adjectives as a list: commas between all but the last pair, "et"
  // only before the last ("fort, heureux et froid"), like a coordinated noun slot.
  const postStr = joinConjuncts(post, ', ', () => ' et ');
  const postAdj = postStr ? `${core} ${postStr}` : core;
  // Attributive nouns are postnominal and bare, the relation choosing the preposition:
  // feature "à" (bateau à voile), purpose/material "de" (lunettes de soleil). Distinct
  // from the possessor's contracted "du/de la".
  const mods = frMods(np);
  const withPost = mods ? `${postAdj} ${mods}` : postAdj;
  // A possessor is postnominal, headed by "de"+article contracted ("le livre du chat").
  // Rendering it through renderNP recurses for its own adjectives / nested possessor.
  const poss = np.possessor;
  const base = poss
    ? `${withPost} ${renderNP(poss, (plural, lead) => dePrep(poss.head.forms, plural, lead))}`
    : withPost;
  const rel = relativeText(np);
  return rel ? `${base} ${rel}` : base;
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
 * Render every conjunct of a noun slot and coordinate them the French way: commas between all
 * but the last pair, "et" / "ou" on the last ("le chat, le chien et le renard"). Neither word
 * has a euphonic variant, so the link is invariable.
 */
function coordinate(el: ResolvedNounElement, render: (np: ResolvedNounPhrase) => string): string {
  const word = el.conjunction === 'or' ? 'ou' : 'et';
  return joinConjuncts(el.conjuncts.map(render), ', ', () => ` ${word} `);
}

/**
 * A subject slot: each conjunct with its own article/adjectives/relative, coordinated.
 *
 * A coordinated *pronoun* does not keep its clitic subject form in French — "*tu et je mangeons"
 * is not French. It takes the tonic (disjunctive) form, and when the group resolves to the 1st or
 * 2nd person the sentence resumes it with the matching subject clitic: "toi et moi, nous
 * mangeons". A group of 3rd-person nouns needs no resumption ("le chat et le renard mangent").
 */
function subjectText(el: ResolvedNounElement): string {
  if (el.conjuncts.length < 2) return coordinate(el, subjectPhrase);
  const conjuncts = coordinate(el, (np) => {
    const f = np.head.forms;
    return f['person'] ? (f['disjunctive'] ?? f['base'] ?? '') : subjectPhrase(np);
  });
  const person = el.agreement['person'] ?? '3';
  if (person === '3') return conjuncts;
  return `${conjuncts}, ${person === '1' ? 'nous' : 'vous'}`;
}

/** One conjunct as a plain noun phrase carrying its own determiner ("un mot"). */
function npText(np: ResolvedNounPhrase): string {
  return renderNP(np, (plural, lead) => artFor(np.head.forms, plural, lead));
}

/**
 * route path relation → preposition, honoring the head's determiner. The plain adverbs
 * (sous / derrière / devant / à travers) take a non-fusing article straight off `artFor`
 * ("sous une maison" / "sous la maison"); "au-dessus" and "autour" govern "de", which fuses
 * only with the definite ("autour de la maison" but "autour d'une maison"), via `deDet`.
 */
function routeHead(c: ResolvedComplement, f: Record<string, string>, plural: boolean, lead: string): string {
  switch (pathSpecifier(c)) {
    case 'under':       return prepDet('sous', f, plural, lead);
    case 'over':        return `au-dessus ${deDet(f, plural, lead)}`;
    case 'around':      return `autour ${deDet(f, plural, lead)}`;
    case 'behind':      return prepDet('derrière', f, plural, lead);
    case 'in_front_of': return prepDet('devant', f, plural, lead);
    case 'through':
    default:            return prepDet('à travers', f, plural, lead);
  }
}

function complementsPhrase(
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
  subjectForms: Record<string, string> = {},
): string {
  if (!complements) return '';
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      // The complement's *kind* (pronoun? adjective? animate goal?) comes off its first conjunct;
      // its surface is rendered from every conjunct, each with its own article and agreement.
      const f = firstConjunct(c.phrase).head.forms;
      // Subject complement: a predicate adjective agrees with the subject ("la chatte est
      // belle", "elles semblent heureuses") and carries its own degree ("semblent plus
      // heureuses"); a predicate noun keeps its own article, no preposition ("devient une
      // légende"). Coordinated conjuncts each agree with the subject: "semblent heureuses et
      // fatiguées".
      if (type === 'predicative') {
        const gender = subjectForms['gender'] ?? 'masc';
        const plural = subjectForms['number'] === 'plural';
        return coordinate(c.phrase, (np) => {
          if (np.head.forms['role'] !== 'adjective') return npText(np);
          const surface = frComparison(np.head, gender, plural);
          // A predicative superlative has no noun's article to borrow, so it adds its own, agreeing
          // with the subject: "semble LE plus heureux" — distinct from the comparative "plus heureux".
          return isRelativeSuperlative(np.head)
            ? joinArt(defArticle({ gender }, plural, surface), surface)
            : surface;
        });
      }
      // An instrument presented as an action: the gérondif for the process level ("en
      // choisissant un mot"), and for the concept level the periphrasis "avec le fait de choisir
      // un mot". French is the one language here that stays periphrastic, and not by choice: its
      // substantivized infinitive is fossilised (le boire, le manger) rather than productive, so
      // it has no counterpart of "lo scegliere" / "el elegir" / "the choosing" to reify the act
      // with. The noun phrase is the action's direct object.
      if (type === 'instrumental' && c.action) {
        const level = abstractionLevel(c);
        if (level !== 'object') {
          const object = coordinate(c.phrase, npText);
          const verb =
            level === 'process'
              ? `en ${presentParticiple(c.action.verb)}`
              : `avec le fait de ${actionInfinitive(c.action)}`;
          const adverb = c.action.modifier?.forms['base'] ?? '';
          return [verb, object, adverb].filter(Boolean).join(' ');
        }
      }
      // A pronoun cause: neutral "à cause de moi / d'eux" takes the disjunctive after "de"
      // (eliding before a vowel); positive "grâce à moi" takes it after "à" (which never
      // elides); negative uses the possessive with "faute" ("par ma faute").
      if (type === 'cause' && f['person']) {
        const disj = f['disjunctive'] ?? f['base'] ?? '';
        const sent = causeSentiment(c);
        if (sent === 'positive') return `grâce à ${disj}`;
        if (sent === 'negative') {
          const plural = f['number'] === 'plural';
          const poss =
            f['person'] === '1' ? (plural ? 'notre' : 'ma') :
            f['person'] === '2' ? (plural ? 'votre' : 'ta') :
            plural ? 'leur' : 'sa';
          return `par ${poss} faute`;
        }
        return `à cause ${/^[aeiouéèêh]/i.test(disj) ? "d'" : 'de '}${disj}`;
      }
      // locative→dans, direction→à (au/aux/à la), source→"loin de" (loin du/des/de la),
      // route→path preposition. A direction toward an *animate* goal takes "vers"
      // (toward) — French doesn't use bare "à" for a person destination ("je cours vers
      // l'enfant", not "*à l'enfant"); "vers" doesn't contract with the article. Source is
      // prefixed with the ablative adverb "loin" so it clearly reads as motion away ("je
      // cours loin de l'enfant"); bare "de" reads as a partitive/complement, not departure.
      // Cause reads "à cause de" + the "de"-contracted article ("à cause du chien"); the
      // sentiment swaps the connector — negative "par la faute du chien", positive "grâce au
      // chien" ("à"-contracted via datPrep).
      // The preposition contracts with the article ("à"+"le" → "au"), so it cannot be factored
      // out in front of a coordinated complement — each conjunct carries its own contracted head
      // ("au chat et au chien"). Repeating it also lets each conjunct pick its own preposition,
      // which `direction` needs: an animate goal takes "vers", a place "à".
      // A locative proper noun (a continent — "Europe", "Afrique") drops the definite article it
      // carries as a subject ("l'Europe mange"): the "in place" locative is a bare "en Europe", not
      // the article-bearing "dans l'Europe". (All seeded continents are feminine/vowel-initial, which
      // "en" fits; a masculine country would take "au" and a city "à", but none is seeded.)
      const causeSent = type === 'cause' ? causeSentiment(c) : 'neutral';
      const headFor = (nf: Record<string, string>) => (plural: boolean, lead: string): string =>
        type === 'locative'  ? (nf['proper'] === '1' ? 'en' : prepDet('dans', nf, plural, lead)) :
        type === 'terminus'  ? aDet(nf, plural, lead) :
        // Instrumental → "avec", which contracts with nothing ("avec le couteau", "avec un mot").
        type === 'instrumental' ? prepDet('avec', nf, plural, lead) :
        type === 'direction' ? (
          // A continent goal takes bare "en" ("va en Antarctique"), not the default place "à" with
          // the proper noun's article ("à l'Antarctique"); an animate goal takes "vers", a place "à".
          nf['isA'] === 'CONTINENT' ? 'en' :
          nf['animate'] === '1' ? prepDet('vers', nf, plural, lead) : aDet(nf, plural, lead)
        ) :
        type === 'source'    ? `loin ${deDet(nf, plural, lead)}` :
        type === 'cause'     ? (
          causeSent === 'positive' ? `grâce ${datPrep(nf, plural, lead)}` :
          causeSent === 'negative' ? `par la faute ${dePrep(nf, plural, lead)}` :
          `à cause ${dePrep(nf, plural, lead)}`
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
/**
 * Place an object clitic before a finite verb: inside any leading "ne "/"n'" bracket ("ne me voit
 * pas"), and eliding me/te/le/la/se → m'/t'/l'/s' before a vowel-initial verb ("m'aime"). A no-op
 * when there is no clitic.
 */
function frCliticize(clitic: string, verb: string): string {
  if (!clitic) return verb;
  const m = /^(ne |n')/.exec(verb);
  const rest = m ? verb.slice(m[0].length) : verb;
  const c = /^(me|te|le|la|se)$/.test(clitic) && VOWEL_START.test(rest) ? `${clitic[0]}'` : `${clitic} `;
  return `${m?.[0] ?? ''}${c}${rest}`;
}

function predicateText(
  subjectForms: Record<string, string>,
  verbPhrase: ResolvedVerbPhrase,
  directObject?: ResolvedNounElement,
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
): string {
  const { verb, negative: verbNegative, modifier, tense = 'present', aspect = 'neutral', mood, register, modals } = verbPhrase;
  // In a hypothetical conditional the finite verb takes the conditionnel (apodosis, "courrait")
  // or imparfait (protasis, "mangeait") form; marked aspects keep their indicative auxiliary.
  const conjugated = moodForm('fr', verb, moodPN(subjectForms), mood) ?? conjugate(verb.forms, subjectForms, tense);
  const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
  // "jamais" uses ne...jamais (replaces "pas"), even without verbNegative
  const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
  // A frequency adverb (jamais, toujours, souvent) sits right after the finite verb — which
  // in a compound tense means between the auxiliary and the participle ("n'a jamais été",
  // "doit toujours aller"), not trailing the whole group. Manner adverbs still trail.
  const isFrequency = modifier?.forms['subtype'] === 'frequency';
  // "aucun" (no) is itself the negator, so it takes "ne" alone (no "pas") — for a subject
  // ("aucun garçon ne pleure") or an object ("il ne voit aucun garçon").
  const aucun =
    subjectForms['definiteness'] === 'no' ||
    (directObject?.conjuncts.some((np) => np.head.forms['definiteness'] === 'no') ?? false);
  // Wrap a finite verb in "ne … pas" (or "ne" alone, when a self-negating "aucun"/"jamais"
  // already carries the negation). Shared by the periphrastic aspect and the modal chain,
  // which both negate their finite auxiliary and leave the non-finite tail untouched.
  const negateFinite = (finite: string): string => {
    if (!verbNegative && !aucun && !modifierIsNegative) return finite;
    const ne = VOWEL_START.test(finite) ? "n'" : 'ne ';
    const pas = verbNegative && !modifierIsNegative && !aucun ? ' pas' : '';
    return `${ne}${finite}${pas}`;
  };
  let effectiveVerb: string;
  let effectiveMod: string;
  if (modals.length > 0) {
    // The outermost modal is the finite verb — it takes the tense, the agreement, and the
    // negation — and governs the inner modals' infinitives down to the main verb group's
    // ("je ne veux pas pouvoir aller", "il doit avoir vu le chat").
    const { finite, tail } = modalGroupFr(modals, verb.forms, subjectForms, tense, aspect, mood);
    effectiveVerb = [negateFinite(finite), isFrequency ? modifierText : '', tail].filter(Boolean).join(' ');
    effectiveMod = isFrequency ? '' : modifierText;
  } else if (aspect !== 'neutral') {
    // Every non-neutral aspect is periphrastic on a finite auxiliary; negation (ne … pas, or
    // "ne" alone for the self-negating "aucun"/"jamais") wraps that auxiliary, then a
    // frequency adverb, then the non-finite tail ("n'a jamais été", "n'est pas en train
    // d'aller", "est allé", "n'a pas vu").
    const { finite, tail } = aspectVerbFr(verb.forms, subjectForms, tense, aspect, mood);
    effectiveVerb = [negateFinite(finite), isFrequency ? modifierText : '', tail].filter(Boolean).join(' ');
    effectiveMod = isFrequency ? '' : modifierText;
  } else if (verbNegative || aucun || modifierIsNegative) {
    // Plain finite negation reuses `negateFinite`, which elides "ne" → "n'" before a vowel
    // ("il n'est pas prudent") and picks "ne … pas" vs bare "ne" (self-negating aucun/jamais).
    effectiveVerb = negateFinite(conjugated);
    effectiveMod = modifierText;
  } else {
    effectiveVerb = conjugated;
    effectiveMod = modifierText;
  }
  // A pronoun direct object is a proclitic before the finite verb ("le chat me voit"), not a
  // post-verbal noun ("voit le je"). It sits inside any "ne … pas" bracket ("ne me voit pas") and
  // elides me/te/le/la → m'/t'/l' before a vowel; a noun object keeps the post-verbal slot.
  const objectClitic = directObject && isPronounElement(directObject)
    ? objectPronounForm(firstConjunct(directObject).head.forms) : '';
  const directObjectText = directObject && !objectClitic ? coordinate(directObject, npText) : '';
  const complementsText = complementsPhrase(complements, subjectForms);
  // Imperative: a subjectless command. The person picks the form (tu / nous / vous — the -er
  // "tu" dropping its final -s); a single paradigm serves both polarities, with negation wrapped
  // by `negateFinite` ("ne cours pas", "ne sois pas prudent", "aucun"/"jamais" taking bare "ne").
  if (mood === 'imperative') {
    // An instruction addressed to nobody — a button, a menu entry, a recipe step — is the
    // infinitive in French ("Charger une période", "Ne pas courir"), not the imperative.
    if (register === 'instruction') {
      const inf = verb.forms['base'] ?? conjugated;
      const infVerb = verbNegative === true ? `ne pas ${inf}` : inf;
      return [frCliticize(objectClitic, infVerb), modifierText, directObjectText, complementsText]
        .filter(Boolean)
        .join(' ');
    }
    const impForm = imperativeForm('fr', verb, moodPN(subjectForms), false) ?? conjugated;
    return [frCliticize(objectClitic, negateFinite(impForm)), modifierText, directObjectText, complementsText]
      .filter(Boolean)
      .join(' ');
  }
  return [frCliticize(objectClitic, effectiveVerb), effectiveMod, directObjectText, complementsText]
    .filter(Boolean)
    .join(' ');
}

/**
 * A relative clause on `np`. A subject-relative uses "qui" and the head drives agreement
 * ("le garçon qui pleure"). A non-subject (direct-object) relative uses "que" — elided to
 * "qu'" before a vowel — followed by the clause's own subject, which drives agreement
 * ("le livre que je lis"). Indirect/complement relativization ("dont", "à qui") is not
 * yet modelled, so those fall back to "que" — best-effort. TODO: prepositional relativizers.
 */
function relativeText(np: ResolvedNounPhrase): string {
  const rel = np.relative;
  if (!rel) return '';
  if (rel.headRole === 'subject' || !rel.subject) {
    return `qui ${predicateText(np.head.forms, rel.verbPhrase, rel.directObject, rel.complements)}`.trim();
  }
  const subjText = subjectText(rel.subject);
  const relzr = joinArt(VOWEL_START.test(subjText) ? "qu'" : 'que', subjText);
  const pred = predicateText(rel.subject.agreement, rel.verbPhrase, rel.directObject, rel.complements);
  return `${relzr} ${pred}`.trim();
}

/** One clause (subject + predicate), ignoring any attached hypothetical condition. */
function renderClause(phrase: ResolvedPhrase): string {
  const { subject } = phrase;
  // An imperative drops its subject (the person still drives the form — see predicateText).
  const subj = phrase.verbPhrase?.mood === 'imperative' ? '' : subjectText(subject);
  // Verbless period: a bare noun phrase ("dernières nouvelles").
  if (!phrase.verbPhrase) return subj.trim();
  const predicate = predicateText(
    subject.agreement, phrase.verbPhrase, phrase.directObject, phrase.complements,
  );
  return [subj, predicate].filter(Boolean).join(' ').trim();
}

const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'et',
  or: 'ou',
  but: 'mais',
  that_is: "c'est-à-dire",
  therefore: 'donc',
  then: 'et puis',
};

export const frenchEngine: LanguageEngine = {
  language: 'fr',
  render(phrase: ResolvedPhrase): string {
    const main = renderClause(phrase);
    let sentence = main;
    if (phrase.condition) {
      // "si" + protasis (imparfait), elided to "s'" only before "il"/"ils"; apodosis in the
      // conditionnel.
      const cond = renderClause(phrase.condition);
      const ifw = /^ils?\b/.test(cond) ? "s'" : 'si ';
      sentence = `${ifw}${cond}, ${main}`;
    }
    // Coordination: "<first clause>, <conjunction> <second clause>".
    if (!phrase.coordination) return sentence;
    return `${sentence}, ${COORD_WORDS[phrase.coordination.conjunction]} ${renderClause(phrase.coordination.clause)}`;
  },
  renderWord(word: ConceptForms): string {
    const f = word.forms;
    const base = f['base'] ?? '';
    if (f['role'] !== 'adjective') return base;
    return agreeAdjFr(base, f['gender'] ?? 'masc', f['number'] === 'plural');
  },
  // The determiner alone, for the menu that picks one. French elides against the word that
  // follows ("l'", "cet", "beaucoup d'"), so the citation noun is passed as that word.
  renderDeterminer(noun: ConceptForms): string {
    const f = noun.forms;
    const plural = (f['number'] ?? f['count']) === 'plural';
    const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
    return artFor(f, plural, word);
  },
};
