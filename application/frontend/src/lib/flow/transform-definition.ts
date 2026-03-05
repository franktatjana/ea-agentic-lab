import type { Node, Edge } from "@xyflow/react";
import type { AgentDefinition } from "@/types";

const NODE_W = 210;
const AGENT_H = 180;
const FLOW_GAP = 240;
const ROW_GAP = 100;
const SIDE_GAP = 60;
const PROMPT_GAP = 90;

const ACCENT = "#8b5cf6";
const EDGE_COLOR = "#525252";

const ROLE_ACRONYMS = /\b(Ae|Sa|Ca|Pm|Ve|Ci|Rfp|Poc|Pov|Csp|Ii|Aci|Mna|Adr|Qbr|Ebr|Nps|Csat)\b/g;
function fixAcronyms(s: string): string {
  return s.replace(ROLE_ACRONYMS, (m) => m.toUpperCase());
}

function centerRow(count: number, gap: number, y: number): { x: number; y: number }[] {
  const totalWidth = (count - 1) * gap;
  const startX = -totalWidth / 2;
  return Array.from({ length: count }, (_, i) => ({ x: startX + i * gap, y }));
}

export function buildFlowGraph(
  def: AgentDefinition,
  expandedFlowId: string | null,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ext = (def as any)["x-ea-agent"] as Record<string, unknown> | undefined;
  const promptRegistry = ext?.prompt_registry as Record<string, Record<string, unknown>> | undefined;

  const flows = def.flows ?? [];
  const tools = def.tools ?? [];
  const variants = def.specialized_agents ?? [];

  // Agent node centered
  nodes.push({
    id: def.id,
    type: "agentNode",
    position: { x: -NODE_W / 2, y: -AGENT_H / 2 },
    data: {
      name: fixAcronyms(def.name),
      description: def.description,
      modelId: (def.llm_configuration as Record<string, unknown>)?.model_id ?? null,
      humanInTheLoop: def.human_in_the_loop,
    },
  });

  // Flows spread horizontally below agent
  const flowY = AGENT_H / 2 + ROW_GAP;
  const flowPositions = centerRow(flows.length, FLOW_GAP, flowY);
  flows.forEach((flow, i) => {
    const pos = flowPositions[i];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const flowExt = ((flow as any)["x-ea-agent"] ?? {}) as Record<string, unknown>;
    const steps = (flowExt.workflow_shorthand ?? []) as Array<Record<string, unknown>>;
    const isExpanded = expandedFlowId === flow.id;

    nodes.push({
      id: flow.id,
      type: "flowNode",
      position: pos,
      data: {
        name: fixAcronyms(flow.name),
        description: flow.description,
        stepCount: steps.length,
        isExpanded,
        isDimmed: expandedFlowId !== null && !isExpanded,
      },
    });

    edges.push({
      id: `${def.id}->${flow.id}`,
      source: def.id,
      sourceHandle: "prompts",
      target: flow.id,
      type: "smoothstep",
      style: { stroke: EDGE_COLOR, strokeWidth: 1.5 },
    });

    // Expanded: prompt chain below this flow
    if (isExpanded && steps.length > 0) {
      steps.forEach((step, si) => {
        const promptKey = String(step.prompt ?? "");
        const promptId = `${flow.id}__prompt__${promptKey}__${step.step}`;
        const registry = promptRegistry?.[promptKey];

        nodes.push({
          id: promptId,
          type: "promptNode",
          position: {
            x: pos.x + 10,
            y: pos.y + 80 + si * PROMPT_GAP,
          },
          data: {
            promptKey,
            stepNumber: step.step,
            description: registry?.description ?? step.description ?? "",
            input: step.input ?? "",
            isFirst: si === 0,
            isLast: si === steps.length - 1,
          },
        });

        const prevSteps = steps as Array<Record<string, unknown>>;
        const sourceId =
          si === 0
            ? flow.id
            : `${flow.id}__prompt__${prevSteps[si - 1].prompt}__${prevSteps[si - 1].step}`;
        edges.push({
          id: `${sourceId}->${promptId}`,
          source: sourceId,
          target: promptId,
          type: "straight",
          style: { stroke: ACCENT, strokeWidth: 2 },
          animated: true,
        });
      });
    }
  });

  // Tools flanking left of agent
  const toolStackHeight = (tools.length - 1) * SIDE_GAP;
  const toolStartY = -toolStackHeight / 2;
  const toolX = -NODE_W / 2 - FLOW_GAP;

  tools.forEach((tool, i) => {
    nodes.push({
      id: tool.id,
      type: "toolNode",
      position: { x: toolX, y: toolStartY + i * SIDE_GAP },
      data: {
        name: fixAcronyms(tool.name),
        description: tool.description ?? "",
      },
    });

    edges.push({
      id: `${def.id}->${tool.id}`,
      source: def.id,
      sourceHandle: "tools",
      target: tool.id,
      type: "smoothstep",
      style: { stroke: EDGE_COLOR, strokeWidth: 1.5 },
    });
  });

  // Variants flanking right of agent
  const variantStackHeight = (variants.length - 1) * SIDE_GAP;
  const variantStartY = -variantStackHeight / 2;
  const variantX = NODE_W / 2 + FLOW_GAP - 60;

  variants.forEach((variant: Record<string, unknown>, i: number) => {
    const variantId = String(variant.id ?? `variant-${i}`);
    nodes.push({
      id: variantId,
      type: "variantNode",
      position: { x: variantX, y: variantStartY + i * SIDE_GAP },
      data: {
        name: fixAcronyms(String(variant.name ?? "")),
        description: String(variant.description ?? ""),
      },
    });

    edges.push({
      id: `${def.id}->${variantId}`,
      source: def.id,
      sourceHandle: "variants",
      target: variantId,
      type: "smoothstep",
      style: { stroke: EDGE_COLOR, strokeWidth: 1.5 },
    });
  });

  return { nodes, edges };
}

export interface RoutingRule {
  watch: string;
  true: string;
  route_to: string;
  context_forward: string[];
  description: string;
}

export type RoutingSeverity = "info" | "warning" | "critical";

export function classifyRoutingSeverity(rule: RoutingRule): RoutingSeverity {
  const cond = rule.true.toLowerCase();
  if (cond.includes("red") || cond.includes("critical") || cond.includes("< 40")) return "critical";
  if (cond.includes("high") || cond.includes("gap") || cond.includes("weak") || cond.includes("unknown") || cond.includes("constraint")) return "warning";
  return "info";
}

export function buildOrchestrationGraph(
  def: AgentDefinition,
  routingRules: RoutingRule[],
  subAgentMeta?: { id: string; flow_count: number }[],
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const agentIds = new Set<string>();
  for (const rule of routingRules) {
    agentIds.add(rule.watch);
    agentIds.add(rule.route_to);
  }

  const routeCounts: Record<string, number> = {};
  for (const rule of routingRules) {
    routeCounts[rule.watch] = (routeCounts[rule.watch] ?? 0) + 1;
  }

  // Build adjacency
  const outTargets: Record<string, string[]> = {};
  const inDeg: Record<string, number> = {};
  for (const id of agentIds) { outTargets[id] = []; inDeg[id] = 0; }
  for (const rule of routingRules) {
    if (!outTargets[rule.watch].includes(rule.route_to)) {
      outTargets[rule.watch].push(rule.route_to);
    }
    inDeg[rule.route_to] += 1;
  }

  // Source-grouped layout: each source forms a column with its targets below
  // Sources sorted by out-degree desc so the busiest source is leftmost
  const sourceAgents = Array.from(agentIds)
    .filter((id) => outTargets[id].length > 0)
    .sort((a, b) => outTargets[b].length - outTargets[a].length);

  const COL_W = 220;
  const ROW_H = 100;
  const positions: Record<string, { x: number; y: number }> = {};
  const placed = new Set<string>();

  sourceAgents.forEach((srcId, colIdx) => {
    const x = colIdx * COL_W;

    if (!placed.has(srcId)) {
      positions[srcId] = { x, y: 0 };
      placed.add(srcId);
    }

    let rowOffset = 1;
    for (const tgtId of outTargets[srcId]) {
      if (!placed.has(tgtId)) {
        positions[tgtId] = { x, y: rowOffset * ROW_H };
        placed.add(tgtId);
        rowOffset++;
      }
    }
  });

  // Place any remaining pure-sink agents
  let nextCol = sourceAgents.length;
  for (const id of agentIds) {
    if (!placed.has(id)) {
      positions[id] = { x: nextCol * COL_W, y: 0 };
      placed.add(id);
      nextCol++;
    }
  }

  // Center layout around origin
  const allPos = Object.values(positions);
  const midX = (Math.min(...allPos.map((p) => p.x)) + Math.max(...allPos.map((p) => p.x))) / 2;
  const midY = (Math.min(...allPos.map((p) => p.y)) + Math.max(...allPos.map((p) => p.y))) / 2;
  for (const id of Object.keys(positions)) {
    positions[id].x -= midX;
    positions[id].y -= midY;
  }

  // Orchestrator node above
  const topY = Math.min(...Object.values(positions).map((p) => p.y));
  nodes.push({
    id: def.id,
    type: "orchestratorNode",
    position: { x: -95, y: topY - 80 },
    data: { name: fixAcronyms(def.name), subAgentCount: agentIds.size },
  });

  const rootSources = Array.from(agentIds).filter((id) => inDeg[id] === 0);
  for (const srcId of rootSources) {
    edges.push({
      id: `orch->${srcId}`,
      source: def.id,
      sourceHandle: "bottom",
      target: srcId,
      targetHandle: "top",
      type: "smoothstep",
      style: { stroke: "#a855f7", strokeWidth: 1, strokeDasharray: "6 4" },
    });
  }

  // Sub-agent nodes
  const metaMap = new Map((subAgentMeta ?? []).map((m) => [m.id, m]));
  const rolePrefix = def.id.replace(/-agent$/, "");

  for (const agentId of agentIds) {
    const name = fixAcronyms(
      agentId
        .replace(/-agent$/, "")
        .replace(new RegExp(`^${rolePrefix}-`), "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
    );

    const meta = metaMap.get(agentId);

    nodes.push({
      id: agentId,
      type: "subAgentNode",
      position: positions[agentId],
      data: {
        name,
        agentId,
        flowCount: meta?.flow_count ?? 0,
      },
    });
  }

  // Colors
  const COLOR_CRITICAL = "#ef4444";
  const COLOR_WARNING = "#f59e0b";
  const COLOR_INFO = "#3b82f6";

  const arrow = (color: string) => ({
    type: "arrowclosed" as const,
    color,
    width: 15,
    height: 15,
  });

  function pickHandles(srcId: string, tgtId: string) {
    const s = positions[srcId];
    const t = positions[tgtId];
    if (!s || !t) return { sourceHandle: "bottom", targetHandle: "top" };

    const dy = t.y - s.y;
    const dx = t.x - s.x;

    // Same column: vertical
    if (Math.abs(dx) < COL_W * 0.3) {
      return dy > 0
        ? { sourceHandle: "bottom", targetHandle: "top" }
        : { sourceHandle: "top", targetHandle: "bottom" };
    }

    // Cross-column, target above source (feedback): route via outer side
    if (dy < -ROW_H * 0.5) {
      return dx > 0
        ? { sourceHandle: "right-out", targetHandle: "right-out" }
        : { sourceHandle: "left-in", targetHandle: "left-in" };
    }

    // Cross-column forward or same-row
    return dx > 0
      ? { sourceHandle: "right-out", targetHandle: "left-in" }
      : { sourceHandle: "left-in", targetHandle: "right-out" };
  }

  routingRules.forEach((rule, i) => {
    const cond = rule.true.toLowerCase();
    let color = COLOR_INFO;
    let severity: "info" | "warning" | "critical" = "info";
    if (cond.includes("red") || cond.includes("critical") || cond.includes("< 40")) {
      color = COLOR_CRITICAL;
      severity = "critical";
    } else if (cond.includes("high") || cond.includes("gap") || cond.includes("weak") || cond.includes("unknown") || cond.includes("constraint")) {
      color = COLOR_WARNING;
      severity = "warning";
    }

    const { sourceHandle, targetHandle } = pickHandles(rule.watch, rule.route_to);
    const isFeedback = (positions[rule.route_to]?.y ?? 0) < (positions[rule.watch]?.y ?? 0);

    edges.push({
      id: `route-${i}`,
      source: rule.watch,
      sourceHandle,
      target: rule.route_to,
      targetHandle,
      type: "smoothstep",
      data: { severity },
      style: {
        stroke: color,
        strokeWidth: 1.5,
        ...(isFeedback ? { strokeDasharray: "6 3" } : {}),
      },
      markerEnd: arrow(color),
      animated: !isFeedback,
    });
  });

  return { nodes, edges };
}
