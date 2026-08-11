import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const [projects, settings] = await Promise.all([
    prisma.project.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ]);

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
