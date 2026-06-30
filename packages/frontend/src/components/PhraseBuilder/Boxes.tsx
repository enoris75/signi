import { Box, Paper, Typography, Tooltip, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { Concept } from "@signi/shared";
import { ReactNode } from "react";
import { SlotConfig } from "./interfaces";

export interface SatelliteIcon {
  key: string;
  icon: ReactNode;
  label: string;
  active: boolean;
  isSet: boolean;
  valueLabel?: string;
  onToggle: () => void;
}

export function SlotBox({
  slot,
  concept,
  isActive,
  onClear,
  emptyContent,
  satellites,
}: {
  slot: SlotConfig;
  concept?: Concept;
  isActive: boolean;
  onClear: () => void;
  emptyContent?: ReactNode;
  satellites?: SatelliteIcon[];
}) {
  return (
    <Box sx={{ position: "relative", display: "inline-block" }}>
      <Paper
        variant="outlined"
        sx={{
          px: 1.5,
          py: 0.75,
          minWidth: 80,
          cursor: "inherit",
          borderRadius: 2,
          borderWidth: 2,
          borderColor: isActive ? `${slot.color}.main` : "divider",
          bgcolor: isActive
            ? `${slot.color}.50`
            : concept
              ? `${slot.color}.50`
              : "background.paper",
          transition: "border-color 0.15s, background-color 0.15s",
          "&:hover": { borderColor: `${slot.color}.main` },
          userSelect: "none",
        }}
      >
        {slot.key !== "verb" && (
          <Typography
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: "0.55rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "text.secondary",
              display: "block",
              mb: 0.25,
            }}
          >
            {slot.label}
            {slot.required ? " *" : ""}
          </Typography>
        )}
        {concept ? (
          <Typography
            sx={{
              fontFamily: '"Lora", Georgia, serif',
              fontSize: "0.9rem",
              fontWeight: 600,
              fontStyle: "italic",
              color: `${slot.color}.dark`,
              lineHeight: 1.3,
            }}
          >
            {concept.role === "pronoun"
              ? concept.description
              : (concept.label ?? concept.description)}
          </Typography>
        ) : (
          (emptyContent ?? (
            <Typography
              sx={{
                fontFamily: '"Inter", sans-serif',
                fontSize: "0.8rem",
                color: "text.disabled",
                fontStyle: "italic",
              }}
            >
              {isActive ? "choose…" : "empty"}
            </Typography>
          ))
        )}
      </Paper>
      {concept && (
        <Tooltip title={`Clear ${slot.label}`}>
          <IconButton
            size="small"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onClear}
            sx={{
              position: "absolute",
              top: -8,
              right: -8,
              width: 18,
              height: 18,
              p: 0,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              opacity: 0.7,
              "&:hover": { opacity: 1, bgcolor: "background.paper" },
            }}
          >
            <ClearIcon sx={{ fontSize: 11 }} />
          </IconButton>
        </Tooltip>
      )}
      {satellites && satellites.length > 0 && (
        <Box
          sx={{
            position: "absolute",
            bottom: -11,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 0.5,
            zIndex: 2,
          }}
        >
          {satellites.map((sat) => {
            // Three states: expanded (active), collapsed-but-set, collapsed-empty.
            const collapsedSet = !sat.active && sat.isSet;
            const tooltip = collapsedSet
              ? `${sat.label}: ${sat.valueLabel ?? "set"}`
              : `${sat.active ? "Hide" : "Show"} ${sat.label}`;
            return (
              <Tooltip key={sat.key} title={tooltip}>
                <IconButton
                  size="small"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={sat.onToggle}
                  sx={{
                    width: 20,
                    height: 20,
                    p: 0,
                    // Set → solid color fill; expanded-empty → colored outline;
                    // collapsed-empty → neutral. (No `.50` shade exists in the theme.)
                    bgcolor: sat.isSet ? `${slot.color}.main` : "background.paper",
                    color: sat.isSet
                      ? "common.white"
                      : sat.active
                        ? `${slot.color}.main`
                        : "text.secondary",
                    border: "1px solid",
                    borderColor:
                      sat.isSet || sat.active ? `${slot.color}.main` : "divider",
                    transition: "background-color 0.15s, border-color 0.15s, color 0.15s",
                    "&:hover": {
                      bgcolor: sat.isSet ? `${slot.color}.dark` : "action.hover",
                      borderColor: `${slot.color}.main`,
                      color: sat.isSet ? "common.white" : `${slot.color}.main`,
                    },
                  }}
                >
                  {sat.icon}
                </IconButton>
              </Tooltip>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

export function ToggleBox({ label, value }: { label: string; value: string }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        px: 1.5,
        py: 0.75,
        minWidth: 80,
        cursor: "inherit",
        borderRadius: 2,
        borderWidth: 2,
        borderColor: "divider",
        bgcolor: "background.paper",
        transition: "border-color 0.15s",
        userSelect: "none",
        "&:hover": { borderColor: "text.secondary" },
      }}
    >
      <Typography
        sx={{
          fontFamily: '"Inter", sans-serif',
          fontSize: "0.55rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "text.secondary",
          display: "block",
          mb: 0.25,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: '"Lora", Georgia, serif',
          fontSize: "0.9rem",
          fontWeight: 600,
          fontStyle: "italic",
          color: "text.primary",
          lineHeight: 1.3,
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
}

export function NumberToggleBox({ value }: { value: "singular" | "plural" }) {
  return (
    <ToggleBox
      label="Number"
      value={value === "singular" ? "Singular" : "Plural"}
    />
  );
}

export function GenderToggleBox({ value }: { value: "masc" | "fem" }) {
  return <ToggleBox label="Gender" value={value === "masc" ? "Masc" : "Fem"} />;
}

export function NegativeToggleBox({ value }: { value: boolean }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        px: 1.5,
        py: 0.75,
        minWidth: 80,
        cursor: "inherit",
        borderRadius: 2,
        borderWidth: 2,
        borderColor: value ? "error.main" : "divider",
        bgcolor: value ? "error.50" : "background.paper",
        transition: "border-color 0.15s, background-color 0.15s",
        userSelect: "none",
        "&:hover": { borderColor: value ? "error.dark" : "text.secondary" },
      }}
    >
      <Typography
        sx={{
          fontFamily: '"Inter", sans-serif',
          fontSize: "0.55rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "text.secondary",
          display: "block",
          mb: 0.25,
        }}
      >
        Polarity
      </Typography>
      <Typography
        sx={{
          fontFamily: '"Lora", Georgia, serif',
          fontSize: "0.9rem",
          fontWeight: 600,
          fontStyle: "italic",
          color: value ? "error.dark" : "text.primary",
          lineHeight: 1.3,
        }}
      >
        {value ? "Negative" : "Positive"}
      </Typography>
    </Paper>
  );
}
