"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  Position,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Network,
  AlertTriangle,
  Search,
  Users,
  BookOpen,
  FileText,
  ChevronDown,
  Zap,
  Presentation,
  GitBranch,
  Table2,
  LayoutGrid,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge, SeverityBadge } from "@/components/badges";
import { MetricCard } from "@/components/metric-card";
import { HelpPopover } from "@/components/help-popover";
import { api } from "@/lib/api";
import { toTitleCase } from "@/lib/title-case";
import type {
  ProcessSummary,
  ProcessAnalysis,
  ProcessRegistryStats,
  TraceabilityRow,
} from "@/types";

// -- Flow diagram helpers --

const AGENT_COLORS: Record<string, string> = {
  "sa-agent": "#3b82f6",
  "ae-agent": "#8b5cf6",
  "ci-agent": "#f59e0b",
  "ca-agent": "#10b981",
  "infosec-agent": "#ef4444",
  "rfp-agent": "#6366f1",
  "aci-agent": "#06b6d4",
  "ii-agent": "#84cc16",
  "ti-agent": "#14b8a6",
  "mna-agent": "#f97316",
  "ve-agent": "#ec4899",
  "vp-sales-agent": "#a855f7",
  "revops-director-agent": "#64748b",
};

function agentColor(agentId: string): string {
  return AGENT_COLORS[agentId] || "#6b7280";
}

function agentLabel(agentId: string): string {
  return toTitleCase(agentId.replace(/-agent$/, ""));
}

function buildProcessFlowNodes(analysis: ProcessAnalysis): {
  nodes: Node[];
  edges: Edge[];
} {
  const steps = analysis.steps;
  if (!steps.length) return { nodes: [], edges: [] };

  // Layout: dependency-based left-to-right
  const stepMap = new Map(steps.map((s) => [s.step_id, s]));
  const depths = new Map<string, number>();

  function getDepth(stepId: string): number {
    if (depths.has(stepId)) return depths.get(stepId)!;
    const step = stepMap.get(stepId);
    if (!step?.depends_on?.length) {
      depths.set(stepId, 0);
      return 0;
    }
    const maxParent = Math.max(
      ...step.depends_on.map((d) => (stepMap.has(d) ? getDepth(d) + 1 : 0))
    );
    depths.set(stepId, maxParent);
    return maxParent;
  }

  steps.forEach((s) => getDepth(s.step_id));

  // Group by depth column
  const columns = new Map<number, typeof steps>();
  steps.forEach((s) => {
    const d = depths.get(s.step_id) ?? 0;
    if (!columns.has(d)) columns.set(d, []);
    columns.get(d)!.push(s);
  });

  const xGap = 280;
  const yGap = 120;
  const nodes: Node[] = [];

  const sortedCols = [...columns.keys()].sort((a, b) => a - b);
  for (const col of sortedCols) {
    const colSteps = columns.get(col)!;
    const colHeight = colSteps.length * yGap;
    const yOffset = -colHeight / 2 + yGap / 2;

    colSteps.forEach((step, rowIdx) => {
      const color = agentColor(step.owner);
      nodes.push({
        id: step.step_id,
        type: "default",
        position: { x: col * xGap, y: yOffset + rowIdx * yGap },
        data: {
          label: (
            <div className="text-left min-w-[180px]">
              <div className="flex items-center gap-1.5 mb-1">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[10px] font-medium opacity-70">
                  {agentLabel(step.owner)}
                </span>
              </div>
              <div className="text-xs font-medium leading-tight">
                {step.name}
              </div>
              {step.playbook_ref && (
                <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                  {step.playbook_ref}
                </div>
              )}
              {step.condition && (
                <div className="text-[10px] text-yellow-400 mt-0.5">
                  conditional
                </div>
              )}
            </div>
          ),
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: {
          border: `1.5px solid ${color}40`,
          borderRadius: 8,
          background: `${color}08`,
          padding: "8px 10px",
          fontSize: 12,
        },
      });
    });
  }

  const edges: Edge[] = [];
  for (const step of steps) {
    for (const dep of step.depends_on ?? []) {
      if (stepMap.has(dep)) {
        const sourceColor = agentColor(stepMap.get(dep)!.owner);
        edges.push({
          id: `${dep}->${step.step_id}`,
          source: dep,
          target: step.step_id,
          type: "smoothstep",
          animated: true,
          style: { stroke: sourceColor, strokeWidth: 1.5, opacity: 0.6 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: sourceColor,
            width: 16,
            height: 16,
          },
        });
      }
    }
  }

  // For steps with no deps: add implicit edge from previous step if same column
  const noDeps = steps.filter((s) => !s.depends_on?.length && s.step_id !== steps[0]?.step_id);
  for (const step of noDeps) {
    const idx = steps.indexOf(step);
    if (idx > 0) {
      const prev = steps[idx - 1];
      const sourceColor = agentColor(prev.owner);
      edges.push({
        id: `implicit-${prev.step_id}->${step.step_id}`,
        source: prev.step_id,
        target: step.step_id,
        type: "smoothstep",
        animated: false,
        style: {
          stroke: sourceColor,
          strokeWidth: 1,
          opacity: 0.3,
          strokeDasharray: "5 5",
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: sourceColor,
          width: 12,
          height: 12,
        },
      });
    }
  }

  return { nodes, edges };
}

// -- Main page --

export default function OrchestrationPage() {
  const [processes, setProcesses] = useState<ProcessSummary[]>([]);
  const [stats, setStats] = useState<ProcessRegistryStats | null>(null);
  const [traceability, setTraceability] = useState<TraceabilityRow[]>([]);
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ProcessAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedProcess, setExpandedProcess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("registry");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.listProcesses(),
      api.getProcessRegistryStats(),
      api.getTraceability(),
    ])
      .then(([procs, st, trace]) => {
        setProcesses(procs);
        setStats(st);
        setTraceability(trace);
      })
      .catch((e) => setError(e.message));
  }, []);

  const handleAnalyze = useCallback(
    async (processId: string) => {
      setIsAnalyzing(true);
      setSelectedProcessId(processId);
      setAnalysis(null);
      try {
        const result = await api.analyzeProcess(processId);
        setAnalysis(result);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Analysis failed");
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  const flowData = useMemo(() => {
    if (!analysis) return null;
    return buildProcessFlowNodes(analysis);
  }, [analysis]);

  // Group traceability by process for the matrix view
  const traceByProcess = useMemo(() => {
    const map = new Map<string, TraceabilityRow[]>();
    for (const row of traceability) {
      if (!map.has(row.process_id)) map.set(row.process_id, []);
      map.get(row.process_id)!.push(row);
    }
    return map;
  }, [traceability]);

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center">
        <AlertTriangle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Network className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Process Orchestration</h1>
              <button
                onClick={() =>
                  window.open("/present/orchestration", "_blank")
                }
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Presentation className="h-3.5 w-3.5" />
                Present
              </button>
              <HelpPopover title="What is Process Orchestration?">
                Define how multiple agents collaborate on a workflow. The system
                parses your process definition, detects conflicts where agents
                overlap or contradict each other, identifies gaps in handoffs or
                coverage, and maps which playbooks and agents are involved.
              </HelpPopover>
            </div>
            <p className="text-muted-foreground mt-0.5">
              Cross-functional process definitions with conflict detection, flow
              visualization, and playbook traceability.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-3">
          <Link
            href="/docs?path=architecture/system/process-orchestration-overview.md"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <BookOpen className="h-3 w-3" />
            Overview &amp; Concepts
          </Link>
          <Link
            href="/docs?path=architecture/system/process-schema.md"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <FileText className="h-3 w-3" />
            Process Schema
          </Link>
          <Link
            href="/docs?path=architecture/system/conflict-rules.md"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <AlertTriangle className="h-3 w-3" />
            Conflict Rules
          </Link>
          <Link
            href="/docs?path=architecture/agents/orchestration-agent.md"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <Network className="h-3 w-3" />
            Agent Architecture
          </Link>
        </div>
      </div>

      <Separator />

      {/* Metrics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Total Processes" value={stats.total} />
          <MetricCard
            label="Active"
            value={stats.by_status["active"] ?? 0}
          />
          <MetricCard
            label="Draft"
            value={stats.by_status["draft"] ?? 0}
          />
          <MetricCard label="Conflicts" value={stats.conflict_count} />
        </div>
      )}

      {/* Tabs: Registry | Flow Visualization | Traceability */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="registry" className="gap-1.5">
            <LayoutGrid className="h-3.5 w-3.5" />
            Process Registry
          </TabsTrigger>
          <TabsTrigger value="flow" className="gap-1.5">
            <GitBranch className="h-3.5 w-3.5" />
            Flow Visualization
          </TabsTrigger>
          <TabsTrigger value="traceability" className="gap-1.5">
            <Table2 className="h-3.5 w-3.5" />
            Traceability Matrix
          </TabsTrigger>
        </TabsList>

        {/* ====== TAB: Registry ====== */}
        <TabsContent value="registry" className="space-y-2 mt-4">
          {processes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No processes found in registry.
            </p>
          )}
          {processes.map((proc) => {
            const isExpanded = expandedProcess === proc.process_id;
            const procAnalysis =
              isExpanded && analysis?.process.process_id === proc.process_id
                ? analysis
                : null;

            return (
              <Card
                key={proc.process_id}
                className={isExpanded ? "border-primary/30" : ""}
              >
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => {
                    const next = isExpanded ? null : proc.process_id;
                    setExpandedProcess(next);
                    if (next) handleAnalyze(next);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Network className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{proc.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground font-mono">
                          {proc.process_id}
                        </span>
                        <span className="text-muted-foreground/30">|</span>
                        <span className="text-xs text-muted-foreground">
                          {proc.step_count} steps
                        </span>
                        <span className="text-muted-foreground/30">|</span>
                        <span className="text-xs text-muted-foreground">
                          {proc.agent_count} agents
                        </span>
                        {proc.deadline && (
                          <>
                            <span className="text-muted-foreground/30">|</span>
                            <span className="text-xs text-muted-foreground">
                              {proc.deadline}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {proc.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {proc.owner_agent}
                    </span>
                    <StatusBadge status={proc.status} />
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {isExpanded && isAnalyzing && (
                  <CardContent className="pt-0 pb-4 px-4">
                    <Separator className="mb-4" />
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="ml-2 text-sm text-muted-foreground">
                        Analyzing...
                      </span>
                    </div>
                  </CardContent>
                )}

                {isExpanded && procAnalysis && !isAnalyzing && (
                  <CardContent className="pt-0 pb-4 px-4">
                    <Separator className="mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Trigger & Steps */}
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Trigger
                            </span>
                          </div>
                          <p className="text-sm">
                            {procAnalysis.process.trigger_event}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Workflow Steps
                          </p>
                          <ol className="space-y-1.5">
                            {procAnalysis.steps.map((step, i) => (
                              <li
                                key={step.step_id}
                                className="text-sm flex items-start gap-2"
                              >
                                <span className="text-muted-foreground font-mono text-xs mt-0.5 shrink-0">
                                  {i + 1}.
                                </span>
                                <div>
                                  <span className="font-medium">
                                    {agentLabel(step.owner)}:
                                  </span>{" "}
                                  {step.name}
                                  {step.playbook_ref && (
                                    <span className="text-muted-foreground text-xs ml-1 font-mono">
                                      ({step.playbook_ref})
                                    </span>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>

                      {/* Right: Agents, Playbooks, Conflicts, Gaps */}
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Agents Involved
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {procAnalysis.artifacts.agents.map((a) => (
                              <Badge
                                key={a.agent_id}
                                variant="outline"
                                className="text-xs"
                              >
                                <span
                                  className="w-2 h-2 rounded-full mr-1.5 inline-block"
                                  style={{
                                    backgroundColor: agentColor(a.agent_id),
                                  }}
                                />
                                {a.agent_name} ({a.role})
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Playbooks
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {procAnalysis.artifacts.playbooks.map((pb) => (
                              <Badge
                                key={pb}
                                variant="secondary"
                                className="text-xs font-mono"
                              >
                                {pb}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {procAnalysis.conflicts.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-yellow-400 uppercase tracking-wide mb-1.5">
                              Conflicts ({procAnalysis.conflicts.length})
                            </p>
                            {procAnalysis.conflicts.map((c, i) => (
                              <div
                                key={i}
                                className="text-xs rounded-md border border-yellow-600/20 bg-yellow-600/5 p-2 mb-1.5"
                              >
                                <div className="flex items-center gap-1.5 mb-1">
                                  <AlertTriangle className="h-3 w-3 text-yellow-400" />
                                  <SeverityBadge severity={c.severity} />
                                </div>
                                <p className="text-muted-foreground">
                                  {c.description}
                                </p>
                                {c.resolution && (
                                  <p className="text-muted-foreground/70 mt-1 italic">
                                    {c.resolution}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {procAnalysis.gaps.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-orange-400 uppercase tracking-wide mb-1.5">
                              Gaps ({procAnalysis.gaps.length})
                            </p>
                            {procAnalysis.gaps.map((g, i) => (
                              <div
                                key={i}
                                className="text-xs rounded-md border border-orange-600/20 bg-orange-600/5 p-2 mb-1.5"
                              >
                                <SeverityBadge severity={g.severity} />
                                <p className="text-muted-foreground mt-1">
                                  {g.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </TabsContent>

        {/* ====== TAB: Flow Visualization ====== */}
        <TabsContent value="flow" className="mt-4 space-y-4">
          {/* Process selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground">
              Select process:
            </label>
            <select
              className="bg-background border rounded-md px-3 py-1.5 text-sm"
              value={selectedProcessId ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val) handleAnalyze(val);
              }}
            >
              <option value="">Choose a process...</option>
              {processes.map((p) => (
                <option key={p.process_id} value={p.process_id}>
                  {p.name} ({p.process_id})
                </option>
              ))}
            </select>
          </div>

          {!analysis && !isAnalyzing && (
            <div className="flex flex-col items-center justify-center h-[400px] text-center border rounded-lg">
              <GitBranch className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                Select a process to visualize its agent flow
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center h-[400px] text-center border rounded-lg">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">
                Loading process flow...
              </p>
            </div>
          )}

          {analysis && flowData && !isAnalyzing && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">{analysis.process.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {analysis.steps.length} steps across{" "}
                    {analysis.artifacts.agents.length} agents
                  </p>
                </div>
                <div className="flex gap-2">
                  {analysis.artifacts.agents.map((a) => (
                    <div
                      key={a.agent_id}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: agentColor(a.agent_id) }}
                      />
                      {agentLabel(a.agent_id)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-[420px] border rounded-lg overflow-hidden">
                <ReactFlow
                  nodes={flowData.nodes}
                  edges={flowData.edges}
                  fitView
                  fitViewOptions={{ padding: 0.3 }}
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable={false}
                  proOptions={{ hideAttribution: true }}
                >
                  <Background gap={20} size={1} />
                  <Controls showInteractive={false} />
                </ReactFlow>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ====== TAB: Traceability Matrix ====== */}
        <TabsContent value="traceability" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Table2 className="h-4 w-4 text-muted-foreground" />
                Process → Step → Playbook → Agent
                <HelpPopover title="Traceability Matrix">
                  Shows every process step mapped to its owning agent and
                  referenced playbook. Use this view to verify that all steps
                  have playbook coverage and to understand which agents
                  participate across processes.
                </HelpPopover>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {traceability.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No traceability data available.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 pr-3 font-medium text-muted-foreground">
                          Process
                        </th>
                        <th className="pb-2 pr-3 font-medium text-muted-foreground">
                          Step
                        </th>
                        <th className="pb-2 pr-3 font-medium text-muted-foreground">
                          Agent
                        </th>
                        <th className="pb-2 pr-3 font-medium text-muted-foreground">
                          Playbook
                        </th>
                        <th className="pb-2 pr-3 font-medium text-muted-foreground">
                          Action
                        </th>
                        <th className="pb-2 font-medium text-muted-foreground">
                          Dependencies
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...traceByProcess.entries()].map(
                        ([procId, rows]) => (
                          rows.map((row, idx) => (
                            <tr
                              key={`${procId}-${row.step_id}`}
                              className="border-b border-border/50 hover:bg-muted/30"
                            >
                              <td className="py-2 pr-3">
                                {idx === 0 ? (
                                  <span className="font-medium">
                                    {row.process_name}
                                  </span>
                                ) : null}
                              </td>
                              <td className="py-2 pr-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-muted-foreground">
                                    {row.step_id}
                                  </span>
                                  {row.step_name}
                                </div>
                              </td>
                              <td className="py-2 pr-3">
                                <div className="flex items-center gap-1">
                                  <div
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{
                                      backgroundColor: agentColor(row.agent_id),
                                    }}
                                  />
                                  {agentLabel(row.agent_id)}
                                </div>
                              </td>
                              <td className="py-2 pr-3 font-mono">
                                {row.playbook_ref ? (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    {row.playbook_ref}
                                  </Badge>
                                ) : (
                                  <span className="text-orange-400">
                                    none
                                  </span>
                                )}
                              </td>
                              <td className="py-2 pr-3 text-muted-foreground">
                                {row.action}
                              </td>
                              <td className="py-2">
                                {row.depends_on.length > 0 ? (
                                  <span className="font-mono text-muted-foreground">
                                    {row.depends_on.join(", ")}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground/50">
                                    -
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
