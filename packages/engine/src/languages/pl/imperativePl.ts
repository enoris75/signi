import { aspectForm } from './aspectForm.js';

/**
 * The imperative (P05 D6): the stored 2sg / 1pl / 2pl of the aspect the clause picked (*zjedz, zjedzmy,
 * zjedzcie*; negated, the imperfective *nie jedz*), the other aspect's where this one has none
 * (*widzieć* has none: *zobacz*). A 3rd person is *niech* + the non-past (*niech zje*). `undefined`
 * where the verb has no imperative at all (a modal), which the caller says as the infinitive.
 */
export function imperativePl(forms: Record<string, string>, perfective: boolean, pn: string): string | undefined {
  if (pn.startsWith('3')) {
    const paired = forms['pf_base'] !== undefined;
    const nonpast = perfective && paired ? forms[`pf_${pn}_future`] : forms[`${pn}_present`];
    return nonpast ? `niech ${nonpast}` : undefined;
  }
  const key = pn === '1sg' ? '2sg' : pn;
  return aspectForm(forms, perfective, `${key}_imperative`);
}
