import type { ResolvedPhrase } from '../../types.js';
import { infinitiveController } from '../../functions/infinitiveController.js';
import { infinitiveLink } from '../../functions/infinitiveLink.js';
import { isPronounElement } from '../../functions/isPronounElement.js';
import { objectComplementizer } from '../../functions/objectComplementizer.js';
import { withSentenceAdverb } from '../../functions/withSentenceAdverb.js';
import { PURPOSE_WORD, QUESTION_PARTICLE, SUBORDINATORS, THAT, WHETHER } from './pl.consts.js';
import { clauseNegation } from './clauseNegation.js';
import { elementText } from './elementText.js';
import { glossText } from './glossText.js';
import { infinitiveComplementText } from './infinitiveComplementText.js';
import { predicateText } from './predicateText.js';
import { objectText } from './objectText.js';
import { questionWord } from './questionWord.js';
import { verbAgr } from './verbAgr.js';
import type { VerbAgr } from './pl.types.js';

/**
 * One clause (P05-E8), without its condition or coordination (`polishEngine`). SVO in every clause,
 * the relative and the subordinate too. A bare pronoun subject is dropped (pro-drop, *jemy*), as is
 * the generic one, whose *się* follows the verb (*je się mysz*, D5), and an imperative's or an
 * infinitive's. A yes/no question opens on *czy* (*czy kot je mysz?*); a wh-question fronts its word
 * (*co kot je?*, *kto je mysz?*), and a possessor asked about in the object fronts the whole object
 * (*czyją mysz kot je?*). Object, subject, adverbial and purpose clauses follow after a comma: *że*,
 * *czy*, the subordinator, *żeby* + infinitive.
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
  const spoken = phrase.contentSubject || subjectless || isPronounElement(subject) ? '' : elementText(subject, 'nom');
  const subjectNegative = subject.agreement['definiteness'] === 'no';
  // *co* asked as the subject agrees as a neuter: *co zjadło mysz?*
  const agr: VerbAgr = question?.role === 'subject' && !question.animate
    ? { person: '3', plural: false, gender: 'neut', virile: false }
    : verbAgr(subject.agreement, subject.conjuncts);
  const frontObject = question?.role === 'possessor' && question.possessed === 'directObject';
  const predicate = predicateText({
    subject: subject.agreement, agr, verbPhrase: vp, directObject: frontObject ? undefined : phrase.directObject,
    complements: phrase.complements, agent: phrase.agent, subjectNegative,
  });
  const negation = clauseNegation({ verbPhrase: vp, subjectNegative, directObject: phrase.directObject, complements: phrase.complements });
  const word = !question ? ''
    : frontObject && phrase.directObject
      ? objectText(phrase.directObject, vp.verb.forms, negation.finite || negation.inner, subject.agreement)
      :questionWord(question, vp.verb, negation.finite || negation.inner);
  const opener = vp.interrogative && !question ? QUESTION_PARTICLE : '';
  const head = question?.role === 'subject' ? [word, predicate] : [opener, word, spoken, predicate];
  const governor = vp.verb.forms;
  const complement = phrase.infinitiveComplement
    ? infinitiveComplementText(phrase.infinitiveComplement, infinitiveController(phrase, subject.agreement), infinitiveLink(phrase),
      governor['causative'] === '1')
    : '';
  const purpose = phrase.purpose ? `, ${PURPOSE_WORD} ${infinitiveComplementText(phrase.purpose, subject.agreement, '')},` : '';
  const content = phrase.contentSubject ? `, ${THAT} ${renderClause(phrase.contentSubject)},` : '';
  const object = phrase.contentObject
    ? `, ${[objectComplementizer(phrase.contentObject, THAT, WHETHER), renderClause(phrase.contentObject)].filter(Boolean).join(' ')},`
    : '';
  const adverbial = phrase.adverbialClause ? `, ${adverbialText(phrase.adverbialClause)},` : '';
  return [...head, complement, purpose, content, object, adverbial].filter(Boolean).join(' ');
}

/** An adverbial clause under its conjunction: *kiedy pies biegnie*, *ponieważ kot je*. */
function adverbialText({ conjunction, clause }: NonNullable<ResolvedPhrase['adverbialClause']>): string {
  return `${SUBORDINATORS[conjunction]} ${renderClause(clause)}`;
}
