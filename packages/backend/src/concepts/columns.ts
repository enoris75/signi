import type { LanguageCode } from '@signi/shared';
import { GSW } from './gsw/index.js';
import { RM_RUMGR } from './rm-rumgr/index.js';
import { RM_SURSILV } from './rm-sursilv/index.js';
import { RM_VALLADER } from './rm-vallader/index.js';
import { CA } from './ca/index.js';
import { PL } from './pl/index.js';
import type { LanguageColumn } from './types.js';

/**
 * The languages whose forms live in a column folder rather than inline in the role files (P10-E4,
 * P04-E1, P03), each with the **closest language** it borrows from. A word is never missing: a concept
 * the column does not give takes the closest language's forms when the seeds are assembled, and is
 * listed as borrowed (`borrowed`) until someone gives the column its own word. Listed in borrowing
 * order — Rumantsch Grischun before the two idioms that borrow from it.
 */
export const COLUMNS: Partial<Record<LanguageCode, { forms: LanguageColumn; closest: LanguageCode }>> = {
  gsw: { forms: GSW, closest: 'de' },
  'rm-rumgr': { forms: RM_RUMGR, closest: 'it' },
  'rm-sursilv': { forms: RM_SURSILV, closest: 'rm-rumgr' },
  'rm-vallader': { forms: RM_VALLADER, closest: 'rm-rumgr' },
  // Catalan (P03) borrows from Spanish, the ready language whose paradigms its column is keyed like.
  ca: { forms: CA, closest: 'es' },
  // Polish (P05) has no Slavic neighbour among the ready languages; German, the one other language
  // here with cases and three genders, is its closest. The target is nothing borrowed.
  pl: { forms: PL, closest: 'de' },
};
