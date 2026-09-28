import { ABU, JOKS, KELI, SIS, TAS, TOKS, VISI, type PronominalTable } from './lt.consts.js';
import { declineAdj } from './declineAdj.js';
import { pronominalForm } from './pronominalForm.js';
import type { Agr, Case } from './lt.types.js';

/** The determiners that decline with their noun, by value (P18 §2.1). */
const TABLES: Readonly<Record<string, PronominalTable>> = {
  this: SIS, that: TAS, all: VISI, no: JOKS, both: ABU, such: TOKS, some: KELI, several: KELI,
};

/** The ones that decline as plain adjectives: *kiekvienas* (each, every). */
const ADJECTIVES: Readonly<Record<string, string>> = { each: 'kiekvienas', every: 'kiekvienas' };

/**
 * The word an agreeing determiner spells, in the noun's case, gender and number (P18 §2.1): *šis /
 * tas*, *visi / visos* (and *visas* over a mass noun), *joks*, *keli / kelios* (some, several), *abu /
 * abi*, *toks*, *kiekvienas*. Lithuanian has no articles, so `definite`, `indefinite` and `bare` spell
 * nothing; the words that put their noun in the genitive (*daug, mažai, dauguma*, and `some` over a
 * mass noun) are `quantifierWord`'s.
 */
export function determinerWord(definiteness: string | undefined, kase: Case, agr: Agr): string {
  const table = definiteness ? TABLES[definiteness] : undefined;
  if (table) return pronominalForm(table, kase, agr);
  const adjective = definiteness ? ADJECTIVES[definiteness] : undefined;
  return adjective ? declineAdj(adjective, kase, agr) : '';
}
