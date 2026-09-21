import { COMPLEMENT_RENDER_ORDER, DEFAULT_LOCATIVE_SPECIFIER, type ComplementType } from '@signi/shared';
import type { ResolvedComplement } from '../../types.js';
import { abstractionLevel } from '../../functions/abstractionLevel.js';
import { actionGerund } from '../../functions/actionGerund.js';
import { actionInfinitive } from '../../functions/actionInfinitive.js';
import { causeSentiment } from '../../functions/causeSentiment.js';
import { isRelativeSuperlative } from '../../functions/isRelativeSuperlative.js';
import { locativeIdiom } from '../../functions/locativeIdiom.js';
import { mannerRelation } from '../../functions/mannerRelation.js';
import { objectPredication } from '../../functions/objectPredication.js';
import { directionSpecifier } from '../../functions/directionSpecifier.js';
import { isNamedLand } from '../../functions/isNamedLand.js';
import { pathSpecifier } from '../../functions/pathSpecifier.js';
import { withDefiniteness } from '../../functions/withDefiniteness.js';
import { SOURCE_ABLATIVE_ADVERB_VERBS } from '../../functions/functions.consts.js';
import { possessiveIt, pronounPossessor } from '../../possessive.js';
import { IT_MANNER_PREP, LOCATIVE_IDIOMS } from './it.consts.js';
import { agreeAdj } from './agreeAdj.js';
import { agreementForms } from './agreementForms.js';
import { artFor } from './artFor.js';
import { coordinate } from './coordinate.js';
import { defArticle } from './defArticle.js';
import { itDeg } from './itDeg.js';
import { itPossessedHeadForms } from './itPossessedHeadForms.js';
import { joinArt } from './joinArt.js';
import { joinWords } from './joinWords.js';
import { npText } from './npText.js';
import { prepDet, type ItPreposition } from './prepDet.js';
import { renderNP } from './renderNP.js';
import { spatialHead } from './spatialHead.js';

// `objectForms` are the direct object's, which the object complement predicates of and agrees an
// adjective head with ("dipinge la parete rossa") — the object's counterpart of `subjectForms`.
// `verbForms` are the governing verb's lexical forms, for a preposition the verb itself fixes
// (`direction_prep`).
export function complementsPhrase(
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
  subjectForms: Record<string, string>,
  verbConceptId: string,
  objectForms: Record<string, string> = {},
  verbForms: Record<string, string> = {},
): string {
  if (!complements) return '';
  // The ablative adverb "via" disambiguates source from direction, but only self-propelled
  // motion verbs (RUN/JUMP) need it for every source — see SOURCE_ABLATIVE_ADVERB_VERBS. COME/GO and
  // the transitive LOAD/IMPORT keep bare "da" for a PLACE ("viene dalla casa", "carica il libro dal
  // contenitore"); an animate source takes the adverb on any verb, because the animate *goal* takes
  // "da" as well (the andare-da construction), so bare "va dal bambino" reads as "goes TO the boy"
  // (A153). That part is decided per conjunct, in `headFor` below.
  const sourceAdverb = SOURCE_ABLATIVE_ADVERB_VERBS.has(verbConceptId) ? 'via ' : '';
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      // Subject complement: a predicate adjective agrees with the *subject* ("sembra
      // stanca") and carries its own degree ("sembra più stanca"); a predicate noun keeps
      // its own article, no preposition ("diventa una leggenda"). Every conjunct agrees with
      // the subject independently, so a coordinated one reads "sembra stanca e felice" — and a
      // coordinated *subject* resolves to masculine plural first, giving "sembrano stanchi".
      // The impersonal si agrees as masculine plural ("si è stanchi", see `agreementForms`).
      if (type === 'predicative') {
        const agreeWith = agreementForms(subjectForms);
        const gender = agreeWith['gender'] ?? 'masc';
        const plural = agreeWith['number'] === 'plural';
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
      // Object complement: what the object is *made into* ("trasformare il periodo in un comando")
      // or *taken as* ("usare il periodo come condizione"). It predicates of the direct object, so
      // an adjective head agrees with that and not with the subject. The factitive link is the
      // verb's own word and fuses with a definite article like any preposition; the essive "come"
      // fuses with none and drops the article altogether — it names a role rather than picking a
      // referent out, so "come condizione", never "come la condizione".
      if (type === 'objectPredicative') {
        const essive = objectPredication(c) === 'essive';
        const gender = objectForms['gender'] ?? 'masc';
        const plural = objectForms['number'] === 'plural';
        return coordinate(c.phrase, (conjunct) => {
          const np = essive ? withDefiniteness(conjunct, 'bare') : conjunct;
          if (np.head.forms['role'] === 'adjective') {
            const adj = itDeg(np.head, agreeAdj(np.head.forms['base'] ?? '', gender, plural));
            return joinWords([essive ? 'come' : '', adj]);
          }
          const nf = itPossessedHeadForms(np);
          // The link is seeded on the verb, so it is one of the simple prepositions prepDet fuses.
          return renderNP(np, (pl, lead) =>
            essive ? prepDet('come', nf, pl, lead)
            : c.link ? prepDet(c.link as ItPreposition, nf, pl, lead)
            : artFor(nf, pl, lead));
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
      // "loro" is invariable. Only cause accepts a pronoun in the UI today. It is chosen per
      // conjunct, and every conjunct repeats its connector as a noun does, so a group mixes the two
      // ("a causa del cane e a causa tua").
      const pronounCause = (pf: Record<string, string>): string => {
        const sent = causeSentiment(c);
        if (sent === 'positive') return `grazie a ${pf['disjunctive'] ?? pf['base'] ?? ''}`;
        const poss = possessiveIt(pronounPossessor(pf), { gender: 'fem', number: 'singular' });
        return sent === 'negative' ? `per colpa ${poss}` : `a causa ${poss}`;
      };
      // locative→in, direction→a, source→"via da" (all fuse with article); route→path prep.
      // A direction toward an *animate* goal takes "da" ("corro dal bambino" = to/towards
      // the child — the "andare da qualcuno" construction), not bare "a", which is for
      // places ("corro alla casa"). Because source also governs "da", a self-propelled motion
      // verb prefixes it with the ablative adverb "via" so the two senses never collide: "corro
      // dal bambino" (motion to) vs "corro via dal bambino" (motion away from). COME/GO and the
      // transitive LOAD/IMPORT take an origin, not a departure, so they keep bare "da".
      // Cause reads "a causa di" + the cause's own determiner, fused only when definite ("a causa del
      // cane", "a causa di un cane"); the sentiment swaps the connector — negative "per colpa del
      // cane", positive "grazie al cane".
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
      const dirSpec = type === 'direction' ? directionSpecifier(c) : undefined;
      // The bare continent "in" fits the bare name alone: one still `proper`, which a possessive takes
      // away (A165), and leading its phrase, which a prenominal adjective does not let it do (A169).
      // Otherwise the name has its article back, and "in" fuses with it: "nella tua Asia", "nella
      // grande Asia".
      const bareName = (nf: Record<string, string>, lead: string): boolean => nf['proper'] === '1' && lead === nf['base'];
      const headFor = (nf: Record<string, string>) => (plural: boolean, lead: string): string =>
        type === 'locative'  ? (bareName(nf, lead) && locSpec === 'in' ? 'in' : spatialHead(locSpec, nf, plural, lead)) :
        type === 'terminus'  ? prepDet('a', nf, plural, lead) :
        // The comitative companion takes the same "con" as the instrument — Italian does not
        // separate the two either ("coordina con il periodo").
        type === 'instrumental' || type === 'comitative' ? prepDet('con', nf, plural, lead) :
        type === 'manner'    ? prepDet(IT_MANNER_PREP[mannerRelation(nf)], nf, plural, lead) :
        type === 'direction' ? (
          // A direction naming a relation is that relation's goal — Italian spells the two the same
          // ("salta nell'aria", "è nell'aria"), so the place map serves ("jumps into the air").
          dirSpec ? spatialHead(dirSpec, nf, plural, lead) :
          // A verb can fix its goal's preposition in its lexeme. "Muoversi" takes "verso" for every
          // goal: after it, "da" reads as the place left ("muoversi dal parlante" is moving away from
          // the speaker), "al suolo" and "in Europa" as where the moving happens. Localization B34, B35.
          verbForms['direction_prep'] ? prepDet(verbForms['direction_prep'] as ItPreposition, nf, plural, lead) :
          // A land goal, a continent or a country, takes bare "in" ("va in Antartide", "va in
          // Giappone"), not the default place "a" with the proper noun's article ("all'Antartide", "al
          // Giappone"); an animate goal takes "da", a place "a". A land that is no longer a bare name
          // takes the "in" that fuses with its article: "va nella tua Asia", "va nella grande Asia".
          isNamedLand(nf) ? (bareName(nf, lead) ? 'in' : spatialHead('in', nf, plural, lead)) :
          prepDet(nf['animate'] === '1' ? 'da' : 'a', nf, plural, lead)
        ) :
        type === 'source'    ? `${sourceAdverb || (nf['animate'] === '1' ? 'via ' : '')}${prepDet('da', nf, plural, lead)}` :
        type === 'cause'     ? (
          causeSent === 'positive' ? `grazie ${prepDet('a', nf, plural, lead)}` :
          causeSent === 'negative' ? `per colpa ${prepDet('di', nf, plural, lead)}` :
          `a causa ${prepDet('di', nf, plural, lead)}`
        ) :
        spatialHead(pathSpecifier(c), nf, plural, lead);
      // A hearth noun takes its fixed locative idiom in place of the whole noun phrase — "a casa", not
      // the article-fused "nella casa" — so it bypasses the article and fusion machinery entirely.
      return coordinate(c.phrase, (np) =>
        (type === 'cause' && np.head.forms['person'] ? pronounCause(np.head.forms) : '') ||
        (type === 'locative' && locativeIdiom(c, np, LOCATIVE_IDIOMS)) || renderNP(np, headFor(itPossessedHeadForms(np))));
    })
    .filter(Boolean)
    .join(' ');
}
