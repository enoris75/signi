import type { ImperativeRegister, VerbPhrase } from '@signi/shared';
import type { Mood, ResolvedVerbPhrase } from '../../types.js';
import type { LexiconLookup } from '../translator.types.js';
import { resolve } from './resolve.js';

/** Resolve a verb phrase (the shared predicate head of a plan or a relative clause). Only
 *  called when a verb phrase is present — a verbless period skips it (see translate).
 *
 *  Two of the verb's arguments can select a lexical sense in its place, and the user's concept stays
 *  what it was either way:
 *  - `hasObject` is whether the verb takes a direct object, its own or a relative's gap: a lexeme
 *    naming an `object_sense` resolves to it then — KNOW is "sapere" with no object but "conoscere"
 *    with one (A131).
 *  - `subjectForms` are the subject's, or the head noun's where a relative gaps the subject: a
 *    lexeme naming a `subject_sense` resolves to it when the subject is an animal — German EAT is
 *    "essen" of a person but "fressen" of an animal, and either word of the other is wrong (A157).
 *  A missing sense concept leaves the verb as it is, so a language that seeds none is unaffected. */
export function resolveVerbPhrase(
  vp: VerbPhrase,
  language: string,
  lookup: LexiconLookup,
  mood?: Mood,
  register?: ImperativeRegister,
  hasObject = false,
  subjectForms?: Record<string, string>,
): ResolvedVerbPhrase {
  // An imperative or an infinitive is a mood that occupies the finite/mood slot: it is always
  // present-tense, neutral-aspect and modal-free. The UI already enforces this, but normalise
  // defensively so a stale or hand-built plan can't feed a tensed/aspectual/modal one to the
  // engines. Only the imperative carries a register (it is a speech act); the infinitive does not.
  const imperative = mood === 'imperative';
  const finiteSlotTaken = imperative || mood === 'infinitive';
  const given = resolve(vp.verb, language, lookup);
  // A pronoun subject carries no animacy of its own ("er isst"), so it keeps the person's verb.
  const sense = (subjectForms?.['animal'] === '1' ? given.forms['subject_sense'] : undefined)
    ?? (hasObject ? given.forms['object_sense'] : undefined);
  return {
    verb: sense && lookup(sense, language) ? resolve(sense, language, lookup) : given,
    negative: vp.negative,
    tense: finiteSlotTaken ? 'present' : vp.tense,
    aspect: finiteSlotTaken ? 'neutral' : vp.aspect,
    mood,
    register: imperative ? (register ?? 'request') : undefined,
    modifier: vp.modifier ? resolve(vp.modifier, language, lookup) : undefined,
    // Modal verbs governing the predicate, outermost first. Each is a verb concept, so it
    // resolves to its own conjugation table plus the `nonfinite` / `link` joinery keys; each may
    // also carry its own adverb, resolved alongside.
    modals: finiteSlotTaken
      ? []
      : (vp.modals ?? []).map((ref) => {
          // A bare string is shorthand for a modal with no adverb of its own.
          const m = typeof ref === 'string' ? { verb: ref } : ref;
          return {
            verb: resolve(m.verb, language, lookup),
            modifier: m.modifier ? resolve(m.modifier, language, lookup) : undefined,
          };
        }),
  };
}
