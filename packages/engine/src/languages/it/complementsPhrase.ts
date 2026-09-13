import { COMPLEMENT_RENDER_ORDER, DEFAULT_LOCATIVE_SPECIFIER, type ComplementType } from '@signi/shared';
import { abstractionLevel, actionGerund, actionInfinitive, causeSentiment, firstConjunct, isRelativeSuperlative, locativeIdiom, mannerRelation, pathSpecifier, SOURCE_ABLATIVE_ADVERB_VERBS, type ResolvedComplement } from '../../types.js';
import { IT_MANNER_PREP, LOCATIVE_IDIOMS } from './it.consts.js';
import { agreeAdj } from './agreeAdj.js';
import { coordinate } from './coordinate.js';
import { defArticle } from './defArticle.js';
import { itDeg } from './itDeg.js';
import { joinArt } from './joinArt.js';
import { joinWords } from './joinWords.js';
import { npText } from './npText.js';
import { prepArt } from './prepArt.js';
import { prepDet } from './prepDet.js';
import { renderNP } from './renderNP.js';
import { spatialHead } from './spatialHead.js';

export function complementsPhrase(
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
  subjectForms: Record<string, string>,
  verbConceptId: string,
): string {
  if (!complements) return '';
  // The ablative adverb "via" disambiguates source from direction, but only self-propelled
  // motion verbs (RUN/JUMP) need it — see SOURCE_ABLATIVE_ADVERB_VERBS. COME/GO and the
  // transitive LOAD/IMPORT keep bare "da" ("viene dalla casa", "carica il libro dal contenitore").
  const sourceAdverb = SOURCE_ABLATIVE_ADVERB_VERBS.has(verbConceptId) ? 'via ' : '';
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      // The complement's *kind* (pronoun? adjective? animate goal?) comes off its first conjunct;
      // its surface is rendered from every conjunct, each with its own article and agreement.
      const f = firstConjunct(c.phrase).head.forms;
      // Subject complement: a predicate adjective agrees with the *subject* ("sembra
      // stanca") and carries its own degree ("sembra più stanca"); a predicate noun keeps
      // its own article, no preposition ("diventa una leggenda"). Every conjunct agrees with
      // the subject independently, so a coordinated one reads "sembra stanca e felice" — and a
      // coordinated *subject* resolves to masculine plural first, giving "sembrano stanchi".
      if (type === 'predicative') {
        const gender = subjectForms['gender'] ?? 'masc';
        const plural = subjectForms['number'] === 'plural';
        return coordinate(c.phrase, (np) => {
          if (np.head.forms['role'] !== 'adjective') return npText(np);
          const surface = itDeg(np.head, agreeAdj(np.head.forms['base'] ?? '', gender, plural));
          // A predicative superlative has no noun's article to borrow (unlike "il gatto più
          // grande"), so it supplies its own, agreeing with the subject: "sembra IL più felice",
          // distinguishing it from the comparative "sembra più felice".
          return isRelativeSuperlative(np.head)
            ? joinArt(defArticle({ gender }, plural, surface), surface)
            : surface;
        });
      }
      // An instrument presented as an action: the bare gerundio for the process level
      // ("scegliendo una parola" — Italian needs no preposition before it), and the substantivized
      // infinitive for the concept level ("con lo scegliere una parola"). That infinitive is an
      // ordinary masculine singular noun, so it takes the definite article its *own* sound selects
      // — "lo scegliere" (s-impura), "il mangiare", "l'aprire" — and "con" fuses with none of them.
      // The noun phrase is the action's direct object either way.
      if (type === 'instrumental' && c.action) {
        const level = abstractionLevel(c);
        if (level !== 'object') {
          const object = coordinate(c.phrase, npText);
          const infinitive = actionInfinitive(c.action);
          const verb =
            level === 'process'
              ? actionGerund(c.action)
              : joinWords(['con', defArticle({ gender: 'masc' }, false, infinitive), infinitive]);
          const adverb = c.action.modifier?.forms['base'] ?? '';
          return joinWords([verb, object, adverb]);
        }
      }
      // A pronoun cause: positive "grazie a me/te/lui…" uses the tonic pronoun; neutral and
      // negative take the possessive, agreeing with feminine "causa"/"colpa" — "a causa mia",
      // "per colpa mia" — NOT "a causa di me" (which sounds off, like "*per colpa di me").
      // "loro" is invariable. Only cause accepts a pronoun in the UI today.
      if (type === 'cause' && f['person']) {
        const sent = causeSentiment(c);
        if (sent === 'positive') return `grazie a ${f['disjunctive'] ?? f['base'] ?? ''}`;
        const plural = f['number'] === 'plural';
        const poss =
          f['person'] === '1' ? (plural ? 'nostra' : 'mia') :
          f['person'] === '2' ? (plural ? 'vostra' : 'tua') :
          plural ? 'loro' : 'sua';
        return sent === 'negative' ? `per colpa ${poss}` : `a causa ${poss}`;
      }
      // locative→in, direction→a, source→"via da" (all fuse with article); route→path prep.
      // A direction toward an *animate* goal takes "da" ("corro dal bambino" = to/towards
      // the child — the "andare da qualcuno" construction), not bare "a", which is for
      // places ("corro alla casa"). Because source also governs "da", a self-propelled motion
      // verb prefixes it with the ablative adverb "via" so the two senses never collide: "corro
      // dal bambino" (motion to) vs "corro via dal bambino" (motion away from). COME/GO and the
      // transitive LOAD/IMPORT take an origin, not a departure, so they keep bare "da".
      // Cause reads "a causa di" + the "di"-fused article ("a causa del cane"); the sentiment
      // swaps the connector — negative "per colpa del cane", positive "grazie al cane" ("a"-fused).
      // The preposition fuses with the article ("in"+"la" → "nella"), so it cannot be factored
      // out in front of a coordinated complement — each conjunct carries its own fused head:
      // "nella casa e nel bosco", never "*nella casa e il bosco". Repeating it also lets each
      // conjunct choose its own preposition, which `direction` needs — the animate goal takes
      // "da" and the place goal "a" ("corro dal bambino e alla casa").
      // A locative proper noun (a continent — "Europa", "Africa") drops the definite article it
      // carries as a subject ("l'Europa mangia"): the "in place" locative takes a bare "in Europa",
      // not the article-fused "nell'Europa". (Cities would take "a", but only continents are seeded.)
      // That bare form belongs to plain containment only — a relational locative keeps its adverb
      // and article ("sotto l'Europa"), so it goes through `spatialHead` like any other relation.
      const causeSent = type === 'cause' ? causeSentiment(c) : 'neutral';
      const locSpec = pathSpecifier(c, DEFAULT_LOCATIVE_SPECIFIER);
      const headFor = (nf: Record<string, string>) => (plural: boolean, lead: string): string =>
        type === 'locative'  ? (nf['proper'] === '1' && locSpec === 'in' ? 'in' : spatialHead(locSpec, nf, plural, lead)) :
        type === 'terminus'  ? prepDet('a', nf, plural, lead) :
        type === 'instrumental' ? prepDet('con', nf, plural, lead) :
        type === 'manner'    ? prepDet(IT_MANNER_PREP[mannerRelation(nf)], nf, plural, lead) :
        type === 'direction' ? (
          // A continent goal takes bare "in" ("va in Antartide"), not the default place "a" with
          // the proper noun's article ("all'Antartide"); an animate goal takes "da", a place "a".
          nf['isA'] === 'CONTINENT' ? 'in' :
          prepDet(nf['animate'] === '1' ? 'da' : 'a', nf, plural, lead)
        ) :
        type === 'source'    ? `${sourceAdverb}${prepDet('da', nf, plural, lead)}` :
        type === 'cause'     ? (
          causeSent === 'positive' ? `grazie ${prepArt('a', nf, plural, lead)}` :
          causeSent === 'negative' ? `per colpa ${prepArt('di', nf, plural, lead)}` :
          `a causa ${prepArt('di', nf, plural, lead)}`
        ) :
        spatialHead(pathSpecifier(c), nf, plural, lead);
      // A hearth noun takes its fixed locative idiom in place of the whole noun phrase — "a casa", not
      // the article-fused "nella casa" — so it bypasses the article and fusion machinery entirely.
      return coordinate(c.phrase, (np) =>
        (type === 'locative' && locativeIdiom(c, np, LOCATIVE_IDIOMS)) || renderNP(np, headFor(np.head.forms)));
    })
    .filter(Boolean)
    .join(' ');
}
