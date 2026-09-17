import { Box, InputBase, Paper, Popper } from "@mui/material";
import type { ReactNode } from "react";
import type { Concept } from "@signi/shared";
import { useRef } from "react";
import { ConceptOption } from "./ConceptOption.tsx";
import { PICKER_FONT, PromptWidth } from "./PromptWidth.tsx";
import { PickerFooter } from "./PickerFooter.tsx";
import type { PickerKeys } from "./hooks/usePickerKeys.ts";

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

  return (
    <Box ref={anchorRef} onPointerDown={(e) => e.stopPropagation()} sx={{ mt: 0.25 }}>
      <PromptWidth prompt={placeholder}>
        <InputBase
          autoFocus
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
      <Popper
        // A header keeps the dropdown up with nothing matching — the category switch is the way
        // out of an empty list, so it must not vanish with the rows it has none of.
        open={(open && filtered.length > 0) || Boolean(header && open)}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        style={{ zIndex: 1300 }}
        modifiers={[{ name: "offset", options: { offset: [0, 4] } }]}
      >
        <Paper elevation={4} sx={{ minWidth, overflow: "hidden" }}>
          {header && (
            <Box
              data-kb-tabs={inTabs ? "" : undefined}
              sx={{
                px: 1,
                py: 0.5,
                borderBottom: "1px solid",
                borderColor: "divider",
                // While the cursor is up here, the switch is what ← → act on — the box says so.
                bgcolor: inTabs ? "action.selected" : "background.paper",
              }}
            >
              {header}
            </Box>
          )}
          <Box ref={listRef} sx={{ maxHeight: 200, overflow: "auto", py: 0.5 }}>
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
      </Popper>
    </Box>
  );
}
