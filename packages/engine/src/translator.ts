import type { LexicalEntry, PhrasePlan, Translation } from '@signi/shared';
import type { LanguageEngine, ResolvedPhrase, ConceptForms } from './types.js';
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

export function translate(plan: PhrasePlan, lookup: LexiconLookup): Translation[] {
  return engines.map((engine) => {
    const subjectForms = resolve(plan.subject, engine.language, lookup);
    if (subjectForms.forms['person']) {
      // Pronoun: synthesise the correct surface form as 'base' so all engines
      // can use their existing `forms['base']` / `forms['plural']` logic unchanged.
      const number = plan.subjectNumber ?? 'singular';
      const gender = plan.subjectGender ?? 'masc';
      subjectForms.forms['number'] = number;
      if (number === 'plural') {
        if (subjectForms.forms['plural']) subjectForms.forms['base'] = subjectForms.forms['plural'];
      } else if (subjectForms.forms['person'] === '3') {
        const gf = subjectForms.forms[`singular_${gender}`];
        if (gf) subjectForms.forms['base'] = gf;
        subjectForms.forms['gender'] = gender;
      }
      // 1st / 2nd person singular: base is already the correct form
    } else {
      // Noun subject: apply number then gender
      const sNum = plan.subjectNumber ?? 'singular';
      subjectForms.forms['number'] = (sNum === 'plural' && !subjectForms.forms['plural']) ? 'singular' : sNum;
      applyNounGender(subjectForms.forms, plan.subjectGender);
    }

    const directObjectForms = plan.directObject ? resolve(plan.directObject, engine.language, lookup) : undefined;
    if (directObjectForms) {
      const doNum = plan.directObjectNumber ?? 'singular';
      directObjectForms.forms['number'] = (doNum === 'plural' && !directObjectForms.forms['plural']) ? 'singular' : doNum;
      applyNounGender(directObjectForms.forms, plan.directObjectGender);
    }

    const indirectObjectForms = plan.indirectObject ? resolve(plan.indirectObject, engine.language, lookup) : undefined;
    if (indirectObjectForms) {
      const ioNum = plan.indirectObjectNumber ?? 'singular';
      indirectObjectForms.forms['number'] = (ioNum === 'plural' && !indirectObjectForms.forms['plural']) ? 'singular' : ioNum;
      applyNounGender(indirectObjectForms.forms, plan.indirectObjectGender);
    }

    const resolved: ResolvedPhrase = {
      subject: subjectForms,
      subjectAdjective: plan.subjectAdjective ? resolve(plan.subjectAdjective, engine.language, lookup) : undefined,
      verb: resolve(plan.verb, engine.language, lookup),
      verbNegative: plan.verbNegative,
      directObject: directObjectForms,
      indirectObject: indirectObjectForms,
      modifier: plan.modifier ? resolve(plan.modifier, engine.language, lookup) : undefined,
    };
    return {
      language: engine.language,
      text: engine.render(resolved),
    };
  });
}
