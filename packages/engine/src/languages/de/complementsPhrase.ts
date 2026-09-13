import { COMPLEMENT_RENDER_ORDER, DEFAULT_LOCATIVE_SPECIFIER, DEFAULT_ROUTE_SPECIFIER, type ComplementType } from '@signi/shared';
import { abstractionLevel, actionInfinitive, causeSentiment, isSeemingPredicateNoun, locativeIdiom, mannerRelation, pathSpecifier, type ConceptForms, type ResolvedComplement } from '../../types.js';
import { adjPhrase } from './adjPhrase.js';
import { coordinate } from './coordinate.js';
import { datPluralN } from './datPluralN.js';
import { declineAdj } from './declineAdj.js';
import { LOCATIVE_IDIOMS } from './de.consts.js';
import { dePredAdj } from './dePredAdj.js';
import { germanCompound } from './germanCompound.js';
import { modifierGenitives } from './modifierGenitives.js';
import { nounPhrase } from './nounPhrase.js';
import { possessorText } from './possessorText.js';
import { prepDet } from './prepDet.js';
import { spatialCase } from './spatialCase.js';
import { spatialHead } from './spatialHead.js';
import { subordinateClause } from './subordinateClause.js';
import { weakN } from './weakN.js';

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
      // A pronoun cause ("wegen mir/ihr/ihnen") uses the dative form with no article — the
      // colloquial dative that "wegen" already takes. Positive credits with "dank" ("dank
      // dir"); negative lays blame with the possessive periphrasis "durch <possessive> Schuld"
      // ("durch meine/deine/seine Schuld"), the possessive agreeing with feminine "Schuld".
      // Only cause takes a pronoun.
      //
      // A group holding a pronoun renders every conjunct in its own form, never the first one's:
      // the preposition once, then a pronoun's dative or a noun's dative phrase ("wegen dem Mann und
      // dir"). In the negative a group of pronouns shares one "Schuld" ("durch meine und deine
      // Schuld"); a group mixing in a noun gives each conjunct its own periphrasis.
      if (type === 'cause' && c.phrase.conjuncts.some((np) => np.head.forms['person'])) {
        const sent = causeSentiment(c);
        const possessive = (pf: Record<string, string>) => {
          const plural = pf['number'] === 'plural';
          return pf['person'] === '1' ? (plural ? 'unsere' : 'meine') :
            pf['person'] === '2' ? (plural ? 'eure' : 'deine') :
            plural ? 'ihre' : (pf['gender'] === 'fem' ? 'ihre' : 'seine');
        };
        if (sent === 'negative') {
          if (c.phrase.conjuncts.every((np) => np.head.forms['person'])) {
            return `durch ${coordinate(c.phrase, (np) => possessive(np.head.forms))} Schuld`;
          }
          return coordinate(c.phrase, (np) => np.head.forms['person']
            ? `durch ${possessive(np.head.forms)} Schuld`
            : `durch die Schuld ${nounPhrase(np, 'gen')}`);
        }
        const prep = sent === 'positive' ? 'dank' : 'wegen';
        const conjuncts = coordinate(c.phrase, (np) => np.head.forms['person']
          ? (np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? '')
          : nounPhrase(np, 'dat'));
        return `${prep} ${conjuncts}`;
      }
      // A negative noun cause takes the genitive periphrasis "durch die Schuld" (through the
      // fault) + the cause in the genitive: "durch die Schuld des Hundes". "durch" governs the
      // accusative of the fixed "die Schuld"; the blamed party hangs off it as a genitive. Emitted
      // once before the group ("durch die Schuld des Hundes und der Katze").
      if (type === 'cause' && causeSentiment(c) === 'negative') {
        return `durch die Schuld ${coordinate(c.phrase, (np) => nounPhrase(np, 'gen'))}`;
      }
      // An instrument presented as an action. German has no gerund, so the two levels part ways
      // completely. The process level is a subordinate means clause — "indem man ein Wort wählt",
      // with the impersonal "man" and the verb pushed to the end — whose noun phrase is a plain
      // direct object, hence *accusative*, not the dative "mit" would otherwise give it.
      //
      // The concept level nominalises the infinitive instead: German turns any infinitive into a
      // neuter noun just by capitalising it ("wählen" → "das Wählen"), which "mit" then puts in
      // the dative, and — the noun being a noun — its object arrives as an attached *genitive*:
      // "mit dem Wählen eines Wortes". The action's adverb comes along as an attributive
      // adjective on that noun ("mit dem schnellen Wählen"), which is what German adverbs are.
      if (type === 'instrumental' && c.action) {
        const level = abstractionLevel(c);
        if (level !== 'object') {
          const adverb = c.action.modifier?.forms['base'] ?? '';
          if (level === 'process') {
            const object = coordinate(c.phrase, (np) => nounPhrase(np, 'acc'));
            const finite3sg = c.action.verb.forms['3sg_present'] ?? c.action.verb.forms['base'] ?? '';
            // A subordinate clause is set off by a comma ("beginnt, indem man ein Wort wählt").
            // It is emitted as a leading comma and pulled back onto the previous word when the
            // clause is joined (see `punctuate`), since the joiner knows nothing of punctuation.
            return [', indem man', object, adverb, finite3sg].filter(Boolean).join(' ');
          }
          const object = coordinate(c.phrase, (np) => nounPhrase(np, 'gen'));
          const infinitive = actionInfinitive(c.action);
          const act = infinitive.charAt(0).toUpperCase() + infinitive.slice(1);
          // Weak declension: the adjective sits behind the definite "dem" (dative neuter → -en).
          const attr = adverb ? declineAdj(adverb, 'dat', 'neut', false, 'definite') : '';
          return ['mit dem', attr, act, object].filter(Boolean).join(' ');
        }
      }
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
      const f = np.head.forms;
      const plural = (f['number'] ?? f['count']) === 'plural';
      const definiteness = f['definiteness'] ?? 'definite';
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
        _case = spatialCase(spec);
        head = spatialHead(spec, f, plural);
      } else {
        _case = 'dat';
        // Cause: "wegen" governs the genitive formally, but the dative ("wegen dem Hund") is
        // standard in speech and reuses the dative determiners; positive credits with "dank". The
        // negative sentiment never reaches here — it took the "durch die Schuld" genitive path above.
        if (type === 'direction') head = prepDet('zu', f, 'dat', plural);
        // Instrumental: "mit" + dative ("mit dem Messer"). The mit+dem → "beim"-style fusion
        // doesn't exist for "mit", so prepDet leaves it uncontracted.
        else if (type === 'instrumental') head = prepDet('mit', f, 'dat', plural);
        // Manner: similative "wie" + nominative ("wie der Wind" — the default); means/measure
        // "mit" + dative ("mit der Geschwindigkeit des Lichts", "mit Sorgfalt"); mode "auf" +
        // accusative ("auf eine gute Weise"). Read off the head noun.
        else if (type === 'manner') {
          const rel = mannerRelation(f);
          if (rel === 'mode') { _case = 'acc'; head = prepDet('auf', f, 'acc', plural); }
          else if (rel === 'means' || rel === 'measure') head = prepDet('mit', f, 'dat', plural);
          else { _case = 'nom'; head = prepDet('wie', f, 'nom', plural); }
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
      // A weak masculine goal/place declines to -(e)n in the oblique ("zum/im/aus dem Jungen");
      // every other noun takes the regular dative-plural -n.
      const word = f['weak'] === '1' ? weakN(compound, _case, plural) : datPluralN(compound, _case, plural);
      const declined = adjPhrase(np, _case, definiteness);
      const adj = declined ? `${declined} ` : '';
      const rest = `${adj}${word}${modifierGenitives(np)}${possessorText(np)}${subordinateClause(np)}`;
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
