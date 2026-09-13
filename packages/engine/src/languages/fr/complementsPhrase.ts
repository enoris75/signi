import { COMPLEMENT_RENDER_ORDER, DEFAULT_LOCATIVE_SPECIFIER, type ComplementType } from '@signi/shared';
import { abstractionLevel, actionInfinitive, causeSentiment, firstConjunct, isRelativeSuperlative, mannerRelation, pathSpecifier, SOURCE_ABLATIVE_ADVERB_VERBS, type ResolvedComplement } from '../../types.js';
import { aDet } from './aDet.js';
import { coordinate } from './coordinate.js';
import { datPrep } from './datPrep.js';
import { deDet } from './deDet.js';
import { defArticle } from './defArticle.js';
import { dePrep } from './dePrep.js';
import { frComparison } from './frComparison.js';
import { joinArt } from './joinArt.js';
import { npText } from './npText.js';
import { prepDet } from './prepDet.js';
import { presentParticiple } from './presentParticiple.js';
import { renderNP } from './renderNP.js';
import { spatialHead } from './spatialHead.js';

export function complementsPhrase(
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
  subjectForms: Record<string, string> = {},
  verbConceptId = '',
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
      // The complement's *kind* (pronoun? adjective? animate goal?) comes off its first conjunct;
      // its surface is rendered from every conjunct, each with its own article and agreement.
      const f = firstConjunct(c.phrase).head.forms;
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
      // A pronoun cause: neutral "à cause de moi / d'eux" takes the disjunctive after "de"
      // (eliding before a vowel); positive "grâce à moi" takes it after "à" (which never
      // elides); negative uses the possessive with "faute" ("par ma faute").
      if (type === 'cause' && f['person']) {
        const disj = f['disjunctive'] ?? f['base'] ?? '';
        const sent = causeSentiment(c);
        if (sent === 'positive') return `grâce à ${disj}`;
        if (sent === 'negative') {
          const plural = f['number'] === 'plural';
          const poss =
            f['person'] === '1' ? (plural ? 'notre' : 'ma') :
            f['person'] === '2' ? (plural ? 'votre' : 'ta') :
            plural ? 'leur' : 'sa';
          return `par ${poss} faute`;
        }
        return `à cause ${/^[aeiouéèêh]/i.test(disj) ? "d'" : 'de '}${disj}`;
      }
      // locative→dans, direction→à (au/aux/à la), source→"loin de" (loin du/des/de la),
      // route→path preposition. A direction toward an *animate* goal takes "vers"
      // (toward) — French doesn't use bare "à" for a person destination ("je cours vers
      // l'enfant", not "*à l'enfant"); "vers" doesn't contract with the article. A self-propelled
      // motion verb prefixes source with the ablative adverb "loin" so it clearly reads as motion
      // away ("je cours loin de l'enfant"); bare "de" reads as a partitive/complement, not
      // departure — which is exactly right for COME/GO and the transitive LOAD/IMPORT.
      // Cause reads "à cause de" + the "de"-contracted article ("à cause du chien"); the
      // sentiment swaps the connector — negative "par la faute du chien", positive "grâce au
      // chien" ("à"-contracted via datPrep).
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
      const headFor = (nf: Record<string, string>) => (plural: boolean, lead: string): string =>
        type === 'locative'  ? (nf['proper'] === '1' && locSpec === 'in' ? 'en' : spatialHead(locSpec, nf, plural, lead)) :
        type === 'terminus'  ? aDet(nf, plural, lead) :
        // Instrumental → "avec", which contracts with nothing ("avec le couteau", "avec un mot").
        type === 'instrumental' ? prepDet('avec', nf, plural, lead) :
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
        type === 'source'    ? `${sourceAdverb}${deDet(nf, plural, lead)}` :
        type === 'cause'     ? (
          causeSent === 'positive' ? `grâce ${datPrep(nf, plural, lead)}` :
          causeSent === 'negative' ? `par la faute ${dePrep(nf, plural, lead)}` :
          `à cause ${dePrep(nf, plural, lead)}`
        ) :
        spatialHead(pathSpecifier(c), nf, plural, lead);
      return coordinate(c.phrase, (np) => renderNP(np, headFor(np.head.forms)));
    })
    .filter(Boolean)
    .join(' ');
}
