import { COMPLEMENT_RENDER_ORDER, DEFAULT_LOCATIVE_SPECIFIER, isPronominalPossessor, type ComplementType } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounPhrase } from '../../types.js';
import { abstractionLevel } from '../../functions/abstractionLevel.js';
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
import { isNamedLand } from '../../functions/isNamedLand.js';
import { pathSpecifier } from '../../functions/pathSpecifier.js';
import { groupScopedRelation } from '../../functions/groupScopedRelation.js';
import { liftPreposition } from '../../functions/liftPreposition.js';
import { BETWEEN_PREP } from './fr.consts.js';
import { temporalRelation } from '../../functions/temporalRelation.js';
import { temporalPreposition } from '../../functions/temporalPreposition.js';
import { withDefiniteness } from '../../functions/withDefiniteness.js';
import { possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { tonicPronoun } from '../../functions/tonicPronoun.js';
import { tonicHeadForms } from '../../functions/tonicHeadForms.js';
import { SOURCE_ABLATIVE_ADVERB_VERBS, TONIC_COMPLEMENTS } from '../../functions/functions.consts.js';
import { tonicPhrase } from './tonicPhrase.js';
import { possessiveFr, pronounPossessor } from '../../possessive.js';
import { aDet } from './aDet.js';
import { coordinate } from './coordinate.js';
import { datPrep } from './datPrep.js';
import { deDet } from './deDet.js';
import { defArticle } from './defArticle.js';
import { elidesBefore } from './elidesBefore.js';
import { CONSTITUENT_NEGATOR, FR_TEMPORAL, LOCATIVE_IDIOMS } from './fr.consts.js';
import { frComparison } from './frComparison.js';
import { frStandard } from './frStandard.js';
import { joinArt } from './joinArt.js';
import { npText } from './npText.js';
import { partitiveArtFor } from './partitiveArtFor.js';
import { prepDet } from './prepDet.js';
import { presentParticiple } from './presentParticiple.js';
import { renderNP } from './renderNP.js';
import { spatialHead } from './spatialHead.js';

// `objectForms` are the direct object's, which the object complement predicates of and agrees an
// adjective head with ("peint le mur rouge") — the object's counterpart of `subjectForms`. `verbForms`
// are the governing verb's lexical forms, for a preposition the verb itself fixes (`direction_prep`).
export function complementsPhrase(
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
  subjectForms: Record<string, string> = {},
  verbConceptId = '',
  objectForms: Record<string, string> = {},
  verbForms: Record<string, string> = {},
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
          const surface = [frComparison(np.head, gender, plural), frStandard(np)].filter(Boolean).join(' ');
          // A predicative superlative has no noun's article to borrow, so it adds its own, agreeing
          // with the subject: "semble LE plus heureux" — distinct from the comparative "plus heureux".
          // SAME keeps its article the same way: "est le même" (see `takesPredicateArticle`).
          return isRelativeSuperlative(np.head) || takesPredicateArticle(np.head)
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
      // the article-bearing "dans l'Europe". A masculine country opening on a consonant takes "au"
      // instead ("au Japon", see `landIn`); a city would take "à", but none is seeded.
      // That bare form belongs to plain containment only — a relational locative keeps its adverb
      // and article ("sous l'Europe"), so it goes through `spatialHead` like any other relation.
      const causeSent = type === 'cause' ? causeSentiment(c) : 'neutral';
      const locSpec = pathSpecifier(c, DEFAULT_LOCATIVE_SPECIFIER);
      const dirSpec = type === 'direction' ? directionSpecifier(c) : undefined;
      // `possessive`: a pronominal possessor stands in for the article, which leaves the head's forms
      // bare (see possessedHeadForms), not a zero article to fill.
      // The bare continent prepositions ("en Asie", "d'Europe") fit the bare name alone: one still
      // `proper`, which a possessive takes away (A165), and leading its phrase, which a prenominal
      // adjective does not let it do (A169). Otherwise the name has its article back: "dans ton Asie",
      // "dans la grande Asie", "de la grande Asie".
      // A *superlative* takes it back too (A188). French puts the degree after the noun and repeats
      // the article in front of it ("l'Europe la plus grande"), and that second article is only
      // possible after a first one: "en Europe la plus grande" is not French. So the name is articled
      // and the preposition goes to "dans" / "de" + article ("dans l'Europe la plus grande", "de
      // l'Europe la plus grande"). `headForms` marks the phrase for `bareName`, because `headFor` sees
      // the forms and not the phrase. A169's positive and comparative stay bare.
      const bareName = (nf: Record<string, string>, lead: string): boolean =>
        nf['proper'] === '1' && lead === nf['base'] && nf['relativeSuperlative'] !== '1';
      const headForms = (np: ResolvedNounPhrase): Record<string, string> => {
        const nf = possessedHeadForms(np, 'bare');
        return np.adjectives.some(isRelativeSuperlative) ? { ...nf, relativeSuperlative: '1' } : nf;
      };
      // A bare land name is "in" and goes "to" with "en" when it is feminine or opens on a vowel ("en
      // Italie", "en Antarctique"), and with "au" when it is a masculine opening on a consonant ("au
      // Japon", "au Portugal"). All the continents take "en"; the countries split (localization B36).
      const landIn = (nf: Record<string, string>, plural: boolean, lead: string): string =>
        nf['gender'] === 'fem' || elidesBefore(nf, lead) ? 'en' : aDet(nf, plural, lead);
      // A196. French has no zero article on a plural noun phrase: where English writes a bare plural
      // after a preposition ("in brackets"), French writes "des" ("dans des parenthèses"). A149 said
      // the same of the object and the instrument; the other adposition-bearing complements were left
      // behind. One rewrite of the head's determiner covers every branch below, and the relations that
      // govern "de" need no case of their own — `deDet` drops an indefinite plural's article, so "de"
      // + "des" stays "de". A prenominal adjective turns it into "de" ("dans de grands mots"), which
      // `artFor` already does for the indefinite.
      // Not the possessor: `possessedHeadForms` sets a possessed head to `bare` so the possessive can
      // take the article's place, and that bare is no zero article ("dans nos maisons"). Not a proper
      // name either, whose bare is the continent preposition's ("en Europe"). Not a pronoun, whose
      // bare is the absence of an article altogether — "sous elles", never "sous des elles" (A203).
      // The bare *singular* is not rewritten here: the partitive would reach the manner of means,
      // whose bare singular is an idiom French wants ("avec soin", never "avec du soin"). The plain
      // locative gives it "en" instead, in its own branch below (A219).
      const headFor = (nf0: Record<string, string>, possessive = false) => (plural: boolean, lead: string): string => {
        const nf = !possessive && plural && (nf0['definiteness'] ?? 'definite') === 'bare'
          && nf0['uncountable'] !== '1' && nf0['proper'] !== '1' && !nf0['person']
          ? { ...nf0, definiteness: 'indefinite' } : nf0;
        return (
          // A pronoun's plain containment is "en", not the "dans" a noun takes: French does not say
          // "dans lui" of a person, and "en lui" is the form it has — the same bare "en" the bare
          // continent takes on the line below, and for the same reason, that neither wants an
          // article between the preposition and the word (A203). Every other relation keeps its own
          // adposition, which is idiomatic before a pronoun as it stands: "sous lui", "derrière
          // elle", "au-dessus d'eux".
          type === 'locative'  ? (
            nf['person'] && locSpec === 'in' ? 'en' :
            bareName(nf, lead) && locSpec === 'in' ? (isNamedLand(nf) ? landIn(nf, plural, lead) : 'en') :
            // A219. "Dans" needs a determiner after it, never "dans groupe": the preposition French
            // puts before a bare singular is "en" ("en groupe", "en prison", "en parenthèse"). A mass
            // noun has no such "en" ("en eau" is not "in water") and takes its partitive after "dans"
            // instead, as a bare mass object does (A149): "dans de l'eau". A196's guards: the
            // possessor's bare is no zero article, and a bare name keeps its continent preposition.
            !possessive && !plural && locSpec === 'in' && (nf['definiteness'] ?? 'definite') === 'bare' && nf['proper'] !== '1'
              ? (nf['uncountable'] === '1' ? `dans ${partitiveArtFor(nf, plural, lead)}` : 'en') :
            spatialHead(locSpec, nf, plural, lead, 'locative')
          ) :
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
          // A time. "jusqu'à" fuses through its "à" ("jusqu'au jour", "jusqu'à ce jour"); "après",
          // "avant" and "pendant" govern the phrase directly and fuse with nothing. The `at`
          // relation takes the word the head noun names — "en ce jour" against the generic "à ce
          // temps" — and "il y a" is no adposition at all: it is an impersonal verb, emitted whole
          // in front of the phrase's own article ("il y a un instant").
          type === 'temporal'  ? (() => {
            const relation = temporalRelation(c);
            if (relation === 'at') {
              const prep = temporalPreposition(c, '');
              return prep ? prepDet(prep, nf, plural, lead) : aDet(nf, plural, lead);
            }
            if (relation === 'until') return `jusqu'${aDet(nf, plural, lead)}`;
            return prepDet(FR_TEMPORAL[relation], nf, plural, lead);
          })() :
          type === 'direction' ? (
            // A direction naming a relation is that relation's goal, which French spells as it spells
            // the place ("saute dans l'air"). `over` takes its locative reading, "au-dessus de": a
            // goal above something is where the motion ends, not a crossing.
            dirSpec ? spatialHead(dirSpec, nf, plural, lead, 'locative') :
            // A verb can fix its goal's preposition in its lexeme. "Se déplacer" takes "vers" for every
            // goal: after it, "au sol" and "en Europe" say where the moving happens ("les oiseaux se
            // déplacent au sol"), not where it ends ("se déplace vers le sol"). Localization B34.
            verbForms['direction_prep'] ? prepDet(verbForms['direction_prep'], nf, plural, lead) :
            // A land goal, a continent or a country, takes bare "en" ("va en Antarctique", "va en
            // Italie") or "au" ("va au Japon", see `landIn`), not the default place "à" with the proper
            // noun's article ("à l'Antarctique"); an animate goal takes "vers", a place "à". A land that
            // is no longer a bare name goes "dans" like the locative: "va dans ton Asie", "va dans la
            // grande Asie".
            isNamedLand(nf) ? (bareName(nf, lead) ? landIn(nf, plural, lead) : spatialHead('in', nf, plural, lead, 'locative')) :
            nf['animate'] === '1' ? prepDet('vers', nf, plural, lead) : aDet(nf, plural, lead)
          ) :
          type === 'source'    ? (
            // A land of origin takes a bare "de" when feminine ("vient d'Europe", "d'Amérique du Nord",
            // "de France"), the counterpart of the goal's "en". A masculine one keeps its article, as
            // usage has it ("de l'Antarctique", "du Japon"), and so does the "loin de" of a
            // self-propelled verb. A land that is no longer a bare name takes "de" + its determiner
            // ("de ton Asie", "de la grande Asie").
            isNamedLand(nf) && bareName(nf, lead) && nf['gender'] === 'fem' && !sourceAdverb ? (elidesBefore(nf, lead) ? "d'" : 'de') :
            `${sourceAdverb}${deDet(nf, plural, lead)}`
          ) :
          type === 'cause'     ? (
            causeSent === 'positive' ? `grâce ${aDet(nf, plural, lead)}` :
            causeSent === 'negative' ? `par la faute ${deDet(nf, plural, lead)}` :
            `à cause ${deDet(nf, plural, lead)}`
          ) :
          spatialHead(pathSpecifier(c), nf, plural, lead, 'route')
        );
      };
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
          return coordinate(c.phrase, (np) => np.head.forms['person'] ? pronoun(np.head.forms) : renderNP(np, headFor(headForms(np))));
        }
        const tail = (nf: Record<string, string>) => (plural: boolean, lead: string): string =>
          causeSent === 'positive' ? aDet(nf, plural, lead) : deDet(nf, plural, lead);
        const conjuncts = coordinate(c.phrase, (np) => np.head.forms['person'] ? pronoun(np.head.forms) : renderNP(np, tail(headForms(np))));
        return `${causeSent === 'positive' ? 'grâce' : 'à cause'} ${conjuncts}`;
      }
      // A pronoun behind an adposition is the bare preposition + the tonic form, with no article
      // ("avec lui", "vers elle", never "avec l'il" — A197 for the comitative and the instrumental,
      // A203 for the other five), as the neutral cause above already spells it after "de". Per
      // conjunct, and each conjunct repeats the preposition as a noun's contracted head does: "avec
      // le chien et avec lui". Which preposition each slot takes is not decided here: `headFor`
      // chooses it as it always does, from a forms bag that carries no determiner for it to
      // contract with (`tonicHeadForms`), and the tonic form follows it in place of the noun — as
      // its own `lead`, so the elision is judged on the word that actually follows ("d'eux").
      const tonicText = (np: ResolvedNounPhrase): string => {
        const tonic = TONIC_COMPLEMENTS.has(type) ? tonicPronoun(np) : undefined;
        if (!tonic) return '';
        // The instrument's "avec" carries a partitive for a noun ("avec de l'argent", A149), and a
        // pronoun is no quantity: it takes the plain preposition, which is the comitative's too.
        if (type === 'instrumental' || type === 'comitative') return `avec ${tonic}`;
        const nf = tonicHeadForms(np);
        return tonicPhrase(headFor(nf)((nf['number'] ?? nf['count']) === 'plural', tonic), tonic);
      };
      // `between` is said once over the group, not per conjunct: each conjunct is built as above and
      // its "entre" lifted off (P09-E1 D2) — "entre la maison et l'arbre".
      const scoped = groupScopedRelation(type, c) ? BETWEEN_PREP : '';
      const group = coordinate(c.phrase, (np) => liftPreposition(
        tonicText(np)
        || (type === 'locative' && locativeIdiom(c, np, LOCATIVE_IDIOMS))
        || renderNP(np, headFor(headForms(np), isPronominalPossessor(np.possessor))), scoped));
      return scoped ? `${scoped} ${group}` : group;
    })
    // A cause the plan denies rather than the clause takes its negator here, in front of whatever
    // shape the sentiment gave it (see `withCauseNegator`).
    .map((text, i) => withCauseNegator(text, COMPLEMENT_RENDER_ORDER[i], complements[COMPLEMENT_RENDER_ORDER[i]], CONSTITUENT_NEGATOR))
    .filter(Boolean)
    .join(' ');
}
