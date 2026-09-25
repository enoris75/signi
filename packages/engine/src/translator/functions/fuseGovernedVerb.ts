import type { ConceptForms, ResolvedPhrase } from '../../types.js';

/** The Japanese verb surfaces the engine conjugates from, each with its `_reading` (`reading` for `base`). */
const JA_SURFACES = ['base', 'masu_present', 'te', 'nai', 'passive', 'potential'];

const readingKey = (key: string): string => (key === 'base' ? 'reading' : `${key}_reading`);

/**
 * German *weiter-*: the governed verb with the separable particle in front of its own, so it takes
 * the governed verb's conjugation, auxiliary and object — "läuft weiter", "ist weitergelaufen",
 * "frisst das Essen weiter".
 */
function particleVerb(governed: ConceptForms, particle: string): ConceptForms {
  const f = governed.forms;
  const own = f['particle'];
  return {
    conceptId: governed.conceptId,
    forms: {
      ...f,
      base: `${particle}${f['base'] ?? ''}`,
      particle: own ? `${particle} ${own}` : particle,
      ...(f['participle'] ? { participle: `${particle}${f['participle']}` } : {}),
    },
  };
}

/**
 * Japanese 〜続ける: the governed verb's continuative stem (its ます form without ます) compounded onto
 * the governor, which then conjugates as the compound — 走り続けます, 走り続けました, 行動し続けません.
 * `undefined` when the governed verb has no ます form to take the stem from.
 */
function stemCompound(governor: ConceptForms, governed: ConceptForms): ConceptForms | undefined {
  const masu = governed.forms['masu_present'];
  if (!masu?.endsWith('ます')) return undefined;
  const stem = masu.slice(0, -2);
  const stemReading = governed.forms['masu_present_reading']?.slice(0, -2) ?? stem;
  const forms: Record<string, string> = { ...governor.forms };
  for (const key of JA_SURFACES) {
    const surface = governor.forms[key];
    if (!surface) continue;
    forms[key] = `${stem}${surface}`;
    forms[readingKey(key)] = `${stemReading}${governor.forms[readingKey(key)] ?? surface}`;
  }
  return { conceptId: governor.conceptId, forms };
}

/**
 * A clause whose verb says what it says **by fusing with the verb it governs**, rather than by
 * governing an infinitive (P09-E42): German *weitermachen* is the governed verb with the particle
 * *weiter* ("der Kater läuft weiter", never "*macht weiter zu laufen"), and Japanese 続ける compounds
 * onto the governed verb's stem (走り続ける, never 走ることを続ける). The governing lexeme names it —
 * `complement_particle` in German, `ja_complement: 'stem'` in Japanese — and the clause becomes one:
 * the governing clause's subject, tense, aspect, negation and modals, over the fused verb with the
 * governed clause's object and complements.
 *
 * Only a subject-controlled infinitive that is not negated of its own fuses: "continues not to run"
 * has two verbs to negate apart, so it keeps the governed clause as it was, under the lexeme's word.
 * The one exception is a German governor that names an adverb for it (`negative_complement_adverb`):
 * *weiter* cannot ride a negated verb ("läuft nicht weiter" denies the continuing), so the aspect
 * becomes that adverb beside the governed verb, which takes the negation — "der Kater läuft
 * weiterhin nicht" (A315, see `negatedContinuation`).
 * Unchanged in every other language and for every other governor.
 */
export function fuseGovernedVerb(phrase: ResolvedPhrase, language: string): ResolvedPhrase {
  const governed = phrase.infinitiveComplement;
  const governor = phrase.verbPhrase?.verb;
  if (!governed?.verbPhrase || !governor || governed.control === 'object') return phrase;
  if (governed.verbPhrase.negative) return language === 'de' || language === 'gsw' ? negatedContinuation(phrase) : phrase;
  const particle = language === 'de' || language === 'gsw' ? governor.forms['complement_particle'] : undefined;
  const stem = language === 'ja' && governor.forms['ja_complement'] === 'stem';
  // A copular complement has no verb stem to compound on: Japanese compounds on the copula's own ある,
  // with the predicate before it in its connective form — 幸せであり続けます, 大きくあり続けます (A315).
  // That form is the Japanese engine's to say, so the governor goes over marked for it, beside the
  // predicative (see `copularContinuation`). One predicate only: a coordinated one keeps the clause.
  const predicative = governed.complements?.['predicative'];
  const copularStem = stem && governed.verbPhrase.verb.forms['copula'] === '1' && predicative?.phrase.conjuncts.length === 1;
  const verb = particle
    ? particleVerb(governed.verbPhrase.verb, particle)
    : copularStem
      ? { conceptId: governor.conceptId, forms: { ...governor.forms, copular_compound: '1' } }
      : stem
        ? stemCompound(governor, governed.verbPhrase.verb)
        : undefined;
  if (!verb) return phrase;
  const complements = { ...phrase.complements, ...governed.complements };
  // A copula has no particle to take: German says the particle as an adverb beside it instead, "die
  // Katze ist weiter glücklich", never "*ist glücklich weiter".
  const copula = !!particle && governed.verbPhrase.verb.forms['copula'] === '1';
  const modifier = phrase.verbPhrase!.modifier ?? governed.verbPhrase.modifier
    ?? (copula ? { conceptId: governor.conceptId, forms: { base: particle! } } : undefined);
  return {
    ...phrase,
    verbPhrase: { ...phrase.verbPhrase!, verb: copula ? governed.verbPhrase.verb : verb, ...(modifier ? { modifier } : {}) },
    directObject: governed.directObject ?? phrase.directObject,
    complements: Object.keys(complements).length ? complements : undefined,
    infinitiveComplement: governed.infinitiveComplement,
  };
}

/**
 * A German governor's negated complement said as its adverb over the governed verb, negated (see
 * `fuseGovernedVerb`): "der Kater läuft weiterhin nicht", "frisst das Essen weiterhin nicht". Only
 * where the adverb slot is free and the governing clause is not negated too — "does not continue not
 * running" has two negations to keep apart — so any other clause keeps the linked infinitive.
 */
function negatedContinuation(phrase: ResolvedPhrase): ResolvedPhrase {
  const governed = phrase.infinitiveComplement!;
  const vp = phrase.verbPhrase!;
  const adverb = vp.verb.forms['negative_complement_adverb'];
  if (!adverb || vp.negative || vp.modifier || governed.verbPhrase!.modifier) return phrase;
  const complements = { ...phrase.complements, ...governed.complements };
  return {
    ...phrase,
    // The adverb scopes over the negation, so it stands ahead of the "nicht" (`negative_slot`), as
    // "noch nicht" does: "läuft weiterhin nicht", "frisst das Essen weiterhin nicht".
    verbPhrase: {
      ...vp, verb: governed.verbPhrase!.verb, negative: true,
      modifier: { conceptId: vp.verb.conceptId, forms: { base: adverb, negative_slot: 'pre-negator' } },
    },
    directObject: governed.directObject ?? phrase.directObject,
    complements: Object.keys(complements).length ? complements : undefined,
    infinitiveComplement: governed.infinitiveComplement,
  };
}
