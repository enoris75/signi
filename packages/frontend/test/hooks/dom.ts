// jsdom does no layout: every element measures 0×0 at the origin, and there is no
// ResizeObserver. The measuring hooks read both, so a test places its elements by hand.

// A viewport-pixel box, in the shape getBoundingClientRect returns.
export function rect(x: number, y: number, width: number, height: number): DOMRect {
  return {
    x,
    y,
    left: x,
    top: y,
    width,
    height,
    right: x + width,
    bottom: y + height,
    toJSON: () => ({}),
  };
}

// An element that measures at the given box. Call `place` again to move it.
export function placed(x: number, y: number, width: number, height: number): HTMLElement {
  return place(document.createElement('div'), x, y, width, height);
}

export function place<E extends HTMLElement>(
  el: E,
  x: number,
  y: number,
  width: number,
  height: number,
): E {
  el.getBoundingClientRect = () => rect(x, y, width, height);
  return el;
}

// Stand in for React attaching a `ref={…}` prop: the hooks hand back read-only RefObjects.
export function attach(ref: { readonly current: unknown }, el: HTMLElement | null) {
  (ref as { current: unknown }).current = el;
}

// A ResizeObserver the test drives: `fire` delivers a resize to the callback.
export class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  observed: Element[] = [];
  disconnected = false;

  constructor(private readonly callback: ResizeObserverCallback) {
    FakeResizeObserver.instances.push(this);
  }

  observe(el: Element) {
    this.observed.push(el);
  }

  unobserve() {}

  disconnect() {
    this.disconnected = true;
  }

  fire(width: number, height: number) {
    const entry = { contentRect: rect(0, 0, width, height) } as ResizeObserverEntry;
    this.callback([entry], this as unknown as ResizeObserver);
  }
}
