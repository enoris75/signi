import { reflexiveClitic } from './reflexiveClitic.js';

/**
 * A reflexive verb's stored non-finite form ("mover-se", "movendo-se") with its clitic agreeing with
 * the subject, still attached: "mover-me", "movendo-nos". The stored 3rd-person "-se" is stripped and
 * the subject's clitic re-attached with the hyphen Portuguese writes it with (A151). A form with no
 * "-se" ("ter") takes the clitic the same way ("ter-se"), which is where a modal's perfect puts it —
 * the particípio carries none. A non-reflexive verb's form is returned as it is.
 *
 * The clitic stays attached, as the engine already does in the 3rd person ("deve mover-se") and as
 * the hypothetical tests pin ("se o gato devesse tornar-se feliz"). Brazilian usage puts it before
 * the non-finite verb instead ("devo me mover"); both are standard, and the engine picks one.
 */
export function reflexiveNonfinite(form: string, verbForms: Record<string, string>, subjectForms: Record<string, string>): string {
  const clitic = reflexiveClitic(verbForms, subjectForms);
  if (!clitic) return form;
  return `${form.replace(/-se$/, '')}-${clitic}`;
}
