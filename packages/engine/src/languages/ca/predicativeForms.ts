/**
 * A predicate nominal's forms, with an indefinite *plural* flattened to bare: "es tornen gats", never
 * "*es tornen uns gats" ("uns" before a predicate noun is evaluative). The singular keeps "un / una".
 * The flattened head is marked `indefinite_dropped`, so a pronominal possessive detaches behind the
 * noun as beside "un": "són amics meus" (A330, `keptBesidePossessive`).
 */
export function predicativeForms(forms: Record<string, string>): Record<string, string> {
  const plural = (forms['number'] ?? forms['count'] ?? 'singular') === 'plural';
  if (!plural || forms['definiteness'] !== 'indefinite') return forms;
  return { ...forms, definiteness: 'bare', indefinite_dropped: '1' };
}
