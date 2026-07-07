import { COMPLEMENT_RENDER_ORDER, type ComplementType, type Tense } from '@signi/shared';
import { pathSpecifier, type ResolvedComplement, type LanguageEngine, type ResolvedNounPhrase, type ResolvedPhrase } from '../types.js';

type Case = 'nom' | 'acc' | 'dat';
type Slot = 'masc' | 'fem' | 'neut' | 'plural';

// Weak adjective declension (after a definite article: der/die/das).
const WEAK_ENDINGS: Record<Case, Record<Slot, string>> = {
  nom: { masc: 'e',  fem: 'e',  neut: 'e',  plural: 'en' },
  acc: { masc: 'en', fem: 'e',  neut: 'e',  plural: 'en' },
  dat: { masc: 'en', fem: 'en', neut: 'en', plural: 'en' },
};

// Mixed declension (after an indefinite article: ein/eine) — nom/acc only, since a
// subject/direct object is the only place non-definite determiners appear.
const MIXED_ENDINGS: Record<'nom' | 'acc', Record<Slot, string>> = {
  nom: { masc: 'er', fem: 'e', neut: 'es', plural: 'en' },
  acc: { masc: 'en', fem: 'e', neut: 'es', plural: 'en' },
};

// Strong declension (no article: bare noun phrase, and article-less indefinite plurals),
// where the adjective itself carries the case/gender the article would otherwise show.
const STRONG_ENDINGS: Record<'nom' | 'acc', Record<Slot, string>> = {
  nom: { masc: 'er', fem: 'e', neut: 'es', plural: 'e' },
  acc: { masc: 'en', fem: 'e', neut: 'es', plural: 'e' },
};

// Pick the ending table for a case + determiner. Dative only ever appears on definite
// (indirect object / complement) phrases here, so it stays weak. An indefinite *plural*
// has no article, so it declines strong like a bare phrase.
//   • kein- ("no")      → like ein-: mixed in the singular, weak in the plural.
//   • einige/viele/wenige (some/many/few) → strong (no article carries the case).
//   • alle ("all") and the definite article → weak.
function endingsFor(_case: Case, definiteness: string, plural: boolean): Record<Slot, string> {
  if (_case === 'dat') return WEAK_ENDINGS.dat;
  if (definiteness === 'bare') return STRONG_ENDINGS[_case];
  if (definiteness === 'indefinite') return plural ? STRONG_ENDINGS[_case] : MIXED_ENDINGS[_case];
  if (definiteness === 'no') return plural ? WEAK_ENDINGS[_case] : MIXED_ENDINGS[_case];
  if (definiteness === 'some' || definiteness === 'many' || definiteness === 'few')
    return STRONG_ENDINGS[_case];
  return WEAK_ENDINGS[_case]; // 'all' and 'definite'
}

function declineAdj(base: string, _case: Case, gender: string, plural: boolean, definiteness: string): string {
  const slot: Slot = plural ? 'plural' : gender === 'masc' || gender === 'fem' ? gender : 'neut';
  let ending = endingsFor(_case, definiteness, plural)[slot];
  // Stems already ending in -e (e.g. "müde") absorb the ending's leading e.
  if (ending.startsWith('e') && base.endsWith('e')) ending = ending.slice(1);
  return base + ending;
}

// Decline every attributive adjective of a noun phrase for the given case, agreeing with
// the head's gender/number and determiner. Returns "" when there are none.
function adjPhrase(np: ResolvedNounPhrase, _case: Case, definiteness = 'definite'): string {
  const f = np.head.forms;
  const gender = f['gender'] ?? 'neut';
  const plural = (f['number'] ?? f['count']) === 'plural';
  return np.adjectives
    .map((a) => a.forms['base'])
    .filter((b): b is string => Boolean(b))
    .map((b) => declineAdj(b, _case, gender, plural, definiteness))
    .join(' ');
}

function defArticle(forms: Record<string, string>, _case: 'nom' | 'acc' | 'dat', plural = false): string {
  if (plural) return _case === 'dat' ? 'den' : 'die';
  const gender = forms['gender'] ?? 'neut';
  if (_case === 'nom') {
    return gender === 'masc' ? 'der' : gender === 'fem' ? 'die' : 'das';
  }
  if (_case === 'acc') {
    return gender === 'masc' ? 'den' : gender === 'fem' ? 'die' : 'das';
  }
  // dative
  return gender === 'masc' ? 'dem' : gender === 'fem' ? 'der' : 'dem';
}

// The indefinite article ein-, declined for case/gender. Plural has no indefinite
// article (bare). Only nom/acc are reachable (subject/direct object).
function indefArticle(_case: 'nom' | 'acc' | 'dat', gender: string, plural: boolean): string {
  if (plural) return '';
  if (_case === 'acc') return gender === 'masc' ? 'einen' : gender === 'fem' ? 'eine' : 'ein';
  if (_case === 'dat') return gender === 'fem' ? 'einer' : 'einem';
  return gender === 'fem' ? 'eine' : 'ein'; // nominative: masc/neut ein, fem eine
}

// "kein" (no), declined like ein- but with a plural (keine / keinen in the dative).
function keinForm(_case: 'nom' | 'acc' | 'dat', gender: string, plural: boolean): string {
  if (plural) return _case === 'dat' ? 'keinen' : 'keine';
  if (_case === 'acc') return gender === 'masc' ? 'keinen' : gender === 'fem' ? 'keine' : 'kein';
  if (_case === 'dat') return gender === 'fem' ? 'keiner' : 'keinem';
  return gender === 'fem' ? 'keine' : 'kein'; // nominative: masc/neut kein, fem keine
}

/**
 * The determiner for a noun phrase, from its `definiteness` (default 'definite'). Dative
 * phrases (indirect object / complement) are always definite here, so they keep der/die/den.
 * "kein" is self-negating (no verb concord); einige/viele/wenige/alle are plural quantifiers.
 */
function determiner(forms: Record<string, string>, _case: 'nom' | 'acc' | 'dat', plural: boolean): string {
  const definiteness = forms['definiteness'] ?? 'definite';
  if (_case === 'dat' || definiteness === 'definite') return defArticle(forms, _case, plural);
  const gender = forms['gender'] ?? 'neut';
  // Mass nouns ("Wasser") stay singular and take the invariant mass quantifiers
  // "etwas / viel / wenig"; "all das Wasser"; no indefinite article.
  if (forms['uncountable'] === '1') {
    switch (definiteness) {
      case 'bare':        return '';
      case 'indefinite':  return '';                       // no "ein Wasser"
      case 'no':          return keinForm(_case, gender, false);
      case 'some':        return 'etwas';
      case 'many':        return 'viel';
      case 'few':         return 'wenig';
      case 'all':         return `all ${defArticle(forms, _case, false)}`;
      default:            return defArticle(forms, _case, false);
    }
  }
  switch (definiteness) {
    case 'bare': return '';
    case 'no':   return keinForm(_case, gender, plural);
    case 'some': return 'einige';
    case 'many': return 'viele';
    case 'few':  return 'wenige';
    case 'all':  return 'alle';
    default:     return indefArticle(_case, gender, plural);
  }
}

function conjugate(forms: Record<string, string>, subjectForms: Record<string, string>, tense: Tense = 'present'): string {
  const person = subjectForms['person'] ?? '3';
  const number = subjectForms['number'] ?? 'singular';
  const n = number === 'plural' ? 'pl' : 'sg';
  return forms[`${person}${n}_${tense}`] ?? forms[tense] ?? forms[`${person}${n}_present`] ?? forms['base'] ?? '';
}

// Present-tense forms of the auxiliary "werden", used to build the periphrastic
// future ("ich werde essen"). The infinitive is placed at the clause end.
const WERDEN: Record<string, string> = {
  '1sg': 'werde', '2sg': 'wirst', '3sg': 'wird',
  '1pl': 'werden', '2pl': 'werdet', '3pl': 'werden',
};

/**
 * A possessor rendered colloquially as "von" + dative ("das Buch vom Kind"): von+dem
 * fuses to "vom", otherwise "von der/den". The possessor's adjectives decline dative;
 * recursion carries its own nested possessor and relative clause. Empty when absent.
 */
function possessorText(np: ResolvedNounPhrase): string {
  const poss = np.possessor;
  if (!poss) return '';
  const f = poss.head.forms;
  const plural = (f['number'] ?? f['count']) === 'plural';
  const word = germanCompound(poss, plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? ''));
  const art = defArticle(f, 'dat', plural); // dem / der / den
  const von = art === 'dem' ? 'vom' : `von ${art}`;
  const declined = adjPhrase(poss, 'dat');
  const adj = declined ? `${declined} ` : '';
  return ` ${von} ${adj}${word}${possessorText(poss)}${subordinateClause(poss)}`;
}

/**
 * German realises an attributive noun as a closed compound ("Segel" + "Boot" →
 * "Segelboot"): the modifiers are prefixed onto the head and every element but the first
 * has its initial lowercased. The relation is neutralised. Gender/declension stay the
 * head's (the compound's last element), so only the surface `word` changes. (Linking
 * morphemes like the -s- in "Arbeitsplatz" are a known simplification.)
 */
function germanCompound(np: ResolvedNounPhrase, headWord: string): string {
  const mods = np.nounModifiers.map((m) => m.concept.forms['base']).filter(Boolean);
  if (!mods.length || !headWord) return headWord;
  return [...mods, headWord]
    .map((p, i) => (i === 0 ? p : p.charAt(0).toLowerCase() + p.slice(1)))
    .join('');
}

function nounPhrase(np: ResolvedNounPhrase, _case: 'nom' | 'acc' | 'dat'): string {
  const forms = np.head.forms;
  const count = forms['number'] ?? forms['count'] ?? 'singular';
  const plural = count === 'plural';
  const headWord = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const word = germanCompound(np, headWord);
  const definiteness = forms['definiteness'] ?? 'definite';
  const declined = adjPhrase(np, _case, definiteness);
  const a = declined ? `${declined} ` : '';
  const art = determiner(forms, _case, plural); // der/die/das · ein/eine/einen · (bare)
  const lead = art ? `${art} ` : '';
  return `${lead}${a}${word}${possessorText(np)}${subordinateClause(np)}`;
}

function subjectPhrase(np: ResolvedNounPhrase): string {
  const forms = np.head.forms;
  if (forms['person']) {
    if (forms['number'] === 'plural' && forms['plural']) return forms['plural'];
    return forms['base'] ?? '';
  }
  return nounPhrase(np, 'nom'); // noun — nominative article
}

// durch/um govern accusative; the static-relation two-way preps
// (unter/über/hinter/vor) take dative here.
function routeCase(c: ResolvedComplement): 'acc' | 'dat' {
  const spec = pathSpecifier(c);
  return spec === 'through' || spec === 'around' ? 'acc' : 'dat';
}

// route path relation → preposition + article.
function routeHead(c: ResolvedComplement, plural: boolean): string {
  const f = c.phrase.head.forms;
  const art = defArticle(f, routeCase(c), plural);
  switch (pathSpecifier(c)) {
    case 'under':       return `unter ${art}`;
    case 'over':        return `über ${art}`;
    case 'around':      return `um ${art}`;
    case 'behind':      return `hinter ${art}`;
    case 'in_front_of': return `vor ${art}`;
    case 'through':
    default:            return `durch ${art}`;
  }
}

function complementsPhrase(complements?: Partial<Record<ComplementType, ResolvedComplement>>): string {
  if (!complements) return '';
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      const f = c.phrase.head.forms;
      // A pronoun cause ("wegen mir/ihr/ihnen") uses the dative form with no article — the
      // colloquial dative that "wegen" already takes here. Only cause accepts a pronoun today.
      if (type === 'cause' && f['person']) return `wegen ${f['disjunctive'] ?? f['base'] ?? ''}`;
      const plural = (f['number'] ?? f['count']) === 'plural';
      const word = germanCompound(c.phrase, plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? ''));
      // route → path preposition (+ its case); locative/direction/source → two-way
      // preps + dative with the usual in+dem=im, zu+dem=zum, zu+der=zur fusions.
      let head: string;
      let _case: 'nom' | 'acc' | 'dat';
      if (type === 'route') {
        _case = routeCase(c);
        head = routeHead(c, plural);
      } else {
        _case = 'dat';
        const art = defArticle(f, 'dat', plural); // dem / der / den
        // Cause: "wegen" governs the genitive formally, but the dative ("wegen dem Hund")
        // is standard in speech and reuses the dative articles the other complements share.
        if (type === 'locative')  head = art === 'dem' ? 'im' : `in ${art}`;
        else if (type === 'direction') head = art === 'dem' ? 'zum' : art === 'der' ? 'zur' : `zu ${art}`;
        else if (type === 'cause') head = `wegen ${art}`;
        else /* source */         head = `aus ${art}`;
      }
      const declined = adjPhrase(c.phrase, _case);
      const adj = declined ? `${declined} ` : '';
      return `${head} ${adj}${word}${possessorText(c.phrase)}${subordinateClause(c.phrase)}`;
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * A restrictive relative clause on `np`, German-style: comma, relative pronoun agreeing
 * with the head in gender/number and case, then the clause with its finite verb pushed to
 * the end. A subject-relative uses a nominative pronoun and the head drives agreement
 * ("der Junge, der weint"). A direct-object relative uses an accusative pronoun, renders
 * the clause's own subject, and that subject drives agreement ("das Buch, das ich lese").
 * For nominative/accusative the relative pronoun coincides with the definite article
 * (der/die/das · den/die/das); genitive ("dessen") and dative ("denen") relatives —
 * indirect/complement — are not modelled and fall back to accusative. Returns "" if `np`
 * has no relative. (The closing comma is omitted; a known first-cut simplification.)
 */
function subordinateClause(np: ResolvedNounPhrase): string {
  const rel = np.relative;
  if (!rel) return '';
  const f = np.head.forms;
  const plural = (f['number'] ?? f['count']) === 'plural';
  const subjectRelative = rel.headRole === 'subject' || !rel.subject;
  // nom for a subject-relative, acc for a (direct-)object relative. TODO: gen/dat pronouns.
  const pronoun = defArticle(f, subjectRelative ? 'nom' : 'acc', plural);
  // Agreement + the rendered clause subject: the head fills it for a subject-relative;
  // otherwise the clause carries its own nominative subject.
  const agreeForms = subjectRelative ? f : rel.subject!.head.forms;
  const clauseSubjectText = subjectRelative ? '' : subjectPhrase(rel.subject!);

  const { verb, negative: verbNegative, modifier, tense = 'present' } = rel.verbPhrase;
  const person = agreeForms['person'] ?? '3';
  const aPlural = (agreeForms['number'] ?? agreeForms['count']) === 'plural';
  const pn = `${person}${aPlural ? 'pl' : 'sg'}`;
  const isFuture = tense === 'future';
  // Verb-final: the finite verb closes the clause. Future puts the infinitive
  // just before the clause-final finite "werden" ("der Wein trinken wird").
  const finite = isFuture ? (WERDEN[pn] ?? 'wird') : conjugate(verb.forms, agreeForms, tense);
  const infinitive = isFuture ? (verb.forms['base'] ?? '') : '';

  const indirectObjectText = rel.indirectObject ? nounPhrase(rel.indirectObject, 'dat') : '';
  const directObjectText = rel.directObject ? nounPhrase(rel.directObject, 'acc') : '';
  const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
  const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
  const nicht = verbNegative && !modifierIsNegative ? 'nicht' : '';
  const complementsText = complementsPhrase(rel.complements);

  const body = [pronoun, clauseSubjectText, indirectObjectText, directObjectText, complementsText, modifierText, nicht, infinitive, finite]
    .filter(Boolean)
    .join(' ');
  return `, ${body}`;
}

export const germanEngine: LanguageEngine = {
  language: 'de',
  render(phrase: ResolvedPhrase): string {
    const { subject, verbPhrase, directObject, indirectObject } = phrase;
    const { verb, negative: verbNegative, modifier, tense = 'present' } = verbPhrase;

    const subjectText = subjectPhrase(subject);
    // Future is periphrastic: finite "werden" sits in the V2 slot and the
    // infinitive closes the clause ("ich werde das Brot essen"). Present/past
    // put the single finite verb in V2 with no tail.
    const person = subject.head.forms['person'] ?? '3';
    const number = subject.head.forms['number'] ?? 'singular';
    const pn = `${person}${number === 'plural' ? 'pl' : 'sg'}`;
    const isFuture = tense === 'future';
    const verbText = isFuture
      ? (WERDEN[pn] ?? 'wird')
      : conjugate(verb.forms, subject.head.forms, tense);
    const infinitiveTail = isFuture ? (verb.forms['base'] ?? '') : '';
    const directObjectText = directObject
      ? nounPhrase(directObject, 'acc')
      : '';
    // German: dative (indirect) comes BEFORE accusative (direct) when both are noun phrases
    const indirectObjectText = indirectObject
      ? nounPhrase(indirectObject, 'dat')
      : '';
    const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';

    // "nicht" precedes the modifier when one exists ("nicht immer"),
    // otherwise trails after objects ("das Brot nicht").
    // Skip "nicht" when the modifier is already negative ("nie" = never).
    const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
    const applyNicht = verbNegative && !modifierIsNegative;
    const negBefore = applyNicht && modifierText ? 'nicht' : '';
    const negAfter  = applyNicht && !modifierText ? 'nicht' : '';
    const complementsText = complementsPhrase(phrase.complements);
    return [subjectText, verbText, negBefore, modifierText, indirectObjectText, directObjectText, complementsText, negAfter, infinitiveTail]
      .filter(Boolean).join(' ').trim();
  },
};
