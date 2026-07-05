import { COMPLEMENT_RENDER_ORDER, type ComplementType, type PathSpecifier, type Tense } from '@signi/shared';
import { npAdj, pathSpecifier, type ResolvedComplement, type ResolvedNounPhrase, type ResolvedVerbPhrase, type LanguageEngine, type ResolvedPhrase } from '../types.js';

const PREP: Record<ComplementType, string> = {
  locative: 'in',
  direction: 'to',
  source: 'from',
  route: 'through',
};

const PATH_PREP: Record<PathSpecifier, string> = {
  through: 'through',
  under: 'under',
  over: 'over',
  around: 'around',
  behind: 'behind',
  in_front_of: 'in front of',
};

function getArticle(forms: Record<string, string>): string {
  const count = forms['number'] ?? forms['count'] ?? 'singular';
  if (count === 'plural') return '';
  const base = forms['base'] ?? '';
  return /^[aeiou]/i.test(base) ? 'an' : 'a';
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
  const inner = withRelative(nounPhrase(poss.head.forms, true, npAdj(poss), poss.possessor), poss);
  return `${inner}${genitiveMarker(poss)} `;
}

function nounPhrase(forms: Record<string, string>, definite = false, adj?: string, possessor?: ResolvedNounPhrase): string {
  const count = forms['number'] ?? forms['count'] ?? 'singular';
  const word = count === 'plural' ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const a = adj ? `${adj} ` : '';
  // A possessor replaces the article: "the cat's book", not "the cat's the book".
  if (possessor) return `${possessivePrefix(possessor)}${a}${word}`;
  if (definite) return `the ${a}${word}`;
  return `${getArticle(forms)} ${a}${word}`;
}

function subjectPhrase(np: ResolvedNounPhrase): string {
  const forms = np.head.forms;
  if (forms['person']) {
    if (forms['number'] === 'plural' && forms['plural']) return forms['plural'];
    return forms['base'] ?? '';
  }
  return nounPhrase(forms, true, npAdj(np), np.possessor); // noun — definite article
}

function complementsPhrase(complements?: Partial<Record<ComplementType, ResolvedComplement>>): string {
  if (!complements) return '';
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      const prep = type === 'route' ? PATH_PREP[pathSpecifier(c)] : PREP[type];
      return `${prep} ${withRelative(nounPhrase(c.phrase.head.forms, true, npAdj(c.phrase), c.phrase.possessor), c.phrase)}`;
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
    ? withRelative(nounPhrase(directObject.head.forms, true, npAdj(directObject), directObject.possessor), directObject)
    : '';
  // Prepositional dative: "to the cat"
  const indirectObjectText = indirectObject
    ? `to ${withRelative(nounPhrase(indirectObject.head.forms, true, npAdj(indirectObject), indirectObject.possessor), indirectObject)}`
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
 * A restrictive relative clause on `np`: relativizer + the clause's predicate, the head
 * noun serving as the clause's subject. "who" for an animate head, "that" otherwise.
 */
function relativeText(np: ResolvedNounPhrase): string {
  const rel = np.relative;
  if (!rel) return '';
  const pronoun = np.head.forms['animate'] === '1' ? 'who' : 'that';
  return [pronoun, ...predicateParts(np.head.forms, rel.verbPhrase, rel.directObject, rel.indirectObject, rel.complements)]
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
    return [
      subjectText,
      ...predicateParts(subject.head.forms, phrase.verbPhrase, phrase.directObject, phrase.indirectObject, phrase.complements),
    ]
      .filter(Boolean)
      .join(' ')
      .trim();
  },
};
