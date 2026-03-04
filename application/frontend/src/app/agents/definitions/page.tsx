"use client";

import { useState, useCallback, useEffect, useMemo, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
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
import { buildFlowGraph } from "@/lib/flow/transform-definition";
import type { AgentDefinition, AgentDefinitionSummary } from "@/types";

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
  colorMode,
}: {
  def: AgentDefinition;
  expandedFlowId: string | null;
  onFlowClick: (flowId: string | null) => void;
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
    }
  }, [expandedFlowId, onFlowClick]);

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

function DefinitionDetail({
  agentId,
  onBack,
}: {
  agentId: string;
  onBack: () => void;
}) {
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [activePromptKey, setActivePromptKey] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const flowColorMode = resolvedTheme === "light" ? "light" : "dark";

  const { data: def, isLoading } = useQuery({
    queryKey: ["definition", agentId],
    queryFn: () => api.getDefinition(agentId),
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
  const boundaries = ext?.boundaries as Array<string | Record<string, unknown>> | undefined;
  const permissions = ext?.permissions as string[] | undefined;
  const escalation = ext?.escalation_triggers as Array<string | Record<string, unknown>> | undefined;
  const memory = ext?.memory as Record<string, unknown> | undefined;
  const quality = ext?.quality as Record<string, unknown> | undefined;
  const knowledge = ext?.knowledge as Record<string, unknown> | undefined;
  const knowledgeRefs = (knowledge as Record<string, unknown>)?.references as Array<Record<string, unknown>> | undefined;
  const context = ext?.context as Record<string, unknown> | undefined;

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
              {parentAgent.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()).replace(/ Agent$/, "")} Profile
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
      <Tabs defaultValue="runbooks" className="w-full">
        <TabsList className="w-full justify-start">
          {flowCount > 0 && <TabsTrigger value="runbooks">Runbooks</TabsTrigger>}
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="guardrails">Guardrails</TabsTrigger>
          <TabsTrigger value="system-prompt">System Prompt</TabsTrigger>
          <button
            onClick={() => {
              const link = document.createElement("a");
              link.href = `/api/v1/definitions/${def.id}/raw`;
              link.download = `${def.id}-definition.yaml`;
              link.click();
            }}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Export YAML
          </button>
        </TabsList>

        {/* Runbooks tab: flow graph hero + flow cards */}
        {flowCount > 0 && (
          <TabsContent value="runbooks" className="space-y-3 mt-3">
            <div>
              <div className="flex items-center justify-end mb-2">
                <span className="text-xs text-muted-foreground">Click a runbook to expand its prompt chain</span>
              </div>
              <div className="flex gap-3">
                {/* Permissions & Boundaries panel */}
                {(permissions?.length || boundaries?.length) ? (
                  <div className="w-64 shrink-0 space-y-3">
                    {permissions && permissions.length > 0 && (
                      <div className="bg-muted/50 rounded-xl border border-green-500/20 p-3">
                        <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <ShieldCheck className="h-3 w-3" /> Permissions
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
                <div className="flex-1 h-[500px] rounded-xl border border-border bg-background overflow-hidden">
                  <ReactFlowProvider>
                    <FlowGraph def={def} expandedFlowId={activeFlowId} onFlowClick={setActiveFlowId} colorMode={flowColorMode} />
                  </ReactFlowProvider>
                </div>
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
                              <div className="min-w-0">
                                <span className="font-medium">{String(step.description ?? step.action ?? "")}</span>
                                {step.prompt ? (
                                  <p className="text-muted-foreground font-mono text-xs truncate">
                                    {String(step.prompt)}
                                  </p>
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

        {/* Capabilities tab: Tools + Prompts + Knowledge */}
        <TabsContent value="capabilities" className="space-y-4 mt-3">
          {/* Tools */}
          {toolCount > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Wrench className="h-3 w-3" /> Tools
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
                      <div className="flex gap-1 mt-1">
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
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Prompts */}
          {promptCount > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileCode2 className="h-3 w-3" /> Prompt Registry
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
              <Sheet open={activePromptKey !== null} onOpenChange={(open) => { if (!open) setActivePromptKey(null); }}>
                <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
                  {activePromptKey && promptRegistry![activePromptKey] ? (
                    <PromptFlyoutContent agentId={def.id} promptKey={activePromptKey} entry={promptRegistry![activePromptKey]} />
                  ) : null}
                </SheetContent>
              </Sheet>
            </div>
          )}

          {/* Knowledge References */}
          {knowledgeRefs && knowledgeRefs.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BookText className="h-3 w-3" /> Knowledge References
                <Badge variant="secondary" className="text-xs ml-1">{knowledgeRefs.length}</Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {knowledgeRefs.map((ref, i) => (
                  <div key={i} className="bg-muted/50 rounded-md p-2.5 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium font-mono">{String(ref.path ?? ref.name)}</p>
                      <p className="text-xs text-muted-foreground">{String(ref.description ?? "")}</p>
                    </div>
                    {ref.load_when ? (
                      <Badge variant="outline" className="text-xs shrink-0">{String(ref.load_when)}</Badge>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LLM + Context + Memory (collapsed details) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="bg-muted/50 rounded-lg border border-cyan-500/20 p-3">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Brain className="h-3 w-3" /> LLM Configuration
              </h3>
              {(() => {
                const helpMap: Record<string, string> = {
                  model_id: "Which LLM to use. 'auto' = platform chooses best available model",
                  temperature: "Creativity vs precision. 0.0 = deterministic, 1.0 = creative",
                  max_tokens: "Max output length per response",
                };
                return (
                  <div className="space-y-2">
                    {Object.entries(llm).map(([key, value]) => {
                      if (value && typeof value === "object") {
                        return (
                          <div key={key}>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{key.replace(/_/g, " ")}</p>
                            <div className="space-y-1.5">
                              {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                                <div key={k} className="flex items-baseline gap-1.5">
                                  <span className="text-xs text-muted-foreground">{k.replace(/_/g, " ")}:</span>
                                  <span className="text-xs font-medium">{v === null ? "auto" : String(v)}</span>
                                  {helpMap[k] ? <HelpPopover title={k.replace(/_/g, " ")}>{helpMap[k]}</HelpPopover> : null}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={key} className="flex items-baseline gap-1.5">
                          <span className="text-xs text-muted-foreground">{key.replace(/_/g, " ")}:</span>
                          <span className="text-xs font-medium">{value === null ? "auto" : String(value)}</span>
                          {helpMap[key] ? <HelpPopover title={key.replace(/_/g, " ")}>{helpMap[key]}</HelpPopover> : null}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {context ? (
              <div className="bg-muted/50 rounded-lg border border-indigo-500/20 p-3">
                <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Brain className="h-3 w-3" /> Context Window
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

            {memory ? (
              <div className="bg-muted/50 rounded-lg border border-teal-500/20 p-3">
                <h3 className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Brain className="h-3 w-3" /> Memory
                </h3>
                <div className="space-y-2.5">
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
        </TabsContent>

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
            </div>
          ) : null}

          {(quality || escalation?.length) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {quality ? (
                <div className="bg-muted/50 rounded-lg border border-purple-500/20 p-3">
                  <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">Quality Criteria</h4>
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
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Escalation Triggers</h4>
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
        </TabsContent>

        {/* System Prompt tab */}
        <TabsContent value="system-prompt" className="mt-3">
          <div className="bg-muted/50 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> System Prompt
              </h3>
              <CopyButton text={def.system_prompt} />
            </div>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-background/50 rounded-md p-4 max-h-[600px] overflow-y-auto leading-relaxed border border-border/50">
              {def.system_prompt}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
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
  const agentFromUrl = searchParams.get("agent");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(agentFromUrl);

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
          onBack={() => setSelectedAgent(null)}
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
