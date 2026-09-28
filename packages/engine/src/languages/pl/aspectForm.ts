/**
 * One cell of a verb in the aspect the clause picked (P05 D1): the perfective reads its `pf_` key, the
 * imperfective the plain one. A verb with no `pf_base` is unpaired or biaspectual and answers the
 * imperfective whatever is asked (*kochać, musieć*). A cell one aspect lacks (*widzieć* has no
 * imperative, a modal no passive) falls back on the other's, so the verb still says something.
 */
export function aspectForm(forms: Record<string, string>, perfective: boolean, key: string): string | undefined {
  const paired = forms['pf_base'] !== undefined;
  const pf = forms[`pf_${key}`];
  const ipf = forms[key];
  if (!paired) return ipf;
  return perfective ? (pf ?? ipf) : (ipf ?? pf);
}
