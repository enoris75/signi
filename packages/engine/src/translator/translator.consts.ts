import { germanEngine } from '../languages/de/index.js';
import { englishEngine } from '../languages/en/index.js';
import { spanishEngine } from '../languages/es/index.js';
import { frenchEngine } from '../languages/fr/index.js';
import { italianEngine } from '../languages/it/index.js';
import { japaneseEngine } from '../languages/ja/index.js';
import { portugueseEngine } from '../languages/pt/index.js';
import type { LanguageEngine } from '../types.js';

export const engines: LanguageEngine[] = [
  englishEngine,
  italianEngine,
  frenchEngine,
  germanEngine,
  spanishEngine,
  japaneseEngine,
  portugueseEngine,
];

/** Determiners that are inherently plural, so they render the plural noun surface. */
export const PLURAL_DETERMINERS = new Set(['some', 'many', 'few', 'all']);

/**
 * Languages whose negative quantifier takes a singular noun whatever number was picked: it "nessuna
 * frase", fr "aucune phrase", es "ninguna frase", pt "nenhuma frase" — never "*aucune phrases". English
 * and German keep the number ("no phrases", "keine Phrasen"); Japanese marks none.
 */
export const NO_TAKES_SINGULAR: ReadonlySet<string> = new Set(['it', 'fr', 'es', 'pt']);

/** The agreement keys a group carries — see ResolvedNounElement.agreement. Nothing renderable. */
export const AGREEMENT_KEYS = ['person', 'number', 'gender'] as const;

/**
 * Languages whose "or" group of mixed persons agrees as the plural of the prevailing person, like
 * "and" — French "toi ou moi, nous mangeons" (Grevisse, *Le Bon Usage*). A group of one person keeps
 * the nearest-conjunct rule ("le chat ou le chien court").
 */
export const OR_RESOLVES_MIXED_PERSONS: ReadonlySet<string> = new Set(['fr']);

/**
 * Languages where OTHER takes the place of the indefinite article rather than following it: Spanish
 * "otro gato" and Portuguese "outro gato", never "*un otro gato". Their indefinite phrase with OTHER
 * resolves bare. (English fuses the two into "another" instead, see en/nounPhrase.)
 */
export const OTHER_REPLACES_INDEFINITE: ReadonlySet<string> = new Set(['es', 'pt']);

/**
 * The verb each language conjugates in place of the lexical one to build a **passive** — the
 * auxiliary the past participle hangs off of. Six of the seven take their copula, *be* / *essere* /
 * *être* / *ser* / *ser*; German takes *werden*, which is the BECOME concept, because *sein* +
 * participle is the stative reading ("die Tür ist geschlossen" — it is shut) and not the event
 * ("die Tür wird geschlossen" — someone is closing it).
 *
 * Japanese is absent on purpose: its passive is morphology on the verb itself (〜れる/られる), so
 * there is no auxiliary to name, and its engine reads the lexeme's own `passive` form instead.
 */
export const PASSIVE_AUXILIARY: Record<string, string> = {
  en: 'BE', it: 'BE', fr: 'BE', es: 'BE', pt: 'BE', de: 'BECOME',
};

/**
 * Languages that can relativise the **agent** of a passive — the gap a relative clause gapped on its
 * subject moves to when it turns passive: "the child by whom the book is written", "il bambino dal
 * quale il libro è scritto", "das Kind, von dem das Buch geschrieben wird".
 *
 * Japanese is absent: its prenominal relative has no relativizer to carry the に, and a passive clause
 * with its に-agent simply missing (本が書かれる子供) no longer says that the head is the one who acts —
 * it reads as a child a book is written *about* or *for*. There the relative stays active.
 */
export const RELATIVIZES_AGENT: ReadonlySet<string> = new Set(['en', 'it', 'fr', 'de', 'es', 'pt']);

/** Verb transitivities that have a patient to promote, and can therefore be passivized. */
export const PASSIVIZABLE: ReadonlySet<string> = new Set(['transitive', 'ditransitive']);
