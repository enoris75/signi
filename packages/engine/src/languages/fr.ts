import { COMPLEMENT_RENDER_ORDER, type Aspect, type ComplementType, type CoordConjunction, type Degree, type ModifierRelation, type Tense } from '@signi/shared';
import { adjDegree, causeSentiment, modalChain, pathSpecifier, type ConceptForms, type Mood, type ResolvedComplement, type ResolvedNounPhrase, type ResolvedVerbPhrase, type LanguageEngine, type ResolvedPhrase } from '../types.js';
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

/**
 * The indefinite article: masc "un", fem "une", plural "des" (French keeps a plural
 * indefinite, unlike the Romance siblings). "un"/"une" don't elide before a vowel.
 */
function indefArticle(forms: Record<string, string>, plural: boolean): string {
  if (plural) return 'des';
  return (forms['gender'] ?? 'masc') === 'fem' ? 'une' : 'un';
}

/**
 * The determiner for a subject/direct-object noun phrase, from its `definiteness`
 * (default 'definite'): the definite/indefinite article, nothing (bare), or a quantifier.
 * "beaucoup/peu de" take a bare noun (the "de" elides before a vowel); "tous/toutes les"
 * carry the definite article; "aucun/e" is singular and drives verb negation ("ne") upstream.
 */
function artFor(forms: Record<string, string>, plural: boolean, lead: string): string {
  // A proper noun (l'Afrique) always takes the definite article in French, whatever
  // determiner the user picked; it is a property of the name, not a choice.
  if (forms['proper'] === '1') return defArticle(forms, plural, lead);
  const definiteness = forms['definiteness'] ?? 'definite';
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  const de = VOWEL_START.test(lead) ? "d'" : 'de';
  // Mass nouns ("eau") stay singular and take the partitive "de l'/du/de la" for
  // some/indefinite; "beaucoup/peu de" already work; "all" → "tout/toute" + article.
  if (forms['uncountable'] === '1') {
    switch (definiteness) {
      case 'bare':       return '';
      case 'indefinite': return dePrep(forms, false, lead);   // partitive: "de l'eau"
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
  if (!det || drops) return VOWEL_START.test(lead) ? "d'" : 'de';
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
function aspectVerbFr(
  verbForms: Record<string, string>,
  subjectForms: Record<string, string>,
  tense: Tense,
  aspect: Aspect,
): { finite: string; tail: string } {
  const key = auxKey(subjectForms);
  const inf = verbForms['base'] ?? '';
  const deInf = VOWEL_START.test(inf) ? `d'${inf}` : `de ${inf}`;
  if (aspect === 'progressive') return { finite: ETRE_FR[tense][key], tail: `en train ${deInf}` };
  if (aspect === 'prospective') return { finite: ETRE_FR[tense][key], tail: `sur le point ${deInf}` };
  const etre = verbForms['aux'] === 'be'; // resultative
  const part = verbForms['participle'] ?? inf;
  return {
    finite: (etre ? ETRE_FR : AVOIR_FR)[tense][key],
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
    const word = frDeg(a, agreeAdjFr(a.forms['base'] ?? '', gender, plural));
    if (!word) continue;
    // A comparative/superlative adjective is postnominal in French ("le chat plus grand"),
    // even when its plain form would precede the noun — this also avoids elision artefacts
    // ("l'aussi grand chat").
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
  const postStr = post.join(' et ');
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
 * route path relation → preposition, honoring the head's determiner. The plain adverbs
 * (sous / derrière / devant / à travers) take a non-fusing article straight off `artFor`
 * ("sous une maison" / "sous la maison"); "au-dessus" and "autour" govern "de", which fuses
 * only with the definite ("autour de la maison" but "autour d'une maison"), via `deDet`.
 */
function routeHead(c: ResolvedComplement, plural: boolean, lead: string): string {
  const f = c.phrase.head.forms;
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
      const f = c.phrase.head.forms;
      // Subject complement: a predicate adjective agrees with the subject ("la chatte est
      // belle", "elles semblent heureuses"); a predicate noun keeps its own article, no
      // preposition ("devient une légende").
      if (type === 'predicative') {
        if (f['role'] === 'adjective')
          return agreeAdjFr(f['base'] ?? '', subjectForms['gender'] ?? 'masc', subjectForms['number'] === 'plural');
        return renderNP(c.phrase, (plural, lead) => artFor(f, plural, lead));
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
      const causeSent = type === 'cause' ? causeSentiment(c) : 'neutral';
      const headFor = (plural: boolean, lead: string): string =>
        type === 'locative'  ? prepDet('dans', f, plural, lead) :
        type === 'terminus'  ? aDet(f, plural, lead) :
        type === 'direction' ? (f['animate'] === '1' ? prepDet('vers', f, plural, lead) : aDet(f, plural, lead)) :
        type === 'source'    ? `loin ${deDet(f, plural, lead)}` :
        type === 'cause'     ? (
          causeSent === 'positive' ? `grâce ${datPrep(f, plural, lead)}` :
          causeSent === 'negative' ? `par la faute ${dePrep(f, plural, lead)}` :
          `à cause ${dePrep(f, plural, lead)}`
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
  const { verb, negative: verbNegative, modifier, tense = 'present', aspect = 'neutral', mood, modals } = verbPhrase;
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
    directObject?.head.forms['definiteness'] === 'no';
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
    const { finite, tail } = aspectVerbFr(verb.forms, subjectForms, tense, aspect);
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
  const directObjectText = directObject
    ? renderNP(directObject, (plural, lead) => artFor(directObject.head.forms, plural, lead))
    : '';
  // V [Adv] DirectObj IndirectObj(à+article)
  const indirectObjectText = indirectObject
    ? renderNP(indirectObject, (plural, lead) => datPrep(indirectObject.head.forms, plural, lead))
    : '';
  const complementsText = complementsPhrase(complements, subjectForms);
  // Imperative: a subjectless command. The person picks the form (tu / nous / vous — the -er
  // "tu" dropping its final -s); a single paradigm serves both polarities, with negation wrapped
  // by `negateFinite` ("ne cours pas", "ne sois pas prudent", "aucun"/"jamais" taking bare "ne").
  if (mood === 'imperative') {
    const impForm = imperativeForm('fr', verb, moodPN(subjectForms), false) ?? conjugated;
    return [negateFinite(impForm), modifierText, directObjectText, indirectObjectText, complementsText]
      .filter(Boolean)
      .join(' ');
  }
  return [effectiveVerb, effectiveMod, directObjectText, indirectObjectText, complementsText]
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
    return `qui ${predicateText(np.head.forms, rel.verbPhrase, rel.directObject, rel.indirectObject, rel.complements)}`.trim();
  }
  const subjText = subjectPhrase(rel.subject);
  const relzr = joinArt(VOWEL_START.test(subjText) ? "qu'" : 'que', subjText);
  const pred = predicateText(rel.subject.head.forms, rel.verbPhrase, rel.directObject, rel.indirectObject, rel.complements);
  return `${relzr} ${pred}`.trim();
}

/** One clause (subject + predicate), ignoring any attached hypothetical condition. */
function renderClause(phrase: ResolvedPhrase): string {
  const { subject } = phrase;
  // An imperative drops its subject (the person still drives the form — see predicateText).
  const subjectText = phrase.verbPhrase?.mood === 'imperative' ? '' : subjectPhrase(subject);
  // Verbless period: a bare noun phrase ("dernières nouvelles").
  if (!phrase.verbPhrase) return subjectText.trim();
  const predicate = predicateText(
    subject.head.forms, phrase.verbPhrase, phrase.directObject, phrase.indirectObject, phrase.complements,
  );
  return [subjectText, predicate].filter(Boolean).join(' ').trim();
}

const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'et',
  or: 'ou',
  but: 'mais',
  that_is: "c'est-à-dire",
  then: 'donc',
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
};
