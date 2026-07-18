import type { AbstractionLevel, Aspect, CauseSentiment, ComplementType, CoordConjunction, Degree, ImperativeRegister, LanguageCode, MannerRelation, ModifierRelation, PathSpecifier, PronominalPossessor, RubySegment, Specifier, Tense } from '@signi/shared';
import { isActionLevel, isPronominalPossessor } from '@signi/shared';

export type { RubySegment, PronominalPossessor };
export { isPronominalPossessor };

export interface ConceptForms {
  conceptId: string;
  forms: Record<string, string>;
}

/**
 * Verb concept ids whose Romance `source` keeps its disambiguating ablative adverb
 * ("via da" / "loin de" / "lejos de" / "longe de"). These are the self-propelled motion
 * verbs where `source` (da/de) would otherwise be misread as a `direction`-toward goal:
 * "corro dal bambino" is motion TO the child, so "corro VIA dal bambino" is what forces the
 * away reading. Every other source-licensing verb drops the adverb, because bare da/de is
 * already unambiguous there — COME/GO read their `source` as an origin, not a departure, and the
 * transitive LOAD/IMPORT load *out of* a container ("il gatto viene dalla casa", "carica il libro
 * dal contenitore"). The adverb on those inverts the meaning ("comes/loads FAR from"), so it is
 * gated to this set. `source` is only licensed on these six verbs (see the intransitive corpus).
 */
export const SOURCE_ABLATIVE_ADVERB_VERBS = new Set(['RUN', 'JUMP']);

/** A resolved noun-modifier: the attributive noun's forms plus its semantic relation. */
export interface ResolvedNounModifier {
  concept: ConceptForms;
  relation: ModifierRelation;
  /**
   * Adjectives modifying the attributive noun itself. Resolved for the modifier's own
   * gender/number (which the translator sets on `concept.forms`) so each engine agrees
   * them against the modifier, not the head ("creatore di frasi **semantiche**").
   */
  adjectives: ConceptForms[];
}

/** A resolved noun phrase: its head noun/pronoun plus its resolved adjectives. */
export interface ResolvedNounPhrase {
  head: ConceptForms;
  adjectives: ConceptForms[];
  /** Resolved attributive nouns ("sail boat"); relation drives the Romance preposition. */
  nounModifiers: ResolvedNounModifier[];
  /** A resolved relative clause; the head above is implicitly its subject. */
  relative?: ResolvedRelativeClause;
  /**
   * A resolved possessor: either a genitive noun phrase (Saxon genitive, "the cat's book" → "the
   * cat"), or a pronominal possessor whose features spell a possessive pronoun ("his"). Narrow
   * with `isPronominalPossessor`. The pronominal form carries no lexicon — it is pure features.
   */
  possessor?: ResolvedNounPhrase | PronominalPossessor;
}

/**
 * A resolved noun element: the conjuncts filling one noun slot, and the agreement they resolve
 * to as a group. A slot holding a single phrase resolves to one conjunct and no conjunction —
 * which is the overwhelmingly common case, and is bit-for-bit what the engines saw before
 * coordination existed.
 */
export interface ResolvedNounElement {
  /** At least one. Each is a full noun phrase and renders with its own determiner/adjectives. */
  conjuncts: ResolvedNounPhrase[];
  /** The conjunction joining them; absent iff there is a single conjunct. */
  conjunction?: CoordConjunction;
  /**
   * The person/number/gender the *group* agrees as — what a verb agreeing with this slot, or an
   * adjective agreeing with it, must read. "Peter and Paul" is 3rd plural though both conjuncts
   * are singular; "il gatto e la volpe" is masculine plural though one conjunct is feminine.
   *
   * Agreement **only**: it deliberately carries no surface forms (no `base`, no `plural`), so an
   * engine that tries to render a noun from it prints nothing rather than silently printing just
   * one of the conjuncts. Render from `conjuncts`; agree from here. For a single conjunct it is
   * that conjunct's own head forms, so the two coincide and nothing changes.
   */
  agreement: Record<string, string>;
}

/** The first conjunct of an element — the head of a slot the engines treat as a single phrase. */
export function firstConjunct(element: ResolvedNounElement): ResolvedNounPhrase {
  return element.conjuncts[0];
}

/**
 * The object (accusative / clitic) surface of a pronoun, by number/gender — the direct-object
 * counterpart of the subject citation form (`base`/`plural`/`singular_fem`…). English/German use it
 * post-verbally without an article ("sees me", "sieht ihn"); Romance uses it as the proclitic that
 * moves before the finite verb ("mi vede"). Falls back through plural/base when a form is absent.
 */
export function objectPronounForm(forms: Record<string, string>): string {
  const plural = (forms['number'] ?? forms['count']) === 'plural';
  if (plural) return forms['object_plural'] ?? forms['plural'] ?? forms['object'] ?? forms['base'] ?? '';
  const gender = forms['gender'];
  if (gender === 'fem') return forms['object_fem'] ?? forms['object'] ?? forms['base'] ?? '';
  if (gender === 'neut') return forms['object_neut'] ?? forms['object'] ?? forms['base'] ?? '';
  return forms['object'] ?? forms['base'] ?? '';
}

/**
 * Whether a resolved noun slot is a single pronoun — one conjunct with a `person`. This is the case
 * that takes the pronoun-object path (oblique form, no article, and a Romance clitic before the
 * verb); a noun object, or a coordination, keeps the ordinary post-verbal noun-phrase rendering.
 */
export function isPronounElement(el: ResolvedNounElement): boolean {
  return el.conjuncts.length === 1 && !!el.conjuncts[0].head.forms['person'];
}

/**
 * Whether a resolved subject is the generic / impersonal pronoun ("one eats" — the seeded
 * GENERIC_PERSON, flagged `generic`). It is a 3rd-person-singular pronoun for agreement, but its
 * surface differs by language: a placed subject word in en/de/fr ("one"/"man"/"on"), a preverbal
 * impersonal clitic in the Romance clitic languages (it "si", es/pt "se"), and dropped in ja. The
 * clitic engines read this to suppress the subject word and emit the clitic instead (see each
 * `predicateText`); ja reads it to drop the clause subject entirely.
 */
export function isGenericSubject(el: ResolvedNounElement): boolean {
  return el.conjuncts.length === 1 && el.conjuncts[0].head.forms['generic'] === '1';
}

/**
 * A shallow copy of a resolved noun phrase with its head's `definiteness` overridden — used to
 * re-render a `no` object under a non-negative determiner when the clause is negated elsewhere
 * (English "any", German the plain indefinite), so the double negative is avoided. The original
 * forms are left untouched.
 */
export function withDefiniteness(np: ResolvedNounPhrase, definiteness: string): ResolvedNounPhrase {
  return { ...np, head: { ...np.head, forms: { ...np.head.forms, definiteness } } };
}

/**
 * Join the rendered conjuncts of a coordinated slot the way a language coordinates: every
 * junction but the last takes `separator` (a comma in the European languages, と in Japanese),
 * and the last takes whatever `link` returns for the conjunct that follows it — a function, not a
 * word, because the conjunction is not always the same word: Spanish says "y" but "e" before an
 * i- sound, Italian "e" but "ed" before an e-.
 */
export function joinConjuncts(
  parts: string[],
  separator: string,
  link: (next: string) => string,
): string {
  const words = parts.filter(Boolean);
  if (words.length <= 1) return words[0] ?? '';
  const last = words[words.length - 1];
  return words.slice(0, -1).join(separator) + link(last) + last;
}

/**
 * Verb mood, set by the translator. For a hypothetical conditional the main clause's verb is
 * `'conditional'` ("would run") and the "if" clause's verb is `'subjunctive'` (past /
 * imperfect-subjunctive, "if the cat ate"). For a command the verb is `'imperative'` ("eat!",
 * "don't run!"), the subject is dropped from the surface, and the subject's person/number
 * selects the imperative form (2sg default, 1pl "let's…", 2pl). Absent ⇒ plain `'indicative'`.
 * Each engine maps this onto its own conditional / subjunctive / imperative forms.
 */
export type Mood = 'indicative' | 'conditional' | 'subjunctive' | 'imperative';

/** A resolved verb phrase: the verb, negation flag, tense, aspect, mood, and resolved adverb. */
export interface ResolvedVerbPhrase {
  verb: ConceptForms;
  negative?: boolean;
  tense?: Tense;
  aspect?: Aspect;
  mood?: Mood;
  /**
   * The register of an imperative (see PhrasePlan.imperativeRegister). Absent ⇒ `'request'`,
   * a command spoken to someone. `'instruction'` is the impersonal directive a UI control or a
   * recipe step carries; each engine renders it in the form its language conventionally uses
   * there — the infinitive in fr/es/pt/de, the verbal noun in ja, the plain base in en/it.
   * Meaningless outside `mood === 'imperative'`; the engines only read it there.
   */
  register?: ImperativeRegister;
  modifier?: ConceptForms;
  /** Resolved modal verbs governing the predicate, outermost first (see VerbPhrase.modals). */
  modals: ResolvedModal[];
}

/** A resolved modal link: the modal verb's forms plus its own resolved adverb (if any). */
export interface ResolvedModal {
  verb: ConceptForms;
  modifier?: ConceptForms;
}

/**
 * A resolved relative clause: a full predicate (verb + objects + complements) in
 * which the head noun phrase fills the slot named by `headRole` (the "gap"). For a
 * subject-relative (`headRole === 'subject'`) the head drives verb agreement and
 * `subject` is undefined; otherwise the clause carries its own resolved `subject`
 * (which drives agreement) and the `headRole` slot is left undefined.
 */
export interface ResolvedRelativeClause {
  headRole: 'subject' | 'directObject' | ComplementType;
  subject?: ResolvedNounElement;
  verbPhrase: ResolvedVerbPhrase;
  directObject?: ResolvedNounElement;
  complements?: Partial<Record<ComplementType, ResolvedComplement>>;
}

/** A resolved complement: its noun phrase plus any specifiers (plain data). */
export interface ResolvedComplement {
  phrase: ResolvedNounElement;
  /**
   * The resolved action an instrument *is* at the `process` / `concept` abstraction levels —
   * "by **choosing** a word" (see Complement.action). `phrase` is the noun it acts on. Absent at
   * the `object` level and on every other complement.
   */
  action?: ResolvedVerbPhrase;
  specifiers?: Specifier[];
}

/**
 * Whether any complement carries a `no`-determined phrase — a postverbal negative word. In the
 * Romance languages this obliges the preverbal negator (non / ne / no / não), exactly as a negative
 * direct object does; English and German need no concord. Checks every complement's noun phrase.
 */
export function hasNegativeComplement(
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
): boolean {
  if (!complements) return false;
  return Object.values(complements).some(
    (c) => c?.phrase.conjuncts.some((np) => np.head.forms['definiteness'] === 'no'),
  );
}

export interface ResolvedPhrase {
  subject: ResolvedNounElement;
  // Absent for a verbless period (a bare noun phrase — see PhrasePlan.verbPhrase).
  verbPhrase?: ResolvedVerbPhrase;
  directObject?: ResolvedNounElement;
  // The recipient ("gives the book *to the cat*") arrives as the `terminus` complement.
  complements?: Partial<Record<ComplementType, ResolvedComplement>>;
  /**
   * A resolved hypothetical condition (the "if" clause). When present this phrase is the
   * main clause of a conditional (its verb resolved in the `'conditional'` mood) and
   * `condition` is the protasis (its verb resolved in the `'subjunctive'` mood). Engines
   * render it as "<if-word> <condition>, <main>".
   */
  condition?: ResolvedPhrase;
  /**
   * A resolved coordinated second clause plus the conjunction linking it to this one. When
   * present the engines render "<this clause> <conjunction-word> <coordination.clause>". The
   * two clauses always share a mood — either both plain indicative, or (when this clause is a
   * command) both imperative, the second carrying the first's register and addressee, so the
   * engines drop its subject exactly as they do the first's. The coordinated clause is not
   * itself coordinated.
   */
  coordination?: { conjunction: CoordConjunction; clause: ResolvedPhrase };
}

/** The path relation chosen for a `route` complement; defaults to `through`. */
export function pathSpecifier(c: ResolvedComplement): PathSpecifier {
  return c.specifiers?.find((s) => s.kind === 'path')?.value ?? 'through';
}

/** The affective stance chosen for a `cause` complement; defaults to `neutral`. */
export function causeSentiment(c: ResolvedComplement): CauseSentiment {
  return c.specifiers?.find((s) => s.kind === 'sentiment')?.value ?? 'neutral';
}

/**
 * The manner relation a noun heads a `manner` adverbial with — a property of the noun's meaning,
 * read from its resolved forms (threaded there from the concept). A noun that declares none is a
 * `similative` ("like …"), the neutral case that reads for any noun. Each engine maps the
 * relation to its own adposition.
 */
export function mannerRelation(forms: ConceptForms['forms']): MannerRelation {
  const r = forms['mannerRelation'];
  return r === 'means' || r === 'measure' || r === 'mode' ? r : 'similative';
}

/**
 * The reification degree chosen for an `instrumental` complement; defaults to `object`. An
 * action level with no resolved `action` to render falls back to `object` — the noun phrase alone
 * — so a half-built plan renders "with a word" rather than nothing.
 */
export function abstractionLevel(c: ResolvedComplement): AbstractionLevel {
  const level = c.specifiers?.find((s) => s.kind === 'abstraction')?.value ?? 'object';
  return isActionLevel(level) && !c.action ? 'object' : level;
}

/**
 * The verb of an instrument's action, in the non-finite form the `process` level takes, plus its
 * adverb: the gerund in en/it/es/pt ("choosing", "scegliendo"), the te-form in ja. French has no
 * seeded gerund — its gérondif is built in-engine from the "nous" present stem — and German has
 * no gerund at all, so both build their own form; this is the shared lookup for the four that do.
 */
export function actionGerund(action: ResolvedVerbPhrase): string {
  return action.verb.forms['gerund'] ?? action.verb.forms['base'] ?? '';
}

/** The plain infinitive (citation form) of an instrument's action — the `concept` level's stem. */
export function actionInfinitive(action: ResolvedVerbPhrase): string {
  return action.verb.forms['base'] ?? '';
}

/**
 * The comparative degree threaded onto a resolved adjective's forms (see the translator).
 * Absent ⇒ the plain, unmarked `positive` form. Each engine maps this to its own degree
 * words / morphology.
 */
export function adjDegree(a: ConceptForms): Degree {
  return (a.forms['degree'] as Degree | undefined) ?? 'positive';
}

/**
 * The two relative-superlative degrees ("most"/"least"). Romance renders these with the same degree
 * adverb as the comparative ("più"/"plus"/"más"/"mais"), so an *attributive* superlative leans on
 * the noun's own definite article to tell them apart. A *predicative* one has no such article, so it
 * must supply its own — the caller keys that off this.
 */
export function isRelativeSuperlative(a: ConceptForms): boolean {
  const d = adjDegree(a);
  return d === 'most' || d === 'least';
}

/** Join the base forms of any number of adjectives into one string ("big red"). */
export function adjString(...adjs: Array<ConceptForms | undefined>): string {
  return adjs
    .map((a) => a?.forms['base'])
    .filter((s): s is string => Boolean(s))
    .join(' ');
}

/** Join a resolved noun phrase's adjectives into one string ("big red"). */
export function npAdj(np: ResolvedNounPhrase): string {
  return adjString(...np.adjectives);
}

/**
 * The words of a modal chain, outermost first, up to (but not including) the verb group it
 * governs: the outermost modal in the finite form `finite` builds (it alone carries tense,
 * agreement, and negation), then each inner modal's `nonfinite` form. Every modal is followed
 * by its `link` particle when it has one — English "want **to** go"; the Romance and German
 * modals govern a bare infinitive and set none. Shared by the five engines whose modals are
 * ordinary pre-infinitival verbs (en/it/fr/es/pt); German stacks its infinitives clause-finally
 * and Japanese suffixes them, so both build their own chain.
 */
export function modalChain(
  modals: ResolvedModal[],
  finite: (m: ConceptForms) => string,
  adverb?: (m: ResolvedModal, i: number) => { pre?: string; post?: string },
): string[] {
  const words: string[] = [];
  modals.forEach((m, i) => {
    const a = adverb?.(m, i) ?? {};
    if (a.pre) words.push(a.pre);
    words.push(i === 0 ? finite(m.verb) : (m.verb.forms['nonfinite'] ?? m.verb.forms['base'] ?? ''));
    if (a.post) words.push(a.post);
    if (m.verb.forms['link']) words.push(m.verb.forms['link']);
  });
  return words.filter(Boolean);
}

/** An adverb whose polarity demands a negated predicate (NEVER → non/ne…pas/nicht/ない). */
export function isNegativeAdverb(a?: ConceptForms): boolean {
  return a?.forms['polarity'] === 'negative';
}

/** A frequency adverb (always / never), placed differently from manner adverbs in most langs. */
export function isFrequencyAdverb(a?: ConceptForms): boolean {
  return a?.forms['subtype'] === 'frequency';
}

/**
 * Does *any* adverb in the verb group — the main verb's `modifier` or any modal's — carry
 * negative polarity? A negative adverb forces sentential negation onto the finite element no
 * matter which verb it modifies ("I **never** wanted to go" ⇒ negate the finite "want").
 */
export function groupHasNegativeAdverb(vp: {
  modifier?: ConceptForms;
  modals: ResolvedModal[];
}): boolean {
  return isNegativeAdverb(vp.modifier) || vp.modals.some((m) => isNegativeAdverb(m.modifier));
}

export interface LanguageEngine {
  language: LanguageCode;
  render(phrase: ResolvedPhrase): string;
  /**
   * One word standing on its own, with no sentence around it — a UI label naming a concept
   * ("singular", "first"). An adjective still has to *agree* with something: the word's forms
   * carry the gender/number of the noun it describes (the translator resolves them from the
   * noun named by the label's `agreesWith`), which is what lets the Romance engines render the
   * feminine "prima persona" as "prima" and not "primo".
   *
   * Optional: a language whose adjective is invariant (en, de) needs no implementation, and
   * the translator falls back to the citation form.
   */
  renderWord?(word: ConceptForms): string;
  /**
   * What goes between two words of a label that names one thing with several words ("second
   * singular"). A space in the languages that write with them; Japanese writes none (二番目単数).
   * Optional: defaults to a space.
   */
  wordJoiner?: string;
  /**
   * The determiner alone, for the UI's determiner menu — the surface this language puts before
   * `noun` for the `definiteness` its forms carry ("the" / "il" / "questo" / "tutti i" / "この").
   * A determiner has no citation form of its own: it agrees with the noun it determines, so the
   * caller supplies one (see `translateDeterminer`) and this returns the determiner it would
   * take. Return '' where the language spells no determiner at all — the bare article
   * everywhere, and every article in Japanese; the caller shows an em-dash for it.
   */
  renderDeterminer?(noun: ConceptForms): string;
  /**
   * Optional ruby (furigana) rendering: the same surface as `render`, split into
   * segments carrying kana readings. Implemented only by languages with furigana (ja).
   */
  renderRuby?(phrase: ResolvedPhrase): RubySegment[];
  /** The full stop closing a rendered sentence. Defaults to '.'; ja overrides it with '。'. */
  terminator?: string;
}
