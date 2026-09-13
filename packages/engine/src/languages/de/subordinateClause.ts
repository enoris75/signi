import { groupHasNegativeAdverb, type ResolvedNounPhrase } from '../../types.js';
import { complementsPhrase } from './complementsPhrase.js';
import { defArticle } from './defArticle.js';
import { elementPhrase } from './elementPhrase.js';
import { modalAdverbs } from './modalAdverbs.js';
import { modalVerbGroup } from './modalVerbGroup.js';
import { splitDative } from './splitDative.js';
import { subjectText } from './subjectText.js';
import { verbGroup } from './verbGroup.js';

/**
 * A restrictive relative clause on `np`, German-style: comma, relative pronoun agreeing
 * with the head in gender/number and case, then the clause with its finite verb pushed to
 * the end. A subject-relative uses a nominative pronoun and the head drives agreement
 * ("der Junge, der weint"). A direct-object relative uses an accusative pronoun, renders
 * the clause's own subject, and that subject drives agreement ("das Buch, das ich lese").
 * For nominative/accusative the relative pronoun coincides with the definite article
 * (der/die/das · den/die/das); genitive ("dessen") and dative ("denen") relatives —
 * indirect/complement — are not modelled and fall back to accusative. Returns "" if `np`
 * has no relative. The clause is bracketed by commas at both ends; a closing comma that lands
 * against the sentence-final stop (or another comma) is tidied up in `punctuate`.
 */
export function subordinateClause(np: ResolvedNounPhrase): string {
  const rel = np.relative;
  if (!rel) return '';
  const f = np.head.forms;
  const plural = (f['number'] ?? f['count']) === 'plural';
  const subjectRelative = rel.headRole === 'subject' || !rel.subject;
  // nom for a subject-relative, acc for a (direct-)object relative. TODO: gen/dat pronouns.
  const pronoun = defArticle(f, subjectRelative ? 'nom' : 'acc', plural);
  // Agreement + the rendered clause subject: the head fills it for a subject-relative;
  // otherwise the clause carries its own nominative subject.
  const agreeForms = subjectRelative ? f : rel.subject!.agreement;
  const clauseSubjectText = subjectRelative ? '' : subjectText(rel.subject!);

  const { verb, negative: verbNegative, modifier, tense = 'present', aspect = 'neutral', mood, modals } = rel.verbPhrase;
  const person = agreeForms['person'] ?? '3';
  const aPlural = (agreeForms['number'] ?? agreeForms['count']) === 'plural';
  const pn = `${person}${aPlural ? 'pl' : 'sg'}`;
  // The verb complex is built by the same `verbGroup`/`modalVerbGroup` the main clause uses, so a
  // relative clause renders its aspect too (resultative "gegessen hat", progressive "gerade isst",
  // prospective "im Begriff … zu essen"). The clause is verb-final: the finite verb (`v2`) closes
  // it, sitting after the non-finite `tail` (Partizip / infinitive / "zu …" / the modal stack),
  // while the aspect adverbial (`mid`: "gerade" / "im Begriff") sits in the Mittelfeld before the
  // objects — the mirror of the main clause, whose finite verb leads from the V2 slot instead.
  const { v2: finite, mid, tail } = modals.length > 0
    ? modalVerbGroup(modals, verb.forms, pn, tense, aspect, mood)
    : verbGroup(verb.forms, pn, tense, aspect, mood);

  const { dative, rest } = splitDative(rel.complements);
  const dativeText = complementsPhrase(dative);
  const directObjectText = rel.directObject ? elementPhrase(rel.directObject, 'acc') : '';
  const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
  const modalAdverbsText = modalAdverbs(modals);
  const nicht = verbNegative && !groupHasNegativeAdverb(rel.verbPhrase) ? 'nicht' : '';
  const complementsText = complementsPhrase(rest);

  const body = [pronoun, clauseSubjectText, mid, dativeText, directObjectText, complementsText, modalAdverbsText, modifierText, nicht, tail, finite]
    .filter(Boolean)
    .join(' ');
  return `, ${body},`;
}
