import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Cpu,
  Handshake,
  Truck,
  Eye,
  Wrench,
  Settings,
} from "lucide-react";

export interface TeamStyle {
  label: string;
  icon: LucideIcon;
  color: string;
  border: string;
  dot: string;
  summary: string;
}

export const TEAM_STYLES: Record<string, TeamStyle> = {
  Sales: {
    label: "Sales",
    icon: Handshake,
    color: "text-blue-400",
    border: "border-l-blue-400",
    dot: "bg-blue-400",
    summary:
      "Agents driving commercial strategy, competitive positioning, value quantification, and partner alignment.",
  },
  Architecture: {
    label: "Architecture",
    icon: Cpu,
    color: "text-purple-400",
    border: "border-l-purple-400",
    dot: "bg-purple-400",
    summary:
      "Roles owning technical integrity and post-deployment health, backed by process sub-agents.",
  },
  Intelligence: {
    label: "Intelligence",
    icon: Eye,
    color: "text-cyan-400",
    border: "border-l-cyan-400",
    dot: "bg-cyan-400",
    summary:
      "Autonomous agents covering account, industry, market, and technology research at different scopes and cadences.",
  },
  Leadership: {
    label: "Leadership",
    icon: Briefcase,
    color: "text-amber-400",
    border: "border-l-amber-400",
    dot: "bg-amber-400",
    summary:
      "Senior Manager executes day-to-day coaching and escalation resolution.",
  },
  Specialists: {
    label: "Specialists",
    icon: Wrench,
    color: "text-rose-400",
    border: "border-l-rose-400",
    dot: "bg-rose-400",
    summary:
      "Domain experts and SMEs providing deep technical and product expertise across engagements.",
  },
  Delivery: {
    label: "Delivery",
    icon: Truck,
    color: "text-teal-400",
    border: "border-l-teal-400",
    dot: "bg-teal-400",
    summary: "Bridges what was sold with what gets built.",
  },
};

export const GOVERNANCE_STYLE: TeamStyle = {
  label: "Background Systems",
  icon: Settings,
  color: "text-green-400",
  border: "border-l-green-400",
  dot: "bg-green-400",
  summary:
    "Automated agents running on events and schedules, enforcing quality gates across all account activity.",
};

export const TEAM_TAB_ORDER = [
  "Sales",
  "Architecture",
  "Intelligence",
  "Leadership",
  "Specialists",
  "Delivery",
];
