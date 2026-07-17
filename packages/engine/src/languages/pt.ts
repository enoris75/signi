import { COMPLEMENT_RENDER_ORDER, type Aspect, type ComplementType, type CoordConjunction, type Degree, type ModifierRelation, type Tense } from '@signi/shared';
import { abstractionLevel, actionGerund, actionInfinitive, adjDegree, causeSentiment, firstConjunct, groupHasNegativeAdverb, hasNegativeComplement, isPronominalPossessor, isPronounElement, isRelativeSuperlative, joinConjuncts, modalChain, objectPronounForm, pathSpecifier, SOURCE_ABLATIVE_ADVERB_VERBS, type ConceptForms, type Mood, type ResolvedComplement, type ResolvedNounElement, type ResolvedNounPhrase, type ResolvedVerbPhrase, type LanguageEngine, type ResolvedPhrase } from '../types.js';
import { imperativeForm, moodForm, moodPN } from '../mood.js';
import { possessivePt } from '../possessive.js';

// Degree adverb placed before the (agreed) adjective. Comparative and relative superlative
// share "mais"/"menos"; the noun phrase's definite article distinguishes them ("um gato mais
// grande" vs "o gato mais grande"). Equality uses the invariant "igualmente".
const PT_DEGREE: Record<Degree, string> = {
  positive: '', more: 'mais', most: 'mais', less: 'menos', least: 'menos', equally: 'igualmente',
};

/** Prefix an adjective's degree adverb onto its already-agreed surface ("mais grande"). */
function ptDeg(a: ConceptForms, surface: string): string {
  const d = PT_DEGREE[adjDegree(a)];
  return d && surface ? `${d} ${surface}` : surface;
}

/**
 * The raised degrees (more/most) of these adjectives are suppletive in Portuguese — a single
 * synthetic word, never "mais" + base: grande → maior, bom → melhor, pequeno → menor, mau →
 * pior. Only "more"/"most" suppletise; the lowered and equal degrees stay periphrastic ("menos
 * grande", "igualmente bom"). All four suppletives are gender-invariant and pluralise in -es
 * (maiores, melhores), which `agreeAdj` derives from the base.
 */
const PT_SUPPLETIVE: Record<string, string> = {
  BIG: 'maior', GOOD: 'melhor', SMALL: 'menor', BAD: 'pior',
};

/**
 * An adjective's comparison surface, agreed with the noun. A suppletive raised degree replaces
 * the base outright and is itself agreed (maior → maiores); every other case is the periphrastic
 * degree adverb prefixed onto the agreed base ("mais grande", "menos bom").
 */
function ptComparison(a: ConceptForms, gender: string, plural: boolean): string {
  const degree = adjDegree(a);
  const suppletive = PT_SUPPLETIVE[a.conceptId];
  if (suppletive && (degree === 'more' || degree === 'most')) {
    return agreeAdj(suppletive, gender, plural);
  }
  return ptDeg(a, agreeAdj(a.forms['base'] ?? '', gender, plural));
}

function defArticle(forms: Record<string, string>, plural = false): string {
  const gender = forms['gender'] ?? 'masc';
  if (plural) return gender === 'fem' ? 'as' : 'os';
  return gender === 'fem' ? 'a' : 'o';
}

/** The indefinite article: um/uma (singular), uns/umas (plural). */
function indefArticle(forms: Record<string, string>, plural = false): string {
  const gender = forms['gender'] ?? 'masc';
  if (plural) return gender === 'fem' ? 'umas' : 'uns';
  return gender === 'fem' ? 'uma' : 'um';
}

/**
 * The demonstratives, agreeing in gender and number: proximal "este/esta/estes/estas"
 * (this/these) and medial "esse/essa/esses/essas" (that/those). Portuguese also has a distal
 * "aquele" (yonder, away from both speakers), but the two-way this/that contrast maps onto
 * este/esse, the pair that mirrors the speaker/hearer split "that" carries.
 */
function demonstrative(distal: boolean, forms: Record<string, string>, plural = false): string {
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  const stem = distal ? 'ess' : 'est';
  if (plural) return `${stem}${fem ? 'as' : 'es'}`;
  return `${stem}${fem ? 'a' : 'e'}`;
}

/**
 * The determiner for a subject/direct-object noun phrase, from its `definiteness`
 * (default 'definite'): the definite/indefinite article, nothing (bare), a demonstrative,
 * or a quantifier agreeing in gender. "todos/todas" carry the definite article;
 * "nenhum/nenhuma" is singular and drives verb negation ("não") upstream when it is an object.
 */
function artFor(forms: Record<string, string>, plural = false): string {
  // A proper noun (a África) always takes the definite article in Portuguese, whatever
  // determiner the user picked; it is a property of the name, not a choice.
  if (forms['proper'] === '1') return defArticle(forms, plural);
  const definiteness = forms['definiteness'] ?? 'definite';
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  // Mass nouns ("água") stay singular: "um pouco de água", "muita/pouca água", "toda a água".
  if (forms['uncountable'] === '1') {
    switch (definiteness) {
      case 'bare':       return '';
      case 'indefinite': return '';                 // no "uma água" — bare
      case 'this':       return demonstrative(false, forms, false);
      case 'that':       return demonstrative(true, forms, false);
      case 'some':       return 'um pouco de';
      case 'many':       return fem ? 'muita' : 'muito';
      case 'few':        return fem ? 'pouca' : 'pouco';
      case 'all':        return `${fem ? 'toda' : 'todo'} ${defArticle(forms, false)}`;
      case 'no':         return fem ? 'nenhuma' : 'nenhum';
      default:           return defArticle(forms, false);
    }
  }
  switch (definiteness) {
    case 'bare':       return '';
    case 'indefinite': return indefArticle(forms, plural);
    case 'this':       return demonstrative(false, forms, plural);
    case 'that':       return demonstrative(true, forms, plural);
    case 'some':       return fem ? 'algumas' : 'alguns';
    case 'many':       return fem ? 'muitas' : 'muitos';
    case 'few':        return fem ? 'poucas' : 'poucos';
    case 'all':        return `${fem ? 'todas' : 'todos'} ${defArticle(forms, true)}`;
    case 'no':         return fem ? 'nenhuma' : 'nenhum';
    default:           return defArticle(forms, plural);
  }
}

/** Irregular Portuguese adjectives: base → [masc sg, fem sg, masc pl, fem pl]. */
const IRREGULAR_ADJ: Record<string, [string, string, string, string]> = {
  bom: ['bom', 'boa', 'bons', 'boas'],
  mau: ['mau', 'má', 'maus', 'más'],
};

/** Whether a noun phrase surfaces as plural. A `no`-determined phrase is always singular in
 *  Portuguese — the negative quantifier "nenhum" has no plural — so a requested plural is ignored
 *  ("nenhum rato", never the mismatched "nenhum ratos"). */
function isPlural(forms: Record<string, string>): boolean {
  return (forms['number'] ?? forms['count']) === 'plural' && forms['definiteness'] !== 'no';
}

/** Portuguese noun/adjective pluralisation: -m → -ns, -r/-z → -es, -l → -is, else +s. */
function pluralize(word: string): string {
  if (/m$/i.test(word)) return `${word.slice(0, -1)}ns`;
  if (/[rz]$/i.test(word)) return `${word}es`;
  if (/l$/i.test(word)) return `${word.slice(0, -1)}is`;
  return `${word}s`;
}

/**
 * Inflect a Portuguese adjective (given as masculine singular) to agree with the head
 * noun's gender and number. "-o" adjectives take -a/-os/-as; adjectives ending in
 * -e or a consonant are gender-invariant and only pluralise.
 */
function agreeAdj(base: string, gender: string, plural: boolean): string {
  if (!base) return '';
  const fem = gender === 'fem';
  const irr = IRREGULAR_ADJ[base];
  if (irr) return irr[(fem ? 1 : 0) + (plural ? 2 : 0)];
  const sg = base.endsWith('o') && fem ? `${base.slice(0, -1)}a` : base;
  return plural ? pluralize(sg) : sg;
}

/**
 * Concept IDs of the adjectives that precede their noun in Portuguese. Only the ordinals do:
 * "o primeiro dia", "a segunda vez". Every qualifying adjective follows the noun (and unlike
 * Spanish, no ordinal apocopates — "o primeiro dia", never "*o primer dia").
 */
const PRENOMINAL = new Set(['FIRST', 'SECOND', 'THIRD']);

/** A noun phrase's adjectives, agreed with the head and split around it. */
interface PtAdjectives {
  /** The prenominal ones, in order, ready to sit between the article and the noun. */
  pre: string;
  /** The postnominal ones, coordinated with "e". */
  post: string;
}

/** Agree a noun phrase's adjectives with the head's gender/number and split them around it. */
function ptAdj(np: ResolvedNounPhrase): PtAdjectives {
  const gender = np.head.forms['gender'] ?? 'masc';
  const plural = isPlural(np.head.forms);
  const pre: string[] = [];
  const post: string[] = [];
  for (const a of np.adjectives) {
    // A comparative/superlative follows the noun even when its plain form precedes it: its
    // degree marking (periphrastic "mais …" or a suppletive like "maior") belongs with the
    // phrase, not between the article and the noun.
    if (PRENOMINAL.has(a.conceptId) && adjDegree(a) === 'positive') {
      const surface = agreeAdj(a.forms['base'] ?? '', gender, plural);
      if (surface) pre.push(surface);
    } else {
      const surface = ptComparison(a, gender, plural);
      if (surface) post.push(surface);
    }
  }
  // Coordinate the postnominal adjectives as a list: commas between all but the last pair, "e"
  // only before the last ("grande, velho e belo"), like a coordinated noun slot.
  return { pre: pre.join(' '), post: joinConjuncts(post, ', ', () => ' e ') };
}

/** A noun with its adjectives set around it: the prenominal ones, the noun, then the rest. */
function withAdj(word: string, adj?: PtAdjectives): string {
  const pre = adj?.pre ? `${adj.pre} ` : '';
  const post = adj?.post ? ` ${adj.post}` : '';
  return `${pre}${word}${post}`;
}

/** Portuguese "em" (in) + article: em+o=no, em+a=na, em+os=nos, em+as=nas. */
function emPrep(forms: Record<string, string>, plural = false): string {
  const art = defArticle(forms, plural);
  return ({ o: 'no', a: 'na', os: 'nos', as: 'nas' } as Record<string, string>)[art] ?? `em ${art}`;
}

/** Portuguese "de" (from) + article: de+o=do, de+a=da, de+os=dos, de+as=das. */
function dePrep(forms: Record<string, string>, plural = false): string {
  const art = defArticle(forms, plural);
  return ({ o: 'do', a: 'da', os: 'dos', as: 'das' } as Record<string, string>)[art] ?? `de ${art}`;
}

/** Portuguese "por" (through) + article: por+o=pelo, por+a=pela, … */
function porPrep(forms: Record<string, string>, plural = false): string {
  const art = defArticle(forms, plural);
  return ({ o: 'pelo', a: 'pela', os: 'pelos', as: 'pelas' } as Record<string, string>)[art] ?? `por ${art}`;
}

/**
 * Portuguese "a" (to) + definite article contractions:
 * a+o=ao, a+a=à, a+os=aos, a+as=às
 */
function datPrep(forms: Record<string, string>, plural = false): string {
  const art = defArticle(forms, plural);
  if (art === 'o') return 'ao';
  if (art === 'a') return 'à';
  if (art === 'os') return 'aos';
  if (art === 'as') return 'às';
  return `a ${art}`;
}

/**
 * Non-contracting preposition (para …) + determiner, honoring the head's `definiteness`.
 * Carries whatever `artFor` yields: "para uma casa", "para a casa", bare "para" (→ "para casa").
 */
function prepDet(prep: string, forms: Record<string, string>, plural = false): string {
  const det = artFor(forms, plural);
  return det ? `${prep} ${det}` : prep;
}

/**
 * Contracting preposition (a/de/em/por) + determiner. The definite article fuses via
 * `contract` (ao/à, do/da, no/na, pelo/pela); "em" and "de" fuse with a demonstrative just as
 * obligatorily (em+esta = nesta, de+esse = desse), which is the one determiner besides the
 * article that contracts. Everything else rides after the plain preposition uncontracted
 * ("a uma casa", "de muitas casas", "em nenhuma casa").
 */
function contractDet(
  contract: (f: Record<string, string>, p: boolean) => string,
  prep: string,
  forms: Record<string, string>,
  plural = false,
): string {
  const definiteness = forms['definiteness'] ?? 'definite';
  // A proper noun keeps its definite article whatever was picked (see `artFor`), so it
  // contracts with it: "na África".
  if (definiteness === 'definite' || forms['proper'] === '1') return contract(forms, plural);
  if ((definiteness === 'this' || definiteness === 'that') && (prep === 'em' || prep === 'de')) {
    return `${prep === 'em' ? 'n' : 'd'}${demonstrative(definiteness === 'that', forms, plural)}`;
  }
  return prepDet(prep, forms, plural);
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

// "estar" — the auxiliary of the progressive and prospective: estar + gerúndio / "prestes a" +
// infinitivo. Past uses the imperfect ("estava"). The gerund progressive is the Brazilian norm
// ("está indo").
const ESTAR_PT: Record<Tense, Record<string, string>> = {
  present: { '1sg': 'estou', '2sg': 'estás', '3sg': 'está', '1pl': 'estamos', '2pl': 'estais', '3pl': 'estão' },
  past:    { '1sg': 'estava', '2sg': 'estavas', '3sg': 'estava', '1pl': 'estávamos', '2pl': 'estáveis', '3pl': 'estavam' },
  future:  { '1sg': 'estarei', '2sg': 'estarás', '3sg': 'estará', '1pl': 'estaremos', '2pl': 'estareis', '3pl': 'estarão' },
};

// "ter" — the resultative auxiliary. Like Spanish, Portuguese has no essere/avere split (and
// unlike Spanish it uses "ter", not "haver"); the participle does not agree with the subject.
const TER_PT: Record<Tense, Record<string, string>> = {
  present: { '1sg': 'tenho', '2sg': 'tens', '3sg': 'tem', '1pl': 'temos', '2pl': 'tendes', '3pl': 'têm' },
  past:    { '1sg': 'tinha', '2sg': 'tinhas', '3sg': 'tinha', '1pl': 'tínhamos', '2pl': 'tínheis', '3pl': 'tinham' },
  future:  { '1sg': 'terei', '2sg': 'terás', '3sg': 'terá', '1pl': 'teremos', '2pl': 'tereis', '3pl': 'terão' },
};

/**
 * The verb group for a non-neutral aspect: progressive = estar + gerúndio ("está indo"),
 * prospective = estar + "prestes a" + infinitivo ("está prestes a ir"), resultative = ter +
 * particípio in the past/future ("tinha ido", "terá visto") but the pretérito perfeito in the
 * present ("viu", not the iterative "tem visto" — see below). Negation ("não") is prepended by
 * the caller, as for the neutral verb.
 */
// The aspect auxiliaries as minimal concepts, so `moodForm` derives their conditional (estaria /
// teria, from the future stem) and imperfect subjunctive (estivesse / tivesse, from the 3pl
// preterite) — the same way it handles a plain verb. The preterite stems are irregular and are
// not in the tables above (which carry the imperfect), so they are supplied here.
const ESTAR_AUX: ConceptForms = { conceptId: 'ESTAR', forms: { '1sg_future': 'estarei', '3pl_past': 'estiveram' } };
const TER_AUX: ConceptForms = { conceptId: 'TER', forms: { '1sg_future': 'terei', '3pl_past': 'tiveram' } };

/** The aspect auxiliary's finite form: its mood form under a hypothetical, else the tense form. */
function auxFinite(aux: ConceptForms, table: Record<Tense, Record<string, string>>, subjectForms: Record<string, string>, tense: Tense, mood?: Mood): string {
  return moodForm('pt', aux, moodPN(subjectForms), mood) ?? table[tense][auxKey(subjectForms)];
}

function aspectVerb(
  verbForms: Record<string, string>,
  subjectForms: Record<string, string>,
  tense: Tense,
  aspect: Aspect,
  mood?: Mood,
): string {
  const inf = verbForms['base'] ?? '';
  if (aspect === 'progressive') return `${auxFinite(ESTAR_AUX, ESTAR_PT, subjectForms, tense, mood)} ${verbForms['gerund'] ?? inf}`;
  if (aspect === 'prospective') return `${auxFinite(ESTAR_AUX, ESTAR_PT, subjectForms, tense, mood)} prestes a ${inf}`;
  // Resultative. Portuguese has no present-perfect equivalent of Spanish "ha comido": "tem
  // comido" is iterative ("has been eating, repeatedly"), not the perfect of a bounded event, so
  // the *indicative* present resultative maps onto the pretérito perfeito (the simple past
  // "comeu"). But under a hypothetical a mood is set, and the conditional perfect "teria corrido"
  // / pluperfect subjunctive "tivesse corrido" is a genuine perfect, not iterative — so the A9
  // collapse is bypassed and ter + particípio takes the mood. The past (pluperfect "tinha ido")
  // and future (future perfect "terá visto") indicatives keep ter + particípio as before.
  if (mood === undefined && tense === 'present') return conjugate(verbForms, subjectForms, 'past');
  return `${auxFinite(TER_AUX, TER_PT, subjectForms, tense, mood)} ${verbForms['participle'] ?? inf}`;
}

/**
 * The main verb's whole group as an infinitive — what a modal governs. Neutral is the bare
 * infinitivo ("deve ir"); the marked aspects put their auxiliary in the infinitive ("deve
 * estar indo", "deve ter visto").
 */
function verbGroupInfinitive(verbForms: Record<string, string>, aspect: Aspect): string {
  const inf = verbForms['base'] ?? '';
  if (aspect === 'progressive') return `estar ${verbForms['gerund'] ?? inf}`;
  if (aspect === 'prospective') return `estar prestes a ${inf}`;
  if (aspect === 'resultative') return `ter ${verbForms['participle'] ?? inf}`;
  return inf;
}

// The possessive determiner for a pronominal possessor, with its leading definite article
// ("o seu", "a sua", "os seus"), agreeing with this possessed head in gender/number. Empty for a
// genitive/absent possessor — that one is postnominal ("de") and handled by `possessorText`.
function ptPossessiveWord(np: ResolvedNounPhrase): string {
  const poss = np.possessor;
  if (!poss || !isPronominalPossessor(poss)) return '';
  const forms = np.head.forms;
  const plural = isPlural(forms);
  const agree = { gender: (forms['gender'] ?? 'masc') as 'masc' | 'fem', number: (plural ? 'plural' : 'singular') as 'singular' | 'plural' };
  return `${defArticle(forms, plural)} ${possessivePt(poss, agree)}`;
}

function nounPhrase(forms: Record<string, string>, adj?: PtAdjectives, possessive?: string): string {
  const plural = isPlural(forms);
  const word = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const noun = withAdj(word, adj);
  // A pronominal possessive ("o seu cão") replaces the picked determiner with the definite
  // article + possessive.
  if (possessive) return `${possessive} ${noun}`;
  const art = artFor(forms, plural); // definite / indefinite / bare
  return art ? `${art} ${noun}` : noun;
}

/**
 * A predicate nominal's forms, with an indefinite *plural* flattened to bare: Portuguese says
 * "tornam-se gatos", never "tornam-se uns gatos" — "uns" before a predicate noun is
 * evaluative, not the plural of "um". The singular keeps "um/uma", and an explicitly chosen
 * determiner (definite, quantifier) passes through untouched. French is the odd Romance
 * sibling here — it keeps "des chats" — so this lives per-engine.
 */
function predicativeForms(forms: Record<string, string>): Record<string, string> {
  const plural = (forms['number'] ?? forms['count'] ?? 'singular') === 'plural';
  if (!plural || forms['definiteness'] !== 'indefinite') return forms;
  return { ...forms, definiteness: 'bare' };
}

function subjectPhrase(forms: Record<string, string>, adj?: PtAdjectives, possessive?: string): string {
  if (forms['person']) {
    if (forms['number'] === 'plural' && forms['plural']) return forms['plural'];
    return forms['base'] ?? '';
  }
  return nounPhrase(forms, adj, possessive); // noun — definite article, or a pronominal possessive
}

/**
 * Render every conjunct of a noun slot and coordinate them the Portuguese way: commas between
 * all but the last pair, "e" / "ou" on the last ("o gato, o cão e a raposa"). Neither word has
 * a euphonic variant, so the link is invariable.
 */
function coordinateElement(el: ResolvedNounElement, render: (np: ResolvedNounPhrase) => string): string {
  const word = el.conjunction === 'or' ? 'ou' : 'e';
  return joinConjuncts(el.conjuncts.map(render), ', ', () => ` ${word} `);
}

/** A subject slot: each conjunct with its own article/adjectives/relative, coordinated. */
function subjectText(el: ResolvedNounElement): string {
  return coordinateElement(el, (np) => withRelative(subjectPhrase(np.head.forms, ptAdj(np), ptPossessiveWord(np)), np));
}

/** One conjunct as a plain noun phrase carrying its own determiner ("uma palavra"). */
function npText(np: ResolvedNounPhrase): string {
  return withRelative(nounPhrase(np.head.forms, ptAdj(np), ptPossessiveWord(np)), np);
}

/**
 * route path relation → preposition, honoring the head's determiner. Most are "de"-locutions
 * (debaixo de, ao redor de, …) whose "de" fuses only with the definite ("debaixo do carro"
 * but "debaixo de uma casa"); "through" is "por", which fuses to pelo/pela with the definite
 * ("pela casa") and stays "por" + determiner otherwise ("por uma casa").
 */
function routeHead(c: ResolvedComplement, f: Record<string, string>, plural: boolean): string {
  switch (pathSpecifier(c)) {
    case 'under':       return `debaixo ${contractDet(dePrep, 'de', f, plural)}`;
    case 'over':        return `por cima ${contractDet(dePrep, 'de', f, plural)}`;
    case 'around':      return `ao redor ${contractDet(dePrep, 'de', f, plural)}`;
    case 'behind':      return `atrás ${contractDet(dePrep, 'de', f, plural)}`;
    case 'in_front_of': return `em frente ${contractDet(dePrep, 'de', f, plural)}`;
    case 'through':
    default:            return contractDet(porPrep, 'por', f, plural);
  }
}

function complementsPhrase(
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
  subjectForms: Record<string, string>,
  verbConceptId: string,
): string {
  // "longe" disambiguates source from direction, but only self-propelled motion verbs (RUN/JUMP)
  // need it — see SOURCE_ABLATIVE_ADVERB_VERBS. COME/GO and the transitive LOAD/IMPORT keep bare
  // "de" ("o gato vem da casa", "carrega o livro do contentor").
  const sourceAdverb = SOURCE_ABLATIVE_ADVERB_VERBS.has(verbConceptId) ? 'longe ' : '';
  if (!complements) return '';
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      // The complement's *kind* (pronoun? adjective? animate goal?) comes off its first conjunct;
      // its surface is rendered from every conjunct, each with its own article and agreement.
      const f = firstConjunct(c.phrase).head.forms;
      // Subject complement: a predicate adjective agrees with the *subject* ("parece
      // cansada") and carries its own degree ("parece mais cansada"); a predicate noun keeps
      // its own article, no preposition ("torna-se uma lenda"). Coordinated conjuncts each
      // agree with the subject: "parece cansada e feliz".
      if (type === 'predicative') {
        const gender = subjectForms['gender'] ?? 'masc';
        const plural = subjectForms['number'] === 'plural';
        return coordinateElement(c.phrase, (np) => {
          if (np.head.forms['role'] !== 'adjective') {
            return withRelative(nounPhrase(predicativeForms(np.head.forms), ptAdj(np)), np);
          }
          const surface = ptComparison(np.head, gender, plural);
          // A predicative superlative has no noun's article to borrow, so it adds its own, agreeing
          // with the subject: "parece O mais feliz" — distinct from the comparative "mais feliz".
          return isRelativeSuperlative(np.head) ? `${defArticle({ gender }, plural)} ${surface}` : surface;
        });
      }
      // An instrument presented as an action: the bare gerúndio for the process level
      // ("escolhendo uma palavra"), the substantivized infinitive for the concept level ("com o
      // escolher uma palavra") — a masculine singular noun, hence the invariant "o", whatever the
      // infinitive. The noun phrase is the action's direct object either way.
      if (type === 'instrumental' && c.action) {
        const level = abstractionLevel(c);
        if (level !== 'object') {
          const object = coordinateElement(c.phrase, npText);
          const verb =
            level === 'process'
              ? actionGerund(c.action)
              : `com o ${actionInfinitive(c.action)}`;
          const adverb = c.action.modifier?.forms['base'] ?? '';
          return [verb, object, adverb].filter(Boolean).join(' ');
        }
      }
      // A pronoun cause: neutral "por causa de mim / dele" takes the tonic form after "de"
      // (which contracts with the 3rd-person pronouns, de+ele→dele); positive "graças a mim"
      // takes the tonic after "a"; negative uses the possessive with "culpa" ("por minha culpa").
      if (type === 'cause' && f['person']) {
        const disj = f['disjunctive'] ?? f['base'] ?? '';
        const sent = causeSentiment(c);
        if (sent === 'positive') return `graças a ${disj}`;
        if (sent === 'negative') {
          const plural = f['number'] === 'plural';
          const poss =
            f['person'] === '1' ? (plural ? 'nossa' : 'minha') :
            f['person'] === '2' ? (plural ? 'vossa' : 'tua') :
            'sua';
          return `por ${poss} culpa`;
        }
        return `por causa ${/^e/i.test(disj) ? `d${disj}` : `de ${disj}`}`;
      }
      // The preposition contracts with the article ("em"+"a" → "na"), so it cannot be factored
      // out in front of a coordinated complement — each conjunct carries its own contracted head
      // ("na casa e no bosque"). Repeating it also lets each conjunct pick its own preposition,
      // which `direction` needs: an animate goal takes "para", a place "a".
      return coordinateElement(c.phrase, (np) => {
      const f = np.head.forms;
      const plural = isPlural(f);
      const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
      const noun = withAdj(word, ptAdj(np));
      // locative→em (no/na), direction→a (ao/à), source→"longe de" (longe do/da),
      // route→path preposition. A direction toward an *animate* goal takes "para"
      // (to/toward) — bare "a" + person doesn't read as a motion destination ("corro para
      // a criança", not "*à criança"); "para" doesn't contract. A self-propelled motion verb
      // prefixes source with the ablative adverb "longe" so it reads as motion away ("corro
      // longe da criança"); bare "de" reads as origin/possession, not departure — which is right
      // for COME/GO and the transitive LOAD/IMPORT, whose source is an origin.
      // Cause reads "por causa de" + the "de"-contracted article ("por causa do cão"); the
      // sentiment swaps the connector — negative "por culpa do cão", positive "graças ao cão"
      // ("a"-contracted via datPrep).
      const causeSent = type === 'cause' ? causeSentiment(c) : 'neutral';
      const head =
        type === 'locative'  ? contractDet(emPrep, 'em', f, plural) :
        type === 'terminus'  ? contractDet(datPrep, 'a', f, plural) :
        // Instrumental → "com". It contracts only with the pronouns (comigo…), never with an
        // article, so the plain preposition leads the determiner: "com a faca", "com uma palavra".
        type === 'instrumental' ? prepDet('com', f, plural) :
        type === 'direction' ? (f['animate'] === '1' ? prepDet('para', f, plural) : contractDet(datPrep, 'a', f, plural)) :
        type === 'source'    ? `${sourceAdverb}${contractDet(dePrep, 'de', f, plural)}` :
        type === 'cause'     ? (
          causeSent === 'positive' ? `graças ${datPrep(f, plural)}` :
          causeSent === 'negative' ? `por culpa ${dePrep(f, plural)}` :
          `por causa ${dePrep(f, plural)}`
        ) :
        routeHead(c, f, plural);
      return withRelative(`${head} ${noun}`, np);
      });
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * A postnominal possessor, headed by "de"+article ("o livro do gato"). Recurses through
 * withRelative so the possessor carries its own adjectives / nested possessor / relative
 * clause. Empty when the phrase has no possessor.
 */
function possessorText(np: ResolvedNounPhrase): string {
  const poss = np.possessor;
  // A pronominal possessor ("o seu") is prenominal — rendered by `ptPossessiveWord` in place of
  // the article — so it contributes nothing postnominally here.
  if (!poss || isPronominalPossessor(poss)) return '';
  const f = poss.head.forms;
  const plural = (f['number'] ?? f['count']) === 'plural';
  const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
  return ` ${withRelative(`${dePrep(f, plural)} ${withAdj(word, ptAdj(poss))}`, poss)}`;
}

/** Portuguese linking preposition for an attributive noun, by relation (bare, no article). */
const REL_PREP_PT: Record<ModifierRelation, string> = { feature: 'a', purpose: 'de', material: 'de' };

/**
 * Postnominal attributive nouns as bare "prep noun" strings ("barco a vela", "óculos de
 * sol"). The modifier takes its own number and its adjectives agree with *its*
 * gender/number ("criador de frases semânticas"), postnominal as in Portuguese.
 */
function modifierText(np: ResolvedNounPhrase): string {
  return np.nounModifiers
    .map((m) => {
      const forms = m.concept.forms;
      const plural = (forms['number'] ?? forms['count']) === 'plural';
      const noun = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
      if (!noun) return '';
      const gender = forms['gender'] ?? 'masc';
      const adjs = m.adjectives
        .map((a) => agreeAdj(a.forms['base'] ?? '', gender, plural))
        .filter(Boolean)
        .join(' e ');
      const nounPart = adjs ? `${noun} ${adjs}` : noun;
      return ` ${REL_PREP_PT[m.relation]} ${nounPart}`;
    })
    .join('');
}

/**
 * Append a noun phrase's attributive nouns, possessor, and relative clause (invariant
 * "que" + predicate). A subject-relative agrees with the head ("o menino que chora"); an
 * object-relative carries the clause's own subject, which drives agreement ("o livro que
 * eu leio").
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
/** Place an object clitic before a finite verb (Brazilian proclisis), after a leading "não " in the
 *  negative ("não me vê"). Portuguese object clitics do not elide here. A no-op with no clitic. */
function ptCliticize(clitic: string, verb: string): string {
  if (!clitic) return verb;
  return verb.startsWith('não ') ? `não ${clitic} ${verb.slice(4)}` : `${clitic} ${verb}`;
}

function predicateText(
  subjectForms: Record<string, string>,
  verbPhrase: ResolvedVerbPhrase,
  directObject?: ResolvedNounElement,
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
): string {
  const { verb, negative: verbNegative, modifier, tense = 'present', aspect = 'neutral', mood, register, modals } = verbPhrase;
  // In a hypothetical conditional the finite element takes the conditional (apodosis, "correria")
  // or imperfect-subjunctive (protasis, "comesse") form; marked aspects keep their indicative
  // auxiliary (aspect under a conditional is a documented gap).
  const pn = moodPN(subjectForms);
  const finite = (m: ConceptForms) => moodForm('pt', m, pn, mood) ?? conjugate(m.forms, subjectForms, tense);
  // A modal chain makes the outermost modal the finite verb ("quero poder ir"); "não" is
  // prepended below and lands in front of it, exactly as for a plain verb.
  const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
  const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
  // Portuguese fronts one negative frequency adverb ("nunca") preverbally without "não", whichever
  // verb it modifies. Scan the group outermost-first (each modal, then the main verb); the first
  // negative adverb takes that slot. `frontIdx` indexes this array: 0…n-1 modals, n = main verb.
  const groupAdverbs = [...modals.map((m) => m.modifier), modifier];
  const frontIdx = verbNegative ? -1 : groupAdverbs.findIndex((a) => a?.forms['polarity'] === 'negative');
  const preVerbNunca = frontIdx >= 0;
  const conjugated = modals.length > 0
    ? [
        // Each modal's adverb trails its verb ("não quer nunca poder ir"), except the fronted
        // negative adverb, which takes the preverbal slot instead (emitted as preVerb).
        ...modalChain(modals, finite, (m, i) => (i === frontIdx ? {} : { post: m.modifier?.forms['base'] })),
        verbGroupInfinitive(verb.forms, aspect),
      ].join(' ')
    : aspect === 'neutral'
      ? finite(verb)
      : aspectVerb(verb.forms, subjectForms, tense, aspect, mood);
  // A "nenhum" (no) direct object is post-verbal, so it triggers negative concord —
  // "não vê nenhum menino" — whereas a pre-verbal "nenhum" subject does not.
  // Any "nenhum" conjunct triggers the concord — "não vê nenhum menino e nenhuma menina".
  const objectIsNegative = directObject?.conjuncts.some((np) => np.head.forms['definiteness'] === 'no') ?? false;
  // The preverbal "não" is emitted only when the clause needs a preverbal negator AND none is already
  // there. A preverbal negative subject ("nenhum gato …") or a preverbal "nunca" (the finite adverb)
  // already negates the clause, so "não" is dropped.
  const subjectIsNegative = subjectForms['definiteness'] === 'no';
  const needsNao = verbNegative || objectIsNegative || hasNegativeComplement(complements) || groupHasNegativeAdverb(verbPhrase);
  const verbText = needsNao && !subjectIsNegative && !preVerbNunca ? `não ${conjugated}` : conjugated;
  // A pronoun direct object is a proclitic before the finite verb — the Brazilian order "o gato me
  // vê", after "não" in the negative ("não me vê") — not a post-verbal noun ("vê o eu"). A noun
  // object (or a coordination) keeps the post-verbal slot.
  const objectClitic = directObject && isPronounElement(directObject)
    ? objectPronounForm(firstConjunct(directObject).head.forms) : '';
  const directObjectText = directObject && !objectClitic ? coordinateElement(directObject, npText) : '';
  // The fronted "nunca" is emitted preverbally; the main verb's own adverb trails the verb unless
  // it *is* the fronted one (frontIdx points past the last modal, at the main verb).
  const preVerb = preVerbNunca ? (groupAdverbs[frontIdx]?.forms['base'] ?? '') : '';
  const mainIsFronted = frontIdx === modals.length;
  const postVerb = mainIsFronted ? '' : modifierText;
  const complementsText = complementsPhrase(complements, subjectForms, verb.conceptId);
  // Imperative: a subjectless command. The person picks the form (tu = 3sg-present, nós / every
  // negative = present subjunctive, vós = 2pl-present − s); a negative command ("não comas")
  // prefixes "não". The adverb simply trails the verb here.
  if (mood === 'imperative') {
    const impNeg = verbNegative === true || objectIsNegative || modifierIsNegative;
    // An instruction addressed to nobody — a button, a menu entry, a recipe step — is the
    // infinitive in Portuguese ("Carregar um período", "Não correr"), not the imperative.
    const impForm = register === 'instruction'
      ? (verb.forms['base'] ?? conjugated)
      : (imperativeForm('pt', verb, moodPN(subjectForms), impNeg) ?? conjugated);
    const impVerb = impNeg ? `não ${impForm}` : impForm;
    return [ptCliticize(objectClitic, impVerb), modifierText, directObjectText, complementsText]
      .filter(Boolean)
      .join(' ');
  }
  return [preVerb, ptCliticize(objectClitic, verbText), postVerb, directObjectText, complementsText]
    .filter(Boolean)
    .join(' ');
}

/** One clause (subject + predicate), ignoring any attached hypothetical condition. */
function renderClause(phrase: ResolvedPhrase): string {
  const { subject } = phrase;
  // Portuguese is null-subject (pro-drop): a bare pronoun subject is dropped by default, the verb
  // ending alone carrying the person ("como", not "eu como"). An imperative likewise drops its
  // subject; both keep driving the verb form off subject.agreement (see predicateText). A noun
  // subject and a coordination fall through to subjectText and keep their surface.
  const dropSubject = !!phrase.verbPhrase &&
    (phrase.verbPhrase.mood === 'imperative' || isPronounElement(subject));
  const subj = dropSubject ? '' : subjectText(subject);
  // Verbless period: a bare noun phrase ("últimas notícias").
  if (!phrase.verbPhrase) return subj.trim();
  const predicate = predicateText(
    subject.agreement, phrase.verbPhrase, phrase.directObject, phrase.complements,
  );
  return [subj, predicate].filter(Boolean).join(' ').trim();
}

const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'e',
  or: 'ou',
  but: 'mas',
  that_is: 'isto é',
  // As in Spanish, "então" spans both senses; "portanto" / "e depois" separate them.
  therefore: 'portanto',
  then: 'e depois',
};

export const portugueseEngine: LanguageEngine = {
  language: 'pt',
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
  // The determiner alone, for the menu that picks one.
  renderDeterminer(noun: ConceptForms): string {
    const f = noun.forms;
    return artFor(f, (f['number'] ?? f['count']) === 'plural');
  },
};
