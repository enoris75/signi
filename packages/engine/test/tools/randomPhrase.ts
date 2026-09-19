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
 * degrees, a possessor, a relative clause — or a pronoun), the verb (tense, aspect, negation, an
 * adverb, a modal), the direct object where the verb's transitivity licenses one, one or two of the
 * complements that verb declares, and now and then a clause-level mood (a question, a command, a
 * hypothetical, a coordination).
 *
 * What it does NOT do: make sense. A random plan is semantic nonsense as often as not ("few legends
 * bit many books in few butchers"), which is fine — the grammar of a nonsense sentence is still
 * right or wrong, and that is what is being reviewed. It stays inside what the builder UI can
 * express, though: a command's subject is the addressee pronoun, a mass noun is never pluralised,
 * and a verb only takes the complements it licenses. A rendering that is wrong here is wrong in the
 * app.
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
  NounPhrase,
  PathSpecifier,
  PhrasePlan,
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
const PATHS: PathSpecifier[] = ['in', 'through', 'under', 'over', 'around', 'behind', 'in_front_of'];
const CONJUNCTIONS: CoordConjunction[] = ['and', 'or', 'but', 'that_is', 'therefore', 'then'];
const MODALS = ['MUST', 'CAN', 'WILL'];

const byId = new Map(concepts.map((c) => [c.id, c]));
const nouns = EVERYDAY_NOUNS.filter((id) => byId.has(id));
const adjectives = EVERYDAY_ADJECTIVES.filter((id) => byId.has(id));
const adverbs = concepts.filter((c) => c.role === 'adverb').map((c) => c.id);
// A sense is selected by the engine, never picked (KNOW_ACQUAINTED), and a modal governs a verb
// rather than heading a clause — neither is a main verb the builder offers.
const verbs = concepts.filter((c) => c.role === 'verb' && !c.modal && !c.senseOf);

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

function nounPhrase(r: Random, depth: number, opts: { pronoun?: boolean; relative?: boolean } = {}): NounPhrase {
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
  const count = r.chance(0.55) ? (r.chance(0.3) ? 2 : 1) : 0;
  if (count > 0) {
    np.adjectives = [...new Set(Array.from({ length: count }, () => r.pick(adjectives)))];
    if (r.chance(0.35)) np.adjectiveDegrees = np.adjectives.map(() => (r.chance(0.6) ? r.pick(MARKED_DEGREES) : 'positive'));
  }
  if (depth < 1 && r.chance(0.15)) {
    np.possessor = r.chance(0.5)
      ? nounPhrase(r, depth + 1)
      : {
          kind: 'pronominal',
          person: r.pick(['1', '2', '3'] as const),
          number: r.pick(['singular', 'plural'] as const),
          gender: r.pick(['masc', 'fem'] as const),
        };
  }
  if (depth < 1 && opts.relative && r.chance(0.25)) np.relative = relativeClause(r, depth + 1);
  return np;
}

function relativeClause(r: Random, depth: number): RelativeClause {
  // A copular verb needs a subject complement and a ditransitive a recipient; keep the embedded
  // clause to the verbs that read without one.
  const verb = r.pick(verbs.filter((v) => v.transitivity !== 'ditransitive' && !(v.complements ?? []).includes('predicative')));
  const rc: RelativeClause = { verbPhrase: verbPhrase(r, verb, 0.5) };
  if (verb.transitivity === 'transitive') {
    if (r.chance(0.4)) {
      // An object-relative: the head fills the object slot, so the clause carries its own subject.
      rc.headRole = 'directObject';
      rc.subject = nounPhrase(r, depth + 1, { pronoun: true });
    } else {
      rc.directObject = nounPhrase(r, depth + 1);
    }
  }
  return rc;
}

function verbPhrase(r: Random, verb: ConceptSeed, weight = 1): VerbPhrase {
  const vp: VerbPhrase = { verb: verb.id };
  if (r.chance(0.6)) vp.tense = r.pick(TENSES);
  if (r.chance(0.45 * weight)) vp.aspect = r.pick(MARKED_ASPECTS);
  if (r.chance(0.25)) vp.negative = true;
  if (r.chance(0.5 * weight)) vp.modifier = r.pick(adverbs);
  if (r.chance(0.2 * weight)) vp.modals = [r.pick(MODALS)];
  return vp;
}

function complement(r: Random, type: ComplementType): Complement {
  // The subject complement is the one that also takes an adjective head, and it takes no adposition.
  if (type === 'predicative') {
    if (r.chance(0.55)) {
      const head: NounPhrase = { concept: r.pick(adjectives) };
      if (r.chance(0.3)) head.headDegree = r.pick(MARKED_DEGREES);
      return { phrase: head };
    }
    return { phrase: nounPhrase(r, 1) };
  }
  // Only the cause complement accepts a pronoun ("because of him").
  const c: Complement = { phrase: nounPhrase(r, 1, { pronoun: type === 'cause' }) };
  if ((type === 'route' || type === 'locative') && r.chance(0.6)) c.specifiers = [{ kind: 'path', value: r.pick(PATHS) }];
  if (type === 'cause' && r.chance(0.6)) c.specifiers = [{ kind: 'sentiment', value: r.pick(['neutral', 'negative', 'positive'] as const) }];
  return c;
}

function plan(r: Random, extras = true): PhrasePlan {
  const verb = r.pick(verbs);
  const licensed = (verb.complements ?? []) as ComplementType[];
  const p: PhrasePlan = {
    subject: nounPhrase(r, 0, { pronoun: true, relative: true }),
    verbPhrase: verbPhrase(r, verb),
  };
  if (verb.transitivity !== 'intransitive') p.directObject = nounPhrase(r, 0, { pronoun: r.chance(0.3), relative: true });
  // A ditransitive needs its recipient, and a copular verb needs the complement it exists for.
  const required: ComplementType[] = verb.transitivity === 'ditransitive' ? ['terminus']
    : licensed.includes('predicative') && (verb.id !== 'BE' || r.chance(0.7)) ? ['predicative']
    : [];
  const rest = licensed.filter((t) => !required.includes(t));
  const chosen = [...required, ...(rest.length > 0 && r.chance(0.7) ? [r.pick(rest)] : [])];
  if (chosen.length > 0) {
    p.complements = Object.fromEntries(chosen.map((t) => [t, complement(r, t)])) as PhrasePlan['complements'];
  }
  if (!extras) return p;
  // One clause-level mood at most: the builder disables the others once one is on.
  const mood = r.chance(0.15) ? 'interrogative' : r.chance(0.12) ? 'imperative' : r.chance(0.12) ? 'condition' : r.chance(0.12) ? 'coordination' : 'none';
  if (mood === 'interrogative') p.interrogative = true;
  if (mood === 'imperative') {
    // The addressee: the builder synthesises the subject pronoun from the person, and offers no
    // other subject under a command.
    p.imperative = true;
    p.subject = r.chance(0.25)
      ? { concept: 'FIRST_PERSON', number: 'plural' }
      : { concept: 'SECOND_PERSON', number: r.chance(0.3) ? 'plural' : 'singular' };
    if (r.chance(0.3)) p.imperativeRegister = 'instruction';
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
