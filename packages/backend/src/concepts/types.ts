import type { ConceptSlot, LanguageCode, PhrasePlan } from '@signi/shared';

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
   *
   * Written in the phrase language (P13), the line the console prints and applies, with every word
   * named by its concept id — `'/subj ( MAMMAL /adj SMALL /a )'` — and compiled to its plan when the
   * seed is assembled (see compileSeedDefinitions). A definition with linked periods writes one a
   * line, in a template literal indented with the code around it.
   */
  definition?: string;
  emoji?: string;
  transitivity?: string; // only for verbs
  modal?: boolean; // verb that governs another verb's infinitive rather than heading a clause
  clauseObject?: 'content' | 'infinitive'; // the clause a verb takes as its object — "says that …", "needs to …" (P09-E12 D9); on an adjective, the infinitive it governs as a predicate — "able to act" (P13)
  slot?: ConceptSlot; // the slot this concept fills where that is not its role's — VERY/TOO, MR, OWN_ADJECTIVE, SOMETHING (see ConceptSlot; C32, C33, C37, C38)
  complements?: string[]; // ComplementType list a verb licenses (motion/locative)
  animate?: boolean; // referent is animate (human/animal) — affects motion-goal adposition
  human?: boolean; // referent is a person — English relativises "who" on this, not animacy
  sex?: 'masc' | 'fem'; // a person noun that is male or female by meaning (MOTHER, FATHER) — a genderless language's link to the subject takes its possessive from it, "the mother sees her book" (A293); unset for a person of unknown sex (PERSON, FRIEND)
  countable?: boolean; // false for mass/uncountable nouns (water, food) — changes quantifier words
  stative?: boolean; // verb naming a state that holds (have, want, be), not an event — the Romance past is its imperfect ("voleva", A130), Japanese says it with 〜ている ("持っています", A132)
  senseOf?: string; // a lexical sense the engine selects in place of the concept named here (KNOW_ACQUAINTED of KNOW, A131); left out of /api/concepts, so no picker offers it
  alarm?: boolean; // noun naming a danger one cries out a warning of (wolf, fire) — it/fr cry it with a / à: "gridare al lupo", "crier au feu" (A124)
  alarmCry?: boolean; // verb whose object, when an `alarm` noun, is the shout itself ("cry wolf"): no determiner, and a / à + the article in it/fr (A124, A163)
  transient?: boolean; // adjective ascribing a transient state (tired, saved), not an inherent property (big) — es/pt predicate it with `estar`, not `ser` (A47); default inherent
  mannerRelation?: 'similative' | 'measure' | 'means' | 'mode'; // how the noun enters a manner adverbial (SPEED→measure); default similative
  temporal?: boolean; // noun naming a point in time, an occasion (TIME), not a rate: a measure adverbial under an adjective keeps its article, "at the other time" not "at high speed" (A235); German says it with "zu", "zu allen Zeiten" (A60)
  dimensionRelation?: 'extent' | 'quality' | 'measure'; // how a dimension noun enters an adjective-definition gloss (SIZE→extent); default extent
  proper?: boolean; // proper noun (Africa) — the language fixes the article, not the user
  synonym?: string; // short disambiguating gloss shown in parentheses in the picker (e.g. 'weep' for CRY)
  /**
   * `synonym` in the other languages, for where the concept's word is another concept's too: BEGIN
   * and START are both *iniziare*, so BEGIN carries `it: 'avere inizio'`. English stays in `synonym`.
   * A phrase a dictionary gives for this sense, never the word itself.
   */
  glosses?: Partial<Record<Exclude<LanguageCode, 'en'>, string>>;
  isA?: string;     // immediate hypernym — CARAVEL isA SAILING_SHIP. One parent only; see concepts/hierarchy.ts
  /**
   * Secondary lexemes (P09-E23): other words that find this concept in the pickers and the console
   * (*talk* for SPEAK), seeded as `is_primary = 0` lexeme rows. A lemma only — never rendered, so
   * no paradigm; a Japanese alias that needs a kana search lists the kana as a second alias.
   * Not for pronouns, which are found by their person. Each must be a word a dictionary gives for
   * *this* sense.
   */
  aliases?: Partial<Record<LanguageCode, string[]>>;
  forms: Record<string, Record<string, string>>; // language -> form_key -> value
}
