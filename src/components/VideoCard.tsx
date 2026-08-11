"use client";

import { useRef, useState, useEffect } from "react";

interface VideoCardProps {
  title: string;
  category: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  aspectRatio: string;
  featured?: boolean;
  onClick?: () => void;
}

export default function VideoCard({
  title,
  category,
  videoUrl,
  thumbnailUrl,
  aspectRatio,
  featured,
  onClick,
}: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHoverable, setIsHoverable] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

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

  // No need for hover play/pause — videos always autoplay as previews

  // Force all previews to be rectangular (16:9)
  const aspectClass = "aspect-video";

  return (
    <div
      ref={cardRef}
      className="group relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface-900)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all duration-300 cursor-pointer"
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

            {/* Video — always autoplays as a live preview */}
            <video
              ref={videoRef}
              src={videoUrl}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
              onLoadedData={() => setIsLoaded(true)}
            />
          </>
        )}

        {/* Mobile: play icon overlay (when hoverable devices don't exist) */}
        {!isHoverable && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-70">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="none">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="text-[9px] font-medium uppercase tracking-[0.15em] px-2 py-1 rounded-[var(--radius-sm)] bg-black/50 backdrop-blur-sm text-white/80">
            {category}
          </span>
        </div>

        {/* Featured badge */}
        {featured && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="text-[9px] font-medium uppercase tracking-[0.15em] px-2 py-1 rounded-[var(--radius-sm)] bg-[var(--color-accent-500)]/30 backdrop-blur-sm text-[var(--color-accent-300)]">
              Featured
            </span>
          </div>
        )}



        {/* Hover scale effect (desktop) */}
        <div className="absolute inset-0 bg-[var(--color-accent-500)]/0 group-hover:bg-[var(--color-accent-500)]/5 transition-colors duration-300" />
      </div>
    </div>
  );
}
