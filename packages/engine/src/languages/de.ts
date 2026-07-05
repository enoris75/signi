import { COMPLEMENT_RENDER_ORDER, type ComplementType, type Tense } from '@signi/shared';
import { pathSpecifier, type ResolvedComplement, type LanguageEngine, type ResolvedNounPhrase, type ResolvedPhrase } from '../types.js';

type Case = 'nom' | 'acc' | 'dat';
type Slot = 'masc' | 'fem' | 'neut' | 'plural';

// Weak adjective declension (after a definite article) — the only pattern the
// engine needs, since every noun phrase here is introduced by der/die/das.
const WEAK_ENDINGS: Record<Case, Record<Slot, string>> = {
  nom: { masc: 'e',  fem: 'e',  neut: 'e',  plural: 'en' },
  acc: { masc: 'en', fem: 'e',  neut: 'e',  plural: 'en' },
  dat: { masc: 'en', fem: 'en', neut: 'en', plural: 'en' },
};

function declineAdj(base: string, _case: Case, gender: string, plural: boolean): string {
  const slot: Slot = plural ? 'plural' : gender === 'masc' || gender === 'fem' ? gender : 'neut';
  let ending = WEAK_ENDINGS[_case][slot];
  // Stems already ending in -e (e.g. "müde") absorb the ending's leading e.
  if (base.endsWith('e')) ending = ending.slice(1);
  return base + ending;
}

// Decline every attributive adjective of a noun phrase for the given case,
// agreeing with the head's gender/number. Returns "" when there are none.
function adjPhrase(np: ResolvedNounPhrase, _case: Case): string {
  const f = np.head.forms;
  const gender = f['gender'] ?? 'neut';
  const plural = (f['number'] ?? f['count']) === 'plural';
  return np.adjectives
    .map((a) => a.forms['base'])
    .filter((b): b is string => Boolean(b))
    .map((b) => declineAdj(b, _case, gender, plural))
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

function nounPhrase(np: ResolvedNounPhrase, _case: 'nom' | 'acc' | 'dat'): string {
  const forms = np.head.forms;
  const count = forms['number'] ?? forms['count'] ?? 'singular';
  const plural = count === 'plural';
  const word = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const declined = adjPhrase(np, _case);
  const a = declined ? `${declined} ` : '';
  return `${defArticle(forms, _case, plural)} ${a}${word}${subordinateClause(np)}`;
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
      const plural = (f['number'] ?? f['count']) === 'plural';
      const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
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
        if (type === 'locative')  head = art === 'dem' ? 'im' : `in ${art}`;
        else if (type === 'direction') head = art === 'dem' ? 'zum' : art === 'der' ? 'zur' : `zu ${art}`;
        else /* source */         head = `aus ${art}`;
      }
      const declined = adjPhrase(c.phrase, _case);
      const adj = declined ? `${declined} ` : '';
      return `${head} ${adj}${word}${subordinateClause(c.phrase)}`;
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * A restrictive relative clause on `np`, German-style: comma, relative pronoun agreeing
 * with the head (nominative — subject-relative — so identical to the definite article
 * der/die/das/die), then the clause with its finite verb pushed to the end. Returns "" if
 * `np` has no relative. (The closing comma is omitted; a known first-cut simplification.)
 */
function subordinateClause(np: ResolvedNounPhrase): string {
  const rel = np.relative;
  if (!rel) return '';
  const f = np.head.forms;
  const plural = (f['number'] ?? f['count']) === 'plural';
  const pronoun = defArticle(f, 'nom', plural); // der / die / das / die

  const { verb, negative: verbNegative, modifier, tense = 'present' } = rel.verbPhrase;
  const person = f['person'] ?? '3';
  const pn = `${person}${plural ? 'pl' : 'sg'}`;
  const isFuture = tense === 'future';
  // Verb-final: the finite verb closes the clause. Future puts the infinitive
  // just before the clause-final finite "werden" ("der Wein trinken wird").
  const finite = isFuture ? (WERDEN[pn] ?? 'wird') : conjugate(verb.forms, f, tense);
  const infinitive = isFuture ? (verb.forms['base'] ?? '') : '';

  const indirectObjectText = rel.indirectObject ? nounPhrase(rel.indirectObject, 'dat') : '';
  const directObjectText = rel.directObject ? nounPhrase(rel.directObject, 'acc') : '';
  const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
  const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
  const nicht = verbNegative && !modifierIsNegative ? 'nicht' : '';
  const complementsText = complementsPhrase(rel.complements);

  const body = [pronoun, indirectObjectText, directObjectText, complementsText, modifierText, nicht, infinitive, finite]
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
