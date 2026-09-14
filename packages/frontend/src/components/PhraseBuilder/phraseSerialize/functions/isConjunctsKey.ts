// A slot that holds an *array* of nested PhraseSelections — the coordinated conjuncts of a noun
// block. Each element is a selection like any other (its head is its `subject`), so it round-trips
// through the same two functions. A phrase saved before coordination existed simply has no such
// key, and loads unchanged.
export const isConjunctsKey = (k: string): boolean => k.endsWith("Conjuncts");
