"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials");
      } else {
        window.location.href = "/admin";
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      {/* Subtle radial gradient background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-surface-900)_0%,_black_70%)]" />

      <div className="relative w-full max-w-sm animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] tracking-tight">
            sijey<span className="text-[var(--color-accent-400)]">.</span>
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-2 uppercase tracking-[0.2em]">
            Admin
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="login-email"
            type="email"
            label="Email"
            placeholder="admin@sijey.dev"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            id="login-password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && (
            <div className="text-sm text-[var(--color-danger-500)] bg-[var(--color-danger-500)]/5 border border-[var(--color-danger-500)]/10 rounded-[var(--radius-md)] px-3 py-2 animate-fade-in">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Sign In
          </Button>
        </form>

        {/* Subtle footer */}
        <p className="text-center text-[10px] text-[var(--color-text-muted)] mt-8 tracking-wider">
          PORTFOLIO MANAGEMENT SYSTEM
        </p>
      </div>
    </div>
  );
}
