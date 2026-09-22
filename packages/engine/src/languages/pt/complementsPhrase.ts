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
import { objectPredication } from '../../functions/objectPredication.js';
import { directionSpecifier } from '../../functions/directionSpecifier.js';
import { pathSpecifier } from '../../functions/pathSpecifier.js';
import { withDefiniteness } from '../../functions/withDefiniteness.js';
import { possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { tonicPronoun } from '../../functions/tonicPronoun.js';
import { tonicHeadForms } from '../../functions/tonicHeadForms.js';
import { headPreposition } from '../../functions/headPreposition.js';
import { tonicPhrase } from './tonicPhrase.js';
import { SOURCE_ABLATIVE_ADVERB_VERBS, TONIC_COMPLEMENTS } from '../../functions/functions.consts.js';
import { KEPT_BESIDE_POSSESSIVE, possessivePt, pronounPossessor } from '../../possessive.js';
import { contractDet } from './contractDet.js';
import { coordinateElement } from './coordinateElement.js';
import { datPrep } from './datPrep.js';
import { defArticle } from './defArticle.js';
import { dePrep } from './dePrep.js';
import { emPrep } from './emPrep.js';
import { isPlural } from './isPlural.js';
import { nounPhrase } from './nounPhrase.js';
import { npText } from './npText.js';
import { predicativeForms } from './predicativeForms.js';
import { prepDet } from './prepDet.js';
import { COMITATIVE_FUSION, CONSTITUENT_NEGATOR, LOCATIVE_IDIOMS, NOMINATIVE_PREP, PT_DE_FUSING_PRONOUN } from './pt.consts.js';
import { ptAdj } from './ptAdj.js';
import { ptComparison } from './ptComparison.js';
import { spatialHead } from './spatialHead.js';
import { withAdj } from './withAdj.js';
import { withRelative } from './withRelative.js';
import { ptPossessiveWord } from './ptPossessiveWord.js';

/** The contraction each preposition a verb may link an object predicative with takes. */
const LINK_CONTRACT: Record<string, (f: Record<string, string>, plural?: boolean) => string> = {
  em: emPrep, a: datPrep, de: dePrep,
};

// `objectForms` are the direct object's, which the object complement predicates of and agrees an
// adjective head with ("pinta a parede vermelha") — the object's counterpart of `subjectForms`.
export function complementsPhrase(
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
  subjectForms: Record<string, string>,
  verbConceptId: string,
  objectForms: Record<string, string> = {},
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
            // A predicate nominal owns things like any other noun phrase ("o cão é o seu
            // possuidor"), so it asks `nounPhrase` for the possessive the subject and the object
            // already get, article and all (A198). Empty for a genitive or absent possessor.
            return withRelative(nounPhrase(predicativeForms(np.head.forms), ptAdj(np), ptPossessiveWord(np)), np);
          }
          const surface = ptComparison(np.head, gender, plural);
          // A predicative superlative has no noun's article to borrow, so it adds its own, agreeing
          // with the subject: "parece O mais feliz" — distinct from the comparative "mais feliz".
          // SAME keeps its article the same way: "é o mesmo" (see `takesPredicateArticle`).
          return isRelativeSuperlative(np.head) || takesPredicateArticle(np.head) ?`${defArticle({ gender }, plural)} ${surface}` : surface;
        });
      }
      // Object complement: what the object is *made into* ("transformar o período em um comando")
      // or *taken as* ("usar o período como condição"). It predicates of the direct object, so an
      // adjective head agrees with that and not with the subject. The factitive link contracts
      // with the article as any preposition does ("em" + "o" → "no"); the essive "como" contracts
      // with none and drops the article, naming a role rather than picking a referent out.
      if (type === 'objectPredicative') {
        const essive = objectPredication(c) === 'essive';
        const link = c.link ?? '';
        const gender = objectForms['gender'] ?? 'masc';
        const plural = objectForms['number'] === 'plural';
        return coordinateElement(c.phrase, (conjunct) => {
          const np = essive ? withDefiniteness(conjunct, 'bare') : conjunct;
          if (np.head.forms['role'] === 'adjective') {
            return [essive ? 'como' : '', ptComparison(np.head, gender, plural)].filter(Boolean).join(' ');
          }
          // The object predicative owns things too (A198). A Portuguese possessive rides on the
          // definite article, and the factitive link contracts with that article as it does with
          // any other ("em" + "a" → "na sua prisão"), so a possessed head takes the definite
          // determiner for the marker and hands the possessive over without its own article. The
          // essive "como" contracts with nothing and drops the article from both ("como sua prisão").
          const possessive = ptPossessiveWord(np, false);
          const f0 = predicativeForms(np.head.forms);
          const f = possessive && !essive ? { ...f0, definiteness: 'definite' } : f0;
          const pl = isPlural(f);
          const marker = essive ? prepDet('como', f, pl)
            : !link ? ''
            : LINK_CONTRACT[link] ? contractDet(LINK_CONTRACT[link], link, f, pl)
            : prepDet(link, f, pl);
          // The marker carries the determiner when there is one, so the phrase itself goes bare.
          const bare = marker ? { ...f, definiteness: 'bare' } : f;
          return [marker, withRelative(nounPhrase(bare, ptAdj(np), possessive), np)].filter(Boolean).join(' ');
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
      // A pronoun behind an adposition is the bare preposition + the tonic form, with no article
      // ("em ele" → "nele", never "no ele" — A197 for the comitative and the instrumental, A203 for
      // the other five), as the cause below already spells it after "de"/"a". "com" does not
      // contract with an article, but it does fuse with three of the pronouns — comigo, contigo,
      // conosco — which is what COMITATIVE_FUSION holds; "em" and "de" fuse with the 3rd-person
      // forms, which `tonicPhrase` writes. Which preposition each slot takes is not decided here:
      // the head below is built as it always is, from a forms bag that carries no determiner for it
      // to contract with (`tonicHeadForms`), and the tonic form follows it in place of the noun.
      const tonic = TONIC_COMPLEMENTS.has(type) ? tonicPronoun(np) : undefined;
      if (tonic && (type === 'instrumental' || type === 'comitative')) return COMITATIVE_FUSION[tonic] ?? `com ${tonic}`;
      // A possessive rides on the definite article, which the preposition fuses with ("na minha casa").
      // Unless the head carries a determiner of its own: that keeps its slot and takes the fusion
      // ("nesta casa", "em nenhuma casa"), and the possessive follows the noun, article and all left
      // to the determiner — "nesta casa minha", "em nenhuma casa minha" (A187 in the noun phrase,
      // A202 here).
      // "todas" is the other determiner that survives a possessive, and it does not detach: it stands
      // in front of it, with the article between the two ("em todas as minhas casas"), so the head
      // keeps its own determiner there too — `artFor` spells "todas as" — while the possessive stays
      // prenominal without an article of its own.
      const possessive = ptPossessiveWord(np, false);
      const ownDeterminer = np.head.forms['definiteness'] ?? 'definite';
      const detached = !!possessive && KEPT_BESIDE_POSSESSIVE.has(ownDeterminer);
      const f = !!possessive && (detached || ownDeterminer === 'all')
        ? { ...possessedHeadForms(np, 'definite'), definiteness: ownDeterminer }
        : possessedHeadForms(np, 'definite');
      const plural = isPlural(f);
      const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
      const noun = detached
        ? [withAdj(word, ptAdj(np)), possessive].filter(Boolean).join(' ')
        : [possessive, withAdj(word, ptAdj(np))].filter(Boolean).join(' ');
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
      const dirSpec = type === 'direction' ? directionSpecifier(c) : undefined;
      const hf = tonic ? tonicHeadForms(np) : f;
      const head =
        type === 'locative'  ? spatialHead(pathSpecifier(c, DEFAULT_LOCATIVE_SPECIFIER), hf, plural) :
        type === 'terminus'  ? contractDet(datPrep, 'a', hf, plural) :
        // Instrumental → "com". It contracts only with the pronouns (comigo…), never with an
        // article, so the plain preposition leads the determiner: "com a faca", "com uma palavra".
        // The comitative companion takes the same "com": Portuguese does not separate the two either.
        type === 'instrumental' || type === 'comitative' ? prepDet('com', hf, plural) :
        // Manner: similative "como" (como o vento — the default), means "com" (com cuidado),
        // measure "a" (à velocidade da luz), mode "de" (de maneira…). Read off the head noun.
        type === 'manner'    ? (
          mannerRelation(hf) === 'means'   ? prepDet('com', hf, plural) :
          mannerRelation(hf) === 'measure' ? contractDet(datPrep, 'a', hf, plural) :
          mannerRelation(hf) === 'mode'    ? contractDet(dePrep, 'de', hf, plural) :
          prepDet('como', hf, plural)
        ) :
        type === 'direction' ? (
          // A direction naming a relation is that relation's goal, spelled as the place is ("salta
          // no ar"); with none it is the plain goal "a", or "para" towards a person.
          dirSpec ? spatialHead(dirSpec, hf, plural) :
          hf['animate'] === '1' ? prepDet('para', hf, plural) : contractDet(datPrep, 'a', hf, plural)
        ) :
        type === 'source'    ? `${sourceAdverb}${contractDet(dePrep, 'de', hf, plural)}` :
        type === 'cause'     ? (
          causeSent === 'positive' ? `${connectorShared ? '' : 'graças '}${contractDet(datPrep, 'a', hf, plural)}` :
          causeSent === 'negative' ? `por culpa ${contractDet(dePrep, 'de', hf, plural)}` :
          `${connectorShared ? '' : 'por causa '}${contractDet(dePrep, 'de', hf, plural)}`
        ) :
        spatialHead(pathSpecifier(c), hf, plural);
      // The pronoun is the whole phrase after the head: no article, no adjective, no relative. It is
      // the tonic form, unless the head is one of the adpositions that govern the nominative
      // instead ("corre como eu", never "como mim"), which only the 1st and 2nd singular spell apart.
      if (tonic) return tonicPhrase(head, NOMINATIVE_PREP.has(headPreposition(head)) ? (np.head.forms['base'] ?? tonic) : tonic);
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
            // The possessive agrees with the feminine "culpa"; você / vocês take "sua" (see `possessivePt`).
            return `por ${possessivePt(pronounPossessor(pf), { gender: 'fem', number: 'singular' })} culpa`;
          }
          return PT_DE_FUSING_PRONOUN.test(disj) ? `d${disj}` : `de ${disj}`;
        };
        const shared = sent !== 'negative';
        const conjuncts = coordinateElement(c.phrase, (np) =>
          np.head.forms['person'] ? pronoun(np.head.forms) : conjunctText(np, shared));
        return shared ? `${sent === 'positive' ? 'graças' : 'por causa'} ${conjuncts}` : conjuncts;
      }
      return coordinateElement(c.phrase, (np) => conjunctText(np));
    })
    // A cause the plan denies rather than the clause takes its negator here, in front of whatever
    // shape the sentiment gave it (see `withCauseNegator`).
    .map((text, i) => withCauseNegator(text, COMPLEMENT_RENDER_ORDER[i], complements[COMPLEMENT_RENDER_ORDER[i]], CONSTITUENT_NEGATOR))
    .filter(Boolean)
    .join(' ');
}
