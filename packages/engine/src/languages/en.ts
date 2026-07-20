import { COMPLEMENT_RENDER_ORDER, DEFAULT_LOCATIVE_SPECIFIER, type Aspect, type CauseSentiment, type ComplementType, type CoordConjunction, type Degree, type DimensionRelation, type MannerRelation, type PathSpecifier, type Tense } from '@signi/shared';
import { abstractionLevel, actionGerund, adjDegree, causeSentiment, dimensionRelation, firstConjunct, groupHasNegativeAdverb, isFrequencyAdverb, isPronominalPossessor, isPronounElement, joinConjuncts, mannerRelation, modalChain, objectPronounForm, pathSpecifier, withDefiniteness, type ConceptForms, type PronominalPossessor, type ResolvedComplement, type ResolvedModal, type ResolvedNounElement, type ResolvedNounPhrase, type ResolvedVerbPhrase, type LanguageEngine, type ResolvedPhrase } from '../types.js';
import { possessiveEn } from '../possessive.js';

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

/**
 * Whether the phrase carries a superlative adjective ('most'/'least'). English marks the
 * superlative with a forced definite article; comparatives ('more'/'less') do not, so
 * "a bigger cat" is fine but "a biggest cat" is not.
 */
function npHasSuperlative(np: ResolvedNounPhrase): boolean {
  return np.adjectives.some((a) => {
    const d = adjDegree(a);
    return d === 'most' || d === 'least';
  });
}

const PREP: Record<ComplementType, string> = {
  locative: 'in', // place — relation-driven like route, see PATH_PREP; 'in' is the default relation
  direction: 'to',
  source: 'from',
  route: 'through',
  cause: 'because of',
  instrumental: 'with', // means / tool — "starts with a word"
  manner: 'like', // adverbial of manner — relation-driven, see MANNER_PREP; 'like' (similative) is the default
  terminus: 'to', // dative recipient — "cut the hair to the cat"
  predicative: '', // subject complement — no adposition ("becomes a legend", "seems happy")
};

// The manner adverbial's preposition follows the head noun's relation — similative "like (the
// wind)", means "with (care)", measure "at (the speed)", mode "in (a good way)" — read off the
// noun, not chosen by the speaker. 'like' is the default, and keeps clear of instrumental "with".
const MANNER_PREP: Record<MannerRelation, string> = { similative: 'like', means: 'with', measure: 'at', mode: 'in' };

// The adposition an adjective-definition gloss wraps its dimension noun phrase in — extent/quality
// "of" (**of** great size, **of** high quality), measure "at". The noun phrase (dimension noun +
// degree adjective) follows bare, its adjective already agreed and placed by the ordinary NP path.
const DIM_PREP: Record<DimensionRelation, string> = { extent: 'of', quality: 'of', measure: 'at' };

// The causal connector carries the speaker's stance: neutral "because of", positive "thanks to",
// negative "through the fault of" — the periphrasis English uses to lay blame ("cries through the
// fault of the dog"). All three take the same "<connector> <NP>" shape.
const CAUSE_PREP: Record<CauseSentiment, string> = {
  neutral: 'because of',
  positive: 'thanks to',
  negative: 'through the fault of',
};

// The spatial relations, shared by route and locative — English uses one preposition per relation
// for both ("goes under the bed", "is under the bed"), so a single map serves the two complements.
const PATH_PREP: Record<PathSpecifier, string> = {
  in: 'in',
  through: 'through',
  under: 'under',
  over: 'over',
  around: 'around',
  behind: 'behind',
  in_front_of: 'in front of',
};

/**
 * The determiner for a noun phrase, from its `definiteness` (default 'definite'):
 * "the", "a/an", nothing (bare), a demonstrative (this/these, that/those), or a quantifier
 * (some/no/many/few/all). "a" vs "an" is chosen on the sound of `lead` — the first word that
 * will actually follow the article (an adjective if present, else the noun) — and an
 * indefinite plural is bare ("a wolf" → plural "wolves"). Returns the determiner with a
 * trailing space, or "" for bare.
 */
function determiner(forms: Record<string, string>, lead: string, superlative = false): string {
  // A proper noun ("Africa") takes no article in English, whatever determiner was picked.
  if (forms['proper'] === '1') return '';
  const definiteness = forms['definiteness'] ?? 'definite';
  // English superlatives are inherently definite ("THE biggest cat"), so an indefinite or bare
  // determiner is ungrammatical with one ("a biggest cat", "biggest cats"). Force "the". The
  // other determiners (demonstratives, quantifiers, and a possessor which replaces the article
  // upstream) are already definite and read correctly with a superlative, so leave them.
  if (superlative && (definiteness === 'indefinite' || definiteness === 'bare')) return 'the ';
  const mass = forms['uncountable'] === '1';
  // A demonstrative agrees with the phrase's number ("this boy" / "these boys"); a mass
  // noun never pluralises, so it always takes the singular ("this water").
  const plural = (forms['number'] ?? forms['count']) === 'plural';
  switch (definiteness) {
    case 'bare':  return '';
    case 'this':  return plural ? 'these ' : 'this ';
    case 'that':  return plural ? 'those ' : 'that ';
    case 'some':  return 'some ';
    case 'no':    return 'no ';
    case 'any':   return 'any '; // the NPI a `no` object switches to when the clause is negated elsewhere
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
  // A true modal auxiliary takes "not" straight after it ("could not", "will not") — with the
  // orthographic "can not" → "cannot". "must" is the exception: Signi scopes a negated MUST as
  // ¬obligation ("does not have to"), the reading its own past ("did not have to"), German and
  // Japanese all take — never the prohibitive "must not". So "must" negates periphrastically via
  // the "have to" do-support below (as its past/future already do), keeping one scope across tenses.
  if (MODAL_AUX.has(first) && first !== 'must') {
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

/** The possessor rendered as a full standalone noun phrase — its own determiner, possessor and
 *  relative clause — the shape both the Saxon prefix and the of-genitive build on. */
function possessorPhrase(poss: ResolvedNounPhrase): string {
  return withRelative(nounPhrase(poss.head.forms, npAdj(poss), nounMods(poss), poss.possessor, npHasSuperlative(poss)), poss);
}

/**
 * A possessor rendered as a Saxon-genitive prefix ("the cat's "). The possessor is a
 * definite noun phrase (recursing for its own possessor / relative clause) followed by
 * the genitive marker; the possessed head drops its own article.
 */
function possessivePrefix(poss: ResolvedNounPhrase): string {
  return `${possessorPhrase(poss)}${genitiveMarker(poss)} `;
}

/**
 * Whether a possessor is post-modified — so heavy that the Saxon clitic "'s" would land on the
 * wrong word (the last word of a relative clause) rather than on the possessor's head. English
 * forbids the Saxon genitive here (the "group genitive" constraint) and uses the of-genitive
 * instead. A relative clause is the post-modifier; it propagates up a possessor chain, since a
 * possessor whose own possessor is post-modified is itself rendered with a trailing of-phrase.
 */
function isPostModified(np: ResolvedNounPhrase): boolean {
  // A pronominal possessor ("his") is a bare prenominal word — never post-modified — so only a
  // genitive possessor can propagate post-modification up the chain.
  return !!np.relative || (!!np.possessor && !isPronominalPossessor(np.possessor) && isPostModified(np.possessor));
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

function nounPhrase(forms: Record<string, string>, adj?: string, mods?: string, possessor?: ResolvedNounPhrase | PronominalPossessor, superlative = false): string {
  const count = forms['number'] ?? forms['count'] ?? 'singular';
  const word = count === 'plural' ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const a = adj ? `${adj} ` : '';
  // Noun-modifiers sit between the adjectives and the head: "the big sail boat".
  const m = mods ? `${mods} ` : '';
  // "a/an" agrees with the first word after the article (adjective, else modifier, else noun).
  const lead = adj || mods || word;
  // A pronominal possessor ("his") is a possessive pronoun that replaces the article ("his book",
  // never "the his book"); English's is invariant of the possessed head.
  if (possessor && isPronominalPossessor(possessor)) {
    return `${possessiveEn(possessor)} ${a}${m}${word}`;
  }
  // A post-modified possessor can't take the Saxon clitic (it would land on the last word of the
  // relative clause), so English uses the of-genitive: "the book of the cat that eats the mouse",
  // the head keeping its own article. Otherwise the possessor replaces the article as a Saxon
  // prefix: "the cat's book", not "the cat's the book".
  if (possessor && isPostModified(possessor)) {
    return `${determiner(forms, lead, superlative)}${a}${m}${word} of ${possessorPhrase(possessor)}`;
  }
  if (possessor) return `${possessivePrefix(possessor)}${a}${m}${word}`;
  return `${determiner(forms, lead, superlative)}${a}${m}${word}`;
}

function subjectPhrase(np: ResolvedNounPhrase): string {
  const forms = np.head.forms;
  if (forms['person']) {
    if (forms['number'] === 'plural' && forms['plural']) return forms['plural'];
    return forms['base'] ?? '';
  }
  return nounPhrase(forms, npAdj(np), nounMods(np), np.possessor, npHasSuperlative(np)); // noun — determiner from forms
}

/**
 * Render every conjunct of a noun slot and join them the way English coordinates: commas between
 * all but the last pair, the conjunction word on the last ("Peter, Paul and Mary"). A slot holding
 * one phrase is just that phrase.
 */
function coordinate(el: ResolvedNounElement, render: (np: ResolvedNounPhrase) => string): string {
  return joinConjuncts(el.conjuncts.map(render), ', ', () => ` ${COORD_WORDS[el.conjunction ?? 'and']} `);
}

/** One conjunct as a full non-subject noun phrase: determiner, adjectives, modifiers, relative. */
function npText(np: ResolvedNounPhrase): string {
  return withRelative(nounPhrase(np.head.forms, npAdj(np), nounMods(np), np.possessor, npHasSuperlative(np)), np);
}

/** A subject slot: each conjunct with its own relative clause, coordinated. */
function subjectText(el: ResolvedNounElement): string {
  return coordinate(el, (np) => withRelative(subjectPhrase(np), np));
}

function complementsPhrase(complements?: Partial<Record<ComplementType, ResolvedComplement>>): string {
  if (!complements) return '';
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      // What *kind* of complement this is (a pronoun? an adjective?) is settled by its first
      // conjunct — a coordination never mixes a pronoun with a noun in practice — but the
      // surface is rendered from every conjunct.
      const f = firstConjunct(c.phrase).head.forms;
      // A pronoun complement ("because of him/her/them") takes the oblique form with no
      // article — only the causal adjunct accepts a pronoun in the UI today. The sentiment
      // picks the connector: positive "thanks to", negative "through the fault of", neutral
      // "because of" ("thanks to her", "through the fault of them", "because of him").
      if (type === 'cause' && f['person']) {
        const prep = CAUSE_PREP[causeSentiment(c)];
        const pronouns = coordinate(c.phrase, (np) => np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? '');
        return `${prep} ${pronouns}`;
      }
      // An instrument presented as an action rather than a thing: "by choosing a word"
      // (process) / "with the choosing of a word" (concept). Both take the gerund — English
      // nominalises with the same -ing form — but the concept level makes that gerund a *noun*:
      // it takes the definite article and reaches its object through "of", where the process
      // level keeps the verb's own direct object.
      if (type === 'instrumental' && c.action) {
        const level = abstractionLevel(c);
        if (level !== 'object') {
          const object = coordinate(c.phrase, npText);
          const adverb = c.action.modifier?.forms['base'] ?? '';
          const words =
            level === 'process'
              ? ['by', actionGerund(c.action), object]
              : ['with the', actionGerund(c.action), 'of', object];
          return [...words, adverb].filter(Boolean).join(' ');
        }
      }
      // Subject complement: a predicate adjective takes no article and doesn't agree, but
      // carries its own degree ("seems happier"); a predicate noun keeps its own article,
      // with no preposition ("becomes a legend"). Coordinated conjuncts are rendered one by
      // one, so a group may mix the two ("seems a legend and happy" is odd, but "seems happy
      // or tired" and "becomes a legend and an icon" both fall out of the same map).
      if (type === 'predicative') {
        return coordinate(c.phrase, (np) =>
          np.head.forms['role'] === 'adjective' ? enAdj(np.head) : npText(np),
        );
      }
      // The preposition is emitted once, before the whole group: "with the cat and the dog".
      const prep = type === 'route' ? PATH_PREP[pathSpecifier(c)]
        : type === 'locative' ? PATH_PREP[pathSpecifier(c, DEFAULT_LOCATIVE_SPECIFIER)]
        : type === 'cause' ? CAUSE_PREP[causeSentiment(c)]
        : type === 'manner' ? MANNER_PREP[mannerRelation(firstConjunct(c.phrase).head.forms)]
        : PREP[type];
      return `${prep} ${coordinate(c.phrase, npText)}`;
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * The predicate half of a phrase — everything after the subject — as ordered parts.
 * Shared by the top-level sentence and by relative clauses, which pass the head noun's
 * forms as `subjectForms` so the verb agrees with the head.
 */
/** Place a frequency adverb after the finite auxiliary of a verb group — the slot English gives
 *  it after the *first* auxiliary: "must always eat", "will always eat", "has always eaten". */
function afterFirstAux(verbText: string, adverb: string): string {
  const [aux, ...rest] = verbText.split(' ');
  return [aux, adverb, ...rest].join(' ');
}

/** A modal link's own adverb for the generic (non-finite) chain: frequency before, manner after. */
function modalAdverbEn(m: ResolvedModal): { pre?: string; post?: string } {
  const t = m.modifier?.forms['base'] ?? '';
  if (!t) return {};
  return isFrequencyAdverb(m.modifier) ? { pre: t } : { post: t };
}

function predicateParts(
  subjectForms: Record<string, string>,
  verbPhrase: ResolvedVerbPhrase,
  directObject?: ResolvedNounElement,
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
): string[] {
  const { verb, negative: verbNegative, modifier, aspect = 'neutral', mood, register, modals } = verbPhrase;
  // The hypothetical "if" clause (subjunctive) is realised by the past tense ("if the cat ate");
  // the main clause (conditional) is "would" + the verb group, handled in its own branch below.
  const tense: Tense = mood === 'subjunctive' ? 'past' : (verbPhrase.tense ?? 'present');

  // A pronoun direct object takes its object form with no article ("sees me"), not the noun path
  // that would give "the I"; a noun object (or a coordination) renders as an ordinary noun phrase.
  const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
  // A negative adverb (NEVER) *anywhere* in the group — on the main verb or on any modal — is
  // itself the clause negator, so the finite verb takes no separate "not" (English has no negative
  // concord) and a `no` object switches to the "any"-series NPI.
  const groupNegative = groupHasNegativeAdverb(verbPhrase);
  // A `no` object with ANOTHER clause negator present (a negated verb, or a NEVER adverb) would
  // double the negative ("does not eat NO mouse", "never eats NO mouse"); English has no negative
  // concord, so the object switches to the "any"-series NPI — "does not eat any mouse", "never eats
  // any mouse". A lone `no` object keeps "no" ("eats no mouse").
  const objectIsNegative = directObject?.conjuncts.some((np) => np.head.forms['definiteness'] === 'no') ?? false;
  const anyObject = objectIsNegative && (verbNegative === true || groupNegative);
  const directObjectText = !directObject ? ''
    : isPronounElement(directObject) ? objectPronounForm(firstConjunct(directObject).head.forms)
    : coordinate(directObject, anyObject ? (np) => npText(withDefiniteness(np, 'any')) : npText);
  const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
  const isFrequency = modifier?.forms['subtype'] === 'frequency';
  const complementsText = complementsPhrase(complements);

  const negateVerb = verbNegative === true && !groupNegative;

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
    return [preVerb, verbText, directObjectText, complementsText, postVerb];
  }

  // Infinitive / citation phrase: the dictionary "to" + base ("to consume food"). Subject-less
  // and tenseless (aspect is forced neutral, so the group is the bare base); a negative citation
  // reads "not to …". This is the true infinitive, distinct from the instruction register's bare
  // base ("consume food") above — the "to" is what makes it a gloss rather than a directive.
  if (mood === 'infinitive') {
    const group = verbGroupInfinitive(verb.forms, aspect);
    const verbText = negateVerb ? `not to ${group}` : `to ${group}`;
    const preVerb = isFrequency ? modifierText : '';
    const postVerb = isFrequency ? '' : modifierText;
    return [preVerb, verbText, directObjectText, complementsText, postVerb];
  }

  // Conditional apodosis: "would" + the verb group ("would run", "would not run", "would be
  // running", "would have seen", "would want to go"). "would" is a defective modal auxiliary,
  // so it takes "not" directly and carries no tense/agreement itself.
  if (mood === 'conditional') {
    const groups = modals.length > 0
      ? [...modalChain(modals, (m) => m.forms['nonfinite'] ?? m.forms['base'] ?? '', modalAdverbEn), verbGroupInfinitive(verb.forms, aspect)]
      : [verbGroupInfinitive(verb.forms, aspect)];
    const verbText = [negateVerb ? 'would not' : 'would', ...groups].join(' ');
    const preVerb = isFrequency ? modifierText : '';
    const postVerb = isFrequency ? '' : modifierText;
    return [preVerb, verbText, directObjectText, complementsText, postVerb];
  }

  // A modal chain makes the outermost modal the finite verb — it takes the tense, the
  // agreement, and the negation — and every other element non-finite, down to the main
  // verb's whole group in the infinitive ("must not have seen the cat").
  if (modals.length > 0) {
    // Each verb in the group can carry its own adverb. A frequency adverb precedes the verb it
    // modifies ("never wanted", "to always go"), except on a true modal *auxiliary* finite, where
    // it follows it ("must always eat"); a manner adverb trails its verb. The main verb's own
    // frequency adverb sits right before its group; its manner adverb trails the whole clause.
    const words: string[] = [];
    modals.forEach((m, i) => {
      const adv = m.modifier?.forms['base'] ?? '';
      const freq = isFrequencyAdverb(m.modifier);
      if (i === 0) {
        const finite = modalFinite(m.verb, subjectForms, tense, negateVerb);
        if (adv && freq && MODAL_AUX.has(finite.split(' ')[0])) words.push(afterFirstAux(finite, adv));
        else if (adv && freq) words.push(adv, finite);
        else if (adv) words.push(finite, adv);
        else words.push(finite);
      } else {
        const word = m.verb.forms['nonfinite'] ?? m.verb.forms['base'] ?? '';
        if (adv && freq) words.push(adv, word);
        else if (adv) words.push(word, adv);
        else words.push(word);
      }
      if (m.verb.forms['link']) words.push(m.verb.forms['link']);
    });
    const mainGroup = verbGroupInfinitive(verb.forms, aspect);
    if (modifierText && isFrequency) words.push(modifierText, mainGroup);
    else words.push(mainGroup);
    const trailingMod = modifierText && !isFrequency ? modifierText : '';
    return ['', words.filter(Boolean).join(' '), directObjectText, complementsText, trailingMod];
  }

  // A non-neutral aspect (progressive/prospective/resultative) is periphrastic on "be",
  // which carries the tense and any negation ("is not going"), so it bypasses do-support.
  if (aspect !== 'neutral') {
    const verbText = aspectVerb(verb.forms, subjectForms, tense, aspect, negateVerb);
    // A frequency adverb follows the finite auxiliary of the group, not the whole group:
    // "you have never been", "is never going" — never "you never have been".
    if (isFrequency && modifierText) {
      return ['', afterFirstAux(verbText, modifierText), directObjectText, complementsText, ''];
    }
    return ['', verbText, directObjectText, complementsText, modifierText];
  }

  if (verbNegative && !modifierIsNegative) {
    // The copula negates on itself — "is not careful", "was not careful", "will not be
    // careful" — never with do-support.
    if (verb.forms['copula'] === '1') {
      const negVerb = tense === 'future'
        ? `will not ${verb.forms['base'] ?? 'be'}`
        : `${conjugate(verb.forms, subjectForms, tense)} not`;
      const trailingMod = isFrequency ? '' : modifierText;
      return [negVerb, directObjectText, complementsText, trailingMod];
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
    return [negVerb, directObjectText, complementsText, trailingMod];
  }
  // Future is periphrastic ("will eat"); present/past come from the forms map.
  const verbText = tense === 'future'
    ? `will ${verb.forms['base'] ?? ''}`
    : conjugate(verb.forms, subjectForms, tense);
  // In the future, the frequency adverb follows the auxiliary "will" ("will always eat"), the same
  // slot the perfect and a modal give it. With no auxiliary (present/past) it stays pre-verbal.
  if (isFrequency && modifierText && tense === 'future') {
    return ['', afterFirstAux(verbText, modifierText), directObjectText, complementsText, ''];
  }
  // Frequency adverbs (always, never) precede the main verb: S Adv V Obj
  // Manner adverbs (fast, slowly) follow the verb/object: S V Obj Adv
  const preVerb  = isFrequency ? modifierText : '';
  const postVerb = isFrequency ? '' : modifierText;
  return [preVerb, verbText, directObjectText, complementsText, postVerb];
}

/**
 * A restrictive relative clause on `np`: relativizer + the clause's predicate. "who"
 * for a personal head, "that" otherwise (English uses the same relativizer whether the
 * head is the clause's subject or object). For a subject-relative the head fills the
 * subject slot and drives agreement ("the boy who cried"). For a non-subject relative
 * the gap slot is already absent from the clause and it carries its own subject, which
 * is rendered after the relativizer and drives agreement ("the book that I read").
 */
function relativeText(np: ResolvedNounPhrase): string {
  const rel = np.relative;
  if (!rel) return '';
  // English relativises on PERSONHOOD, not animacy: "who" for a person, "that" for anything else
  // (an animal is animate but still takes "that"/"which").
  const pronoun = np.head.forms['human'] === '1' ? 'who' : 'that';
  const subjectRelative = rel.headRole === 'subject' || !rel.subject;
  const agreeForms = subjectRelative ? np.head.forms : rel.subject!.agreement;
  const subjText = subjectRelative ? '' : subjectText(rel.subject!);
  return [pronoun, subjText, ...predicateParts(agreeForms, rel.verbPhrase, rel.directObject, rel.complements)]
    .filter(Boolean)
    .join(' ');
}

/** Append a noun phrase's relative clause (if any) to its already-rendered surface. */
function withRelative(text: string, np: ResolvedNounPhrase): string {
  const rel = relativeText(np);
  return rel ? `${text} ${rel}` : text;
}

/**
 * An adjective-definition gloss fragment ("of great size"): the dimension noun phrase (its degree
 * adjective already agreed and placed by the ordinary NP path — "great size") wrapped in the
 * adposition its `dimensionRelation` selects. The one place a verbless period is a prepositional
 * fragment rather than a bare subject noun phrase — see `renderClause`.
 */
function dimensionGloss(np: ResolvedNounPhrase, el: ResolvedNounElement): string {
  const prep = DIM_PREP[dimensionRelation(np.head.forms)];
  return `${prep} ${subjectText(el)}`.trim();
}

/** Whether a resolved noun slot is a single adjective-definition gloss phrase (see NounPhrase.dimensionGloss). */
function isDimensionGloss(el: ResolvedNounElement): boolean {
  return el.conjuncts.length === 1 && el.conjuncts[0].dimensionGloss === true;
}

/**
 * A manner-definition gloss fragment ("at high speed", "in a good way"): the manner noun phrase —
 * its determiner and any degree adjective already placed by the ordinary NP path — wrapped in the
 * adposition its `mannerRelation` selects. Unlike `dimensionGloss` the article is kept, so the
 * phrase's own `definiteness` gives "a good way" / "all times" / "no time".
 */
function mannerGloss(np: ResolvedNounPhrase, el: ResolvedNounElement): string {
  const prep = MANNER_PREP[mannerRelation(np.head.forms)];
  return `${prep} ${subjectText(el)}`.trim();
}

/** Whether a resolved noun slot is a single manner-definition gloss phrase (see NounPhrase.mannerGloss). */
function isMannerGloss(el: ResolvedNounElement): boolean {
  return el.conjuncts.length === 1 && el.conjuncts[0].mannerGloss === true;
}

/** One clause (subject + predicate), ignoring any attached hypothetical condition. */
function renderClause(phrase: ResolvedPhrase): string {
  const { subject } = phrase;
  // A verbless period marked as an adjective-definition gloss is a prepositional fragment ("of
  // great size"), not a bare subject noun phrase — wrap the dimension NP in its adposition.
  if (!phrase.verbPhrase && isDimensionGloss(subject)) return dimensionGloss(firstConjunct(subject), subject);
  // A verbless period marked as a manner-definition gloss is the adverbial fragment that defines an
  // adverb ("at high speed"), the manner noun phrase under the adposition its `mannerRelation` picks.
  if (!phrase.verbPhrase && isMannerGloss(subject)) return mannerGloss(firstConjunct(subject), subject);
  // An imperative drops its subject from the surface, but the subject's person/number still
  // drives the choice of imperative form (2nd person vs "let's …"), so it is kept for agreement.
  // An infinitive citation ("to consume food") is likewise subject-less on the surface.
  const dropsSubject =
    phrase.verbPhrase?.mood === 'imperative' || phrase.verbPhrase?.mood === 'infinitive';
  const subj = dropsSubject ? '' : subjectText(subject);
  // Verbless period: a bare noun phrase ("breaking news").
  if (!phrase.verbPhrase) return subj.trim();
  return [
    subj,
    ...predicateParts(subject.agreement, phrase.verbPhrase, phrase.directObject, phrase.complements),
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
  therefore: 'so',
  then: 'and then',
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
  // The determiner alone, for the menu that picks one: English chooses "a" vs "an" on the sound
  // of the word that follows, so the citation noun is passed as that word.
  renderDeterminer(noun: ConceptForms): string {
    const f = noun.forms;
    const plural = (f['number'] ?? f['count']) === 'plural';
    const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
    return determiner(f, word);
  },
};
