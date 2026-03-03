"use client";

import { useMemo } from "react";
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

const AGENT_SHORT_NAMES: Record<string, string> = {
  sa_agent: "SA",
  delivery_agent: "Delivery",
  pm_agent: "PM",
  ci_agent: "CI",
  ve_agent: "VE",
  partner_agent: "Partner",
  rfp_agent: "RFP",
  poc_agent: "POC",
  infosec_agent: "InfoSec",
  senior_manager_agent: "SM",
};

function buildPreSalesFlows(
  deferTo: Record<string, unknown> | undefined,
): HandoffStep[] {
  if (!deferTo) return [];
  const steps: HandoffStep[] = [];
  for (const [agentKey, entry] of Object.entries(deferTo)) {
    const to = AGENT_SHORT_NAMES[agentKey] ?? agentKey;
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

const POST_SALES_STEPS: HandoffStep[] = [
  { from: "AE", to: "Delivery", trigger: "Contract signed", description: "Deal closes. AE hands off the complete deal context (commitments, SLAs, stakeholder map) to Delivery for implementation planning." },
  { from: "Delivery", to: "PS", trigger: "Implementation start", description: "Delivery agent engages Professional Services for hands-on implementation, scoping workshops, and resource allocation." },
  { from: "Delivery", to: "CA", trigger: "Go-live complete", description: "System is live. Customer Architect takes over for ongoing adoption tracking, health monitoring, and expansion identification." },
];

const GOVERNANCE_STEPS: HandoffStep[] = [
  { from: "Meeting Notes", to: "Task Shepherd", trigger: "Actions extracted", description: "Meeting Notes agent extracts action items. Task Shepherd ensures each has a single owner, due date, and clear done-criteria." },
  { from: "Meeting Notes", to: "Decision Registrar", trigger: "Decisions extracted", description: "Decisions mentioned in meetings are captured. Decision Registrar documents context, rationale, alternatives considered." },
  { from: "Meeting Notes", to: "Risk Radar", trigger: "Risks identified", description: "Meeting surfaces new risks. Risk Radar classifies severity, assigns owners, and determines if escalation is needed." },
  { from: "Risk Radar", to: "Nudger", trigger: "Escalations", description: "Risk owners have overdue mitigations. Nudger sends targeted reminders (max 1 per action per day) to drive resolution." },
  { from: "Nudger", to: "SM", trigger: "Overdue > 5 days", description: "Action remains unresolved after 5 days of reminders. Senior Manager is escalated to intervene and unblock." },
];

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
    return [
      { label: "Pre-Sales", color: "text-blue-400", steps: preSalesSteps },
      { label: "Post-Sales", color: "text-teal-400", steps: POST_SALES_STEPS },
      { label: "Governance", color: "text-green-400", steps: GOVERNANCE_STEPS },
    ];
  }, [aeDefinition]);

  const NAV_CARDS: { href: string; icon: LucideIcon; title: string; count: number | string; description: string; color: string; bg: string; border: string }[] = [
    {
      href: "/agents/profiles",
      icon: Bot,
      title: "Agent Profiles",
      count: "20 roles",
      description: "20 roles across 7 areas owning 35 agents. Each profile covers purpose, sub-agents, runbooks, and escalation rules.",
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
      count: 4,
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
          20 roles, 35 agents. Each role is a digital twin of a human function, owning runbooks, tools, and playbook contributions.
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
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold mb-2">{card.count}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Separator />

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {handoffFlows.map((flow) => (
            <Card key={flow.label}>
              <CardContent className="p-5">
                <h3 className={`text-sm font-semibold mb-3 ${flow.color}`}>{flow.label}</h3>
                <div className="space-y-2">
                  {flow.steps.map((step, i) => (
                    <Popover key={i}>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-2 w-full text-left group rounded-md px-2 py-1.5 -mx-2 hover:bg-accent/50 transition-colors">
                          <Badge variant="outline" className="text-xs shrink-0">{step.from}</Badge>
                          <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                          <Badge variant="outline" className="text-xs shrink-0">{step.to}</Badge>
                          <span className="text-xs text-muted-foreground ml-1 truncate">{step.trigger}</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-80">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{step.from}</Badge>
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="outline" className="text-xs">{step.to}</Badge>
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
          ))}
        </div>
      </div>
    </div>
  );
}
