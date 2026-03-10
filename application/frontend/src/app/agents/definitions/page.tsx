"use client";

import { useState, useCallback, useEffect, useMemo, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Bot,
  ArrowLeft,
  ArrowRight,
  FileCode2,
  Workflow,
  Wrench,
  BookText,
  ShieldCheck,
  Brain,
  ChevronDown,
  ChevronRight,
  Users,
  MessageSquare,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Sparkles,
  UserCheck,
  ShieldOff,
  FileText,
  Handshake,
  Cpu,
  Eye,
  Briefcase,
  Truck,
  Settings,
  Target,
  Cog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { MetricCard } from "@/components/metric-card";
import { HelpPopover } from "@/components/help-popover";
import { YamlContentViewer } from "@/components/yaml-content-viewer";
import { nodeTypes } from "@/components/flow/nodes";
import { buildFlowGraph, buildOrchestrationGraph, classifyRoutingSeverity, type RoutingRule } from "@/lib/flow/transform-definition";
import type { AgentDefinition, AgentDefinitionSummary } from "@/types";

const ROLE_ACRONYMS = /\b(Ae|Sa|Ca|Pm|Ve|Ci|Rfp|Poc|Pov|Csp|Ii|Aci|Mna|Adr|Qbr|Ebr|Nps|Csat)\b/g;
function titleCase(s: string): string {
  return s.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()).replace(ROLE_ACRONYMS, m => m.toUpperCase());
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function PromptCard({
  promptKey,
  entry,
  isActive,
  onClick,
}: {
  promptKey: string;
  entry: Record<string, unknown>;
  isActive?: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`bg-muted/50 rounded-md p-3 cursor-pointer hover:bg-muted/80 transition-colors ${isActive ? "ring-1 ring-primary/40 bg-muted/80" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <BookText className="h-3 w-3 text-amber-400 shrink-0" />
        <span className="text-xs font-mono font-medium">{promptKey}</span>
      </div>
      {entry.description ? (
        <p className="text-xs text-muted-foreground leading-relaxed">{String(entry.description)}</p>
      ) : null}
    </div>
  );
}

function PromptFlyoutContent({
  agentId,
  promptKey,
  entry,
}: {
  agentId: string;
  promptKey: string;
  entry: Record<string, unknown>;
}) {
  const { data: promptContent, isLoading } = useQuery({
    queryKey: ["prompt-content", agentId, promptKey],
    queryFn: () => api.getPromptContent(agentId, promptKey),
  });

  const inputs = entry.inputs as Array<Record<string, unknown>> | undefined;
  const outputs = entry.outputs as Array<Record<string, unknown>> | undefined;
  const requiresData = entry.requires_data as Array<Record<string, unknown>> | undefined;

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2 text-sm">
          <BookText className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="font-mono">{promptKey}</span>
        </SheetTitle>
        {entry.description ? (
          <SheetDescription>{String(entry.description)}</SheetDescription>
        ) : null}
      </SheetHeader>

      <div className="px-4 pb-4 space-y-4">
        {entry.source ? (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Source</h4>
            <p className="text-xs font-mono text-muted-foreground bg-muted/50 rounded px-2 py-1.5 break-all">{String(entry.source)}</p>
          </div>
        ) : null}

        {Array.isArray(inputs) && inputs.length > 0 ? (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Inputs</h4>
            <ul className="space-y-0.5">
              {inputs.map((inp, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-baseline gap-1.5">
                  <span className="font-mono font-medium text-foreground">{String(inp.title)}</span>
                  <span className="text-muted-foreground/60">{String(inp.type)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {Array.isArray(outputs) && outputs.length > 0 ? (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Outputs</h4>
            <ul className="space-y-0.5">
              {outputs.map((out, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-baseline gap-1.5">
                  <span className="font-mono font-medium text-foreground">{String(out.title)}</span>
                  <span className="text-muted-foreground/60">{String(out.type)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {Array.isArray(requiresData) && requiresData.length > 0 ? (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Data Dependencies</h4>
            <ul className="space-y-2">
              {requiresData.map((dep, i) => (
                <li key={i} className="bg-muted/30 rounded px-2.5 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-medium text-foreground">{String(dep.source)}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${dep.priority === "critical" ? "bg-red-400/10 text-red-400 border border-red-400/20" : "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"}`}>
                      {String(dep.priority)}
                    </span>
                  </div>
                  {Array.isArray(dep.fields) ? (
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">{(dep.fields as string[]).join(", ")}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prompt</h4>
            {promptContent?.prompt ? (
              <CopyButton text={String(promptContent.prompt)} />
            ) : null}
          </div>
          {isLoading ? (
            <p className="text-xs text-muted-foreground py-3 text-center">Loading prompt...</p>
          ) : promptContent?.error ? (
            <p className="text-xs text-red-400 py-2">{String(promptContent.error)}</p>
          ) : promptContent?.prompt ? (
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/50 rounded-md p-3 max-h-80 overflow-y-auto leading-relaxed">
              {String(promptContent.prompt)}
            </pre>
          ) : (
            <p className="text-xs text-muted-foreground py-2">No prompt content resolved</p>
          )}
        </div>

        {promptContent && !promptContent.error && !promptContent.prompt ? (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Resolved Content</h4>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/50 rounded-md p-3 max-h-80 overflow-y-auto leading-relaxed">
              {JSON.stringify(promptContent, null, 2)}
            </pre>
          </div>
        ) : null}
      </div>
    </>
  );
}





function KnowledgeFlyoutContent({ knowledgeRef }: { knowledgeRef: Record<string, unknown> }) {
  const content = knowledgeRef.content as Record<string, unknown> | undefined;

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2 text-sm">
          <BookText className="h-4 w-4 text-amber-400 shrink-0" />
          {String(knowledgeRef.name ?? knowledgeRef.path)}
        </SheetTitle>
        {knowledgeRef.description ? (
          <SheetDescription>{String(knowledgeRef.description)}</SheetDescription>
        ) : null}
      </SheetHeader>

      <div className="px-4 pb-6">
        {knowledgeRef.path ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
            <FileText className="h-3 w-3 shrink-0" />
            <span className="font-mono">{String(knowledgeRef.path)}</span>
          </div>
        ) : null}

        {content && typeof content === "object" ? (
          <div className="mt-4">
            <YamlContentViewer data={content} />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/60 mt-3">Content served by the Knowledge Q&amp;A Service at retrieval time based on agent scope and workflow step context.</p>
        )}
      </div>
    </>
  );
}

function DefinitionCard({
  def,
  onSelect,
}: {
  def: AgentDefinitionSummary;
  onSelect: () => void;
}) {
  return (
    <Card
      className="cursor-pointer hover:border-primary/30 transition-colors"
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <FileCode2 className="h-4 w-4 text-purple-400" />
            <span className="font-semibold text-sm">{def.name}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            v{String((def.metadata as Record<string, unknown>)?.definition_version ?? "1")}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {def.description}
        </p>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs border-blue-600/30 text-blue-400 bg-blue-600/10">
            {def.flow_count} flows
          </Badge>
          <Badge variant="outline" className="text-xs border-green-600/30 text-green-400 bg-green-600/10">
            {def.tool_count} tools
          </Badge>
          <Badge variant="outline" className="text-xs border-amber-600/30 text-amber-400 bg-amber-600/10">
            {def.prompt_count} prompts
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function CollapsibleSection({
  title,
  icon: Icon,
  defaultOpen = false,
  count,
  extra,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  count?: number;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-2.5 text-left hover:bg-accent/50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{title}</span>
          {count !== undefined && (
            <Badge variant="secondary" className="text-xs">{count}</Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {extra}
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1">
          {children}
        </div>
      )}
    </div>
  );
}

function FlowGraph({
  def,
  expandedFlowId,
  onFlowClick,
  onPromptClick,
  colorMode,
  subAgentMeta,
}: {
  def: AgentDefinition;
  expandedFlowId: string | null;
  onFlowClick: (flowId: string | null) => void;
  onPromptClick?: (promptKey: string) => void;
  colorMode: "dark" | "light";
  subAgentMeta?: { id: string; prompt_count: number }[];
}) {
  const { fitView } = useReactFlow();

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildFlowGraph(def, expandedFlowId, subAgentMeta),
    [def, expandedFlowId, subAgentMeta],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
  }, [initialNodes, initialEdges, setNodes, setEdges, fitView]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === "flowNode") {
      onFlowClick(expandedFlowId === node.id ? null : node.id);
    } else if (node.type === "promptNode" && onPromptClick) {
      const promptKey = (node.data as Record<string, unknown>)?.promptKey as string | undefined;
      if (promptKey) onPromptClick(promptKey);
    }
  }, [expandedFlowId, onFlowClick, onPromptClick]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      nodesDraggable
      nodesConnectable={false}
      elementsSelectable
      zoomOnScroll
      panOnDrag
      minZoom={0.3}
      maxZoom={2}
      proOptions={{ hideAttribution: false }}
      colorMode={colorMode}
    >
      <Background gap={20} size={1} />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

function OrchestrationGraph({
  def,
  routingRules,
  colorMode,
  subAgentMeta,
  severityFilter,
}: {
  def: AgentDefinition;
  routingRules: RoutingRule[];
  colorMode: "dark" | "light";
  subAgentMeta?: { id: string; flow_count: number }[];
  severityFilter: string | null;
}) {
  const { fitView } = useReactFlow();
  const router = useRouter();

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const agentId = (node.data as Record<string, unknown>)?.agentId as string | undefined;
    if (agentId) router.push(`/agents/definitions?agent=${agentId}`);
  }, [router]);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildOrchestrationGraph(def, routingRules, subAgentMeta),
    [def, routingRules, subAgentMeta],
  );

  const filteredEdges = useMemo(() => {
    if (!severityFilter) return initialEdges;
    return initialEdges.map((edge) => {
      const sev = (edge.data as Record<string, unknown> | undefined)?.severity;
      if (!sev || sev === severityFilter) return edge;
      return { ...edge, style: { ...edge.style, opacity: 0.1 }, animated: false };
    });
  }, [initialEdges, severityFilter]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setEdges(filteredEdges);
  }, [filteredEdges, setEdges]);

  useEffect(() => {
    setTimeout(() => fitView({ padding: 0.15, duration: 300 }), 50);
  }, [fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      nodesDraggable
      nodesConnectable={false}
      elementsSelectable
      zoomOnScroll
      panOnDrag
      minZoom={0.3}
      maxZoom={2}
      proOptions={{ hideAttribution: false }}
      colorMode={colorMode}
    >
      <Background gap={20} size={1} />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

function DefinitionDetail({
  agentId,
  onBack,
}: {
  agentId: string;
  onBack: () => void;
}) {
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [activePromptKey, setActivePromptKey] = useState<string | null>(null);
  const [activeKnowledgeIdx, setActiveKnowledgeIdx] = useState<number | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const flowColorMode = resolvedTheme === "light" ? "light" : "dark";

  const { data: def, isLoading } = useQuery({
    queryKey: ["definition", agentId],
    queryFn: () => api.getDefinition(agentId),
  });

  const { data: allDefinitions } = useQuery({
    queryKey: ["definitions"],
    queryFn: () => api.listDefinitions(),
  });

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground py-12 text-center">
        Loading definition...
      </div>
    );
  }

  if (!def) {
    return (
      <div className="text-sm text-muted-foreground py-12 text-center">
        Definition not found
      </div>
    );
  }

  const ext = def["x-ea-agent"];
  const promptRegistry = ext?.prompt_registry as Record<string, Record<string, unknown>> | undefined;
  const boundaries = ext?.boundaries as Array<string | Record<string, unknown>> | undefined;
  const permissions = ext?.permissions as string[] | undefined;
  const escalation = ext?.escalation_triggers as Array<string | Record<string, unknown>> | undefined;
  const memory = ext?.memory as Record<string, unknown> | undefined;
  const quality = ext?.quality as Record<string, unknown> | undefined;
  const knowledge = ext?.knowledge as Record<string, unknown> | undefined;
  const knowledgeScope = knowledge?.scope as Record<string, unknown> | undefined;
  const knowledgeDomains = (knowledgeScope?.domains ?? []) as string[];
  const knowledgeArchetypes = (knowledgeScope?.archetypes ?? []) as string[];
  const knowledgeRefs = (knowledge as Record<string, unknown>)?.references as Array<Record<string, unknown>> | undefined;
  const context = ext?.context as Record<string, unknown> | undefined;
  const autonomy = ext?.autonomy as Record<string, unknown> | undefined;
  const isOrchestrator = autonomy?.role === "orchestrator" || autonomy?.role === "near_pure_router";
  const routingRules = (autonomy?.reactive_routing ?? []) as RoutingRule[];
  const cascadeLimits = autonomy?.cascade_limits as Record<string, unknown> | undefined;

  const handoffs = ext?.handoffs as Record<string, unknown> | undefined;
  const deferTo = handoffs?.defer_to as Record<string, unknown> | undefined;
  const provideTo = handoffs?.provide_to as Record<string, unknown> | undefined;
  const humanEscalation = handoffs?.human_escalation as string | undefined;
  const assets = ext?.assets as Array<Record<string, unknown>> | undefined;

  const profile = ext?.profile as Record<string, unknown> | undefined;
  const subAgentsDef = (profile?.sub_agents ?? ext?.sub_agents) as Array<Record<string, unknown>> | undefined;
  const peerAgentsDef = (profile?.peer_agents ?? ext?.peer_agents) as Array<Record<string, unknown>> | undefined;

  const humanMattersSummary = profile?.human_matters_summary as string | undefined;
  const humanMattersGoal = profile?.human_matters_goal as string | undefined;
  const profileWhy = profile?.why as string | undefined;
  const goalsSummary = profile?.goals_summary as string | undefined;
  const rawChallenges = (profile?.challenges ?? []) as Array<string | Record<string, string>>;
  const challenges = rawChallenges.map((c) => (typeof c === "string" ? { text: c } : c));
  const rawOverhead = (profile?.administrative_overhead ?? []) as Array<string | Record<string, string>>;
  const adminOverhead = rawOverhead.map((a) => (typeof a === "string" ? { text: a } : a));
  const scenarios = (profile?.scenarios ?? []) as Array<{
    problem: string;
    why?: string;
    agent: string;
    agent_response: string;
    success_signal?: { metric?: string; target?: string; leading_indicator?: string; failure_signal?: string };
  }>;
  const a2aCapabilities = ((def.a2a as Record<string, unknown>)?.agent_card as Record<string, unknown>)?.capabilities as string[] | undefined;
  const parentAgent = def.metadata?.parent_agent as string | undefined;
  const isHumanPaired = def.human_in_the_loop;
  const responsibility = def.metadata?.responsibility as string | undefined;

  const llm = def.llm_configuration || {};
  const flowCount = def.flows?.length ?? 0;
  const toolCount = def.tools?.length ?? 0;
  const promptCount = Object.keys(promptRegistry ?? {}).length;
  const variantCount = def.specialized_agents?.length ?? 0;

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        {parentAgent && (
          <>
            <span className="text-muted-foreground/40">/</span>
            <Link
              href={`/agents/profiles/${parentAgent}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {titleCase(parentAgent).replace(/ Agent$/, "")} Profile
            </Link>
          </>
        )}
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-1">{def.name}</h1>
        {responsibility && (
          <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">{responsibility}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
          <span>v{String((def.metadata as Record<string, unknown>)?.definition_version ?? "0.1.0")}</span>
          <span>Spec {def.agentspec_version}</span>
          {isHumanPaired && <span className="text-blue-400">HITL</span>}
          {parentAgent && <span className="text-purple-400">Sub-agent</span>}
          <span className="flex items-center gap-1"><Workflow className="h-3 w-3" /> {flowCount} {flowCount === 1 ? "runbook" : "runbooks"}</span>
          <span className="flex items-center gap-1"><Wrench className="h-3 w-3" /> {toolCount} {toolCount === 1 ? "tool" : "tools"}</span>
          <span className="flex items-center gap-1"><FileCode2 className="h-3 w-3" /> {promptCount} {promptCount === 1 ? "prompt" : "prompts"}</span>
          {variantCount > 0 && <span>{variantCount} variant{variantCount !== 1 ? "s" : ""}</span>}
        </div>
      </div>

      {/* Identity cards: always visible above tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-muted/50 rounded-lg border border-blue-500/20 p-4">
          <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Why This Agent Exists
          </h3>
          <p className="text-xs text-foreground/85 leading-relaxed">
            {(() => { const t = profileWhy ?? String(def.description); const m = t.match(/(?<=[a-z])\.\s+(?=[A-Z])/); if (!m || m.index === undefined) return t; const i = m.index; return <>{t.slice(0, i + 1)}<br /><br />{t.slice(i + m[0].length)}</>; })()}
          </p>
          {goalsSummary && (
            <p className="text-xs text-blue-400/80 dark:text-blue-300/70 italic mt-2">{goalsSummary}</p>
          )}
        </div>
        {isHumanPaired && (humanMattersSummary || humanMattersGoal) && (
          <div className="bg-muted/50 rounded-lg border border-purple-500/20 p-4">
            <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <UserCheck className="h-3 w-3" /> Why the Human Matters
            </h3>
            {humanMattersSummary && (
              <p className="text-xs text-foreground/85 leading-relaxed">
                {(() => { const t = humanMattersSummary; const m = t.match(/(?<=[a-z])\.\s+(?=[A-Z])/); if (!m || m.index === undefined) return t; const i = m.index; return <>{t.slice(0, i + 1)}<br /><br />{t.slice(i + m[0].length)}</>; })()}
              </p>
            )}
            {humanMattersGoal && (
              <p className="text-xs text-purple-400/80 dark:text-purple-300/70 italic mt-2">{humanMattersGoal}</p>
            )}
          </div>
        )}
      </div>

      {/* Showcase disclaimer */}
      <div className="flex items-start gap-2 px-3 py-2 rounded-lg border border-amber-500/20 bg-amber-500/5 text-xs text-muted-foreground leading-relaxed">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
        <span>
          <span className="font-medium text-amber-400">Showcase only.</span>{" "}
          This definition is a reference example, not a production-ready agent configuration.
          Review, validate, and adapt before any operational use. No liability assumed.
        </span>
      </div>

      {/* Tabs: Runbooks (hero) | Capabilities | Guardrails | System Prompt */}
      <Tabs defaultValue={isOrchestrator && routingRules.length > 0 ? "orchestration" : flowCount > 0 ? "runbooks" : "capabilities"} className="w-full">
        <TabsList className="w-full justify-start">
          {isOrchestrator && routingRules.length > 0 && <TabsTrigger value="orchestration">Orchestration</TabsTrigger>}
          {flowCount > 0 && <TabsTrigger value="runbooks">Runbooks</TabsTrigger>}
          {(scenarios.length > 0 || challenges.length > 0 || adminOverhead.length > 0 || (escalation && escalation.length > 0) || (a2aCapabilities && a2aCapabilities.length > 0)) && (
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          )}
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          {(deferTo || provideTo) && <TabsTrigger value="interactions">Interactions</TabsTrigger>}
          <TabsTrigger value="guardrails">Guardrails</TabsTrigger>
          <TabsTrigger value="system-prompt">System Prompt</TabsTrigger>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => {
                const link = document.createElement("a");
                link.href = `/api/v1/definitions/${def.id}/raw`;
                link.download = `${def.id}-definition.yaml`;
                link.click();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors"
              title="Download definition YAML only"
            >
              <FileCode2 className="h-3.5 w-3.5" />
              YAML
            </button>
            <button
              onClick={() => {
                const link = document.createElement("a");
                link.href = `/api/v1/definitions/${def.id}/bundle`;
                link.download = `${def.id}-bundle.zip`;
                link.click();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors"
              title="Download ZIP with definition, prompts, references, and skills"
            >
              <Download className="h-3.5 w-3.5" />
              Bundle
            </button>
          </div>
        </TabsList>

        {/* Runbooks tab: flow graph hero + flow cards */}
        {flowCount > 0 && (
          <TabsContent value="runbooks" className="space-y-3 mt-3">
            <div>
              <div className="flex items-center justify-end mb-2">
                <span className="text-xs text-muted-foreground">Click a runbook to expand its prompt chain</span>
              </div>
              {/* Flow canvas */}
              <div className="h-[500px] rounded-xl border border-border bg-background overflow-hidden">
                <ReactFlowProvider>
                  <FlowGraph def={def} expandedFlowId={activeFlowId} onFlowClick={setActiveFlowId} onPromptClick={(key) => { if (promptRegistry?.[key]) setActivePromptKey(key); }} colorMode={flowColorMode} subAgentMeta={allDefinitions?.map((d) => ({ id: d.id, prompt_count: d.prompt_count }))} />
                </ReactFlowProvider>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {(def.flows ?? []).map((flow, i) => {
                const flowExt = (flow["x-ea-agent"] ?? {}) as Record<string, unknown>;
                const steps = flowExt.workflow_shorthand as Array<Record<string, unknown>> | undefined;
                const isActive = activeFlowId === flow.id;
                return (
                  <Card
                    key={i}
                    className={`h-fit cursor-pointer transition-all ${isActive ? "border-primary ring-1 ring-primary/30" : "hover:border-primary/20"} ${activeFlowId && !isActive ? "opacity-40" : ""}`}
                    onClick={() => setActiveFlowId(isActive ? null : flow.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Workflow className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primary" : "text-blue-400"}`} />
                        <span className="text-xs font-medium truncate">{flow.name}</span>
                      </div>
                      {flow.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{flow.description}</p>
                      )}
                      {Array.isArray(steps) && (
                        <div className="space-y-1">
                          {steps.map((step, j) => (
                            <div key={j} className="flex items-start gap-2 text-xs">
                              <Badge variant="outline" className="text-xs shrink-0 mt-0.5">
                                {String(step.step)}
                              </Badge>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-medium">{String(step.description ?? step.action ?? "")}</span>
                                  {step.on_failure ? (
                                    <span className={`text-[10px] px-1 py-0 rounded shrink-0 ${
                                      step.on_failure === "stop"
                                        ? "bg-red-400/10 text-red-400"
                                        : "bg-amber-400/10 text-amber-400"
                                    }`}>{String(step.on_failure).replace(/_/g, " ")}</span>
                                  ) : null}
                                </div>
                                {step.prompt ? (
                                  <button
                                    type="button"
                                    className="text-muted-foreground hover:text-amber-400 font-mono text-xs truncate block transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (promptRegistry && promptRegistry[String(step.prompt)]) {
                                        setActivePromptKey(String(step.prompt));
                                      }
                                    }}
                                    title="Click to view prompt"
                                  >
                                    {String(step.prompt)}
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        )}

        {/* Orchestration tab: routing diagram + rule cards */}
        {isOrchestrator && routingRules.length > 0 && (
          <TabsContent value="orchestration" className="space-y-4 mt-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 text-xs">
                  {([
                    { key: "info", label: "Info flow", color: "bg-blue-500", text: "text-blue-400" },
                    { key: "warning", label: "Gap/risk", color: "bg-amber-500", text: "text-amber-400" },
                    { key: "critical", label: "Critical", color: "bg-red-500", text: "text-red-400" },
                  ] as const).map(({ key, label, color, text }) => (
                    <button
                      key={key}
                      onClick={() => setSeverityFilter((prev) => prev === key ? null : key)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
                        severityFilter === key
                          ? `${text} bg-muted border border-current/20`
                          : severityFilter === null
                            ? "text-muted-foreground hover:text-foreground"
                            : "text-muted-foreground/40 hover:text-muted-foreground"
                      }`}
                    >
                      <span className={`w-2 h-0.5 ${color} inline-block rounded ${severityFilter && severityFilter !== key ? "opacity-30" : ""}`} />
                      {label}
                    </button>
                  ))}
                </div>
                {cascadeLimits && (
                  <span className="text-xs text-muted-foreground">
                    Max depth: {String(cascadeLimits.max_depth)}, max agents/chain: {String(cascadeLimits.max_agents_per_chain)}
                  </span>
                )}
              </div>
              <div className="h-[550px] rounded-xl border border-border bg-background overflow-hidden">
                <ReactFlowProvider>
                  <OrchestrationGraph
                    def={def}
                    routingRules={routingRules}
                    colorMode={flowColorMode}
                    subAgentMeta={allDefinitions?.map((d) => ({ id: d.id, flow_count: d.flow_count }))}
                    severityFilter={severityFilter}
                  />
                </ReactFlowProvider>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Workflow className="h-3 w-3" /> Routing Rules
                <HelpPopover title="Routing Rules">Reactive rules that fire when a sub-agent detects a signal. Each rule defines a source, target, trigger condition, and context to forward.</HelpPopover>
              </h3>
              <div className="rounded-md border border-border/50 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/50 text-muted-foreground">
                      <th className="text-left px-3 py-1.5 font-medium">Source</th>
                      <th className="text-left px-3 py-1.5 font-medium w-6" />
                      <th className="text-left px-3 py-1.5 font-medium">Target</th>
                      <th className="text-left px-3 py-1.5 font-medium">Condition</th>
                      <th className="text-left px-3 py-1.5 font-medium hidden lg:table-cell">Context</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routingRules.map((rule, i) => {
                      const sev = classifyRoutingSeverity(rule);
                      const dimmed = severityFilter !== null && sev !== severityFilter;
                      const watchStr = Array.isArray(rule.watch) ? rule.watch.join(", ") : String(rule.watch ?? "");
                      const sourceName = titleCase(watchStr.replace(/-agent/g, "").replace(/ae-/g, ""));
                      const targetName = titleCase(rule.route_to.replace(/-agent$/, "").replace(/^ae-/, ""));
                      return (
                        <tr key={i} className={`border-t border-border/30 transition-colors ${dimmed ? "opacity-20" : "hover:bg-muted/30"}`}>
                          <td className="px-3 py-1.5 font-medium text-blue-400 whitespace-nowrap">{sourceName}</td>
                          <td className="px-0 py-1.5 text-muted-foreground/40"><ArrowRight className="h-3 w-3" /></td>
                          <td className="px-3 py-1.5 font-medium text-emerald-400 whitespace-nowrap">{targetName}</td>
                          <td className="px-3 py-1.5 text-muted-foreground">
                            <span className="font-mono text-amber-400/80">{rule.true}</span>
                          </td>
                          <td className="px-3 py-1.5 hidden lg:table-cell">
                            {rule.context_forward.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {rule.context_forward.map((ctx, j) => (
                                  <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                    {ctx.replace(/_/g, " ")}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        )}

        {/* Scenarios tab: challenges, admin overhead, escalation */}
        <TabsContent value="scenarios" className="space-y-8 mt-4">
          {/* Scenario cards: Problem → Agent Response → Outcome */}
          {scenarios.length > 0 && scenarios.map((s, i) => {
            const relatedOverhead = adminOverhead.filter((a) =>
              a.automated_by ? a.automated_by === s.agent : s.agent === agentId
            );
            const responseSteps = s.agent_response.split(/\.\s+/).filter(Boolean).map((step) =>
              step.endsWith(".") ? step : `${step}.`
            );
            return (
              <div key={i}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Scenario {i + 1}</span>
                  {s.agent !== agentId && (
                    <Link
                      href={`/agents/definitions?agent=${s.agent}`}
                      className="text-xs bg-purple-500/10 border border-purple-500/30 rounded-md px-2 py-1 text-purple-400 hover:bg-purple-500/20 transition-colors"
                    >
                      {titleCase(s.agent.replace(/-agent$/, ""))}
                    </Link>
                  )}
                </div>
                <div className={`grid items-stretch gap-0 ${relatedOverhead.length > 0 ? "grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]" : "grid-cols-[1fr_auto_1fr_auto_1fr]"}`}>
                  {/* Problem + Why */}
                  <div className="bg-muted/50 rounded-xl border border-red-500/20 p-5 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-semibold text-red-400">Problem</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed font-medium">{s.problem}</p>
                    {s.why && (
                      <p className="text-sm text-muted-foreground leading-relaxed mt-2">{s.why}</p>
                    )}
                  </div>
                  <div className="flex items-center px-2"><ArrowRight className="h-5 w-5 text-blue-500 dark:text-yellow-400" /></div>
                  {/* Agent Response as list */}
                  <div className="bg-muted/50 rounded-xl border border-blue-500/20 p-5 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-semibold text-blue-400">Agent Response</span>
                    </div>
                    <ul className="space-y-2">
                      {responseSteps.map((step, si) => (
                        <li key={si} className="flex items-start gap-2 text-sm text-foreground leading-relaxed">
                          <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Overhead Eliminated (only if there are related items) */}
                  {relatedOverhead.length > 0 && (<>
                    <div className="flex items-center px-2"><ArrowRight className="h-5 w-5 text-blue-500 dark:text-yellow-400" /></div>
                    <div className="bg-muted/50 rounded-xl border border-green-500/15 border-dashed p-5 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-semibold text-green-400">Overhead Eliminated</span>
                      </div>
                      <ul className="space-y-2">
                        {relatedOverhead.map((a, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-foreground/90 leading-relaxed">
                            <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-green-400 shrink-0" />
                            {a.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>)}
                  <div className="flex items-center px-2"><ArrowRight className="h-5 w-5 text-blue-500 dark:text-yellow-400" /></div>
                  {/* Outcome: Success + Escalation */}
                  <div className="bg-muted/50 rounded-xl border border-green-500/20 p-5 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldCheck className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-semibold text-green-400">Outcome</span>
                    </div>
                    {s.success_signal && (
                      <div className="space-y-2">
                        {s.success_signal.metric && (
                          <p className="text-sm text-foreground leading-relaxed">{s.success_signal.metric}</p>
                        )}
                        {s.success_signal.target && (
                          <p className="text-sm text-green-400 font-medium">{s.success_signal.target}</p>
                        )}
                        {s.success_signal.leading_indicator && (
                          <p className="text-sm text-muted-foreground">{s.success_signal.leading_indicator}</p>
                        )}
                      </div>
                    )}
                    {s.success_signal?.failure_signal && (
                      <div className="pt-3 border-t border-border/50 mt-3">
                        <p className="text-xs text-amber-400 uppercase tracking-wide font-medium mb-2">Escalates when</p>
                        <p className="text-sm text-foreground/90 flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 mt-[2px] text-amber-400 shrink-0" />
                          {s.success_signal.failure_signal}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Fallback: no scenarios but has challenges/overhead/escalation → 3 boxes */}
          {scenarios.length === 0 && (challenges.length > 0 || adminOverhead.length > 0 || (escalation && escalation.length > 0)) && (
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-0">
              {/* Problems */}
              <div className="bg-muted/50 rounded-xl border border-red-500/20 p-5 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="text-sm font-semibold text-red-400">Problems</span>
                </div>
                <ul className="space-y-2">
                  {challenges.map((c, ci) => (
                    <li key={ci} className="flex items-start gap-2 text-sm text-foreground/90">
                      <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                      <span>
                        {c.text}
                        {c.solved_by && (
                          <Link
                            href={`/agents/definitions?agent=${c.solved_by}`}
                            className="ml-1.5 text-xs text-purple-400 hover:underline"
                          >
                            {titleCase(c.solved_by.replace(/-agent$/, ""))}
                          </Link>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center px-2"><ArrowRight className="h-5 w-5 text-blue-500 dark:text-yellow-400" /></div>
              {/* Agent handles it */}
              <div className="bg-muted/50 rounded-xl border border-blue-500/20 p-5 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-semibold text-blue-400">Agent Handles</span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed mb-3">
                  {parentAgent
                    ? "This agent monitors, analyzes, and acts on each problem automatically."
                    : "Sub-agents monitor, analyze, and act on each problem automatically."}
                </p>
                {adminOverhead.length > 0 && (
                  <div className="pt-3 border-t border-border/50">
                    <p className="text-xs text-green-400 uppercase tracking-wide font-medium mb-2">Overhead eliminated</p>
                    <ul className="space-y-1.5">
                      {adminOverhead.map((a, ai) => (
                        <li key={ai} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-green-400 shrink-0" />
                          <span>
                            {a.text}
                            {a.automated_by && (
                              <Link
                                href={`/agents/definitions?agent=${a.automated_by}`}
                                className="ml-1.5 text-xs text-purple-400 hover:underline"
                              >
                                {titleCase(a.automated_by.replace(/-agent$/, ""))}
                              </Link>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex items-center px-2"><ArrowRight className="h-5 w-5 text-blue-500 dark:text-yellow-400" /></div>
              {/* Outcome: success + escalation */}
              <div className="bg-muted/50 rounded-xl border border-green-500/20 p-5 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-semibold text-green-400">Outcome</span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {parentAgent
                    ? "Problems detected early, overhead automated, AE focused on judgment calls."
                    : "Problems resolved, overhead removed, human focused on high-judgment decisions."}
                </p>
                {escalation && escalation.length > 0 && (
                  <div className="pt-3 border-t border-border/50 mt-3">
                    <p className="text-xs text-amber-400 uppercase tracking-wide font-medium mb-2">Escalates when</p>
                    <ul className="space-y-1.5">
                      {escalation.map((trigger, ti) => (
                        <li key={ti} className="flex items-start gap-2 text-sm text-foreground/90">
                          <AlertTriangle className="h-4 w-4 mt-[2px] text-amber-400 shrink-0" />
                          {typeof trigger === "string" ? trigger : String((trigger as Record<string, unknown>).trigger ?? trigger)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fallback for sub-agents without any scenario data */}
          {a2aCapabilities && a2aCapabilities.length > 0 && challenges.length === 0 && scenarios.length === 0 && (
            <div className="bg-muted/50 rounded-xl border border-blue-500/20 p-5">
              <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">
                Capabilities
              </h4>
              <ul className="space-y-2">
                {a2aCapabilities.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                    <span className="text-foreground/90 leading-relaxed">
                      {c.replace(/-/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase())}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        {/* Capabilities tab */}
        <TabsContent value="capabilities" className="space-y-6 mt-3">

          {/* ── Tools | Prompts | Knowledge in 3 columns ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            {/* Tools */}
            <div>
              <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Wrench className="h-3 w-3" /> Tools
              </h3>
              <div className="space-y-1.5">
                {(def.tools ?? []).map((tool, i) => (
                  <div key={i} className="bg-muted/50 rounded-md p-2.5">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Wrench className="h-3 w-3 text-green-400 shrink-0" />
                      <span className="text-xs font-medium truncate">{tool.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{tool.description ?? ""}</p>
                  </div>
                ))}
                {toolCount === 0 && (
                  <p className="text-xs text-muted-foreground">No tools defined</p>
                )}
              </div>
            </div>

            {/* Prompts */}
            <div>
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileCode2 className="h-3 w-3" /> Prompts
              </h3>
              <div className="space-y-1.5">
                {promptCount > 0 ? Object.entries(promptRegistry!).map(([key, entry]) => (
                  <PromptCard
                    key={key}
                    promptKey={key}
                    entry={entry}
                    isActive={activePromptKey === key}
                    onClick={() => setActivePromptKey(key)}
                  />
                )) : (
                  <p className="text-xs text-muted-foreground">No prompts defined</p>
                )}
              </div>
            </div>

            {/* Knowledge */}
            <div>
              <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BookText className="h-3 w-3" /> Knowledge
              </h3>
              <div className="space-y-1.5">
                {knowledgeRefs && knowledgeRefs.length > 0 ? knowledgeRefs.map((ref, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveKnowledgeIdx(i)}
                    className="w-full bg-muted/50 rounded-md p-2.5 text-left hover:bg-muted/80 hover:border-amber-500/30 border border-transparent transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-2">
                      <BookText className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground group-hover:text-amber-400 transition-colors truncate">
                          {String(ref.name ?? ref.path)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{String(ref.description ?? "")}</p>
                      </div>
                    </div>
                  </button>
                )) : (
                  <p className="text-xs text-muted-foreground">No knowledge references</p>
                )}
              </div>
              <Sheet open={activeKnowledgeIdx !== null} onOpenChange={(open) => { if (!open) setActiveKnowledgeIdx(null); }}>
                <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
                  {activeKnowledgeIdx !== null && knowledgeRefs?.[activeKnowledgeIdx] ? (
                    <KnowledgeFlyoutContent knowledgeRef={knowledgeRefs[activeKnowledgeIdx]} />
                  ) : null}
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* ── Sub-agents, Peer Agents, Assets ── */}
          {/* Sub-agents (from x-ea-agent) */}
          {subAgentsDef && subAgentsDef.length > 0 && (
            <div id="sub-agents-section">
              <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Bot className="h-3 w-3" /> Sub-agents
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {subAgentsDef.map((sa, i) => (
                  <Link
                    key={i}
                    href={`/agents/definitions?agent=${sa.id ?? ""}`}
                    className="bg-muted/50 rounded-md p-2.5 hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Bot className="h-3 w-3 text-purple-400 shrink-0" />
                      <span className="text-xs font-medium truncate">{String(sa.name ?? sa.id ?? "")}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{String(sa.purpose ?? "")}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Peer Agents (from x-ea-agent.profile) */}
          {peerAgentsDef && peerAgentsDef.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Bot className="h-3 w-3" /> Peer Agents
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {peerAgentsDef.map((pa, i) => (
                  <Link
                    key={i}
                    href={`/agents/definitions?agent=${pa.id ?? ""}`}
                    className="bg-muted/50 rounded-md p-2.5 hover:bg-muted/80 transition-colors border border-blue-500/20"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Bot className="h-3 w-3 text-blue-400 shrink-0" />
                      <span className="text-xs font-medium truncate">{String(pa.name ?? pa.id ?? "")}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{String(pa.purpose ?? "")}</p>
                    {pa.relationship ? (
                      <p className="text-xs text-blue-400/70 mt-1 truncate">{String(pa.relationship)}</p>
                    ) : null}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Assets */}
          {assets && assets.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Download className="h-3 w-3" /> Generated Assets
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {assets.map((asset, i) => (
                  <div key={i} className="bg-muted/50 rounded-md p-2.5">
                    <span className="text-xs font-medium font-mono">{String(asset.id ?? asset.name ?? "")}</span>
                    {asset.description ? (
                      <p className="text-xs text-muted-foreground mt-0.5">{String(asset.description)}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

        </TabsContent>

        {/* Interactions tab: handoffs */}
        {(deferTo || provideTo) && (
        <TabsContent value="interactions" className="space-y-4 mt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {deferTo && Object.keys(deferTo).length > 0 && (
              <div className="bg-muted/50 rounded-lg border border-blue-500/20 p-3">
                <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ArrowRight className="h-3 w-3" /> Defers To
                  <HelpPopover title="Defers To">Agents this one routes work to when a task falls outside its expertise. Includes trigger scenarios that initiate the handoff.</HelpPopover>
                </h3>
                <div className="space-y-2">
                  {Object.entries(deferTo).map(([agentKey, val]) => {
                    const info = val as Record<string, unknown>;
                    const scope = typeof val === "string" ? val : (info?.scope as string) ?? "";
                    const scenarios = (info?.scenarios as Array<Record<string, string>>) ?? [];
                    return (
                      <div key={agentKey} className="text-xs">
                        <div className="flex items-center gap-1.5">
                          <ArrowRight className="h-3 w-3 text-blue-400/60 shrink-0" />
                          <span className="font-medium">{titleCase(agentKey.replace(/_/g, "-"))}</span>
                        </div>
                        {scope && <p className="text-muted-foreground ml-[18px] mt-0.5">{scope}</p>}
                        {scenarios.length > 0 && (
                          <ul className="ml-[18px] mt-1 space-y-0.5">
                            {scenarios.map((s, si) => (
                              <li key={si} className="text-muted-foreground flex items-start gap-1">
                                <span className="text-amber-400/60 shrink-0 mt-0.5">&#8226;</span>
                                {s.trigger}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {provideTo && Object.keys(provideTo).length > 0 && (
              <div className="bg-muted/50 rounded-lg border border-teal-500/20 p-3">
                <h3 className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ArrowRight className="h-3 w-3" /> Provides To
                  <HelpPopover title="Provides To">Agents this one shares outputs with, enriching their context with analysis results, signals, or recommendations.</HelpPopover>
                </h3>
                <div className="space-y-2">
                  {Object.entries(provideTo).map(([agentKey, val]) => {
                    const scope = typeof val === "string" ? val : ((val as Record<string, unknown>)?.scope as string) ?? "";
                    return (
                      <div key={agentKey} className="text-xs">
                        <div className="flex items-center gap-1.5">
                          <ArrowRight className="h-3 w-3 text-teal-400/60 shrink-0" />
                          <span className="font-medium">{titleCase(agentKey.replace(/_/g, "-"))}</span>
                        </div>
                        {scope && <p className="text-muted-foreground ml-[18px] mt-0.5">{scope}</p>}
                      </div>
                    );
                  })}
                </div>
                {humanEscalation && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-amber-400">Escalates to:</span> {humanEscalation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
        )}

        {/* Guardrails tab */}
        <TabsContent value="guardrails" className="space-y-3 mt-3">
          {/* Human-in-the-Loop + Escalation + Permissions + Boundaries */}
          {(escalation?.length || permissions?.length || boundaries?.length) ? (() => {
            const sectionCount = (permissions?.length ? 1 : 0) + (escalation?.length ? 1 : 0) + (boundaries?.length ? 1 : 0);
            return (
            <div className={`grid grid-cols-1 gap-3 items-stretch ${sectionCount >= 3 ? "md:grid-cols-3" : sectionCount === 2 ? "md:grid-cols-2" : ""}`}>
              {permissions && permissions.length > 0 && (
                <div className="bg-muted/50 rounded-lg border border-green-500/20 p-4 max-h-80 overflow-y-auto">
                  <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> Permissions
                  </h4>
                  <ul className="space-y-2">
                    {permissions.map((p, i) => (
                      <li key={i} className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
                        <span className="text-green-400/50 shrink-0 mt-1">&#10003;</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {escalation && escalation.length > 0 && (
                <div className="bg-muted/50 rounded-lg border border-amber-500/20 p-4 max-h-80 overflow-y-auto">
                  <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Escalation Triggers
                  </h4>
                  <ul className="space-y-2">
                    {escalation.map((e, i) => (
                      <li key={i} className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
                        <span className="text-amber-400 shrink-0 mt-1">&#9888;</span>
                        {typeof e === "string" ? (
                          <span>{e}</span>
                        ) : (
                          <span>
                            <span className="font-medium text-foreground">{String((e as Record<string, unknown>).trigger ?? (e as Record<string, unknown>).condition ?? "")}</span>
                            {(e as Record<string, unknown>).target ? (
                              <span className="text-sm text-muted-foreground/60 ml-1">&#8594; {String((e as Record<string, unknown>).target)}</span>
                            ) : null}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {boundaries && boundaries.length > 0 && (
                <div className="bg-muted/50 rounded-lg border border-red-500/20 p-4 max-h-80 overflow-y-auto">
                  <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShieldOff className="h-4 w-4" /> Boundaries
                  </h4>
                  <ul className="space-y-2">
                    {boundaries.map((b, i) => (
                      <li key={i} className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
                        <span className="text-red-400/50 shrink-0 mt-1">&#8226;</span>
                        {typeof b === "string" ? b : String((b as Record<string, unknown>).rule ?? b)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            );
          })() : null}

        </TabsContent>

        {/* System Prompt tab */}
        <TabsContent value="system-prompt" className="mt-3">
          <div className="bg-muted/50 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> System Prompt
                <HelpPopover title="System Prompt">The base instructions given to the LLM. Defines the agent&apos;s persona, responsibilities, and behavioral rules.</HelpPopover>
              </h3>
              <CopyButton text={def.system_prompt} />
            </div>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-background/50 rounded-md p-4 max-h-[600px] overflow-y-auto leading-relaxed border border-border/50">
              {def.system_prompt}
            </pre>
          </div>
        </TabsContent>
      </Tabs>

      {/* Prompt flyout (shared across tabs) */}
      {promptRegistry && (
        <Sheet open={activePromptKey !== null} onOpenChange={(open) => { if (!open) setActivePromptKey(null); }}>
          <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
            {activePromptKey && promptRegistry[activePromptKey] ? (
              <PromptFlyoutContent agentId={def.id} promptKey={activePromptKey} entry={promptRegistry[activePromptKey]} />
            ) : null}
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

interface CategoryTab {
  category: string;
  label: string;
  icon: LucideIcon;
  color: string;
  border: string;
  summary: string;
}

const CATEGORY_TABS: CategoryTab[] = [
  { category: "Sales", label: "Sales", icon: Handshake, color: "text-blue-400", border: "border-l-blue-400", summary: "Agents driving commercial strategy, competitive positioning, value quantification, and partner alignment." },
  { category: "Architecture", label: "Architecture", icon: Cpu, color: "text-purple-400", border: "border-l-purple-400", summary: "Roles owning technical integrity and post-deployment health, backed by process sub-agents." },
  { category: "Intelligence", label: "Intelligence", icon: Eye, color: "text-cyan-400", border: "border-l-cyan-400", summary: "Autonomous agents covering account, industry, market, and technology research at different scopes and cadences." },
  { category: "Leadership", label: "Leadership", icon: Briefcase, color: "text-amber-400", border: "border-l-amber-400", summary: "Senior leadership coaching, escalation resolution, and team management." },
  { category: "Specialists", label: "Specialists", icon: Wrench, color: "text-rose-400", border: "border-l-rose-400", summary: "Domain experts and SMEs providing deep technical and product expertise across engagements." },
  { category: "Delivery", label: "Delivery", icon: Truck, color: "text-teal-400", border: "border-l-teal-400", summary: "Bridges what was sold with what gets built." },
  { category: "Deal Execution", label: "Deal Execution", icon: Target, color: "text-orange-400", border: "border-l-orange-400", summary: "Agents supporting deal-level execution, evaluation, and bid response." },
  { category: "Governance", label: "Background Systems", icon: Settings, color: "text-green-400", border: "border-l-green-400", summary: "Automated agents running on events and schedules, enforcing quality gates across all account activity." },
  { category: "Operations", label: "Operations", icon: Cog, color: "text-slate-400", border: "border-l-slate-400", summary: "Operational agents handling data hygiene, scheduling, and system maintenance." },
  { category: "Other", label: "Other", icon: Bot, color: "text-muted-foreground", border: "border-l-muted-foreground", summary: "Agents not yet assigned to a functional area." },
];

const CATEGORY_ORDER = CATEGORY_TABS.map((t) => t.category);

const CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
  CATEGORY_TABS.map((t) => [t.category, t.color])
);

function DefinitionsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const agentFromUrl = searchParams.get("agent");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(agentFromUrl);
  const [activeTab, setActiveTab] = useState<string>("Sales");

  useEffect(() => {
    setSelectedAgent(agentFromUrl);
  }, [agentFromUrl]);

  const { data: definitions, isLoading } = useQuery({
    queryKey: ["definitions"],
    queryFn: () => api.listDefinitions(),
  });

  const grouped = useMemo(() => {
    if (!definitions) return {} as Record<string, AgentDefinitionSummary[]>;
    const groups: Record<string, AgentDefinitionSummary[]> = {};
    for (const def of definitions) {
      const cat = def.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(def);
    }
    return groups;
  }, [definitions]);

  const availableTabs = useMemo(
    () => CATEGORY_TABS.filter((t) => grouped[t.category]?.length),
    [grouped],
  );

  const activeTabConfig = CATEGORY_TABS.find((t) => t.category === activeTab);
  const activeAgents = grouped[activeTab] ?? [];

  if (selectedAgent) {
    return (
      <div className="max-w-6xl mx-auto">
        <DefinitionDetail
          agentId={selectedAgent}
          onBack={() => {
            if (agentFromUrl) {
              router.back();
            } else {
              setSelectedAgent(null);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Link
            href="/agents/profiles"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold">Agent Definitions</h1>
          <HelpPopover title="Agent Definitions">
            Agent definitions follow Oracle Agent Spec 26.1.0.
            Each definition consolidates an agent&apos;s system prompt, flows, tools,
            prompt registry, knowledge, and guardrails into a single structured YAML file.
          </HelpPopover>
        </div>
        <p className="text-muted-foreground mt-1">
          {definitions?.length ?? 0} agent specifications across {availableTabs.length} functional
          areas, encoding flows, prompts, tools, knowledge, and guardrails.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground py-12 text-center">
          Loading definitions...
        </p>
      ) : !definitions || definitions.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">
          No agent definitions found
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <MetricCard label="Definitions" value={definitions.length} />
            <MetricCard
              label="Total Flows"
              value={definitions.reduce((sum, d) => sum + d.flow_count, 0)}
            />
            <MetricCard
              label="Total Prompts"
              value={definitions.reduce((sum, d) => sum + d.prompt_count, 0)}
            />
          </div>

          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 overflow-x-auto">
            {availableTabs.map((tab) => (
              <button
                key={tab.category}
                onClick={() => setActiveTab(tab.category)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.category
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className={`h-4 w-4 ${tab.color}`} />
                {tab.label}
                <span className="text-xs text-muted-foreground/60 ml-0.5">
                  {grouped[tab.category]?.length ?? 0}
                </span>
              </button>
            ))}
          </div>

          {activeTabConfig && (
            <div>
              <div className={`rounded-lg border ${activeTabConfig.border} bg-muted/50 px-4 py-3 mb-5`}>
                <p className={`text-sm ${activeTabConfig.color}`}>{activeTabConfig.summary}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeAgents.map((def) => (
                  <DefinitionCard
                    key={def.id}
                    def={def}
                    onSelect={() => setSelectedAgent(def.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function DefinitionsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground py-12 text-center">Loading...</div>}>
      <DefinitionsPageInner />
    </Suspense>
  );
}
