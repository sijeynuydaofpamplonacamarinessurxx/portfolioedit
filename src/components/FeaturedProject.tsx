"use client";

import { useEffect, useRef, useState } from "react";
import { playPulse } from "@/lib/pulse";
import { playCopySound } from "@/lib/sound";

export const FEATURED_PROJECT = {
  slug: "adnu-promotional-film",
  title: "ADNU promotional film",
  client: "Ateneo de Naga University, Global Engagement Office",
  credit: "Filmed and edited by FilmCy",
  tags: ["Promotional", "Motion graphics"],
  videoUrl: "/videos/featured/adnu-promo.mp4",
  posterUrl: "/videos/featured/adnu-promo-poster.jpg",
  runtime: "1:30",
} as const;

interface FeaturedProjectProps {
  /** Opens the film in the full player; receives the frame so the player can grow out of it */
  onOpen: (frame: HTMLElement, e: React.MouseEvent<HTMLElement>) => void;
  /** True while the full player has this film open, so the inline copy stays quiet */
  playerOpen?: boolean;
}

function SoundOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" />
      <path d="m22 9-6 6M16 9l6 6" />
    </svg>
  );
}

function SoundOnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

export default function FeaturedProject({ onOpen, playerOpen = false }: FeaturedProjectProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [lit, setLit] = useState(false);
  const [muted, setMuted] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Plays (muted) the moment the film is on screen and pauses when it leaves, so it never
  // spends bandwidth or plays sound out of sight. The first time it's seen, the spotlight
  // switches on (once; it stays on after that).
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setLit(true);
      },
      { threshold: 0.35 }
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (inView && !playerOpen) video.play().catch(() => {});
    else video.pause();
  }, [inView, playerOpen]);

  // Spotlight that follows the cursor across the frame (style vars, no re-render per move)
  const trackPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  const p = FEATURED_PROJECT;

  return (
    <section
      className="featured"
      aria-labelledby="featured-title"
      data-playing={inView || undefined}
      data-lit={lit || undefined}
    >
      {/* Spotlight from the upper left, falling across the description and the film */}
      <div className="featured-light" aria-hidden="true">
        <span className="featured-beam" />
        <span className="featured-floor" />
        <span className="featured-source" />
      </div>

      <div className="featured-inner">
        <div className="featured-info">
          <p className="featured-label">
            <span className="featured-label-spot">Spotlight</span>
            <span className="featured-label-divider" aria-hidden="true" />
            Featured Project
          </p>
          <h2 id="featured-title" className="featured-title">
            {p.title}
          </h2>
          {/* Details stay tucked away until asked for, so the film does the talking */}
          <button
            type="button"
            className="featured-details-toggle"
            aria-expanded={detailsOpen}
            aria-controls="featured-details"
            onClick={(e) => {
              // Same press pulse as the contact pills (white here), from where it was tapped
              playCopySound(); // first, while still inside the click, so it plays instantly
              playPulse(e.currentTarget, e);
              setDetailsOpen((open) => !open);
            }}
          >
            <span className="featured-details-ripple" aria-hidden="true" />
            Details
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <div id="featured-details" className="featured-details" data-open={detailsOpen || undefined} inert={!detailsOpen}>
            <div className="featured-details-inner">
              <p className="featured-summary">{p.client}</p>
              <p className="featured-credit">{p.credit}</p>
              <ul className="featured-tags" aria-label="Tags">
                {p.tags.map((tag) => (
                  <li key={tag} className="featured-tag">
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="featured-stage">
          {/* The film hovers above its platform, drifting gently up and down */}
          <div className="featured-float">
          {/* Ambient glow from the film's own colours, behind the frame */}
          <img className="featured-glow" src={p.posterUrl} alt="" aria-hidden="true" />

          <div ref={frameRef} className="featured-frame" onPointerMove={trackPointer}>
            <video
              ref={videoRef}
              src={p.videoUrl}
              poster={p.posterUrl}
              muted={muted}
              loop
              playsInline
              preload="metadata"
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
            />

            {/* Where the beam lands: the light falls across the picture from the upper left */}
            <span className="featured-pool" aria-hidden="true" />

            {/* The whole frame opens the full player */}
            <button
              type="button"
              className="featured-open"
              aria-label={`Watch ${p.title} in the full player, ${p.runtime}`}
              onClick={(e) => onOpen(frameRef.current ?? e.currentTarget, e)}
            >
              <span className="featured-play" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 4.8v14.4c0 .8.9 1.3 1.6.9l11.2-7.2c.6-.4.6-1.3 0-1.7L8.6 3.9C7.9 3.5 7 4 7 4.8z" />
                </svg>
              </span>
            </button>

            <div className="featured-controls">
              <button
                type="button"
                className="featured-sound"
                aria-pressed={!muted}
                aria-label={muted ? "Turn sound on" : "Turn sound off"}
                onClick={() => {
                  const next = !muted;
                  setMuted(next);
                  // Unmuting is a user gesture, so playback with sound is allowed from here
                  if (!next) videoRef.current?.play().catch(() => {});
                }}
              >
                <span key={muted ? "off" : "on"} className="featured-sound-icon">
                  {muted ? <SoundOffIcon /> : <SoundOnIcon />}
                </span>
                <span className="featured-sound-text">{muted ? "Sound off" : "Sound on"}</span>
              </button>
              <span className="featured-runtime">{p.runtime}</span>
            </div>
          </div>
          </div>

          {/* Display platform: a lit disc the film floats over, with the film's shadow on it */}
          <div className="featured-platform" aria-hidden="true">
            <span className="featured-platform-base" />
            <span className="featured-platform-side" />
            <span className="featured-platform-top">
              <span className="featured-platform-shadow" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
