import { COMPLEMENT_RENDER_ORDER, type ComplementType, type Degree, type ModifierRelation, type Tense } from '@signi/shared';
import { adjDegree, causeSentiment, pathSpecifier, type ConceptForms, type ResolvedComplement, type ResolvedNounPhrase, type ResolvedVerbPhrase, type LanguageEngine, type ResolvedPhrase } from '../types.js';

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
 * The determiner for a subject/direct-object noun phrase, from its `definiteness`
 * (default 'definite'): the definite/indefinite article, nothing (bare), or a quantifier
 * agreeing in gender. "todos/todas" carry the definite article; "nenhum/nenhuma" is
 * singular and drives verb negation ("não") upstream when it is an object.
 */
function artFor(forms: Record<string, string>, plural = false): string {
  const definiteness = forms['definiteness'] ?? 'definite';
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  // Mass nouns ("água") stay singular: "um pouco de água", "muita/pouca água", "toda a água".
  if (forms['uncountable'] === '1') {
    switch (definiteness) {
      case 'bare':       return '';
      case 'indefinite': return '';                 // no "uma água" — bare
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

/** Join a noun phrase's adjectives, each agreed with the head's gender/number. */
function ptAdj(np: ResolvedNounPhrase): string {
  const gender = np.head.forms['gender'] ?? 'masc';
  const plural = (np.head.forms['number'] ?? np.head.forms['count']) === 'plural';
  return np.adjectives
    .map((a) => ptDeg(a, agreeAdj(a.forms['base'] ?? '', gender, plural)))
    .filter(Boolean)
    .join(' e ');
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

/** route path relation → preposition (most are "de"-locutions: debaixo do, …). */
function routeHead(c: ResolvedComplement, plural: boolean): string {
  const f = c.phrase.head.forms;
  switch (pathSpecifier(c)) {
    case 'under':       return `debaixo ${dePrep(f, plural)}`;
    case 'over':        return `por cima ${dePrep(f, plural)}`;
    case 'around':      return `ao redor ${dePrep(f, plural)}`;
    case 'behind':      return `atrás ${dePrep(f, plural)}`;
    case 'in_front_of': return `em frente ${dePrep(f, plural)}`;
    case 'through':
    default:            return porPrep(f, plural);
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
      // Subject complement: a predicate adjective agrees with the *subject* ("torna-se uma
      // lenda" but "parece cansada"); a predicate noun keeps its own article, no
      // preposition ("torna-se uma lenda").
      if (type === 'predicative') {
        if (f['role'] === 'adjective') {
          return agreeAdj(f['base'] ?? '', subjectForms['gender'] ?? 'masc', subjectForms['number'] === 'plural');
        }
        return withRelative(nounPhrase(f, ptAdj(c.phrase)), c.phrase);
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
      const plural = (f['number'] ?? f['count']) === 'plural';
      const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
      const a = ptAdj(c.phrase);
      const adj = a ? ` ${a}` : '';
      // locative→em (no/na), direction→a (ao/à), source→"longe de" (longe do/da),
      // route→path preposition. A direction toward an *animate* goal takes "para"
      // (to/toward) — bare "a" + person doesn't read as a motion destination ("corro para
      // a criança", not "*à criança"); "para" doesn't contract. Source is prefixed with
      // the ablative adverb "longe" so it reads as motion away ("corro longe da criança");
      // bare "de" reads as origin/possession, not departure.
      // Cause reads "por causa de" + the "de"-contracted article ("por causa do cão"); the
      // sentiment swaps the connector — negative "por culpa do cão", positive "graças ao cão"
      // ("a"-contracted via datPrep).
      const causeSent = type === 'cause' ? causeSentiment(c) : 'neutral';
      const head =
        type === 'locative'  ? emPrep(f, plural) :
        type === 'direction' ? (f['animate'] === '1' ? `para ${defArticle(f, plural)}` : datPrep(f, plural)) :
        type === 'source'    ? `longe ${dePrep(f, plural)}` :
        type === 'cause'     ? (
          causeSent === 'positive' ? `graças ${datPrep(f, plural)}` :
          causeSent === 'negative' ? `por culpa ${dePrep(f, plural)}` :
          `por causa ${dePrep(f, plural)}`
        ) :
        routeHead(c, plural);
      return withRelative(`${head} ${word}${adj}`, c.phrase);
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
  if (!poss) return '';
  const f = poss.head.forms;
  const plural = (f['number'] ?? f['count']) === 'plural';
  const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
  const a = ptAdj(poss);
  const adj = a ? ` ${a}` : '';
  return ` ${withRelative(`${dePrep(f, plural)} ${word}${adj}`, poss)}`;
}

/** Portuguese linking preposition for an attributive noun, by relation (bare, no article). */
const REL_PREP_PT: Record<ModifierRelation, string> = { feature: 'a', purpose: 'de', material: 'de' };

/** Postnominal attributive nouns as bare "prep noun" strings ("barco a vela", "óculos de sol"). */
function modifierText(np: ResolvedNounPhrase): string {
  return np.nounModifiers
    .map((m) => {
      const base = m.concept.forms['base'];
      return base ? ` ${REL_PREP_PT[m.relation]} ${base}` : '';
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
  const agreeForms = subjectRelative ? np.head.forms : rel.subject!.head.forms;
  const subjText = subjectRelative
    ? ''
    : withRelative(subjectPhrase(rel.subject!.head.forms, ptAdj(rel.subject!)), rel.subject!);
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
  // A "nenhum" (no) direct object is post-verbal, so it triggers negative concord —
  // "não vê nenhum menino" — whereas a pre-verbal "nenhum" subject does not.
  const objectIsNegative = directObject?.head.forms['definiteness'] === 'no';
  const verbText = verbNegative || objectIsNegative ? `não ${conjugated}` : conjugated;
  const directObjectText = directObject
    ? withRelative(nounPhrase(directObject.head.forms, ptAdj(directObject)), directObject)
    : '';
  // V Adv DirectObj IndirectObj(a+article)
  const indirectObjectText = indirectObject
    ? withRelative(indirectNounPhrase(indirectObject.head.forms, ptAdj(indirectObject)), indirectObject)
    : '';
  const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
  // "nunca" goes pre-verbal without "não": "eu nunca bebo"
  // but post-verbal with "não": "eu não bebo nunca"
  const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
  const preVerb = (modifierIsNegative && !verbNegative) ? modifierText : '';
  const postVerb = (modifierIsNegative && !verbNegative) ? '' : modifierText;
  const complementsText = complementsPhrase(complements, subjectForms);
  return [preVerb, verbText, postVerb, directObjectText, indirectObjectText, complementsText]
    .filter(Boolean)
    .join(' ');
}

export const portugueseEngine: LanguageEngine = {
  language: 'pt',
  render(phrase: ResolvedPhrase): string {
    const { subject } = phrase;
    const subjectText = withRelative(subjectPhrase(subject.head.forms, ptAdj(subject)), subject);
    // Verbless period: a bare noun phrase ("últimas notícias").
    if (!phrase.verbPhrase) return subjectText.trim();
    const predicate = predicateText(
      subject.head.forms, phrase.verbPhrase, phrase.directObject, phrase.indirectObject, phrase.complements,
    );
    return [subjectText, predicate].filter(Boolean).join(' ').trim();
  },
};
