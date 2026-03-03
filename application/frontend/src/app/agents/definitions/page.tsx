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
      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors"
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
        <span className="text-[11px] font-mono font-medium">{promptKey}</span>
      </div>
      {entry.description ? (
        <p className="text-[11px] text-muted-foreground leading-relaxed">{String(entry.description)}</p>
      ) : null}
      {entry.source ? (
        <p className="text-[10px] text-muted-foreground/60 font-mono mt-1 truncate">{String(entry.source)}</p>
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
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Source</h4>
            <p className="text-xs font-mono text-muted-foreground bg-muted/50 rounded px-2 py-1.5 break-all">{String(entry.source)}</p>
          </div>
        ) : null}

        {Array.isArray(inputs) && inputs.length > 0 ? (
          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Inputs</h4>
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
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Outputs</h4>
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
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Prompt</h4>
            {promptContent?.prompt ? (
              <CopyButton text={String(promptContent.prompt)} />
            ) : null}
          </div>
          {isLoading ? (
            <p className="text-xs text-muted-foreground py-3 text-center">Loading prompt...</p>
          ) : promptContent?.error ? (
            <p className="text-xs text-red-400 py-2">{String(promptContent.error)}</p>
          ) : promptContent?.prompt ? (
            <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap bg-muted/50 rounded-md p-3 max-h-80 overflow-y-auto leading-relaxed">
              {String(promptContent.prompt)}
            </pre>
          ) : (
            <p className="text-xs text-muted-foreground py-2">No prompt content resolved</p>
          )}
        </div>

        {promptContent && !promptContent.error && !promptContent.prompt ? (
          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Resolved Content</h4>
            <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap bg-muted/50 rounded-md p-3 max-h-80 overflow-y-auto leading-relaxed">
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
          <Badge variant="secondary" className="text-[10px]">
            v{String((def.metadata as Record<string, unknown>)?.definition_version ?? "1")}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {def.description}
        </p>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px] border-blue-600/30 text-blue-400 bg-blue-600/10">
            {def.flow_count} flows
          </Badge>
          <Badge variant="outline" className="text-[10px] border-green-600/30 text-green-400 bg-green-600/10">
            {def.tool_count} tools
          </Badge>
          <Badge variant="outline" className="text-[10px] border-amber-600/30 text-amber-400 bg-amber-600/10">
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
            <Badge variant="secondary" className="text-[10px]">{count}</Badge>
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

  const llm = def.llm_configuration || {};
  const flowCount = def.flows?.length ?? 0;
  const toolCount = def.tools?.length ?? 0;
  const variantCount = def.specialized_agents?.length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold">{def.name}</h1>
          <Badge variant="secondary">{def.agentspec_version}</Badge>
          <button
            onClick={() => {
              const link = document.createElement("a");
              link.href = `/api/v1/definitions/${def.id}/raw`;
              link.download = `${def.id}-definition.yaml`;
              link.click();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors border border-border ml-auto"
          >
            <Download className="h-3.5 w-3.5" />
            Export YAML
          </button>
        </div>
        <ul className="text-muted-foreground text-sm space-y-1 mt-1">
          {def.description
            .split(/\.\s+/)
            .filter((s) => s.trim())
            .map((sentence, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-muted-foreground/60 mt-0.5 shrink-0">-</span>
                <span>{sentence.replace(/\.$/, "").trim()}</span>
              </li>
            ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <MetricCard label="Flows" value={flowCount} />
        <MetricCard label="Tools" value={toolCount} />
        <MetricCard label="Prompts" value={Object.keys(promptRegistry ?? {}).length} />
        <MetricCard label="Variants" value={variantCount} />
      </div>

      <div className="flex items-start gap-2 px-3 py-2 rounded-lg border border-amber-500/20 bg-amber-500/5 text-[11px] text-muted-foreground leading-relaxed">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
        <span>
          <span className="font-medium text-amber-400">Showcase only.</span>{" "}
          This definition is a reference example, not a production-ready agent configuration.
          Review, validate, and adapt before any operational use. No liability assumed.
        </span>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="system-prompt">System Prompt</TabsTrigger>
          <TabsTrigger value="flows">Flows</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="guardrails">Guardrails</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-3">
          {/* LLM + Context + Specialized Agents */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="bg-muted/50 rounded-lg border border-cyan-500/20 p-3">
              <h3 className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Brain className="h-3 w-3" /> LLM Configuration
              </h3>
              {(() => {
                const helpMap: Record<string, string> = {
                  model_id: "Which LLM to use. 'auto' = platform chooses best available model",
                  temperature: "Creativity vs precision. 0.0 = deterministic, 1.0 = creative. Use 0.3-0.5 for analytical, 0.6-0.8 for conversational",
                  max_tokens: "Max output length per response. 1024 = short answers, 4096 = detailed analyses, 8192 = long reports",
                };
                return (
                  <div className="space-y-2">
                    {Object.entries(llm).map(([key, value]) => {
                      if (value && typeof value === "object") {
                        return (
                          <div key={key}>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{key.replace(/_/g, " ")}</p>
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
                <h3 className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Brain className="h-3 w-3" /> Context Window
                </h3>
                <div className="space-y-2.5">
                  {context.token_budget ? (
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">token budget:</span>
                      <span className="flex items-center gap-1">
                        <span className="text-xs font-medium font-mono">{String(context.token_budget)}</span>
                        <HelpPopover title="token budget">Total tokens allocated for context. Higher = more data available but slower and costlier</HelpPopover>
                      </span>
                    </div>
                  ) : null}
                  {context.reserve_for_references ? (
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">reserved for refs:</span>
                      <span className="flex items-center gap-1">
                        <span className="text-xs font-medium font-mono">{String(context.reserve_for_references)}</span>
                        <HelpPopover title="reserve for references">Tokens reserved for loading knowledge references and documents into context</HelpPopover>
                      </span>
                    </div>
                  ) : null}
                  {context.strategy ? (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">strategy</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{String(context.strategy)}</p>
                    </div>
                  ) : null}
                  {Array.isArray(context.priority_order) ? (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">priority order</p>
                      <ol className="space-y-0.5">
                        {(context.priority_order as string[]).map((item, i) => (
                          <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                            <span className="text-indigo-400/60 font-mono text-[10px] shrink-0 w-3 text-right">{i + 1}.</span>
                            {item}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {variantCount > 0 ? (
              <div className="bg-muted/50 rounded-lg border border-purple-500/20 p-3">
                <h3 className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Users className="h-3 w-3" /> Specialized Agents
                  <Badge variant="secondary" className="text-[9px] ml-auto">{variantCount}</Badge>
                </h3>
                <div className="space-y-2">
                  {(def.specialized_agents ?? []).map((sa: Record<string, unknown>, i: number) => (
                    <div key={i}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Bot className="h-3 w-3 text-purple-400 shrink-0" />
                        <span className="text-xs font-medium">{String(sa.name)}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{String(sa.description)}</p>
                      {sa.when_to_use ? (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          <span className="text-foreground font-medium">When: </span>
                          {String(sa.when_to_use)}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Memory + Knowledge side by side */}
          {(memory || (knowledgeRefs && knowledgeRefs.length > 0)) ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {memory ? (
                <div className="bg-muted/50 rounded-lg border border-teal-500/20 p-3">
                  <h3 className="text-[10px] font-semibold text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Brain className="h-3 w-3" /> Memory
                  </h3>
                  <div className="space-y-2.5">
                    {Object.entries(memory).map(([key, val]) => (
                      <div key={key}>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{key.replace(/_/g, " ")}</p>
                        {Array.isArray(val) ? (
                          <ul className="space-y-0.5">
                            {(val as unknown[]).map((item, j) => (
                              <li key={j} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                                <span className="text-teal-400/50 shrink-0 mt-0.5">&#8226;</span>
                                {String(item)}
                              </li>
                            ))}
                          </ul>
                        ) : typeof val === "string" ? (
                          <p className="text-[11px] text-muted-foreground">{val}</p>
                        ) : (
                          <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap">{JSON.stringify(val, null, 2)}</pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {knowledgeRefs && knowledgeRefs.length > 0 ? (
                <div className="bg-muted/50 rounded-lg border border-amber-500/20 p-3">
                  <h3 className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookText className="h-3 w-3" /> Knowledge References
                  </h3>
                  <div className="space-y-2">
                    {knowledgeRefs.map((ref, i) => (
                      <div key={i} className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium font-mono">{String(ref.path ?? ref.name)}</p>
                          <p className="text-[11px] text-muted-foreground">{String(ref.description ?? "")}</p>
                        </div>
                        {ref.load_when ? (
                          <Badge variant="outline" className="text-[9px] shrink-0">{String(ref.load_when)}</Badge>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

        </TabsContent>

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

        <TabsContent value="flows" className="space-y-3 mt-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><Workflow className="h-3 w-3" /> {flowCount} {flowCount === 1 ? "flow" : "flows"}</span>
                <span className="flex items-center gap-1"><Wrench className="h-3 w-3" /> {toolCount} {toolCount === 1 ? "tool" : "tools"}</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {variantCount} {variantCount === 1 ? "variant" : "variants"}</span>
              </div>
              <span className="text-[11px] text-muted-foreground">Click a flow to expand its prompt chain</span>
            </div>
            <div className="flex gap-3">
              {/* Agent info panel */}
              <div className="w-72 shrink-0 space-y-3">
                <div className="bg-muted/50 rounded-xl border border-border p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-purple-400 shrink-0" />
                    <span className="text-sm font-semibold">{def.name?.replace(/ Agent$/, "")}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{def.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {def.human_in_the_loop && (
                      <Badge variant="outline" className="text-[9px]">HITL</Badge>
                    )}
                    <Badge variant="outline" className="text-[9px]">{def.agentspec_version}</Badge>
                    {variantCount > 0 && (
                      <Badge variant="outline" className="text-[9px]">{variantCount} variant{variantCount !== 1 ? "s" : ""}</Badge>
                    )}
                  </div>
                  <Separator />
                  <div className="space-y-1.5 text-[11px] text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Flows</span>
                      <span className="font-medium text-foreground">{flowCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tools</span>
                      <span className="font-medium text-foreground">{toolCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Prompts</span>
                      <span className="font-medium text-foreground">{Object.keys(promptRegistry ?? {}).length}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = `/api/v1/definitions/${def.id}/raw`;
                      link.download = `${def.id}-definition.yaml`;
                      link.click();
                    }}
                    className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-md text-xs font-medium text-foreground bg-accent/60 hover:bg-accent transition-colors border border-border"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export YAML
                  </button>
                </div>

                {/* Boundaries quick view */}
                {boundaries && boundaries.length > 0 && (
                  <div className="bg-muted/50 rounded-xl border border-red-500/20 p-3">
                    <h4 className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="h-3 w-3" /> Boundaries
                    </h4>
                    <ul className="space-y-1">
                      {boundaries.slice(0, 5).map((b, i) => (
                        <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1.5">
                          <span className="text-red-400/50 shrink-0 mt-0.5">&#8226;</span>
                          {typeof b === "string" ? b : String((b as Record<string, unknown>).rule ?? b)}
                        </li>
                      ))}
                      {boundaries.length > 5 && (
                        <li className="text-[10px] text-muted-foreground/50">+{boundaries.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

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
                      <p className="text-[11px] text-muted-foreground mb-2 line-clamp-2">{flow.description}</p>
                    )}
                    {Array.isArray(steps) && (
                      <div className="space-y-1">
                        {steps.map((step, j) => (
                          <div key={j} className="flex items-start gap-2 text-[11px]">
                            <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5">
                              {String(step.step)}
                            </Badge>
                            <div className="min-w-0">
                              <span className="font-medium">{String(step.description ?? step.action ?? "")}</span>
                              {step.prompt ? (
                                <p className="text-muted-foreground font-mono text-[10px] truncate">
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

        <TabsContent value="tools" className="space-y-3 mt-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {(def.tools ?? []).map((tool, i) => (
              <div key={i} className="bg-muted/50 rounded-md p-2.5">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Wrench className="h-3 w-3 text-green-400 shrink-0" />
                  <span className="text-xs font-medium truncate">{tool.name}</span>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2">{tool.description ?? ""}</p>
                {tool.type ? (
                  <Badge variant="outline" className="text-[9px] mt-1">{tool.type}</Badge>
                ) : null}
              </div>
            ))}
          </div>

          {def.inputs && def.inputs.length > 0 ? (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium mb-2">Inputs</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {def.inputs.map((input, i) => (
                    <div key={i} className="bg-muted/50 rounded-md p-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium truncate">{String(input.title ?? input.name)}</span>
                        {input.type ? (
                          <Badge variant="outline" className="text-[9px] shrink-0">{String(input.type)}</Badge>
                        ) : null}
                      </div>
                      {input.description ? (
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{String(input.description)}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          {def.outputs && def.outputs.length > 0 ? (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium mb-2">Outputs</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {def.outputs.map((output, i) => (
                    <div key={i} className="bg-muted/50 rounded-md p-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium truncate">{String(output.title ?? output.name)}</span>
                        {output.type ? (
                          <Badge variant="outline" className="text-[9px] shrink-0">{String(output.type)}</Badge>
                        ) : null}
                      </div>
                      {output.description ? (
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{String(output.description)}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </TabsContent>

        <TabsContent value="prompts" className="mt-3">
          {promptRegistry && Object.keys(promptRegistry).length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.entries(promptRegistry).map(([key, entry]) => (
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
                  {activePromptKey && promptRegistry[activePromptKey] ? (
                    <PromptFlyoutContent agentId={def.id} promptKey={activePromptKey} entry={promptRegistry[activePromptKey]} />
                  ) : null}
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No prompt registry entries</p>
          )}
        </TabsContent>

        <TabsContent value="guardrails" className="space-y-3 mt-3">
          {guardrails ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.entries(guardrails).map(([section, items]) => {
                const colorMap: Record<string, { border: string; icon: string; bullet: string }> = {
                  input: { border: "border-red-500/20", icon: "text-red-400", bullet: "text-red-400/60" },
                  output: { border: "border-blue-500/20", icon: "text-blue-400", bullet: "text-blue-400/60" },
                  resource: { border: "border-amber-500/20", icon: "text-amber-400", bullet: "text-amber-400/60" },
                };
                const colors = colorMap[section] ?? { border: "border-border", icon: "text-muted-foreground", bullet: "text-muted-foreground/40" };
                return (
                  <div key={section} className={`bg-muted/50 rounded-lg border ${colors.border} p-3`}>
                    <h4 className={`text-[10px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${colors.icon}`}>
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

          {(boundaries?.length || permissions?.length) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {boundaries && boundaries.length > 0 ? (
                <div className="bg-muted/50 rounded-lg border border-red-500/20 p-3">
                  <h4 className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-2">Boundaries</h4>
                  <ul className="space-y-1">
                    {boundaries.map((b, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-red-400 shrink-0 mt-0.5">&#10005;</span>
                        {typeof b === "string" ? (
                          <span>{b}</span>
                        ) : (
                          <span>
                            {String(b.boundary ?? b.description ?? JSON.stringify(b))}
                            {b.handoff_to ? (
                              <span className="text-[10px] text-muted-foreground/60 ml-1">&#8594; {String(b.handoff_to)}</span>
                            ) : null}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {permissions && permissions.length > 0 ? (
                <div className="bg-muted/50 rounded-lg border border-green-500/20 p-3">
                  <h4 className="text-[10px] font-semibold text-green-400 uppercase tracking-wider mb-2">Permissions</h4>
                  <ul className="space-y-1">
                    {permissions.map((p, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-green-400 shrink-0 mt-0.5">&#10003;</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {(quality || escalation?.length) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {quality ? (
                <div className="bg-muted/50 rounded-lg border border-purple-500/20 p-3">
                  <h4 className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-2">Quality Criteria</h4>
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
                    <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap">
                      {JSON.stringify(quality, null, 2)}
                    </pre>
                  )}
                </div>
              ) : null}
              {escalation && escalation.length > 0 ? (
                <div className="bg-muted/50 rounded-lg border border-amber-500/20 p-3">
                  <h4 className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Escalation Triggers</h4>
                  <ul className="space-y-1">
                    {escalation.map((e, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-400 shrink-0 mt-0.5">&#9888;</span>
                        {typeof e === "string" ? (
                          <span>{e}</span>
                        ) : (
                          <span>
                            <span className="font-medium text-foreground">{String(e.trigger ?? e.condition ?? "")}</span>
                            {e.target ? (
                              <span className="text-[10px] text-muted-foreground/60 ml-1">&#8594; {String(e.target)}</span>
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
                  <Badge variant="secondary" className="text-[10px]">
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
