import type { ConceptForms, ResolvedNounElement } from '../../types.js';
import { alarmCry } from '../../functions/alarmCry.js';
import { groupAgreement } from './groupAgreement.js';

/**
 * A163. The direct object of `verb` with every alarm it cries stripped of its determiner. The alarm a
 * cry raises is the shout itself, "Wolf!", with no determiner slot (see `alarmCry`), so the one the
 * plan carries is dropped here, once, for every engine: English spells the phrase bare ("cried wolf"),
 * Italian and French fuse its definite article into the frame ("gridò al lupo", "cria au loup"), and
 * the languages with no frame of their own keep the literal definite object ("rief den Wolf"). The UI
 * withdraws the control for the same reason, so a plan saved before then renders as a new one would.
 *
 * Applied after resolution, as the measure manner adverbial's bare article is, because the alarm is
 * only known once both lexemes are looked up. The group's agreement is resolved again from the new
 * conjuncts, since a `no` conjunct marks the whole group negative (`groupAgreement`) and an alarm has
 * no negation left to give it.
 */
export function withAlarmCry(
  directObject: ResolvedNounElement,
  verb: ConceptForms | undefined,
  language: string,
): ResolvedNounElement {
  if (!verb) return directObject;
  const conjuncts = directObject.conjuncts.map((np) => alarmCry(verb, np) ?? np);
  if (conjuncts.every((np, i) => np === directObject.conjuncts[i])) return directObject;
  return {
    ...directObject,
    conjuncts,
    agreement: directObject.conjunction && conjuncts.length > 1
      ? groupAgreement(conjuncts, directObject.conjunction, language)
      : conjuncts[0].head.forms,
  };
}
