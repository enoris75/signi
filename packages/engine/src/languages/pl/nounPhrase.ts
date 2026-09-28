import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { isQuestionPossessor } from '../../functions/questionPossessor.js';
import { CO, KTO } from './pl.consts.js';
import { adjForm } from './adjForm.js';
import { cardinalPl } from './cardinalPl.js';
import { determinerWord } from './determinerWord.js';
import { examplesText } from './examplesText.js';
import { isReflexivePossessor } from './isReflexivePossessor.js';
import { ktoryForm } from './ktoryForm.js';
import { modifierGenitive } from './modifierGenitive.js';
import { nounAgr } from './nounAgr.js';
import { nounForm } from './nounForm.js';
import { possessivePl } from './possessivePl.js';
import { possessiveTable } from './possessiveTable.js';
import { pronominalForm } from './pronominalForm.js';
import { pronounPhrase } from './pronounPhrase.js';
import { quantifierWord } from './quantifierWord.js';
import { relativeText } from './relativeText.js';
import { standardText } from './standardText.js';
import type { Case, NpContext } from './pl.types.js';

/**
 * One noun phrase in one case (P05-E7). Polish has no article, so what leads is an agreeing
 * determiner (*ten, tamten, wszystkie, żaden, każdy*) or a quantifier that governs the genitive
 * (*kilka / wiele / mało kotów*, `quantifierWord`), a numeral (*dwa koty, pięć kotów*), the possessive
 * (*mój, twój, jego*, or *swój* for the clause's own subject, P05 §0.5), and the adjectives, prenominal
 * unless the lexeme says `position: 'post'` (*kot domowy*) — all agreeing with the noun in the case its
 * governor left it in. After the noun: an adjective carrying a standard of comparison (*kot większy
 * niż pies*), the attributive nouns and the possessor in the genitive (*jedzenie kota*), the relative
 * clause (*kot, który je*) and the examples.
 *
 * A pronoun head is `pronounPhrase`'s. Two stand-ins the shared helpers build are spelled here: the
 * relativizer of a complement gap (`relativizer`, *w którym*) and a question's gap (`question`: *kto,
 * co*, declined).
 */
export function nounPhrase(np: ResolvedNounPhrase, kase: Case, ctx: NpContext = {}): string {
  const f = np.head.forms;
  const c = kase === 'voc' ? 'nom' : kase;
  if (f['relativizer']) return ktoryForm(kase, nounAgr(f), f['relativizer'] === 'kto' || f['relativizer'] === 'co' ? f['relativizer'] : undefined);
  if (f['question'] === '1') return (f['animate'] === '1' ? KTO : CO)[c];
  if (f['person']) return pronounPhrase(np, kase, ctx);
  const agr = nounAgr(f);
  if (f['role'] === 'adjective') {
    return [adjForm(np.head, kase, agr), np.standard ? standardText(f, np.standard) : ''].filter(Boolean).join(' ');
  }
  const mass = f['uncountable'] === '1' && !agr.plural;
  const det = f['definiteness'];
  const numeral = f['numeral'] !== undefined ? Number(f['numeral']) : undefined;
  // *około* governs the genitive: *około pięciu kotów* (P09-E38).
  const approximator = (f['approximator'] ?? '').trim();
  const counted = numeral !== undefined ? cardinalPl(numeral, approximator && (c === 'nom' || c === 'acc') ? 'gen' : kase, agr) : undefined;
  const quantified = counted ? undefined : quantifierWord(det, kase, agr, mass);
  const nounCase: Case = counted?.nounCase ?? quantified?.nounCase ?? kase;
  const { possessor } = np;
  const possessive = possessor && isPronominalPossessor(possessor)
    ? possessivePl(possessor, nounCase, agr, isReflexivePossessor(possessor, ctx.subject))
    : possessor && isQuestionPossessor(possessor) ? pronominalForm(possessiveTable('czyj'), nounCase, agr)
    : '';
  const genitive = possessor && !isPronominalPossessor(possessor) && !isQuestionPossessor(possessor)
    ? nounPhrase(possessor, 'gen', { subject: ctx.subject })
    : '';
  const compared = np.adjectiveStandard?.index;
  const adjectives = np.adjectives.map((a, i) => {
    const text = adjForm(a, nounCase, agr);
    if (i === compared && np.adjectiveStandard) return { text: `${text} ${standardText(a.forms, np.adjectiveStandard.standard)}`, post: true };
    return { text, post: a.forms['position'] === 'post' };
  });
  return [
    (f['approximator_det'] ?? '').trim(),
    quantified?.word ?? '',
    determinerWord(det, nounCase, agr),
    possessive,
    approximator && counted ? approximator : '',
    counted?.word ?? '',
    ...adjectives.filter((a) => !a.post).map((a) => a.text),
    nounForm(f, nounCase, agr.plural),
    ...adjectives.filter((a) => a.post).map((a) => a.text),
    ...np.nounModifiers.map(modifierGenitive),
    genitive,
  ].filter(Boolean).join(' ') + relativeText(np, ctx) + examplesText(np);
}
