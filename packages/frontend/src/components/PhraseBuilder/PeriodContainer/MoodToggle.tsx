import CampaignIcon from "@mui/icons-material/Campaign";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import type { UiStringKey } from "@signi/shared";
import { useUiString } from "../../../i18n/useUiString.ts";
import { BorderControlButton, type IconComponent } from "./ControlButton.tsx";
import { ACCENT, type Mood, type MoodControl } from "./PeriodContainer.types.ts";

// What sets the three mood toggles apart: the icon, the mode it is named by, what it says of the period
// while on, and the tooltips for the other two states. The button is named by its mode and says whether
// it is on with `aria-pressed`, so its name stays put as it toggles.
const MOODS: Record<
  Mood,
  { icon: IconComponent; name: UiStringKey; on: UiStringKey; locked: UiStringKey; off: UiStringKey }
> = {
  imperative: {
    icon: CampaignIcon,
    name: "imperative.command",
    on: "period.isCommand",
    locked: "action.unlinkForCommand",
    off: "action.makeCommand",
  },
  infinitive: {
    icon: AllInclusiveIcon,
    name: "infinitive.phrase",
    on: "period.isInfinitive",
    locked: "action.unlinkForInfinitive",
    off: "action.makeInfinitive",
  },
  // QuestionMark, not HelpOutline, which is the cause's.
  question: {
    icon: QuestionMarkIcon,
    name: "mood.question",
    on: "period.isQuestion",
    locked: "action.unlinkForQuestion",
    off: "action.makeQuestion",
  },
};

export interface MoodToggleProps {
  mood: Mood;
  control: MoodControl;
}

// A mood toggle on the card border: makes the period a command, an infinitive citation, or a question.
export function MoodToggle({ mood, control }: MoodToggleProps) {
  const t = useUiString();
  const { icon, name, locked, on, off } = MOODS[mood];
  return (
    <BorderControlButton
      title={control.disabled ? t(locked) : control.active ? `${t(on)} — ${t("action.turnOff")}` : t(off)}
      aria-label={t(name)}
      aria-pressed={control.active}
      icon={icon}
      accent={ACCENT[mood]}
      lit={control.active}
      disabled={control.disabled}
      onClick={control.onToggle}
    />
  );
}
