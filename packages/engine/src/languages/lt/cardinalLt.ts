import { DU, GENITIVE_NUMERALS, I_NUMERALS, TRYS } from './lt.consts.js';
import { declineAdj } from './declineAdj.js';
import { pronominalForm } from './pronominalForm.js';
import type { Agr, Case } from './lt.types.js';

/** Four to nine, declined as a plural *-i / -ios* adjective (*keturi, keturių, keturiems, keturis*). */
function iNumeral(stem: string, kase: Exclude<Case, 'voc'>, fem: boolean): string {
  const masc = { nom: 'i', gen: 'ių', dat: 'iems', acc: 'is', ins: 'iais', loc: 'iuose' };
  const f = { nom: 'ios', gen: 'ių', dat: 'ioms', acc: 'ias', ins: 'iomis', loc: 'iose' };
  return `${stem}${(fem ? f : masc)[kase]}`;
}

/**
 * A cardinal numeral and the case it puts its noun in (C31, as far as the plan counts; P18 puts
 * numeral government out of scope beyond this). *vienas* agrees as an adjective; two to nine decline
 * and agree, the noun in the plural of the slot's case (*dvi katės, su dviem katėmis*, *keturis
 * namus*); ten to nineteen and the round tens do not decline and take a genitive plural (*dešimt
 * kačių*) (verify). A compound counts by its last digit (*dvidešimt keturios katės*). A number the
 * table lacks is written in digits over the genitive plural.
 */
export function cardinalLt(value: number, kase: Case, agr: Agr): { word: string; nounCase: Case } {
  const k = kase === 'voc' ? 'nom' : kase;
  const fem = agr.gender === 'fem';
  if (value === 1) return { word: declineAdj('vienas', k, { gender: agr.gender, plural: false }), nounCase: k };
  if (value === 2) return { word: pronominalForm(DU, k, agr), nounCase: k };
  if (value === 3) return { word: pronominalForm(TRYS, k, agr), nounCase: k };
  const stem = I_NUMERALS[value];
  if (stem) return { word: iNumeral(stem, k, fem), nounCase: k };
  const whole = GENITIVE_NUMERALS[value];
  if (whole) return { word: whole, nounCase: 'gen' };
  const tens = GENITIVE_NUMERALS[value - (value % 10)];
  if (value > 20 && value < 100 && tens && value % 10 !== 0) {
    const unit = cardinalLt(value % 10, kase, agr);
    return { word: `${tens} ${unit.word}`, nounCase: unit.nounCase };
  }
  return { word: String(value), nounCase: 'gen' };
}
