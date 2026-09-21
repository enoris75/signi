import { objectPronounForm } from '../../functions/objectPronounForm.js';

/**
 * A pronoun after the verb (the direct object, or the passive's by-phrase), read against the
 * clause's subject agreement `subjectForms`. A 1st- or 2nd-person pronoun with the subject's own
 * person and number is the subject itself, and English then says so with the reflexive (seeded as
 * `reflexive` / `reflexive_plural`): "I see **myself**", "we see **ourselves**", "see **yourself**"
 * (a command's subject is the addressee). Anything else takes the plain object form: a differing
 * person or number ("I see **us**"), and the 3rd person, where "he sees him" is two people and the
 * plan has no way to say "himself" (A177).
 */
export function objectPronounText(forms: Record<string, string>, subjectForms: Record<string, string>): string {
  const person = forms['person'];
  const number = forms['number'] ?? 'singular';
  const coreferent = (person === '1' || person === '2')
    && subjectForms['person'] === person
    && (subjectForms['number'] ?? 'singular') === number;
  const reflexive = number === 'plural' ? forms['reflexive_plural'] : forms['reflexive'];
  return (coreferent && reflexive) || objectPronounForm(forms);
}
