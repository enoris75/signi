import { COMPLEMENT_RENDER_ORDER, type ComplementType, type Degree, type PathSpecifier, type Tense } from '@signi/shared';
import { adjDegree, causeSentiment, pathSpecifier, type ConceptForms, type ResolvedComplement, type ResolvedNounPhrase, type ResolvedVerbPhrase, type LanguageEngine, type ResolvedPhrase } from '../types.js';

// Periphrastic degree words placed before the adjective ("more beautiful", "the most
// beautiful"). English marks the superlative with "the", which the noun's own determiner
// already supplies, so only the degree adverb is added here.
const EN_DEGREE: Record<Degree, string> = {
  positive: '', more: 'more', most: 'most', less: 'less', least: 'least', equally: 'equally',
};

/** One adjective's surface with its degree adverb prepended ("more beautiful"). */
function enAdj(a: ConceptForms): string {
  const base = a.forms['base'] ?? '';
  const d = EN_DEGREE[adjDegree(a)];
  return d && base ? `${d} ${base}` : base;
}

/** Join a resolved noun phrase's adjectives, each carrying its comparative degree. */
function npAdj(np: ResolvedNounPhrase): string {
  return np.adjectives.map(enAdj).filter(Boolean).join(' ');
}

const PREP: Record<ComplementType, string> = {
  locative: 'in',
  direction: 'to',
  source: 'from',
  route: 'through',
  cause: 'because of',
  predicative: '', // subject complement — no adposition ("becomes a legend", "seems happy")
};

const PATH_PREP: Record<PathSpecifier, string> = {
  through: 'through',
  under: 'under',
  over: 'over',
  around: 'around',
  behind: 'behind',
  in_front_of: 'in front of',
};

/**
 * The determiner for a noun phrase, from its `definiteness` (default 'definite'):
 * "the", "a/an", nothing (bare), or a quantifier (some/no/many/few/all). "a" vs "an" is
 * chosen on the sound of `lead` — the first word that will actually follow the article
 * (an adjective if present, else the noun) — and an indefinite plural is bare ("a wolf"
 * → plural "wolves"). Returns the determiner with a trailing space, or "" for bare.
 */
function determiner(forms: Record<string, string>, lead: string): string {
  const definiteness = forms['definiteness'] ?? 'definite';
  const mass = forms['uncountable'] === '1';
  switch (definiteness) {
    case 'bare':  return '';
    case 'some':  return 'some ';
    case 'no':    return 'no ';
    case 'many':  return mass ? 'much ' : 'many ';   // mass: much water
    case 'few':   return mass ? 'little ' : 'few ';  // mass: little water
    case 'all':   return 'all ';
    case 'indefinite': {
      if (mass) return '';                            // no "a water" — bare
      const count = forms['number'] ?? forms['count'] ?? 'singular';
      if (count === 'plural') return '';
      return /^[aeiou]/i.test(lead) ? 'an ' : 'a ';
    }
    default:      return 'the ';
  }
}

function conjugate(forms: Record<string, string>, subjectForms: Record<string, string>, tense: Tense = 'present'): string {
  const person = subjectForms['person'] ?? '3';
  const number = subjectForms['number'] ?? 'singular';
  const n = number === 'plural' ? 'pl' : 'sg';
  // English past ("ate") is invariant across persons, so a single `past` form
  // covers all; present keeps its per-person keys.
  return forms[`${person}${n}_${tense}`] ?? forms[tense] ?? forms[`${person}${n}_present`] ?? forms['base'] ?? '';
}

/**
 * The Saxon genitive marker for a possessor: "'s", but a bare "'" after a plural that
 * already ends in -s ("the cats' book").
 */
function genitiveMarker(np: ResolvedNounPhrase): string {
  const forms = np.head.forms;
  const plural = (forms['number'] ?? forms['count']) === 'plural';
  const word = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  return plural && word.endsWith('s') ? "'" : "'s";
}

/**
 * A possessor rendered as a Saxon-genitive prefix ("the cat's "). The possessor is a
 * definite noun phrase (recursing for its own possessor / relative clause) followed by
 * the genitive marker; the possessed head drops its own article.
 */
function possessivePrefix(poss: ResolvedNounPhrase): string {
  const inner = withRelative(nounPhrase(poss.head.forms, npAdj(poss), nounMods(poss), poss.possessor), poss);
  return `${inner}${genitiveMarker(poss)} `;
}

/**
 * Attributive nouns as a bare prenominal string ("sail" in "sail boat"). English
 * neutralises the relation entirely — the noun is just juxtaposed before the head.
 */
function nounMods(np: ResolvedNounPhrase): string {
  return np.nounModifiers.map((m) => m.concept.forms['base']).filter(Boolean).join(' ');
}

function nounPhrase(forms: Record<string, string>, adj?: string, mods?: string, possessor?: ResolvedNounPhrase): string {
  const count = forms['number'] ?? forms['count'] ?? 'singular';
  const word = count === 'plural' ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const a = adj ? `${adj} ` : '';
  // Noun-modifiers sit between the adjectives and the head: "the big sail boat".
  const m = mods ? `${mods} ` : '';
  // A possessor replaces the article: "the cat's book", not "the cat's the book".
  if (possessor) return `${possessivePrefix(possessor)}${a}${m}${word}`;
  // "a/an" agrees with the first word after the article (adjective, else modifier, else noun).
  const lead = adj || mods || word;
  return `${determiner(forms, lead)}${a}${m}${word}`;
}

function subjectPhrase(np: ResolvedNounPhrase): string {
  const forms = np.head.forms;
  if (forms['person']) {
    if (forms['number'] === 'plural' && forms['plural']) return forms['plural'];
    return forms['base'] ?? '';
  }
  return nounPhrase(forms, npAdj(np), nounMods(np), np.possessor); // noun — determiner from forms
}

function complementsPhrase(complements?: Partial<Record<ComplementType, ResolvedComplement>>): string {
  if (!complements) return '';
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      const f = c.phrase.head.forms;
      // A pronoun complement ("because of him/her/them") takes the oblique form with no
      // article — only the causal adjunct accepts a pronoun in the UI today. Positive credits
      // with "thanks to"; English has no distinct neutral/negative connector, so both read
      // "because of" (the blame sense rides on "because of" itself).
      if (type === 'cause' && f['person']) {
        const prep = causeSentiment(c) === 'positive' ? 'thanks to' : 'because of';
        return `${prep} ${f['disjunctive'] ?? f['base'] ?? ''}`;
      }
      // Subject complement: a predicate adjective is bare ("seems happy" — English
      // adjectives don't inflect); a predicate noun keeps its own article, no preposition
      // ("becomes a legend").
      if (type === 'predicative') {
        if (f['role'] === 'adjective') return f['base'] ?? '';
        return withRelative(nounPhrase(f, npAdj(c.phrase), nounMods(c.phrase), c.phrase.possessor), c.phrase);
      }
      const prep = type === 'route' ? PATH_PREP[pathSpecifier(c)]
        : type === 'cause' ? (causeSentiment(c) === 'positive' ? 'thanks to' : 'because of')
        : PREP[type];
      return `${prep} ${withRelative(nounPhrase(c.phrase.head.forms, npAdj(c.phrase), nounMods(c.phrase), c.phrase.possessor), c.phrase)}`;
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * The predicate half of a phrase — everything after the subject — as ordered parts.
 * Shared by the top-level sentence and by relative clauses, which pass the head noun's
 * forms as `subjectForms` so the verb agrees with the head.
 */
function predicateParts(
  subjectForms: Record<string, string>,
  verbPhrase: ResolvedVerbPhrase,
  directObject?: ResolvedNounPhrase,
  indirectObject?: ResolvedNounPhrase,
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
): string[] {
  const { verb, negative: verbNegative, modifier, tense = 'present' } = verbPhrase;

  const directObjectText = directObject
    ? withRelative(nounPhrase(directObject.head.forms, npAdj(directObject), nounMods(directObject), directObject.possessor), directObject)
    : '';
  // Prepositional dative: "to the cat"
  const indirectObjectText = indirectObject
    ? `to ${withRelative(nounPhrase(indirectObject.head.forms, npAdj(indirectObject), nounMods(indirectObject), indirectObject.possessor), indirectObject)}`
    : '';
  const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
  const isFrequency = modifier?.forms['subtype'] === 'frequency';
  const complementsText = complementsPhrase(complements);
  const modifierIsNegative = modifier?.forms['polarity'] === 'negative';

  if (verbNegative && !modifierIsNegative) {
    const person = subjectForms['person'] ?? '3';
    const number = subjectForms['number'] ?? 'singular';
    // Negation auxiliary is tense-driven: "do/does not" (present),
    // "did not" (past), "will not" (future) — all followed by the bare base.
    const aux =
      tense === 'past'   ? 'did not' :
      tense === 'future' ? 'will not' :
      (person === '3' && number === 'singular') ? 'does not' : 'do not';
    const base = verb.forms['base'] ?? conjugate(verb.forms, subjectForms);
    // Frequency adverbs slot between aux and base: "do not always drink"
    const negVerb = isFrequency && modifierText ? `${aux} ${modifierText} ${base}` : `${aux} ${base}`;
    const trailingMod = isFrequency ? '' : modifierText;
    return [negVerb, directObjectText, indirectObjectText, complementsText, trailingMod];
  }
  // Future is periphrastic ("will eat"); present/past come from the forms map.
  const verbText = tense === 'future'
    ? `will ${verb.forms['base'] ?? ''}`
    : conjugate(verb.forms, subjectForms, tense);
  // Frequency adverbs (always, never) precede the main verb: S Adv V Obj
  // Manner adverbs (fast, slowly) follow the verb/object: S V Obj Adv
  const preVerb  = isFrequency ? modifierText : '';
  const postVerb = isFrequency ? '' : modifierText;
  return [preVerb, verbText, directObjectText, indirectObjectText, complementsText, postVerb];
}

/**
 * A restrictive relative clause on `np`: relativizer + the clause's predicate. "who"
 * for an animate head, "that" otherwise (English uses the same relativizer whether the
 * head is the clause's subject or object). For a subject-relative the head fills the
 * subject slot and drives agreement ("the boy who cried"). For a non-subject relative
 * the gap slot is already absent from the clause and it carries its own subject, which
 * is rendered after the relativizer and drives agreement ("the book that I read").
 */
function relativeText(np: ResolvedNounPhrase): string {
  const rel = np.relative;
  if (!rel) return '';
  const pronoun = np.head.forms['animate'] === '1' ? 'who' : 'that';
  const subjectRelative = rel.headRole === 'subject' || !rel.subject;
  const agreeForms = subjectRelative ? np.head.forms : rel.subject!.head.forms;
  const subjText = subjectRelative ? '' : withRelative(subjectPhrase(rel.subject!), rel.subject!);
  return [pronoun, subjText, ...predicateParts(agreeForms, rel.verbPhrase, rel.directObject, rel.indirectObject, rel.complements)]
    .filter(Boolean)
    .join(' ');
}

/** Append a noun phrase's relative clause (if any) to its already-rendered surface. */
function withRelative(text: string, np: ResolvedNounPhrase): string {
  const rel = relativeText(np);
  return rel ? `${text} ${rel}` : text;
}

export const englishEngine: LanguageEngine = {
  language: 'en',
  render(phrase: ResolvedPhrase): string {
    const { subject } = phrase;
    const subjectText = withRelative(subjectPhrase(subject), subject);
    // Verbless period: a bare noun phrase ("breaking news").
    if (!phrase.verbPhrase) return subjectText.trim();
    return [
      subjectText,
      ...predicateParts(subject.head.forms, phrase.verbPhrase, phrase.directObject, phrase.indirectObject, phrase.complements),
    ]
      .filter(Boolean)
      .join(' ')
      .trim();
  },
};
