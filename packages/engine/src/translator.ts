import type { ComplementType, LexicalEntry, NounPhrase, PhrasePlan, Translation } from '@signi/shared';
import type { LanguageEngine, ResolvedPhrase, ResolvedComplement, ResolvedNounPhrase, ConceptForms } from './types.js';
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

function resolve(conceptId: string, language: string, lookup: LexiconLookup): ConceptForms {
  const entry = lookup(conceptId, language);
  return { conceptId, forms: entry ? { ...entry.forms } : {} };
}

function applyNounGender(forms: Record<string, string>, gender?: 'masc' | 'fem') {
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
    if (number === 'plural') {
      if (head.forms['plural']) head.forms['base'] = head.forms['plural'];
    } else if (head.forms['person'] === '3') {
      const gf = head.forms[`singular_${gender}`];
      if (gf) head.forms['base'] = gf;
      head.forms['gender'] = gender;
    }
    // 1st / 2nd person singular: base is already the correct form
  } else {
    // Noun: apply number then gender
    const num = np.number ?? 'singular';
    head.forms['number'] = (num === 'plural' && !head.forms['plural']) ? 'singular' : num;
    applyNounGender(head.forms, np.gender);
  }
  return {
    head,
    adjectives: (np.adjectives ?? []).map((id) => resolve(id, language, lookup)),
  };
}

export function translate(plan: PhrasePlan, lookup: LexiconLookup): Translation[] {
  return engines.map((engine) => {
    const { verb, negative, modifier } = plan.verbPhrase;

    // Complement noun phrases (locative / direction / source / route). Each is a
    // noun phrase with any specifiers carried straight through as plain data.
    let complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined;
    if (plan.complements) {
      complements = {};
      for (const [type, value] of Object.entries(plan.complements)) {
        if (!value?.phrase?.concept) continue;
        complements[type as ComplementType] = {
          phrase: resolveNounPhrase(value.phrase, engine.language, lookup),
          specifiers: value.specifiers,
        };
      }
    }

    const resolved: ResolvedPhrase = {
      subject: resolveNounPhrase(plan.subject, engine.language, lookup),
      verbPhrase: {
        verb: resolve(verb, engine.language, lookup),
        negative,
        modifier: modifier ? resolve(modifier, engine.language, lookup) : undefined,
      },
      directObject: plan.directObject ? resolveNounPhrase(plan.directObject, engine.language, lookup) : undefined,
      indirectObject: plan.indirectObject ? resolveNounPhrase(plan.indirectObject, engine.language, lookup) : undefined,
      complements,
    };
    return {
      language: engine.language,
      text: engine.render(resolved),
    };
  });
}
