import { COMPLEMENT_RENDER_ORDER, DEFAULT_LOCATIVE_SPECIFIER, DEFAULT_ROUTE_SPECIFIER, isPronominalPossessor, type ComplementType } from '@signi/shared';
import type { ConceptForms, ResolvedComplement } from '../../../types.js';
import { causeSentiment } from '../../../functions/causeSentiment.js';
import { withCauseNegator } from '../../../functions/withCauseNegator.js';
import { isSeemingPredicateNoun } from '../../../functions/isSeemingPredicateNoun.js';
import { locativeIdiom } from '../../../functions/locativeIdiom.js';
import { objectPredication } from '../../../functions/objectPredication.js';
import { directionSpecifier } from '../../../functions/directionSpecifier.js';
import { isNamedLand } from '../../../functions/isNamedLand.js';
import { pathSpecifier } from '../../../functions/pathSpecifier.js';
import { withDefiniteness } from '../../../functions/withDefiniteness.js';
import { possessedHeadForms } from '../../../functions/possessedHeadForms.js';
import { tonicPronoun } from '../../../functions/tonicPronoun.js';
import { tonicHeadForms } from '../../../functions/tonicHeadForms.js';
import { TONIC_COMPLEMENTS } from '../../../functions/functions.consts.js';
import { tonicPronounDe } from '../tonicPronounDe.js';
import { dativePronounDe, KEPT_BESIDE_POSSESSIVE, possessiveDe } from '../../../possessive.js';
import { adjPhrase } from '../adjPhrase.js';
import { articledNameForms } from '../articledNameForms.js';
import { coordinate } from '../coordinate.js';
import { datPluralN } from '../datPluralN.js';
import { CONSTITUENT_NEGATOR, LOCATIVE_IDIOMS, OBJECT_PREDICATIVE_CASE } from '../de.consts.js';
import type { Case } from '../de.types.js';
import { mannerPrepCase } from '../mannerPrepCase.js';
import { dePredAdj } from '../dePredAdj.js';
import { genitiveS } from '../genitiveS.js';
import { genitiveShows } from '../genitiveShows.js';
import { germanCompound } from '../germanCompound.js';
import { modifierGenitives } from '../modifierGenitives.js';
import { nounPhrase } from '../nounPhrase.js';
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
// complements with the infinitival copula ("scheint im Markt eine Legende zu sein").
export function complementsParts(
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
  verb: ConceptForms['forms'] = {},
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
      if (type === 'predicative') {
        return coordinate(c.phrase, (np) =>
          np.head.forms['role'] === 'adjective' ? dePredAdj(np.head) : nounPhrase(np, 'nom'),
        );
      }
      // The preposition governs a case, and the case is spelled on each conjunct's own article
      // ("mit dem Messer und dem Stock"), so preposition and determiner are emitted per conjunct.
      return coordinate(c.phrase, (conjunct) => {
      // The essive object complement names a role rather than picking a referent out, so German
      // leaves it article-less whatever determiner was chosen: "als Bedingung", not "als die
      // Bedingung". Its adjectives then decline strong, which `definiteness` below arranges.
      const essive = type === 'objectPredicative' && objectPredication(c) === 'essive';
      const np = essive ? withDefiniteness(conjunct, 'bare') : conjunct;
      // A German object predicative adjective is uninflected, as the subject one is ("streicht
      // die Wand rot", "betrachtet die Wand als rot").
      if (type === 'objectPredicative' && np.head.forms['role'] === 'adjective') {
        return [essive ? 'als' : '', dePredAdj(np.head)].filter(Boolean).join(' ');
      }
      // A hearth noun takes its fixed locative idiom in place of the whole noun phrase — "zu Hause",
      // not "im Zuhause" — so no preposition, case or declension is chosen for it.
      const idiom = type === 'locative' && locativeIdiom(c, np, LOCATIVE_IDIOMS);
      if (idiom) return idiom;
      // A pronoun behind an adposition is the bare preposition + the pronoun, with no article and no
      // declension of its own ("mit ihm", never "mit dem er" — A197 for the comitative and the
      // instrumental, A203 for the other five), as the causal adjunct already spells it in
      // `causePhrase`. German is the language where that is not one form: the preposition rules the
      // case, so the head below is chosen exactly as it always is — from a forms bag with no
      // determiner to fuse with (`tonicHeadForms`) — and `_case` falls out of it alongside, which is
      // what picks the pronoun ("in ihm" dative, "durch ihn" accusative, "wie er" nominative).
      const pronoun = TONIC_COMPLEMENTS.has(type) ? tonicPronoun(np) : undefined;
      if (pronoun && (type === 'instrumental' || type === 'comitative')) return `mit ${pronoun}`;
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
      const detached = !!poss && KEPT_BESIDE_POSSESSIVE.has(ownDeterminer);
      const possessedForms = possessedHeadForms(np, 'bare');
      const nounForms = articledNameForms(np, !!poss && (detached || ownDeterminer === 'all')
        ? { ...possessedForms, definiteness: ownDeterminer }
        : possessedForms);
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
        else if (type === 'instrumental' || type === 'comitative') head = prepDet('mit', f, 'dat', plural);
        // Object complement: the essive "als" takes the case of the object it predicates of — the
        // accusative — and no article at all; the factitive link is the verb's own preposition and
        // governs its own case ("in einen Befehl", "zu einem Befehl"). A verb naming none leaves
        // the bare accusative predicate ("macht das Satzgefüge einen Befehl").
        else if (type === 'objectPredicative') {
          const marker = essive ? 'als' : (c.link ?? '');
          _case = OBJECT_PREDICATIVE_CASE[marker] ?? 'acc';
          head = essive ? 'als' : prepDet(marker, f, _case, plural);
        }
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
        // Terminus. An animate recipient is a bare dative — no preposition, just the dative
        // determiner ("der Katze"), the same case German gives the plain indirect object. An
        // inanimate goal is a destination, not a recipient, so it takes a directional preposition:
        // "in" + the accusative of motion-into ("speichert das Buch in den Behälter"), never the
        // bare dative that would read as *giving the book to the container*. Which preposition is
        // the verb's own: ADD adds a thing TO something, so it says `terminus_prep: 'zu'` and takes
        // the dative ("fügt das Buch zum Behälter hinzu", A143). "in" is the default.
        else if (type === 'terminus') {
          if (f['animate'] === '1') head = prepDet('', f, 'dat', plural);
          else if (verb['terminus_prep']) head = prepDet(verb['terminus_prep'], f, 'dat', plural);
          else { _case = 'acc'; head = prepDet('in', f, 'acc', plural); }
        }
        // Source. "aus" is "out of" an enclosure, right for a house or a continent but not for a
        // person or an animal, which one is not inside: a living source takes "von", fused to "vom"
        // before "dem" (A154). The relativizer stand-in comes through here too ("von dem").
        else /* source */         head = prepDet(f['animate'] === '1' ? 'von' : 'aus', f, 'dat', plural);
      }
      // The pronoun is the whole phrase after the head, declined for the case the head governs. The
      // bare-dative terminus leaves no head at all, and then the pronoun is the phrase ("gibt ihm").
      if (pronoun) {
        const word = tonicPronounDe(np.head.forms, _case);
        return head ? `${head} ${word}` : word;
      }
      // A relativizer stand-in is its preposition and pronoun alone: "in dem", "mit denen", "dem".
      if (definiteness === 'relative') return head;
      // A weak masculine goal/place declines to -(e)n in the oblique ("zum/im/aus dem Jungen");
      // every other noun takes the regular dative-plural -n, and a genitive its -(e)s ("wegen des
      // Hundes").
      const word = _case === 'gen'
        ? genitiveS(compound, _case, f, plural)
        : f['weak'] === '1' ? weakN(compound, _case, plural) : datPluralN(compound, _case, plural);
      const declined = adjPhrase(np, _case, definiteness);
      const adj = declined ? `${declined} ` : '';
      const possessive = poss && !detached
        ? `${possessiveDe(poss, _case, { gender: (f['gender'] ?? 'neut') as 'masc' | 'fem' | 'neut', number: plural ? 'plural' : 'singular' })} `
        : '';
      const vonPhrase = detached && poss ? ` von ${dativePronounDe(poss)}` : '';
      const rest = `${possessive}${adj}${word}${postnominal(f)}${modifierGenitives(np)}${vonPhrase}${possessorText(np)}${subordinateClause(np)}`;
      return head ? `${head} ${rest}` : rest;
      });
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
  // Legende zu sein scheint,".
  const predicative = complements['predicative'];
  const predicate = text && predicative && isSeemingPredicateNoun(predicative, verb) ? `${text} zu sein` : text;
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
