import type { ResolvedNounElement, ResolvedNounPhrase } from '../../types.js';
import { OTHER_REPLACES_INDEFINITE } from '../translator.consts.js';

/**
 * The languages whose subject cannot go bare: a generic plural or mass subject takes the definite
 * article there — *i gatti corrono*, *les chats courent*, *los gatos corren*, *os gatos correm*,
 * *l'acqua scorre* — where English, German and Japanese leave it bare ("cats run", "Kater laufen").
 */
export const GENERIC_DEFINITE_SUBJECT: ReadonlySet<string> = new Set(['it', 'fr', 'es', 'pt']);

/**
 * A clause's **subject** read as the generic (A376): a bare plural or mass noun there takes the
 * definite article in the Romance four, as the one who likes does in an experiencer frame ("ai gatti
 * piace un topo", "a los gatos les gusta un ratón"). The plan's `bare` stays bare in the object and
 * the complements ("il gatto vede topi"), and in a verbless period, which is a label, not a clause.
 *
 * Only a determiner the plan picked as bare changes: a numeral's dropped article ("due gatti
 * corrono"), a personal name ("Pietro"), a pronoun, and Spanish/Portuguese *otro* standing where the
 * indefinite article would ("otros gatos") all resolve bare too, and keep it.
 */
export function genericSubject<T extends ResolvedNounElement | undefined>(el: T, language: string): T {
  if (!el || !GENERIC_DEFINITE_SUBJECT.has(language)) return el;
  if (!el.conjuncts.some((np) => generic(np, language))) return el;
  const conjuncts = el.conjuncts.map((np) => generic(np, language)
    ? { ...np, head: { ...np.head, forms: { ...np.head.forms, definiteness: 'definite' } } }
    : np);
  // A single conjunct agrees as its own head, so its agreement carries the determiner too.
  const agreement = el.conjuncts.length === 1 && el.agreement['definiteness'] === 'bare'
    ? { ...el.agreement, definiteness: 'definite' }
    : el.agreement;
  return { ...el, conjuncts, agreement };
}

function generic(np: ResolvedNounPhrase, language: string): boolean {
  const f = np.head.forms;
  if (f['definiteness'] !== 'bare' || f['person'] || f['proper'] === '1' || f['numeral'] !== undefined) return false;
  if (f['number'] !== 'plural' && f['uncountable'] !== '1') return false;
  return !(OTHER_REPLACES_INDEFINITE.has(language) && np.adjectives.some((a) => a.conceptId === 'OTHER'));
}
