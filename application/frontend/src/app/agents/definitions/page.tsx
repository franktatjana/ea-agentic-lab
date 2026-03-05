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
} from "lucide-react";
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
      {entry.source ? (
        <p className="text-xs text-muted-foreground/60 font-mono mt-1 truncate">{String(entry.source)}</p>
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
        <p className="text-xs text-muted-foreground/60 mt-3">Content served by the Knowledge Q&amp;A Service at retrieval time based on agent scope and workflow step context.</p>
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
}: {
  def: AgentDefinition;
  expandedFlowId: string | null;
  onFlowClick: (flowId: string | null) => void;
  onPromptClick?: (promptKey: string) => void;
  colorMode: "dark" | "light";
}) {
  const { fitView } = useReactFlow();

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildFlowGraph(def, expandedFlowId),
    [def, expandedFlowId],
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ext = (def as any)["x-ea-agent"] as Record<string, unknown> | undefined;
  const promptRegistry = ext?.prompt_registry as Record<string, Record<string, unknown>> | undefined;
  const guardrails = ext?.guardrails as Record<string, unknown> | undefined;
  const errorHandling = ext?.error_handling as Record<string, unknown> | undefined;
  const toolFailures = errorHandling?.tool_failures as Record<string, unknown> | undefined;
  const criticalTools = (toolFailures?.critical ?? []) as string[];
  const enrichmentTools = (toolFailures?.enrichment ?? []) as string[];
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
  const validation = ext?.validation as Record<string, unknown> | undefined;
  const outputConstraints = validation?.output_constraints as Record<string, unknown> | undefined;
  const humanInTheLoopConditions = ext?.human_in_the_loop_conditions as string[] | undefined;
  const profile = ext?.profile as Record<string, unknown> | undefined;
  const subAgentsDef = (profile?.sub_agents ?? ext?.sub_agents) as Array<Record<string, unknown>> | undefined;
  const peerAgentsDef = (profile?.peer_agents ?? ext?.peer_agents) as Array<Record<string, unknown>> | undefined;

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
      {parentAgent && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg border border-blue-500/20 p-4">
              <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Why This Agent Exists
              </h3>
              <ul className="space-y-2">
                {String(def.description).trim()
                  .split(/\.\s+/)
                  .filter(Boolean)
                  .map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                    <span className="text-foreground/85 leading-relaxed">
                      {point.charAt(0).toUpperCase() + point.slice(1).replace(/\.$/, "")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            {isHumanPaired && (
              <div className="bg-muted/50 rounded-lg border border-purple-500/20 p-4">
                <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <UserCheck className="h-3 w-3" /> Why the Human Matters
                </h3>
                <p className="text-xs text-foreground/85 leading-relaxed mb-3">
                  The agent handles data gathering, analysis, and preparation, but the
                  human brings judgment, relationships, and strategic decisions that no
                  model can replace.
                </p>
                {escalation && escalation.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">
                      The agent escalates when
                    </p>
                    <ul className="space-y-1.5">
                      {escalation.map((trigger, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <AlertTriangle className="h-3 w-3 mt-[2px] text-amber-400 shrink-0" />
                          <span className="text-foreground/80">
                            {typeof trigger === "string" ? trigger : String((trigger as Record<string, unknown>).trigger ?? trigger)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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
              {/* Permissions & Boundaries (top-level agents only) */}
              {!parentAgent && (permissions?.length || boundaries?.length) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {permissions && permissions.length > 0 && (
                    <div className="bg-muted/50 rounded-xl border border-green-500/20 p-3">
                      <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <ShieldCheck className="h-3 w-3" /> Permissions
                        <HelpPopover title="Permissions">Actions and data access this agent is explicitly authorized to perform within its scope.</HelpPopover>
                      </h4>
                      <ul className="space-y-2.5">
                        {permissions.map((p, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-green-400/50 shrink-0 mt-0.5">&#10003;</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {boundaries && boundaries.length > 0 && (
                    <div className="bg-muted/50 rounded-xl border border-red-500/20 p-3">
                      <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <ShieldOff className="h-3 w-3" /> Boundaries
                        <HelpPopover title="Boundaries">Hard constraints the agent must never cross, regardless of instructions or context.</HelpPopover>
                      </h4>
                      <ul className="space-y-2.5">
                        {boundaries.map((b, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-red-400/50 shrink-0 mt-0.5">&#8226;</span>
                            {typeof b === "string" ? b : String((b as Record<string, unknown>).rule ?? b)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Flow canvas */}
              <div className="h-[500px] rounded-xl border border-border bg-background overflow-hidden">
                <ReactFlowProvider>
                  <FlowGraph def={def} expandedFlowId={activeFlowId} onFlowClick={setActiveFlowId} onPromptClick={(key) => { if (promptRegistry?.[key]) setActivePromptKey(key); }} colorMode={flowColorMode} />
                </ReactFlowProvider>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {(def.flows ?? []).map((flow, i) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const flowAny = flow as any;
                const flowExt = (flowAny["x-ea-agent"] ?? {}) as Record<string, unknown>;
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
                <Badge variant="secondary" className="text-xs ml-1">{routingRules.length}</Badge>
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
                      const sourceName = titleCase(rule.watch.replace(/-agent$/, "").replace(/^ae-/, ""));
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

        {/* Capabilities tab */}
        <TabsContent value="capabilities" className="space-y-6 mt-3">

          {/* ── Execution ── */}
          <div className="space-y-4">
            <h2 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em] flex items-center gap-1.5">Execution
              <HelpPopover title="Execution">Tools, sub-agents, and generated assets the agent uses to take action and produce deliverables.</HelpPopover>
            </h2>

          {/* Tools */}
          {toolCount > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Wrench className="h-3 w-3" /> Tools
                <HelpPopover title="Tools">External integrations the agent can invoke: CRM queries, APIs, document generation, or data lookups. Risk level indicates confirmation requirements.</HelpPopover>
                <Badge variant="secondary" className="text-xs ml-1">{toolCount}</Badge>
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {(def.tools ?? []).map((tool, i) => {
                  const tExt = ((tool as unknown as Record<string, unknown>)["x-ea-agent"] ?? {}) as Record<string, unknown>;
                  return (
                    <div key={i} className="bg-muted/50 rounded-md p-2.5">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Wrench className="h-3 w-3 text-green-400 shrink-0" />
                        <span className="text-xs font-medium truncate">{tool.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{tool.description ?? ""}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Boolean((tool as unknown as Record<string, unknown>).requires_confirmation) && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400">confirmation</span>
                        )}
                        {Boolean(tExt.risk) && (
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            tExt.risk === "high" ? "bg-red-400/10 text-red-400"
                              : tExt.risk === "medium" ? "bg-amber-400/10 text-amber-400"
                              : "bg-green-400/10 text-green-400"
                          }`}>{String(tExt.risk)}</span>
                        )}
                        {criticalTools.includes(tool.id) && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-red-400/10 text-red-400">critical</span>
                        )}
                        {enrichmentTools.includes(tool.id) && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-400/10 text-cyan-400">enrichment</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sub-agents (from x-ea-agent) */}
          {subAgentsDef && subAgentsDef.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Bot className="h-3 w-3" /> Sub-agents
                <HelpPopover title="Sub-agents">Dedicated child agents that handle specific sub-tasks. Each carries its own skills, knowledge, and guardrails. Click to navigate to their definition.</HelpPopover>
                <Badge variant="secondary" className="text-xs ml-1">{subAgentsDef.length}</Badge>
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
                <HelpPopover title="Peer Agents">Independent agents representing separate roles that coordinate with this agent as equals. Each peer has its own person and responsibilities.</HelpPopover>
                <Badge variant="secondary" className="text-xs ml-1">{peerAgentsDef.length}</Badge>
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
                <HelpPopover title="Generated Assets">Deliverables the agent produces as output: reports, summaries, scorecards, or structured documents.</HelpPopover>
                <Badge variant="secondary" className="text-xs ml-1">{assets.length}</Badge>
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

          </div>

          {/* ── Intelligence ── */}
          <div className="space-y-4">
            <h2 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em] flex items-center gap-1.5">Intelligence
              <HelpPopover title="Intelligence">Prompts, knowledge, context, and memory that inform the agent&apos;s reasoning and decision-making.</HelpPopover>
            </h2>

          {/* Prompts */}
          {promptCount > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileCode2 className="h-3 w-3" /> Prompt Registry
                <HelpPopover title="Prompt Registry">Named prompt templates used across runbooks. Each prompt has defined inputs, outputs, and a source file. Click a card to view the resolved prompt content.</HelpPopover>
                <Badge variant="secondary" className="text-xs ml-1">{promptCount}</Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.entries(promptRegistry!).map(([key, entry]) => (
                  <PromptCard
                    key={key}
                    promptKey={key}
                    entry={entry}
                    isActive={activePromptKey === key}
                    onClick={() => setActivePromptKey(key)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Knowledge References */}
          {(knowledgeDomains.length > 0 || (knowledgeRefs && knowledgeRefs.length > 0)) && (
            <div>
              <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BookText className="h-3 w-3" /> Knowledge
                <HelpPopover title="Knowledge">Domain knowledge the agent reasons against. The platform&apos;s Q&amp;A service retrieves and synthesizes relevant knowledge based on the agent&apos;s scope and current workflow step.</HelpPopover>
                {knowledgeRefs && knowledgeRefs.length > 0 && <Badge variant="secondary" className="text-xs ml-1">{knowledgeRefs.length} refs</Badge>}
              </h3>
              {knowledgeDomains.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {knowledgeDomains.map((d) => (
                    <span key={d} className="text-[11px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">{d}</span>
                  ))}
                  {knowledgeArchetypes.map((a) => (
                    <span key={a} className="text-[11px] px-2 py-0.5 rounded-full bg-amber-400/5 text-amber-400/60 border border-amber-400/10">{a}</span>
                  ))}
                </div>
              )}
              {knowledgeRefs && knowledgeRefs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {knowledgeRefs.map((ref, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveKnowledgeIdx(i)}
                    className="bg-muted/50 rounded-md p-3 text-left hover:bg-muted/80 hover:border-amber-500/30 border border-transparent transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-2">
                      <BookText className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground group-hover:text-amber-400 transition-colors">
                          {String(ref.name ?? ref.path)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{String(ref.description ?? "")}</p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-amber-400 shrink-0 mt-0.5 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
              )}
              <Sheet open={activeKnowledgeIdx !== null} onOpenChange={(open) => { if (!open) setActiveKnowledgeIdx(null); }}>
                <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
                  {activeKnowledgeIdx !== null && knowledgeRefs?.[activeKnowledgeIdx] ? (
                    <KnowledgeFlyoutContent knowledgeRef={knowledgeRefs[activeKnowledgeIdx]} />
                  ) : null}
                </SheetContent>
              </Sheet>
            </div>
          )}

          {/* Context + Specialized Agents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {context ? (
              <div className="bg-muted/50 rounded-lg border border-indigo-500/20 p-3">
                <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Brain className="h-3 w-3" /> Context Window
                  <HelpPopover title="Context Window">Token budget and loading strategy. Controls how much information fits in a single interaction and how references are prioritized.</HelpPopover>
                </h3>
                <div className="space-y-2.5">
                  {context.token_budget ? (
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">token budget:</span>
                      <span className="text-xs font-medium font-mono">{String(context.token_budget)}</span>
                    </div>
                  ) : null}
                  {context.reserve_for_references ? (
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">reserved for refs:</span>
                      <span className="text-xs font-medium font-mono">{String(context.reserve_for_references)}</span>
                    </div>
                  ) : null}
                  {context.strategy ? (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">strategy</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{String(context.strategy)}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {variantCount > 0 ? (
              <div className="bg-muted/50 rounded-lg border border-purple-500/20 p-3">
                <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Users className="h-3 w-3" /> Specialized Agents
                  <HelpPopover title="Specialized Agents">Variant agents defined inline in the spec. They inherit the parent&apos;s configuration but serve a narrower purpose or persona.</HelpPopover>
                  <Badge variant="secondary" className="text-xs ml-auto">{variantCount}</Badge>
                </h3>
                <div className="space-y-2">
                  {(def.specialized_agents ?? []).map((sa: Record<string, unknown>, i: number) => (
                    <div key={i}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Bot className="h-3 w-3 text-purple-400 shrink-0" />
                        <span className="text-xs font-medium">{String(sa.name)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{String(sa.description)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Memory + HITL */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {memory ? (
              <div className="bg-muted/50 rounded-lg border border-teal-500/20 p-3 lg:col-span-2">
                <h3 className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Brain className="h-3 w-3" /> Memory
                  <HelpPopover title="Memory">What the agent remembers across interactions: deal context, previous analyses, learned patterns, and accumulated intelligence.</HelpPopover>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5">
                  {Object.entries(memory).map(([key, val]) => (
                    <div key={key}>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">{key.replace(/_/g, " ")}</p>
                      {Array.isArray(val) ? (
                        <ul className="space-y-0.5">
                          {(val as unknown[]).map((item, j) => (
                            <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-teal-400/50 shrink-0 mt-0.5">&#8226;</span>
                              {String(item)}
                            </li>
                          ))}
                        </ul>
                      ) : typeof val === "string" ? (
                        <p className="text-xs text-muted-foreground">{val}</p>
                      ) : (
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{JSON.stringify(val, null, 2)}</pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

          </div>

          </div>

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
                  <Badge variant="secondary" className="text-xs ml-auto">{Object.keys(deferTo).length}</Badge>
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
                  <Badge variant="secondary" className="text-xs ml-auto">{Object.keys(provideTo).length}</Badge>
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

        {/* Guardrails tab: validations + quality + escalation */}
        <TabsContent value="guardrails" className="space-y-3 mt-3">
          {guardrails ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.entries(guardrails).map(([section, items]) => {
                const colorMap: Record<string, { border: string; icon: string; bullet: string }> = {
                  input_validation: { border: "border-red-500/20", icon: "text-red-400", bullet: "text-red-400/60" },
                  input: { border: "border-red-500/20", icon: "text-red-400", bullet: "text-red-400/60" },
                  output_checks: { border: "border-blue-500/20", icon: "text-blue-400", bullet: "text-blue-400/60" },
                  output: { border: "border-blue-500/20", icon: "text-blue-400", bullet: "text-blue-400/60" },
                  signal_validation: { border: "border-indigo-500/20", icon: "text-indigo-400", bullet: "text-indigo-400/60" },
                  resource: { border: "border-amber-500/20", icon: "text-amber-400", bullet: "text-amber-400/60" },
                };
                const colors = colorMap[section] ?? { border: "border-border", icon: "text-muted-foreground", bullet: "text-muted-foreground/40" };
                return (
                  <div key={section} className={`bg-muted/50 rounded-lg border ${colors.border} p-3`}>
                    <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${colors.icon}`}>
                      <ShieldCheck className="h-3 w-3" />
                      {section.replace(/_/g, " ")}
                    </h4>
                    {Array.isArray(items) ? (
                      <ul className="space-y-1">
                        {(items as unknown[]).map((item, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className={`${colors.bullet} shrink-0 mt-0.5`}>&#8226;</span>
                            {typeof item === "string" ? item : (
                              <span>{Object.entries(item as Record<string, unknown>).map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`).join(", ")}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">{JSON.stringify(items)}</p>
                    )}
                  </div>
                );
              })}
              {isHumanPaired && humanInTheLoopConditions && humanInTheLoopConditions.length > 0 && (
                <div className="bg-muted/50 rounded-lg border border-blue-500/20 p-3 md:col-span-2">
                  <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <UserCheck className="h-3 w-3" /> Human-in-the-Loop
                    <HelpPopover title="Human-in-the-Loop">Conditions that require human review before the agent proceeds. These are mandatory escalation points where judgment, relationships, or strategic decisions matter.</HelpPopover>
                  </h4>
                  <ul className="space-y-1">
                    {humanInTheLoopConditions.map((cond, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-blue-400/50 shrink-0 mt-0.5">&#8226;</span>
                        {cond}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

          {/* Error Handling */}
          {errorHandling && (
            <div className="bg-muted/50 rounded-lg border border-orange-500/20 p-3">
              <h4 className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3" /> Error Handling
                <HelpPopover title="Error Handling">How the agent behaves when data sources are unavailable or return stale data. Critical tools stop the workflow on failure, enrichment tools allow graceful degradation.</HelpPopover>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {criticalTools.length > 0 && (
                  <div>
                    <span className="text-[10px] text-red-400 font-medium uppercase tracking-wider">Critical (stop on failure)</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {criticalTools.map((t, i) => (
                        <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-red-400/10 text-red-400">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {enrichmentTools.length > 0 && (
                  <div>
                    <span className="text-[10px] text-cyan-400 font-medium uppercase tracking-wider">Enrichment (degrade gracefully)</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {enrichmentTools.map((t, i) => (
                        <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-cyan-400/10 text-cyan-400">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-1.5 border-t border-border/30 pt-2">
                {errorHandling.on_critical_failure ? (
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-red-400 shrink-0 mt-0.5">&#9632;</span>
                    <div>
                      <span className="font-medium text-red-400">Critical failure: </span>
                      <span className="text-muted-foreground">{String((errorHandling.on_critical_failure as Record<string, unknown>).guidance ?? "")}</span>
                    </div>
                  </div>
                ) : null}
                {errorHandling.on_enrichment_failure ? (
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-cyan-400 shrink-0 mt-0.5">&#9632;</span>
                    <div>
                      <span className="font-medium text-cyan-400">Enrichment failure: </span>
                      <span className="text-muted-foreground">{String((errorHandling.on_enrichment_failure as Record<string, unknown>).guidance ?? "")}</span>
                    </div>
                  </div>
                ) : null}
                {errorHandling.on_stale_data ? (
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-amber-400 shrink-0 mt-0.5">&#9632;</span>
                    <div>
                      <span className="font-medium text-amber-400">Stale data: </span>
                      <span className="text-muted-foreground">{String((errorHandling.on_stale_data as Record<string, unknown>).guidance ?? "")}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {(quality || escalation?.length) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {quality ? (
                <div className="bg-muted/50 rounded-lg border border-purple-500/20 p-3">
                  <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    Quality Criteria
                    <HelpPopover title="Quality Criteria">Standards the agent&apos;s output must meet before being considered complete. Acts as a self-check gate.</HelpPopover>
                  </h4>
                  {Array.isArray(quality) ? (
                    <ul className="space-y-1">
                      {(quality as string[]).map((q, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-purple-400/60 shrink-0 mt-0.5">&#8226;</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{JSON.stringify(quality, null, 2)}</pre>
                  )}
                </div>
              ) : null}
              {escalation && escalation.length > 0 ? (
                <div className="bg-muted/50 rounded-lg border border-amber-500/20 p-3">
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    Escalation Triggers
                    <HelpPopover title="Escalation Triggers">Conditions that force the agent to pause and escalate to a human or another agent. Prevents autonomous action on high-stakes decisions.</HelpPopover>
                  </h4>
                  <ul className="space-y-1">
                    {escalation.map((e, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-400 shrink-0 mt-0.5">&#9888;</span>
                        {typeof e === "string" ? (
                          <span>{e}</span>
                        ) : (
                          <span>
                            <span className="font-medium text-foreground">{String((e as Record<string, unknown>).trigger ?? (e as Record<string, unknown>).condition ?? "")}</span>
                            {(e as Record<string, unknown>).target ? (
                              <span className="text-xs text-muted-foreground/60 ml-1">&#8594; {String((e as Record<string, unknown>).target)}</span>
                            ) : null}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Permissions + Boundaries */}
          {(permissions?.length || boundaries?.length) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {permissions && permissions.length > 0 && (
                <div className="bg-muted/50 rounded-lg border border-green-500/20 p-3">
                  <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3" /> Permissions
                    <HelpPopover title="Permissions">Actions and data access this agent is explicitly authorized to perform within its scope.</HelpPopover>
                  </h4>
                  <ul className="space-y-1">
                    {permissions.map((p, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-green-400/50 shrink-0 mt-0.5">&#10003;</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {boundaries && boundaries.length > 0 && (
                <div className="bg-muted/50 rounded-lg border border-red-500/20 p-3">
                  <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldOff className="h-3 w-3" /> Boundaries
                    <HelpPopover title="Boundaries">Hard constraints the agent must never cross, regardless of instructions or context.</HelpPopover>
                  </h4>
                  <ul className="space-y-1">
                    {boundaries.map((b, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-red-400/50 shrink-0 mt-0.5">&#8226;</span>
                        {typeof b === "string" ? b : String((b as Record<string, unknown>).rule ?? b)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

          {/* Validation / Output Constraints */}
          {outputConstraints && Object.keys(outputConstraints).length > 0 && (
            <div className="bg-muted/50 rounded-lg border border-cyan-500/20 p-3">
              <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3" /> Output Constraints
                <HelpPopover title="Output Constraints">Structural rules for the agent&apos;s output format: max length, required sections, formatting standards.</HelpPopover>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(outputConstraints).map(([key, val]) => (
                  <div key={key} className="text-xs">
                    <span className="text-muted-foreground">{key.replace(/_/g, " ")}:</span>{" "}
                    <span className="font-medium">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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

const CATEGORY_ORDER = [
  "Sales",
  "Architecture",
  "Deal Execution",
  "Delivery",
  "Leadership",
  "Intelligence",
  "Governance",
  "Specialists",
  "Operations",
  "Other",
];

const CATEGORY_COLORS: Record<string, string> = {
  Sales: "text-blue-400",
  Architecture: "text-purple-400",
  "Deal Execution": "text-orange-400",
  Delivery: "text-teal-400",
  Leadership: "text-amber-400",
  Intelligence: "text-cyan-400",
  Governance: "text-green-400",
  Specialists: "text-pink-400",
  Operations: "text-slate-400",
  Other: "text-muted-foreground",
};

function DefinitionsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const agentFromUrl = searchParams.get("agent");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(agentFromUrl);

  useEffect(() => {
    setSelectedAgent(agentFromUrl);
  }, [agentFromUrl]);

  const { data: definitions, isLoading } = useQuery({
    queryKey: ["definitions"],
    queryFn: () => api.listDefinitions(),
  });

  const groupedDefinitions = useMemo(() => {
    if (!definitions) return [];
    const groups: Record<string, AgentDefinitionSummary[]> = {};
    for (const def of definitions) {
      const cat = def.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(def);
    }
    return CATEGORY_ORDER
      .filter((cat) => groups[cat]?.length)
      .map((cat) => ({ category: cat, agents: groups[cat] }));
  }, [definitions]);

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
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Link
            href="/agents"
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
          Agent specification files following Oracle Agent Spec 26.1.0. Each definition
          encodes flows, prompts, tools, knowledge, and guardrails.
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

          <Separator />

          <div className="space-y-6">
            {groupedDefinitions.map(({ category, agents }) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className={`text-sm font-semibold ${CATEGORY_COLORS[category] ?? "text-muted-foreground"}`}>
                    {category}
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    {agents.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {agents.map((def) => (
                    <DefinitionCard
                      key={def.id}
                      def={def}
                      onSelect={() => setSelectedAgent(def.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
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
