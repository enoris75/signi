import { useCallback, useState } from "react";
import type { NounAddress } from "../interfaces.ts";
import type { RingHost } from "../ringHost.ts";

// Which owners are open, by the address of the noun they own: an owner the user opened (still
// empty, or named) or folded away. Unset, a named owner shows and an empty one doesn't. The
// period's builder holds it for every owner on its canvas; a hosted ring's builder uses its host's.
export function useOwnersOpen(ringHost: Pick<RingHost, "ownersOpen" | "setOwnerOpen"> | undefined): {
  ownersOpen: Readonly<Record<NounAddress, boolean>>;
  setOwnerOpen: (address: NounAddress, open: boolean) => void;
} {
  const [periodOwnersOpen, setPeriodOwnersOpen] = useState<Record<NounAddress, boolean>>({});
  const setPeriodOwnerOpen = useCallback(
    (address: NounAddress, open: boolean) =>
      setPeriodOwnersOpen((prev) => (prev[address] === open ? prev : { ...prev, [address]: open })),
    [],
  );
  return {
    ownersOpen: ringHost?.ownersOpen ?? periodOwnersOpen,
    setOwnerOpen: ringHost?.setOwnerOpen ?? setPeriodOwnerOpen,
  };
}
