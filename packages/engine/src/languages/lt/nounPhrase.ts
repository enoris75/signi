import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { isQuestionPossessor } from '../../functions/questionPossessor.js';
import { KAS, WHOSE } from './lt.consts.js';
import { adjForm } from './adjForm.js';
import { cardinalLt } from './cardinalLt.js';
import { determinerWord } from './determinerWord.js';
import { examplesText } from './examplesText.js';
import { isReflexivePossessor } from './isReflexivePossessor.js';
import { kurisForm } from './kurisForm.js';
import { modifierGenitive } from './modifierGenitive.js';
import { nounAgr } from './nounAgr.js';
import { nounForm } from './nounForm.js';
import { possessiveLt } from './possessiveLt.js';
import { pronounPhrase } from './pronounPhrase.js';
import { quantifierWord } from './quantifierWord.js';
import { relativeText } from './relativeText.js';
import { standardText } from './standardText.js';
import type { Case, NpContext } from './lt.types.js';

/**
 * One noun phrase in one case (P18-E8, §2.1). Lithuanian has no article, so what leads is an agreeing
 * determiner (*šis, tas, visi, joks, keli, kiekvienas*) or a quantity word over the genitive (*daug /
 * mažai kačių*, `quantifierWord`), the possessive (*mano, tavo, jo*, or *savo* for the clause's own
 * subject, P18 §0.4) or the possessor itself in the genitive — **before** the head (*katės maistas*),
 * a numeral (*dvi katės*), the adjectives (always prenominal), the attributive nouns in the genitive
 * (*frazių kūrėjas*), then the noun, in the case its governor left it in. After the noun: an adjective
 * carrying a standard of comparison (*katė, didesnė nei šuo*: verify), the relative clause (*katė,
 * kuri valgo*) and the examples.
 *
 * A pronoun head is `pronounPhrase`'s. Two stand-ins the shared helpers build are spelled here: the
 * relativizer of a complement gap (`relativizer`, *kuriame*) and a question's gap (`question`: *kas*,
 * declined).
 */
export function nounPhrase(np: ResolvedNounPhrase, kase: Case, ctx: NpContext = {}): string {
  const f = np.head.forms;
  const c = kase === 'voc' ? 'nom' : kase;
  if (f['relativizer']) return kurisForm(kase, nounAgr(f), f['relativizer'] === 'kas');
  if (f['question'] === '1') return KAS[c];
  if (f['person']) return pronounPhrase(np, kase, ctx);
  const agr = nounAgr(f);
  if (f['role'] === 'adjective') {
    return [adjForm(np.head, kase, agr), np.standard ? standardText(f, np.standard) : ''].filter(Boolean).join(' ');
  }
  const mass = f['uncountable'] === '1' && !agr.plural;
  const det = f['definiteness'];
  const numeral = f['numeral'] !== undefined ? Number(f['numeral']) : undefined;
  // *apie* governs the accusative: *apie penkias kates* (P09-E38) (verify).
  const approximator = (f['approximator'] ?? '').trim();
  const counted = numeral !== undefined ? cardinalLt(numeral, approximator && c === 'nom' ? 'acc' : kase, agr) : undefined;
  const quantified = counted ? undefined : quantifierWord(det, kase, mass);
  const nounCase: Case = counted?.nounCase ?? quantified?.nounCase ?? kase;
  const { possessor } = np;
  const possessive = possessor && isPronominalPossessor(possessor)
    ? possessiveLt(possessor, isReflexivePossessor(possessor, ctx.subject))
    : possessor && isQuestionPossessor(possessor) ? WHOSE
    : '';
  const genitive = possessor && !isPronominalPossessor(possessor) && !isQuestionPossessor(possessor)
    ? nounPhrase(possessor, 'gen', { subject: ctx.subject })
    : '';
  const compared = np.adjectiveStandard?.index;
  const adjectives = np.adjectives.map((a, i) => {
    const text = adjForm(a, nounCase, agr);
    if (i === compared && np.adjectiveStandard) return { text: `${text} ${standardText(a.forms, np.adjectiveStandard.standard)}`, post: true };
    return { text, post: false };
  });
  return [
    (f['approximator_det'] ?? '').trim(),
    quantified?.word ?? '',
    quantified ? '' : determinerWord(det, nounCase, agr),
    possessive,
    genitive,
    approximator && counted ? approximator : '',
    counted?.word ?? '',
    ...adjectives.filter((a) => !a.post).map((a) => a.text),
    ...np.nounModifiers.map(modifierGenitive),
    nounForm(f, nounCase, agr.plural),
    ...adjectives.filter((a) => a.post).map((a) => a.text),
  ].filter(Boolean).join(' ') + relativeText(np, ctx) + examplesText(np);
}
