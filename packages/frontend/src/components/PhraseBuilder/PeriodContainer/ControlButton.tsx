import {
  IconButton,
  Tooltip,
  type IconButtonProps,
  type SvgIcon,
} from "@mui/material";

export type IconComponent = typeof SvgIcon;

export interface ControlButtonProps
  extends Omit<IconButtonProps, "size" | "title" | "children"> {
  // The tooltip. Also the button's accessible name, unless `aria-label` gives another.
  title: string;
  icon: IconComponent;
}

// One of a period card's small icon controls, with its tooltip. A control that can be disabled —
// one passed a `disabled` prop at all — sits in a span, since a disabled button fires no events for
// the tooltip to hear.
export function ControlButton({
  title,
  icon: Icon,
  sx,
  ...props
}: ControlButtonProps) {
  const button = (
    <IconButton
      size="small"
      aria-label={title}
      {...props}
      sx={[{ p: 0.25 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Icon sx={{ fontSize: 15 }} />
    </IconButton>
  );
  return (
    <Tooltip title={title}>
      {props.disabled === undefined ? button : <span>{button}</span>}
    </Tooltip>
  );
}

export interface BorderControlButtonProps
  extends Omit<ControlButtonProps, "sx"> {
  // The palette colour the control wears once lit.
  accent: string;
  // The period takes part in what this control governs, or is a pick's target for it.
  lit: boolean;
  disabled: boolean;
}

// A control on the card's right border: a bordered chip on the paper, drawn in its accent colour
// while lit.
export function BorderControlButton({
  accent,
  lit,
  ...props
}: BorderControlButtonProps) {
  return (
    <ControlButton
      {...props}
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: lit ? accent : "divider",
        color: lit ? accent : "text.secondary",
        "&:hover": { bgcolor: "background.paper" },
      }}
    />
  );
}
