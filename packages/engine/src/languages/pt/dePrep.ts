import { defArticle } from './defArticle.js';

/** Portuguese "de" (from) + article: de+o=do, de+a=da, de+os=dos, de+as=das. */
export function dePrep(forms: Record<string, string>, plural = false): string {
  const art = defArticle(forms, plural);
  return ({ o: 'do', a: 'da', os: 'dos', as: 'das' } as Record<string, string>)[art] ?? `de ${art}`;
}
