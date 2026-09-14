import CampaignIcon from "@mui/icons-material/Campaign";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import { BorderControlButton, type IconComponent } from "./ControlButton.tsx";
import { ACCENT, type Mood, type MoodControl } from "./PeriodContainer.types.ts";

// What sets the two mood toggles apart: the icon, the button's name, and a tooltip for each state.
const MOODS: Record<
  Mood,
  { icon: IconComponent; name: string; locked: string; on: string; off: string }
> = {
  imperative: {
    icon: CampaignIcon,
    name: "Toggle imperative (command)",
    locked: "Remove the IF / coordination link to make this a command",
    on: "This period is a command — turn it off",
    off: "Make this period a command (imperative)",
  },
  infinitive: {
    icon: AllInclusiveIcon,
    name: "Toggle infinitive phrase (citation)",
    locked:
      "Remove the IF / coordination link to make this an infinitive phrase",
    on: "This period is an infinitive phrase — turn it off",
    off: "Make this period an infinitive phrase (a citation, e.g. “to consume food”)",
  },
};

export interface MoodToggleProps {
  mood: Mood;
  control: MoodControl;
}

// A mood toggle on the card border: makes the period a command, or an infinitive citation.
export function MoodToggle({ mood, control }: MoodToggleProps) {
  const { icon, name, locked, on, off } = MOODS[mood];
  return (
    <BorderControlButton
      title={control.disabled ? locked : control.active ? on : off}
      aria-label={name}
      icon={icon}
      accent={ACCENT[mood]}
      lit={control.active}
      disabled={control.disabled}
      onClick={control.onToggle}
    />
  );
}
