import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export const CATEGORIES = [
  { value: "shortforms", label: "Short form" },
  { value: "longforms", label: "Long form" },
  { value: "cinematic", label: "Cinematic" },
  { value: "experiments", label: "Creative" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];

export function categoryLabel(category: string): string {
  return CATEGORIES.find((c) => c.value === category)?.label ?? category;
}

/** The creator a video was cut for, as an @handle, filling in known clients where the data has none */
export function creatorHandle(p: { creator?: string | null; category: string; title: string }): string | null {
  let creator = p.creator;
  const title = p.title.toLowerCase();
  if (!creator && (title.includes("900pc") || title.includes("nwbuilds"))) creator = "NwBuilds";
  if (!creator && (p.category === "cinematic" || title.includes("luma") || title.includes("shi-2"))) creator = "FilmCy";
  if (!creator) return null;
  return creator.startsWith("@") ? creator : `@${creator}`;
}

export const ASPECT_RATIOS = [
  { value: "16:9", label: "16:9 Landscape" },
  { value: "9:16", label: "9:16 Vertical" },
  { value: "1:1", label: "1:1 Square" },
] as const;
