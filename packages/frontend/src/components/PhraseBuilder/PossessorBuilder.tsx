import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import KeyIcon from "@mui/icons-material/Key";
import type { Concept } from "@signi/shared";
import { SlotBox, NumberToggleBox, GenderToggleBox } from "./Boxes.tsx";
import { DirectObjectTypeahead } from "./DirectObjectTypeahead.tsx";
import { AdjectiveTypeahead } from "./AdjectiveTypeahead.tsx";
import { conceptLabel } from "./satellites.tsx";
import { applyConceptSelect, applyClear } from "./phraseReducers.ts";
import type { PhraseSelection, SlotConfig } from "./interfaces.ts";

// Deepest possessor chain the UI offers ("the child's cat's book" = depth 2). The engine
// itself is unbounded; this only caps how many "add possessor" buttons the panel exposes.
const MAX_DEPTH = 3;

const NOUN_SLOT: SlotConfig = {
  key: "subject",
  label: "Possessor",
  required: false,
  roles: ["noun"],
  color: "info",
};
const ADJ_SLOT: SlotConfig = {
  key: "subjectAdjective",
  label: "Adjective",
  required: false,
  roles: ["adjective"],
  color: "error",
};
const ADJ2_SLOT: SlotConfig = { ...ADJ_SLOT, key: "subjectAdjective2", label: "Adjective 2" };

// A small clickable pill wrapping one of the display-only toggle boxes.
function ToggleControl({ title, onClick, children }: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip title={title}>
      <Box onClick={onClick} sx={{ cursor: "pointer" }}>
        {children}
      </Box>
    </Tooltip>
  );
}

/**
 * A compact, recursive editor for a noun phrase's possessor (Saxon genitive). It edits a
 * nested `PhraseSelection` whose head noun lives in the `subject` slot — so number, gender,
 * adjectives, and a further nested possessor all reuse the `subject*` reducers and fields,
 * exactly as `selectionToPlan` reads them back out.
 */
export function PossessorBuilder({
  selection,
  parentLabel,
  onUpdate,
  onRemove,
  depth = 1,
}: {
  selection: PhraseSelection;
  parentLabel?: string;
  onUpdate: (updater: (prev: PhraseSelection) => PhraseSelection) => void;
  onRemove: () => void;
  depth?: number;
}) {
  const head = selection.subject;
  const number = selection.subjectNumber ?? "singular";
  const gender = selection.subjectGender ?? "masc";
  const adj1 = selection.subjectAdjective;
  const adj2 = selection.subjectAdjective2;
  const nested = selection.subjectPossessor;

  const setHead = (c: Concept) =>
    onUpdate((prev) => applyConceptSelect(prev, "subject", c));
  const toggleNumber = () =>
    onUpdate((prev) => ({
      ...prev,
      subjectNumber: prev.subjectNumber === "plural" ? "singular" : "plural",
    }));
  const toggleGender = () =>
    onUpdate((prev) => ({
      ...prev,
      subjectGender: prev.subjectGender === "fem" ? "masc" : "fem",
    }));

  const nestedUpdate = (updater: (prev: PhraseSelection) => PhraseSelection) =>
    onUpdate((prev) => ({ ...prev, subjectPossessor: updater(prev.subjectPossessor ?? {}) }));
  const removeNested = () =>
    onUpdate((prev) => {
      const next = { ...prev };
      delete next.subjectPossessor;
      return next;
    });

  return (
    <Box
      sx={{
        p: 1.5,
        border: "1px solid",
        borderColor: "divider",
        borderLeft: "3px solid",
        borderLeftColor: "info.light",
        bgcolor: "action.hover",
        borderRadius: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Typography
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "text.secondary",
          }}
        >
          {parentLabel ?? "…"}{" "}
          <Box component="span" sx={{ color: "text.disabled", fontWeight: 500 }}>
            · possessed by …
          </Box>
        </Typography>
        <IconButton size="small" onClick={onRemove} aria-label="Remove possessor" sx={{ p: 0.25 }}>
          <CloseIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", flexWrap: "wrap" }}>
        <SlotBox
          slot={NOUN_SLOT}
          concept={head}
          isActive={!head}
          onClear={onRemove}
          emptyContent={<DirectObjectTypeahead onSelect={setHead} />}
        />

        {head && (
          <>
            <ToggleControl title={`Number: ${number}`} onClick={toggleNumber}>
              <NumberToggleBox value={number} />
            </ToggleControl>
            {head.gendered && (
              <ToggleControl title={`Gender: ${gender}`} onClick={toggleGender}>
                <GenderToggleBox value={gender} />
              </ToggleControl>
            )}

            <SlotBox
              slot={ADJ_SLOT}
              concept={adj1}
              isActive={false}
              onClear={() => onUpdate((prev) => applyClear(prev, "subjectAdjective"))}
              emptyContent={
                <AdjectiveTypeahead
                  onSelect={(c) => onUpdate((prev) => applyConceptSelect(prev, "subjectAdjective", c))}
                />
              }
            />
            {adj1 && (
              <SlotBox
                slot={ADJ2_SLOT}
                concept={adj2}
                isActive={false}
                onClear={() => onUpdate((prev) => applyClear(prev, "subjectAdjective2"))}
                emptyContent={
                  <AdjectiveTypeahead
                    onSelect={(c) => onUpdate((prev) => applyConceptSelect(prev, "subjectAdjective2", c))}
                  />
                }
              />
            )}

            {/* Its own possessor ("the cat's owner's book"), up to MAX_DEPTH deep. */}
            {!nested?.subject && depth < MAX_DEPTH && (
              <Tooltip title="Add a possessor">
                <IconButton
                  size="small"
                  onClick={() => nestedUpdate((p) => p)}
                  aria-label="Add possessor"
                  sx={{ mt: 0.5, color: "info.main" }}
                >
                  <KeyIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </>
        )}
      </Box>

      {head && nested !== undefined && depth < MAX_DEPTH && (
        <Box sx={{ mt: 1.5, pl: 1 }}>
          <PossessorBuilder
            selection={nested}
            parentLabel={conceptLabel(head)}
            onUpdate={nestedUpdate}
            onRemove={removeNested}
            depth={depth + 1}
          />
        </Box>
      )}
    </Box>
  );
}
