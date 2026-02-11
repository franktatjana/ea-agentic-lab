import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ROLE_COLORS: Record<string, string> = {
  ae: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  sa: "bg-purple-600/20 text-purple-400 border-purple-600/30",
  ca: "bg-green-600/20 text-green-400 border-green-600/30",
  ci: "bg-orange-600/20 text-orange-400 border-orange-600/30",
  poc: "bg-sky-600/20 text-sky-400 border-sky-600/30",
  ve: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30",
  governance: "bg-lime-600/20 text-lime-400 border-lime-600/30",
  delivery: "bg-teal-600/20 text-teal-400 border-teal-600/30",
  specialist: "bg-indigo-600/20 text-indigo-400 border-indigo-600/30",
  pm: "bg-pink-600/20 text-pink-400 border-pink-600/30",
  partner: "bg-amber-600/20 text-amber-400 border-amber-600/30",
  leadership: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
};

const ROLE_LABELS: Record<string, string> = {
  ae: "Account Executive",
  sa: "Solution Architect",
  ca: "Customer Architect",
  ci: "Competitive Intel",
  poc: "POC",
  ve: "Value Engineering",
  governance: "Governance",
  delivery: "Delivery",
  specialist: "Specialist",
  pm: "Product Manager",
  partner: "Partner",
  leadership: "Leadership",
};

const STATUS_COLORS: Record<string, string> = {
  production_ready: "bg-green-600/20 text-green-400 border-green-600/30",
  draft: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
  in_review: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  deprecated: "bg-red-600/20 text-red-400 border-red-600/30",
  active: "bg-green-600/20 text-green-400 border-green-600/30",
};

export function getRoleKey(agentRole: string): string {
  const lower = agentRole.toLowerCase();
  if (lower.startsWith("poc") || lower.includes("poc agent")) return "poc";
  if (lower.includes("curator") || lower.includes("reporter") || lower.includes("retrospective")) return "governance";
  if (lower.includes("exec sponsor") || lower.includes("senior manager")) return "leadership";
  if (lower.includes("value engineer") || lower.startsWith("ve")) return "ve";
  if (lower.startsWith("ae") || lower.includes("account exec")) return "ae";
  if (lower.startsWith("sa") || lower.includes("solution arch")) return "sa";
  if (lower.startsWith("ca") || lower.includes("customer arch")) return "ca";
  if (lower.startsWith("ci") || lower.includes("competitive")) return "ci";
  if (lower.includes("delivery")) return "delivery";
  if (lower.includes("specialist")) return "specialist";
  if (lower.includes("pm") || lower.includes("product manager")) return "pm";
  if (lower.includes("partner")) return "partner";
  return "other";
}

export function RoleBadge({ role }: { role: string }) {
  const key = getRoleKey(role);
  const colors = ROLE_COLORS[key] || "bg-gray-600/20 text-gray-400 border-gray-600/30";
  const label = ROLE_LABELS[key] || role;

  return (
    <Badge variant="outline" className={cn("text-xs font-medium", colors)}>
      {label}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors =
    STATUS_COLORS[status] || "bg-gray-600/20 text-gray-400 border-gray-600/30";
  const label = status.replace(/_/g, " ");

  return (
    <Badge variant="outline" className={cn("text-xs font-medium capitalize", colors)}>
      {label}
    </Badge>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: "bg-red-600/20 text-red-400 border-red-600/30",
    high: "bg-orange-600/20 text-orange-400 border-orange-600/30",
    medium: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
    low: "bg-gray-600/20 text-gray-400 border-gray-600/30",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium capitalize",
        colors[severity] || colors.low
      )}
    >
      {severity}
    </Badge>
  );
}

const MODE_INFO: Record<string, { label: string; description: string }> = {
  GENERATIVE: {
    label: "Generative",
    description: "Creates new artifacts, analyses, or frameworks from inputs",
  },
  ANALYTICAL: {
    label: "Analytical",
    description: "Deep-dive analysis to surface insights and patterns from existing data",
  },
  ASSESSMENT: {
    label: "Assessment",
    description: "Evaluates current state against defined criteria or benchmarks",
  },
  VALIDATION: {
    label: "Validation",
    description: "Validates existing data, decisions, or artifacts for completeness and accuracy",
  },
  OPERATIONAL: {
    label: "Operational",
    description: "Event-driven tactical actions triggered by system signals or user requests",
  },
  REACTIVE: {
    label: "Reactive",
    description: "Responds to external signals, trends, or events requiring immediate attention",
  },
};

export function getModeInfo(mode: string) {
  return MODE_INFO[mode] || { label: mode, description: "" };
}

export function ModeBadge({ mode }: { mode: string }) {
  const info = getModeInfo(mode);

  return (
    <Badge variant="secondary" className="text-xs" title={info.description}>
      {info.label}
    </Badge>
  );
}
