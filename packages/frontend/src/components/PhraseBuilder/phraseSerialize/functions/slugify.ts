// A file-name-safe form of a phrase name: lowercase ASCII words joined by dashes, "phrase" when
// nothing is left.
export const slugify = (name: string): string =>
  name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "phrase";
