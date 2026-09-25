// A slot that holds a nested PhraseSelection: a genitive possessor block (`…Possessor`), or the
// predicate adjective's standard of comparison (`predicativeStandard`, P09-E12 D5). Both are noun
// phrases whose head is their `subject`, serialized and hydrated the same way — and so are a noun's
// examples (`…Examples`, P09-E48).
export const isNestedSelectionKey = (k: string): boolean =>
  k.endsWith("Possessor") || k.endsWith("Standard") || k.endsWith("Examples");
