import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

// Fallback video data when database is empty (e.g., on Vercel with ephemeral SQLite)
const FALLBACK_PROJECTS = [
  // Shortforms
  { id: "s0", title: "FINAL2", slug: "shortforms-final2", category: "shortforms", videoUrl: "/videos/shortforms/FINAL2.mp4", thumbnailUrl: null, aspectRatio: "9:16", featured: false, sortOrder: -1, creator: "@mattinvestz", subcategory: null, description: null, caseStudy: null, beforeUrl: null, afterUrl: null },
  { id: "s1", title: "1080p - FULL EDIT TRIAL", slug: "shortforms-1080p-full-edit-trial", category: "shortforms", videoUrl: "/videos/shortforms/1080p - FULL EDIT TRIAL.mp4", thumbnailUrl: null, aspectRatio: "9:16", featured: false, sortOrder: 0, creator: "@joshukzz", subcategory: null, description: null, caseStudy: null, beforeUrl: null, afterUrl: null },
  { id: "s2", title: "FINAL5", slug: "shortforms-final5", category: "shortforms", videoUrl: "/videos/shortforms/FINAL5.mp4", thumbnailUrl: null, aspectRatio: "9:16", featured: false, sortOrder: 0, creator: null, subcategory: null, description: null, caseStudy: null, beforeUrl: null, afterUrl: null },
  { id: "s3", title: "PART2-revised2-with subtitles3-final", slug: "shortforms-part2-revised2-with-subtitles3-final", category: "shortforms", videoUrl: "/videos/shortforms/PART2-revised2-with subtitles3-final.mp4", thumbnailUrl: null, aspectRatio: "9:16", featured: false, sortOrder: 0, creator: "deanjoseph__", subcategory: null, description: null, caseStudy: null, beforeUrl: null, afterUrl: null },
  { id: "s4", title: "interview", slug: "shortforms-interview", category: "shortforms", videoUrl: "/videos/shortforms/interview.mp4", thumbnailUrl: null, aspectRatio: "9:16", featured: false, sortOrder: 0, creator: null, subcategory: null, description: null, caseStudy: null, beforeUrl: null, afterUrl: null },
  { id: "s5", title: "$900PC-FINAL", slug: "shortforms-900pc-final", category: "shortforms", videoUrl: "/videos/shortforms/$900PC-FINAL.mp4", thumbnailUrl: null, aspectRatio: "9:16", featured: false, sortOrder: 11, creator: "NwBuilds", subcategory: null, description: null, caseStudy: null, beforeUrl: null, afterUrl: null },
  
  // Longforms
  { id: "l1", title: "JAPAN-sample2", slug: "longforms-japan-sample2", category: "longforms", videoUrl: "/videos/longforms/JAPAN-sample2.mp4", thumbnailUrl: null, aspectRatio: "16:9", featured: false, sortOrder: 0, creator: null, subcategory: "Narrative", description: null, caseStudy: null, beforeUrl: null, afterUrl: null },

  // Cinematic
  { id: "c1", title: "FINAL SHI-2", slug: "cinematic-final-shi-2", category: "cinematic", videoUrl: "/videos/cinematic/FINAL SHI-2.mp4", thumbnailUrl: null, aspectRatio: "16:9", featured: false, sortOrder: 0, creator: "imahemakaluma", subcategory: null, description: null, caseStudy: null, beforeUrl: null, afterUrl: null },
  { id: "c2", title: "LUMA NA MAGAYON", slug: "cinematic-luma-na-magayon", category: "cinematic", videoUrl: "/videos/cinematic/LUMA NA MAGAYON.mp4", thumbnailUrl: null, aspectRatio: "16:9", featured: false, sortOrder: 0, creator: "imahemakaluma", subcategory: null, description: null, caseStudy: null, beforeUrl: null, afterUrl: null },
  { id: "c3", title: "LUMA NA PANGIT", slug: "cinematic-luma-na-pangit", category: "cinematic", videoUrl: "/videos/cinematic/LUMA NA PANGIT.mp4", thumbnailUrl: null, aspectRatio: "16:9", featured: false, sortOrder: 0, creator: "imahemakaluma", subcategory: null, description: null, caseStudy: null, beforeUrl: null, afterUrl: null },

  // Creative / Experiments
  { id: "e1", title: "FINAL  - 3 - LEGIT", slug: "experiments-final-3-legit", category: "experiments", videoUrl: "/videos/experiments/FINAL  - 3 - LEGIT.mp4", thumbnailUrl: null, aspectRatio: "16:9", featured: false, sortOrder: 0, creator: null, subcategory: null, description: null, caseStudy: null, beforeUrl: null, afterUrl: null },
  { id: "e2", title: "FINAL - EVERYTHING", slug: "experiments-final-everything", category: "experiments", videoUrl: "/videos/experiments/FINAL - EVERYTHING.mp4", thumbnailUrl: null, aspectRatio: "16:9", featured: false, sortOrder: 0, creator: null, subcategory: null, description: null, caseStudy: null, beforeUrl: null, afterUrl: null },
  { id: "e3", title: "FINAL - ready for enhance", slug: "experiments-final-ready-for-enhance", category: "experiments", videoUrl: "/videos/experiments/FINAL - ready for enhance.mp4", thumbnailUrl: null, aspectRatio: "16:9", featured: false, sortOrder: 0, creator: null, subcategory: null, description: null, caseStudy: null, beforeUrl: null, afterUrl: null },
  { id: "e4", title: "FINALTANGINA", slug: "experiments-finaltangina", category: "experiments", videoUrl: "/videos/experiments/FINALTANGINA.mp4", thumbnailUrl: null, aspectRatio: "16:9", featured: false, sortOrder: 0, creator: null, subcategory: null, description: null, caseStudy: null, beforeUrl: null, afterUrl: null },
  { id: "e5", title: "final_yarn", slug: "experiments-final_yarn", category: "experiments", videoUrl: "/videos/experiments/final_yarn.mp4", thumbnailUrl: null, aspectRatio: "16:9", featured: false, sortOrder: 0, creator: null, subcategory: null, description: null, caseStudy: null, beforeUrl: null, afterUrl: null },
  { id: "e6", title: "withflicker", slug: "experiments-withflicker", category: "experiments", videoUrl: "/videos/experiments/withflicker.mp4", thumbnailUrl: null, aspectRatio: "16:9", featured: false, sortOrder: 0, creator: null, subcategory: null, description: null, caseStudy: null, beforeUrl: null, afterUrl: null },
  { id: "e7", title: "SAMPLE3-APPLICATION", slug: "experiments-sample3-application", category: "experiments", videoUrl: "/videos/experiments/SAMPLE3-APPLICATION.mp4", thumbnailUrl: null, aspectRatio: "16:9", featured: false, sortOrder: 0, creator: null, subcategory: null, description: null, caseStudy: null, beforeUrl: null, afterUrl: null },
];

export default async function HomePage() {
  let projects: any[] = [];
  let settings: any = null;

  try {
    const [p, s] = await Promise.all([
      prisma.project.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    ]);
    projects = p;
    settings = s;
  } catch {
    // Database tables may not exist yet on first deploy
  }

  // Use fallback data if database is empty
  if (projects.length === 0) {
    projects = FALLBACK_PROJECTS;
  }

  // Find projects with before/after content
  const beforeAfterProjects = projects.filter((p) => p.beforeUrl && p.afterUrl);

  return (
    <HomeClient
      projects={JSON.parse(JSON.stringify(projects))}
      beforeAfterProjects={JSON.parse(JSON.stringify(beforeAfterProjects))}
      settings={settings ? JSON.parse(JSON.stringify(settings)) : null}
    />
  );
}
