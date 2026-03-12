/**
 * Shared CSS design tokens for consistent typography and color patterns.
 * Import and use these instead of raw Tailwind classes to stay consistent across pages.
 */

// ── Typography ─────────────────────────────────────────────────────────────

/** Page-level h1 */
export const PAGE_TITLE = "text-2xl font-bold";

/** Subtitle below page title */
export const PAGE_SUBTITLE = "text-[15px] text-muted-foreground mt-1";

/** Section header with icon (use with flex items-center gap-2) */
export const SECTION_HEADER = "text-xs font-semibold uppercase tracking-wider text-muted-foreground";

/** Card / panel title */
export const CARD_TITLE = "text-[15px] font-semibold";

/** Card description or secondary line */
export const CARD_DESCRIPTION = "text-xs text-muted-foreground";

/** Standard body text */
export const BODY_TEXT = "text-[15px]";

/** Muted body text */
export const BODY_MUTED = "text-[15px] text-muted-foreground";

/** Small muted text (labels, meta) */
export const TEXT_META = "text-xs text-muted-foreground";

/** Eyebrow label (e.g. Role / Goal / Why above a paragraph) */
export const EYEBROW = "text-[10px] uppercase tracking-wider";

// ── Badges ─────────────────────────────────────────────────────────────────

/**
 * Returns Tailwind classes for a colored badge.
 * Usage: `<Badge className={`text-xs border ${badge("purple")}`}>`
 *
 * Supported colors: any Tailwind color name (purple, green, orange, blue, red, amber, etc.)
 */
export function badge(color: string): string {
  return `bg-${color}-600/10 text-${color}-400 border-${color}-600/30`;
}

/**
 * Pre-defined badge color maps for common semantic values.
 * Add new entries as needed.
 */
export const TRACK_BADGE: Record<string, string> = {
  economy: badge("green"),
  premium: badge("purple"),
  fast_track: badge("orange"),
};

export const TRACK_BORDER: Record<string, string> = {
  economy: "border-green-600/40",
  premium: "border-purple-600/40",
  fast_track: "border-orange-600/40",
};

export const AUTONOMY_BADGE: Record<string, string> = {
  full: badge("green"),
  partial: badge("amber"),
  supervised: badge("blue"),
  human: badge("red"),
};

// ── Cards ──────────────────────────────────────────────────────────────────

/** Standard card container spacing */
export const CARD_PADDING = "p-4";

/** Card inner spacing between stacked items */
export const CARD_STACK = "space-y-3";

// ── Lists ──────────────────────────────────────────────────────────────────

/** Vertical list spacing for detail rows */
export const LIST_STACK = "space-y-1.5";
