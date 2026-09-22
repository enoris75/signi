import type { ResolvedModal, ResolvedPhrase } from '../types.js';

/**
 * A clause whose verb is a **modal** governing an infinitive complement, as the modal chain it is
 * (A222). A modal governs a verb group rather than heading one (`VerbPhrase.modals`), but a
 * definition can still name one as its genus — "to want to have objects" is WILL governing the
 * complement HAVE objects, since the citation mood drops `modals`. That clause is the complement's
 * clause under the modal: the modal (with its own adverb) is prepended to the complement's modals,
 * and the result keeps the governing clause's subject, tense, mood, register, negation and question,
 * its condition, coordination and purpose, and the complement's verb, object, complements, voice
 * and nested infinitive. A complement a modal governs in turn folds again: "to want to be able to
 * act" is one chain, WILL CAN ACT.
 *
 * Every other clause comes back as it is: a lexical verb, a complement its governor's object controls
 * (a causative), a modal with an object of its own, and a negated complement — "to want not to act"
 * cannot be one chain, whose negation is the finite modal's.
 *
 * Only the engines whose modal is not a verb taking an infinitive complement ask: Japanese suffixes
 * its modals (行動したい, not 行動することをたい), German stacks them in the verb cluster (handeln
 * wollen, not wollen, zu handeln), and English cites a defective CAN or MUST by its `nonfinite` (to be
 * able to act, not to can to act). The Romance modals are such verbs, and render the clause as it is.
 */
export function foldModalGovernor(phrase: ResolvedPhrase): ResolvedPhrase {
  const governor = phrase.verbPhrase;
  const inner = phrase.infinitiveComplement;
  if (governor?.verb.forms['modal'] !== '1' || !inner?.verbPhrase || inner.control === 'object'
    || inner.verbPhrase.negative || phrase.directObject) return phrase;
  const { tense, mood, register, negative, interrogative } = governor;
  const link: ResolvedModal = { verb: governor.verb, ...(governor.modifier ? { modifier: governor.modifier } : {}) };
  const complements = { ...phrase.complements, ...inner.complements };
  return foldModalGovernor({
    subject: phrase.subject,
    verbPhrase: {
      ...inner.verbPhrase,
      tense, mood, register, negative, interrogative,
      modals: [...governor.modals, link, ...inner.verbPhrase.modals],
    },
    ...(inner.directObject ? { directObject: inner.directObject } : {}),
    ...(inner.agent ? { agent: inner.agent } : {}),
    ...(Object.keys(complements).length > 0 ? { complements } : {}),
    ...(inner.infinitiveComplement ? { infinitiveComplement: inner.infinitiveComplement } : {}),
    ...(phrase.purpose ? { purpose: phrase.purpose } : {}),
    ...(phrase.condition ? { condition: phrase.condition } : {}),
    ...(phrase.coordination ? { coordination: phrase.coordination } : {}),
    ...(phrase.control ? { control: phrase.control } : {}),
  });
}
