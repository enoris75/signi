import type { ImperativeRegister, InfinitiveComplement, NounElement, PhrasePlan } from '@signi/shared';
import type { Mood, ResolvedPhrase } from '../../types.js';
import type { LexiconLookup } from '../translator.types.js';
import { coordConjunction } from './coordConjunction.js';
import { elideSubjectComplement } from './elideSubjectComplement.js';
import { resolveComplements } from './resolveComplements.js';
import { resolveNounElement } from './resolveNounElement.js';
import { resolveVerbPhrase } from './resolveVerbPhrase.js';

/** Whether `plan`'s infinitive complement is controlled by its direct object (see InfinitiveControl). */
function objectControlled(plan: PhrasePlan): boolean {
  return plan.infinitiveComplement?.control === 'object' && !!plan.directObject;
}

/**
 * An infinitive complement resolved as a clause of its own in the citation mood, its subject filled
 * by the slot of `plan` that controls it (see InfinitiveControl), and marked as object-controlled
 * for the engines that place or agree it differently.
 */
function resolveInfinitiveComplement(
  plan: PhrasePlan & { infinitiveComplement: InfinitiveComplement },
  language: string,
  lookup: LexiconLookup,
): ResolvedPhrase {
  const { control: _control, ...clause } = plan.infinitiveComplement;
  const byObject = objectControlled(plan);
  const subject: NounElement = byObject ? plan.directObject! : plan.subject;
  return {
    ...resolvePhrase({ ...clause, subject }, language, lookup, 'infinitive'),
    ...(byObject ? { control: 'object' as const } : {}),
  };
}

/**
 * Resolve one plan for one language. `mood` is threaded onto the verb phrase — set for the two
 * halves of a conditional (main = 'conditional', condition = 'subjunctive'), for a command
 * ('imperative'), and left undefined for a plain (indicative) sentence. `register` is the
 * addressee register a coordinated command inherits from its first clause; at the top level it
 * is absent and the plan's own `imperativeRegister` applies. The condition and the coordinated
 * clause are resolved recursively.
 */
export function resolvePhrase(
  plan: PhrasePlan,
  language: string,
  lookup: LexiconLookup,
  mood?: Mood,
  register?: ImperativeRegister,
  // A top-level citation phrase (a verb's dictionary form). Its subject is a throwaway the plan
  // carries only to satisfy resolution and never renders, so it must not select a `subject_sense`
  // either: the German citation of EAT is "essen", whoever the plan names (A157). An infinitive
  // COMPLEMENT is the opposite case — its subject is the governing clause's, by subject control, so
  // it does select one ("der Hund wünscht, das Essen zu fressen"), and the flag stops here.
  citation = false,
): ResolvedPhrase {
  const imperative = mood === 'imperative';
  const impRegister = imperative ? (register ?? plan.imperativeRegister) : undefined;
  // A yes/no question is a statement's clause with another force, so it holds only where the mood is
  // indicative: a condition, a command or a citation keeps its own and drops the flag.
  const question = !!plan.interrogative && mood === undefined;
  const subject = resolveNounElement(plan.subject, language, lookup);
  // A verbless period (bare noun phrase) has no verb phrase to resolve; the engines
  // render just the subject when it is absent. Resolved before the rest, because a complement
  // reads the verb's lexeme for the word it links an object predicative with.
  const verbPhrase = plan.verbPhrase
    ? {
        // The subject's forms select a `subject_sense` where the lexeme names one (A157); a
        // coordination is read off its first conjunct, as agreement is.
        ...resolveVerbPhrase(
          plan.verbPhrase, language, lookup, mood, impRegister, !!plan.directObject,
          citation ? undefined : subject.agreement,
        ),
        ...(question ? { interrogative: true } : {}),
      }
    : undefined;
  const resolved: ResolvedPhrase = {
    subject,
    verbPhrase,
    directObject: plan.directObject ? resolveNounElement(plan.directObject, language, lookup) : undefined,
    complements: resolveComplements(plan.complements, language, lookup, verbPhrase?.verb.forms),
    // An infinitive complement is a clause of its own in the infinitive mood. Its subject is the
    // slot of this clause that controls it — this clause's own subject by default ("the cat desires
    // to eat" — the cat eats), or its direct object under a causative ("to cause a person to see
    // objects" — the person sees). The infinitive never speaks its subject, but a predicate
    // adjective inside it agrees with it, and Japanese marks an object controller with が inside
    // the clause. Object control with no object to control it falls back to the subject, so the
    // clause always has one to resolve. It may govern one in turn.
    infinitiveComplement: plan.infinitiveComplement
      ? resolveInfinitiveComplement({ ...plan, infinitiveComplement: plan.infinitiveComplement }, language, lookup)
      : undefined,
    // A clause of purpose is a clause of its own in the citation mood, its unspoken subject always
    // this clause's own — the one who clicks is the one who changes — so it needs no control. It
    // hangs off the predicate, so a verbless period has nothing to do it for and drops it.
    purpose: plan.purpose && plan.verbPhrase
      ? resolvePhrase({ ...plan.purpose, subject: plan.subject }, language, lookup, 'infinitive')
      : undefined,
    // A hypothetical condition: this plan becomes the main clause (conditional mood) and its
    // `condition` the protasis (subjunctive mood). Conditions don't nest.
    condition: plan.condition
      ? resolvePhrase(plan.condition, language, lookup, 'subjunctive')
      : undefined,
    // A coordinated second clause; the conjunction word is chosen per-engine at render time.
    // Coordination is a symmetric join, so the second clause carries the same illocutionary
    // force as the first: under a command it is resolved in the imperative mood too, with the
    // first clause's register and addressee (its own subject is dropped from the surface, so
    // taking the first's keeps the pair addressed to one and the same person). A question's second
    // clause is a question too, and a statement's a statement, whatever its own plan says. A
    // conditional main clause coordinates a plain indicative clause. Coordination doesn't nest.
    coordination: plan.coordination
      ? {
          conjunction: coordConjunction(plan.coordination.conjunction, imperative),
          clause: resolvePhrase(
            imperative
              ? { ...plan.coordination.clause, subject: plan.subject }
              : { ...plan.coordination.clause, interrogative: question },
            language,
            lookup,
            imperative ? 'imperative' : undefined,
            impRegister,
          ),
        }
      : undefined,
  };
  // A bare copula elides the subject complement of the clause before it (A121). The main clause looks
  // back to its protasis first, so a coordinated clause can then look back to a main clause that
  // itself elides one.
  const main = resolved.condition ? elideSubjectComplement(resolved, resolved.condition) : resolved;
  return main.coordination
    ? { ...main, coordination: { ...main.coordination, clause: elideSubjectComplement(main.coordination.clause, main) } }
    : main;
}
