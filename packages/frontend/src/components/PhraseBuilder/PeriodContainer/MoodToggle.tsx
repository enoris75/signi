import CampaignIcon from "@mui/icons-material/Campaign";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import type { UiStringKey } from "@signi/shared";
import { useUiString } from "../../../i18n/useUiString.ts";
import { BorderControlButton, type IconComponent } from "./ControlButton.tsx";
import { ACCENT, type Mood, type MoodControl } from "./PeriodContainer.types.ts";

// What sets the two mood toggles apart: the icon, the mode it is named by, what it says of the period
// while on, and the tooltips for the other two states. The button is named by its mode and says whether
// it is on with `aria-pressed`, so its name stays put as it toggles.
const MOODS: Record<
  Mood,
  { icon: IconComponent; name: UiStringKey; on: UiStringKey; locked: string; off: string }
> = {
  imperative: {
    icon: CampaignIcon,
    name: "imperative.command",
    on: "period.isCommand",
    locked: "Remove the IF / coordination link to make this a command",
    off: "Make this period a command (imperative)",
  },
  infinitive: {
    icon: AllInclusiveIcon,
    name: "infinitive.phrase",
    on: "period.isInfinitive",
    locked:
      "Remove the IF / coordination link to make this an infinitive phrase",
    off: "Make this period an infinitive phrase (a citation, e.g. “to consume food”)",
  },
};

export interface MoodToggleProps {
  mood: Mood;
  control: MoodControl;
}

// A mood toggle on the card border: makes the period a command, or an infinitive citation.
export function MoodToggle({ mood, control }: MoodToggleProps) {
  const t = useUiString();
  const { icon, name, locked, on, off } = MOODS[mood];
  return (
    <BorderControlButton
      title={control.disabled ? locked : control.active ? `${t(on)} — ${t("action.turnOff")}` : off}
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
