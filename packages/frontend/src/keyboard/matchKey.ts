/**
 * Platform-aware key matching and keycap labels — the one place that knows what a key *spec*
 * in the keymap means for a real `keydown`, and how to draw it.
 *
 * A spec is modifiers and a key joined by "+": `"N"`, `"Shift+ArrowUp"`, `"Mod+S"`. `Mod` is the
 * app modifier — ⌘ on a Mac, Ctrl everywhere else — and it is the only modifier chord the app
 * binds: there is no Alt/⌥ layer (see the plan's §4.7), so a spec carrying Alt would never match.
 */

/** The two modifier conventions. Everything else is identical across platforms. */
export type Platform = "mac" | "other";

/** Only the parts of a `KeyboardEvent` matching reads, so the matcher is testable with a literal. */
export interface KeyEventLike {
  key: string;
  /** Which physical key it was, for a spec that names one by position (`Code:Backquote`). */
  code?: string;
  /** Set while an input method is composing, when every key is the input method's. */
  isComposing?: boolean;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}

export interface KeySpec {
  /** The app modifier: ⌘ on a Mac, Ctrl elsewhere. */
  mod: boolean;
  shift: boolean;
  /** The key itself, as it is written in the spec (`"N"`, `"ArrowUp"`, `"Space"`). */
  key: string;
}

/**
 * Which modifier the platform uses for application shortcuts. Read once, from the UA, with a
 * conservative fallback: a wrong guess costs a chord, never a wrong action, because the two
 * conventions are matched exclusively (a Mac binding requires ⌘ *and no* Ctrl).
 */
export function currentPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = `${navigator.platform ?? ""} ${navigator.userAgent ?? ""}`;
  return /Mac|iPhone|iPad|iPod/i.test(ua) ? "mac" : "other";
}

export function parseKeySpec(spec: string): KeySpec {
  const parts = spec.split("+");
  // "+" is itself a bindable key ("taller canvas"), so a trailing empty part is that key, not a
  // separator artefact: "Shift++" parses as Shift plus "+".
  const key = parts.pop() || "+";
  const mods = parts.map((m) => m.toLowerCase());
  return { mod: mods.includes("mod"), shift: mods.includes("shift"), key };
}

// The key names a spec may use that differ from `KeyboardEvent.key`.
const EVENT_KEY: Record<string, string> = { Space: " " };

/**
 * A single character that is not a letter — "?", "+", "`". Which physical keys (and which
 * shift state) produce these varies by layout, so their specs do not constrain Shift: "?" is
 * Shift+/ on a US layout and a key of its own elsewhere.
 */
const isPunctuation = (key: string) => key.length === 1 && !/\p{L}|\p{N}/u.test(key);

/**
 * The keys named by where they are rather than by what they type. `Code:Backquote` is the key below
 * esc, whatever it prints: many layouts have no plain backtick there (Italian) or make it a dead key
 * (German, French, Spanish), and on a Mac with an ISO keyboard the browser reports that key as
 * `IntlBackslash` — so both codes are that key there.
 */
const PHYSICAL_KEYS: Record<string, (platform: Platform) => string[]> = {
  Backquote: (platform) => (platform === "mac" ? ["Backquote", "IntlBackslash"] : ["Backquote"]),
};

const CODE_PREFIX = "Code:";

/**
 * What the key in that place types on a Japanese keyboard: 半角/全角, the switch in and out of the
 * input method. It is that switch, not the console's key.
 */
const INPUT_METHOD_KEYS = new Set(["Zenkaku", "Hankaku", "HankakuZenkaku", "KanjiMode", "Process"]);

export function matchesKeySpec(
  spec: string,
  event: KeyEventLike,
  platform: Platform = currentPlatform(),
): boolean {
  const { mod, shift, key } = parseKeySpec(spec);
  if (key.startsWith(CODE_PREFIX)) {
    const codes = PHYSICAL_KEYS[key.slice(CODE_PREFIX.length)]?.(platform) ?? [key.slice(CODE_PREFIX.length)];
    return (
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.isComposing &&
      !INPUT_METHOD_KEYS.has(event.key) &&
      !mod &&
      shift === event.shiftKey &&
      codes.includes(event.code ?? "")
    );
  }
  // Alt is never bound, so it never passes through: on a Mac it composes characters, and on
  // Windows and Linux it opens the browser's own menus.
  if (event.altKey) return false;
  const modHeld = platform === "mac" ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
  if (mod !== modHeld) return false;
  // Both conventions must be exclusive: Ctrl+S on a Mac belongs to the terminal, not to us.
  if (!mod && (event.ctrlKey || event.metaKey)) return false;
  // A bare letter and its shifted twin are two different commands (T cycles the tense, ⇧T cycles
  // it back), so Shift is matched exactly — except on punctuation, whose shift state is a fact
  // about the layout rather than about the binding.
  if (!isPunctuation(key) && shift !== event.shiftKey) return false;
  const want = EVENT_KEY[key] ?? key;
  return event.key.toLowerCase() === want.toLowerCase();
}

// How each key is drawn on a cap. Anything absent is shown as written, upper-cased if it is a
// single letter.
const CAP_LABEL: Record<string, string> = {
  ArrowLeft: "←",
  ArrowUp: "↑",
  ArrowRight: "→",
  ArrowDown: "↓",
  Enter: "↵",
  Escape: "esc",
  Backspace: "⌫",
  Tab: "⇥",
  Space: "Space",
  "Code:Backquote": "`",
};

/**
 * The caps a spec is drawn as, in order — `["⌘", "S"]` on a Mac, `["Ctrl", "S"]` elsewhere.
 * Several caps rather than one string so each can be drawn as its own key (see Keycap).
 */
export function keycapLabels(spec: string, platform: Platform = currentPlatform()): string[] {
  const { mod, shift, key } = parseKeySpec(spec);
  const caps: string[] = [];
  if (mod) caps.push(platform === "mac" ? "⌘" : "Ctrl");
  if (shift) caps.push("⇧");
  caps.push(CAP_LABEL[key] ?? (key.length === 1 ? key.toUpperCase() : key));
  return caps;
}

/** The same caps as one string, for a tooltip ("Number: Singular  N"). */
export function keycapText(spec: string, platform: Platform = currentPlatform()): string {
  return keycapLabels(spec, platform).join(" ");
}
