/**
 * Random phrase generator — a bug-hunting tool, not a test.
 *
 *   npx tsx packages/engine/test/tools/randomPhrase.ts [count] [--seed N] [--pretty]
 *
 * It builds `count` random `PhrasePlan`s out of the real corpus and renders each one in all seven
 * languages, so the output can be read against the plan and judged for grammar. Every phrase is
 * printed with the seed that produced it; re-render one with `--seed <that seed> 1`.
 *
 * What it randomises: the subject (a noun with its number, gender, determiner, adjectives and their
 * degrees, attributive nouns, a possessor, a relative clause — or a pronoun), the verb (tense, aspect,
 * negation, an adverb, a modal, the passive), the direct object where the verb's transitivity
 * licenses one, one or two of the complements that verb declares, and now and then a clause-level
 * mood (a question, a command, a citation infinitive, a hypothetical, a coordination). Any noun slot
 * but a possessor may hold a group of two or three coordinated noun phrases instead of one ("the cat
 * and a dog", "in the house or the market").
 *
 * The subordinate clauses nest two deep. A relative clause may hang off any noun, a complement's
 * included; it has objects and complements of its own, its gap is the subject, the object, one of
 * its complements or the possessor ("whose"), and its own nouns may carry one more relative clause.
 * A clause may also govern an infinitive — under a word whose lexeme links one ("desires to eat", "is
 * able to eat", "to desire to be able to act") or the causative, whose object is the one who comes
 * to act ("causes the dog to eat") — and may carry a clause of purpose ("runs to eat").
 *
 * What it does NOT do: make sense. A random plan is semantic nonsense as often as not ("few legends
 * bit many books in few butchers"), which is fine — the grammar of a nonsense sentence is still
 * right or wrong, and that is what is being reviewed. It stays inside what the app can express,
 * though: a command's subject is the addressee pronoun, a mass noun is never pluralised, a verb only
 * takes the complements it licenses, and only a verb with an object goes into the passive. Most of it
 * is what the builder canvas offers. The infinitive complement, the causative, the clause of purpose
 * and the "whose" relative are not on the canvas; the concept definitions and the localized UI
 * strings are built on them, so they render in every tooltip, and a defect there is in the app too.
 *
 * Vocabulary is limited to everyday words. The corpus also holds the app's own grammar vocabulary
 * (SUBJECT_GRAMMAR, DEFINITE, PERIOD_PUNCTUATION…), which is seeded for the localized UI and makes
 * a sentence unreadable as a sentence.
 *
 * See the `/test-random-phrases` skill for the review and bug-filing loop this feeds.
 */
import type {
  Aspect,
  Complement,
  ComplementType,
  CoordConjunction,
  Definiteness,
  Degree,
  InfinitiveComplement,
  ModifierRelation,
  NounElement,
  NounModifier,
  NounPhrase,
  PathSpecifier,
  PhrasePlan,
  PurposeClause,
  RelativeClause,
  Tense,
  VerbPhrase,
} from '@signi/shared';
import type { ConceptSeed } from '../../../backend/src/concepts/types.js';
import { concepts } from '../../../backend/src/concepts/index.js';
import { translateAll } from '../harness.js';

// ── The vocabulary a sentence can be read in ────────────────────────────────
const EVERYDAY_NOUNS = [
  'ANIMAL', 'CAT', 'DOG', 'BOOK', 'WATER', 'MONEY', 'FOOD', 'ICE_CREAM', 'HOUSE', 'BUILDING', 'WALL',
  'CHILD', 'PERSON', 'FOX', 'BOY', 'MAN', 'WOMAN', 'WOLF', 'COW', 'OX', 'BUTCHER', 'ANGEL', 'MOUSE',
  'STICK', 'BLADE', 'FIRE', 'PARENT', 'FATHER', 'MARKET', 'COIN', 'LEGEND', 'WING', 'TOOTH', 'TEAR',
  'YOUNG_MAN', 'YOUNG_WOMAN', 'PRISON', 'BUILDER', 'WORD', 'PHRASE', 'AFRICA', 'EUROPE', 'ASIA',
  'CONTINENT', 'LANGUAGE', 'LIFE', 'DEATH', 'FEELING', 'PLACE', 'LIGHT', 'SOUND', 'FILE', 'BUTTON',
];
const EVERYDAY_ADJECTIVES = [
  'BIG', 'SMALL', 'HIGH', 'GREAT', 'LOW', 'NEAR', 'FAR', 'GOOD', 'BAD', 'HAPPY', 'SAD', 'OLD',
  'YOUNG', 'ADULT', 'NEW', 'BEAUTIFUL', 'STRONG', 'WEAK', 'TIRED', 'HUNGRY', 'COLD', 'WARM', 'HOT',
  'INTERESTING', 'QUICK', 'BROWN', 'WILD', 'DOMESTIC', 'LAZY', 'CAREFUL', 'WHOLE', 'ROUND', 'SHARP',
  'LOUD', 'EMPTY', 'MISSING', 'MAIN', 'HIDDEN',
];

const DETERMINERS: Definiteness[] = ['definite', 'indefinite', 'bare', 'some', 'no', 'many', 'few', 'all', 'this', 'that'];
const MARKED_DEGREES: Degree[] = ['more', 'most', 'less', 'least', 'equally'];
const TENSES: Tense[] = ['present', 'past', 'future'];
const MARKED_ASPECTS: Aspect[] = ['progressive', 'prospective', 'resultative'];
const PATHS: PathSpecifier[] = ['in', 'through', 'under', 'over', 'around', 'behind', 'in_front_of', 'on', 'between', 'against'];
const CONJUNCTIONS: CoordConjunction[] = ['and', 'or', 'but', 'that_is', 'therefore', 'then'];
// Only these two join noun phrases (NOUN_COORD_CONJUNCTIONS); the others relate clauses.
const NOUN_CONJUNCTIONS: CoordConjunction[] = ['and', 'or'];
const MODALS = ['MUST', 'CAN', 'WILL'];
const MODIFIER_RELATIONS: ModifierRelation[] = ['feature', 'purpose', 'material'];

const byId = new Map(concepts.map((c) => [c.id, c]));
const nouns = EVERYDAY_NOUNS.filter((id) => byId.has(id));
const adjectives = EVERYDAY_ADJECTIVES.filter((id) => byId.has(id));
const adverbs = concepts.filter((c) => c.role === 'adverb').map((c) => c.id);
// A sense is selected by the engine, never picked (KNOW_ACQUAINTED), and a modal governs a verb
// rather than heading a clause — neither is a main verb the builder offers.
const verbs = concepts.filter((c) => c.role === 'verb' && !c.modal && !c.senseOf);
// The words that govern an infinitive complement: the verbs and predicate adjectives whose lexemes
// name an `infinitive_link` (subject control: "desires to eat", "is able to eat"), and the causative,
// whose object is the one who comes to act (object control: "causes the dog to eat").
const GOVERNORS: { verb: string; predicate?: string; causative?: boolean }[] = [
  { verb: 'DESIRE' },
  { verb: 'BEGIN' },
  { verb: 'BE', predicate: 'ABLE' },
  { verb: 'BE', predicate: 'OBLIGED' },
  { verb: 'BECOME', predicate: 'ABLE' },
  { verb: 'CAUSE_VERB', causative: true },
].filter((g) => byId.has(g.verb) && (!g.predicate || byId.has(g.predicate)));

// ── A seeded PRNG, so a phrase can be reproduced from its printed seed ──────
function randomness(seed: number) {
  let state = seed >>> 0;
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    chance: (probability: number): boolean => next() < probability,
    pick: <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)] as T,
  };
}

type Random = ReturnType<typeof randomness>;

// How deep the subordinate clauses nest: a relative clause inside a relative clause, no deeper.
const MAX_DEPTH = 2;

type NounOptions = { pronoun?: boolean; relative?: boolean; inPossessor?: boolean };

function nounPhrase(r: Random, depth: number, opts: NounOptions = {}): NounPhrase {
  if (opts.pronoun && r.chance(0.2)) {
    const concept = r.pick(['FIRST_PERSON', 'SECOND_PERSON', 'THIRD_PERSON']);
    return {
      concept,
      number: r.chance(0.4) ? 'plural' : 'singular',
      ...(concept === 'THIRD_PERSON' ? { gender: r.pick(['masc', 'fem'] as const) } : {}),
    };
  }
  const concept = r.pick(nouns);
  const seed = byId.get(concept) as ConceptSeed;
  const np: NounPhrase = { concept };
  // A mass noun has no plural, and the builder does not offer one.
  if (seed.countable !== false && r.chance(0.35)) np.number = 'plural';
  if (seed.human && r.chance(0.4)) np.gender = 'fem';
  if (r.chance(0.6)) np.definiteness = r.pick(DETERMINERS);
  // The adjective slots, each holding an adjective or, the builder's "Adjective ⇄ Noun" switch, an
  // attributive noun ("sail boat", "barca a vela").
  const slots = r.chance(0.55) ? (r.chance(0.3) ? 2 : 1) : 0;
  const picked: string[] = [];
  const modifiers: NounModifier[] = [];
  for (let i = 0; i < slots; i++) {
    if (r.chance(0.2)) modifiers.push(nounModifier(r, concept));
    else picked.push(r.pick(adjectives));
  }
  if (picked.length > 0) {
    np.adjectives = [...new Set(picked)];
    if (r.chance(0.35)) np.adjectiveDegrees = np.adjectives.map(() => (r.chance(0.6) ? r.pick(MARKED_DEGREES) : 'positive'));
  }
  if (modifiers.length > 0) np.nounModifiers = modifiers;
  if (!opts.inPossessor && depth < MAX_DEPTH && r.chance(0.15)) {
    np.possessor = r.chance(0.5)
      ? nounPhrase(r, depth, { inPossessor: true })
      : {
          kind: 'pronominal',
          person: r.pick(['1', '2', '3'] as const),
          number: r.pick(['singular', 'plural'] as const),
          gender: r.pick(['masc', 'fem'] as const),
        };
  }
  if (opts.relative && !opts.inPossessor && depth < MAX_DEPTH && r.chance(depth === 0 ? 0.2 : 0.1)) {
    np.relative = relativeClause(r, depth + 1);
  }
  return np;
}

// A noun used attributively, with the relation that picks its Romance preposition, and now and then
// its own number and an adjective of its own ("creatore di frasi semantiche").
function nounModifier(r: Random, head: string): NounModifier {
  const concept = r.pick(nouns.filter((id) => id !== head));
  const modifier: NounModifier = { concept, relation: r.pick(MODIFIER_RELATIONS) };
  if ((byId.get(concept) as ConceptSeed).countable !== false && r.chance(0.25)) modifier.number = 'plural';
  if (r.chance(0.2)) modifier.adjectives = [r.pick(adjectives)];
  return modifier;
}

// What fills a noun slot: one phrase, or now and then a group of two or three joined by "and" or
// "or", as every noun block on the canvas can be coordinated. Each conjunct is built on its own, so
// they differ in determiner, adjectives, possessor and relative clause, as the builder lets them. A
// possessor is never a group (see `NounElement`), so it keeps calling `nounPhrase`.
function nounElement(r: Random, depth: number, opts: NounOptions = {}): NounElement {
  const head = nounPhrase(r, depth, opts);
  if (!r.chance(0.2)) return head;
  const others = Array.from({ length: r.chance(0.25) ? 2 : 1 }, () => nounPhrase(r, depth, opts));
  return { conjuncts: [head, ...others], conjunction: r.pick(NOUN_CONJUNCTIONS) };
}

// The slots a verb's clause fills besides its subject: the direct object where the verb licenses
// one, the complement it cannot do without (a ditransitive's recipient, a copula's predicate), and
// now and then one more that it licenses.
function clauseArguments(
  r: Random,
  verb: ConceptSeed,
  depth: number,
  objectPronoun: number,
): Pick<PhrasePlan, 'directObject' | 'complements'> {
  const out: Pick<PhrasePlan, 'directObject' | 'complements'> = {};
  const licensed = (verb.complements ?? []) as ComplementType[];
  if (verb.transitivity !== 'intransitive') {
    out.directObject = nounElement(r, depth, { pronoun: r.chance(objectPronoun), relative: true });
  }
  const required: ComplementType[] = verb.transitivity === 'ditransitive' ? ['terminus']
    : licensed.includes('predicative') && (verb.id !== 'BE' || r.chance(0.7)) ? ['predicative']
    : [];
  const rest = licensed.filter((t) => !required.includes(t));
  const chosen = [...required, ...(rest.length > 0 && r.chance(0.7) ? [r.pick(rest)] : [])];
  if (chosen.length > 0) {
    out.complements = Object.fromEntries(chosen.map((t) => [t, complement(r, t, depth)])) as PhrasePlan['complements'];
  }
  return out;
}

function relativeClause(r: Random, depth: number): RelativeClause {
  const verb = r.pick(verbs);
  const rc: RelativeClause = { verbPhrase: verbPhrase(r, verb, 0.5), ...clauseArguments(r, verb, depth, 0) };
  // The gap: the slot the head noun fills. The subject by default; the object ("the book that I
  // read"); a complement, whose specifiers pick the relativizer's preposition ("the house under
  // which…"); or the possessor, where the head owns the clause's subject ("the cat whose dog runs").
  // A predicate is no slot a noun can be relativised out of.
  const complementGaps = (Object.keys(rc.complements ?? {}) as ComplementType[])
    .filter((t) => t !== 'predicative' && t !== 'objectPredicative');
  const gap: RelativeClause['headRole'] = r.chance(0.08) ? 'possessor'
    : rc.directObject && r.chance(0.35) ? 'directObject'
    : complementGaps.length > 0 && r.chance(0.3) ? r.pick(complementGaps)
    : 'subject';
  if (gap === 'directObject') delete rc.directObject;
  if (gap && gap !== 'subject' && gap !== 'directObject' && gap !== 'possessor' && rc.complements) {
    const specifiers = rc.complements[gap]?.specifiers;
    if (specifiers?.length) rc.headSpecifiers = specifiers;
    delete rc.complements[gap];
    if (Object.keys(rc.complements).length === 0) delete rc.complements;
  }
  if (gap !== 'subject') {
    rc.headRole = gap;
    // The possessed noun is a noun of its own, owned by the head, so it takes no possessor.
    rc.subject = gap === 'possessor'
      ? (({ possessor: _owner, ...np }) => np)(nounPhrase(r, depth, { relative: true }))
      : nounElement(r, depth, { pronoun: true, relative: true });
  }
  // Only a clause that keeps its object has one to promote.
  if (rc.directObject && r.chance(0.1)) rc.verbPhrase.voice = 'passive';
  return rc;
}

function verbPhrase(r: Random, verb: ConceptSeed, weight = 1): VerbPhrase {
  const vp: VerbPhrase = { verb: verb.id };
  if (r.chance(0.6)) vp.tense = r.pick(TENSES);
  if (r.chance(0.45 * weight)) vp.aspect = r.pick(MARKED_ASPECTS);
  if (r.chance(0.25)) vp.negative = true;
  if (r.chance(0.5 * weight)) vp.modifier = r.pick(adverbs);
  // A modal carries its own polarity, as it carries its own adverb: the generator denies the modal
  // about as often as `negative` denies the verb it governs, so both scopes get hunted (A03).
  if (r.chance(0.2 * weight)) {
    const modal = r.pick(MODALS);
    vp.modals = [r.chance(0.3) ? { verb: modal, negative: true } : modal];
  }
  return vp;
}

// The verb of a clause that renders as an infinitive — a governed one, or a clause of purpose — has
// no tense, aspect or modals of its own; it may be negated and take an adverb.
function nonfiniteVerbPhrase(r: Random, verb: ConceptSeed): VerbPhrase {
  const vp: VerbPhrase = { verb: verb.id };
  if (r.chance(0.2)) vp.negative = true;
  if (r.chance(0.3)) vp.modifier = r.pick(adverbs);
  return vp;
}

function complement(r: Random, type: ComplementType, depth: number): Complement {
  // The subject complement is the one that also takes an adjective head, and it takes no adposition.
  if (type === 'predicative') {
    if (r.chance(0.55)) {
      const head: NounPhrase = { concept: r.pick(adjectives) };
      if (r.chance(0.3)) head.headDegree = r.pick(MARKED_DEGREES);
      return { phrase: head };
    }
    return { phrase: nounElement(r, depth, { relative: true }) };
  }
  // Only the cause complement accepts a pronoun ("because of him").
  const c: Complement = { phrase: nounElement(r, depth, { pronoun: type === 'cause', relative: true }) };
  if ((type === 'route' || type === 'locative') && r.chance(0.6)) c.specifiers = [{ kind: 'path', value: r.pick(PATHS) }];
  if (type === 'cause' && r.chance(0.6)) c.specifiers = [{ kind: 'sentiment', value: r.pick(['neutral', 'negative', 'positive'] as const) }];
  return c;
}

// A clause the governing clause's predicate takes in the infinitive. Its subject is unspoken: the
// governing clause's subject, or, under the causative, its object. Now and then it governs one more
// in turn ("to desire to be able to act").
function infinitiveComplement(r: Random, depth: number, objectControl: boolean): InfinitiveComplement {
  const governor = depth < MAX_DEPTH && r.chance(0.2) ? r.pick(GOVERNORS.filter((g) => !g.causative)) : undefined;
  const verb = byId.get(governor?.verb ?? r.pick(verbs).id) as ConceptSeed;
  const ic: InfinitiveComplement = { verbPhrase: nonfiniteVerbPhrase(r, verb) };
  if (governor) {
    if (governor.predicate) ic.complements = { predicative: { phrase: { concept: governor.predicate } } };
    ic.infinitiveComplement = infinitiveComplement(r, depth + 1, false);
  } else {
    Object.assign(ic, clauseArguments(r, verb, depth, 0.2));
  }
  if (objectControl) ic.control = 'object';
  return ic;
}

// What the act is done for, as an infinitive whose unspoken subject is the clause's own.
function purposeClause(r: Random, depth: number): PurposeClause {
  const verb = r.pick(verbs);
  return { verbPhrase: nonfiniteVerbPhrase(r, verb), ...clauseArguments(r, verb, depth, 0.2) };
}

function plan(r: Random, extras = true): PhrasePlan {
  // Now and then the clause is built on a word that governs an infinitive, and takes one.
  const governor = r.chance(0.12) ? r.pick(GOVERNORS) : undefined;
  const verb = governor ? (byId.get(governor.verb) as ConceptSeed) : r.pick(verbs);
  const p: PhrasePlan = {
    subject: nounElement(r, 0, { pronoun: true, relative: true }),
    verbPhrase: verbPhrase(r, verb),
  };
  if (governor) {
    if (governor.predicate) p.complements = { predicative: { phrase: { concept: governor.predicate } } };
    // The causative's object is the causee, the one the infinitive's act is done by.
    if (governor.causative) p.directObject = nounElement(r, 0, { pronoun: r.chance(0.3), relative: true });
    p.infinitiveComplement = infinitiveComplement(r, 1, !!governor.causative);
  } else {
    Object.assign(p, clauseArguments(r, verb, 0, 0.3));
    if (p.directObject && r.chance(0.15)) p.verbPhrase!.voice = 'passive';
  }
  if (r.chance(0.1)) p.purpose = purposeClause(r, 1);
  if (!extras) return p;
  // One clause-level mood at most: the builder disables the others once one is on.
  const mood = r.chance(0.13) ? 'interrogative'
    : r.chance(0.11) ? 'imperative'
    : r.chance(0.07) ? 'infinitive'
    : r.chance(0.11) ? 'condition'
    : r.chance(0.11) ? 'coordination'
    : 'none';
  if (mood === 'interrogative') p.interrogative = true;
  if (mood === 'imperative') {
    // The addressee: the builder synthesises the subject pronoun from the person, and offers no
    // other subject under a command. A command has no passive; the translator would drop it.
    p.imperative = true;
    p.subject = r.chance(0.25)
      ? { concept: 'FIRST_PERSON', number: 'plural' }
      : { concept: 'SECOND_PERSON', number: r.chance(0.3) ? 'plural' : 'singular' };
    if (r.chance(0.3)) p.imperativeRegister = 'instruction';
    delete p.verbPhrase!.voice;
  }
  if (mood === 'infinitive') {
    // A citation ("to eat the food") takes the mood's slot, as the builder's switch does: present,
    // neutral aspect, no modals, and a throwaway subject no language speaks.
    p.infinitive = true;
    p.subject = { concept: 'GENERIC_PERSON' };
    const { tense: _t, aspect: _a, modals: _m, ...rest } = p.verbPhrase!;
    p.verbPhrase = rest;
  }
  if (mood === 'condition') p.condition = plan(r, false);
  if (mood === 'coordination') p.coordination = { conjunction: r.pick(CONJUNCTIONS), clause: plan(r, false) };
  return p;
}

// ── CLI ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const pretty = args.includes('--pretty');
// The count is the bare number, which is not a flag's value — "--seed 7000" alone is one phrase.
const positional = args.filter((a, i) => /^\d+$/.test(a) && !(args[i - 1] ?? '').startsWith('--'));
const count = Number(positional[0] ?? 1);
const base = Number(flag('seed') ?? Math.floor(Math.random() * 1_000_000));

for (let i = 0; i < count; i++) {
  const seed = base + i;
  const p = plan(randomness(seed));
  console.log(`\n# phrase ${i + 1} of ${count} · seed ${seed}`);
  console.log(`plan: ${JSON.stringify(p, null, pretty ? 2 : undefined)}`);
  for (const t of translateAll(p)) console.log(`  ${t.language}: ${t.text}`);
}
console.log(`\nre-render one with: npx tsx packages/engine/test/tools/randomPhrase.ts 1 --seed <seed>`);
