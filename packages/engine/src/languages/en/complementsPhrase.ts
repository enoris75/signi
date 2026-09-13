import { COMPLEMENT_RENDER_ORDER, DEFAULT_LOCATIVE_SPECIFIER, type ComplementType } from '@signi/shared';
import { abstractionLevel, actionGerund, causeSentiment, firstConjunct, locativeIdiom, mannerRelation, pathSpecifier, type ResolvedComplement } from '../../types.js';
import { CAUSE_PREP, LOCATIVE_IDIOMS, MANNER_PREP, PATH_PREP, PREP } from './en.consts.js';
import { coordinate } from './coordinate.js';
import { enAdj } from './enAdj.js';
import { npText } from './npText.js';

export function complementsPhrase(complements?: Partial<Record<ComplementType, ResolvedComplement>>): string {
  if (!complements) return '';
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      // What *kind* of complement this is (a pronoun? an adjective?) is settled by its first
      // conjunct — a coordination never mixes a pronoun with a noun in practice — but the
      // surface is rendered from every conjunct.
      const f = firstConjunct(c.phrase).head.forms;
      // A pronoun complement ("because of him/her/them") takes the oblique form with no
      // article — only the causal adjunct accepts a pronoun in the UI today. The sentiment
      // picks the connector: positive "thanks to", negative "through the fault of", neutral
      // "because of" ("thanks to her", "through the fault of them", "because of him").
      if (type === 'cause' && f['person']) {
        const prep = CAUSE_PREP[causeSentiment(c)];
        const pronouns = coordinate(c.phrase, (np) => np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? '');
        return `${prep} ${pronouns}`;
      }
      // An instrument presented as an action rather than a thing: "by choosing a word"
      // (process) / "with the choosing of a word" (concept). Both take the gerund — English
      // nominalises with the same -ing form — but the concept level makes that gerund a *noun*:
      // it takes the definite article and reaches its object through "of", where the process
      // level keeps the verb's own direct object.
      if (type === 'instrumental' && c.action) {
        const level = abstractionLevel(c);
        if (level !== 'object') {
          const object = coordinate(c.phrase, npText);
          const adverb = c.action.modifier?.forms['base'] ?? '';
          const words =
            level === 'process'
              ? ['by', actionGerund(c.action), object]
              : ['with the', actionGerund(c.action), 'of', object];
          return [...words, adverb].filter(Boolean).join(' ');
        }
      }
      // Subject complement: a predicate adjective takes no article and doesn't agree, but
      // carries its own degree ("seems happier"); a predicate noun keeps its own article,
      // with no preposition ("becomes a legend"). Coordinated conjuncts are rendered one by
      // one, so a group may mix the two ("seems a legend and happy" is odd, but "seems happy
      // or tired" and "becomes a legend and an icon" both fall out of the same map).
      if (type === 'predicative') {
        return coordinate(c.phrase, (np) =>
          np.head.forms['role'] === 'adjective' ? enAdj(np.head) : npText(np),
        );
      }
      // The preposition is emitted once, before the whole group: "with the cat and the dog".
      const prep = type === 'route' ? PATH_PREP[pathSpecifier(c)]
        : type === 'locative' ? PATH_PREP[pathSpecifier(c, DEFAULT_LOCATIVE_SPECIFIER)]
        : type === 'cause' ? CAUSE_PREP[causeSentiment(c)]
        : type === 'manner' ? MANNER_PREP[mannerRelation(firstConjunct(c.phrase).head.forms)]
        : PREP[type];
      // A hearth noun takes its fixed locative idiom in place of preposition + noun phrase ("at
      // home", not "in the home"). The idiom carries its own preposition, so a group holding one
      // gives every conjunct its own instead of sharing it: "at home and in the market".
      if (type === 'locative' && c.phrase.conjuncts.some((np) => locativeIdiom(c, np, LOCATIVE_IDIOMS))) {
        return coordinate(c.phrase, (np) => locativeIdiom(c, np, LOCATIVE_IDIOMS) ?? `${prep} ${npText(np)}`);
      }
      return `${prep} ${coordinate(c.phrase, npText)}`;
    })
    .filter(Boolean)
    .join(' ');
}
