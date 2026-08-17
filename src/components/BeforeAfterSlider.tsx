"use client";

import { useRef, useState, useCallback } from "react";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  isVideo?: boolean;
  className?: string;
}

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "BEFORE",
  afterLabel = "AFTER",
  isVideo = false,
  className = "",
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const updatePosition = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setPosition(percentage);
      if (!hasInteracted) setHasInteracted(true);
    },
    [hasInteracted]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const MediaElement = isVideo ? "video" : "img";
  const mediaProps = isVideo
    ? { autoPlay: true, muted: true, loop: true, playsInline: true, controlsList: "nodownload", onContextMenu: (e: React.MouseEvent) => e.preventDefault() }
    : {};

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-[var(--radius-xl)] select-none touch-none cursor-col-resize ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      role="slider"
      aria-label="Before and after comparison"
      aria-valuenow={Math.round(position)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") setPosition(Math.max(0, position - 2));
        if (e.key === "ArrowRight") setPosition(Math.min(100, position + 2));
      }}
    >
      {/* After (bottom layer — full) */}
      <MediaElement
        src={afterSrc}
        className="w-full h-full object-cover block"
        alt={isVideo ? undefined : "After"}
        {...(mediaProps as React.HTMLAttributes<HTMLVideoElement | HTMLImageElement>)}
      />

      {/* Before (top layer — clipped) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <MediaElement
          src={beforeSrc}
          className="w-full h-full object-cover block"
          alt={isVideo ? undefined : "Before"}
          {...(mediaProps as React.HTMLAttributes<HTMLVideoElement | HTMLImageElement>)}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/80 z-10 pointer-events-none"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" className="-ml-2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div
        className="absolute top-3 left-3 text-[10px] font-semibold tracking-[0.08em] uppercase px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 shadow-sm pointer-events-none transition-opacity duration-300"
        style={{ opacity: position > 15 ? 1 : 0 }}
      >
        {beforeLabel}
      </div>
      <div
        className="absolute top-3 right-3 text-[10px] font-semibold tracking-[0.08em] uppercase px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 shadow-sm pointer-events-none transition-opacity duration-300"
        style={{ opacity: position < 85 ? 1 : 0 }}
      >
        {afterLabel}
      </div>

      {/* Drag hint (shows once, then fades) */}
      {!hasInteracted && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-white/60 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full pointer-events-none animate-pulse">
          ← Drag to compare →
        </div>
      )}
    </div>
  );
}
