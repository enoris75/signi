import React, { useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import CloseIcon from "@mui/icons-material/Close";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import { PhraseBuilder } from "./PhraseBuilder.tsx";
import { PeriodSaveLoad } from "./PeriodSaveLoad.tsx";
import {
  COORD_CONJUNCTION_LABEL,
  PhraseContainer,
  PhraseLink,
  PhraseSelection,
  WorkspaceBinding,
} from "./interfaces.ts";
import { MUI_COLOR_HEX } from "./slots.ts";
import { boxKey, useConnectors } from "./useConnectors.ts";
import { uid, useWorkspaceLinks } from "./useWorkspaceLinks.ts";
import { useUiString } from "../../i18n/useUiString.ts";

interface Props {
  containers: PhraseContainer[];
  links: PhraseLink[];
  setContainers: React.Dispatch<React.SetStateAction<PhraseContainer[]>>;
  setLinks: React.Dispatch<React.SetStateAction<PhraseLink[]>>;
  wordsPanelOpen: boolean;
  onWordsPanelClose: () => void;
}

// The workspace: a vertical stack of independent phrase containers plus the cross-container
// relative-clause links between them. Owns pick-mode and the link-connector overlay.
export function PhraseWorkspace({
  containers,
  links,
  setContainers,
  setLinks,
  wordsPanelOpen,
  onWordsPanelClose,
}: Props) {
  const t = useUiString();
  // The cross-container link graph — the four relations a period can take part in, plus the
  // pick-mode that builds them. It owns the rules (no cycles, one subordinate role per period)
  // and hands back each container's link compartments; this component only lays the stack out.
  const { pick, cancelPick, compartmentsFor, dropContainer } = useWorkspaceLinks(
    containers,
    links,
    setLinks,
  );
  // Period (single-clause) save/load: which container's save dialog is open, and whether
  // the "add a saved period" picker is open. See PeriodSaveLoad.
  const [savePeriodId, setSavePeriodId] = useState<string | null>(null);
  const [loadPeriodOpen, setLoadPeriodOpen] = useState(false);
  // The link-connector geometry: ref maps a child container registers its anchors/boxes
  // into, plus the connectors measured from them for the SVG overlay.
  const {
    workspaceRef,
    boxEls,
    sourceAnchorEls,
    targetAnchorEls,
    borderAnchorEls,
    verbAnchorEls,
    bumpGeom,
    connectors,
  } = useConnectors(links, t("slot.instrumental").toLowerCase());

  const makeContainerUpdate =
    (id: string) => (updater: (prev: PhraseSelection) => PhraseSelection) =>
      setContainers((cs) =>
        cs.map((c) =>
          c.id === id ? { ...c, selection: updater(c.selection) } : c,
        ),
      );

  function addContainer() {
    setContainers((cs) => [...cs, { id: uid(), selection: {} }]);
  }

  // Swap a container with its neighbour. Links are keyed by container id, so they follow
  // their containers; the connector overlay re-measures on the resulting render.
  function moveContainer(id: string, delta: -1 | 1) {
    setContainers((cs) => {
      const i = cs.findIndex((c) => c.id === id);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= cs.length) return cs;
      const next = [...cs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function removeContainer(id: string) {
    // The workspace always keeps at least one period: removing the last remaining
    // container clears its content in place rather than leaving an empty workspace.
    setContainers((cs) =>
      cs.length > 1
        ? cs.filter((c) => c.id !== id)
        : cs.map((c) => (c.id === id ? { ...c, selection: {} } : c)),
    );
    dropContainer(id);
  }

  return (
    <Box ref={workspaceRef} sx={{ position: "relative" }}>
      {/* Cross-container relative-clause link lines, painted over the whole stack. */}
      {connectors.length > 0 && (
        <Box
          component="svg"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 2,
            pointerEvents: "none",
            overflow: "visible",
          }}
        >
          <defs>
            {/* Arrowheads for the clause-level connectors, pointing at the linked clause. */}
            <marker
              id="conditional-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L6,3 L0,6 Z" fill={MUI_COLOR_HEX.warning} />
            </marker>
            <marker
              id="coordinative-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L6,3 L0,6 Z" fill={MUI_COLOR_HEX.info} />
            </marker>
            <marker
              id="instrumental-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L6,3 L0,6 Z" fill={MUI_COLOR_HEX.secondary} />
            </marker>
          </defs>
          {connectors.map((c) => {
            if (
              c.kind === "conditional" ||
              c.kind === "coordinative" ||
              c.kind === "instrumental"
            ) {
              // Elbow route through the right-hand gutter: out from the first clause's control,
              // down the gutter, back in to the linked clause's control. The instrumental link
              // starts on the verb box's bottom edge rather than on a card border, so it drops
              // clear of that edge before turning, otherwise its first run traces the border.
              const midX = Math.max(c.x1, c.x2) + 24;
              const midY = (c.y1 + c.y2) / 2;
              const startY = c.kind === "instrumental" ? c.y1 + 24 : c.y1;
              const d = `M ${c.x1} ${c.y1} V ${startY} H ${midX} V ${c.y2} H ${c.x2}`;
              const marker =
                c.kind === "conditional"
                  ? "url(#conditional-arrow)"
                  : c.kind === "coordinative"
                    ? "url(#coordinative-arrow)"
                    : "url(#instrumental-arrow)";
              return (
                <g key={c.id}>
                  <path
                    d={d}
                    fill="none"
                    stroke={c.color}
                    strokeWidth="2"
                    strokeOpacity="0.85"
                    strokeLinejoin="round"
                    markerEnd={marker}
                  />
                  {/* Conjunction label ("if" / "and" / "but" / …) on the vertical run. */}
                  <text
                    x={midX + 5}
                    y={midY}
                    fill={c.color}
                    fontSize="11"
                    fontWeight="700"
                    textAnchor="start"
                    dominantBaseline="middle"
                  >
                    {c.label}
                  </text>
                </g>
              );
            }
            return (
              <line
                key={c.id}
                x1={c.x1}
                y1={c.y1}
                x2={c.x2}
                y2={c.y2}
                stroke={c.color}
                strokeWidth="1.75"
                strokeOpacity="0.5"
                strokeDasharray="5 3"
              />
            );
          })}
        </Box>
      )}

      <Stack spacing={2}>
        {containers.map((c, i) => {
          const binding: WorkspaceBinding = {
            containerId: c.id,
            pickActive: pick.active,
            // The link compartments come off the graph; only the geometry is this component's,
            // since it wires each container's boxes and anchors into the connector registry.
            ...compartmentsFor(c),
            geometry: {
              registerBox: (nounKey, el) => {
                const k = boxKey(c.id, nounKey);
                if (el) boxEls.current.set(k, el);
                else boxEls.current.delete(k);
              },
              registerSourceAnchor: (nounKey, el) => {
                const k = boxKey(c.id, nounKey);
                if (el) sourceAnchorEls.current.set(k, el);
                else sourceAnchorEls.current.delete(k);
              },
              registerTargetAnchor: (nounKey, el) => {
                const k = boxKey(c.id, nounKey);
                if (el) targetAnchorEls.current.set(k, el);
                else targetAnchorEls.current.delete(k);
              },
              registerBorderAnchor: (el) => {
                if (el) borderAnchorEls.current.set(c.id, el);
                else borderAnchorEls.current.delete(c.id);
              },
              registerVerbAnchor: (el) => {
                if (el) verbAnchorEls.current.set(c.id, el);
                else verbAnchorEls.current.delete(c.id);
              },
              onGeometryChange: bumpGeom,
            },
          };
          return (
            <PhraseBuilder
              key={c.id}
              containerId={c.id}
              binding={binding}
              selection={c.selection}
              onPhraseUpdate={makeContainerUpdate(c.id)}
              onRemove={() => removeContainer(c.id)}
              // The sole container can't be deleted (the workspace always keeps one), so
              // its header control clears the content in place instead of removing it.
              soleContainer={containers.length === 1}
              // Reorder controls, omitted at each end of the stack so the header can
              // disable the button that has nowhere to go.
              onMoveUp={i > 0 ? () => moveContainer(c.id, -1) : undefined}
              onMoveDown={
                i < containers.length - 1
                  ? () => moveContainer(c.id, 1)
                  : undefined
              }
              onSave={() => setSavePeriodId(c.id)}
              // The word palette rides only the first container to avoid ambiguity.
              wordsPanelOpen={i === 0 ? wordsPanelOpen : false}
              onWordsPanelClose={onWordsPanelClose}
            />
          );
        })}
      </Stack>

      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
        <Button
          onClick={addContainer}
          startIcon={<AddIcon />}
          size="small"
          variant="outlined"
          sx={{ textTransform: "none" }}
        >
          {t("action.addPeriodContainer")}
        </Button>
        <Button
          onClick={() => setLoadPeriodOpen(true)}
          startIcon={<FolderOpenOutlinedIcon />}
          size="small"
          variant="text"
          sx={{ textTransform: "none" }}
        >
          {t("action.loadPeriod")}
        </Button>
      </Box>

      {/* Per-period (single-clause) save + load dialogs. */}
      <PeriodSaveLoad
        saveTarget={containers.find((c) => c.id === savePeriodId) ?? null}
        onCloseSave={() => setSavePeriodId(null)}
        loadOpen={loadPeriodOpen}
        onCloseLoad={() => setLoadPeriodOpen(false)}
        onAppendPeriod={(selection) =>
          setContainers((cs) => [...cs, { id: uid(), selection }])
        }
      />

      {/* Pick-mode banner: prompt to click a noun in another container. */}
      {pick.active && (
        <Box
          sx={{
            position: "sticky",
            bottom: 12,
            mt: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 1,
            borderRadius: 2,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            boxShadow: 3,
            zIndex: 3,
          }}
        >
          <AccountTreeIcon sx={{ fontSize: 18 }} />
          <Typography sx={{ fontSize: "0.8rem", flex: 1 }}>
            {pick.active && pick.kind === "conditional"
              ? "Click the period that is the IF condition — in another phrase container."
              : pick.active && pick.kind === "coordinative"
                ? `Click the period to coordinate with “${COORD_CONJUNCTION_LABEL[pick.conjunction]}” — in another phrase container.`
                : pick.active && pick.kind === "instrumental"
                  ? `Click the period holding the ${t("slot.instrumental").toLowerCase()} — a period with no verb, whose noun is what the action is done with.`
                  : "Click the noun this clause describes — in another phrase container."}
          </Typography>
          <Button
            size="small"
            onClick={cancelPick}
            startIcon={<CloseIcon sx={{ fontSize: 15 }} />}
            sx={{ color: "primary.contrastText", textTransform: "none" }}
          >
            Cancel
          </Button>
        </Box>
      )}
    </Box>
  );
}
