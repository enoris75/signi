import type { UiStringLookup } from "../../../../i18n/conceptWord.ts";
import type { Gender } from "../satellites.types.tsx";

// The current gender's name, as a gender satellite's tooltip shows it. Unmarked reads masculine.
export const genderLabel = (t: UiStringLookup, gen?: Gender): string => t(`gender.value.${gen ?? "masc"}`);
