import type { ConceptForms, LanguageEngine, PronominalPossessor, ResolvedPhrase } from '../../types.js';
import { possessiveEs } from '../../possessive.js';
import { COORD_WORDS, PARENTHETICAL_CONNECTORS } from './es.consts.js';
import { agreeAdj } from './agreeAdj.js';
import { artFor } from './artFor.js';
import { renderClause } from './renderClause.js';

export const spanishEngine: LanguageEngine = {
  language: 'es',
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
};
