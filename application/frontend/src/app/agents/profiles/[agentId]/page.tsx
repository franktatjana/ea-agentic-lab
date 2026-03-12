"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, redirect } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Users,
  FileCode2,
  Zap,
  ChevronDown,
  Bot,
  LayoutList,
  ListChecks,
  Briefcase,
  Target,
  Network,
  BookOpen,
  Library,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Crosshair,
  UserCheck,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { TEAM_STYLES } from "@/lib/agent-profiles-data";
import type {
  AgentProfile,
  AgentDefinitionSummary,
  ProfilePlaybookEntry,
  ChallengeEntry,
  OverheadEntry,
  StakeholderEntry,
} from "@/types";

function Section({
  icon: Icon,
  title,
  color,
  children,
}: {
  icon: React.ElementType;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        <Icon className={`h-4 w-4 ${color}`} />
        {title}
      </h2>
      {children}
    </div>
  );
}

function formatAgentId(id: string): string {
  return id
    .replace(/-agent$/, "")
    .replace(/^ae-/, "")
    .replace(/-/g, " ")
    .split(" ")
    .map((w) => w.length <= 3 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function challengeText(entry: ChallengeEntry): string {
  return typeof entry === "string" ? entry : entry.text;
}
function challengeAgent(entry: ChallengeEntry): string | undefined {
  return typeof entry === "string" ? undefined : entry.solved_by;
}
function overheadText(entry: OverheadEntry): string {
  return typeof entry === "string" ? entry : entry.text;
}
function overheadAgent(entry: OverheadEntry): string | undefined {
  return typeof entry === "string" ? undefined : entry.automated_by;
}
function stakeholderText(entry: StakeholderEntry): string {
  return typeof entry === "string" ? entry : entry.role;
}
function stakeholderAgent(entry: StakeholderEntry): string | undefined {
  return typeof entry === "string" ? undefined : entry.connected_via;
}

function AgentBadge({ agentId }: { agentId: string }) {
  return (
    <Link
      href={`/agents/definitions?agent=${agentId}`}
      className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-purple-400/10 text-purple-400 hover:bg-purple-400/20 transition-colors whitespace-nowrap shrink-0"
      onClick={(e) => e.stopPropagation()}
    >
      <Bot className="h-3 w-3" />
      {formatAgentId(agentId)}
    </Link>
  );
}

const EXPAND_THRESHOLD = 5;

function ExpandableList<T>({
  header,
  items,
  renderItem,
}: {
  header?: React.ReactNode;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, EXPAND_THRESHOLD);
  const remaining = items.length - EXPAND_THRESHOLD;

  return (
    <div>
      {header}
      <ul className="space-y-2">
        {visible.map((item, i) => renderItem(item, i))}
      </ul>
      {remaining > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
          {expanded ? "Show less" : `Show ${remaining} more`}
        </button>
      )}
    </div>
  );
}

function ExpandableListCard({
  icon,
  title,
  summary,
  listLabel,
  borderClass,
  titleClass,
  items,
  renderItem,
}: {
  icon: React.ReactNode;
  title: string;
  summary?: string;
  listLabel?: string;
  borderClass: string;
  titleClass: string;
  items: string[];
  renderItem: (item: string, index: number) => React.ReactNode;
}) {
  return (
    <Card className={`border-l-4 ${borderClass}`}>
      <CardContent className="p-7">
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h3 className={`text-xs font-semibold uppercase tracking-wider ${titleClass}`}>
            {title}
          </h3>
        </div>
        {summary && (
          <p className="text-[15px] leading-[1.8] text-foreground/90 mb-5">
            {summary}
          </p>
        )}
        <ExpandableList
          header={listLabel ? (
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2.5">
              {listLabel}
            </p>
          ) : undefined}
          items={items}
          renderItem={renderItem}
        />
      </CardContent>
    </Card>
  );
}

type ProfileTab = "overview" | "role" | "operations" | "knowledge" | "sub-agents" | "playbooks" | "collaboration";

export default function AgentProfileDetailPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");

  const { data: def, isLoading } = useQuery({
    queryKey: ["definition", agentId],
    queryFn: () => api.getDefinition(agentId),
  });

  const { data: allDefs } = useQuery({
    queryKey: ["definitions"],
    queryFn: () => api.listDefinitions(),
  });

  const subAgentLookup = useMemo(() => {
    if (!allDefs) return {} as Record<string, AgentDefinitionSummary>;
    const map: Record<string, AgentDefinitionSummary> = {};
    for (const d of allDefs) map[d.id] = d;
    return map;
  }, [allDefs]);

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto py-20 text-center text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  if (!def) {
    return (
      <div className="max-w-[1400px] mx-auto py-20 text-center">
        <p className="text-muted-foreground mb-4">
          Profile not found for &quot;{agentId}&quot;.
        </p>
        <Link
          href="/agents/profiles"
          className="text-sm text-blue-400 hover:underline"
        >
          Back to profiles
        </Link>
      </div>
    );
  }

  // Extract x-ea-agent extension
  const ext = (def as unknown as Record<string, unknown>)["x-ea-agent"] as
    | Record<string, unknown>
    | undefined;

  // Profile data
  const profile = ext?.profile as AgentProfile | undefined;
  const profileWhy = profile?.why ?? "";
  const humanMattersSummary = profile?.human_matters_summary ?? "";
  const goalsSummary = profile?.goals_summary ?? "";
  const profileGoals = profile?.goals ?? [];
  const roleContext = profile?.role_context ?? "";
  const challenges = profile?.challenges ?? [];
  const adminOverhead = profile?.administrative_overhead ?? [];
  const capabilities = profile?.capabilities ?? [];
  const withThisAgent = profile?.with_this_agent ?? [];
  const activityMap = profile?.activity_map;
  const qualFramework = profile?.qualification_framework;
  const stakeholders = profile?.stakeholder_landscape;
  const publicResources = profile?.public_resources ?? [];
  const subAgents = profile?.sub_agents ?? [];
  const playbookRaci = profile?.playbook_raci;

  // Agent operational data
  const escalation = ext?.escalation_triggers as string[] | undefined;
  const handoffs = ext?.handoffs as Record<string, unknown> | undefined;
  const deferTo = handoffs?.defer_to as Record<string, string> | undefined;
  const provideTo = handoffs?.provide_to as Record<string, string> | undefined;
  const humanEscalation = handoffs?.human_escalation as string | undefined;

  const responsibility = def.metadata?.responsibility as string | undefined;
  const parentAgent = def.metadata?.parent_agent as string | undefined;

  // Sub-agents don't have profiles, redirect to definitions
  if (parentAgent) {
    redirect(`/agents/definitions?agent=${agentId}`);
  }

  const isHumanPaired = def.human_in_the_loop;
  const roleName = def.name.replace(/ Agent$/, "");

  // Team styling from category
  const category = (def as unknown as Record<string, unknown>)._category as
    | string
    | undefined;
  const teamStyle = category ? TEAM_STYLES[category] : undefined;
  const dotColor = teamStyle?.dot ?? "bg-muted-foreground";



  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link
            href="/agents/profiles"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Profiles
          </Link>
          {parentAgent && (
            <>
              <span>/</span>
              <Link
                href={`/agents/profiles/${parentAgent}`}
                className="hover:text-foreground transition-colors"
              >
                {formatAgentId(parentAgent)}
              </Link>
            </>
          )}
        </div>
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-2xl font-bold">{roleName}</h1>
            <div className="flex items-center gap-2">
              {parentAgent && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-400/15 text-purple-400 border border-purple-400/20">
                  Sub-agent
                </span>
              )}
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                isHumanPaired
                  ? "bg-blue-400/15 text-blue-400 border-blue-400/20"
                  : "bg-emerald-400/15 text-emerald-400 border-emerald-400/20"
              }`}>
                {isHumanPaired ? "Human-paired" : "Autonomous"}
              </span>
            </div>
          </div>
          {responsibility && (
            <p className="text-muted-foreground leading-relaxed max-w-3xl">
              {responsibility}
            </p>
          )}
        </div>
      </div>

      {/* Section navigation stripe */}
      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === "overview"
              ? "bg-blue-500/15 text-blue-400 shadow-sm"
              : "text-muted-foreground hover:text-blue-400"
          }`}
        >
          <LayoutList className="h-4 w-4" />
          Overview
        </button>
        {(challenges.length > 0 || adminOverhead.length > 0 || stakeholders) && (
          <button
            onClick={() => setActiveTab("role")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === "role"
                ? `bg-amber-500/15 text-amber-400 shadow-sm`
                : "text-muted-foreground hover:text-amber-400"
            }`}
          >
            <Target className="h-4 w-4" />
            Role
          </button>
        )}
        {(withThisAgent.length > 0 || capabilities.length > 0 || (activityMap && activityMap.domains.length > 0)) && (
          <button
            onClick={() => setActiveTab("operations")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === "operations"
                ? "bg-emerald-500/15 text-emerald-400 shadow-sm"
                : "text-muted-foreground hover:text-emerald-400"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Operations
            {activityMap && activityMap.domains.length > 0 && (
              <span className="text-xs opacity-60 ml-0.5">
                {activityMap.domains.length}
              </span>
            )}
          </button>
        )}
        {(qualFramework || stakeholders || publicResources.length > 0) && (
          <button
            onClick={() => setActiveTab("knowledge")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === "knowledge"
                ? "bg-cyan-500/15 text-cyan-400 shadow-sm"
                : "text-muted-foreground hover:text-cyan-400"
            }`}
          >
            <Library className="h-4 w-4" />
            Knowledge
          </button>
        )}
        {subAgents.length > 0 && (
          <button
            onClick={() => setActiveTab("sub-agents")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === "sub-agents"
                ? "bg-purple-500/15 text-purple-400 shadow-sm"
                : "text-muted-foreground hover:text-purple-400"
            }`}
          >
            <Bot className="h-4 w-4" />
            Sub-agents
            <span className="text-xs opacity-60 ml-0.5">
              {subAgents.length}
            </span>
          </button>
        )}
        {playbookRaci && (
          <button
            onClick={() => setActiveTab("playbooks")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === "playbooks"
                ? "bg-orange-500/15 text-orange-400 shadow-sm"
                : "text-muted-foreground hover:text-orange-400"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Playbooks
          </button>
        )}
        {(deferTo || provideTo || escalation) && (
          <button
            onClick={() => setActiveTab("collaboration")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === "collaboration"
                ? "bg-rose-500/15 text-rose-400 shadow-sm"
                : "text-muted-foreground hover:text-rose-400"
            }`}
          >
            <Users className="h-4 w-4" />
            Collaboration
          </button>
        )}
        <Link
          href={`/agents/definitions?agent=${agentId}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors text-muted-foreground hover:text-slate-400"
        >
          <FileCode2 className="h-4 w-4" />
          Open Agent Definition
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Overview tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Row 1: About This Role + Why */}
              {(profileWhy || roleContext) && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {roleContext && (
                    <Card className={`${profileWhy ? "md:col-span-2" : "md:col-span-5"} border-l-4 ${teamStyle ? teamStyle.border + "/50" : "border-l-muted-foreground/50"}`}>
                      <CardContent className="p-7">
                        <div className="flex items-center gap-2 mb-4">
                          <Users className={`h-4 w-4 ${teamStyle?.color ?? "text-muted-foreground"}`} />
                          <h3 className={`text-xs font-semibold uppercase tracking-wider ${teamStyle?.color ?? "text-muted-foreground"}`}>
                            About This Role
                          </h3>
                        </div>
                        <div className="space-y-3 text-[15px] leading-[1.8] text-foreground/80">
                          {roleContext.split("\n").filter(Boolean).map((para, i) => (
                            <p key={i}>{para.trim()}</p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {profileWhy && (
                    <Card className="md:col-span-3 border-l-4 border-l-blue-500/50 bg-blue-500/[0.03]">
                      <CardContent className="p-7">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="h-4 w-4 text-blue-400" />
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                            Purpose
                          </h3>
                        </div>
                        <p className="text-[15px] leading-[1.8] text-foreground/90 mb-5">
                          {profileWhy}
                        </p>
                        <ul className="space-y-3">
                          {String(def.description).trim()
                            .split(/\.\s+/)
                            .filter(Boolean)
                            .map((point, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-[15px]">
                              <span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                              <span className="text-foreground/85 leading-[1.7]">
                                {point.charAt(0).toUpperCase() + point.slice(1).replace(/\.$/, "")}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Row 2: Goals + Why Human Matters */}
              {(profileGoals.length > 0 || isHumanPaired) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profileGoals.length > 0 && (
                    <ExpandableListCard
                      icon={<Crosshair className="h-4 w-4 text-emerald-400" />}
                      title="Goals"
                      summary={goalsSummary}
                      listLabel="What good looks like"
                      borderClass="border-l-emerald-500/50"
                      titleClass="text-emerald-400"
                      items={profileGoals}
                      renderItem={(goal, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[15px]">
                          <CheckCircle2 className="h-4 w-4 mt-[2px] text-emerald-400 shrink-0" />
                          <span className="text-foreground/90">{goal}</span>
                        </li>
                      )}
                    />
                  )}
                  {isHumanPaired && (
                    <Card className="border-l-4 border-l-purple-500/50">
                      <CardContent className="p-7">
                        <div className="flex items-center gap-2 mb-4">
                          <UserCheck className="h-4 w-4 text-purple-400" />
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                            Human Role
                          </h3>
                        </div>
                        {humanMattersSummary && (
                          <p className="text-[15px] leading-[1.8] text-foreground/90 mb-4">
                            {humanMattersSummary}
                          </p>
                        )}
                        {escalation && escalation.length > 0 && (
                          <ExpandableList
                            header={
                              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2.5">
                                The agent escalates when
                              </p>
                            }
                            items={escalation}
                            renderItem={(trigger, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm">
                                <ShieldAlert className="h-3.5 w-3.5 mt-[3px] text-red-400 shrink-0" />
                                <span className="text-foreground/80">{trigger}</span>
                              </li>
                            )}
                          />
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Row 3: Key Responsibilities (full-width horizontal grid) */}
              {activityMap && activityMap.domains.length > 0 && (
                <Card>
                  <CardContent className="p-7">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">
                      Key Responsibilities
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                      {activityMap.domains.map((d) => (
                        <Link
                          key={d.domain}
                          href={`/agents/definitions?agent=${d.agent}`}
                          className="block"
                        >
                          <div className="rounded-lg border border-border/50 p-4 hover:border-border hover:bg-muted/30 transition-colors h-full">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`h-2 w-2 rounded-full ${dotColor} shrink-0`} />
                              <span className="text-sm font-medium text-foreground">
                                {d.domain}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed text-muted-foreground mb-2">
                              {d.why}
                            </p>
                            <AgentBadge agentId={d.agent} />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
        </div>
      )}

      {/* Role tab */}
      {activeTab === "role" && (
        <div className="space-y-6">
          {challenges.length > 0 && (() => {
            const hasAgents = challenges.some((ch) => challengeAgent(ch));
            if (hasAgents) {
              const grouped = challenges.reduce<Record<string, ChallengeEntry[]>>((acc, ch) => {
                const agent = challengeAgent(ch) ?? "_ungrouped";
                if (!acc[agent]) acc[agent] = [];
                acc[agent].push(ch);
                return acc;
              }, {});
              return (
                <Section
                  icon={AlertTriangle}
                  title={`Role Challenges & Overhead (${challenges.length})`}
                  color="text-red-400"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(grouped).map(([agent, items]) => (
                      <div key={agent} className="rounded-xl border border-border/50 bg-muted/30 p-4">
                        {agent !== "_ungrouped" && (
                          <div className="mb-3">
                            <AgentBadge agentId={agent} />
                          </div>
                        )}
                        <ul className="space-y-2">
                          {items.map((ch, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-[14px]">
                              <span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                              <span className="text-foreground/90 leading-relaxed">{challengeText(ch)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </Section>
              );
            }
            return (
              <Card className="border-l-4 border-l-red-500/40">
                <CardContent className="p-6">
                  <Section
                    icon={AlertTriangle}
                    title={`Role Challenges (${challenges.length})`}
                    color="text-red-400"
                  >
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                      {challenges.map((ch, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-[15px]">
                          <span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                          <span className="text-foreground/80 leading-relaxed">{challengeText(ch)}</span>
                        </li>
                      ))}
                    </ul>
                  </Section>
                </CardContent>
              </Card>
            );
          })()}

        </div>
      )}

      {/* Operations tab */}
      {activeTab === "operations" && (withThisAgent.length > 0 || capabilities.length > 0 || activityMap) && (
        <div className="space-y-6">
          {(withThisAgent.length > 0 || capabilities.length > 0) && (
            <Card
              className={`border-l-4 ${teamStyle ? teamStyle.border + "/50" : "border-l-muted-foreground/50"}`}
            >
              <CardContent className="p-6">
                <Section
                  icon={Bot}
                  title="With This Agent You Can"
                  color={teamStyle?.color ?? "text-muted-foreground"}
                >
                  {withThisAgent.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 pr-4 text-xs font-medium uppercase tracking-wider text-muted-foreground w-[220px]">Category</th>
                            <th className="text-left py-2 pr-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">What You Can Do</th>
                            {withThisAgent.some((g) => g.agent) && (
                              <th className="text-left py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground w-[180px]">Agent</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {withThisAgent.map((group) =>
                            group.items.map((item, idx) => {
                              const colonIdx = item.indexOf(":");
                              const keyword = colonIdx > -1 ? item.slice(0, colonIdx) : null;
                              const rest = colonIdx > -1 ? item.slice(colonIdx + 1).trim() : item;
                              return (
                                <tr key={`${group.domain}-${idx}`} className={idx === group.items.length - 1 ? "border-b border-border" : ""}>
                                  {idx === 0 && (
                                    <td rowSpan={group.items.length} className="py-2.5 pr-4 align-top text-foreground/70 font-medium text-[13px]">
                                      {group.domain}
                                    </td>
                                  )}
                                  <td className="py-2.5 pr-4 leading-relaxed">
                                    {keyword && <span className="font-semibold text-foreground">{keyword}:</span>}{" "}
                                    <span className="text-foreground/80">{rest}</span>
                                  </td>
                                  {idx === 0 && withThisAgent.some((g) => g.agent) && (
                                    <td rowSpan={group.items.length} className="py-2.5 align-top">
                                      {group.agent && <AgentBadge agentId={group.agent} />}
                                    </td>
                                  )}
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
                      {capabilities.map((cap: string) => (
                        <li key={cap} className="flex items-start gap-2.5 text-[15px]">
                          <span className={`mt-[8px] h-1.5 w-1.5 rounded-full ${dotColor} shrink-0`} />
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>
              </CardContent>
            </Card>
          )}

          {activityMap && (
            <Card>
              <CardContent className="p-5">
                <p className="text-[15px] text-muted-foreground leading-relaxed">
                  {activityMap.purpose}
                </p>
              </CardContent>
            </Card>
          )}

          {activityMap && activityMap.domains.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activityMap.domains.map((d) => {
              const contributors = d.contributing_agents ?? [];
              return (
                <Card
                  key={d.domain}
                  className="border-l-4 border-l-purple-400/50 cursor-pointer hover:border-l-purple-400 transition-colors"
                  onClick={() => router.push(`/agents/profiles/${d.agent}`)}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium">{d.domain}</h3>
                      <span className="text-xs text-muted-foreground/60 shrink-0">{d.cadence}</span>
                    </div>
                    <p className="text-[15px] text-muted-foreground leading-relaxed">{d.why}</p>
                    <ul className="space-y-1.5">
                      {d.activities.map((a) => (
                        <li key={a} className="flex items-start gap-2 text-sm">
                          <span className={`mt-[7px] h-1.5 w-1.5 rounded-full ${dotColor} shrink-0`} />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center gap-1.5 pt-1">
                      <AgentBadge agentId={d.agent} />
                      <ArrowRight className="h-3 w-3 text-purple-400" />
                    </div>
                    {contributors.length > 0 && (
                      <div className="border-t border-border/50 pt-2 space-y-1">
                        {contributors.map((c) => (
                          <div key={c.agent} className="flex items-start gap-2 text-xs text-muted-foreground/70">
                            <span className="shrink-0 mt-px">+</span>
                            <span className="flex items-center gap-1.5 flex-wrap">
                              <AgentBadge agentId={c.agent} />
                              <span>{c.provides}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          )}

        </div>
      )}

      {/* Knowledge tab */}
      {activeTab === "knowledge" && (
        <div className="space-y-6">
          {qualFramework && (
            <Card>
              <CardContent className="p-5">
                <Section
                  icon={Library}
                  title={qualFramework.name}
                  color={teamStyle?.color ?? "text-muted-foreground"}
                >
                  {qualFramework.note && (
                    <p className="text-xs text-muted-foreground mb-4">
                      {qualFramework.note}
                    </p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {qualFramework.dimensions.map((dim) => (
                      <div key={`${dim.letter}-${dim.name}`} className="bg-muted/30 rounded-md p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-muted-foreground">{dim.letter}</span>
                          <span className="text-sm font-medium">{dim.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{dim.description}</p>
                        {dim.supported_by && (
                          <div className="mt-1">
                            <AgentBadge agentId={dim.supported_by} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              </CardContent>
            </Card>
          )}

          {stakeholders && (
            <Card>
              <CardContent className="p-5">
                <Section
                  icon={Network}
                  title="Stakeholder Landscape"
                  color="text-muted-foreground"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {stakeholders.customer_side && stakeholders.customer_side.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Customer Side</p>
                        <ul className="space-y-1.5">
                          {stakeholders.customer_side.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-[15px] text-muted-foreground">
                              <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                              <span className="flex-1">
                                <span>{stakeholderText(s)}</span>
                                {stakeholderAgent(s) && (
                                  <AgentBadge agentId={stakeholderAgent(s)!} />
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {stakeholders.internal_team && stakeholders.internal_team.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Internal Team</p>
                        <ul className="space-y-1.5">
                          {stakeholders.internal_team.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-[15px] text-muted-foreground">
                              <span className={`mt-[7px] h-1.5 w-1.5 rounded-full ${dotColor}/50 shrink-0`} />
                              <span className="flex-1">
                                <span>{stakeholderText(s)}</span>
                                {stakeholderAgent(s) && (
                                  <AgentBadge agentId={stakeholderAgent(s)!} />
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Section>
              </CardContent>
            </Card>
          )}

          {publicResources.length > 0 && (
            <Card className="border-l-4 border-l-cyan-500/40">
              <CardContent className="p-5">
                <Section
                  icon={BookOpen}
                  title="Public Resources"
                  color="text-cyan-400"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {publicResources.map((r, i) => (
                      <a
                        key={i}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group rounded-lg border border-border/50 p-4 hover:border-cyan-500/40 hover:bg-cyan-500/[0.03] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-sm font-medium text-foreground group-hover:text-cyan-400 transition-colors">
                            {r.title}
                          </span>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-cyan-400 shrink-0 mt-0.5 transition-colors" />
                        </div>
                        {r.context && (
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {r.context}
                          </p>
                        )}
                      </a>
                    ))}
                  </div>
                </Section>
              </CardContent>
            </Card>
          )}

        </div>
      )}

      {/* Sub-agents tab */}
      {activeTab === "sub-agents" && subAgents.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subAgents.map((sa) => {
              const meta = sa.id ? subAgentLookup[sa.id] : undefined;
              return (
                <Card
                  key={sa.name}
                  className={`border-l-4 border-l-purple-400/50 ${sa.id ? "cursor-pointer hover:border-l-purple-400 transition-colors" : ""}`}
                  onClick={() => {
                    if (sa.id) router.push(`/agents/profiles/${sa.id}`);
                  }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-purple-400 shrink-0" />
                        <h3 className="font-medium">{sa.name}</h3>
                      </div>
                      {sa.id && <ArrowRight className="h-3.5 w-3.5 text-blue-500 dark:text-amber-400 shrink-0 mt-0.5" />}
                    </div>
                    <p className="text-[15px] text-muted-foreground leading-relaxed">
                      {sa.purpose}
                    </p>
                    {meta && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
                        {meta.flow_count > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-400">
                            {meta.flow_count} flow{meta.flow_count > 1 ? "s" : ""}
                          </span>
                        )}
                        {meta.tool_count > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400">
                            {meta.tool_count} tool{meta.tool_count > 1 ? "s" : ""}
                          </span>
                        )}
                        {meta.prompt_count > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400">
                            {meta.prompt_count} prompt{meta.prompt_count > 1 ? "s" : ""}
                          </span>
                        )}
                        {meta.knowledge_ref_count > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400">
                            {meta.knowledge_ref_count} knowledge ref{meta.knowledge_ref_count > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground/60 text-center pt-2">
            Each agent is atomic, self-contained, and independently deployable. Described in YAML specifications, portable across runtimes and platforms.
          </p>
        </div>
      )}

      {/* Playbooks tab */}
      {activeTab === "playbooks" && playbookRaci && (() => {
        const RaciEntry = ({ p }: { p: ProfilePlaybookEntry }) => {
          const isClickable = p.team && p.file;
          const content = (
            <div className={`bg-muted/30 rounded-md p-3 ${isClickable ? "hover:bg-muted/50 transition-colors" : ""}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{p.playbook}</p>
                {isClickable && <ArrowRight className="h-3 w-3 text-blue-500 dark:text-amber-400 shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{p.scope}</p>
            </div>
          );
          if (isClickable) {
            return (
              <Link href={`/playbooks/view?team=${encodeURIComponent(p.team!)}&file=${encodeURIComponent(p.file!)}`}>
                {content}
              </Link>
            );
          }
          return content;
        };

        const RaciSection = ({ title, description, entries, borderColor, textColor }: {
          title: string; description: string; entries: ProfilePlaybookEntry[];
          borderColor: string; textColor: string;
        }) => (
          <Card className={`border-l-4 ${borderColor}`}>
            <CardContent className="p-5">
              <Section icon={BookOpen} title={title} color={textColor}>
                <p className="text-xs text-muted-foreground mb-3">{description}</p>
                <div className="space-y-2">
                  {entries.map((p) => <RaciEntry key={p.playbook} p={p} />)}
                </div>
              </Section>
            </CardContent>
          </Card>
        );

        return (
          <div className="space-y-6">
            {playbookRaci.context && (
              <Card>
                <CardContent className="p-5">
                  <p className="text-[15px] text-muted-foreground leading-relaxed">
                    {playbookRaci.context}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {playbookRaci.responsible && playbookRaci.responsible.length > 0 && (
                <RaciSection
                  title="Responsible"
                  description="Owns execution and delivers the outcome"
                  entries={playbookRaci.responsible}
                  borderColor="border-l-blue-400/50"
                  textColor="text-blue-400"
                />
              )}
              {playbookRaci.accountable && playbookRaci.accountable.length > 0 && (
                <RaciSection
                  title="Accountable"
                  description="Approves the outcome, ultimate decision authority"
                  entries={playbookRaci.accountable}
                  borderColor="border-l-green-400/50"
                  textColor="text-green-400"
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {playbookRaci.consulted && playbookRaci.consulted.length > 0 && (
                <RaciSection
                  title="Consulted"
                  description="Provides input before decisions are made"
                  entries={playbookRaci.consulted}
                  borderColor="border-l-amber-400/50"
                  textColor="text-amber-400"
                />
              )}
              {playbookRaci.informed && playbookRaci.informed.length > 0 && (
                <RaciSection
                  title="Informed"
                  description="Notified of outcomes for downstream actions"
                  entries={playbookRaci.informed}
                  borderColor="border-l-muted-foreground/30"
                  textColor="text-muted-foreground"
                />
              )}
            </div>
          </div>
        );
      })()}

      {/* Collaboration tab */}
      {activeTab === "collaboration" && (
        <div className="space-y-6">
          {/* Escalation triggers */}
          {escalation && escalation.length > 0 && (
            <Card className="border-l-4 border-l-amber-400/50">
              <CardContent className="p-5">
                <Section
                  icon={AlertTriangle}
                  title={`Escalation Triggers${humanEscalation ? ` (default: ${humanEscalation})` : ""}`}
                  color="text-amber-400"
                >
                  <ul className="space-y-2">
                    {escalation.map((e, i) => {
                      const text =
                        typeof e === "string" ? e : JSON.stringify(e);
                      return (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-sm"
                        >
                          <ShieldAlert className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                          <span>{text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </Section>
              </CardContent>
            </Card>
          )}

          {/* Defers to + Provides to side by side */}
          {(deferTo || provideTo) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deferTo && Object.keys(deferTo).length > 0 && (
                <Card className="border-l-4 border-l-purple-400/50">
                  <CardContent className="p-5">
                    <Section
                      icon={ArrowRight}
                      title="Defers To"
                      color="text-purple-400"
                    >
                      <div className="space-y-3">
                        {Object.entries(deferTo).map(([agent, val]) => {
                          const info = val as unknown as Record<string, unknown>;
                          const scope = typeof val === "string" ? val : (info?.scope as string) ?? "";
                          const scenarios = (info?.scenarios as Array<Record<string, string>>) ?? [];
                          return (
                            <div
                              key={agent}
                              className="text-sm bg-muted/30 rounded-md p-4"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <AgentBadge agentId={agent.replace(/_/g, "-")} />
                              </div>
                              {scope && (
                                <p className="text-muted-foreground ml-0 mb-2">{scope}</p>
                              )}
                              {scenarios.length > 0 && (
                                <ul className="ml-[22px] space-y-1.5">
                                  {scenarios.map((s, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                      <Zap className="h-3 w-3 text-amber-400/60 shrink-0 mt-0.5" />
                                      <span>{s.trigger}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </Section>
                  </CardContent>
                </Card>
              )}
              {provideTo && Object.keys(provideTo).length > 0 && (
                <Card className="border-l-4 border-l-teal-400/50">
                  <CardContent className="p-5">
                    <Section
                      icon={ArrowRight}
                      title="Provides To"
                      color="text-teal-400"
                    >
                      <div className="space-y-2">
                        {Object.entries(provideTo).map(([agent, val]) => {
                          const scope = typeof val === "string" ? val : ((val as Record<string, unknown>)?.scope as string) ?? "";
                          return (
                            <div
                              key={agent}
                              className="flex items-start gap-2.5 text-sm bg-muted/30 rounded-md p-3"
                            >
                              <div className="flex items-center gap-2 flex-wrap">
                                <AgentBadge agentId={agent.replace(/_/g, "-")} />
                                {scope && (
                                  <span className="text-muted-foreground text-sm">
                                    {scope}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Section>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}


    </div>
  );
}
