import { COMPLEMENT_RENDER_ORDER, type ComplementType, type PathSpecifier } from '@signi/shared';
import { adjString, pathSpecifier, type ConceptForms, type LanguageEngine, type ResolvedPhrase } from '../types.js';

const PREP: Record<ComplementType, string> = {
  locative: 'in',
  direction: 'to',
  source: 'from',
  route: 'through',
};

const PATH_PREP: Record<PathSpecifier, string> = {
  through: 'through',
  under: 'under',
  over: 'over',
  around: 'around',
  behind: 'behind',
  in_front_of: 'in front of',
};

function getArticle(forms: Record<string, string>): string {
  const count = forms['number'] ?? forms['count'] ?? 'singular';
  if (count === 'plural') return '';
  const base = forms['base'] ?? '';
  return /^[aeiou]/i.test(base) ? 'an' : 'a';
}

function conjugate(forms: Record<string, string>, subjectForms: Record<string, string>): string {
  const person = subjectForms['person'] ?? '3';
  const number = subjectForms['number'] ?? 'singular';
  const key = `${person}${number === 'plural' ? 'pl' : 'sg'}_present`;
  return forms[key] ?? forms['base'] ?? '';
}

function nounPhrase(forms: Record<string, string>, definite = false, adj?: string): string {
  const count = forms['number'] ?? forms['count'] ?? 'singular';
  const word = count === 'plural' ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const a = adj ? `${adj} ` : '';
  if (definite) return `the ${a}${word}`;
  return `${getArticle(forms)} ${a}${word}`;
}

function subjectPhrase(forms: Record<string, string>, adj?: string): string {
  if (forms['person']) {
    if (forms['number'] === 'plural' && forms['plural']) return forms['plural'];
    return forms['base'] ?? '';
  }
  return nounPhrase(forms, true, adj); // noun — definite article
}

function complementsPhrase(complements?: Partial<Record<ComplementType, ConceptForms>>): string {
  if (!complements) return '';
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      const prep = type === 'route' ? PATH_PREP[pathSpecifier(c)] : PREP[type];
      return `${prep} ${nounPhrase(c.forms, true)}`;
    })
    .filter(Boolean)
    .join(' ');
}

export const englishEngine: LanguageEngine = {
  language: 'en',
  render(phrase: ResolvedPhrase): string {
    const { subject, subjectAdjective, subjectAdjective2, verb, verbNegative,
      directObject, directObjectAdjective, directObjectAdjective2,
      indirectObject, indirectObjectAdjective, indirectObjectAdjective2, modifier } = phrase;

    const subjectText = subjectPhrase(subject.forms, adjString(subjectAdjective, subjectAdjective2));
    const directObjectText = directObject
      ? nounPhrase(directObject.forms, true, adjString(directObjectAdjective, directObjectAdjective2))
      : '';
    // Prepositional dative: "to the cat"
    const indirectObjectText = indirectObject
      ? `to ${nounPhrase(indirectObject.forms, true, adjString(indirectObjectAdjective, indirectObjectAdjective2))}`
      : '';
    const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
    const isFrequency = modifier?.forms['subtype'] === 'frequency';
    const complementsText = complementsPhrase(phrase.complements);

    const modifierIsNegative = modifier?.forms['polarity'] === 'negative';

    let parts: string[];
    if (verbNegative && !modifierIsNegative) {
      const person = subject.forms['person'] ?? '3';
      const number = subject.forms['number'] ?? 'singular';
      const aux = (person === '3' && number === 'singular') ? 'does not' : 'do not';
      const base = verb.forms['base'] ?? conjugate(verb.forms, subject.forms);
      // Frequency adverbs slot between aux and base: "do not always drink"
      const negVerb = isFrequency && modifierText ? `${aux} ${modifierText} ${base}` : `${aux} ${base}`;
      const trailingMod = isFrequency ? '' : modifierText;
      parts = [subjectText, negVerb, directObjectText, indirectObjectText, complementsText, trailingMod];
    } else {
      const verbText = conjugate(verb.forms, subject.forms);
      // Frequency adverbs (always, never) precede the main verb: S Adv V Obj
      // Manner adverbs (fast, slowly) follow the verb/object: S V Obj Adv
      const preVerb  = isFrequency ? modifierText : '';
      const postVerb = isFrequency ? '' : modifierText;
      parts = [subjectText, preVerb, verbText, directObjectText, indirectObjectText, complementsText, postVerb];
    }

    return parts.filter(Boolean).join(' ').trim();
  },
};
