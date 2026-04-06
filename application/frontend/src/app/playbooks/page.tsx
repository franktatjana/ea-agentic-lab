"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Search,
  BookOpen,
  FileText,
  Clock,
  CalendarClock,
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
import { ROLE_STYLES, getRoleStyle, getRoleLabel } from "@/lib/role-config";
import type { Playbook } from "@/types";

const CATEGORY_INFO: Record<string, { label: string; agentToAgent?: boolean; inProgress?: boolean }> = {
  strategic_frameworks: { label: "Strategic Frameworks" },
  discovery_investigation: { label: "Discovery & Investigation" },
  technical_execution: { label: "Technical Execution" },
  pursuit_sales_support: { label: "Pursuit & Sales Support" },
  content_generation: { label: "Content Generation" },
  relationship_governance: { label: "Relationship Governance" },
  system_governance: { label: "System Governance", agentToAgent: true },
  knowledge_management: { label: "Knowledge & Reporting", inProgress: true },
  deal_review: { label: "Deal Review" },
  pipeline_management: { label: "Pipeline Management" },
  monitoring_maintenance: { label: "Monitoring Maintenance" },
  technical_validation: { label: "Technical Validation" },
  partner_enablement: { label: "Partner Enablement" },
  partner_evaluation: { label: "Partner Evaluation" },
  operations_reporting: { label: "Operations Reporting" },
  delivery_execution: { label: "Delivery Execution" },
  strategic_intelligence: { label: "Strategic Intelligence" },
  executive_engagement: { label: "Executive Engagement" },
  cosell_operations: { label: "Cosell Operations" },
  product_management: { label: "Product Management" },
  customer_lifecycle: { label: "Customer Lifecycle" },
  revenue_operations: { label: "Revenue Operations" },
  intelligence_analysis: { label: "Intelligence Analysis" },
  intelligence_gathering: { label: "Intelligence Gathering" },
  customer_advocacy: { label: "Customer Advocacy" },
  customer_enablement: { label: "Customer Enablement" },
  risk_management: { label: "Risk Management" },
  governance: { label: "Governance" },
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  strategic_frameworks: "Long-term planning, portfolio strategy, horizon mapping, maturity assessment",
  discovery_investigation: "Deep research, gap analysis, signal detection, pattern recognition",
  technical_execution: "Solution design, architecture decisions, implementation planning, validation",
  pursuit_sales_support: "Deal strategy, RFx response, competitive positioning, pipeline management",
  content_generation: "Document creation, report assembly, deliverable production, artifact synthesis",
  relationship_governance: "Health monitoring, stakeholder management, adoption tracking, retention",
  system_governance: "Automation, process enforcement, playbook validation, signal processing, scheduling",
  knowledge_management: "Knowledge capture, lessons learned, reporting, institutional memory",
  deal_review: "Deal stage validation, opportunity assessment, qualification checkpoints, win probability",
  pipeline_management: "Opportunity tracking, forecast accuracy, pipeline hygiene, stage progression",
  monitoring_maintenance: "Continuous signal scanning, health checks, automated alerts, threshold monitoring",
  technical_validation: "Proof of concept execution, technical fit verification, benchmark testing, integration checks",
  partner_enablement: "Partner training, co-sell readiness, joint solution development, partner onboarding",
  partner_evaluation: "Partner assessment, capability scoring, alliance fit analysis, partnership ROI",
  operations_reporting: "Operational metrics, periodic reviews, status summaries, performance dashboards",
  delivery_execution: "Implementation delivery, project milestones, handoff procedures, go-live support",
  strategic_intelligence: "Market positioning, trend analysis, competitive landscape, strategic opportunity mapping",
  executive_engagement: "C-level alignment, executive briefings, sponsor development, strategic relationship building",
  cosell_operations: "Joint selling motions, hyperscaler alignment, co-sell pipeline, partner-led opportunities",
  product_management: "Feature prioritization, roadmap input, customer feedback synthesis, product-market fit",
  customer_lifecycle: "Onboarding, adoption, expansion, renewal, churn prevention across the customer journey",
  revenue_operations: "Revenue forecasting, quota tracking, compensation analysis, sales efficiency metrics",
  intelligence_analysis: "Data synthesis, pattern recognition, insight generation, analytical assessment",
  intelligence_gathering: "Source monitoring, data collection, signal detection, information aggregation",
  customer_advocacy: "Reference program management, case study production, advocate health, proof points",
  customer_enablement: "Training delivery, knowledge transfer, documentation handoff, enablement programs",
  risk_management: "Technical risk assessment, feasibility validation, risk scoring, mitigation planning",
  governance: "Win/loss retrospectives, pattern analysis, process improvement, organizational learning",
};

const CATEGORY_ACTIVE_COLORS: Record<string, string> = {
  strategic_frameworks: "border-violet-500/60 bg-violet-600/5",
  discovery_investigation: "border-amber-500/60 bg-amber-600/5",
  technical_execution: "border-blue-500/60 bg-blue-600/5",
  pursuit_sales_support: "border-rose-500/60 bg-rose-600/5",
  content_generation: "border-cyan-500/60 bg-cyan-600/5",
  relationship_governance: "border-emerald-500/60 bg-emerald-600/5",
  system_governance: "border-lime-500/60 bg-lime-600/5",
  knowledge_management: "border-fuchsia-500/60 bg-fuchsia-600/5",
  deal_review: "border-yellow-500/60 bg-yellow-600/5",
  pipeline_management: "border-orange-500/60 bg-orange-600/5",
  monitoring_maintenance: "border-slate-400/60 bg-slate-500/5",
  technical_validation: "border-sky-500/60 bg-sky-600/5",
  partner_enablement: "border-green-500/60 bg-green-600/5",
  partner_evaluation: "border-pink-500/60 bg-pink-600/5",
  operations_reporting: "border-purple-500/60 bg-purple-600/5",
  delivery_execution: "border-teal-500/60 bg-teal-600/5",
  strategic_intelligence: "border-indigo-500/60 bg-indigo-600/5",
  executive_engagement: "border-yellow-500/60 bg-yellow-600/5",
  cosell_operations: "border-orange-500/60 bg-orange-600/5",
  product_management: "border-red-500/60 bg-red-600/5",
  customer_lifecycle: "border-teal-500/60 bg-teal-600/5",
  revenue_operations: "border-red-500/60 bg-red-600/5",
  intelligence_analysis: "border-indigo-500/60 bg-indigo-600/5",
  intelligence_gathering: "border-sky-500/60 bg-sky-600/5",
  customer_advocacy: "border-sky-500/60 bg-sky-600/5",
  customer_enablement: "border-stone-500/60 bg-stone-600/5",
  risk_management: "border-red-500/60 bg-red-600/5",
  governance: "border-lime-500/60 bg-lime-600/5",
};

function formatLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName
        )
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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
      production: playbooks.filter((pb) => pb.status === "production_ready")
        .length,
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
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts)
      .filter(([key, count]) => count > 0 && key !== "other")
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
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([category, count]) => ({ category, count }));
  }, [playbooks]);

  const hasActiveFilter =
    roleFilter !== "all" ||
    categoryFilter !== "all" ||
    teamFilter !== "all" ||
    search.trim() !== "";

  function handleRoleClick(role: string) {
    setRoleFilter(roleFilter === role ? "all" : role);
  }

  function handleCategoryClick(category: string) {
    setCategoryFilter(categoryFilter === category ? "all" : category);
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
            execute specific workflows. Each playbook has an intended agent role,
            a primary objective, and step-by-step instructions. Use the filters
            below to narrow by role, category, or team.
          </HelpPopover>
        </div>
        <p className="text-muted-foreground mt-1">
          Browse, search, and manage agent playbooks across all teams and roles.
        </p>
        <div className="flex flex-wrap gap-3 mt-2">
          <Link
            href="/docs?path=architecture/playbooks/playbook-system.md"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <BookOpen className="h-3 w-3" />
            Playbook system
          </Link>
          <Link
            href="/docs?path=reference/playbook-catalog.md"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <FileText className="h-3 w-3" />
            Playbook catalog (docs)
          </Link>
        </div>
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
              Reusable execution units that encode best practices, frameworks,
              and specialist knowledge across all teams and roles.
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
              Validated playbooks ready for production deployment, tested against
              governance constraints and quality gates.
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
              Distinct agent roles with dedicated playbooks across all teams and
              domains.
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Filter section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="Search by name, ID, or objective...  ⌘K"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roleStats.map(({ role, count }) => (
                <SelectItem key={role} value={role}>
                  {getRoleLabel(role)} ({count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={teamFilter} onValueChange={setTeamFilter}>
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
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v)}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryStats.map(({ category, count }) => (
                <SelectItem key={category} value={category}>
                  {CATEGORY_INFO[category]?.label || formatLabel(category)} ({count})
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
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="text-muted-foreground text-xs">
              {filtered.length} of {stats.total} playbooks
            </span>
            <span className="text-muted-foreground/40">·</span>
            {search.trim() && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/20 text-xs"
                onClick={() => setSearch("")}
              >
                &quot;{search}&quot;
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {roleFilter !== "all" && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/20 text-xs"
                onClick={() => setRoleFilter("all")}
              >
                {getRoleLabel(roleFilter)}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {categoryFilter !== "all" && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/20 text-xs"
                onClick={() => setCategoryFilter("all")}
              >
                {CATEGORY_INFO[categoryFilter]?.label ||
                  formatLabel(categoryFilter)}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {teamFilter !== "all" && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/20 text-xs"
                onClick={() => setTeamFilter("all")}
              >
                {formatLabel(teamFilter)}
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
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">No playbooks found</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : grouped ? (
        <div className="space-y-8">
          {grouped.map(([label, pbs]) => (
            <PlaybookGroup
              key={label}
              label={label}
              playbooks={pbs}
              groupBy={groupBy}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((pb) => (
            <PlaybookCard key={pb._path || pb._id} playbook={pb} />
          ))}
        </div>
      )}
    </div>
  );
}
