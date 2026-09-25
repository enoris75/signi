import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import { useUiString } from "../../../i18n/useUiString.ts";
import { BorderControlButton } from "./ControlButton.tsx";
import type { InterjectionControl } from "./PeriodContainer.types.ts";

// The interjection's border control (P09-E47): shows the word box before the subject — "**hey**, the
// cat runs" — or takes it away, word and all. It wears the box's colour, the word map's for the role,
// while the box is on the canvas. The keymap's E presses it (see PeriodCard).
export function InterjectionToggle({ control }: { control: InterjectionControl }) {
  const t = useUiString();
  return (
    <BorderControlButton
      title={t(control.shown ? "action.removeInterjection" : "action.addInterjection")}
      data-kb-control="interjection"
      aria-pressed={control.shown}
      icon={RecordVoiceOverIcon}
      accent="info.main"
      lit={control.shown}
      disabled={false}
      onClick={control.onToggle}
    />
  );
}
