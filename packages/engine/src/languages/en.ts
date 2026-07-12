import { COMPLEMENT_RENDER_ORDER, type Aspect, type ComplementType, type CoordConjunction, type Degree, type PathSpecifier, type Tense } from '@signi/shared';
import { adjDegree, causeSentiment, modalChain, pathSpecifier, type ConceptForms, type ResolvedComplement, type ResolvedNounPhrase, type ResolvedVerbPhrase, type LanguageEngine, type ResolvedPhrase } from '../types.js';

// Periphrastic degree words placed before the adjective ("more beautiful", "the most
// beautiful"). English marks the superlative with "the", which the noun's own determiner
// already supplies, so only the degree adverb is added here. Short adjectives take the
// inflected comparative instead ("bigger"), so 'more'/'most' are resolved in enAdj.
const EN_DEGREE: Record<Degree, string> = {
  positive: '', more: 'more', most: 'most', less: 'less', least: 'least', equally: 'equally',
};

/** Suppletive comparatives — no spelling rule derives these. */
const EN_IRREGULAR: Record<string, [comparative: string, superlative: string]> = {
  good: ['better', 'best'],
  bad: ['worse', 'worst'],
  far: ['farther', 'farthest'],
  little: ['less', 'least'],
  much: ['more', 'most'],
  many: ['more', 'most'],
};

/** Vowel groups, minus a silent final "e" — enough to tell short adjectives from long ones. */
function syllables(word: string): number {
  const groups = word.replace(/e$/, '').match(/[aeiouy]+/g);
  return groups ? groups.length : 1;
}

/**
 * Whether an adjective inflects (-er/-est) rather than taking "more"/"most". One-syllable
 * adjectives do ("big" → "bigger"), as do two-syllable ones ending in -y, -le, -ow or -er
 * ("happy" → "happier", "simple" → "simpler"). Participial adjectives are periphrastic
 * whatever their length — "more tired", never "tireder".
 */
function inflects(base: string): boolean {
  if (/ed$/.test(base)) return false;
  const n = syllables(base);
  if (n === 1) return true;
  return n === 2 && /(y|le|ow|er)$/.test(base);
}

/** Attach -er/-est with English's spelling rules (doubling, y → i, silent e). */
function inflect(base: string, suffix: 'er' | 'est'): string {
  if (/e$/.test(base)) return base + suffix.slice(1);            // large → larger
  if (/[^aeiou]y$/.test(base)) return `${base.slice(0, -1)}i${suffix}`; // happy → happier
  // A stressed consonant-vowel-consonant ending doubles its final consonant: big → bigger.
  if (/[^aeiou][aeiou][^aeiouwxy]$/.test(base)) return base + base.slice(-1) + suffix;
  return base + suffix;
}

/**
 * One adjective's surface at its degree: inflected where English inflects ("bigger",
 * "the best"), periphrastic otherwise ("more beautiful"). "less"/"least"/"equally" are
 * always periphrastic — English has no inflected downward comparison.
 */
function enAdj(a: ConceptForms): string {
  const base = a.forms['base'] ?? '';
  const degree = adjDegree(a);
  if (!base) return '';
  if (degree === 'more' || degree === 'most') {
    const irregular = EN_IRREGULAR[base];
    if (irregular) return degree === 'more' ? irregular[0] : irregular[1];
    if (inflects(base)) return inflect(base, degree === 'more' ? 'er' : 'est');
  }
  const d = EN_DEGREE[degree];
  return d ? `${d} ${base}` : base;
}

/** Join a resolved noun phrase's adjectives, each carrying its comparative degree. */
function npAdj(np: ResolvedNounPhrase): string {
  return np.adjectives.map(enAdj).filter(Boolean).join(' ');
}

const PREP: Record<ComplementType, string> = {
  locative: 'in',
  direction: 'to',
  source: 'from',
  route: 'through',
  cause: 'because of',
  terminus: 'to', // dative recipient — "cut the hair to the cat"
  predicative: '', // subject complement — no adposition ("becomes a legend", "seems happy")
};

const PATH_PREP: Record<PathSpecifier, string> = {
  through: 'through',
  under: 'under',
  over: 'over',
  around: 'around',
  behind: 'behind',
  in_front_of: 'in front of',
};

/**
 * The determiner for a noun phrase, from its `definiteness` (default 'definite'):
 * "the", "a/an", nothing (bare), or a quantifier (some/no/many/few/all). "a" vs "an" is
 * chosen on the sound of `lead` — the first word that will actually follow the article
 * (an adjective if present, else the noun) — and an indefinite plural is bare ("a wolf"
 * → plural "wolves"). Returns the determiner with a trailing space, or "" for bare.
 */
function determiner(forms: Record<string, string>, lead: string): string {
  // A proper noun ("Africa") takes no article in English, whatever determiner was picked.
  if (forms['proper'] === '1') return '';
  const definiteness = forms['definiteness'] ?? 'definite';
  const mass = forms['uncountable'] === '1';
  switch (definiteness) {
    case 'bare':  return '';
    case 'some':  return 'some ';
    case 'no':    return 'no ';
    case 'many':  return mass ? 'much ' : 'many ';   // mass: much water
    case 'few':   return mass ? 'little ' : 'few ';  // mass: little water
    case 'all':   return 'all ';
    case 'indefinite': {
      if (mass) return '';                            // no "a water" — bare
      const count = forms['number'] ?? forms['count'] ?? 'singular';
      if (count === 'plural') return '';
      return /^[aeiou]/i.test(lead) ? 'an ' : 'a ';
    }
    default:      return 'the ';
  }
}

function conjugate(forms: Record<string, string>, subjectForms: Record<string, string>, tense: Tense = 'present'): string {
  const person = subjectForms['person'] ?? '3';
  const number = subjectForms['number'] ?? 'singular';
  const n = number === 'plural' ? 'pl' : 'sg';
  // English past ("ate") is invariant across persons, so a single `past` form
  // covers all; present keeps its per-person keys.
  return forms[`${person}${n}_${tense}`] ?? forms[tense] ?? forms[`${person}${n}_present`] ?? forms['base'] ?? '';
}

/**
 * The auxiliary "be", conjugated for tense + subject, as its word(s): "am"/"is"/"are",
 * "was"/"were", "will be". Drives the progressive and prospective, and the resultative of
 * the few verbs that select it ("is gone").
 */
function auxBe(subjectForms: Record<string, string>, tense: Tense): string[] {
  const person = subjectForms['person'] ?? '3';
  const singular = (subjectForms['number'] ?? 'singular') !== 'plural';
  if (tense === 'future') return ['will', 'be'];
  if (tense === 'past') return [singular && (person === '1' || person === '3') ? 'was' : 'were'];
  if (!singular) return ['are'];
  return person === '1' ? ['am'] : person === '3' ? ['is'] : ['are']; // "you are"
}

/** The auxiliary "have": "have"/"has", "had", "will have". */
function auxHave(subjectForms: Record<string, string>, tense: Tense): string[] {
  const person = subjectForms['person'] ?? '3';
  const singular = (subjectForms['number'] ?? 'singular') !== 'plural';
  if (tense === 'future') return ['will', 'have'];
  if (tense === 'past') return ['had'];
  return [singular && person === '3' ? 'has' : 'have'];
}

/**
 * The finite verb group for a non-neutral aspect: an auxiliary (tense/subject-inflected) plus
 * the main verb's non-finite form — "be" + gerund for progressive ("is going"), "be" + "about
 * to" + base for prospective ("is about to go"), and for the resultative "have" + past
 * participle ("has seen"), or "be" + past participle on the verbs the seed marks with
 * forms.aux = "be" ("is gone"). Negation attaches to the auxiliary ("is not going", "has not
 * seen", "will not be going").
 */
function aspectVerb(
  verbForms: Record<string, string>,
  subjectForms: Record<string, string>,
  tense: Tense,
  aspect: Aspect,
  negative: boolean,
): string {
  const base = verbForms['base'] ?? '';
  const perfectBe = verbForms['aux'] === 'be';
  const aux = aspect === 'resultative' && !perfectBe
    ? auxHave(subjectForms, tense)
    : auxBe(subjectForms, tense);
  const nonfinite =
    aspect === 'progressive' ? (verbForms['gerund'] ?? base) :
    aspect === 'resultative' ? (verbForms['participle'] ?? base) :
    `about to ${base}`; // prospective
  const auxStr = negative ? [aux[0], 'not', ...aux.slice(1)].join(' ') : aux.join(' ');
  return `${auxStr} ${nonfinite}`.trim();
}

/**
 * The main verb's whole group as an infinitive — what a modal governs. For the neutral
 * aspect that is the bare base ("must **go**"); the marked aspects put their auxiliary in
 * the infinitive and keep their own non-finite form ("must **be going**", "must **have
 * seen**", "must **be gone**" for the verbs whose perfect selects BE).
 */
function verbGroupInfinitive(verbForms: Record<string, string>, aspect: Aspect): string {
  const base = verbForms['base'] ?? '';
  switch (aspect) {
    case 'progressive': return `be ${verbForms['gerund'] ?? base}`;
    case 'prospective': return `be about to ${base}`;
    case 'resultative': return `${verbForms['aux'] === 'be' ? 'be' : 'have'} ${verbForms['participle'] ?? base}`;
    default:            return base;
  }
}

/**
 * The true English modal auxiliaries. They are defective — no infinitive, no participle,
 * no do-support — and take "not" straight after themselves ("must not go", "could not go").
 * The lexicon fills their gaps with suppletive periphrases ("had to", "will be able to"),
 * which are ordinary verbs and therefore negate with do-support ("did not have to go"). A
 * finite modal form is one or the other depending on its *first* word, which this decides.
 */
const MODAL_AUX = new Set(['must', 'can', 'could', 'will', 'would', 'shall', 'may', 'might']);

/**
 * The outermost modal's finite form, negated where asked. "not" follows a true modal
 * auxiliary — with the orthographic contraction "can not" → "cannot" — and everything else
 * (the suppletive "had to", the lexical "want") takes do-support over its bare form.
 */
function modalFinite(
  m: ConceptForms,
  subjectForms: Record<string, string>,
  tense: Tense,
  negative: boolean,
): string {
  const finite = conjugate(m.forms, subjectForms, tense);
  if (!negative) return finite;
  const [first, ...rest] = finite.split(' ');
  if (MODAL_AUX.has(first)) {
    if (first === 'can' && rest.length === 0) return 'cannot';
    return [first, 'not', ...rest].join(' ');
  }
  const person = subjectForms['person'] ?? '3';
  const singular = (subjectForms['number'] ?? 'singular') !== 'plural';
  const doAux =
    tense === 'past' ? 'did not' :
    person === '3' && singular ? 'does not' : 'do not';
  return `${doAux} ${m.forms['nonfinite'] ?? m.forms['base'] ?? ''}`;
}

/**
 * The Saxon genitive marker for a possessor: "'s", but a bare "'" after a plural that
 * already ends in -s ("the cats' book").
 */
function genitiveMarker(np: ResolvedNounPhrase): string {
  const forms = np.head.forms;
  const plural = (forms['number'] ?? forms['count']) === 'plural';
  const word = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  return plural && word.endsWith('s') ? "'" : "'s";
}

/**
 * A possessor rendered as a Saxon-genitive prefix ("the cat's "). The possessor is a
 * definite noun phrase (recursing for its own possessor / relative clause) followed by
 * the genitive marker; the possessed head drops its own article.
 */
function possessivePrefix(poss: ResolvedNounPhrase): string {
  const inner = withRelative(nounPhrase(poss.head.forms, npAdj(poss), nounMods(poss), poss.possessor), poss);
  return `${inner}${genitiveMarker(poss)} `;
}

/**
 * Attributive nouns as a bare prenominal string ("sail" in "sail boat"). English
 * neutralises the relation entirely — the noun is just juxtaposed before the head — and
 * keeps the attributive noun singular ("phrase creator"), ignoring the modifier's number.
 * The modifier's own adjectives are bare and prenominal ("semantic phrase creator").
 */
function nounMods(np: ResolvedNounPhrase): string {
  return np.nounModifiers
    .map((m) => {
      const noun = m.concept.forms['base'];
      if (!noun) return '';
      const adjs = m.adjectives.map((a) => a.forms['base'] ?? '').filter(Boolean).join(' ');
      return adjs ? `${adjs} ${noun}` : noun;
    })
    .filter(Boolean)
    .join(' ');
}

function nounPhrase(forms: Record<string, string>, adj?: string, mods?: string, possessor?: ResolvedNounPhrase): string {
  const count = forms['number'] ?? forms['count'] ?? 'singular';
  const word = count === 'plural' ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const a = adj ? `${adj} ` : '';
  // Noun-modifiers sit between the adjectives and the head: "the big sail boat".
  const m = mods ? `${mods} ` : '';
  // A possessor replaces the article: "the cat's book", not "the cat's the book".
  if (possessor) return `${possessivePrefix(possessor)}${a}${m}${word}`;
  // "a/an" agrees with the first word after the article (adjective, else modifier, else noun).
  const lead = adj || mods || word;
  return `${determiner(forms, lead)}${a}${m}${word}`;
}

function subjectPhrase(np: ResolvedNounPhrase): string {
  const forms = np.head.forms;
  if (forms['person']) {
    if (forms['number'] === 'plural' && forms['plural']) return forms['plural'];
    return forms['base'] ?? '';
  }
  return nounPhrase(forms, npAdj(np), nounMods(np), np.possessor); // noun — determiner from forms
}

function complementsPhrase(complements?: Partial<Record<ComplementType, ResolvedComplement>>): string {
  if (!complements) return '';
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      const f = c.phrase.head.forms;
      // A pronoun complement ("because of him/her/them") takes the oblique form with no
      // article — only the causal adjunct accepts a pronoun in the UI today. Positive credits
      // with "thanks to"; English has no distinct neutral/negative connector, so both read
      // "because of" (the blame sense rides on "because of" itself).
      if (type === 'cause' && f['person']) {
        const prep = causeSentiment(c) === 'positive' ? 'thanks to' : 'because of';
        return `${prep} ${f['disjunctive'] ?? f['base'] ?? ''}`;
      }
      // Subject complement: a predicate adjective takes no article and doesn't agree, but
      // carries its own degree ("seems happier"); a predicate noun keeps its own article,
      // with no preposition ("becomes a legend").
      if (type === 'predicative') {
        if (f['role'] === 'adjective') return enAdj(c.phrase.head);
        return withRelative(nounPhrase(f, npAdj(c.phrase), nounMods(c.phrase), c.phrase.possessor), c.phrase);
      }
      const prep = type === 'route' ? PATH_PREP[pathSpecifier(c)]
        : type === 'cause' ? (causeSentiment(c) === 'positive' ? 'thanks to' : 'because of')
        : PREP[type];
      return `${prep} ${withRelative(nounPhrase(c.phrase.head.forms, npAdj(c.phrase), nounMods(c.phrase), c.phrase.possessor), c.phrase)}`;
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * The predicate half of a phrase — everything after the subject — as ordered parts.
 * Shared by the top-level sentence and by relative clauses, which pass the head noun's
 * forms as `subjectForms` so the verb agrees with the head.
 */
function predicateParts(
  subjectForms: Record<string, string>,
  verbPhrase: ResolvedVerbPhrase,
  directObject?: ResolvedNounPhrase,
  indirectObject?: ResolvedNounPhrase,
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
): string[] {
  const { verb, negative: verbNegative, modifier, aspect = 'neutral', mood, register, modals } = verbPhrase;
  // The hypothetical "if" clause (subjunctive) is realised by the past tense ("if the cat ate");
  // the main clause (conditional) is "would" + the verb group, handled in its own branch below.
  const tense: Tense = mood === 'subjunctive' ? 'past' : (verbPhrase.tense ?? 'present');

  const directObjectText = directObject
    ? withRelative(nounPhrase(directObject.head.forms, npAdj(directObject), nounMods(directObject), directObject.possessor), directObject)
    : '';
  // Prepositional dative: "to the cat"
  const indirectObjectText = indirectObject
    ? `to ${withRelative(nounPhrase(indirectObject.head.forms, npAdj(indirectObject), nounMods(indirectObject), indirectObject.possessor), indirectObject)}`
    : '';
  const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
  const isFrequency = modifier?.forms['subtype'] === 'frequency';
  const complementsText = complementsPhrase(complements);
  const modifierIsNegative = modifier?.forms['polarity'] === 'negative';

  const negateVerb = verbNegative === true && !modifierIsNegative;

  // Imperative: a subjectless command on the bare base ("eat the food!", "run!"). The subject
  // pronoun's person selects the form — 1st-plural is the "let's …" cohortative ("let's eat"),
  // 2nd person (singular or plural share a form in English) is the plain base. Negation is
  // "do not …" for 2nd person and "let's not …" for the cohortative; a frequency adverb keeps
  // its pre-verb slot ("always eat"), manner adverbs trail ("eat slowly").
  if (mood === 'imperative') {
    const base = verb.forms['base'] ?? conjugate(verb.forms, subjectForms);
    // An instruction ("Load a period" on a button) is addressed to nobody, so it takes the bare
    // base whatever person the plan carries — the cohortative would put an addressee back in.
    const cohortative = register !== 'instruction' && (subjectForms['person'] ?? '2') === '1'; // 1pl "let's"
    const verbText = cohortative
      ? (negateVerb ? `let's not ${base}` : `let's ${base}`)
      : (negateVerb ? `do not ${base}` : base);
    const preVerb = isFrequency ? modifierText : '';
    const postVerb = isFrequency ? '' : modifierText;
    return [preVerb, verbText, directObjectText, indirectObjectText, complementsText, postVerb];
  }

  // Conditional apodosis: "would" + the verb group ("would run", "would not run", "would be
  // running", "would have seen", "would want to go"). "would" is a defective modal auxiliary,
  // so it takes "not" directly and carries no tense/agreement itself.
  if (mood === 'conditional') {
    const groups = modals.length > 0
      ? [...modalChain(modals, (m) => m.forms['nonfinite'] ?? m.forms['base'] ?? ''), verbGroupInfinitive(verb.forms, aspect)]
      : [verbGroupInfinitive(verb.forms, aspect)];
    const verbText = [negateVerb ? 'would not' : 'would', ...groups].join(' ');
    const preVerb = isFrequency ? modifierText : '';
    const postVerb = isFrequency ? '' : modifierText;
    return [preVerb, verbText, directObjectText, indirectObjectText, complementsText, postVerb];
  }

  // A modal chain makes the outermost modal the finite verb — it takes the tense, the
  // agreement, and the negation — and every other element non-finite, down to the main
  // verb's whole group in the infinitive ("must not have seen the cat").
  if (modals.length > 0) {
    const verbText = [
      ...modalChain(modals, (m) => modalFinite(m, subjectForms, tense, negateVerb)),
      verbGroupInfinitive(verb.forms, aspect),
    ].join(' ');
    const preVerb = isFrequency ? modifierText : '';
    const postVerb = isFrequency ? '' : modifierText;
    return [preVerb, verbText, directObjectText, indirectObjectText, complementsText, postVerb];
  }

  // A non-neutral aspect (progressive/prospective/resultative) is periphrastic on "be",
  // which carries the tense and any negation ("is not going"), so it bypasses do-support.
  if (aspect !== 'neutral') {
    const verbText = aspectVerb(verb.forms, subjectForms, tense, aspect, negateVerb);
    // A frequency adverb follows the finite auxiliary of the group, not the whole group:
    // "you have never been", "is never going" — never "you never have been".
    if (isFrequency && modifierText) {
      const [aux, ...rest] = verbText.split(' ');
      const withAdv = [aux, modifierText, ...rest].join(' ');
      return ['', withAdv, directObjectText, indirectObjectText, complementsText, ''];
    }
    return ['', verbText, directObjectText, indirectObjectText, complementsText, modifierText];
  }

  if (verbNegative && !modifierIsNegative) {
    // The copula negates on itself — "is not careful", "was not careful", "will not be
    // careful" — never with do-support.
    if (verb.forms['copula'] === '1') {
      const negVerb = tense === 'future'
        ? `will not ${verb.forms['base'] ?? 'be'}`
        : `${conjugate(verb.forms, subjectForms, tense)} not`;
      const trailingMod = isFrequency ? '' : modifierText;
      return [negVerb, directObjectText, indirectObjectText, complementsText, trailingMod];
    }
    const person = subjectForms['person'] ?? '3';
    const number = subjectForms['number'] ?? 'singular';
    // Negation auxiliary is tense-driven: "do/does not" (present),
    // "did not" (past), "will not" (future) — all followed by the bare base.
    const aux =
      tense === 'past'   ? 'did not' :
      tense === 'future' ? 'will not' :
      (person === '3' && number === 'singular') ? 'does not' : 'do not';
    const base = verb.forms['base'] ?? conjugate(verb.forms, subjectForms);
    // Frequency adverbs slot between aux and base: "do not always drink"
    const negVerb = isFrequency && modifierText ? `${aux} ${modifierText} ${base}` : `${aux} ${base}`;
    const trailingMod = isFrequency ? '' : modifierText;
    return [negVerb, directObjectText, indirectObjectText, complementsText, trailingMod];
  }
  // Future is periphrastic ("will eat"); present/past come from the forms map.
  const verbText = tense === 'future'
    ? `will ${verb.forms['base'] ?? ''}`
    : conjugate(verb.forms, subjectForms, tense);
  // Frequency adverbs (always, never) precede the main verb: S Adv V Obj
  // Manner adverbs (fast, slowly) follow the verb/object: S V Obj Adv
  const preVerb  = isFrequency ? modifierText : '';
  const postVerb = isFrequency ? '' : modifierText;
  return [preVerb, verbText, directObjectText, indirectObjectText, complementsText, postVerb];
}

/**
 * A restrictive relative clause on `np`: relativizer + the clause's predicate. "who"
 * for an animate head, "that" otherwise (English uses the same relativizer whether the
 * head is the clause's subject or object). For a subject-relative the head fills the
 * subject slot and drives agreement ("the boy who cried"). For a non-subject relative
 * the gap slot is already absent from the clause and it carries its own subject, which
 * is rendered after the relativizer and drives agreement ("the book that I read").
 */
function relativeText(np: ResolvedNounPhrase): string {
  const rel = np.relative;
  if (!rel) return '';
  const pronoun = np.head.forms['animate'] === '1' ? 'who' : 'that';
  const subjectRelative = rel.headRole === 'subject' || !rel.subject;
  const agreeForms = subjectRelative ? np.head.forms : rel.subject!.head.forms;
  const subjText = subjectRelative ? '' : withRelative(subjectPhrase(rel.subject!), rel.subject!);
  return [pronoun, subjText, ...predicateParts(agreeForms, rel.verbPhrase, rel.directObject, rel.indirectObject, rel.complements)]
    .filter(Boolean)
    .join(' ');
}

/** Append a noun phrase's relative clause (if any) to its already-rendered surface. */
function withRelative(text: string, np: ResolvedNounPhrase): string {
  const rel = relativeText(np);
  return rel ? `${text} ${rel}` : text;
}

/** One clause (subject + predicate), ignoring any attached hypothetical condition. */
function renderClause(phrase: ResolvedPhrase): string {
  const { subject } = phrase;
  // An imperative drops its subject from the surface, but the subject's person/number still
  // drives the choice of imperative form (2nd person vs "let's …"), so it is kept for agreement.
  const imperative = phrase.verbPhrase?.mood === 'imperative';
  const subjectText = imperative ? '' : withRelative(subjectPhrase(subject), subject);
  // Verbless period: a bare noun phrase ("breaking news").
  if (!phrase.verbPhrase) return subjectText.trim();
  return [
    subjectText,
    ...predicateParts(subject.head.forms, phrase.verbPhrase, phrase.directObject, phrase.indirectObject, phrase.complements),
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
}

// The coordinating conjunctions, as English surface words.
const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'and',
  or: 'or',
  but: 'but',
  that_is: 'that is',
  then: 'so',
};

export const englishEngine: LanguageEngine = {
  language: 'en',
  render(phrase: ResolvedPhrase): string {
    const main = renderClause(phrase);
    // Hypothetical conditional: "if <protasis (past)>, <apodosis (would …)>".
    const sentence = phrase.condition ? `if ${renderClause(phrase.condition)}, ${main}` : main;
    // Coordination: "<first clause>, <conjunction> <second clause>".
    if (!phrase.coordination) return sentence;
    return `${sentence}, ${COORD_WORDS[phrase.coordination.conjunction]} ${renderClause(phrase.coordination.clause)}`;
  },
};
