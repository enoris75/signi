import { ReactNode } from "react";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import TransgenderIcon from "@mui/icons-material/Transgender";
import { iconSx, type Gender } from "../satellites.types.tsx";

// Gender is a direct-toggle satellite: its ring icon *is* the glyph for the current
// value (♂ / ♀ / ⚧), so cycling it swaps the icon rather than revealing a box.
export const genderIcon = (gen?: Gender): ReactNode =>
  gen === "fem" ? (
    <FemaleIcon sx={iconSx} />
  ) : gen === "neut" ? (
    <TransgenderIcon sx={iconSx} />
  ) : (
    <MaleIcon sx={iconSx} />
  );
