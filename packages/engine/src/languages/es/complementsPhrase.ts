import { COMPLEMENT_RENDER_ORDER, DEFAULT_LOCATIVE_SPECIFIER, type ComplementType } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounPhrase } from '../../types.js';
import { abstractionLevel } from '../../functions/abstractionLevel.js';
import { actionGerund } from '../../functions/actionGerund.js';
import { actionInfinitive } from '../../functions/actionInfinitive.js';
import { causeSentiment } from '../../functions/causeSentiment.js';
import { withCauseNegator } from '../../functions/withCauseNegator.js';
import { isRelativeSuperlative } from '../../functions/isRelativeSuperlative.js';
import { takesPredicateArticle } from '../../functions/takesPredicateArticle.js';
import { locativeIdiom } from '../../functions/locativeIdiom.js';
import { mannerRelation } from '../../functions/mannerRelation.js';
import { isAdjectivePredicate } from '../../functions/isAdjectivePredicate.js';
import { objectPredication } from '../../functions/objectPredication.js';
import { directionSpecifier } from '../../functions/directionSpecifier.js';
import { pathSpecifier } from '../../functions/pathSpecifier.js';
import { groupScopedRelation } from '../../functions/groupScopedRelation.js';
import { liftPreposition } from '../../functions/liftPreposition.js';
import { BETWEEN_PREP } from './es.consts.js';
import { temporalRelation } from '../../functions/temporalRelation.js';
import { temporalPreposition } from '../../functions/temporalPreposition.js';
import { withDefiniteness } from '../../functions/withDefiniteness.js';
import { possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { tonicPronoun } from '../../functions/tonicPronoun.js';
import { SOURCE_ABLATIVE_ADVERB_VERBS, TONIC_COMPLEMENTS } from '../../functions/functions.consts.js';
import { tonicHeadForms } from '../../functions/tonicHeadForms.js';
import { headPreposition } from '../../functions/headPreposition.js';
import { KEPT_BESIDE_POSSESSIVE, possessiveEs, possessiveEsStressed, pronounPossessor } from '../../possessive.js';
import { aDet } from './aDet.js';
import { agreeAdj } from './agreeAdj.js';
import { artForms } from './artForms.js';
import { coordinateElement } from './coordinateElement.js';
import { datPrep } from './datPrep.js';
import { deDet } from './deDet.js';
import { defArticle } from './defArticle.js';
import { COMITATIVE_FUSION, CONSTITUENT_NEGATOR, ES_TEMPORAL, LOCATIVE_IDIOMS, NOMINATIVE_PREP } from './es.consts.js';
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

// `objectForms` are the direct object's, which the object complement predicates of and agrees an
// adjective head with ("pinta la pared roja") — the object's counterpart of `subjectForms`.
export function complementsPhrase(
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
  subjectForms: Record<string, string>,
  verbConceptId: string,
  objectForms: Record<string, string> = {},
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
            // A predicate nominal owns things like any other noun phrase ("el perro es su
            // poseedor"), so it asks `nounPhrase` for the possessive the subject and the object
            // already get (A198). `esPossessiveWord` is empty for a genitive or absent possessor.
            return withRelative(nounPhrase(predicativeForms(np.head.forms), esAdj(np), esPossessiveWord(np)), np);
          }
          const surface = esDeg(np.head, agreeAdj(np.head.forms['base'] ?? '', gender, plural));
          // A predicative superlative has no noun's article to borrow, so it adds its own, agreeing
          // with the subject: "parece EL más feliz" — distinct from the comparative "más feliz".
          // SAME keeps its article the same way: "es el mismo" (see `takesPredicateArticle`).
          return isRelativeSuperlative(np.head) || takesPredicateArticle(np.head) ?`${defArticle({ gender }, plural)} ${surface}` : surface;
        });
      }
      // Object complement: what the object is *made into* ("convertir el período en un comando")
      // or *taken as* ("usar el período como condición"). It predicates of the direct object, so
      // an adjective head agrees with that and not with the subject. Neither marker contracts —
      // Spanish fuses only "a" and "de" with "el", and a verb links its object predicative with
      // neither — so the marker simply leads the phrase. The essive drops the article: it names a
      // role rather than picking a referent out ("como condición", never "como la condición").
      if (type === 'objectPredicative') {
        const essive = objectPredication(c) === 'essive';
        // The factitive link introduces a noun ("en una prisión"); an adjective predicate takes
        // none — "hace la casa hermosa", never "*en hermosa".
        const marker = essive ? 'como' : isAdjectivePredicate(c) ? '' : (c.link ?? '');
        const gender = objectForms['gender'] ?? 'masc';
        const plural = objectForms['number'] === 'plural';
        return coordinateElement(c.phrase, (conjunct) => {
          const np = essive ? withDefiniteness(conjunct, 'bare') : conjunct;
          const word = np.head.forms['role'] === 'adjective'
            ? esDeg(np.head, agreeAdj(np.head.forms['base'] ?? '', gender, plural))
            // The object predicative owns things too: "en su prisión", "como su prisión" — neither
            // marker contracts with a possessive in Spanish (A198).
            : withRelative(nounPhrase(predicativeForms(np.head.forms), esAdj(np), esPossessiveWord(np)), np);
          return [marker, word].filter(Boolean).join(' ');
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
      // A pronoun behind an adposition is the bare preposition + the tonic form, with no article
      // ("en él", never "en el él" — A197 for the comitative and the instrumental, A203 for the
      // other five), as the cause below already spells it after "a"/"de". The 1st and 2nd singular
      // fuse with the comitative preposition instead (conmigo, contigo). Which preposition each
      // slot takes is not decided here: the head below is built as it always is, from a forms bag
      // that carries no determiner for it to fuse with (`tonicHeadForms`), and the tonic form
      // follows it in place of the noun.
      const tonic = TONIC_COMPLEMENTS.has(type) ? tonicPronoun(np) : undefined;
      if (tonic && (type === 'instrumental' || type === 'comitative')) return COMITATIVE_FUSION[tonic] ?? `con ${tonic}`;
      // A possessive replaces the article, so the head is the preposition alone ("en mi casa", "a tu perro").
      // Unless the head carries a determiner of its own: that keeps its slot, the preposition takes
      // it as it would any other ("en esta casa", "en ninguna casa"), and the possessive follows the
      // noun in its stressed form — "en esta casa mía", "en ninguna casa mía" (A187 in the noun
      // phrase, A202 here). `possessedHeadForms` answers `bare` for the prenominal case alone, so a
      // detached possessive asks for the head's own determiner back.
      const possessive = esPossessiveWord(np);
      const ownDeterminer = np.head.forms['definiteness'] ?? 'definite';
      const detached = !!possessive && KEPT_BESIDE_POSSESSIVE.has(ownDeterminer);
      const possessed = possessedHeadForms(np, 'bare');
      const f = detached ? { ...possessed, definiteness: ownDeterminer } : possessed;
      const plural = isPlural(f);
      const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
      const adj = esAdj(np);
      const fem = (f['gender'] ?? 'masc') === 'fem';
      const stressed = detached
        ? possessiveEsStressed(possessive, { gender: fem ? 'fem' : 'masc', number: plural ? 'plural' : 'singular' })
        : '';
      // "todos" is the other determiner that survives a possessive, and it does not detach: it
      // stands in front of the unstressed one ("en todas mis casas"), which is why it is written
      // here rather than taken from `artFor` — that one would put the article back ("todas las").
      const every = possessive && ownDeterminer === 'all'
        ? (plural ? (fem ? 'todas' : 'todos') : (fem ? 'toda' : 'todo'))
        : '';
      const noun = detached
        ? [withAdj(word, adj), stressed].filter(Boolean).join(' ')
        : [every, possessive, withAdj(word, adj)].filter(Boolean).join(' ');
      // The article is chosen from `af`, not `f`: a prenominal adjective changes which one the
      // stressed-a nouns take ("en la primera agua").
      const af = tonic ? tonicHeadForms(np) : artForms(f, adj);
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
      const dirSpec = type === 'direction' ? directionSpecifier(c) : undefined;
      const head =
        type === 'locative'  ? spatialHead(pathSpecifier(c, DEFAULT_LOCATIVE_SPECIFIER), plural, af) :
        type === 'terminus'  ? aDet(af, plural) :
        // Instrumental → "con", which contracts with nothing ("con el cuchillo", "con una palabra").
        // The comitative companion takes the same "con": Spanish does not separate the two either.
        type === 'instrumental' || type === 'comitative' ? prepDet('con', af, plural) :
        // Manner: similative "como" (como el viento — the default), means "con" (con cuidado),
        // measure "a" (a la velocidad de la luz), mode "de" (de manera…). Read off the head noun.
        type === 'manner'    ? (
          mannerRelation(af) === 'means'   ? prepDet('con', af, plural) :
          mannerRelation(af) === 'measure' ? aDet(af, plural) :
          mannerRelation(af) === 'mode'    ? deDet(af, plural) :
          prepDet('como', af, plural)
        ) :
        // A time. "después de" and "antes de" are locutions ending in "de", so the article fuses
        // through it ("después del día", "antes de este día"); "hasta" and "durante" govern the
        // phrase directly and fuse with nothing. The `at` relation takes the word the head noun
        // names and falls back on the generic "en" ("en este día", "en este momento"), and "hace" is
        // no preposition at all — an impersonal verb leading the phrase's own article ("hace un
        // momento").
        type === 'temporal'  ? (() => {
          const relation = temporalRelation(c);
          if (relation === 'at') return prepDet(temporalPreposition(c, 'en'), af, plural);
          const { word, de } = ES_TEMPORAL[relation];
          return de ? `${word} ${deDet(af, plural)}` : prepDet(word, af, plural);
        })() :
        type === 'direction' ? (
          // A direction naming a relation is that relation's goal, spelled as the place is
          // ("salta en el aire"); with none it is the plain goal "a", or "hacia" towards a person.
          dirSpec ? spatialHead(dirSpec, plural, af) :
          af['animate'] === '1' ? prepDet('hacia', af, plural) : aDet(af, plural)
        ) :
        type === 'source'    ? `${sourceAdverb}${deDet(af, plural)}` :
        type === 'cause'     ? (
          causeSent === 'positive' ? `${connectorShared ? '' : 'gracias '}${aDet(af, plural)}` :
          causeSent === 'negative' ? `por culpa ${deDet(af, plural)}` :
          `${connectorShared ? '' : 'a causa '}${deDet(af, plural)}`
        ) :
        spatialHead(pathSpecifier(c), plural, af);
      // The pronoun is the whole phrase after the head: no article, no adjective, no relative. It is
      // the tonic form, unless the head is one of the adpositions that govern the nominative
      // instead ("corre como yo", never "como mí"), which only the 1st and 2nd singular spell apart.
      if (tonic) return `${head} ${NOMINATIVE_PREP.has(headPreposition(head)) ? (np.head.forms['base'] ?? tonic) : tonic}`;
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
      // `between` is said once over the group, not per conjunct: each conjunct is built as above and
      // its "entre" lifted off (P09-E1 D2) — "entre la casa y el árbol".
      const scoped = groupScopedRelation(type, c) ? BETWEEN_PREP : '';
      const group = coordinateElement(c.phrase, (np) => liftPreposition(conjunctText(np), scoped), true);
      return scoped ? `${scoped} ${group}` : group;
    })
    // A cause the plan denies rather than the clause takes its negator here, in front of whatever
    // shape the sentiment gave it (see `withCauseNegator`).
    .map((text, i) => withCauseNegator(text, COMPLEMENT_RENDER_ORDER[i], complements[COMPLEMENT_RENDER_ORDER[i]], CONSTITUENT_NEGATOR))
    .filter(Boolean)
    .join(' ');
}
