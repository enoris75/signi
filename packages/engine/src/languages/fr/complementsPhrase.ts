import { COMPLEMENT_RENDER_ORDER, DEFAULT_LOCATIVE_SPECIFIER, isPronominalPossessor, type ComplementType } from '@signi/shared';
import type { ResolvedComplement } from '../../types.js';
import { abstractionLevel } from '../../functions/abstractionLevel.js';
import { actionInfinitive } from '../../functions/actionInfinitive.js';
import { causeSentiment } from '../../functions/causeSentiment.js';
import { isRelativeSuperlative } from '../../functions/isRelativeSuperlative.js';
import { locativeIdiom } from '../../functions/locativeIdiom.js';
import { mannerRelation } from '../../functions/mannerRelation.js';
import { isAdjectivePredicate } from '../../functions/isAdjectivePredicate.js';
import { objectPredication } from '../../functions/objectPredication.js';
import { pathSpecifier } from '../../functions/pathSpecifier.js';
import { withDefiniteness } from '../../functions/withDefiniteness.js';
import { possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { SOURCE_ABLATIVE_ADVERB_VERBS } from '../../functions/functions.consts.js';
import { possessiveFr, pronounPossessor } from '../../possessive.js';
import { aDet } from './aDet.js';
import { coordinate } from './coordinate.js';
import { datPrep } from './datPrep.js';
import { deDet } from './deDet.js';
import { defArticle } from './defArticle.js';
import { elidesBefore } from './elidesBefore.js';
import { LOCATIVE_IDIOMS } from './fr.consts.js';
import { frComparison } from './frComparison.js';
import { joinArt } from './joinArt.js';
import { npText } from './npText.js';
import { partitiveArtFor } from './partitiveArtFor.js';
import { prepDet } from './prepDet.js';
import { presentParticiple } from './presentParticiple.js';
import { renderNP } from './renderNP.js';
import { spatialHead } from './spatialHead.js';

// `objectForms` are the direct object's, which the object complement predicates of and agrees an
// adjective head with ("peint le mur rouge") — the object's counterpart of `subjectForms`.
export function complementsPhrase(
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
  subjectForms: Record<string, string> = {},
  verbConceptId = '',
  objectForms: Record<string, string> = {},
): string {
  if (!complements) return '';
  // "loin" disambiguates source from direction, but only self-propelled motion verbs (RUN/JUMP)
  // need it — see SOURCE_ABLATIVE_ADVERB_VERBS. COME/GO and the transitive LOAD/IMPORT keep bare
  // "de" ("le chat vient de la maison", "charge le livre du récipient").
  const sourceAdverb = SOURCE_ABLATIVE_ADVERB_VERBS.has(verbConceptId) ? 'loin ' : '';
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      // Subject complement: a predicate adjective agrees with the subject ("la chatte est
      // belle", "elles semblent heureuses") and carries its own degree ("semblent plus
      // heureuses"); a predicate noun keeps its own article, no preposition ("devient une
      // légende"). Coordinated conjuncts each agree with the subject: "semblent heureuses et
      // fatiguées".
      if (type === 'predicative') {
        const gender = subjectForms['gender'] ?? 'masc';
        const plural = subjectForms['number'] === 'plural';
        return coordinate(c.phrase, (np) => {
          if (np.head.forms['role'] !== 'adjective') return npText(np);
          const surface = frComparison(np.head, gender, plural);
          // A predicative superlative has no noun's article to borrow, so it adds its own, agreeing
          // with the subject: "semble LE plus heureux" — distinct from the comparative "plus heureux".
          return isRelativeSuperlative(np.head)
            ? joinArt(defArticle({ gender }, plural, surface), surface)
            : surface;
        });
      }
      // Object complement: what the object is *made into* ("transformer la période en une
      // commande") or *taken as* ("utiliser la période comme condition"). It predicates of the
      // direct object, so an adjective head agrees with that and not with the subject. Neither
      // marker contracts with the article — French fuses only "à" and "de", and a verb links its
      // object predicative with neither — so the marker leads the phrase. The essive drops the
      // article: it names a role rather than picking a referent out ("comme condition").
      if (type === 'objectPredicative') {
        const essive = objectPredication(c) === 'essive';
        // The factitive link introduces a noun ("en une prison"); an adjective predicate takes
        // none — "rend la maison belle", never "*en belle".
        const marker = essive ? 'comme' : isAdjectivePredicate(c) ? '' : (c.link ?? '');
        const gender = objectForms['gender'] ?? 'masc';
        const plural = objectForms['number'] === 'plural';
        return coordinate(c.phrase, (conjunct) => {
          const np = essive ? withDefiniteness(conjunct, 'bare') : conjunct;
          const word = np.head.forms['role'] === 'adjective'
            ? frComparison(np.head, gender, plural)
            : npText(np);
          return [marker, word].filter(Boolean).join(' ');
        });
      }
      // An instrument presented as an action: the gérondif for the process level ("en
      // choisissant un mot"), and for the concept level the periphrasis "avec le fait de choisir
      // un mot". French is the one language here that stays periphrastic, and not by choice: its
      // substantivized infinitive is fossilised (le boire, le manger) rather than productive, so
      // it has no counterpart of "lo scegliere" / "el elegir" / "the choosing" to reify the act
      // with. The noun phrase is the action's direct object.
      if (type === 'instrumental' && c.action) {
        const level = abstractionLevel(c);
        if (level !== 'object') {
          const object = coordinate(c.phrase, npText);
          const verb =
            level === 'process'
              ? `en ${presentParticiple(c.action.verb)}`
              : `avec le fait de ${actionInfinitive(c.action)}`;
          const adverb = c.action.modifier?.forms['base'] ?? '';
          return [verb, object, adverb].filter(Boolean).join(' ');
        }
      }
      // locative→dans, direction→à (au/aux/à la), source→"loin de" (loin du/des/de la),
      // route→path preposition. A direction toward an *animate* goal takes "vers"
      // (toward) — French doesn't use bare "à" for a person destination ("je cours vers
      // l'enfant", not "*à l'enfant"); "vers" doesn't contract with the article. A self-propelled
      // motion verb prefixes source with the ablative adverb "loin" so it clearly reads as motion
      // away ("je cours loin de l'enfant"); bare "de" reads as a partitive/complement, not
      // departure — which is exactly right for COME/GO and the transitive LOAD/IMPORT.
      // Cause reads "à cause de" + the cause's own determiner, contracted only when definite ("à
      // cause du chien", "à cause d'un chien"); the sentiment swaps the connector — negative "par la
      // faute du chien", positive "grâce au chien".
      // The preposition contracts with the article ("à"+"le" → "au"), so it cannot be factored
      // out in front of a coordinated complement — each conjunct carries its own contracted head
      // ("au chat et au chien"). Repeating it also lets each conjunct pick its own preposition,
      // which `direction` needs: an animate goal takes "vers", a place "à".
      // A locative proper noun (a continent — "Europe", "Afrique") drops the definite article it
      // carries as a subject ("l'Europe mange"): the "in place" locative is a bare "en Europe", not
      // the article-bearing "dans l'Europe". (All seeded continents are feminine/vowel-initial, which
      // "en" fits; a masculine country would take "au" and a city "à", but none is seeded.)
      // That bare form belongs to plain containment only — a relational locative keeps its adverb
      // and article ("sous l'Europe"), so it goes through `spatialHead` like any other relation.
      const causeSent = type === 'cause' ? causeSentiment(c) : 'neutral';
      const locSpec = pathSpecifier(c, DEFAULT_LOCATIVE_SPECIFIER);
      // `possessive`: a pronominal possessor stands in for the article, which leaves the head's forms
      // bare (see possessedHeadForms), not a zero article to fill.
      const headFor = (nf: Record<string, string>, possessive = false) => (plural: boolean, lead: string): string =>
        type === 'locative'  ? (nf['proper'] === '1' && locSpec === 'in' ? 'en' : spatialHead(locSpec, nf, plural, lead, 'locative')) :
        type === 'terminus'  ? aDet(nf, plural, lead) :
        // Instrumental → "avec", which contracts with nothing ("avec le couteau", "avec un mot"). An
        // instrument is never bare: "avec de l'argent", "avec des mots" (A149). The bare "avec soin" is
        // the manner below.
        type === 'instrumental' ? (possessive ? prepDet('avec', nf, plural, lead) : `avec ${partitiveArtFor(nf, plural, lead)}`) :
        // The comitative companion takes the same "avec", with its ordinary article rather than the
        // instrument's partitive: a companion is a definite party, not a quantity ("avec le chien").
        type === 'comitative' ? prepDet('avec', nf, plural, lead) :
        // Manner: similative "comme" (comme le vent — the default), means "avec" (avec soin),
        // measure "à" (à la vitesse de la lumière), mode "de" (de la manière…). Read off the noun.
        type === 'manner'    ? (
          mannerRelation(nf) === 'means'   ? prepDet('avec', nf, plural, lead) :
          mannerRelation(nf) === 'measure' ? aDet(nf, plural, lead) :
          mannerRelation(nf) === 'mode'    ? deDet(nf, plural, lead) :
          prepDet('comme', nf, plural, lead)
        ) :
        type === 'direction' ? (
          // A continent goal takes bare "en" ("va en Antarctique"), not the default place "à" with
          // the proper noun's article ("à l'Antarctique"); an animate goal takes "vers", a place "à".
          nf['isA'] === 'CONTINENT' ? 'en' :
          nf['animate'] === '1' ? prepDet('vers', nf, plural, lead) : aDet(nf, plural, lead)
        ) :
        type === 'source'    ? (
          // A continent of origin takes a bare "de" ("vient d'Europe", "d'Amérique du Nord"), the
          // counterpart of the goal's "en". The masculine Antarctique keeps its article, as usage has
          // it ("de l'Antarctique"), and so does the "loin de" of a self-propelled verb.
          nf['isA'] === 'CONTINENT' && nf['gender'] === 'fem' && !sourceAdverb ? (elidesBefore(nf, lead) ? "d'" : 'de') :
          `${sourceAdverb}${deDet(nf, plural, lead)}`
        ) :
        type === 'cause'     ? (
          causeSent === 'positive' ? `grâce ${aDet(nf, plural, lead)}` :
          causeSent === 'negative' ? `par la faute ${deDet(nf, plural, lead)}` :
          `à cause ${deDet(nf, plural, lead)}`
        ) :
        spatialHead(pathSpecifier(c), nf, plural, lead, 'route');
      // A hearth noun takes its fixed locative idiom in place of the whole noun phrase — "à la maison",
      // not "dans le foyer" — so it bypasses the article and contraction machinery entirely.
      // A pronoun cause: neutral "à cause de moi / d'eux" takes the disjunctive after "de"
      // (eliding before a vowel); positive "grâce à moi" takes it after "à" (which never
      // elides); negative uses the possessive with "faute" ("par ma faute").
      // Each conjunct of a group takes its own form, never the first one's. The neutral and positive
      // connector is said once, each conjunct bringing its own "de"/"à" ("à cause du chien et de
      // toi"); the negative one holds a possessive, so every conjunct repeats it ("par ma faute et
      // par la faute du chien").
      if (type === 'cause' && c.phrase.conjuncts.some((np) => np.head.forms['person'])) {
        const pronoun = (pf: Record<string, string>): string => {
          const disj = pf['disjunctive'] ?? pf['base'] ?? '';
          if (causeSent === 'positive') return `à ${disj}`;
          // The possessive agrees with feminine "faute", which opens on a consonant: "ma", never "mon".
          if (causeSent === 'negative') {
            return `par ${possessiveFr(pronounPossessor(pf), { gender: 'fem', number: 'singular' }, false)} faute`;
          }
          return `${/^[aeiouéèêh]/i.test(disj) ? "d'" : 'de '}${disj}`;
        };
        if (causeSent === 'negative') {
          return coordinate(c.phrase, (np) => np.head.forms['person'] ? pronoun(np.head.forms) : renderNP(np, headFor(possessedHeadForms(np, 'bare'))));
        }
        const tail = (nf: Record<string, string>) => (plural: boolean, lead: string): string =>
          causeSent === 'positive' ? aDet(nf, plural, lead) : deDet(nf, plural, lead);
        const conjuncts = coordinate(c.phrase, (np) => np.head.forms['person'] ? pronoun(np.head.forms) : renderNP(np, tail(possessedHeadForms(np, 'bare'))));
        return `${causeSent === 'positive' ? 'grâce' : 'à cause'} ${conjuncts}`;
      }
      return coordinate(c.phrase, (np) =>
        (type === 'locative' && locativeIdiom(c, np, LOCATIVE_IDIOMS))
        || renderNP(np, headFor(possessedHeadForms(np, 'bare'), isPronominalPossessor(np.possessor))));
    })
    .filter(Boolean)
    .join(' ');
}
