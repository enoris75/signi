import type { ImperativeRegister, VerbPhrase } from '@signi/shared';
import type { ConceptForms, Mood, ResolvedVerbPhrase } from '../../types.js';
import { PASSIVE_AUXILIARY, PASSIVIZABLE } from '../translator.consts.js';
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
 *  A missing sense concept leaves the verb as it is, so a language that seeds none is unaffected.
 *
 *  Under a **passive** the sense is still selected by the *agent* — the one who acts is the one the
 *  verb is chosen for, whichever slot the clause puts it in — so `subjectForms` are the plan's own
 *  subject here, before `resolvePhrase` swaps the two around (A01).
 */
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
  const verb = sense && lookup(sense, language) ? resolve(sense, language, lookup) : given;
  const voice = resolveVoice(vp, verb, language, imperative, hasObject);
  return {
    verb,
    negative: vp.negative,
    tense: finiteSlotTaken ? 'present' : vp.tense,
    aspect: finiteSlotTaken ? 'neutral' : vp.aspect,
    ...(voice === 'passive'
      ? { voice, ...passiveAuxiliary(verb, language, lookup) }
      : {}),
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

/**
 * Whether this clause really is a passive, normalising every case that cannot be one back to active
 * — the same defensive normalisation the imperative already does for tense/aspect/modals. A half
 * passive (an auxiliary with nothing to promote into the subject slot) is worse than none:
 *
 *  - an **intransitive** verb has no patient at all;
 *  - neither does a clause with **no direct object** to promote, whatever the verb could take;
 *  - a verb whose object needs a **preposition** in this language ("clicca sul pulsante", A139) has
 *    no direct object *there*, so it passivizes in some of the seven and not in others;
 *  - an **imperative** is a command to the addressee to act, and it drops its subject, so there is
 *    nothing for the patient to be promoted over. (The infinitive citation does passivize — "to be
 *    eaten" is a perfectly good dictionary phrase.)
 */
function resolveVoice(
  vp: VerbPhrase,
  verb: ConceptForms,
  language: string,
  imperative: boolean,
  hasObject: boolean,
): 'active' | 'passive' {
  if (vp.voice !== 'passive' || imperative || !hasObject) return 'active';
  if (!PASSIVIZABLE.has(verb.forms['transitivity'] ?? '')) return 'active';
  if (verb.forms['object_prep']) return 'active';
  return 'passive';
}

/**
 * The auxiliary the passive conjugates in this language, resolved from the lexicon like any other
 * word (see `PASSIVE_AUXILIARY`). It takes over the finite slot, so it also takes over the one
 * concept-level property that decides how that slot inflects: `stative` belongs to the event being
 * spoken of, not to the auxiliary spelling it, so "the cat ate the food" passivizes to the
 * perfective "il cibo fu mangiato" and not to *essere*'s own imperfect "era" (A130).
 *
 * Japanese names no auxiliary, and gets none.
 */
function passiveAuxiliary(
  verb: ConceptForms,
  language: string,
  lookup: LexiconLookup,
): { passiveAux?: ConceptForms } {
  const auxId = PASSIVE_AUXILIARY[language];
  if (!auxId) return {};
  const aux = resolve(auxId, language, lookup);
  const { stative: _auxStative, ...forms } = aux.forms;
  return {
    passiveAux: {
      ...aux,
      forms: { ...forms, ...(verb.forms['stative'] ? { stative: verb.forms['stative'] } : {}) },
    },
  };
}
