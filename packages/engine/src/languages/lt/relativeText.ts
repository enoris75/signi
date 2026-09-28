import type { ResolvedNounPhrase } from '../../types.js';
import { isGenericSubject } from '../../functions/isGenericSubject.js';
import { isPlainLocativeGap } from '../../functions/isPlainLocativeGap.js';
import { isPronounElement } from '../../functions/isPronounElement.js';
import { relativeGapComplement } from '../../functions/relativeGapComplement.js';
import { relativePossessed } from '../../functions/relativePossessed.js';
import { relativeSubjectIsNegative } from '../../functions/relativeSubjectIsNegative.js';
import { AGENT, WHERE } from './lt.consts.js';
import { clauseNegation } from './clauseNegation.js';
import { complementsPhrase } from './complementsPhrase.js';
import { elementText } from './elementText.js';
import { kurisForm } from './kurisForm.js';
import { nounAgr } from './nounAgr.js';
import { objectGovernment } from './objectGovernment.js';
import { predicateText } from './predicateText.js';
import { verbAgr } from './verbAgr.js';
import { withPreposition } from './withPreposition.js';
import type { NpContext } from './lt.types.js';

/** The head's agreement keys a relativizer stand-in carries beside the shared ones (`relativizerStandIn`). */
const AGREEMENT_KEYS = ['plurale_tantum', 'thing'] as const;

/**
 * A noun phrase's relative clause (P18 §0.5), set off by commas as Lithuanian always writes it:
 * *kuris / kuri*, agreeing with the head and in the case of its role (`kurisForm`) — *katė, kuri
 * valgo pelę*; *pelė, kurią katė valgo*; *pelė, kurios katė nevalgo* (the genitive of negation reaches
 * it); *namas, kuriame katė valgo*; *vaikas, kuriam vyras duoda knygą*; *vaikas, kurio knyga rašoma*
 * (a passive's agent, the bare genitive) — or *kur* for a plain place (*vieta, kur gyvena*), and *kas*
 * after an indefinite pronoun (*kažkas, kas bėga*). The possessor relative is the genitive *kurio /
 * kurios / kurių* before the possessed noun (*katė, kurios maistas yra didelis*). The clause keeps the
 * order SVO, and drops a 1st or 2nd person pronoun subject as a main clause does (*knyga, kurią
 * skaitau*); a 3rd person one stays (D6).
 */
export function relativeText(np: ResolvedNounPhrase, _ctx: NpContext = {}): string {
  const rel = np.relative;
  if (!rel) return '';
  const head = np.head.forms;
  const pronoun = !!head['person'] && head['indefinite'] === '1';
  const headAgr = nounAgr(head);
  // The head as the clause's subject: its quantifier governs the head, not the relative's verb.
  const { definiteness: _d, numeral: _n, ...plainHead } = head;
  const vp = rel.verbPhrase;
  const clause = (subject: Record<string, string>, agr: ReturnType<typeof verbAgr>, subjectNegative = false) =>
    predicateText({ subject, agr, verbPhrase: vp, directObject: rel.directObject, complements: rel.complements, agent: rel.agent, subjectNegative });

  const possessed = relativePossessed(rel);
  if (possessed) {
    const whose = kurisForm('gen', headAgr, pronoun);
    return `, ${[whose, elementText(possessed, 'nom'), clause(possessed.agreement, verbAgr(possessed.agreement, possessed.conjuncts))].filter(Boolean).join(' ')},`;
  }
  const subjectRelative = rel.headRole === 'subject' || !rel.subject;
  const subject = subjectRelative ? plainHead : rel.subject!.agreement;
  const agr = subjectRelative ? verbAgr(plainHead) : verbAgr(rel.subject!.agreement, rel.subject!.conjuncts);
  const subjectNegative = !subjectRelative && relativeSubjectIsNegative(rel);
  const negation = clauseNegation({ verbPhrase: vp, subjectNegative, directObject: rel.directObject, complements: rel.complements });
  const standIn: Record<string, string> = { relativizer: pronoun ? 'kas' : '1' };
  for (const k of AGREEMENT_KEYS) if (head[k] !== undefined) standIn[k] = head[k]!;
  const relativizer = subjectRelative ? kurisForm('nom', headAgr, pronoun)
    : rel.headRole === 'directObject' ? (() => {
      const gov = objectGovernment(vp.verb.forms, negation.finite || negation.inner);
      return withPreposition(gov.prep, kurisForm(gov.case, headAgr, pronoun));
    })()
    : rel.headRole === 'agent' ? withPreposition(AGENT, kurisForm(AGENT.case, headAgr, pronoun))
    : isPlainLocativeGap(rel) ? WHERE
    : complementsPhrase(relativeGapComplement(np, standIn), { subject, verb: vp.verb.forms });
  const subjectPerson = rel.subject?.agreement['person'];
  const dropped = !!rel.subject && isPronounElement(rel.subject) && (subjectPerson === '1' || subjectPerson === '2');
  const spoken = !subjectRelative && !isGenericSubject(rel.subject!) && !dropped
    ? elementText(rel.subject!, 'nom')
    : '';
  return `, ${[relativizer, spoken, clause(subject, agr, subjectNegative)].filter(Boolean).join(' ')},`;
}
