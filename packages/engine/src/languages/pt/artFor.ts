import { defArticle } from './defArticle.js';
import { demonstrative } from './demonstrative.js';
import { indefArticle } from './indefArticle.js';
import { isBareName } from './isBareName.js';

/**
 * The determiner for a subject/direct-object noun phrase, from its `definiteness`
 * (default 'definite'): the definite/indefinite article, nothing (bare), a demonstrative,
 * or a quantifier agreeing in gender. "todos/todas" carry the definite article;
 * "nenhum/nenhuma" is singular and drives verb negation ("não") upstream when it is an object.
 */
export function artFor(forms: Record<string, string>, plural = false): string {
  // A proper noun (a África) always takes the definite article in Portuguese, whatever
  // determiner the user picked; it is a property of the name, not a choice. A few names are bare
  // instead ("Portugal", never "o Portugal"), which their forms mark with `takes_article: '0'`:
  // the inverse of the de/es flag, whose proper nouns go bare by default (localization B36).
  if (forms['proper'] === '1') return isBareName(forms) ? '' : defArticle(forms, plural);
  const definiteness = forms['definiteness'] ?? 'definite';
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  // Mass nouns ("água") stay singular: "um pouco de água", "muita/pouca água", "toda a água".
  if (forms['uncountable'] === '1') {
    switch (definiteness) {
      case 'bare':       return '';
      case 'indefinite': return '';                 // no "uma água" — bare
      case 'this':       return demonstrative(false, forms, false);
      case 'that':       return demonstrative(true, forms, false);
      case 'some':       return 'um pouco de';
      case 'many':       return fem ? 'muita' : 'muito';
      case 'few':        return fem ? 'pouca' : 'pouco';
      case 'all':        return `${fem ? 'toda' : 'todo'} ${defArticle(forms, false)}`;
      case 'no':         return fem ? 'nenhuma' : 'nenhum';
      default:           return defArticle(forms, false);
    }
  }
  switch (definiteness) {
    case 'bare':       return '';
    case 'indefinite': return indefArticle(forms, plural);
    case 'this':       return demonstrative(false, forms, plural);
    case 'that':       return demonstrative(true, forms, plural);
    case 'some':       return fem ? 'algumas' : 'alguns';
    case 'many':       return fem ? 'muitas' : 'muitos';
    case 'few':        return fem ? 'poucas' : 'poucos';
    case 'all':        return `${fem ? 'todas' : 'todos'} ${defArticle(forms, true)}`;
    case 'no':         return fem ? 'nenhuma' : 'nenhum';
    default:           return defArticle(forms, plural);
  }
}
