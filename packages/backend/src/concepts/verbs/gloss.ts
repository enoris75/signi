import type { Complement, ComplementType, Definiteness, PhrasePlan } from '@signi/shared';

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
export function infinitiveGloss(
  verb: string,
  parts?: string | GlossParts,
  number?: 'plural',
  adjectives?: string[],
): PhrasePlan {
  const p: GlossParts = typeof parts === 'string' ? { object: parts, number, adjectives } : (parts ?? {});
  return {
    subject: { concept: 'GENERIC_PERSON' },
    verbPhrase: { verb, ...(p.modifier ? { modifier: p.modifier } : {}) },
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
    ...(p.complements ? { complements: p.complements } : {}),
    infinitive: true,
  };
}
