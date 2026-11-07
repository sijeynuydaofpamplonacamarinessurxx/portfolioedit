// Builds lightweight grid previews for every project video.
//
// The grid shows videos at ~240px wide, but the originals are full-HD; autoplaying a
// dozen 1080p decodes at once pegs the GPU. Each preview is cropped to the card's 16:9
// shape at 960x540 (sharp on high-DPI screens at card size), 8 seconds, silent, and loops in the grid.
// 540p is still a fraction of the originals: most are 1080p or larger and minutes long.
//
// Usage: node scripts/generate-previews.mjs [--force]
// Output mirrors the source path: public/videos/shortforms/a.mp4 -> public/videos/previews/shortforms/a.mp4

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const VIDEOS_DIR = path.join(process.cwd(), "public", "videos");
const PREVIEWS_DIR = path.join(VIDEOS_DIR, "previews");
const force = process.argv.includes("--force");

function* findVideos(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (full === PREVIEWS_DIR) continue;
    if (statSync(full).isDirectory()) yield* findVideos(full);
    // Root-level files (the hero background) aren't grid items
    else if (name.toLowerCase().endsWith(".mp4") && dir !== VIDEOS_DIR) yield full;
  }
}

let made = 0;
let skipped = 0;
let failed = 0;

for (const source of findVideos(VIDEOS_DIR)) {
  const target = path.join(PREVIEWS_DIR, path.relative(VIDEOS_DIR, source));
  if (!force && existsSync(target) && statSync(target).mtimeMs >= statSync(source).mtimeMs) {
    skipped++;
    continue;
  }
  mkdirSync(path.dirname(target), { recursive: true });
  process.stdout.write(`Preview: ${path.relative(VIDEOS_DIR, source)} ... `);

  const result = spawnSync("ffmpeg", [
    "-y", "-loglevel", "error",
    "-i", source,
    "-t", "8",
    "-vf", "scale=960:540:force_original_aspect_ratio=increase:flags=lanczos,crop=960:540,fps=30",
    "-an",
    "-c:v", "libx264", "-preset", "slow", "-crf", "22",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    target,
  ], { stdio: ["ignore", "ignore", "pipe"] });

  if (result.status === 0) {
    made++;
    console.log(`${Math.round(statSync(target).size / 1024)} KB`);
  } else {
    failed++;
    console.log("FAILED");
    console.error(result.stderr?.toString());
  }
}

console.log(`\nDone: ${made} created, ${skipped} up to date, ${failed} failed.`);
if (failed) process.exit(1);
