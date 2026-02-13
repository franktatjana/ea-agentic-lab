"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Bot,
  Briefcase,
  Cpu,
  Handshake,
  Shield,
  Truck,
  Eye,
  Settings,
  Microscope,
  ArrowRight,
  Zap,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MetricCard } from "@/components/metric-card";
import { HelpPopover } from "@/components/help-popover";
import type { LucideIcon } from "lucide-react";

type AgentMode = "autonomous" | "human-paired";

interface AgentEntry {
  name: string;
  id: string;
  purpose: string;
  docPath: string;
  mode: AgentMode;
}

interface AgentCategory {
  label: string;
  icon: LucideIcon;
  color: string;
  description: string;
  agents: AgentEntry[];
}

const AGENT_CATEGORIES: AgentCategory[] = [
  {
    label: "Leadership",
    icon: Briefcase,
    color: "text-amber-400",
    description: "Strategic oversight, escalation resolution, product roadmap alignment.",
    agents: [
      { name: "Senior Manager", id: "senior_manager_agent", purpose: "Strategic oversight, coaching, escalation resolution", docPath: "reference/agent-profiles/leadership/senior-manager-agent.md", mode: "human-paired" },
      { name: "Product Manager", id: "pm_agent", purpose: "Product roadmap and customer alignment", docPath: "reference/agent-profiles/leadership/pm-agent.md", mode: "human-paired" },
    ],
  },
  {
    label: "Sales",
    icon: Handshake,
    color: "text-blue-400",
    description: "Commercial strategy, competitive positioning, value quantification, partner alignment.",
    agents: [
      { name: "Account Executive (AE)", id: "ae_agent", purpose: "Commercial clarity and forecast stability", docPath: "reference/agent-profiles/sales/ae-agent.md", mode: "human-paired" },
      { name: "Competitive Intelligence (CI)", id: "ci_agent", purpose: "Competitive awareness and positioning", docPath: "reference/agent-profiles/sales/ci-agent.md", mode: "human-paired" },
      { name: "Value Engineering (VE)", id: "ve_agent", purpose: "Business value quantification and tracking", docPath: "reference/agent-profiles/sales/ve-agent.md", mode: "human-paired" },
      { name: "Partner", id: "partner_agent", purpose: "Partner ecosystem alignment", docPath: "reference/agent-profiles/sales/partner-agent.md", mode: "human-paired" },
    ],
  },
  {
    label: "Architecture",
    icon: Cpu,
    color: "text-purple-400",
    description: "Technical integrity, solution design, customer-side architecture.",
    agents: [
      { name: "Solution Architect (SA)", id: "sa_agent", purpose: "Technical integrity and risk visibility", docPath: "reference/agent-profiles/architecture/sa-agent.md", mode: "human-paired" },
      { name: "Customer Architect (CA)", id: "ca_agent", purpose: "Customer-side architecture tracking", docPath: "reference/agent-profiles/architecture/ca-agent.md", mode: "human-paired" },
    ],
  },
  {
    label: "Deal Execution",
    icon: Shield,
    color: "text-orange-400",
    description: "RFP response, POC execution, security clearance processes.",
    agents: [
      { name: "RFP", id: "rfp_agent", purpose: "RFP bid strategy and response orchestration", docPath: "reference/agent-profiles/deal-execution/rfp-agent.md", mode: "human-paired" },
      { name: "POC", id: "poc_agent", purpose: "POC execution and conversion", docPath: "reference/agent-profiles/deal-execution/poc-agent.md", mode: "human-paired" },
      { name: "InfoSec", id: "infosec_agent", purpose: "Security and compliance enablement", docPath: "reference/agent-profiles/deal-execution/infosec-agent.md", mode: "human-paired" },
    ],
  },
  {
    label: "Delivery",
    icon: Truck,
    color: "text-teal-400",
    description: "Sales-to-delivery handoff, professional services, support operations.",
    agents: [
      { name: "Delivery", id: "delivery_agent", purpose: "Sales-to-delivery continuity", docPath: "reference/agent-profiles/delivery/delivery-agent.md", mode: "human-paired" },
      { name: "Professional Services (PS)", id: "ps_agent", purpose: "Pre-sales to post-sales delivery bridge", docPath: "reference/agent-profiles/delivery/ps-agent.md", mode: "human-paired" },
      { name: "Support", id: "support_agent", purpose: "Support operations and account health signals", docPath: "reference/agent-profiles/delivery/support-agent.md", mode: "human-paired" },
    ],
  },
  {
    label: "Intelligence",
    icon: Eye,
    color: "text-cyan-400",
    description: "External signal scanning, technology landscape analysis.",
    agents: [
      { name: "Tech Signal Scanner", id: "tech_signal_scanner_agent", purpose: "Scan job postings for technology signals", docPath: "reference/agent-profiles/intelligence/tech-signal-scanner-agent.md", mode: "autonomous" },
      { name: "Tech Signal Analyzer", id: "tech_signal_analyzer_agent", purpose: "Generate technology signal maps from scan data", docPath: "reference/agent-profiles/intelligence/tech-signal-analyzer-agent.md", mode: "autonomous" },
    ],
  },
  {
    label: "Governance",
    icon: Settings,
    color: "text-green-400",
    description: "Process enforcement, artifact maintenance, automated quality gates.",
    agents: [
      { name: "Meeting Notes", id: "meeting_notes_agent", purpose: "Extract actions, decisions, risks from meetings", docPath: "reference/agent-profiles/governance/meeting-notes-agent.md", mode: "autonomous" },
      { name: "Task Shepherd", id: "task_shepherd_agent", purpose: "Ensure actions have owners and due dates", docPath: "reference/agent-profiles/governance/task-shepherd-agent.md", mode: "autonomous" },
      { name: "Decision Registrar", id: "decision_registrar_agent", purpose: "Document decisions with context and rationale", docPath: "reference/agent-profiles/governance/decision-registrar-agent.md", mode: "autonomous" },
      { name: "Risk Radar", id: "risk_radar_agent", purpose: "Classify risks and assign owners", docPath: "reference/agent-profiles/governance/risk-radar-agent.md", mode: "autonomous" },
      { name: "Nudger", id: "nudger_agent", purpose: "Remind owners of overdue actions", docPath: "reference/agent-profiles/governance/nudger-agent.md", mode: "autonomous" },
      { name: "Reporter", id: "reporter_agent", purpose: "Weekly status summary generation", docPath: "reference/agent-profiles/governance/reporter-agent.md", mode: "autonomous" },
      { name: "Playbook Curator", id: "playbook_curator_agent", purpose: "Validate playbook modifications", docPath: "reference/agent-profiles/governance/playbook-curator-agent.md", mode: "autonomous" },
      { name: "Knowledge Curator", id: "knowledge_curator_agent", purpose: "Prevent semantic conflicts in artifacts", docPath: "reference/agent-profiles/governance/knowledge-curator-agent.md", mode: "autonomous" },
    ],
  },
  {
    label: "Specialists",
    icon: Microscope,
    color: "text-indigo-400",
    description: "Domain expertise routing and deep technical specialization.",
    agents: [
      { name: "Specialist Router", id: "specialist_agent", purpose: "Domain expertise engagement and routing", docPath: "reference/agent-profiles/architecture/specialist-agent.md", mode: "autonomous" },
      { name: "Security Specialist", id: "security_specialist_agent", purpose: "SIEM, threat detection, MITRE ATT&CK, SOC workflows", docPath: "reference/agent-profiles/specialists/security-specialist-agent.md", mode: "human-paired" },
      { name: "Observability Specialist", id: "observability_specialist_agent", purpose: "APM, SLO/SLI, distributed tracing, alerting", docPath: "reference/agent-profiles/specialists/observability-specialist-agent.md", mode: "human-paired" },
      { name: "Search Specialist", id: "search_specialist_agent", purpose: "Relevance tuning, vector search, RAG, schema design", docPath: "reference/agent-profiles/specialists/search-specialist-agent.md", mode: "human-paired" },
    ],
  },
  {
    label: "Meta",
    icon: Bot,
    color: "text-pink-400",
    description: "Orchestration, retrospectives, system-level coordination.",
    agents: [
      { name: "Orchestration", id: "orchestration_agent", purpose: "Process parsing, conflict detection, agent factory", docPath: "reference/agent-profiles/meta/orchestration-agent.md", mode: "autonomous" },
      { name: "Retrospective", id: "retrospective_agent", purpose: "Extract lessons learned from completed deals", docPath: "reference/agent-profiles/meta/retrospective-agent.md", mode: "autonomous" },
    ],
  },
];

const totalAgents = AGENT_CATEGORIES.reduce((sum, cat) => sum + cat.agents.length, 0);
const autonomousCount = AGENT_CATEGORIES.reduce((sum, cat) => sum + cat.agents.filter((a) => a.mode === "autonomous").length, 0);
const humanPairedCount = totalAgents - autonomousCount;

type ModeFilter = "all" | "autonomous" | "human-paired";

export default function AgentProfilesPage() {
  const [modeFilter, setModeFilter] = useState<ModeFilter>("all");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const filteredCategories = AGENT_CATEGORIES
    .map((cat) => ({
      ...cat,
      agents: modeFilter === "all" ? cat.agents : cat.agents.filter((a) => a.mode === modeFilter),
    }))
    .filter((cat) => cat.agents.length > 0);

  function scrollToCategory(label: string) {
    const el = sectionRefs.current[label];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Agent Profiles</h1>
          <HelpPopover title="Agent Profiles">
            Each agent has clear responsibilities, scope boundaries, and handoff
            relationships. Click any agent to view its full profile including
            playbook ownership, triggers, and escalation rules.
          </HelpPopover>
        </div>
        <p className="text-muted-foreground mt-1">
          {totalAgents} agents across {AGENT_CATEGORIES.length} functional areas.
          Each agent owns specific playbooks and collaborates through defined handoff chains.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Total Agents" value={totalAgents} />
        <MetricCard label="Autonomous" value={autonomousCount} />
        <MetricCard label="Human-Paired" value={humanPairedCount} />
      </div>

      <div>
        <h2 className="text-sm font-medium mb-2 flex items-center gap-1.5">
          Functional Areas ({AGENT_CATEGORIES.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2">
          {AGENT_CATEGORIES.map((cat) => (
            <Card
              key={cat.label}
              className="cursor-pointer transition-colors hover:border-primary/30"
              onClick={() => scrollToCategory(cat.label)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <cat.icon className={`h-4 w-4 ${cat.color}`} />
                    <span className="text-sm font-medium">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="secondary" className="text-[10px]">{cat.agents.length}</Badge>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                  {cat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex items-center gap-2">
        <button
          onClick={() => setModeFilter("all")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${modeFilter === "all" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"}`}
        >
          All ({totalAgents})
        </button>
        <button
          onClick={() => setModeFilter("autonomous")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${modeFilter === "autonomous" ? "bg-cyan-600/20 text-cyan-400 border border-cyan-600/30" : "text-muted-foreground hover:bg-accent/50"}`}
        >
          <Zap className="h-3 w-3" />
          Autonomous ({autonomousCount})
        </button>
        <button
          onClick={() => setModeFilter("human-paired")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${modeFilter === "human-paired" ? "bg-amber-600/20 text-amber-400 border border-amber-600/30" : "text-muted-foreground hover:bg-accent/50"}`}
        >
          <Users className="h-3 w-3" />
          Human-Paired ({humanPairedCount})
        </button>
      </div>

      <div className="space-y-6">
        {filteredCategories.map((category) => (
          <div
            key={category.label}
            ref={(el) => { sectionRefs.current[category.label] = el; }}
            className="scroll-mt-8"
          >
            <div className="flex items-center gap-2 mb-3">
              <category.icon className={`h-5 w-5 ${category.color}`} />
              <h2 className="text-lg font-semibold">{category.label}</h2>
              <Badge variant="secondary" className="text-xs">{category.agents.length}</Badge>
              <span className="text-sm text-muted-foreground ml-1">{category.description}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {category.agents.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/docs?path=${encodeURIComponent(agent.docPath)}`}
                >
                  <Card className="hover:border-accent transition-colors h-full">
                    <CardContent className="p-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{agent.name}</p>
                          <Badge
                            variant="outline"
                            className={`text-[10px] shrink-0 ${agent.mode === "autonomous" ? "border-cyan-600/30 text-cyan-400 bg-cyan-600/10" : "border-amber-600/30 text-amber-400 bg-amber-600/10"}`}
                          >
                            {agent.mode === "autonomous" ? "Auto" : "Human"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{agent.purpose}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
