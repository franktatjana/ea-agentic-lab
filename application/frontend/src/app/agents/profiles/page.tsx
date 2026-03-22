"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { HelpPopover } from "@/components/help-popover";
import {
  TEAM_STYLES,
  GOVERNANCE_STYLE,
  TEAM_TAB_ORDER,
} from "@/lib/agent-profiles-data";
import type { AgentDefinitionSummary } from "@/types";

function stripAgentSuffix(name: string) {
  return name.replace(/ Agent$/, "");
}

function firstSentence(text: string, minLength = 120): string {
  if (!text) return "";
  const sentences = text.match(/[^.!?]+[.!?]+/g);
  if (!sentences) return text.trim();
  let result = sentences[0].trim();
  for (let i = 1; i < sentences.length && result.length < minLength; i++) {
    result += " " + sentences[i].trim();
  }
  return result;
}

function buildMeta(agent: AgentDefinitionSummary): string {
  const parts: string[] = [];
  if (agent.flow_count > 0) {
    parts.push(`${agent.flow_count} runbook${agent.flow_count > 1 ? "s" : ""}`);
  }
  parts.push(agent.human_in_the_loop ? "Human-paired" : "Autonomous");
  if (agent.sub_agents.length > 0) {
    parts.push(`${agent.sub_agents.length} sub-agents`);
  }
  if (agent.escalation_target) {
    parts.push(`Escalates to ${agent.escalation_target}`);
  }
  return parts.join(" · ");
}

export default function AgentProfilesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Sales");

  const { data: allDefs, isLoading } = useQuery({
    queryKey: ["definitions"],
    queryFn: () => api.listDefinitions(),
  });

  const { teamMembers, governanceAgents, grouped } = useMemo(() => {
    if (!allDefs) return { teamMembers: [], governanceAgents: [], grouped: {} as Record<string, AgentDefinitionSummary[]> };

    const subAgentIds = new Set<string>();
    for (const d of allDefs) {
      for (const sa of d.sub_agents ?? []) {
        if (typeof sa === "object" && sa.id) subAgentIds.add(sa.id);
      }
    }

    const members = allDefs.filter(
      (d) => d.has_profile && d.category !== "Governance" && !subAgentIds.has(d.id)
    );
    const governance = allDefs.filter((d) => d.category === "Governance");

    const byCategory: Record<string, AgentDefinitionSummary[]> = {};
    for (const m of members) {
      if (!byCategory[m.category]) byCategory[m.category] = [];
      byCategory[m.category].push(m);
    }

    return { teamMembers: members, governanceAgents: governance, grouped: byCategory };
  }, [allDefs]);

  const tabs = [
    ...TEAM_TAB_ORDER.map((cat) => {
      const style = TEAM_STYLES[cat];
      return { label: style.label, icon: style.icon, color: style.color, category: cat };
    }),
    {
      label: GOVERNANCE_STYLE.label,
      icon: GOVERNANCE_STYLE.icon,
      color: GOVERNANCE_STYLE.color,
      category: "Governance",
    },
  ];

  const isGovernance = activeTab === GOVERNANCE_STYLE.label;
  const activeCategory = isGovernance
    ? "Governance"
    : TEAM_TAB_ORDER.find((cat) => TEAM_STYLES[cat]?.label === activeTab) ?? activeTab;
  const activeStyle = isGovernance ? GOVERNANCE_STYLE : TEAM_STYLES[activeCategory];
  const activeAgents = isGovernance ? governanceAgents : (grouped[activeCategory] ?? []);

  const totalRoles = teamMembers.length;
  const totalAgents = allDefs?.length ?? 0;
  const autonomous = allDefs?.filter((d) => !d.human_in_the_loop).length ?? 0;
  const humanPaired = allDefs?.filter((d) => d.human_in_the_loop).length ?? 0;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-20 text-center text-muted-foreground">
        Loading profiles...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Agent Profiles</h1>
          <HelpPopover title="Agent Profiles">
            Each role mirrors a real job function. Roles with complex processes
            decompose into specialist agents. See DDR-021 for the taxonomy.
          </HelpPopover>
        </div>
        <p className="text-[15px] text-muted-foreground mt-1">
          {totalRoles} roles across {TEAM_TAB_ORDER.length} functional areas,
          backed by {totalAgents} agents including sub-agents and system
          functions.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Roles" value={totalRoles} />
        <MetricCard
          label="Total Agents"
          value={totalAgents}
          onClick={() => router.push("/agents/definitions")}
        />
        <MetricCard label="Autonomous" value={autonomous} description="Agents that operate independently without human-in-the-loop review" />
        <MetricCard label="Human-Paired" value={humanPaired} description="Agents that require human review or approval before acting" />
      </div>

      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.label
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className={`h-4 w-4 ${tab.color}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeStyle && !isGovernance && (
        <div>
          <div className={`rounded-lg border ${activeStyle.border} bg-muted/50 px-4 py-3 mb-5`}>
            <p className={`text-sm ${activeStyle.color}`}>{activeStyle.summary}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeAgents.map((agent) => (
              <Link key={agent.id} href={`/agents/profiles/${agent.id}`}>
                <Card
                  className={`h-full border-l-4 ${activeStyle.border} hover:border-accent hover:border-l-4 transition-colors`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {stripAgentSuffix(agent.name)}
                      </h3>
                      <ArrowRight className="h-4 w-4 text-blue-500 dark:text-amber-400 shrink-0 mt-1" />
                    </div>
                    <div className="space-y-1.5 mb-3">
                      <div className="flex gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-blue-400 shrink-0 mt-0.5 w-10">Role</span>
                        <p className="text-[15px] text-muted-foreground leading-relaxed">
                          {agent.role_context
                            ? firstSentence(agent.role_context)
                            : String(agent.description).split(".").filter(Boolean).slice(0, 2).join(".").trim() + "."}
                        </p>
                      </div>
                      {agent.goals_summary && (
                        <div className="flex gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-emerald-400 shrink-0 mt-0.5 w-10">Goal</span>
                          <p className="text-[15px] text-muted-foreground leading-relaxed">
                            {firstSentence(agent.goals_summary)}
                          </p>
                        </div>
                      )}
                      {agent.why && (
                        <div className="flex gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-amber-400 shrink-0 mt-0.5 w-10">Why</span>
                          <p className="text-[15px] text-muted-foreground leading-relaxed">
                            {firstSentence(agent.why)}
                          </p>
                        </div>
                      )}
                      {agent.human_matters_summary && (
                        <div className="flex gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-purple-400 shrink-0 mt-0.5 w-10">Human</span>
                          <p className="text-[15px] text-muted-foreground leading-relaxed">
                            {firstSentence(agent.human_matters_summary)}
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground/50">
                      {buildMeta(agent)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {isGovernance && (
        <div>
          <p className="text-[15px] text-muted-foreground mb-5">
            {GOVERNANCE_STYLE.summary}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {governanceAgents.map((agent) => (
              <Link key={agent.id} href={`/agents/profiles/${agent.id}`}>
                <Card className="h-full border-l-4 border-l-green-400 hover:border-accent hover:border-l-4 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-[15px] font-semibold">
                        {stripAgentSuffix(agent.name)}
                      </h3>
                      <ArrowRight className="h-3.5 w-3.5 text-blue-500 dark:text-amber-400 shrink-0 mt-1" />
                    </div>
                    <p className="text-[15px] text-muted-foreground leading-relaxed mb-3">
                      {agent.description}
                    </p>
                    <p className="text-xs text-muted-foreground/50">
                      {buildMeta(agent)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
