import { Box, InputBase, Paper, Popper } from "@mui/material";
import type { ReactNode } from "react";
import type { Concept } from "@signi/shared";
import { useRef } from "react";
import { ConceptOption } from "./ConceptOption.tsx";
import { PICKER_FONT, PromptWidth } from "./PromptWidth.tsx";
import { PickerFooter } from "./PickerFooter.tsx";
import type { PickerKeys } from "./hooks/usePickerKeys.ts";
import { usePickerSheet } from "./hooks/usePickerSheet.tsx";
import { useMayTakeFocus } from "../../console/ConsoleMarks.tsx";

/**
 * The shape every single-vocabulary word picker has: a field inside the box, and a dropdown of the
 * words the query leaves, optionally under a category switch. Only the vocabulary and the prompt
 * differ between them, and their keys are all `usePickerKeys`.
 */
export function PickerList({
  picker,
  placeholder,
  inputProps,
  header,
  minWidth = 160,
}: {
  picker: PickerKeys<Concept>;
  placeholder: string;
  inputProps?: Record<string, unknown>;
  header?: ReactNode;
  minWidth?: number;
}) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const { open, filtered, highlightedIdx, inTabs, listRef } = picker;
  const mayTakeFocus = useMayTakeFocus();
  const sheet = usePickerSheet();
  const dropdownOpen = (open && filtered.length > 0) || Boolean(header && open);

  // Shared between a floating popper (over a canvas box) and a panel filling the Phrase view's
  // full-screen sheet (see usePickerSheet.tsx) — only the frame around it differs.
  const dropdown = (
    <Paper
      data-testid="picker-list"
      elevation={sheet ? 0 : 4}
      sx={sheet ? { display: "flex", flexDirection: "column", flex: 1, minHeight: 0, width: "100%", overflow: "hidden" } : { minWidth, overflow: "hidden" }}
    >
      {header && (
        <Box
          data-kb-tabs={inTabs ? "" : undefined}
          sx={{
            px: 1,
            py: 0.5,
            flexShrink: 0,
            borderBottom: "1px solid",
            borderColor: "divider",
            // While the cursor is up here, the switch is what ← → act on — the box says so.
            bgcolor: inTabs ? "action.selected" : "background.paper",
          }}
        >
          {header}
        </Box>
      )}
      <Box ref={listRef} sx={sheet ? { flex: 1, minHeight: 0, overflow: "auto", py: 0.5 } : { maxHeight: 200, overflow: "auto", py: 0.5 }}>
        {filtered.map((concept, i) => (
          <ConceptOption
            key={concept.id}
            concept={concept}
            highlighted={!inTabs && i === highlightedIdx}
            onMouseEnter={() => picker.setHighlightedIdx(i)}
            onClick={() => picker.commit(i)}
          />
        ))}
      </Box>
      <PickerFooter />
    </Paper>
  );

  return (
    <Box
      ref={anchorRef}
      onPointerDown={(e) => e.stopPropagation()}
      sx={sheet ? { display: "flex", flexDirection: "column", height: "100%", minHeight: 0 } : { mt: 0.25 }}
    >
      <PromptWidth prompt={placeholder}>
        <InputBase
          autoFocus={mayTakeFocus}
          value={picker.query}
          onChange={picker.onChange}
          onFocus={picker.onFocus}
          onBlur={picker.onBlur}
          onKeyDown={picker.onKeyDown}
          placeholder={placeholder}
          inputProps={inputProps}
          sx={{ ...PICKER_FONT, color: "text.primary", width: "100%", "& input": { p: 0 } }}
        />
      </PromptWidth>
      {sheet ? (
        dropdownOpen && (
          <Box sx={{ mt: 1, flex: 1, minHeight: 0, display: "flex" }}>
            {dropdown}
          </Box>
        )
      ) : (
        <Popper
          // A header keeps the dropdown up with nothing matching — the category switch is the way
          // out of an empty list, so it must not vanish with the rows it has none of.
          open={dropdownOpen}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          style={{ zIndex: 1300 }}
          modifiers={[{ name: "offset", options: { offset: [0, 4] } }]}
        >
          {dropdown}
        </Popper>
      )}
    </Box>
  );
}
