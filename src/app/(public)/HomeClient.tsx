"use client";

import { useState, useEffect, useCallback, useLayoutEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import WorkCarousel from "@/components/WorkCarousel";
import VideoLightbox from "@/components/VideoLightbox";
import CategoryFilter from "@/components/CategoryFilter";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import FeaturedProject, { FEATURED_PROJECT } from "@/components/FeaturedProject";
import { CATEGORIES } from "@/lib/utils";
import { playPulse } from "@/lib/pulse";
import { enableSmoothWheel } from "@/lib/smoothWheel";
import { playCopySound, playOpenSound, playSelectSound } from "@/lib/sound";

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  subcategory?: string | null;
  videoUrl: string;
  previewUrl?: string | null;
  thumbnailUrl: string | null;
  aspectRatio: string;
  featured: boolean;
  creator?: string | null;
  beforeUrl: string | null;
  afterUrl: string | null;
}

interface Settings {
  heroTitle: string;
  heroSubtitle: string;
  showreelUrl: string | null;
  contactEmail: string | null;
  socialLinks: string | null;
}

interface HomeClientProps {
  projects: Project[];
  beforeAfterProjects: Project[];
  settings: Settings | null;
}

const BRAND_ICON = "w-7 h-7 object-contain grayscale contrast-125 brightness-150 opacity-80";
const MONO_ICON = "w-7 h-7 object-contain brightness-0 invert opacity-70";

const TOOLS = [
  { id: "davinci", label: "DaVinci Resolve", icon: "/assets/DAVINCILOGO.png", iconClassName: "w-8 h-8 object-contain grayscale contrast-125 brightness-150 opacity-80" },
  { id: "epidemic", label: "Epidemic Sound", icon: "/assets/epidemic-sounds.png", iconClassName: "w-8 h-8 object-contain grayscale contrast-125 brightness-150 opacity-80" },
  { id: "ocular", label: "Ocular Sounds", icon: "/assets/ocular-sounds.png", iconClassName: "w-10 h-10 object-contain grayscale contrast-125 brightness-150 opacity-80 scale-125" },
] as const;

const CONTACTS: readonly { id: ContactId; label: string; icon: string; iconClassName: string; value: string; href?: string }[] = [
  { id: "email", label: "Email", icon: "/assets/email i con.png", iconClassName: MONO_ICON, value: "sijeynuyda@gmail.com" },
  { id: "tiktok", label: "TikTok", icon: "/assets/tiktoklogo.webp", iconClassName: BRAND_ICON, value: "@selponniyuna", href: "https://www.tiktok.com/@selponniyuna" },
  { id: "discord", label: "Discord", icon: "/assets/discord logo.webp", iconClassName: BRAND_ICON, value: "sijey2654" },
  { id: "whatsapp", label: "WhatsApp", icon: "/assets/whatsapp-white-icon.webp", iconClassName: MONO_ICON, value: "+639274423204" },
];

type ToolId = (typeof TOOLS)[number]["id"];
type ContactId = "email" | "tiktok" | "discord" | "whatsapp";

interface ExpandPillProps {
  icon: string;
  iconClassName: string;
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function ExpandPill({ icon, iconClassName, label, open, onToggle, children }: ExpandPillProps) {
  const pillRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // CSS can't transition width to `auto`, so hand it the label's real width
  useLayoutEffect(() => {
    const measure = () => {
      if (pillRef.current && contentRef.current) {
        pillRef.current.style.setProperty("--label-w", `${contentRef.current.scrollWidth}px`);
      }
    };
    measure();
    // Web fonts can finish loading after first paint and change the label width
    document.fonts?.ready.then(measure);
  }, [children]);

  return (
    <div ref={pillRef} className="pill" data-pill data-open={open || undefined}>
      <button
        type="button"
        className="pill-icon"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={label}
        // Press state from pointer events: iOS often skips :active on a quick tap
        onPointerDown={() => pillRef.current?.setAttribute("data-pressed", "")}
        onPointerUp={() => pillRef.current?.removeAttribute("data-pressed")}
        onPointerCancel={() => pillRef.current?.removeAttribute("data-pressed")}
        onPointerLeave={() => pillRef.current?.removeAttribute("data-pressed")}
      >
        <img src={icon} alt="" className={iconClassName} draggable={false} />
      </button>
      <div className="pill-label" inert={!open}>
        <div ref={contentRef}>{children}</div>
      </div>
    </div>
  );
}

// Eased scroll we control ourselves: native smooth scrolling is too quick over long distances
// and gets switched off entirely by the OS reduced-motion setting.
function smoothScrollTo(target: HTMLElement | null) {
  if (!target) return;
  const start = window.scrollY;
  const distance = target.getBoundingClientRect().top;
  // Longer trips get more time, within 700–1300ms
  const duration = Math.min(1300, Math.max(700, Math.abs(distance) * 0.9));
  const easeInOutQuart = (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2);
  const startTime = performance.now();
  let frame = 0;
  // Lets CSS swap expensive effects for cheap ones while everything is moving
  document.documentElement.dataset.autoScrolling = "";

  // Hand control back the moment the user scrolls themselves
  const cancel = () => {
    cancelAnimationFrame(frame);
    delete document.documentElement.dataset.autoScrolling;
    window.removeEventListener("wheel", cancel);
    window.removeEventListener("touchstart", cancel);
    window.removeEventListener("keydown", cancel);
  };
  window.addEventListener("wheel", cancel, { passive: true });
  window.addEventListener("touchstart", cancel, { passive: true });
  window.addEventListener("keydown", cancel);

  const step = (now: number) => {
    const t = Math.min(1, (now - startTime) / duration);
    // "instant": <html> has scroll-behavior: smooth, which would re-smooth every step
    window.scrollTo({ top: start + distance * easeInOutQuart(t), behavior: "instant" });
    if (t < 1) frame = requestAnimationFrame(step);
    else cancel();
  };
  frame = requestAnimationFrame(step);
}

// Gmail's compose window, already addressed to me with a brief to fill in. A mailto: link
// depends on the visitor having a desktop mail app set up; this works in any browser.
const INQUIRY_SUBJECT = "Video editing project inquiry";
const INQUIRY_BODY = `[Please fill out the details below before sending]

Hi Sijey,

Format (short-form, long-form, cinematic, other):

Goal of the video:

Reference video (if there are any, send me the link):

Where did you find me:


---
A note from Sijey: thanks for reaching out! I'll get back to you as soon as I see your email.`;

function gmailDraftUrl(to: string) {
  const params = new URLSearchParams({ view: "cm", fs: "1", to, su: INQUIRY_SUBJECT, body: INQUIRY_BODY });
  return `https://mail.google.com/mail/?${params}`;
}

function CheckIcon() {
  return (
    <svg className="icon-swap-in" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  );
}

export default function HomeClient({ projects, beforeAfterProjects, settings }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightbox, setLightbox] = useState<{ url: string; title: string; slug: string; originRect?: DOMRect } | null>(null);
  const [activeContact, setActiveContact] = useState<ContactId | null>(null);
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastKey, setToastKey] = useState(0);
  const searchParams = useSearchParams();
  const glassRef = useRef<HTMLDivElement>(null);

  // Switching straight from one open pill to another: one shrinks while the other grows. With
  // their usual (different) timings both are briefly narrow, a wrapped pill hops up a line and then
  // back down. Flag the switch so CSS runs both on one shared curve: the width one gives up is
  // exactly what the other takes, so the row never briefly has room and nothing rewraps.
  const switchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const markPillSwitch = () => {
    const panel = glassRef.current;
    if (!panel) return;
    panel.dataset.pillSwitch = "";
    clearTimeout(switchTimer.current);
    switchTimer.current = setTimeout(() => delete panel.dataset.pillSwitch, 700);
  };

  // Opening or closing a pill changes its width over ~0.5s. Partway through, a row can run out
  // of room and a pill wraps to the next line, which also makes the glass card taller — both in a
  // single frame. For a moment after each toggle, watch the layout and glide those jumps instead:
  // wrapped pills slide from their old spot (FLIP), and the card eases to its new height.
  useEffect(() => {
    const panel = glassRef.current;
    const body = panel?.querySelector<HTMLElement>(".hero-panel-body");
    if (!panel || !body) return;
    const GLIDE = { duration: 480, easing: "cubic-bezier(0.32, 0.72, 0, 1)" };
    const pills = [...panel.querySelectorAll<HTMLElement>(".pill")];
    const last = new Map(pills.map((p) => [p, { x: p.offsetLeft, y: p.offsetTop }]));
    let naturalHeight = body.offsetHeight; // layout height, unaffected by the card's own animation
    const until = performance.now() + 900; // covers the pill's width transition and its overshoot
    let frame = 0;

    const tick = () => {
      for (const pill of pills) {
        const prev = last.get(pill)!;
        const x = pill.offsetLeft;
        const y = pill.offsetTop;
        // Smooth growth only nudges neighbours a few px per frame; a wrap moves a pill a whole row
        if (Math.abs(prev.y - y) > 4 || Math.abs(prev.x - x) > 24) {
          pill.animate(
            [{ transform: `translate(${prev.x - x}px, ${prev.y - y}px)` }, { transform: "translate(0, 0)" }],
            GLIDE
          );
        }
        last.set(pill, { x, y });
      }

      // The card has no padding of its own, so its natural height is the body's
      const height = body.offsetHeight;
      if (Math.abs(height - naturalHeight) > 1) {
        // Start from the old height, or from the on-screen height if a glide is already running
        const gliding = panel.getAnimations().some((a) => a.id === "panel-height" && a.playState === "running");
        const from = gliding ? panel.offsetHeight : naturalHeight;
        panel.getAnimations().forEach((a) => a.id === "panel-height" && a.cancel());
        const glide = panel.animate([{ height: `${from}px` }, { height: `${height}px` }], GLIDE);
        glide.id = "panel-height";
        naturalHeight = height;
      }

      if (performance.now() < until) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [activeTool, activeContact]);
  // Eased, inertial mouse-wheel scrolling so scroll-driven effects glide instead of stepping
  useEffect(() => enableSmoothWheel(), []);

  const heroRef = useRef<HTMLElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  // Stop the hero's video and ambient effects from rendering while it's scrolled out of view
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        delete hero.dataset.offscreen;
        heroVideoRef.current?.play().catch(() => {});
      } else {
        hero.dataset.offscreen = "";
        heroVideoRef.current?.pause();
      }
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  // SVG refraction in backdrop-filter only renders in Chromium; Safari/Firefox (and iOS Chrome, which is WebKit)
  // keep the plain frosted glass. userAgentData would be cleaner but is missing on plain-http LAN access.
  // Phones keep the frosted glass too: the refraction filter re-runs over the hero video every
  // frame, which is the heaviest effect on the page for a phone GPU.
  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (glassRef.current && finePointer && "chrome" in window && !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent)) {
      glassRef.current.dataset.liquid = "";
    }
  }, []);

  // Auto-open lightbox if ?v=slug is in the URL
  useEffect(() => {
    const videoSlug = searchParams.get("v");
    if (videoSlug === FEATURED_PROJECT.slug) {
      const { videoUrl: url, title, slug } = FEATURED_PROJECT;
      setLightbox((prev) => (prev?.slug === slug ? prev : { url, title, slug }));
      return;
    }
    if (videoSlug && projects.length > 0) {
      const matchedProject = projects.find((p) => p.slug === videoSlug);
      if (matchedProject) {
        // Opening from a card also writes ?v= to the URL; keep that lightbox (and its zoom origin)
        setLightbox((prev) =>
          prev?.slug === matchedProject.slug
            ? prev
            : { url: matchedProject.videoUrl, title: matchedProject.title, slug: matchedProject.slug }
        );
      }
    }
  }, [searchParams, projects]);

  // Close an open pill when tapping elsewhere or pressing Escape
  useEffect(() => {
    if (!activeTool && !activeContact) return;
    const close = () => {
      setActiveTool(null);
      setActiveContact(null);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!(e.target as Element).closest("[data-pill]")) close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activeTool, activeContact]);

  const copyText = useCallback(async (text: string, message: string) => {
    playCopySound(); // first, while still inside the click, so it's instant and allowed to play
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers and plain-http LAN access
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setToastMessage(message);
    setToastKey((k) => k + 1);
  }, []);

  // Copying a contact pulses the tile that was pressed and flips its icon to a check for a moment
  const [copiedId, setCopiedId] = useState<ContactId | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copyContact = (
    contact: (typeof CONTACTS)[number],
    tile: HTMLElement | null,
    e: React.MouseEvent<HTMLElement>
  ) => {
    if (tile) playPulse(tile, e);
    copyText(contact.value, `${contact.label} copied`);
    setCopiedId(contact.id);
    clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopiedId(null), 1600);
  };

  // Open lightbox and update URL. From a card, the card pulses first and the player then
  // zooms out of the card's position (originRect).
  const openLightbox = useCallback((project: Project, originRect?: DOMRect) => {
    setLightbox({ url: project.videoUrl, title: project.title, slug: project.slug, originRect });
    window.history.replaceState(null, "", `/?v=${project.slug}`);
  }, []);

  const openFromCard = useCallback(
    (project: Project, e: React.MouseEvent<HTMLElement>) => {
      const card = e.currentTarget;
      playOpenSound();
      // Its own effect (press + light bloom), distinct from the copy-link ripple
      playPulse(card, e, { attr: "opening", duration: 800 });
      // Let the bloom register before the zoom takes over
      setTimeout(() => openLightbox(project, card.getBoundingClientRect()), 260);
    },
    [openLightbox]
  );

  // The featured film opens like a card: press bloom on the frame, then the player grows out of it
  const openFeatured = useCallback((frame: HTMLElement, e: React.MouseEvent<HTMLElement>) => {
    playOpenSound();
    playPulse(frame, e, { attr: "opening", duration: 800 });
    const { videoUrl: url, title, slug } = FEATURED_PROJECT;
    setTimeout(() => {
      setLightbox({ url, title, slug, originRect: frame.getBoundingClientRect() });
      window.history.replaceState(null, "", `/?v=${slug}`);
    }, 260);
  }, []);

  // Close lightbox and clean URL
  const closeLightbox = useCallback(() => {
    setLightbox(null);
    window.history.replaceState(null, "", "/");
  }, []);

  const filteredProjects =
    activeCategory === "all"
      ? [...projects].sort((a, b) => {
        const order: Record<string, number> = { shortforms: 0, longforms: 1 };
        const aOrder = order[a.category] ?? 2;
        const bOrder = order[b.category] ?? 2;
        return aOrder - bOrder;
      })
      : projects.filter((p) => p.category === activeCategory);

  const heroTitle = settings?.heroTitle || "Video Editor & Motion Designer";
  const heroSubtitle = settings?.heroSubtitle || "Turning raw footage into cinematic stories";

  return (
    <>
      {/* ═══════════════════════════════════════════ */}
      {/* HERO SECTION */}
      {/* ═══════════════════════════════════════════ */}
      <section ref={heroRef} className="hero relative flex flex-col items-center justify-center overflow-hidden">
        {/* Background video */}
        <video
          ref={heroVideoRef}
          data-hero-video
          src={settings?.showreelUrl || "/videos/about-me-bg.mp4"}
          autoPlay
          muted
          loop
          playsInline
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
          className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
        />

        {/* Ambient light behind the glass, film grain, and dark overlay */}
        <div className="hero-orb hero-orb-a" />
        <div className="hero-orb hero-orb-b" />
        <div className="hero-grain" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black pointer-events-none" />

        {/* Refraction map for the liquid glass panel */}
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <filter id="liquid-refract" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.006 0.009" numOctaves="2" seed="7" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="3" result="softNoise" />
            <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="90" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>

        {/* Content */}
        <div className="hero-content relative z-10 w-full flex flex-col md:flex-row items-center justify-center">
          {/* Left: Intro */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left" style={{ gap: '1.25rem', padding: '0 1.25rem' }}>
            <div className="hero-chip hero-rise" style={{ "--i": 0, "--exit-y": "150px" } as React.CSSProperties}>
              <span className="hero-chip-dot" />
              Available for new projects
            </div>
            <div>
              <h1 className="hero-title hero-rise text-[22vw] sm:text-[15vw] md:text-[6rem] lg:text-[10rem] font-bold font-[family-name:var(--font-display)] tracking-tighter uppercase leading-none" style={{ "--i": 1, "--exit-y": "120px" } as React.CSSProperties}>
                SIJEY<span className="hero-title-dot">.</span>
              </h1>
              <p className="hero-subtitle hero-rise" style={{ "--i": 2, "--exit-y": "95px" } as React.CSSProperties}>
                Video editor and motion designer. Short-form, long-form and cinematic.
              </p>
            </div>
            <div className="hero-ctas hero-rise justify-center md:justify-start" style={{ "--i": 3, "--exit-y": "75px" } as React.CSSProperties}>
              <a
                href="#work"
                className="hero-btn hero-btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  playSelectSound();
                  smoothScrollTo(document.getElementById("work"));
                }}
              >
                Watch the work
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 5v14M6 13l6 6 6-6" />
                </svg>
              </a>
              <a
                href="#contact"
                className="hero-btn hero-btn-ghost"
                onClick={(e) => {
                  e.preventDefault();
                  playSelectSound();
                  smoothScrollTo(document.getElementById("contact"));
                }}
              >
                Start a project
              </a>
            </div>
          </div>

          {/* Right: Description */}
          <div
            ref={glassRef}
            className="glass-panel hero-panel hero-rise w-[calc(100%-2.5rem)] sm:w-full rounded-[28px] overflow-hidden"
            style={{ "--i": 4, "--exit-y": "40px" } as React.CSSProperties}
            onPointerMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
              e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
            }}
          >
            <div className="hero-panel-body" style={{ padding: '1.75rem' }}>
              <p className="panel-label" style={{ marginBottom: '1rem' }}>About</p>
              <div className="panel-copy">
                <p className="panel-lead">
                  I&apos;m the main video editor for <strong>FilmCy</strong>, working across short-form,
                  long-form and cinematic projects.
                </p>
                <p>
                  I help creators and communities bring out what makes them distinct, shaping every edit
                  around the goal the video is meant to reach.
                </p>
              </div>

              {/* Tools & Resources */}
              <div className="flex flex-col items-stretch" style={{ marginTop: '1.5rem' }}>
                <p className="panel-label" style={{ marginBottom: '0.75rem' }}>Tools</p>
                <div className="flex flex-wrap justify-start gap-3">
                  {TOOLS.map((tool) => (
                    <ExpandPill
                      key={tool.id}
                      icon={tool.icon}
                      iconClassName={tool.iconClassName}
                      label={tool.label}
                      open={activeTool === tool.id}
                      onToggle={() => {
                        playSelectSound();
                        if (activeTool && activeTool !== tool.id) markPillSwitch();
                        setActiveTool((prev) => (prev === tool.id ? null : tool.id));
                      }}
                    >
                      <span className="pill-text">{tool.label}</span>
                    </ExpandPill>
                  ))}
                </div>
              </div>

              {/* Contacts */}
              <div className="flex flex-col items-stretch" style={{ marginTop: '1.25rem' }}>
                <p className="panel-label" style={{ marginBottom: '0.75rem' }}>Contact</p>
                <div className="flex flex-wrap justify-start gap-3">
                  {CONTACTS.map((contact) => (
                    <ExpandPill
                      key={contact.id}
                      icon={contact.icon}
                      iconClassName={contact.iconClassName}
                      label={contact.label}
                      open={activeContact === contact.id}
                      onToggle={() => {
                        playSelectSound();
                        if (activeContact && activeContact !== contact.id) markPillSwitch();
                        setActiveContact((prev) => (prev === contact.id ? null : contact.id));
                      }}
                    >
                      {/* Email opens the same pre-filled Gmail draft as the contact section's button */}
                      {contact.href || contact.id === "email" ? (
                        <a
                          href={contact.href ?? gmailDraftUrl(contact.value)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pill-text"
                          onClick={playSelectSound}
                          aria-label={contact.id === "email" ? "Email me on Gmail (opens a pre-filled draft in a new tab)" : undefined}
                        >
                          {contact.value}
                          <ExternalIcon />
                        </a>
                      ) : (
                        <button type="button" className="pill-text" onClick={(e) => copyContact(contact, e.currentTarget.closest<HTMLElement>(".pill"), e)}>
                          {contact.value}
                          {copiedId === contact.id ? <CheckIcon key="check" /> : <CopyIcon key="copy" />}
                        </button>
                      )}
                    </ExpandPill>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      <FeaturedProject onOpen={openFeatured} playerOpen={lightbox?.slug === FEATURED_PROJECT.slug} />

      {/* ═══════════════════════════════════════════ */}
      {/* WORK SECTION — Portfolio Grid */}
      {/* ═══════════════════════════════════════════ */}
      <section id="work" style={{ padding: 'clamp(1rem, 3vh, 2rem) 0 clamp(4rem, 8vh, 6rem)' }}>
        {/* Tabs, count and grid share one centred column so their edges line up.
            (Inline padding/margins: the global reset overrides Tailwind spacing utilities.) */}
        <div className="w-full" style={{ maxWidth: '2400px', margin: '0 auto', padding: '0 clamp(1rem, 3.5vw, 5rem)' }}>

          <CategoryFilter
            categories={[...CATEGORIES]}
            active={activeCategory}
            onChange={setActiveCategory}
            counts={Object.fromEntries([
              ["all", projects.length],
              ...CATEGORIES.map((cat) => [cat.value, projects.filter((p) => p.category === cat.value).length]),
            ])}
          />

          {/* Video Grid */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[var(--color-text-muted)]">No projects in this category yet</p>
            </div>
          ) : (
            <div className="work-groups">
              {(() => {
                const vertical = filteredProjects.filter((p) => p.aspectRatio === "9:16");
                const landscape = filteredProjects.filter((p) => p.aspectRatio !== "9:16");
                const single = vertical.length === 0 || landscape.length === 0;
                const tabLabel = CATEGORIES.find((c) => c.value === activeCategory)?.label;
                // Keyed by tab so switching categories starts a fresh carousel on its first clip
                return (
                  <>
                    {vertical.length > 0 && (
                      <WorkCarousel
                        key={`v-${activeCategory}`}
                        label={single && tabLabel ? tabLabel : "Short form, 9:16"}
                        projects={vertical}
                        orientation="vertical"
                        onOpen={openFromCard}
                      />
                    )}
                    {landscape.length > 0 && (
                      <WorkCarousel
                        key={`l-${activeCategory}`}
                        label={single && tabLabel ? tabLabel : "Long form, cinematic & creative"}
                        projects={landscape}
                        orientation="landscape"
                        onOpen={openFromCard}
                      />
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* BEFORE / AFTER SECTION */}
      {/* ═══════════════════════════════════════════ */}
      {beforeAfterProjects.length > 0 && (
        <section className="py-16 sm:py-24 bg-[var(--color-surface-950)]">
          <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)]">
                Before & After
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-md mx-auto">
                Drag the slider to see the transformation
              </p>
            </div>

            <div className="space-y-8">
              {beforeAfterProjects.map((project) => (
                <div key={project.id} className="space-y-3">
                  <BeforeAfterSlider
                    beforeSrc={project.beforeUrl!}
                    afterSrc={project.afterUrl!}
                    isVideo={
                      project.beforeUrl!.match(/\.(mp4|webm|mov)$/i) !== null
                    }
                    className="aspect-video"
                  />
                  <p className="text-sm text-[var(--color-text-muted)] text-center font-[family-name:var(--font-display)]">
                    {project.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}



      {/* ═══════════════════════════════════════════ */}
      {/* CONTACT SECTION */}
      {/* ═══════════════════════════════════════════ */}
      <section id="contact" className="contact-section">
        <div className="contact-inner">
          <div className="contact-lead">
            <p className="panel-label">Contact</p>
            <h2 className="contact-title">
              Have a project in mind?
              <span>Let&apos;s make it move.</span>
            </h2>
            <p className="contact-sub">
              Short-form, long-form, cinematic edits or motion design. Tell me what you&apos;re working on.
            </p>
          </div>

          <div className="contact-actions">
            {(() => {
              const email = CONTACTS.find((c) => c.id === "email")!;
              return (
                <>
                  <button
                    type="button"
                    className="contact-email"
                    onClick={() => copyText(email.value, "Email copied")}
                    aria-label={`Copy email address ${email.value}`}
                  >
                    <span className="contact-email-text">{email.value}</span>
                    <span className="contact-email-hint">
                      <CopyIcon />
                      Click to copy
                    </span>
                  </button>
                  <a
                    href={gmailDraftUrl(email.value)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-send"
                    onClick={playSelectSound}
                    aria-label="Email me on Gmail (opens a pre-filled draft in a new tab)"
                  >
                    Email me on Gmail
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M7 17L17 7M8 7h9v9" />
                    </svg>
                  </a>
                </>
              );
            })()}

            <ul className="contact-channels">
              {CONTACTS.filter((c) => c.id !== "email").map((c) => (
                <li key={c.id}>
                  {c.href ? (
                    <a href={c.href} target="_blank" rel="noopener noreferrer" onClick={playSelectSound}>
                      <span className="contact-channel-name">{c.label}</span>
                      <span className="contact-channel-value">{c.value}</span>
                    </a>
                  ) : (
                    <button type="button" onClick={() => copyText(c.value, `${c.label} copied`)} aria-label={`Copy ${c.label}: ${c.value}`}>
                      <span className="contact-channel-name">{c.label}</span>
                      <span className="contact-channel-value">{c.value}</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <footer className="contact-footer">
          <span>© {new Date().getFullYear()} Sijey · Video Editor &amp; Motion Designer</span>
          <a
            href="#top"
            className="back-to-top"
            onClick={(e) => {
              e.preventDefault();
              playSelectSound();
              // Same eased glide as "View my work" (the page's top is the root element's top)
              smoothScrollTo(document.documentElement);
            }}
          >
            Back to top
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 19V5M6 11l6-6 6 6" />
            </svg>
          </a>
        </footer>
      </section>

      {/* Lightbox */}
      <VideoLightbox
        isOpen={!!lightbox}
        onClose={closeLightbox}
        videoUrl={lightbox?.url || ""}
        originRect={lightbox?.originRect}
        title={lightbox?.title}
        slug={lightbox?.slug}
      />

      {/* Toast notification */}
      {toastMessage && (
        <div
          key={toastKey}
          className="fixed bottom-8 left-1/2 z-[60] animate-toast pointer-events-none"
        >
          <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-[var(--color-surface-800)] border border-[var(--color-accent-500)]/30 backdrop-blur-md shadow-lg shadow-black/50">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-sm text-white/90 font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </>
  );
}
