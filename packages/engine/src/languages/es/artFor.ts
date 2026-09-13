import { defArticle } from './defArticle.js';
import { demonstrative } from './demonstrative.js';
import { indefArticle } from './indefArticle.js';

/**
 * The determiner for a subject/direct-object noun phrase, from its `definiteness`
 * (default 'definite'): the definite/indefinite article, nothing (bare), a demonstrative,
 * or a quantifier agreeing in gender. "todos/todas" carry the definite article;
 * "ningún/ninguna" is singular and drives verb negation ("no") upstream when it is an object.
 */
export function artFor(forms: Record<string, string>, plural = false): string {
  // Most proper names go bare in Spanish ("África"), whatever determiner the user picked. But a
  // class of them is inherently articled — "la Antártida", "los Estados Unidos" — and that is a
  // property of the name, not a choice, so the lexicon marks it and the definite article wins.
  if (forms['proper'] === '1') {
    return forms['takes_article'] === '1' ? defArticle(forms, plural) : '';
  }
  const definiteness = forms['definiteness'] ?? 'definite';
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  // Mass nouns ("agua") stay singular: "algo de agua", "mucha/poca agua", "toda el agua".
  if (forms['uncountable'] === '1') {
    switch (definiteness) {
      case 'bare':       return '';
      case 'indefinite': return '';                 // no "un agua" — bare
      case 'this':       return demonstrative(false, forms, false);
      case 'that':       return demonstrative(true, forms, false);
      case 'some':       return 'algo de';
      case 'many':       return fem ? 'mucha' : 'mucho';
      case 'few':        return fem ? 'poca' : 'poco';
      case 'all':        return `${fem ? 'toda' : 'todo'} ${defArticle(forms, false)}`;
      case 'no':         return fem ? 'ninguna' : 'ningún';
      default:           return defArticle(forms, false);
    }
  }
  switch (definiteness) {
    case 'bare':       return '';
    case 'indefinite': return indefArticle(forms, plural);
    case 'this':       return demonstrative(false, forms, plural);
    case 'that':       return demonstrative(true, forms, plural);
    case 'some':       return fem ? 'algunas' : 'algunos';
    case 'many':       return fem ? 'muchas' : 'muchos';
    case 'few':        return fem ? 'pocas' : 'pocos';
    case 'all':        return `${fem ? 'todas' : 'todos'} ${defArticle(forms, true)}`;
    case 'no':         return fem ? 'ninguna' : 'ningún';
    default:           return defArticle(forms, plural);
  }
}
