import { useQueries } from "@tanstack/react-query";
import type { PhrasePlan, PronominalPossessor } from "@signi/shared";
import { fetchTranslation } from "../api.ts";
import type { LinkClause } from "../components/PhraseBuilder/functions/subjectLink.ts";
import { useUiLanguage } from "./LanguageContext.tsx";

/**
 * One noun phrase to render: the noun possessed, and the antecedent the possessive corefers with —
 * or, for a possessor that is the link to its clause's subject (P11-E7), the clause it is bound in.
 */
export interface PossessiveRequest {
  concept: string;
  features: PronominalPossessor;
  clause?: LinkClause;
}

/** The lookup `usePossessivePhrases` returns; undefined until the render comes back. */
export type PossessivePhrase = (
  concept: string | undefined,
  features: PronominalPossessor | undefined,
  clause?: LinkClause,
) => string | undefined;

const keyOf = (concept: string, f: PronominalPossessor, clause?: LinkClause) =>
  clause ? `${concept}:link:${JSON.stringify(clause)}` : `${concept}:${f.person}${f.number}${f.gender ?? ""}`;

/**
 * The **possessed noun phrase** a coreference link renders — "his horse", fr *son cheval*,
 * de *sein Pferd* — for the chip the canvas draws on the link and for the possessor control's
 * tooltip.
 *
 * It is rendered **on request** rather than read from the UI-string catalog, which is what C16 was
 * blocked on. A catalog entry renders once at boot with no arguments, and the bare possessive is
 * not a word a catalog can hold: English, German and Japanese spell it from the antecedent alone
 * (his / sein / 彼の), but the Romance languages *also* agree it with the noun possessed — "il
 * **suo** libro" but "la **sua** casa" — and which gender that noun has is a per-language lexical
 * fact about a noun the user picks at run time. Rendering the whole phrase sidesteps the agreement
 * by letting the engine do it, and keeps what the chip is for: showing what the link will say.
 *
 * A link to the subject (P11-E7 D5) cannot be said as a bare noun phrase — it would stand in the
 * subject it points at — so it is rendered **in its clause**: the possessed noun as the object of
 * the period's subject, and `/api/translate` hands back that phrase alone, bound. That is what makes
 * Japanese say 自分の本 on the chip as the sentence does, and "their" for a coordinated subject.
 *
 * One `/api/translate` call per distinct request, cached forever — the render depends only on the
 * plan and the lexicon, and the lexicon does not move while the app is open. Until it answers the
 * caller falls back to the catalog's bare `pronoun.possessive.*`, which is right in three of the
 * seven languages and never blank.
 */
export function usePossessivePhrases(requests: readonly PossessiveRequest[]): PossessivePhrase {
  const { uiLanguage } = useUiLanguage();
  // Distinct pairs only: two nouns pointing at the same antecedent share a render, and a rerender
  // that reorders them must not refetch.
  const unique = [...new Map(requests.map((r) => [keyOf(r.concept, r.features, r.clause), r])).entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

  const results = useQueries({
    queries: unique.map(([key, { concept, features, clause }]) => ({
      queryKey: ["possessive-phrase", key],
      // A bare noun phrase, no verb: the possessive is the whole point, and each engine supplies
      // the article its language puts in front of one ("il suo libro", "o seu livro"). A link is the
      // object of its clause, and comes back as that phrase alone.
      queryFn: () =>
        clause
          ? fetchTranslation(
              { ...clause, directObject: { concept, possessor: { kind: "coreferent", slot: "subject" } } } as PhrasePlan,
              "directObject",
            )
          : fetchTranslation({ subject: { concept, possessor: features } }),
      staleTime: Infinity,
    })),
  });

  const byKey = new Map<string, string>();
  unique.forEach(([key], i) => {
    const text = results[i]?.data?.find((tr) => tr.language === uiLanguage)?.text;
    // A noun phrase is a fragment, so the full stop the engine ends a period with comes off —
    // the same trim the definition and UI-string renderers make.
    if (text) byKey.set(key, text.replace(/[.。]\s*$/, ""));
  });

  return (concept, features, clause) =>
    concept && features ? byKey.get(keyOf(concept, features, clause)) : undefined;
}
