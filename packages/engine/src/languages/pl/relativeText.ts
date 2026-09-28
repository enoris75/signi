import type { ResolvedNounPhrase } from '../../types.js';
import { isGenericSubject } from '../../functions/isGenericSubject.js';
import { isPlainLocativeGap } from '../../functions/isPlainLocativeGap.js';
import { isPronounElement } from '../../functions/isPronounElement.js';
import { relativeGapComplement } from '../../functions/relativeGapComplement.js';
import { relativePossessed } from '../../functions/relativePossessed.js';
import { relativeSubjectIsNegative } from '../../functions/relativeSubjectIsNegative.js';
import { AGENT, WHERE } from './pl.consts.js';
import { clauseNegation } from './clauseNegation.js';
import { complementsPhrase } from './complementsPhrase.js';
import { elementText } from './elementText.js';
import { ktoryForm } from './ktoryForm.js';
import { nounAgr } from './nounAgr.js';
import { objectGovernment } from './objectGovernment.js';
import { predicateText } from './predicateText.js';
import { verbAgr } from './verbAgr.js';
import { withPreposition } from './withPreposition.js';
import type { NpContext } from './pl.types.js';

/** The head's agreement keys a relativizer stand-in carries beside the shared ones (`relativizerStandIn`). */
const AGREEMENT_KEYS = ['virile', 'animate_acc', 'plurale_tantum', 'person', 'thing'] as const;

/**
 * A noun phrase's relative clause (P05 §0.6), set off by commas as Polish always writes it: *który*,
 * agreeing with the head and in the case of its role (`ktoryForm`) — *kot, który je mysz*; *mysz,
 * którą kot je*; *mysz, której kot nie je* (the genitive of negation reaches it); *dom, w którym kot
 * je*; *dziecko, któremu mężczyzna daje książkę*; *dziecko, przez które książka jest pisana* (a
 * passive's agent) — or *gdzie* for a plain place (*miejsce, gdzie się żyje*), and *kto / co* after an
 * indefinite pronoun (*ktoś, kto biegnie*). The possessor relative is the genitive *którego / której /
 * których* before the possessed noun (*kot, którego jedzenie jest duże*). The clause keeps the order
 * SVO, and drops a pronoun subject as a main clause does (*książka, którą czytam*).
 */
export function relativeText(np: ResolvedNounPhrase, _ctx: NpContext = {}): string {
  const rel = np.relative;
  if (!rel) return '';
  const head = np.head.forms;
  const pronoun = head['person'] && head['indefinite'] === '1' ? (head['thing'] === '1' ? 'co' : 'kto') : undefined;
  const headAgr = nounAgr(head);
  // The head as the clause's subject: its quantifier governs the head, not the relative's verb.
  const { definiteness: _d, numeral: _n, ...plainHead } = head;
  const vp = rel.verbPhrase;
  const clause = (subject: Record<string, string>, agr: ReturnType<typeof verbAgr>, subjectNegative = false) =>
    predicateText({ subject, agr, verbPhrase: vp, directObject: rel.directObject, complements: rel.complements, agent: rel.agent, subjectNegative });

  const possessed = relativePossessed(rel);
  if (possessed) {
    const whose = ktoryForm('gen', headAgr, pronoun);
    return `, ${[whose, elementText(possessed, 'nom'), clause(possessed.agreement, verbAgr(possessed.agreement, possessed.conjuncts))].filter(Boolean).join(' ')},`;
  }
  const subjectRelative = rel.headRole === 'subject' || !rel.subject;
  const subject = subjectRelative ? plainHead : rel.subject!.agreement;
  const agr = subjectRelative ? verbAgr(plainHead) : verbAgr(rel.subject!.agreement, rel.subject!.conjuncts);
  const subjectNegative = !subjectRelative && relativeSubjectIsNegative(rel);
  const negation = clauseNegation({ verbPhrase: vp, subjectNegative, directObject: rel.directObject, complements: rel.complements });
  const standIn: Record<string, string> = { relativizer: pronoun ?? '1' };
  for (const k of AGREEMENT_KEYS) if (head[k] !== undefined && k !== 'person') standIn[k] = head[k]!;
  const relativizer = subjectRelative ? ktoryForm('nom', headAgr, pronoun)
    : rel.headRole === 'directObject' ? (() => {
      const gov = objectGovernment(vp.verb.forms, negation.finite || negation.inner);
      return withPreposition(gov.prep, ktoryForm(gov.case, headAgr, pronoun));
    })()
    : rel.headRole === 'agent' ? withPreposition(AGENT.prep, ktoryForm(AGENT.case, headAgr, pronoun))
    : isPlainLocativeGap(rel) ? WHERE
    : complementsPhrase(relativeGapComplement(np, standIn), { subject, verb: vp.verb.forms });
  const spoken = !subjectRelative && !isGenericSubject(rel.subject!) && !isPronounElement(rel.subject!)
    ? elementText(rel.subject!, 'nom')
    : '';
  return `, ${[relativizer, spoken, clause(subject, agr, subjectNegative)].filter(Boolean).join(' ')},`;
}
