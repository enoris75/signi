import type { ImperativeRegister, VerbPhrase } from '@signi/shared';
import type { Mood, ResolvedVerbPhrase } from '../../types.js';
import type { LexiconLookup } from '../translator.types.js';
import { resolve } from './resolve.js';

/** Resolve a verb phrase (the shared predicate head of a plan or a relative clause). Only
 *  called when a verb phrase is present — a verbless period skips it (see translate).
 *  `hasObject` is whether the verb takes a direct object, its own or a relative's gap: a verb whose
 *  lexeme names a sense for an object (`object_sense`) resolves to that sense then — KNOW is "sapere"
 *  with no object but "conoscere" with one (A131). The user's concept stays KNOW. */
export function resolveVerbPhrase(
  vp: VerbPhrase,
  language: string,
  lookup: LexiconLookup,
  mood?: Mood,
  register?: ImperativeRegister,
  hasObject = false,
): ResolvedVerbPhrase {
  // An imperative or an infinitive is a mood that occupies the finite/mood slot: it is always
  // present-tense, neutral-aspect and modal-free. The UI already enforces this, but normalise
  // defensively so a stale or hand-built plan can't feed a tensed/aspectual/modal one to the
  // engines. Only the imperative carries a register (it is a speech act); the infinitive does not.
  const imperative = mood === 'imperative';
  const finiteSlotTaken = imperative || mood === 'infinitive';
  const given = resolve(vp.verb, language, lookup);
  const sense = hasObject ? given.forms['object_sense'] : undefined;
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
