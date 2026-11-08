"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { categoryLabel, creatorHandle } from "@/lib/utils";

export interface CarouselProject {
  id: string;
  title: string;
  slug: string;
  category: string;
  subcategory?: string | null;
  videoUrl: string;
  previewUrl?: string | null;
  aspectRatio: string;
  creator?: string | null;
}

interface WorkCarouselProps<P extends CarouselProject> {
  label: string;
  projects: P[];
  orientation: "vertical" | "landscape";
  /** Opens a project in the player; receives the pressed tile for the bloom and zoom origin */
  onOpen: (project: P, e: React.MouseEvent<HTMLElement>) => void;
}

// Fewer than this and a loop just shows the same clips side by side: lay them out once instead
const LOOP_MIN = 4;
// Glides (arrows, drag release, landing after a flick): on-screen movement the user started, so a
// strong ease-out that answers at once. Duration grows with distance: a short settle is quick,
// a long throw takes its time, so the speed never jumps.
const GLIDE_MIN_MS = 260;
const GLIDE_MAX_MS = 620;
const easeOutQuint = (t: number) => 1 - (1 - t) ** 5;
// Scrolling counts as finished once no scroll event has arrived for this long (where the browser
// has no scrollend event). Long enough that slow momentum isn't mistaken for a stop.
const SETTLE_MS = 180;

/**
 * A looping coverflow carousel. Native horizontal scrolling does the moving (so touch and
 * trackpad keep their real momentum; touch snaps natively, mouse/trackpad coast freely and then
 * ease onto the nearest clip); each frame, every tile's distance from the
 * centre (--d) drives its depth, tilt, fade and the parallax of the video inside it. Only the
 * centre tile plays. Infinite: three copies of the list, and the scroll position quietly jumps
 * back to the middle copy whenever it settles in an outer one.
 */
export default function WorkCarousel<P extends CarouselProject>({
  label,
  projects,
  orientation,
  onOpen,
}: WorkCarouselProps<P>) {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const n = projects.length;
  const loop = n >= LOOP_MIN;
  const copies = loop ? 3 : 1;
  const tiles = useMemo(
    () =>
      Array.from({ length: copies }, (_, copy) =>
        projects.map((project, i) => ({ project, i, key: `${copy}-${project.id}` }))
      ).flat(),
    [projects, copies]
  );

  const [active, setActive] = useState(0); // index into `projects`, for the counter and caption
  const activeGlobal = useRef(-1);
  const frame = useRef(0);
  const glide = useRef(0);
  const settleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inView = useRef(true);
  const nearView = useRef(false); // within ~a screen of the viewport: allowed to load clips
  const drag = useRef<{ x: number; scroll: number; t: number; vx: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  const tileEls = () => [...(trackRef.current?.querySelectorAll<HTMLElement>(".wc-item") ?? [])];

  // Distance between neighbouring tile centres
  const stepOf = (els: HTMLElement[]) => (els.length > 1 ? els[1].offsetLeft - els[0].offsetLeft : els[0]?.offsetWidth ?? 1);

  const nearestIndex = (els: HTMLElement[], scrollLeft: number) => {
    const track = trackRef.current!;
    const centre = scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    els.forEach((el, g) => {
      const dist = Math.abs(el.offsetLeft + el.offsetWidth / 2 - centre);
      if (dist < bestDist) {
        bestDist = dist;
        best = g;
      }
    });
    return best;
  };

  const targetFor = (el: HTMLElement) => el.offsetLeft + el.offsetWidth / 2 - trackRef.current!.clientWidth / 2;

  const playOnly = useCallback((g: number) => {
    tileEls().forEach((el, i) => {
      const video = el.querySelector("video");
      if (!video) return;
      if (i === g && inView.current) video.play().catch(() => {});
      else video.pause();
    });
  }, []);

  // One pass per frame: read every position first, then write, so nothing forces extra layout
  const update = useCallback(() => {
    frame.current = 0;
    const track = trackRef.current;
    if (!track) return;
    const els = tileEls();
    if (!els.length) return;
    const step = stepOf(els);
    const centre = track.scrollLeft + track.clientWidth / 2;
    const ds = els.map((el) => (el.offsetLeft + el.offsetWidth / 2 - centre) / step);

    let g = 0;
    ds.forEach((d, i) => {
      if (Math.abs(d) < Math.abs(ds[g])) g = i;
    });

    els.forEach((el, i) => {
      const d = Math.max(-3, Math.min(3, ds[i]));
      el.style.setProperty("--d", d.toFixed(4));
      el.style.setProperty("--ad", Math.min(2, Math.abs(d)).toFixed(4));
      // Promote only the tiles that are actually moving on screen to their own layer
      el.toggleAttribute("data-near", Math.abs(ds[i]) < 2.5);
      // Load a clip only once the carousel is near the screen and the clip is near the middle
      const video = el.querySelector<HTMLVideoElement>("video[data-src]");
      if (video && nearView.current && step > 40 && Math.abs(ds[i]) < 3.5) {
        video.src = video.dataset.src!;
        video.removeAttribute("data-src");
      }
    });

    if (g !== activeGlobal.current) {
      els[activeGlobal.current]?.removeAttribute("data-active");
      els[g].setAttribute("data-active", "");
      activeGlobal.current = g;
      setActive(g % n);
      playOnly(g);
    }
  }, [n, playOnly]);

  const requestUpdate = useCallback(() => {
    if (!frame.current) frame.current = requestAnimationFrame(update);
  }, [update]);

  // Infinite loop: once settled in an outer copy, jump by one copy's width to the same tile in
  // the middle copy. Identical content at an identical position, so the jump is invisible.
  const recentre = useCallback(() => {
    const track = trackRef.current;
    if (!track || !loop || drag.current || glide.current) return;
    const els = tileEls();
    const g = nearestIndex(els, track.scrollLeft);
    if (g >= n && g < 2 * n) return;
    const shift = (g < n ? n : -n) * stepOf(els);
    track.style.scrollSnapType = "none";
    track.scrollLeft += shift;
    track.style.scrollSnapType = "";
    update();
  }, [loop, n, update]);

  const glideTo = useCallback(
    (g: number) => {
      const track = trackRef.current;
      const el = tileEls()[g];
      if (!track || !el) return;
      cancelAnimationFrame(glide.current);
      const from = track.scrollLeft;
      const distance = targetFor(el) - from;
      if (Math.abs(distance) < 1) {
        recentre();
        return;
      }
      const duration = Math.min(GLIDE_MAX_MS, Math.max(GLIDE_MIN_MS, 220 + Math.abs(distance) * 0.35));
      const start = performance.now();
      track.style.scrollSnapType = "none"; // snap would fight the glide
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        track.scrollLeft = from + distance * easeOutQuint(t);
        if (t < 1) glide.current = requestAnimationFrame(tick);
        else {
          glide.current = 0;
          track.style.scrollSnapType = "";
          recentre();
        }
      };
      glide.current = requestAnimationFrame(tick);
    },
    [recentre]
  );

  // Keyboard steps jump instantly: keyboard-driven motion should not animate
  const jumpTo = useCallback(
    (g: number) => {
      const track = trackRef.current;
      const el = tileEls()[g];
      if (!track || !el) return;
      track.style.scrollSnapType = "none";
      track.scrollLeft = targetFor(el);
      track.style.scrollSnapType = "";
      update();
      recentre();
    },
    [update, recentre]
  );

  const stepBy = (delta: number, instant = false) => {
    const target = Math.max(0, Math.min(tiles.length - 1, activeGlobal.current + delta));
    if (instant) jumpTo(target);
    else glideTo(target);
  };

  // Start centred on the first clip of the middle copy; keep that clip centred on resize
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const startAt = loop ? n : 0;
    const centreOn = (g: number) => {
      const el = tileEls()[g];
      if (!el) return;
      track.style.scrollSnapType = "none";
      track.scrollLeft = targetFor(el);
      track.style.scrollSnapType = "";
      update();
    };
    centreOn(startAt);
    const observer = new ResizeObserver(() => centreOn(Math.max(0, activeGlobal.current)));
    observer.observe(track);
    return () => observer.disconnect();
  }, [loop, n, update]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    // Scrolling has fully stopped. Touch: the browser's own snap has already landed the clip, so
    // just re-centre the loop. Mouse/trackpad: no browser snap, so ease onto the nearest clip.
    // Never act mid-momentum: jumping scrollLeft while a phone is still coasting kills the coast.
    const settle = () => {
      if (drag.current || glide.current) return;
      if (finePointer.matches) glideTo(nearestIndex(tileEls(), track.scrollLeft));
      else recentre();
    };
    const hasScrollEnd = "onscrollend" in window;
    const onScroll = () => {
      requestUpdate();
      if (!hasScrollEnd) {
        clearTimeout(settleTimer.current);
        settleTimer.current = setTimeout(settle, SETTLE_MS);
      }
    };
    // The user takes hold again: drop any glide in progress so it never fights their hand
    const interrupt = () => {
      if (!glide.current) return;
      cancelAnimationFrame(glide.current);
      glide.current = 0;
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    if (hasScrollEnd) track.addEventListener("scrollend", settle);
    track.addEventListener("wheel", interrupt, { passive: true });
    track.addEventListener("touchstart", interrupt, { passive: true });

    // Pause the playing clip whenever the carousel is off screen
    const observer = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting;
      playOnly(activeGlobal.current);
    });
    observer.observe(track);

    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        nearView.current = entry.isIntersecting;
        if (entry.isIntersecting) update(); // directly: no need to wait for a frame
      },
      { rootMargin: "100% 0px" }
    );
    nearObserver.observe(track);

    return () => {
      track.removeEventListener("scroll", onScroll);
      track.removeEventListener("scrollend", settle);
      track.removeEventListener("wheel", interrupt);
      track.removeEventListener("touchstart", interrupt);
      observer.disconnect();
      nearObserver.disconnect();
      clearTimeout(settleTimer.current);
      cancelAnimationFrame(frame.current);
      cancelAnimationFrame(glide.current);
    };
  }, [requestUpdate, update, recentre, playOnly, glideTo]);

  // Mouse drag (touch and trackpads already scroll natively). On release the carousel carries the
  // throw's momentum to the nearest clip.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const track = trackRef.current!;
    cancelAnimationFrame(glide.current);
    glide.current = 0;
    drag.current = { x: e.clientX, scroll: track.scrollLeft, t: performance.now(), vx: 0, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const track = trackRef.current!;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true;
      track.setPointerCapture(e.pointerId);
      track.dataset.dragging = "";
    }
    if (!d.moved) return;
    const now = performance.now();
    const next = d.scroll - dx;
    d.vx = (track.scrollLeft - next) / Math.max(1, now - d.t); // px per ms, positive = moving right
    d.t = now;
    track.scrollLeft = next;
  };

  const endDrag = () => {
    const d = drag.current;
    drag.current = null;
    const track = trackRef.current!;
    if (!d?.moved) return;
    delete track.dataset.dragging;
    suppressClick.current = true;
    setTimeout(() => (suppressClick.current = false), 0);
    // Carry the throw: a fast flick travels several clips, a slow release settles on the nearest
    const projected = track.scrollLeft - d.vx * 320;
    glideTo(nearestIndex(tileEls(), projected));
  };

  const current = projects[active];
  const creator = current ? creatorHandle(current) : null;

  return (
    <section
      ref={rootRef}
      className="wc"
      data-orientation={orientation}
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="wc-head">
        <p className="panel-label">{label}</p>
        {n > 1 && (
          <div className="wc-controls">
            <span className="wc-count" aria-live="polite">
              {active + 1} / {n}
            </span>
            <button type="button" className="wc-arrow" aria-label="Previous video" onClick={() => stepBy(-1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button type="button" className="wc-arrow" aria-label="Next video" onClick={() => stepBy(1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="wc-viewport">
      <div
        ref={trackRef}
        className="wc-track"
        tabIndex={0}
        aria-label={`${label}: use the arrow keys to move between videos`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            stepBy(1, true);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            stepBy(-1, true);
          }
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(e) => {
          // A drag ends with a click; don't let it open a video
          if (suppressClick.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {tiles.map(({ project, i, key }, g) => (
          <div key={key} className="wc-item" aria-hidden={loop && (g < n || g >= 2 * n) ? true : undefined}>
            <div
              className="wc-media video-card"
              role="button"
              tabIndex={-1}
              aria-label={`Play ${categoryLabel(project.category)} video ${i + 1}`}
              onClick={(e) => {
                // A side tile comes to the centre first; the centre tile opens
                if (g !== activeGlobal.current) glideTo(g);
                else onOpen(project, e);
              }}
            >
              <video
                data-src={project.previewUrl ?? `${project.videoUrl}#t=0.1`}
                muted
                loop
                playsInline
                preload="metadata"
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
              />
              <span className="wc-play" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 4.8v14.4c0 .8.9 1.3 1.6.9l11.2-7.2c.6-.4.6-1.3 0-1.7L8.6 3.9C7.9 3.5 7 4 7 4.8z" />
                </svg>
              </span>
            </div>
          </div>
        ))}
      </div>
      </div>

      {/* Names the centre clip, outside the picture */}
      {current && (
        <p key={current.id} className="wc-caption">
          {categoryLabel(current.category)}
          {current.subcategory ? `, ${current.subcategory}` : ""}
          {creator && <span className="wc-caption-creator">{creator}</span>}
        </p>
      )}
    </section>
  );
}
