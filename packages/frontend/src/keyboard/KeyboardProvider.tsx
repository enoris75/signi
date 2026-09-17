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
import { resolveCommand, type BoxContext, type CursorNav, type KeyContext } from "./keymap.ts";
import { boxElements, stepBox } from "./boxes.ts";
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

/** Where the cursor rests, as the rest of the app reads it. */
export interface Cursor {
  element: HTMLElement;
  slot: SlotKey;
}

/**
 * The scopes the cursor's keys are looked up in, read off the box's own `data-kb-scope` at the
 * moment the key is pressed rather than remembered from when focus arrived — a box's scopes follow
 * the word in it ("seems happy" against "becomes a legend"), and that word can change under a
 * cursor that never moved.
 */
const scopesOf = (cursor: Cursor): Scope[] => resolveScopes(cursor.element);

// A store rather than React state, so that moving the cursor re-renders only what reads it (the
// hint line), and a component test can render a box with no provider above it at all.
interface Store {
  cursor: Cursor | null;
  scope: BoxScope | null;
  modality: Modality;
  platform: Platform;
  listeners: Set<() => void>;
  focusBox: (element: HTMLElement, scope: BoxScope, slot: SlotKey) => void;
  blurBox: (element: HTMLElement) => void;
}

const StoreContext = createContext<Store | null>(null);
const ScopeContext = createContext<BoxScope | null>(null);

function createStore(platform: Platform): Store {
  const store: Store = {
    cursor: null,
    scope: null,
    modality: "pointer",
    platform,
    listeners: new Set(),
    focusBox: (element, scope, slot) => {
      store.cursor = { element, slot };
      store.scope = scope;
      emit(store);
    },
    blurBox: (element) => {
      // Focus may already have moved on to the next box, which took the cursor before this one
      // gave it up; only the box still holding it may clear it.
      if (store.cursor?.element !== element) return;
      store.cursor = null;
      store.scope = null;
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
 * Moving the cursor about the page. Both walks span the whole document rather than one period, so
 * ↑ and ↓ cross from a period into the one above or below it, and ⇥ carries on into the next.
 */
function cursorNav(element: HTMLElement): CursorNav {
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
      const box = cursor && value.scope?.build(cursor.slot);
      if (!cursor || !box) return;
      const ctx: KeyContext = { ...box, nav: cursorNav(cursor.element) };
      const command = resolveCommand(
        scopesOf(cursor),
        (spec) => matchesKeySpec(spec, event, value.platform),
        ctx,
      );
      if (!command) return;
      // A command may decline the keystroke (the walk off the last box), leaving it to the browser.
      if (command.run(ctx) === false) return;
      event.preventDefault();
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

/** Where the cursor rests, the scopes its keys answer to, and the live handlers. For the hint line. */
export function useCursorContext(): { cursor: Cursor; scopes: Scope[]; ctx: KeyContext } | null {
  const store = useContext(StoreContext);
  const cursor = useSnapshot((s) => s.cursor, null);
  if (!store || !cursor) return null;
  const box = store.scope?.build(cursor.slot);
  if (!box) return null;
  return { cursor, scopes: scopesOf(cursor), ctx: { ...box, nav: cursorNav(cursor.element) } };
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
      store?.blurBox(event.currentTarget);
    },
  };
}
