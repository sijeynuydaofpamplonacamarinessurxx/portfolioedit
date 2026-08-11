import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProjectListClient from "./ProjectListClient";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  let projects: any[] = [];

  try {
    projects = await prisma.project.findMany({
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    // Database tables may not exist yet on first deploy
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">Projects</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{projects.length} total</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 bg-[var(--color-text-primary)] text-[var(--color-text-inverse)] px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium hover:bg-[var(--color-accent-300)] hover:text-black transition-all duration-200 active:scale-[0.97]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Project
        </Link>
      </div>

      <ProjectListClient initialProjects={JSON.parse(JSON.stringify(projects))} />
    </div>
  );
}
