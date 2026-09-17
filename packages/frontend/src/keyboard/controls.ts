/**
 * Pressing a control that owns its own popup.
 *
 * Most keys call a handler the builder already has. A few can't: the control they stand for *is*
 * its popup's anchor, and lifting that popup's open state out of the leaf that owns it would drag
 * the anchor out with it. For those, the key presses the button — which is literally what the
 * keymap promises ("every key calls the handler the click calls"), and keeps the popup hanging off
 * the right element.
 */
export function pressControl(name: string, root: ParentNode = document): boolean {
  const control = root.querySelector<HTMLElement>(`[data-kb-control="${name}"]`);
  control?.click();
  return Boolean(control);
}
