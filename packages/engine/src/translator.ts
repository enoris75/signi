import type { ComplementType, CoordConjunction, Definiteness, ImperativeRegister, LexicalEntry, NounElement, NounPhrase, PhrasePlan, RelativeClause, Translation, VerbPhrase } from '@signi/shared';
import { canCoordinateImperative, defaultDefiniteness, isNounGroup, isPronominalPossessor, nounConjuncts } from '@signi/shared';
import { mannerRelation } from './types.js';
import type { LanguageEngine, Mood, ResolvedPhrase, ResolvedComplement, ResolvedNounElement, ResolvedNounPhrase, ResolvedRelativeClause, ResolvedVerbPhrase, ConceptForms } from './types.js';
import { englishEngine } from './languages/en.js';
import { italianEngine } from './languages/it.js';
import { frenchEngine } from './languages/fr.js';
import { germanEngine } from './languages/de.js';
import { spanishEngine } from './languages/es.js';
import { japaneseEngine } from './languages/ja.js';
import { portugueseEngine } from './languages/pt.js';

export const engines: LanguageEngine[] = [
  englishEngine,
  italianEngine,
  frenchEngine,
  germanEngine,
  spanishEngine,
  japaneseEngine,
  portugueseEngine,
];

export type LexiconLookup = (conceptId: string, language: string) => LexicalEntry | undefined;

/** Determiners that are inherently plural, so they render the plural noun surface. */
const PLURAL_DETERMINERS = new Set(['some', 'many', 'few', 'all']);

function resolve(conceptId: string, language: string, lookup: LexiconLookup): ConceptForms {
  const entry = lookup(conceptId, language);
  return { conceptId, forms: entry ? { ...entry.forms } : {} };
}

function applyNounGender(forms: Record<string, string>, gender?: 'masc' | 'fem' | 'neut') {
  // Only nouns reach here, and nouns are masc/fem — 'neut' is a pronoun-only head gender.
  if (gender !== 'fem' || !forms['fem']) return;
  const plural = forms['number'] === 'plural';
  forms['base']   = plural ? (forms['fem_plural'] ?? forms['fem']) : forms['fem'];
  if (plural && forms['fem_plural']) forms['plural'] = forms['fem_plural'];
  forms['gender'] = 'fem';
}

/**
 * Resolve a noun phrase for one language: resolve the head noun/pronoun and apply
 * number/gender (synthesising the pronoun surface form, or applying noun gender),
 * then resolve each adjective. This folds together what used to be four duplicated
 * subject/object/complement blocks.
 */
function resolveNounPhrase(np: NounPhrase, language: string, lookup: LexiconLookup): ResolvedNounPhrase {
  const head = resolve(np.concept, language, lookup);
  if (head.forms['person']) {
    // Pronoun: synthesise the correct surface form as 'base' so all engines can use
    // their existing `forms['base']` / `forms['plural']` logic unchanged.
    const number = np.number ?? 'singular';
    const gender = np.gender ?? 'masc';
    head.forms['number'] = number;
    // Expose the referent's gender for every person: the 1st/2nd-person surface is
    // gender-invariant ("io", "tu"), but Romance participle/adjective agreement still
    // depends on it ("tu sei stato/stata"), so downstream engines need to read it.
    head.forms['gender'] = gender;
    // Keep the furigana reading (if any) in step with whichever surface we select.
    if (number === 'plural') {
      // French/Spanish/Portuguese have a distinct feminine-plural pronoun (elles / ellas / elas, and
      // Spanish nosotras / vosotras); select it for a feminine referent, else the plain plural.
      // Italian/German/English/Japanese have no gendered plural and carry only `plural`.
      const pluralSurface = (gender === 'fem' && head.forms['plural_fem']) || head.forms['plural'];
      if (pluralSurface) { head.forms['base'] = pluralSurface; head.forms['plural'] = pluralSurface; }
      if (head.forms['plural_reading']) head.forms['reading'] = head.forms['plural_reading'];
    } else if (head.forms['person'] === '3') {
      const gf = head.forms[`singular_${gender}`];
      if (gf) head.forms['base'] = gf;
      const gr = head.forms[`singular_${gender}_reading`];
      if (gr) head.forms['reading'] = gr;
    }
    // 1st / 2nd person singular: base is already the correct form
    // Disjunctive (tonic/oblique) surface for prepositional use ("because of me/her/them"),
    // synthesised for the same number/gender as `base`. Engines that place a pronoun after
    // a preposition read forms['disjunctive'] (falling back to base when absent, e.g. ja).
    const disj =
      number === 'plural'
        ? head.forms['disjunctive_plural'] ?? head.forms['disjunctive']
        : head.forms['person'] === '3'
          ? head.forms[`disjunctive_${gender}`] ?? head.forms['disjunctive']
          : head.forms['disjunctive'];
    if (disj) head.forms['disjunctive'] = disj;
  } else {
    // Noun: apply number then gender. Determiner choice is threaded like number/gender
    // so each engine reads it off forms. Some quantifiers are inherently plural ("many
    // boys", "all boys"), so they force the plural surface — but only when the noun has
    // one (mass nouns like "water" stay singular: "some water").
    const definiteness = np.definiteness ?? 'definite';
    // Mass nouns ("water") never pluralise, so quantifiers keep them singular ("much water").
    const forcesPlural = PLURAL_DETERMINERS.has(definiteness) && head.forms['uncountable'] !== '1';
    const num = forcesPlural ? 'plural' : (np.number ?? 'singular');
    head.forms['number'] = (num === 'plural' && !head.forms['plural']) ? 'singular' : num;
    applyNounGender(head.forms, np.gender);
    head.forms['definiteness'] = definiteness;
  }
  // An adjective head is the predicate adjective of a subject complement ("seems happy") —
  // the one head that carries a comparative degree of its own. Thread it onto the head's
  // forms exactly as an attributive adjective's is below, so `adjDegree` reads either.
  if (head.forms['role'] === 'adjective' && np.headDegree && np.headDegree !== 'positive') {
    head.forms['degree'] = np.headDegree;
  }
  return {
    head,
    adjectives: (np.adjectives ?? []).map((id, i) => {
      const cf = resolve(id, language, lookup);
      // Thread the per-adjective comparative degree onto its forms (like number/gender/
      // definiteness) so each engine reads it off `forms['degree']`. Omit the plain form.
      const deg = np.adjectiveDegrees?.[i];
      if (deg && deg !== 'positive') cf.forms['degree'] = deg;
      return cf;
    }),
    // Attributive nouns ("sail boat"). Carry the relation through so each engine can
    // pick its linking preposition (Romance) or ignore it (en/de/ja neutralise). Apply
    // the modifier's own number (so Romance engines can select its plural surface and
    // agree its adjectives) and resolve those adjectives against that gender/number.
    nounModifiers: (np.nounModifiers ?? []).map((m) => {
      const concept = resolve(m.concept, language, lookup);
      const number = m.number ?? 'singular';
      // Fall back to singular when the lexicon has no plural surface (so isPlural/surface
      // don't select a missing form) — same guard the head noun uses above.
      concept.forms['number'] = (number === 'plural' && !concept.forms['plural']) ? 'singular' : number;
      return {
        concept,
        relation: m.relation,
        adjectives: (m.adjectives ?? []).map((id) => resolve(id, language, lookup)),
      };
    }),
    // A relative clause is the predicate half of a phrase whose subject is this
    // head. Recursing through resolveNounPhrase (its objects/complements are noun
    // phrases that may themselves carry `relative`) handles arbitrary nesting.
    relative: np.relative ? resolveRelativeClause(np.relative, language, lookup) : undefined,
    // A possessor is one of two shapes. A pronominal possessor ("his") is pure grammatical
    // features — it needs no lexicon lookup, so it passes straight through for the engine to
    // spell as a possessive pronoun. A genitive possessor is itself a noun phrase; recursing
    // handles its own adjectives, number/gender, and any nested possessor ("the cat's owner's book").
    possessor: np.possessor
      ? (isPronominalPossessor(np.possessor)
          ? np.possessor
          : resolveNounPhrase(np.possessor, language, lookup))
      : undefined,
    // An adjective-definition gloss ("of great size"): a bare dimension-noun + degree-adjective
    // phrase the engines wrap in the preposition its head noun's `dimensionRelation` selects. The
    // flag rides through; the head noun and its adjective resolve on the ordinary path above.
    dimensionGloss: np.dimensionGloss,
    // A manner-definition gloss ("at high speed", "in a good way"): a manner-noun phrase the engines
    // wrap in the adposition its head noun's `mannerRelation` selects, keeping its own determiner.
    // The flag rides through; the head noun and its adjective resolve on the ordinary path above.
    mannerGloss: np.mannerGloss,
  };
}

/** The agreement keys a group carries — see ResolvedNounElement.agreement. Nothing renderable. */
const AGREEMENT_KEYS = ['person', 'number', 'gender'] as const;

/**
 * The person / number / gender a coordinated group agrees as. The rules are the same in the six
 * languages that agree at all (ja agrees with nothing), so they live here rather than per engine:
 *
 *  · **and** — the group is plural whatever its conjuncts are ("Peter and Paul **speak**"), takes
 *    the lowest person of them (1 ≺ 2 ≺ 3: "you and I **are**" is 1st plural), and, in the
 *    languages that resolve gender, is feminine only if *every* conjunct is — one masculine
 *    conjunct masculinises the whole ("il gatto e la volpe sono stanch**i**").
 *  · **or** — the group agrees with the conjunct *nearest* the verb, i.e. the last ("Peter or the
 *    boys **speak**", "o Pietro o i ragazzi parl**ano**"): the disjunction asserts one of them,
 *    not both, so there is no group to resolve.
 *
 * A single conjunct resolves to its own head's forms untouched, which is exactly what the engines
 * read before coordination existed.
 */
function groupAgreement(
  conjuncts: ResolvedNounPhrase[],
  conjunction: CoordConjunction,
): Record<string, string> {
  const last = conjuncts[conjuncts.length - 1].head.forms;
  const features: Record<string, string> =
    // Disjunction: the nearest conjunct is the one the verb agrees with — take its features whole.
    conjunction !== 'and'
      ? Object.fromEntries(AGREEMENT_KEYS.filter((k) => last[k] !== undefined).map((k) => [k, last[k]]))
      : (() => {
          const persons = conjuncts.map((c) => c.head.forms['person'] ?? '3');
          const person = ['1', '2', '3'].find((p) => persons.includes(p)) ?? '3';
          const feminine = conjuncts.every((c) => c.head.forms['gender'] === 'fem');
          return { person, number: 'plural', gender: feminine ? 'fem' : 'masc' };
        })();
  // The negative determiner is not agreement, but it *is* a fact about the whole group that the
  // engines read off the subject: French negates on "aucun" alone ("aucun garçon ne pleure"), so
  // a group with any negative conjunct still triggers the concord.
  if (conjuncts.some((c) => c.head.forms['definiteness'] === 'no')) features['definiteness'] = 'no';
  return features;
}

/**
 * Resolve a noun slot: each conjunct as a full noun phrase, plus the agreement they resolve to
 * together. A slot holding a single phrase yields a one-conjunct element with that phrase's own
 * head forms as its agreement — no coordination, no behaviour change.
 *
 * The group's plural number is a fact about the *group*, not about its members, so it is not
 * pushed back down into the conjuncts: "Peter and the boys" keeps a singular Peter.
 */
function resolveNounElement(el: NounElement, language: string, lookup: LexiconLookup): ResolvedNounElement {
  const conjuncts = nounConjuncts(el).map((np) => resolveNounPhrase(np, language, lookup));
  if (!isNounGroup(el) || conjuncts.length < 2) {
    return { conjuncts, agreement: conjuncts[0].head.forms };
  }
  return {
    conjuncts,
    conjunction: el.conjunction,
    agreement: groupAgreement(conjuncts, el.conjunction),
  };
}

/** Resolve a verb phrase (the shared predicate head of a plan or a relative clause). Only
 *  called when a verb phrase is present — a verbless period skips it (see translate). */
function resolveVerbPhrase(
  vp: VerbPhrase,
  language: string,
  lookup: LexiconLookup,
  mood?: Mood,
  register?: ImperativeRegister,
): ResolvedVerbPhrase {
  // An imperative or an infinitive is a mood that occupies the finite/mood slot: it is always
  // present-tense, neutral-aspect and modal-free. The UI already enforces this, but normalise
  // defensively so a stale or hand-built plan can't feed a tensed/aspectual/modal one to the
  // engines. Only the imperative carries a register (it is a speech act); the infinitive does not.
  const imperative = mood === 'imperative';
  const finiteSlotTaken = imperative || mood === 'infinitive';
  return {
    verb: resolve(vp.verb, language, lookup),
    negative: vp.negative,
    tense: finiteSlotTaken ? 'present' : vp.tense,
    aspect: finiteSlotTaken ? 'neutral' : vp.aspect,
    mood,
    register: imperative ? (register ?? 'request') : undefined,
    modifier: vp.modifier ? resolve(vp.modifier, language, lookup) : undefined,
    // Modal verbs governing the predicate, outermost first. Each is a verb concept, so it
    // resolves to its own conjugation table plus the `nonfinite` / `link` joinery keys; each may
    // also carry its own adverb, resolved alongside.
    modals: finiteSlotTaken
      ? []
      : (vp.modals ?? []).map((ref) => {
          // A bare string is shorthand for a modal with no adverb of its own.
          const m = typeof ref === 'string' ? { verb: ref } : ref;
          return {
            verb: resolve(m.verb, language, lookup),
            modifier: m.modifier ? resolve(m.modifier, language, lookup) : undefined,
          };
        }),
  };
}

/**
 * Resolve the complement map (locative / direction / source / route). Each value is a
 * noun phrase with any specifiers carried straight through as plain data. Shared by the
 * top-level plan and by every relative clause.
 */
function resolveComplements(
  complements: PhrasePlan['complements'],
  language: string,
  lookup: LexiconLookup,
): Partial<Record<ComplementType, ResolvedComplement>> | undefined {
  if (!complements) return undefined;
  const out: Partial<Record<ComplementType, ResolvedComplement>> = {};
  for (const [type, value] of Object.entries(complements)) {
    if (!value?.phrase || !nounConjuncts(value.phrase).every((np) => np.concept)) continue;
    // The unchosen determiner depends on the slot: `predicative` defaults to indefinite,
    // every other complement to definite. See `defaultDefiniteness`. Each conjunct of a
    // coordinated complement chooses its own, so the default is applied per conjunct.
    const withDeterminer = (np: NounPhrase): NounPhrase =>
      np.definiteness === undefined ? { ...np, definiteness: defaultDefiniteness(type) } : np;
    const phrase: NounElement = isNounGroup(value.phrase)
      ? { ...value.phrase, conjuncts: value.phrase.conjuncts.map(withDeterminer) }
      : withDeterminer(value.phrase);
    const resolvedPhrase = resolveNounElement(phrase, language, lookup);
    // An *adjective-modified* measure manner adverbial names a generic rate ("at high speed"),
    // not an identifiable one, so a definite article reads oddly ("at *the* high speed"). Force
    // it bare. Two cases keep their article, as they are genuinely specific: a bare measure noun
    // is anaphoric ("at *the* speed" — a known speed), and a possessor makes it specific ("at
    // *the* speed of light"). Applied after resolution because the manner relation and adjectives
    // are only known once the head is looked up; the determiner is fixed for this slot in the UI.
    if (type === 'manner') {
      for (const conjunct of resolvedPhrase.conjuncts) {
        if (
          mannerRelation(conjunct.head.forms) === 'measure' &&
          conjunct.adjectives.length > 0 &&
          !conjunct.possessor
        ) {
          conjunct.head.forms['definiteness'] = 'bare';
        }
      }
    }
    out[type as ComplementType] = {
      phrase: resolvedPhrase,
      // The action an instrument *is* at the process/concept levels ("by **choosing** a word").
      // It is non-finite — it takes no tense, mood or agreement of its own — so it resolves with
      // none, and each engine reads the lexical forms (gerund / infinitive / te-form) it needs.
      action: value.action ? resolveVerbPhrase(value.action, language, lookup) : undefined,
      specifiers: value.specifiers,
    };
  }
  return out;
}

/**
 * Resolve a relative clause: its verb phrase, optional objects, and complements. The
 * gap slot named by `headRole` (default 'subject') is filled by the head noun above,
 * so it is absent from the clause's own fields; a non-subject relative carries its own
 * `subject`, which the engines use for agreement.
 */
function resolveRelativeClause(
  clause: RelativeClause,
  language: string,
  lookup: LexiconLookup,
): ResolvedRelativeClause {
  return {
    headRole: clause.headRole ?? 'subject',
    subject: clause.subject ? resolveNounElement(clause.subject, language, lookup) : undefined,
    verbPhrase: resolveVerbPhrase(clause.verbPhrase, language, lookup),
    directObject: clause.directObject ? resolveNounElement(clause.directObject, language, lookup) : undefined,
    complements: resolveComplements(clause.complements, language, lookup),
  };
}

/**
 * The conjunction joining a coordination, normalised for the mood of the pair. Only four of the
 * six can join two commands (see IMPERATIVE_COORD_CONJUNCTIONS); the UI never offers the other
 * two under an imperative, but a stale or hand-built plan that asks for one falls back to the
 * plain copulative rather than losing the second command.
 */
function coordConjunction(conjunction: CoordConjunction, imperative: boolean): CoordConjunction {
  return imperative && !canCoordinateImperative(conjunction) ? 'and' : conjunction;
}

/**
 * Resolve one plan for one language. `mood` is threaded onto the verb phrase — set for the two
 * halves of a conditional (main = 'conditional', condition = 'subjunctive'), for a command
 * ('imperative'), and left undefined for a plain (indicative) sentence. `register` is the
 * addressee register a coordinated command inherits from its first clause; at the top level it
 * is absent and the plan's own `imperativeRegister` applies. The condition and the coordinated
 * clause are resolved recursively.
 */
function resolvePhrase(
  plan: PhrasePlan,
  language: string,
  lookup: LexiconLookup,
  mood?: Mood,
  register?: ImperativeRegister,
): ResolvedPhrase {
  const imperative = mood === 'imperative';
  const impRegister = imperative ? (register ?? plan.imperativeRegister) : undefined;
  return {
    subject: resolveNounElement(plan.subject, language, lookup),
    // A verbless period (bare noun phrase) has no verb phrase to resolve; the engines
    // render just the subject when it is absent.
    verbPhrase: plan.verbPhrase
      ? resolveVerbPhrase(plan.verbPhrase, language, lookup, mood, impRegister)
      : undefined,
    directObject: plan.directObject ? resolveNounElement(plan.directObject, language, lookup) : undefined,
    complements: resolveComplements(plan.complements, language, lookup),
    // A hypothetical condition: this plan becomes the main clause (conditional mood) and its
    // `condition` the protasis (subjunctive mood). Conditions don't nest.
    condition: plan.condition
      ? resolvePhrase(plan.condition, language, lookup, 'subjunctive')
      : undefined,
    // A coordinated second clause; the conjunction word is chosen per-engine at render time.
    // Coordination is a symmetric join, so the second clause carries the same illocutionary
    // force as the first: under a command it is resolved in the imperative mood too, with the
    // first clause's register and addressee (its own subject is dropped from the surface, so
    // taking the first's keeps the pair addressed to one and the same person). A conditional
    // main clause coordinates a plain indicative clause. Coordination doesn't nest.
    coordination: plan.coordination
      ? {
          conjunction: coordConjunction(plan.coordination.conjunction, imperative),
          clause: resolvePhrase(
            imperative ? { ...plan.coordination.clause, subject: plan.subject } : plan.coordination.clause,
            language,
            lookup,
            imperative ? 'imperative' : undefined,
            impRegister,
          ),
        }
      : undefined,
  };
}

/**
 * Render a word — or a few words naming one thing together ("second singular") — into every
 * language: a UI label, which is a word and not a period (see UiStringWordDef). `agreesWith`
 * names the noun the words describe: an adjective has no meaningful form until something fixes
 * its gender/number, and a label like the "first" of the person row is agreeing with the row's
 * own noun even though that noun is nowhere on screen. Its gender is a fact about each language's
 * lexicon (it "persona" is feminine, "genere" masculine), so it is resolved per language and
 * threaded onto each word's own forms for the engine to read. Several words are joined the way
 * the language joins words — with a space, or with nothing in Japanese.
 */
export function translateWord(
  conceptIds: string | string[],
  lookup: LexiconLookup,
  agreesWith?: string,
): Translation[] {
  const ids = Array.isArray(conceptIds) ? conceptIds : [conceptIds];
  return engines.map((engine) => {
    const words = ids.map((id) => {
      const word = resolve(id, engine.language, lookup);
      if (agreesWith) {
        const noun = resolve(agreesWith, engine.language, lookup).forms;
        word.forms['gender'] = noun['gender'] ?? 'masc';
        word.forms['number'] = noun['number'] ?? noun['count'] ?? 'singular';
      }
      return engine.renderWord?.(word) ?? word.forms['base'] ?? '';
    });
    return {
      language: engine.language,
      text: words.filter(Boolean).join(engine.wordJoiner ?? ' '),
    };
  });
}

/**
 * Render one determiner value into every language — the words of the UI's determiner menu (see
 * UiStringDeterminerDef). A determiner has no form of its own: it agrees with the noun it
 * determines, and in the Romance languages it also elides against that noun's first sound. So it
 * is cited *with* a noun — `agreesWith`, the same device the adjective labels use — whose
 * gender/number/first letter each engine reads off the forms threaded here. The noun itself is
 * not rendered; only the determiner it would take comes back.
 *
 * A language that spells no determiner here (the bare article in all seven; every article in
 * Japanese, which leaves identifiability to context) renders '' and is shown as an em-dash — the
 * same "no word goes here" the bare determiner means.
 */
export function translateDeterminer(
  value: Definiteness,
  lookup: LexiconLookup,
  agreesWith = 'NOUN',
): Translation[] {
  return engines.map((engine) => {
    const noun = resolve(agreesWith, engine.language, lookup);
    noun.forms['definiteness'] = value;
    // The inherently-plural quantifiers name themselves in the plural, which is both how they
    // are spoken and what tells them apart where they inflect (it "molti / pochi / tutti"). The
    // articles, the demonstratives and `no` name themselves in the singular — the same rule the
    // noun phrases themselves follow, so it comes off the same set.
    noun.forms['number'] = PLURAL_DETERMINERS.has(value) ? 'plural' : 'singular';
    return {
      language: engine.language,
      text: engine.renderDeterminer?.(noun)?.trim() || '—',
    };
  });
}

export function translate(plan: PhrasePlan, lookup: LexiconLookup): Translation[] {
  return engines.map((engine) => {
    // The top clause's mood: 'conditional' when a hypothetical condition is attached,
    // 'imperative' for a command, 'infinitive' for a bare citation phrase (a verb definition),
    // else plain indicative (undefined). These are mutually exclusive (the UI never sets more
    // than one). A command hands its mood on to a coordinated second clause (see resolvePhrase)
    // but never to a relative clause.
    const topMood: Mood | undefined = plan.condition
      ? 'conditional'
      : plan.imperative
        ? 'imperative'
        : plan.infinitive
          ? 'infinitive'
          : undefined;
    const resolved = resolvePhrase(plan, engine.language, lookup, topMood);
    // Every rendered period closes with its language's full stop, appended here rather
    // than by each engine — the ruby segments must carry the same one, unread.
    const stop = engine.terminator ?? '.';
    const ruby = engine.renderRuby?.(resolved);
    return {
      language: engine.language,
      text: engine.render(resolved) + stop,
      ...(ruby ? { ruby: [...ruby, { t: stop }] } : {}),
    };
  });
}
