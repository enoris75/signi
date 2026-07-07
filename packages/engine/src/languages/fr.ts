import { COMPLEMENT_RENDER_ORDER, type ComplementType, type ModifierRelation, type Tense } from '@signi/shared';
import { causeSentiment, pathSpecifier, type ResolvedComplement, type ResolvedNounPhrase, type ResolvedVerbPhrase, type LanguageEngine, type ResolvedPhrase } from '../types.js';

const VOWEL_START = /^[aeiouéèêëàâîïôùûü]/i;

/**
 * Concept IDs of the "BAGS" adjectives (beauty, age, goodness, size) that precede the
 * noun in French — beau, bon, grand, petit, vieux, jeune, nouveau, mauvais. Every other
 * adjective (heureux, triste, fort, …) follows the noun.
 */
const PRENOMINAL = new Set(['BIG', 'SMALL', 'GOOD', 'BAD', 'OLD', 'YOUNG', 'NEW', 'BEAUTIFUL']);

/**
 * The definite article, selected by the sound of the word that actually follows it
 * (`lead`) — the first prenominal adjective when present, otherwise the noun itself
 * ("l'ami" but "le petit ami", "le bon ami").
 */
function defArticle(forms: Record<string, string>, plural = false, lead?: string): string {
  const gender = forms['gender'] ?? 'masc';
  if (plural) return 'les';
  const base = lead ?? forms['base'] ?? '';
  if (VOWEL_START.test(base)) return "l'";
  return gender === 'fem' ? 'la' : 'le';
}

/**
 * The indefinite article: masc "un", fem "une", plural "des" (French keeps a plural
 * indefinite, unlike the Romance siblings). "un"/"une" don't elide before a vowel.
 */
function indefArticle(forms: Record<string, string>, plural: boolean): string {
  if (plural) return 'des';
  return (forms['gender'] ?? 'masc') === 'fem' ? 'une' : 'un';
}

/**
 * The determiner for a subject/direct-object noun phrase, from its `definiteness`
 * (default 'definite'): the definite/indefinite article, nothing (bare), or a quantifier.
 * "beaucoup/peu de" take a bare noun (the "de" elides before a vowel); "tous/toutes les"
 * carry the definite article; "aucun/e" is singular and drives verb negation ("ne") upstream.
 */
function artFor(forms: Record<string, string>, plural: boolean, lead: string): string {
  const definiteness = forms['definiteness'] ?? 'definite';
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  const de = VOWEL_START.test(lead) ? "d'" : 'de';
  // Mass nouns ("eau") stay singular and take the partitive "de l'/du/de la" for
  // some/indefinite; "beaucoup/peu de" already work; "all" → "tout/toute" + article.
  if (forms['uncountable'] === '1') {
    switch (definiteness) {
      case 'bare':       return '';
      case 'indefinite': return dePrep(forms, false, lead);   // partitive: "de l'eau"
      case 'some':       return dePrep(forms, false, lead);   // partitive: "de l'eau"
      case 'many':       return `beaucoup ${de}`;
      case 'few':        return `peu ${de}`;
      case 'all':        return `${fem ? 'toute' : 'tout'} ${defArticle(forms, false, lead)}`;
      case 'no':         return fem ? 'aucune' : 'aucun';
      default:           return defArticle(forms, false, lead);
    }
  }
  switch (definiteness) {
    case 'bare':       return '';
    case 'indefinite': return indefArticle(forms, plural);
    case 'some':       return 'quelques';
    case 'many':       return `beaucoup ${de}`;
    case 'few':        return `peu ${de}`;
    case 'all':        return `${fem ? 'toutes' : 'tous'} ${defArticle(forms, true, lead)}`;
    case 'no':         return fem ? 'aucune' : 'aucun';
    default:           return defArticle(forms, plural, lead);
  }
}

/** Join an article/preposition head to the following word: no space after elision. */
function joinArt(head: string, word: string): string {
  if (!head) return word; // bare noun phrase — no article
  return head.endsWith("'") ? `${head}${word}` : `${head} ${word}`;
}

/**
 * French "à" (to) + definite article contractions:
 * à+le=au, à+les=aux, à+la=à la, à+l'=à l'
 */
function datPrep(forms: Record<string, string>, plural = false, lead?: string): string {
  const art = defArticle(forms, plural, lead);
  if (art === 'le') return 'au';
  if (art === 'les') return 'aux';
  return `à ${art}`; // "à la", "à l'"
}

/**
 * French "de" (from) + definite article contractions:
 * de+le=du, de+les=des, de+la=de la, de+l'=de l'
 */
function dePrep(forms: Record<string, string>, plural = false, lead?: string): string {
  const art = defArticle(forms, plural, lead);
  if (art === 'le') return 'du';
  if (art === 'les') return 'des';
  return `de ${art}`; // "de la", "de l'"
}

function conjugate(forms: Record<string, string>, subjectForms: Record<string, string>, tense: Tense = 'present'): string {
  const person = subjectForms['person'] ?? '3';
  const number = subjectForms['number'] ?? 'singular';
  const n = number === 'plural' ? 'pl' : 'sg';
  return forms[`${person}${n}_${tense}`] ?? forms[tense] ?? forms[`${person}${n}_present`] ?? forms['base'] ?? '';
}

/** French linking preposition for an attributive noun, by relation (bare, no article). */
const REL_PREP_FR: Record<ModifierRelation, string> = { feature: 'à', purpose: 'de', material: 'de' };

/** Postnominal attributive nouns as a bare "prep + noun" string; "de" elides before a vowel. */
function frMods(np: ResolvedNounPhrase): string {
  return np.nounModifiers
    .map((m) => {
      const base = m.concept.forms['base'];
      if (!base) return '';
      const prep = REL_PREP_FR[m.relation];
      return prep === 'de' && VOWEL_START.test(base) ? `d'${base}` : `${prep} ${base}`;
    })
    .filter(Boolean)
    .join(' ');
}

/** Split a phrase's adjectives (surface = base form) into pre- and post-nominal groups. */
function splitAdjectives(np: ResolvedNounPhrase): { pre: string[]; post: string[] } {
  const pre: string[] = [];
  const post: string[] = [];
  for (const a of np.adjectives) {
    const word = a.forms['base'] ?? '';
    if (!word) continue;
    (PRENOMINAL.has(a.conceptId) ? pre : post).push(word);
  }
  return { pre, post };
}

/**
 * Render a noun phrase: [head] [prenominal adjectives] noun [postnominal adjectives].
 * `headFor` builds the article/preposition, receiving the surface of the word that will
 * follow it (`lead`) so it can pick the right elision ("le" vs "l'").
 */
function renderNP(np: ResolvedNounPhrase, headFor: (plural: boolean, lead: string) => string): string {
  const forms = np.head.forms;
  const plural = (forms['number'] ?? forms['count']) === 'plural';
  const noun = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const { pre, post } = splitAdjectives(np);
  const lead = pre[0] ?? noun;
  const core = joinArt(headFor(plural, lead), [...pre, noun].join(' '));
  const postStr = post.join(' et ');
  const postAdj = postStr ? `${core} ${postStr}` : core;
  // Attributive nouns are postnominal and bare, the relation choosing the preposition:
  // feature "à" (bateau à voile), purpose/material "de" (lunettes de soleil). Distinct
  // from the possessor's contracted "du/de la".
  const mods = frMods(np);
  const withPost = mods ? `${postAdj} ${mods}` : postAdj;
  // A possessor is postnominal, headed by "de"+article contracted ("le livre du chat").
  // Rendering it through renderNP recurses for its own adjectives / nested possessor.
  const poss = np.possessor;
  const base = poss
    ? `${withPost} ${renderNP(poss, (plural, lead) => dePrep(poss.head.forms, plural, lead))}`
    : withPost;
  const rel = relativeText(np);
  return rel ? `${base} ${rel}` : base;
}

function subjectPhrase(np: ResolvedNounPhrase): string {
  const forms = np.head.forms;
  if (forms['person']) {
    if (forms['number'] === 'plural' && forms['plural']) return forms['plural'];
    return forms['base'] ?? '';
  }
  return renderNP(np, (plural, lead) => artFor(forms, plural, lead)); // noun — determiner from forms
}

/** route path relation → preposition (+ "de"-contraction for those governing "de"). */
function routeHead(c: ResolvedComplement, plural: boolean, lead: string): string {
  const f = c.phrase.head.forms;
  const art = defArticle(f, plural, lead);
  switch (pathSpecifier(c)) {
    case 'under':       return `sous ${art}`;
    case 'over':        return `au-dessus ${dePrep(f, plural, lead)}`;
    case 'around':      return `autour ${dePrep(f, plural, lead)}`;
    case 'behind':      return `derrière ${art}`;
    case 'in_front_of': return `devant ${art}`;
    case 'through':
    default:            return `à travers ${art}`;
  }
}

function complementsPhrase(complements?: Partial<Record<ComplementType, ResolvedComplement>>): string {
  if (!complements) return '';
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      const f = c.phrase.head.forms;
      // A pronoun cause: neutral "à cause de moi / d'eux" takes the disjunctive after "de"
      // (eliding before a vowel); positive "grâce à moi" takes it after "à" (which never
      // elides); negative uses the possessive with "faute" ("par ma faute").
      if (type === 'cause' && f['person']) {
        const disj = f['disjunctive'] ?? f['base'] ?? '';
        const sent = causeSentiment(c);
        if (sent === 'positive') return `grâce à ${disj}`;
        if (sent === 'negative') {
          const plural = f['number'] === 'plural';
          const poss =
            f['person'] === '1' ? (plural ? 'notre' : 'ma') :
            f['person'] === '2' ? (plural ? 'votre' : 'ta') :
            plural ? 'leur' : 'sa';
          return `par ${poss} faute`;
        }
        return `à cause ${/^[aeiouéèêh]/i.test(disj) ? "d'" : 'de '}${disj}`;
      }
      // locative→dans, direction→à (au/aux/à la), source→"loin de" (loin du/des/de la),
      // route→path preposition. A direction toward an *animate* goal takes "vers"
      // (toward) — French doesn't use bare "à" for a person destination ("je cours vers
      // l'enfant", not "*à l'enfant"); "vers" doesn't contract with the article. Source is
      // prefixed with the ablative adverb "loin" so it clearly reads as motion away ("je
      // cours loin de l'enfant"); bare "de" reads as a partitive/complement, not departure.
      // Cause reads "à cause de" + the "de"-contracted article ("à cause du chien"); the
      // sentiment swaps the connector — negative "par la faute du chien", positive "grâce au
      // chien" ("à"-contracted via datPrep).
      const causeSent = type === 'cause' ? causeSentiment(c) : 'neutral';
      const headFor = (plural: boolean, lead: string): string =>
        type === 'locative'  ? `dans ${defArticle(f, plural, lead)}` :
        type === 'direction' ? (f['animate'] === '1' ? `vers ${defArticle(f, plural, lead)}` : datPrep(f, plural, lead)) :
        type === 'source'    ? `loin ${dePrep(f, plural, lead)}` :
        type === 'cause'     ? (
          causeSent === 'positive' ? `grâce ${datPrep(f, plural, lead)}` :
          causeSent === 'negative' ? `par la faute ${dePrep(f, plural, lead)}` :
          `à cause ${dePrep(f, plural, lead)}`
        ) :
        routeHead(c, plural, lead);
      return renderNP(c.phrase, headFor);
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * The predicate half of a phrase — everything after the subject noun. Shared by the
 * top-level sentence and by relative clauses, which pass the head noun's forms as
 * `subjectForms` so the verb agrees with the head.
 */
function predicateText(
  subjectForms: Record<string, string>,
  verbPhrase: ResolvedVerbPhrase,
  directObject?: ResolvedNounPhrase,
  indirectObject?: ResolvedNounPhrase,
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
): string {
  const { verb, negative: verbNegative, modifier, tense } = verbPhrase;
  const conjugated = conjugate(verb.forms, subjectForms, tense);
  const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
  // "jamais" uses ne...jamais (replaces "pas"), even without verbNegative
  const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
  // "aucun" (no) is itself the negator, so it takes "ne" alone (no "pas") — for a subject
  // ("aucun garçon ne pleure") or an object ("il ne voit aucun garçon").
  const aucun =
    subjectForms['definiteness'] === 'no' ||
    directObject?.head.forms['definiteness'] === 'no';
  let effectiveVerb: string;
  let effectiveMod: string;
  if (modifierIsNegative) {
    effectiveVerb = `ne ${conjugated} ${modifierText}`;
    effectiveMod = '';
  } else if (verbNegative) {
    effectiveVerb = `ne ${conjugated} pas`;
    effectiveMod = modifierText;
  } else if (aucun) {
    effectiveVerb = `ne ${conjugated}`;
    effectiveMod = modifierText;
  } else {
    effectiveVerb = conjugated;
    effectiveMod = modifierText;
  }
  const directObjectText = directObject
    ? renderNP(directObject, (plural, lead) => artFor(directObject.head.forms, plural, lead))
    : '';
  // V [Adv] DirectObj IndirectObj(à+article)
  const indirectObjectText = indirectObject
    ? renderNP(indirectObject, (plural, lead) => datPrep(indirectObject.head.forms, plural, lead))
    : '';
  const complementsText = complementsPhrase(complements);
  return [effectiveVerb, effectiveMod, directObjectText, indirectObjectText, complementsText]
    .filter(Boolean)
    .join(' ');
}

/**
 * A relative clause on `np`. A subject-relative uses "qui" and the head drives agreement
 * ("le garçon qui pleure"). A non-subject (direct-object) relative uses "que" — elided to
 * "qu'" before a vowel — followed by the clause's own subject, which drives agreement
 * ("le livre que je lis"). Indirect/complement relativization ("dont", "à qui") is not
 * yet modelled, so those fall back to "que" — best-effort. TODO: prepositional relativizers.
 */
function relativeText(np: ResolvedNounPhrase): string {
  const rel = np.relative;
  if (!rel) return '';
  if (rel.headRole === 'subject' || !rel.subject) {
    return `qui ${predicateText(np.head.forms, rel.verbPhrase, rel.directObject, rel.indirectObject, rel.complements)}`.trim();
  }
  const subjText = subjectPhrase(rel.subject);
  const relzr = joinArt(VOWEL_START.test(subjText) ? "qu'" : 'que', subjText);
  const pred = predicateText(rel.subject.head.forms, rel.verbPhrase, rel.directObject, rel.indirectObject, rel.complements);
  return `${relzr} ${pred}`.trim();
}

export const frenchEngine: LanguageEngine = {
  language: 'fr',
  render(phrase: ResolvedPhrase): string {
    const { subject } = phrase;
    const subjectText = subjectPhrase(subject);
    const predicate = predicateText(
      subject.head.forms, phrase.verbPhrase, phrase.directObject, phrase.indirectObject, phrase.complements,
    );
    return [subjectText, predicate].filter(Boolean).join(' ').trim();
  },
};
