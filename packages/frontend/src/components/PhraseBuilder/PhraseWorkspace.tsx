import React, { useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import CloseIcon from "@mui/icons-material/Close";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import { PhraseBuilder } from "./PhraseBuilder.tsx";
import { PeriodSaveLoad } from "./PeriodSaveLoad.tsx";
import {
  COORD_CONJUNCTION_LABEL,
  CoordConjunction,
  NounAddress,
  NounKey,
  PhraseContainer,
  PhraseLink,
  PhraseSelection,
  PickMode,
  WorkspaceBinding,
  isConditionalLink,
  isCoordinativeLink,
  isRelativeLink,
} from "./interfaces.ts";
import { MUI_COLOR_HEX } from "./slots.ts";
import { boxKey, useConnectors } from "./useConnectors.ts";
import { useUiString } from "../../i18n/useUiString.ts";

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `c${Math.random().toString(36).slice(2)}`;

// Is `candidate` the container `of`, or an ancestor of it (walking up incoming links)?
// Used to reject links that would form a cycle — links are meant to form a forest.
function isSelfOrAncestor(
  candidate: string,
  of: string,
  links: PhraseLink[],
): boolean {
  let cur: string | undefined = of;
  const seen = new Set<string>();
  while (cur) {
    if (cur === candidate) return true;
    if (seen.has(cur)) break;
    seen.add(cur);
    cur = links.find((l) => l.target.containerId === cur)?.source.containerId;
  }
  return false;
}

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
  const [pick, setPick] = useState<PickMode>({ active: false });
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
    bumpGeom,
    connectors,
  } = useConnectors(links);

  // Cancel pick-mode on Escape.
  useEffect(() => {
    if (!pick.active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPick({ active: false });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pick.active]);

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
    // Drop any link touching the removed/cleared container (its targets re-become roots).
    setLinks((ls) =>
      ls.filter(
        (l) => l.source.containerId !== id && l.target.containerId !== id,
      ),
    );
    if (pick.active && pick.source.containerId === id)
      setPick({ active: false });
  }

  function startLink(containerId: string, nounKey: NounAddress) {
    setPick({ active: true, kind: "relative", source: { containerId, nounKey } });
  }

  function removeLink(containerId: string, nounKey: NounAddress) {
    setLinks((ls) =>
      ls.filter(
        (l) =>
          !(
            isRelativeLink(l) &&
            l.source.containerId === containerId &&
            l.source.nounKey === nounKey
          ),
      ),
    );
  }

  function completeLink(targetContainerId: string, targetNoun: NounKey) {
    if (!pick.active || pick.kind !== "relative") return;
    const source = pick.source;
    setPick({ active: false });
    if (
      source.containerId === targetContainerId ||
      isSelfOrAncestor(targetContainerId, source.containerId, links)
    )
      return; // same container or would create a cycle
    setLinks((ls) => {
      const kept = ls.filter((l) =>
        isRelativeLink(l)
          ? // one relative link per source noun, and one incoming link per target container
            !(
              l.source.containerId === source.containerId &&
              l.source.nounKey === source.nounKey
            ) && l.target.containerId !== targetContainerId
          : // a container can't be both a clause-level linked clause and a relativised gap
            l.target.containerId !== targetContainerId,
      );
      return [
        ...kept,
        {
          id: uid(),
          source,
          target: { containerId: targetContainerId, nounKey: targetNoun },
        },
      ];
    });
  }

  // ── Conditional (container-to-container) linking ───────────────────────────
  function startConditional(containerId: string) {
    setPick({ active: true, kind: "conditional", source: { containerId } });
  }

  function clearConditional(mainContainerId: string) {
    setLinks((ls) =>
      ls.filter(
        (l) =>
          !(isConditionalLink(l) && l.source.containerId === mainContainerId),
      ),
    );
  }

  // Whether `id` already takes part in any clause-level (conditional or coordinative) link —
  // as either endpoint. Such a container can't be pulled into a second clause-level relation.
  function inClauseRelation(id: string): boolean {
    return links.some(
      (l) =>
        (isConditionalLink(l) || isCoordinativeLink(l)) &&
        (l.source.containerId === id || l.target.containerId === id),
    );
  }

  // Whether `ifId` may become the "if" clause of the container that started the pick: not
  // itself, no cycle, and free of any other clause-level relation.
  function canBeCondition(mainId: string, ifId: string): boolean {
    if (mainId === ifId) return false;
    if (isSelfOrAncestor(ifId, mainId, links)) return false;
    return !inClauseRelation(ifId);
  }

  // ── Coordinative (container-to-container) linking ──────────────────────────
  function startCoordinative(containerId: string, conjunction: CoordConjunction) {
    setPick({ active: true, kind: "coordinative", conjunction, source: { containerId } });
  }

  function clearCoordinative(firstContainerId: string) {
    setLinks((ls) =>
      ls.filter(
        (l) =>
          !(isCoordinativeLink(l) && l.source.containerId === firstContainerId),
      ),
    );
  }

  // Whether `secondId` may become the coordinated second clause of the pick's first clause:
  // not itself, no cycle, and free of any other clause-level relation.
  function canBeCoordinate(firstId: string, secondId: string): boolean {
    if (firstId === secondId) return false;
    if (isSelfOrAncestor(secondId, firstId, links)) return false;
    return !inClauseRelation(secondId);
  }

  function completeCoordinative(secondContainerId: string) {
    if (!pick.active || pick.kind !== "coordinative") return;
    const firstId = pick.source.containerId;
    const conjunction = pick.conjunction;
    setPick({ active: false });
    if (!canBeCoordinate(firstId, secondContainerId)) return;
    setLinks((ls) => [
      // One coordination per first clause: drop any this container already sources.
      ...ls.filter(
        (l) => !(isCoordinativeLink(l) && l.source.containerId === firstId),
      ),
      {
        id: uid(),
        kind: "coordinative" as const,
        conjunction,
        source: { containerId: firstId },
        target: { containerId: secondContainerId },
      },
    ]);
  }

  function completeConditional(ifContainerId: string) {
    if (!pick.active || pick.kind !== "conditional") return;
    const mainId = pick.source.containerId;
    setPick({ active: false });
    if (!canBeCondition(mainId, ifContainerId)) return;
    setLinks((ls) => [
      // One "if" clause per main clause: drop any conditional this main already sources.
      ...ls.filter(
        (l) => !(isConditionalLink(l) && l.source.containerId === mainId),
      ),
      {
        id: uid(),
        kind: "conditional",
        source: { containerId: mainId },
        target: { containerId: ifContainerId },
      },
    ]);
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
          </defs>
          {connectors.map((c) => {
            if (c.kind === "conditional" || c.kind === "coordinative") {
              // Elbow route through the right-hand gutter: out from the first clause's control,
              // down the gutter, back in to the linked clause's control.
              const midX = Math.max(c.x1, c.x2) + 24;
              const midY = (c.y1 + c.y2) / 2;
              const d = `M ${c.x1} ${c.y1} H ${midX} V ${c.y2} H ${c.x2}`;
              const marker =
                c.kind === "conditional"
                  ? "url(#conditional-arrow)"
                  : "url(#coordinative-arrow)";
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
          const linkSourceKeys = new Set<NounAddress>(
            links
              .filter(isRelativeLink)
              .filter((l) => l.source.containerId === c.id)
              .map((l) => l.source.nounKey),
          );
          const linkTargetKeys = new Set<NounAddress>(
            links
              .filter(isRelativeLink)
              .filter((l) => l.target.containerId === c.id)
              .map((l) => l.target.nounKey),
          );
          const conditionals = links.filter(isConditionalLink);
          const hasConditionalSource = conditionals.some(
            (l) => l.source.containerId === c.id,
          );
          const hasConditionalTarget = conditionals.some(
            (l) => l.target.containerId === c.id,
          );
          const isConditionalPickTarget =
            pick.active &&
            pick.kind === "conditional" &&
            canBeCondition(pick.source.containerId, c.id);
          const coordinatives = links.filter(isCoordinativeLink);
          const coordAsSource = coordinatives.find(
            (l) => l.source.containerId === c.id,
          );
          const coordAsTarget = coordinatives.find(
            (l) => l.target.containerId === c.id,
          );
          const isCoordinativePickTarget =
            pick.active &&
            pick.kind === "coordinative" &&
            canBeCoordinate(pick.source.containerId, c.id);
          const binding: WorkspaceBinding = {
            containerId: c.id,
            pickActive: pick.active,
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
              onGeometryChange: bumpGeom,
            },
            relative: {
              sourceKeys: linkSourceKeys,
              targetKeys: linkTargetKeys,
              isPickTarget: (nounKey) =>
                pick.active &&
                pick.kind === "relative" &&
                pick.source.containerId !== c.id &&
                Boolean(c.selection[nounKey as keyof PhraseSelection]) &&
                !linkTargetKeys.has(nounKey) &&
                !isSelfOrAncestor(c.id, pick.source.containerId, links),
              // Only real top-level nouns are ever offered as pick targets, so the address is a NounKey.
              onPick: (nounKey) => completeLink(c.id, nounKey as NounKey),
              onStartLink: (nounKey) => startLink(c.id, nounKey),
              onRemoveLink: (nounKey) => removeLink(c.id, nounKey),
            },
            conditional: {
              hasSource: hasConditionalSource,
              hasTarget: hasConditionalTarget,
              isPickTarget: isConditionalPickTarget,
              onStart: () => startConditional(c.id),
              onClear: () => clearConditional(c.id),
              onPick: () => completeConditional(c.id),
            },
            coordinative: {
              hasSource: Boolean(coordAsSource),
              hasTarget: Boolean(coordAsTarget),
              conjunction: (coordAsSource ?? coordAsTarget)?.conjunction,
              isPickTarget: isCoordinativePickTarget,
              onStart: (conjunction) => startCoordinative(c.id, conjunction),
              onClear: () => clearCoordinative(c.id),
              onPick: () => completeCoordinative(c.id),
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
                : "Click the noun this clause describes — in another phrase container."}
          </Typography>
          <Button
            size="small"
            onClick={() => setPick({ active: false })}
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
