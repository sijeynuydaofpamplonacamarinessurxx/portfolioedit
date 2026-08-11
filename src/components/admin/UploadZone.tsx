"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn, formatFileSize } from "@/lib/utils";

interface UploadZoneProps {
  onUpload: (url: string, file: File) => void;
  accept?: string;
  label?: string;
  currentUrl?: string;
  className?: string;
}

export default function UploadZone({ onUpload, accept, label = "Upload File", currentUrl, className }: UploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(currentUrl || null);

  const handleUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      setProgress(0);
      setError("");

      // Set preview for images
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
      }

      try {
        const formData = new FormData();
        formData.append("file", file);

        // Simulate progress since fetch doesn't support it natively
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await res.json();
        setProgress(100);
        setPreview(data.url);
        onUpload(data.url, file);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setPreview(currentUrl || null);
      } finally {
        setTimeout(() => {
          setUploading(false);
          setProgress(0);
        }, 500);
      }
    },
    [onUpload, currentUrl]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      if (files[0]) handleUpload(files[0]);
    },
    accept: accept
      ? accept.split(",").reduce(
          (acc, type) => {
            acc[type.trim()] = [];
            return acc;
          },
          {} as Record<string, string[]>
        )
      : undefined,
    multiple: false,
    disabled: uploading,
  });

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
          {label}
        </label>
      )}

      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-[var(--radius-lg)] transition-all duration-200 cursor-pointer overflow-hidden",
          isDragActive
            ? "border-[var(--color-accent-400)] bg-[var(--color-accent-500)]/5"
            : "border-[var(--color-border)] hover:border-[var(--color-border-hover)] bg-[var(--color-surface-900)]",
          uploading && "pointer-events-none opacity-70"
        )}
      >
        <input {...getInputProps()} />

        {/* Preview */}
        {preview && !uploading ? (
          <div className="relative group">
            {preview.match(/\.(mp4|webm|mov)$/i) ? (
              <video src={preview} className="w-full h-40 object-cover" muted />
            ) : (
              <img src={preview} alt="Preview" className="w-full h-40 object-cover" />
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-xs text-white">Click or drop to replace</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4">
            {uploading ? (
              <>
                <div className="w-full max-w-xs h-1.5 bg-[var(--color-surface-700)] rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-[var(--color-accent-500)] rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">Uploading... {progress}%</p>
              </>
            ) : (
              <>
                {/* Desktop: drag-drop messaging */}
                <div className="hidden sm:flex flex-col items-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-[var(--color-text-muted)] mb-3"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Drop file here or <span className="text-[var(--color-accent-400)]">browse</span>
                  </p>
                </div>

                {/* Mobile: tap-to-upload button */}
                <div className="sm:hidden flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-[var(--color-surface-800)] border border-[var(--color-border)] flex items-center justify-center mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-accent-400)]">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">Tap to Upload</p>
                </div>

                <p className="text-[10px] text-[var(--color-text-muted)] mt-2">MP4, WebM, MOV, JPG, PNG, WebP</p>
              </>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-[var(--color-danger-500)]">{error}</p>}
    </div>
  );
}
