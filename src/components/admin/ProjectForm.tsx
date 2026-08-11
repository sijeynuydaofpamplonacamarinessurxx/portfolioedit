"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import UploadZone from "@/components/admin/UploadZone";
import { CATEGORIES, ASPECT_RATIOS, slugify } from "@/lib/utils";

interface ProjectFormProps {
  project?: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    category: string;
    videoUrl: string;
    thumbnailUrl: string | null;
    aspectRatio: string;
    featured: boolean;
    caseStudy: string | null;
    beforeUrl: string | null;
    afterUrl: string | null;
  };
}

export default function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const isEditing = !!project;

  const [title, setTitle] = useState(project?.title || "");
  const [slug, setSlug] = useState(project?.slug || "");
  const [description, setDescription] = useState(project?.description || "");
  const [category, setCategory] = useState(project?.category || "cinematic");
  const [videoUrl, setVideoUrl] = useState(project?.videoUrl || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(project?.thumbnailUrl || "");
  const [aspectRatio, setAspectRatio] = useState(project?.aspectRatio || "16:9");
  const [featured, setFeatured] = useState(project?.featured || false);
  const [caseStudy, setCaseStudy] = useState(project?.caseStudy || "");
  const [beforeUrl, setBeforeUrl] = useState(project?.beforeUrl || "");
  const [afterUrl, setAfterUrl] = useState(project?.afterUrl || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isEditing) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) {
      setError("Please upload a video");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const body = {
        ...(isEditing && { id: project.id }),
        title,
        slug,
        description: description || null,
        category,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        aspectRatio,
        featured,
        caseStudy: caseStudy || null,
        beforeUrl: beforeUrl || null,
        afterUrl: afterUrl || null,
      };

      const res = await fetch("/api/projects", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      router.push("/admin/projects");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Video Upload */}
      <UploadZone
        label="Video"
        accept="video/mp4,video/webm,video/quicktime"
        currentUrl={videoUrl}
        onUpload={(url) => setVideoUrl(url)}
      />

      {/* Thumbnail Upload */}
      <UploadZone
        label="Thumbnail (Optional)"
        accept="image/jpeg,image/png,image/webp"
        currentUrl={thumbnailUrl}
        onUpload={(url) => setThumbnailUrl(url)}
      />

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          id="project-title"
          label="Title"
          placeholder="My awesome edit"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
        />
        <Input
          id="project-slug"
          label="Slug"
          placeholder="my-awesome-edit"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Select
          id="project-category"
          label="Category"
          options={[...CATEGORIES]}
          value={category}
          onChange={(e) => setCategory((e.target as HTMLSelectElement).value)}
        />
        <Select
          id="project-aspect-ratio"
          label="Aspect Ratio"
          options={[...ASPECT_RATIOS]}
          value={aspectRatio}
          onChange={(e) => setAspectRatio((e.target as HTMLSelectElement).value)}
        />
      </div>

      <Textarea
        id="project-description"
        label="Description"
        placeholder="Brief description of this project..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />

      <Textarea
        id="project-case-study"
        label="Case Study (Optional)"
        placeholder="Detailed breakdown of this project..."
        value={caseStudy}
        onChange={(e) => setCaseStudy(e.target.value)}
        rows={6}
      />

      {/* Before/After */}
      <div>
        <h3 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">
          Before / After Slider (Optional)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <UploadZone
            label="Before"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            currentUrl={beforeUrl}
            onUpload={(url) => setBeforeUrl(url)}
          />
          <UploadZone
            label="After"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            currentUrl={afterUrl}
            onUpload={(url) => setAfterUrl(url)}
          />
        </div>
      </div>

      {/* Featured toggle */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div
          className={cn(
            "w-10 h-6 rounded-full transition-colors duration-200 relative",
            featured ? "bg-[var(--color-accent-500)]" : "bg-[var(--color-surface-600)]"
          )}
          onClick={() => setFeatured(!featured)}
        >
          <div
            className={cn(
              "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200",
              featured ? "translate-x-5" : "translate-x-1"
            )}
          />
        </div>
        <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
          Featured project
        </span>
      </label>

      {/* Error */}
      {error && (
        <div className="text-sm text-[var(--color-danger-500)] bg-[var(--color-danger-500)]/5 border border-[var(--color-danger-500)]/10 rounded-[var(--radius-md)] px-3 py-2">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-border)]">
        <Button type="submit" loading={saving}>
          {isEditing ? "Save Changes" : "Create Project"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
