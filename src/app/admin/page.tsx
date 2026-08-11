import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  let totalProjects = 0;
  let featuredCount = 0;
  let categories: any[] = [];
  let recentProjects: any[] = [];

  try {
    [totalProjects, featuredCount, categories] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { featured: true } }),
      prisma.project.groupBy({
        by: ["category"],
        _count: { category: true },
      }),
    ]);

    recentProjects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  } catch {
    // Database tables may not exist yet on first deploy
  }

  const stats = [
    { label: "Total Projects", value: totalProjects, icon: "📹" },
    { label: "Featured", value: featuredCount, icon: "⭐" },
    { label: "Categories", value: categories.length, icon: "📂" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">Dashboard</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Overview of your portfolio</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[var(--color-surface-900)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 hover:border-[var(--color-border-hover)] transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-3xl font-bold font-[family-name:var(--font-display)] mt-3">{stat.value}</p>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Category Breakdown */}
      {categories.length > 0 && (
        <div className="bg-[var(--color-surface-900)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5">
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">By Category</h2>
          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between">
                <span className="text-sm capitalize">{cat.category}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-1.5 bg-[var(--color-surface-700)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-accent-500)] rounded-full transition-all duration-500"
                      style={{ width: `${totalProjects > 0 ? (cat._count.category / totalProjects) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)] w-6 text-right">{cat._count.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Projects */}
      <div className="bg-[var(--color-surface-900)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Recent Projects</h2>
          <Link href="/admin/projects" className="text-xs text-[var(--color-accent-400)] hover:underline">
            View All →
          </Link>
        </div>
        {recentProjects.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-[var(--color-text-muted)] text-sm">No projects yet</p>
            <Link
              href="/admin/projects/new"
              className="inline-block mt-3 text-sm text-[var(--color-accent-400)] hover:underline"
            >
              Create your first project →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}/edit`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--color-surface-800)] transition-colors duration-150"
              >
                {/* Thumbnail */}
                <div className="w-12 h-8 rounded-[var(--radius-sm)] bg-[var(--color-surface-700)] overflow-hidden flex-shrink-0">
                  {project.thumbnailUrl ? (
                    <img src={project.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect x="1" y="5" width="15" height="14" rx="2" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{project.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)] capitalize">{project.category}</p>
                </div>
                {project.featured && (
                  <span className="text-[10px] bg-[var(--color-accent-500)]/10 text-[var(--color-accent-400)] px-2 py-0.5 rounded-full">
                    Featured
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
