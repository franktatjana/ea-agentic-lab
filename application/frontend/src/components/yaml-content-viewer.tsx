"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function humanize(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Light: 600/700 shades for contrast on white. Dark: 400 shades for glow on black.
const SECTION_COLORS = [
  "text-blue-700 dark:text-blue-400",
  "text-emerald-700 dark:text-emerald-400",
  "text-amber-700 dark:text-amber-400",
  "text-purple-700 dark:text-purple-400",
  "text-cyan-700 dark:text-cyan-400",
  "text-rose-700 dark:text-rose-400",
  "text-teal-700 dark:text-teal-400",
  "text-orange-700 dark:text-orange-400",
];

const BORDER_COLORS = [
  "border-blue-400/40 dark:border-blue-500/30",
  "border-emerald-400/40 dark:border-emerald-500/30",
  "border-amber-400/40 dark:border-amber-500/30",
  "border-purple-400/40 dark:border-purple-500/30",
  "border-cyan-400/40 dark:border-cyan-500/30",
  "border-rose-400/40 dark:border-rose-500/30",
  "border-teal-400/40 dark:border-teal-500/30",
  "border-orange-400/40 dark:border-orange-500/30",
];

const BULLET_STYLES: Record<string, { dot: string; text: string }> = {
  red_flags:      { dot: "bg-red-500 dark:bg-red-400",    text: "text-red-700 dark:text-red-300/80" },
  key_questions:  { dot: "bg-blue-500 dark:bg-blue-400",  text: "text-blue-700 dark:text-blue-300/80" },
  probing_for:    { dot: "bg-cyan-500 dark:bg-cyan-400",  text: "text-cyan-700 dark:text-cyan-300/80" },
  listen_for:     { dot: "bg-cyan-500 dark:bg-cyan-400",  text: "text-cyan-700 dark:text-cyan-300/80" },
  anti_patterns:  { dot: "bg-red-500 dark:bg-red-400",    text: "text-red-700 dark:text-red-300/80" },
  risk_factors:   { dot: "bg-amber-500 dark:bg-amber-400", text: "text-amber-700 dark:text-amber-300/80" },
  considerations: { dot: "bg-amber-500 dark:bg-amber-400", text: "text-amber-700 dark:text-amber-300/80" },
  topics:         { dot: "bg-emerald-500 dark:bg-emerald-400", text: "text-muted-foreground" },
  sources:        { dot: "bg-purple-500 dark:bg-purple-400",   text: "text-muted-foreground" },
  quality_check:  { dot: "bg-emerald-500 dark:bg-emerald-400", text: "text-muted-foreground" },
  examples:       { dot: "bg-orange-500 dark:bg-orange-400",   text: "text-muted-foreground" },
};

const PURPOSE_KEYS = new Set(["purpose", "description", "principle", "focus", "approach"]);

function BulletList({ items, hint }: { items: string[]; hint?: string }) {
  const style = hint ? BULLET_STYLES[hint] : undefined;
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <span className={cn("mt-[7px] h-1.5 w-1.5 rounded-full shrink-0", style?.dot ?? "bg-muted-foreground/40")} />
          <span className={style?.text ?? "text-muted-foreground"}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function YamlNode({ keyName, value, depth, sectionIndex }: { keyName: string; value: unknown; depth: number; sectionIndex: number }) {
  const [open, setOpen] = useState(depth < 1);

  if (value === null || value === undefined) return null;

  const colorIdx = sectionIndex % SECTION_COLORS.length;

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    if (PURPOSE_KEYS.has(keyName)) {
      return (
        <p className="text-sm text-emerald-700/80 dark:text-emerald-300/70 italic mb-2">{String(value)}</p>
      );
    }
    return (
      <div className="flex gap-2 text-sm mb-1.5">
        <span className="text-muted-foreground/60 shrink-0">{humanize(keyName)}:</span>
        <span className="text-foreground/80 font-medium">{String(value)}</span>
      </div>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    if (typeof value[0] === "string") {
      return (
        <div className="mb-3">
          {depth > 0 && (
            <p className={cn("text-xs font-medium uppercase tracking-wide mb-1.5", SECTION_COLORS[colorIdx])}>
              {humanize(keyName)}
            </p>
          )}
          <BulletList items={value as string[]} hint={keyName} />
        </div>
      );
    }
    return (
      <div className="mb-3">
        {depth > 0 && (
          <p className={cn("text-xs font-medium uppercase tracking-wide mb-1.5", SECTION_COLORS[colorIdx])}>
            {humanize(keyName)}
          </p>
        )}
        <div className="space-y-2">
          {value.map((item, i) => {
            if (typeof item === "object" && item !== null) {
              return (
                <div key={i} className="bg-muted/30 dark:bg-muted/20 rounded-md p-3 border border-border/40 dark:border-border/30">
                  {Object.entries(item as Record<string, unknown>).map(([k, v]) => (
                    <YamlNode key={k} keyName={k} value={v} depth={depth + 1} sectionIndex={sectionIndex} />
                  ))}
                </div>
              );
            }
            return <p key={i} className="text-sm text-muted-foreground">{String(item)}</p>;
          })}
        </div>
      </div>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return null;

    return (
      <div className={cn("mb-2", depth === 0 && "mb-4")}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 w-full text-left group mb-1.5"
        >
          <ChevronRight className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-90",
            SECTION_COLORS[colorIdx]
          )} />
          <span className={cn(
            "font-medium",
            depth === 0 ? "text-sm" : "text-xs uppercase tracking-wide",
            SECTION_COLORS[colorIdx]
          )}>
            {humanize(keyName)}
          </span>
        </button>
        {open && (
          <div className={cn(
            "pl-5 border-l ml-1.5",
            depth === 0 ? BORDER_COLORS[colorIdx] : "border-border/40 dark:border-border/30"
          )}>
            {entries.map(([k, v]) => (
              <YamlNode key={k} keyName={k} value={v} depth={depth + 1} sectionIndex={sectionIndex} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}

interface YamlContentViewerProps {
  data: Record<string, unknown>;
}

export function YamlContentViewer({ data }: YamlContentViewerProps) {
  const entries = Object.entries(data);
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground/60">No content available.</p>;
  }

  return (
    <div className="space-y-1">
      {entries.map(([key, value], i) => (
        <YamlNode key={key} keyName={key} value={value} depth={0} sectionIndex={i} />
      ))}
    </div>
  );
}
