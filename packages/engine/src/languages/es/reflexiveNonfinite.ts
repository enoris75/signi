import { esEnclitic } from './esEnclitic.js';
import { reflexiveClitic } from './reflexiveClitic.js';

/**
 * A reflexive verb's stored non-finite form ("volverse", "volviéndose") with its clitic agreeing with
 * the subject, still attached: "volverme", "volviéndonos". The lexical "se" is stripped and the
 * subject's clitic re-attached through `esEnclitic`, which places the accent. A form with no "se"
 * ("haber") takes the clitic the same way ("haberse"). A non-reflexive verb's form is returned as it is.
 */
export function reflexiveNonfinite(form: string, verbForms: Record<string, string>, subjectForms: Record<string, string>): string {
  const clitic = reflexiveClitic(verbForms, subjectForms);
  if (!clitic) return form;
  return esEnclitic(form.replace(/se$/, ''), clitic);
}
