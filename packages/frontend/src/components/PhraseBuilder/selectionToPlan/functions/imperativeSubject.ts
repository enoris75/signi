import type { NounPhrase } from "@signi/shared";
import type { PhraseSelection } from "../../interfaces.ts";

// The pronoun (concept + number) an imperative addressee maps to. The engines drop the subject
// but read its person/number to pick the imperative form: tu (2sg) / "let's" (1pl) / plural (2pl).
export function imperativeSubject(person: PhraseSelection["imperativePerson"]): NounPhrase {
  switch (person) {
    case "1pl": return { concept: "FIRST_PERSON", number: "plural" };   // "let's …"
    case "2pl": return { concept: "SECOND_PERSON", number: "plural" };
    default:    return { concept: "SECOND_PERSON", number: "singular" }; // 2sg (default)
  }
}
