import { COMPLEMENT_RENDER_ORDER, type ComplementType, type Degree, type ModifierRelation, type Tense } from '@signi/shared';
import { adjDegree, causeSentiment, pathSpecifier, type ConceptForms, type ResolvedComplement, type ResolvedNounPhrase, type ResolvedVerbPhrase, type LanguageEngine, type ResolvedPhrase } from '../types.js';

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

function nounPhrase(forms: Record<string, string>, adj?: string): string {
  const count = forms['number'] ?? forms['count'] ?? 'singular';
  const plural = count === 'plural';
  const word = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const a = adj ? ` ${adj}` : '';
  const art = artFor(forms, plural); // definite / indefinite / bare
  return art ? `${art} ${word}${a}` : `${word}${a}`;
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
      // Subject complement: a predicate adjective agrees with the *subject* ("se vuelve
      // una leyenda" but "parece cansada"); a predicate noun keeps its own article, no
      // preposition ("se vuelve una leyenda").
      if (type === 'predicative') {
        if (f['role'] === 'adjective') {
          return agreeAdj(f['base'] ?? '', subjectForms['gender'] ?? 'masc', subjectForms['number'] === 'plural');
        }
        return withRelative(nounPhrase(f, esAdj(c.phrase)), c.phrase);
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

/** Postnominal attributive nouns as bare " de noun" strings (no del contraction). */
function modifierText(np: ResolvedNounPhrase): string {
  return np.nounModifiers
    .map((m) => {
      const base = m.concept.forms['base'];
      return base ? ` ${REL_PREP_ES[m.relation]} ${base}` : '';
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
  const { verb, negative: verbNegative, modifier, tense } = verbPhrase;
  const conjugated = conjugate(verb.forms, subjectForms, tense);
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
  return [preVerb, verbText, postVerb, directObjectText, indirectObjectText, complementsText]
    .filter(Boolean)
    .join(' ');
}

export const spanishEngine: LanguageEngine = {
  language: 'es',
  render(phrase: ResolvedPhrase): string {
    const { subject } = phrase;
    const subjectText = withRelative(subjectPhrase(subject.head.forms, esAdj(subject)), subject);
    // Verbless period: a bare noun phrase ("últimas noticias").
    if (!phrase.verbPhrase) return subjectText.trim();
    const predicate = predicateText(
      subject.head.forms, phrase.verbPhrase, phrase.directObject, phrase.indirectObject, phrase.complements,
    );
    return [subjectText, predicate].filter(Boolean).join(' ').trim();
  },
};
