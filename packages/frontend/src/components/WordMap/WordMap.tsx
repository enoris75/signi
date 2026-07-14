import { useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { COMPLEMENT_LABELS } from "@signi/shared";
import type { ComplementType, Concept, GrammaticalRole } from "@signi/shared";
import { useConcepts } from "../../hooks/useConcepts.ts";
import { useUiLanguage } from "../../i18n/LanguageContext.tsx";
import { useUiString } from "../../i18n/useUiString.ts";
import { conceptWord } from "../../i18n/conceptWord.ts";
import { COMPLEMENT_LABEL_KEYS } from "../PhraseBuilder/slots.ts";
import {
  buildWordMap,
  graphExtent,
  layoutWordMap,
  neighbourhood,
  RELATION_KINDS,
  type RelationKind,
  type WordMapNode,
} from "./wordMap.ts";

/** The box the layout runs in. The viewBox then frames whatever the graph actually occupies. */
const LAYOUT_WIDTH = 1400;
const LAYOUT_HEIGHT = 900;
const PADDING = 60;

const RELATION_LABEL: Record<RelationKind, string> = {
  isA: "is a",
  complements: "complements",
};

const NODE_HEIGHT = 22;

/** A node's pill is sized to its label; edges need the same number to stop at its edge. */
const nodeWidth = (label: string) => Math.max(34, label.length * 7.4 + 16);

/**
 * Where the line between `from` and `to` meets `to`'s pill, rather than its centre. Both ends of
 * an edge are clipped this way, so a connector leaves and arrives at a word's border and the
 * `is a` arrowhead lands where it can be seen instead of underneath the parent's pill.
 */
function edgeStop(from: WordMapNode, to: WordMapNode): { x: number; y: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx === 0 && dy === 0) return { x: to.x, y: to.y };
  const halfW = nodeWidth(to.label) / 2 + 3;
  const halfH = NODE_HEIGHT / 2 + 3;
  // Scale the direction vector down until it first crosses one of the pill's sides.
  const scale = Math.min(
    dx === 0 ? Infinity : halfW / Math.abs(dx),
    dy === 0 ? Infinity : halfH / Math.abs(dy),
  );
  return { x: to.x - dx * scale, y: to.y - dy * scale };
}

/** Node colour by role — the palette's role colours, so a word reads the same in both places. */
const ROLE_COLOR: Record<GrammaticalRole, "primary" | "secondary" | "success" | "warning" | "info"> = {
  pronoun: "primary",
  noun: "success",
  verb: "secondary",
  adjective: "warning",
  adverb: "info",
};

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * The corpus as a graph: every word an `isA` or `complements` edge touches, drawn as a map you can
 * pan and zoom. It is a read-only view — clicking a word does not select it, since the map is open
 * over the builder rather than beside it.
 */
export function WordMap({ open, onClose }: Props) {
  const theme = useTheme();
  const { uiLanguage } = useUiLanguage();
  const t = useUiString();
  // Every role: the map is about the corpus, not about the slot being filled.
  const { data: concepts, isLoading, isError, refetch } = useConcepts();

  const [shown, setShown] = useState<Set<RelationKind>>(() => new Set(RELATION_KINDS));
  const [hovered, setHovered] = useState<string | null>(null);
  const [view, setView] = useState({ k: 1, tx: 0, ty: 0 });
  const panRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  /** A number and the noun it counts, in whichever number the count calls for. */
  const counted = (n: number, key: "wordMap.nodes" | "wordMap.relationships" | "wordMap.hidden") =>
    `${n} ${t(`${key}.${n === 1 ? "singular" : "plural"}` as const)}`;

  const complementLabel = (type: ComplementType) => {
    const key = COMPLEMENT_LABEL_KEYS[type];
    return key ? t(key) : COMPLEMENT_LABELS[type];
  };

  // Laying out ~150 nodes takes a few milliseconds, but it is pure and depends only on the corpus
  // and the relation filter — so it runs once per change rather than once per hover or pan.
  const graph = useMemo(() => {
    if (!concepts) return null;
    return layoutWordMap(
      buildWordMap(
        concepts,
        shown,
        (c: Concept) => conceptWord(c, uiLanguage, t),
        complementLabel,
      ),
      LAYOUT_WIDTH,
      LAYOUT_HEIGHT,
    );
    // `t` and `complementLabel` are recreated each render; the language is what actually
    // changes the labels, and re-laying out on every render would be wasteful.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concepts, shown, uiLanguage]);

  const extent = useMemo(() => (graph ? graphExtent(graph, PADDING) : null), [graph]);
  const nodeById = useMemo(
    () => new Map((graph?.nodes ?? []).map((n) => [n.id, n])),
    [graph],
  );
  const lit = useMemo(
    () => (graph && hovered ? neighbourhood(graph, hovered) : null),
    [graph, hovered],
  );

  function toggleRelation(relation: RelationKind) {
    setShown((prev) => {
      const next = new Set(prev);
      if (next.has(relation)) next.delete(relation);
      else next.add(relation);
      return next;
    });
    setHovered(null);
  }

  const nodeColor = (node: WordMapNode) =>
    node.kind === "complement"
      ? theme.palette.grey[600]
      : theme.palette[ROLE_COLOR[node.role as GrammaticalRole]].main;

  /** Dimmed when a hover is lighting some other part of the graph. */
  const opacityOf = (id: string, base: number, dim: number) =>
    !lit ? base : lit.has(id) ? base : dim;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, pb: 1 }}
      >
        <Box>
          <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, fontSize: "1.4rem" }}>
            {t("wordMap.heading")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {graph
              ? [
                  counted(graph.nodes.length, "wordMap.nodes"),
                  counted(graph.edges.length, "wordMap.relationships"),
                  ...(graph.unconnected > 0
                    ? [counted(graph.unconnected, "wordMap.hidden")]
                    : []),
                ].join(" · ")
              : ""}
          </Typography>
        </Box>
        <Stack direction="row" alignItems="center" gap={1}>
          {RELATION_KINDS.map((relation) => (
            <Chip
              key={relation}
              label={RELATION_LABEL[relation]}
              size="small"
              variant={shown.has(relation) ? "filled" : "outlined"}
              color={shown.has(relation) ? "primary" : "default"}
              onClick={() => toggleRelation(relation)}
              sx={{ fontFamily: '"Inter", sans-serif', fontSize: "0.7rem" }}
            />
          ))}
          <IconButton size="small" onClick={onClose} aria-label="Close word map">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ height: "78vh", p: 0, overflow: "hidden" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <CircularProgress size={28} />
          </Box>
        ) : isError || !graph || !extent ? (
          // A failed fetch leaves `isLoading` false and `concepts` undefined. Say so, rather than
          // spinning forever on a request that has already finished.
          <Stack
            alignItems="center"
            justifyContent="center"
            gap={1.5}
            sx={{ height: "100%", px: 3, textAlign: "center" }}
          >
            <Typography color="text.secondary">
              Could not load the words. Is the translation server running?
            </Typography>
            <Button size="small" variant="outlined" onClick={() => refetch()}>
              Retry
            </Button>
          </Stack>
        ) : graph.nodes.length === 0 ? (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
              No relationships to show. Switch one back on above.
            </Typography>
          </Box>
        ) : (
          <Box
            component="svg"
            viewBox={`${extent.x} ${extent.y} ${extent.width} ${extent.height}`}
            onWheel={(e: React.WheelEvent) => {
              const k = Math.min(4, Math.max(0.4, view.k * (e.deltaY < 0 ? 1.12 : 1 / 1.12)));
              setView((v) => ({ ...v, k }));
            }}
            onPointerDown={(e: React.PointerEvent<SVGSVGElement>) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              panRef.current = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
            }}
            onPointerMove={(e: React.PointerEvent) => {
              const start = panRef.current;
              if (!start) return;
              // Screen pixels → viewBox units, so the graph tracks the cursor at any zoom.
              const scale = extent.width / (e.currentTarget as SVGSVGElement).clientWidth / view.k;
              setView((v) => ({
                ...v,
                tx: start.tx + (e.clientX - start.x) * scale,
                ty: start.ty + (e.clientY - start.y) * scale,
              }));
            }}
            onPointerUp={() => {
              panRef.current = null;
            }}
            sx={{
              width: "100%",
              height: "100%",
              display: "block",
              cursor: "grab",
              touchAction: "none",
              "&:active": { cursor: "grabbing" },
            }}
          >
            <defs>
              <marker
                id="wordmap-arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={theme.palette.text.disabled} />
              </marker>
            </defs>
            {/* Zoom about the centre of the framed graph, so scrolling doesn't fling it away. */}
            <g
              transform={`translate(${extent.x + extent.width / 2} ${extent.y + extent.height / 2}) scale(${view.k}) translate(${-(extent.x + extent.width / 2) + view.tx} ${-(extent.y + extent.height / 2) + view.ty})`}
            >
              {graph.edges.map((edge, i) => {
                const a = nodeById.get(edge.source);
                const b = nodeById.get(edge.target);
                if (!a || !b) return null;
                const isLit = !lit || (lit.has(a.id) && lit.has(b.id));
                const start = edgeStop(b, a);
                const end = edgeStop(a, b);
                return (
                  <line
                    key={i}
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={
                      edge.relation === "isA"
                        ? theme.palette.text.secondary
                        : theme.palette.grey[500]
                    }
                    strokeWidth={edge.relation === "isA" ? 1.4 : 1}
                    strokeDasharray={edge.relation === "complements" ? "4 4" : undefined}
                    markerEnd={edge.relation === "isA" ? "url(#wordmap-arrow)" : undefined}
                    opacity={isLit ? 0.55 : 0.06}
                  />
                );
              })}
              {graph.nodes.map((node) => {
                const color = nodeColor(node);
                const width = nodeWidth(node.label);
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x} ${node.y})`}
                    onPointerEnter={() => setHovered(node.id)}
                    onPointerLeave={() => setHovered(null)}
                    opacity={opacityOf(node.id, 1, 0.15)}
                    style={{ cursor: "default" }}
                  >
                    <rect
                      x={-width / 2}
                      y={-NODE_HEIGHT / 2}
                      width={width}
                      height={NODE_HEIGHT}
                      rx={NODE_HEIGHT / 2}
                      fill={node.kind === "complement" ? theme.palette.background.paper : color}
                      fillOpacity={node.kind === "complement" ? 1 : 0.12}
                      stroke={color}
                      strokeWidth={hovered === node.id ? 2 : 1}
                      strokeDasharray={node.kind === "complement" ? "3 3" : undefined}
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={11}
                      fontFamily={
                        node.kind === "complement"
                          ? '"Inter", sans-serif'
                          : '"Lora", Georgia, serif'
                      }
                      fontStyle={node.kind === "complement" ? "normal" : "italic"}
                      fontWeight={hovered === node.id ? 700 : 500}
                      fill={theme.palette.text.primary}
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
