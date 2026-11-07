// Eased, inertial mouse-wheel scrolling for the page.
//
// A wheel notch normally jumps the page ~100px in one frame, and Chrome drops its own
// wheel smoothing entirely when the OS asks for reduced motion. Every scroll-driven effect
// on the page then jumps notch by notch. Here each notch moves a target instead, and the
// page glides toward it with an exponential ease-out, so momentum carries between notches.
//
// Only mouse wheels on fine pointers are handled: touch and trackpad momentum, keyboard,
// scrollbar drags, Ctrl+wheel zoom and inner scrollers all stay native.

const EASE = 0.1; // share of the remaining distance covered per 60fps frame
const STOP_DISTANCE = 0.5;

export function enableSmoothWheel(): () => void {
  if (!window.matchMedia("(pointer: fine)").matches) return () => {};

  let target = window.scrollY;
  let current = window.scrollY;
  let lastSet = window.scrollY;
  let frame = 0;
  let lastTime = 0;

  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const step = (now: number) => {
    // Frame-rate independent: the same feel at 60, 120 or 144Hz
    const dt = lastTime ? Math.min(64, now - lastTime) : 16.67;
    lastTime = now;
    current += (target - current) * (1 - Math.pow(1 - EASE, dt / 16.67));
    if (Math.abs(target - current) < STOP_DISTANCE) current = target;
    lastSet = current;
    window.scrollTo({ top: current, behavior: "instant" });
    frame = current === target ? 0 : requestAnimationFrame(step);
  };

  // Let an inner element that can still scroll in this direction (e.g. the lightbox) have the wheel
  const innerScrollerTakes = (el: EventTarget | null, deltaY: number) => {
    for (let node = el as HTMLElement | null; node && node !== document.body; node = node.parentElement) {
      const { overflowY } = getComputedStyle(node);
      if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) {
        if (deltaY < 0 ? node.scrollTop > 0 : node.scrollTop + node.clientHeight < node.scrollHeight) return true;
      }
    }
    return false;
  };

  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.defaultPrevented) return; // pinch / Ctrl+wheel zoom
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // horizontal: let the category bar scroll
    if (document.body.style.overflow === "hidden") return; // page is locked (lightbox open)
    if (innerScrollerTakes(e.target, e.deltaY)) return;

    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
    e.preventDefault();
    if (!frame) {
      // Something else may have scrolled the page since we last moved it
      target = current = window.scrollY;
      lastTime = 0;
    }
    target = Math.max(0, Math.min(maxScroll(), target + e.deltaY * unit));
    if (!frame) frame = requestAnimationFrame(step);
  };

  // Another scroll source (scrollbar drag, keys, a scripted scroll) takes over: stop gliding
  const onScroll = () => {
    if (frame && Math.abs(window.scrollY - lastSet) > 2) {
      stop();
      target = current = window.scrollY;
    }
  };

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    stop();
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("scroll", onScroll);
  };
}
