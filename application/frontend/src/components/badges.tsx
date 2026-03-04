import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ROLE_STYLES, getRoleKey as _getRoleKey, getRoleStyle } from "@/lib/role-config";

export { getRoleKey } from "@/lib/role-config";

const STATUS_COLORS: Record<string, string> = {
  production_ready: "bg-green-600/20 text-green-400 border-green-600/30",
  draft: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
  in_review: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  deprecated: "bg-red-600/20 text-red-400 border-red-600/30",
  active: "bg-green-600/20 text-green-400 border-green-600/30",
};

export function RoleBadge({ role }: { role: string }) {
  const key = _getRoleKey(role);
  const style = getRoleStyle(key);

  return (
    <Badge variant="outline" className={cn("text-xs font-medium", style.badgeColors)}>
      {style.label === "Other" ? role : style.label}
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
