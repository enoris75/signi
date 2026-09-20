import { ReactNode } from "react";
import PlaceIcon from "@mui/icons-material/Place";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RouteIcon from "@mui/icons-material/Route";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LinkIcon from "@mui/icons-material/Link";
import CallReceivedIcon from "@mui/icons-material/CallReceived";
import BuildIcon from "@mui/icons-material/Build";
import SpeedIcon from "@mui/icons-material/Speed";
import TransformIcon from "@mui/icons-material/Transform";
import GroupIcon from "@mui/icons-material/Group";
import type { ComplementType, UiStringKey } from "@signi/shared";
import type {
  GenderSlot,
  NounKey,
  NumberSlot,
  SlotKey,
  WorkspaceBinding,
} from "../interfaces.ts";
import type { SatelliteIcon } from "../Boxes.tsx";
import type { UiStringLookup } from "../../../i18n/conceptWord.ts";

// Satellite elements (gender / number / polarity / adjective / adverb) are hidden
// by default and revealed via the small controls round each word's solid ring.
export type Satellite = {
  key: string;
  // The node that carries this satellite's control. Usually a constituent's word,
  // but a chained satellite rides another satellite's box (Adjective 2 on Adjective 1).
  parent: SlotKey;
  label: string;
  // The catalog key `label` is rendered from, where the satellite's noun is seeded — which also names
  // the part its control shows and hides (see canvasCommands). The rest keep an English `label`.
  labelKey?: UiStringKey;
  icon: ReactNode;
  available: boolean;
  // hasValue = carries a *non-default* value (plural / fem / negative / a chosen word).
  hasValue: boolean;
  // alwaysSet = number / gender / polarity — these always hold a value (even the
  // default), so their icon reads as "valued" and the tooltip shows the current one.
  alwaysSet?: boolean;
  // Whether the satellite's box is on the canvas before anyone touches its control.
  // Defaults to `hasValue` — an empty satellite stays folded away until revealed. The
  // direct object overrides it: it is a core role, offered open the moment a transitive
  // verb licenses it, and its control is there to *hide* it.
  defaultShown?: boolean;
  // directToggle = the ring icon *is* the control: clicking it flips the value
  // (singular ⇄ plural, positive ⇄ negative) in place, with no expandable canvas box.
  // Such satellites never `shown` (there is nothing to reveal); the icon's
  // solid/outlined state indicates the current value and its tooltip spells it out.
  directToggle?: boolean;
  // Human-readable current term, shown in the icon tooltip.
  valueLabel?: string;
  shown: boolean;
};

// A satellite as the selection alone describes it, before resolveSatellites settles it against
// the others and the reveal state — its `available` still ignores a dropped or folded head.
export type RawSatellite = Omit<Satellite, "shown">;

export type Gender = "masc" | "fem" | "neut";

export interface ResolveSatellitesOptions {
  // The user's explicit reveal toggles, by satellite key; an absent key falls back to the default.
  revealed: Record<string, boolean>;
  // Whether the subject's box is off the canvas (a command or an infinitive took its place).
  subjectDropped: boolean;
}

// Every satellite for a selection, and whether each one's box is on the canvas, by key.
export type BuiltSatellites = {
  satellites: Satellite[];
  shownMap: Record<string, boolean>;
};

// The relative-clause, possessor and coordination controls a noun carries on its *dotted* ring,
// rather than on its word's solid ring.
export type PerimeterEntry = {
  relative?: SatelliteIcon;
  possessor?: SatelliteIcon;
  conjunct?: SatelliteIcon;
};

export interface BuildSatelliteIconsArgs {
  satellites: Satellite[];
  shownMap: Record<string, boolean>;
  // Main-word keys of the currently collapsed groups — a collapsed group hides its
  // own reveal icons.
  collapsedMainKeys: Set<string>;
  linkBinding: WorkspaceBinding | undefined;
  onToggleNumber: (which: NumberSlot) => void;
  onToggleGender: (which: GenderSlot) => void;
  onToggleNegative: () => void;
  onToggleReveal: (sat: Satellite) => void;
  // Append a conjunct to a noun block. Unlike the reveals, this control *adds* — a block can
  // coordinate any number of phrases, so each click adds one more ring to the group.
  onAddConjunct: (which: NounKey) => void;
  // The UI-string lookup: a link control says what state it is in and what a click will do, and
  // both are catalog entries (`status.linked`, `hint.clickToRemove`).
  t: UiStringLookup;
}

export interface SatelliteIcons {
  satelliteIconsByParent: Record<string, SatelliteIcon[]>;
  complementToggleIcons: SatelliteIcon[];
  perimeterByNoun: Partial<Record<NounKey, PerimeterEntry>>;
  directObjectToggle?: SatelliteIcon;
}

export const iconSx = { fontSize: 13 };

export const complementIcons: Record<ComplementType, ReactNode> = {
  predicative: <LinkIcon sx={iconSx} />,
  locative: <PlaceIcon sx={iconSx} />,
  direction: <ArrowForwardIcon sx={iconSx} />,
  source: <ArrowBackIcon sx={iconSx} />,
  route: <RouteIcon sx={iconSx} />,
  cause: <HelpOutlineIcon sx={iconSx} />,
  instrumental: <BuildIcon sx={iconSx} />,
  manner: <SpeedIcon sx={iconSx} />,
  terminus: <CallReceivedIcon sx={iconSx} />,
  // What the object is turned into, and who the act is carried out alongside.
  objectPredicative: <TransformIcon sx={iconSx} />,
  comitative: <GroupIcon sx={iconSx} />,
};
