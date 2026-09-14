import type { LexicalEntry } from '@signi/shared';

export type LexiconLookup = (conceptId: string, language: string) => LexicalEntry | undefined;
