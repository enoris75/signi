import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import CloseIcon from "@mui/icons-material/Close";
import { PhraseBuilder } from "./PhraseBuilder.tsx";
import {
  NounKey,
  PhraseContainer,
  PhraseLink,
  PhraseSelection,
  PickMode,
  WorkspaceBinding,
} from "./interfaces.ts";
import { ALL_SLOTS, MUI_COLOR_HEX } from "./slots.ts";

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `c${Math.random().toString(36).slice(2)}`;

const boxKey = (containerId: string, nounKey: NounKey) => `${containerId}:${nounKey}`;

// A drawn link line, in workspace pixels. Guarded by a half-pixel comparator so the
// measuring layout effect settles instead of looping on sub-pixel jitter.
type Connector = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
};

function sameConnectors(a: Connector[], b: Connector[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const p = a[i];
    const q = b[i];
    if (p.id !== q.id || p.color !== q.color) return false;
    if (
      Math.abs(p.x1 - q.x1) > 0.5 ||
      Math.abs(p.y1 - q.y1) > 0.5 ||
      Math.abs(p.x2 - q.x2) > 0.5 ||
      Math.abs(p.y2 - q.y2) > 0.5
    )
      return false;
  }
  return true;
}

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
  const [pick, setPick] = useState<PickMode>({ active: false });
  const workspaceRef = useRef<HTMLDivElement>(null);
  const boxEls = useRef<Map<string, HTMLElement>>(new Map());
  const [connectors, setConnectors] = useState<Connector[]>([]);

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
        cs.map((c) => (c.id === id ? { ...c, selection: updater(c.selection) } : c)),
      );

  function addContainer() {
    setContainers((cs) => [...cs, { id: uid(), selection: {} }]);
  }

  function removeContainer(id: string) {
    setContainers((cs) => cs.filter((c) => c.id !== id));
    // Drop any link touching the removed container (its targets re-become roots).
    setLinks((ls) =>
      ls.filter(
        (l) => l.source.containerId !== id && l.target.containerId !== id,
      ),
    );
    if (pick.active && pick.source.containerId === id) setPick({ active: false });
  }

  function startLink(containerId: string, nounKey: NounKey) {
    setPick({ active: true, source: { containerId, nounKey } });
  }

  function removeLink(containerId: string, nounKey: NounKey) {
    setLinks((ls) =>
      ls.filter(
        (l) =>
          !(l.source.containerId === containerId && l.source.nounKey === nounKey),
      ),
    );
  }

  function completeLink(targetContainerId: string, targetNoun: NounKey) {
    if (!pick.active) return;
    const source = pick.source;
    setPick({ active: false });
    if (
      source.containerId === targetContainerId ||
      isSelfOrAncestor(targetContainerId, source.containerId, links)
    )
      return; // same container or would create a cycle
    setLinks((ls) => {
      const kept = ls.filter(
        (l) =>
          // one link per source noun, and one incoming link per target container
          !(
            l.source.containerId === source.containerId &&
            l.source.nounKey === source.nounKey
          ) && l.target.containerId !== targetContainerId,
      );
      return [
        ...kept,
        { id: uid(), source, target: { containerId: targetContainerId, nounKey: targetNoun } },
      ];
    });
  }

  // Measure each link's connector from the source noun box (bottom-center) to the target
  // noun box (top-center), in workspace-relative pixels. Guarded so it settles.
  useLayoutEffect(() => {
    const root = workspaceRef.current;
    if (!root) return;
    const rootRect = root.getBoundingClientRect();
    const next: Connector[] = [];
    for (const link of links) {
      const src = boxEls.current.get(boxKey(link.source.containerId, link.source.nounKey));
      const tgt = boxEls.current.get(boxKey(link.target.containerId, link.target.nounKey));
      if (!src || !tgt) continue;
      const s = src.getBoundingClientRect();
      const t = tgt.getBoundingClientRect();
      const color =
        MUI_COLOR_HEX[
          ALL_SLOTS.find((sl) => sl.key === link.source.nounKey)?.color ?? "primary"
        ];
      next.push({
        id: link.id,
        x1: s.left + s.width / 2 - rootRect.left,
        y1: s.bottom - rootRect.top,
        x2: t.left + t.width / 2 - rootRect.left,
        y2: t.top - rootRect.top,
        color,
      });
    }
    setConnectors((prev) => (sameConnectors(prev, next) ? prev : next));
  });

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
          {connectors.map((c) => (
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
          ))}
        </Box>
      )}

      <Stack spacing={2}>
        {containers.map((c, i) => {
          const linkSourceKeys = new Set<NounKey>(
            links
              .filter((l) => l.source.containerId === c.id)
              .map((l) => l.source.nounKey),
          );
          const linkTargetKeys = new Set<NounKey>(
            links
              .filter((l) => l.target.containerId === c.id)
              .map((l) => l.target.nounKey),
          );
          const binding: WorkspaceBinding = {
            containerId: c.id,
            registerBox: (nounKey, el) => {
              const k = boxKey(c.id, nounKey);
              if (el) boxEls.current.set(k, el);
              else boxEls.current.delete(k);
            },
            isPickTarget: (nounKey) =>
              pick.active &&
              pick.source.containerId !== c.id &&
              Boolean(c.selection[nounKey]) &&
              !linkTargetKeys.has(nounKey) &&
              !isSelfOrAncestor(c.id, pick.source.containerId, links),
            onNounPick: (nounKey) => completeLink(c.id, nounKey),
            onStartRelativeLink: (nounKey) => startLink(c.id, nounKey),
            onRemoveLink: (nounKey) => removeLink(c.id, nounKey),
            linkSourceKeys,
            linkTargetKeys,
            pickActive: pick.active,
          };
          return (
            <PhraseBuilder
              key={c.id}
              containerId={c.id}
              binding={binding}
              selection={c.selection}
              onPhraseUpdate={makeContainerUpdate(c.id)}
              onRemove={containers.length > 1 ? () => removeContainer(c.id) : undefined}
              // The word palette rides only the first container to avoid ambiguity.
              wordsPanelOpen={i === 0 ? wordsPanelOpen : false}
              onWordsPanelClose={onWordsPanelClose}
            />
          );
        })}
      </Stack>

      <Button
        onClick={addContainer}
        startIcon={<AddIcon />}
        size="small"
        variant="outlined"
        sx={{ mt: 2, textTransform: "none" }}
      >
        Add phrase container
      </Button>

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
            Click the noun this clause describes — in another phrase container.
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
