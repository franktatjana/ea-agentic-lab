/**
 * Centralized role configuration for UI styling.
 *
 * CONTENT lives in YAML specs and comes through the API.
 * This file only holds visual styling: colors, labels for badge rendering.
 * If a role key is missing, components fall back to generic styling.
 */

export interface RoleStyle {
  label: string;
  badgeColors: string;
  borderColor: string;
  activeBorderColor: string;
  textColor: string;
}

export const ROLE_STYLES: Record<string, RoleStyle> = {
  ae:         { label: "Account Executive",  badgeColors: "bg-blue-600/20 text-blue-400 border-blue-600/30",     borderColor: "border-blue-600/30 hover:border-blue-500/50",     activeBorderColor: "border-blue-500/60 bg-blue-600/5",     textColor: "text-blue-400" },
  sa:         { label: "Solution Architect",  badgeColors: "bg-purple-600/20 text-purple-400 border-purple-600/30", borderColor: "border-purple-600/30 hover:border-purple-500/50", activeBorderColor: "border-purple-500/60 bg-purple-600/5", textColor: "text-purple-400" },
  ca:         { label: "Customer Architect",  badgeColors: "bg-green-600/20 text-green-400 border-green-600/30",   borderColor: "border-green-600/30 hover:border-green-500/50",   activeBorderColor: "border-green-500/60 bg-green-600/5",   textColor: "text-green-400" },
  ci:         { label: "Competitive Intel",   badgeColors: "bg-orange-600/20 text-orange-400 border-orange-600/30", borderColor: "border-orange-600/30 hover:border-orange-500/50", activeBorderColor: "border-orange-500/60 bg-orange-600/5", textColor: "text-orange-400" },
  poc:        { label: "POC",                 badgeColors: "bg-sky-600/20 text-sky-400 border-sky-600/30",         borderColor: "border-sky-600/30 hover:border-sky-500/50",       activeBorderColor: "border-sky-500/60 bg-sky-600/5",       textColor: "text-sky-400" },
  ve:         { label: "Value Engineering",   badgeColors: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30", borderColor: "border-emerald-600/30 hover:border-emerald-500/50", activeBorderColor: "border-emerald-500/60 bg-emerald-600/5", textColor: "text-emerald-400" },
  governance: { label: "Governance",          badgeColors: "bg-lime-600/20 text-lime-400 border-lime-600/30",       borderColor: "border-lime-600/30 hover:border-lime-500/50",     activeBorderColor: "border-lime-500/60 bg-lime-600/5",     textColor: "text-lime-400" },
  delivery:   { label: "Delivery",            badgeColors: "bg-teal-600/20 text-teal-400 border-teal-600/30",       borderColor: "border-teal-600/30 hover:border-teal-500/50",     activeBorderColor: "border-teal-500/60 bg-teal-600/5",     textColor: "text-teal-400" },
  specialist: { label: "Specialist",          badgeColors: "bg-indigo-600/20 text-indigo-400 border-indigo-600/30", borderColor: "border-indigo-600/30 hover:border-indigo-500/50", activeBorderColor: "border-indigo-500/60 bg-indigo-600/5", textColor: "text-indigo-400" },
  pm:         { label: "Product Manager",     badgeColors: "bg-pink-600/20 text-pink-400 border-pink-600/30",       borderColor: "border-pink-600/30 hover:border-pink-500/50",     activeBorderColor: "border-pink-500/60 bg-pink-600/5",     textColor: "text-pink-400" },
  ham:        { label: "Hyperscaler AM",       badgeColors: "bg-cyan-600/20 text-cyan-400 border-cyan-600/30",       borderColor: "border-cyan-600/30 hover:border-cyan-500/50",     activeBorderColor: "border-cyan-500/60 bg-cyan-600/5",     textColor: "text-cyan-400" },
  partner:    { label: "Partner",             badgeColors: "bg-amber-600/20 text-amber-400 border-amber-600/30",   borderColor: "border-amber-600/30 hover:border-amber-500/50",   activeBorderColor: "border-amber-500/60 bg-amber-600/5",   textColor: "text-amber-400" },
  leadership: { label: "Leadership",          badgeColors: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30", borderColor: "border-yellow-600/30 hover:border-yellow-500/50", activeBorderColor: "border-yellow-500/60 bg-yellow-600/5", textColor: "text-yellow-400" },
  rfp:        { label: "RFP",                 badgeColors: "bg-rose-600/20 text-rose-400 border-rose-600/30",       borderColor: "border-rose-600/30 hover:border-rose-500/50",     activeBorderColor: "border-rose-500/60 bg-rose-600/5",     textColor: "text-rose-400" },
  fcto:       { label: "Field CTO",            badgeColors: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30", borderColor: "border-yellow-600/30 hover:border-yellow-500/50", activeBorderColor: "border-yellow-500/60 bg-yellow-600/5", textColor: "text-yellow-400" },
  aa:         { label: "Alliance Architect",   badgeColors: "bg-amber-600/20 text-amber-400 border-amber-600/30",   borderColor: "border-amber-600/30 hover:border-amber-500/50",   activeBorderColor: "border-amber-500/60 bg-amber-600/5",   textColor: "text-amber-400" },
};

const FALLBACK: RoleStyle = {
  label: "Other",
  badgeColors: "bg-gray-600/20 text-gray-400 border-gray-600/30",
  borderColor: "hover:border-primary/30",
  activeBorderColor: "border-primary/60 bg-primary/5",
  textColor: "text-gray-400",
};

export function getRoleKey(agentRole: string): string {
  const lower = agentRole.toLowerCase();
  if (lower.startsWith("poc") || lower.includes("poc agent")) return "poc";
  if (lower.includes("curator") || lower.includes("reporter") || lower.includes("retrospective")) return "governance";
  if (lower.includes("field cto") || lower.startsWith("fcto")) return "fcto";
  if (lower.includes("alliance") || lower.startsWith("aa")) return "aa";
  if (lower.includes("exec sponsor") || lower.includes("senior manager") || lower.includes("vp sales") || lower.includes("revops")) return "leadership";
  if (lower.includes("hyperscaler") || lower.startsWith("ham")) return "ham";
  if (lower.includes("value engineer") || lower.startsWith("ve")) return "ve";
  if (lower.startsWith("ae") || lower.includes("account exec")) return "ae";
  if (lower.startsWith("sa") || lower.includes("solution arch")) return "sa";
  if (lower.startsWith("ca") || lower.includes("customer arch")) return "ca";
  if (lower.startsWith("ci") || lower.includes("competitive")) return "ci";
  if (lower.includes("delivery")) return "delivery";
  if (lower.includes("specialist")) return "specialist";
  if (lower.includes("pm") || lower.includes("product manager")) return "pm";
  if (lower.includes("partner")) return "partner";
  if (lower.startsWith("rfp") || lower.includes("rfp")) return "rfp";
  return "other";
}

export function getRoleStyle(roleKey: string): RoleStyle {
  return ROLE_STYLES[roleKey] ?? FALLBACK;
}

export function getRoleLabel(roleKey: string): string {
  return ROLE_STYLES[roleKey]?.label ?? roleKey;
}
