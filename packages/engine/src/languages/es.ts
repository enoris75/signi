import { COMPLEMENT_RENDER_ORDER, type Aspect, type ComplementType, type CoordConjunction, type Degree, type ModifierRelation, type Tense } from '@signi/shared';
import { adjDegree, causeSentiment, modalChain, pathSpecifier, type ConceptForms, type ResolvedComplement, type ResolvedNounPhrase, type ResolvedVerbPhrase, type LanguageEngine, type ResolvedPhrase } from '../types.js';
import { imperativeForm, moodForm, moodPN } from '../mood.js';

// Degree adverb placed before the (agreed) adjective. Comparative and relative superlative
// share "más"/"menos"; the noun phrase's definite article distinguishes them ("un gato más
// grande" vs "el gato más grande"). Equality uses the invariant "igual de".
const ES_DEGREE: Record<Degree, string> = {
  positive: '', more: 'más', most: 'más', less: 'menos', least: 'menos', equally: 'igual de',
};

/** Prefix an adjective's degree adverb onto its already-agreed surface ("más grande"). */
function esDeg(a: ConceptForms, surface: string): string {
  const d = ES_DEGREE[adjDegree(a)];
  return d && surface ? `${d} ${surface}` : surface;
}

function defArticle(forms: Record<string, string>, plural = false): string {
  const gender = forms['gender'] ?? 'masc';
  if (plural) return gender === 'fem' ? 'las' : 'los';
  return gender === 'fem' ? 'la' : 'el';
}

/** The indefinite article: un/una (singular), unos/unas (plural). */
function indefArticle(forms: Record<string, string>, plural = false): string {
  const gender = forms['gender'] ?? 'masc';
  if (plural) return gender === 'fem' ? 'unas' : 'unos';
  return gender === 'fem' ? 'una' : 'un';
}

/**
 * The determiner for a subject/direct-object noun phrase, from its `definiteness`
 * (default 'definite'): the definite/indefinite article, nothing (bare), or a quantifier
 * agreeing in gender. "todos/todas" carry the definite article; "ningún/ninguna" is
 * singular and drives verb negation ("no") upstream when it is an object.
 */
function artFor(forms: Record<string, string>, plural = false): string {
  // A continent name like "África" goes bare in Spanish (no article on the subject/object),
  // whatever determiner the user picked.
  if (forms['proper'] === '1') return '';
  const definiteness = forms['definiteness'] ?? 'definite';
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  // Mass nouns ("agua") stay singular: "algo de agua", "mucha/poca agua", "toda el agua".
  if (forms['uncountable'] === '1') {
    switch (definiteness) {
      case 'bare':       return '';
      case 'indefinite': return '';                 // no "un agua" — bare
      case 'some':       return 'algo de';
      case 'many':       return fem ? 'mucha' : 'mucho';
      case 'few':        return fem ? 'poca' : 'poco';
      case 'all':        return `${fem ? 'toda' : 'todo'} ${defArticle(forms, false)}`;
      case 'no':         return fem ? 'ninguna' : 'ningún';
      default:           return defArticle(forms, false);
    }
  }
  switch (definiteness) {
    case 'bare':       return '';
    case 'indefinite': return indefArticle(forms, plural);
    case 'some':       return fem ? 'algunas' : 'algunos';
    case 'many':       return fem ? 'muchas' : 'muchos';
    case 'few':        return fem ? 'pocas' : 'pocos';
    case 'all':        return `${fem ? 'todas' : 'todos'} ${defArticle(forms, true)}`;
    case 'no':         return fem ? 'ninguna' : 'ningún';
    default:           return defArticle(forms, plural);
  }
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
      .map((a) => esDeg(a, agreeAdj(a.forms['base'] ?? '', gender, plural)))
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

/**
 * Non-contracting preposition (en / hacia / por …) + determiner, honoring the head's
 * `definiteness`. Spanish only fuses "a"/"de" with "el", so these carry whatever `artFor`
 * yields: "en una casa", "en la casa", bare "en" (→ "en casa").
 */
function prepDet(prep: string, forms: Record<string, string>, plural = false): string {
  const det = artFor(forms, plural);
  return det ? `${prep} ${det}` : prep;
}

/** "a" + determiner: al only for the masc-sg definite; else plain "a" + the chosen determiner. */
function aDet(forms: Record<string, string>, plural = false): string {
  if ((forms['definiteness'] ?? 'definite') === 'definite') return datPrep(forms, plural);
  return prepDet('a', forms, plural);
}

/** "de" + determiner: del only for the masc-sg definite; else plain "de" + the chosen determiner. */
function deDet(forms: Record<string, string>, plural = false): string {
  if ((forms['definiteness'] ?? 'definite') === 'definite') return dePrep(forms, plural);
  return prepDet('de', forms, plural);
}

function conjugate(forms: Record<string, string>, subjectForms: Record<string, string>, tense: Tense = 'present'): string {
  const person = subjectForms['person'] ?? '3';
  const number = subjectForms['number'] ?? 'singular';
  const n = number === 'plural' ? 'pl' : 'sg';
  return forms[`${person}${n}_${tense}`] ?? forms[tense] ?? forms[`${person}${n}_present`] ?? forms['base'] ?? '';
}

/** Person/number key ("1sg" … "3pl") into the "estar" auxiliary table below. */
function auxKey(subjectForms: Record<string, string>): string {
  const person = subjectForms['person'] ?? '3';
  const n = (subjectForms['number'] ?? 'singular') === 'plural' ? 'pl' : 'sg';
  return `${person}${n}`;
}

// "estar" — the auxiliary of the progressive and prospective: estar + gerundio / "a punto de"
// + infinitivo. Past uses the imperfect ("estaba"), the aspectually-imperfective past.
const ESTAR_ES: Record<Tense, Record<string, string>> = {
  present: { '1sg': 'estoy', '2sg': 'estás', '3sg': 'está', '1pl': 'estamos', '2pl': 'estáis', '3pl': 'están' },
  past:    { '1sg': 'estaba', '2sg': 'estabas', '3sg': 'estaba', '1pl': 'estábamos', '2pl': 'estabais', '3pl': 'estaban' },
  future:  { '1sg': 'estaré', '2sg': 'estarás', '3sg': 'estará', '1pl': 'estaremos', '2pl': 'estaréis', '3pl': 'estarán' },
};

// "haber" — the resultative auxiliary. Spanish has no essere/avere split: every verb takes
// haber, and the participle never agrees with the subject ("ella ha ido", not "ha ida").
const HABER_ES: Record<Tense, Record<string, string>> = {
  present: { '1sg': 'he', '2sg': 'has', '3sg': 'ha', '1pl': 'hemos', '2pl': 'habéis', '3pl': 'han' },
  past:    { '1sg': 'había', '2sg': 'habías', '3sg': 'había', '1pl': 'habíamos', '2pl': 'habíais', '3pl': 'habían' },
  future:  { '1sg': 'habré', '2sg': 'habrás', '3sg': 'habrá', '1pl': 'habremos', '2pl': 'habréis', '3pl': 'habrán' },
};

/**
 * The verb group for a non-neutral aspect: progressive = estar + gerundio ("está yendo"),
 * prospective = estar + "a punto de" + infinitivo ("está a punto de ir"), resultative = haber
 * + participio ("ha visto", "había ido"). Negation ("no") is prepended by the caller, as for
 * the neutral verb.
 */
function aspectVerb(
  verbForms: Record<string, string>,
  subjectForms: Record<string, string>,
  tense: Tense,
  aspect: Aspect,
): string {
  const key = auxKey(subjectForms);
  const inf = verbForms['base'] ?? '';
  if (aspect === 'progressive') return `${ESTAR_ES[tense][key]} ${verbForms['gerund'] ?? inf}`;
  if (aspect === 'prospective') return `${ESTAR_ES[tense][key]} a punto de ${inf}`;
  return `${HABER_ES[tense][key]} ${verbForms['participle'] ?? inf}`; // resultative
}

/**
 * The main verb's whole group as an infinitive — what a modal governs. Neutral is the bare
 * infinitivo ("debe ir"); the marked aspects put their auxiliary in the infinitive ("debe
 * estar yendo", "debe haber visto").
 */
function verbGroupInfinitive(verbForms: Record<string, string>, aspect: Aspect): string {
  const inf = verbForms['base'] ?? '';
  if (aspect === 'progressive') return `estar ${verbForms['gerund'] ?? inf}`;
  if (aspect === 'prospective') return `estar a punto de ${inf}`;
  if (aspect === 'resultative') return `haber ${verbForms['participle'] ?? inf}`;
  return inf;
}

function nounPhrase(forms: Record<string, string>, adj?: string): string {
  const count = forms['number'] ?? forms['count'] ?? 'singular';
  const plural = count === 'plural';
  const word = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const a = adj ? ` ${adj}` : '';
  const art = artFor(forms, plural); // definite / indefinite / bare
  return art ? `${art} ${word}${a}` : `${word}${a}`;
}

/**
 * A predicate nominal's forms, with an indefinite *plural* flattened to bare: Spanish says
 * "se vuelven gatos", never "se vuelven unos gatos". "unos" before a predicate noun is
 * evaluative ("son unos idiotas"), not the plural of "un". The singular keeps "un/una", and
 * an explicitly chosen determiner (definite, quantifier) passes through untouched. French is
 * the odd Romance sibling here — it keeps "des chats" — so this lives per-engine.
 */
function predicativeForms(forms: Record<string, string>): Record<string, string> {
  const plural = (forms['number'] ?? forms['count'] ?? 'singular') === 'plural';
  if (!plural || forms['definiteness'] !== 'indefinite') return forms;
  return { ...forms, definiteness: 'bare' };
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

/**
 * route path relation → preposition, honoring the head's determiner. Most are "de"-locutions
 * (debajo de, alrededor de, …) whose "de" fuses only with "el" ("debajo del árbol" but
 * "debajo de una casa"), via `deDet`; "through" is the bare preposition "por", which takes a
 * non-fusing article ("por la casa" / "por una casa").
 */
function routeHead(c: ResolvedComplement, plural: boolean): string {
  const f = c.phrase.head.forms;
  switch (pathSpecifier(c)) {
    case 'under':       return `debajo ${deDet(f, plural)}`;
    case 'over':        return `por encima ${deDet(f, plural)}`;
    case 'around':      return `alrededor ${deDet(f, plural)}`;
    case 'behind':      return `detrás ${deDet(f, plural)}`;
    case 'in_front_of': return `delante ${deDet(f, plural)}`;
    case 'through':
    default:            return prepDet('por', f, plural);
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
      // Subject complement: a predicate adjective agrees with the *subject* ("parece
      // cansada") and carries its own degree ("parece más cansada"); a predicate noun keeps
      // its own article, no preposition ("se vuelve una leyenda").
      if (type === 'predicative') {
        if (f['role'] === 'adjective') {
          return esDeg(c.phrase.head, agreeAdj(f['base'] ?? '', subjectForms['gender'] ?? 'masc', subjectForms['number'] === 'plural'));
        }
        return withRelative(nounPhrase(predicativeForms(f), esAdj(c.phrase)), c.phrase);
      }
      // A pronoun cause: neutral "a causa de mí" and positive "gracias a mí" take the tonic
      // form after bare "de"/"a"; negative uses the possessive with "culpa" ("por mi culpa").
      if (type === 'cause' && f['person']) {
        const sent = causeSentiment(c);
        if (sent === 'positive') return `gracias a ${f['disjunctive'] ?? f['base'] ?? ''}`;
        if (sent === 'negative') {
          const plural = f['number'] === 'plural';
          const poss =
            f['person'] === '1' ? (plural ? 'nuestra' : 'mi') :
            f['person'] === '2' ? (plural ? 'vuestra' : 'tu') :
            'su';
          return `por ${poss} culpa`;
        }
        return `a causa de ${f['disjunctive'] ?? f['base'] ?? ''}`;
      }
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
      // Cause reads "a causa de" + the "de"-contracted article ("a causa del perro"); the
      // sentiment swaps the connector — negative "por culpa del perro", positive "gracias al
      // perro" ("a"-contracted via datPrep).
      const causeSent = type === 'cause' ? causeSentiment(c) : 'neutral';
      const head =
        type === 'locative'  ? prepDet('en', f, plural) :
        type === 'terminus'  ? aDet(f, plural) :
        type === 'direction' ? (f['animate'] === '1' ? prepDet('hacia', f, plural) : aDet(f, plural)) :
        type === 'source'    ? `lejos ${deDet(f, plural)}` :
        type === 'cause'     ? (
          causeSent === 'positive' ? `gracias ${datPrep(f, plural)}` :
          causeSent === 'negative' ? `por culpa ${dePrep(f, plural)}` :
          `a causa ${dePrep(f, plural)}`
        ) :
        routeHead(c, plural);
      return withRelative(`${head} ${word}${adj}`, c.phrase);
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * A postnominal possessor, headed by "de"+article ("el libro del gato"). Recurses
 * through withRelative so the possessor carries its own adjectives / nested possessor /
 * relative clause. Empty when the phrase has no possessor.
 */
function possessorText(np: ResolvedNounPhrase): string {
  const poss = np.possessor;
  if (!poss) return '';
  const f = poss.head.forms;
  const plural = (f['number'] ?? f['count']) === 'plural';
  const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
  const a = esAdj(poss);
  const adj = a ? ` ${a}` : '';
  return ` ${withRelative(`${dePrep(f, plural)} ${word}${adj}`, poss)}`;
}

/** Spanish links every attributive-noun relation with bare "de" ("barco de vela", "gafas de sol"). */
const REL_PREP_ES: Record<ModifierRelation, string> = { feature: 'de', purpose: 'de', material: 'de' };

/**
 * Postnominal attributive nouns as bare " de noun" strings (no del contraction). The
 * modifier takes its own number and its adjectives agree with *its* gender/number
 * ("creador de frases semánticas"), postnominal as in Spanish.
 */
function modifierText(np: ResolvedNounPhrase): string {
  return np.nounModifiers
    .map((m) => {
      const forms = m.concept.forms;
      const plural = (forms['number'] ?? forms['count']) === 'plural';
      const noun = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
      if (!noun) return '';
      const gender = forms['gender'] ?? 'masc';
      const adjs = coordinate(
        m.adjectives.map((a) => agreeAdj(a.forms['base'] ?? '', gender, plural)).filter(Boolean),
      );
      const nounPart = adjs ? `${noun} ${adjs}` : noun;
      return ` ${REL_PREP_ES[m.relation]} ${nounPart}`;
    })
    .join('');
}

/**
 * Append a noun phrase's attributive nouns, possessor, and relative clause (invariant
 * "que" + predicate). A subject-relative agrees with the head ("el niño que llora"); an
 * object-relative carries the clause's own subject, which drives agreement ("el libro
 * que yo leo").
 */
function withRelative(text: string, np: ResolvedNounPhrase): string {
  const withPoss = `${text}${modifierText(np)}${possessorText(np)}`;
  const rel = np.relative;
  if (!rel) return withPoss;
  const subjectRelative = rel.headRole === 'subject' || !rel.subject;
  const agreeForms = subjectRelative ? np.head.forms : rel.subject!.head.forms;
  const subjText = subjectRelative
    ? ''
    : withRelative(subjectPhrase(rel.subject!.head.forms, esAdj(rel.subject!)), rel.subject!);
  const clause = predicateText(agreeForms, rel.verbPhrase, rel.directObject, rel.indirectObject, rel.complements);
  return `${withPoss} que ${[subjText, clause].filter(Boolean).join(' ')}`.trimEnd();
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
  // In a hypothetical conditional the finite element takes the conditional (apodosis, "correría")
  // or imperfect-subjunctive (protasis, "comiera") form; marked aspects keep their indicative
  // auxiliary (aspect under a conditional is a documented gap).
  const pn = moodPN(subjectForms);
  const finite = (m: ConceptForms) => moodForm('es', m, pn, mood) ?? conjugate(m.forms, subjectForms, tense);
  // A modal chain makes the outermost modal the finite verb ("quiero poder ir"); "no" is
  // prepended below and lands in front of it, exactly as for a plain verb.
  const conjugated = modals.length > 0
    ? [
        ...modalChain(modals, finite),
        verbGroupInfinitive(verb.forms, aspect),
      ].join(' ')
    : aspect === 'neutral'
      ? finite(verb)
      : aspectVerb(verb.forms, subjectForms, tense, aspect);
  // A "ninguno" (no) direct object is post-verbal, so it triggers negative concord —
  // "no veo ningún niño" — whereas a pre-verbal "ningún" subject does not.
  const objectIsNegative = directObject?.head.forms['definiteness'] === 'no';
  const verbText = verbNegative || objectIsNegative ? `no ${conjugated}` : conjugated;
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
  const complementsText = complementsPhrase(complements, subjectForms);
  // Imperative: a subjectless command. The person picks the form (tú = 3sg-present, nosotros /
  // every negative = present subjunctive, vosotros = infinitive − r + d); a negative command
  // ("no comas", "no seáis") prefixes "no". The adverb simply trails the verb here.
  if (mood === 'imperative') {
    const impNeg = verbNegative === true || objectIsNegative || modifierIsNegative;
    const impForm = imperativeForm('es', verb, moodPN(subjectForms), impNeg) ?? conjugated;
    const impVerb = impNeg ? `no ${impForm}` : impForm;
    return [impVerb, modifierText, directObjectText, indirectObjectText, complementsText]
      .filter(Boolean)
      .join(' ');
  }
  return [preVerb, verbText, postVerb, directObjectText, indirectObjectText, complementsText]
    .filter(Boolean)
    .join(' ');
}

/** One clause (subject + predicate), ignoring any attached hypothetical condition. */
function renderClause(phrase: ResolvedPhrase): string {
  const { subject } = phrase;
  // An imperative drops its subject (the person still drives the form — see predicateText).
  const subjectText = phrase.verbPhrase?.mood === 'imperative'
    ? ''
    : withRelative(subjectPhrase(subject.head.forms, esAdj(subject)), subject);
  // Verbless period: a bare noun phrase ("últimas noticias").
  if (!phrase.verbPhrase) return subjectText.trim();
  const predicate = predicateText(
    subject.head.forms, phrase.verbPhrase, phrase.directObject, phrase.indirectObject, phrase.complements,
  );
  return [subjectText, predicate].filter(Boolean).join(' ').trim();
}

const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'y',
  or: 'o',
  but: 'pero',
  that_is: 'es decir',
  then: 'entonces',
};

export const spanishEngine: LanguageEngine = {
  language: 'es',
  render(phrase: ResolvedPhrase): string {
    const main = renderClause(phrase);
    // Hypothetical conditional: "si <protasis (subjunctive)>, <apodosis (conditional)>".
    const sentence = phrase.condition ? `si ${renderClause(phrase.condition)}, ${main}` : main;
    // Coordination: "<first clause>, <conjunction> <second clause>".
    if (!phrase.coordination) return sentence;
    return `${sentence}, ${COORD_WORDS[phrase.coordination.conjunction]} ${renderClause(phrase.coordination.clause)}`;
  },
};
