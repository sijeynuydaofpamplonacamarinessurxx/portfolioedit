"use client";

import { useState } from "react";
import VideoCard from "@/components/VideoCard";
import VideoLightbox from "@/components/VideoLightbox";
import CategoryFilter from "@/components/CategoryFilter";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { CATEGORIES } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  videoUrl: string;
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

export default function HomeClient({ projects, beforeAfterProjects, settings }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightbox, setLightbox] = useState<{ url: string; title: string } | null>(null);
  const [activeContact, setActiveContact] = useState<"email" | "discord" | "tiktok" | "whatsapp" | null>(null);
  const [activeTool, setActiveTool] = useState<"davinci" | "epidemic" | "ocular" | null>(null);

  const toggleContact = (contact: "email" | "discord" | "tiktok" | "whatsapp", e: React.MouseEvent) => {
    e.preventDefault();
    setActiveContact(prev => prev === contact ? null : contact);
  };

  const toggleTool = (tool: "davinci" | "epidemic" | "ocular", e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTool(prev => prev === tool ? null : tool);
  };

  const filteredProjects =
    activeCategory === "all"
      ? [...projects].sort((a, b) => {
        if (a.category === "shortforms" && b.category !== "shortforms") return -1;
        if (a.category !== "shortforms" && b.category === "shortforms") return 1;
        return 0;
      })
      : projects.filter((p) => p.category === activeCategory);

  const heroTitle = settings?.heroTitle || "Video Editor & Motion Designer";
  const heroSubtitle = settings?.heroSubtitle || "Turning raw footage into cinematic stories";

  return (
    <>
      {/* ═══════════════════════════════════════════ */}
      {/* HERO SECTION */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-start md:justify-center pt-28 sm:pt-36 pb-32 sm:pb-40 overflow-hidden">
        {/* Background video */}
        <video
          src={settings?.showreelUrl || "/videos/about-me-bg.mp4"}
          autoPlay
          muted
          loop
          playsInline
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
          className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16" style={{ paddingTop: '2.5rem' }}>
          {/* Left: Logo */}
          <div className="text-center md:text-left">
            <h1 className="text-[20vw] sm:text-[15vw] md:text-[6rem] lg:text-[10rem] font-bold font-[family-name:var(--font-display)] tracking-tighter text-white uppercase leading-none">
              SIJEY<span className="text-[var(--color-accent-500)]">.</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 uppercase tracking-[0.3em] mt-4">
              Video Editor, Motion Designer & Storyteller
            </p>
          </div>

          {/* Middle: Line */}
          <div className="hidden md:block w-px h-64 bg-gradient-to-b from-transparent via-white/40 to-transparent"></div>
          <div className="md:hidden h-px w-full max-w-xs bg-gradient-to-r from-transparent via-white/40 to-transparent my-4"></div>

          {/* Right: Description */}
          <div className="max-w-xl w-[calc(100%-2.5rem)] sm:w-full mx-auto rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-2xl overflow-hidden mb-20 md:mb-0">
            <div style={{ padding: '1.75rem' }}>
              <div style={{ fontFamily: 'var(--font-space), sans-serif', lineHeight: '1.6', color: '#F5F5F7', textAlign: 'left' }} className="space-y-5 text-sm sm:text-[15px]">
                <p>
                  I&apos;m a <strong style={{ fontWeight: 700, color: 'var(--color-accent-500)' }}>video editor</strong> and <strong style={{ fontWeight: 700, color: 'var(--color-accent-500)' }}>motion designer</strong> specializing in storytelling,
                  creative edits, and shortform content that captivates audiences.
                </p>
                <p>
                  With a keen eye for pacing, color grading, and visual effects, I transform
                  raw footage into polished, emotionally resonant pieces that leave lasting impressions.
                </p>
                <p>
                  Beyond the technical execution, my priority is deeply <strong style={{ fontWeight: 700, color: 'var(--color-accent-500)' }}>understanding your unique needs and delivering tailored visual solutions that will solve your problems.</strong>
                </p>
              </div>

              {/* Tools & Resources */}
              <div className="flex flex-col items-start border-t border-white/10" style={{ marginTop: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                <p style={{ fontFamily: 'var(--font-space), sans-serif', color: '#F5F5F7', marginBottom: '0.65rem' }} className="text-[10px] font-normal uppercase tracking-[0.2em]">Tools &amp; Resources</p>
                <div className="flex flex-wrap justify-start gap-3">
                  {/* DaVinci Resolve */}
                  <div
                    onClick={(e) => toggleTool("davinci", e)}
                    className={`relative rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 flex items-center cursor-pointer overflow-hidden ${activeTool === 'davinci' ? 'w-auto' : 'w-12'} h-12`}
                    style={activeTool === 'davinci' ? { paddingRight: '1.5rem' } : {}}
                  >
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                      <img src="/assets/DAVINCILOGO.png" alt="DaVinci Resolve" className="w-8 h-8 object-contain grayscale contrast-125 brightness-150 opacity-80" />
                    </div>
                    <div className={`overflow-hidden transition-all duration-300 flex items-center ${activeTool === 'davinci' ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}`}>
                      <span className="ml-4 text-[11px] text-white/90 whitespace-nowrap">
                        DaVinci Resolve
                      </span>
                    </div>
                  </div>
                  {/* Epidemic Sound */}
                  <div
                    onClick={(e) => toggleTool("epidemic", e)}
                    className={`relative rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 flex items-center cursor-pointer overflow-hidden ${activeTool === 'epidemic' ? 'w-auto' : 'w-12'} h-12`}
                    style={activeTool === 'epidemic' ? { paddingRight: '1.5rem' } : {}}
                  >
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                      <img src="/assets/epidemic-sounds.png" alt="Epidemic Sound" className="w-8 h-8 object-contain grayscale contrast-125 brightness-150 opacity-80" />
                    </div>
                    <div className={`overflow-hidden transition-all duration-300 flex items-center ${activeTool === 'epidemic' ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}`}>
                      <span className="ml-4 text-[11px] text-white/90 whitespace-nowrap">
                        Epidemic Sound
                      </span>
                    </div>
                  </div>
                  {/* Ocular Sounds */}
                  <div
                    onClick={(e) => toggleTool("ocular", e)}
                    className={`relative rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 flex items-center cursor-pointer overflow-hidden ${activeTool === 'ocular' ? 'w-auto' : 'w-12'} h-12`}
                    style={activeTool === 'ocular' ? { paddingRight: '1.5rem' } : {}}
                  >
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                      <img src="/assets/ocular-sounds.png" alt="Ocular Sounds" className="w-10 h-10 object-contain grayscale contrast-125 brightness-150 opacity-80 scale-125" />
                    </div>
                    <div className={`overflow-hidden transition-all duration-300 flex items-center ${activeTool === 'ocular' ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}`}>
                      <span className="ml-4 text-[11px] text-white/90 whitespace-nowrap">
                        Ocular Sounds
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contacts */}
              <div className="flex flex-col items-start border-t border-white/10" style={{ paddingTop: '0.75rem', marginTop: '0.5rem', paddingBottom: '0.5rem' }}>
                <p style={{ fontFamily: 'var(--font-space), sans-serif', color: '#F5F5F7', marginBottom: '0.65rem' }} className="text-[10px] font-normal uppercase tracking-[0.2em]">Contacts</p>
                <div className="flex flex-wrap justify-start gap-3">
                  {/* Email - no link, just text */}
                  <div
                    onClick={(e) => toggleContact("email", e)}
                    className={`relative rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 flex items-center cursor-pointer overflow-hidden ${activeContact === 'email' ? 'w-auto' : 'w-12'} h-12`}
                    style={activeContact === 'email' ? { paddingRight: '1.5rem' } : {}}
                  >
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                      <img src="/assets/email i con.png" alt="Email" className="w-7 h-7 object-contain brightness-0 invert opacity-70" />
                    </div>
                    <div className={`overflow-hidden transition-all duration-300 flex items-center ${activeContact === 'email' ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}`}>
                      <span className="ml-4 text-[11px] text-white/90 whitespace-nowrap">
                        sijeynuyda@gmail.com
                      </span>
                    </div>
                  </div>

                  {/* TikTok - hyperlinked */}
                  <div
                    onClick={(e) => toggleContact("tiktok", e)}
                    className={`relative rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 flex items-center cursor-pointer overflow-hidden ${activeContact === 'tiktok' ? 'w-auto' : 'w-12'} h-12`}
                    style={activeContact === 'tiktok' ? { paddingRight: '1.5rem' } : {}}
                  >
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                      <img src="/assets/tiktoklogo.webp" alt="TikTok" className="w-7 h-7 object-contain grayscale contrast-125 brightness-150 opacity-80" />
                    </div>
                    <div className={`overflow-hidden transition-all duration-300 flex items-center ${activeContact === 'tiktok' ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}`}>
                      <a href="https://www.tiktok.com/@selponniyuna" target="_blank" rel="noopener noreferrer" className="ml-4 text-[11px] text-white/90 hover:text-white underline whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        @selponniyuna
                      </a>
                    </div>
                  </div>
                  {/* Discord - no link, just text */}
                  <div
                    onClick={(e) => toggleContact("discord", e)}
                    className={`relative rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 flex items-center cursor-pointer overflow-hidden ${activeContact === 'discord' ? 'w-auto' : 'w-12'} h-12`}
                    style={activeContact === 'discord' ? { paddingRight: '1.5rem' } : {}}
                  >
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                      <img src="/assets/discord logo.webp" alt="Discord" className="w-7 h-7 object-contain grayscale contrast-125 brightness-150 opacity-80" />
                    </div>
                    <div className={`overflow-hidden transition-all duration-300 flex items-center ${activeContact === 'discord' ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}`}>
                      <span className="ml-4 text-[11px] text-white/90 whitespace-nowrap">
                        sijey2654
                      </span>
                    </div>
                  </div>
                  {/* WhatsApp - no link, just text */}
                  <div
                    onClick={(e) => toggleContact("whatsapp", e)}
                    className={`relative rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 flex items-center cursor-pointer overflow-hidden ${activeContact === 'whatsapp' ? 'w-auto' : 'w-12'} h-12`}
                    style={activeContact === 'whatsapp' ? { paddingRight: '1.5rem' } : {}}
                  >
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                      <img src="/assets/whatsapp-white-icon.webp" alt="WhatsApp" className="w-7 h-7 object-contain brightness-0 invert opacity-70" />
                    </div>
                    <div className={`overflow-hidden transition-all duration-300 flex items-center ${activeContact === 'whatsapp' ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}`}>
                      <span className="ml-4 text-[11px] text-white/90 whitespace-nowrap">
                        +639274423204
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 hover:text-white transition-colors">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </section>

      {/* Explicit Spacer between Hero and Work Section */}
      <div className="h-16 sm:h-24 w-full pointer-events-none" aria-hidden="true" />

      {/* ═══════════════════════════════════════════ */}
      {/* WORK SECTION — Portfolio Grid */}
      {/* ═══════════════════════════════════════════ */}
      <section id="work" className="pt-8 sm:pt-16 pb-16 sm:pb-24">
        {/* Category Taskbar - Full Window Width */}
        <div className="w-full mb-8 sm:mb-12">
          <CategoryFilter
            categories={[...CATEGORIES]}
            active={activeCategory}
            onChange={setActiveCategory}
          />
        </div>

        <div className="w-full px-4 sm:px-6">
          {/* Section header */}
          <div className="flex items-center justify-between mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)]">
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {projects.length} projects
            </p>
          </div>

          {/* Video Grid */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[var(--color-text-muted)]">No projects in this category yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              {filteredProjects.map((project) => (
                <VideoCard
                  key={project.id}
                  title={project.title}
                  category={project.category}
                  videoUrl={project.videoUrl}
                  thumbnailUrl={project.thumbnailUrl}
                  aspectRatio={project.aspectRatio}
                  featured={project.featured}
                  creator={project.creator}
                  onClick={() =>
                    setLightbox({ url: project.videoUrl, title: project.title })
                  }
                />
              ))}
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
      <div className="h-24 sm:h-40 w-full" aria-hidden="true" />
      <section id="contact" className="pt-12 sm:pt-16 pb-32 sm:pb-48 relative overflow-hidden w-full flex flex-col items-center justify-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[var(--color-surface-900)] to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--color-accent-500)_0%,_transparent_60%)] opacity-[0.03]" />

        <div className="relative w-full max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col items-center justify-center text-center pb-16 sm:pb-24">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[family-name:var(--font-display)] leading-tight text-center w-full">
            Let&apos;s Create
            <br />
            <span className="gradient-text">Something Amazing</span>
          </h2>
          <p className="text-center text-sm text-[var(--color-text-muted)] mt-4 max-w-md mx-auto w-full">
            Got a project in mind? I&apos;d love to hear about it. Let&apos;s bring your vision to life.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            {settings?.contactEmail && (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-medium text-white bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/35 backdrop-blur-md shadow-lg shadow-black/50 transition-all duration-300 active:scale-[0.97]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Get in Touch
              </a>
            )}

          </div>
        </div>
      </section>
      <div className="h-20 sm:h-32 w-full pointer-events-none" aria-hidden="true" />

      {/* Lightbox */}
      <VideoLightbox
        isOpen={!!lightbox}
        onClose={() => setLightbox(null)}
        videoUrl={lightbox?.url || ""}
        title={lightbox?.title}
      />
    </>
  );
}
