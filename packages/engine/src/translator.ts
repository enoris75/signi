import type { ComplementType, LexicalEntry, NounPhrase, PhrasePlan, RelativeClause, Translation } from '@signi/shared';
import type { LanguageEngine, ResolvedPhrase, ResolvedComplement, ResolvedNounPhrase, ResolvedRelativeClause, ResolvedVerbPhrase, ConceptForms } from './types.js';
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
  return {
    head,
    adjectives: (np.adjectives ?? []).map((id) => resolve(id, language, lookup)),
    // Attributive nouns ("sail boat"). Carry the relation through so each engine can
    // pick its linking preposition (Romance) or ignore it (en/de/ja neutralise).
    nounModifiers: (np.nounModifiers ?? []).map((m) => ({
      concept: resolve(m.concept, language, lookup),
      relation: m.relation,
    })),
    // A relative clause is the predicate half of a phrase whose subject is this
    // head. Recursing through resolveNounPhrase (its objects/complements are noun
    // phrases that may themselves carry `relative`) handles arbitrary nesting.
    relative: np.relative ? resolveRelativeClause(np.relative, language, lookup) : undefined,
    // A possessor is itself a noun phrase; recursing handles its own adjectives,
    // number/gender, and any nested possessor ("the cat's owner's book").
    possessor: np.possessor ? resolveNounPhrase(np.possessor, language, lookup) : undefined,
  };
}

/** Resolve a verb phrase (the shared predicate head of a plan or a relative clause). */
function resolveVerbPhrase(
  vp: PhrasePlan['verbPhrase'],
  language: string,
  lookup: LexiconLookup,
): ResolvedVerbPhrase {
  return {
    verb: resolve(vp.verb, language, lookup),
    negative: vp.negative,
    tense: vp.tense,
    modifier: vp.modifier ? resolve(vp.modifier, language, lookup) : undefined,
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
    out[type as ComplementType] = {
      phrase: resolveNounPhrase(value.phrase, language, lookup),
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

export function translate(plan: PhrasePlan, lookup: LexiconLookup): Translation[] {
  return engines.map((engine) => {
    const resolved: ResolvedPhrase = {
      subject: resolveNounPhrase(plan.subject, engine.language, lookup),
      verbPhrase: resolveVerbPhrase(plan.verbPhrase, engine.language, lookup),
      directObject: plan.directObject ? resolveNounPhrase(plan.directObject, engine.language, lookup) : undefined,
      indirectObject: plan.indirectObject ? resolveNounPhrase(plan.indirectObject, engine.language, lookup) : undefined,
      complements: resolveComplements(plan.complements, engine.language, lookup),
    };
    const ruby = engine.renderRuby?.(resolved);
    return {
      language: engine.language,
      text: engine.render(resolved),
      ...(ruby ? { ruby } : {}),
    };
  });
}
