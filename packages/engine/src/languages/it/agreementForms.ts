/**
 * The features a word agreeing with the subject reads, as opposed to the finite verb. The impersonal
 * "si" takes a singular verb, but a predicate adjective or an essere participle agreeing with it is
 * masculine plural: "si è stanchi", "si diventa vecchi", "si è andati". Any other subject agrees as
 * itself.
 */
export function agreementForms(subjectForms: Record<string, string>): Record<string, string> {
  return subjectForms['generic'] === '1' ? { ...subjectForms, gender: 'masc', number: 'plural' } : subjectForms;
}
