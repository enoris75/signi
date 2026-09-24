import { COMPLEMENT_RENDER_ORDER, DEFAULT_LOCATIVE_SPECIFIER, DEFAULT_ROUTE_SPECIFIER, isPronominalPossessor, type ComplementType } from '@signi/shared';
import type { ConceptForms, ResolvedComplement, ResolvedNounPhrase } from '../../../types.js';
import { causeSentiment } from '../../../functions/causeSentiment.js';
import { withCauseNegator } from '../../../functions/withCauseNegator.js';
import { isSeemingPredicateNoun } from '../../../functions/isSeemingPredicateNoun.js';
import { directionIdiom } from '../../../functions/directionIdiom.js';
import { locativeIdiom } from '../../../functions/locativeIdiom.js';
import { objectPredication } from '../../../functions/objectPredication.js';
import { directionSpecifier } from '../../../functions/directionSpecifier.js';
import { isNamedLand } from '../../../functions/isNamedLand.js';
import { pathSpecifier } from '../../../functions/pathSpecifier.js';
import { groupScopedRelation } from '../../../functions/groupScopedRelation.js';
import { liftPreposition } from '../../../functions/liftPreposition.js';
import { BETWEEN_PREP } from '../de.consts.js';
import { temporalRelation } from '../../../functions/temporalRelation.js';
import { temporalPreposition } from '../../../functions/temporalPreposition.js';
import { withDefiniteness } from '../../../functions/withDefiniteness.js';
import { ownHeadForms, possessedHeadForms } from '../../../functions/possessedHeadForms.js';
import { tonicPronoun } from '../../../functions/tonicPronoun.js';
import { isPrivative } from '../../../functions/isPrivative.js';
import { tonicHeadForms } from '../../../functions/tonicHeadForms.js';
import { TONIC_COMPLEMENTS } from '../../../functions/functions.consts.js';
import { tonicPronounDe } from '../tonicPronounDe.js';
import { dativePronounDe, keptBesidePossessive, possessiveDe } from '../../../possessive.js';
import { adjectivalNoun } from '../adjectivalNoun.js';
import { adjPhrase } from '../adjPhrase.js';
import { articledNameForms } from '../articledNameForms.js';
import { coordinate } from '../coordinate.js';
import { datPluralN } from '../datPluralN.js';
import { isQuestionPossessor } from '../../../functions/questionPossessor.js';
import { cardinalOne } from '../cardinalOne.js';
import { numeralDe } from '../numeralDe.js';
import { CONSTITUENT_NEGATOR, DE_GENITIVE_TEMPORAL, DE_TEMPORAL, DIRECTION_IDIOMS, ESSIVE_ROLE_CASE, LOCATIVE_IDIOMS, OBJECT_PREDICATIVE_CASE } from '../de.consts.js';
import type { Case, ObjectPredicateHost } from '../de.types.js';
import { mannerPrepCase } from '../mannerPrepCase.js';
import { dePredAdj } from '../dePredAdj.js';
import { dePredOrdinal } from '../dePredOrdinal.js';
import { dePredSuperlative } from '../dePredSuperlative.js';
import { deStandard } from '../deStandard.js';
import { genitiveS } from '../genitiveS.js';
import { genitiveShows } from '../genitiveShows.js';
import { germanCompound } from '../germanCompound.js';
import { modifierGenitives } from '../modifierGenitives.js';
import { nounPhrase } from '../nounPhrase.js';
import { nounExamples } from '../nounExamples.js';
import { nounStandard } from '../nounStandard.js';
import { objectPrepCase } from '../objectPrepCase.js';
import { possessedDeclension } from '../possessedDeclension.js';
import { possessorText } from '../possessorText.js';
import { postnominal } from '../postnominal.js';
import { prepDet } from '../prepDet.js';
import { spatialCase } from '../spatialCase.js';
import { spatialHead } from '../spatialHead.js';
import { subordinateClause } from '../subordinateClause.js';
import { weakN } from '../weakN.js';
import { causePhrase } from './causePhrase.js';
import { instrumentActionPhrase } from './instrumentActionPhrase.js';

// A land named without an article, a continent or a country ("Europa", "Asien", "Italien", "Japan"),
// the goal German marks with "nach". Keyed off the hypernym (`isNamedLand`), as the Italian and French
// land goals are; an articled one goes "in die Schweiz", and a city seeded later would need its own.
function isBareNamePlace(f: Record<string, string>): boolean {
  return isNamedLand(f) && f['proper'] === '1' && f['takes_article'] !== '1';
}

// German closes the Mittelfeld with the predicate, against the verb cluster ("wird wegen des Hundes
// eine Legende", "ist wegen des Hundes müde geworden"), where the shared `COMPLEMENT_RENDER_ORDER`
// — English and Romance order — leads with it. So the two predicate slots are rendered apart from
// the adjuncts, and last (A186).
const DE_PREDICATE_TYPES: ComplementType[] = ['objectPredicative', 'predicative'];
const DE_ADJUNCT_ORDER = COMPLEMENT_RENDER_ORDER.filter((type) => !DE_PREDICATE_TYPES.includes(type));

// `verb` is the governing verb's forms: a predicate noun under a seeming verb reads it to close the
// complements with the infinitival copula ("scheint im Markt eine Legende zu sein"). `agreement` is
// what the predicate is said of — the clause's subject, a causative's causee, a relative's head — whose
// gender and number a predicate ordinal takes ("die Katze ist die Erste", A225). `object` is what an
// object predicate is said of, and its case: the direct object in the accusative, or a passive's
// subject in the nominative, whose gender and number an essive ordinal takes (A231).
export function complementsParts(
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
  verb: ConceptForms['forms'] = {},
  agreement: Record<string, string> = {},
  object: ObjectPredicateHost = { agreement: {}, case: 'acc' },
): { adjuncts: string; predicate: string } {
  if (!complements) return { adjuncts: '', predicate: '' };
  const render = (type: ComplementType): string => {
      const c = complements[type];
      if (!c) return '';
      // A pronoun or negative cause and an instrument presented as an action take shapes of their own;
      // a plain noun in either slot falls through to the prepositional path below.
      const cause = type === 'cause' ? causePhrase(c) : undefined;
      if (cause !== undefined) return cause;
      const instrumentAction = type === 'instrumental' ? instrumentActionPhrase(c) : undefined;
      if (instrumentAction !== undefined) return instrumentAction;
      // Subject complement: a German predicate adjective is uninflected ("wird müde",
      // "scheint groß" — no declension endings) but is still compared ("wird müder"); a
      // predicate noun takes the *nominative* case, not the dative the other complements
      // use ("wird eine Legende").
      // Coordinated conjuncts render one by one, so a group may mix the two ("wird müde und
      // eine Legende" is odd, but "scheint müde oder groß" falls out of the same map).
      // An ordinal has no undeclined form, and takes the article and the capital instead, in the
      // gender and number of what it is said of: "ist der Erste" (A225, see `dePredOrdinal`).
      if (type === 'predicative') {
        return coordinate(c.phrase, (np) =>
          np.head.forms['role'] !== 'adjective' ? nounPhrase(np, 'nom')
            : np.head.forms['ordinal'] === '1' ? dePredOrdinal(np.head, agreement)
            // A superlative with its set leaves "am …sten" for the article: "ist das größte der
            // Tiere" (P09-E19, see `dePredSuperlative`).
            : [np.head.forms['domain'] === '1' && np.standard ? dePredSuperlative(np.head, agreement, np.standard) : dePredAdj(np.head), deStandard(np.head, np.standard, 'nom')].filter(Boolean).join(' '),
        );
      }
      // The preposition governs a case, and the case is spelled on each conjunct's own article
      // ("mit dem Messer und dem Stock"), so preposition and determiner are emitted per conjunct.
      const conjunctText = (conjunct: ResolvedNounPhrase): string => {
      // The essive object complement names a role rather than picking a referent out, so German
      // leaves it article-less whatever determiner was chosen: "als Bedingung", not "als die
      // Bedingung". Its adjectives then decline strong, which `definiteness` below arranges. The
      // role (P09-E13) is the same "als" said of the subject, and as bare: "als Freund", where "wie
      // ein Freund" is the likeness, the similative manner.
      const essive = (type === 'objectPredicative' && objectPredication(c) === 'essive') || type === 'role';
      // A bare conjunct counted by one is the indefinite one, its ein-word declined by the head's case
      // ("mit einem Hund", "innerhalb eines Tages", A321).
      const np = essive ? withDefiniteness(conjunct, 'bare') : cardinalOne(conjunct);
      // A German object predicative adjective is uninflected, as the subject one is ("streicht
      // die Wand rot", "betrachtet die Wand als rot"). An ordinal after "als" is nominalised
      // instead, as a subject one is (A225), in the gender and number of the object and in the case
      // "als" shares with it: "sieht das Haus als das Erste", "den Hund als den Ersten" (A231). The
      // factitive with no link ("macht die Option erste") wants MAKE's "zu", not a new form here.
      if (type === 'objectPredicative' && np.head.forms['role'] === 'adjective') {
        const word = essive && np.head.forms['ordinal'] === '1'
          ? dePredOrdinal(np.head, object.agreement, object.case)
          : dePredAdj(np.head);
        return [essive ? 'als' : '', word].filter(Boolean).join(' ');
      }
      // A hearth noun takes its fixed locative idiom in place of the whole noun phrase — "zu Hause",
      // not "im Zuhause" — so no preposition, case or declension is chosen for it.
      const idiom = (type === 'locative' && locativeIdiom(c, np, LOCATIVE_IDIOMS))
        // …and the goal's, as a plain direction takes it (P09-E37).
        || (type === 'direction' && directionIdiom(c, np, DIRECTION_IDIOMS));
      if (idiom) return idiom;
      // A pronoun behind an adposition is the bare preposition + the pronoun, with no article and no
      // declension of its own ("mit ihm", never "mit dem er" — A197 for the comitative and the
      // instrumental, A203 for the other five), as the causal adjunct already spells it in
      // `causePhrase`. German is the language where that is not one form: the preposition rules the
      // case, so the head below is chosen exactly as it always is — from a forms bag with no
      // determiner to fuse with (`tonicHeadForms`) — and `_case` falls out of it alongside, which is
      // what picks the pronoun ("in ihm" dative, "durch ihn" accusative, "wie er" nominative).
      const pronoun = TONIC_COMPLEMENTS.has(type) ? tonicPronoun(np) : undefined;
      // The privative's "ohne" is no "mit": it governs the accusative, which the path below declines
      // the pronoun for ("ohne ihn", P09-E2).
      if (pronoun && !isPrivative(type, c) && (type === 'instrumental' || type === 'comitative')) return `mit ${pronoun}${subordinateClause(np)}`;
      // A possessive is an ein-word in place of the article, so the head is the preposition alone and
      // the adjectives decline as they do after "kein" ("in meinem kleinen Haus", "deinem Hund",
      // "durch meine großen Häuser", see `possessedDeclension`). A bare-name place modified by an
      // adjective takes the article instead, and fuses ("im großen Asien").
      const poss = np.possessor && isPronominalPossessor(np.possessor) ? np.possessor : undefined;
      // A head that carries a determiner of its own keeps it, and the possessive moves into a
      // postnominal "von" + dative phrase: "in diesem Haus von mir", "in keinem Haus von ihr"
      // (A187, which fixed the subject and the object; A202, which brought the complement along).
      // `possessedHeadForms` still answers `bare` — the determiner slot a prenominal possessive
      // fills — so a detached one asks for the head's own determiner back, exactly as `nounPhrase`
      // does. The adjectives then decline after that determiner rather than after the possessive
      // (`possessedDeclension` reads the same forms).
      // "alle" is the other one that survives, and it does not detach: it stands in FRONT of the
      // possessive rather than in its place ("in allen meinen Häusern"), so the head keeps its own
      // determiner there too while the possessive stays prenominal.
      const ownDeterminer = np.head.forms['definiteness'] ?? 'definite';
      const detached = !!poss && keptBesidePossessive(np.head.forms);
      const nounForms = articledNameForms(np, !!poss && (detached || ownDeterminer === 'all' || ownDeterminer === 'most')
        ? ownHeadForms(np)
        : possessedHeadForms(np, 'bare'));
      const f = pronoun ? tonicHeadForms(np) : nounForms;
      const plural = (f['number'] ?? f['count']) === 'plural';
      const definiteness = possessedDeclension(np, f);
      const compound = germanCompound(np, plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? ''));
      // route/locative → spatial preposition (+ its case); direction/source → two-way preps +
      // dative; the cause "wegen" → genitive. The in+dem=im / zu+dem=zum / zu+der=zur fusions fire
      // only for a definite article; any other determiner (einem, keiner, vielen, bare) stays
      // uncontracted.
      let head: string;
      let _case: Case;
      if (type === 'route' || type === 'locative') {
        // Both read their relation off the same specifier set; only the default differs, and the
        // case falls out of the preposition ("im Markt", "unter dem Markt", "um den Markt").
        const spec = pathSpecifier(c, type === 'locative' ? DEFAULT_LOCATIVE_SPECIFIER : DEFAULT_ROUTE_SPECIFIER);
        _case = spatialCase(spec, type);
        head = spatialHead(spec, f, plural, type);
      } else {
        _case = 'dat';
        // A direction naming a relation is motion into it, which German marks with the accusative
        // ("in die Luft"); a bare direction is the plain goal "zu" + dative ("zum Haus"). A place
        // named without an article takes "nach" instead, and no article: "nach Europa" (A168). A
        // possessive or an adjective gives the name its article back, and it takes "zu" again ("zu
        // deinem Asien", "zum großen Asien"), as the articled "zur Antarktis" does.
        if (type === 'direction') {
          const goal = directionSpecifier(c);
          if (goal) { _case = spatialCase(goal, 'direction'); head = spatialHead(goal, f, plural, 'direction'); }
          else if (isBareNamePlace(f)) head = 'nach';
          else head = prepDet('zu', f, 'dat', plural);
        }
        // Instrumental: "mit" + dative ("mit dem Messer"). The mit+dem → "beim"-style fusion
        // doesn't exist for "mit", so prepDet leaves it uncontracted. The comitative companion
        // takes the same "mit": German does not separate the two either.
        // Denied, the instrument is the privative "ohne", which governs the **accusative** ("ohne das
        // Messer", "ohne den Stock" — P09-E2).
        else if (isPrivative(type, c)) { _case = 'acc'; head = prepDet('ohne', f, 'acc', plural); }
        else if (type === 'instrumental' || type === 'comitative') head = prepDet('mit', f, 'dat', plural);
        // P09-E22. The opponent "gegen" governs the **accusative** ("spielt gegen den Hund", "gegen
        // ihn"), and is not the spatial `against`, the contact "an" + dative ("am Hund"). It fuses in
        // writing with nothing ("gegens" is speech). A verb may name its own, which governs its own
        // case, as a prepositional object's does: "spielt mit dem Hund" (A318, `objectPrepCase`).
        else if (type === 'opponent') {
          const prep = c.link || 'gegen';
          _case = objectPrepCase(prep);
          head = prepDet(prep, f, _case, plural);
        }
        // P09-E2. The purpose "für" and the topic "über" both govern the **accusative**: "arbeitet für
        // den Mann", "spricht über den Kater". The topic's "über" is not the spatial one, which takes
        // the dative of a place ("über dem Kater", see `spatialCase`) and is the locative's. Neither
        // fuses in writing — "fürs" and "übers" are speech. A verb may govern its own topic's, "an"
        // for "denken", in the same accusative: "denkt an den Kater" (see `topicLink`).
        else if (type === 'purpose') { _case = 'acc'; head = prepDet('für', f, 'acc', plural); }
        else if (type === 'topic') { _case = 'acc'; head = prepDet(c.link || 'über', f, 'acc', plural); }
        // Object complement: the essive "als" takes the case of the object it predicates of — the
        // accusative — and no article at all; the factitive link is the verb's own preposition and
        // governs its own case ("in einen Befehl", "zu einem Befehl"). A verb naming none leaves
        // the bare accusative predicate ("macht das Satzgefüge einen Befehl").
        else if (type === 'objectPredicative') {
          const marker = essive ? 'als' : (c.link ?? '');
          _case = OBJECT_PREDICATIVE_CASE[marker] ?? 'acc';
          head = essive ? 'als' : prepDet(marker, f, _case, plural);
        }
        // The role's "als" takes the case of what it is said of, as the essive's does — the subject,
        // so the nominative (ESSIVE_ROLE_CASE): "handelt als Freund", and a weak noun keeps its
        // nominative, "liest das Buch als Student", where the object's essive declines it "als den
        // Studenten".
        else if (type === 'role') { _case = ESSIVE_ROLE_CASE; head = 'als'; }
        // Manner: similative "wie" + nominative ("wie der Wind" — the default); means/measure
        // "mit" + dative ("mit der Geschwindigkeit des Lichts", "mit Sorgfalt"); mode "auf" +
        // accusative ("auf eine gute Weise"); a temporal noun "zu" + dative ("zu allen Zeiten").
        // Read off the head noun (`mannerPrepCase`).
        else if (type === 'manner') {
          const [prep, mannerCase] = mannerPrepCase(f);
          _case = mannerCase;
          head = prepDet(prep, f, mannerCase, plural);
        }
        // Cause: "wegen" governs the genitive ("wegen des Hundes", "wegen eines Hundes", "wegen
        // meines Hundes"), and falls back on the dative only where the genitive would not show
        // ("wegen Männern", see `genitiveShows`). A relativizer takes its genitive too: "der Hund,
        // wegen dessen …". The positive "dank" credits with the dative, which is standard beside its
        // genitive ("dank dem Hund"). The negative sentiment and a pronoun never reach here — they
        // took `causePhrase` above.
        else if (type === 'cause') {
          const positive = causeSentiment(c) === 'positive';
          _case = positive || !genitiveShows(np, f) ? 'dat' : 'gen';
          head = prepDet(positive ? 'dank' : 'wegen', f, _case, plural);
        }
        // A time. "an" + dative for the `at` relation ("an diesem Tag"), where the word is the head
        // noun's own — German is *an* dem Tag, *zu* der Zeit, *in* der Woche — and "zu" is the
        // fallback a lexeme naming none takes, the same "zu" a temporal noun already takes in a
        // manner adverbial ("zu allen Zeiten", A60). "bis" reaches its time through that "zu" as
        // well ("bis zum Tag"), and "nach" and "vor" take the plain dative. "vor" spells both `ago`
        // and `before` — German makes no difference between "vor einem Augenblick" and "vor dem
        // Tag", where English has two words and Japanese marks the two apart with の.
        //
        // "während" is the exception, and P09-E34's "innerhalb" with it: they govern the **genitive**
        // ("während des Tages", "innerhalb einer Stunde"), and fall back on the dative exactly where
        // the cause's "wegen" does — a bare plural has no genitive
        // to show ("während Tagen", see `genitiveShows`).
        else if (type === 'temporal') {
          const relation = temporalRelation(c);
          if (relation === 'during' || relation === 'within') {
            _case = genitiveShows(np, f) ? 'gen' : 'dat';
            head = prepDet(DE_GENITIVE_TEMPORAL[relation], f, _case, plural);
          } else if (relation === 'until') {
            head = `bis ${prepDet('zu', f, 'dat', plural)}`;
          } else if (relation === 'for') {
            // P09-E35. A duration takes no preposition: the measure in the bare accusative, "läuft
            // eine Stunde", "läuft zwei Stunden".
            _case = 'acc';
            head = prepDet('', f, 'acc', plural);
          } else {
            head = prepDet(relation === 'at' ? temporalPreposition(c, 'zu') : DE_TEMPORAL[relation], f, 'dat', plural);
          }
        }
        // Terminus. An animate recipient is a bare dative — no preposition, just the dative
        // determiner ("der Katze"), the same case German gives the plain indirect object. An
        // inanimate goal is a destination, not a recipient, so it takes a directional preposition:
        // "in" + the accusative of motion-into ("speichert das Buch in den Behälter"), never the
        // bare dative that would read as *giving the book to the container*. Which preposition is
        // the verb's own: ADD adds a thing TO something, so it says `terminus_prep: 'zu'` and takes
        // the dative ("fügt das Buch zum Behälter hinzu", A143). "in" is the default. A verb whose
        // terminus is its dative object whatever it names says `terminus_dative`: GIVE gives a value
        // TO an option, "gibt der Option den Wert", not INTO it (A223).
        // A verb that governs the person it reaches in the **accusative** says so (`terminus_case`,
        // C35's lexical case the other way round): German *fragen* asks a person, "fragt den Mann
        // nach dem Namen", where every other addressee verb says "dem Mann". It is bare, like the
        // dative recipient, and keeps the recipient's place ahead of the object.
        else if (type === 'terminus') {
          if (verb['terminus_case'] === 'acc') { _case = 'acc'; head = prepDet('', f, 'acc', plural); }
          else if (f['animate'] === '1' || verb['terminus_dative'] === '1') head = prepDet('', f, 'dat', plural);
          else if (verb['terminus_prep']) head = prepDet(verb['terminus_prep'], f, 'dat', plural);
          // A place one is at rather than inside is reached with its own preposition: "schickt das
          // Buch an einen Ort" (A218).
          else { _case = 'acc'; head = prepDet(f['place_prep'] ?? 'in', f, 'acc', plural); }
        }
        // Source. "aus" is "out of" an enclosure, right for a house or a continent but not for a
        // person or an animal, which one is not inside: a living source takes "von", fused to "vom"
        // before "dem" (A154). So does a place one is at rather than inside, which names its own
        // preposition (`place_prep`): "von einem Ort", "vom Ausgangspunkt" (A218). The relativizer
        // stand-in comes through here too ("von dem").
        else /* source */         head = prepDet(f['animate'] === '1' || f['place_prep'] ? 'von' : 'aus', f, 'dat', plural);
      }
      // The pronoun is the whole phrase after the head, declined for the case the head governs. The
      // bare-dative terminus leaves no head at all, and then the pronoun is the phrase ("gibt ihm").
      // An indefinite pronoun keeps its relative clause: "mit jemandem, der läuft" (A309).
      if (pronoun) {
        const word = `${tonicPronounDe(np.head.forms, _case)}${subordinateClause(np)}`;
        return head ? `${head} ${word}` : word;
      }
      // A relativizer stand-in is its preposition and pronoun alone: "in dem", "mit denen", "dem".
      if (definiteness === 'relative') return head;
      // "die meisten" takes a possessed head as its partitive genitive: "mit den meisten ihrer Kater",
      // so what follows the head is genitive whatever case the preposition governs (A314).
      const nounCase: Case = poss && ownDeterminer === 'most' && f['proper'] !== '1' ? 'gen' : _case;
      // An adjectival noun takes the adjective ending its determiner and case select and none of the
      // noun rules ("mit dem Verwandten", "zu einem Verlobten", P11 D8); a weak masculine goal/place
      // declines to -(e)n in the oblique ("zum/im/aus dem Jungen"); every other noun takes the
      // regular dative-plural -n, and a genitive its -(e)s ("wegen des Hundes").
      const word = f['adjectival'] === '1'
        ? adjectivalNoun(compound, f, nounCase, definiteness, plural)
        : nounCase === 'gen'
          ? genitiveS(compound, nounCase, f, plural)
          : f['weak'] === '1' ? weakN(compound, nounCase, plural) : datPluralN(compound, nounCase, plural);
      const declined = adjPhrase(np, nounCase, definiteness);
      const adj = declined ? `${declined} ` : '';
      const possessive = poss && !detached
        ? `${possessiveDe(poss, nounCase, { gender: (f['gender'] ?? 'neut') as 'masc' | 'fem' | 'neut', number: plural ? 'plural' : 'singular' })} `
        : '';
      const vonPhrase = detached && poss ? ` von ${dativePronounDe(poss)}` : '';
      // A cardinal stands after the determiner and possessive and before the declined adjectives, as
      // `nounPhrase` places it: "in den drei Häusern", "mit meinen drei Hunden" (C31, A291). The
      // determiner is in `head`, so a fusion like "im" / "zum" is untouched.
      // At one after der or dieser it declines weak: "mit dem einen Hund" (`numeralDe`, A319).
      const numeral = numeralDe(f, nounCase, definiteness, !!poss || isQuestionPossessor(np.possessor));
      const counted = numeral ? `${numeral} ` : '';
      const rest = `${possessive}${counted}${adj}${word}${postnominal(f)}${modifierGenitives(np)}${vonPhrase}${possessorText(np)}${nounStandard(np, _case)}${subordinateClause(np)}${nounExamples(np, _case)}`;
      return head ? `${head} ${rest}` : rest;
      };
      // All but `between`, which is said once over the group: each conjunct is built as above, its
      // own dative article and all, and its "zwischen" lifted off (P09-E1 D2) — "zwischen dem Haus
      // und dem Baum", never "zwischen dem Haus und zwischen dem Baum".
      const scoped = groupScopedRelation(type, c) ? BETWEEN_PREP : '';
      const group = coordinate(c.phrase, (conjunct) => liftPreposition(conjunctText(conjunct), scoped));
      return scoped ? `${scoped} ${group}` : group;
  };
  // A cause the plan denies rather than the clause takes its negator here, directly before the
  // phrase, which is where a constituent negation stands in the Mittelfeld (see `withCauseNegator`).
  const adjuncts = DE_ADJUNCT_ORDER
    .map((type) => withCauseNegator(render(type), type, complements[type], CONSTITUENT_NEGATOR))
    .filter(Boolean).join(' ');
  const text = DE_PREDICATE_TYPES.map(render).filter(Boolean).join(' ');
  // "scheinen" takes no predicate nominative at all — "*scheint eine Legende" — only the infinitive
  // "zu sein" (a predicate adjective alone stays bare: "scheint müde"). The infinitive is
  // non-finite, so it closes the complements and sits against the verb cluster, whatever the clause
  // order: "scheint im Markt eine Legende zu sein", "eine Legende zu sein scheinen wird", ", die eine
  // Legende zu sein scheint,". A predicate ordinal is a nominalised one in German, "der Erste", so it
  // takes the copula as a noun does: "scheint der Erste zu sein" (A225).
  const predicative = complements['predicative'];
  const nominal = !!predicative && (isSeemingPredicateNoun(predicative, verb)
    || (verb['seeming'] === '1' && predicative.phrase.conjuncts.some((np) => np.head.forms['ordinal'] === '1')));
  const predicate = text && nominal ? `${text} zu sein` : text;
  return { adjuncts, predicate };
}

/** The complements as one phrase, the adjuncts first and the predicate closing them. */
export function complementsPhrase(
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
  verb: ConceptForms['forms'] = {},
): string {
  const { adjuncts, predicate } = complementsParts(complements, verb);
  return [adjuncts, predicate].filter(Boolean).join(' ');
}
