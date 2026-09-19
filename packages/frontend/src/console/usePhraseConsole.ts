import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type SetStateAction } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { LanguageCode, PhrasePlan } from "@signi/shared";
import { fetchSavedPhrase, listSavedPhrases, savePhrase } from "../api.ts";
import { conceptsQuery } from "../hooks/useConcepts.ts";
import type { WorkspaceHistory } from "../hooks/useWorkspaceHistory.ts";
import { useUiLanguage } from "../i18n/LanguageContext.tsx";
import { hydrateWorkspace, serializeWorkspace } from "../components/PhraseBuilder/phraseSerialize/index.ts";
import { workspaceToPlans } from "../components/PhraseBuilder/workspacePlan/index.ts";
import type { PhraseContainer, PhraseLink } from "../components/PhraseBuilder/interfaces.ts";
import { advanceContext, applyScript, wordExists, type ApplyResult, type Effect, type Frame } from "./language/apply.ts";
import { commandNamed, type CommandDef } from "./language/commands.ts";
import { complete, previewIds, type Candidate, type CompleteOptions, type Completion } from "./language/complete.ts";
import { finished, nextStop, structure } from "./language/edit.ts";
import { diffWorkspaces, type EchoPart } from "./language/diff.ts";
import { lex, splitPeriods } from "./language/lex.ts";
import { printPeriod, printWorkspace } from "./language/print.ts";
import type { ConsoleContext, Diagnostic, WordRef, WorkspaceState } from "./language/types.ts";
import { pushHistory, readHistory, readPins, setPinned, writeHistory, writePins } from "./history.ts";
import { EXAMPLES, helpPage } from "./language/help.ts";
import { attachesToWord, currentSetting, takes, wordInfo } from "./language/words.ts";
import { useLocalAliases } from "./useLocalAliases.ts";
import { periodMark, wordMark, type ConsoleMarks } from "./ConsoleMarks.tsx";
import { parseRef } from "./language/resolve.ts";
import { nounWord } from "./language/words.ts";
import { useVocabulary } from "./useVocabulary.ts";

/**
 * The phrase console's state and behaviour, kept apart from how it is drawn (P02 §4).
 *
 * The phrase itself stays where it is — `containers` and `links`, in the workspace history. The
 * console never keeps a copy: it derives text from the state (print), and turns text into a new state
 * (apply), which is shown as a preview while the line is typed and committed as one undo step on ↵.
 * Changes made on the canvas come back as echoes, diffed from the state alone.
 */

export const OPEN_KEY = "signi:consoleOpen";
export const HEIGHT_KEY = "signi:consoleHeight";
export const DEFAULT_HEIGHT = 260;
export const MIN_HEIGHT = 150;

/** Below this width the console starts hidden: a phone has no room for it and the canvas. */
const NARROW = 600;

export type TranscriptEntry =
  | { id: number; kind: "typed"; text: string; containerId: string; plan?: Partial<PhrasePlan> }
  | { id: number; kind: "echo"; parts: EchoPart[]; containerId: string; plan?: Partial<PhrasePlan> }
  | { id: number; kind: "error"; text: string; message: string }
  | { id: number; kind: "info"; text: string; detail?: string }
  /**
   * A command's help page (`/help rel`): drawn from the catalogue when shown, so it follows the
   * interface language; `plan` is its example's sentence, and `here` what the command would do at
   * the context the page was asked from.
   */
  | { id: number; kind: "help"; name: string; plan?: Partial<PhrasePlan>; here?: string };

/** An entry before it has its id — the union distributed, so each kind keeps its own fields. */
type NewEntry = TranscriptEntry extends infer E ? (E extends TranscriptEntry ? Omit<E, "id"> : never) : never;

export interface AppActions {
  /** Open the header's own dialogs, for `/save` and `/load` with no name, `/export` and `/import`. */
  press: (control: "save-workspace" | "load-workspace" | "export-workspace" | "import-workspace") => void;
  toggleWords: () => void;
  openHelp: () => void;
}

/** One step of the path from the period to the phrase the caret is in: `1 › rel › 2 · OBJ cat`. */
export interface ChipStep {
  period: number;
  via?: string;
}

export interface Chip {
  path: ChipStep[];
  word?: WordRef;
}

const load = <T,>(key: string, read: (raw: string) => T, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : read(raw);
  } catch {
    return fallback;
  }
};

const store = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage blocked: the setting lasts for the session.
  }
};

/**
 * Run the language on the line being typed, and should it ever throw, say so on the line rather than
 * let the exception take the page — and the phrase on it — down with it. The preview and completion
 * run at every keystroke, during render, where nothing else would catch it.
 */
function safely<T>(run: () => T, fallback: T): T {
  try {
    return run();
  } catch (error) {
    console.error("The phrase console could not read the line:", error);
    return fallback;
  }
}

const unreadable = (state: WorkspaceState, text: string, context: ConsoleContext): ApplyResult => ({
  state,
  // English literal, for /localize.
  diagnostic: { from: 0, to: text.length, message: "The console could not read this line." },
  frames: [{ kind: "period", containerId: context.containerId, words: [] }],
  context,
  effects: [],
  created: [],
  touched: [],
  filled: [],
});

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `c${Math.random().toString(36).slice(2)}`;

/** The period a period's sentence is read in: itself, or the root the links fold it into. */
function rootOf(containerId: string, links: PhraseLink[]): string {
  let cur = containerId;
  const seen = new Set<string>();
  for (;;) {
    const up = links.find((l) => l.target.containerId === cur);
    if (!up || seen.has(cur)) return cur;
    seen.add(cur);
    cur = up.source.containerId;
  }
}

/** The plan of the sentence a period belongs to, for the transcript's right-hand column. */
function sentencePlan(state: WorkspaceState, containerId: string): Partial<PhrasePlan> | undefined {
  const root = rootOf(containerId, state.links);
  return workspaceToPlans(state.containers, state.links).find((s) => s.containerId === root)?.plan;
}

/**
 * The periods `after` differs from `before` in — their words, or the links they start (a link is
 * its source period's: that period's line prints it). None when a period came or went.
 */
function changedPeriods(before: WorkspaceState, after: WorkspaceState): Set<string> | undefined {
  if (before.containers.length !== after.containers.length) return undefined;
  const out = new Set<string>();
  for (let i = 0; i < after.containers.length; i++) {
    const was = before.containers[i]!;
    const now = after.containers[i]!;
    if (was.id !== now.id) return undefined;
    if (was.selection !== now.selection) out.add(now.id);
  }
  const was = new Set(before.links);
  const now = new Set(after.links);
  for (const l of after.links) if (!was.has(l)) out.add(l.source.containerId);
  for (const l of before.links) if (!now.has(l)) out.add(l.source.containerId);
  return out;
}

/**
 * A state the preview made, with the preview's ids made real: the periods it made take the ids the
 * committed line gave them, and any other preview id a fresh one — so nothing the preview only
 * proposed lingers under an id the next preview will use again.
 */
function withRealIds(state: WorkspaceState, previewIdsMade: string[], realIdsMade: string[]): WorkspaceState {
  const map = new Map(previewIdsMade.map((id, i) => [id, realIdsMade[i]!]));
  const real = (id: string) => {
    if (!id.startsWith("preview-")) return id;
    if (!map.has(id)) map.set(id, uid());
    return map.get(id)!;
  };
  return {
    containers: state.containers.map((c) => (c.id.startsWith("preview-") ? { ...c, id: real(c.id) } : c)),
    links: state.links.map((l) =>
      [l.id, l.source.containerId, l.target.containerId].some((id) => id.startsWith("preview-"))
        ? ({
            ...l,
            id: real(l.id),
            source: { ...l.source, containerId: real(l.source.containerId) },
            target: { ...l.target, containerId: real(l.target.containerId) },
          } as PhraseLink)
        : l,
    ),
  };
}

/** A period's words cleared and its own links let go — what `/edit` replaces with the line. */
function clearedFor(state: WorkspaceState, containerId: string): WorkspaceState {
  return {
    containers: state.containers.map((c) => (c.id === containerId ? { ...c, selection: {} } : c)),
    links: state.links.filter((l) => l.source.containerId !== containerId),
  };
}

export function usePhraseConsole({ history, actions }: { history: WorkspaceHistory; actions: AppActions }) {
  const vocab = useVocabulary();
  const { setUiLanguage } = useUiLanguage();
  const queryClient = useQueryClient();
  const committed: WorkspaceState = useMemo(
    () => ({ containers: history.containers, links: history.links }),
    [history.containers, history.links],
  );

  // ── Shown or hidden, and how tall ──
  const [open, setOpenState] = useState<boolean>(() =>
    load(OPEN_KEY, (raw) => raw === "true", typeof window === "undefined" || window.innerWidth >= NARROW),
  );
  const [height, setHeightState] = useState<number>(() =>
    load(HEIGHT_KEY, (raw) => Math.max(MIN_HEIGHT, Number(raw) || DEFAULT_HEIGHT), DEFAULT_HEIGHT),
  );
  const setOpen = (next: boolean) => {
    store(OPEN_KEY, String(next));
    setOpenState(next);
  };
  const setHeight = (next: number, persist = false) => {
    const h = Math.max(MIN_HEIGHT, Math.round(next));
    setHeightState(h);
    if (persist) store(HEIGHT_KEY, String(h));
  };

  // ── The prompt ──
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  /**
   * Whether the caret is on the prompt's first row, and on its last — the prompt draws them, and a
   * line that wraps walks the history only from its edges.
   */
  const rows = useRef<{ first: () => boolean; last: () => boolean }>({ first: () => true, last: () => true });
  const [text, setText] = useState("");
  const [caret, setCaret] = useState(0);
  const [focused, setFocused] = useState(false);
  // Whether the list is up: opened by what was typed (it opens by itself where completion says it
  // should), opened by ⇥, or closed by esc or by choosing from it.
  const [listMode, setListMode] = useState<"auto" | "forced" | "closed">("auto");
  const [highlight, setHighlight] = useState(0);
  // A refused ↵: the diagnostic is shown whatever it is, even an unfinished line's.
  const [refused, setRefused] = useState(false);
  // The period `/edit` loaded into the prompt, which ↵ replaces.
  const [editing, setEditing] = useState<string | null>(null);

  // ── History ──
  const [lines, setLines] = useState<string[]>(() => readHistory());
  // Where ↑ has walked back to (0 = the newest line), and the draft it walked away from.
  const [walk, setWalk] = useState<number | null>(null);
  const draft = useRef("");
  // The commands used this session, most recent first — completion ranks them higher.
  const [recent, setRecent] = useState<string[]>([]);
  // The lines pinned, kept per browser (see history.ts).
  const [pins, setPins] = useState<string[]>(() => readPins());
  const pin = (line: string, pinned: boolean) => {
    const next = setPinned(pins, line, pinned);
    setPins(next);
    writePins(next);
  };
  // The commands' names in the interface language, for completion (lines stay English).
  const localAliases = useLocalAliases();

  // ── The transcript ──
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const nextEntry = useRef(1);
  const add = (entry: NewEntry) =>
    setTranscript((t) => [...t.slice(-199), { ...entry, id: nextEntry.current++ } as TranscriptEntry]);

  // ── The context: where the next command attaches, and the canvas cursor's twin ──
  const [context, setContextState] = useState<ConsoleContext>(() => ({ containerId: history.containers[0]!.id }));
  // A context whose period has gone falls back to the first.
  const liveContext: ConsoleContext = committed.containers.some((c) => c.id === context.containerId)
    ? context.word && !wordExists(committed, context.word)
      ? { containerId: context.containerId }
      : context
    : { containerId: committed.containers[0]!.id };
  const setContext = (next: ConsoleContext) => setContextState(next);

  // The canvas cursor moves the console's context: a box focused there — clicked, or reached by the
  // keys — is where the next command attaches (see CursorBridge, which reports it from inside the
  // keyboard provider).
  const followCursor = (element: HTMLElement, slot?: WordRef["slot"], path?: WordRef["slice"]) => {
    const id = element.closest("[data-kb-period]")?.getAttribute("data-kb-period");
    if (!id) return;
    setContextState(slot ? { containerId: id, word: { containerId: id, slice: path, slot } } : { containerId: id });
  };

  // ── Hover, both ways ──
  const [hoveredBox, setHoveredBox] = useState<WordRef | null>(null);
  const [hoveredToken, setHoveredToken] = useState<WordRef | null>(null);

  // ── Deriving: the preview, the completion, the chip ──
  // One object for as long as the workspace and the period being edited are the same: the preview,
  // and the translations' debounce behind it, key on it.
  const base = useMemo(() => (editing ? clearedFor(committed, editing) : committed), [committed, editing]);
  const lineContext: ConsoleContext = editing ? { containerId: editing } : liveContext;
  const trimmed = text.trim();
  const preview: ApplyResult | undefined = useMemo(
    // Hidden, the console shows nothing — its preview neither, though the line waits in the prompt.
    () =>
      open && trimmed
        ? safely(
            () => applyScript(base, text, { context: lineContext, vocab, newId: previewIds() }),
            unreadable(base, text, lineContext),
          )
        : undefined,
    // `lineContext` is rebuilt every render; what it says is its period and word.
    [open, base, text, vocab, lineContext.containerId, lineContext.word && wordMark(lineContext.word)],
  );

  const savedQuery = useQuery({
    queryKey: ["savedPhrases", "phrase"],
    queryFn: () => listSavedPhrases("phrase"),
    enabled: open && /\/load\b/.test(text),
  });

  const completeOpts: CompleteOptions = useMemo(
    () => ({
      context: lineContext,
      vocab,
      recent,
      history: lines,
      pinned: pins,
      aliases: localAliases,
      saved: savedQuery.data?.map((p) => p.name),
    }),
    [vocab, recent, lines, pins, localAliases, savedQuery.data, lineContext.containerId, lineContext.word && wordMark(lineContext.word)],
  );
  const completion: Completion | undefined = useMemo(
    () => (focused ? safely(() => complete(text, caret, base, completeOpts), undefined) : undefined),
    [focused, text, caret, base, completeOpts],
  );
  const candidates = completion?.candidates ?? [];
  // The candidates change under a highlight that stays (the caret moved): it holds to the list.
  const highlighted = Math.max(0, Math.min(highlight, candidates.length - 1));
  const listShown =
    focused &&
    candidates.length > 0 &&
    (listMode === "forced" || (listMode === "auto" && Boolean(completion?.auto)));
  // Only closers after the caret: the line is being written there, and the ghost shows in front of them.
  const atEnd = /^[\s)\]}）］｝]*$/.test(text.slice(caret));
  const ghost = focused && atEnd ? completion?.ghost : undefined;

  // Where the caret is: the frames open there, for the context chip.
  const caretFrames: Frame[] = useMemo(() => {
    if (!text.slice(0, caret).trim()) return [];
    return safely(
      () => applyScript(base, text.slice(0, caret), { context: lineContext, vocab, newId: previewIds() }).frames,
      [],
    );
  }, [base, text, caret, vocab, lineContext.containerId, lineContext.word && wordMark(lineContext.word)]);

  const number = (id: string, state: WorkspaceState) => state.containers.findIndex((c) => c.id === id) + 1;
  const chip: Chip = (() => {
    const state = preview?.state ?? base;
    if (caretFrames.length === 0) {
      return { path: [{ period: number(lineContext.containerId, base) }], word: lineContext.word };
    }
    // A word's own bracket is no step of the path: the word says where the caret is.
    const path: ChipStep[] = caretFrames
      .filter((f) => f.kind !== "element")
      .map((f) => ({ period: number(f.containerId, state), via: f.via }));
    // The last word written where the caret is — or, just past a word's bracket, that word.
    const here = caretFrames.at(-1)!;
    return { path, word: here.words.at(-1) ?? here.anchor };
  })();

  // ── The diagnostic ──
  const raw: (Diagnostic & { incomplete?: boolean }) | undefined = preview?.diagnostic;
  // A word still being typed — the mistake is the token at the caret, and the list has words for it —
  // is unfinished rather than wrong: the console says so quietly until ↵ is pressed on it.
  const typing = Boolean(raw && focused && raw.to === caret && (completion?.candidates.length ?? 0) > 0);
  const diagnostic = raw && typing ? { ...raw, incomplete: true } : raw;
  const showDiagnostic = diagnostic && (refused || !diagnostic.incomplete);

  // ── Marks on the canvas ──
  const previewing = Boolean(preview);
  // The numbered targets of a link command's list, as marks on the canvas: `#2.subj` numbered 1 puts
  // a 1 on period 2's subject.
  const numbers = useMemo(() => {
    const map = new Map<string, number>();
    if (!listShown) return map;
    for (const c of candidates) {
      if (c.number === undefined) continue;
      const ref = parseRef(c.insert.slice(1));
      if ("error" in ref) continue;
      const target = (preview?.state ?? base).containers[ref.period - 1];
      if (!target) continue;
      map.set(ref.address ? wordMark(nounWord(target.id, ref.address)) : periodMark(target.id), c.number);
    }
    return map;
  }, [listShown, candidates, preview, base]);

  const marks: ConsoleMarks = useMemo(() => {
    const committedLinks = new Set(committed.links.map((l) => l.id));
    const cursorWord = (preview && focused ? preview.context.word : undefined) ?? liveContext.word;
    return {
      preview: new Set(preview ? preview.touched.map(wordMark) : []),
      lit: new Set(hoveredToken ? [wordMark(hoveredToken)] : []),
      cursor: open && cursorWord ? wordMark(cursorWord) : undefined,
      previewPeriods: new Set(preview?.created ?? []),
      previewLinks: new Set(preview ? preview.state.links.filter((l) => !committedLinks.has(l.id)).map((l) => l.id) : []),
      numbers,
      onHover: (word) => setHoveredBox(word),
      typing: focused,
    };
  }, [preview, hoveredToken, open, focused, committed.links, numbers, liveContext.word && wordMark(liveContext.word)]);

  // ── Echo: canvas changes written back as commands ──
  const seen = useRef<WorkspaceState>(committed);
  // Set while the console itself writes the workspace, so its own commit is not echoed back at it.
  const writing = useRef(false);
  const vocabRef = useRef(vocab);
  vocabRef.current = vocab;
  useEffect(() => {
    const before = seen.current;
    seen.current = committed;
    if (before === committed) return;
    if (writing.current) {
      writing.current = false;
      return;
    }
    const echoes = diffWorkspaces(before, committed, vocabRef.current);
    for (const echo of echoes) {
      add({ kind: "echo", parts: echo.parts, containerId: echo.containerId, plan: sentencePlan(committed, echo.containerId) });
    }
    // What was changed on the canvas is where the console's next command attaches: a click on the
    // polarity of *eat* puts the context on *eat*, as the cursor would be.
    const word = echoes.flatMap((e) => e.parts).find((p) => p.word && wordExists(committed, p.word))?.word;
    if (word) setContextState({ containerId: word.containerId, word });
  }, [committed]);

  // ── Editing the prompt ──
  const focusPrompt = (at?: number) => {
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) return;
      input.focus();
      if (at !== undefined) input.setSelectionRange(at, at);
    });
  };

  // The caret the console put somewhere, set on the prompt once it holds the text it belongs to —
  // before the next keystroke reads it.
  const pendingCaret = useRef<number | [number, number] | null>(null);
  useLayoutEffect(() => {
    const at = pendingCaret.current;
    if (at === null) return;
    pendingCaret.current = null;
    const [from, to] = typeof at === "number" ? [at, at] : at;
    inputRef.current?.setSelectionRange(from, to);
  });

  const setLine = (next: string, at = next.length) => {
    setText(next);
    setCaret(at);
    setHighlight(0);
    setRefused(false);
    pendingCaret.current = at;
  };

  const editContext = () => ({ state: base, opts: completeOpts });

  /**
   * A keystroke in the prompt. The console restructures the line as it goes — opening a word's
   * bracket, stepping over a closer, moving a command out of a bracket it does not belong in (see
   * edit.ts) — except while an input method is composing.
   */
  const onChange = (next: string, at: number, composing = false) => {
    const edit = composing ? undefined : safely(() => structure(text, next, at, editContext()), undefined);
    setText(edit?.text ?? next);
    setCaret(edit?.caret ?? at);
    if (edit) pendingCaret.current = edit.caret;
    setHighlight(0);
    setListMode("auto");
    setRefused(false);
    setWalk(null);
  };

  /**
   * Put a candidate in place of the range it completes, and a space after it for what follows — or,
   * for a bracket, the pair with the caret inside. A command chosen is finished as a space would
   * finish it: its bracket opens, or it moves out of one it does not belong in.
   */
  const choose = (c: Candidate) => {
    if (!completion) return;
    const before = text.slice(0, completion.from);
    const after = text.slice(completion.to).replace(/^ /, "");
    if (c.close) {
      const head = `${before}${c.insert} `;
      const tail = after && !/^\s/.test(after) ? ` ${after}` : after;
      setLine(`${head} ${c.close}${tail}`, head.length);
      setListMode("auto");
      return;
    }
    const head = `${before}${c.insert} `;
    // In front of a closer, a space either side of the caret: `cat | )`.
    const next = /^\s*[)\]}）］｝]/.test(after) ? `${head} ${after.trimStart()}` : `${head}${after}`;
    const edit = c.kind === "history" ? undefined : safely(() => finished(next, head.length, editContext()), undefined);
    setLine(edit?.text ?? next, edit?.caret ?? head.length);
    setListMode("auto");
  };

  /**
   * ⇥ and ⇧⇥ where there is nothing to complete: the next command or word, or the previous, selected
   * so typing replaces it — or just past a closing bracket, stepping out of it.
   */
  const jump = (dir: 1 | -1): boolean => {
    const input = inputRef.current;
    if (!input) return false;
    const stop = nextStop(text, input.selectionStart, input.selectionEnd, dir);
    if (!stop) return false;
    let next = text;
    // Past a closer at the end of the line, room to write what follows.
    if (stop.from === stop.to && stop.to === text.length) next = `${text} `;
    const to = stop.from === stop.to && next[stop.to] === " " ? stop.to + 1 : stop.to;
    const from = stop.from === stop.to ? to : stop.from;
    if (next !== text) setText(next);
    // The caret the console reads is the selection's end: the chip names the word selected.
    setCaret(to);
    setListMode("closed");
    input.setSelectionRange(from, to);
    pendingCaret.current = [from, to];
    return true;
  };

  /**
   * ⇥: the ghost, or the highlighted row; the shared start of several; else, with nothing typed at the
   * caret, on to the next word; else open the list.
   */
  const tab = () => {
    // A word selected — by ⇥ itself, or the mouse — is passed over, not completed again.
    const input = inputRef.current;
    if (input && input.selectionStart !== input.selectionEnd && !listShown && jump(1)) return;
    if (!completion || candidates.length === 0) {
      if (text.trim() && jump(1)) return;
      setListMode("forced");
      return;
    }
    if (listShown && highlighted > 0) return choose(candidates[highlighted]!);
    // Lines are offered whole: ⇥ opens them, and a second ⇥ takes the one highlighted.
    if (candidates[0]!.kind === "history") {
      if (listShown) return choose(candidates[highlighted]!);
      setListMode("forced");
      return;
    }
    if (!listShown && !completion.ghost && completion.from === completion.to && jump(1)) return;
    const typed = text.slice(completion.from, caret).toLowerCase();
    const matching = candidates.filter((c) => c.insert.toLowerCase().startsWith(typed));
    if (matching.length > 1) {
      let shared = matching[0]!.insert;
      for (const c of matching) {
        let i = 0;
        while (i < shared.length && i < c.insert.length && shared[i]!.toLowerCase() === c.insert[i]!.toLowerCase()) i++;
        shared = shared.slice(0, i);
      }
      if (shared.length > typed.length) {
        const next = `${text.slice(0, completion.from)}${shared}${text.slice(completion.to)}`;
        setLine(next, completion.from + shared.length);
        setListMode("forced");
        return;
      }
    }
    if (completion.ghost || candidates.length === 1 || listShown) return choose(candidates[listShown ? highlighted : 0]!);
    setListMode("forced");
  };

  // ── Committing ──
  // `state` and `here` are what the line left — the workspace and the context, in the period it is in —
  // which the handler's own render has not seen yet.
  const runEffects = async (effects: Effect[], state: WorkspaceState, here: ConsoleContext, script: string, before: string[]) => {
    const at = here.containerId;
    for (const effect of effects) {
      const arg = effect.arg?.trim();
      switch (effect.app) {
        case "pin":
        case "unpin": {
          // The line it is written in, without it — or, alone, the line run before it.
          const rest = `${script.slice(0, effect.span.from)} ${script.slice(effect.span.to)}`.replace(/\s+/g, " ").trim();
          const line = rest || before[0];
          if (line) {
            pin(line, effect.app === "pin");
            add({ kind: "info", text: line, detail: effect.app === "pin" ? "Pinned." : "Unpinned." });
          }
          break;
        }
        case "edit":
          edit(at, state);
          return;
        // The console's own undo is no canvas change to echo back at it.
        case "undo":
          if (history.canUndo) {
            writing.current = true;
            history.undo();
          }
          break;
        case "redo":
          if (history.canRedo) {
            writing.current = true;
            history.redo();
          }
          break;
        case "words":
          actions.toggleWords();
          break;
        case "lang":
          if (arg) setUiLanguage(arg as LanguageCode);
          break;
        case "export":
          actions.press("export-workspace");
          break;
        case "import":
          actions.press("import-workspace");
          break;
        case "help":
          if (arg) showHelp(arg, state, here);
          else actions.openHelp();
          break;
        case "save":
          if (!arg) {
            actions.press("save-workspace");
            break;
          }
          try {
            await savePhrase({ name: arg, kind: "phrase", workspace: serializeWorkspace(state.containers, state.links) });
            queryClient.invalidateQueries({ queryKey: ["savedPhrases"] });
            add({ kind: "info", text: `/save ${arg}`, detail: "Saved." });
          } catch {
            add({ kind: "error", text: `/save ${arg}`, message: "Could not save the phrase." });
          }
          break;
        case "load": {
          if (!arg) {
            actions.press("load-workspace");
            break;
          }
          try {
            const list = await listSavedPhrases("phrase");
            const hit = list.find((p) => p.name.toLowerCase() === arg.toLowerCase());
            if (!hit) {
              add({ kind: "error", text: `/load ${arg}`, message: `There is no saved phrase “${arg}”.` });
              break;
            }
            const record = await fetchSavedPhrase(hit.id);
            const catalog = await queryClient.ensureQueryData(conceptsQuery());
            const { containers, links } = hydrateWorkspace(record.workspace, catalog);
            writing.current = true;
            history.replace({ containers, links });
            add({ kind: "info", text: `/load ${arg}`, detail: "Loaded." });
          } catch {
            add({ kind: "error", text: `/load ${arg}`, message: "Could not load the phrase." });
          }
          break;
        }
      }
    }
  };

  /**
   * Run the line: its state becomes the phrase, as one undo step. `then`, a state an edit on the
   * canvas made from the line's preview, is written in its place — the line and then the edit, as ↵
   * and then the click would have — and the edit is echoed.
   */
  const commit = (script = text, then?: WorkspaceState): boolean => {
    const line = script.trim();
    if (!line) return false;
    const result = safely(
      () => applyScript(base, script, { context: lineContext, vocab, newId: uid }),
      unreadable(base, script, lineContext),
    );
    if (result.diagnostic) {
      setRefused(true);
      return false;
    }
    const written = then ? withRealIds(then, preview?.created ?? [], result.created) : result.state;
    const changed = written !== base || editing !== null;
    if (changed && (written.containers !== committed.containers || written.links !== committed.links)) {
      writing.current = true;
      history.replace(written);
    }
    const typed = splitPeriods(script).map((p) => p.text).filter((l) => l.trim());
    const at = result.context.containerId;
    for (const t of typed)
      add({ kind: "typed", text: t.trim(), containerId: at, plan: changed ? sentencePlan(result.state, at) : undefined });
    if (then)
      for (const echo of diffWorkspaces(result.state, written, vocab))
        add({ kind: "echo", parts: echo.parts, containerId: echo.containerId, plan: sentencePlan(written, echo.containerId) });
    const nextLines = typed.reduce((h, t) => pushHistory(h, t), lines);
    setLines(nextLines);
    writeHistory(nextLines);
    const used = lex(script)
      .filter((t) => t.kind === "command")
      .map((t) => commandNamed((t as { name: string }).name)?.name)
      .filter((n): n is string => Boolean(n));
    setRecent((r) => [...new Set([...used.reverse(), ...r])].slice(0, 20));
    setContext(advanceContext(base, result.state, result));
    setEditing(null);
    setWalk(null);
    setLine("");
    setListMode("auto");
    void runEffects(result.effects, result.state, result.context, script, lines);
    // A new period's opening picker would have taken the keyboard as it mounted: the prompt keeps it.
    focusPrompt();
    return true;
  };

  // ── Edits on the canvas ──
  // Clicking on the canvas and typing in the prompt are one and the same. With no line waiting, an
  // edit on the canvas is the phrase's at once, and comes back as an echo. With one waiting, the
  // canvas shows what the line makes, and an edit there is an edit of that: it goes into the line —
  // the period it changes printed whole, as `/edit` would, the prompt editing it — and, like
  // anything typed, it is the phrase's on ↵. An edit that reaches beyond that period runs the line
  // first, and lands on what it made.
  const pendingEdit =
    editing !== null ||
    Boolean(preview && (preview.state.containers !== base.containers || preview.state.links !== base.links));
  // The edits of one click, gathered: a control may set the words and then the links in the same breath.
  const canvasDraft = useRef<{ state: WorkspaceState; fallbacks: (() => void)[] } | null>(null);

  const settle = (next: WorkspaceState, fallback: () => void) => {
    // An edit that changes nothing of what is shown — a control reporting the value it has — is none.
    const shownNow = preview?.state ?? committed;
    if (changedPeriods(shownNow, next)?.size === 0) return;
    const changed = changedPeriods(committed, next);
    const p = editing ?? (changed?.size === 1 ? [...changed][0] : undefined);
    if (changed && p && [...changed].every((id) => id === p)) {
      const source = printPeriod(next, p, vocab).text;
      setEditing(p);
      setLine(source ? `${source} ` : "");
      setListMode("closed");
      return;
    }
    if (!preview?.diagnostic && commit(text, next)) return;
    // A line that does not run leaves the edit to the phrase underneath, as before there was one.
    fallback();
  };

  const toDraft = (edit: (s: WorkspaceState) => WorkspaceState, fallback: () => void) => {
    const first = canvasDraft.current === null;
    const from = canvasDraft.current?.state ?? preview?.state ?? committed;
    canvasDraft.current = { state: edit(from), fallbacks: [...(canvasDraft.current?.fallbacks ?? []), fallback] };
    if (!first) return;
    queueMicrotask(() => {
      const draft = canvasDraft.current;
      canvasDraft.current = null;
      if (draft) settle(draft.state, () => draft.fallbacks.forEach((f) => f()));
    });
  };

  // What the preview alone proposes does not exist in the phrase underneath: nothing is written to it.
  const proposed = new Set(preview?.created ?? []);
  const canvas = {
    setContainers: (update: SetStateAction<PhraseContainer[]>) => {
      if (!pendingEdit) return history.setContainers(update);
      const apply = (cs: PhraseContainer[]) => (typeof update === "function" ? update(cs) : update);
      toDraft(
        (s) => ({ ...s, containers: apply(s.containers) }),
        () => history.setContainers((cs) => apply(cs).filter((c) => !proposed.has(c.id))),
      );
    },
    setLinks: (update: SetStateAction<PhraseLink[]>) => {
      if (!pendingEdit) return history.setLinks(update);
      const apply = (ls: PhraseLink[]) => (typeof update === "function" ? update(ls) : update);
      toDraft(
        (s) => ({ ...s, links: apply(s.links) }),
        () =>
          history.setLinks((ls) =>
            apply(ls).filter((l) => !proposed.has(l.source.containerId) && !proposed.has(l.target.containerId)),
          ),
      );
    },
  };

  // ── Keys in the prompt ──
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // While an input method composes (Japanese kana to kanji), ↵ confirms its conversion and the
    // arrows and esc are its own: none of them is the console's.
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    const key = event.key;
    // A digit takes a numbered reference while a list of them is up and nothing has been typed for
    // it yet (`/rel ` then 1). Once a # is typed, digits are the reference's own text: `#12.obj`.
    if (listShown && /^[1-9]$/.test(key) && completion && completion.from === completion.to) {
      const hit = candidates.find((c) => c.number === Number(key));
      if (hit) {
        event.preventDefault();
        choose(hit);
        return;
      }
    }
    switch (key) {
      case "Tab":
        if (event.shiftKey) {
          if (jump(-1)) event.preventDefault();
          return;
        }
        event.preventDefault();
        tab();
        return;
      case "ArrowRight":
        if (ghost) {
          event.preventDefault();
          if (candidates[0] && completion?.ghost && candidates[0].insert.toLowerCase().startsWith(text.slice(completion.from, caret).toLowerCase()))
            choose(candidates[0]);
          else setLine(text.slice(0, caret) + ghost + text.slice(caret), caret + ghost.length);
        }
        return;
      case "ArrowDown":
      case "ArrowUp": {
        const delta = key === "ArrowDown" ? 1 : -1;
        if (listShown) {
          event.preventDefault();
          setHighlight((h) => (h + delta + candidates.length) % candidates.length);
          return;
        }
        // A line over several rows moves between them; from its first or last, the history.
        if (!(delta === -1 ? rows.current.first() : rows.current.last())) return;
        event.preventDefault();
        // No list: walk the lines run before.
        if (lines.length === 0) return;
        if (walk === null) {
          if (delta === 1) return;
          draft.current = text;
          setWalk(0);
          setLine(lines[0]!);
          setListMode("closed");
          return;
        }
        const next = walk - delta;
        if (next < 0) {
          setWalk(null);
          setLine(draft.current);
          return;
        }
        if (next >= lines.length) return;
        setWalk(next);
        setLine(lines[next]!);
        setListMode("closed");
        return;
      }
      case "Enter":
        // ⇧↵ breaks the line: inside a bracket a space, outside one the next period.
        if (event.shiftKey) return;
        event.preventDefault();
        if (listShown && candidates[highlighted]) {
          const c = candidates[highlighted]!;
          // A row that is already what was typed has nothing to add: ↵ runs the line.
          const typed = completion ? text.slice(completion.from, completion.to) : "";
          if (c.insert !== typed) {
            choose(c);
            return;
          }
        }
        commit();
        return;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        if (listShown) {
          setListMode("closed");
          return;
        }
        if (text || editing !== null) {
          setLine("");
          setEditing(null);
          setWalk(null);
          return;
        }
        backToCanvas();
        return;
    }
  };

  /** Give the keyboard back to the canvas, at the box the console's context is on. */
  const backToCanvas = () => {
    inputRef.current?.blur();
    const word = liveContext.word;
    const period = document.querySelector<HTMLElement>(`[data-kb-period="${CSS.escape(liveContext.containerId)}"]`);
    // The box the context is on; else the period's first box; else — an empty period draws no boxes —
    // its opening word picker, where its cursor belongs until a first word is chosen.
    const el =
      (word && document.querySelector<HTMLElement>(`[data-console-mark="${CSS.escape(wordMark(word))}"]`)) ||
      period?.querySelector<HTMLElement>("[data-kb-box]") ||
      period?.querySelector<HTMLElement>("input") ||
      document.querySelector<HTMLElement>("[data-kb-box]");
    el?.focus();
  };

  // ── The app's keys: ` and / ──
  const toggle = () => {
    if (!open) {
      setOpen(true);
      focusPrompt();
      return;
    }
    if (document.activeElement !== inputRef.current) {
      focusPrompt();
      return;
    }
    setOpen(false);
    backToCanvas();
  };
  const startCommand = () => {
    setOpen(true);
    setLine("/");
    setListMode("auto");
    focusPrompt(1);
  };

  /**
   * A command's help page, written into the transcript: how it is written, what it does, its
   * example with the sentence it makes, and what it would act on here.
   */
  const showHelp = (name: string, state = committed, here: ConsoleContext = liveContext) => {
    const page = helpPage(name);
    if (!page) {
      add({ kind: "error", text: `/help ${name}`, message: `There is no command /${name.replace(/^\//, "")}.` });
      return;
    }
    const example = EXAMPLES[page.def.name]!;
    const built =
      page.def.action.kind === "app"
        ? undefined
        : safely(
            () => applyScript({ containers: [{ id: "help", selection: {} }], links: [] }, example, {
              context: { containerId: "help" },
              vocab,
              newId: previewIds(),
            }),
            undefined,
          );
    const plan = built && !built.diagnostic ? sentencePlan(built.state, "help") : undefined;
    add({ kind: "help", name: page.def.name, plan, here: hereFor(page.def, state, here) });
    setOpen(true);
  };

  /** What a command would act on at the context — "on cat, now singular" — for its help page. */
  const hereFor = (def: CommandDef, state: WorkspaceState, here: ConsoleContext): string | undefined => {
    if (!attachesToWord(def.action)) return undefined;
    const w = here.word ? wordInfo(state.containers, here.word) : undefined;
    const name = w?.concept ? vocab.label(w.concept) : undefined;
    if (!w || !name) return "Here: nothing under the cursor yet.";
    if (!takes(def.action, w)) return `Here: ${name} does not take it.`;
    const id = def.action.kind === "setting" ? def.action.setting.id : def.action.kind === "set" ? def.action.id : undefined;
    const now = id ? currentSetting(id, w) : undefined;
    return `Here: on ${name}${now ? `, now ${now}` : ""}.`;
  };

  /** Load the focused period's source into the prompt, which ↵ then replaces the period with. */
  const edit = (id = liveContext.containerId, state = committed) => {
    setEditing(id);
    const source = printPeriod(state, id, vocab).text;
    setLine(source ? `${source} ` : "");
    setListMode("closed");
    focusPrompt();
  };

  return {
    // shown / hidden / size
    open,
    setOpen,
    height,
    setHeight,
    // the prompt
    inputRef,
    text,
    caret,
    setCaret,
    focused,
    setFocused,
    onChange,
    onKeyDown,
    rows,
    ghost,
    completion,
    listShown,
    highlight: highlighted,
    setHighlight,
    choose,
    diagnostic: showDiagnostic ? diagnostic : undefined,
    unfinished: Boolean(diagnostic?.incomplete && !refused),
    walk: walk === null ? undefined : { at: walk + 1, of: lines.length },
    editing: editing ? number(editing, committed) : undefined,
    chip,
    // the views
    preview: previewing ? preview : undefined,
    committed,
    context: liveContext,
    setContext,
    transcript,
    marks,
    hoveredBox,
    hoveredToken,
    setHoveredToken,
    vocab,
    // actions
    commit,
    edit,
    toggle,
    startCommand,
    backToCanvas,
    focusPrompt,
    followCursor,
    printWorkspace: () => printWorkspace(committed, vocab),
    // the canvas's edits, which go through the line while one waits
    canvas,
    // pins and help
    pins,
    pin,
    showHelp: (name: string) => showHelp(name),
  };
}

export type PhraseConsoleModel = ReturnType<typeof usePhraseConsole>;

