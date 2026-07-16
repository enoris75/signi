import { COMPLEMENT_RENDER_ORDER, type Aspect, type ComplementType, type CoordConjunction, type Degree, type ModifierRelation, type Tense } from '@signi/shared';
import { abstractionLevel, actionGerund, actionInfinitive, adjDegree, causeSentiment, firstConjunct, isRelativeSuperlative, joinConjuncts, modalChain, pathSpecifier, type ConceptForms, type Mood, type ResolvedComplement, type ResolvedNounElement, type ResolvedNounPhrase, type ResolvedVerbPhrase, type LanguageEngine, type ResolvedPhrase } from '../types.js';
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

/**
 * A feminine noun beginning with a stressed a- ("agua", "águila") takes the *masculine*
 * singular article — "el agua", "un agua" — purely to break the a-a hiatus. The exception is
 * confined to those two articles: the noun stays feminine everywhere else ("esta agua fría",
 * "toda el agua", plural "las aguas"). The lexicon marks it with forms.stressed_a.
 */
function stressedA(forms: Record<string, string>, plural: boolean): boolean {
  return !plural && forms['stressed_a'] === '1';
}

function defArticle(forms: Record<string, string>, plural = false): string {
  const gender = forms['gender'] ?? 'masc';
  if (plural) return gender === 'fem' ? 'las' : 'los';
  if (stressedA(forms, plural)) return 'el';
  return gender === 'fem' ? 'la' : 'el';
}

/** The indefinite article: un/una (singular), unos/unas (plural). */
function indefArticle(forms: Record<string, string>, plural = false): string {
  const gender = forms['gender'] ?? 'masc';
  if (plural) return gender === 'fem' ? 'unas' : 'unos';
  if (stressedA(forms, plural)) return 'un';
  return gender === 'fem' ? 'una' : 'un';
}

/**
 * The demonstratives, agreeing in gender and number: proximal "este/esta/estos/estas"
 * (this/these) and distal "ese/esa/esos/esas" (that/those).
 */
function demonstrative(distal: boolean, forms: Record<string, string>, plural = false): string {
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  const stem = distal ? 'es' : 'est';
  if (plural) return `${stem}${fem ? 'as' : 'os'}`;
  return `${stem}${fem ? 'a' : 'e'}`;
}

/**
 * The determiner for a subject/direct-object noun phrase, from its `definiteness`
 * (default 'definite'): the definite/indefinite article, nothing (bare), a demonstrative,
 * or a quantifier agreeing in gender. "todos/todas" carry the definite article;
 * "ningún/ninguna" is singular and drives verb negation ("no") upstream when it is an object.
 */
function artFor(forms: Record<string, string>, plural = false): string {
  // Most proper names go bare in Spanish ("África"), whatever determiner the user picked. But a
  // class of them is inherently articled — "la Antártida", "los Estados Unidos" — and that is a
  // property of the name, not a choice, so the lexicon marks it and the definite article wins.
  if (forms['proper'] === '1') {
    return forms['takes_article'] === '1' ? defArticle(forms, plural) : '';
  }
  const definiteness = forms['definiteness'] ?? 'definite';
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  // Mass nouns ("agua") stay singular: "algo de agua", "mucha/poca agua", "toda el agua".
  if (forms['uncountable'] === '1') {
    switch (definiteness) {
      case 'bare':       return '';
      case 'indefinite': return '';                 // no "un agua" — bare
      case 'this':       return demonstrative(false, forms, false);
      case 'that':       return demonstrative(true, forms, false);
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
    case 'this':       return demonstrative(false, forms, plural);
    case 'that':       return demonstrative(true, forms, plural);
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

/**
 * Concept IDs of the adjectives that precede their noun in Spanish. Only the ordinals do:
 * "el primer día", "la segunda vez". Every qualifying adjective (grande, feliz, rojo …)
 * follows the noun, which is why Spanish needs no "BAGS" set the way French and Italian do.
 */
const PRENOMINAL = new Set(['FIRST', 'SECOND', 'THIRD']);

/**
 * Apocope: "primero" and "tercero" lose their final -o immediately before a masculine
 * singular noun ("el primer día", but "la primera vez", "los primeros días"). It happens
 * only in that prenominal position — the postnominal and predicate forms keep the -o.
 */
function apocopate(concept: string, surface: string, gender: string, plural: boolean): string {
  if (plural || gender === 'fem') return surface;
  if (concept !== 'FIRST' && concept !== 'THIRD') return surface;
  return surface.endsWith('o') ? surface.slice(0, -1) : surface;
}

/** A noun phrase's adjectives, agreed with the head and split around it. */
interface EsAdjectives {
  /** The prenominal ones, in order, ready to sit between the article and the noun. */
  pre: string;
  /** The postnominal ones, coordinated with y/e. */
  post: string;
}

/** Agree a noun phrase's adjectives with the head's gender/number and split them around it. */
function esAdj(np: ResolvedNounPhrase): EsAdjectives {
  const gender = np.head.forms['gender'] ?? 'masc';
  const plural = (np.head.forms['number'] ?? np.head.forms['count']) === 'plural';
  const pre: string[] = [];
  const post: string[] = [];
  for (const a of np.adjectives) {
    const surface = agreeAdj(a.forms['base'] ?? '', gender, plural);
    if (!surface) continue;
    // A comparative/superlative follows the noun even when its plain form precedes it ("el
    // primer gato" but "el gato más primero"), as its degree adverb belongs with the phrase.
    if (PRENOMINAL.has(a.conceptId) && adjDegree(a) === 'positive') {
      pre.push(apocopate(a.conceptId, surface, gender, plural));
    } else {
      post.push(esDeg(a, surface));
    }
  }
  return { pre: pre.join(' '), post: coordinate(post) };
}

/** A noun with its adjectives set around it: the prenominal ones, the noun, then the rest. */
function withAdj(word: string, adj?: EsAdjectives): string {
  const pre = adj?.pre ? `${adj.pre} ` : '';
  const post = adj?.post ? ` ${adj.post}` : '';
  return `${pre}${word}${post}`;
}

/**
 * The forms an article is chosen from. The stressed-a exception ("el agua") exists only to
 * break the a-a hiatus between article and noun, so it lapses as soon as a prenominal
 * adjective comes between them: "la primera agua", not "*el primera agua".
 */
function artForms(forms: Record<string, string>, adj?: EsAdjectives): Record<string, string> {
  return adj?.pre ? { ...forms, stressed_a: '' } : forms;
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
// The aspect auxiliaries as minimal concepts, so `moodForm` derives their conditional (estaría /
// habría, from the future stem) and imperfect subjunctive (estuviera / hubiera, from the 3pl
// preterite) — the same way it handles a plain verb. The preterite stems are irregular and are
// not in the tables above (which carry the imperfect), so they are supplied here. Without this a
// marked aspect under a hypothetical dropped the mood and kept the plain present indicative.
const ESTAR_AUX: ConceptForms = { conceptId: 'ESTAR', forms: { '1sg_future': 'estaré', '3pl_past': 'estuvieron' } };
const HABER_AUX: ConceptForms = { conceptId: 'HABER', forms: { '1sg_future': 'habré', '3pl_past': 'hubieron' } };

/** The aspect auxiliary's finite form: its mood form under a hypothetical, else the tense form. */
function auxFinite(aux: ConceptForms, table: Record<Tense, Record<string, string>>, subjectForms: Record<string, string>, tense: Tense, mood?: Mood): string {
  return moodForm('es', aux, moodPN(subjectForms), mood) ?? table[tense][auxKey(subjectForms)];
}

function aspectVerb(
  verbForms: Record<string, string>,
  subjectForms: Record<string, string>,
  tense: Tense,
  aspect: Aspect,
  mood?: Mood,
): string {
  const inf = verbForms['base'] ?? '';
  const estar = auxFinite(ESTAR_AUX, ESTAR_ES, subjectForms, tense, mood);
  if (aspect === 'progressive') return `${estar} ${verbForms['gerund'] ?? inf}`;
  if (aspect === 'prospective') return `${estar} a punto de ${inf}`;
  return `${auxFinite(HABER_AUX, HABER_ES, subjectForms, tense, mood)} ${verbForms['participle'] ?? inf}`; // resultative
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

function nounPhrase(forms: Record<string, string>, adj?: EsAdjectives): string {
  const count = forms['number'] ?? forms['count'] ?? 'singular';
  const plural = count === 'plural';
  const word = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const noun = withAdj(word, adj);
  const art = artFor(artForms(forms, adj), plural); // definite / indefinite / bare
  return art ? `${art} ${noun}` : noun;
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

function subjectPhrase(forms: Record<string, string>, adj?: EsAdjectives): string {
  if (forms['person']) {
    if (forms['number'] === 'plural' && forms['plural']) return forms['plural'];
    return forms['base'] ?? '';
  }
  return nounPhrase(forms, adj); // noun — definite article
}

/**
 * Render every conjunct of a noun slot and coordinate them the Spanish way: commas between all
 * but the last pair, the conjunction on the last ("el gato, el perro y el zorro"). Both words
 * have a euphonic variant before their own sound — "y" becomes "e" before an i-/hi- word, "o"
 * becomes "u" before an o-/ho- one — which is why the link is a function of what follows it.
 */
function coordinateElement(el: ResolvedNounElement, render: (np: ResolvedNounPhrase) => string): string {
  const link = (next: string) =>
    el.conjunction === 'or'
      ? (/^(o|ho)/i.test(next) ? ' u ' : ' o ')
      : (/^(i|hi(?!e))/i.test(next) ? ' e ' : ' y ');
  return joinConjuncts(el.conjuncts.map(render), ', ', link);
}

/** A subject slot: each conjunct with its own article/adjectives/relative, coordinated. */
function subjectText(el: ResolvedNounElement): string {
  return coordinateElement(el, (np) => withRelative(subjectPhrase(np.head.forms, esAdj(np)), np));
}

/** One conjunct as a plain noun phrase carrying its own determiner ("una palabra"). */
function npText(np: ResolvedNounPhrase): string {
  return withRelative(nounPhrase(np.head.forms, esAdj(np)), np);
}

/**
 * route path relation → preposition, honoring the head's determiner. Most are "de"-locutions
 * (debajo de, alrededor de, …) whose "de" fuses only with "el" ("debajo del árbol" but
 * "debajo de una casa"), via `deDet`; "through" is the bare preposition "por", which takes a
 * non-fusing article ("por la casa" / "por una casa").
 */
function routeHead(c: ResolvedComplement, plural: boolean, f: Record<string, string>): string {
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
      // The complement's *kind* (pronoun? adjective? animate goal?) comes off its first conjunct;
      // its surface is rendered from every conjunct, each with its own article and agreement.
      const f = firstConjunct(c.phrase).head.forms;
      // Subject complement: a predicate adjective agrees with the *subject* ("parece
      // cansada") and carries its own degree ("parece más cansada"); a predicate noun keeps
      // its own article, no preposition ("se vuelve una leyenda"). Coordinated conjuncts each
      // agree with the subject: "parece cansada y feliz".
      if (type === 'predicative') {
        const gender = subjectForms['gender'] ?? 'masc';
        const plural = subjectForms['number'] === 'plural';
        return coordinateElement(c.phrase, (np) => {
          if (np.head.forms['role'] !== 'adjective') {
            return withRelative(nounPhrase(predicativeForms(np.head.forms), esAdj(np)), np);
          }
          const surface = esDeg(np.head, agreeAdj(np.head.forms['base'] ?? '', gender, plural));
          // A predicative superlative has no noun's article to borrow, so it adds its own, agreeing
          // with the subject: "parece EL más feliz" — distinct from the comparative "más feliz".
          return isRelativeSuperlative(np.head) ? `${defArticle({ gender }, plural)} ${surface}` : surface;
        });
      }
      // An instrument presented as an action: the bare gerundio for the process level
      // ("eligiendo una palabra"), the substantivized infinitive for the concept level ("con el
      // elegir una palabra") — a masculine singular noun, hence the invariant "el", whatever the
      // infinitive. The noun phrase is the action's direct object either way.
      if (type === 'instrumental' && c.action) {
        const level = abstractionLevel(c);
        if (level !== 'object') {
          const object = coordinateElement(c.phrase, npText);
          const verb =
            level === 'process'
              ? actionGerund(c.action)
              : `con el ${actionInfinitive(c.action)}`;
          const adverb = c.action.modifier?.forms['base'] ?? '';
          return [verb, object, adverb].filter(Boolean).join(' ');
        }
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
      // The preposition contracts with the article ("a"+"el" → "al"), so it cannot be factored
      // out in front of a coordinated complement — each conjunct carries its own contracted head
      // ("al gato y al perro"). Repeating it also lets each conjunct pick its own preposition,
      // which `direction` needs: an animate goal takes "hacia", a place "a".
      return coordinateElement(c.phrase, (np) => {
      const f = np.head.forms;
      const plural = (f['number'] ?? f['count']) === 'plural';
      const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
      const adj = esAdj(np);
      const noun = withAdj(word, adj);
      // The article is chosen from `af`, not `f`: a prenominal adjective changes which one the
      // stressed-a nouns take ("en la primera agua").
      const af = artForms(f, adj);
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
        type === 'locative'  ? prepDet('en', af, plural) :
        type === 'terminus'  ? aDet(af, plural) :
        // Instrumental → "con", which contracts with nothing ("con el cuchillo", "con una palabra").
        type === 'instrumental' ? prepDet('con', af, plural) :
        type === 'direction' ? (f['animate'] === '1' ? prepDet('hacia', af, plural) : aDet(af, plural)) :
        type === 'source'    ? `lejos ${deDet(af, plural)}` :
        type === 'cause'     ? (
          causeSent === 'positive' ? `gracias ${datPrep(af, plural)}` :
          causeSent === 'negative' ? `por culpa ${dePrep(af, plural)}` :
          `a causa ${dePrep(af, plural)}`
        ) :
        routeHead(c, plural, af);
      return withRelative(`${head} ${noun}`, np);
      });
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
  const adj = esAdj(poss);
  return ` ${withRelative(`${dePrep(artForms(f, adj), plural)} ${withAdj(word, adj)}`, poss)}`;
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
  const agreeForms = subjectRelative ? np.head.forms : rel.subject!.agreement;
  const subjText = subjectRelative ? '' : subjectText(rel.subject!);
  const clause = predicateText(agreeForms, rel.verbPhrase, rel.directObject, rel.complements);
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
  directObject?: ResolvedNounElement,
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
): string {
  const { verb, negative: verbNegative, modifier, tense = 'present', aspect = 'neutral', mood, register, modals } = verbPhrase;
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
      : aspectVerb(verb.forms, subjectForms, tense, aspect, mood);
  // A "ninguno" (no) direct object is post-verbal, so it triggers negative concord —
  // "no veo ningún niño" — whereas a pre-verbal "ningún" subject does not.
  // Any "ningún" conjunct triggers the concord — "no veo ningún niño ni ninguna niña".
  const objectIsNegative = directObject?.conjuncts.some((np) => np.head.forms['definiteness'] === 'no') ?? false;
  const verbText = verbNegative || objectIsNegative ? `no ${conjugated}` : conjugated;
  const directObjectText = directObject ? coordinateElement(directObject, npText) : '';
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
    // An instruction addressed to nobody — a button, a menu entry, a recipe step — is the
    // infinitive in Spanish ("Cargar un período", "No correr"), not the imperative.
    const impForm = register === 'instruction'
      ? (verb.forms['base'] ?? conjugated)
      : (imperativeForm('es', verb, moodPN(subjectForms), impNeg) ?? conjugated);
    const impVerb = impNeg ? `no ${impForm}` : impForm;
    return [impVerb, modifierText, directObjectText, complementsText]
      .filter(Boolean)
      .join(' ');
  }
  return [preVerb, verbText, postVerb, directObjectText, complementsText]
    .filter(Boolean)
    .join(' ');
}

/** One clause (subject + predicate), ignoring any attached hypothetical condition. */
function renderClause(phrase: ResolvedPhrase): string {
  const { subject } = phrase;
  // An imperative drops its subject (the person still drives the form — see predicateText).
  const subj = phrase.verbPhrase?.mood === 'imperative' ? '' : subjectText(subject);
  // Verbless period: a bare noun phrase ("últimas noticias").
  if (!phrase.verbPhrase) return subj.trim();
  const predicate = predicateText(
    subject.agreement, phrase.verbPhrase, phrase.directObject, phrase.complements,
  );
  return [subj, predicate].filter(Boolean).join(' ').trim();
}

const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'y',
  or: 'o',
  but: 'pero',
  that_is: 'es decir',
  // "entonces" is both conclusive and temporal in Spanish; the unambiguous "por lo tanto" /
  // "y luego" pair keeps the two selectors distinguishable.
  therefore: 'por lo tanto',
  then: 'y luego',
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
  // No apocope here: the word stands alone, with no masculine noun behind it to shorten before.
  renderWord(word: ConceptForms): string {
    const f = word.forms;
    const base = f['base'] ?? '';
    if (f['role'] !== 'adjective') return base;
    return agreeAdj(base, f['gender'] ?? 'masc', f['number'] === 'plural');
  },
  // The determiner alone, for the menu that picks one.
  renderDeterminer(noun: ConceptForms): string {
    const f = noun.forms;
    return artFor(f, (f['number'] ?? f['count']) === 'plural');
  },
};
