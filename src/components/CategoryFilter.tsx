"use client";

import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: { value: string; label: string }[];
  active: string;
  onChange: (category: string) => void;
}

export default function CategoryFilter({ categories, active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex items-end w-full border-b border-white/10" style={{ gap: '2px' }}>
      <button
        onClick={() => onChange("all")}
        className={cn(
          "flex-1 min-w-0 text-[9px] sm:text-xs uppercase tracking-[0.08em] sm:tracking-[0.12em] font-medium transition-all duration-300 cursor-pointer flex items-center justify-center relative whitespace-nowrap",
          active === "all"
            ? "bg-white/10 text-white border border-white/10 border-b-transparent top-[1px]"
            : "text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 border border-transparent"
        )}
        style={{ padding: '0.5rem 0.4rem', borderRadius: '16px 16px 0 0' }}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={cn(
            "flex-1 min-w-0 uppercase font-medium transition-all duration-300 cursor-pointer flex items-center justify-center relative whitespace-nowrap",
            "text-[9px] sm:text-xs tracking-[0.04em] sm:tracking-[0.12em]",
            active === cat.value
              ? "bg-white/10 text-white border border-white/10 border-b-transparent top-[1px]"
              : "text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 border border-transparent"
          )}
          style={{ padding: '0.5rem 0.4rem', borderRadius: '16px 16px 0 0' }}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
