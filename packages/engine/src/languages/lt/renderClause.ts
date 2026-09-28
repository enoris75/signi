import type { ResolvedPhrase } from '../../types.js';
import { experiencerInverts } from '../../functions/experiencerInverts.js';
import { infinitiveController } from '../../functions/infinitiveController.js';
import { infinitiveLink } from '../../functions/infinitiveLink.js';
import { isPronounElement } from '../../functions/isPronounElement.js';
import { objectComplementizer } from '../../functions/objectComplementizer.js';
import { withSentenceAdverb } from '../../functions/withSentenceAdverb.js';
import { PURPOSE_WORD, QUESTION_PARTICLE, SUBORDINATORS, THAT, WHETHER } from './lt.consts.js';
import { clauseNegation } from './clauseNegation.js';
import { complementsPhrase } from './complementsPhrase.js';
import { elementText } from './elementText.js';
import { glossText } from './glossText.js';
import { infinitiveComplementText } from './infinitiveComplementText.js';
import { predicateText } from './predicateText.js';
import { objectText } from './objectText.js';
import { questionWord } from './questionWord.js';
import { verbAgr } from './verbAgr.js';
import type { Case, VerbAgr } from './lt.types.js';

/**
 * One clause (P18-E9), without its condition or coordination (`lithuanianEngine`). SVO in every
 * clause, the relative and the subordinate too.
 *
 * - **Pro-drop** (D6): a 1st or 2nd person pronoun subject is dropped (*valgome*), a 3rd person one
 *   kept (*jis valgo*), since the verb's 3rd person does not say the number. The **generic** subject is
 *   never said (D7, the subjectless 3rd person: *valgo pelę*) (verify), nor is an imperative's or an
 *   infinitive's.
 * - A clause subject (a content clause) is genderless: its predicate adjective is the neuter (*gera,
 *   kad …*).
 * - An **experiencer** verb (*reikėti*, NEED) leads with its dative and says its subject after the
 *   verb, in the verb's `object_case` (*katei reikia pelės*, the thing needed in the genitive).
 * - A yes/no question opens on *ar* (*ar katė valgo pelę?*); a wh-question fronts its word (*ką katė
 *   valgo?*, *kas valgo pelę?*), and a possessor asked about in the object fronts the whole object
 *   (*kieno maistą katė valgo?*).
 * - Object, subject, adverbial and purpose clauses follow after a comma: *kad*, *ar*, the
 *   subordinator, *kad* + the conditional of purpose (*spausk, kad pakeistum*) (verify).
 */
export function renderClause(phrase: ResolvedPhrase): string {
  if (phrase.sentenceAdverb) {
    return withSentenceAdverb(phrase.sentenceAdverb, renderClause({ ...phrase, sentenceAdverb: undefined }), (c) => `${THAT} ${c}`);
  }
  const { subject, verbPhrase: vp, question } = phrase;
  if (!vp) {
    const gloss = glossText(subject);
    if (gloss !== undefined) return gloss;
    if (phrase.adverbialClause) return adverbialText(phrase.adverbialClause);
    const vocative = subject.conjuncts.some((np) => np.head.forms['vocative'] === '1');
    return elementText(subject, vocative ? 'voc' : 'nom');
  }
  const subjectless = vp.mood === 'imperative' || vp.mood === 'infinitive';
  const person = subject.agreement['person'];
  const dropped = subject.agreement['generic'] === '1' || (isPronounElement(subject) && (person === '1' || person === '2'));
  const inverts = experiencerInverts(phrase);
  const subjectCase = (inverts ? vp.verb.forms['object_case'] as Case | undefined : undefined) ?? 'nom';
  const spoken = phrase.contentSubject || subjectless || dropped ? '' : elementText(subject, subjectCase);
  const subjectNegative = subject.agreement['definiteness'] === 'no';
  const subjectForms = phrase.contentSubject ? { ...subject.agreement, gender: 'neut' } : subject.agreement;
  // *kas* asked as the subject agrees as a 3rd singular: *kas suvalgė pelę?*
  const agr: VerbAgr = question?.role === 'subject' && !question.animate
    ? { person: '3', plural: false, gender: 'neut' }
    : verbAgr(subjectForms, subject.conjuncts);
  const frontObject = question?.role === 'possessor' && question.possessed === 'directObject';
  const dative = inverts ? phrase.complements?.terminus : undefined;
  const { terminus: _t, ...others } = phrase.complements ?? {};
  const predicate = predicateText({
    subject: subjectForms, agr, verbPhrase: vp, directObject: frontObject ? undefined : phrase.directObject,
    complements: dative ? others : phrase.complements, agent: phrase.agent, subjectNegative,
  });
  const negation = clauseNegation({ verbPhrase: vp, subjectNegative, directObject: phrase.directObject, complements: phrase.complements });
  const word = !question ? ''
    : frontObject && phrase.directObject
      ? objectText(phrase.directObject, vp.verb.forms, negation.finite || negation.inner, subject.agreement)
      : questionWord(question, vp.verb, negation.finite || negation.inner);
  const opener = vp.interrogative && !question ? QUESTION_PARTICLE : '';
  const lead = dative ? complementsPhrase({ terminus: dative }, { subject: subjectForms, verb: vp.verb.forms }) : '';
  const head = question?.role === 'subject' ? [word, predicate]
    : inverts ? [opener, lead, predicate, spoken]
    : [opener, word, spoken, predicate];
  const governor = vp.verb.forms;
  const complement = phrase.infinitiveComplement
    ? infinitiveComplementText(phrase.infinitiveComplement, infinitiveController(phrase, subject.agreement), governor['causative'] === '1' ? '' : infinitiveLink(phrase))
    : '';
  const purpose = phrase.purpose ? `, ${PURPOSE_WORD} ${purposeText(phrase.purpose, subject.agreement)},` : '';
  const content = phrase.contentSubject ? `, ${THAT} ${renderClause(phrase.contentSubject)},` : '';
  const object = phrase.contentObject
    ? `, ${[objectComplementizer(phrase.contentObject, THAT, WHETHER), renderClause(phrase.contentObject)].filter(Boolean).join(' ')},`
    : '';
  const adverbial = phrase.adverbialClause ? `, ${adverbialText(phrase.adverbialClause)},` : '';
  return [...head, complement, purpose, content, object, adverbial].filter(Boolean).join(' ');
}

/**
 * A clause of purpose: the conditional agreeing with the one who acts, the clause's own subject
 * (*spausk, kad pakeistum*; *katė bėga, kad suvalgytų pelę*) (verify: after a verb of motion the bare
 * infinitive is also written, *atėjo pavalgyti*).
 */
function purposeText(clause: ResolvedPhrase, controller: Record<string, string>): string {
  const vp = clause.verbPhrase;
  if (!vp) return '';
  return predicateText({
    subject: controller, agr: verbAgr(controller), verbPhrase: { ...vp, mood: 'conditional' },
    directObject: clause.directObject, complements: clause.complements,
  });
}

/** An adverbial clause under its conjunction: *kai šuo bėga*, *nes katė valgo*. */
function adverbialText({ conjunction, clause }: NonNullable<ResolvedPhrase['adverbialClause']>): string {
  return `${SUBORDINATORS[conjunction]} ${renderClause(clause)}`;
}
