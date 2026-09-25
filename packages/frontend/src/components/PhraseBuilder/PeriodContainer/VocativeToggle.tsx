import CampaignIcon from "@mui/icons-material/Campaign";
import { useUiString } from "../../../i18n/useUiString.ts";
import { BorderControlButton } from "./ControlButton.tsx";
import type { VocativeControl } from "./PeriodContainer.types.ts";

// The vocative's border control (P11-E8): shows the noun box that names the hearer before the clause —
// "**Mom**, run" — or takes it away, words and all. It sits after the interjection's, as the vocative
// is spoken after it, and wears the box's colour while the box is on the canvas. The keymap's V presses
// it (see PeriodCard).
export function VocativeToggle({ control }: { control: VocativeControl }) {
  const t = useUiString();
  return (
    <BorderControlButton
      title={t(control.shown ? "action.removeVocative" : "action.addVocative")}
      data-kb-control="vocative"
      aria-pressed={control.shown}
      icon={CampaignIcon}
      accent="info.main"
      lit={control.shown}
      disabled={false}
      onClick={control.onToggle}
    />
  );
}
