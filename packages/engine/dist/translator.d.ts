import type { LexicalEntry, PhrasePlan, Translation } from '@signi/shared';
import type { LanguageEngine } from './types.js';
export declare const engines: LanguageEngine[];
export type LexiconLookup = (conceptId: string, language: string) => LexicalEntry | undefined;
export declare function translate(plan: PhrasePlan, lookup: LexiconLookup): Translation[];
//# sourceMappingURL=translator.d.ts.map