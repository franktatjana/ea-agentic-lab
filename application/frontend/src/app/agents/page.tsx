"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  Network,
  BookOpen,
  FileCode2,
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

const KNOWN_ACRONYMS = new Set(["sa", "ae", "ca", "pm", "ve", "ci", "rfp", "poc", "pov", "csp", "ii", "aci", "mna", "adr", "qbr", "ebr", "nps", "csat", "sm", "ps"]);

function agentKeyToShortName(key: string): string {
  const name = key.replace(/_agent$/, "").replace(/_/g, " ");
  const words = name.split(" ");
  if (words.length === 1) {
    const w = words[0].toLowerCase();
    if (KNOWN_ACRONYMS.has(w)) return w.toUpperCase();
    return words[0].charAt(0).toUpperCase() + words[0].slice(1);
  }
  return words.map(w => w.charAt(0).toUpperCase()).join("");
}

function buildPreSalesFlows(
  deferTo: Record<string, unknown> | undefined,
): HandoffStep[] {
  if (!deferTo) return [];
  const steps: HandoffStep[] = [];
  for (const [agentKey, entry] of Object.entries(deferTo)) {
    const to = agentKeyToShortName(agentKey);
    const e = entry as Record<string, unknown> | undefined;
    const scenarios = e?.scenarios as Array<Record<string, string>> | undefined;
    if (!scenarios) continue;
    for (const s of scenarios) {
      steps.push({
        from: "AE",
        to,
        trigger: s.trigger,
        description: `${s.trigger}. AE passes ${s.context_passed?.toLowerCase() ?? "context"} for ${s.receiver_action?.toLowerCase() ?? "processing"}.`,
      });
    }
  }
  return steps;
}

// TODO: Move post-sales and governance handoff chains to YAML specs
// and fetch via API. Currently static until playbook-level handoffs are specced.
function buildPostSalesFlows(defs: Array<{ id: string; name: string }> | undefined): HandoffStep[] {
  if (!defs) return [];
  const has = (id: string) => defs.some(d => d.id === id);
  const steps: HandoffStep[] = [];
  if (has("delivery-agent")) steps.push({ from: "AE", to: "Delivery", trigger: "Contract signed", description: "Deal closes. AE hands off deal context (commitments, SLAs, stakeholder map) to Delivery for implementation planning." });
  if (has("delivery-agent") && has("ps-agent")) steps.push({ from: "Delivery", to: "PS", trigger: "Implementation start", description: "Delivery agent engages Professional Services for hands-on implementation and resource allocation." });
  if (has("delivery-agent") && has("ca-agent")) steps.push({ from: "Delivery", to: "CA", trigger: "Go-live complete", description: "System is live. Customer Architect takes over for adoption tracking, health monitoring, and expansion." });
  return steps;
}

function buildGovernanceFlows(defs: Array<{ id: string; name: string }> | undefined): HandoffStep[] {
  if (!defs) return [];
  const gov = defs.filter(d => d.name?.toLowerCase().includes("meeting notes") || d.name?.toLowerCase().includes("task shepherd") || d.name?.toLowerCase().includes("decision") || d.name?.toLowerCase().includes("risk radar") || d.name?.toLowerCase().includes("nudger") || d.name?.toLowerCase().includes("senior manager"));
  if (gov.length === 0) return [];
  const steps: HandoffStep[] = [];
  const has = (substr: string) => gov.some(d => d.name?.toLowerCase().includes(substr));
  if (has("meeting notes") && has("task shepherd")) steps.push({ from: "Meeting Notes", to: "Task Shepherd", trigger: "Actions extracted", description: "Meeting Notes agent extracts action items. Task Shepherd ensures each has owner, due date, and done-criteria." });
  if (has("meeting notes") && has("decision")) steps.push({ from: "Meeting Notes", to: "Decision Registrar", trigger: "Decisions extracted", description: "Decisions from meetings are captured with context, rationale, and alternatives considered." });
  if (has("meeting notes") && has("risk radar")) steps.push({ from: "Meeting Notes", to: "Risk Radar", trigger: "Risks identified", description: "New risks are classified by severity, assigned owners, and evaluated for escalation." });
  if (has("risk radar") && has("nudger")) steps.push({ from: "Risk Radar", to: "Nudger", trigger: "Escalations", description: "Overdue risk mitigations trigger targeted reminders (max 1 per action per day)." });
  if (has("nudger") && has("senior manager")) steps.push({ from: "Nudger", to: "SM", trigger: "Overdue > 5 days", description: "Unresolved actions after 5 days escalate to Senior Manager to intervene." });
  return steps;
}

const FLOW_COLORS: Record<string, string> = {
  "Pre-Sales": "text-blue-500 dark:text-blue-400",
  "Post-Sales": "text-teal-500 dark:text-teal-400",
  "Governance": "text-green-500 dark:text-green-400",
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

function InteractionMap({ flows }: { flows: HandoffFlow[] }) {
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
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue placeholder="From role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>

        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />

        <Select value={toFilter} onValueChange={setToFilter}>
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue placeholder="To role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All targets</SelectItem>
            {roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

  const { data: aeDefinition } = useQuery({
    queryKey: ["definition", "ae-agent"],
    queryFn: () => api.getDefinition("ae-agent"),
  });

  const handoffFlows = useMemo<HandoffFlow[]>(() => {
    const ext = aeDefinition?.["x-ea-agent"] as Record<string, unknown> | undefined;
    const handoffs = ext?.handoffs as Record<string, unknown> | undefined;
    const deferTo = handoffs?.defer_to as Record<string, unknown> | undefined;
    const preSalesSteps = buildPreSalesFlows(deferTo);
    const postSalesSteps = buildPostSalesFlows(definitions);
    const governanceSteps = buildGovernanceFlows(definitions);
    return [
      { label: "Pre-Sales", color: "text-blue-400", steps: preSalesSteps },
      { label: "Post-Sales", color: "text-teal-400", steps: postSalesSteps },
      { label: "Governance", color: "text-green-400", steps: governanceSteps },
    ];
  }, [aeDefinition, definitions]);

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

      <InteractionMap flows={handoffFlows} />
    </div>
  );
}
