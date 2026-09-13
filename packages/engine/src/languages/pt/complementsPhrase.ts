import { COMPLEMENT_RENDER_ORDER, DEFAULT_LOCATIVE_SPECIFIER, type ComplementType } from '@signi/shared';
import { abstractionLevel, actionGerund, actionInfinitive, causeSentiment, isRelativeSuperlative, locativeIdiom, mannerRelation, pathSpecifier, SOURCE_ABLATIVE_ADVERB_VERBS, type ResolvedComplement, type ResolvedNounPhrase } from '../../types.js';
import { contractDet } from './contractDet.js';
import { coordinateElement } from './coordinateElement.js';
import { datPrep } from './datPrep.js';
import { defArticle } from './defArticle.js';
import { dePrep } from './dePrep.js';
import { isPlural } from './isPlural.js';
import { nounPhrase } from './nounPhrase.js';
import { npText } from './npText.js';
import { predicativeForms } from './predicativeForms.js';
import { prepDet } from './prepDet.js';
import { LOCATIVE_IDIOMS } from './pt.consts.js';
import { ptAdj } from './ptAdj.js';
import { ptComparison } from './ptComparison.js';
import { spatialHead } from './spatialHead.js';
import { withAdj } from './withAdj.js';
import { withRelative } from './withRelative.js';

export function complementsPhrase(
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
  subjectForms: Record<string, string>,
  verbConceptId: string,
): string {
  // "longe" disambiguates source from direction, but only self-propelled motion verbs (RUN/JUMP)
  // need it — see SOURCE_ABLATIVE_ADVERB_VERBS. COME/GO and the transitive LOAD/IMPORT keep bare
  // "de" ("o gato vem da casa", "carrega o livro do contentor").
  const sourceAdverb = SOURCE_ABLATIVE_ADVERB_VERBS.has(verbConceptId) ? 'longe ' : '';
  if (!complements) return '';
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      // Subject complement: a predicate adjective agrees with the *subject* ("parece
      // cansada") and carries its own degree ("parece mais cansada"); a predicate noun keeps
      // its own article, no preposition ("torna-se uma lenda"). Coordinated conjuncts each
      // agree with the subject: "parece cansada e feliz".
      if (type === 'predicative') {
        const gender = subjectForms['gender'] ?? 'masc';
        const plural = subjectForms['number'] === 'plural';
        return coordinateElement(c.phrase, (np) => {
          if (np.head.forms['role'] !== 'adjective') {
            return withRelative(nounPhrase(predicativeForms(np.head.forms), ptAdj(np)), np);
          }
          const surface = ptComparison(np.head, gender, plural);
          // A predicative superlative has no noun's article to borrow, so it adds its own, agreeing
          // with the subject: "parece O mais feliz" — distinct from the comparative "mais feliz".
          return isRelativeSuperlative(np.head) ? `${defArticle({ gender }, plural)} ${surface}` : surface;
        });
      }
      // An instrument presented as an action: the bare gerúndio for the process level
      // ("escolhendo uma palavra"), the substantivized infinitive for the concept level ("com o
      // escolher uma palavra") — a masculine singular noun, hence the invariant "o", whatever the
      // infinitive. The noun phrase is the action's direct object either way.
      if (type === 'instrumental' && c.action) {
        const level = abstractionLevel(c);
        if (level !== 'object') {
          const object = coordinateElement(c.phrase, npText);
          const verb =
            level === 'process'
              ? actionGerund(c.action)
              : `com o ${actionInfinitive(c.action)}`;
          const adverb = c.action.modifier?.forms['base'] ?? '';
          return [verb, object, adverb].filter(Boolean).join(' ');
        }
      }
      // The preposition contracts with the article ("em"+"a" → "na"), so it cannot be factored
      // out in front of a coordinated complement — each conjunct carries its own contracted head
      // ("na casa e no bosque"). Repeating it also lets each conjunct pick its own preposition,
      // which `direction` needs: an animate goal takes "para", a place "a". A cause group holding a
      // pronoun shares its connector instead (see below), so each conjunct then brings only its
      // contracted "de"/"a" (`connectorShared`).
      const conjunctText = (np: ResolvedNounPhrase, connectorShared = false): string => {
      // A hearth noun takes its fixed locative idiom in place of the whole noun phrase — a bare
      // "em casa", not the contracted "no lar" — so no article, adjective or relative is built for it.
      const idiom = type === 'locative' && locativeIdiom(c, np, LOCATIVE_IDIOMS);
      if (idiom) return idiom;
      const f = np.head.forms;
      const plural = isPlural(f);
      const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
      const noun = withAdj(word, ptAdj(np));
      // locative→em (no/na), direction→a (ao/à), source→"longe de" (longe do/da),
      // route→path preposition. A direction toward an *animate* goal takes "para"
      // (to/toward) — bare "a" + person doesn't read as a motion destination ("corro para
      // a criança", not "*à criança"); "para" doesn't contract. A self-propelled motion verb
      // prefixes source with the ablative adverb "longe" so it reads as motion away ("corro
      // longe da criança"); bare "de" reads as origin/possession, not departure — which is right
      // for COME/GO and the transitive LOAD/IMPORT, whose source is an origin.
      // Cause reads "por causa de" + the cause's own determiner, contracted with the article or a
      // demonstrative ("por causa do cão", "deste cão", "de um cão"); the sentiment swaps the
      // connector — negative "por culpa do cão", positive "graças ao cão".
      const causeSent = type === 'cause' ? causeSentiment(c) : 'neutral';
      const head =
        type === 'locative'  ? spatialHead(pathSpecifier(c, DEFAULT_LOCATIVE_SPECIFIER), f, plural) :
        type === 'terminus'  ? contractDet(datPrep, 'a', f, plural) :
        // Instrumental → "com". It contracts only with the pronouns (comigo…), never with an
        // article, so the plain preposition leads the determiner: "com a faca", "com uma palavra".
        type === 'instrumental' ? prepDet('com', f, plural) :
        // Manner: similative "como" (como o vento — the default), means "com" (com cuidado),
        // measure "a" (à velocidade da luz), mode "de" (de maneira…). Read off the head noun.
        type === 'manner'    ? (
          mannerRelation(f) === 'means'   ? prepDet('com', f, plural) :
          mannerRelation(f) === 'measure' ? contractDet(datPrep, 'a', f, plural) :
          mannerRelation(f) === 'mode'    ? contractDet(dePrep, 'de', f, plural) :
          prepDet('como', f, plural)
        ) :
        type === 'direction' ? (f['animate'] === '1' ? prepDet('para', f, plural) : contractDet(datPrep, 'a', f, plural)) :
        type === 'source'    ? `${sourceAdverb}${contractDet(dePrep, 'de', f, plural)}` :
        type === 'cause'     ? (
          causeSent === 'positive' ? `${connectorShared ? '' : 'graças '}${contractDet(datPrep, 'a', f, plural)}` :
          causeSent === 'negative' ? `por culpa ${contractDet(dePrep, 'de', f, plural)}` :
          `${connectorShared ? '' : 'por causa '}${contractDet(dePrep, 'de', f, plural)}`
        ) :
        spatialHead(pathSpecifier(c), f, plural);
      return withRelative(`${head} ${noun}`, np);
      };
      // A pronoun cause: neutral "por causa de mim / dele" takes the tonic form after "de"
      // (which contracts with the 3rd-person pronouns, de+ele→dele); positive "graças a mim"
      // takes the tonic after "a"; negative uses the possessive with "culpa" ("por minha culpa").
      // Each conjunct of a group takes its own form, never the first one's. The neutral and positive
      // connector is said once, each conjunct bringing its own "de"/"a" ("por causa de mim e do
      // cão"); the negative one holds a possessive, so every conjunct repeats it ("por minha culpa e
      // por culpa do cão").
      if (type === 'cause' && c.phrase.conjuncts.some((np) => np.head.forms['person'])) {
        const sent = causeSentiment(c);
        const pronoun = (pf: Record<string, string>): string => {
          const disj = pf['disjunctive'] ?? pf['base'] ?? '';
          if (sent === 'positive') return `a ${disj}`;
          if (sent === 'negative') {
            const plural = pf['number'] === 'plural';
            const poss =
              pf['person'] === '1' ? (plural ? 'nossa' : 'minha') :
              pf['person'] === '2' ? (plural ? 'vossa' : 'tua') :
              'sua';
            return `por ${poss} culpa`;
          }
          return /^e/i.test(disj) ? `d${disj}` : `de ${disj}`;
        };
        const shared = sent !== 'negative';
        const conjuncts = coordinateElement(c.phrase, (np) =>
          np.head.forms['person'] ? pronoun(np.head.forms) : conjunctText(np, shared));
        return shared ? `${sent === 'positive' ? 'graças' : 'por causa'} ${conjuncts}` : conjuncts;
      }
      return coordinateElement(c.phrase, (np) => conjunctText(np));
    })
    .filter(Boolean)
    .join(' ');
}
