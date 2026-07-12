import type { ComplementType, LexicalEntry, NounPhrase, PhrasePlan, RelativeClause, Translation, VerbPhrase } from '@signi/shared';
import { defaultDefiniteness } from '@signi/shared';
import type { LanguageEngine, Mood, ResolvedPhrase, ResolvedComplement, ResolvedNounPhrase, ResolvedRelativeClause, ResolvedVerbPhrase, ConceptForms } from './types.js';
import { englishEngine } from './languages/en.js';
import { italianEngine } from './languages/it.js';
import { frenchEngine } from './languages/fr.js';
import { germanEngine } from './languages/de.js';
import { spanishEngine } from './languages/es.js';
import { japaneseEngine } from './languages/ja.js';
import { portugueseEngine } from './languages/pt.js';

export const engines: LanguageEngine[] = [
  englishEngine,
  italianEngine,
  frenchEngine,
  germanEngine,
  spanishEngine,
  japaneseEngine,
  portugueseEngine,
];

export type LexiconLookup = (conceptId: string, language: string) => LexicalEntry | undefined;

/** Determiners that are inherently plural, so they render the plural noun surface. */
const PLURAL_DETERMINERS = new Set(['some', 'many', 'few', 'all']);

function resolve(conceptId: string, language: string, lookup: LexiconLookup): ConceptForms {
  const entry = lookup(conceptId, language);
  return { conceptId, forms: entry ? { ...entry.forms } : {} };
}

function applyNounGender(forms: Record<string, string>, gender?: 'masc' | 'fem' | 'neut') {
  // Only nouns reach here, and nouns are masc/fem — 'neut' is a pronoun-only head gender.
  if (gender !== 'fem' || !forms['fem']) return;
  const plural = forms['number'] === 'plural';
  forms['base']   = plural ? (forms['fem_plural'] ?? forms['fem']) : forms['fem'];
  if (plural && forms['fem_plural']) forms['plural'] = forms['fem_plural'];
  forms['gender'] = 'fem';
}

/**
 * Resolve a noun phrase for one language: resolve the head noun/pronoun and apply
 * number/gender (synthesising the pronoun surface form, or applying noun gender),
 * then resolve each adjective. This folds together what used to be four duplicated
 * subject/object/complement blocks.
 */
function resolveNounPhrase(np: NounPhrase, language: string, lookup: LexiconLookup): ResolvedNounPhrase {
  const head = resolve(np.concept, language, lookup);
  if (head.forms['person']) {
    // Pronoun: synthesise the correct surface form as 'base' so all engines can use
    // their existing `forms['base']` / `forms['plural']` logic unchanged.
    const number = np.number ?? 'singular';
    const gender = np.gender ?? 'masc';
    head.forms['number'] = number;
    // Expose the referent's gender for every person: the 1st/2nd-person surface is
    // gender-invariant ("io", "tu"), but Romance participle/adjective agreement still
    // depends on it ("tu sei stato/stata"), so downstream engines need to read it.
    head.forms['gender'] = gender;
    // Keep the furigana reading (if any) in step with whichever surface we select.
    if (number === 'plural') {
      if (head.forms['plural']) head.forms['base'] = head.forms['plural'];
      if (head.forms['plural_reading']) head.forms['reading'] = head.forms['plural_reading'];
    } else if (head.forms['person'] === '3') {
      const gf = head.forms[`singular_${gender}`];
      if (gf) head.forms['base'] = gf;
      const gr = head.forms[`singular_${gender}_reading`];
      if (gr) head.forms['reading'] = gr;
    }
    // 1st / 2nd person singular: base is already the correct form
    // Disjunctive (tonic/oblique) surface for prepositional use ("because of me/her/them"),
    // synthesised for the same number/gender as `base`. Engines that place a pronoun after
    // a preposition read forms['disjunctive'] (falling back to base when absent, e.g. ja).
    const disj =
      number === 'plural'
        ? head.forms['disjunctive_plural'] ?? head.forms['disjunctive']
        : head.forms['person'] === '3'
          ? head.forms[`disjunctive_${gender}`] ?? head.forms['disjunctive']
          : head.forms['disjunctive'];
    if (disj) head.forms['disjunctive'] = disj;
  } else {
    // Noun: apply number then gender. Determiner choice is threaded like number/gender
    // so each engine reads it off forms. Some quantifiers are inherently plural ("many
    // boys", "all boys"), so they force the plural surface — but only when the noun has
    // one (mass nouns like "water" stay singular: "some water").
    const definiteness = np.definiteness ?? 'definite';
    // Mass nouns ("water") never pluralise, so quantifiers keep them singular ("much water").
    const forcesPlural = PLURAL_DETERMINERS.has(definiteness) && head.forms['uncountable'] !== '1';
    const num = forcesPlural ? 'plural' : (np.number ?? 'singular');
    head.forms['number'] = (num === 'plural' && !head.forms['plural']) ? 'singular' : num;
    applyNounGender(head.forms, np.gender);
    head.forms['definiteness'] = definiteness;
  }
  // An adjective head is the predicate adjective of a subject complement ("seems happy") —
  // the one head that carries a comparative degree of its own. Thread it onto the head's
  // forms exactly as an attributive adjective's is below, so `adjDegree` reads either.
  if (head.forms['role'] === 'adjective' && np.headDegree && np.headDegree !== 'positive') {
    head.forms['degree'] = np.headDegree;
  }
  return {
    head,
    adjectives: (np.adjectives ?? []).map((id, i) => {
      const cf = resolve(id, language, lookup);
      // Thread the per-adjective comparative degree onto its forms (like number/gender/
      // definiteness) so each engine reads it off `forms['degree']`. Omit the plain form.
      const deg = np.adjectiveDegrees?.[i];
      if (deg && deg !== 'positive') cf.forms['degree'] = deg;
      return cf;
    }),
    // Attributive nouns ("sail boat"). Carry the relation through so each engine can
    // pick its linking preposition (Romance) or ignore it (en/de/ja neutralise). Apply
    // the modifier's own number (so Romance engines can select its plural surface and
    // agree its adjectives) and resolve those adjectives against that gender/number.
    nounModifiers: (np.nounModifiers ?? []).map((m) => {
      const concept = resolve(m.concept, language, lookup);
      const number = m.number ?? 'singular';
      // Fall back to singular when the lexicon has no plural surface (so isPlural/surface
      // don't select a missing form) — same guard the head noun uses above.
      concept.forms['number'] = (number === 'plural' && !concept.forms['plural']) ? 'singular' : number;
      return {
        concept,
        relation: m.relation,
        adjectives: (m.adjectives ?? []).map((id) => resolve(id, language, lookup)),
      };
    }),
    // A relative clause is the predicate half of a phrase whose subject is this
    // head. Recursing through resolveNounPhrase (its objects/complements are noun
    // phrases that may themselves carry `relative`) handles arbitrary nesting.
    relative: np.relative ? resolveRelativeClause(np.relative, language, lookup) : undefined,
    // A possessor is itself a noun phrase; recursing handles its own adjectives,
    // number/gender, and any nested possessor ("the cat's owner's book").
    possessor: np.possessor ? resolveNounPhrase(np.possessor, language, lookup) : undefined,
  };
}

/** Resolve a verb phrase (the shared predicate head of a plan or a relative clause). Only
 *  called when a verb phrase is present — a verbless period skips it (see translate). */
function resolveVerbPhrase(
  vp: VerbPhrase,
  language: string,
  lookup: LexiconLookup,
  mood?: Mood,
): ResolvedVerbPhrase {
  // An imperative is a mood that occupies the finite/mood slot: it is always present-tense,
  // neutral-aspect and modal-free. The UI already enforces this, but normalise defensively so
  // a stale or hand-built plan can't feed a tensed/aspectual/modal imperative to the engines.
  const imperative = mood === 'imperative';
  return {
    verb: resolve(vp.verb, language, lookup),
    negative: vp.negative,
    tense: imperative ? 'present' : vp.tense,
    aspect: imperative ? 'neutral' : vp.aspect,
    mood,
    modifier: vp.modifier ? resolve(vp.modifier, language, lookup) : undefined,
    // Modal verbs governing the predicate, outermost first. Each is a verb concept, so it
    // resolves to its own conjugation table plus the `nonfinite` / `link` joinery keys.
    modals: imperative ? [] : (vp.modals ?? []).map((id) => resolve(id, language, lookup)),
  };
}

/**
 * Resolve the complement map (locative / direction / source / route). Each value is a
 * noun phrase with any specifiers carried straight through as plain data. Shared by the
 * top-level plan and by every relative clause.
 */
function resolveComplements(
  complements: PhrasePlan['complements'],
  language: string,
  lookup: LexiconLookup,
): Partial<Record<ComplementType, ResolvedComplement>> | undefined {
  if (!complements) return undefined;
  const out: Partial<Record<ComplementType, ResolvedComplement>> = {};
  for (const [type, value] of Object.entries(complements)) {
    if (!value?.phrase?.concept) continue;
    // The unchosen determiner depends on the slot: `predicative` defaults to indefinite,
    // every other complement to definite. See `defaultDefiniteness`.
    const phrase =
      value.phrase.definiteness === undefined
        ? { ...value.phrase, definiteness: defaultDefiniteness(type) }
        : value.phrase;
    out[type as ComplementType] = {
      phrase: resolveNounPhrase(phrase, language, lookup),
      specifiers: value.specifiers,
    };
  }
  return out;
}

/**
 * Resolve a relative clause: its verb phrase, optional objects, and complements. The
 * gap slot named by `headRole` (default 'subject') is filled by the head noun above,
 * so it is absent from the clause's own fields; a non-subject relative carries its own
 * `subject`, which the engines use for agreement.
 */
function resolveRelativeClause(
  clause: RelativeClause,
  language: string,
  lookup: LexiconLookup,
): ResolvedRelativeClause {
  return {
    headRole: clause.headRole ?? 'subject',
    subject: clause.subject ? resolveNounPhrase(clause.subject, language, lookup) : undefined,
    verbPhrase: resolveVerbPhrase(clause.verbPhrase, language, lookup),
    directObject: clause.directObject ? resolveNounPhrase(clause.directObject, language, lookup) : undefined,
    indirectObject: clause.indirectObject ? resolveNounPhrase(clause.indirectObject, language, lookup) : undefined,
    complements: resolveComplements(clause.complements, language, lookup),
  };
}

/**
 * Resolve one plan for one language. `mood` is threaded onto the verb phrase — set only for
 * the two halves of a conditional (main = 'conditional', condition = 'subjunctive'); a plain
 * sentence leaves it undefined (indicative). The condition clause is resolved recursively.
 */
function resolvePhrase(
  plan: PhrasePlan,
  language: string,
  lookup: LexiconLookup,
  mood?: Mood,
): ResolvedPhrase {
  return {
    subject: resolveNounPhrase(plan.subject, language, lookup),
    // A verbless period (bare noun phrase) has no verb phrase to resolve; the engines
    // render just the subject when it is absent.
    verbPhrase: plan.verbPhrase ? resolveVerbPhrase(plan.verbPhrase, language, lookup, mood) : undefined,
    directObject: plan.directObject ? resolveNounPhrase(plan.directObject, language, lookup) : undefined,
    indirectObject: plan.indirectObject ? resolveNounPhrase(plan.indirectObject, language, lookup) : undefined,
    complements: resolveComplements(plan.complements, language, lookup),
    // A hypothetical condition: this plan becomes the main clause (conditional mood) and its
    // `condition` the protasis (subjunctive mood). Conditions don't nest.
    condition: plan.condition
      ? resolvePhrase(plan.condition, language, lookup, 'subjunctive')
      : undefined,
    // A coordinated second clause: resolved as a plain indicative clause; the conjunction word
    // is chosen per-engine at render time. Coordination doesn't nest.
    coordination: plan.coordination
      ? {
          conjunction: plan.coordination.conjunction,
          clause: resolvePhrase(plan.coordination.clause, language, lookup),
        }
      : undefined,
  };
}

export function translate(plan: PhrasePlan, lookup: LexiconLookup): Translation[] {
  return engines.map((engine) => {
    // The top clause's mood: 'conditional' when a hypothetical condition is attached,
    // 'imperative' for a command, else plain indicative (undefined). These are mutually
    // exclusive (the UI never sets both), and only the top clause carries a command mood.
    const topMood: Mood | undefined = plan.condition ? 'conditional' : plan.imperative ? 'imperative' : undefined;
    const resolved = resolvePhrase(plan, engine.language, lookup, topMood);
    // Every rendered period closes with its language's full stop, appended here rather
    // than by each engine — the ruby segments must carry the same one, unread.
    const stop = engine.terminator ?? '.';
    const ruby = engine.renderRuby?.(resolved);
    return {
      language: engine.language,
      text: engine.render(resolved) + stop,
      ...(ruby ? { ruby: [...ruby, { t: stop }] } : {}),
    };
  });
}
