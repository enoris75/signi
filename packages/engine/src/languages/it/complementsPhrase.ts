import { COMPLEMENT_RENDER_ORDER, DEFAULT_LOCATIVE_SPECIFIER, type ComplementType } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounPhrase } from '../../types.js';
import { abstractionLevel } from '../../functions/abstractionLevel.js';
import { actionGerund } from '../../functions/actionGerund.js';
import { actionInfinitive } from '../../functions/actionInfinitive.js';
import { causeSentiment } from '../../functions/causeSentiment.js';
import { withCauseNegator } from '../../functions/withCauseNegator.js';
import { isRelativeSuperlative } from '../../functions/isRelativeSuperlative.js';
import { superlativeLead } from '../../functions/superlativeLead.js';
import { takesPredicateArticle } from '../../functions/takesPredicateArticle.js';
import { locativeIdiom } from '../../functions/locativeIdiom.js';
import { mannerRelation } from '../../functions/mannerRelation.js';
import { objectPredication } from '../../functions/objectPredication.js';
import { directionSpecifier } from '../../functions/directionSpecifier.js';
import { isNamedLand } from '../../functions/isNamedLand.js';
import { pathSpecifier } from '../../functions/pathSpecifier.js';
import { groupScopedRelation } from '../../functions/groupScopedRelation.js';
import { liftPreposition } from '../../functions/liftPreposition.js';
import { BETWEEN_PREP } from './it.consts.js';
import { temporalRelation } from '../../functions/temporalRelation.js';
import { temporalPreposition } from '../../functions/temporalPreposition.js';
import { withDefiniteness } from '../../functions/withDefiniteness.js';
import { tonicPronoun } from '../../functions/tonicPronoun.js';
import { isPrivative } from '../../functions/isPrivative.js';
import { tonicHeadForms } from '../../functions/tonicHeadForms.js';
import { headPreposition } from '../../functions/headPreposition.js';
import { SOURCE_ABLATIVE_ADVERB_VERBS, TONIC_COMPLEMENTS } from '../../functions/functions.consts.js';
import { possessiveIt, pronounPossessor } from '../../possessive.js';
import { CONSTITUENT_NEGATOR, IT_DI_BEFORE_PRONOUN, IT_MANNER_PREP, IT_TEMPORAL, LOCATIVE_IDIOMS } from './it.consts.js';
import { agreeAdj } from './agreeAdj.js';
import { agreementForms } from './agreementForms.js';
import { artFor } from './artFor.js';
import { coordinate } from './coordinate.js';
import { defArticle } from './defArticle.js';
import { itDeg } from './itDeg.js';
import { itPossessedHeadForms } from './itPossessedHeadForms.js';
import { itStandard } from './itStandard.js';
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
  // contenitore"); an animate source takes the adverb under a verb that takes a goal, because the
  // animate *goal* takes "da" as well (the andare-da construction), so bare "va dal bambino" reads as
  // "goes TO the boy" (A153). That part is decided per conjunct, in `headFor` below. A verb that licenses
  // no `direction` has no goal for "da" to collide with, so its animate source stays bare: "rimuove il
  // libro dal cane", "il cane dal quale l'uomo rimuove il libro" (A228). A caller that names no verb
  // (the complement gloss) keeps the adverb.
  const sourceAdverb = SOURCE_ABLATIVE_ADVERB_VERBS.has(verbConceptId) ? 'via ' : '';
  const takesGoal = (verbForms['complements'] ?? 'direction').split(',').includes('direction');
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
          // A superlative's intensifier stands before the article: "di gran lunga il più grande" (A257).
          const { lead, adjective } = superlativeLead(np.head);
          const surface = joinWords([itDeg(adjective, agreeAdj(adjective.forms['base'] ?? '', gender, plural)), itStandard(np.head, np.standard)]);
          // A predicative superlative has no noun's article to borrow (unlike "il gatto più
          // grande"), so it supplies its own, agreeing with the subject: "sembra IL più felice",
          // distinguishing it from the comparative "sembra più felice". SAME keeps its article the
          // same way: "è lo stesso" (see `takesPredicateArticle`).
          return isRelativeSuperlative(np.head) || takesPredicateArticle(np.head)
            ? joinWords([lead, joinArt(defArticle({ gender }, plural, surface), surface)])
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
        if (objectPredication(c) === 'essive') return essivePhrase(c, objectForms);
        const gender = objectForms['gender'] ?? 'masc';
        const plural = objectForms['number'] === 'plural';
        return coordinate(c.phrase, (np) => {
          if (np.head.forms['role'] === 'adjective') {
            return itDeg(np.head, agreeAdj(np.head.forms['base'] ?? '', gender, plural));
          }
          const nf = itPossessedHeadForms(np);
          // The link is seeded on the verb, so it is one of the simple prepositions prepDet fuses.
          return renderNP(np, (pl, lead) =>
            c.link ? prepDet(c.link as ItPreposition, nf, pl, lead) : artFor(nf, pl, lead));
        });
      }
      // The role (P09-E13): the essive said of the subject, "agisce come amico". Its gender and
      // number are the plan's own, as on any noun (D5): "la donna agisce come amica" asks for FRIEND's
      // feminine rather than inferring it from the subject.
      if (type === 'role') return essivePhrase(c, agreementForms(subjectForms));
      // An instrument presented as an action: the bare gerundio for the process level
      // ("scegliendo una parola" — Italian needs no preposition before it), and the substantivized
      // infinitive for the concept level ("con lo scegliere una parola"). That infinitive is an
      // ordinary masculine singular noun, so it takes the definite article its *own* sound selects
      // — "lo scegliere" (s-impura), "il mangiare", "l'aprire" — and "con" fuses with none of them.
      // The noun phrase is the action's direct object either way.
      // Denied, it is the privative (P09-E2): "senza" + the bare infinitive at either level ("senza
      // scegliere una parola"), the one form Italian gives an act it is without.
      if (type === 'instrumental' && c.action) {
        const level = abstractionLevel(c);
        if (level !== 'object') {
          const object = coordinate(c.phrase, npText);
          const infinitive = actionInfinitive(c.action);
          const verb =
            isPrivative(type, c) ? `senza ${infinitive}` :
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
      // A *superlative* takes it back too (A188). Italian puts the degree after the noun, and the
      // definite article is the only thing telling the superlative from the comparative (C01): bare
      // "in Europa più grande" reads "in a bigger Europe", so the name is articled and "in" fuses
      // with it ("nell'Europa più grande"). `headForms` marks the phrase for `bareName`, because
      // `headFor` sees the forms and not the phrase. A169's positive and comparative stay bare.
      const bareName = (nf: Record<string, string>, lead: string): boolean =>
        nf['proper'] === '1' && lead === nf['base'] && nf['relativeSuperlative'] !== '1';
      const headForms = (np: ResolvedNounPhrase): Record<string, string> => {
        const nf = itPossessedHeadForms(np);
        return np.adjectives.some(isRelativeSuperlative) ? { ...nf, relativeSuperlative: '1' } : nf;
      };
      const headFor = (nf: Record<string, string>) => (plural: boolean, lead: string): string =>
        type === 'locative'  ? (bareName(nf, lead) && locSpec === 'in' ? 'in' : spatialHead(locSpec, nf, plural, lead)) :
        type === 'terminus'  ? prepDet('a', nf, plural, lead) :
        // The comitative companion takes the same "con" as the instrument — Italian does not
        // separate the two either ("coordina con il periodo"). The instrument denied is "senza"
        // (P09-E2), which fuses with nothing either: "senza il coltello".
        type === 'instrumental' || type === 'comitative' ? prepDet(isPrivative(type, c) ? 'senza' : 'con', nf, plural, lead) :
        // P09-E22. The opponent "contro", which fuses with nothing ("contro il cane") and reaches a
        // pronoun through "di" (`IT_DI_BEFORE_PRONOUN`: "contro di lui"). A verb may name its own.
        type === 'opponent'  ? prepDet((c.link || 'contro') as ItPreposition, nf, plural, lead) :
        // P09-E2. The purpose "per", which fuses with nothing ("per l'uomo"), and the topic "di",
        // which fuses as any simple preposition does: "parla del gatto", "di un gatto". A verb may
        // govern its own topic's instead ("pensa al gatto", see `topicLink`); it is a simple one.
        type === 'purpose'   ? prepDet('per', nf, plural, lead) :
        type === 'topic'     ? prepDet((c.link || 'di') as ItPreposition, nf, plural, lead) :
        type === 'manner'    ? prepDet(IT_MANNER_PREP[mannerRelation(nf)], nf, plural, lead) :
        // A time. "fino a" and "prima di" are locutions ending in a simple preposition, so the
        // article fuses through it ("fino al giorno", "prima del giorno"); "dopo" and "durante" are
        // single words that fuse with nothing ("dopo il giorno"). The `at` relation takes the word
        // the head noun names — "in questo giorno" against the generic "a questo tempo" — and "fa"
        // is no adposition at all, so it leaves the phrase bare and is postposed below.
        type === 'temporal'  ? (() => {
          const relation = temporalRelation(c);
          const { word, prep } = IT_TEMPORAL[relation];
          const p = relation === 'at' ? temporalPreposition<ItPreposition>(c, 'a') : prep;
          return joinWords([word ?? '', p ? prepDet(p, nf, plural, lead) : artFor(nf, plural, lead)]);
        })() :
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
        type === 'source'    ? `${sourceAdverb || (nf['animate'] === '1' && takesGoal ? 'via ' : '')}${prepDet('da', nf, plural, lead)}` :
        type === 'cause'     ? (
          causeSent === 'positive' ? `grazie ${prepDet('a', nf, plural, lead)}` :
          causeSent === 'negative' ? `per colpa ${prepDet('di', nf, plural, lead)}` :
          `a causa ${prepDet('di', nf, plural, lead)}`
        ) :
        spatialHead(pathSpecifier(c), nf, plural, lead);
      // A pronoun behind an adposition is the bare preposition + the tonic form, with no article
      // ("con lui", "in lui", never "con il lui" — A197 for the comitative and the instrumental,
      // A203 for the other five), as the positive cause above already spells it. Per conjunct, and
      // each conjunct repeats the preposition as a noun's fused head does: "con il cane e con lui".
      // Which preposition each slot takes is not decided here: `headFor` chooses it as it always
      // does, from a forms bag that carries no determiner for it to fuse with (`tonicHeadForms`).
      // A class of them then reaches the pronoun through "di" — "sotto di lui", "attraverso di lui"
      // — which `IT_DI_BEFORE_PRONOUN` lists and `prepObjectText` already consults for a verb's
      // prepositional object; the locutions that govern their own "a" are not among them ("intorno
      // a lui"), so the last word of the head is what decides.
      const tonicText = (np: ResolvedNounPhrase): string => {
        const tonic = TONIC_COMPLEMENTS.has(type) ? tonicPronoun(np) : undefined;
        if (!tonic) return '';
        const nf = tonicHeadForms(np);
        const head = headFor(nf)((nf['number'] ?? nf['count']) === 'plural', tonic);
        const di = IT_DI_BEFORE_PRONOUN.has(headPreposition(head)) ? 'di ' : '';
        return `${head} ${di}${tonic}`;
      };
      // A hearth noun takes its fixed locative idiom in place of the whole noun phrase — "a casa", not
      // the article-fused "nella casa" — so it bypasses the article and fusion machinery entirely.
      // `between` is said once over the group, not per conjunct: each conjunct is built as above and
      // its "tra" lifted off (P09-E1 D2) — "tra la casa e l'albero".
      const scoped = groupScopedRelation(type, c) ? BETWEEN_PREP : '';
      const group = coordinate(c.phrase, (np) => liftPreposition(
        (type === 'cause' && np.head.forms['person'] ? pronounCause(np.head.forms) : '') || tonicText(np) ||
        (type === 'locative' && locativeIdiom(c, np, LOCATIVE_IDIOMS)) || renderNP(np, headFor(headForms(np))), scoped));
      const phrase = scoped ? `${scoped} ${group}` : group;
      // "fa" follows the whole group, as English's "ago" does: "un momento fa", "un giorno e una
      // notte fa". Every other temporal relation is an adposition and was emitted by `headFor`.
      const tail = type === 'temporal' ? IT_TEMPORAL[temporalRelation(c)].postposed : undefined;
      return tail ? `${phrase} ${tail}` : phrase;
    })
    // A cause the plan denies rather than the clause takes its negator here, in front of whatever
    // shape the sentiment gave it (see `withCauseNegator`).
    .map((text, i) => withCauseNegator(text, COMPLEMENT_RENDER_ORDER[i], complements[COMPLEMENT_RENDER_ORDER[i]], CONSTITUENT_NEGATOR))
    .filter(Boolean)
    .join(' ');
}

/**
 * The essive "come" and the predicate it introduces — the object taken as a role ("usa il periodo
 * come condizione") or the subject acting in one ("agisce come amico", P09-E13). "come" fuses with
 * no article and drops it altogether: it names a role rather than picking a referent out, and "come
 * **un** amico" is the likeness, the similative manner. `controller` is what the predicate is said
 * of, whose gender and number an adjective head agrees with ("considera la parete come rossa").
 */
function essivePhrase(c: ResolvedComplement, controller: Record<string, string>): string {
  const gender = controller['gender'] ?? 'masc';
  const plural = controller['number'] === 'plural';
  return coordinate(c.phrase, (conjunct) => {
    const np = withDefiniteness(conjunct, 'bare');
    if (np.head.forms['role'] === 'adjective') {
      return joinWords(['come', itDeg(np.head, agreeAdj(np.head.forms['base'] ?? '', gender, plural))]);
    }
    const nf = itPossessedHeadForms(np);
    return renderNP(np, (pl, lead) => prepDet('come', nf, pl, lead));
  });
}
