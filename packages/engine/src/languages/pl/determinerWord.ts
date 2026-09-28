import { OBA, TAMTEN, TEN, WSZYSCY, ZADEN, type PronominalTable } from './pl.consts.js';
import { declineAdj } from './declineAdj.js';
import { pronominalForm } from './pronominalForm.js';
import type { Agr, Case } from './pl.types.js';

/** The determiners that decline with their noun, by value (P05 §0.4). */
const TABLES: Readonly<Record<string, PronominalTable>> = { this: TEN, that: TAMTEN, all: WSZYSCY, no: ZADEN, both: OBA };

/** The ones that decline as plain adjectives: *każdy* (each, every), *taki* (such). */
const ADJECTIVES: Readonly<Record<string, [string, string]>> = { each: ['każdy', 'każdzi'], every: ['każdy', 'każdzi'], such: ['taki', 'tacy'] };

/**
 * The word an agreeing determiner spells, in the noun's case, gender and number (P05 §0.4): *ten /
 * tamten*, *wszyscy / wszystkie* (and *cały* over a mass noun), *żaden*, *oba / obie / obaj*, *każdy*,
 * *taki*. Polish has no articles, so `definite`, `indefinite` and `bare` spell nothing; the
 * quantifiers that govern a genitive (*kilka, wiele, mało, większość*) are `quantifierWord`'s.
 */
export function determinerWord(definiteness: string | undefined, kase: Case, agr: Agr): string {
  const table = definiteness ? TABLES[definiteness] : undefined;
  if (table) return pronominalForm(table, kase, agr);
  const adjective = definiteness ? ADJECTIVES[definiteness] : undefined;
  return adjective ? declineAdj(adjective[0], adjective[1], kase, agr) : '';
}
