"use client";

import { Workflow } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrchestrationPresentationData } from "./orchestration-data";
import type { Slide } from "./presentation-shell";
import type { Edge } from "@xyflow/react";
import { SlideFlowDiagram, buildNode, buildEdge } from "./slide-flow-diagram";

function SlideHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return <div className="mb-6"><h2 className="text-3xl font-bold">{title}</h2>{subtitle && <p className="text-lg text-muted-foreground mt-1">{subtitle}</p>}</div>;
}

const categoryColors: Record<string, string> = { "Pre-Sales": "blue", "Post-Sales": "teal", Governance: "green" };
const categoryBadge: Record<string, string> = { "Pre-Sales": "bg-blue-500/15 text-blue-400", "Post-Sales": "bg-teal-500/15 text-teal-400", Governance: "bg-green-500/15 text-green-400" };

function buildFlowDiagram(flow: OrchestrationPresentationData["flows"][number]) {
  const color = categoryColors[flow.category] || "default";
  const agents = new Map<string, { x: number; y: number; index: number }>();
  let idx = 0;

  for (const step of flow.steps) {
    if (!agents.has(step.from)) {
      agents.set(step.from, { x: 0, y: 0, index: idx++ });
    }
    if (!agents.has(step.to)) {
      agents.set(step.to, { x: 0, y: 0, index: idx++ });
    }
  }

  // Layout: position nodes in a grid, left-to-right with wrapping
  const cols = Math.min(agents.size, 3);
  const xGap = 400;
  const yGap = 220;
  let i = 0;
  for (const [, pos] of agents) {
    pos.x = (i % cols) * xGap;
    pos.y = Math.floor(i / cols) * yGap;
    i++;
  }

  const nodes = Array.from(agents.entries()).map(([name, pos]) =>
    buildNode(
      name.toLowerCase().replace(/\s+/g, "-"),
      name,
      pos.x,
      pos.y,
      { color, animIndex: pos.index },
    ),
  );

  const edges = flow.steps.map((step, ei) =>
    buildEdge(
      `e-${ei}`,
      step.from.toLowerCase().replace(/\s+/g, "-"),
      step.to.toLowerCase().replace(/\s+/g, "-"),
      step.trigger,
      color,
    ),
  );

  return { nodes, edges };
}

function buildAgentEcosystem(data: OrchestrationPresentationData) {
  const nodes = [
    buildNode("hub", "Orchestration Engine", 700, 0, { color: "primary", size: "lg", animIndex: 0 }),
  ];
  const edges: Edge[] = [];

  const categories = [...new Set(data.agent_roles.map((a) => a.category))];
  const catX: Record<string, number> = {};
  const startX = 0;
  const catGap = 700;

  categories.forEach((cat, ci) => {
    catX[cat] = startX + ci * catGap;
    const catId = `cat-${cat.toLowerCase().replace(/[\s-]/g, "")}`;
    const color = categoryColors[cat] || "default";
    nodes.push(buildNode(catId, cat, catX[cat], 160, { color, size: "lg", animIndex: ci + 1 }));
    edges.push(buildEdge(`hub-${catId}`, "hub", catId, undefined, color));
  });

  const catAgentCounts: Record<string, number> = {};
  data.agent_roles.forEach((agent, ai) => {
    const cat = agent.category;
    const catId = `cat-${cat.toLowerCase().replace(/[\s-]/g, "")}`;
    const color = categoryColors[cat] || "default";
    const agentId = `agent-${agent.name.toLowerCase().replace(/\s+/g, "-")}`;

    if (!catAgentCounts[cat]) catAgentCounts[cat] = 0;
    const colInCat = catAgentCounts[cat];
    catAgentCounts[cat]++;

    const x = catX[cat] + (colInCat % 2 === 0 ? -200 : 200);
    const y = 340 + Math.floor(colInCat / 2) * 160;

    nodes.push(
      buildNode(agentId, agent.name, x, y, {
        subtitle: agent.role.split(" ").slice(0, 4).join(" "),
        color,
        size: "sm",
        animIndex: ai + categories.length + 1,
        detail: (
          <div>
            <h3 className="text-lg font-semibold mb-1">{agent.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{agent.role}</p>
            <div className="mb-3">
              <span className={cn("px-2 py-0.5 rounded text-xs font-medium", categoryBadge[cat] || "bg-muted text-muted-foreground")}>{cat}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-2">Capabilities</p>
              <div className="flex flex-wrap gap-1.5">
                {agent.capabilities.map((c, ci) => (
                  <span key={ci} className="px-2 py-1 rounded bg-muted text-xs">{c}</span>
                ))}
              </div>
            </div>
          </div>
        ),
      }),
    );
    edges.push(buildEdge(`${catId}-${agentId}`, catId, agentId, undefined, color));
  });

  return { nodes, edges };
}

export function buildOrchestrationSlides(data: OrchestrationPresentationData): Slide[] {
  return [
    // 1. Cover
    { id: "cover", title: "Cover", content: (
      <div className="flex flex-col items-center justify-center text-center min-h-[60vh]">
        <div className="flex items-center gap-3 mb-6">
          <Workflow className="h-8 w-8 text-primary" />
          <span className="text-sm uppercase tracking-widest text-muted-foreground font-medium">Operations Review</span>
        </div>
        <h1 className="text-5xl font-bold mb-3">{data.title}</h1>
        <p className="text-xl text-muted-foreground mb-8">Multi-Agent Workflow Orchestration</p>
        <div className="grid grid-cols-3 gap-8 text-center">
          <div><p className="text-4xl font-bold">{data.agent_count}</p><p className="text-xs text-muted-foreground uppercase">Agents</p></div>
          <div><p className="text-4xl font-bold">{data.process_count}</p><p className="text-xs text-muted-foreground uppercase">Processes</p></div>
          <div><p className="text-4xl font-bold">{data.playbook_count}</p><p className="text-xs text-muted-foreground uppercase">Playbooks</p></div>
        </div>
      </div>
    )},

    // 2. Agent Ecosystem (React Flow network)
    { id: "agents", title: "Agent Ecosystem", content: (() => {
      const { nodes, edges } = buildAgentEcosystem(data);
      return (
        <div>
          <SlideHeader title="Agent Ecosystem" subtitle={`${data.agent_count} agents across ${[...new Set(data.agent_roles.map(a => a.category))].length} categories`} />
          <SlideFlowDiagram nodes={nodes} edges={edges} height={420} />
        </div>
      );
    })()},

    // 3-5. Flow slides (React Flow diagrams)
    ...data.flows.map((flow) => {
      const { nodes, edges } = buildFlowDiagram(flow);
      return {
        id: `flow-${flow.name.toLowerCase().replace(/\s/g, "-")}`,
        title: `${flow.name} Flow`,
        content: (
          <div>
            <SlideHeader title={`${flow.name} Flow`} subtitle={`${flow.category} / ${flow.steps.length} handoffs`} />
            <SlideFlowDiagram nodes={nodes} edges={edges} height={380} />
          </div>
        ),
      };
    }),

    // 6. Process Registry
    { id: "processes", title: "Processes", content: (
      <div>
        <SlideHeader title="Process Registry" subtitle={`${data.processes.length} registered processes`} />
        <div className="space-y-4">
          {data.processes.map((p, i) => (
            <div key={i} className="border rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{p.name}</p>
                  <span className={cn("px-2 py-0.5 rounded text-xs font-medium", p.status === "active" ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400")}>{p.status}</span>
                </div>
                <span className="text-xs text-muted-foreground">{p.id}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Trigger: {p.trigger}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{p.steps.length} steps</span>
                <span>Owner: {p.owner}</span>
                {p.conflicts > 0 && <span className="text-red-400">{p.conflicts} conflicts</span>}
                {p.gaps > 0 && <span className="text-yellow-400">{p.gaps} gaps</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    )},

    // 7. Governance
    { id: "governance", title: "Governance", content: (
      <div>
        <SlideHeader title="Governance & Operations" />
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border rounded-xl p-5 text-center">
            <p className="text-3xl font-bold">{data.governance.health_check_frequency}</p>
            <p className="text-xs text-muted-foreground uppercase mt-1">Health Check</p>
          </div>
          <div className="border rounded-xl p-5 text-center">
            <p className="text-3xl font-bold">{data.governance.gap_scan_frequency}</p>
            <p className="text-xs text-muted-foreground uppercase mt-1">Gap Scan</p>
          </div>
          <div className="border rounded-xl p-5 text-center">
            <p className="text-3xl font-bold">{data.governance.escalation_threshold_days} days</p>
            <p className="text-xs text-muted-foreground uppercase mt-1">Escalation Threshold</p>
          </div>
          <div className="border rounded-xl p-5 text-center">
            <p className="text-3xl font-bold">{data.governance.review_cadence}</p>
            <p className="text-xs text-muted-foreground uppercase mt-1">Review Cadence</p>
          </div>
        </div>
        <div className="border rounded-xl p-5">
          <p className="text-xs uppercase font-semibold tracking-wide text-muted-foreground mb-3">Process Health</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-400">{data.processes.filter(p => p.status === "active" && p.conflicts === 0).length}</p>
              <p className="text-xs text-muted-foreground">Clean Processes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">{data.processes.reduce((s, p) => s + p.conflicts, 0)}</p>
              <p className="text-xs text-muted-foreground">Total Conflicts</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">{data.processes.reduce((s, p) => s + p.gaps, 0)}</p>
              <p className="text-xs text-muted-foreground">Total Gaps</p>
            </div>
          </div>
        </div>
      </div>
    )},
  ];
}
