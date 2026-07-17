import type { PhrasePlan } from '@signi/shared';

export interface ConceptSeed {
  id: string;
  role: string;
  description: string;
  /**
   * An optional engine-composed definition: a semantic period the grammar engine renders into
   * every language, so the picker tooltip is localized the same way the rest of the UI is (see
   * the payoff tagline). When present it supersedes the stored `description`/`concept_definitions`
   * literal for all languages; the literal remains the fallback for concepts without a plan.
   * Shaped as a bare/indefinite noun phrase — a genus-differentia gloss ("a small mammal").
   */
  definition?: PhrasePlan;
  emoji?: string;
  transitivity?: string; // only for verbs
  modal?: boolean; // verb that governs another verb's infinitive rather than heading a clause
  complements?: string[]; // ComplementType list a verb licenses (motion/locative)
  animate?: boolean; // referent is animate (human/animal) — affects motion-goal adposition
  human?: boolean; // referent is a person — English relativises "who" on this, not animacy
  countable?: boolean; // false for mass/uncountable nouns (water, food) — changes quantifier words
  proper?: boolean; // proper noun (Africa) — the language fixes the article, not the user
  synonym?: string; // short disambiguating gloss shown in parentheses in the picker (e.g. 'weep' for CRY)
  isA?: string;     // immediate hypernym — CARAVEL isA SAILING_SHIP. One parent only; see concepts/hierarchy.ts
  forms: Record<string, Record<string, string>>; // language -> form_key -> value
}
