import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { SlotKey } from "../components/PhraseBuilder/interfaces.ts";
import { currentPlatform, matchesKeySpec, type Platform } from "./matchKey.ts";
import {
  KEYMAP,
  PERIOD_KEYMAP,
  resolveCommand,
  type BoxContext,
  type BoxKeyContext,
  type Command,
  type CursorNav,
  type PeriodContext,
  type PeriodKeyContext,
  type PeriodNav,
} from "./keymap.ts";
import { boxElements, periodOf, stepBox, stepPeriod } from "./boxes.ts";
import { isEditableTarget, resolveScopes, type Scope } from "./scope.ts";
import { nearestInDirection, type BoxRect, type Direction } from "./spatialNav.ts";

/**
 * The one `keydown` listener in the app.
 *
 * It resolves what the cursor is on, looks the keystroke up in the keymap for that scope, and runs
 * the command — nothing else in the app binds a key. Two things make that possible: every box
 * reports itself as the cursor while it holds focus, and the builder that owns it keeps a live
 * function turning a slot into the handlers for it, so the context a command runs against is the
 * current render's rather than the one captured when focus arrived.
 *
 * It also tracks the input modality, so the key tips and the keyboard caption show for a keyboard
 * user and not for a mouse user, who sees the UI unchanged.
 */

export type Modality = "keyboard" | "pointer";

/** A builder's live bridge into its own handlers, swapped on every one of its renders. */
export interface BoxScope {
  build: (slot: SlotKey) => BoxContext | null;
}

/** A period card's live bridge into its own controls, swapped on every one of its renders. */
export interface PeriodScope {
  build: () => PeriodContext | null;
}

/**
 * Where the cursor rests — on a word box, or a level up on the period card itself (the plan's §2).
 * The level decides which keymap a keystroke is looked up in, so the same letter is the noun's
 * number in a box and the period's command on the card.
 */
export type Cursor =
  | { level: "box"; element: HTMLElement; slot: SlotKey }
  | { level: "period"; element: HTMLElement };

/**
 * The scopes the cursor's keys are looked up in, read off the box's own `data-kb-scope` at the
 * moment the key is pressed rather than remembered from when focus arrived — a box's scopes follow
 * the word in it ("seems happy" against "becomes a legend"), and that word can change under a
 * cursor that never moved.
 */
const scopesOf = (cursor: Cursor): Scope[] => resolveScopes(cursor.element);

/**
 * The box each period was last left on, by card element, so ↵ comes back to where the cursor was
 * rather than to the top of the period every time.
 */
const lastBox = new WeakMap<HTMLElement, HTMLElement>();

// A store rather than React state, so that moving the cursor re-renders only what reads it (the
// hint line), and a component test can render a box with no provider above it at all.
interface Store {
  cursor: Cursor | null;
  scope: BoxScope | null;
  period: PeriodScope | null;
  modality: Modality;
  platform: Platform;
  listeners: Set<() => void>;
  focusBox: (element: HTMLElement, scope: BoxScope, slot: SlotKey) => void;
  focusPeriod: (element: HTMLElement, scope: PeriodScope) => void;
  blur: (element: HTMLElement) => void;
}

const StoreContext = createContext<Store | null>(null);
const ScopeContext = createContext<BoxScope | null>(null);

function createStore(platform: Platform): Store {
  const store: Store = {
    cursor: null,
    scope: null,
    period: null,
    modality: "pointer",
    platform,
    listeners: new Set(),
    focusBox: (element, scope, slot) => {
      store.cursor = { level: "box", element, slot };
      store.scope = scope;
      // Remember it for the period's ↵, which comes back to the box last left.
      const card = periodOf(element);
      if (card) lastBox.set(card, element);
      emit(store);
    },
    focusPeriod: (element, scope) => {
      store.cursor = { level: "period", element };
      store.period = scope;
      emit(store);
    },
    blur: (element) => {
      // Focus may already have moved on to the next box, which took the cursor before this one
      // gave it up; only whatever still holds it may clear it.
      if (store.cursor?.element !== element) return;
      store.cursor = null;
      emit(store);
    },
  };
  return store;
}

const emit = (store: Store) => {
  for (const listener of store.listeners) listener();
};

const rectOf = (el: HTMLElement, key: string): BoxRect => {
  const { x, y, width, height } = el.getBoundingClientRect();
  return { key, x, y, width, height };
};

/**
 * Moving the cursor about the page from a *box*. Both walks span the whole document rather than one
 * period, so ↑ and ↓ cross from a period into the one above or below it, and ⇥ carries on into the
 * next.
 */
function boxNav(element: HTMLElement): CursorNav {
  return {
    element,
    move: (dir: Direction) => {
      const all = boxElements();
      const self = all.indexOf(element);
      if (self === -1) return;
      // Viewport rects, so boxes on different canvases are measured against one another.
      const rects = all.map((el, i) => rectOf(el, String(i)));
      const winner = nearestInDirection(rects[self], rects, dir);
      if (winner !== undefined) all[Number(winner)]?.focus();
    },
    step: (delta) => {
      const next = stepBox(element, delta);
      // Past the last box the walk is over: the keystroke is left to the browser, whose own tab
      // order carries on out of the canvas rather than trapping the cursor inside it.
      if (!next) return false;
      next.focus();
      return true;
    },
    // esc steps out exactly one level: from a box onto the period it is in.
    exit: () => (periodOf(element) ?? element).focus(),
  };
}

/**
 * Moving the cursor from a *period*: ↑ and ↓ are the periods either side of it, not the boxes —
 * the card is a level above them, so the arrows move at that level.
 */
function periodNav(element: HTMLElement): PeriodNav {
  return {
    element,
    // Back in at the box the cursor last left this period on; the first time, at its first box —
    // the subject, which is where a period starts.
    enter: () => {
      const last = lastBox.get(element);
      const box = last?.isConnected ? last : element.querySelector<HTMLElement>("[data-kb-box]");
      // An empty period draws no canvas and so has no boxes — only its opening word picker, which
      // is where its cursor belongs until a first word puts boxes there.
      (box ?? element.querySelector<HTMLElement>("input"))?.focus();
    },
    move: (dir: Direction) => {
      if (dir !== "up" && dir !== "down") return;
      stepPeriod(element, dir === "down" ? 1 : -1)?.focus();
    },
    step: (delta) => {
      const next = stepPeriod(element, delta);
      if (!next) return false;
      next.focus();
      return true;
    },
    // Above the period there is nothing yet: the app level is phase 4's.
    exit: () => element.blur(),
  };
}

export function KeyboardProvider({ children }: { children: ReactNode }) {
  const platform = useMemo(currentPlatform, []);
  const store = useRef<Store | null>(null);
  store.current ??= createStore(platform);
  const value = store.current;

  useEffect(() => {
    const setModality = (modality: Modality) => {
      if (value.modality === modality) return;
      value.modality = modality;
      document.body.dataset.input = modality;
      emit(value);
    };

    const onPointerDown = () => setModality("pointer");

    const onKeyDown = (event: KeyboardEvent) => {
      // A modifier held on its own is not yet a reason to dress the canvas up in key tips.
      if (!event.metaKey && !event.ctrlKey && !event.altKey) setModality("keyboard");
      // An open word picker is a text field, and it owns every key inside it (the plan's §4.5
      // gives it a map of its own in phase 2).
      if (isEditableTarget(event.target)) return;
      const cursor = value.cursor;
      if (!cursor) return;
      const matches = (spec: string) => matchesKeySpec(spec, event, value.platform);
      // The cursor's level picks the keymap, so a box key and a period key never see each other's
      // context — nor each other's letter (the plan's §2).
      const taken =
        cursor.level === "box"
          ? run(
              KEYMAP,
              scopesOf(cursor),
              matches,
              value.scope?.build(cursor.slot),
              boxNav(cursor.element),
            )
          : run(
              PERIOD_KEYMAP,
              scopesOf(cursor),
              matches,
              value.period?.build(),
              periodNav(cursor.element),
            );
      if (taken) event.preventDefault();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [value]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

/**
 * Look a keystroke up in one level's keymap and run what it finds. Answers whether the keystroke
 * was taken — a command may decline it (the walk off the last box), leaving it to the browser.
 */
function run<L extends object, N extends CursorNav>(
  commands: readonly Command<L & { nav: N }>[],
  scopes: Scope[],
  matches: (spec: string) => boolean,
  level: L | null | undefined,
  nav: N,
): boolean {
  if (!level) return false;
  const ctx = { ...level, nav };
  const command = resolveCommand(commands, scopes, matches, ctx);
  if (!command) return false;
  return command.run(ctx) !== false;
}

function useSnapshot<T>(pick: (store: Store) => T, fallback: T): T {
  const store = useContext(StoreContext);
  return useSyncExternalStore(
    (listener) => {
      if (!store) return () => {};
      store.listeners.add(listener);
      return () => {
        store.listeners.delete(listener);
      };
    },
    () => (store ? pick(store) : fallback),
    () => fallback,
  );
}

/** Whether the user is driving with the keyboard — what decides whether key tips are shown. */
export function useInputModality(): Modality {
  return useSnapshot((s) => s.modality, "pointer");
}

/**
 * Where the cursor rests, the scopes its keys answer to, and the live handlers — whichever level
 * it is at. Read by the hint line, which lists that level's keys.
 */
export type CursorContext =
  | { cursor: Cursor; scopes: Scope[]; box: BoxKeyContext; period?: undefined }
  | { cursor: Cursor; scopes: Scope[]; period: PeriodKeyContext; box?: undefined };

export function useCursorContext(): CursorContext | null {
  const store = useContext(StoreContext);
  const cursor = useSnapshot((s) => s.cursor, null);
  if (!store || !cursor) return null;
  const scopes = scopesOf(cursor);
  if (cursor.level === "period") {
    const period = store.period?.build();
    return period ? { cursor, scopes, period: { ...period, nav: periodNav(cursor.element) } } : null;
  }
  const box = store.scope?.build(cursor.slot);
  return box ? { cursor, scopes, box: { ...box, nav: boxNav(cursor.element) } } : null;
}

/** The platform the keycaps are drawn for. */
export function useKeyPlatform(): Platform {
  return useContext(StoreContext)?.platform ?? currentPlatform();
}

/**
 * A builder publishes how to turn one of its slots into the handlers for it. The returned scope is
 * a stable object whose `build` is replaced every render, so a command always runs against the
 * current selection — and it is provided to the subtree, so a hosted ring's own builder (a
 * conjunct's, an owner's) overrides its parent's for the boxes it draws.
 */
export function useBoxScope(build: (slot: SlotKey) => BoxContext | null): BoxScope {
  const scope = useRef<BoxScope | null>(null);
  scope.current ??= { build };
  scope.current.build = build;
  return scope.current;
}

export function BoxScopeProvider({ scope, children }: { scope: BoxScope; children: ReactNode }) {
  return <ScopeContext.Provider value={scope}>{children}</ScopeContext.Provider>;
}

/**
 * The focus handlers and DOM attributes one word box wears: it declares its scopes for the
 * resolver, joins the walk the arrows and ⇥ move over, and takes the cursor while it is focused.
 */
export function useBoxCursor(slot: SlotKey, scopes: Scope[]) {
  const store = useContext(StoreContext);
  const scope = useContext(ScopeContext);
  return {
    "data-kb-box": slot,
    "data-kb-scope": scopes.join(" "),
    tabIndex: 0,
    onFocus: (event: { currentTarget: HTMLElement }) => {
      if (store && scope) store.focusBox(event.currentTarget, scope, slot);
    },
    onBlur: (event: { currentTarget: HTMLElement }) => {
      store?.blur(event.currentTarget);
    },
  };
}

/**
 * A period card publishes its own controls, and takes the cursor while it holds focus.
 *
 * The card is not in the ⇥ walk — that walks *words* — so its tabIndex is −1: it is reached by
 * stepping out of a box with esc, or by ↑ and ↓ from another period.
 */
export function usePeriodCursor(build: () => PeriodContext | null, id: string | undefined) {
  const store = useContext(StoreContext);
  const scope = useRef<PeriodScope | null>(null);
  scope.current ??= { build };
  scope.current.build = build;
  return {
    "data-kb-period": id ?? "",
    "data-kb-scope": "period",
    tabIndex: -1,
    onFocus: (event: { currentTarget: HTMLElement; target: EventTarget }) => {
      // Only the card itself: focus bubbling up from a box inside it belongs to that box.
      if (event.target !== event.currentTarget) return;
      if (store && scope.current) store.focusPeriod(event.currentTarget, scope.current);
    },
    onBlur: (event: { currentTarget: HTMLElement }) => {
      store?.blur(event.currentTarget);
    },
  };
}

/** Whether the cursor rests on this period card — what lights its ring. */
export function usePeriodHasCursor(element: HTMLElement | null): boolean {
  const cursor = useSnapshot((s) => s.cursor, null);
  return Boolean(element) && cursor?.level === "period" && cursor.element === element;
}
