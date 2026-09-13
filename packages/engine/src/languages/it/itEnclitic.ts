/**
 * A clitic attached after its host verb, as one word. `kind` says what the host is:
 * - `infinitive`: the infinitive drops its final -e ("mangiarlo", "non vedermi"), the -rre of a
 *   contracted one its last "re" ("porlo").
 * - `short`: the monosyllabic tu command of dare / fare / andare ("da'", "fa'", "va'") loses its
 *   apostrophe and doubles the clitic's consonant ("dallo", "fammi", "vacci"), except before "gli"
 *   ("dagli").
 * - `plain`: the clitic is appended as it is ("mangialo", "guardami").
 */
export function itEnclitic(host: string, clitic: string, kind: 'infinitive' | 'short' | 'plain'): string {
  if (!clitic) return host;
  if (kind === 'infinitive') return host.replace(/rre$/, 'r').replace(/e$/, '') + clitic;
  if (kind === 'short') {
    const stem = host.replace(/'$/, '');
    return clitic.startsWith('gl') ? stem + clitic : stem + clitic[0] + clitic;
  }
  return host + clitic;
}
