import type { ResolvedNounElement } from '../types.js';
import { objectPronounForm } from './objectPronounForm.js';

/**
 * The plural object clitic standing for a coordinated object that holds a pronoun — the one French
 * resumes it with ("le chat NOUS voit, lui et moi") and Spanish doubles it with ("el gato NOS ve a
 * mí y a ti"). The group's agreement picks the person and gender, and the surface is read off a
 * pronoun conjunct of that person, in the plural. Empty when no conjunct carries that person.
 */
export function groupObjectClitic(el: ResolvedNounElement): string {
  const person = el.agreement['person'] ?? '3';
  const pronoun = el.conjuncts.find((np) => np.head.forms['person'] === person);
  if (!pronoun) return '';
  return objectPronounForm({ ...pronoun.head.forms, number: 'plural', gender: el.agreement['gender'] ?? 'masc' });
}
