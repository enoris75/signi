import { COMPLEMENT_RENDER_ORDER, DEFAULT_LOCATIVE_SPECIFIER, DEFAULT_ROUTE_SPECIFIER, type ComplementType } from '@signi/shared';
import { causeSentiment, isPronominalPossessor, isSeemingPredicateNoun, locativeIdiom, pathSpecifier, possessedHeadForms, type ConceptForms, type ResolvedComplement } from '../../../types.js';
import { possessiveDe } from '../../../possessive.js';
import { adjPhrase } from '../adjPhrase.js';
import { coordinate } from '../coordinate.js';
import { datPluralN } from '../datPluralN.js';
import { LOCATIVE_IDIOMS } from '../de.consts.js';
import { mannerPrepCase } from '../mannerPrepCase.js';
import { dePredAdj } from '../dePredAdj.js';
import { germanCompound } from '../germanCompound.js';
import { modifierGenitives } from '../modifierGenitives.js';
import { nounPhrase } from '../nounPhrase.js';
import { possessorText } from '../possessorText.js';
import { prepDet } from '../prepDet.js';
import { spatialCase } from '../spatialCase.js';
import { spatialHead } from '../spatialHead.js';
import { subordinateClause } from '../subordinateClause.js';
import { weakN } from '../weakN.js';
import { causePhrase } from './causePhrase.js';
import { instrumentActionPhrase } from './instrumentActionPhrase.js';

// `verb` is the governing verb's forms: a predicate noun under a seeming verb reads it to close the
// complements with the infinitival copula ("scheint eine Legende zu sein").
export function complementsPhrase(
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
  verb: ConceptForms['forms'] = {},
): string {
  if (!complements) return '';
  const text = COMPLEMENT_RENDER_ORDER
    .map((type) => {
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
      return coordinate(c.phrase, (np) => {
      // A hearth noun takes its fixed locative idiom in place of the whole noun phrase — "zu Hause",
      // not "im Zuhause" — so no preposition, case or declension is chosen for it.
      const idiom = type === 'locative' && locativeIdiom(c, np, LOCATIVE_IDIOMS);
      if (idiom) return idiom;
      // A possessive is an ein-word in place of the article, so the head is the preposition alone and
      // the adjectives decline mixed ("in meinem kleinen Haus", "deinem Hund").
      const poss = np.possessor && isPronominalPossessor(np.possessor) ? np.possessor : undefined;
      const f = possessedHeadForms(np, 'bare');
      const plural = (f['number'] ?? f['count']) === 'plural';
      const definiteness = poss ? 'indefinite' : (f['definiteness'] ?? 'definite');
      const compound = germanCompound(np, plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? ''));
      // route/locative → spatial preposition (+ its case); direction/source → two-way preps +
      // dative. The in+dem=im / zu+dem=zum / zu+der=zur fusions fire only for a definite
      // article; any other determiner (einem, keiner, vielen, bare) stays uncontracted.
      let head: string;
      let _case: 'nom' | 'acc' | 'dat';
      if (type === 'route' || type === 'locative') {
        // Both read their relation off the same specifier set; only the default differs, and the
        // case falls out of the preposition ("im Markt", "unter dem Markt", "um den Markt").
        const spec = pathSpecifier(c, type === 'locative' ? DEFAULT_LOCATIVE_SPECIFIER : DEFAULT_ROUTE_SPECIFIER);
        _case = spatialCase(spec, type);
        head = spatialHead(spec, f, plural, type);
      } else {
        _case = 'dat';
        // Cause: "wegen" governs the genitive formally, but the dative ("wegen dem Hund") is
        // standard in speech and reuses the dative determiners; positive credits with "dank". The
        // negative sentiment and a pronoun never reach here — they took `causePhrase` above.
        if (type === 'direction') head = prepDet('zu', f, 'dat', plural);
        // Instrumental: "mit" + dative ("mit dem Messer"). The mit+dem → "beim"-style fusion
        // doesn't exist for "mit", so prepDet leaves it uncontracted.
        else if (type === 'instrumental') head = prepDet('mit', f, 'dat', plural);
        // Manner: similative "wie" + nominative ("wie der Wind" — the default); means/measure
        // "mit" + dative ("mit der Geschwindigkeit des Lichts", "mit Sorgfalt"); mode "auf" +
        // accusative ("auf eine gute Weise"); a temporal noun "zu" + dative ("zu allen Zeiten").
        // Read off the head noun (`mannerPrepCase`).
        else if (type === 'manner') {
          const [prep, mannerCase] = mannerPrepCase(f);
          _case = mannerCase;
          head = prepDet(prep, f, mannerCase, plural);
        }
        else if (type === 'cause') head = prepDet(causeSentiment(c) === 'positive' ? 'dank' : 'wegen', f, 'dat', plural);
        // Terminus. An animate recipient is a bare dative — no preposition, just the dative
        // determiner ("der Katze"), the same case German gives the plain indirect object. An
        // inanimate goal is a destination, not a recipient, so it takes a directional preposition:
        // "in" + the accusative of motion-into ("speichert das Buch in den Behälter"), never the
        // bare dative that would read as *giving the book to the container*. (Which preposition —
        // in / an / zu — is verb-dependent; "in" is the app's into-a-container default.)
        else if (type === 'terminus') {
          if (f['animate'] === '1') head = prepDet('', f, 'dat', plural);
          else { _case = 'acc'; head = prepDet('in', f, 'acc', plural); }
        }
        else /* source */         head = prepDet('aus', f, 'dat', plural);
      }
      // A relativizer stand-in is its preposition and pronoun alone: "in dem", "mit denen", "dem".
      if (definiteness === 'relative') return head;
      // A weak masculine goal/place declines to -(e)n in the oblique ("zum/im/aus dem Jungen");
      // every other noun takes the regular dative-plural -n.
      const word = f['weak'] === '1' ? weakN(compound, _case, plural) : datPluralN(compound, _case, plural);
      const declined = adjPhrase(np, _case, definiteness);
      const adj = declined ? `${declined} ` : '';
      const possessive = poss
        ? `${possessiveDe(poss, _case, { gender: (f['gender'] ?? 'neut') as 'masc' | 'fem' | 'neut', number: plural ? 'plural' : 'singular' })} `
        : '';
      const rest = `${possessive}${adj}${word}${modifierGenitives(np)}${possessorText(np)}${subordinateClause(np)}`;
      return head ? `${head} ${rest}` : rest;
      });
    })
    .filter(Boolean)
    .join(' ');
  // "scheinen" takes no predicate nominative at all — "*scheint eine Legende" — only the infinitive
  // "zu sein" (a predicate adjective alone stays bare: "scheint müde"). The infinitive is
  // non-finite, so it closes the complements and sits against the verb cluster, whatever the clause
  // order: "scheint eine Legende im Markt zu sein", "eine Legende zu sein scheinen wird", ", die eine
  // Legende zu sein scheint,".
  const predicative = complements['predicative'];
  return predicative && isSeemingPredicateNoun(predicative, verb) ? `${text} zu sein` : text;
}
