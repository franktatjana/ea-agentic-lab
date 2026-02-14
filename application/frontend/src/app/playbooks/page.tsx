"use client";

import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Clock,
  CalendarClock,
  ArrowRight,
  X,
  UserCog,
  CheckCircle2,
  Library,
  Tag,
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
import { RoleBadge, getRoleKey } from "@/components/badges";
import { HelpPopover } from "@/components/help-popover";
import type { Playbook } from "@/types";

const CATEGORY_INFO: Record<string, { label: string; agentToAgent?: boolean }> = {
  strategic_frameworks: { label: "Strategic Frameworks" },
  discovery_investigation: { label: "Discovery & Investigation" },
  technical_execution: { label: "Technical Execution" },
  pursuit_sales_support: { label: "Pursuit & Sales Support" },
  content_generation: { label: "Content Generation" },
  relationship_governance: { label: "Relationship Governance" },
  automated_operations: { label: "Automated Operations", agentToAgent: true },
  system_governance: { label: "System Governance", agentToAgent: true },
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  strategic_frameworks: "Long-term planning, portfolio strategy, horizon mapping, maturity assessment",
  discovery_investigation: "Deep research, gap analysis, signal detection, pattern recognition",
  technical_execution: "Solution design, architecture decisions, implementation planning, validation",
  pursuit_sales_support: "Deal strategy, RFx response, competitive positioning, pipeline management",
  content_generation: "Document creation, report assembly, deliverable production, artifact synthesis",
  relationship_governance: "Health monitoring, stakeholder management, adoption tracking, retention",
  automated_operations: "Event-driven workflows, routine automation, signal processing, scheduling",
  system_governance: "Quality assurance, playbook validation, process enforcement, meta-operations",
};

const CATEGORY_COLORS: Record<string, string> = {
  strategic_frameworks: "border-violet-600/30 hover:border-violet-500/50",
  discovery_investigation: "border-amber-600/30 hover:border-amber-500/50",
  technical_execution: "border-blue-600/30 hover:border-blue-500/50",
  pursuit_sales_support: "border-rose-600/30 hover:border-rose-500/50",
  content_generation: "border-cyan-600/30 hover:border-cyan-500/50",
  relationship_governance: "border-emerald-600/30 hover:border-emerald-500/50",
  automated_operations: "border-orange-600/30 hover:border-orange-500/50",
  system_governance: "border-lime-600/30 hover:border-lime-500/50",
};

const CATEGORY_ACTIVE_COLORS: Record<string, string> = {
  strategic_frameworks: "border-violet-500/60 bg-violet-600/5",
  discovery_investigation: "border-amber-500/60 bg-amber-600/5",
  technical_execution: "border-blue-500/60 bg-blue-600/5",
  pursuit_sales_support: "border-rose-500/60 bg-rose-600/5",
  content_generation: "border-cyan-500/60 bg-cyan-600/5",
  relationship_governance: "border-emerald-500/60 bg-emerald-600/5",
  automated_operations: "border-orange-500/60 bg-orange-600/5",
  system_governance: "border-lime-500/60 bg-lime-600/5",
};

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


function PlaybookCard({ playbook }: { playbook: Playbook }) {
  const title = playbook.framework_name || playbook.name || playbook._id;
  const objective = playbook.primary_objective || playbook.metadata?.description || playbook.steckbrief?.one_liner || "";
  const viewHref = `/playbooks/view?team=${encodeURIComponent(playbook._team)}&file=${encodeURIComponent(playbook._filename)}`;
  const category = playbook.playbook_category;
  const catLabel = category ? (CATEGORY_INFO[category]?.label || formatLabel(category)) : null;

  return (
    <Link href={viewHref} className="block h-full">
      <Card className="hover:border-primary/50 transition-colors h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-base">{title}</CardTitle>
            </div>
            {playbook.intended_agent_role && (
              <RoleBadge role={playbook.intended_agent_role} />
            )}
          </div>
          <div className="min-w-0">
            <CardDescription className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-muted-foreground">{playbook._team}</span>
              {catLabel && (
                <span className="text-green-400">{catLabel}</span>
              )}
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
        <CardContent>
          {objective && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {objective}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function PlaybookGroup({
  label,
  playbooks,
  groupBy,
}: {
  label: string;
  playbooks: Playbook[];
  groupBy?: string;
}) {
  const catInfo = groupBy === "category" ? CATEGORY_INFO[label] : null;
  const displayLabel = catInfo?.label || formatLabel(label);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        {displayLabel}{" "}
        <span className="text-xs font-normal">({playbooks.length})</span>
        {catInfo?.agentToAgent && (
          <Badge variant="outline" className="text-[10px] font-normal normal-case tracking-normal">
            agent-to-agent
          </Badge>
        )}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
  const [categoryFilter, setCategoryFilter] = useState("all");
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

    if (categoryFilter !== "all") {
      result = result.filter((pb) => pb.playbook_category === categoryFilter);
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
  }, [playbooks, roleFilter, categoryFilter, teamFilter, search]);

  const grouped = useMemo(() => {
    if (groupBy === "none") return null;

    const groups: Record<string, Playbook[]> = {};
    for (const pb of filtered) {
      const key =
        groupBy === "role"
          ? pb.intended_agent_role || "Unknown"
          : groupBy === "category"
            ? pb.playbook_category || "Uncategorized"
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

  const categoryStats = useMemo(() => {
    if (!playbooks) return [];
    const counts: Record<string, number> = {};
    for (const pb of playbooks) {
      const cat = pb.playbook_category || "uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    }
    const order = Object.keys(CATEGORY_INFO);
    return Object.entries(counts)
      .sort(([a], [b]) => {
        const ai = order.indexOf(a);
        const bi = order.indexOf(b);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      })
      .map(([category, count]) => ({ category, count }));
  }, [playbooks]);

  const hasActiveFilter = roleFilter !== "all" || categoryFilter !== "all" || teamFilter !== "all";

  function scrollToList() {
    setTimeout(() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  function handleRoleClick(role: string) {
    if (roleFilter === role) {
      setRoleFilter("all");
    } else {
      setRoleFilter(role);
      setCategoryFilter("all");
      setTeamFilter("all");
      setGroupBy("none");
      scrollToList();
    }
  }

  function handleCategoryClick(category: string) {
    if (categoryFilter === category) {
      setCategoryFilter("all");
    } else {
      setCategoryFilter(category);
      setRoleFilter("all");
      setTeamFilter("all");
      setGroupBy("none");
      scrollToList();
    }
  }

  function clearFilters() {
    setRoleFilter("all");
    setCategoryFilter("all");
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-600/20 bg-green-600/10 h-full">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Library className="h-5 w-5 text-green-400" />
              <span className="font-semibold">All Playbooks</span>
            </div>
            <p className="text-2xl font-bold mb-2">{stats.total}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Reusable execution units that encode best practices, frameworks, and specialist knowledge across all teams and roles.
            </p>
          </CardContent>
        </Card>
        <Card className="border-emerald-600/20 bg-emerald-600/10 h-full">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span className="font-semibold">Production Ready</span>
            </div>
            <p className="text-2xl font-bold mb-2">{stats.production}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Validated playbooks ready for production deployment, tested against governance constraints and quality gates.
            </p>
          </CardContent>
        </Card>
        <Card className="border-blue-600/20 bg-blue-600/10 h-full">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <UserCog className="h-5 w-5 text-blue-400" />
              <span className="font-semibold">Agent Roles</span>
            </div>
            <p className="text-2xl font-bold mb-2">{roleStats.length}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Distinct agent roles with dedicated playbooks, from Account Executives and Solution Architects to Governance and Delivery.
            </p>
          </CardContent>
        </Card>
      </div>

      {roleStats.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <UserCog className="h-4 w-4 text-muted-foreground" />
              Browse by Agent Role
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Filter playbooks by the agent role they are designed for. Each role has specialized playbooks tailored to its domain expertise.
            </p>
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
        </>
      )}

      {categoryStats.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-muted-foreground" />
              Browse by Category
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Filter playbooks by what they help accomplish. Categories marked as agent-to-agent contain playbooks where agents serve other agents, not humans directly.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {categoryStats.map(({ category, count }) => {
                const info = CATEGORY_INFO[category];
                return (
                  <Card
                    key={category}
                    className={`cursor-pointer transition-colors ${
                      categoryFilter === category
                        ? CATEGORY_ACTIVE_COLORS[category] || "border-primary/60 bg-primary/5"
                        : CATEGORY_COLORS[category] || "hover:border-primary/30"
                    }`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{info?.label || formatLabel(category)}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="secondary" className="text-[10px]">{count}</Badge>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                        {CATEGORY_DESCRIPTIONS[category] || ""}
                      </p>
                      {info?.agentToAgent && (
                        <Badge variant="outline" className="mt-1.5 text-[9px] font-normal">
                          agent-to-agent
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
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
        <Select value={teamFilter} onValueChange={(v) => { setTeamFilter(v); if (v !== "all") { setRoleFilter("all"); setCategoryFilter("all"); setGroupBy("none"); scrollToList(); } }}>
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
            <SelectItem value="category">Group by Category</SelectItem>
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
          {categoryFilter !== "all" && (
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-destructive/20"
              onClick={() => setCategoryFilter("all")}
            >
              Category: {CATEGORY_INFO[categoryFilter]?.label || formatLabel(categoryFilter)}
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
            <PlaybookGroup key={label} label={label} playbooks={pbs} groupBy={groupBy} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((pb) => (
            <PlaybookCard key={pb._path || pb._id} playbook={pb} />
          ))}
        </div>
      )}
    </div>
  );
}
