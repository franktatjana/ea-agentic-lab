"use client";

import Link from "next/link";
import {
  Bot,
  Network,
  BookOpen,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
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

const HANDOFF_FLOWS: HandoffFlow[] = [
  {
    label: "Pre-Sales",
    color: "text-blue-400",
    steps: [
      { from: "AE", to: "RFP", trigger: "RFP received", description: "AE detects an incoming RFP and hands off to the RFP agent for bid strategy assessment, compliance matrix creation, and response orchestration." },
      { from: "AE", to: "POC", trigger: "POC requested", description: "Customer requests a proof of concept. AE transfers context (success criteria, timeline, stakeholders) to the POC agent for execution planning." },
      { from: "AE", to: "SA", trigger: "Technical questions", description: "AE encounters technical depth beyond commercial scope. SA takes over for architecture review, risk assessment, and solution design." },
      { from: "AE", to: "CI", trigger: "Competitor detected", description: "A competitor is identified in the deal. CI agent activates to build battlecards, positioning strategies, and win themes." },
      { from: "AE", to: "InfoSec", trigger: "Security questionnaire", description: "Customer sends a security or compliance questionnaire. InfoSec agent manages responses, coordinates with internal security teams." },
      { from: "AE", to: "SM", trigger: "Deal > $500K", description: "Deal exceeds the $500K threshold or forecast variance > 15%. Senior Manager provides strategic oversight and executive engagement." },
    ],
  },
  {
    label: "Post-Sales",
    color: "text-teal-400",
    steps: [
      { from: "AE", to: "Delivery", trigger: "Contract signed", description: "Deal closes. AE hands off the complete deal context (commitments, SLAs, stakeholder map) to Delivery for implementation planning." },
      { from: "Delivery", to: "PS", trigger: "Implementation start", description: "Delivery agent engages Professional Services for hands-on implementation, scoping workshops, and resource allocation." },
      { from: "Delivery", to: "CA", trigger: "Go-live complete", description: "System is live. Customer Architect takes over for ongoing adoption tracking, health monitoring, and expansion identification." },
      { from: "Support", to: "CA", trigger: "Pattern detected", description: "Support identifies recurring issues or usage patterns that signal architectural concerns. CA investigates for systemic resolution." },
      { from: "Support", to: "SM", trigger: "P1 on strategic account", description: "A priority-1 incident hits a strategic account. Senior Manager is alerted for executive communication and resource escalation." },
    ],
  },
  {
    label: "Governance",
    color: "text-green-400",
    steps: [
      { from: "Meeting Notes", to: "Task Shepherd", trigger: "Actions extracted", description: "Meeting Notes agent extracts action items. Task Shepherd ensures each has a single owner, due date, and clear done-criteria." },
      { from: "Meeting Notes", to: "Decision Registrar", trigger: "Decisions extracted", description: "Decisions mentioned in meetings are captured. Decision Registrar documents context, rationale, alternatives considered." },
      { from: "Meeting Notes", to: "Risk Radar", trigger: "Risks identified", description: "Meeting surfaces new risks. Risk Radar classifies severity, assigns owners, and determines if escalation is needed." },
      { from: "Risk Radar", to: "Nudger", trigger: "Escalations", description: "Risk owners have overdue mitigations. Nudger sends targeted reminders (max 1 per action per day) to drive resolution." },
      { from: "Nudger", to: "SM", trigger: "Overdue > 5 days", description: "Action remains unresolved after 5 days of reminders. Senior Manager is escalated to intervene and unblock." },
    ],
  },
];

const NAV_CARDS: { href: string; icon: LucideIcon; title: string; count: number; description: string; color: string; bg: string; border: string }[] = [
  {
    href: "/agents/profiles",
    icon: Bot,
    title: "Agent Profiles",
    count: 27,
    description: "Browse all agents by functional area. Each profile defines the agent's purpose, playbook ownership, triggers, and escalation rules.",
    color: "text-amber-400",
    bg: "bg-amber-600/10",
    border: "border-amber-600/20 hover:border-amber-500/40",
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
    count: 61,
    description: "Reusable execution units owned by agents. Each playbook encodes best practices, frameworks, and specialist knowledge for a specific task.",
    color: "text-green-400",
    bg: "bg-green-600/10",
    border: "border-green-600/20 hover:border-green-500/40",
  },
];

export default function AgentsHubPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Agents &amp; Operations</h1>
          <HelpPopover title="Agent Ecosystem">
            The EA Agentic Lab operates through a multi-agent system where each
            agent has clear responsibilities, scope boundaries, and handoff
            relationships. Agents own playbooks, collaborate through defined
            handoff chains, and are coordinated by the orchestration engine.
          </HelpPopover>
        </div>
        <p className="text-muted-foreground mt-1">
          27 agents across 9 functional areas. Each agent owns specific playbooks and collaborates through defined handoff chains.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          {HANDOFF_FLOWS.map((flow) => (
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
