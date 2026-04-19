"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  Network,
  BookOpen,
  FileCode2,
  FileText,
  ArrowRight,
  ChevronRight,
  Presentation,
} from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HelpPopover } from "@/components/help-popover";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { LucideIcon } from "lucide-react";
import type { HandoffEdge } from "@/types";

interface HandoffStep {
  from: string;
  to: string;
  trigger: string;
  description: string;
}

interface HandoffFlow {
  label: string;
  color: string;
  steps: HandoffStep[];
}

const AGENT_SHORT_NAMES: Record<string, string> = {
  ae: "AE", sa: "SA", ca: "CA", pm: "PM", ve: "VE",
  ci: "CI", ii: "II", aci: "ACI", mna: "MNA", ti: "TI",
  rfp: "RFP", poc: "POC", ps: "PS", sm: "SM",
  ham: "HAM", aa: "AA", fcto: "FCTO",
  delivery: "Delivery", partner: "Partner",
  infosec: "InfoSec", retrospective: "Retro",
  "revops-director": "RevOps", "senior-manager": "SM",
  "vp-sales": "VP Sales", "product-team": "PM",
  "cro-ceo": "CRO",
  "infohub-curator": "InfoHub",
  "bda-specialist": "BDA", "csa-specialist": "CSA",
  "dba-specialist": "DBA", "de-specialist": "DE",
  "devops-specialist": "DevOps", "mig-specialist": "MIG",
  "net-specialist": "NET", "pa-specialist": "PA",
  "sd-specialist": "SD", "security-specialist": "SEC",
  "observability-specialist": "OBS",
};

function agentIdToShortName(id: string): string {
  const stem = id.replace(/-agent$/, "");
  if (AGENT_SHORT_NAMES[stem]) return AGENT_SHORT_NAMES[stem];
  const words = stem.split("-");
  if (words.length === 1) return stem.charAt(0).toUpperCase() + stem.slice(1);
  return words.map(w => w.charAt(0).toUpperCase()).join("");
}

interface FlowBuildResult {
  phases: Record<string, HandoffStep[]>;
  nameMap: Record<string, string>;
}

function buildFlowsFromEdges(edges: HandoffEdge[]): FlowBuildResult {
  const phases: Record<string, HandoffStep[]> = {
    "Pre-Sales": [],
    "Post-Sales": [],
  };
  const nameMap: Record<string, string> = {};
  for (const edge of edges) {
    const from = agentIdToShortName(edge.from_id);
    const to = agentIdToShortName(edge.to_id);
    const fromFull = edge.from_name.replace(/ Agent$/, "");
    const toFull = edge.to_name.replace(/ Agent$/, "");
    if (!nameMap[from]) nameMap[from] = fromFull;
    if (!nameMap[to]) nameMap[to] = toFull;
    if (edge.direction !== "defer_to") continue;
    const ctx = edge.context_passed ? edge.context_passed.toLowerCase() : "context";
    const action = edge.receiver_action ? edge.receiver_action.toLowerCase() : "processing";
    const description = `${from} passes ${ctx} for ${action}.`;
    const bucket = phases[edge.phase] ?? phases["Pre-Sales"];
    bucket.push({ from, to, trigger: edge.trigger, description });
  }
  return { phases, nameMap };
}

const FLOW_COLORS: Record<string, string> = {
  "Pre-Sales": "text-blue-500 dark:text-blue-400",
  "Post-Sales": "text-teal-500 dark:text-teal-400",
};

function HandoffColumn({ flow, fromFilter, toFilter }: { flow: HandoffFlow; fromFilter: string; toFilter: string }) {
  const filtered = useMemo(() => {
    return flow.steps.filter((s) => {
      if (fromFilter !== "all" && s.from !== fromFilter) return false;
      if (toFilter !== "all" && s.to !== toFilter) return false;
      return true;
    });
  }, [flow.steps, fromFilter, toFilter]);

  const colorClass = FLOW_COLORS[flow.label] ?? "text-muted-foreground";

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${colorClass}`}>
          {flow.label}
        </p>
        <div className="space-y-1.5">
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground/60 py-2 text-center">No matches</p>
          )}
          {filtered.map((step, i) => (
            <Popover key={i}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 w-full text-left rounded-md px-2 py-1.5 -mx-2 hover:bg-accent/50 transition-colors">
                  <Badge variant="outline" className="text-xs shrink-0">{step.from}</Badge>
                  <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  <Badge variant="outline" className="text-xs shrink-0">{step.to}</Badge>
                  <span className="text-xs text-muted-foreground ml-1 truncate" title={step.trigger}>{step.trigger}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">{step.from}</Badge>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  <Badge variant="outline" className="text-xs">{step.to}</Badge>
                  <span className={`text-[10px] font-medium uppercase tracking-wider ml-auto ${colorClass}`}>
                    {flow.label}
                  </span>
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  {step.trigger}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </PopoverContent>
            </Popover>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function InteractionMap({ flows, nameMap }: { flows: HandoffFlow[]; nameMap: Record<string, string> }) {
  const [fromFilter, setFromFilter] = useState<string>("all");
  const [toFilter, setToFilter] = useState<string>("all");

  const roles = useMemo(() => {
    const set = new Set<string>();
    for (const flow of flows) {
      for (const step of flow.steps) { set.add(step.from); set.add(step.to); }
    }
    return Array.from(set).sort();
  }, [flows]);

  const totalSteps = flows.reduce((n, f) => n + f.steps.length, 0);
  const filteredCount = flows.reduce((n, f) => {
    return n + f.steps.filter((s) => {
      if (fromFilter !== "all" && s.from !== fromFilter) return false;
      if (toFilter !== "all" && s.to !== toFilter) return false;
      return true;
    }).length;
  }, 0);

  const hasFilter = fromFilter !== "all" || toFilter !== "all";

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-lg font-semibold">Interaction Map</h2>
        <HelpPopover title="Handoff Chains">
          Agents collaborate through defined handoff chains. Each arrow represents
          a trigger event that passes context from one agent to another.
          Click any handoff to see what triggers it and what context is passed.
        </HelpPopover>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Primary handoff chains between agents. Click a step to see the trigger and context passed.
      </p>

      <div className="flex items-center gap-3 mb-4">
        <Select value={fromFilter} onValueChange={setFromFilter}>
          <SelectTrigger className="w-[240px] h-8 text-xs">
            <SelectValue placeholder="From role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {roles.map((r) => <SelectItem key={r} value={r}>{nameMap[r] && nameMap[r] !== r ? `${nameMap[r]} (${r})` : r}</SelectItem>)}
          </SelectContent>
        </Select>

        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />

        <Select value={toFilter} onValueChange={setToFilter}>
          <SelectTrigger className="w-[240px] h-8 text-xs">
            <SelectValue placeholder="To role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All targets</SelectItem>
            {roles.map((r) => <SelectItem key={r} value={r}>{nameMap[r] && nameMap[r] !== r ? `${nameMap[r]} (${r})` : r}</SelectItem>)}
          </SelectContent>
        </Select>

        {hasFilter && (
          <button
            onClick={() => { setFromFilter("all"); setToFilter("all"); }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}

        <span className="text-xs text-muted-foreground ml-auto">
          {filteredCount} of {totalSteps} handoffs
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flows.map((flow) => (
          <HandoffColumn key={flow.label} flow={flow} fromFilter={fromFilter} toFilter={toFilter} />
        ))}
      </div>
    </div>
  );
}

export default function AgentsHubPage() {
  const { data: playbooks } = useQuery({
    queryKey: ["playbooks"],
    queryFn: () => api.listPlaybooks(),
  });

  const { data: definitions } = useQuery({
    queryKey: ["definitions"],
    queryFn: () => api.listDefinitions(),
  });

  const { data: handoffEdges } = useQuery({
    queryKey: ["handoffs"],
    queryFn: () => api.listHandoffs(),
  });

  const { handoffFlows, handoffNameMap } = useMemo(() => {
    const { phases, nameMap } = handoffEdges
      ? buildFlowsFromEdges(handoffEdges)
      : { phases: { "Pre-Sales": [], "Post-Sales": [] }, nameMap: {} };
    return {
      handoffFlows: [
        { label: "Pre-Sales", color: "text-blue-400", steps: phases["Pre-Sales"] },
        { label: "Post-Sales", color: "text-teal-400", steps: phases["Post-Sales"] },
      ] as HandoffFlow[],
      handoffNameMap: nameMap,
    };
  }, [handoffEdges]);

  const subAgentIds = useMemo(() => {
    if (!definitions) return new Set<string>();
    const ids = new Set<string>();
    for (const d of definitions) {
      for (const sa of d.sub_agents ?? []) {
        if (typeof sa === "object" && sa.id) ids.add(sa.id);
      }
    }
    return ids;
  }, [definitions]);

  const profileCount = definitions?.filter(d => d.has_profile && d.category !== "Governance" && !subAgentIds.has(d.id)).length ?? 0;
  const totalAgentCount = definitions?.length ?? 0;

  const NAV_CARDS: { href: string; icon: LucideIcon; title: string; count: number | string; description: string; color: string; bg: string; border: string }[] = [
    {
      href: "/agents/profiles",
      icon: Bot,
      title: "Agent Profiles",
      count: profileCount > 0 ? `${profileCount} roles` : "–",
      description: `${profileCount || "–"} roles across teams. Each profile covers purpose, sub-agents, runbooks, and escalation rules.`,
      color: "text-amber-400",
      bg: "bg-amber-600/10",
      border: "border-amber-600/20 hover:border-amber-500/40",
    },
    {
      href: "/agents/definitions",
      icon: FileCode2,
      title: "Agent Definitions",
      count: definitions?.length ?? "–",
      description: "System view of each role. Each definition specifies the agent's runbooks, tools, prompts, and guardrails.",
      color: "text-emerald-400",
      bg: "bg-emerald-600/10",
      border: "border-emerald-600/20 hover:border-emerald-500/40",
    },
    {
      href: "/orchestration",
      icon: Network,
      title: "Orchestration",
      count: "4 tools",
      description: "Parse, analyze, and validate multi-agent process definitions. Detect conflicts between agents, identify handoff gaps, and map playbook involvement.",
      color: "text-cyan-400",
      bg: "bg-cyan-600/10",
      border: "border-cyan-600/20 hover:border-cyan-500/40",
    },
    {
      href: "/playbooks",
      icon: BookOpen,
      title: "Playbooks",
      count: playbooks?.length ?? "–",
      description: "Reusable execution units owned by agents. Each playbook encodes best practices, frameworks, and specialist knowledge for a specific task.",
      color: "text-green-400",
      bg: "bg-green-600/10",
      border: "border-green-600/20 hover:border-green-500/40",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Agents &amp; Operations</h1>
          <button
            onClick={() => window.open("/present/orchestration", "_blank")}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Presentation className="h-3.5 w-3.5" />
            Present
          </button>
          <HelpPopover title="Agent Ecosystem">
            Each human role has a digital twin (agent) that owns runbooks,
            tools, and guardrails. Playbooks orchestrate runbooks across roles,
            and the orchestration engine coordinates handoffs.
          </HelpPopover>
        </div>
        <p className="text-muted-foreground mt-1">
          {profileCount > 0 ? `${profileCount} roles, ${totalAgentCount} agents.` : "Loading..."} Each role is a digital twin of a human function, owning runbooks, tools, and playbook contributions.
        </p>
        <div className="flex flex-wrap gap-3 mt-2">
          <Link
            href="/docs?path=architecture/system/domain-model.md"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <BookOpen className="h-3 w-3" />
            Domain model
          </Link>
          <Link
            href="/docs?path=architecture/agents/agent-architecture.md"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <FileText className="h-3 w-3" />
            Agent architecture
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {NAV_CARDS.map((card) => (
          <Link key={card.href} href={card.href} className="block">
            <Card className={`${card.border} ${card.bg} transition-colors h-full`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                    <span className="font-semibold">{card.title}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-500 dark:text-amber-400" />
                </div>
                <p className="text-2xl font-bold mb-2">{card.count}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Separator />

      <InteractionMap flows={handoffFlows} nameMap={handoffNameMap} />
    </div>
  );
}
