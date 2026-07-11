export interface ConceptSeed {
  id: string;
  role: string;
  description: string;
  emoji?: string;
  transitivity?: string; // only for verbs
  modal?: boolean; // verb that governs another verb's infinitive rather than heading a clause
  complements?: string[]; // ComplementType list a verb licenses (motion/locative)
  animate?: boolean; // referent is animate (human/animal) — affects motion-goal adposition
  countable?: boolean; // false for mass/uncountable nouns (water, food) — changes quantifier words
  proper?: boolean; // proper noun (Africa) — the language fixes the article, not the user
  synonym?: string; // short disambiguating gloss shown in parentheses in the picker (e.g. 'weep' for CRY)
  forms: Record<string, Record<string, string>>; // language -> form_key -> value
}
