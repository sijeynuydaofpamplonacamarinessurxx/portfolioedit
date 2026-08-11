import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

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
