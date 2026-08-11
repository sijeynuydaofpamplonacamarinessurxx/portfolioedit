"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import UploadZone from "@/components/admin/UploadZone";

interface Settings {
  heroTitle: string;
  heroSubtitle: string;
  showreelUrl: string | null;
  contactEmail: string | null;
  socialLinks: string | null;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSaved(false);

    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-shimmer h-8 w-32 rounded-[var(--radius-md)] mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-shimmer h-16 rounded-[var(--radius-md)]" />
          ))}
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">Settings</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Configure your portfolio site</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hero Section */}
        <div className="bg-[var(--color-surface-900)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 space-y-5">
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Hero Section</h2>
          <Input
            id="hero-title"
            label="Title"
            value={settings.heroTitle}
            onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
          />
          <Textarea
            id="hero-subtitle"
            label="Subtitle"
            value={settings.heroSubtitle}
            onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
            rows={2}
          />
          <UploadZone
            label="Showreel Video"
            accept="video/mp4,video/webm"
            currentUrl={settings.showreelUrl || undefined}
            onUpload={(url) => setSettings({ ...settings, showreelUrl: url })}
          />
        </div>

        {/* Contact */}
        <div className="bg-[var(--color-surface-900)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 space-y-5">
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Contact</h2>
          <Input
            id="contact-email"
            label="Email"
            type="email"
            placeholder="hello@sijey.dev"
            value={settings.contactEmail || ""}
            onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
          />
        </div>

        {/* Social Links */}
        <div className="bg-[var(--color-surface-900)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 space-y-5">
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Social Links</h2>
          <Textarea
            id="social-links"
            label="JSON Format"
            placeholder={'{"instagram": "https://...", "twitter": "https://..."}'}
            value={settings.socialLinks || ""}
            onChange={(e) => setSettings({ ...settings, socialLinks: e.target.value })}
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button type="submit" loading={saving}>
            Save Settings
          </Button>
          {saved && (
            <span className="text-sm text-[var(--color-success-500)] animate-fade-in">✓ Saved</span>
          )}
        </div>
      </form>
    </div>
  );
}
