import { COMPLEMENT_RENDER_ORDER, DEFAULT_LOCATIVE_SPECIFIER, type ComplementType } from '@signi/shared';
import { abstractionLevel, actionGerund, actionInfinitive, causeSentiment, isRelativeSuperlative, locativeIdiom, mannerRelation, pathSpecifier, possessedHeadForms, SOURCE_ABLATIVE_ADVERB_VERBS, type ResolvedComplement, type ResolvedNounPhrase } from '../../types.js';
import { possessiveEs, pronounPossessor } from '../../possessive.js';
import { aDet } from './aDet.js';
import { agreeAdj } from './agreeAdj.js';
import { artForms } from './artForms.js';
import { coordinateElement } from './coordinateElement.js';
import { datPrep } from './datPrep.js';
import { deDet } from './deDet.js';
import { defArticle } from './defArticle.js';
import { LOCATIVE_IDIOMS } from './es.consts.js';
import { esAdj } from './esAdj.js';
import { esDeg } from './esDeg.js';
import { isPlural } from './isPlural.js';
import { nounPhrase } from './nounPhrase.js';
import { npText } from './npText.js';
import { predicativeForms } from './predicativeForms.js';
import { prepDet } from './prepDet.js';
import { spatialHead } from './spatialHead.js';
import { withAdj } from './withAdj.js';
import { withRelative } from './withRelative.js';
import { esPossessiveWord } from './esPossessiveWord.js';

export function complementsPhrase(
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
  subjectForms: Record<string, string>,
  verbConceptId: string,
): string {
  // "lejos" disambiguates source from direction, but only self-propelled motion verbs (RUN/JUMP)
  // need it — see SOURCE_ABLATIVE_ADVERB_VERBS. COME/GO and the transitive LOAD/IMPORT keep bare
  // "de" ("el gato viene de la casa", "carga el libro del contenedor").
  const sourceAdverb = SOURCE_ABLATIVE_ADVERB_VERBS.has(verbConceptId) ? 'lejos ' : '';
  if (!complements) return '';
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      // Subject complement: a predicate adjective agrees with the *subject* ("parece
      // cansada") and carries its own degree ("parece más cansada"); a predicate noun keeps
      // its own article, no preposition ("se vuelve una leyenda"). Coordinated conjuncts each
      // agree with the subject: "parece cansada y feliz".
      if (type === 'predicative') {
        const gender = subjectForms['gender'] ?? 'masc';
        const plural = subjectForms['number'] === 'plural';
        return coordinateElement(c.phrase, (np) => {
          if (np.head.forms['role'] !== 'adjective') {
            return withRelative(nounPhrase(predicativeForms(np.head.forms), esAdj(np)), np);
          }
          const surface = esDeg(np.head, agreeAdj(np.head.forms['base'] ?? '', gender, plural));
          // A predicative superlative has no noun's article to borrow, so it adds its own, agreeing
          // with the subject: "parece EL más feliz" — distinct from the comparative "más feliz".
          return isRelativeSuperlative(np.head) ? `${defArticle({ gender }, plural)} ${surface}` : surface;
        });
      }
      // An instrument presented as an action: the bare gerundio for the process level
      // ("eligiendo una palabra"), the substantivized infinitive for the concept level ("con el
      // elegir una palabra") — a masculine singular noun, hence the invariant "el", whatever the
      // infinitive. The noun phrase is the action's direct object either way.
      if (type === 'instrumental' && c.action) {
        const level = abstractionLevel(c);
        if (level !== 'object') {
          const object = coordinateElement(c.phrase, npText);
          const verb =
            level === 'process'
              ? actionGerund(c.action)
              : `con el ${actionInfinitive(c.action)}`;
          const adverb = c.action.modifier?.forms['base'] ?? '';
          return [verb, object, adverb].filter(Boolean).join(' ');
        }
      }
      // The preposition contracts with the article ("a"+"el" → "al"), so it cannot be factored
      // out in front of a coordinated complement — each conjunct carries its own contracted head
      // ("al gato y al perro"). Repeating it also lets each conjunct pick its own preposition,
      // which `direction` needs: an animate goal takes "hacia", a place "a". A cause group holding a
      // pronoun shares its connector instead (see below), so each conjunct then brings only its
      // contracted "de"/"a" (`connectorShared`).
      const conjunctText = (np: ResolvedNounPhrase, connectorShared = false): string => {
      // A hearth noun takes its fixed locative idiom in place of the whole noun phrase — a bare
      // "en casa", not "en el hogar" — so no article, adjective or relative is built for it.
      const idiom = type === 'locative' && locativeIdiom(c, np, LOCATIVE_IDIOMS);
      if (idiom) return idiom;
      // A possessive replaces the article, so the head is the preposition alone ("en mi casa", "a tu perro").
      const f = possessedHeadForms(np, 'bare');
      const plural = isPlural(f);
      const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
      const adj = esAdj(np);
      const noun = [esPossessiveWord(np), withAdj(word, adj)].filter(Boolean).join(' ');
      // The article is chosen from `af`, not `f`: a prenominal adjective changes which one the
      // stressed-a nouns take ("en la primera agua").
      const af = artForms(f, adj);
      // locative→en, direction→a (al/a la), source→"lejos de" (lejos del/de la),
      // route→path preposition. A direction toward an *animate* goal takes "hacia"
      // (toward) — bare "a" + person doesn't read as a motion destination ("corro hacia
      // el niño", not "*al niño"); "hacia" doesn't contract. A self-propelled motion verb
      // prefixes source with the ablative adverb "lejos" so it reads as motion away ("corro
      // lejos del niño"); bare "de" reads as origin/possession, not departure — which is right
      // for COME/GO and the transitive LOAD/IMPORT, whose source is an origin.
      // Cause reads "a causa de" + the cause's own determiner, contracted only when definite ("a
      // causa del perro", "a causa de un perro"); the sentiment swaps the connector — negative "por
      // culpa del perro", positive "gracias al perro".
      const causeSent = type === 'cause' ? causeSentiment(c) : 'neutral';
      const head =
        type === 'locative'  ? spatialHead(pathSpecifier(c, DEFAULT_LOCATIVE_SPECIFIER), plural, af) :
        type === 'terminus'  ? aDet(af, plural) :
        // Instrumental → "con", which contracts with nothing ("con el cuchillo", "con una palabra").
        type === 'instrumental' ? prepDet('con', af, plural) :
        // Manner: similative "como" (como el viento — the default), means "con" (con cuidado),
        // measure "a" (a la velocidad de la luz), mode "de" (de manera…). Read off the head noun.
        type === 'manner'    ? (
          mannerRelation(af) === 'means'   ? prepDet('con', af, plural) :
          mannerRelation(af) === 'measure' ? aDet(af, plural) :
          mannerRelation(af) === 'mode'    ? deDet(af, plural) :
          prepDet('como', af, plural)
        ) :
        type === 'direction' ? (f['animate'] === '1' ? prepDet('hacia', af, plural) : aDet(af, plural)) :
        type === 'source'    ? `${sourceAdverb}${deDet(af, plural)}` :
        type === 'cause'     ? (
          causeSent === 'positive' ? `${connectorShared ? '' : 'gracias '}${aDet(af, plural)}` :
          causeSent === 'negative' ? `por culpa ${deDet(af, plural)}` :
          `${connectorShared ? '' : 'a causa '}${deDet(af, plural)}`
        ) :
        spatialHead(pathSpecifier(c), plural, af);
      return withRelative(`${head} ${noun}`, np);
      };
      // A pronoun cause: neutral "a causa de mí" and positive "gracias a mí" take the tonic
      // form after bare "de"/"a"; negative uses the possessive with "culpa" ("por mi culpa").
      // Each conjunct of a group takes its own form, never the first one's. The neutral and positive
      // connector is said once, each conjunct bringing its own "de"/"a" ("a causa de mí y del
      // perro"); the negative one holds a possessive, so every conjunct repeats it ("por mi culpa y
      // por culpa del perro").
      if (type === 'cause' && c.phrase.conjuncts.some((np) => np.head.forms['person'])) {
        const sent = causeSentiment(c);
        const pronoun = (pf: Record<string, string>): string => {
          if (sent === 'negative') return `por ${possessiveEs(pronounPossessor(pf), { gender: 'fem', number: 'singular' })} culpa`;
          return `${sent === 'positive' ? 'a' : 'de'} ${pf['disjunctive'] ?? pf['base'] ?? ''}`;
        };
        const shared = sent !== 'negative';
        const conjuncts = coordinateElement(c.phrase, (np) =>
          np.head.forms['person'] ? pronoun(np.head.forms) : conjunctText(np, shared));
        return shared ? `${sent === 'positive' ? 'gracias' : 'a causa'} ${conjuncts}` : conjuncts;
      }
      return coordinateElement(c.phrase, (np) => conjunctText(np), true);
    })
    .filter(Boolean)
    .join(' ');
}
