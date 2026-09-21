import { useUiLanguage } from "../i18n/LanguageContext.tsx";
import { useUiString } from "../i18n/useUiString.ts";
import { sayDiagnostic, type Coded } from "./language/diagnostics.ts";

/**
 * A diagnostic as the prompt and the transcript say it, in the interface language: its sentences from
 * the catalogue, each with its value after a colon, joined by the language's full stop (see
 * diagnostics.ts). Until the catalogue arrives each entry is its English fallback.
 */
export function useDiagnosticText(): (d: Coded) => string {
  const t = useUiString();
  const { uiLanguage } = useUiLanguage();
  return (d) => sayDiagnostic(d, t, uiLanguage);
}
