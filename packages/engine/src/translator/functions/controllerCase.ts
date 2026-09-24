import type { ResolvedVerbPhrase } from '../../types.js';

/** The preposition a Romance dative takes: *al gatto*, *au chat*, *al gato*, *ao gato*. */
const ROMANCE_DATIVE: Record<string, string> = { it: 'a', fr: 'à', es: 'a', pt: 'a' };

/**
 * The verb phrase of a clause whose infinitive complement its **direct object** controls (see
 * InfinitiveControl), with that controller put in the case the governing verb's lexeme names for it
 * (P09-E43). *Allow*, *tell* and their kin take the one they let or tell in the **dative**: it
 * "permette **al** gatto di correre", fr "permet **au** chat de courir", es "permite **al** gato
 * correr", pt "permite **ao** gato correr" — the lexeme says `object_case: 'dat'` (C35's key), and in
 * the Romance languages it becomes the dative `object_prep` their engines already render, with the
 * article contraction and, in Italian and French, the dative clitic ("gli permette", "lui permet").
 * Without an infinitive the same verb keeps a plain object (*permette il cibo*), so the Romance
 * engines read the key only here.
 *
 * German reads `object_case` wherever the object is declined (*hilft dem Kater*, C35), which is
 * wrong for a verb whose object is dative only as the controller: *erlaubt das Essen* but *erlaubt
 * dem Kater zu laufen*. Such a lexeme names `controller_case: 'dat'`, which becomes its
 * `object_case` here. Japanese reads `object_case` itself, marking the controller に in place of が
 * (猫に走ることを許す). Unchanged otherwise, and wherever the lexeme already names a preposition.
 */
export function controllerCase(
  verbPhrase: ResolvedVerbPhrase | undefined,
  language: string,
  objectControlled: boolean,
): ResolvedVerbPhrase | undefined {
  if (!verbPhrase || !objectControlled) return verbPhrase;
  const forms = verbPhrase.verb.forms;
  const extra: Record<string, string> | undefined = language === 'de'
    ? (forms['controller_case'] === 'dat' ? { object_case: 'dat' } : undefined)
    : ROMANCE_DATIVE[language] && forms['object_case'] === 'dat' && !forms['object_prep']
      ? { object_prep: ROMANCE_DATIVE[language]! }
      : undefined;
  return extra ? { ...verbPhrase, verb: { ...verbPhrase.verb, forms: { ...forms, ...extra } } } : verbPhrase;
}
