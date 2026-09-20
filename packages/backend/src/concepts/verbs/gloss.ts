import type { Complement, ComplementType, Definiteness, Degree, InfinitiveComplement, PhrasePlan } from '@signi/shared';

/**
 * The parts of a verb's gloss past its genus, for the glosses a bare object cannot carry alone: an
 * object under a determiner, the instrument or recipient that distinguishes the verb, an adverb.
 */
export interface GlossParts {
  object?: string;
  /** A count-noun object reads bare only in the plural ("to create objects"). */
  number?: 'plural';
  /** Adjectives narrowing the object ("to understand written words"). */
  adjectives?: string[];
  /** The object's determiner: bare unless the verb acts on one of a kind ("to press a button"). */
  definiteness?: Definiteness;
  /**
   * Complements carrying the differentia where an object does not: the instrument ("to write with a
   * keyboard"), the recipient ("to transfer objects to a person"), the goal or the source.
   */
  complements?: Partial<Record<ComplementType, Complement>>;
  /** An adverb on the genus verb ("to strike repeatedly"). */
  modifier?: string;
  /** Negates the clause: HIDE is causing an object **not** to be visible. */
  negative?: boolean;
  /** A predicate adjective for a copular genus: BE + ABLE, "to be able". Shorthand for `complements.predicative`. */
  predicate?: string;
  /** The predicate adjective's degree: BECOME + SMALL at `more`, "to become smaller". */
  predicateDegree?: Degree;
  /**
   * The infinitive the genus governs (PhrasePlan.infinitiveComplement): a verb id, or a whole clause
   * for one with an object of its own. "to desire **to act**"; with a predicate adjective in
   * `complements`, the adjective governs it: "to be able **to act**".
   */
  infinitive?: string | InfinitiveComplement;
}

/** The causee of a causative gloss: the thing or person that comes to act (see `causativeGloss`). */
export type GlossCausee = Pick<GlossParts, 'number' | 'adjectives' | 'definiteness'> & { object: string };

/** What the causee comes to do: a genus verb plus the same parts any gloss clause takes. */
export type GlossClause = GlossParts & { verb: string };

/** The verb every causative gloss is built on — "to cause", `causative` in every lexeme. */
const CAUSATIVE_VERB = 'CAUSE_VERB';

// The clause a gloss renders: its verb (with any adverb), its object under the determiner the gloss
// asks for, its complements — a predicate adjective among them — and any infinitive it governs.
// Shared by the citation `infinitiveGloss` builds and by the clause a causative gloss puts under it,
// which are the same clause in two positions.
function glossClause(verb: string, p: GlossParts): InfinitiveComplement {
  const predicative: Partial<Record<ComplementType, Complement>> = p.predicate
    ? { predicative: { phrase: { concept: p.predicate, ...(p.predicateDegree ? { headDegree: p.predicateDegree } : {}) } } }
    : {};
  return {
    verbPhrase: { verb, ...(p.modifier ? { modifier: p.modifier } : {}), ...(p.negative ? { negative: true } : {}) },
    ...(p.object
      ? {
          directObject: {
            concept: p.object,
            definiteness: p.definiteness ?? 'bare',
            ...(p.number ? { number: p.number } : {}),
            ...(p.adjectives?.length ? { adjectives: p.adjectives } : {}),
          },
        }
      : {}),
    ...(p.complements || p.predicate ? { complements: { ...p.complements, ...predicative } } : {}),
    ...(p.infinitive
      ? { infinitiveComplement: typeof p.infinitive === 'string' ? { verbPhrase: { verb: p.infinitive } } : p.infinitive }
      : {}),
  };
}

// A verb's dictionary definition as an infinitive citation: a subject-less, tenseless plan on the
// infinitive render mode (see PhrasePlan.infinitive) whose verb is the genus and whose optional
// object is the differentia, rendered bare — infinitiveGloss('CONSUME', 'FOOD') → en "to consume
// food", it "consumare cibo", de "Nahrung konsumieren", ja "食べ物を摂取する". The GENERIC_PERSON
// subject is a throwaway the infinitive drops from every surface. Set as a verb's `definition` to
// localize its picker tooltip, the same way glossOf/whoGloss do for nouns. A mass-noun object stays
// singular ("food"); pass 'plural' for a count noun, which reads bare only in the plural —
// infinitiveGloss('CREATE', 'OBJECT_THING', 'plural') → "to create objects", not "to create object".
// Adjectives on the object narrow the differentia further —
// infinitiveGloss('UNDERSTAND', 'WORD', 'plural', ['WRITTEN']) → "to understand written words".
//
// A gloss whose differentia is more than that takes its parts as one object instead —
// infinitiveGloss('ACQUIRE', { object: 'OBJECT_THING', number: 'plural', complements: { instrumental:
// … MONEY } }) → "to acquire objects with money"; infinitiveGloss('STRIKE', { modifier: 'REPEATEDLY' })
// → "to strike repeatedly".
//
// A gloss that governs a second verb names it as `infinitive` — infinitiveGloss('DESIRE', { infinitive:
// 'ACT' }) → "to desire to act", it "desiderare agire", de "wünschen, zu handeln"; under BE with a
// predicate adjective the adjective governs it — infinitiveGloss('BE', { predicate: 'ABLE', infinitive:
// 'ACT' }) → "to be able to act", it "essere capace di agire", ja "行動することが可能である".
export function infinitiveGloss(
  verb: string,
  parts?: string | GlossParts,
  number?: 'plural',
  adjectives?: string[],
): PhrasePlan {
  const p: GlossParts = typeof parts === 'string' ? { object: parts, number, adjectives } : (parts ?? {});
  return {
    subject: { concept: 'GENERIC_PERSON' },
    ...glossClause(verb, p),
    infinitive: true,
  };
}

// A CAUSATIVE gloss: the verb that makes something happen, its causee, and what the causee comes to
// do — "to cause a person to see objects", "to cause an object to become smaller" (localization
// C08). The caused clause is an **object-controlled** infinitive complement (see InfinitiveControl):
// its unspoken subject is the causee, not the causer, which is what distinguishes it from the
// subject control the modals' glosses use.
//
//   causativeGloss({ object: 'PERSON', definiteness: 'indefinite' },
//                  { verb: 'SEE', object: 'OBJECT_THING', number: 'plural' })
//     → en "to cause a person to see objects", it "indurre una persona a vedere oggetti",
//       de "eine Person veranlassen, Gegenstände zu sehen", ja 人が物体を見るようにする
//   causativeGloss({ object: 'OBJECT_THING', definiteness: 'indefinite' },
//                  { verb: 'BE', predicate: 'HIDDEN' })
//     → en "to cause an object to be hidden", es "inducir un objeto a estar oculto"
//
// The causee takes the same parts an object takes anywhere (determiner, number, adjectives) and the
// caused clause the same parts any gloss clause takes, a predicate adjective and its degree among
// them ({ verb: 'BECOME', predicate: 'SMALL', predicateDegree: 'more' } → "to become smaller").
export function causativeGloss(causee: GlossCausee, clause: GlossClause): PhrasePlan {
  return infinitiveGloss(CAUSATIVE_VERB, {
    ...causee,
    infinitive: { ...glossClause(clause.verb, clause), control: 'object' },
  });
}
