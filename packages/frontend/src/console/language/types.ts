import type { Concept, GrammaticalRole, LanguageCode, UiStringKey } from "@signi/shared";
import type {
  NounAddress,
  PhraseContainer,
  PhraseLink,
  SlotKey,
} from "../../components/PhraseBuilder/interfaces.ts";

/**
 * The console's view of the phrase: the workspace itself, the same `{containers, links}` the canvas
 * edits. The console never keeps a copy of its own — it reads text out of this and turns text into
 * a new one (see apply and print).
 */
export interface WorkspaceState {
  containers: PhraseContainer[];
  links: PhraseLink[];
}

/**
 * One word box of the workspace: a slot of a period, or of a noun phrase nested in one — a possessor
 * or a conjunct, whose own head is its `subject` slot (see NounAddress).
 */
export interface WordRef {
  containerId: string;
  /** The address of the nested phrase's head, for a word in a possessor or a conjunct. */
  slice?: NounAddress;
  slot: SlotKey;
  /**
   * The adjective describing the attributive noun in `slot` itself ("*semantic* phrase creator"),
   * which lives on that noun's footer chip rather than in a slot of its own.
   */
  modifierAdjective?: boolean;
}

/**
 * Where the next command attaches — the console's working directory. It is the canvas cursor: the
 * period it is in, and the box it rests on, if any.
 */
export interface ConsoleContext {
  containerId: string;
  word?: WordRef;
}

/** Something wrong with a line, where it is, and what to do about it. */
export interface Diagnostic {
  from: number;
  to: number;
  /** English: the fallback for `messageKey`, which the prompt shows when there is one. */
  message: string;
  messageKey?: UiStringKey;
}

/**
 * The words the console can name, per grammatical role, and how the interface language shows them.
 * It is the pickers' own data (the react-query cache `useConcepts` fills), so resolving a word needs
 * no request of its own.
 */
export interface Vocabulary {
  concepts: Partial<Record<GrammaticalRole, Concept[]>>;
  language: LanguageCode;
  /** The word as the pickers show it in the interface language (see conceptWord). */
  label: (concept: Concept) => string;
  /** The English gloss the pickers show beside a word, where there is one. */
  gloss?: (concept: Concept) => string | undefined;
}

/** A source span. */
export interface Span {
  from: number;
  to: number;
}
