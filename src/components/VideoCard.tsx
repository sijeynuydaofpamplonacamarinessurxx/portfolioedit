"use client";

import { useRef, useState, useEffect } from "react";
import { CATEGORIES } from "@/lib/utils";
import { playPulse } from "@/lib/pulse";

interface VideoCardProps {
  title: string;
  slug: string;
  category: string;
  subcategory?: string | null;
  videoUrl: string;
  /** Small 540p loop for the grid; without one the card falls back to hover-to-play */
  previewUrl?: string | null;
  thumbnailUrl?: string | null;
  aspectRatio: string;
  featured?: boolean;
  creator?: string | null;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onCopyLink?: (slug: string) => void;
}

export default function VideoCard({
  title,
  slug,
  category,
  subcategory,
  videoUrl,
  previewUrl,
  thumbnailUrl,
  aspectRatio,
  featured,
  creator,
  onClick,
  onCopyLink,
}: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHoverable, setIsHoverable] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Check if device supports hover
  useEffect(() => {
    setIsHoverable(window.matchMedia("(hover: hover)").matches);
  }, []);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  // Small preview clips are cheap, so they autoplay whenever the card is on screen
  const [isOnScreen, setIsOnScreen] = useState(false);
  useEffect(() => {
    if (!previewUrl) return;
    const observer = new IntersectionObserver(([entry]) => setIsOnScreen(entry.isIntersecting));
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [previewUrl]);

  // Without a preview, touch devices preview whichever card crosses the middle of the screen
  const [isCentered, setIsCentered] = useState(false);
  useEffect(() => {
    if (previewUrl || isHoverable) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsCentered(entry.isIntersecting),
      { rootMargin: "-45% 0px -45% 0px" }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [previewUrl, isHoverable]);

  // Full-HD originals shown at card size peg the GPU when many play at once, so cards without
  // a preview only play while hovered (or centered, on touch) and otherwise hold a still frame.
  const shouldPlay = previewUrl ? isOnScreen : isHoverable ? isHovered : isCentered;
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (shouldPlay) video.play().catch(() => {});
    else video.pause();
  }, [shouldPlay, isVisible]);

  // Force all previews to be rectangular (16:9)
  const aspectClass = "aspect-video";

  return (
    <div
      ref={cardRef}
      className="video-card group relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface-900)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className={`relative ${aspectClass} overflow-hidden bg-[var(--color-surface-800)]`}>
        {/* Shimmer skeleton */}
        {!isLoaded && (
          <div className="absolute inset-0 animate-shimmer" />
        )}

        {isVisible && (
          <>
            {/* Thumbnail / poster */}
            {thumbnailUrl && (
              <img
                src={thumbnailUrl}
                alt={title}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  isHovered && isHoverable ? "opacity-0" : "opacity-100"
                }`}
                onLoad={() => setIsLoaded(true)}
              />
            )}

            {/* Video — the small preview loop when available; otherwise the original, held on a
                still frame until hovered/centered (#t=0.1 paints a real frame instead of a blank box) */}
            <video
              ref={videoRef}
              src={previewUrl ?? `${videoUrl}#t=0.1`}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              loop
              playsInline
              preload="metadata"
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
              onLoadedData={() => setIsLoaded(true)}
            />
          </>
        )}

        {/* Mobile: play icon overlay (when hoverable devices don't exist) */}
        {!isHoverable && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="card-play" aria-hidden="true">
              {/* Centroid at x=12, so it reads as centred in the circle (a bbox-centred triangle looks left) */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.5 4.8v14.4c0 .8.9 1.3 1.6.9l11.2-7.2c.6-.4.6-1.3 0-1.7L10.1 3.9c-.7-.4-1.6.1-1.6.9z" transform="translate(-0.8 0)" />
              </svg>
            </div>
          </div>
        )}

        {/* Category & Creator badges */}
        {(() => {
          let activeCreator = creator;
          if (!activeCreator && (title.toLowerCase().includes("900pc") || title.toLowerCase().includes("nwbuilds"))) activeCreator = "NwBuilds";
          if (!activeCreator && (category === "cinematic" || title.toLowerCase().includes("luma") || title.toLowerCase().includes("shi-2"))) activeCreator = "FilmCy";

          const formattedCreator = activeCreator
            ? activeCreator.startsWith("@")
              ? activeCreator
              : `@${activeCreator}`
            : null;

          return (
            <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 flex-wrap">
              <span className="badge-pill badge-pill-category">
                {CATEGORIES.find(c => c.value === category)?.label || category}
              </span>
              {subcategory && (
                <span className="badge-pill badge-pill-category" style={{ opacity: 0.8 }}>
                  {subcategory}
                </span>
              )}
              {formattedCreator && (
                <span className="badge-pill badge-pill-creator">
                  {formattedCreator}
                </span>
              )}
            </div>
          );
        })()}

        {/* Featured badge */}
        {featured && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="badge-pill badge-pill-featured">
              Featured
            </span>
          </div>
        )}


        {/* Copy link button */}
        {onCopyLink && (
          <button
            className="copy-link-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (cardRef.current) playPulse(cardRef.current, e);
              onCopyLink(slug);
              setIsCopied(true);
              clearTimeout(copiedTimer.current);
              copiedTimer.current = setTimeout(() => setIsCopied(false), 1600);
            }}
            title="Copy link to this video"
            aria-label={isCopied ? "Link copied" : "Copy link to this video"}
          >
            {isCopied ? (
              <svg key="check" className="icon-swap-in" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg key="link" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            )}
          </button>
        )}

        {/* Hover scale effect (desktop) */}
        <div className="absolute inset-0 bg-[var(--color-accent-500)]/0 group-hover:bg-[var(--color-accent-500)]/5 transition-colors duration-300" />
      </div>
    </div>
  );
}
