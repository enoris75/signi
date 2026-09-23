import type { CoordConjunction, Degree, Specifier } from '@signi/shared';
import type { ConceptForms, LanguageEngine, PronominalPossessor, ResolvedPhrase } from '../../types.js';
import { possessiveEs } from '../../possessive.js';
import { COORD_WORDS, ES_DEGREE, PARENTHETICAL_CONNECTORS } from './es.consts.js';
import { ES_TEMPORAL } from './es.consts.js';
import { prepDet } from './prepDet.js';
import { agreeAdj } from './agreeAdj.js';
import { artFor } from './artFor.js';
import { aDet } from './aDet.js';
import { deDet } from './deDet.js';
import { renderClause } from './renderClause.js';
import { spatialHead } from './spatialHead.js';
import type { Subordinator } from '@signi/shared';
import { SUBORDINATORS } from './es.consts.js';

export const spanishEngine: LanguageEngine = {
  language: 'es',
  // Spanish opens a question as well as closing it ("¿el gato come?"). The statement keeps its order,
  // as a yes/no question may.
  questionOpener: '¿',
  render(phrase: ResolvedPhrase): string {
    const main = renderClause(phrase);
    // Hypothetical conditional: "si <protasis (subjunctive)>, <apodosis (conditional)>".
    const sentence = phrase.condition ? `si ${renderClause(phrase.condition)}, ${main}` : main;
    // Coordination: "<first clause>, <conjunction> <second clause>".
    if (!phrase.coordination) return sentence;
    const { conjunction, clause } = phrase.coordination;
    const connector = `${COORD_WORDS[conjunction]}${PARENTHETICAL_CONNECTORS.has(conjunction) ? ',' : ''}`;
    return `${sentence}, ${connector} ${renderClause(clause)}`;
  },
  // No apocope here: the word stands alone, with no masculine noun behind it to shorten before.
  renderWord(word: ConceptForms): string {
    const f = word.forms;
    const base = f['base'] ?? '';
    if (f['role'] !== 'adjective') return base;
    return agreeAdj(base, f['gender'] ?? 'masc', f['number'] === 'plural');
  },
  // The determiner alone, for the menu that picks one.
  renderDeterminer(noun: ConceptForms): string {
    const f = noun.forms;
    return artFor(f, (f['number'] ?? f['count']) === 'plural');
  },
  // The possessive alone, for the label on a coreference link. Spanish agrees mi/tu/su with the
  // possessed head in number (nuestro/vuestro also in gender), so it is cited on a noun.
  renderPossessive(noun: ConceptForms, possessor: PronominalPossessor): string {
    const f = noun.forms;
    return possessiveEs(possessor, {
      gender: (f['gender'] ?? 'masc') as 'masc' | 'fem',
      number: (f['number'] ?? f['count']) === 'plural' ? 'plural' : 'singular',
    });
  },
  // The word that opens a subordinate clause, for the builder's subordinate-clause menu (P09-E12
  // D9): `that`, the object clause's complementizer, or a subordinating conjunction. Spanish cites each as it opens its clause ("después de que").
  renderSubordinator(sub: Subordinator): string {
    return sub === 'that' ? 'que' : SUBORDINATORS[sub];
  },
  renderConjunction(conjunction: CoordConjunction): string {
    return COORD_WORDS[conjunction];
  },
  // The adposition alone: Spanish contracts only de/a + "el" ("debajo del árbol"), so a bare noun
  // leaves the plain locution ("debajo de", "alrededor de", "a causa de").
  renderSpecifier(noun: ConceptForms, specifier: Specifier): string {
    const f = noun.forms;
    if (specifier.kind === 'sentiment') {
      return specifier.value === 'positive' ? `gracias ${aDet(f, false)}`
        : specifier.value === 'negative' ? `por culpa ${deDet(f, false)}`
        : `a causa ${deDet(f, false)}`;
    }
    // The temporal's relation (P09-E12b), headed as `complementsPhrase` heads it: "en", "hace",
    // "hasta", "después de", "antes de", "durante".
    if (specifier.kind === 'temporal') {
      if (specifier.value === 'at') return prepDet('en', f, false);
      const { word, de } = ES_TEMPORAL[specifier.value];
      return de ? `${word} ${deDet(f, false)}` : prepDet(word, f, false);
    }
    return specifier.kind === 'path' ? spatialHead(specifier.value, false, f) : '';
  },
  // Periphrastic throughout ("más", "el más", "menos", "igualmente"), so the adjective goes unread.
  renderDegree(_adjective: ConceptForms, degree: Degree): string {
    // The relative superlative is the comparative under the definite article — the article
    // belongs to the noun phrase, not to the degree, so a label that showed the adverb alone
    // would say "más" for both degrees. Cited masculine singular, the
    // gender a citation form is given in (as `renderPossessive` defaults).
    const word = ES_DEGREE[degree];
    return word && (degree === 'most' || degree === 'least') ? `el ${word}` : word;
  },
};
