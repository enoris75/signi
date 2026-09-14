import type { SerializedLink } from "@signi/shared";
import { isRecord } from "./isRecord.ts";

// Whether a saved link has what every kind of link needs: an id, and two endpoints that each name
// a period.
export function isSavedLink(link: unknown): link is SerializedLink {
  return (
    isRecord(link) &&
    typeof link.id === "string" &&
    isRecord(link.source) &&
    typeof link.source.containerId === "string" &&
    isRecord(link.target) &&
    typeof link.target.containerId === "string"
  );
}
