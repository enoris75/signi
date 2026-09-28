import type { ResolvedNounPhrase } from '../../types.js';
import { adjForm } from './adjForm.js';
import { pronounForm } from './pronounForm.js';
import { relativeText } from './relativeText.js';
import type { Agr, Case, NpContext } from './lt.types.js';

/**
 * A pronoun head in one case (`pronounForm`), with its relative (*kažkas, kas bėga*). An indefinite
 * pronoun's adjective (P09-E36) is declined here rather than folded by the translator: *kažkas* (a
 * thing) takes it in the genitive where the pronoun is nominative or accusative (*kažkas didelio,
 * nieko naujo*) and in its own case elsewhere (*kažkuo dideliu*); *kažkas* (a person) in its own case
 * (*kažkas didelis*) (verify). OTHER is the stored *else* phrase where the pronoun has one
 * (`with_other_*`: *kažkas kita*, *visa kita*).
 */
export function pronounPhrase(np: ResolvedNounPhrase, kase: Case, ctx: NpContext = {}): string {
  const f = np.head.forms;
  const c = kase === 'voc' ? 'nom' : kase;
  const word = pronounForm(f, kase);
  const withAdjective = (): string => {
    if (np.adjectives.length === 0 || f['indefinite'] !== '1') return word;
    const negative = f['definiteness'] === 'no' && f['negative'] !== undefined;
    if (np.adjectives.some((a) => a.forms['after_pronoun'])) {
      const key = negative ? 'negative_with_other' : 'with_other';
      const stored = c === 'nom' ? f[key] : (f[`${key}_${c}`] ?? f[key]);
      if (stored) return stored;
    }
    const thing = f['thing'] === '1';
    const agr: Agr = { gender: 'masc', plural: false };
    const adjCase: Case = thing && (c === 'nom' || c === 'acc') ? 'gen' : c;
    return [word, ...np.adjectives.map((a) => adjForm(a, adjCase, agr))].join(' ');
  };
  return withAdjective() + relativeText(np, ctx);
}
