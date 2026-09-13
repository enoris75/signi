import { defArticle } from './defArticle.js';

/** Portuguese "por" (through) + article: por+o=pelo, por+a=pela, … */
export function porPrep(forms: Record<string, string>, plural = false): string {
  const art = defArticle(forms, plural);
  return ({ o: 'pelo', a: 'pela', os: 'pelos', as: 'pelas' } as Record<string, string>)[art] ?? `por ${art}`;
}
