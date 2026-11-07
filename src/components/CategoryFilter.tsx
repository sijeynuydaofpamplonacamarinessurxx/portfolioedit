"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: { value: string; label: string }[];
  active: string;
  onChange: (category: string) => void;
  /** Project count per category value, plus "all" */
  counts?: Record<string, number>;
}

// A floating liquid-glass capsule. The selected tab sits on a glass pill that slides
// (with a slight overshoot) to whichever tab is picked.
export default function CategoryFilter({ categories, active, onChange, counts }: CategoryFilterProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const tabs = [{ value: "all", label: "All" }, ...categories];

  // Move the pill under the active tab; re-measure when fonts load or the bar resizes
  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const place = () => {
      const tab = bar.querySelector<HTMLElement>('[aria-selected="true"]');
      if (!tab) return;
      bar.style.setProperty("--pill-x", `${tab.offsetLeft}px`);
      bar.style.setProperty("--pill-w", `${tab.offsetWidth}px`);
    };
    place();
    document.fonts?.ready.then(place);
    const observer = new ResizeObserver(place);
    observer.observe(bar);
    return () => observer.disconnect();
  }, [active, counts]);

  // When the bar scrolls sideways (phones), glide the picked tab to the centre alongside the
  // pill. Animated by hand because native smooth scrolling is switched off entirely when the
  // OS asks for reduced motion, which made the whole bar jump.
  const isFirstRender = useRef(true);
  useEffect(() => {
    const bar = barRef.current;
    const tab = bar?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!bar || !tab || bar.scrollWidth <= bar.clientWidth) return;
    const maxScroll = bar.scrollWidth - bar.clientWidth;
    const target = Math.min(maxScroll, Math.max(0, tab.offsetLeft + tab.offsetWidth / 2 - bar.clientWidth / 2));
    if (isFirstRender.current) {
      isFirstRender.current = false;
      bar.scrollLeft = target;
      return;
    }
    const start = bar.scrollLeft;
    const distance = target - start;
    if (Math.abs(distance) < 1) return;
    const duration = 520; // matches the pill's slide
    const easeOutQuart = (t: number) => 1 - (1 - t) ** 4;
    const startTime = performance.now();
    let frame = 0;
    const cancel = () => cancelAnimationFrame(frame);
    // Let a finger or wheel take over mid-glide
    bar.addEventListener("pointerdown", cancel, { once: true });
    bar.addEventListener("wheel", cancel, { once: true, passive: true });
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      bar.scrollLeft = start + distance * easeOutQuart(t);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancel();
      bar.removeEventListener("pointerdown", cancel);
      bar.removeEventListener("wheel", cancel);
    };
  }, [active]);

  return (
    <div className="cat-bar-wrap">
      <div ref={barRef} className="cat-bar" role="tablist" aria-label="Project categories">
        <span className="cat-pill" aria-hidden="true" />
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active === tab.value}
            onClick={() => onChange(tab.value)}
            className={cn("cat-tab", active === tab.value && "is-active")}
          >
            {tab.label}
            {counts?.[tab.value] !== undefined && <span className="cat-count">{counts[tab.value]}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
