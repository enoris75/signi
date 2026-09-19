import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { UiStringKey } from "@signi/shared";
import { fetchUiStrings } from "../api.ts";
import { useUiLanguage } from "../i18n/LanguageContext.tsx";
import { COMMANDS } from "./language/commands.ts";

/**
 * The commands' names in the interface language — each command's description as the catalogue
 * renders it there (`/pl` is *plurale* in Italian, `/subj` *soggetto*). Completion finds a command by
 * them; choosing one writes its English name, so a line reads the same whatever language it was typed
 * in (decision 3). English has no aliases of this kind: its names and aliases are English already.
 */
export function useLocalAliases(): ReadonlyMap<string, readonly string[]> {
  const { uiLanguage } = useUiLanguage();
  const { data: strings } = useQuery({ queryKey: ["ui-strings"], queryFn: fetchUiStrings, staleTime: Infinity });
  return useMemo(() => {
    const map = new Map<string, string[]>();
    if (uiLanguage === "en" || !strings) return map;
    for (const c of COMMANDS) {
      const word = c.descriptionKey && strings[c.descriptionKey as UiStringKey]?.[uiLanguage];
      if (word) map.set(c.name, [word.trim().toLowerCase().replace(/[.。]$/, "")]);
    }
    return map;
  }, [uiLanguage, strings]);
}
