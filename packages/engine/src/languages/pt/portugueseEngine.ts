import type { ConceptForms, LanguageEngine, PronominalPossessor, ResolvedPhrase } from '../../types.js';
import { possessivePt } from '../../possessive.js';
import { COORD_WORDS, PARENTHETICAL_CONNECTORS } from './pt.consts.js';
import { agreeAdj } from './agreeAdj.js';
import { artFor } from './artFor.js';
import { renderClause } from './renderClause.js';

export const portugueseEngine: LanguageEngine = {
  language: 'pt',
  render(phrase: ResolvedPhrase): string {
    const main = renderClause(phrase);
    // Hypothetical conditional: "se <protasis (subjunctive)>, <apodosis (conditional)>".
    const sentence = phrase.condition ? `se ${renderClause(phrase.condition, true)}, ${main}` : main;
    // Coordination: "<first clause>, <conjunction> <second clause>".
    if (!phrase.coordination) return sentence;
    const { conjunction, clause } = phrase.coordination;
    const connector = `${COORD_WORDS[conjunction]}${PARENTHETICAL_CONNECTORS.has(conjunction) ? ',' : ''}`;
    return `${sentence}, ${connector} ${renderClause(clause)}`;
  },
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
  // The possessive alone, for the label on a coreference link. Portuguese agrees it with the
  // possessed head in gender/number, so it is cited on a noun; the definite article the phrase puts
  // before it ("o seu cão") is left off, as `ptPossessiveWord` does for a fused preposition.
  renderPossessive(noun: ConceptForms, possessor: PronominalPossessor): string {
    const f = noun.forms;
    return possessivePt(possessor, {
      gender: (f['gender'] ?? 'masc') as 'masc' | 'fem',
      number: (f['number'] ?? f['count']) === 'plural' ? 'plural' : 'singular',
    });
  },
};
