"use client";

import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Clock,
  CalendarClock,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users2,
  ArrowRight,
  X,
  UserCog,
} from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MetricCard } from "@/components/metric-card";
import { RoleBadge, StatusBadge, ModeBadge, getModeInfo, getRoleKey } from "@/components/badges";
import { HelpPopover } from "@/components/help-popover";
import type { Playbook } from "@/types";

function formatLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  ae: "Commercial strategy, account planning, stakeholder management, value articulation",
  sa: "Technical architecture, decision documentation, risk management, solution design",
  ca: "Customer success, solution adoption, retention management, health monitoring",
  ci: "Competitive monitoring, market analysis, win/loss tracking",
  poc: "POC execution, evaluation criteria, success tracking, conversion",
  ve: "ROI modeling, business case development, value articulation",
  governance: "Process enforcement, playbook curation, retrospectives, reporting",
  leadership: "Strategic oversight, executive sponsorship, escalation resolution",
  specialist: "Deep technical expertise and domain specialization",
  pm: "Product roadmap alignment, feature gap tracking, feasibility assessment",
  delivery: "Project execution, delivery tracking, program management, change management",
  partner: "Partner coordination, ecosystem management, joint delivery",
};

const ROLE_LABELS: Record<string, string> = {
  ae: "Account Executive",
  sa: "Solution Architect",
  ca: "Customer Architect",
  ci: "Competitive Intel",
  poc: "POC",
  ve: "Value Engineering",
  governance: "Governance",
  leadership: "Leadership",
  delivery: "Delivery",
  specialist: "Specialist",
  pm: "Product Manager",
  partner: "Partner",
};

const ROLE_COLORS: Record<string, string> = {
  ae: "border-blue-600/30 hover:border-blue-500/50",
  sa: "border-purple-600/30 hover:border-purple-500/50",
  ca: "border-green-600/30 hover:border-green-500/50",
  ci: "border-orange-600/30 hover:border-orange-500/50",
  poc: "border-sky-600/30 hover:border-sky-500/50",
  ve: "border-emerald-600/30 hover:border-emerald-500/50",
  governance: "border-lime-600/30 hover:border-lime-500/50",
  leadership: "border-yellow-600/30 hover:border-yellow-500/50",
  delivery: "border-teal-600/30 hover:border-teal-500/50",
  specialist: "border-indigo-600/30 hover:border-indigo-500/50",
  pm: "border-pink-600/30 hover:border-pink-500/50",
  partner: "border-amber-600/30 hover:border-amber-500/50",
};

const ROLE_ACTIVE_COLORS: Record<string, string> = {
  ae: "border-blue-500/60 bg-blue-600/5",
  sa: "border-purple-500/60 bg-purple-600/5",
  ca: "border-green-500/60 bg-green-600/5",
  ci: "border-orange-500/60 bg-orange-600/5",
  poc: "border-sky-500/60 bg-sky-600/5",
  ve: "border-emerald-500/60 bg-emerald-600/5",
  governance: "border-lime-500/60 bg-lime-600/5",
  leadership: "border-yellow-500/60 bg-yellow-600/5",
  delivery: "border-teal-500/60 bg-teal-600/5",
  specialist: "border-indigo-500/60 bg-indigo-600/5",
  pm: "border-pink-500/60 bg-pink-600/5",
  partner: "border-amber-500/60 bg-amber-600/5",
};

function summarizeInputs(playbook: Playbook): string | null {
  const inputs = playbook.required_inputs;
  if (!inputs) return null;
  const mandatory = inputs.mandatory?.length || 0;
  const optional = inputs.optional?.length || 0;
  if (mandatory === 0 && optional === 0) return null;
  const parts: string[] = [];
  if (mandatory > 0) parts.push(`${mandatory} required`);
  if (optional > 0) parts.push(`${optional} optional`);
  return parts.join(", ");
}

function getInputLabels(playbook: Playbook): string[] {
  const inputs = playbook.required_inputs;
  if (!inputs?.mandatory) return [];
  return inputs.mandatory
    .slice(0, 3)
    .map((item) => {
      if (typeof item === "string") return item;
      return item.artifact || "";
    })
    .filter(Boolean);
}

function getOutputTypes(playbook: Playbook): string[] {
  const outputs = playbook.expected_outputs;
  if (!outputs) return [];
  const types: string[] = [];
  if (outputs.primary_artifact) types.push("Primary artifact");
  if (outputs.risk_objects) types.push("Risk objects");
  if (outputs.decision_objects) types.push("Decisions");
  if (outputs.initiative_objects) types.push("Initiatives");
  if (outputs.notifications) types.push("Notifications");
  return types;
}

function PlaybookCard({ playbook }: { playbook: Playbook }) {
  const title = playbook.framework_name || playbook.name || playbook._id;
  const objective = playbook.primary_objective || "";
  const viewHref = `/playbooks/view?team=${encodeURIComponent(playbook._team)}&file=${encodeURIComponent(playbook._filename)}`;
  const docHref = playbook._path
    ? `/docs?path=${encodeURIComponent(playbook._path)}`
    : null;

  const modeInfo = playbook.playbook_mode
    ? getModeInfo(playbook.playbook_mode)
    : null;
  const inputSummary = summarizeInputs(playbook);
  const inputLabels = getInputLabels(playbook);
  const outputTypes = getOutputTypes(playbook);
  const hasDetails =
    inputSummary || outputTypes.length > 0 || playbook.secondary_agents?.length;

  return (
    <Link href={viewHref} className="block">
      <Card className="hover:border-primary/50 transition-colors">
        <CardHeader className="pb-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">{title}</CardTitle>
              {playbook.intended_agent_role && (
                <RoleBadge role={playbook.intended_agent_role} />
              )}
              {playbook.status && <StatusBadge status={playbook.status} />}
            </div>
            <CardDescription className="mt-1 flex items-center gap-3 text-xs">
              {modeInfo && <ModeBadge mode={playbook.playbook_mode!} />}
              <span className="text-muted-foreground">{playbook._team}</span>
              {playbook.estimated_execution_time && (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {playbook.estimated_execution_time}
                </span>
              )}
              {playbook.frequency && (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <CalendarClock className="h-3 w-3" />
                  {playbook.frequency}
                </span>
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {objective && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {objective}
            </p>
          )}

          {modeInfo?.description && (
            <p className="text-xs text-muted-foreground/70 italic">
              {modeInfo.label}: {modeInfo.description}
            </p>
          )}

          {hasDetails && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs pt-1">
              {(inputSummary || inputLabels.length > 0) && (
                <div>
                  <div className="flex items-center gap-1 text-muted-foreground font-medium mb-0.5">
                    <ArrowDownToLine className="h-3 w-3" />
                    Inputs
                  </div>
                  {inputLabels.length > 0 ? (
                    <ul className="text-muted-foreground/80 space-y-0.5">
                      {inputLabels.map((label) => (
                        <li key={label} className="truncate">
                          {label}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground/80">{inputSummary}</p>
                  )}
                </div>
              )}

              {outputTypes.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 text-muted-foreground font-medium mb-0.5">
                    <ArrowUpFromLine className="h-3 w-3" />
                    Outputs
                  </div>
                  <ul className="text-muted-foreground/80 space-y-0.5">
                    {outputTypes.map((type) => (
                      <li key={type}>{type}</li>
                    ))}
                  </ul>
                </div>
              )}

              {playbook.secondary_agents && playbook.secondary_agents.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 text-muted-foreground font-medium mb-0.5">
                    <Users2 className="h-3 w-3" />
                    Collaborators
                  </div>
                  <ul className="text-muted-foreground/80 space-y-0.5">
                    {playbook.secondary_agents.slice(0, 3).map((agent) => (
                      <li key={agent} className="truncate">
                        {agent}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {docHref && (
            <span
              onClick={(e) => e.stopPropagation()}
              className="inline-block"
            >
              <Link
                href={docHref}
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <BookOpen className="h-3 w-3" />
                View documentation
              </Link>
            </span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function PlaybookGroup({
  label,
  playbooks,
}: {
  label: string;
  playbooks: Playbook[];
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        {label}{" "}
        <span className="text-xs font-normal">({playbooks.length})</span>
      </h3>
      <div className="space-y-3">
        {playbooks.map((pb) => (
          <PlaybookCard key={pb._path || pb._id} playbook={pb} />
        ))}
      </div>
    </div>
  );
}

export default function PlaybookCatalogPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [groupBy, setGroupBy] = useState("none");
  const listRef = useRef<HTMLDivElement>(null);

  const { data: playbooks, isLoading } = useQuery({
    queryKey: ["playbooks"],
    queryFn: () => api.listPlaybooks(),
  });

  const filtered = useMemo(() => {
    if (!playbooks) return [];
    let result = playbooks;

    if (roleFilter !== "all") {
      result = result.filter(
        (pb) => getRoleKey(pb.intended_agent_role || "") === roleFilter
      );
    }

    if (teamFilter !== "all") {
      result = result.filter((pb) => pb._team === teamFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (pb) =>
          (pb.framework_name || "").toLowerCase().includes(q) ||
          pb._id.toLowerCase().includes(q) ||
          (pb.primary_objective || "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [playbooks, roleFilter, teamFilter, search]);

  const grouped = useMemo(() => {
    if (groupBy === "none") return null;

    const groups: Record<string, Playbook[]> = {};
    for (const pb of filtered) {
      const key =
        groupBy === "role"
          ? pb.intended_agent_role || "Unknown"
          : pb._team || "Unknown";
      if (!groups[key]) groups[key] = [];
      groups[key].push(pb);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, groupBy]);

  const stats = useMemo(() => {
    if (!playbooks) return { total: 0, production: 0 };
    return {
      total: playbooks.length,
      production: playbooks.filter((pb) => pb.status === "production_ready").length,
    };
  }, [playbooks]);

  const teamStats = useMemo(() => {
    if (!playbooks) return [];
    const counts: Record<string, number> = {};
    for (const pb of playbooks) {
      const t = pb._team || "unknown";
      counts[t] = (counts[t] || 0) + 1;
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([team, count]) => ({ team, count }));
  }, [playbooks]);

  const roleStats = useMemo(() => {
    if (!playbooks) return [];
    const counts: Record<string, number> = {};
    for (const pb of playbooks) {
      const key = getRoleKey(pb.intended_agent_role || "");
      if (key === "other") continue;
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([role, count]) => ({ role, count }));
  }, [playbooks]);

  const hasActiveFilter = roleFilter !== "all" || teamFilter !== "all";

  function scrollToList() {
    setTimeout(() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  function handleRoleClick(role: string) {
    if (roleFilter === role) {
      setRoleFilter("all");
    } else {
      setRoleFilter(role);
      setTeamFilter("all");
      setGroupBy("none");
      scrollToList();
    }
  }

  function clearFilters() {
    setRoleFilter("all");
    setTeamFilter("all");
    setSearch("");
    setGroupBy("none");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading playbooks...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Playbook Catalog</h1>
          <HelpPopover title="What are Playbooks?">
            Playbooks are structured YAML definitions that tell agents how to
            execute specific workflows. Each playbook has an intended agent role
            (AE, SA, CA, CI), a primary objective, and step-by-step instructions.
            Click a team or role tile to filter, or use the search below.
          </HelpPopover>
        </div>
        <p className="text-muted-foreground mt-1">
          Browse, search, and manage agent playbooks across all teams and roles.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="Total Playbooks" value={stats.total} />
        <MetricCard label="Production Ready" value={stats.production} />
      </div>

      {roleStats.length > 0 && (
        <div>
          <h2 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <UserCog className="h-4 w-4 text-muted-foreground" />
            Browse by Agent Role ({roleStats.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {roleStats.map(({ role, count }) => (
              <Card
                key={role}
                className={`cursor-pointer transition-colors ${
                  roleFilter === role
                    ? ROLE_ACTIVE_COLORS[role] || "border-primary/60 bg-primary/5"
                    : ROLE_COLORS[role] || "hover:border-primary/30"
                }`}
                onClick={() => handleRoleClick(role)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{ROLE_LABELS[role] || formatLabel(role)}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="secondary" className="text-[10px]">{count}</Badge>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                    {ROLE_DESCRIPTIONS[role] || ""}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Active filter indicator */}
      <div ref={listRef} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or objective..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={teamFilter} onValueChange={(v) => { setTeamFilter(v); if (v !== "all") { setRoleFilter("all"); setGroupBy("none"); scrollToList(); } }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {teamStats.map(({ team, count }) => (
              <SelectItem key={team} value={team}>
                {formatLabel(team)} ({count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={groupBy} onValueChange={setGroupBy}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Group by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Grouping</SelectItem>
            <SelectItem value="role">Group by Role</SelectItem>
            <SelectItem value="team">Group by Team</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilter && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Filtered by:</span>
          {teamFilter !== "all" && (
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-destructive/20"
              onClick={() => setTeamFilter("all")}
            >
              Team: {formatLabel(teamFilter)}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          {roleFilter !== "all" && (
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-destructive/20"
              onClick={() => setRoleFilter("all")}
            >
              Role: {ROLE_LABELS[roleFilter] || formatLabel(roleFilter)}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          <button
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Clear all
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">No playbooks found</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      {grouped ? (
        <div className="space-y-8">
          {grouped.map(([label, pbs]) => (
            <PlaybookGroup key={label} label={label} playbooks={pbs} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((pb) => (
            <PlaybookCard key={pb._path || pb._id} playbook={pb} />
          ))}
        </div>
      )}
    </div>
  );
}
