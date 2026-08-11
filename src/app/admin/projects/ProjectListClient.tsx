"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  aspectRatio: string;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
}

export default function ProjectListClient({ initialProjects }: { initialProjects: Project[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/projects?id=${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        setProjects(projects.filter((p) => p.id !== deleteId));
        setDeleteId(null);
        router.refresh();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newProjects = [...projects];
    [newProjects[index - 1], newProjects[index]] = [newProjects[index], newProjects[index - 1]];

    const items = newProjects.map((p, i) => ({ id: p.id, sortOrder: i }));
    setProjects(newProjects);

    await fetch("/api/projects/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
  };

  const handleMoveDown = async (index: number) => {
    if (index === projects.length - 1) return;
    const newProjects = [...projects];
    [newProjects[index], newProjects[index + 1]] = [newProjects[index + 1], newProjects[index]];

    const items = newProjects.map((p, i) => ({ id: p.id, sortOrder: i }));
    setProjects(newProjects);

    await fetch("/api/projects/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
  };

  const toggleFeatured = async (project: Project) => {
    const newFeatured = !project.featured;

    setProjects(
      projects.map((p) => (p.id === project.id ? { ...p, featured: newFeatured } : p))
    );

    await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: project.id, featured: newFeatured }),
    });
  };

  const categories = ["all", "cinematic", "amv", "shortform"];

  return (
    <>
      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
              filter === cat
                ? "bg-[var(--color-text-primary)] text-[var(--color-text-inverse)]"
                : "bg-[var(--color-surface-800)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            }`}
          >
            {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Projects List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[var(--color-surface-900)] border border-[var(--color-border)] rounded-[var(--radius-lg)]">
          <p className="text-[var(--color-text-muted)]">No projects found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((project, index) => (
            <div
              key={project.id}
              className="flex items-center gap-4 bg-[var(--color-surface-900)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-3 sm:p-4 hover:border-[var(--color-border-hover)] transition-colors duration-200 group"
            >
              {/* Reorder buttons */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] disabled:opacity-20 transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === filtered.length - 1}
                  className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] disabled:opacity-20 transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>

              {/* Thumbnail */}
              <div className="w-16 h-10 sm:w-20 sm:h-12 rounded-[var(--radius-sm)] bg-[var(--color-surface-700)] overflow-hidden flex-shrink-0">
                {project.thumbnailUrl ? (
                  <img src={project.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{project.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-[var(--color-text-muted)] capitalize">{project.category}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">•</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{project.aspectRatio}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => toggleFeatured(project)}
                  className={`p-2 rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
                    project.featured
                      ? "text-[var(--color-accent-400)] bg-[var(--color-accent-500)]/10"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-accent-400)] hover:bg-[var(--color-surface-800)]"
                  }`}
                  title={project.featured ? "Unfeature" : "Feature"}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={project.featured ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>

                <Link
                  href={`/admin/projects/${project.id}/edit`}
                  className="p-2 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-800)] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </Link>

                <button
                  onClick={() => setDeleteId(project.id)}
                  className="p-2 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-danger-500)] hover:bg-[var(--color-danger-500)]/5 transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Project"
      >
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Are you sure you want to delete this project? This action cannot be undone and will also remove all associated files.
        </p>
        <div className="flex items-center gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
