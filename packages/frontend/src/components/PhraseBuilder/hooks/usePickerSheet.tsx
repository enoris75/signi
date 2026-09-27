import { createContext, useContext, type ReactNode } from "react";

/**
 * Whether a word picker is rendering inside the Phrase view's full-screen sheet (P17's `RoleList`)
 * rather than its usual home, a small anchored dropdown over a canvas box. The two need different
 * shapes: on the canvas the dropdown floats beside a box a few dozen pixels wide, so a short,
 * narrow `Popper` is the right size; in the sheet it is the only thing on the screen, so it should
 * fill the screen rather than leave most of a tall `Drawer` blank under a small floating card.
 *
 * An ambient flag, not a threaded prop, for the same reason `useMayTakeFocus` (`ConsoleMarks.tsx`)
 * is one: every word picker sits several components below the one that knows which context it is
 * in (`SlotTypeahead.tsx`'s `pickerFor` fans out to nine of them), and none of the layers between
 * do anything with the answer but pass it on.
 */
const PickerSheetContext = createContext(false);

export function PickerSheetProvider({ sheet, children }: { sheet: boolean; children: ReactNode }) {
  return <PickerSheetContext.Provider value={sheet}>{children}</PickerSheetContext.Provider>;
}

export function usePickerSheet(): boolean {
  return useContext(PickerSheetContext);
}
