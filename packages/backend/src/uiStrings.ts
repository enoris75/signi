import { translate } from '@signi/engine';
import { UI_STRINGS, LANGUAGES } from '@signi/shared';
import type { LanguageCode, UiStringFormat, UiStringKey, UiStrings } from '@signi/shared';
import { lookupLexicalEntry } from './lexicon.js';

const LANGUAGE_CODES = Object.keys(LANGUAGES) as LanguageCode[];

function applyFormat(text: string, format?: UiStringFormat): string {
  let out = text;
  // ASCII "." or Japanese "。".
  if (format?.stripPeriod) out = out.replace(/[.。]\s*$/, '');
  if (format?.capitalize && out) out = out[0].toUpperCase() + out.slice(1);
  return out;
}

/**
 * Japanese renders a 2nd-person command as the polite request ～てください ("文を読み込んでください"),
 * which is right for a phrase the user builds but reads as "please load a period" on a button.
 * A Japanese control is labelled with the verb's verbal noun instead, keeping the object:
 * "文を読み込み", "文の容器を追加", "保存". So for a command string, swap the request tail
 * (te-form + ください) for that noun — the `label` form seeded on the ja verb (concepts/verbs),
 * falling back to the masu-stem, itself minus the し of a する-verb ("保存し" → "保存").
 *
 * Only the ja surface needs this: the other engines' imperatives ("save", "salva", "speichere")
 * are already the register a button wants.
 */
function jaCommandLabel(text: string, verbConcept: string): string {
  const forms = lookupLexicalEntry(verbConcept, 'ja')?.forms;
  if (!forms) return text;

  const te = forms['te'];
  if (!te) return text;

  const label =
    forms['label'] ?? (forms['masu_present'] ?? '').replace(/ます$/, '').replace(/し$/, '');
  if (!label) return text;

  // The engine has already closed the period with 。 — the tail to replace carries it along.
  const request = new RegExp(`${te}ください。?$`);
  return text.replace(request, label);
}

/**
 * Renders every entry of the UI-string catalog into every language. The result depends only
 * on the lexicon, so index.ts builds it once at startup and serves it from memory — which
 * also means a plan referencing an unseeded concept crashes the server on boot rather than
 * silently serving a broken string.
 */
export function buildUiStrings(): UiStrings {
  const out = {} as UiStrings;

  for (const key of Object.keys(UI_STRINGS) as UiStringKey[]) {
    const def = UI_STRINGS[key];
    const byLanguage = {} as Record<LanguageCode, string>;

    const commandVerb = def.plan.imperative ? def.plan.verbPhrase?.verb : undefined;

    for (const t of translate(def.plan, lookupLexicalEntry)) {
      const text =
        t.language === 'ja' && commandVerb ? jaCommandLabel(t.text, commandVerb) : t.text;
      byLanguage[t.language] = applyFormat(text, def.format);
    }

    const missing = LANGUAGE_CODES.filter((code) => !byLanguage[code]);
    if (missing.length > 0) {
      throw new Error(
        `UI string "${key}" did not render in: ${missing.join(', ')}. ` +
          'Check the concepts its plan references are seeded in every language.',
      );
    }

    out[key] = byLanguage;
  }

  return out;
}
