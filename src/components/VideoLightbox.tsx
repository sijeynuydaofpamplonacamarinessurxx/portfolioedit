"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { playCopySound } from "@/lib/sound";

interface VideoLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
  slug?: string;
  /** Where the clicked card sat on screen; the player zooms out of it */
  originRect?: DOMRect;
}

const ZOOM_MS = 560;
const CLOSE_MS = 220;
const EASE_DRAWER = "cubic-bezier(0.32, 0.72, 0, 1)";
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

export default function VideoLightbox({ isOpen, onClose, videoUrl, title, slug, originRect }: VideoLightboxProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startY = useRef<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [closing, setClosing] = useState(false);

  // Fresh state for every video opened
  useEffect(() => {
    if (isOpen) {
      setPlaying(false);
      setClosing(false);
    }
  }, [isOpen, videoUrl]);

  const handleCopyLink = async () => {
    if (!slug) return;
    playCopySound();
    const url = `${window.location.origin}/?v=${slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Quieter, faster exit than the entrance: fade and settle back slightly, then unmount
  const close = useCallback(() => {
    if (closing) return;
    setClosing(true);
    videoRef.current?.pause();
    overlayRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: CLOSE_MS, easing: "ease-out", fill: "forwards" });
    frameRef.current?.animate(
      [{ transform: "scale(1)", opacity: 1 }, { transform: "scale(0.96)", opacity: 0 }],
      { duration: CLOSE_MS, easing: EASE_OUT, fill: "forwards" }
    );
    setTimeout(onClose, CLOSE_MS);
  }, [closing, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  // Zoom the player out of the clicked card (FLIP: start at the card, animate to the final spot).
  // Uniform scale keeps the video's shape; without a card (shared ?v= link) it simply scales in.
  useLayoutEffect(() => {
    if (!isOpen || !frameRef.current || !overlayRef.current) return;
    const frame = frameRef.current;
    overlayRef.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ZOOM_MS * 0.7, easing: "ease-out" });
    const end = frame.getBoundingClientRect();
    if (originRect && end.width > 0) {
      const scale = originRect.width / end.width;
      const dx = originRect.left + originRect.width / 2 - (end.left + end.width / 2);
      const dy = originRect.top + originRect.height / 2 - (end.top + end.height / 2);
      frame.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0.85 },
          { transform: "translate(0, 0) scale(1)", opacity: 1 },
        ],
        { duration: ZOOM_MS, easing: EASE_DRAWER }
      );
    } else {
      frame.animate(
        [
          { transform: "scale(0.94)", opacity: 0 },
          { transform: "scale(1)", opacity: 1 },
        ],
        { duration: ZOOM_MS * 0.7, easing: EASE_OUT }
      );
    }
  }, [isOpen, videoUrl, originRect]);

  const play = () => {
    setPlaying(true);
    videoRef.current?.play().catch(() => {});
  };

  // Swipe-to-dismiss on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - startY.current;
    if (Math.abs(deltaY) > 100) close();
    startY.current = null;
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={title ? `Video: ${title}` : "Video player"}
      onClick={(e) => {
        if (e.target === overlayRef.current) close();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top-right buttons */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {slug && (
          <button
            type="button"
            onClick={handleCopyLink}
            className="lightbox-btn"
            title="Copy link to this video"
            aria-label={copied ? "Link copied" : "Copy link to this video"}
          >
            {copied ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            )}
          </button>
        )}
        <button type="button" onClick={close} className="lightbox-btn" aria-label="Close video">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Video player */}
      <div className="w-full max-w-4xl" style={{ margin: "0 1rem" }}>
        <div ref={frameRef} className="lightbox-frame" data-playing={playing || undefined}>
          {/* Holds on the first frame until played; controls appear once playing */}
          <video
            ref={videoRef}
            src={`${videoUrl}#t=0.1`}
            controls={playing}
            preload="metadata"
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            onPlay={() => setPlaying(true)}
            className="lightbox-video"
            playsInline
          />
          <button
            type="button"
            className="lightbox-play"
            onClick={play}
            aria-label={title ? `Play ${title}` : "Play video"}
            tabIndex={playing ? -1 : 0}
            autoFocus
          >
            <span className="lightbox-play-ring" aria-hidden="true" />
            <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5.5v13a1 1 0 0 0 1.52.85l10.4-6.5a1 1 0 0 0 0-1.7L9.52 4.65A1 1 0 0 0 8 5.5z" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] text-white/30 sm:hidden" style={{ marginTop: "0.75rem" }}>
          Swipe down to close
        </p>
      </div>
    </div>
  );
}
