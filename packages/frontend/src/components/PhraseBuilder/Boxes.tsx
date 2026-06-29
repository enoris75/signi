import { Box, Paper, Typography, Tooltip, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { Concept } from "@signi/shared";
import { ReactNode } from "react";
import { SlotConfig } from "./interfaces";

export function SlotBox({
  slot,
  concept,
  isActive,
  onClear,
  emptyContent,
}: {
  slot: SlotConfig;
  concept?: Concept;
  isActive: boolean;
  onClear: () => void;
  emptyContent?: ReactNode;
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
